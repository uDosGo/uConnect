/**
 * Audit Log Service
 * Implements immutable audit logging with hash chain verification
 */

import crypto from 'crypto';
import db from '../db.js';

class AuditService {
  constructor() {
    this.currentHash = null;
  }
  
  /**
   * Initialize audit service - load last hash from DB
   */
  async initialize() {
    const lastEntry = await db.fetchOne(
      `SELECT hash FROM audit_log ORDER BY id DESC LIMIT 1`
    );
    this.currentHash = lastEntry?.hash || this._getGenesisHash();
  }
  
  /**
   * Get genesis hash (first entry in chain)
   * @returns {string} Genesis hash
   */
  _getGenesisHash() {
    return crypto.createHash('sha256')
      .update('udos-audit-genesis')
      .digest('hex');
  }
  
  /**
   * Log an audit event
   * @param {Object} event - Audit event
   * @param {string} event.type - Event type
   * @param {string} event.userId - User ID
   * @param {string} event.familyId - Family ID (optional)
   * @param {Object} event.data - Event data
   * @param {string} event.ip - IP address
   * @param {string} event.userAgent - User agent
   * @returns {Promise<Object>} Created audit log entry
   */
  async logEvent(event) {
    if (!this.currentHash) {
      await this.initialize();
    }
    
    const eventData = {
      type: event.type,
      user_id: event.userId,
      family_id: event.familyId,
      data: event.data,
      ip: event.ip,
      user_agent: event.userAgent,
      timestamp: new Date().toISOString(),
      previous_hash: this.currentHash
    };
    
    // Calculate new hash
    const eventString = JSON.stringify(eventData);
    const newHash = crypto.createHash('sha256')
      .update(eventString)
      .digest('hex');
    
    // Store in database
    await db.execute(
      `INSERT INTO audit_log 
       (type, user_id, family_id, data, ip, user_agent, hash, previous_hash, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        event.type,
        event.userId,
        event.familyId,
        JSON.stringify(event.data),
        event.ip,
        event.userAgent,
        newHash,
        this.currentHash
      ]
    );
    
    // Update current hash
    this.currentHash = newHash;
    
    return { ...eventData, hash: newHash };
  }
  
  /**
   * Verify audit chain integrity
   * @returns {Promise<Object>} Verification result
   */
  async verifyChain() {
    const entries = await db.fetchAll(
      `SELECT id, hash, previous_hash, data 
       FROM audit_log ORDER BY id ASC`
    );
    
    if (entries.length === 0) {
      return { valid: true, checked: 0, first_hash: this._getGenesisHash() };
    }
    
    let valid = true;
    let currentHash = this._getGenesisHash();
    
    for (const entry of entries) {
      // Verify hash chain
      if (entry.previous_hash !== currentHash) {
        valid = false;
        break;
      }
      
      // Calculate expected hash
      const entryData = {
        type: entry.type,
        user_id: entry.user_id,
        family_id: entry.family_id,
        data: entry.data,
        ip: entry.ip,
        user_agent: entry.user_agent,
        timestamp: entry.timestamp,
        previous_hash: entry.previous_hash
      };
      
      const expectedHash = crypto.createHash('sha256')
        .update(JSON.stringify(entryData))
        .digest('hex');
      
      if (expectedHash !== entry.hash) {
        valid = false;
        break;
      }
      
      currentHash = entry.hash;
    }
    
    return {
      valid,
      checked: entries.length,
      first_entry: entries[0]?.id,
      last_entry: entries[entries.length - 1]?.id,
      current_hash: currentHash
    };
  }
  
  /**
   * Get audit log entries
   * @param {Object} filters - Filter options
   * @param {string} filters.type - Event type
   * @param {string} filters.userId - User ID
   * @param {string} filters.familyId - Family ID
   * @param {Date} filters.from - Start date
   * @param {Date} filters.to - End date
   * @param {number} filters.limit - Limit
   * @param {number} filters.offset - Offset
   * @returns {Promise<Array>} Audit log entries
   */
  async getAuditLogs(filters = {}) {
    let query = `SELECT * FROM audit_log WHERE 1=1`;
    const params = [];
    
    if (filters.type) {
      query += ` AND type = ?`;
      params.push(filters.type);
    }
    
    if (filters.userId) {
      query += ` AND user_id = ?`;
      params.push(filters.userId);
    }
    
    if (filters.familyId) {
      query += ` AND family_id = ?`;
      params.push(filters.familyId);
    }
    
    if (filters.from) {
      query += ` AND created_at >= ?`;
      params.push(filters.from.toISOString());
    }
    
    if (filters.to) {
      query += ` AND created_at <= ?`;
      params.push(filters.to.toISOString());
    }
    
    query += ` ORDER BY id DESC`;
    
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      query += ` OFFSET ?`;
      params.push(filters.offset);
    }
    
    return db.fetchAll(query, params);
  }
  
  /**
   * Get audit statistics
   * @param {Object} filters - Same as getAuditLogs
   * @returns {Promise<Object>} Statistics
   */
  async getAuditStats(filters = {}) {
    let query = `SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT type) as event_types,
      COUNT(DISTINCT user_id) as users,
      COUNT(DISTINCT family_id) as families,
      MIN(created_at) as first_event,
      MAX(created_at) as last_event
    FROM audit_log WHERE 1=1`;
    
    const params = [];
    
    if (filters.type) {
      query += ` AND type = ?`;
      params.push(filters.type);
    }
    
    if (filters.userId) {
      query += ` AND user_id = ?`;
      params.push(filters.userId);
    }
    
    if (filters.familyId) {
      query += ` AND family_id = ?`;
      params.push(filters.familyId);
    }
    
    if (filters.from) {
      query += ` AND created_at >= ?`;
      params.push(filters.from.toISOString());
    }
    
    if (filters.to) {
      query += ` AND created_at <= ?`;
      params.push(filters.to.toISOString());
    }
    
    return db.fetchOne(query, params);
  }
  
  /**
   * Export audit log
   * @param {Object} filters - Same as getAuditLogs
   * @returns {Promise<string>} CSV export
   */
  async exportAuditLog(filters = {}) {
    const entries = await this.getAuditLogs(filters);
    
    // Convert to CSV
    const headers = ['id', 'timestamp', 'type', 'user_id', 'family_id', 'ip', 'user_agent', 'hash'];
    const rows = entries.map(entry => [
      entry.id,
      entry.created_at,
      entry.type,
      entry.user_id,
      entry.family_id,
      entry.ip,
      entry.user_agent,
      entry.hash
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  /**
   * Audit log middleware
   * @param {Object} options - Middleware options
   * @returns {Function} Express middleware
   */
  auditMiddleware(options = {}) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalSend = res.send;
      
      res.send = function(body) {
        const duration = Date.now() - startTime;
        
        // Log audit event
        const event = {
          type: options.type || 'http_request',
          userId: req.user?.id || 'anonymous',
          familyId: req.family?.id,
          data: {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration_ms: duration,
            response_size: typeof body === 'string' ? body.length : 0
          },
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        };
        
        // Don't await to avoid blocking response
        this.logEvent(event).catch(console.error);
        
        originalSend.call(this, body);
      };
      
      next();
    };
  }
}

module.exports = new AuditService();