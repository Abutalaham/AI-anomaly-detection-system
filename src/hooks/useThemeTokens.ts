import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/ui.store';

export interface ThemeTokens {
  background: string;
  foreground: string;
  accentCyan: string;
  accentPurple: string;
  accentPink: string;
  threatRed: string;
  border: string;
  card: string;
}

export function useThemeTokens(): ThemeTokens {
  const theme = useUIStore((state) => state.theme);
  const [tokens, setTokens] = useState<ThemeTokens>({
    background: '#050b14',
    foreground: '#f1f5f9',
    accentCyan: '#00f2fe',
    accentPurple: '#9d4edd',
    accentPink: '#ff007f',
    threatRed: '#ff1e56',
    border: '#1e293b',
    card: '#0b1325',
  });

  useEffect(() => {
    const root = document.documentElement;
    const computed = getComputedStyle(root);

    setTokens({
      background: computed.getPropertyValue('--color-background').trim() || '#050b14',
      foreground: computed.getPropertyValue('--color-foreground').trim() || '#f1f5f9',
      accentCyan: computed.getPropertyValue('--color-accent-cyan').trim() || '#00f2fe',
      accentPurple: computed.getPropertyValue('--color-accent-purple').trim() || '#9d4edd',
      accentPink: computed.getPropertyValue('--color-accent-pink').trim() || '#ff007f',
      threatRed: computed.getPropertyValue('--color-threat').trim() || '#ff1e56',
      border: computed.getPropertyValue('--color-border').trim() || '#1e293b',
      card: computed.getPropertyValue('--color-card').trim() || '#0b1325',
    });
  }, [theme]);

  return tokens;
}
