/**
 * Redis Cache Service
 * Implements caching layer with TTL and cache invalidation
 */

const redis = require('../redis');
const { v4: uuidv4 } = require('uuid');

class RedisCache {
  constructor() {
    this.defaultTTL = 300; // 5 minutes
    this.cachePrefix = 'udos:cache:';
  }
  
  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    const fullKey = this._getFullKey(key);
    const value = await redis.get(fullKey);
    return value ? JSON.parse(value) : null;
  }
  
  /**
   * Set cached value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = this.defaultTTL) {
    const fullKey = this._getFullKey(key);
    await redis.setex(fullKey, ttl, JSON.stringify(value));
  }
  
  /**
   * Delete cached value
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    const fullKey = this._getFullKey(key);
    await redis.del(fullKey);
  }
  
  /**
   * Clear all cache
   * @returns {Promise<void>}
   */
  async clear() {
    const keys = await redis.keys(`${this.cachePrefix}*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
  
  /**
   * Cache middleware for Express
   * @param {Object} options - Cache options
   * @param {number} options.ttl - TTL in seconds
   * @param {Function} options.keyGenerator - Function to generate cache key
   * @returns {Function} Express middleware
   */
  cacheMiddleware(options = {}) {
    const { ttl = this.defaultTTL, keyGenerator } = options;
    
    return async (req, res, next) => {
      // Skip cache for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }
      
      const cacheKey = keyGenerator 
        ? keyGenerator(req) 
        : this._generateDefaultKey(req);
      
      const cachedValue = await this.get(cacheKey);
      
      if (cachedValue) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedValue);
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(cacheKey, body, ttl).catch(console.error);
        }
        res.set('X-Cache', 'MISS');
        originalJson.call(res, body);
      };
      
      next();
    };
  }
  
  /**
   * Cache with family isolation
   * @param {string} key - Base cache key
   * @param {string} familyId - Family ID
   * @returns {string} Family-isolated cache key
   */
  getFamilyCacheKey(key, familyId) {
    return `family:${familyId}:${key}`;
  }
  
  /**
   * Invalidate cache by pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<void>}
   */
  async invalidateByPattern(pattern) {
    const fullPattern = `${this.cachePrefix}${pattern}`;
    const keys = await redis.keys(fullPattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
  
  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getStats() {
    const keys = await redis.keys(`${this.cachePrefix}*`);
    const pipeline = redis.multi();
    
    keys.forEach(key => {
      pipeline.ttl(key);
    });
    
    const ttls = await pipeline.exec();
    
    return {
      total_keys: keys.length,
      total_ttl: ttls.reduce((sum, ttl) => sum + (ttl || 0), 0),
      average_ttl: keys.length > 0 ? ttls.reduce((sum, ttl) => sum + (ttl || 0), 0) / keys.length : 0
    };
  }
  
  /**
   * Generate default cache key from request
   * @param {Object} req - Express request
   * @returns {string} Cache key
   */
  _generateDefaultKey(req) {
    return `${req.method}:${req.originalUrl}`;
  }
  
  /**
   * Get full cache key with prefix
   * @param {string} key - Base key
   * @returns {string} Full key
   */
  _getFullKey(key) {
    return `${this.cachePrefix}${key}`;
  }
}

module.exports = new RedisCache();