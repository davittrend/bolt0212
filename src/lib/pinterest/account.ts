import { auth } from '@/lib/firebase';
import { useAccountStore } from '@/lib/store';
import { exchangePinterestCode, fetchPinterestBoards } from './api';
import type { PinterestAccount } from '@/types/pinterest';

export async function connectPinterestAccount(code: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log('Starting Pinterest account connection process');

  try {
    // Exchange code for token and user data
    const { token, user } = await exchangePinterestCode(code);
    console.log('Successfully exchanged Pinterest code for token');

    // Create new account object
    const newAccount: PinterestAccount = {
      id: user.username,
      user,
      token,
      lastRefreshed: Date.now(),
    };

    // Save account to store
    const store = useAccountStore.getState();
    
    // Check if account already exists
    const existingAccount = store.accounts.find(a => a.id === newAccount.id);
    if (existingAccount) {
      throw new Error('This Pinterest account is already connected');
    }
    
    await store.addAccount(newAccount);
    console.log('Saved Pinterest account to database');

    // Fetch and save boards
    const boards = await fetchPinterestBoards(token.access_token);
    await store.setBoards(newAccount.id, boards);
    console.log('Saved Pinterest boards to database');

    // Set as selected account if it's the first one
    if (store.accounts.length === 1) {
      store.setSelectedAccount(newAccount.id);
    }
  } catch (error) {
    console.error('Failed to connect Pinterest account:', error);
    throw error;
  }
}