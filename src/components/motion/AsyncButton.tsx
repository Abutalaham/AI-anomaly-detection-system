import { useState, type FC, type ReactNode } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type AsyncState = 'idle' | 'loading' | 'success' | 'error';

interface AsyncButtonProps {
  children: ReactNode;
  action: () => Promise<unknown>;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

export const AsyncButton: FC<AsyncButtonProps> = ({
  children,
  action,
  successMessage = 'Action completed successfully',
  errorMessage = 'Action failed',
  className = '',
}) => {
  const [state, setState] = useState<AsyncState>('idle');

  const handleClick = async () => {
    if (state === 'loading') return;

    setState('loading');
    try {
      await action();
      setState('success');
      toast.success('Completed', { description: successMessage });
      setTimeout(() => setState('idle'), 2500);
    } catch (err) {
      setState('error');
      const msg = err instanceof Error ? err.message : errorMessage;
      toast.error('Operation Failed', {
        description: msg,
        action: {
          label: 'Retry',
          onClick: () => handleClick(),
        },
      });
      setTimeout(() => setState('idle'), 4000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'loading'}
      aria-busy={state === 'loading'}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none ${
        state === 'success'
          ? 'bg-success/20 text-success border border-success/40'
          : state === 'error'
          ? 'bg-destructive/20 text-destructive border border-destructive/40'
          : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
      } ${className}`}
    >
      {state === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-cyan" />}
      {state === 'success' && <Check className="w-3.5 h-3.5 text-success" />}
      {state === 'error' && <AlertCircle className="w-3.5 h-3.5 text-destructive" />}

      <span>
        {state === 'loading'
          ? 'Executing...'
          : state === 'success'
          ? 'Success'
          : state === 'error'
          ? 'Retry Action'
          : children}
      </span>
    </button>
  );
};
