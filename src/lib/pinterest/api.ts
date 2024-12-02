import { env } from '@/lib/config/env';
import { PINTEREST_API_URL, getPinterestRedirectUri } from './config';
import { APIError, ErrorCodes } from '../errors';
import type { PinterestToken, PinterestUser, PinterestBoard } from '@/types/pinterest';

export async function exchangePinterestCode(code: string): Promise<{ token: PinterestToken; user: PinterestUser }> {
  console.group('Pinterest Code Exchange');
  console.log('Exchanging code:', code.substring(0, 10) + '...');

  try {
    const response = await fetch('/.netlify/functions/pinterest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        redirectUri: getPinterestRedirectUri(),
        clientId: env.VITE_PINTEREST_CLIENT_ID,
        clientSecret: env.VITE_PINTEREST_CLIENT_SECRET
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Code exchange failed:', {
        status: response.status,
        error: data
      });
      throw new APIError(
        data.message || 'Failed to exchange Pinterest code',
        ErrorCodes.API.UNAUTHORIZED,
        data
      );
    }

    console.log('Code exchange successful');
    return data;
  } catch (error) {
    console.error('Code exchange error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to connect to Pinterest API',
      ErrorCodes.API.NETWORK_ERROR,
      error
    );
  } finally {
    console.groupEnd();
  }
}

export async function fetchPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  console.group('Pinterest Boards Fetch');
  console.log('Fetching boards with token:', accessToken.substring(0, 10) + '...');

  try {
    const response = await fetch(`${PINTEREST_API_URL}/boards`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Boards fetch failed:', {
        status: response.status,
        error: data
      });
      throw new APIError(
        data.message || 'Failed to fetch boards',
        ErrorCodes.API.UNAUTHORIZED,
        data
      );
    }

    const boards = data.items || [];
    console.log(`Successfully fetched ${boards.length} boards`);
    return boards;
  } catch (error) {
    console.error('Boards fetch error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to fetch Pinterest boards',
      ErrorCodes.API.NETWORK_ERROR,
      error
    );
  } finally {
    console.groupEnd();
  }
}