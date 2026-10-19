/**
 * useStreamData — TanStack Query wrapper for historical readings.
 *
 * Exposes three UI states: loading, error, empty (data=[]).
 * Refetches every 30s in the background to capture new persisted readings.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchLatestReadings } from '../services/stream.service';
import type { Reading } from '@/types/database.types';
import type { AppError } from '@/lib/errors';

const QUERY_KEYS = {
  readings: (streamId: string) => ['stream', streamId, 'readings'] as const,
};

interface UseStreamDataReturn {
  readings: Reading[];
  isLoading: boolean;
  error: AppError | null;
  isEmpty: boolean;
}

export function useStreamData(
  streamId: string,
  limit = 200,
): UseStreamDataReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.readings(streamId),
    queryFn: async () => {
      const result = await fetchLatestReadings(streamId, limit);
      // Surface errors through TanStack Query's error channel
      if (!result.ok) throw result.error;
      return result.data;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
    // Do not throw — let callers handle the error state
    throwOnError: false,
  });

  return {
    readings: data ?? [],
    isLoading,
    error: (error as AppError | null) ?? null,
    isEmpty: !isLoading && !error && (data?.length ?? 0) === 0,
  };
}
