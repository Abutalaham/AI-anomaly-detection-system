import { createClient } from '@supabase/supabase-js';
import { env, isConfigured } from './env';

const getValidUrl = (url?: string): string => {
  if (!url) return 'https://placeholder.supabase.co';
  try {
    const parsed = new URL(url);
    return parsed.protocol.startsWith('http') ? url : 'https://placeholder.supabase.co';
  } catch {
    return 'https://placeholder.supabase.co';
  }
};

const supabaseUrl = getValidUrl(env.VITE_SUPABASE_URL);
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = isConfigured;

// Client-side Supabase client using validated public keys or safe fallback
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
