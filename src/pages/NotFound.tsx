import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { ROUTES } from '@/constants';

export const NotFound: React.FC = () => {
  return (
    <article className="min-h-[500px] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        The telemetry vector you requested does not exist or has expired.
      </p>
      <Link
        to={ROUTES.LANDING}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Home className="w-4 h-4" />
        Return to Home
      </Link>
    </article>
  );
};
