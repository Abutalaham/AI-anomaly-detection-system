/**
 * AnomalyScoreMeter — sigma score progress bar.
 *
 * Colour zones (CSS vars only):
 *   green  (success) : score < 2σ
 *   amber  (warning) : 2σ ≤ score < 3σ
 *   red    (threat)  : score ≥ 3σ
 *
 * The bar is capped at a visual 5σ maximum so extreme outliers do not
 * distort layout, while the label always shows the true value.
 */

import React from 'react';
import { Gauge } from 'lucide-react';

interface AnomalyScoreMeterProps {
  score: number;
  threshold?: number;
  streamName: string;
}

const VISUAL_MAX = 5; // Clamp bar width at 5σ for display

function getZone(score: number): 'normal' | 'warning' | 'threat' {
  if (score >= 3) return 'threat';
  if (score >= 2) return 'warning';
  return 'normal';
}

const ZONE_CLASSES: Record<ReturnType<typeof getZone>, string> = {
  normal: 'bg-success',
  warning: 'bg-warning',
  threat: 'bg-threat',
};

const ZONE_TEXT: Record<ReturnType<typeof getZone>, string> = {
  normal: 'text-success',
  warning: 'text-warning',
  threat: 'text-threat',
};

const ZONE_LABEL: Record<ReturnType<typeof getZone>, string> = {
  normal: 'NORMAL',
  warning: 'ELEVATED',
  threat: 'ANOMALY',
};

export const AnomalyScoreMeter: React.FC<AnomalyScoreMeterProps> = ({
  score,
  threshold = 3.0,
  streamName,
}) => {
  const zone = getZone(score);
  const clampedScore = Math.min(score, VISUAL_MAX);
  const percentage = (clampedScore / VISUAL_MAX) * 100;
  const thresholdPct = (threshold / VISUAL_MAX) * 100;

  return (
    <div
      role="meter"
      aria-label={`Anomaly score for ${streamName}: ${score.toFixed(2)} sigma`}
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={VISUAL_MAX}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Gauge className="w-3.5 h-3.5" />
          <span>Sigma Score</span>
        </div>
        <div className={`flex items-center gap-2 font-semibold ${ZONE_TEXT[zone]}`}>
          <span>{score.toFixed(2)}σ</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border ${
              zone === 'threat'
                ? 'border-threat/30 bg-threat/10'
                : zone === 'warning'
                ? 'border-warning/30 bg-warning/10'
                : 'border-success/30 bg-success/10'
            }`}
          >
            {ZONE_LABEL[zone]}
          </span>
        </div>
      </div>

      {/* Track */}
      <div
        className="relative h-2 w-full rounded-full bg-secondary overflow-hidden"
        aria-hidden="true"
      >
        {/* Filled bar */}
        <div
          className={`h-full rounded-full transition-all duration-300 ${ZONE_CLASSES[zone]}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-muted-foreground/50"
          style={{ left: `${thresholdPct}%` }}
          title={`Alert threshold: ${threshold}σ`}
        />
      </div>

      {/* Axis labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono" aria-hidden="true">
        <span>0σ</span>
        <span>{threshold}σ threshold</span>
        <span>{VISUAL_MAX}σ+</span>
      </div>
    </div>
  );
};
