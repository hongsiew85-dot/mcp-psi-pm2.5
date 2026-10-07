/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PsiReadings, SingaporeRegion } from '../types/nea.ts';

interface SubPollutantsGridProps {
  readings: PsiReadings | null;
  region: SingaporeRegion;
}

export const SubPollutantsGrid: React.FC<SubPollutantsGridProps> = ({
  readings,
  region,
}) => {
  if (!readings) return null;

  const targetReg = region === 'national' ? 'central' : region;

  const getVal = (dict: Record<string, number> | undefined) => {
    if (!dict) return '--';
    if (region === 'national') {
      const vals = Object.values(dict);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : '--';
    }
    return dict[targetReg] !== undefined ? dict[targetReg] : '--';
  };

  const pollutants = [
    {
      symbol: 'PM10',
      name: 'Coarse Inhalable Particulates',
      value: getVal(readings.pm10_twenty_four_hourly),
      unit: 'µg/m³',
      subIndex: getVal(readings.pm10_sub_index),
      period: '24-Hour Avg',
      source: 'Dust, construction, vehicular wear',
    },
    {
      symbol: 'O₃',
      name: 'Ground-Level Ozone',
      value: getVal(readings.o3_eight_hour_max),
      unit: 'µg/m³',
      subIndex: getVal(readings.o3_sub_index),
      period: '8-Hour Max',
      source: 'Photochemical smog & sunlight reactions',
    },
    {
      symbol: 'NO₂',
      name: 'Nitrogen Dioxide',
      value: getVal(readings.no2_one_hour_max),
      unit: 'µg/m³',
      subIndex: '--',
      period: '1-Hour Max',
      source: 'Vehicle combustion, power plants',
    },
    {
      symbol: 'SO₂',
      name: 'Sulphur Dioxide',
      value: getVal(readings.so2_twenty_four_hourly),
      unit: 'µg/m³',
      subIndex: getVal(readings.so2_sub_index),
      period: '24-Hour Avg',
      source: 'Heavy fuel combustion, refineries',
    },
    {
      symbol: 'CO',
      name: 'Carbon Monoxide',
      value: getVal(readings.co_eight_hour_max),
      unit: 'mg/m³',
      subIndex: getVal(readings.co_sub_index),
      period: '8-Hour Max',
      source: 'Incomplete motor vehicle combustion',
    },
    {
      symbol: 'PM2.5 (24h)',
      name: '24-Hr Fine Particulate',
      value: getVal(readings.pm25_twenty_four_hourly),
      unit: 'µg/m³',
      subIndex: getVal(readings.pm25_sub_index),
      period: '24-Hour Avg',
      source: 'Regional smoke, forest fires, exhaust',
    },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            NEA Atmospheric Telemetry Matrix
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Sub-Pollutant Breakdown
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          Official NEA Gas & Aerosol Sensors
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutants.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-sm font-bold text-cyan-300">
                  {item.symbol}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {item.period}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {item.name}
              </p>
            </div>

            <div className="my-2.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-bold text-white tabular-nums">
                  {item.value}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {item.unit}
                </span>
              </div>
              {item.subIndex !== '--' && (
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Sub-Index: <span className="text-slate-300 font-bold">{item.subIndex}</span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 line-clamp-1 border-t border-slate-800/60 pt-1.5">
              {item.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
