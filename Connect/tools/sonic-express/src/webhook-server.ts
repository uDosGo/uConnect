/**
 * Entry point for the Webhook Helper server.
 */

import { WebhookHelper } from './webhook-helper.js';

// Initialize and start the webhook helper
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const webhookSecret = process.env.WEBHOOK_SECRET || 'your-secret-token';

const webhookHelper = new WebhookHelper(port, webhookSecret);
webhookHelper.start();