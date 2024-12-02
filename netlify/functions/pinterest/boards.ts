import { Handler } from '@netlify/functions';
import { corsHeaders, createResponse, fetchFromPinterest } from './utils';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    const accessToken = event.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      return createResponse(401, { error: 'No access token provided' });
    }

    const data = await fetchFromPinterest('/boards', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return createResponse(200, data);
  } catch (error) {
    console.error('Pinterest boards error:', error);
    return createResponse(500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};