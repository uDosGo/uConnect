/**
 * Redis Client Configuration
 * Centralized Redis client for uDos services
 */

const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    // Configuration
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retry_strategy: (options) => {
        // Reconnect after 1 second
        return Math.max(options.attempt * 100, 1000);
      }
    };
    
    // Create client
    this.client = redis.createClient(this.config);
    
    // Promisify methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    this.keysAsync = promisify(this.client.keys).bind(this.client);
    this.ttlAsync = promisify(this.client.ttl).bind(this.client);
    this.multiAsync = promisify(this.client.multi).bind(this.client);
    this.execAsync = promisify(this.client.exec).bind(this.client);
    this.pingAsync = promisify(this.client.ping).bind(this.client);
    
    // Error handling
    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });
    
    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });
    
    this.client.on('ready', () => {
      console.log('✅ Redis ready');
    });
  }
  
  /**
   * Get Redis client
   * @returns {Object} Redis client
   */
  getClient() {
    return this.client;
  }
  
  /**
   * Get value by key
   * @param {string} key - Key
   * @returns {Promise<string>} Value
   */
  async get(key) {
    return this.getAsync(key);
  }
  
  /**
   * Set value with expiration
   * @param {string} key - Key
   * @param {string} value - Value
   * @param {number} ttl - TTL in seconds
   * @returns {Promise<string>} OK
   */
  async setex(key, ttl, value) {
    return this.setexAsync(key, ttl, value);
  }
  
  /**
   * Set value
   * @param {string} key - Key
   * @param {string} value - Value
   * @returns {Promise<string>} OK
   */
  async set(key, value) {
    return this.setAsync(key, value);
  }
  
  /**
   * Delete key
   * @param {string} key - Key
   * @returns {Promise<number>} Number of keys deleted
   */
  async del(key) {
    return this.delAsync(key);
  }
  
  /**
   * Find keys by pattern
   * @param {string} pattern - Pattern
   * @returns {Promise<Array>} Array of keys
   */
  async keys(pattern) {
    return this.keysAsync(pattern);
  }
  
  /**
   * Get TTL for key
   * @param {string} key - Key
   * @returns {Promise<number>} TTL in seconds
   */
  async ttl(key) {
    return this.ttlAsync(key);
  }
  
  /**
   * Create transaction
   * @returns {Object} Transaction
   */
  multi() {
    return this.client.multi();
  }
  
  /**
   * Execute transaction
   * @param {Object} multi - Transaction
   * @returns {Promise<Array>} Results
   */
  async exec(multi) {
    return this.execAsync(multi);
  }
  
  /**
   * Ping Redis
   * @returns {Promise<string>} PONG
   */
  async ping() {
    return this.pingAsync();
  }
  
  /**
   * Quit Redis connection
   */
  quit() {
    this.client.quit();
  }
}

// Singleton instance
const redisClient = new RedisClient();

module.exports = redisClient;