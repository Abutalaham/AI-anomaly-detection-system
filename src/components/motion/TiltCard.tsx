import { type FC } from 'react';
import { useTilt } from '@/hooks/useTilt';
import { useVisualModeStore, type VisualMode } from '@/stores/visual-mode.store';
import { Sparkles, Layers, Activity } from 'lucide-react';

interface TiltCardProps {
  id: VisualMode;
  title: string;
  copy: string;
  footerTag: string;
  onClick?: () => void;
  className?: string;
}

export const TiltCard: FC<TiltCardProps> = ({
  id,
  title,
  copy,
  footerTag,
  onClick,
  className = '',
}) => {
  const { ref, isHovered } = useTilt<HTMLDivElement>();
  const { visualMode, setVisualMode } = useVisualModeStore();
  const isSelected = visualMode === id;

  const handleClick = () => {
    setVisualMode(id);
    if (onClick) onClick();
  };

  const getIcon = () => {
    switch (id) {
      case 'quantum':
        return <Sparkles className="w-5 h-5 text-accent-cyan" />;
      case 'glassmorphism':
        return <Layers className="w-5 h-5 text-accent-purple" />;
      case 'kinetic':
        return <Activity className="w-5 h-5 text-accent-pink" />;
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`${title} mode: ${copy}`}
      className={`glass-panel relative rounded-2xl p-6 text-left cursor-pointer transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none overflow-hidden ${
        isSelected
          ? 'border-accent-cyan/80 ring-1 ring-accent-cyan/40 shadow-lg shadow-accent-cyan/10'
          : 'hover:border-border/80'
      } ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Dynamic Specular Sheen (Radial Pointer Glow tracked by --mx, --my) */}
      <div
        className={`pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), var(--glass-specular), transparent 80%)`,
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4" style={{ transform: 'translateZ(24px)' }}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border flex items-center justify-center">
              {getIcon()}
            </div>
            {isSelected && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 font-semibold">
                Active Mode
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{copy}</p>
        </div>

        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            {footerTag}
          </span>
          <span className="text-xs font-mono text-accent-cyan group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </div>
  );
};
