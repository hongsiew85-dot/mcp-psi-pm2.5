/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Pm25Item, PsiItem, SingaporeRegion } from '../types/nea.ts';
import { getPm25Band, getPsiBand } from '../utils/airQuality.ts';
import { SINGAPORE_REGIONS } from '../utils/geo.ts';
import { TrendingUp, BarChart3, Clock, Layers } from 'lucide-react';

interface InteractiveChartsProps {
  pm25Trends: Pm25Item[];
  psiTrends: PsiItem[];
  selectedRegion: SingaporeRegion;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  pm25Trends,
  psiTrends,
  selectedRegion,
}) => {
  const [metric, setMetric] = useState<'pm25' | 'psi'>('pm25');
  const [multiRegionCompare, setMultiRegionCompare] = useState<boolean>(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Region color mapping for comparison mode
  const regionColors: Record<string, string> = {
    north: '#06b6d4', // cyan
    south: '#3b82f6', // blue
    east: '#10b981', // emerald
    west: '#f59e0b', // amber
    central: '#a855f7', // purple
  };

  // Helper to extract value safely
  const getPointValue = (item: Pm25Item | PsiItem, targetReg: string, targetMetric: 'pm25' | 'psi') => {
    if (targetMetric === 'pm25') {
      const p = item as Pm25Item;
      const readings = p.readings?.pm25_one_hourly;
      if (!readings) return 0;
      if (targetReg === 'national') {
        const vals = Object.values(readings);
        return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      }
      return readings[targetReg] ?? 0;
    } else {
      const p = item as PsiItem;
      const readings = p.readings?.psi_twenty_four_hourly;
      if (!readings) return 0;
      if (targetReg === 'national') {
        const vals = Object.values(readings);
        return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      }
      return readings[targetReg] ?? 0;
    }
  };

  // Chronologically sort data (NEA returns latest first or chronological)
  const chartItems = useMemo(() => {
    const raw = metric === 'pm25' ? pm25Trends : psiTrends;
    if (!raw || raw.length === 0) return [];
    return [...raw].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [metric, pm25Trends, psiTrends]);

  // Compute stats for selected region
  const stats = useMemo(() => {
    if (!chartItems.length) return { min: 0, max: 0, avg: 0, latest: 0 };
    const values = chartItems.map((item) => getPointValue(item, selectedRegion, metric));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const latest = values[values.length - 1] ?? 0;
    return { min, max, avg, latest };
  }, [chartItems, selectedRegion, metric]);

  // Chart dimensions & scaling
  const width = 800;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const effectiveWidth = width - padding.left - padding.right;
  const effectiveHeight = height - padding.top - padding.bottom;

  // Max scale calculation
  const yMax = useMemo(() => {
    if (!chartItems.length) return 100;
    let highest = 0;
    if (multiRegionCompare) {
      for (const item of chartItems) {
        for (const reg of ['north', 'south', 'east', 'west', 'central']) {
          const val = getPointValue(item, reg, metric);
          if (val > highest) highest = val;
        }
      }
    } else {
      highest = stats.max;
    }
    // Round up to nearest nice interval
    const ceiling = metric === 'pm25' ? Math.max(highest + 20, 100) : Math.max(highest + 30, 120);
    return Math.ceil(ceiling / 20) * 20;
  }, [chartItems, multiRegionCompare, metric, stats.max]);

  // Coordinate helpers
  const getX = (index: number) => {
    if (chartItems.length <= 1) return padding.left;
    return padding.left + (index / (chartItems.length - 1)) * effectiveWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(yMax, val));
    return height - padding.bottom - (clamped / yMax) * effectiveHeight;
  };

  // Build SVG Path for single region
  const buildSvgPath = (reg: string) => {
    if (chartItems.length === 0) return '';
    return chartItems
      .map((item, i) => {
        const val = getPointValue(item, reg, metric);
        const x = getX(i);
        const y = getY(val);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Active hover data point
  const activePointIndex = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < chartItems.length ? hoverIndex : null;
  const activeItem = activePointIndex !== null ? chartItems[activePointIndex] : chartItems[chartItems.length - 1];
  const activeVal = activeItem ? getPointValue(activeItem, selectedRegion, metric) : 0;
  const activeBand = metric === 'pm25' ? getPm25Band(activeVal) : getPsiBand(activeVal);

  const activeTimeLabel = activeItem
    ? new Date(activeItem.timestamp).toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  // Threshold guides
  const thresholds = metric === 'pm25'
    ? [
        { label: 'Normal (55)', value: 55, color: 'stroke-emerald-500/50' },
        { label: 'Elevated (150)', value: 150, color: 'stroke-amber-500/50' },
      ]
    : [
        { label: 'Good (50)', value: 50, color: 'stroke-emerald-500/50' },
        { label: 'Moderate (100)', value: 100, color: 'stroke-sky-500/50' },
        { label: 'Unhealthy (200)', value: 200, color: 'stroke-amber-500/50' },
      ];

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 backdrop-blur-xl space-y-5">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Interactive Time-Series Telemetry
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              24-Hour Horizon
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            {metric === 'pm25' ? '1-Hour PM2.5 Progression' : '24-Hour PSI Moving Index'}
          </h3>
        </div>

        {/* Toggle metric & comparison buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setMetric('pm25')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                metric === 'pm25'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PM2.5 (1-Hr)
            </button>
            <button
              onClick={() => setMetric('psi')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                metric === 'psi'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PSI (24-Hr)
            </button>
          </div>

          {/* Multi-Region Compare Toggle */}
          <button
            onClick={() => setMultiRegionCompare(!multiRegionCompare)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              multiRegionCompare
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare 5 Sectors</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Active Cursor Value
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-mono font-bold text-white tabular-nums">
              {activeVal}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {metric === 'pm25' ? 'µg/m³' : 'pts'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            @ {activeTimeLabel} SGT
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            24h Maximum Peak
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-mono font-bold text-amber-400 tabular-nums">
              {stats.max}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {metric === 'pm25' ? 'µg/m³' : 'pts'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Island High
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            24h Minimum
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
              {stats.min}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {metric === 'pm25' ? 'µg/m³' : 'pts'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Lowest Reading
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Day Moving Average
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-mono font-bold text-slate-200 tabular-nums">
              {stats.avg}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {metric === 'pm25' ? 'µg/m³' : 'pts'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Mean Level
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart Stage */}
      <div className="relative w-full overflow-hidden select-none">
        {chartItems.length > 0 ? (
          <div className="w-full">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible cursor-crosshair"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, (mouseX - (padding.left / width) * rect.width) / ((effectiveWidth / width) * rect.width)));
                const idx = Math.round(ratio * (chartItems.length - 1));
                setHoverIndex(idx);
              }}
              onMouseLeave={() => setHoverIndex(null)}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                if (!touch) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, (touchX - (padding.left / width) * rect.width) / ((effectiveWidth / width) * rect.width)));
                const idx = Math.round(ratio * (chartItems.length - 1));
                setHoverIndex(idx);
              }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines and axis markers */}
              {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
                const val = Math.round(yMax * step);
                const y = getY(val);
                return (
                  <g key={idx}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="rgba(51, 65, 85, 0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-500 font-mono text-[10px]"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Threshold guide reference lines */}
              {thresholds.map((th, i) => {
                if (th.value > yMax) return null;
                const y = getY(th.value);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      className={th.color}
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={width - padding.right}
                      y={y - 5}
                      textAnchor="end"
                      className="fill-slate-400 font-mono text-[9px]"
                    >
                      {th.label}
                    </text>
                  </g>
                );
              })}

              {/* Multi-Region Curves if Compare mode active */}
              {multiRegionCompare ? (
                SINGAPORE_REGIONS.map((reg) => {
                  const d = buildSvgPath(reg.id);
                  const strokeColor = regionColors[reg.id];
                  return (
                    <path
                      key={reg.id}
                      d={d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })
              ) : (
                <>
                  {/* Single Region Area Fill */}
                  <path
                    d={`${buildSvgPath(selectedRegion)} L ${getX(chartItems.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`}
                    fill="url(#areaGradient)"
                  />
                  {/* Main Line Curve */}
                  <path
                    d={buildSvgPath(selectedRegion)}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Hover scrubber vertical line & point indicator */}
              {activePointIndex !== null && (
                <g>
                  <line
                    x1={getX(activePointIndex)}
                    y1={padding.top}
                    x2={getX(activePointIndex)}
                    y2={height - padding.bottom}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {multiRegionCompare ? (
                    SINGAPORE_REGIONS.map((reg) => {
                      const val = getPointValue(chartItems[activePointIndex], reg.id, metric);
                      return (
                        <circle
                          key={reg.id}
                          cx={getX(activePointIndex)}
                          cy={getY(val)}
                          r="4"
                          fill={regionColors[reg.id]}
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                      );
                    })
                  ) : (
                    <circle
                      cx={getX(activePointIndex)}
                      cy={getY(activeVal)}
                      r="5.5"
                      fill="#06b6d4"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </g>
              )}

              {/* X-Axis time timestamps (sample 6 intervals) */}
              {chartItems.map((item, i) => {
                if (i % Math.max(1, Math.floor(chartItems.length / 5)) !== 0 && i !== chartItems.length - 1) {
                  return null;
                }
                const timeStr = new Date(item.timestamp).toLocaleTimeString('en-SG', {
                  timeZone: 'Asia/Singapore',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
                return (
                  <text
                    key={i}
                    x={getX(i)}
                    y={height - 15}
                    textAnchor="middle"
                    className="fill-slate-400 font-mono text-[10px]"
                  >
                    {timeStr}
                  </text>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="h-60 flex items-center justify-center text-slate-500 font-mono text-xs">
            Loading historical 24h readings...
          </div>
        )}
      </div>

      {/* Multi-region legend when compare mode active */}
      {multiRegionCompare && (
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-slate-800/80">
          {SINGAPORE_REGIONS.map((reg) => (
            <div key={reg.id} className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: regionColors[reg.id] }}
              />
              <span>{reg.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
