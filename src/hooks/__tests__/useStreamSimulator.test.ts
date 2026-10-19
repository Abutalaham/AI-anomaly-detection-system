import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreamSimulator } from '../useStreamSimulator';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

const DEFAULT_CONFIG = {
  baseline: 100,
  noiseStd: 10,
  ewmaLambda: 0.2,
  zThreshold: 3.0,
};

// Wrap in MemoryRouter because child hooks use useLocation via useMotionPolicy
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MemoryRouter, null, children);

describe('useStreamSimulator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with an empty points array when isActive=false', () => {
    const { result } = renderHook(
      () => useStreamSimulator(DEFAULT_CONFIG, false),
      { wrapper },
    );
    expect(result.current.points).toHaveLength(0);
  });

  it('accumulates points on each tick when isActive=true', async () => {
    const { result } = renderHook(
      () => useStreamSimulator(DEFAULT_CONFIG, true),
      { wrapper },
    );

    // Advance 2 seconds — hook fires an immediate tick on mount + 2 interval ticks
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.points.length).toBeGreaterThan(0);
  });

  it('stops accumulating new points when paused', async () => {
    const { result, rerender } = renderHook(
      ({ active }: { active: boolean }) =>
        useStreamSimulator(DEFAULT_CONFIG, active),
      { wrapper, initialProps: { active: true } },
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    const countWhileActive = result.current.points.length;
    expect(countWhileActive).toBeGreaterThan(0);

    // Pause
    rerender({ active: false });

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Should not have grown
    expect(result.current.points.length).toBe(countWhileActive);
  });

  it('injectSpike imperatively sets a forced value on the next tick', async () => {
    const { result } = renderHook(
      () => useStreamSimulator(DEFAULT_CONFIG, true),
      { wrapper },
    );

    // Let the hook settle first
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Inject a large spike (10× noise std above baseline)
    act(() => {
      result.current.injectSpike(10);
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    const lastPoint = result.current.points[result.current.points.length - 1];
    // Assert point exists, then check spike magnitude
    expect(lastPoint).toBeDefined();
    expect(lastPoint!.value).toBeGreaterThan(DEFAULT_CONFIG.baseline + 50);
  });
});
