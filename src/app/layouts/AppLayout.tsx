import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Bell,
  Sliders,
  Database,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ROUTES } from '@/constants';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isDemoUser } = useAuth();
  const isDemoMode = !isSupabaseConfigured || isDemoUser;

  const navLinks = [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Alerts', path: ROUTES.ALERTS, icon: Bell },
    { label: 'Settings', path: ROUTES.SETTINGS, icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Demo Mode Banner (per section 4: Visible banner when in Demo Mode) */}
      {isDemoMode && (
        <aside
          aria-label="Demo Mode Notice"
          className="bg-accent-cyan/10 border-b border-accent-cyan/20 px-4 py-2 text-xs flex items-center justify-between text-accent-cyan"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span className="font-medium">
              Demo Mode Active: Running in-memory simulated streams and detectors.
            </span>
          </div>
          <span className="text-[11px] opacity-80 hidden sm:inline">
            Connect Supabase to persist streams
          </span>
        </aside>
      )}

      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to={ROUTES.LANDING}
              className="flex items-center gap-2 group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight text-foreground text-base">SENTINEL</span>
            </Link>

            <nav aria-label="Application Navigation" className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to={ROUTES.LANDING}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Return to Public Landing Page"
            >
              <span>Landing</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Application Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};
