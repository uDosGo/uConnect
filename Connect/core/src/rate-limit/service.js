/**
 * Rate Limiting Service
 * Implements sliding window rate limiting using Redis
 */

const redis = require('../redis');
const { v4: uuidv4 } = require('uuid');

class RateLimitService {
  constructor() {
    this.defaultLimits = {
      global: { windowMs: 60000, max: 100 },
      auth: { windowMs: 60000, max: 1000 },
      feed: { windowMs: 60000, max: 60 },
      webhook: { windowMs: 10000, max: 50 },
      admin: { windowMs: 60000, max: 30 }
    };
  }
  
  /**
   * Check rate limit for a key
   * @param {string} key - Rate limit key
   * @param {Object} options - Rate limit options
   * @param {number} options.windowMs - Window size in milliseconds
   * @param {number} options.max - Max requests per window
   * @returns {Promise<Object>} { allowed: boolean, remaining: number, reset: Date }
   */
  async checkLimit(key, options = {}) {
    const { windowMs, max } = { ...this.defaultLimits.global, ...options };
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Use Redis sorted set for sliding window
    const pipeline = redis.multi();
    
    // Remove old entries
    pipeline.zremrangebyscore(`rl:${key}`, 0, windowStart);
    
    // Count current window
    pipeline.zcard(`rl:${key}`);
    
    // Add current request
    pipeline.zadd(`rl:${key}`, now, now);
    
    // Set expiration
    pipeline.expire(`rl:${key}`, Math.ceil(windowMs / 1000));
    
    const [, count] = await pipeline.exec();
    
    const allowed = count <= max;
    const remaining = Math.max(0, max - count);
    const reset = new Date(now + windowMs);
    
    return { allowed, remaining, reset };
  }
  
  /**
   * Rate limiting middleware
   * @param {Object} options - Rate limit options
   * @returns {Function} Express middleware
   */
  rateLimitMiddleware(options = {}) {
    return async (req, res, next) => {
      const key = this._getRequestKey(req, options);
      const result = await this.checkLimit(key, options);
      
      res.set({
        'X-RateLimit-Limit': options.max || this.defaultLimits.global.max,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': Math.floor(result.reset.getTime() / 1000)
      });
      
      if (!result.allowed) {
        const retryAfter = Math.ceil((result.reset.getTime() - Date.now()) / 1000);
        res.set('Retry-After', retryAfter);
        
        return res.status(429).json({
          error: 'rate_limit_exceeded',
          message: 'Too many requests',
          retry_after: retryAfter,
          limit: options.max || this.defaultLimits.global.max,
          remaining: result.remaining
        });
      }
      
      next();
    };
  }
  
  /**
   * Get rate limit key for request
   * @param {Object} req - Express request
   * @param {Object} options - Rate limit options
   * @returns {string} Rate limit key
   */
  _getRequestKey(req, options) {
    let key;
    
    if (options.keyGenerator) {
      return options.keyGenerator(req);
    }
    
    // Default key generation
    if (req.user?.id) {
      // Authenticated user
      if (options.familyId) {
        key = `rl:user:${req.user.id}:family:${options.familyId}`;
      } else {
        key = `rl:user:${req.user.id}`;
      }
    } else {
      // Anonymous user (use IP)
      const ip = req.ip || req.connection.remoteAddress;
      key = `rl:ip:${ip}`;
    }
    
    // Add endpoint-specific suffix if provided
    if (options.endpoint) {
      key += `:${options.endpoint}`;
    }
    
    return key;
  }
  
  /**
   * Get current rate limit status
   * @param {string} key - Rate limit key
   * @returns {Promise<Object>} Current rate limit status
   */
  async getLimitStatus(key) {
    const now = Date.now();
    const pipeline = redis.multi();
    
    pipeline.zcard(`rl:${key}`);
    pipeline.zrange(`rl:${key}`, 0, -1, 'WITHSCORES');
    pipeline.pttl(`rl:${key}`);
    
    const [count, entries, ttlMs] = await pipeline.exec();
    
    return {
      key,
      count: count || 0,
      ttl: ttlMs / 1000,
      recentRequests: entries || []
    };
  }
  
  /**
   * Reset rate limit for key
   * @param {string} key - Rate limit key
   * @returns {Promise<void>}
   */
  async resetLimit(key) {
    await redis.del(`rl:${key}`);
  }
  
  /**
   * Get global rate limit statistics
   * @returns {Promise<Object>} Global statistics
   */
  async getGlobalStats() {
    const keys = await redis.keys('rl:*');
    const pipeline = redis.multi();
    
    keys.forEach(key => {
      pipeline.zcard(key);
    });
    
    const counts = await pipeline.exec();
    
    return {
      total_keys: keys.length,
      total_requests: counts.reduce((sum, count) => sum + (count || 0), 0),
      average_per_key: counts.length > 0 
        ? counts.reduce((sum, count) => sum + (count || 0), 0) / counts.length 
        : 0
    };
  }
}

module.exports = new RateLimitService();