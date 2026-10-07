/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SingaporeRegion } from '../types/nea.ts';
import { SINGAPORE_REGIONS } from '../utils/geo.ts';
import { getPm25Band, getPsiBand } from '../utils/airQuality.ts';
import { MapPin, ArrowRight } from 'lucide-react';

interface IslandMapMatrixProps {
  pm25OneHourly: Record<string, number> | undefined;
  psiTwentyFourHourly: Record<string, number> | undefined;
  activeRegion: SingaporeRegion;
  onSelectRegion: (reg: SingaporeRegion) => void;
}

export const IslandMapMatrix: React.FC<IslandMapMatrixProps> = ({
  pm25OneHourly,
  psiTwentyFourHourly,
  activeRegion,
  onSelectRegion,
}) => {
  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 backdrop-blur-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Island-Wide Synoptic Overview
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            5-Sector Regional Matrix
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Click any sector to focus detailed readings
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {SINGAPORE_REGIONS.map((reg) => {
          const pm25 = pm25OneHourly?.[reg.id] ?? 0;
          const psi = psiTwentyFourHourly?.[reg.id] ?? 0;
          const pm25Band = getPm25Band(pm25);
          const psiBand = getPsiBand(psi);
          const isSelected = activeRegion === reg.id;

          return (
            <button
              key={reg.id}
              onClick={() => onSelectRegion(reg.id)}
              className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-2 border-cyan-400 shadow-lg shadow-cyan-950/30'
                  : 'bg-slate-950/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              {/* Region Title & Badge */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    {reg.id.toUpperCase()}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                  {reg.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {reg.districts.slice(0, 3).join(', ')}
                </p>
              </div>

              {/* Metric Values */}
              <div className="my-3 space-y-2">
                {/* PM2.5 */}
                <div className="flex items-baseline justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">PM2.5 (1-hr)</span>
                    <span className="text-xl font-mono font-bold text-white tabular-nums">
                      {pm25} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${pm25Band.bgColor} ${pm25Band.borderColor} ${pm25Band.textColor}`}
                  >
                    {pm25Band.label}
                  </span>
                </div>

                {/* PSI */}
                <div className="flex items-baseline justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">PSI (24-hr)</span>
                    <span className="text-xl font-mono font-bold text-white tabular-nums">
                      {psi} <span className="text-[10px] font-normal text-slate-400">pts</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${psiBand.bgColor} ${psiBand.borderColor} ${psiBand.textColor}`}
                  >
                    {psiBand.label}
                  </span>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/60">
                <span>Centroid Coordinates</span>
                <span className="text-slate-300">
                  {reg.latitude.toFixed(2)}°, {reg.longitude.toFixed(2)}°
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
