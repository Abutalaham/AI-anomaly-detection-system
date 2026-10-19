import { type FC } from 'react';
import { useUIStore } from '@/stores/ui.store';
import { toast } from 'sonner';
import { Magnet } from 'lucide-react';

export const GravityFieldSwitch: FC = () => {
  const { gravityMode, setGravityMode } = useUIStore();
  const isAttract = gravityMode === 'attract';

  const toggleGravity = () => {
    const next = isAttract ? 'repel' : 'attract';
    setGravityMode(next);
    toast.info(
      next === 'attract' ? 'Attraction mode enabled' : 'Repulsion mode enabled',
      {
        description: `Particles are now ${next === 'attract' ? 'gravitationally pulled toward' : 'deflected away from'} the cursor.`,
      }
    );
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card/60 border border-border">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
          <Magnet className="w-4 h-4" />
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground block">
            Gravity Vector Field
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            State: <span className="capitalize text-accent-cyan font-bold">{gravityMode}</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isAttract}
        aria-label={`Gravity field mode: currently ${gravityMode}. Toggle to switch between attract and repel.`}
        onClick={toggleGravity}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggleGravity();
          }
        }}
        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isAttract ? 'bg-accent-cyan' : 'bg-secondary border border-border'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-md ring-0 transition-transform duration-300 ease-spring ${
            isAttract ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
