/**
 * uDos Init Launcher
 * Comprehensive initialization and launch script for uDos.
 * Handles setup, configuration, and startup of all components.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

interface InitConfig {
  ngrokAuthtoken?: string;
  webhookSecret?: string;
  githubToken?: string;
  port?: number;
  environment?: 'development' | 'production' | 'staging';
}

class InitLauncher {
  private config: InitConfig;
  private ngrokProcess: any;
  private webhookProcess: any;

  constructor(config: Partial<InitConfig> = {}) {
    this.config = {
      ngrokAuthtoken: config.ngrokAuthtoken || process.env.NGROK_AUTHTOKEN,
      webhookSecret: config.webhookSecret || process.env.WEBHOOK_SECRET || 'your-secret-token',
      githubToken: config.githubToken || process.env.GITHUB_TOKEN,
      port: config.port || 3000,
      environment: config.environment || 'development',
    };
  }

  public async init(): Promise<void> {
    try {
      console.log('🚀 Starting uDos Init Launcher...');
      console.log(`Environment: ${this.config.environment}`);
      
      // Step 1: Check prerequisites
      await this.checkPrerequisites();
      
      // Step 2: Install dependencies
      await this.installDependencies();
      
      // Step 3: Configure Ngrok
      await this.configureNgrok();
      
      // Step 4: Start services
      await this.startServices();
      
      // Step 5: Verify setup
      await this.verifySetup();
      
      console.log('✅ uDos Init Launcher completed successfully!');
      console.log('🌐 Webhook endpoint:', `http://localhost:${this.config.port}/webhook`);
    } catch (error) {
      console.error('❌ Init launcher failed:', error);
      throw error;
    }
  }

  private async checkPrerequisites(): Promise<void> {
    console.log('🔍 Checking prerequisites...');
    
    // Check Node.js version
    const { stdout: nodeVersion } = await execAsync('node --version');
    console.log(`Node.js version: ${nodeVersion.trim()}`);
    
    // Check npm version
    const { stdout: npmVersion } = await execAsync('npm --version');
    console.log(`npm version: ${npmVersion.trim()}`);
    
    // Check Ngrok installation
    try {
      const { stdout: ngrokVersion } = await execAsync('ngrok --version');
      console.log(`Ngrok version: ${ngrokVersion.trim()}`);
    } catch (error) {
      console.error('❌ Ngrok is not installed. Please install Ngrok first.');
      throw error;
    }
    
    console.log('✅ Prerequisites checked successfully!');
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

  private async startServices(): Promise<void> {
    console.log('🌐 Starting services...');
    
    try {
      // Start Ngrok
      console.log('Starting Ngrok...');
      this.ngrokProcess = execAsync(`ngrok http ${this.config.port}`);
      console.log('✅ Ngrok started successfully!');
      
      // Start Webhook Helper
      console.log('Starting Webhook Helper...');
      this.webhookProcess = execAsync('npm run start:webhook');
      console.log('✅ Webhook Helper started successfully!');
    } catch (error) {
      console.error('❌ Failed to start services:', error);
      throw error;
    }
  }

  private async verifySetup(): Promise<void> {
    console.log('🔍 Verifying setup...');
    
    try {
      // Check if Ngrok is running
      if (!this.ngrokProcess) {
        throw new Error('Ngrok is not running');
      }
      
      // Check if Webhook Helper is running
      if (!this.webhookProcess) {
        throw new Error('Webhook Helper is not running');
      }
      
      console.log('✅ Setup verified successfully!');
    } catch (error) {
      console.error('❌ Setup verification failed:', error);
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

  public async restart(): Promise<void> {
    console.log('🔄 Restarting services...');
    
    try {
      await this.cleanup();
      await this.startServices();
      console.log('✅ Services restarted successfully!');
    } catch (error) {
      console.error('❌ Restart failed:', error);
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
}

// Export the InitLauncher class
export { InitLauncher };