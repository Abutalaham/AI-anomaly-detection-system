/**
 * Pure anomaly detection algorithms for Sentinel.
 * Why MAD-based Z-score: it is far more robust to outlier contamination than
 * the classical mean/std approach — outliers inflate both mean and std,
 * masking themselves. Median and MAD are resistant to exactly that.
 *
 * All functions are stateless and return new values; callers manage state.
 */

export interface EwmaState {
  /** Exponentially weighted moving average of the value series */
  mean: number;
  /** EWMA of squared deviations — used as running variance estimate */
  variance: number;
}

export interface DetectionResult {
  score: number; // Modified Z-score (positive = above baseline)
  isAnomaly: boolean;
  ewmaState: EwmaState;
}

// ─── Modified Z-Score (MAD-based) ────────────────────────────────────────────

/**
 * Compute the Modified Z-Score for the latest value using the Median
 * Absolute Deviation of the supplied window.
 *
 * Reference: Iglewicz & Hoaglin (1993): "How to Detect and Handle Outliers".
 * The constant 0.6745 makes MAD equivalent to std for normally distributed data.
 *
 * @returns absolute modified z-score (≥0). Threshold is typically 3.5.
 */
export function computeModifiedZScore(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const median = computeMedian(sorted);

  const absoluteDeviations = sorted.map((v) => Math.abs(v - median));
  const mad = computeMedian([...absoluteDeviations].sort((a, b) => a - b));

  // values.length >= 2 is guaranteed by the guard at the top
  const latestValue = values[values.length - 1] as number;

  if (mad === 0) {
    // MAD=0 means all values share the same median (constant background).
    // Fall back to a population std-based Z-score so we still catch spikes
    // that pierce an otherwise flat baseline (e.g. 59×100 then 400).
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance);
    return std === 0 ? 0 : Math.abs((latestValue - mean) / std);
  }

  return Math.abs((0.6745 * (latestValue - median)) / mad);
}

/** Median of a pre-sorted array (must be non-empty). */
function computeMedian(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid] as number;
  }
  return ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
}

// ─── EWMA State Machine ───────────────────────────────────────────────────────

/**
 * Advance the EWMA state machine by one tick.
 *
 * Why EWMA: it gives exponentially more weight to recent samples without
 * storing the full window, making it O(1) in memory — ideal for streaming.
 *
 * @param value   New observed data point
 * @param state   Previous EWMA state (pass `initEwmaState(value)` on first call)
 * @param lambda  Smoothing factor in (0, 1). Higher = more reactive.
 */
export function detectEwma(
  value: number,
  state: EwmaState,
  lambda: number,
): EwmaState {
  const clampedLambda = Math.min(Math.max(lambda, 0.01), 0.99);
  const newMean = clampedLambda * value + (1 - clampedLambda) * state.mean;
  const diff = value - state.mean;
  const newVariance =
    clampedLambda * diff * diff + (1 - clampedLambda) * state.variance;
  return { mean: newMean, variance: newVariance };
}

/** Seed the EWMA state for the very first observation. */
export function initEwmaState(firstValue: number): EwmaState {
  return { mean: firstValue, variance: 0 };
}

// ─── Threshold Gate ───────────────────────────────────────────────────────────

/** Returns true if the score exceeds the detector's configured threshold. */
export function isAnomaly(score: number, threshold: number): boolean {
  return score > threshold;
}

// ─── Stream Statistics ────────────────────────────────────────────────────────

export interface StreamStats {
  mean: number;
  std: number;
  p95: number;
  min: number;
  max: number;
  count: number;
}

/** Compute summary statistics from an array of readings. O(n log n) for p95. */
export function computeStats(values: number[]): StreamStats {
  if (values.length === 0) {
    return { mean: 0, std: 0, p95: 0, min: 0, max: 0, count: 0 };
  }

  const count = values.length;
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / count;

  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / count;
  const std = Math.sqrt(variance);

  const sorted = [...values].sort((a, b) => a - b);
  const p95Index = Math.floor(count * 0.95);
  const p95 = sorted[Math.min(p95Index, count - 1)] as number;

  return { mean, std, p95, min: sorted[0] as number, max: sorted[count - 1] as number, count };
}
