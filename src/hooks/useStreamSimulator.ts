/**
 * useStreamSimulator — tick-based synthetic data generator for a single stream.
 *
 * Why a dedicated hook (not a service): it is purely UI-side lifecycle state —
 * it owns a setInterval and React state. Domain logic is delegated to lib/anomaly.
 *
 * Architecture: on each tick, a new reading is generated using a Box-Muller
 * normal distribution, then passed through both detectors. The resulting array
 * is trimmed to MAX_POINTS to prevent unbounded memory growth.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  detectEwma,
  computeModifiedZScore,
  initEwmaState,
  isAnomaly,
  type EwmaState,
} from '@/lib/anomaly';

const TICK_INTERVAL_MS = 1000; // 1 data point per second
const MAX_POINTS = 120; // Keep ≤120 points in memory; ~2 minutes of history
const SPIKE_PROBABILITY = 0.05; // 5% chance of an artificial spike per tick

export interface SimulatedPoint {
  /** Unix timestamp in ms */
  ts: number;
  /** Raw sensor reading */
  value: number;
  /** EWMA forecast for this tick */
  ewma: number;
  /** Upper bound: ewma + 3 * sqrt(variance) */
  upperBand: number;
  /** Lower bound: ewma - 3 * sqrt(variance) */
  lowerBand: number;
  /** Modified Z-score */
  score: number;
  /** True if the detector flagged this point */
  isAnomaly: boolean;
}

export interface StreamSimulatorConfig {
  /** Stream's natural baseline value (mean) */
  baseline: number;
  /** Natural noise level (std dev) */
  noiseStd: number;
  /** EWMA lambda smoothing factor */
  ewmaLambda: number;
  /** Modified Z-score threshold for anomaly classification */
  zThreshold: number;
}

export interface UseStreamSimulatorReturn {
  points: SimulatedPoint[];
  latestScore: number;
  ewmaState: EwmaState;
  /** Imperatively inject a spike — useful for the "Inject Anomaly" button */
  injectSpike: (magnitude?: number) => void;
}

/** Box-Muller transform: generates a standard normal sample */
function gaussianRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  return mean + std * z0;
}

export function useStreamSimulator(
  config: StreamSimulatorConfig,
  isActive: boolean,
): UseStreamSimulatorReturn {
  const { baseline, noiseStd, ewmaLambda, zThreshold } = config;

  const ewmaStateRef = useRef<EwmaState>(initEwmaState(baseline));
  const valuesBufferRef = useRef<number[]>([]);
  const forceInjectRef = useRef<number | null>(null);

  const [points, setPoints] = useState<SimulatedPoint[]>([]);
  const [latestScore, setLatestScore] = useState(0);
  const [ewmaSnapshot, setEwmaSnapshot] = useState<EwmaState>(
    initEwmaState(baseline),
  );

  const tick = useCallback(() => {
    // Generate raw value — either a spike or normal sample
    let rawValue: number;
    if (forceInjectRef.current !== null) {
      rawValue = forceInjectRef.current;
      forceInjectRef.current = null;
    } else if (Math.random() < SPIKE_PROBABILITY) {
      // Random natural spike: 4–7× noise std above baseline
      rawValue = baseline + noiseStd * (4 + Math.random() * 3);
    } else {
      rawValue = gaussianRandom(baseline, noiseStd);
    }

    // Advance EWMA
    const nextEwma = detectEwma(rawValue, ewmaStateRef.current, ewmaLambda);
    ewmaStateRef.current = nextEwma;

    // Update rolling value buffer for Z-score
    valuesBufferRef.current = [...valuesBufferRef.current.slice(-119), rawValue];
    const score = computeModifiedZScore(valuesBufferRef.current);
    const anomalyFlag = isAnomaly(score, zThreshold);

    const std = Math.sqrt(Math.max(nextEwma.variance, 0));
    const newPoint: SimulatedPoint = {
      ts: Date.now(),
      value: parseFloat(rawValue.toFixed(2)),
      ewma: parseFloat(nextEwma.mean.toFixed(2)),
      upperBand: parseFloat((nextEwma.mean + 3 * std).toFixed(2)),
      lowerBand: parseFloat((nextEwma.mean - 3 * std).toFixed(2)),
      score: parseFloat(score.toFixed(3)),
      isAnomaly: anomalyFlag,
    };

    setPoints((prev) => {
      const next = [...prev, newPoint];
      return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
    });
    setLatestScore(score);
    setEwmaSnapshot({ ...nextEwma });
  }, [baseline, noiseStd, ewmaLambda, zThreshold]);

  useEffect(() => {
    if (!isActive) return;
    // Fire an immediate tick on activation so chart is not blank
    tick();
    const id = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isActive, tick]);

  const injectSpike = useCallback(
    (magnitude: number = 6) => {
      forceInjectRef.current = baseline + noiseStd * magnitude;
    },
    [baseline, noiseStd],
  );

  return { points, latestScore, ewmaState: ewmaSnapshot, injectSpike };
}
