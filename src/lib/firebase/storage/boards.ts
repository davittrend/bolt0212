import { ref, set, get, remove } from 'firebase/database';
import type { BoardStorage, StorageResult } from './types';
import type { PinterestBoard } from '@/types/pinterest';
import { database } from '../database';
import { logFirebaseError } from '../errors';

export class FirebaseBoardStorage implements BoardStorage {
  async save(userId: string, accountId: string, boards: PinterestBoard[]): Promise<StorageResult<void>> {
    try {
      const boardsRef = ref(database, `users/${userId}/boards/${accountId}`);
      await set(boardsRef, boards);
      console.log(`Boards saved successfully for account: ${accountId}`);
      return { success: true };
    } catch (error) {
      logFirebaseError('Save Boards', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to save boards')
      };
    }
  }

  async get(userId: string, accountId: string): Promise<StorageResult<PinterestBoard[]>> {
    try {
      const boardsRef = ref(database, `users/${userId}/boards/${accountId}`);
      const snapshot = await get(boardsRef);
      
      if (!snapshot.exists()) {
        return { success: true, data: [] };
      }

      return { success: true, data: snapshot.val() };
    } catch (error) {
      logFirebaseError('Get Boards', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to get boards')
      };
    }
  }

  async getAll(userId: string): Promise<StorageResult<Record<string, PinterestBoard[]>>> {
    try {
      const boardsRef = ref(database, `users/${userId}/boards`);
      const snapshot = await get(boardsRef);
      
      if (!snapshot.exists()) {
        return { success: true, data: {} };
      }

      return { success: true, data: snapshot.val() };
    } catch (error) {
      logFirebaseError('Get All Boards', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to get boards')
      };
    }
  }

  async remove(userId: string, accountId: string): Promise<StorageResult<void>> {
    try {
      const boardsRef = ref(database, `users/${userId}/boards/${accountId}`);
      await remove(boardsRef);
      console.log(`Boards removed successfully for account: ${accountId}`);
      return { success: true };
    } catch (error) {
      logFirebaseError('Remove Boards', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to remove boards')
      };
    }
  }
}