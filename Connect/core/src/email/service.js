/**
 * Email Notifications Service
 * Implements SMTP email queue with retry logic and templates
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class EmailService {
  constructor() {
    this.config = require('../../config/email.yaml');
    this.transporter = null;
    this.queueProcessing = false;
    this.retrySchedule = this.config.queue.retry_schedule || [60, 300, 1800, 7200, 21600];
    this.maxAttempts = this.config.queue.max_attempts || 5;
  }
  
  /**
   * Initialize email service
   */
  async initialize() {
    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.encryption === 'ssl',
      ...(this.config.smtp.user && {
        auth: {
          user: this.config.smtp.user,
          pass: this.config.smtp.password
        }
      })
    });
    
    // Verify SMTP connection
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error.message);
      throw error;
    }
    
    // Ensure email queue table exists
    await this._ensureDatabaseTables();
    
    // Start processing queue
    this._startQueueProcessing();
  }
  
  /**
   * Ensure database tables exist
   */
  async _ensureDatabaseTables() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS email_queue (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body_html TEXT NOT NULL,
        body_text TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        next_retry_at DATETIME,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT (datetime('now')),
        sent_at DATETIME,
        error_message TEXT
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS email_dead_letter (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body_html TEXT NOT NULL,
        body_text TEXT NOT NULL,
        attempts INTEGER,
        last_error TEXT,
        failed_at DATETIME DEFAULT (datetime('now')),
        reason TEXT
      )
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_email_queue_next_retry 
      ON email_queue(next_retry_at, status)
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_email_queue_status 
      ON email_queue(status)
    `);
  }
  
  /**
   * Start queue processing
   */
  _startQueueProcessing() {
    if (this.queueProcessing) return;
    
    this.queueProcessing = true;
    console.log('📧 Email queue processor started');
    
    // Process queue every 5 seconds
    setInterval(async () => {
      try {
        await this._processQueue();
      } catch (error) {
        console.error('Queue processing error:', error);
      }
    }, this.config.queue.worker_interval * 1000 || 5000);
  }
  
  /**
   * Process email queue
   */
  async _processQueue() {
    const now = new Date().toISOString();
    
    // Get emails that are due for retry
    const emails = await db.fetchAll(`
      SELECT * FROM email_queue 
      WHERE status = 'pending' 
      AND (next_retry_at IS NULL OR next_retry_at <= ?) 
      ORDER BY created_at ASC 
      LIMIT ?
    `, [now, this.config.queue.batch_size || 10]);
    
    if (emails.length === 0) return;
    
    console.log(`Processing ${emails.length} emails from queue...`);
    
    for (const email of emails) {
      try {
        // Mark as processing
        await db.execute(`
          UPDATE email_queue 
          SET status = 'processing' 
          WHERE id = ?
        `, [email.id]);
        
        // Send email
        await this._sendEmail(email);
        
        // Mark as sent
        await db.execute(`
          UPDATE email_queue 
          SET status = 'sent', sent_at = datetime('now') 
          WHERE id = ?
        `, [email.id]);
        
        console.log(`✅ Email sent: ${email.id}`);
      } catch (error) {
        const attempts = email.attempts + 1;
        
        if (attempts >= this.maxAttempts) {
          // Move to dead letter
          await db.execute(`
            INSERT INTO email_dead_letter 
            (id, event_type, recipient, subject, body_html, body_text, attempts, last_error, reason) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            email.id, email.event_type, email.recipient, email.subject,
            email.body_html, email.body_text, attempts, error.message, 'max_attempts'
          ]);
          
          await db.execute(`
            DELETE FROM email_queue WHERE id = ?
          `, [email.id]);
          
          console.log(`❌ Email failed (moved to dead letter): ${email.id}`);
        } else {
          // Schedule retry
          const nextRetry = this._calculateNextRetry(attempts);
          await db.execute(`
            UPDATE email_queue 
            SET status = 'pending', 
                attempts = ?, 
                next_retry_at = datetime('now', ?), 
                error_message = ?
            WHERE id = ?
          `, [attempts, `+${nextRetry} seconds`, error.message, email.id]);
          
          console.log(`⏳ Email retry scheduled: ${email.id} (attempt ${attempts}/${this.maxAttempts})`);
        }
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
   * Send email
   * @param {Object} email - Email data
   */
  async _sendEmail(email) {
    const mailOptions = {
      from: this._formatAddress(this.config.smtp.from),
      to: email.recipient,
      subject: email.subject,
      html: email.body_html,
      text: email.body_text
    };
    
    await this.transporter.sendMail(mailOptions);
  }
  
  /**
   * Format email address
   * @param {string|Object} address - Address config
   * @returns {string} Formatted address
   */
  _formatAddress(address) {
    if (typeof address === 'string') return address;
    return `${address.name} <${address.email}>`;
  }
  
  /**
   * Queue email for sending
   * @param {string} eventType - Event type
   * @param {string} recipient - Recipient email
   * @param {string} templateName - Template name
   * @param {Object} templateVars - Template variables
   */
  async queueEmail(eventType, recipient, templateName, templateVars = {}) {
    // Load template
    const templatePath = path.join(__dirname, '../../templates/email', templateName);
    let template;
    
    try {
      template = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    // Render template (simple string replacement for now)
    let bodyHtml = template;
    for (const [key, value] of Object.entries(templateVars)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      bodyHtml = bodyHtml.replace(placeholder, value);
    }
    
    // Extract text version (simple strip of HTML tags)
    const bodyText = bodyHtml
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Get subject from template or use event type
    const subjectMatch = bodyHtml.match(/<title>(.*?)<\/title>/i);
    const subject = subjectMatch ? subjectMatch[1] : this._formatEventSubject(eventType);
    
    // Create email record
    const emailId = `email_${uuidv4()}`;
    
    await db.execute(`
      INSERT INTO email_queue 
      (id, event_type, recipient, subject, body_html, body_text, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `, [emailId, eventType, recipient, subject, bodyHtml, bodyText]);
    
    return emailId;
  }
  
  /**
   * Format event subject
   * @param {string} eventType - Event type
   * @returns {string} Formatted subject
   */
  _formatEventSubject(eventType) {
    const eventNames = {
      conflict_detected: 'Conflict Detected',
      webhook_failed: 'Webhook Delivery Failed',
      user_role_changed: 'User Role Changed',
      daily_summary: 'Your Daily Summary',
      system_error: 'System Error Notification'
    };
    
    return eventNames[eventType] || 'uDos Notification';
  }
  
  /**
   * Send test email
   * @param {string} to - Recipient email
   * @param {string} eventType - Event type
   * @param {Object} variables - Template variables
   */
  async sendTestEmail(to, eventType, variables = {}) {
    const template = this.config.events[eventType]?.template;
    
    if (!template) {
      throw new Error(`Event type ${eventType} not configured`);
    }
    
    return this.queueEmail(eventType, to, template, variables);
  }
  
  /**
   * Get queue status
   * @returns {Promise<Object>} Queue status
   */
  async getQueueStatus() {
    const [pending, processing, failed, deadLetter] = await Promise.all([
      db.fetchOne(`SELECT COUNT(*) as count FROM email_queue WHERE status = 'pending'`),
      db.fetchOne(`SELECT COUNT(*) as count FROM email_queue WHERE status = 'processing'`),
      db.fetchOne(`SELECT COUNT(*) as count FROM email_queue WHERE status = 'failed'`),
      db.fetchOne(`SELECT COUNT(*) as count FROM email_dead_letter`)
    ]);
    
    return {
      pending: pending?.count || 0,
      processing: processing?.count || 0,
      failed: failed?.count || 0,
      dead_letter: deadLetter?.count || 0
    };
  }
  
  /**
   * Retry failed emails
   * @returns {Promise<number>} Number of emails retried
   */
  async retryFailedEmails() {
    const emails = await db.fetchAll(`
      SELECT * FROM email_queue 
      WHERE status = 'failed' 
      ORDER BY created_at ASC
    `);
    
    for (const email of emails) {
      await db.execute(`
        UPDATE email_queue 
        SET status = 'pending', 
            attempts = 0, 
            next_retry_at = NULL, 
            error_message = NULL
        WHERE id = ?
      `, [email.id]);
    }
    
    return emails.length;
  }
  
  /**
   * Get dead letter emails
   * @param {number} limit - Limit
   * @returns {Promise<Array>} Dead letter emails
   */
  async getDeadLetterEmails(limit = 100) {
    return db.fetchAll(`
      SELECT * FROM email_dead_letter 
      ORDER BY failed_at DESC 
      LIMIT ?
    `, [limit]);
  }
  
  /**
   * Clear dead letter queue
   * @returns {Promise<number>} Number of emails cleared
   */
  async clearDeadLetterQueue() {
    const result = await db.fetchOne(`
      SELECT COUNT(*) as count FROM email_dead_letter
    `);
    
    await db.execute('DELETE FROM email_dead_letter');
    
    return result?.count || 0;
  }
  
  /**
   * Get email events configuration
   * @returns {Object} Events configuration
   */
  getEventsConfig() {
    return this.config.events;
  }
  
  /**
   * Check if event type is enabled
   * @param {string} eventType - Event type
   * @returns {boolean} True if enabled
   */
  isEventEnabled(eventType) {
    return this.config.events[eventType]?.enabled === true;
  }
}

module.exports = new EmailService();