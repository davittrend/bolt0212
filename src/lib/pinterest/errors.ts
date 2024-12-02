export class PinterestError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'PinterestError';
  }
}

export class PinterestAuthError extends PinterestError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, code, details);
    this.name = 'PinterestAuthError';
  }
}

export class PinterestAPIError extends PinterestError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, code, details);
    this.name = 'PinterestAPIError';
  }
}

export function handlePinterestError(error: unknown): PinterestError {
  if (error instanceof PinterestError) {
    return error;
  }

  if (error instanceof Error) {
    return new PinterestError(error.message);
  }

  return new PinterestError('An unknown error occurred');
}