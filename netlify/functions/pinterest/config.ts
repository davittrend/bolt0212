export const PINTEREST_API_URL = 'https://api.pinterest.com/v5';
export const PINTEREST_OAUTH_URL = 'https://www.pinterest.com/oauth';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface PinterestConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function validateConfig(config: Partial<PinterestConfig>): PinterestConfig {
  if (!config.clientId) {
    throw new Error('Pinterest client ID is required');
  }
  if (!config.clientSecret) {
    throw new Error('Pinterest client secret is required');
  }
  if (!config.redirectUri) {
    throw new Error('Pinterest redirect URI is required');
  }
  return config as PinterestConfig;
}