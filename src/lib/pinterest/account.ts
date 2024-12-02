import { useAccountStore } from '@/lib/store';
import { exchangePinterestCode, fetchPinterestBoards } from './api';
import { handleError } from '../errors';
import type { PinterestAccount } from '@/types/pinterest';

export async function connectPinterestAccount(code: string): Promise<void> {
  console.group('Pinterest Account Connection');
  console.log('Starting connection process with code:', code.substring(0, 10) + '...');

  try {
    // Exchange code for token and user data
    console.log('Exchanging code for token...');
    const { token, user } = await exchangePinterestCode(code);
    console.log('Successfully obtained token and user data:', {
      username: user.username,
      accountType: user.account_type,
      tokenExpiry: token.expires_in
    });

    // Create new account object
    const newAccount: PinterestAccount = {
      id: user.username,
      user,
      token,
      lastRefreshed: Date.now(),
    };

    // Save account to store
    const store = useAccountStore.getState();
    console.log('Saving account to store:', newAccount.id);
    await store.addAccount(newAccount);
    console.log('Account saved successfully');

    // Fetch and save boards
    console.log('Fetching boards for account:', newAccount.id);
    const boards = await fetchPinterestBoards(token.access_token);
    console.log(`Retrieved ${boards.length} boards`);
    
    await store.setBoards(newAccount.id, boards);
    console.log('Boards saved successfully');

    // Set as selected account if it's the first one
    if (store.accounts.length === 1) {
      console.log('Setting as selected account');
      store.setSelectedAccount(newAccount.id);
    }

    console.log('Account connection completed successfully');
  } catch (error) {
    console.error('Account connection failed:', error);
    throw handleError(error, { 
      operation: 'Connect Pinterest Account',
      silent: true // Already handled by store
    });
  } finally {
    console.groupEnd();
  }
}