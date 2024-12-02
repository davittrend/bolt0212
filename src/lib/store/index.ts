import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { storage } from '../storage/local';
import { toast } from 'sonner';
import { handleError } from '../errors';
import type { AccountState, AccountStore } from './types';

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

      setAccounts: (accounts) => set(
        produce((state) => {
          state.accounts = accounts;
          state.error = null;
        })
      ),
      
      setSelectedAccount: (accountId) => set(
        produce((state) => {
          state.selectedAccountId = accountId;
          state.error = null;
        })
      ),

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
          
          set(
            produce((state) => {
              state.accounts = [...state.accounts, account];
              state.error = null;
            })
          );
          
          console.log('Account added successfully:', account.id);
        } catch (error) {
          const handledError = handleError(error, { 
            operation: 'Add Account',
            silent: true
          });
          get().setError(handledError.message);
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
          
          set(
            produce((state) => {
              state.boards[accountId] = boards;
              state.error = null;
            })
          );
          
          console.log('Boards updated successfully for account:', accountId);
        } catch (error) {
          const handledError = handleError(error, { 
            operation: 'Set Boards',
            silent: true
          });
          get().setError(handledError.message);
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
          
          if (!accountResult.success) {
            throw accountResult.error;
          }
          
          if (!boardsResult.success) {
            throw boardsResult.error;
          }

          set(
            produce((state) => {
              state.accounts = state.accounts.filter(a => a.id !== accountId);
              delete state.boards[accountId];
              if (state.selectedAccountId === accountId) {
                state.selectedAccountId = state.accounts[0]?.id || null;
              }
              state.error = null;
            })
          );
          
          console.log('Account removed successfully:', accountId);
        } catch (error) {
          const handledError = handleError(error, { 
            operation: 'Remove Account',
            silent: true
          });
          get().setError(handledError.message);
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },
      
      getAccount: (accountId) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) {
          const error = new Error(`Account not found: ${accountId}`);
          get().setError(error.message);
          throw error;
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

          if (!accountsResult.success) {
            throw accountsResult.error;
          }

          if (!boardsResult.success) {
            throw boardsResult.error;
          }

          set(
            produce((state) => {
              state.accounts = accountsResult.data || [];
              state.boards = boardsResult.data || {};
              state.initialized = true;
              state.selectedAccountId = accountsResult.data?.[0]?.id || null;
              state.error = null;
            })
          );

          console.log('Store initialized successfully');
        } catch (error) {
          const handledError = handleError(error, { 
            operation: 'Initialize Store',
            silent: true
          });
          set({ 
            error: handledError.message,
            initialized: true 
          });
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },
    }),
    {
      name: 'pinterest-accounts',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId,
      }),
    }
  )
);