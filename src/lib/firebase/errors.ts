import { FirebaseError } from 'firebase/app';

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
  if (error instanceof FirebaseError) {
    switch (error.code) {
      // Auth Errors
      case 'auth/invalid-email':
        return new FirebaseAuthError('Invalid email address', error.code, error);
      case 'auth/user-disabled':
        return new FirebaseAuthError('This account has been disabled', error.code, error);
      case 'auth/user-not-found':
        return new FirebaseAuthError('User not found', error.code, error);
      case 'auth/wrong-password':
        return new FirebaseAuthError('Incorrect password', error.code, error);
      case 'auth/email-already-in-use':
        return new FirebaseAuthError('Email already in use', error.code, error);
      case 'auth/operation-not-allowed':
        return new FirebaseAuthError('Operation not allowed', error.code, error);
      case 'auth/weak-password':
        return new FirebaseAuthError('Password is too weak', error.code, error);
      case 'auth/invalid-credential':
        return new FirebaseAuthError('Invalid credentials', error.code, error);
      case 'auth/network-request-failed':
        return new FirebaseAuthError('Network error occurred', error.code, error);
      
      // Database Errors
      case 'permission-denied':
        return new FirebaseDatabaseError('Permission denied', error.code, undefined, error);
      case 'unavailable':
        return new FirebaseDatabaseError('Database is temporarily unavailable', error.code, undefined, error);
      case 'data-stale':
        return new FirebaseDatabaseError('Database operation failed due to stale data', error.code, undefined, error);
      case 'disconnected':
        return new FirebaseDatabaseError('Client is disconnected', error.code, undefined, error);
      
      default:
        return new Error(error.message);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('An unknown error occurred');
}