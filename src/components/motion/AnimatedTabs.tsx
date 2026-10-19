import React, { useState, useRef, type FC, type KeyboardEvent } from 'react';
import { Palette, Gauge, Eye } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: {
    heading: string;
    description: string;
    specs: string[];
  };
}

const TABS: Tab[] = [
  {
    id: 'tokens',
    label: 'Design Tokens',
    icon: Palette,
    content: {
      heading: 'Strict Variable Architecture',
      description: 'Zero hardcoded hex values in components. All colors are dynamically derived from tokens.css with deep-navy dark mode defaults.',
      specs: ['8px Grid System', 'Dynamic Specular Glassmorphism', 'AA WCAG Contrast Passed'],
    },
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Gauge,
    content: {
      heading: 'Optimized 60 FPS Engine',
      description: 'Spatial-hash grid algorithm reduces neighbor searches to O(N). Tab-visibility observer automatically pauses unrendered rAF cycles.',
      specs: ['DPR capped at 2.0', 'Composite-only transforms', 'rAF-throttled pointer listeners'],
    },
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: Eye,
    content: {
      heading: 'WCAG & Reduced Motion Compliant',
      description: 'Full keyboard navigation with arrow keys, semantic HTML5 landmarks, visible high-contrast focus rings, and aria-live status regions.',
      specs: ['useMotionPolicy() respect', 'Skip to content landmark', 'Zero layout shift on load'],
    },
  },
];

export const AnimatedTabs: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tokens');
  const tabListRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = TABS[nextIndex]!;
      setActiveTab(nextTab.id);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0]!;

  return (
    <div className="space-y-4">
      {/* Tab Navigation with Arrow Keys & Aria */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Interface Lab Specifications"
        className="flex items-center gap-2 p-1.5 bg-secondary/80 rounded-xl border border-border"
      >
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-accent-cyan' : ''}`} />
              <span>{tab.label}</span>
              {isSelected && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-cyan rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`panel-${currentTab.id}`}
        aria-labelledby={`tab-${currentTab.id}`}
        className="glass-panel p-6 rounded-xl space-y-4 animate-in fade-in-50 duration-200"
      >
        <div className="space-y-1">
          <h4 className="text-base font-bold text-foreground">{currentTab.content.heading}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentTab.content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/50">
          {currentTab.content.specs.map((spec) => (
            <div
              key={spec}
              className="px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-[11px] font-mono text-foreground flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
              <span>{spec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
