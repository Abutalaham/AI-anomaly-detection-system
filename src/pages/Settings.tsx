import { useState, type FC } from 'react';
import { SlidersHorizontal, Beaker, Sparkles } from 'lucide-react';
import { CanvasCustomizer } from '@/components/motion/CanvasCustomizer';
import { GravityFieldSwitch } from '@/components/motion/GravityFieldSwitch';
import { RippleButton } from '@/components/motion/RippleButton';
import { AsyncButton } from '@/components/motion/AsyncButton';
import { AnimatedTabs } from '@/components/motion/AnimatedTabs';
import { TiltCard } from '@/components/motion/TiltCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Settings: FC = () => {
  const [activeTab, setActiveTab] = useState<'customizer' | 'lab'>('customizer');

  // Simulated promise for testing AsyncButton in Interface Lab
  const simulateAsyncOperation = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Randomly simulate occasional failure to verify retry state
        if (Math.random() > 0.3) {
          resolve({ status: 'ok', latencyMs: 24 });
        } else {
          reject(new Error('Simulated network jitter on telemetry gateway'));
        }
      }, 1200);
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Settings & Interface Lab
          </h1>
          <p className="text-xs text-muted-foreground">
            Fine-tune interactive particle constellations, 3D spatial engines, and motion ergonomics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Primary Sub-Navigation Tabs */}
      <div role="tablist" aria-label="Settings Categories" className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'customizer'}
          onClick={() => setActiveTab('customizer')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activeTab === 'customizer'
              ? 'bg-secondary text-accent-cyan shadow-sm border border-accent-cyan/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Canvas Customizer</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'lab'}
          onClick={() => setActiveTab('lab')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activeTab === 'lab'
              ? 'bg-secondary text-accent-purple shadow-sm border border-accent-purple/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Beaker className="w-3.5 h-3.5" />
          <span>Interface Lab</span>
        </button>
      </div>

      {/* Tab 1: Canvas Customizer & 3D Visual Modes */}
      {activeTab === 'customizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50 duration-200">
          <CanvasCustomizer />

          {/* 3D Visual Modes Panel */}
          <section aria-label="3D Visual Architecture Modes" className="glass-panel p-6 rounded-2xl border border-border space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="w-4 h-4 text-accent-purple" />
              <h2 className="text-base font-bold text-foreground">3D Visual Engine Mode</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Select an engine to re-calibrate spatial perspective and shader translucency across all cards.
            </p>

            <div className="space-y-4 pt-2">
              <TiltCard
                id="quantum"
                title="Quantum Engine"
                copy="Simulating multi-layered spatial perspective depth with hardware-accelerated transformation calculations."
                footerTag="Interactive Tilt"
              />

              <TiltCard
                id="glassmorphism"
                title="3D Glassmorphism"
                copy="Blending translucent frosted glass shaders with dynamic light dispersion coordinates and specular sheen."
                footerTag="Perspective Depth"
              />

              <TiltCard
                id="kinetic"
                title="Kinetic Motion"
                copy="Smooth easing curves calibrated to sub-millisecond mouse movement events for realistic tactile response."
                footerTag="Gyro Simulation"
              />
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Interface Lab */}
      {activeTab === 'lab' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gravity Field Switch Lab Section */}
            <section aria-label="Gravity Field Ergonomics" className="glass-panel p-6 rounded-2xl border border-border space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">Gravity Field Switch</h2>
                <p className="text-xs text-muted-foreground">
                  Accessible toggle with spring thumb announcing mode changes via toast
                </p>
              </div>
              <GravityFieldSwitch />
            </section>

            {/* Ripple Buttons Lab Section */}
            <section aria-label="Ripple Buttons" className="glass-panel p-6 rounded-2xl border border-border space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">Ripple Buttons</h2>
                <p className="text-xs text-muted-foreground">
                  Position-aware radial shockwave ripple on click / centered on keyboard activation
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <RippleButton variant="cyan">
                  <span>Cyan Ripple</span>
                </RippleButton>
                <RippleButton variant="purple">
                  <span>Purple Ripple</span>
                </RippleButton>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Async Button Lab Section */}
            <section aria-label="Promise Driven Async Button" className="glass-panel p-6 rounded-2xl border border-border space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">Async Button</h2>
                <p className="text-xs text-muted-foreground">
                  Driven by real promises with spinner loading, toast notifications, and retry states
                </p>
              </div>
              <div className="pt-2">
                <AsyncButton
                  action={simulateAsyncOperation}
                  successMessage="Telemetry batch synchronized to buffer"
                  errorMessage="Failed to synchronize batch"
                >
                  Dispatch Telemetry Batch
                </AsyncButton>
              </div>
            </section>

            {/* Animated Tabs Lab Section */}
            <section aria-label="Accessible Animated Tabs" className="glass-panel p-6 rounded-2xl border border-border space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">Animated Tabs</h2>
                <p className="text-xs text-muted-foreground">
                  Arrow-key navigation, ARIA landmarks, animated indicator, and structured spec panels
                </p>
              </div>
              <AnimatedTabs />
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
