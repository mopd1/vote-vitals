import axios, { AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

// Rate limiting configuration
const RATE_LIMIT = 1000; // 1 request per second
let lastRequest = 0;

export async function fetchWithRateLimit<T>(
  url: string, 
  options: { 
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  } = {}
): Promise<T> {
  const now = Date.now();
  const timeToWait = Math.max(0, RATE_LIMIT - (now - lastRequest));
  
  if (timeToWait > 0) {
    logger.debug(`Rate limiting: waiting ${timeToWait}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  
  lastRequest = Date.now();

  try {
    logger.debug('Making API request', { url, options });
    const response = await axios.get(url, {
      params: options.params,
      headers: {
        'Accept': 'application/json',
        ...options.headers
      }
    });

    return handleApiResponse<T>(response);
  } catch (error) {
    logger.error('API request failed', { error, url, options });
    throw error;
  }
}

export async function handleApiResponse<T>(response: AxiosResponse): Promise<T> {
  if (response.status !== 200) {
    logger.error('API request failed', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url
    });
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.data as T;
}