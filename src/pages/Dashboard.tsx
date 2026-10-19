import React, { useState, useCallback, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  Radio,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_STREAMS } from '@/constants';
import { useUIStore } from '@/stores/ui.store';
import { useStreamSimulator } from '@/hooks/useStreamSimulator';
import { AnomalyChart } from '@/components/charts/AnomalyChart';
import { AnomalyScoreMeter } from '@/components/charts/AnomalyScoreMeter';

// ─── Stream config mapper ─────────────────────────────────────────────────────

// Baseline and noiseStd are per-kind values that feel realistic
const STREAM_SIM_PARAMS: Record<string, { baseline: number; noiseStd: number }> = {
  'demo-stream-latency':   { baseline: 85,   noiseStd: 12 },
  'demo-stream-vibration': { baseline: 4.5,  noiseStd: 0.8 },
  'demo-stream-payment':   { baseline: 3200, noiseStd: 450 },
};

// ─── Per-stream simulator hook ────────────────────────────────────────────────

interface StreamSimProps {
  streamId: string;
  isActive: boolean;
}

/** Isolated child so each stream's simulator has its own hook lifecycle. */
const StreamSimulator: React.FC<StreamSimProps & {
  onUpdate: (score: number, injectSpike: (m?: number) => void) => void;
  children: (points: ReturnType<typeof useStreamSimulator>['points']) => React.ReactNode;
}> = ({ streamId, isActive, onUpdate, children }) => {
  const stream = DEMO_STREAMS.find((s) => s.id === streamId)!;
  const params = STREAM_SIM_PARAMS[streamId] ?? { baseline: 100, noiseStd: 15 };

  const { points, latestScore, injectSpike } = useStreamSimulator(
    {
      baseline: params.baseline,
      noiseStd: params.noiseStd,
      ewmaLambda: stream.config.ewmaLambda,
      zThreshold: stream.config.zThreshold,
    },
    isActive,
  );

  // Propagate score + spike fn to parent without causing parent re-renders
  React.useEffect(() => {
    onUpdate(latestScore, injectSpike);
  }, [latestScore, injectSpike, onUpdate]);

  return <>{children(points)}</>;
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const [selectedStreamId, setSelectedStreamId] = useState<string>(
    DEMO_STREAMS[0].id,
  );
  const [isLiveFeedActive, setIsLiveFeedActive] = useState<boolean>(true);
  const [latestScore, setLatestScore] = useState<number>(0);
  const [injectFn, setInjectFn] = useState<((m?: number) => void) | null>(null);

  const setThreatMode = useUIStore((state) => state.setThreatMode);

  const selectedStream = useMemo(
    () => DEMO_STREAMS.find((s) => s.id === selectedStreamId)!,
    [selectedStreamId],
  );

  const handleUpdate = useCallback(
    (score: number, inject: (m?: number) => void) => {
      setLatestScore(score);
      setInjectFn(() => inject);
    },
    [],
  );

  const handleInjectAnomaly = useCallback(() => {
    injectFn?.(8);
    toast.error('Anomaly Injected: SPIKE', {
      description: `Forcing 8σ spike on ${selectedStream.name}. Detector triggered!`,
    });
    setThreatMode(true);
    setTimeout(() => setThreatMode(false), 6000);
  }, [injectFn, selectedStream.name, setThreatMode]);

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Live Telemetry Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitoring active time-series streams with sub-second statistical
            detection
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Feed Toggle */}
          <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg border border-border">
            <Radio
              className={`w-3.5 h-3.5 ${
                isLiveFeedActive
                  ? 'text-accent-cyan animate-pulse'
                  : 'text-muted-foreground'
              }`}
            />
            <span className="text-xs font-mono">Live Feed</span>
            <button
              type="button"
              role="switch"
              aria-checked={isLiveFeedActive}
              id="live-feed-toggle"
              onClick={() => setIsLiveFeedActive((p) => !p)}
              className={`w-8 h-4 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isLiveFeedActive ? 'bg-accent-cyan' : 'bg-muted'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-background transition-transform ${
                  isLiveFeedActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Anomaly Injection Button */}
          <button
            type="button"
            id="inject-anomaly-btn"
            onClick={handleInjectAnomaly}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-threat text-threat-foreground text-xs font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Inject Anomaly
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section
        aria-label="Key Performance Indicators"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-panel p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Streams</span>
            <Activity className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {DEMO_STREAMS.length}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">
            100% telemetry online
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Open Alerts</span>
            <AlertTriangle className="w-4 h-4 text-threat" />
          </div>
          <div className="text-2xl font-bold font-mono text-threat">1</div>
          <p className="text-[10px] text-threat font-mono">
            Critical spike detected
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Anomalies (24h)</span>
            <TrendingUp className="w-4 h-4 text-accent-purple" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">14</div>
          <p className="text-[10px] text-muted-foreground font-mono">
            98.6% specificity
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Latency p99</span>
            <Clock className="w-4 h-4 text-accent-pink" />
          </div>
          <div className="text-2xl font-bold font-mono text-accent-cyan">
            42 ms
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">
            sub-50ms target ✓
          </p>
        </div>
      </section>

      {/* Sigma Score Meter */}
      <section
        aria-label="Current anomaly sigma score"
        className="glass-panel px-6 py-4 rounded-xl"
      >
        <AnomalyScoreMeter
          score={latestScore}
          threshold={selectedStream.config.zThreshold}
          streamName={selectedStream.name}
        />
      </section>

      {/* Stream Selector & Live Chart */}
      <section
        aria-label="Stream Telemetry Viewport"
        className="glass-panel p-6 rounded-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">
              Stream:
            </span>
            {DEMO_STREAMS.map((s) => (
              <button
                key={s.id}
                id={`stream-tab-${s.id}`}
                type="button"
                role="tab"
                aria-selected={selectedStreamId === s.id}
                onClick={() => setSelectedStreamId(s.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selectedStreamId === s.id
                    ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.name} ({s.unit})
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
            {isLiveFeedActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
                <span>Streaming 1 pt/sec</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span>Feed paused</span>
              </>
            )}
          </div>
        </div>

        {/* Live chart — 320px tall */}
        <div className="h-80 w-full">
          <StreamSimulator
            streamId={selectedStreamId}
            isActive={isLiveFeedActive}
            onUpdate={handleUpdate}
          >
            {(points) => (
              <AnomalyChart
                points={points}
                unit={selectedStream.unit}
                streamName={selectedStream.name}
              />
            )}
          </StreamSimulator>
        </div>
      </section>
    </div>
  );
};
