/**
 * Formatting utility functions for timestamps, currencies, latencies, and scores.
 */

export function formatTimestamp(ts: number | string | Date): string {
  const date = typeof ts === 'object' ? ts : new Date(ts);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatDateTime(ts: number | string | Date): string {
  const date = typeof ts === 'object' ? ts : new Date(ts);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatNumber(val: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatLatency(ms: number): string {
  return `${Math.round(ms)} ms`;
}
