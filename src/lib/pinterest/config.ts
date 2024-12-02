import { env } from '@/lib/config/env';

export const PINTEREST_API_URL = env.VITE_PINTEREST_API_URL;
export const PINTEREST_OAUTH_URL = 'https://www.pinterest.com/oauth';

export const PINTEREST_SCOPES = [
  'boards:read',
  'pins:read',
  'pins:write',
  'user_accounts:read',
  'boards:write'
] as const;

export function getPinterestRedirectUri(): string {
  // In development, use the Vite dev server URL
  if (import.meta.env.DEV) {
    return `${window.location.origin}/callback`;
  }
  
  // In production, use the NETLIFY_URL environment variable or fallback to window.location
  const netlifyUrl = import.meta.env.VITE_NETLIFY_URL;
  return netlifyUrl 
    ? `${netlifyUrl}/callback`
    : `${window.location.origin}/callback`;
}

export function getAuthorizationHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
}