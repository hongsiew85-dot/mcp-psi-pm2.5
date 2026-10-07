/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ApiHealthResponse } from '../types/nea.ts';
import { Server, CheckCircle2, AlertTriangle, XCircle, RefreshCw, X, ExternalLink, Code } from 'lucide-react';

interface HealthStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthData: ApiHealthResponse | null;
  onRefreshHealth: () => void;
  isLoading: boolean;
}

export const HealthStatusModal: React.FC<HealthStatusModalProps> = ({
  isOpen,
  onClose,
  healthData,
  onRefreshHealth,
  isLoading,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen) return null;

  const isHealthy = healthData?.status === 'healthy';
  const isDegraded = healthData?.status === 'degraded';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                NEA API Health Monitor
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time probe telemetry via <code className="text-cyan-400">/api/health.js</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Close Health Monitor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge & Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : isDegraded ? (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">System Status</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    isHealthy
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {healthData?.status || 'Probing...'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isHealthy
                  ? 'All NEA keyless endpoints are operating within nominal latency thresholds.'
                  : 'One or more NEA API endpoints are experiencing degraded performance or fallback.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">AVG LATENCY</span>
              <span className="text-base font-bold text-white tabular-nums">
                {healthData?.summary.avgLatencyMs ?? '--'} ms
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ACTIVE ENDPOINTS</span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                {healthData?.summary.healthyEndpoints ?? '--'} / {healthData?.summary.totalEndpoints ?? 2}
              </span>
            </div>
          </div>
        </div>

        {/* Monitored Endpoints List */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Monitored NEA Data.gov.sg Endpoints
          </h4>

          {/* PSI API Endpoint */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {healthData?.services.psi.name || 'NEA PSI Real-time API'}
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  healthData?.services.psi.ok
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                HTTP {healthData?.services.psi.httpCode || 200} · {healthData?.services.psi.latencyMs || 0}ms
              </span>
            </div>
            <p className="text-xs font-mono text-cyan-400/80 truncate">
              {healthData?.services.psi.url || 'https://api-open.data.gov.sg/v2/real-time/api/psi'}
            </p>
          </div>

          {/* PM2.5 API Endpoint */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {healthData?.services.pm25.name || 'NEA PM2.5 Real-time API'}
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  healthData?.services.pm25.ok
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                HTTP {healthData?.services.pm25.httpCode || 200} · {healthData?.services.pm25.latencyMs || 0}ms
              </span>
            </div>
            <p className="text-xs font-mono text-cyan-400/80 truncate">
              {healthData?.services.pm25.url || 'https://api-open.data.gov.sg/v2/real-time/api/pm25'}
            </p>
          </div>
        </div>

        {/* Raw JSON toggle */}
        <div>
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRawJson ? 'Hide Raw /api/health.js JSON' : 'Inspect Raw /api/health.js JSON'}</span>
          </button>
          {showRawJson && (
            <pre className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <a
            href="/api/health.js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open /api/health.js directly</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshHealth}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Ping NEA APIs</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
