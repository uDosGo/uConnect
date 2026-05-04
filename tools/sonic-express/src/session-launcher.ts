/**
 * Session Launcher for uDos Webhook Helper
 * Manages the session, including startup, health checks, and self-healing.
 */

import { Installer } from './installer.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class SessionLauncher {
  private installer: Installer;
  private healthCheckInterval: NodeJS.Timeout | null;
  private selfHealInterval: NodeJS.Timeout | null;

  constructor() {
    this.installer = new Installer();
    this.healthCheckInterval = null;
    this.selfHealInterval = null;
  }

  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting uDos Webhook Helper Session...');
      
      // Step 1: Run the installer
      await this.installer.install();
      
      // Step 2: Start health checks
      this.startHealthChecks();
      
      // Step 3: Start self-healing
      this.startSelfHealing();
      
      console.log('✅ uDos Webhook Helper Session started successfully!');
    } catch (error) {
      console.error('❌ Session launcher failed:', error);
      throw error;
    }
  }

  private startHealthChecks(): void {
    console.log('🏥 Starting health checks...');
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.installer.healthCheck();
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, 60000); // Run every 60 seconds
  }

  private startSelfHealing(): void {
    console.log('🛠️ Starting self-healing...');
    this.selfHealInterval = setInterval(async () => {
      try {
        await this.installer.selfHeal();
      } catch (error) {
        console.error('❌ Self-heal failed:', error);
      }
    }, 300000); // Run every 5 minutes
  }

  public async stop(): Promise<void> {
    console.log('🛑 Stopping uDos Webhook Helper Session...');
    try {
      // Step 1: Stop health checks
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        console.log('✅ Health checks stopped');
      }
      
      // Step 2: Stop self-healing
      if (this.selfHealInterval) {
        clearInterval(this.selfHealInterval);
        console.log('✅ Self-healing stopped');
      }
      
      // Step 3: Cleanup
      await this.installer.cleanup();
      
      console.log('✅ uDos Webhook Helper Session stopped successfully!');
    } catch (error) {
      console.error('❌ Session launcher stop failed:', error);
      throw error;
    }
  }

  public async restart(): Promise<void> {
    console.log('🔄 Restarting uDos Webhook Helper Session...');
    try {
      await this.stop();
      await this.start();
      console.log('✅ uDos Webhook Helper Session restarted successfully!');
    } catch (error) {
      console.error('❌ Session launcher restart failed:', error);
      throw error;
    }
  }
}

// Export the SessionLauncher class
export { SessionLauncher };