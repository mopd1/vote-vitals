import { Member, MembersResponse } from './types/member';

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

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

  let url = `${process.env.PARLIAMENT_API_URL}/Members?house=${house}&take=20&skip=${(page - 1) * 20}`;
  if (party) url += `&party=${encodeURIComponent(party)}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }

  const data = await response.json();
  cache.set(cacheKey, data);
  return data;
}

export async function getMemberInterests(memberId: number): Promise<number> {
  const cacheKey = `interests-${memberId}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  // Implement interests API call here
  // For now returning 0
  return 0;
}