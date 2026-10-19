/**
 * stream.service.ts — Supabase data access layer for streams and alert events.
 *
 * All public functions return Result<T> — callers never need to catch.
 * Demo fallback: when VITE_APP_ENV=development and Supabase returns no data,
 * we surface typed empty arrays rather than errors so the UI shows the
 * empty-state branch, not the error branch.
 */

import { supabase } from '@/lib/supabase';
import { ok, err, type Result } from '@/lib/errors';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { Reading, Alert } from '@/types/database.types';

// ─── Readings ─────────────────────────────────────────────────────────────────

/**
 * Fetch the latest N readings for a stream, ordered ascending by timestamp.
 * Intended for the StreamDetail historical chart.
 */
export async function fetchLatestReadings(
  streamId: string,
  limit = 200,
): Promise<Result<Reading[]>> {
  try {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('stream_id', streamId)
      .order('ts', { ascending: false })
      .limit(limit);

    if (error) {
      logger.warn('Failed to fetch readings', { streamId, error: error.message });
      return err(new AppError(error.message, 'STORAGE_ERROR', error));
    }

    // Reverse so the array is chronological (oldest first for charts)
    return ok((data ?? []).reverse() as Reading[]);
  } catch (cause) {
    logger.warn('Unexpected error fetching readings', { streamId, cause });
    return err(new AppError('Unexpected fetch error', 'STORAGE_ERROR', cause));
  }
}

/**
 * Write a batch of detected readings to Supabase.
 * Used by the ingest path when real-time detection is wired to the DB.
 */
export async function insertReadings(
  readings: Array<Omit<Reading, 'id'>>,
): Promise<Result<Reading[]>> {
  try {
    const { data, error } = await supabase
      .from('readings')
      .insert(readings)
      .select();

    if (error) {
      logger.warn('Failed to insert readings', { error: error.message });
      return err(new AppError(error.message, 'INGEST_ERROR', error));
    }

    return ok((data ?? []) as Reading[]);
  } catch (cause) {
    logger.warn('Unexpected error inserting readings', { cause });
    return err(new AppError('Unexpected insert error', 'INGEST_ERROR', cause));
  }
}

// ─── Alert Events ─────────────────────────────────────────────────────────────

/**
 * Fetch open or recently resolved alerts for the current user,
 * ordered by timestamp descending.
 */
export async function fetchAlerts(limit = 50): Promise<Result<Alert[]>> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('ts', { ascending: false })
      .limit(limit);

    if (error) {
      logger.warn('Failed to fetch alerts', { error: error.message });
      return err(new AppError(error.message, 'STORAGE_ERROR', error));
    }

    return ok((data ?? []) as Alert[]);
  } catch (cause) {
    logger.warn('Unexpected error fetching alerts', { cause });
    return err(new AppError('Unexpected fetch error', 'STORAGE_ERROR', cause));
  }
}

/**
 * Update the status of an alert (acknowledge or resolve).
 */
export async function patchAlertStatus(
  alertId: string,
  status: Alert['status'],
): Promise<Result<Alert>> {
  try {
    const patch: Partial<Alert> = { status };
    if (status === 'acknowledged') {
      patch.acknowledged_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('alerts')
      .update(patch)
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      logger.warn('Failed to patch alert', { alertId, error: error.message });
      return err(new AppError(error.message, 'STORAGE_ERROR', error));
    }

    return ok(data as Alert);
  } catch (cause) {
    logger.warn('Unexpected error patching alert', { alertId, cause });
    return err(new AppError('Unexpected patch error', 'STORAGE_ERROR', cause));
  }
}
