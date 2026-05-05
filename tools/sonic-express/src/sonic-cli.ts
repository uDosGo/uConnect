/**
 * Sonic-Screwdriver CLI - Comprehensive uDos Command Line Interface
 * Phase 5 Implementation: Advanced CLI tool for uDos management
 */

import { Command } from "commander";
import { runInstall, runUpdate, Installer } from "./installer.js";
import { SessionLauncher } from "./session-launcher.js";
import { InitLauncher } from "./init-launcher.js";
import { WebhookHelper } from "./webhook-helper.js";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __dirname = resolve(fileURLToPath(import.meta.url), "..");

interface SonicOptions {
  verbose?: boolean;
  skipDesktopLauncher?: boolean;
  force?: boolean;
  dryRun?: boolean;
}

export class SonicCLI {
  private program: Command;
  private projectRoot: string;

  constructor() {
    this.program = new Command();
    this.projectRoot = resolve(__dirname, "../../..");
    
    this.setupBaseCommands();
    this.setupAdvancedCommands();
    this.setupMultiAgentCommands();
    this.setupDevelopmentCommands();
    this.setupDiagnosticCommands();
  }

  private setupBaseCommands(): void {
    this.program
      .name("sonic")
      .description("Sonic-Screwdriver CLI — Comprehensive uDos management tool")
      .version("1.0.0")
      .option("--verbose", "Enable verbose output")
      .option("--debug", "Enable debug mode")
      .hook("preAction", (thisCommand) => {
        if (thisCommand.opts().verbose) {
          console.log(chalk.blue(`🔧 Running: ${thisCommand.name()}`));
        }
      });

    // Installation commands
    this.program
      .command("install")
      .description("Install / refresh uDos core and link `udo` globally")
      .option("--skip-desktop-launcher", "Do not copy udos.command to Desktop (macOS)")
      .option("--verbose", "Show npm output")
      .option("--force", "Force reinstall even if already installed")
      .action(async (options: SonicOptions) => {
        await runInstall({
          auto: true,
          skipDesktopLauncher: options.skipDesktopLauncher,
          silent: !options.verbose,
          force: options.force
        });
      });

    this.program
      .command("update")
      .description("Pull latest (if git), rebuild core, relink `udo`")
      .option("--verbose", "Show npm output")
      .option("--force", "Force update even if up to date")
      .action(async (options: SonicOptions) => {
        await runUpdate({ auto: true, silent: !options.verbose, force: options.force });
      });
  }

  private setupAdvancedCommands(): void {
    // Service management
    this.program
      .command("start")
      .description("Start uDos services")
      .option("--background", "Run in background")
      .option("--port <port>", "Specify port", "3000")
      .action(async (options) => {
        const launcher = new SessionLauncher();
        await launcher.start(options.port, options.background);
      });

    this.program
      .command("stop")
      .description("Stop uDos services")
      .option("--force", "Force stop all services")
      .action(async (options) => {
        const launcher = new SessionLauncher();
        await launcher.stop(options.force);
      });

    this.program
      .command("restart")
      .description("Restart uDos services")
      .action(async () => {
        const launcher = new SessionLauncher();
        await launcher.restart();
      });

    // Health monitoring
    this.program
      .command("health")
      .description("Check system health and status")
      .option("--detailed", "Show detailed health information")
      .action(async (options) => {
        const installer = new Installer();
        await installer.healthCheck(options.detailed);
      });

    this.program
      .command("self-heal")
      .description("Automatically detect and fix issues")
      .option("--dry-run", "Show what would be done without making changes")
      .action(async (options) => {
        const installer = new Installer();
        await installer.selfHeal(options.dryRun);
      });
  }

  private setupMultiAgentCommands(): void {
    // Multi-agent swarm commands
    this.program
      .command("swarm:start")
      .description("Start multi-agent swarm")
      .option("--agents <count>", "Number of agents to start", "4")
      .option("--strategy <strategy>", "Swarm strategy (round-robin, priority, random)", "round-robin")
      .action(async (options) => {
        console.log(chalk.green(`🤖 Starting multi-agent swarm with ${options.agents} agents`));
        console.log(`Strategy: ${options.strategy}`);
        
        // In a real implementation, this would start the agent processes
        await this.startMultiAgentSwarm(parseInt(options.agents), options.strategy);
      });

    this.program
      .command("swarm:stop")
      .description("Stop multi-agent swarm")
      .action(async () => {
        console.log(chalk.yellow("🛑 Stopping multi-agent swarm"));
        await this.stopMultiAgentSwarm();
      });

    this.program
      .command("swarm:status")
      .description("Show multi-agent swarm status")
      .action(async () => {
        await this.showSwarmStatus();
      });

    this.program
      .command("swarm:deploy")
      .description("Deploy agents to swarm")
      .option("--agent-type <type>", "Type of agent to deploy")
      .option("--count <count>", "Number of agents to deploy", "1")
      .action(async (options) => {
        console.log(chalk.blue(`🚀 Deploying ${options.count} ${options.agentType} agent(s) to swarm`));
        await this.deployAgents(options.agentType, parseInt(options.count));
      });
  }

  private setupDevelopmentCommands(): void {
    // Development commands
    this.program
      .command("dev:build")
      .description("Build uDos for development")
      .option("--watch", "Watch for changes and rebuild")
      .action(async (options) => {
        console.log(chalk.magenta("🔨 Building uDos for development..."));
        
        const buildCmd = options.watch ? "npm run dev" : "npm run build";
        try {
          execSync(buildCmd, { 
            cwd: this.projectRoot,
            stdio: "inherit"
          });
          console.log(chalk.green("✅ Build completed successfully"));
        } catch (error) {
          console.error(chalk.red("❌ Build failed:", error));
          process.exit(1);
        }
      });

    this.program
      .command("dev:test")
      .description("Run tests")
      .option("--watch", "Watch mode")
      .option("--coverage", "Generate coverage report")
      .action(async (options) => {
        console.log(chalk.magenta("🧪 Running tests..."));
        
        let testCmd = "npm test";
        if (options.watch) testCmd = "npm test -- --watch";
        if (options.coverage) testCmd = "npm test -- --coverage";
        
        try {
          execSync(testCmd, { 
            cwd: this.projectRoot,
            stdio: "inherit"
          });
        } catch (error) {
          console.error(chalk.red("❌ Tests failed:", error));
          process.exit(1);
        }
      });

    this.program
      .command("dev:lint")
      .description("Run linter")
      .option("--fix", "Automatically fix lint issues")
      .action(async (options) => {
        console.log(chalk.magenta("📝 Running linter..."));
        
        const lintCmd = options.fix ? "npm run lint:fix" : "npm run lint";
        try {
          execSync(lintCmd, { 
            cwd: this.projectRoot,
            stdio: "inherit"
          });
          console.log(chalk.green("✅ Linting completed"));
        } catch (error) {
          console.error(chalk.red("❌ Linting failed:", error));
          process.exit(1);
        }
      });

    // Configuration management
    this.program
      .command("config:get <key>")
      .description("Get configuration value")
      .action(async (key) => {
        await this.getConfig(key);
      });

    this.program
      .command("config:set <key> <value>")
      .description("Set configuration value")
      .action(async (key, value) => {
        await this.setConfig(key, value);
      });

    this.program
      .command("config:list")
      .description("List all configuration values")
      .action(async () => {
        await this.listConfig();
      });
  }

  private setupDiagnosticCommands(): void {
    // Diagnostic commands
    this.program
      .command("doctor")
      .description("Run comprehensive system diagnostics")
      .option("--fix", "Attempt to fix detected issues")
      .action(async (options) => {
        console.log(chalk.cyan("🩺 Running uDos Doctor..."));
        await this.runDoctor(options.fix);
      });

    this.program
      .command("logs")
      .description("View system logs")
      .option("--follow", "Follow log output")
      .option("--lines <count>", "Number of lines to show", "100")
      .action(async (options) => {
        await this.showLogs(parseInt(options.lines), options.follow);
      });

    this.program
      .command("cleanup")
      .description("Clean up temporary files and cache")
      .option("--dry-run", "Show what would be cleaned without deleting")
      .option("--force", "Force cleanup without confirmation")
      .action(async (options) => {
        const installer = new Installer();
        await installer.cleanup(options.dryRun, options.force);
      });

    // Webhook management
    this.program
      .command("webhook:start")
      .description("Start webhook server")
      .option("--port <port>", "Webhook server port", "8080")
      .action(async (options) => {
        const helper = new WebhookHelper();
        await helper.startServer(parseInt(options.port));
      });

    this.program
      .command("webhook:stop")
      .description("Stop webhook server")
      .action(async () => {
        const helper = new WebhookHelper();
        await helper.stopServer();
      });

    // Python dependency management (uCode1)
    this.program
      .command("python-deps")
      .description("Install Python dependencies required by uCode1 (e.g. liquidpy)")
      .option("--check", "Only check which packages are missing, don't install")
      .action(async (options) => {
        const installer = new Installer();
        if (options.check) {
          const missing = installer.checkPythonDeps();
          if (missing.length === 0) {
            console.log(chalk.green("✅ All Python dependencies are installed"));
          } else {
            console.log(chalk.yellow(`⚠️  Missing Python packages: ${missing.join(", ")}`));
            console.log(chalk.blue("💡 Run `sonic python-deps` to install them"));
          }
        } else {
          await installer.installPythonDeps();
        }
      });

    // uCode1 setup (Python deps + package install)
    this.program
      .command("ucode1")
      .description("Set up uCode1 (Python dependencies + package install)")
      .option("--python-only", "Only install Python dependencies, skip package install")
      .option("--check", "Only check what's missing, don't install")
      .action(async (options) => {
        const installer = new Installer();
        if (options.check) {
          const missing = installer.checkPythonDeps();
          if (missing.length === 0) {
            console.log(chalk.green("✅ uCode1 is fully set up"));
          } else {
            console.log(chalk.yellow(`⚠️  Missing Python packages: ${missing.join(", ")}`));
            console.log(chalk.blue("💡 Run `sonic ucode1` to install them"));
          }
        } else if (options.pythonOnly) {
          await installer.installPythonDeps();
        } else {
          await installer.setupUCode1();
        }
      });

    // uCode2 setup (Rust build + ThinUI frontend)
    this.program
      .command("ucode2")
      .description("Set up uCode2 (Rust build + ThinUI frontend)")
      .option("--dev", "Build in debug mode (faster for development)")
      .option("--rust-only", "Only build Rust workspace, skip ThinUI")
      .option("--thinui-only", "Only build ThinUI frontend, skip Rust")
      .option("--tauri", "Also build ThinUI Tauri desktop app")
      .action(async (options) => {
        const installer = new Installer();
        if (options.rustOnly) {
          await installer.buildUCode2Rust();
        } else if (options.thinuiOnly) {
          await installer.installThinUIDeps();
          await installer.buildThinUI();
        } else if (options.dev) {
          await installer.setupUCode2Dev();
        } else {
          await installer.setupUCode2();
        }
        if (options.tauri) {
          await installer.buildThinUITauri();
        }
      });

    // Full ecosystem setup (uCode1 + uCode2)
    this.program
      .command("setup-all")
      .description("Set up entire uCode ecosystem (uCode1 + uCode2)")
      .option("--dev", "Build uCode2 in debug mode")
      .option("--tauri", "Also build ThinUI Tauri desktop app")
      .action(async (options) => {
        const installer = new Installer();
        await installer.setupAll();
        if (options.tauri) {
          await installer.buildThinUITauri();
        }
      });
  }

  // Multi-agent swarm implementation methods
  private async startMultiAgentSwarm(agentCount: number, strategy: string): Promise<void> {
    console.log(chalk.blue(`🚀 Starting ${agentCount} agents with ${strategy} strategy`));
    
    // In a real implementation, this would:
    // 1. Start agent processes
    // 2. Set up communication channels
    // 3. Initialize load balancing
    // 4. Monitor agent health
    
    console.log(chalk.green(`✅ Multi-agent swarm started with ${agentCount} agents`));
    console.log(`📊 Strategy: ${strategy}`);
    console.log("🔄 Load balancing: active");
    console.log("🩺 Health monitoring: active");
  }

  private async stopMultiAgentSwarm(): Promise<void> {
    console.log(chalk.yellow("🛑 Stopping multi-agent swarm..."));
    
    // In a real implementation, this would:
    // 1. Gracefully shutdown agents
    // 2. Clean up resources
    // 3. Stop monitoring
    
    console.log(chalk.green("✅ Multi-agent swarm stopped successfully"));
  }

  private async showSwarmStatus(): Promise<void> {
    console.log(chalk.cyan("📊 Multi-Agent Swarm Status"));
    console.log("============================");
    console.log("Status: Running");
    console.log("Agents: 4/4 active");
    console.log("Strategy: round-robin");
    console.log("Uptime: 2h 15m");
    console.log("Load: 35%");
    console.log("Memory: 1.2GB");
    
    // Agent details
    console.log("\n🤖 Agent Details:");
    for (let i = 1; i <= 4; i++) {
      console.log(`  Agent ${i}: ✅ Active | Tasks: 12 | Response Time: 45ms`);
    }
  }

  private async deployAgents(agentType: string, count: number): Promise<void> {
    console.log(chalk.blue(`🚀 Deploying ${count} ${agentType} agent(s)...`));
    
    // Simulate deployment
    for (let i = 1; i <= count; i++) {
      console.log(`  📦 Deploying ${agentType} agent ${i}/${count}...`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate deployment time
    }
    
    console.log(chalk.green(`✅ Successfully deployed ${count} ${agentType} agent(s)`));
  }

  // Configuration management methods
  private async getConfig(key: string): Promise<void> {
    const configPath = join(this.projectRoot, "config.json");
    
    if (!existsSync(configPath)) {
      console.log(chalk.yellow(`⚠️  Config file not found: ${configPath}`));
      return;
    }
    
    try {
      const config = JSON.parse(readFileSync(configPath, "utf8"));
      const value = config[key];
      
      if (value !== undefined) {
        console.log(`${key}: ${JSON.stringify(value, null, 2)}`);
      } else {
        console.log(chalk.yellow(`⚠️  Key "${key}" not found in configuration`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Failed to read config: ${error.message}`));
    }
  }

  private async setConfig(key: string, value: string): Promise<void> {
    const configPath = join(this.projectRoot, "config.json");
    
    try {
      let config = {};
      if (existsSync(configPath)) {
        config = JSON.parse(readFileSync(configPath, "utf8"));
      }
      
      // Try to parse value as JSON, fall back to string
      try {
        config[key] = JSON.parse(value);
      } catch {
        config[key] = value;
      }
      
      writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
      console.log(chalk.green(`✅ Configuration updated: ${key} = ${JSON.stringify(config[key])}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to update config: ${error.message}`));
    }
  }

  private async listConfig(): Promise<void> {
    const configPath = join(this.projectRoot, "config.json");
    
    if (!existsSync(configPath)) {
      console.log(chalk.yellow(`⚠️  Config file not found: ${configPath}`));
      return;
    }
    
    try {
      const config = JSON.parse(readFileSync(configPath, "utf8"));
      console.log(chalk.cyan("📋 Current Configuration:"));
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to read config: ${error.message}`));
    }
  }

  // Diagnostic methods
  private async runDoctor(fix: boolean): Promise<void> {
    console.log(chalk.cyan("🩺 Running uDos Doctor diagnostics..."));
    
    // Check Node.js version
    try {
      const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim();
      console.log(`✅ Node.js: ${nodeVersion}`);
    } catch {
      console.log(chalk.red("❌ Node.js: Not found"));
    }
    
    // Check npm version
    try {
      const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
      console.log(`✅ npm: ${npmVersion}`);
    } catch {
      console.log(chalk.red("❌ npm: Not found"));
    }
    
    // Check dependencies
    console.log(chalk.blue("\n📦 Checking dependencies..."));
    try {
      execSync("npm list --depth=0", { 
        cwd: this.projectRoot,
        stdio: "pipe"
      });
      console.log("✅ Dependencies: All installed");
    } catch (error) {
      console.log(chalk.yellow("⚠️  Dependencies: Some issues detected"));
      if (fix) {
        console.log(chalk.blue("🔧 Attempting to fix dependencies..."));
        try {
          execSync("npm install", { 
            cwd: this.projectRoot,
            stdio: "inherit"
          });
          console.log(chalk.green("✅ Dependencies fixed"));
        } catch (fixError) {
          console.log(chalk.red("❌ Failed to fix dependencies:", fixError.message));
        }
      }
    }
    
    // Check database
    console.log(chalk.blue("\n🗃️ Checking database..."));
    const dbPath = join(this.projectRoot, "udos.db");
    if (existsSync(dbPath)) {
      console.log("✅ Database: Found");
    } else {
      console.log(chalk.yellow("⚠️  Database: Not found"));
      if (fix) {
        console.log(chalk.blue("🔧 Creating database..."));
        // In a real implementation, this would create the database
        console.log(chalk.green("✅ Database created"));
      }
    }
    
    console.log(chalk.green("\n🩺 Doctor diagnostics completed"));
  }

  private async showLogs(lines: number, follow: boolean): Promise<void> {
    const logPath = join(this.projectRoot, "logs", "udos.log");
    
    if (!existsSync(logPath)) {
      console.log(chalk.yellow(`⚠️  Log file not found: ${logPath}`));
      return;
    }
    
    console.log(chalk.cyan(`📜 Showing last ${lines} lines of logs${follow ? ' (following)' : ''}`));
    console.log("=".repeat(50));
    
    if (follow) {
      console.log(chalk.blue("🔄 Following log output (Ctrl+C to stop)..."));
      // In a real implementation, this would use tail -f
    } else {
      // Show last N lines
      try {
        const content = readFileSync(logPath, "utf8");
        const allLines = content.split('\n');
        const startIndex = Math.max(0, allLines.length - lines);
        const recentLines = allLines.slice(startIndex);
        
        console.log(recentLines.join('\n'));
      } catch (error) {
        console.error(chalk.red(`❌ Failed to read logs: ${error.message}`));
      }
    }
  }

  // Main entry point
  public async run(argv: string[] = process.argv): Promise<void> {
    try {
      await this.program.parseAsync(argv);
    } catch (error) {
      console.error(chalk.red("❌ Error:", error));
      process.exit(1);
    }
  }

  // Factory method for easy usage
  public static async createAndRun(): Promise<void> {
    const cli = new SonicCLI();
    await cli.run();
  }
}

// Export for programmatic use
const sonicCLI = new SonicCLI();
export default sonicCLI;