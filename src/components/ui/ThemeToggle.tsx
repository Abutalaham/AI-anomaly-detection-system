import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useUIStore, ThemeMode } from '@/stores/ui.store';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useUIStore();
  const motion = useMotionPolicy();

  const cycleTheme = () => {
    const next: Record<ThemeMode, ThemeMode> = {
      dark: 'light',
      light: 'system',
      system: 'dark',
    };
    setTheme(next[theme]);
  };

  return (
    <button
      onClick={cycleTheme}
      type="button"
      className="p-2 rounded-md border border-border text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors inline-flex items-center gap-2 text-sm"
      aria-label={`Current theme is ${theme}. Click to switch theme.`}
      title={`Theme: ${theme}`}
    >
      <span className={`inline-flex items-center justify-center ${motion.isReduced ? '' : 'transition-transform duration-200'}`}>
        {theme === 'dark' && <Moon className="w-4 h-4 text-accent-cyan" />}
        {theme === 'light' && <Sun className="w-4 h-4 text-warning" />}
        {theme === 'system' && <Laptop className="w-4 h-4 text-muted-foreground" />}
      </span>
      <span className="capitalize font-mono text-xs">{theme}</span>
    </button>
  );
};
