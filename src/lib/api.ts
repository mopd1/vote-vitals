import { Member, MembersResponse } from './types/member';

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const API_URL = 'https://lxniao0js0.execute-api.eu-west-2.amazonaws.com/dev';

class APICache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

const cache = new APICache();

interface APIError extends Error {
  status?: number;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error: APIError = new Error('API request failed');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getMembers(page: number = 1, house: string = 'Commons', party?: string): Promise<MembersResponse> {
  const cacheKey = `members-${page}-${house}-${party || 'all'}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      house,
      ...(party && { party }),
    });

    const response = await fetch(`${API_URL}/v1/members?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = await handleResponse(response);
    
    if (!data.items) {
      throw new Error('Invalid response format');
    }

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw new Error('Failed to fetch members');
  }
}

export async function getMemberInterests(memberId: number): Promise<number> {
  const cacheKey = `interests-${memberId}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(`${API_URL}/v1/members/${memberId}/interests`);
    const data = await handleResponse(response);
    const totalValue = data.totalValue || 0;
    
    cache.set(cacheKey, totalValue);
    return totalValue;
  } catch (error) {
    console.error('Error fetching member interests:', error);
    return 0;
  }
}