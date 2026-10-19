import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEY_UI, PARTICLE_CONFIG } from '@/constants';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ConstellationTheme = 'cyan' | 'purple' | 'pink' | 'threat';
export type GravityMode = 'attract' | 'repel';

interface UIState {
  // Theme state
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Particle constellation settings
  particleCount: number;
  connectDistance: number;
  constellationTheme: ConstellationTheme;
  gravityMode: GravityMode;
  reduceMotion: boolean;

  // Threat mode trigger (turns particles red and agitates for 6s on critical alert)
  isThreatModeActive: boolean;
  setThreatMode: (active: boolean) => void;

  // Particle setters
  setParticleCount: (count: number) => void;
  setConnectDistance: (distance: number) => void;
  setConstellationTheme: (theme: ConstellationTheme) => void;
  setGravityMode: (mode: GravityMode) => void;
  setReduceMotion: (reduce: boolean) => void;

  // Canvas drawer open state
  isCanvasDrawerOpen: boolean;
  setCanvasDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        const isDark =
          theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      particleCount: PARTICLE_CONFIG.DEFAULT_COUNT,
      connectDistance: PARTICLE_CONFIG.DEFAULT_CONNECT_DISTANCE,
      constellationTheme: 'cyan',
      gravityMode: 'repel',
      reduceMotion: false,

      isThreatModeActive: false,
      setThreatMode: (active) => set({ isThreatModeActive: active }),

      setParticleCount: (particleCount) => set({ particleCount }),
      setConnectDistance: (connectDistance) => set({ connectDistance }),
      setConstellationTheme: (constellationTheme) => set({ constellationTheme }),
      setGravityMode: (gravityMode) => set({ gravityMode }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),

      isCanvasDrawerOpen: false,
      setCanvasDrawerOpen: (isCanvasDrawerOpen) => set({ isCanvasDrawerOpen }),
    }),
    {
      name: STORAGE_KEY_UI,
      partialize: (state) => ({
        theme: state.theme,
        particleCount: state.particleCount,
        connectDistance: state.connectDistance,
        constellationTheme: state.constellationTheme,
        gravityMode: state.gravityMode,
        reduceMotion: state.reduceMotion,
      }),
    }
  )
);
