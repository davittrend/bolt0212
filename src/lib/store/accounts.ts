import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { onValue, ref, get, set, remove } from 'firebase/database';
import { database } from '../firebase';
import { auth } from '../firebase/auth';
import { handleFirebaseError } from '../firebase/errors';
import { toast } from 'sonner';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

interface AccountState {
  accounts: PinterestAccount[];
  selectedAccountId: string | null;
  boards: Record<string, PinterestBoard[]>;
  initialized: boolean;
  error: string | null;
  setAccounts: (accounts: PinterestAccount[]) => void;
  setSelectedAccount: (accountId: string | null) => void;
  setBoards: (accountId: string, boards: PinterestBoard[]) => Promise<void>;
  getAccount: (accountId: string) => PinterestAccount;
  removeAccount: (accountId: string) => Promise<void>;
  initializeStore: (userId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccountId: null,
      boards: {},
      initialized: false,
      error: null,

      setAccounts: (accounts) => set(
        produce((state) => {
          state.accounts = accounts;
        })
      ),
      
      setSelectedAccount: (accountId) => set(
        produce((state) => {
          state.selectedAccountId = accountId;
        })
      ),
      
      setBoards: async (accountId, boards) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          await set(ref(database, `users/${userId}/boards/${accountId}`), boards);
          
          set(
            produce((state) => {
              state.boards[accountId] = boards;
            })
          );
        } catch (error) {
          const handledError = handleFirebaseError(error);
          toast.error(`Failed to save boards: ${handledError.message}`);
          throw handledError;
        }
      },

      removeAccount: async (accountId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          await Promise.all([
            remove(ref(database, `users/${userId}/accounts/${accountId}`)),
            remove(ref(database, `users/${userId}/boards/${accountId}`))
          ]);

          set(
            produce((state) => {
              state.accounts = state.accounts.filter(a => a.id !== accountId);
              delete state.boards[accountId];
              if (state.selectedAccountId === accountId) {
                state.selectedAccountId = state.accounts[0]?.id || null;
              }
            })
          );
        } catch (error) {
          const handledError = handleFirebaseError(error);
          toast.error(`Failed to remove account: ${handledError.message}`);
          throw handledError;
        }
      },

      setError: (error) => set(
        produce((state) => {
          state.error = error;
        })
      ),
      
      getAccount: (accountId) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) {
          throw new Error('Account not found');
        }
        return account;
      },

      initializeStore: async (userId) => {
        if (get().initialized) return;

        try {
          const accountsRef = ref(database, `users/${userId}/accounts`);
          const boardsRef = ref(database, `users/${userId}/boards`);

          // Initial data load
          const [accountsSnapshot, boardsSnapshot] = await Promise.all([
            get(accountsRef),
            get(boardsRef)
          ]);

          const accounts: PinterestAccount[] = [];
          accountsSnapshot.forEach((childSnapshot) => {
            accounts.push({
              id: childSnapshot.key!,
              ...childSnapshot.val(),
            });
          });

          const boards: Record<string, PinterestBoard[]> = {};
          boardsSnapshot.forEach((childSnapshot) => {
            boards[childSnapshot.key!] = childSnapshot.val();
          });

          set(
            produce((state) => {
              state.accounts = accounts;
              state.boards = boards;
              state.initialized = true;
              state.selectedAccountId = accounts[0]?.id || null;
              state.error = null;
            })
          );

          // Set up real-time listeners with error handling
          onValue(accountsRef, 
            (snapshot) => {
              const updatedAccounts: PinterestAccount[] = [];
              snapshot.forEach((childSnapshot) => {
                updatedAccounts.push({
                  id: childSnapshot.key!,
                  ...childSnapshot.val(),
                });
              });
              
              set(
                produce((state) => {
                  state.accounts = updatedAccounts;
                  if (state.selectedAccountId && !updatedAccounts.find(a => a.id === state.selectedAccountId)) {
                    state.selectedAccountId = updatedAccounts[0]?.id || null;
                  }
                  state.error = null;
                })
              );
            },
            (error) => {
              const handledError = handleFirebaseError(error);
              set(state => ({ ...state, error: handledError.message }));
              toast.error(`Database sync error: ${handledError.message}`);
            }
          );

          onValue(boardsRef,
            (snapshot) => {
              const updatedBoards: Record<string, PinterestBoard[]> = {};
              snapshot.forEach((childSnapshot) => {
                updatedBoards[childSnapshot.key!] = childSnapshot.val();
              });
              
              set(
                produce((state) => {
                  state.boards = updatedBoards;
                  state.error = null;
                })
              );
            },
            (error) => {
              const handledError = handleFirebaseError(error);
              set(state => ({ ...state, error: handledError.message }));
              toast.error(`Board sync error: ${handledError.message}`);
            }
          );
        } catch (error) {
          const handledError = handleFirebaseError(error);
          set(state => ({ 
            ...state, 
            error: handledError.message,
            initialized: true 
          }));
          toast.error(`Store initialization error: ${handledError.message}`);
          throw handledError;
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