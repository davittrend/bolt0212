import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { validateFirebaseConfig } from './utils/env-validator';

class FirebaseInitializer {
  private static instance: FirebaseApp | null = null;

  static initialize(): FirebaseApp {
    if (!this.instance) {
      try {
        const config = validateFirebaseConfig();
        
        // Log initialization attempt without exposing sensitive data
        console.log('Initializing Firebase app...');
        
        this.instance = getApps().length === 0 
          ? initializeApp(config) 
          : getApps()[0];
        
        console.log('Firebase app initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
      }
    }
    return this.instance;
  }
}

export const app = FirebaseInitializer.initialize();