import { createContext, useContext, useEffect, useState, type ReactNode, type FC } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isDemoUser: boolean;
  signOut: () => Promise<void>;
  activateDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated demo user for offline / unconfigured fallback mode
const DEMO_USER: User = {
  id: 'demo-solo-operator',
  app_metadata: { provider: 'demo' },
  user_metadata: { full_name: 'Lead SRE Operator' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'operator@sentinel.dev',
  role: 'authenticated',
} as unknown as User;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        if (error) {
          logger.warn('Initial session check error', { message: error.message });
          // Enable demo user fallback if Supabase is unreachable
          setUser(DEMO_USER);
          setIsDemoUser(true);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          setIsDemoUser(false);
        } else {
          // If in development or demo mode, provide demo user access
          setUser(DEMO_USER);
          setIsDemoUser(true);
        }
      })
      .catch((err) => {
        logger.error('Failed to resolve initial session', err);
        setUser(DEMO_USER);
        setIsDemoUser(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    // 2. Realtime Auth State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsDemoUser(false);
      } else {
        setSession(null);
        setUser(DEMO_USER);
        setIsDemoUser(true);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsDemoUser(false);
    } catch (err) {
      logger.error('Error signing out', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activateDemoUser = () => {
    setUser(DEMO_USER);
    setIsDemoUser(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isDemoUser,
        signOut: handleSignOut,
        activateDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
