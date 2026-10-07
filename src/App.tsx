/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchLatestPsi,
  fetchLatestPm25,
  fetchDailyPm25Trends,
  fetchDailyPsiTrends,
  fetchApiHealth,
} from './services/neaApi.ts';
import {
  PsiApiResponse,
  Pm25ApiResponse,
  ApiHealthResponse,
  SingaporeRegion,
  Pm25Item,
  PsiItem,
} from './types/nea.ts';
import { calculateHazeMetrics } from './utils/airQuality.ts';
import { AtmosphereBackground } from './components/AtmosphereBackground.tsx';
import { Header } from './components/Header.tsx';
import { RegionSelector } from './components/RegionSelector.tsx';
import { MainReadingsCard } from './components/MainReadingsCard.tsx';
import { SubPollutantsGrid } from './components/SubPollutantsGrid.tsx';
import { InteractiveCharts } from './components/InteractiveCharts.tsx';
import { IslandMapMatrix } from './components/IslandMapMatrix.tsx';
import { HealthStatusModal } from './components/HealthStatusModal.tsx';
import { AtmosphereControlDrawer } from './components/AtmosphereControlDrawer.tsx';
import { Activity, BarChart3, Grid, Server, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState<'monitor' | 'trends' | 'map'>('monitor');
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isWeatherLabOpen, setIsWeatherLabOpen] = useState(false);

  // Sector / Region Selection
  const [activeRegion, setActiveRegion] = useState<SingaporeRegion>('central');
  const [detectedLocationInfo, setDetectedLocationInfo] = useState<{
    lat: number;
    lon: number;
    region: SingaporeRegion;
    distanceKm: number;
  } | null>(null);

  // NEA Data State
  const [psiData, setPsiData] = useState<PsiApiResponse | null>(null);
  const [pm25Data, setPm25Data] = useState<Pm25ApiResponse | null>(null);
  const [pm25Trends, setPm25Trends] = useState<Pm25Item[]>([]);
  const [psiTrends, setPsiTrends] = useState<PsiItem[]>([]);
  const [healthData, setHealthData] = useState<ApiHealthResponse | null>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Weather & Haze Effect Controls
  const [isLiveSync, setIsLiveSync] = useState(true);
  const [manualPsiOverride, setManualPsiOverride] = useState(130);
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  // Fetch all live data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const [latestPsi, latestPm25, trendsPm25, trendsPsi, health] = await Promise.all([
        fetchLatestPsi(),
        fetchLatestPm25(),
        fetchDailyPm25Trends(),
        fetchDailyPsiTrends(),
        fetchApiHealth(),
      ]);

      setPsiData(latestPsi);
      setPm25Data(latestPm25);
      setPm25Trends(trendsPm25.data?.items || []);
      setPsiTrends(trendsPsi.data?.items || []);
      setHealthData(health);
    } catch (err: any) {
      console.error('Error fetching NEA data:', err);
      setErrorMessage(err.message || 'Failed to fetch NEA real-time data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load & 5-minute polling
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handler for refreshing health status on demand
  const handleRefreshHealth = async () => {
    setIsHealthLoading(true);
    try {
      const freshHealth = await fetchApiHealth();
      setHealthData(freshHealth);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setIsHealthLoading(false);
    }
  };

  // Derive current readings for selected region
  const latestPsiItem = psiData?.data?.items?.[0];
  const latestPm25Item = pm25Data?.data?.items?.[0];

  const getRegionValue = (dict: Record<string, number> | undefined, reg: SingaporeRegion) => {
    if (!dict) return null;
    if (reg === 'national') {
      const vals = Object.values(dict);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    }
    return dict[reg] ?? null;
  };

  const currentPsiValue = getRegionValue(
    latestPsiItem?.readings?.psi_twenty_four_hourly,
    activeRegion
  );
  const currentPm25Value = getRegionValue(
    latestPm25Item?.readings?.pm25_one_hourly,
    activeRegion
  );

  // Compute live haze metrics for atmospheric weather background
  const effectivePsi = isLiveSync ? (currentPsiValue ?? 50) : manualPsiOverride;
  const effectivePm25 = isLiveSync ? (currentPm25Value ?? 35) : (manualPsiOverride * 0.7);

  const { factor: hazeFactor, level: hazeLevel, descriptor: hazeDesc } = calculateHazeMetrics(
    effectivePsi,
    effectivePm25
  );

  const isHazy = hazeLevel === 'unhealthy' || hazeLevel === 'severe' || hazeLevel === 'hazardous';

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Requirement 3: Dynamic Weather Atmosphere Background (Drifting haze & smog particles) */}
      <AtmosphereBackground
        hazeFactor={hazeFactor}
        hazeLevel={hazeLevel}
        enabled={particlesEnabled}
      />

      {/* Top Bar Contract Navigation */}
      <Header
        lastUpdated={latestPm25Item?.updatedTimestamp || latestPsiItem?.updatedTimestamp || null}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        onOpenHealth={() => setIsHealthModalOpen(true)}
        onOpenWeatherLab={() => setIsWeatherLabOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isHazy={isHazy}
        hazeLevelText={hazeDesc}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
        {/* Error Callout if fetch failed */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-between gap-3 text-rose-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">NEA Connectivity Notice</span>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => loadData()}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Region & GPS Sector Selector */}
        <RegionSelector
          activeRegion={activeRegion}
          onSelectRegion={setActiveRegion}
          detectedLocationInfo={detectedLocationInfo}
          onLocationDetected={setDetectedLocationInfo}
        />

        {/* Tab 1: Live Monitor View */}
        {activeTab === 'monitor' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Primary Telemetry Gauges & NEA Health Advisory */}
            <MainReadingsCard
              psiValue={currentPsiValue}
              pm25Value={currentPm25Value}
              region={activeRegion}
              timestamp={latestPm25Item?.timestamp || latestPsiItem?.timestamp || null}
              isHazy={isHazy}
            />

            {/* Quick 24h Trend Chart Preview */}
            <InteractiveCharts
              pm25Trends={pm25Trends}
              psiTrends={psiTrends}
              selectedRegion={activeRegion}
            />

            {/* Detailed Sub-Pollutants Matrix (PM10, O3, NO2, SO2, CO) */}
            <SubPollutantsGrid
              readings={latestPsiItem?.readings || null}
              region={activeRegion}
            />

            {/* Island-wide 5 sector matrix */}
            <IslandMapMatrix
              pm25OneHourly={latestPm25Item?.readings?.pm25_one_hourly}
              psiTwentyFourHourly={latestPsiItem?.readings?.psi_twenty_four_hourly}
              activeRegion={activeRegion}
              onSelectRegion={setActiveRegion}
            />
          </div>
        )}

        {/* Tab 2: Dedicated 24h Trends View */}
        {activeTab === 'trends' && (
          <div className="space-y-6 animate-fadeIn">
            <InteractiveCharts
              pm25Trends={pm25Trends}
              psiTrends={psiTrends}
              selectedRegion={activeRegion}
            />

            <IslandMapMatrix
              pm25OneHourly={latestPm25Item?.readings?.pm25_one_hourly}
              psiTwentyFourHourly={latestPsiItem?.readings?.psi_twenty_four_hourly}
              activeRegion={activeRegion}
              onSelectRegion={setActiveRegion}
            />
          </div>
        )}

        {/* Tab 3: Island 5-Sector Regional Matrix View */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-fadeIn">
            <IslandMapMatrix
              pm25OneHourly={latestPm25Item?.readings?.pm25_one_hourly}
              psiTwentyFourHourly={latestPsiItem?.readings?.psi_twenty_four_hourly}
              activeRegion={activeRegion}
              onSelectRegion={setActiveRegion}
            />

            <SubPollutantsGrid
              readings={latestPsiItem?.readings || null}
              region={activeRegion}
            />
          </div>
        )}
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar (Thumb Zone) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'monitor' ? 'text-cyan-400 font-bold bg-slate-900/60' : 'text-slate-400'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] mt-1">Monitor</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'trends' ? 'text-cyan-400 font-bold bg-slate-900/60' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-1">24h Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'map' ? 'text-cyan-400 font-bold bg-slate-900/60' : 'text-slate-400'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] mt-1">Sectors</span>
          </button>

          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Server className="w-5 h-5" />
            <span className="text-[10px] mt-1">API Health</span>
          </button>
        </div>
      </nav>

      {/* Requirement 2: Health Status Modal monitoring /api/health.js */}
      <HealthStatusModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        healthData={healthData}
        onRefreshHealth={handleRefreshHealth}
        isLoading={isHealthLoading}
      />

      {/* Requirement 3: Atmospheric Haze Weather Effect Lab & Simulator */}
      <AtmosphereControlDrawer
        isOpen={isWeatherLabOpen}
        onClose={() => setIsWeatherLabOpen(false)}
        isLiveSync={isLiveSync}
        onToggleLiveSync={setIsLiveSync}
        manualPsiOverride={manualPsiOverride}
        onManualPsiChange={setManualPsiOverride}
        actualPsi={currentPsiValue ?? 85}
        particlesEnabled={particlesEnabled}
        onToggleParticles={setParticlesEnabled}
        hazeLevel={hazeLevel}
        hazeFactor={hazeFactor}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-400 max-w-6xl mx-auto px-4 w-full">
        <p>
          Data provided via Singapore National Environment Agency (NEA) Open Data APIs under Singapore Open Data Licence.
        </p>
        <p className="mt-1 font-mono text-[11px] text-slate-400">
          PSI: 24-hr moving average · PM2.5: 1-hr concentration · Probed via /api/health.js
        </p>
      </footer>
    </div>
  );
}
