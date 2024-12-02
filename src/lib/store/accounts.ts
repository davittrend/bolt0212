import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { writeToDatabase, readFromDatabase, deleteFromDatabase } from '../firebase/database';
import { auth } from '../firebase/auth';
import { handleFirebaseError, logFirebaseError } from '../firebase/errors';
import { toast } from 'sonner';
import type { AccountStore } from './types';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

const initialState: AccountStore = {
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
      
      setError: (error) => set({ error }),
      
      addAccount: async (account) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          const error = new Error('User not authenticated');
          toast.error(error.message);
          throw error;
        }

        try {
          get().setLoading(true);
          const path = `users/${userId}/accounts/${account.id}`;
          await writeToDatabase(path, account);
          
          set(
            produce((state) => {
              state.accounts = [...state.accounts, account];
              state.error = null;
            })
          );
          
          toast.success('Account added successfully');
        } catch (error) {
          logFirebaseError('Add Account', error);
          const handledError = handleFirebaseError(error);
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },
      
      setBoards: async (accountId, boards) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          const error = new Error('User not authenticated');
          toast.error(error.message);
          throw error;
        }

        try {
          get().setLoading(true);
          const path = `users/${userId}/boards/${accountId}`;
          await writeToDatabase(path, boards);
          
          set(
            produce((state) => {
              state.boards[accountId] = boards;
              state.error = null;
            })
          );
          
          toast.success('Boards updated successfully');
        } catch (error) {
          logFirebaseError('Set Boards', error);
          const handledError = handleFirebaseError(error);
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },

      removeAccount: async (accountId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          const error = new Error('User not authenticated');
          toast.error(error.message);
          throw error;
        }

        try {
          get().setLoading(true);
          await Promise.all([
            deleteFromDatabase(`users/${userId}/accounts/${accountId}`),
            deleteFromDatabase(`users/${userId}/boards/${accountId}`)
          ]);

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
          
          toast.success('Account removed successfully');
        } catch (error) {
          logFirebaseError('Remove Account', error);
          const handledError = handleFirebaseError(error);
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },
      
      getAccount: (accountId) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) {
          const error = new Error('Account not found');
          toast.error(error.message);
          throw error;
        }
        return account;
      },

      initializeStore: async (userId: string) => {
        if (get().initialized) return;

        try {
          get().setLoading(true);
          console.log('Initializing store for user:', userId);

          const [accounts, boards] = await Promise.all([
            readFromDatabase<PinterestAccount[]>(`users/${userId}/accounts`),
            readFromDatabase<Record<string, PinterestBoard[]>>(`users/${userId}/boards`)
          ]);

          set(
            produce((state) => {
              state.accounts = accounts || [];
              state.boards = boards || {};
              state.initialized = true;
              state.selectedAccountId = accounts?.[0]?.id || null;
              state.error = null;
            })
          );

          console.log('Store initialized successfully');
          toast.success('Account data loaded successfully');
        } catch (error) {
          logFirebaseError('Initialize Store', error);
          const handledError = handleFirebaseError(error);
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId,
      }),
    }
  )
);