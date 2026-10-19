import { supabase } from '@/lib/supabase';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { User, Session } from '@supabase/supabase-js';
import type { SignInInput, SignUpInput } from '../schemas/auth.schema';

export class AuthService {
  /**
   * Sign in using email and password credentials
   */
  async signInWithPassword(input: SignInInput): Promise<Result<{ user: User; session: Session }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        logger.warn('Sign-in failed', { error: error.message });
        return err(new AppError(error.message, 'AUTH_ERROR', error));
      }

      if (!data.user || !data.session) {
        return err(new AppError('No session returned from authentication server', 'AUTH_ERROR'));
      }

      logger.info('User authenticated successfully', { userId: data.user.id });
      return ok({ user: data.user, session: data.session });
    } catch (error) {
      logger.error('Unexpected error during sign-in', error);
      return err(new AppError('Unable to connect to authentication service', 'NETWORK_ERROR', error));
    }
  }

  /**
   * Register a new user account with email and password
   */
  async signUpWithPassword(input: SignUpInput): Promise<Result<{ user: User | null; session: Session | null }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.displayName || input.email.split('@')[0],
          },
        },
      });

      if (error) {
        logger.warn('Sign-up failed', { error: error.message });
        return err(new AppError(error.message, 'AUTH_ERROR', error));
      }

      logger.info('User registration initiated', { userId: data.user?.id });
      return ok({ user: data.user, session: data.session });
    } catch (error) {
      logger.error('Unexpected error during registration', error);
      return err(new AppError('Unable to connect to registration service', 'NETWORK_ERROR', error));
    }
  }

  /**
   * Initiate third-party OAuth redirect (Google or GitHub)
   */
  async signInWithOAuth(provider: 'google' | 'github'): Promise<Result<{ provider: string }>> {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        logger.warn(`OAuth initiation failed for ${provider}`, { error: error.message });
        return err(new AppError(error.message, 'AUTH_ERROR', error));
      }

      return ok({ provider });
    } catch (error) {
      logger.error(`OAuth error for ${provider}`, error);
      return err(new AppError(`OAuth redirection for ${provider} failed`, 'NETWORK_ERROR', error));
    }
  }

  /**
   * Sign out current user session
   */
  async signOut(): Promise<Result<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return err(new AppError(error.message, 'AUTH_ERROR', error));
      }
      return ok(undefined);
    } catch (error) {
      return err(new AppError('Sign out failed', 'NETWORK_ERROR', error));
    }
  }

  /**
   * Retrieve active session
   */
  async getSession(): Promise<Result<Session | null>> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return err(new AppError(error.message, 'AUTH_ERROR', error));
      }
      return ok(data.session);
    } catch (error) {
      return err(new AppError('Failed to fetch session', 'NETWORK_ERROR', error));
    }
  }
}

export const authService = new AuthService();
