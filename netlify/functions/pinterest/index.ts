import { Handler } from '@netlify/functions';
import { handler as authHandler } from './auth';
import { handler as boardsHandler } from './boards';

export const handler: Handler = async (event) => {
  switch (event.httpMethod) {
    case 'POST':
      return authHandler(event);
    case 'GET':
      return boardsHandler(event);
    case 'OPTIONS':
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
        body: '',
      };
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
  }
};