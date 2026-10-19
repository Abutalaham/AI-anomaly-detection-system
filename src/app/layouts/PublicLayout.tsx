import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ROUTES } from '@/constants';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Semantic Accessible Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to={ROUTES.LANDING}
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground text-base">SENTINEL</span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest -mt-1">Anomaly Engine</span>
            </div>
          </Link>

          <nav aria-label="Main Navigation" className="flex items-center gap-4">
            <Link
              to={ROUTES.DASHBOARD}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Live Demo
            </Link>
            <ThemeToggle />
            <Link
              to={ROUTES.AUTH}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Semantic Accessible Footer */}
      <footer className="border-t border-border bg-card/40 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-cyan" />
            <span>Sentinel Anomaly Detection Platform</span>
          </div>
          <div>
            Built with Vite, React 18, Supabase & WebGL. Strict 8px grid & AA contrast.
          </div>
        </div>
      </footer>
    </div>
  );
};
