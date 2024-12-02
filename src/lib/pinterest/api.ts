import { env } from '@/lib/config/env';
import { 
  PINTEREST_API_URL, 
  PINTEREST_OAUTH_URL,
  PINTEREST_SCOPES,
  getPinterestRedirectUri,
  getAuthorizationHeader
} from './config';
import { PinterestAuthError, PinterestAPIError } from './errors';
import type { PinterestBoard, PinterestToken, PinterestUser } from '@/types/pinterest';

export function getPinterestAuthUrl(): string {
  const redirectUri = encodeURIComponent(getPinterestRedirectUri());
  const state = crypto.randomUUID();
  
  return `${PINTEREST_OAUTH_URL}/?client_id=${env.VITE_PINTEREST_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${PINTEREST_SCOPES}&state=${state}`;
}

export async function exchangePinterestCode(code: string): Promise<{ token: PinterestToken; user: PinterestUser }> {
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
      throw new PinterestAuthError(
        data.message || 'Failed to exchange Pinterest code',
        data.code,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof PinterestAuthError) {
      throw error;
    }
    throw new PinterestAuthError(
      'Failed to connect to Pinterest',
      'NETWORK_ERROR',
      error
    );
  }
}

export async function fetchPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  try {
    const response = await fetch('/.netlify/functions/pinterest', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new PinterestAPIError(
        data.message || 'Failed to fetch boards',
        data.code,
        data.details
      );
    }

    return data.items || [];
  } catch (error) {
    if (error instanceof PinterestAPIError) {
      throw error;
    }
    throw new PinterestAPIError(
      'Failed to fetch Pinterest boards',
      'NETWORK_ERROR',
      error
    );
  }
}