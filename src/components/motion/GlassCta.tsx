import { useState, useRef, useEffect, type FC } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useVisibility } from '@/hooks/useVisibility';

interface GlassCtaProps {
  label?: string;
  onActivate?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const GlassCta: FC<GlassCtaProps> = ({
  label = 'Get started',
  onActivate,
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionPolicy = useMotionPolicy();
  const isVisible = useVisibility();

  // Test WebGL availability safely on mount
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const handleClick = () => {
    if (disabled) return;
    setIsPressed(true);

    // Particle burst in mini canvas
    if (canvasRef.current && !motionPolicy.isReduced && isVisible && hasWebGL) {
      triggerBurst(canvasRef.current);
    }

    setTimeout(() => {
      setIsPressed(false);
      if (onActivate) {
        onActivate();
      }
    }, 450);
  };

  const triggerBurst = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const particles: { x: number; y: number; vx: number; vy: number; alpha: number }[] = [];

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1;
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
      });
    }

    let frame = 0;
    const burstLoop = () => {
      if (frame > 30) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.92;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00f2fe';
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      frame++;
      requestAnimationFrame(burstLoop);
    };
    burstLoop();
  };

  return (
    <div className={`relative inline-block group select-none ${className}`}>
      {/* Outer ambient glow */}
      <div
        className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink opacity-40 blur-md transition-opacity duration-500 ${
          isHovered && !motionPolicy.isReduced ? 'opacity-80' : 'opacity-40'
        }`}
      />

      {/* Interactive Glass Button Container */}
      <button
        type={type}
        disabled={disabled}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative z-10 inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ${
          isPressed ? 'scale-95' : isHovered ? 'scale-[1.02]' : 'scale-100'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 32px 0 rgba(0, 242, 254, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Specular highlight diagonal shimmer */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div
            className={`absolute -inset-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-transform duration-1000 ${
              isHovered && !motionPolicy.isReduced ? 'translate-x-[400%]' : ''
            }`}
          />
        </div>

        {/* Burst canvas overlay */}
        <canvas
          ref={canvasRef}
          width={220}
          height={56}
          className="absolute inset-0 pointer-events-none z-20 w-full h-full"
        />

        {/* Icon & Label */}
        <span className="relative z-10 flex items-center gap-2 text-foreground font-semibold">
          <Sparkles className="w-4 h-4 text-accent-cyan group-hover:rotate-12 transition-transform" />
          <span>{label}</span>
          <ArrowRight className="w-4 h-4 text-accent-cyan group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </div>
  );
};
