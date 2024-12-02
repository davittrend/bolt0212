import { ref, set, get, remove } from 'firebase/database';
import type { AccountStorage, StorageResult } from './types';
import type { PinterestAccount } from '@/types/pinterest';
import { database } from '../database';
import { logFirebaseError } from '../errors';

export class FirebaseAccountStorage implements AccountStorage {
  async save(userId: string, account: PinterestAccount): Promise<StorageResult<void>> {
    try {
      const accountRef = ref(database, `users/${userId}/accounts/${account.id}`);
      await set(accountRef, account);
      console.log(`Account saved successfully: ${account.id}`);
      return { success: true };
    } catch (error) {
      logFirebaseError('Save Account', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to save account')
      };
    }
  }

  async get(userId: string, accountId: string): Promise<StorageResult<PinterestAccount>> {
    try {
      const accountRef = ref(database, `users/${userId}/accounts/${accountId}`);
      const snapshot = await get(accountRef);
      
      if (!snapshot.exists()) {
        return { 
          success: false, 
          error: new Error('Account not found') 
        };
      }

      return { 
        success: true, 
        data: snapshot.val() 
      };
    } catch (error) {
      logFirebaseError('Get Account', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to get account')
      };
    }
  }

  async getAll(userId: string): Promise<StorageResult<PinterestAccount[]>> {
    try {
      const accountsRef = ref(database, `users/${userId}/accounts`);
      const snapshot = await get(accountsRef);
      
      if (!snapshot.exists()) {
        return { success: true, data: [] };
      }

      const accounts: PinterestAccount[] = [];
      snapshot.forEach((child) => {
        accounts.push({
          id: child.key!,
          ...child.val()
        });
      });

      return { success: true, data: accounts };
    } catch (error) {
      logFirebaseError('Get All Accounts', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to get accounts')
      };
    }
  }

  async remove(userId: string, accountId: string): Promise<StorageResult<void>> {
    try {
      const accountRef = ref(database, `users/${userId}/accounts/${accountId}`);
      await remove(accountRef);
      console.log(`Account removed successfully: ${accountId}`);
      return { success: true };
    } catch (error) {
      logFirebaseError('Remove Account', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to remove account')
      };
    }
  }
}