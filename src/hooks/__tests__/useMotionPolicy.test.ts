import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useMotionPolicy } from '../useMotionPolicy';
import { useUIStore } from '@/stores/ui.store';

// Helper wrapper to provide MemoryRouter context to useLocation
const createWrapper = (initialRoute: string) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      MemoryRouter,
      { initialEntries: [initialRoute] },
      children
    );
  };
};

describe('useMotionPolicy', () => {
  beforeEach(() => {
    useUIStore.setState({ reduceMotion: false });
  });

  it('yields Tier 1 (full motion) on the public landing page', () => {
    const { result } = renderHook(() => useMotionPolicy(), {
      wrapper: createWrapper('/'),
    });

    expect(result.current.tier).toBe('tier1');
    expect(result.current.maxParticles).toBeGreaterThanOrEqual(50);
    expect(result.current.isReduced).toBe(false);
  });

  it('yields Tier 2 (restrained motion) on the dashboard route', () => {
    const { result } = renderHook(() => useMotionPolicy(), {
      wrapper: createWrapper('/dashboard'),
    });

    expect(result.current.tier).toBe('tier2');
    expect(result.current.allowFloat).toBe(false);
    expect(result.current.isReduced).toBe(false);
  });

  it('switches to Tier 3 when user toggles reduceMotion setting in UI store', () => {
    useUIStore.setState({ reduceMotion: true });

    const { result } = renderHook(() => useMotionPolicy(), {
      wrapper: createWrapper('/'),
    });

    expect(result.current.tier).toBe('tier3');
    expect(result.current.allowTilt).toBe(false);
    expect(result.current.maxParticles).toBe(0);
    expect(result.current.isReduced).toBe(true);
  });
});
