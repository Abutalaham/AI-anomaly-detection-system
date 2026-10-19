import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useUIStore } from '@/stores/ui.store';

import { ParticleField } from '@/components/motion/ParticleField';

export const RootLayout: React.FC = () => {
  const theme = useUIStore((state) => state.theme);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground transition-colors overflow-x-hidden">
      {/* Interactive background particle constellation */}
      <ParticleField />

      {/* Accessibility: Skip to main content landmark */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Primary routed content */}
      <div className="relative z-10 flex flex-col flex-1">
        <Outlet />
      </div>

      {/* Global accessible toast notifications container */}
      <Toaster
        theme={theme === 'light' ? 'light' : 'dark'}
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
};
