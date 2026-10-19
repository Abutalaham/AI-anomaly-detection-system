import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY cannot be empty'),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  !String(import.meta.env.VITE_SUPABASE_URL).includes('your-project') &&
  !String(import.meta.env.VITE_SUPABASE_URL).includes('placeholder') &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !String(import.meta.env.VITE_SUPABASE_ANON_KEY).includes('your-anon-key') &&
  !String(import.meta.env.VITE_SUPABASE_ANON_KEY).includes('placeholder')
);

const validateEnv = () => {
  const result = envSchema.safeParse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => ` - [${issue.path.join('.')}] ${issue.message}`)
      .join('\n');
    console.warn(`[ENV CONFIG NOTICE]: Supabase unconfigured or incomplete, running in demo fallback mode.\n${issues}`);
  }

  return result.data ?? {
    VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'placeholder-key',
    VITE_APP_ENV: (import.meta.env.VITE_APP_ENV as 'development' | 'production' | 'test') || 'development',
  };
};

export const env = validateEnv();
