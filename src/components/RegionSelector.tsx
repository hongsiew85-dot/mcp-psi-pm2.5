/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Check } from 'lucide-react';
import { SingaporeRegion } from '../types/nea.ts';
import { findNearestRegion, getRegionLabel, SINGAPORE_REGIONS } from '../utils/geo.ts';

interface RegionSelectorProps {
  activeRegion: SingaporeRegion;
  onSelectRegion: (region: SingaporeRegion) => void;
  detectedLocationInfo: {
    lat: number;
    lon: number;
    region: SingaporeRegion;
    distanceKm: number;
  } | null;
  onLocationDetected: (info: {
    lat: number;
    lon: number;
    region: SingaporeRegion;
    distanceKm: number;
  }) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  activeRegion,
  onSelectRegion,
  detectedLocationInfo,
  onLocationDetected,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const nearest = findNearestRegion(latitude, longitude);

        onLocationDetected({
          lat: latitude,
          lon: longitude,
          region: nearest.region,
          distanceKm: nearest.distanceKm,
        });

        // Switch to the nearest region
        onSelectRegion(nearest.region);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Could not access location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please pick a region manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setLocationError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  const regions: { id: SingaporeRegion; label: string; sub: string }[] = [
    { id: 'national', label: 'All Island', sub: 'National' },
    { id: 'north', label: 'North', sub: 'Woodlands / Yishun' },
    { id: 'south', label: 'South', sub: 'CBD / Sentosa' },
    { id: 'east', label: 'East', sub: 'Tampines / Changi' },
    { id: 'west', label: 'West', sub: 'Jurong / Tuas' },
    { id: 'central', label: 'Central', sub: 'Bishan / Novena' },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Location Banner & GPS Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
                Active Monitoring Sector
              </span>
              {detectedLocationInfo?.region === activeRegion && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <Check className="w-3 h-3" /> Nearest to You
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-100 truncate">
              {getRegionLabel(activeRegion)}
            </p>
          </div>
        </div>

        {/* GPS Locate Button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 rounded-xl transition-all shadow-md shadow-cyan-900/20 active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting GPS...' : 'Locate My Sector'}</span>
        </button>
      </div>

      {locationError && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
          {locationError}
        </div>
      )}

      {detectedLocationInfo && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-mono">
            GPS: {detectedLocationInfo.lat.toFixed(4)}°N, {detectedLocationInfo.lon.toFixed(4)}°E
          </span>
          <span className="text-cyan-400 font-mono">
            ~{detectedLocationInfo.distanceKm} km from {detectedLocationInfo.region.toUpperCase()} centroid
          </span>
        </div>
      )}

      {/* Region Segmented Controls (Scrollable on small mobile screens) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
        {regions.map((reg) => {
          const isSelected = activeRegion === reg.id;
          const isNearest = detectedLocationInfo?.region === reg.id;

          return (
            <button
              key={reg.id}
              onClick={() => onSelectRegion(reg.id)}
              className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-lg text-center transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow-md shadow-slate-950/40 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-center gap-1">
                <span>{reg.label}</span>
                {isNearest && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 opacity-80 truncate hidden sm:block">
                {reg.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
