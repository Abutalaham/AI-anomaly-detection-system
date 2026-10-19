import { useState, useRef, type FC, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface RippleButtonProps {
  children: ReactNode;
  variant?: 'cyan' | 'purple';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const RippleButton: FC<RippleButtonProps> = ({
  children,
  variant = 'cyan',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const motion = useMotionPolicy();

  const addRipple = (x: number, y: number) => {
    if (motion.isReduced) return;
    const button = buttonRef.current;
    if (!button) return;

    const size = Math.max(button.clientWidth, button.clientHeight) * 2;
    const newRipple: Ripple = {
      x: x - size / 2,
      y: y - size / 2,
      size,
      id: Date.now() + Math.random(),
    };

    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const handlePointerDown = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const button = buttonRef.current;
      if (button) {
        addRipple(button.clientWidth / 2, button.clientHeight / 2);
      }
    }
  };

  const variantStyles =
    variant === 'cyan'
      ? 'bg-accent-cyan text-primary-foreground hover:opacity-95 shadow-lg shadow-accent-cyan/20'
      : 'bg-accent-purple text-primary-foreground hover:opacity-95 shadow-lg shadow-accent-purple/20';

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className={`relative overflow-hidden inline-flex items-center justify-center font-semibold text-sm rounded-lg px-5 py-2.5 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ${variantStyles} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Expanding Ripple elements */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ping opacity-35 bg-white"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '600ms',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      ))}
    </button>
  );
};
