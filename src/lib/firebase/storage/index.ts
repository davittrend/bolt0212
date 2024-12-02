import { FirebaseAccountStorage } from './accounts';
import { FirebaseBoardStorage } from './boards';
import type { DatabaseStorage } from './types';
import { database } from '../database';

export const storage: DatabaseStorage = {
  database,
  accounts: new FirebaseAccountStorage(),
  boards: new FirebaseBoardStorage(),
};

export * from './types';