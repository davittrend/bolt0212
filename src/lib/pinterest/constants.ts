export const PINTEREST_API_URL = 'https://api.pinterest.com/v5';
export const PINTEREST_OAUTH_URL = 'https://www.pinterest.com/oauth';

export const PINTEREST_SCOPES = [
  'boards:read',
  'pins:read',
  'pins:write',
  'user_accounts:read',
  'boards:write'
] as const;

export const PIN_STATUSES = {
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const;

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;