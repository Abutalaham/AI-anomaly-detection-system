/**
 * useStreamStats — derives summary statistics from an array of Reading values.
 *
 * Memoised: only recomputes when the readings array reference changes.
 * Delegates pure math to lib/anomaly.computeStats.
 */

import { useMemo } from 'react';
import { computeStats, type StreamStats } from '@/lib/anomaly';
import type { Reading } from '@/types/database.types';

export function useStreamStats(readings: Reading[]): StreamStats {
  return useMemo(
    () => computeStats(readings.map((r) => r.value)),
    [readings],
  );
}
