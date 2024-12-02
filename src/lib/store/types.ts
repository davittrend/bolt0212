import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

export interface AccountState {
  accounts: PinterestAccount[];
  selectedAccountId: string | null;
  boards: Record<string, PinterestBoard[]>;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

export interface AccountStore extends AccountState {
  setAccounts: (accounts: PinterestAccount[]) => void;
  setSelectedAccount: (accountId: string | null) => void;
  addAccount: (account: PinterestAccount) => Promise<void>;
  setBoards: (accountId: string, boards: PinterestBoard[]) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  getAccount: (accountId: string) => PinterestAccount | undefined;
  initializeStore: (userId: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}