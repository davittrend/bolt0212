export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, details);
    this.name = 'StorageError';
  }
}

export class APIError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, details);
    this.name = 'APIError';
  }
}

export const ErrorCodes = {
  STORAGE: {
    WRITE_FAILED: 'STORAGE_WRITE_FAILED',
    READ_FAILED: 'STORAGE_READ_FAILED',
    DELETE_FAILED: 'STORAGE_DELETE_FAILED',
    NOT_FOUND: 'STORAGE_NOT_FOUND',
  },
  API: {
    NETWORK_ERROR: 'API_NETWORK_ERROR',
    INVALID_RESPONSE: 'API_INVALID_RESPONSE',
    UNAUTHORIZED: 'API_UNAUTHORIZED',
  },
} as const;