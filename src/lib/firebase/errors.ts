import { FirebaseError } from 'firebase/app';
import { toast } from 'sonner';

export class FirebaseAuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: FirebaseError
  ) {
    super(message);
    this.name = 'FirebaseAuthError';
  }
}

export class FirebaseDatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly path?: string,
    public readonly originalError?: FirebaseError
  ) {
    super(message);
    this.name = 'FirebaseDatabaseError';
  }
}

export function handleFirebaseError(error: unknown): Error {
  console.error('Firebase operation failed:', error);

  if (error instanceof FirebaseError) {
    let handledError: Error;

    switch (error.code) {
      // Auth Errors
      case 'auth/invalid-email':
        handledError = new FirebaseAuthError('Invalid email address', error.code, error);
        break;
      case 'auth/user-disabled':
        handledError = new FirebaseAuthError('This account has been disabled', error.code, error);
        break;
      case 'auth/user-not-found':
        handledError = new FirebaseAuthError('User not found', error.code, error);
        break;
      case 'auth/wrong-password':
        handledError = new FirebaseAuthError('Incorrect password', error.code, error);
        break;
      case 'auth/email-already-in-use':
        handledError = new FirebaseAuthError('Email already in use', error.code, error);
        break;
      case 'auth/operation-not-allowed':
        handledError = new FirebaseAuthError('Operation not allowed', error.code, error);
        break;
      case 'auth/weak-password':
        handledError = new FirebaseAuthError('Password is too weak', error.code, error);
        break;
      case 'auth/invalid-credential':
        handledError = new FirebaseAuthError('Invalid credentials', error.code, error);
        break;
      case 'auth/network-request-failed':
        handledError = new FirebaseAuthError('Network error occurred', error.code, error);
        break;
      
      // Database Errors
      case 'permission-denied':
        handledError = new FirebaseDatabaseError('Permission denied', error.code, undefined, error);
        break;
      case 'unavailable':
        handledError = new FirebaseDatabaseError('Database is temporarily unavailable', error.code, undefined, error);
        break;
      case 'data-stale':
        handledError = new FirebaseDatabaseError('Database operation failed due to stale data', error.code, undefined, error);
        break;
      case 'disconnected':
        handledError = new FirebaseDatabaseError('Client is disconnected', error.code, undefined, error);
        break;
      
      default:
        handledError = new Error(error.message);
    }

    // Show toast notification for the error
    toast.error(handledError.message, {
      description: `Error Code: ${error.code}`,
      duration: 5000,
    });

    return handledError;
  }

  if (error instanceof Error) {
    toast.error(error.message, {
      duration: 5000,
    });
    return error;
  }

  const unknownError = new Error('An unknown error occurred');
  toast.error(unknownError.message, {
    duration: 5000,
  });
  return unknownError;
}

export function logFirebaseError(context: string, error: unknown): void {
  console.group(`Firebase Error: ${context}`);
  console.error('Error details:', error);
  
  if (error instanceof FirebaseError) {
    console.error('Firebase Error Code:', error.code);
    console.error('Firebase Error Message:', error.message);
    if (error.customData) {
      console.error('Custom Data:', error.customData);
    }
  }
  
  console.trace('Error Stack Trace:');
  console.groupEnd();
}