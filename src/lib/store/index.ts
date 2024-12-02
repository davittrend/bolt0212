import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { storage } from '@/lib/storage/local';
import { toast } from 'sonner';
import { handleError } from '@/lib/errors';
import type { AccountState, AccountStore } from './types';
import type { PinterestAccount } from '@/types/pinterest';

const initialState: AccountState = {
  accounts: [],
  selectedAccountId: null,
  boards: {},
  initialized: false,
  loading: false,
  error: null,
};

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAccounts: (accounts) => {
        console.log('Setting accounts:', accounts);
        set(produce(state => {
          state.accounts = accounts;
          state.error = null;
        }));
      },
      
      setSelectedAccount: (accountId) => {
        console.log('Setting selected account:', accountId);
        set(produce(state => {
          state.selectedAccountId = accountId;
          state.error = null;
        }));
      },

      setLoading: (loading) => set({ loading }),
      
      setError: (error) => {
        console.error('Store error:', error);
        set({ error });
      },
      
      addAccount: async (account) => {
        try {
          get().setLoading(true);
          console.log('Adding account:', account.id);
          
          const result = await storage.accounts.save('test-user', account);
          if (!result.success) {
            throw result.error;
          }
          
          set(produce(state => {
            state.accounts.push(account);
            state.error = null;
          }));
          
          toast.success('Account added successfully');
        } catch (error) {
          const handledError = handleError(error, { operation: 'Add Account' });
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },
      
      setBoards: async (accountId, boards) => {
        try {
          get().setLoading(true);
          console.log('Setting boards for account:', accountId);
          
          const result = await storage.boards.save('test-user', accountId, boards);
          if (!result.success) {
            throw result.error;
          }
          
          set(produce(state => {
            state.boards[accountId] = boards;
            state.error = null;
          }));
          
          toast.success('Boards updated successfully');
        } catch (error) {
          const handledError = handleError(error, { operation: 'Set Boards' });
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },

      removeAccount: async (accountId) => {
        try {
          get().setLoading(true);
          console.log('Removing account:', accountId);
          
          const [accountResult, boardsResult] = await Promise.all([
            storage.accounts.remove('test-user', accountId),
            storage.boards.remove('test-user', accountId)
          ]);
          
          if (!accountResult.success) throw accountResult.error;
          if (!boardsResult.success) throw boardsResult.error;

          set(produce(state => {
            state.accounts = state.accounts.filter(a => a.id !== accountId);
            delete state.boards[accountId];
            if (state.selectedAccountId === accountId) {
              state.selectedAccountId = state.accounts[0]?.id || null;
            }
            state.error = null;
          }));
          
          toast.success('Account removed successfully');
        } catch (error) {
          const handledError = handleError(error, { operation: 'Remove Account' });
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },
      
      getAccount: (accountId) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) {
          throw new Error('Account not found');
        }
        return account;
      },

      initializeStore: async () => {
        if (get().initialized) {
          console.log('Store already initialized');
          return;
        }

        try {
          get().setLoading(true);
          console.log('Initializing store');

          const [accountsResult, boardsResult] = await Promise.all([
            storage.accounts.getAll('test-user'),
            storage.boards.getAll('test-user')
          ]);

          if (!accountsResult.success) throw accountsResult.error;
          if (!boardsResult.success) throw boardsResult.error;

          set(produce(state => {
            state.accounts = accountsResult.data || [];
            state.boards = boardsResult.data || {};
            state.initialized = true;
            state.selectedAccountId = accountsResult.data?.[0]?.id || null;
            state.error = null;
          }));

          console.log('Store initialized successfully');
        } catch (error) {
          const handledError = handleError(error, { operation: 'Initialize Store' });
          set({ 
            error: handledError.message,
            initialized: true 
          });
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      }
    }),
    {
      name: 'pinterest-accounts',
      partialize: (state) => ({
        accounts: state.accounts,
        boards: state.boards,
        selectedAccountId: state.selectedAccountId,
      }),
    }
  )
);