import { Suspense, lazy, type FC } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ROUTES } from '@/constants';

// Lazy-loaded route views for code splitting & fast initial load
const Landing = lazy(() => import('@/pages/Landing').then((m) => ({ default: m.Landing })));
const Auth = lazy(() => import('@/pages/Auth').then((m) => ({ default: m.Auth })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const StreamDetail = lazy(() => import('@/pages/StreamDetail').then((m) => ({ default: m.StreamDetail })));
const Alerts = lazy(() => import('@/pages/Alerts').then((m) => ({ default: m.Alerts })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })));

const RouteLoading: FC = () => (
  <div className="flex-1 min-h-[300px] flex items-center justify-center p-8">
    <div className="flex items-center gap-3 text-muted-foreground text-sm font-mono">
      <div className="w-4 h-4 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
      <span>Loading Telemetry Module...</span>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <RootLayout />
      </ErrorBoundary>
    ),
    children: [
      // Public landing and authentication views
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Landing />
              </Suspense>
            ),
          },
          {
            path: ROUTES.AUTH.slice(1),
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Auth />
              </Suspense>
            ),
          },
        ],
      },
      // Authenticated application views protected by ProtectedRoute
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: ROUTES.DASHBOARD.slice(1),
                element: (
                  <Suspense fallback={<RouteLoading />}>
                    <Dashboard />
                  </Suspense>
                ),
              },
              {
                path: 'streams/:id',
                element: (
                  <Suspense fallback={<RouteLoading />}>
                    <StreamDetail />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.ALERTS.slice(1),
                element: (
                  <Suspense fallback={<RouteLoading />}>
                    <Alerts />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.SETTINGS.slice(1),
                element: (
                  <Suspense fallback={<RouteLoading />}>
                    <Settings />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
      // 404 Catch-All
      {
        path: '*',
        element: (
          <Suspense fallback={<RouteLoading />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);
