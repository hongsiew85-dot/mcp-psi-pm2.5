/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SingaporeRegion } from '../types/nea.ts';

export interface RegionCentroid {
  id: 'north' | 'south' | 'east' | 'west' | 'central';
  name: string;
  latitude: number;
  longitude: number;
  districts: string[];
}

export const SINGAPORE_REGIONS: RegionCentroid[] = [
  {
    id: 'north',
    name: 'North Region',
    latitude: 1.41803,
    longitude: 103.82000,
    districts: ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty', 'Mandai'],
  },
  {
    id: 'south',
    name: 'South Region',
    latitude: 1.29587,
    longitude: 103.82000,
    districts: ['Downtown Core', 'Marina Bay', 'Harbourfront', 'Sentosa', 'Telok Blangah'],
  },
  {
    id: 'east',
    name: 'East Region',
    latitude: 1.35735,
    longitude: 103.94000,
    districts: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Geylang'],
  },
  {
    id: 'west',
    name: 'West Region',
    latitude: 1.35735,
    longitude: 103.70000,
    districts: ['Jurong East/West', 'Clementi', 'Bukit Batok', 'Choa Chu Kang', 'Tuas'],
  },
  {
    id: 'central',
    name: 'Central Region',
    latitude: 1.35735,
    longitude: 103.82000,
    districts: ['Bishan', 'Ang Mo Kio', 'Toa Payoh', 'Novena', 'Orchard'],
  },
];

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the nearest Singapore NEA region to the specified coordinates.
 */
export function findNearestRegion(
  userLat: number,
  userLon: number
): { region: SingaporeRegion; distanceKm: number; name: string } {
  let closest = SINGAPORE_REGIONS[0];
  let minDistance = Infinity;

  for (const reg of SINGAPORE_REGIONS) {
    const dist = calculateHaversineDistance(userLat, userLon, reg.latitude, reg.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = reg;
    }
  }

  return {
    region: closest.id,
    distanceKm: minDistance,
    name: closest.name,
  };
}

/**
 * Helper to get user-friendly region label
 */
export function getRegionLabel(region: SingaporeRegion): string {
  switch (region) {
    case 'north':
      return 'North (Woodlands / Yishun)';
    case 'south':
      return 'South (Sentosa / CBD)';
    case 'east':
      return 'East (Tampines / Changi)';
    case 'west':
      return 'West (Jurong / Clementi)';
    case 'central':
      return 'Central (Bishan / AMK)';
    case 'national':
      return 'All Island (Singapore Avg)';
  }
}
