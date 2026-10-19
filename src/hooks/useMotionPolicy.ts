import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/constants';

export type MotionTier = 'tier1' | 'tier2' | 'tier3';

export interface MotionPolicy {
  tier: MotionTier;
  allowTilt: boolean;
  allowFloat: boolean;
  allowParallax: boolean;
  maxParticles: number;
  transitionDurationMs: number;
  isReduced: boolean;
}

export function useMotionPolicy(): MotionPolicy {
  const location = useLocation();
  const reduceMotionUserSetting = useUIStore((state) => state.reduceMotion);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQueryMotion.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQueryMotion.addEventListener('change', handleMotionChange);

    const mediaQueryMobile = window.matchMedia('(pointer: coarse), (max-width: 768px)');
    setIsMobile(mediaQueryMobile.matches);

    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQueryMobile.addEventListener('change', handleMobileChange);

    return () => {
      mediaQueryMotion.removeEventListener('change', handleMotionChange);
      mediaQueryMobile.removeEventListener('change', handleMobileChange);
    };
  }, []);

  const isReduced = prefersReducedMotion || reduceMotionUserSetting;

  if (isReduced) {
    return {
      tier: 'tier3',
      allowTilt: false,
      allowFloat: false,
      allowParallax: false,
      maxParticles: 0,
      transitionDurationMs: 100,
      isReduced: true,
    };
  }

  // Tier 1: Landing and Auth pages have full show
  const isTier1Route =
    location.pathname === ROUTES.LANDING || location.pathname === ROUTES.AUTH;

  if (isTier1Route) {
    return {
      tier: 'tier1',
      allowTilt: !isMobile,
      allowFloat: true,
      allowParallax: true,
      maxParticles: isMobile ? 50 : 120,
      transitionDurationMs: 400,
      isReduced: false,
    };
  }

  // Tier 2: Dashboard and other app routes have restrained motion
  return {
    tier: 'tier2',
    allowTilt: !isMobile,
    allowFloat: false,
    allowParallax: false,
    maxParticles: 60,
    transitionDurationMs: 250,
    isReduced: false,
  };
}
