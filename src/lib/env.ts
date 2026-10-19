import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY cannot be empty'),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

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
    const errorMessage = `[ENV CONFIG VALIDATION FAILED]:\n${issues}\nPlease verify your .env file matches .env.example.`;
    
    // In production we throw to prevent running with corrupt/missing config
    if (import.meta.env.PROD) {
      throw new Error(errorMessage);
    } else {
      // In development, log loud warning but fallback gracefully for initial onboarding
      console.error(errorMessage);
    }
  }

  return result.data ?? {
    VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'placeholder-key',
    VITE_APP_ENV: 'development' as const,
  };
};

export const env = validateEnv();
