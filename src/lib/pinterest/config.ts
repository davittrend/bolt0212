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