import { Handler } from '@netlify/functions';
import { corsHeaders, createResponse, fetchFromPinterest } from './utils';
import { validateConfig, PINTEREST_API_URL } from './config';
import { URLSearchParams } from 'url';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { code, redirectUri, clientId, clientSecret } = JSON.parse(event.body || '{}');
    const config = validateConfig({ clientId, clientSecret, redirectUri });

    // Exchange code for token
    const tokenResponse = await fetchFromPinterest('/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
      }).toString(),
    });

    // Fetch user data
    const userData = await fetchFromPinterest('/user_account', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.access_token}`,
      },
    });

    return createResponse(200, {
      token: tokenResponse,
      user: userData,
    });
  } catch (error) {
    console.error('Pinterest authentication error:', error);
    return createResponse(500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};