/**
 * AnomalyChart — real-time Recharts area chart for a single stream.
 *
 * Layers (bottom to top):
 *   1. ReferenceArea  — EWMA confidence band (lowerBand → upperBand)
 *   2. Area           — raw sensor value fill
 *   3. Line           — EWMA forecast (dashed)
 *   4. ReferenceDot   — anomaly markers at flagged points
 *
 * Motion: chart animation is disabled on Tier 3 (prefers-reduced-motion).
 * All colours come exclusively from CSS custom properties via getComputedStyle.
 */

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import type { SimulatedPoint } from '@/hooks/useStreamSimulator';

interface AnomalyChartProps {
  points: SimulatedPoint[];
  unit: string;
  /** Stream display name, used for aria-label */
  streamName: string;
}

interface TooltipPayload {
  value: number;
  name: string;
  payload: SimulatedPoint;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  unit: string;
}> = ({ active, payload, unit }) => {
  if (!active || !payload?.length) return null;
  const point = (payload[0] as TooltipPayload).payload;
  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-panel px-3 py-2 rounded-lg border border-border text-xs font-mono space-y-1 min-w-[160px]"
    >
      <p className="font-semibold text-foreground">
        {new Date(point.ts).toLocaleTimeString()}
      </p>
      <p className="text-foreground">
        Value:{' '}
        <span className={point.isAnomaly ? 'text-threat font-bold' : 'text-accent-cyan'}>
          {point.value} {unit}
        </span>
      </p>
      <p className="text-muted-foreground">
        EWMA: {point.ewma} {unit}
      </p>
      <p className={`font-bold ${point.isAnomaly ? 'text-threat' : 'text-success'}`}>
        σ score: {point.score.toFixed(2)} {point.isAnomaly ? '⚠ ANOMALY' : '✓ Normal'}
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AnomalyChart: React.FC<AnomalyChartProps> = ({
  points,
  unit,
  streamName,
}) => {
  const { isReduced } = useMotionPolicy();

  // Read CSS variables at render time — avoids hard-coding hex in components
  const cssVar = (name: string) =>
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      : '';

  const colors = useMemo(
    () => ({
      cyan: cssVar('--color-accent-cyan') || '#00f2fe',
      purple: cssVar('--color-accent-purple') || '#9d4edd',
      threat: cssVar('--color-threat') || '#ff1e56',
      border: cssVar('--color-border') || '#1e293b',
      muted: cssVar('--color-muted-foreground') || '#94a3b8',
      success: cssVar('--color-success') || '#10b981',
    }),
    // Recompute on theme changes — depend on points as a proxy for re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points.length],
  );

  const anomalyPoints = points.filter((p) => p.isAnomaly);

  // Build the confidence band range for ReferenceArea
  // We only show one band, so we project across the whole x-domain
  const firstTs = points[0]?.ts;
  const lastTs = points[points.length - 1]?.ts;
  const latestPoint = points[points.length - 1];

  if (points.length < 2) {
    return (
      <div
        role="img"
        aria-label={`${streamName} — waiting for data`}
        className="h-full flex items-center justify-center"
      >
        <p className="text-xs text-muted-foreground font-mono animate-pulse">
          Waiting for first readings…
        </p>
      </div>
    );
  }

  return (
    <figure
      role="img"
      aria-label={`${streamName} live anomaly chart — ${points.length} readings`}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={points}
          margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.25} />
              <stop offset="95%" stopColor={colors.cyan} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.border}
            opacity={0.5}
          />

          <XAxis
            dataKey="ts"
            tickFormatter={(ts: number) =>
              new Date(ts).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            }
            tick={{ fontSize: 10, fill: colors.muted, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            tickFormatter={(v: number) => `${v}`}
            tick={{ fontSize: 10, fill: colors.muted, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            width={48}
            unit={` ${unit}`}
          />

          <Tooltip
            content={<CustomTooltip unit={unit} />}
            cursor={{ stroke: colors.purple, strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {/* EWMA confidence band — only show once we have variance data */}
          {latestPoint && latestPoint.upperBand > latestPoint.lowerBand && (
            <ReferenceArea
              x1={firstTs}
              x2={lastTs}
              y1={latestPoint.lowerBand}
              y2={latestPoint.upperBand}
              fill={colors.cyan}
              fillOpacity={0.06}
              stroke={colors.cyan}
              strokeOpacity={0.2}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}

          {/* Raw value area */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.cyan}
            strokeWidth={1.5}
            fill="url(#areaGradient)"
            dot={false}
            isAnimationActive={!isReduced}
            animationDuration={200}
          />

          {/* EWMA forecast line */}
          <Line
            type="monotone"
            dataKey="ewma"
            stroke={colors.purple}
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            isAnimationActive={!isReduced}
            animationDuration={200}
          />

          {/* Anomaly markers */}
          {anomalyPoints.map((p) => (
            <ReferenceDot
              key={p.ts}
              x={p.ts}
              y={p.value}
              r={5}
              fill={colors.threat}
              stroke={colors.threat}
              fillOpacity={0.85}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <figcaption className="sr-only">
        Live time-series chart for {streamName}. {anomalyPoints.length} anomalies
        detected in the last {points.length} readings.
      </figcaption>
    </figure>
  );
};
