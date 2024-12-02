import { toast } from 'sonner';
import { AppError } from './base';

interface ErrorContext {
  operation: string;
  silent?: boolean;
}

export function handleError(error: unknown, context: ErrorContext): AppError {
  console.group(`Error in ${context.operation}`);
  console.error('Error details:', error);
  console.trace('Stack trace:');
  console.groupEnd();

  const appError = error instanceof AppError 
    ? error 
    : new AppError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        'UNKNOWN_ERROR',
        error
      );

  if (!context.silent) {
    toast.error(appError.message, {
      description: `Error in ${context.operation}`,
      duration: 5000,
    });
  }

  return appError;
}

export function handleStorageOperation<T>(
  operation: () => T,
  context: ErrorContext
): T {
  try {
    return operation();
  } catch (error) {
    throw handleError(error, context);
  }
}