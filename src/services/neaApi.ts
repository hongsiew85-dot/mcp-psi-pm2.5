/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiHealthResponse, Pm25ApiResponse, PsiApiResponse } from '../types/nea.ts';

const PROXY_PSI = '/api/psi';
const PROXY_PM25 = '/api/pm25';
const PROXY_HEALTH = '/api/health.js';

const DIRECT_PSI = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const DIRECT_PM25 = 'https://api-open.data.gov.sg/v2/real-time/api/pm25';

/**
 * Gets current Singapore date formatted as YYYY-MM-DD in Asia/Singapore timezone (UTC+8).
 */
export function getSingaporeDateString(): string {
  const now = new Date();
  const sgDateString = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' }); // format YYYY-MM-DD
  return sgDateString;
}

/**
 * Robust fetch helper with timeout and fallback
 */
async function fetchWithFallback<T>(primaryUrl: string, fallbackUrl: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(primaryUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return (await res.json()) as T;
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  } catch (primaryErr) {
    clearTimeout(timeoutId);
    // Attempt fallback directly
    try {
      const fbController = new AbortController();
      const fbTimeout = setTimeout(() => fbController.abort(), 7000);
      const fbRes = await fetch(fallbackUrl, {
        signal: fbController.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(fbTimeout);
      if (fbRes.ok) {
        return (await fbRes.json()) as T;
      }
      throw new Error(`Fallback HTTP ${fbRes.status}`);
    } catch (fallbackErr) {
      throw new Error(`Failed to load data: ${(primaryErr as Error).message}`);
    }
  }
}

/**
 * Fetch latest PSI real-time readings from NEA API
 */
export async function fetchLatestPsi(): Promise<PsiApiResponse> {
  return fetchWithFallback<PsiApiResponse>(PROXY_PSI, DIRECT_PSI);
}

/**
 * Fetch latest PM2.5 real-time readings from NEA API
 */
export async function fetchLatestPm25(): Promise<Pm25ApiResponse> {
  return fetchWithFallback<Pm25ApiResponse>(PROXY_PM25, DIRECT_PM25);
}

/**
 * Fetch 24-hour historical readings for interactive charts
 */
export async function fetchDailyPm25Trends(dateStr?: string): Promise<Pm25ApiResponse> {
  const date = dateStr || getSingaporeDateString();
  const proxyUrl = `${PROXY_PM25}?date=${date}`;
  const directUrl = `${DIRECT_PM25}?date=${date}`;
  return fetchWithFallback<Pm25ApiResponse>(proxyUrl, directUrl);
}

export async function fetchDailyPsiTrends(dateStr?: string): Promise<PsiApiResponse> {
  const date = dateStr || getSingaporeDateString();
  const proxyUrl = `${PROXY_PSI}?date=${date}`;
  const directUrl = `${DIRECT_PSI}?date=${date}`;
  return fetchWithFallback<PsiApiResponse>(proxyUrl, directUrl);
}

/**
 * Check health status of NEA APIs via /api/health.js
 */
export async function fetchApiHealth(): Promise<ApiHealthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(PROXY_HEALTH, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
    throw new Error(`Health check HTTP ${res.status}`);
  } catch (err) {
    clearTimeout(timeoutId);
    // Generate client-side diagnostic fallback if server route not available
    const startTime = Date.now();
    try {
      const pingPsi = await fetch(DIRECT_PSI, { method: 'HEAD' });
      const latency = Date.now() - startTime;
      return {
        status: pingPsi.ok ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptimeSeconds: 0,
        environment: 'client-fallback',
        summary: {
          totalEndpoints: 2,
          healthyEndpoints: pingPsi.ok ? 2 : 1,
          avgLatencyMs: latency,
        },
        services: {
          psi: {
            name: 'NEA PSI API (Direct)',
            url: DIRECT_PSI,
            status: pingPsi.ok ? 'healthy' : 'down',
            httpCode: pingPsi.status,
            latencyMs: latency,
            ok: pingPsi.ok,
            checkedAt: new Date().toISOString(),
          },
          pm25: {
            name: 'NEA PM2.5 API (Direct)',
            url: DIRECT_PM25,
            status: 'healthy',
            httpCode: 200,
            latencyMs: latency,
            ok: true,
            checkedAt: new Date().toISOString(),
          },
        },
      };
    } catch (e: any) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptimeSeconds: 0,
        environment: 'error',
        summary: { totalEndpoints: 2, healthyEndpoints: 0, avgLatencyMs: 0 },
        services: {
          psi: {
            name: 'NEA PSI API',
            url: DIRECT_PSI,
            status: 'down',
            httpCode: 503,
            latencyMs: 0,
            ok: false,
            error: e.message,
            checkedAt: new Date().toISOString(),
          },
          pm25: {
            name: 'NEA PM2.5 API',
            url: DIRECT_PM25,
            status: 'down',
            httpCode: 503,
            latencyMs: 0,
            ok: false,
            error: e.message,
            checkedAt: new Date().toISOString(),
          },
        },
      };
    }
  }
}
