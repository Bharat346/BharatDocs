class CacheManager {
    constructor(namespace, defaultOptions = {}) {
      this.namespace = namespace || 'app_cache';
      this.defaultOptions = {
        ttl: 60 * 60 * 1000, // 1 hour in milliseconds
        useMemoryCache: true,
        ...defaultOptions
      };
      this.memoryCache = new Map();
    }
  
    /**
     * Get cached item
     * @param {string} key - Cache key
     * @returns {any} Cached value or null if not found/expired
     */
    get(key) {
      // Try memory cache first if enabled
      if (this.defaultOptions.useMemoryCache && this.memoryCache.has(key)) {
        const { value, expiry } = this.memoryCache.get(key);
        if (!expiry || Date.now() < expiry) {
          return value;
        }
        this.memoryCache.delete(key);
      }
  
      // Fall back to localStorage
      const item = localStorage.getItem(`${this.namespace}:${key}`);
      if (!item) return null;
  
      try {
        const { value, expiry } = JSON.parse(item);
        
        // Check if expired
        if (expiry && Date.now() > expiry) {
          this.delete(key);
          return null;
        }
  
        // Store in memory cache for faster subsequent access
        if (this.defaultOptions.useMemoryCache) {
          this.memoryCache.set(key, { value, expiry });
        }
  
        return value;
      } catch (e) {
        console.error('Error parsing cached item', e);
        this.delete(key);
        return null;
      }
    }
  
    /**
     * Set cached item
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {object} options - { ttl: number in ms, skipMemory: boolean }
     */
    set(key, value, options = {}) {
      const { ttl, skipMemory } = { 
        ...this.defaultOptions, 
        ...options 
      };
  
      const expiry = ttl ? Date.now() + ttl : null;
      const cacheItem = JSON.stringify({ value, expiry });
  
      // Store in localStorage
      localStorage.setItem(`${this.namespace}:${key}`, cacheItem);
  
      // Store in memory cache unless explicitly skipped
      if (this.defaultOptions.useMemoryCache && !skipMemory) {
        this.memoryCache.set(key, { value, expiry });
      }
    }
  
    /**
     * Delete cached item
     * @param {string} key - Cache key
     */
    delete(key) {
      localStorage.removeItem(`${this.namespace}:${key}`);
      this.memoryCache.delete(key);
    }
  
    /**
     * Clear all cached items for this namespace
     */
    clear() {
      Object.keys(localStorage)
        .filter(key => key.startsWith(`${this.namespace}:`))
        .forEach(key => localStorage.removeItem(key));
      this.memoryCache.clear();
    }
  
    /**
     * Get cache item with fallback to async fetcher if not cached
     * @param {string} key - Cache key
     * @param {function} fetcher - Async function to fetch data if not in cache
     * @param {object} options - Cache options
     * @returns {Promise<any>} Cached or freshly fetched data
     */
    async getWithFallback(key, fetcher, options = {}) {
      const cached = this.get(key);
      if (cached !== null) {
        return cached;
      }
  
      const data = await fetcher();
      this.set(key, data, options);
      return data;
    }
  
    /**
     * Get all keys in this namespace
     * @returns {string[]} Array of keys
     */
    keys() {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(`${this.namespace}:`))
        .map(key => key.replace(`${this.namespace}:`, ''));
    }
  }
  
  // Create default instance for general use
  const defaultCache = new CacheManager('app');
  
  export { CacheManager, defaultCache as cache };