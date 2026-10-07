/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface AtmosphereBackgroundProps {
  hazeFactor: number; // 0.0 (pristine/clean) to 1.0 (severe/hazardous haze)
  hazeLevel: 'clear' | 'moderate' | 'unhealthy' | 'severe' | 'hazardous';
  enabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  baseOpacity: number;
  pulsePhase: number;
  color: string;
}

export const AtmosphereBackground: React.FC<AtmosphereBackgroundProps> = ({
  hazeFactor,
  hazeLevel,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle count scales with haze density
    const particleCount = Math.floor(25 + hazeFactor * 85);
    const particles: Particle[] = [];

    // Particle color palettes depending on severity
    const getParticleColor = (factor: number) => {
      if (factor < 0.25) {
        // Pristine motes
        return 'rgba(147, 197, 253, '; // soft blue
      }
      if (factor < 0.55) {
        // Moderate mist
        return 'rgba(216, 180, 254, '; // pale lavender mist
      }
      if (factor < 0.8) {
        // Unhealthy smog/soot
        return Math.random() > 0.4 ? 'rgba(245, 158, 11, ' : 'rgba(217, 119, 6, '; // warm amber
      }
      // Hazardous dense transboundary haze
      return Math.random() > 0.3 ? 'rgba(234, 88, 12, ' : 'rgba(180, 83, 9, '; // dark orange-brown soot
    };

    for (let i = 0; i < particleCount; i++) {
      const baseOp = 0.15 + Math.random() * (0.35 + hazeFactor * 0.45);
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: (0.8 + Math.random() * (1.6 + hazeFactor * 2.8)),
        vx: 0.15 + Math.random() * (0.4 + hazeFactor * 0.7), // wind drifts rightwards
        vy: -0.1 + Math.random() * 0.2 + (Math.random() - 0.5) * 0.1,
        opacity: baseOp,
        baseOpacity: baseOp,
        pulsePhase: Math.random() * Math.PI * 2,
        color: getParticleColor(hazeFactor),
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Render drifting particulate matter
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        // subtle sinusoidal turbulent drift
        p.y += p.vy + Math.sin(time + p.pulsePhase) * 0.25;

        // Wrap edges smoothly
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.y < -10) p.y = height + 10;

        const currentOpacity = p.baseOpacity * (0.7 + Math.sin(time * 2 + p.pulsePhase) * 0.3);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentOpacity.toFixed(3)})`;
        ctx.fill();

        // If high haze, add subtle blur halo for larger smoke clumps
        if (hazeFactor > 0.5 && p.size > 2.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${(currentOpacity * 0.25).toFixed(3)})`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hazeFactor, hazeLevel, enabled]);

  if (!enabled) return null;

  // Atmospheric background gradients based on haze level
  const getAtmosphereGlow = () => {
    switch (hazeLevel) {
      case 'clear':
        return 'from-slate-950 via-slate-900/90 to-cyan-950/25';
      case 'moderate':
        return 'from-slate-950 via-slate-900/95 to-amber-950/30';
      case 'unhealthy':
        return 'from-amber-950/40 via-slate-950/95 to-orange-950/45';
      case 'severe':
        return 'from-amber-950/60 via-stone-950 to-orange-950/60';
      case 'hazardous':
        return 'from-amber-950/80 via-yellow-950/60 to-orange-950/80';
    }
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-1000"
    >
      {/* Base deep backdrop with atmospheric tint */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getAtmosphereGlow()} transition-colors duration-1000`} />

      {/* Atmospheric Smog Fog Overlays when hazy */}
      {hazeFactor > 0.2 && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: Math.min(0.85, hazeFactor * 0.9) }}
        >
          {/* Volumetric Upper Fog Band */}
          <div
            className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-amber-900/20 via-amber-800/10 to-transparent blur-3xl animate-pulse"
            style={{ animationDuration: '8s' }}
          />

          {/* Lower Horizon Smog Bank */}
          <div
            className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-orange-950/35 via-amber-950/20 to-transparent blur-2xl"
          />

          {/* Drifting Translucent Smog Clouds */}
          <div
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-amber-600/10 blur-[100px] motion-safe:animate-spin"
            style={{ animationDuration: '60s' }}
          />
          <div
            className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-orange-700/10 blur-[120px] motion-safe:animate-spin"
            style={{ animationDuration: '45s', animationDirection: 'reverse' }}
          />
        </div>
      )}

      {/* Extreme Haze Sepia Scrim for Hazardous readings */}
      {hazeFactor >= 0.7 && (
        <div
          className="absolute inset-0 bg-amber-950/20 mix-blend-color-burn pointer-events-none transition-opacity duration-1000"
          style={{ opacity: (hazeFactor - 0.7) * 2.5 }}
        />
      )}

      {/* Canvas for fine suspended PM2.5 / PM10 particles */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full opacity-90" />
    </div>
  );
};
