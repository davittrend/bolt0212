import { LocalAccountStorage } from './accounts';
import { LocalBoardStorage } from './boards';
import type { Storage } from '../types';

export const storage: Storage = {
  accounts: new LocalAccountStorage(),
  boards: new LocalBoardStorage(),
};

export * from '../types';