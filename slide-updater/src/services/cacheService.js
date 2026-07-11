/**
 * Intelligent caching layer for literature search results.
 * Reduces redundant API calls, improves performance, respects TTL.
 */
/**
 * Cache for literature search results.
 * Uses localStorage for persistence across sessions.
 * Implements TTL (time-to-live) for automatic expiration.
 *
 * Storage format:
 * - Key: `slideUpdater_literatureCache_${hash(keywords)}`
 * - Value: JSON { data: LiteratureItem[], timestamp, ttlMs }
 *
 * @example
 * const cache = new LiteratureCache()
 * const results = cache.get(['mucosite', 'oral cancer'])
 * if (!results) {
 *   results = await searchPubMed(['mucosite', 'oral cancer'])
 *   cache.set(['mucosite', 'oral cancer'], results)
 * }
 */
export class LiteratureCache {
    constructor(config = {}) {
        Object.defineProperty(this, "cacheKeyPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'slideUpdater_literatureCache'
        });
        Object.defineProperty(this, "indexKeyPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'slideUpdater_literatureCacheIndex'
        });
        Object.defineProperty(this, "defaultTTL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 7 * 24 * 60 * 60 * 1000
        }); // 7 days
        Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        }); // Max cached search results
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = {
            ttlMs: config.ttlMs || this.defaultTTL,
            maxSize: config.maxSize || this.maxSize,
        };
    }
    /**
     * Retrieve cached literature results for keywords.
     * Returns null if cache miss, expired, or invalid.
     *
     * @param keywords - Search keywords (will be normalized and hashed)
     * @param source - Optional source filter (pubmed, scopus, wos)
     * @returns Cached results or null
     */
    get(keywords, source) {
        try {
            const key = this.generateCacheKey(keywords, source);
            const cached = localStorage.getItem(key);
            if (!cached) {
                return null;
            }
            const entry = JSON.parse(cached);
            // Check TTL
            const age = Date.now() - entry.timestamp;
            if (age > entry.ttlMs) {
                // Expired: delete and return null
                localStorage.removeItem(key);
                this.updateIndex(keywords, 'remove', source);
                return null;
            }
            return entry.data;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    /**
     * Store literature results in cache with TTL.
     * Automatically deduplicates by PMID.
     * Enforces max cache size by removing oldest entries.
     *
     * @param keywords - Search keywords
     * @param results - Literature results to cache
     * @param source - Optional source identifier (pubmed, scopus, wos)
     */
    set(keywords, results, source) {
        try {
            // Deduplicate by PMID
            const dedupedResults = this.deduplicateByPMID(results);
            const entry = {
                data: dedupedResults,
                timestamp: Date.now(),
                ttlMs: this.config.ttlMs,
            };
            const key = this.generateCacheKey(keywords, source);
            localStorage.setItem(key, JSON.stringify(entry));
            // Update index
            this.updateIndex(keywords, 'add', source);
            // Enforce max size
            this.enforceMaxSize();
        }
        catch (error) {
            console.error('Cache set error:', error);
            // Graceful degradation: if cache fails, continue without caching
        }
    }
    /**
     * Clear all cached literature results.
     */
    clear() {
        try {
            const index = this.getIndex();
            for (const keyHash of index) {
                const key = `${this.cacheKeyPrefix}_${keyHash}`;
                localStorage.removeItem(key);
            }
            localStorage.removeItem(`${this.indexKeyPrefix}`);
        }
        catch (error) {
            console.error('Cache clear error:', error);
        }
    }
    /**
     * Get cache statistics.
     */
    getStats() {
        try {
            const index = this.getIndex();
            let oldestTTL = this.config.ttlMs;
            let totalSize = 0;
            for (const keyHash of index) {
                const key = `${this.cacheKeyPrefix}_${keyHash}`;
                const cached = localStorage.getItem(key);
                if (cached) {
                    totalSize += cached.length;
                    const entry = JSON.parse(cached);
                    const age = Date.now() - entry.timestamp;
                    oldestTTL = Math.min(oldestTTL, entry.ttlMs - age);
                }
            }
            return {
                size: totalSize,
                entries: index.length,
                oldestTTLMs: Math.max(0, oldestTTL),
            };
        }
        catch (error) {
            console.error('Cache stats error:', error);
            return { size: 0, entries: 0, oldestTTLMs: 0 };
        }
    }
    /**
     * Generate cache key from keywords and optional source.
     * Hash keywords to create deterministic, short key.
     *
     * @param keywords - Search keywords
     * @param source - Optional source identifier (pubmed, scopus, wos)
     * @returns Cache storage key
     */
    generateCacheKey(keywords, source) {
        const normalized = keywords
            .map(k => k.toLowerCase().trim())
            .sort()
            .join('|');
        const keyWithSource = source ? `${normalized}@${source}` : normalized;
        const hash = this.simpleHash(keyWithSource);
        return `${this.cacheKeyPrefix}_${hash}`;
    }
    /**
     * Simple hash function (non-cryptographic, fast).
     * Good enough for cache key generation.
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    /**
     * Deduplicate results by PMID.
     * Keeps first occurrence of each unique PMID.
     */
    deduplicateByPMID(results) {
        const seen = new Set();
        return results.filter(item => {
            const id = item.pmid || item.id;
            if (seen.has(id)) {
                return false;
            }
            seen.add(id);
            return true;
        });
    }
    /**
     * Get list of all cached keyword hashes.
     */
    getIndex() {
        try {
            const indexStr = localStorage.getItem(`${this.indexKeyPrefix}`);
            return indexStr ? JSON.parse(indexStr) : [];
        }
        catch {
            return [];
        }
    }
    /**
     * Update index: add or remove keyword hash.
     */
    updateIndex(keywords, action, source) {
        try {
            const normalized = keywords
                .map(k => k.toLowerCase().trim())
                .sort()
                .join('|');
            const keyWithSource = source ? `${normalized}@${source}` : normalized;
            const hash = this.simpleHash(keyWithSource);
            let index = this.getIndex();
            if (action === 'add') {
                if (!index.includes(hash)) {
                    index.push(hash);
                }
            }
            else if (action === 'remove') {
                index = index.filter(h => h !== hash);
            }
            localStorage.setItem(`${this.indexKeyPrefix}`, JSON.stringify(index));
        }
        catch (error) {
            console.error('Index update error:', error);
        }
    }
    /**
     * Enforce max cache size by removing oldest entries.
     * Triggered when cache exceeds configured size.
     */
    enforceMaxSize() {
        try {
            const index = this.getIndex();
            if (index.length <= this.config.maxSize) {
                return;
            }
            // Find oldest entry and remove it
            let oldestHash = index[0];
            let oldestTimestamp = Date.now();
            for (const hash of index) {
                const key = `${this.cacheKeyPrefix}_${hash}`;
                const cached = localStorage.getItem(key);
                if (cached) {
                    const entry = JSON.parse(cached);
                    if (entry.timestamp < oldestTimestamp) {
                        oldestTimestamp = entry.timestamp;
                        oldestHash = hash;
                    }
                }
            }
            // Remove oldest
            const key = `${this.cacheKeyPrefix}_${oldestHash}`;
            localStorage.removeItem(key);
            this.updateIndex([oldestHash], 'remove');
        }
        catch (error) {
            console.error('Enforce max size error:', error);
        }
    }
}
/**
 * Global singleton instance for literature caching.
 * Use this throughout the app for consistent caching behavior.
 *
 * @example
 * import { literatureCache } from '@/services/cacheService'
 *
 * const results = literatureCache.get(['mucosite'])
 * if (!results) {
 *   const fetched = await searchPubMed(['mucosite'])
 *   literatureCache.set(['mucosite'], fetched)
 * }
 */
export const literatureCache = new LiteratureCache({
    ttlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxSize: 100,
});
