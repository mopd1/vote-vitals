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

export async function getMembers(page: number = 1, house: string = 'Commons', party?: string): Promise<MembersResponse> {
  const cacheKey = `members-${page}-${house}-${party || 'all'}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    // Using our AWS API Gateway endpoint instead of direct Parliament API access
    const response = await fetch(`${API_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        house,
        skip: (page - 1) * 20,
        take: 20,
        ...(party && { party }),
      }),
    });

    if (!response.ok) {
      console.error('API Response:', await response.text());
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
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
    const response = await fetch(`${API_URL}/members/${memberId}/interests`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    cache.set(cacheKey, data.totalValue || 0);
    return data.totalValue || 0;
  } catch (error) {
    console.error('Error fetching member interests:', error);
    return 0;
  }
}