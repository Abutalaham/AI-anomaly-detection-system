import { useRef, useEffect, useState, useCallback, type RefObject } from 'react';
import { useVisualModeStore } from '@/stores/visual-mode.store';
import { useMotionPolicy } from './useMotionPolicy';

interface UseTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
}

export function useTilt<T extends HTMLElement>(
  options: UseTiltOptions = {}
): {
  ref: RefObject<T>;
  isHovered: boolean;
} {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);
  const visualMode = useVisualModeStore((state) => state.visualMode);
  const motionPolicy = useMotionPolicy();

  const maxTilt = options.maxTilt ?? (visualMode === 'quantum' ? 18 : 10);
  const perspective = options.perspective ?? 1000;
  const scale = options.scale ?? (visualMode === 'quantum' ? 1.03 : 1.01);

  // rAF throttling state
  const rafId = useRef<number | null>(null);

  const updateTransform = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (!ref.current) return;

      // Calculate normalized tilt (-1 to 1)
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;

      const rotateX = -ny * maxTilt;
      const rotateY = nx * maxTilt;

      // Pointer-tracked radial glow coordinates (percentage)
      const px = ((x / width) * 100).toFixed(1);
      const py = ((y / height) * 100).toFixed(1);

      ref.current.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
      ref.current.style.setProperty('--mx', `${px}%`);
      ref.current.style.setProperty('--my', `${py}%`);
    },
    [maxTilt, perspective, scale]
  );

  const resetTransform = useCallback(() => {
    if (!ref.current) return;
    const isSpringy = visualMode === 'kinetic';
    ref.current.style.transition = isSpringy
      ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'transform 0.4s ease-out';
    ref.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  }, [perspective, visualMode]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (motionPolicy.isReduced) {
      el.style.transform = 'none';
      return;
    }

    const onMouseEnter = () => {
      setIsHovered(true);
      el.style.willChange = 'transform';
      el.style.transition = 'none';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        updateTransform(x, y, rect.width, rect.height);
      });
    };

    const onMouseLeave = () => {
      setIsHovered(false);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      resetTransform();
      setTimeout(() => {
        if (ref.current) ref.current.style.willChange = 'auto';
      }, 400);
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [motionPolicy.isReduced, updateTransform, resetTransform]);

  return { ref, isHovered };
}
