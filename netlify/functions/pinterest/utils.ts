import fetch from 'cross-fetch';
import { PINTEREST_API_URL } from './config';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export function createResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

interface FetchOptions extends RequestInit {
  body?: string;
}

interface PinterestErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export async function fetchFromPinterest(
  endpoint: string,
  options: FetchOptions = {}
) {
  const url = `${PINTEREST_API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error: PinterestErrorResponse = {
        message: data.message || 'Pinterest API request failed',
        code: data.code,
        details: data
      };

      console.error('Pinterest API Error:', {
        status: response.status,
        endpoint,
        error
      });

      return createResponse(response.status, error);
    }

    return createResponse(200, data);
  } catch (error) {
    console.error('Pinterest API Network Error:', {
      endpoint,
      error
    });

    return createResponse(500, {
      message: 'Failed to connect to Pinterest API',
      code: 'NETWORK_ERROR',
      details: error instanceof Error ? error.message : error
    });
  }
}