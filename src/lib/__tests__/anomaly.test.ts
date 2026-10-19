import { describe, it, expect } from 'vitest';
import {
  computeModifiedZScore,
  detectEwma,
  initEwmaState,
  isAnomaly,
  computeStats,
} from '../anomaly';

describe('computeModifiedZScore', () => {
  it('returns 0 for a single-element array', () => {
    expect(computeModifiedZScore([42])).toBe(0);
  });

  it('returns 0 for an empty array', () => {
    expect(computeModifiedZScore([])).toBe(0);
  });

  it('returns 0 when all values are identical (MAD=0, std=0 → both branches return 0)', () => {
    expect(computeModifiedZScore([5, 5, 5, 5, 5])).toBe(0);
  });

  it('returns a high score for a clear spike', () => {
    // Normal baseline around 100ms, spike to 400
    const baseline = Array.from({ length: 59 }, () => 100);
    const readings = [...baseline, 400];
    const score = computeModifiedZScore(readings);
    // Should be well above the 3.5 anomaly threshold
    expect(score).toBeGreaterThan(3.5);
  });

  it('returns a low score for a value within the normal range', () => {
    const window = [98, 102, 100, 101, 99, 100, 103, 97, 100, 100];
    const score = computeModifiedZScore(window);
    expect(score).toBeLessThan(2.0);
  });
});

describe('detectEwma', () => {
  it('initialises state with the first value', () => {
    const state = initEwmaState(50);
    expect(state.mean).toBe(50);
    expect(state.variance).toBe(0);
  });

  it('moves EWMA mean towards the new value on each tick', () => {
    let state = initEwmaState(100);
    // Drive it downward
    state = detectEwma(0, state, 0.5);
    expect(state.mean).toBeLessThan(100);
    state = detectEwma(0, state, 0.5);
    expect(state.mean).toBeLessThan(50);
  });

  it('clamps lambda to valid range', () => {
    const state = initEwmaState(100);
    // lambda=2 (>1) should not blow up
    const next = detectEwma(200, state, 2);
    expect(Number.isFinite(next.mean)).toBe(true);
  });

  it('builds variance from consistent deviation', () => {
    let state = initEwmaState(100);
    // All observations are 10 units away
    for (let i = 0; i < 20; i++) {
      state = detectEwma(i % 2 === 0 ? 110 : 90, state, 0.3);
    }
    expect(state.variance).toBeGreaterThan(0);
  });
});

describe('isAnomaly', () => {
  it('returns true when score exceeds threshold', () => {
    expect(isAnomaly(4.0, 3.5)).toBe(true);
  });

  it('returns false when score is at or below threshold', () => {
    expect(isAnomaly(3.5, 3.5)).toBe(false);
    expect(isAnomaly(2.0, 3.5)).toBe(false);
  });
});

describe('computeStats', () => {
  it('returns zeros for empty input', () => {
    const stats = computeStats([]);
    expect(stats.mean).toBe(0);
    expect(stats.count).toBe(0);
  });

  it('computes correct mean and min/max', () => {
    const stats = computeStats([10, 20, 30]);
    expect(stats.mean).toBeCloseTo(20);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(30);
  });

  it('computes p95 correctly for a small sorted set', () => {
    // 20 values 1..20; p95 index = floor(20*0.95)=19 → value 20
    const values = Array.from({ length: 20 }, (_, i) => i + 1);
    const stats = computeStats(values);
    expect(stats.p95).toBe(20);
  });
});
