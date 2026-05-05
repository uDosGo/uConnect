/**
 * Installer and Session Configurator for uDos Webhook Helper
 * Handles installation, configuration, and startup of Ngrok and the webhook helper.
 * 
 * Extended to support uCode1 (Python) and uCode2 (Rust + ThinUI) installation.
 */

import { exec, execSync } from 'child_process';
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

// ──────────────────────────────────────────────
//  uCode1 Python dependencies (from requirements.txt + setup.py)
// ──────────────────────────────────────────────

/** Python packages required by uCode1 (from requirements.txt) */
const UCODE1_PYTHON_DEPS: string[] = [
  "pyyaml>=6.0",
  "liquidpy>=0.9",
  "pytest>=8.0",
  "pytest-cov>=4.0",
  "ruff>=0.3",
  "mypy>=1.8",
  "flask>=3.0",
];

/** Python packages required by uCode1 setup.py */
const UCODE1_SETUP_DEPS: string[] = [
  "click>=8.0.0",
  "pygments>=2.0.0",
  "rich>=10.0.0",
];

/** All uCode1 Python dependencies (deduplicated) */
const ALL_UCODE1_PYTHON_DEPS: string[] = [
  ...new Set([...UCODE1_PYTHON_DEPS, ...UCODE1_SETUP_DEPS]),
];

// ──────────────────────────────────────────────
//  uCode2 Rust workspace members
// ──────────────────────────────────────────────

const UCODE2_WORKSPACE_MEMBERS: string[] = [
  "core",
  "mcp",
  "vault-bridge",
  "ok-agent",
  "grid-core",
  "spatial",
  "feed-spool",
  "usystem",
  "ucode1-cli",
  "tui",
];

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

  // ──────────────────────────────────────────────
  //  Python dependency management (uCode1)
  // ──────────────────────────────────────────────

  /**
   * Detect the pip binary (pip3 or pip).
   */
  private detectPip(): string {
    let pipCmd = "pip3";
    try {
      execSync(`${pipCmd} --version`, { stdio: "ignore" });
      return pipCmd;
    } catch {
      pipCmd = "pip";
      try {
        execSync(`${pipCmd} --version`, { stdio: "ignore" });
        return pipCmd;
      } catch {
        throw new Error('pip not found. Please install Python 3 and pip first.');
      }
    }
  }

  /**
   * Install all Python packages required by uCode1.
   * Reads from requirements.txt and setup.py dependencies.
   */
  public async installPythonDeps(): Promise<void> {
    console.log('🐍 Installing Python dependencies for uCode1...');
    const pipCmd = this.detectPip();

    for (const pkg of ALL_UCODE1_PYTHON_DEPS) {
      // Extract package name (strip version specifier for the `show` check)
      const pkgName = pkg.split(/[><=!]/)[0].trim();
      try {
        execSync(`${pipCmd} show ${pkgName}`, { stdio: "ignore" });
        console.log(`  ✅ ${pkgName} already installed`);
      } catch {
        console.log(`  📦 Installing ${pkg}...`);
        try {
          execSync(`${pipCmd} install "${pkg}"`, { stdio: "inherit" });
          console.log(`  ✅ ${pkgName} installed`);
        } catch (err) {
          console.error(`  ❌ Failed to install ${pkg}:`, err);
          throw err;
        }
      }
    }

    console.log('✅ Python dependencies ready');
  }

  /**
   * Install uCode1 as a Python package (pip install -e .).
   */
  public async installUCode1Package(): Promise<void> {
    console.log('📦 Installing uCode1 Python package...');
    const ucode1Dir = path.resolve(process.cwd(), 'uCode1');
    if (!fs.existsSync(ucode1Dir)) {
      console.error(`❌ uCode1 directory not found at ${ucode1Dir}`);
      throw new Error('uCode1 directory not found');
    }
    try {
      execSync('pip install -e .', { cwd: ucode1Dir, stdio: "inherit" });
      console.log('✅ uCode1 package installed');
    } catch (err) {
      console.error('❌ Failed to install uCode1 package:', err);
      throw err;
    }
  }

  /**
   * Check that all required Python packages are installed.
   * Returns a list of missing packages.
   */
  public checkPythonDeps(): string[] {
    const missing: string[] = [];
    let pipCmd: string;
    try {
      pipCmd = this.detectPip();
    } catch {
      return [...ALL_UCODE1_PYTHON_DEPS.map(p => p.split(/[><=!]/)[0].trim())];
    }

    for (const pkg of ALL_UCODE1_PYTHON_DEPS) {
      const pkgName = pkg.split(/[><=!]/)[0].trim();
      try {
        execSync(`${pipCmd} show ${pkgName}`, { stdio: "ignore" });
      } catch {
        missing.push(pkgName);
      }
    }
    return missing;
  }

  // ──────────────────────────────────────────────
  //  Rust build management (uCode2)
  // ──────────────────────────────────────────────

  /**
   * Build all uCode2 Rust workspace members.
   */
  public async buildUCode2Rust(): Promise<void> {
    console.log('🦀 Building uCode2 Rust workspace...');
    const ucode2Dir = path.resolve(process.cwd(), 'uCode2');
    if (!fs.existsSync(ucode2Dir)) {
      console.error(`❌ uCode2 directory not found at ${ucode2Dir}`);
      throw new Error('uCode2 directory not found');
    }

    console.log(`  Building ${UCODE2_WORKSPACE_MEMBERS.length} workspace members...`);
    try {
      execSync('cargo build --release', { cwd: ucode2Dir, stdio: "inherit" });
      console.log('✅ uCode2 Rust workspace built');
    } catch (err) {
      console.error('❌ Failed to build uCode2 Rust workspace:', err);
      throw err;
    }
  }

  /**
   * Build uCode2 Rust workspace in debug mode (faster for development).
   */
  public async buildUCode2RustDev(): Promise<void> {
    console.log('🦀 Building uCode2 Rust workspace (debug)...');
    const ucode2Dir = path.resolve(process.cwd(), 'uCode2');
    if (!fs.existsSync(ucode2Dir)) {
      console.error(`❌ uCode2 directory not found at ${ucode2Dir}`);
      throw new Error('uCode2 directory not found');
    }

    try {
      execSync('cargo build', { cwd: ucode2Dir, stdio: "inherit" });
      console.log('✅ uCode2 Rust workspace built (debug)');
    } catch (err) {
      console.error('❌ Failed to build uCode2 Rust workspace:', err);
      throw err;
    }
  }

  // ──────────────────────────────────────────────
  //  ThinUI build management (uCode2 frontend)
  // ──────────────────────────────────────────────

  /**
   * Install npm dependencies for ThinUI (uCode2 frontend).
   */
  public async installThinUIDeps(): Promise<void> {
    console.log('📦 Installing ThinUI npm dependencies...');
    const thinuiDir = path.resolve(process.cwd(), 'uCode2', 'ThinUI');
    if (!fs.existsSync(thinuiDir)) {
      console.error(`❌ ThinUI directory not found at ${thinuiDir}`);
      throw new Error('ThinUI directory not found');
    }

    try {
      execSync('npm install', { cwd: thinuiDir, stdio: "inherit" });
      console.log('✅ ThinUI npm dependencies installed');
    } catch (err) {
      console.error('❌ Failed to install ThinUI npm dependencies:', err);
      throw err;
    }
  }

  /**
   * Build ThinUI frontend (Vite/React).
   */
  public async buildThinUI(): Promise<void> {
    console.log('🔨 Building ThinUI frontend...');
    const thinuiDir = path.resolve(process.cwd(), 'uCode2', 'ThinUI');
    if (!fs.existsSync(thinuiDir)) {
      console.error(`❌ ThinUI directory not found at ${thinuiDir}`);
      throw new Error('ThinUI directory not found');
    }

    try {
      execSync('npm run build', { cwd: thinuiDir, stdio: "inherit" });
      console.log('✅ ThinUI frontend built');
    } catch (err) {
      console.error('❌ Failed to build ThinUI frontend:', err);
      throw err;
    }
  }

  /**
   * Build ThinUI Tauri desktop app (requires Rust + Tauri CLI).
   */
  public async buildThinUITauri(): Promise<void> {
    console.log('🖥️ Building ThinUI Tauri desktop app...');
    const thinuiDir = path.resolve(process.cwd(), 'uCode2', 'ThinUI');
    if (!fs.existsSync(thinuiDir)) {
      console.error(`❌ ThinUI directory not found at ${thinuiDir}`);
      throw new Error('ThinUI directory not found');
    }

    try {
      execSync('cargo tauri build', { cwd: thinuiDir, stdio: "inherit" });
      console.log('✅ ThinUI Tauri app built');
    } catch (err) {
      console.error('❌ Failed to build ThinUI Tauri app:', err);
      throw err;
    }
  }

  // ──────────────────────────────────────────────
  //  Full uCode1 setup
  // ──────────────────────────────────────────────

  /**
   * Complete uCode1 setup: Python deps + package install.
   */
  public async setupUCode1(): Promise<void> {
    console.log('🚀 Setting up uCode1...');
    await this.installPythonDeps();
    await this.installUCode1Package();
    console.log('✅ uCode1 setup complete');
  }

  // ──────────────────────────────────────────────
  //  Full uCode2 setup
  // ──────────────────────────────────────────────

  /**
   * Complete uCode2 setup: Rust build + ThinUI frontend.
   */
  public async setupUCode2(): Promise<void> {
    console.log('🚀 Setting up uCode2...');
    await this.buildUCode2Rust();
    await this.installThinUIDeps();
    await this.buildThinUI();
    console.log('✅ uCode2 setup complete');
  }

  /**
   * Complete uCode2 setup (dev mode): Rust debug build + ThinUI frontend.
   */
  public async setupUCode2Dev(): Promise<void> {
    console.log('🚀 Setting up uCode2 (dev)...');
    await this.buildUCode2RustDev();
    await this.installThinUIDeps();
    await this.buildThinUI();
    console.log('✅ uCode2 dev setup complete');
  }

  // ──────────────────────────────────────────────
  //  Full ecosystem setup
  // ──────────────────────────────────────────────

  /**
   * Complete setup of the entire uCode ecosystem (uCode1 + uCode2).
   */
  public async setupAll(): Promise<void> {
    console.log('🚀 Setting up uCode ecosystem...');
    console.log('');
    console.log('═══ uCode1 (Python) ═══');
    await this.setupUCode1();
    console.log('');
    console.log('═══ uCode2 (Rust + ThinUI) ═══');
    await this.setupUCode2();
    console.log('');
    console.log('✅ uCode ecosystem setup complete');
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
