/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON parsing middleware
  app.use(express.json());

  // Health check endpoint (both /api/health and /api/health.js)
  app.get(['/api/health', '/api/health.js'], healthHandler);

  // Proxy endpoints for NEA Real-time APIs to allow robust server-side fetching & caching
  const NEA_BASE = 'https://api-open.data.gov.sg/v2/real-time/api';

  app.get('/api/psi', async (req, res) => {
    try {
      const url = new URL(`${NEA_BASE}/psi`);
      for (const [key, val] of Object.entries(req.query)) {
        if (typeof val === 'string') {
          url.searchParams.set(key, val);
        }
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SGAirPulse/1.0',
        },
      });

      const data = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      res.status(response.status).json(data);
    } catch (err: any) {
      res.status(502).json({ error: 'Failed to fetch NEA PSI data', message: err.message });
    }
  });

  app.get('/api/pm25', async (req, res) => {
    try {
      const url = new URL(`${NEA_BASE}/pm25`);
      for (const [key, val] of Object.entries(req.query)) {
        if (typeof val === 'string') {
          url.searchParams.set(key, val);
        }
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SGAirPulse/1.0',
        },
      });

      const data = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      res.status(response.status).json(data);
    } catch (err: any) {
      res.status(502).json({ error: 'Failed to fetch NEA PM2.5 data', message: err.message });
    }
  });

  // Client SPA serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SG AirPulse] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SG AirPulse] Server startup error:', err);
  process.exit(1);
});
