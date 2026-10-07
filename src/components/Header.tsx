/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Sliders, Server, Sparkles } from 'lucide-react';

interface HeaderProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenHealth: () => void;
  onOpenWeatherLab: () => void;
  activeTab: 'monitor' | 'trends' | 'map';
  setActiveTab: (tab: 'monitor' | 'trends' | 'map') => void;
  isHazy: boolean;
  hazeLevelText: string;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  onRefresh,
  isRefreshing,
  onOpenHealth,
  onOpenWeatherLab,
  activeTab,
  setActiveTab,
  isHazy,
  hazeLevelText,
}) => {
  const [sgTime, setSgTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSgTime(
        now.toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            aria-label="SG AirPulse Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              SG AirPulse
            </span>
          </a>

          {/* Quiet live haze indicator */}
          {isHazy && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              {hazeLevelText}
            </span>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'monitor'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'trends'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24h Trends
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'map'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Regional Matrix
          </button>
        </nav>

        {/* Zone 3: Actions & Diagnostics */}
        <div className="flex items-center gap-2">
          {/* Singapore Time Monospace */}
          <div className="hidden lg:flex flex-col items-end text-right mr-1">
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-mono">
              SGT (UTC+8)
            </span>
            <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
              {sgTime || '--:--:--'}
            </span>
          </div>

          {/* Weather Effect Lab Toggle Button */}
          <button
            onClick={onOpenWeatherLab}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors focus:ring-2 focus:ring-cyan-500/40"
            title="Atmosphere & Haze Weather Simulator"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Haze FX</span>
          </button>

          {/* API Health Monitor Button */}
          <button
            onClick={onOpenHealth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors focus:ring-2 focus:ring-cyan-500/40"
            title="NEA API Health (/api/health.js)"
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">API Status</span>
          </button>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50 focus:ring-2 focus:ring-cyan-500/40"
            title="Refresh NEA Data"
            aria-label="Refresh NEA Air Quality Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
