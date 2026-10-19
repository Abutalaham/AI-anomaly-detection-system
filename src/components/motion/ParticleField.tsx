import { useRef, useEffect, type FC } from 'react';
import { useUIStore, type ConstellationTheme } from '@/stores/ui.store';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useVisibility } from '@/hooks/useVisibility';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  isBurst?: boolean;
  life?: number;
  maxLife?: number;
}

interface ParticleFieldProps {
  className?: string;
  isInteractive?: boolean;
}

export const ParticleField: FC<ParticleFieldProps> = ({
  className = '',
  isInteractive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stores & Hooks
  const {
    particleCount,
    connectDistance,
    constellationTheme,
    gravityMode,
    isThreatModeActive,
  } = useUIStore();

  const themeTokens = useThemeTokens();
  const motionPolicy = useMotionPolicy();
  const isTabVisible = useVisibility();

  // Mouse interaction state
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Resolve color based on theme / threat mode
    const getParticleColor = (theme: ConstellationTheme, isThreat: boolean) => {
      if (isThreat) return themeTokens.threatRed;
      switch (theme) {
        case 'purple':
          return themeTokens.accentPurple;
        case 'pink':
          return themeTokens.accentPink;
        case 'threat':
          return themeTokens.threatRed;
        case 'cyan':
        default:
          return themeTokens.accentCyan;
      }
    };

    // Resize Handler with DPR capping at 2
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(canvas);
    handleResize();

    // Determine active particle limit
    const activeCount = motionPolicy.isReduced
      ? Math.min(particleCount, 40)
      : motionPolicy.maxParticles > 0
      ? Math.min(particleCount, motionPolicy.maxParticles)
      : particleCount;

    // Initialize base particles
    const particles: Particle[] = [];
    for (let i = 0; i < activeCount; i++) {
      particles.push({
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || window.innerHeight),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 1.5 + 1,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    // Burst particles buffer (capped at 30)
    let burstParticles: Particle[] = [];

    // Pointer Event Listeners on window so it tracks through transparent overlay
    const handlePointerMove = (e: PointerEvent) => {
      if (!isInteractive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    // Shockwave burst on click/tap
    const handlePointerDown = (e: PointerEvent) => {
      if (!isInteractive || !canvas || motionPolicy.isReduced) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const burstCount = 18;
      const newBurst: Particle[] = [];
      for (let i = 0; i < burstCount; i++) {
        const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.2;
        const speed = Math.random() * 3 + 2;
        newBurst.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2 + 1,
          alpha: 1,
          isBurst: true,
          life: 0,
          maxLife: 45, // expires in ~45 frames
        });
      }

      burstParticles = [...burstParticles.slice(-15), ...newBurst];
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Main Animation Loop
    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const color = getParticleColor(constellationTheme, isThreatModeActive);
      const isAttract = gravityMode === 'attract';
      const mouse = mouseRef.current;
      const interactionRadius = 140;

      // Update & Draw Burst Particles
      const nextBurst: Particle[] = [];
      for (let i = 0; i < burstParticles.length; i++) {
        const p = burstParticles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life = (p.life ?? 0) + 1;
        const progress = p.life / (p.maxLife ?? 45);
        p.alpha = Math.max(0, 1 - progress);

        if (progress < 1) {
          nextBurst.push(p);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }
      }
      burstParticles = nextBurst;

      // Spatial Grid for O(N) neighbor pairing
      const cellSize = Math.max(connectDistance, 60);
      const grid = new Map<string, Particle[]>();

      const getGridKey = (gx: number, gy: number) => `${gx},${gy}`;

      // Update base particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;

        if (!motionPolicy.isReduced) {
          // Normal velocity or agitated threat mode velocity
          const velocityMultiplier = isThreatModeActive ? 2.8 : 1.0;
          p.x += p.vx * velocityMultiplier;
          p.y += p.vy * velocityMultiplier;

          // Mouse gravity interaction
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < interactionRadius && dist > 1) {
              const force = (1 - dist / interactionRadius) * 0.08;
              const dir = isAttract ? 1 : -1;
              p.vx += (dx / dist) * force * dir * 1.5;
              p.vy += (dy / dist) * force * dir * 1.5;
            }
          }

          // Damping to prevent runaway acceleration
          p.vx *= 0.98;
          p.vy *= 0.98;

          // Boundary bounce / wrap
          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = isThreatModeActive ? 0.9 : p.alpha;
        ctx.fill();

        // Assign to spatial grid
        const gx = Math.floor(p.x / cellSize);
        const gy = Math.floor(p.y / cellSize);
        const key = getGridKey(gx, gy);
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(p);
      }

      // Draw Connection Lines using Spatial Grid (checking 9 neighboring cells)
      ctx.lineWidth = 1;
      const distSqMax = connectDistance * connectDistance;

      for (const [key, cellParticles] of grid.entries()) {
        const [gxStr, gyStr] = key.split(',');
        const gx = parseInt(gxStr!, 10);
        const gy = parseInt(gyStr!, 10);

        for (let ox = 0; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            if (ox === 0 && oy < 0) continue;
            const neighborKey = getGridKey(gx + ox, gy + oy);
            const neighborParticles = grid.get(neighborKey);
            if (!neighborParticles) continue;

            const isSameCell = ox === 0 && oy === 0;

            for (let i = 0; i < cellParticles.length; i++) {
              const p1 = cellParticles[i]!;
              const startJ = isSameCell ? i + 1 : 0;

              for (let j = startJ; j < neighborParticles.length; j++) {
                const p2 = neighborParticles[j]!;
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dSq = dx * dx + dy * dy;

                if (dSq < distSqMax) {
                  const dist = Math.sqrt(dSq);
                  const lineAlpha = (1 - dist / connectDistance) * (isThreatModeActive ? 0.5 : 0.25);
                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.strokeStyle = color;
                  ctx.globalAlpha = lineAlpha;
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      ctx.globalAlpha = 1;

      // If motion is not reduced, keep running the loop
      if (!motionPolicy.isReduced) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [
    particleCount,
    connectDistance,
    constellationTheme,
    gravityMode,
    isThreatModeActive,
    themeTokens,
    motionPolicy,
    isTabVisible,
    isInteractive,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60 transition-opacity duration-700 ${className}`}
      aria-hidden="true"
    />
  );
};
