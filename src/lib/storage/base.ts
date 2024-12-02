import { StorageError, ErrorCodes } from '../errors/base';
import { handleStorageOperation } from '../errors/handlers';

export abstract class BaseStorage {
  protected handleStorageError(operation: string, error: unknown): never {
    throw new StorageError(
      `Storage operation failed: ${operation}`,
      ErrorCodes.STORAGE.WRITE_FAILED,
      error
    );
  }

  protected getItem<T>(key: string): T | null {
    return handleStorageOperation(
      () => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      },
      { operation: `Read from storage: ${key}` }
    );
  }

  protected setItem(key: string, value: unknown): void {
    handleStorageOperation(
      () => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      { operation: `Write to storage: ${key}` }
    );
  }

  protected removeItem(key: string): void {
    handleStorageOperation(
      () => {
        localStorage.removeItem(key);
      },
      { operation: `Remove from storage: ${key}` }
    );
  }
}