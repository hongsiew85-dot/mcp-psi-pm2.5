/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wind, AlertTriangle, ShieldCheck, Info, HeartPulse, Sparkles } from 'lucide-react';
import { getPsiBand, getPm25Band } from '../utils/airQuality.ts';
import { SingaporeRegion } from '../types/nea.ts';

interface MainReadingsCardProps {
  psiValue: number | null;
  pm25Value: number | null;
  region: SingaporeRegion;
  timestamp: string | null;
  isHazy: boolean;
}

export const MainReadingsCard: React.FC<MainReadingsCardProps> = ({
  psiValue,
  pm25Value,
  region,
  timestamp,
  isHazy,
}) => {
  const psiBand = psiValue !== null ? getPsiBand(psiValue) : null;
  const pm25Band = pm25Value !== null ? getPm25Band(pm25Value) : null;

  // Formatted date & time
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' SGT'
    : 'Updating...';

  return (
    <div className="space-y-4">
      {/* Primary Telemetry Grid: PM2.5 1-Hr & PSI 24-Hr */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PM2.5 1-Hour Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 backdrop-blur-xl transition-all">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  1-Hour Particulate Concentration
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  Immediate Guidance
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                PM2.5 (1-Hr)
              </h2>
            </div>

            {/* Official NEA Band Badge */}
            {pm25Band && (
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${pm25Band.bgColor} ${pm25Band.borderColor} ${pm25Band.textColor}`}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: pm25Band.color }}
                />
                <span>{pm25Band.label}</span>
              </div>
            )}
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-3 my-3">
            <span className="text-5xl sm:text-6xl font-mono font-extrabold tracking-tight text-white tabular-nums">
              {pm25Value !== null ? pm25Value : '--'}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-mono uppercase font-semibold text-slate-400">
                µg/m³
              </span>
              <span className="text-xs text-slate-400">
                Micrograms / m³
              </span>
            </div>
          </div>

          {/* Visual Spectrum Bar for PM2.5 (0 to 250+) */}
          {pm25Value !== null && (
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0 Normal</span>
                <span>55</span>
                <span>150 Elevated</span>
                <span>250 High</span>
              </div>
              <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="w-[22%] bg-emerald-500/80" title="Normal: 0-55" />
                <div className="w-[38%] bg-amber-500/80" title="Elevated: 56-150" />
                <div className="w-[40%] bg-red-500/80" title="High: 151-250" />
                {/* Pointer indicator */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-md transition-all duration-500 rounded-full"
                  style={{
                    left: `${Math.min(98, Math.max(2, (pm25Value / 250) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-slate-300 mt-4 leading-relaxed">
            {pm25Band?.shortDesc || 'NEA real-time fine particulate reading.'}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Band Standard: {pm25Band?.rangeText}</span>
            <span>Recorded: {formattedTime}</span>
          </div>
        </div>

        {/* 24-Hour PSI Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 backdrop-blur-xl transition-all">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  24-Hour Pollutant Index
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  Official Standard
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                PSI (24-Hour)
              </h2>
            </div>

            {/* Official NEA Band Badge */}
            {psiBand && (
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${psiBand.bgColor} ${psiBand.borderColor} ${psiBand.textColor}`}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: psiBand.color }}
                />
                <span>{psiBand.label}</span>
              </div>
            )}
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-3 my-3">
            <span className="text-5xl sm:text-6xl font-mono font-extrabold tracking-tight text-white tabular-nums">
              {psiValue !== null ? psiValue : '--'}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-mono uppercase font-semibold text-slate-400">
                Index Points
              </span>
              <span className="text-xs text-slate-400">
                24h Moving Avg
              </span>
            </div>
          </div>

          {/* Visual Spectrum Bar for PSI (0 to 300+) */}
          {psiValue !== null && (
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0 Good</span>
                <span>50</span>
                <span>100 Mod</span>
                <span>200 Unhealthy</span>
                <span>300</span>
              </div>
              <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="w-[17%] bg-emerald-500/80" title="Good: 0-50" />
                <div className="w-[17%] bg-sky-500/80" title="Moderate: 51-100" />
                <div className="w-[33%] bg-amber-500/80" title="Unhealthy: 101-200" />
                <div className="w-[33%] bg-red-500/80" title="Very Unhealthy: 201-300" />
                {/* Pointer indicator */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-md transition-all duration-500 rounded-full"
                  style={{
                    left: `${Math.min(98, Math.max(2, (psiValue / 300) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-slate-300 mt-4 leading-relaxed">
            {psiBand?.shortDesc || 'Composite index of 6 key atmospheric air pollutants.'}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Band Scale: {psiBand?.rangeText}</span>
            <span>Recorded: {formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Official NEA Health Advisory Callout */}
      {(psiBand || pm25Band) && (
        <div
          className={`rounded-2xl p-5 border backdrop-blur-md transition-all ${
            isHazy
              ? 'bg-amber-950/30 border-amber-500/40'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isHazy ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {isHazy ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                National Environment Agency (NEA) Health Advisory
              </h3>
              <p className="text-xs text-slate-400">
                Recommended activity guidelines based on current air quality bands
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Healthy Individuals
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {psiBand?.generalAdvisory || pm25Band?.generalAdvisory}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" />
                Vulnerable Populations
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {psiBand?.vulnerableAdvisory || pm25Band?.vulnerableAdvisory}
              </p>
            </div>
          </div>

          {/* Mask guidance if hazy */}
          {isHazy && (
            <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-start gap-2 text-xs text-amber-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Haze Protection Notice:</strong> When 24-hr PSI exceeds 100 or 1-hr PM2.5 is elevated, consider keeping windows closed in air-conditioned environments. Vulnerable persons spending extended time outdoors should consider wearing an N95 respirator mask.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
