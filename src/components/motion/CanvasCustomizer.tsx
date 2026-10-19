import { type FC } from 'react';
import { SlidersHorizontal, EyeOff, X } from 'lucide-react';
import { useUIStore, type ConstellationTheme } from '@/stores/ui.store';
import { toast } from 'sonner';

interface CanvasCustomizerProps {
  isDrawer?: boolean;
  onClose?: () => void;
}

export const CanvasCustomizer: FC<CanvasCustomizerProps> = ({
  isDrawer = false,
  onClose,
}) => {
  const {
    particleCount,
    setParticleCount,
    connectDistance,
    setConnectDistance,
    constellationTheme,
    setConstellationTheme,
    gravityMode,
    setGravityMode,
    reduceMotion,
    setReduceMotion,
  } = useUIStore();

  const handleGravityToggle = () => {
    const nextMode = gravityMode === 'attract' ? 'repel' : 'attract';
    setGravityMode(nextMode);
    toast.info(
      nextMode === 'attract' ? 'Attraction mode enabled' : 'Repulsion mode enabled'
    );
  };

  const themes: { id: ConstellationTheme; label: string; colorClass: string }[] = [
    { id: 'cyan', label: 'Cyber Cyan', colorClass: 'border-accent-cyan text-accent-cyan bg-accent-cyan/10' },
    { id: 'purple', label: 'Neon Purple', colorClass: 'border-accent-purple text-accent-purple bg-accent-purple/10' },
    { id: 'pink', label: 'Hot Pink', colorClass: 'border-accent-pink text-accent-pink bg-accent-pink/10' },
  ];

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-accent-cyan" />
          <h3 className="text-base font-bold text-foreground">Canvas Customizer</h3>
        </div>
        {isDrawer && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close canvas customizer drawer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Particle Count Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor={`particle-count-${isDrawer ? 'drawer' : 'panel'}`} className="font-medium text-foreground">
            Particle Count
          </label>
          <span className="font-mono text-accent-cyan font-bold">{particleCount}</span>
        </div>
        <input
          id={`particle-count-${isDrawer ? 'drawer' : 'panel'}`}
          type="range"
          min={30}
          max={150}
          value={particleCount}
          onChange={(e) => setParticleCount(Number(e.target.value))}
          className="w-full accent-cyan cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>30 (Minimal)</span>
          <span>80 (Default)</span>
          <span>150 (Dense)</span>
        </div>
      </div>

      {/* Connection Radius Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor={`connect-radius-${isDrawer ? 'drawer' : 'panel'}`} className="font-medium text-foreground">
            Connection Radius
          </label>
          <span className="font-mono text-accent-purple font-bold">{connectDistance} px</span>
        </div>
        <input
          id={`connect-radius-${isDrawer ? 'drawer' : 'panel'}`}
          type="range"
          min={60}
          max={200}
          value={connectDistance}
          onChange={(e) => setConnectDistance(Number(e.target.value))}
          className="w-full accent-purple cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>60 px</span>
          <span>120 px (Optimal)</span>
          <span>200 px</span>
        </div>
      </div>

      {/* Constellation Theme */}
      <div className="space-y-2">
        <span className="block text-xs font-medium text-foreground">Constellation Theme</span>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setConstellationTheme(t.id)}
              className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                constellationTheme === t.id
                  ? t.colorClass
                  : 'border-border bg-card/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Particle Gravity Field Switch */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div>
          <span className="text-xs font-semibold text-foreground block">Particle Gravity Field</span>
          <span className="text-[11px] text-muted-foreground">
            Current: <span className="capitalize font-mono text-accent-cyan">{gravityMode}</span>
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={gravityMode === 'attract'}
          onClick={handleGravityToggle}
          className={`w-12 h-6 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            gravityMode === 'attract' ? 'bg-accent-cyan' : 'bg-secondary border border-border'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-background shadow transition-transform ${
              gravityMode === 'attract' ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Reduce Motion Switch */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-muted-foreground" />
          <div>
            <span className="text-xs font-semibold text-foreground block">Reduce Motion</span>
            <span className="text-[11px] text-muted-foreground">Override tilt & animations</span>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={reduceMotion}
          onClick={() => setReduceMotion(!reduceMotion)}
          className={`w-12 h-6 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            reduceMotion ? 'bg-primary' : 'bg-secondary border border-border'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-background shadow transition-transform ${
              reduceMotion ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <aside
        aria-label="Floating Canvas Customizer Drawer"
        className="fixed bottom-6 right-6 z-50 w-80 glass-panel p-5 rounded-2xl shadow-2xl border border-accent-cyan/30 animate-in slide-in-from-bottom-5 duration-300"
      >
        {content}
      </aside>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border">
      {content}
    </div>
  );
};
