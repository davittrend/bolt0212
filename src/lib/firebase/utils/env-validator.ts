import { FirebaseOptions } from 'firebase/app';
import { env } from '@/lib/config/env';

export function validateFirebaseConfig(): FirebaseOptions {
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error('Firebase project ID is required');
  }

  const config: FirebaseOptions = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: projectId,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
  };

  // Validate required fields
  const requiredFields: (keyof FirebaseOptions)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'databaseURL'
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required Firebase configuration: ${field}`);
    }
  }

  // Log successful validation without exposing values
  console.log('Firebase configuration validated successfully');

  return config;
}