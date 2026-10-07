/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, X, Wind, Eye, RotateCcw, AlertTriangle } from 'lucide-react';

interface AtmosphereControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLiveSync: boolean;
  onToggleLiveSync: (live: boolean) => void;
  manualPsiOverride: number;
  onManualPsiChange: (psi: number) => void;
  actualPsi: number;
  particlesEnabled: boolean;
  onToggleParticles: (enabled: boolean) => void;
  hazeLevel: 'clear' | 'moderate' | 'unhealthy' | 'severe' | 'hazardous';
  hazeFactor: number;
}

export const AtmosphereControlDrawer: React.FC<AtmosphereControlDrawerProps> = ({
  isOpen,
  onClose,
  isLiveSync,
  onToggleLiveSync,
  manualPsiOverride,
  onManualPsiChange,
  actualPsi,
  particlesEnabled,
  onToggleParticles,
  hazeLevel,
  hazeFactor,
}) => {
  if (!isOpen) return null;

  const presets = [
    { label: 'Clear Skies', psi: 25, desc: 'Pristine clean atmosphere' },
    { label: 'Moderate Mist', psi: 75, desc: 'Light urban moisture' },
    { label: 'Current Live Haze', psi: actualPsi, desc: `Live NEA reading (${actualPsi} PSI)` },
    { label: 'Dense Smog', psi: 165, desc: 'Unhealthy forest fire smoke' },
    { label: 'Hazardous Haze', psi: 285, desc: 'Emergency smog shroud' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Atmospheric Haze Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Control UI background weather & smog effects
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Sync Mode Toggle */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-white">Live Data Synchronization</span>
            <p className="text-xs text-slate-400">
              {isLiveSync
                ? `Background effects actively reflect live NEA readings (${actualPsi} PSI)`
                : 'Manual preview mode active'}
            </p>
          </div>

          <button
            onClick={() => onToggleLiveSync(!isLiveSync)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isLiveSync
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isLiveSync ? 'Live Sync: ON' : 'Live Sync: OFF'}
          </button>
        </div>

        {/* Manual Slider (Enabled when live sync is off) */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">
              Simulated PSI Level
            </span>
            <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">
              {isLiveSync ? `${actualPsi} (Live)` : `${manualPsiOverride} PSI`}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="320"
            value={isLiveSync ? actualPsi : manualPsiOverride}
            onChange={(e) => {
              if (isLiveSync) onToggleLiveSync(false);
              onManualPsiChange(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0 Pristine</span>
            <span>100 Unhealthy</span>
            <span>200 Very Unhealthy</span>
            <span>300+ Hazardous</span>
          </div>

          {/* Preset Buttons */}
          <div className="pt-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
              Quick Atmospheric Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onToggleLiveSync(p.psi === actualPsi);
                    onManualPsiChange(p.psi);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Atmospheric Status Readout */}
        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">ATMOSPHERIC STATE:</span>
            <span className="font-bold uppercase text-amber-400">{hazeLevel}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">SMOG INTENSITY FACTOR:</span>
            <span className="text-slate-200 font-bold tabular-nums">{(hazeFactor * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Particulate Motion Option */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300">Drifting PM2.5 Micro-Particles</span>
          </div>
          <button
            onClick={() => onToggleParticles(!particlesEnabled)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              particlesEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {particlesEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
