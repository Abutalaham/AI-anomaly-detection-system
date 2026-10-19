import React, { useState } from 'react';
import { CheckCircle2, Bot, Sparkles, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface AlertItem {
  id: string;
  streamName: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  score: number;
  explanation: string;
  source: 'ai' | 'template';
  status: 'open' | 'acknowledged' | 'resolved';
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    streamName: 'Server Latency (ms)',
    severity: 'critical',
    type: 'Spike Anomaly',
    score: 4.8,
    explanation: 'Value is 4.8σ above the 5-minute rolling median; pattern matches an acute server thread stall.',
    source: 'ai',
    status: 'open',
  },
  {
    id: 'alt-2',
    streamName: 'Factory Vibration Sensor (mm/s)',
    severity: 'warning',
    type: 'Variance Burst',
    score: 2.9,
    explanation: 'Rolling EWMA variance breached 2.5σ upper threshold for consecutive 12 samples.',
    source: 'template',
    status: 'open',
  },
];

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a))
    );
    toast.success('Alert Acknowledged', {
      description: `Alert #${id} marked as acknowledged.`,
    });
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a))
    );
    toast.success('Alert Resolved', {
      description: `Alert #${id} marked as resolved.`,
    });
  };

  const cycleFilter = () => {
    const cycle: Record<string, 'all' | 'critical' | 'warning' | 'info'> = {
      all: 'critical',
      critical: 'warning',
      warning: 'info',
      info: 'all',
    };
    setSeverityFilter((prev) => cycle[prev] ?? 'all');
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Security & Anomaly Alerts
          </h1>
          <p className="text-xs text-muted-foreground">
            Deduplicated, severity-ranked incidents with automated AI root-cause diagnosis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="filter-severity-btn"
            onClick={cycleFilter}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring capitalize"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter: {severityFilter}</span>
          </button>
        </div>
      </header>

      {/* Alert Feed */}
      <section aria-label="Incident Alert Feed" className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center text-muted-foreground text-sm font-mono">
            No {severityFilter} alerts found.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <article
              key={alert.id}
              className={`glass-panel p-5 rounded-xl border-l-4 transition-all ${
                alert.severity === 'critical'
                  ? 'border-l-threat'
                  : alert.severity === 'warning'
                  ? 'border-l-warning'
                  : 'border-l-accent-cyan'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                        alert.severity === 'critical'
                          ? 'bg-threat/10 text-threat border border-threat/20'
                          : 'bg-warning/10 text-warning border border-warning/20'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {alert.type}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      • {alert.streamName}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      (Score: {alert.score})
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 bg-secondary/40 p-3 rounded-lg border border-border">
                    {alert.explanation}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="inline-flex items-center gap-1">
                      {alert.source === 'ai' ? (
                        <>
                          <Sparkles className="w-3 h-3 text-accent-cyan" />
                          <span>Gemini AI Diagnosis</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-muted-foreground" />
                          <span>Deterministic Template</span>
                        </>
                      )}
                    </span>
                    <span>•</span>
                    <span className="capitalize">Status: {alert.status}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleResolve(alert.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};
