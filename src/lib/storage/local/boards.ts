import { BaseStorage } from '../base';
import type { BoardStorage, StorageResult } from '../types';
import type { PinterestBoard } from '@/types/pinterest';
import { handleStorageOperation } from '../../errors/handlers';

const BOARDS_KEY = 'pinterest_boards';

export class LocalBoardStorage extends BaseStorage implements BoardStorage {
  private getStorageKey(userId: string): string {
    return `${BOARDS_KEY}_${userId}`;
  }

  private getAllBoards(userId: string): Record<string, PinterestBoard[]> {
    return this.getItem(this.getStorageKey(userId)) || {};
  }

  private saveAllBoards(userId: string, boards: Record<string, PinterestBoard[]>): void {
    this.setItem(this.getStorageKey(userId), boards);
  }

  async save(userId: string, accountId: string, boards: PinterestBoard[]): Promise<StorageResult<void>> {
    return handleStorageOperation(
      () => {
        const allBoards = this.getAllBoards(userId);
        allBoards[accountId] = boards;
        this.saveAllBoards(userId, allBoards);
        return { success: true };
      },
      { operation: `Save boards for account: ${accountId}` }
    );
  }

  async get(userId: string, accountId: string): Promise<StorageResult<PinterestBoard[]>> {
    return handleStorageOperation(
      () => {
        const allBoards = this.getAllBoards(userId);
        return {
          success: true,
          data: allBoards[accountId] || []
        };
      },
      { operation: `Get boards for account: ${accountId}` }
    );
  }

  async getAll(userId: string): Promise<StorageResult<Record<string, PinterestBoard[]>>> {
    return handleStorageOperation(
      () => {
        const allBoards = this.getAllBoards(userId);
        return {
          success: true,
          data: allBoards
        };
      },
      { operation: 'Get all boards' }
    );
  }

  async remove(userId: string, accountId: string): Promise<StorageResult<void>> {
    return handleStorageOperation(
      () => {
        const allBoards = this.getAllBoards(userId);
        delete allBoards[accountId];
        this.saveAllBoards(userId, allBoards);
        return { success: true };
      },
      { operation: `Remove boards for account: ${accountId}` }
    );
  }
}