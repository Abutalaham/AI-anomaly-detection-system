import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sliders, Database, BarChart3, AlertCircle } from 'lucide-react';
import { ROUTES, DEMO_STREAMS } from '@/constants';
import { useStreamData } from '@/features/streams/hooks/useStreamData';
import { useStreamStats } from '@/features/streams/hooks/useStreamStats';
import { AnomalyChart } from '@/components/charts/AnomalyChart';
import type { StreamConfig } from '@/types/database.types';

// ─── Threshold slider ─────────────────────────────────────────────────────────

interface ThresholdSliderProps {
  label: string;
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

const ThresholdSlider: React.FC<ThresholdSliderProps> = ({
  label,
  id,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs font-mono">
      <label htmlFor={id} className="text-muted-foreground">
        {label}
      </label>
      <span className="text-accent-cyan font-semibold">
        {value}
        <span className="text-muted-foreground ml-1">{unit}</span>
      </span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-secondary accent-accent-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${label}: ${value} ${unit}`}
    />
    <div
      className="flex justify-between text-[10px] text-muted-foreground/50"
      aria-hidden="true"
    >
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

// ─── Stats table ──────────────────────────────────────────────────────────────

interface StatRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, highlight }) => (
  <tr className="border-b border-border/50 last:border-0">
    <td className="py-2 text-xs text-muted-foreground">{label}</td>
    <td
      className={`py-2 text-xs font-mono text-right ${
        highlight ? 'text-accent-cyan font-semibold' : 'text-foreground'
      }`}
    >
      {value}
    </td>
  </tr>
);

// ─── Mini chart from DB readings ──────────────────────────────────────────────

// Adapts DB Reading[] → SimulatedPoint[] shape for AnomalyChart reuse
const ReadingsMiniChart: React.FC<{
  streamId: string;
  unit: string;
  streamName: string;
}> = ({ streamId, unit, streamName }) => {
  const { readings, isLoading, error, isEmpty } = useStreamData(streamId, 200);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" role="status" aria-live="polite">
        <p className="text-xs text-muted-foreground font-mono animate-pulse">
          Loading historical data…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-2 text-center"
        role="alert"
      >
        <AlertCircle className="w-6 h-6 text-threat" />
        <p className="text-xs text-threat font-mono">
          Failed to load: {error.message}
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
        <Database className="w-6 h-6 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-mono">
          No persisted readings yet.
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          Live simulator data is in-memory only.
        </p>
      </div>
    );
  }

  // Adapt DB Reading to SimulatedPoint shape (chart only needs a subset)
  const points = readings.map((r) => ({
    ts: new Date(r.ts).getTime(),
    value: r.value,
    ewma: r.value, // DB doesn't store EWMA — use raw as fallback
    upperBand: 0,
    lowerBand: 0,
    score: r.score,
    isAnomaly: r.is_anomaly,
  }));

  return <AnomalyChart points={points} unit={unit} streamName={streamName} />;
};

// ─── StreamDetail Page ────────────────────────────────────────────────────────

export const StreamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const stream = DEMO_STREAMS.find((s) => s.id === id);

  // Local editable copy of detector config
  const [config, setConfig] = useState<StreamConfig>(
    stream?.config ?? {
      window: 60,
      zThreshold: 3.0,
      ewmaLambda: 0.2,
      cooldownSec: 30,
    },
  );

  // Stats from persisted readings (will show empty state if none exist)
  const { readings } = useStreamData(id ?? '', 200);
  const stats = useStreamStats(readings);

  const hasStats = stats.count > 0;

  const fmt = useMemo(
    () =>
      (v: number, decimals = 2) =>
        `${v.toFixed(decimals)} ${stream?.unit ?? ''}`,
    [stream],
  );

  if (!stream) {
    return (
      <article className="space-y-6">
        <header className="flex items-center gap-4">
          <Link
            to={ROUTES.DASHBOARD}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Stream not found</h1>
        </header>
      </article>
    );
  }

  return (
    <article className="space-y-6">
      <header className="flex items-center gap-4">
        <Link
          to={ROUTES.DASHBOARD}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {stream.name}{' '}
            <span className="text-base font-mono text-muted-foreground">
              ({stream.unit})
            </span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Detector tuning · rolling history · sensitivity thresholds
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Threshold Sliders ────────────────────────────── */}
        <section
          aria-label="Algorithm Threshold Configuration"
          className="glass-panel p-6 rounded-xl space-y-6"
        >
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border pb-4">
            <Sliders className="w-4 h-4 text-accent-cyan" />
            <span>Algorithm Thresholds</span>
          </div>

          <ThresholdSlider
            id="z-threshold"
            label="Modified Z-Score Threshold (σ)"
            value={config.zThreshold}
            min={1.5}
            max={6}
            step={0.1}
            unit="σ"
            onChange={(v) => setConfig((c) => ({ ...c, zThreshold: v }))}
          />

          <ThresholdSlider
            id="ewma-lambda"
            label="EWMA Lambda (smoothing factor)"
            value={config.ewmaLambda}
            min={0.05}
            max={0.95}
            step={0.05}
            unit=""
            onChange={(v) => setConfig((c) => ({ ...c, ewmaLambda: v }))}
          />

          <ThresholdSlider
            id="window-size"
            label="Rolling Window Size"
            value={config.window}
            min={10}
            max={300}
            step={10}
            unit="pts"
            onChange={(v) => setConfig((c) => ({ ...c, window: v }))}
          />

          <ThresholdSlider
            id="cooldown-sec"
            label="Alert Cooldown"
            value={config.cooldownSec}
            min={5}
            max={120}
            step={5}
            unit="s"
            onChange={(v) => setConfig((c) => ({ ...c, cooldownSec: v }))}
          />

          <p className="text-[10px] text-muted-foreground/60 font-mono">
            Changes are local-only and reset on navigation. Persist via Settings.
          </p>
        </section>

        {/* ── Right: Stats + Mini Chart ──────────────────────────── */}
        <section
          aria-label="Historical Statistics and Chart"
          className="glass-panel p-6 rounded-xl space-y-6"
        >
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border pb-4">
            <Database className="w-4 h-4 text-accent-purple" />
            <span>Telemetry Statistics</span>
          </div>

          {/* Stats table */}
          <table className="w-full" aria-label={`Statistics for ${stream.name}`}>
            <tbody>
              <StatRow
                label="Readings (buffer)"
                value={hasStats ? String(stats.count) : '—'}
              />
              <StatRow
                label="Mean"
                value={hasStats ? fmt(stats.mean) : '—'}
                highlight
              />
              <StatRow
                label="Std Dev (σ)"
                value={hasStats ? fmt(stats.std) : '—'}
              />
              <StatRow
                label="p95"
                value={hasStats ? fmt(stats.p95) : '—'}
              />
              <StatRow
                label="Min"
                value={hasStats ? fmt(stats.min) : '—'}
              />
              <StatRow
                label="Max"
                value={hasStats ? fmt(stats.max) : '—'}
                highlight
              />
            </tbody>
          </table>

          {/* Mini historical chart */}
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-3">
              <BarChart3 className="w-4 h-4 text-accent-pink" />
              <span>Historical Chart (last 200 pts)</span>
            </div>
            <div className="h-48 w-full">
              <ReadingsMiniChart
                streamId={stream.id}
                unit={stream.unit}
                streamName={stream.name}
              />
            </div>
          </div>
        </section>
      </div>
    </article>
  );
};
