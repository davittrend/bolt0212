import { env } from '@/lib/config/env';
import { PINTEREST_OAUTH_URL } from './constants';

export function getPinterestRedirectUri(): string {
  return typeof window !== 'undefined' 
    ? `${window.location.origin}/callback`
    : '';
}

export function getAuthorizationHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
}

export function createPinterestAuthUrl(scopes: string[]): string {
  const redirectUri = encodeURIComponent(getPinterestRedirectUri());
  const state = crypto.randomUUID();
  const scope = encodeURIComponent(scopes.join(','));
  
  return `${PINTEREST_OAUTH_URL}/?client_id=${env.VITE_PINTEREST_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
}

export function validatePinterestResponse(response: Response): Promise<any> {
  if (!response.ok) {
    return response.json().then(error => {
      throw new Error(error.message || 'Pinterest API request failed');
    });
  }
  return response.json();
}