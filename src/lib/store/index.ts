import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { onValue, ref, get, set, remove } from 'firebase/database';
import { database } from '../firebase';
import { auth } from '../firebase/auth';
import { handleFirebaseError } from '../firebase/errors';
import { toast } from 'sonner';
import type { AccountState, AccountStore } from './types';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

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
        set(
          produce((state) => {
            state.accounts = accounts;
            state.error = null;
          })
        );
      },
      
      setSelectedAccount: (accountId) => {
        console.log('Setting selected account:', accountId);
        set(
          produce((state) => {
            state.selectedAccountId = accountId;
            state.error = null;
          })
        );
      },

      setLoading: (loading) => set({ loading }),
      
      setError: (error) => {
        console.error('Store error:', error);
        set({ error });
      },
      
      addAccount: async (account) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        console.log('Adding account to Firebase:', account);
        try {
          get().setLoading(true);
          const accountRef = ref(database, `users/${userId}/accounts/${account.id}`);
          await set(accountRef, account);
          
          console.log('Account saved to Firebase, updating store');
          set(
            produce((state) => {
              state.accounts = [...state.accounts, account];
              state.error = null;
            })
          );
        } catch (error) {
          const handledError = handleFirebaseError(error);
          console.error('Failed to add account:', handledError);
          toast.error(`Failed to add account: ${handledError.message}`);
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },
      
      setBoards: async (accountId, boards) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        console.log('Saving boards to Firebase:', { accountId, boardCount: boards.length });
        try {
          get().setLoading(true);
          const boardsRef = ref(database, `users/${userId}/boards/${accountId}`);
          await set(boardsRef, boards);
          
          console.log('Boards saved to Firebase, updating store');
          set(
            produce((state) => {
              state.boards[accountId] = boards;
              state.error = null;
            })
          );
        } catch (error) {
          const handledError = handleFirebaseError(error);
          console.error('Failed to save boards:', handledError);
          toast.error(`Failed to save boards: ${handledError.message}`);
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },

      removeAccount: async (accountId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        console.log('Removing account from Firebase:', accountId);
        try {
          get().setLoading(true);
          await Promise.all([
            remove(ref(database, `users/${userId}/accounts/${accountId}`)),
            remove(ref(database, `users/${userId}/boards/${accountId}`))
          ]);

          console.log('Account removed from Firebase, updating store');
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
        } catch (error) {
          const handledError = handleFirebaseError(error);
          console.error('Failed to remove account:', handledError);
          toast.error(`Failed to remove account: ${handledError.message}`);
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      },
      
      getAccount: (accountId) => {
        return get().accounts.find(a => a.id === accountId);
      },

      initializeStore: async (userId) => {
        console.log('Initializing store for user:', userId);
        if (get().initialized) {
          console.log('Store already initialized');
          return;
        }

        try {
          get().setLoading(true);
          const accountsRef = ref(database, `users/${userId}/accounts`);
          const boardsRef = ref(database, `users/${userId}/boards`);

          console.log('Fetching initial data from Firebase');
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

          console.log('Initial data loaded:', { accountCount: accounts.length, boardCount: Object.keys(boards).length });
          set(
            produce((state) => {
              state.accounts = accounts;
              state.boards = boards;
              state.initialized = true;
              state.selectedAccountId = accounts[0]?.id || null;
              state.error = null;
            })
          );

          // Set up real-time listeners
          console.log('Setting up real-time listeners');
          onValue(accountsRef, 
            (snapshot) => {
              const updatedAccounts: PinterestAccount[] = [];
              snapshot.forEach((childSnapshot) => {
                updatedAccounts.push({
                  id: childSnapshot.key!,
                  ...childSnapshot.val(),
                });
              });
              
              console.log('Accounts updated:', updatedAccounts.length);
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
              console.error('Account sync error:', handledError);
              set({ error: handledError.message });
              toast.error(`Database sync error: ${handledError.message}`);
            }
          );

          onValue(boardsRef,
            (snapshot) => {
              const updatedBoards: Record<string, PinterestBoard[]> = {};
              snapshot.forEach((childSnapshot) => {
                updatedBoards[childSnapshot.key!] = childSnapshot.val();
              });
              
              console.log('Boards updated:', Object.keys(updatedBoards).length);
              set(
                produce((state) => {
                  state.boards = updatedBoards;
                  state.error = null;
                })
              );
            },
            (error) => {
              const handledError = handleFirebaseError(error);
              console.error('Board sync error:', handledError);
              set({ error: handledError.message });
              toast.error(`Board sync error: ${handledError.message}`);
            }
          );
        } catch (error) {
          const handledError = handleFirebaseError(error);
          console.error('Store initialization error:', handledError);
          set({ 
            error: handledError.message,
            initialized: true 
          });
          toast.error(`Store initialization error: ${handledError.message}`);
          throw handledError;
        } finally {
          get().setLoading(false);
        }
      }
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId,
      }),
    }
  )
);
