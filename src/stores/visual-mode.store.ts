import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEY_VISUAL_MODE } from '@/constants';

export type VisualMode = 'quantum' | 'glassmorphism' | 'kinetic';

interface VisualModeState {
  visualMode: VisualMode;
  setVisualMode: (mode: VisualMode) => void;
}

export const useVisualModeStore = create<VisualModeState>()(
  persist(
    (set) => ({
      visualMode: 'quantum',
      setVisualMode: (visualMode) => set({ visualMode }),
    }),
    {
      name: STORAGE_KEY_VISUAL_MODE,
    }
  )
);
