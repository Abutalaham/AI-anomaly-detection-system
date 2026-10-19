import { type FC } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight, BellRing, Sparkles } from 'lucide-react';
import { GlassCta } from '@/components/motion/GlassCta';
import { TiltCard } from '@/components/motion/TiltCard';
import { ROUTES } from '@/constants';

export const Landing: FC = () => {
  const navigate = useNavigate();

  return (
    <article className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-20 text-center max-w-6xl mx-auto space-y-16">
      {/* Hero Header Section */}
      <section aria-label="Hero Section" className="flex flex-col items-center max-w-4xl space-y-6">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono">
          <Zap className="w-3.5 h-3.5" />
          <span>Real-Time Anomaly Detection Engine</span>
        </div>

        {/* Hero Headline (Exact required copy from Section 1) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Sentinel watches your live data, spots what's abnormal in{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink">
            seconds
          </span>
          , and tells you why.
        </h1>

        {/* Value Proposition Description */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          High-throughput statistical anomaly detection paired with instant AI root-cause diagnosis.
          Built for mission-critical engineering pipelines.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <GlassCta
            label="Get started"
            onActivate={() => navigate(ROUTES.AUTH)}
          />
          <Link
            to={ROUTES.DASHBOARD}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card/60 text-foreground font-semibold text-sm hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>Explore Live Demo</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </section>

      {/* Live Mini Animated Chart Telemetry Preview */}
      <section aria-label="Live Telemetry Preview" className="w-full max-w-4xl">
        <div className="glass-panel rounded-2xl p-6 border border-border relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-border/50 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-ping" />
              <span className="font-mono font-semibold text-foreground">
                LIVE STREAM: Server Latency (ms)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span className="text-threat font-bold flex items-center gap-1">
                <BellRing className="w-3.5 h-3.5" /> Anomaly Triggered (+4.8σ)
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Modified Z-Score + EWMA</span>
            </div>
          </div>

          {/* Simulated Waveform SVG */}
          <div className="h-44 w-full relative flex items-center justify-center pt-4">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 800 140"
              preserveAspectRatio="none"
              aria-label="Simulated Telemetry Waveform"
            >
              <defs>
                <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-cyan)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-accent-cyan)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-purple)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--color-accent-purple)" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Confidence Band (Holt prediction cone) */}
              <path
                d="M 0,70 Q 200,60 400,65 T 600,60 L 800,45 L 800,95 L 600,85 T 400,80 Q 200,85 0,70 Z"
                fill="url(#confidenceBand)"
              />

              {/* Base Waveform with Spike Anomaly at x=620 */}
              <path
                d="M 0,75 Q 80,60 160,70 T 320,68 T 480,72 L 580,70 L 620,15 L 650,75 L 800,70"
                fill="none"
                stroke="var(--color-accent-cyan)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Shaded Area Beneath */}
              <path
                d="M 0,75 Q 80,60 160,70 T 320,68 T 480,72 L 580,70 L 620,15 L 650,75 L 800,70 L 800,140 L 0,140 Z"
                fill="url(#streamGrad)"
              />

              {/* Anomaly Marker Circle & Pulsing Target */}
              <circle cx="620" cy="15" r="5" fill="var(--color-threat)" />
              <circle
                cx="620"
                cy="15"
                r="12"
                fill="none"
                stroke="var(--color-threat)"
                strokeWidth="1.5"
                className="animate-ping"
              />

              {/* Callout Tag */}
              <g transform="translate(635, 10)">
                <rect width="135" height="26" rx="6" fill="var(--color-card)" stroke="var(--color-threat)" strokeWidth="1" />
                <text x="8" y="17" fill="var(--color-threat)" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  SPIKE DETECTED
                </text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Three TiltCards with EXACT Required Copy from Section 6.4 */}
      <section aria-label="3D Visual Architecture Modes" className="w-full space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE VISUAL ENGINES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Experience Spatial Depth & Tactile Feedback
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Click any engine card below to switch the real-time perspective and shader modes across the application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1: Quantum Engine */}
          <TiltCard
            id="quantum"
            title="Quantum Engine"
            copy="Simulating multi-layered spatial perspective depth with hardware-accelerated transformation calculations."
            footerTag="Interactive Tilt"
          />

          {/* Card 2: 3D Glassmorphism */}
          <TiltCard
            id="glassmorphism"
            title="3D Glassmorphism"
            copy="Blending translucent frosted glass shaders with dynamic light dispersion coordinates and specular sheen."
            footerTag="Perspective Depth"
          />

          {/* Card 3: Kinetic Motion */}
          <TiltCard
            id="kinetic"
            title="Kinetic Motion"
            copy="Smooth easing curves calibrated to sub-millisecond mouse movement events for realistic tactile response."
            footerTag="Gyro Simulation"
          />
        </div>
      </section>
    </article>
  );
};
