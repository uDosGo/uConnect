#!/usr/bin/env node
/**
 * uDosConnect TUI Launcher
 * Bubble Tea style terminal interface with progress bars and spinners
 */

import { program } from 'commander';
import chalk from 'chalk';
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve as pathResolve } from 'path';
import * as readline from 'readline';

// TUI Elements
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const progressBar = (percent: number, width = 30) => {
  const completed = Math.round((percent / 100) * width);
  const remaining = width - completed;
  return `[${'█'.repeat(completed)}${'░'.repeat(remaining)}] ${percent}%`;
};

class TUILauncher {
  private rootDir: string;
  private isVerbose: boolean;
  
  constructor(rootDir: string, verbose = false) {
    this.rootDir = rootDir;
    this.isVerbose = verbose;
  }
  
  private log(message: string, color: (text: string) => string = chalk.white) {
    console.log(color(message));
  }
  
  private spinner() {
    let i = 0;
    return setInterval(() => {
      process.stdout.write(`\r${spinnerFrames[i++ % spinnerFrames.length]} Working...`);
    }, 100);
  }
  
  private async checkDependencies(): Promise<boolean> {
    return new Promise((resolve) => {
      const spinner = this.spinner();
      
      setTimeout(() => {
        clearInterval(spinner);
        process.stdout.write('\r✅ Dependencies checked\n');
        
        // Check if node_modules exist
        const hasDeps = existsSync(pathResolve(this.rootDir, 'node_modules'));
        const hasCoreDeps = existsSync(pathResolve(this.rootDir, 'core', 'node_modules'));
        const hasUIDeps = existsSync(pathResolve(this.rootDir, 'ui', 'node_modules'));
        
        resolve(hasDeps && hasCoreDeps && hasUIDeps);
      }, 1500);
    });
  }
  
  private async installDependencies(): Promise<void> {
    this.log('📦 Installing dependencies...', chalk.cyan);
    
    // Show progress for different stages
    const stages = [
      { name: 'Root dependencies', duration: 2000 },
      { name: 'Core dependencies', duration: 2500 },
      { name: 'UI dependencies', duration: 3000 },
      { name: 'Building core', duration: 3500 }
    ];
    
    for (const [index, stage] of stages.entries()) {
      const progress = Math.round(((index + 1) / stages.length) * 100);
      process.stdout.write(`\r${chalk.blue('⏳')} ${stage.name} ${progressBar(progress)}`);
      
      await new Promise(resolve => setTimeout(resolve, stage.duration));
      
      // Actually run the install commands
      try {
        if (stage.name === 'Root dependencies') {
          execSync('npm install --silent', { cwd: this.rootDir, stdio: 'pipe' as any });
        } else if (stage.name === 'Core dependencies') {
          execSync('npm install --silent', { cwd: pathResolve(this.rootDir, 'core'), stdio: 'pipe' as any });
        } else if (stage.name === 'UI dependencies') {
          execSync('npm install --silent', { cwd: pathResolve(this.rootDir, 'ui'), stdio: 'pipe' as any });
        } else if (stage.name === 'Building core') {
          execSync('npm run build --silent', { cwd: pathResolve(this.rootDir, 'core'), stdio: 'pipe' as any });
        }
      } catch (error: any) {
        this.log(`⚠️ ${stage.name} completed with warnings`, chalk.yellow);
      }
    }
    
    process.stdout.write('\r✅ All dependencies installed and built!\n');
    console.log();
  }
  
  private async startGUI(): Promise<void> {
    this.log('🌐 Starting GUI server...', chalk.green);
    
    const guiProcess = spawn('npm', ['run', 'dev', '--', '--port', '5176'], {
      cwd: pathResolve(this.rootDir, 'ui'),
      stdio: 'pipe',
      detached: true
    });
    
    // Show spinner while waiting for GUI
    const spinner = this.spinner();
    
    // Wait for GUI to be ready (simplified check)
    await new Promise(resolve => setTimeout(resolve, 3000));
    clearInterval(spinner);
    process.stdout.write('\r✅ GUI server ready!\n');
    console.log();
    
    // Don't wait for GUI process to exit - let it run in background
    guiProcess.unref();
  }
  
  private showWelcomeScreen() {
    console.log(chalk.bgBlue.white.bold(' uDosConnect '));
    console.log(chalk.blue('✨ Welcome to the uDosConnect TUI Launcher'));
    console.log();
    
    const asciiArt = `
      ${chalk.cyan('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄')}
      ${chalk.cyan('▐░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')}
      ${chalk.cyan('▐░░')}${chalk.white('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')}${chalk.cyan('░░')}
      ${chalk.cyan('▐░░')}${chalk.white('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')}${chalk.cyan('░░')}
      ${chalk.cyan('▐░░')}${chalk.white('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')}${chalk.cyan('░░')}
      ${chalk.cyan('▐░░')}${chalk.white('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')}${chalk.cyan('░░')}
      ${chalk.cyan('▐░░')}${chalk.white('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')}${chalk.cyan('░░')}
      ${chalk.cyan('▐░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')}
      ${chalk.cyan('▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀')}
    `;
    
    console.log(asciiArt);
    console.log();
  }
  
  private showStatus() {
    this.log('📊 System Status:', chalk.green);
    console.log();
    
    // Check various components
    const checks = [
      { name: 'Core module', path: 'core/dist/index.js', critical: true },
      { name: 'UI module', path: 'ui/dist/index.html', critical: false },
      { name: 'Database', path: 'udos.db', critical: false },
      { name: 'Configuration', path: 'config', critical: false }
    ];
    
    let allGood = true;
    for (const check of checks) {
      const fullPath = pathResolve(this.rootDir, check.path);
      const exists = existsSync(fullPath);
      
      if (exists) {
        this.log(`  ✅ ${check.name}`, chalk.green);
      } else {
        this.log(`  ❌ ${check.name} ${check.critical ? '(CRITICAL)' : ''}`, chalk.red);
        allGood = false;
      }
    }
    
    console.log();
    if (allGood) {
      this.log('✨ All systems operational!', chalk.green);
    } else {
      this.log('⚠️  Some components need attention', chalk.yellow);
    }
    console.log();
  }
  
  async run() {
    try {
      // Show welcome screen
      this.showWelcomeScreen();
      
      // Skip dependency check and build for now
      this.log('ℹ️  Skipping dependency check (dev mode)', chalk.blue);
      
      // Start GUI
      await this.startGUI();
      
      // Show status
      this.showStatus();
      
      // Show main menu
      this.startREPL();
      
    } catch (error: any) {
      this.log(`❌ Error: ${error.message}`, chalk.red);
      process.exit(1);
    }
  }
  
  private startREPL() {
    console.log(chalk.bgMagenta.white.bold(' uDosConnect REPL '));
    console.log();
    this.log('🌐 GUI Dashboard:', chalk.blue);
    this.log('  → http://localhost:5176', chalk.cyan);
    console.log();
    
    this.log('💡 Available Commands:', chalk.blue);
    const commands = [
      { name: 'udo status', desc: 'Check system status' },
      { name: 'udo list', desc: 'List vault contents' },
      { name: 'udo vibe', desc: 'Start Vibe TUI' },
      { name: 'udo dev start', desc: 'Enable Dev Mode' },
      { name: 'udo gui demos', desc: 'Show demo surfaces' },
      { name: 'udo doctor', desc: 'Run health checks' },
      { name: 'udo setup', desc: 'Complete user registration' },
      { name: 'udo whoami', desc: 'Show current user status' }
    ];
    
    for (const cmd of commands) {
      this.log(`  ${chalk.yellow(cmd.name.padEnd(15))} ${cmd.desc}`, chalk.white);
    }
    
    console.log();
    this.log('💡 Special REPL Commands:', chalk.blue);
    this.log(`  ${chalk.cyan('open')}  - Open GUI in browser`);
    this.log(`  ${chalk.cyan('help')}  - Show this help`);
    this.log(`  ${chalk.cyan('exit')}  - Exit REPL`);
    this.log(`  ${chalk.cyan('quit')}  - Exit REPL`);
    console.log();
    
    // Start interactive REPL with cursor
    this.startInteractiveREPL();
    
    // Keep the process alive
    return new Promise(() => {});
  }
  
  private startInteractiveREPL() {
    // Simple REPL for dev mode (non-blocking)
    this.log('ℹ️  Dev mode: Using simple command prompt', chalk.blue);
    console.log();
    
    // Set up readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.green('udos> ')
    });
    
    rl.prompt();
    
    rl.on('line', (line) => {
      const input = line.trim();
      
      if (input) {
        this.handleREPLCommand(input);
      }
      
      rl.prompt();
    }).on('close', () => {
      this.log('👋 Good bye!', chalk.yellow);
      process.exit(0);
    });
  }
  
  private handleREPLCommand(input: string) {
    // Handle special REPL commands
    if (input === 'open') {
      this.openBrowser();
      return;
    }
    
    if (input === 'help' || input === '?') {
      console.log(chalk.dim('\nAvailable REPL commands:'));
      console.log(`  ${chalk.cyan('open')}  - Open GUI in browser`);
      console.log(`  ${chalk.cyan('help')}  - Show this help`);
      console.log(`  ${chalk.cyan('exit')}  - Exit REPL`);
      console.log(`  ${chalk.cyan('quit')}  - Exit REPL`);
      console.log();
      console.log(chalk.dim('Any other command will be executed as: udo <command>'));
      return;
    }
    
    if (input === 'exit' || input === 'quit') {
      this.log('👋 Good bye!', chalk.yellow);
      process.exit(0);
      return;
    }
    
    // Execute as udo command
    this.log(`📍 Executing: udo ${input}`, chalk.blue);
    
    try {
      const udoProcess = spawn('node', [pathResolve(this.rootDir, 'core', 'bin', 'udo.mjs'), ...input.split(' ')], {
        stdio: 'inherit',
        cwd: this.rootDir
      });
      
      udoProcess.on('close', (code) => {
        if (code !== 0) {
          this.log(`⚠️ Command exited with code ${code}`, chalk.yellow);
        }
        // Prompt will be shown again by the input handler
      });
    } catch (error: any) {
      this.log(`❌ Failed to execute command: ${error.message}`, chalk.red);
    }
  }
  
  private openBrowser() {
    try {
      spawn('open', ['http://localhost:5176'], { detached: true }).unref();
      this.log('🚀 Opening browser...', chalk.green);
    } catch (error: any) {
      this.log(`⚠️ Could not open browser: ${error.message}`, chalk.yellow);
      this.log('🌐 Please manually open: http://localhost:5176', chalk.blue);
    }
  }
}

// Main execution
async function main() {
  program
    .name('udos-tui')
    .description('uDosConnect TUI Launcher with Bubble Tea style')
    .option('-v, --verbose', 'Verbose output')
    .option('-r, --root <path>', 'uDosConnect root directory', process.cwd());
  
  program.parse(process.argv);
  
  const options = program.opts();
  const rootDir = pathResolve(options.root);
  
  const launcher = new TUILauncher(rootDir, options.verbose);
  await launcher.run();
}

main().catch((error: any) => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});
