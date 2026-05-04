/**
 * Webhook Retry Queue Service
 * Implements persistent webhook delivery with exponential backoff
 */

const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

class WebhookService {
  constructor() {
    this.config = require('../../config/webhooks.yaml');
    this.queueProcessing = false;
    this.retrySchedule = this.config.settings.retry.retry_schedule || [60, 300, 1800, 7200, 21600];
    this.maxAttempts = this.config.settings.retry.max_attempts || 5;
  }
  
  /**
   * Initialize webhook service
   */
  async initialize() {
    await this._ensureDatabaseTables();
    this._startQueueProcessing();
  }
  
  /**
   * Ensure database tables exist
   */
  async _ensureDatabaseTables() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS webhook_queue (
        id TEXT PRIMARY KEY,
        webhook_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        last_attempt_at DATETIME,
        next_retry_at DATETIME,
        last_error TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (webhook_id) REFERENCES webhooks(id)
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS webhook_dead_letter (
        id TEXT PRIMARY KEY,
        webhook_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        attempts INTEGER,
        last_error TEXT,
        failed_at DATETIME DEFAULT (datetime('now')),
        reason TEXT
      )
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_webhook_queue_next_retry 
      ON webhook_queue(next_retry_at, status)
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_webhook_queue_webhook 
      ON webhook_queue(webhook_id, status)
    `);
  }
  
  /**
   * Start queue processing
   */
  _startQueueProcessing() {
    if (this.queueProcessing) return;
    
    this.queueProcessing = true;
    console.log('🔄 Webhook queue processor started');
    
    setInterval(async () => {
      try {
        await this._processQueue();
      } catch (error) {
        console.error('Webhook queue processing error:', error);
      }
    }, this.config.queue.poll_interval * 1000 || 5000);
  }
  
  /**
   * Process webhook queue
   */
  async _processQueue() {
    const now = new Date().toISOString();
    
    // Get webhooks that are due for retry
    const webhooks = await db.fetchAll(`
      SELECT * FROM webhook_queue 
      WHERE status = 'pending' 
      AND (next_retry_at IS NULL OR next_retry_at <= ?) 
      ORDER BY created_at ASC 
      LIMIT ?
    `, [now, this.config.queue.batch_size || 10]);
    
    if (webhooks.length === 0) return;
    
    console.log(`Processing ${webhooks.length} webhooks from queue...`);
    
    // Process in parallel (limited by max_concurrent)
    const promises = webhooks.map(webhook => 
      this._processWebhook(webhook).catch(console.error)
    );
    
    await Promise.all(promises);
  }
  
  /**
   * Process individual webhook
   * @param {Object} webhook - Webhook data
   */
  async _processWebhook(webhook) {
    // Mark as processing
    await db.execute(`
      UPDATE webhook_queue 
      SET status = 'processing', last_attempt_at = datetime('now')
      WHERE id = ?
    `, [webhook.id]);
    
    try {
      // Get webhook configuration
      const config = this._getWebhookConfig(webhook.webhook_id);
      if (!config) {
        throw new Error(`Webhook configuration not found: ${webhook.webhook_id}`);
      }
      
      // Deliver webhook
      await this._deliverWebhook(config, webhook);
      
      // Mark as sent
      await db.execute(`
        UPDATE webhook_queue 
        SET status = 'sent'
        WHERE id = ?
      `, [webhook.id]);
      
      console.log(`✅ Webhook delivered: ${webhook.id}`);
    } catch (error) {
      const attempts = webhook.attempts + 1;
      
      if (attempts >= this.maxAttempts) {
        // Move to dead letter
        await db.execute(`
          INSERT INTO webhook_dead_letter 
          (id, webhook_id, payload, attempts, last_error, reason) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          webhook.id, webhook.webhook_id, webhook.payload,
          attempts, error.message, 'max_attempts'
        ]);
        
        await db.execute(`
          DELETE FROM webhook_queue WHERE id = ?
        `, [webhook.id]);
        
        console.log(`❌ Webhook failed (moved to dead letter): ${webhook.id}`);
        
        // Send notification if configured
        await this._notifyDeadLetter(webhook, error);
      } else {
        // Schedule retry
        const nextRetry = this._calculateNextRetry(attempts);
        await db.execute(`
          UPDATE webhook_queue 
          SET status = 'pending', 
              attempts = ?, 
              next_retry_at = datetime('now', ?), 
              last_error = ?
          WHERE id = ?
        `, [attempts, `+${nextRetry} seconds`, error.message, webhook.id]);
        
        console.log(`⏳ Webhook retry scheduled: ${webhook.id} (attempt ${attempts}/${this.maxAttempts})`);
      }
    }
  }
  
  /**
   * Calculate next retry delay
   * @param {number} attempts - Current attempt count
   * @returns {number} Delay in seconds
   */
  _calculateNextRetry(attempts) {
    const index = Math.min(attempts - 1, this.retrySchedule.length - 1);
    return this.retrySchedule[index];
  }
  
  /**
   * Get webhook configuration
   * @param {string} webhookId - Webhook ID
   * @returns {Object} Webhook configuration
   */
  _getWebhookConfig(webhookId) {
    return this.config.endpoints.find(w => w.id === webhookId);
  }
  
  /**
   * Deliver webhook
   * @param {Object} config - Webhook configuration
   * @param {Object} webhook - Webhook data
   */
  async _deliverWebhook(config, webhook) {
    const payload = JSON.parse(webhook.payload);
    
    const axiosConfig = {
      method: 'POST',
      url: config.url,
      data: payload,
      headers: config.headers || {
        'Content-Type': 'application/json',
        'User-Agent': this.config.settings.user_agent
      },
      timeout: this.config.settings.timeout * 1000
    };
    
    // Add authentication if configured
    if (config.headers && config.headers.Authorization) {
      axiosConfig.headers.Authorization = config.headers.Authorization;
    }
    
    const response = await axios(axiosConfig);
    
    // Check for successful response
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  
  /**
   * Notify about dead letter webhook
   * @param {Object} webhook - Failed webhook
   * @param {Error} error - Error
   */
  async _notifyDeadLetter(webhook, error) {
    const config = this.config.dead_letter.notifications;
    
    if (config.email && config.email.enabled) {
      try {
        // In a real implementation, we'd use the EmailService
        console.log(`📧 Dead letter notification would be sent to: ${config.email.recipients.join(', ')}`);
      } catch (emailError) {
        console.error('Failed to send dead letter notification:', emailError.message);
      }
    }
    
    if (config.webhook && config.webhook.enabled && config.webhook.url) {
      try {
        await axios.post(config.webhook.url, {
          webhook_id: webhook.webhook_id,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } catch (webhookError) {
        console.error('Failed to send dead letter webhook:', webhookError.message);
      }
    }
  }
  
  /**
   * Queue webhook for delivery
   * @param {string} webhookId - Webhook ID
   * @param {Object} payload - Webhook payload
   * @param {Object} options - Options
   * @returns {Promise<string>} Webhook ID
   */
  async queueWebhook(webhookId, payload, options = {}) {
    // Validate webhook exists
    const config = this._getWebhookConfig(webhookId);
    if (!config) {
      throw new Error(`Webhook not found: ${webhookId}`);
    }
    
    if (!config.enabled) {
      throw new Error(`Webhook disabled: ${webhookId}`);
    }
    
    const webhookIdempotencyId = `wh_${uuidv4()}`;
    
    await db.execute(`
      INSERT INTO webhook_queue 
      (id, webhook_id, payload, status, created_at) 
      VALUES (?, ?, ?, 'pending', datetime('now'))
    `, [webhookIdempotencyId, webhookId, JSON.stringify(payload)]);
    
    return webhookIdempotencyId;
  }
  
  /**
   * Trigger webhook immediately (synchronous)
   * @param {string} webhookId - Webhook ID
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>} Delivery result
   */
  async triggerWebhook(webhookId, payload) {
    const config = this._getWebhookConfig(webhookId);
    if (!config) {
      throw new Error(`Webhook not found: ${webhookId}`);
    }
    
    try {
      const result = await this._deliverWebhook(config, {
        id: `sync_${uuidv4()}`,
        webhook_id: webhookId,
        payload: JSON.stringify(payload)
      });
      
      return {
        success: true,
        result,
        webhook_id: webhookId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        webhook_id: webhookId
      };
    }
  }
  
  /**
   * Get queue status
   * @returns {Promise<Object>} Queue status
   */
  async getQueueStatus() {
    const [pending, processing, failed, deadLetter] = await Promise.all([
      db.fetchOne(`SELECT COUNT(*) as count FROM webhook_queue WHERE status = 'pending'`),
      db.fetchOne(`SELECT COUNT(*) as count FROM webhook_queue WHERE status = 'processing'`),
      db.fetchOne(`SELECT COUNT(*) as count FROM webhook_queue WHERE status = 'failed'`),
      db.fetchOne(`SELECT COUNT(*) as count FROM webhook_dead_letter`)
    ]);
    
    return {
      pending: pending?.count || 0,
      processing: processing?.count || 0,
      failed: failed?.count || 0,
      dead_letter: deadLetter?.count || 0
    };
  }
  
  /**
   * Retry failed webhooks
   * @returns {Promise<number>} Number of webhooks retried
   */
  async retryFailedWebhooks() {
    const webhooks = await db.fetchAll(`
      SELECT * FROM webhook_queue 
      WHERE status = 'failed' 
      ORDER BY created_at ASC
    `);
    
    for (const webhook of webhooks) {
      await db.execute(`
        UPDATE webhook_queue 
        SET status = 'pending', 
            attempts = 0, 
            next_retry_at = NULL, 
            last_error = NULL
        WHERE id = ?
      `, [webhook.id]);
    }
    
    return webhooks.length;
  }
  
  /**
   * Get dead letter webhooks
   * @param {number} limit - Limit
   * @returns {Promise<Array>} Dead letter webhooks
   */
  async getDeadLetterWebhooks(limit = 100) {
    return db.fetchAll(`
      SELECT * FROM webhook_dead_letter 
      ORDER BY failed_at DESC 
      LIMIT ?
    `, [limit]);
  }
  
  /**
   * Clear dead letter queue
   * @returns {Promise<number>} Number of webhooks cleared
   */
  async clearDeadLetterQueue() {
    const result = await db.fetchOne(`
      SELECT COUNT(*) as count FROM webhook_dead_letter
    `);
    
    await db.execute('DELETE FROM webhook_dead_letter');
    
    return result?.count || 0;
  }
  
  /**
   * Get webhook configuration
   * @param {string} webhookId - Webhook ID
   * @returns {Object} Webhook configuration
   */
  getWebhookConfig(webhookId) {
    return this._getWebhookConfig(webhookId);
  }
  
  /**
   * List all webhook configurations
   * @returns {Array} Webhook configurations
   */
  listWebhooks() {
    return this.config.endpoints;
  }
  
  /**
   * Get webhook delivery statistics
   * @returns {Promise<Object>} Delivery statistics
   */
  async getDeliveryStats() {
    const [total, success, failed] = await Promise.all([
      db.fetchOne(`SELECT COUNT(*) as count FROM webhook_queue WHERE status IN ('sent', 'failed')`),
      db.fetchOne(`SELECT COUNT(*) as count FROM webhook_queue WHERE status = 'sent'`),
      db.fetchOne(`SELECT COUNT(*) as count FROM webhook_queue WHERE status = 'failed'`)
    ]);
    
    const successRate = total.count > 0 ? (success.count / total.count) * 100 : 0;
    
    return {
      total_deliveries: total.count || 0,
      successful: success.count || 0,
      failed: failed.count || 0,
      success_rate: successRate.toFixed(2) + '%',
      average_attempts: await this._calculateAverageAttempts()
    };
  }
  
  /**
   * Calculate average attempts for failed webhooks
   * @returns {Promise<number>} Average attempts
   */
  async _calculateAverageAttempts() {
    const result = await db.fetchOne(`
      SELECT AVG(attempts) as avg FROM webhook_queue WHERE status = 'failed'
    `);
    
    return result?.avg ? parseFloat(result.avg.toFixed(2)) : 0;
  }
  
  /**
   * Test webhook delivery
   * @param {string} webhookId - Webhook ID
   * @param {Object} payload - Test payload
   * @returns {Promise<Object>} Test result
   */
  async testWebhook(webhookId, payload) {
    const config = this._getWebhookConfig(webhookId);
    if (!config) {
      throw new Error(`Webhook not found: ${webhookId}`);
    }
    
    try {
      const startTime = Date.now();
      const result = await this._deliverWebhook(config, {
        id: `test_${uuidv4()}`,
        webhook_id: webhookId,
        payload: JSON.stringify(payload)
      });
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        duration_ms: duration,
        result,
        webhook_id: webhookId
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        duration_ms: duration,
        error: error.message,
        webhook_id: webhookId
      };
    }
  }
}

module.exports = new WebhookService();