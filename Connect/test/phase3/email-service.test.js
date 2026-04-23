const assert = require('assert');
const EmailService = require('../../core/src/email/service');
const db = require('../../core/src/db');

describe('EmailService', function() {
  let testRecipient = 'test@example.com';
  let queuedEmailId;
  
  before(async function() {
    // Clean up any existing test data
    await db.execute('DELETE FROM email_queue WHERE recipient = ?', [testRecipient]);
    await db.execute('DELETE FROM email_dead_letter WHERE recipient = ?', [testRecipient]);
  });
  
  describe('#initialize()', function() {
    it('should initialize email service', async function() {
      // Note: This would actually try to connect to SMTP server
      // For testing, we'll just check that the service is properly structured
      assert.ok(EmailService.config);
      assert.ok(EmailService.retrySchedule);
      assert.strictEqual(EmailService.maxAttempts, 5);
    });
  });
  
  describe('#queueEmail()', function() {
    it('should queue an email for sending', async function() {
      const emailId = await EmailService.queueEmail(
        'conflict_detected',
        testRecipient,
        'conflict_detected.html',
        {
          thread_id: 't_test123',
          conflict_url: 'https://udos.local/conflicts/t_test123',
          reply_a: {
            timestamp: '2025-04-19T10:00:00Z',
            user_id: 'alice',
            prompt: 'Test prompt A',
            output: 'Test output A'
          },
          reply_b: {
            timestamp: '2025-04-19T10:00:05Z',
            user_id: 'bob',
            prompt: 'Test prompt B',
            output: 'Test output B'
          }
        }
      );
      
      assert.ok(emailId);
      assert.ok(emailId.startsWith('email_'));
      queuedEmailId = emailId;
      
      // Verify email was queued
      const email = await db.fetchOne(
        'SELECT * FROM email_queue WHERE id = ?',
        [emailId]
      );
      
      assert.ok(email);
      assert.strictEqual(email.recipient, testRecipient);
      assert.strictEqual(email.event_type, 'conflict_detected');
      assert.strictEqual(email.status, 'pending');
    });
  });
  
  describe('#getQueueStatus()', function() {
    it('should return queue status', async function() {
      const status = await EmailService.getQueueStatus();
      
      assert.ok(status);
      assert.ok(typeof status.pending === 'number');
      assert.ok(typeof status.processing === 'number');
      assert.ok(typeof status.failed === 'number');
      assert.ok(typeof status.dead_letter === 'number');
    });
  });
  
  describe('#getEventsConfig()', function() {
    it('should return events configuration', function() {
      const events = EmailService.getEventsConfig();
      
      assert.ok(events);
      assert.ok(events.conflict_detected);
      assert.ok(events.webhook_failed);
    });
  });
  
  describe('#isEventEnabled()', function() {
    it('should check if event is enabled', function() {
      const isEnabled = EmailService.isEventEnabled('conflict_detected');
      assert.strictEqual(isEnabled, true);
    });
  });
  
  describe('#_formatEventSubject()', function() {
    it('should format event subjects', function() {
      const subject = EmailService._formatEventSubject('conflict_detected');
      assert.strictEqual(subject, 'Conflict Detected');
    });
  });
  
  describe('#_calculateNextRetry()', function() {
    it('should calculate retry delays', function() {
      const delay1 = EmailService._calculateNextRetry(1);
      const delay2 = EmailService._calculateNextRetry(2);
      const delay3 = EmailService._calculateNextRetry(3);
      
      assert.strictEqual(delay1, 60); // 1 minute
      assert.strictEqual(delay2, 300); // 5 minutes
      assert.strictEqual(delay3, 1800); // 30 minutes
    });
  });
  
  after(async function() {
    // Clean up test data
    await db.execute('DELETE FROM email_queue WHERE recipient = ?', [testRecipient]);
    await db.execute('DELETE FROM email_dead_letter WHERE recipient = ?', [testRecipient]);
  });
});