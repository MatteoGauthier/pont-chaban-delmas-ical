type CacheEntry<T> = {
  data: T;
  timestamp: number;
  isRefreshing: boolean;
};

export class CacheService<T> {
  private cache: CacheEntry<T> | null = null;
  private cacheTTL: number;
  private refreshInterval: number;
  private fetchFn: () => Promise<T>;
  private intervalId: NodeJS.Timeout | null = null;
  private wasServedFromCache: boolean = false;

  constructor(
    fetchFn: () => Promise<T>,
    options: { cacheTTL?: number; refreshInterval?: number } = {}
  ) {
    this.fetchFn = fetchFn;
    this.cacheTTL = options.cacheTTL || 12 * 60 * 60 * 1000; // 12 hours default
    this.refreshInterval = options.refreshInterval || 6 * 60 * 60 * 1000; // 6 hours default
  }

  public async getData(): Promise<T> {
    if (!this.cache) {
      // First fetch
      this.wasServedFromCache = false;
      return this.refreshCache(true);
    }

    const now = Date.now();
    const cacheAge = now - this.cache.timestamp;

    if (cacheAge > this.cacheTTL && !this.cache.isRefreshing) {
      // Cache expired, needs refresh, but return stale data while refreshing
      this.refreshCache(false);
      this.wasServedFromCache = true;
      return this.cache.data;
    }

    this.wasServedFromCache = true;
    return this.cache.data;
  }

  public wasDataServedFromCache(): boolean {
    return this.wasServedFromCache;
  }

  private async refreshCache(waitForCompletion: boolean): Promise<T> {
    if (this.cache?.isRefreshing) {
      if (waitForCompletion) {
        // Wait for the refresh to complete
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (!this.cache?.isRefreshing) {
              clearInterval(checkInterval);
              resolve(null);
            }
          }, 100);
        });
        return this.cache!.data;
      }
      return this.cache.data;
    }

    if (this.cache) {
      this.cache.isRefreshing = true;
    }

    try {
      const data = await this.fetchWithRetry();
      this.cache = {
        data,
        timestamp: Date.now(),
        isRefreshing: false,
      };
      return data;
    } catch (error) {
      console.error("Failed to refresh cache:", error);
      if (this.cache) {
        this.cache.isRefreshing = false;
        return this.cache.data; // Return stale data on error
      }
      throw error; // Rethrow if we don't have any data
    }
  }

  private async fetchWithRetry(
    retries = 3,
    backoff = 300
  ): Promise<T> {
    try {
      return await this.fetchFn();
    } catch (error) {
      if (retries <= 0) throw error;
      
      await new Promise(resolve => setTimeout(resolve, backoff));
      return this.fetchWithRetry(retries - 1, backoff * 2);
    }
  }

  public startAutoRefresh(): void {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      if (!this.cache?.isRefreshing) {
        this.refreshCache(false).catch(err => {
          console.error("Auto-refresh failed:", err);
        });
      }
    }, this.refreshInterval);
  }

  public stopAutoRefresh(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getCacheStatus(): {
    hasCache: boolean;
    age: number | null;
    isRefreshing: boolean;
  } {
    if (!this.cache) {
      return { hasCache: false, age: null, isRefreshing: false };
    }
    
    return {
      hasCache: true,
      age: Date.now() - this.cache.timestamp,
      isRefreshing: this.cache.isRefreshing,
    };
  }
} 
