import type { Database } from 'firebase/database';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface DatabaseStorage {
  database: Database;
  accounts: AccountStorage;
  boards: BoardStorage;
}

export interface AccountStorage {
  save(userId: string, account: PinterestAccount): Promise<StorageResult<void>>;
  get(userId: string, accountId: string): Promise<StorageResult<PinterestAccount>>;
  getAll(userId: string): Promise<StorageResult<PinterestAccount[]>>;
  remove(userId: string, accountId: string): Promise<StorageResult<void>>;
}

export interface BoardStorage {
  save(userId: string, accountId: string, boards: PinterestBoard[]): Promise<StorageResult<void>>;
  get(userId: string, accountId: string): Promise<StorageResult<PinterestBoard[]>>;
  getAll(userId: string): Promise<StorageResult<Record<string, PinterestBoard[]>>>;
  remove(userId: string, accountId: string): Promise<StorageResult<void>>;
}