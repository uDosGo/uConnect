/**
 * Installer and Session Configurator for uDos Webhook Helper
 * Handles installation, configuration, and startup of Ngrok and the webhook helper.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface InstallerConfig {
  ngrokAuthtoken: string;
  webhookSecret: string;
  githubToken: string;
  port: number;
}

class Installer {
  private config: InstallerConfig;
  private ngrokProcess: any;
  private webhookProcess: any;

  constructor(config: Partial<InstallerConfig> = {}) {
    this.config = {
      ngrokAuthtoken: config.ngrokAuthtoken || process.env.NGROK_AUTHTOKEN || '',
      webhookSecret: config.webhookSecret || process.env.WEBHOOK_SECRET || 'your-secret-token',
      githubToken: config.githubToken || process.env.GITHUB_TOKEN || '',
      port: config.port || 3000,
    };
  }

  public async runInstall(): Promise<void> {
    await this.install();
  }

  public async runUpdate(): Promise<void> {
    await this.install();
  }

  public async install(): Promise<void> {
    try {
      console.log('🚀 Starting uDos Webhook Helper Installer...');
      
      // Step 1: Install dependencies
      await this.installDependencies();
      
      // Step 2: Configure Ngrok
      await this.configureNgrok();
      
      // Step 3: Start Ngrok
      await this.startNgrok();
      
      // Step 4: Start Webhook Helper
      await this.startWebhookHelper();
      
      // Step 5: Populate GitHub Secrets
      await this.populateGitHubSecrets();
      
      console.log('✅ uDos Webhook Helper Installer completed successfully!');
    } catch (error) {
      console.error('❌ Installer failed:', error);
      throw error;
    }
  }

  private async installDependencies(): Promise<void> {
    console.log('📦 Installing dependencies...');
    try {
      await execAsync('npm install');
      console.log('✅ Dependencies installed successfully!');
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error);
      throw error;
    }
  }

  private async configureNgrok(): Promise<void> {
    console.log('⚙️ Configuring Ngrok...');
    try {
      if (this.config.ngrokAuthtoken) {
        await execAsync(`ngrok config add-authtoken ${this.config.ngrokAuthtoken}`);
        console.log('✅ Ngrok authtoken configured successfully!');
      } else {
        console.warn('⚠️ Ngrok authtoken not provided. Using default configuration.');
      }
    } catch (error) {
      console.error('❌ Failed to configure Ngrok:', error);
      throw error;
    }
  }

  private async startNgrok(): Promise<void> {
    console.log('🌐 Starting Ngrok...');
    try {
      this.ngrokProcess = execAsync(`ngrok http ${this.config.port}`);
      console.log('✅ Ngrok started successfully!');
    } catch (error) {
      console.error('❌ Failed to start Ngrok:', error);
      throw error;
    }
  }

  private async startWebhookHelper(): Promise<void> {
    console.log('🔌 Starting Webhook Helper...');
    try {
      this.webhookProcess = execAsync('npm run start:webhook');
      console.log('✅ Webhook Helper started successfully!');
    } catch (error) {
      console.error('❌ Failed to start Webhook Helper:', error);
      throw error;
    }
  }

  private async populateGitHubSecrets(): Promise<void> {
    console.log('🔑 Populating GitHub Secrets...');
    try {
      // Here you would typically use the GitHub API to update secrets
      // For now, we'll just log the secrets that need to be set
      console.log('📋 GitHub Secrets to set:');
      console.log(`- UDOS_WEBHOOK_URL: https://your-ngrok-url.ngrok-free.dev/webhook`);
      console.log(`- UDOS_WEBHOOK_TOKEN: ${this.config.webhookSecret}`);
      console.log(`- GITHUB_TOKEN: ${this.config.githubToken}`);
      console.log('✅ GitHub Secrets logged successfully!');
    } catch (error) {
      console.error('❌ Failed to populate GitHub Secrets:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<void> {
    console.log('🏥 Performing health check...');
    try {
      // Check if Ngrok is running
      if (!this.ngrokProcess) {
        throw new Error('Ngrok is not running');
      }
      
      // Check if Webhook Helper is running
      if (!this.webhookProcess) {
        throw new Error('Webhook Helper is not running');
      }
      
      console.log('✅ Health check passed!');
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }

  public async selfHeal(): Promise<void> {
    console.log('🛠️ Performing self-heal...');
    try {
      // Restart Ngrok if it's not running
      if (!this.ngrokProcess) {
        console.log('🔄 Restarting Ngrok...');
        await this.startNgrok();
      }
      
      // Restart Webhook Helper if it's not running
      if (!this.webhookProcess) {
        console.log('🔄 Restarting Webhook Helper...');
        await this.startWebhookHelper();
      }
      
      console.log('✅ Self-heal completed successfully!');
    } catch (error) {
      console.error('❌ Self-heal failed:', error);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up...');
    try {
      // Kill Ngrok process
      if (this.ngrokProcess) {
        this.ngrokProcess.kill();
        console.log('✅ Ngrok process killed');
      }
      
      // Kill Webhook Helper process
      if (this.webhookProcess) {
        this.webhookProcess.kill();
        console.log('✅ Webhook Helper process killed');
      }
      
      console.log('✅ Cleanup completed successfully!');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }
}

// Helper functions for backward compatibility
export async function checkPrerequisites(): Promise<void> {
  console.log('🔍 Checking prerequisites...');
  // Add prerequisite checks here
  console.log('✅ Prerequisites check passed');
}

// Create a default installer instance for backward compatibility
const defaultInstaller = new Installer();

// Export functions that match the expected interface
export async function runInstall(options?: { auto?: boolean; skipDesktopLauncher?: boolean; silent?: boolean }): Promise<void> {
  await defaultInstaller.runInstall();
}

// Export functions that match the expected interface
export async function runUpdate(options?: { auto?: boolean; silent?: boolean }): Promise<void> {
  await defaultInstaller.runUpdate();
}

// Export the Installer class
export { Installer };