/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * /api/health.js
 * Health monitoring service for Singapore National Environment Agency (NEA) APIs:
 * - PSI: https://api-open.data.gov.sg/v2/real-time/api/psi
 * - PM2.5: https://api-open.data.gov.sg/v2/real-time/api/pm25
 */

const PSI_API_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const PM25_API_URL = 'https://api-open.data.gov.sg/v2/real-time/api/pm25';

/**
 * Pings an external endpoint and collects latency and health indicators.
 * @param {string} url - Target URL to probe
 * @param {string} name - Human readable endpoint identifier
 */
export async function probeEndpoint(url, name) {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SGAirPulse-HealthProbe/1.0',
      },
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const isOk = response.ok;
    let dataSummary = null;

    if (isOk) {
      try {
        const json = await response.json();
        const items = json?.data?.items || [];
        const regions = json?.data?.regionMetadata || [];
        const latestTimestamp = items[0]?.timestamp || null;

        dataSummary = {
          itemsCount: items.length,
          regionsCount: regions.length,
          latestTimestamp,
          code: json?.code ?? 0,
        };
      } catch (parseErr) {
        dataSummary = { parseError: parseErr.message };
      }
    }

    return {
      name,
      url,
      status: isOk ? (latencyMs > 2500 ? 'degraded' : 'healthy') : 'unhealthy',
      httpCode: response.status,
      latencyMs,
      ok: isOk,
      dataSummary,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const isTimeout = error.name === 'AbortError';

    return {
      name,
      url,
      status: 'down',
      httpCode: isTimeout ? 504 : 503,
      latencyMs,
      ok: false,
      error: isTimeout ? 'Request timed out after 8000ms' : error.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

/**
 * Checks all monitored NEA APIs and aggregates system status.
 */
export async function checkApisHealth() {
  const serverStartedAt = process.uptime ? Math.floor(process.uptime()) : 0;
  
  // Parallel probe
  const [psiHealth, pm25Health] = await Promise.all([
    probeEndpoint(PSI_API_URL, 'NEA PSI Real-time API'),
    probeEndpoint(PM25_API_URL, 'NEA PM2.5 Real-time API'),
  ]);

  const allHealthy = psiHealth.status === 'healthy' && pm25Health.status === 'healthy';
  const anyDown = psiHealth.status === 'down' || pm25Health.status === 'down' || !psiHealth.ok || !pm25Health.ok;
  
  let overallStatus = 'healthy';
  if (anyDown) {
    overallStatus = (psiHealth.ok || pm25Health.ok) ? 'degraded' : 'unhealthy';
  } else if (!allHealthy) {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: serverStartedAt,
    environment: process.env.NODE_ENV || 'development',
    summary: {
      totalEndpoints: 2,
      healthyEndpoints: (psiHealth.ok ? 1 : 0) + (pm25Health.ok ? 1 : 0),
      avgLatencyMs: Math.round((psiHealth.latencyMs + pm25Health.latencyMs) / 2),
    },
    services: {
      psi: psiHealth,
      pm25: pm25Health,
    },
  };
}

/**
 * Express handler
 */
export default async function healthHandler(req, res) {
  try {
    const healthData = await checkApisHealth();
    const httpStatusCode = healthData.status === 'unhealthy' ? 503 : 200;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(httpStatusCode).json(healthData);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Support CLI test: node api/health.js
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('health.js')) {
  checkApisHealth().then((res) => {
    console.log(JSON.stringify(res, null, 2));
  }).catch((err) => {
    console.error('Health check failed:', err);
    process.exit(1);
  });
}
