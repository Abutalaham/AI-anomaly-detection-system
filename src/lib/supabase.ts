import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Client-side Supabase client using validated public keys
export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
