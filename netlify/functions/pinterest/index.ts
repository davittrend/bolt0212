import { Handler } from '@netlify/functions';
import { corsHeaders, createResponse } from './utils';
import { handler as authHandler } from './auth';
import { handler as boardsHandler } from './boards';

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers: corsHeaders,
      body: '' 
    };
  }

  try {
    switch (event.httpMethod) {
      case 'POST':
        return authHandler(event);
      case 'GET':
        return boardsHandler(event);
      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Pinterest API Error:', error);
    return createResponse(500, {
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};