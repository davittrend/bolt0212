import { z } from 'zod';

// Define environment schema with more lenient validation
const envSchema = z.object({
  // Firebase Config
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),

  // Pinterest Config - Make URL validation optional for development
  VITE_PINTEREST_API_URL: z.string().min(1, 'Pinterest API URL is required'),
  VITE_PINTEREST_CLIENT_ID: z.string().min(1, 'Pinterest client ID is required'),
  VITE_PINTEREST_CLIENT_SECRET: z.string().min(1, 'Pinterest client secret is required'),
  
  // Netlify Config - Optional
  VITE_NETLIFY_URL: z.string().optional(),
});

export function validateEnv() {
  try {
    // Create an object with all environment variables
    const envVars = {
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
      VITE_PINTEREST_API_URL: import.meta.env.VITE_PINTEREST_API_URL,
      VITE_PINTEREST_CLIENT_ID: import.meta.env.VITE_PINTEREST_CLIENT_ID,
      VITE_PINTEREST_CLIENT_SECRET: import.meta.env.VITE_PINTEREST_CLIENT_SECRET,
      VITE_NETLIFY_URL: import.meta.env.VITE_NETLIFY_URL,
    };

    // Validate environment variables
    const validatedEnv = envSchema.parse(envVars);
    
    // Log validation success without exposing values
    console.log('Environment variables validated successfully');
    
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      console.error('Environment validation failed. Missing or invalid variables:', missingVars);
      throw new Error(`Missing or invalid environment variables: ${missingVars}. Check .env.example for required variables.`);
    }
    
    console.error('Environment validation failed:', error);
    throw new Error('Failed to validate environment variables. Check .env.example for required variables.');
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