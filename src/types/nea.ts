/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SingaporeRegion = 'north' | 'south' | 'east' | 'west' | 'central' | 'national';

export interface RegionMetadata {
  name: string;
  labelLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface PsiReadings {
  o3_sub_index: Record<string, number>;
  pm10_twenty_four_hourly: Record<string, number>;
  pm10_sub_index: Record<string, number>;
  co_sub_index: Record<string, number>;
  pm25_twenty_four_hourly: Record<string, number>;
  so2_sub_index: Record<string, number>;
  co_eight_hour_max: Record<string, number>;
  no2_one_hour_max: Record<string, number>;
  so2_twenty_four_hourly: Record<string, number>;
  pm25_sub_index: Record<string, number>;
  psi_twenty_four_hourly: Record<string, number>;
  o3_eight_hour_max: Record<string, number>;
}

export interface PsiItem {
  timestamp: string;
  updatedTimestamp: string;
  date?: string;
  readings: PsiReadings;
}

export interface PsiApiResponse {
  code: number;
  data: {
    regionMetadata: RegionMetadata[];
    items: PsiItem[];
  };
  errorMsg?: string;
}

export interface Pm25Readings {
  pm25_one_hourly: Record<string, number>;
}

export interface Pm25Item {
  timestamp: string;
  updatedTimestamp: string;
  date?: string;
  readings: Pm25Readings;
}

export interface Pm25ApiResponse {
  code: number;
  data: {
    regionMetadata: RegionMetadata[];
    items: Pm25Item[];
  };
  errorMsg?: string;
}

export interface EndpointHealth {
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  httpCode: number;
  latencyMs: number;
  ok: boolean;
  dataSummary?: any;
  error?: string;
  checkedAt: string;
}

export interface ApiHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  summary: {
    totalEndpoints: number;
    healthyEndpoints: number;
    avgLatencyMs: number;
  };
  services: {
    psi: EndpointHealth;
    pm25: EndpointHealth;
  };
}

export interface AirQualityBand {
  label: string;
  category: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  rangeText: string;
  shortDesc: string;
  generalAdvisory: string;
  vulnerableAdvisory: string;
}
