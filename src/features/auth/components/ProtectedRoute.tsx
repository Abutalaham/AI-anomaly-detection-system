import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/constants';
import type { FC } from 'react';

export const ProtectedRoute: FC = () => {
  const { user, isLoading, isDemoUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[400px] flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-muted-foreground text-sm font-mono">
          <div className="w-5 h-5 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated or demo mode fallback is active, permit access
  if (user || isDemoUser) {
    return <Outlet />;
  }

  // Otherwise redirect to /auth preserving intended path
  return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />;
};
