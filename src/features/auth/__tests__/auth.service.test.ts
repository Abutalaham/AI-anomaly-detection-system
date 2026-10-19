import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services/auth.service';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ok Result on successful password authentication', async () => {
    const mockUser = { id: 'usr-1', email: 'operator@sentinel.dev' };
    const mockSession = { access_token: 'fake-jwt', user: mockUser };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: mockUser as unknown as User, session: mockSession as unknown as Session },
      error: null,
    });

    const res = await authService.signInWithPassword({
      email: 'operator@sentinel.dev',
      password: 'password123',
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.user.id).toBe('usr-1');
      expect(res.data.session.access_token).toBe('fake-jwt');
    }
  });

  it('wraps Supabase auth error as typed AppError', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthError('Invalid login credentials', 400),
    });

    const res = await authService.signInWithPassword({
      email: 'operator@sentinel.dev',
      password: 'wrongPassword',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('AUTH_ERROR');
      expect(res.error.message).toBe('Invalid login credentials');
    }
  });

  it('initiates OAuth provider redirection', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://accounts.google.com' },
      error: null,
    });

    const res = await authService.signInWithOAuth('google');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.provider).toBe('google');
    }
  });
});
