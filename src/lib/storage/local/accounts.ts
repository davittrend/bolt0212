import { BaseStorage } from '../base';
import type { AccountStorage, StorageResult } from '../types';
import type { PinterestAccount } from '@/types/pinterest';
import { StorageError, ErrorCodes } from '../../errors/base';
import { handleStorageOperation } from '../../errors/handlers';

const ACCOUNTS_KEY = 'pinterest_accounts';

export class LocalAccountStorage extends BaseStorage implements AccountStorage {
  private getStorageKey(userId: string): string {
    return `${ACCOUNTS_KEY}_${userId}`;
  }

  private getAllAccounts(userId: string): Record<string, PinterestAccount> {
    return this.getItem(this.getStorageKey(userId)) || {};
  }

  private saveAllAccounts(userId: string, accounts: Record<string, PinterestAccount>): void {
    this.setItem(this.getStorageKey(userId), accounts);
  }

  async save(userId: string, account: PinterestAccount): Promise<StorageResult<void>> {
    return handleStorageOperation(
      () => {
        const accounts = this.getAllAccounts(userId);
        accounts[account.id] = account;
        this.saveAllAccounts(userId, accounts);
        return { success: true };
      },
      { operation: `Save account: ${account.id}` }
    );
  }

  async get(userId: string, accountId: string): Promise<StorageResult<PinterestAccount>> {
    return handleStorageOperation(
      () => {
        const accounts = this.getAllAccounts(userId);
        const account = accounts[accountId];
        
        if (!account) {
          throw new StorageError(
            'Account not found',
            ErrorCodes.STORAGE.NOT_FOUND
          );
        }

        return { success: true, data: account };
      },
      { operation: `Get account: ${accountId}` }
    );
  }

  async getAll(userId: string): Promise<StorageResult<PinterestAccount[]>> {
    return handleStorageOperation(
      () => {
        const accounts = this.getAllAccounts(userId);
        return {
          success: true,
          data: Object.values(accounts)
        };
      },
      { operation: 'Get all accounts' }
    );
  }

  async remove(userId: string, accountId: string): Promise<StorageResult<void>> {
    return handleStorageOperation(
      () => {
        const accounts = this.getAllAccounts(userId);
        delete accounts[accountId];
        this.saveAllAccounts(userId, accounts);
        return { success: true };
      },
      { operation: `Remove account: ${accountId}` }
    );
  }
}