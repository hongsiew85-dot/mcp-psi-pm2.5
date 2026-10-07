/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AirQualityBand } from '../types/nea.ts';

export interface AirQualityStatus {
  band: AirQualityBand;
  value: number;
  type: 'psi' | 'pm25';
  hazeLevel: 'clear' | 'moderate' | 'unhealthy' | 'severe' | 'hazardous';
  hazeFactor: number; // 0.0 to 1.0 for visual atmosphere shaders
}

export function getPsiBand(psi: number): AirQualityBand {
  if (psi <= 50) {
    return {
      label: 'Good',
      category: 'good',
      color: '#10b981', // emerald-500
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      rangeText: '0 – 50',
      shortDesc: 'Air quality is satisfactory with little to no health risk.',
      generalAdvisory: 'Normal activities can be continued as usual. Ideal for outdoor workouts.',
      vulnerableAdvisory: 'Normal activities can be continued.',
    };
  }
  if (psi <= 100) {
    return {
      label: 'Moderate',
      category: 'moderate',
      color: '#0ea5e9', // sky-500
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      rangeText: '51 – 100',
      shortDesc: 'Acceptable air quality. Some sensitive individuals may notice mild effects.',
      generalAdvisory: 'Normal outdoor activities may be carried out.',
      vulnerableAdvisory: 'Normal activities, but monitor personal comfort if unusually sensitive.',
    };
  }
  if (psi <= 200) {
    return {
      label: 'Unhealthy',
      category: 'unhealthy',
      color: '#f59e0b', // amber-500
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-400',
      rangeText: '101 – 200',
      shortDesc: 'Haze is noticeable. Increased likelihood of respiratory discomfort.',
      generalAdvisory: 'Reduce prolonged or strenuous outdoor exertion. Take frequent indoor rests.',
      vulnerableAdvisory: 'Avoid prolonged or strenuous outdoor exertion. Keep medication on hand.',
    };
  }
  if (psi <= 300) {
    return {
      label: 'Very Unhealthy',
      category: 'very_unhealthy',
      color: '#ef4444', // red-500
      bgColor: 'bg-red-500/15',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-400',
      rangeText: '201 – 300',
      shortDesc: 'Significant smog pollution. General population may experience adverse symptoms.',
      generalAdvisory: 'Avoid prolonged or strenuous outdoor physical activity. Wear N95 mask outdoors.',
      vulnerableAdvisory: 'Minimize outdoor activity. Elderly, pregnant women & children should stay indoors.',
    };
  }
  return {
    label: 'Hazardous',
    category: 'hazardous',
    color: '#a855f7', // purple-500
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-400',
    rangeText: '301+',
    shortDesc: 'Emergency health warning. Everyone is likely to be seriously affected.',
    generalAdvisory: 'Minimize all outdoor exposure. Keep doors and windows tightly closed with air filters.',
    vulnerableAdvisory: 'Stay indoors. Cease all outdoor activities and seek medical advice if symptomatic.',
  };
}

export function getPm25Band(pm25: number): AirQualityBand {
  if (pm25 <= 55) {
    return {
      label: 'Normal',
      category: 'good',
      color: '#10b981',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      rangeText: '0 – 55 µg/m³',
      shortDesc: 'Normal fine particulate concentration.',
      generalAdvisory: 'Normal activities can continue freely.',
      vulnerableAdvisory: 'Normal activities can continue freely.',
    };
  }
  if (pm25 <= 150) {
    return {
      label: 'Elevated',
      category: 'unhealthy',
      color: '#f59e0b',
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-400',
      rangeText: '56 – 150 µg/m³',
      shortDesc: 'Elevated particulate matter. Fine smoke and dust present in air.',
      generalAdvisory: 'Normal activities, but reduce prolonged strenuous exertion if feeling unwell.',
      vulnerableAdvisory: 'Reduce prolonged or strenuous outdoor physical exertion.',
    };
  }
  if (pm25 <= 250) {
    return {
      label: 'High',
      category: 'very_unhealthy',
      color: '#ef4444',
      bgColor: 'bg-red-500/15',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-400',
      rangeText: '151 – 250 µg/m³',
      shortDesc: 'High particulate concentration. Visibility degraded with noticeable smoke odor.',
      generalAdvisory: 'Reduce prolonged or strenuous outdoor physical exertion.',
      vulnerableAdvisory: 'Avoid outdoor physical exertion. Stay indoors in air-conditioned spaces.',
    };
  }
  return {
    label: 'Very High',
    category: 'hazardous',
    color: '#a855f7',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-400',
    rangeText: '>250 µg/m³',
    shortDesc: 'Severe fine particulate smoke and smog hazard.',
    generalAdvisory: 'Avoid outdoor physical exertion. Consider wearing an N95 mask outdoors.',
    vulnerableAdvisory: 'Stay indoors. Ensure air purifiers are operating on high.',
  };
}

/**
 * Computes unified haze intensity factor (0.0 to 1.0) and atmospheric state
 * for rendering dynamic background haze weather effects.
 */
export function calculateHazeMetrics(psi: number, pm25: number): {
  factor: number;
  level: 'clear' | 'moderate' | 'unhealthy' | 'severe' | 'hazardous';
  descriptor: string;
} {
  // Normalize PSI (0..300) and PM25 (0..250)
  const psiRatio = Math.min(1, Math.max(0, (psi - 30) / 250));
  const pm25Ratio = Math.min(1, Math.max(0, (pm25 - 25) / 200));
  const factor = Math.max(psiRatio, pm25Ratio);

  if (factor < 0.15) {
    return { factor: 0.05, level: 'clear', descriptor: 'Clear Skies & Crisp Air' };
  }
  if (factor < 0.35) {
    return { factor: 0.3, level: 'moderate', descriptor: 'Mild Atmospheric Mist' };
  }
  if (factor < 0.65) {
    return { factor: 0.6, level: 'unhealthy', descriptor: 'Noticeable Haze & Smog' };
  }
  if (factor < 0.85) {
    return { factor: 0.82, level: 'severe', descriptor: 'Dense Hazy Overcast' };
  }
  return { factor: 1.0, level: 'hazardous', descriptor: 'Critical Smog & Reduced Visibility' };
}
