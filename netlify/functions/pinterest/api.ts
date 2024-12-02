import fetch from 'cross-fetch';
import { PINTEREST_API_URL } from './config';

interface FetchOptions extends RequestInit {
  body?: string;
}

interface PinterestResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

export async function fetchFromPinterest<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<PinterestResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${PINTEREST_API_URL}${endpoint}`;
  
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
      console.error('Pinterest API Error:', {
        status: response.status,
        endpoint,
        error: data
      });

      return {
        ok: false,
        status: response.status,
        data: {
          message: data.message || 'Pinterest API request failed',
          code: data.code || response.status.toString(),
          details: data
        }
      };
    }

    return {
      ok: true,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Pinterest API Network Error:', {
      endpoint,
      error
    });

    return {
      ok: false,
      status: 500,
      data: {
        message: 'Failed to connect to Pinterest API',
        code: 'NETWORK_ERROR',
        details: error instanceof Error ? error.message : error
      }
    };
  }
}