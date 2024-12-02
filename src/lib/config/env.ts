import { z } from 'zod';

const envSchema = z.object({
  // Firebase Config
  VITE_FIREBASE_API_KEY: z.string(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string(),
  VITE_FIREBASE_PROJECT_ID: z.string(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  VITE_FIREBASE_APP_ID: z.string(),

  // Pinterest Config
  VITE_PINTEREST_API_URL: z.string().url(),
  VITE_PINTEREST_CLIENT_ID: z.string(),
  VITE_PINTEREST_CLIENT_SECRET: z.string(),
  VITE_PINTEREST_REDIRECT_URI: z.string().url(),
});

export function validateEnv() {
  try {
    const env = envSchema.parse(import.meta.env);
    
    // Log validation success but not the values
    console.log('Environment variables validated successfully');
    
    return env;
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Missing or invalid environment variables. Check .env.example for required variables.');
  }
}

export const env = validateEnv();

// Export typed environment helper
export function getRequiredEnvVar(key: keyof z.infer<typeof envSchema>): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}