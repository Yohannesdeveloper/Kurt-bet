/**
 * API Cache Manager
 * Provides caching and deduplication for API requests
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Deduplicate pending requests
   */
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Create new request
    const promise = requestFn()
      .then((data) => {
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Fetch with caching
   */
  async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 60000
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Deduplicate if request is pending
    return this.dedupe(key, async () => {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    });
  }
}

// Global cache instance
export const apiCache = new APICache();

/**
 * Cached fetch wrapper
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl: number = 60000
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  
  return apiCache.fetchWithCache(
    cacheKey,
    async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    ttl
  );
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string): void {
  const keys = Array.from(apiCache['cache'].keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      apiCache.clear(key);
    }
  });
}

/**
 * Prefetch data for better performance
 */
export async function prefetchData(url: string): Promise<void> {
  try {
    await cachedFetch(url, undefined, 300000); // 5 minute cache
  } catch (error) {
    // Silent fail for prefetch
    console.warn('Prefetch failed:', error);
  }
}
