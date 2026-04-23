/**
 * Webhook Helper for uDos Feed Notifications
 * Handles incoming webhook notifications and triggers appropriate actions.
 */

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface UdosFeedNotification {
  event: string;
  repo: string;
  workflow: string;
  status: string;
  timestamp: string;
  message: string;
  details: {
    run_id?: number;
    run_number?: number;
    workflow_url?: string;
  };
}

class WebhookHelper {
  private app: express.Application;
  private port: number;
  private webhookSecret: string;

  constructor(port: number = 3000, webhookSecret: string = 'your-secret-token') {
    this.app = express();
    this.port = port;
    this.webhookSecret = webhookSecret;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(bodyParser.json());
    this.app.use(this.verifyWebhook.bind(this));
  }

  private verifyWebhook(req: Request, res: Response, next: Function): void {
    const signature = req.headers['x-webhook-signature'] as string;
    if (signature !== this.webhookSecret) {
      res.status(403).json({ error: 'Invalid webhook signature' });
      return;
    }
    next();
  }

  private setupRoutes(): void {
    this.app.post('/webhook', this.handleWebhook.bind(this));
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'healthy' });
    });
  }

  private async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload: UdosFeedNotification = req.body;
      console.log('Received uDos Feed Notification:', JSON.stringify(payload, null, 2));

      // Handle different types of events
      switch (payload.event) {
        case 'workflow_failure':
          await this.handleWorkflowFailure(payload);
          break;
        case 'auto_heal_triggered':
          await this.handleAutoHealTriggered(payload);
          break;
        default:
          console.log(`Unknown event type: ${payload.event}`);
      }

      res.status(200).json({ status: 'success', message: 'Webhook processed' });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async handleWorkflowFailure(payload: UdosFeedNotification): Promise<void> {
    console.log(`Handling workflow failure for ${payload.repo}/${payload.workflow}`);
    
    // Example: Trigger auto-healing workflow
    try {
      const { stdout } = await execAsync(`curl -X POST \
        -H "Authorization: token ${process.env.GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/repos/fredporter/uDosConnect/dispatches \
        -d '{"event_type":"udos_feed_notification", "client_payload": ${JSON.stringify(payload)}}'`);
      console.log('Auto-healing workflow triggered:', stdout);
    } catch (error) {
      console.error('Failed to trigger auto-healing workflow:', error);
    }
  }

  private async handleAutoHealTriggered(payload: UdosFeedNotification): Promise<void> {
    console.log(`Handling auto-heal triggered for ${payload.repo}/${payload.workflow}`);
    
    // Example: Send notification to Slack or other services
    console.log('Auto-heal process triggered. Sending notification...');
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Webhook helper listening on port ${this.port}`);
    });
  }
}

// Export the WebhookHelper class
export { WebhookHelper };