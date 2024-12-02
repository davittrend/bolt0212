import { env } from '@/lib/config/env';

export const PINTEREST_API_URL = 'https://api.pinterest.com/v5';
export const PINTEREST_OAUTH_URL = 'https://www.pinterest.com/oauth';

export const PINTEREST_SCOPES = [
  'boards:read',
  'pins:read',
  'pins:write',
  'user_accounts:read',
  'boards:write'
].join(',');

export function getPinterestRedirectUri(): string {
  return typeof window !== 'undefined' 
    ? `${window.location.origin}/callback`
    : '';
}

export function getAuthorizationHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
}

export function createPinterestAuthUrl(): string {
  const redirectUri = encodeURIComponent(getPinterestRedirectUri());
  const state = crypto.randomUUID();
  
  return `${PINTEREST_OAUTH_URL}/?client_id=${env.VITE_PINTEREST_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${PINTEREST_SCOPES}&state=${state}`;
}