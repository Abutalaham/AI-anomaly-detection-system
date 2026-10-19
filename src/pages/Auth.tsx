import { useState, type FC, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, Mail, Lock, User as UserIcon, Github, Sparkles, Loader2 } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';
import { signInSchema, signUpSchema } from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/constants';

export const Auth: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activateDemoUser } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});

  const redirectPath = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // 1. Zod Validation
    if (tab === 'signin') {
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: { email?: string; password?: string } = {};
        for (const issue of result.error.issues) {
          if (issue.path[0] === 'email') errors.email = issue.message;
          if (issue.path[0] === 'password') errors.password = issue.message;
        }
        setFieldErrors(errors);
        return;
      }
    } else {
      const result = signUpSchema.safeParse({ email, password, displayName });
      if (!result.success) {
        const errors: { email?: string; password?: string; displayName?: string } = {};
        for (const issue of result.error.issues) {
          if (issue.path[0] === 'email') errors.email = issue.message;
          if (issue.path[0] === 'password') errors.password = issue.message;
          if (issue.path[0] === 'displayName') errors.displayName = issue.message;
        }
        setFieldErrors(errors);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (tab === 'signin') {
        const res = await authService.signInWithPassword({ email, password });
        if (res.ok) {
          toast.success('Authenticated', { description: 'Welcome back to Sentinel.' });
          navigate(redirectPath);
        } else {
          // If offline/demo fallback, prompt seamless demo entrance
          if (res.error.code === 'NETWORK_ERROR' || res.error.message.includes('fetch')) {
            toast.info('Connecting via Demo Session', {
              description: 'Using in-memory verified demo credentials.',
            });
            activateDemoUser();
            navigate(redirectPath);
          } else {
            toast.error('Sign In Failed', { description: res.error.message });
          }
        }
      } else {
        const res = await authService.signUpWithPassword({ email, password, displayName });
        if (res.ok) {
          toast.success('Account Created', {
            description: 'Check your email for confirmation, or explore via demo session.',
          });
          navigate(redirectPath);
        } else {
          toast.error('Sign Up Failed', { description: res.error.message });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    toast.info(`Connecting ${provider}...`, {
      description: 'Redirecting to Supabase OAuth provider.',
    });
    const res = await authService.signInWithOAuth(provider);
    if (!res.ok) {
      toast.error('OAuth Connection Notice', {
        description: res.error.message + ' Entering Demo Mode.',
      });
      activateDemoUser();
      navigate(redirectPath);
    }
    setIsLoading(false);
  };

  const handleQuickDemoAccess = () => {
    activateDemoUser();
    toast.success('Demo Operator Session Active', {
      description: 'Welcome to the live telemetry suite.',
    });
    navigate(redirectPath);
  };

  return (
    <article className="flex-1 flex items-center justify-center p-4 py-8">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 space-y-6 shadow-2xl border border-border">
        {/* Brand Header */}
        <header className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {tab === 'signin' ? 'Sign in to Sentinel' : 'Create an Account'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor real-time streams with sub-second statistical anomaly detection
          </p>
        </header>

        {/* Tab Switcher */}
        <div role="tablist" aria-label="Authentication Options" className="grid grid-cols-2 p-1 bg-secondary rounded-lg">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'signin'}
            onClick={() => setTab('signin')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              tab === 'signin'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'signup'}
            onClick={() => setTab('signup')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              tab === 'signup'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border bg-card/60 hover:bg-secondary text-xs font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border bg-card/60 hover:bg-secondary text-xs font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-2 text-[10px] uppercase font-mono text-muted-foreground absolute">
            Or with email
          </span>
        </div>

        {/* Email & Password Accessible Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div className="space-y-1">
              <label htmlFor="auth-name" className="block text-xs font-medium text-foreground">
                Display Name (Optional)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  id="auth-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Rivers"
                  className="w-full pl-9 pr-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="auth-email" className="block text-xs font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@sentinel.dev"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  fieldErrors.email ? 'border-destructive' : 'border-border'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p id="email-error" className="text-[11px] text-destructive font-mono mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-password" className="block text-xs font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  fieldErrors.password ? 'border-destructive' : 'border-border'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="text-[11px] text-destructive font-mono mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {isLoading
                ? 'Authenticating...'
                : tab === 'signin'
                ? 'Sign In to Dashboard'
                : 'Create Account'}
            </span>
          </button>
        </form>

        {/* Quick Demo Access Fallback */}
        <div className="pt-2 border-t border-border/50 text-center">
          <button
            type="button"
            onClick={handleQuickDemoAccess}
            className="inline-flex items-center gap-1.5 text-xs text-accent-cyan hover:underline font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Access as Demo Operator (No sign up needed)</span>
          </button>
        </div>
      </div>
    </article>
  );
};
