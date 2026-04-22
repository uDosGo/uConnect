// core/src/commands/admin-panel.ts
// uDos CLI Admin Panel - Command Inspection and System Status

import { Command } from 'commander';
import chalk from 'chalk';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json dynamically
let packageJson: any;
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJsonContent = await import('fs/promises').then(fs => fs.readFile(packageJsonPath, 'utf-8'));
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  console.error(chalk.red('❌ Failed to read package.json:'), error instanceof Error ? error.message : String(error));
  packageJson = {
    version: 'unknown',
    name: 'udos-core',
    description: 'uDos Core CLI',
    license: 'MIT'
  };
}

interface CommandInfo {
  name: string;
  description: string;
  options?: string[];
  subcommands?: CommandInfo[];
  helpText?: string;
  status?: 'stable' | 'beta' | 'experimental' | 'deprecated' | 'stub';
  module?: 'core' | 'core-ts' | 'ui-js' | 'node' | 'go' | 'rust' | 'python';
  syntax?: string;
  tuiSupport?: boolean;
  guiSupport?: boolean;
  webSupport?: boolean;
  cliSupport?: boolean;
  sinceVersion?: string;
  deprecatedIn?: string;
  relatedCommands?: string[];
  examples?: string[];
  isAsync?: boolean;
  requiresAuth?: boolean;
  requiresNetwork?: boolean;
  requiresVault?: boolean;
  category?: 'vault' | 'content' | 'publishing' | 'collaboration' | 'system' | 'development' | 'integration' | 'ui' | 'experimental';
}

interface CommandMatrixEntry {
  command: string;
  status: string;
  module: string;
  syntax: string;
  tui: boolean;
  gui: boolean;
  web: boolean;
  cli: boolean;
  category: string;
  since: string;
  deprecated?: string;
}

interface SmokeTestResult {
  name: string;
  passed: boolean;
  error?: string;
  output?: string;
}

class AdminPanel {
  private commands: CommandInfo[] = [];
  private smokeTestResults: SmokeTestResult[] = [];
  private packageJson: any;

  constructor(private program: Command) {
    // Initialize with default package info
    this.packageJson = {
      version: 'unknown',
      name: 'udos-core',
      description: 'uDos Core CLI',
      license: 'MIT'
    };
  }

  public async loadPackageJson(): Promise<void> {
    try {
      // Use the core package.json path directly
      const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
      console.log(chalk.dim(`🔍 Looking for package.json at: ${packageJsonPath}`));
      const packageJsonContent = await import('fs/promises').then(fs => fs.readFile(packageJsonPath, 'utf-8'));
      this.packageJson = JSON.parse(packageJsonContent);
      console.log(chalk.green(`✅ Successfully loaded package.json: ${this.packageJson.version}`));
    } catch (error) {
      console.error(chalk.red('❌ Failed to read package.json:'), error instanceof Error ? error.message : String(error));
      // Fallback to defaults
      this.packageJson = {
        version: 'unknown',
        name: 'udos-core',
        description: 'uDos Core CLI',
        license: 'MIT'
      };
    }
  }

  public async runFullDiagnostics(): Promise<void> {
    console.log(chalk.cyan('🔧 uDos Admin Panel - Full System Diagnostics'));
    console.log(chalk.dim('='.repeat(60)));
    
    await this.loadPackageJson();
    await this.collectCommandInformation();
    await this.runSmokeTests();
    
    this.displaySystemOverview();
    this.displayCommandInventory();
    this.displaySmokeTestStatus();
    await this.displayVersionInformation();
    
    console.log(chalk.dim('='.repeat(60)));
    console.log(chalk.green('✅ Diagnostics complete'));
  }

  public async collectCommandInformation(): Promise<void> {
    // Extract command information from the program
    const commands = this.program.commands;
    
    for (const cmd of commands) {
      const commandInfo: CommandInfo = {
        name: cmd.name(),
        description: cmd.description() || 'No description available',
        options: [],
        subcommands: [],
        ...this.getCommandMetadata(cmd.name())
      };

      // Get options
      const options = cmd.options;
      for (const option of options) {
        const optionStr = option.flags;
        if (option.description) {
          commandInfo.options?.push(`${optionStr} - ${option.description}`);
        } else {
          commandInfo.options?.push(optionStr);
        }
      }

      // Get subcommands (if this command has subcommands)
      if (cmd.commands && cmd.commands.length > 0) {
        for (const subCmd of cmd.commands) {
          commandInfo.subcommands?.push({
            name: subCmd.name(),
            description: subCmd.description() || 'No description available',
            ...this.getCommandMetadata(`${cmd.name()}.${subCmd.name()}`)
          });
        }
      }

      this.commands.push(commandInfo);
    }

    // Sort commands alphabetically
    this.commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  private getCommandMetadata(commandName: string): Partial<CommandInfo> {
    // Enhanced metadata for uDos commands
    const metadataMap: Record<string, Partial<CommandInfo>> = {
      // Core commands
      'init': { status: 'stable', module: 'core', category: 'vault', syntax: 'udo init [path]', cliSupport: true, sinceVersion: '1.0.0', requiresVault: false },
      'vault': { status: 'stable', module: 'core', category: 'vault', syntax: 'udo vault <subcommand>', cliSupport: true, sinceVersion: '1.0.0', requiresVault: true },
      'list': { status: 'stable', module: 'core', category: 'content', syntax: 'udo list [path]', cliSupport: true, sinceVersion: '1.0.0', requiresVault: true },
      'open': { status: 'stable', module: 'core', category: 'content', syntax: 'udo open <file>', cliSupport: true, sinceVersion: '1.0.0', requiresVault: true },
      'edit': { status: 'stable', module: 'core', category: 'content', syntax: 'udo edit <file>', cliSupport: true, sinceVersion: '1.0.0', requiresVault: true },
      'delete': { status: 'stable', module: 'core', category: 'content', syntax: 'udo delete <file>', cliSupport: true, sinceVersion: '1.0.0', requiresVault: true },
      'restore': { status: 'stable', module: 'core', category: 'content', syntax: 'udo restore <id>', cliSupport: true, sinceVersion: '1.0.0', requiresVault: true },
      'search': { status: 'stable', module: 'core', category: 'content', syntax: 'udo search <query>', cliSupport: true, sinceVersion: '1.0.0', requiresVault: true },
      
      // Content management
      'md': { status: 'stable', module: 'core', category: 'content', syntax: 'udo md <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'fm': { status: 'stable', module: 'core', category: 'content', syntax: 'udo fm <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'template': { status: 'stable', module: 'core', category: 'content', syntax: 'udo template <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Publishing
      'publish': { status: 'stable', module: 'core', category: 'publishing', syntax: 'udo publish <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'feed': { status: 'stable', module: 'core', category: 'publishing', syntax: 'udo feed <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'spool': { status: 'stable', module: 'core', category: 'publishing', syntax: 'udo spool <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Collaboration
      'github': { status: 'beta', module: 'core', category: 'collaboration', syntax: 'udo github <subcommand>', cliSupport: true, requiresNetwork: true, sinceVersion: '1.0.0' },
      'issue': { status: 'beta', module: 'core', category: 'collaboration', syntax: 'udo issue <subcommand>', cliSupport: true, requiresNetwork: true, sinceVersion: '1.0.0' },
      'pr': { status: 'beta', module: 'core', category: 'collaboration', syntax: 'udo pr <subcommand>', cliSupport: true, requiresNetwork: true, sinceVersion: '1.0.0' },
      'wp': { status: 'experimental', module: 'core', category: 'collaboration', syntax: 'udo wp <subcommand>', cliSupport: true, requiresNetwork: true, sinceVersion: '1.0.0' },
      'submit': { status: 'experimental', module: 'core', category: 'collaboration', syntax: 'udo submit [options] [pathOrArea]', cliSupport: true, requiresNetwork: true, sinceVersion: '1.0.0' },
      'review': { status: 'experimental', module: 'core', category: 'collaboration', syntax: 'udo review [options] [pathOrArea]', cliSupport: true, requiresNetwork: true, sinceVersion: '1.0.0' },
      'approve': { status: 'experimental', module: 'core', category: 'collaboration', syntax: 'udo approve [options]', cliSupport: true, requiresNetwork: true, sinceVersion: '1.0.0' },
      
      // System commands
      'status': { status: 'stable', module: 'core', category: 'system', syntax: 'udo status', cliSupport: true, sinceVersion: '1.0.0' },
      'doctor': { status: 'stable', module: 'core', category: 'system', syntax: 'udo doctor', cliSupport: true, sinceVersion: '1.0.0' },
      'cleanup': { status: 'stable', module: 'core', category: 'system', syntax: 'udo cleanup', cliSupport: true, sinceVersion: '1.0.0' },
      'clean': { status: 'stable', module: 'core', category: 'system', syntax: 'udo clean [options]', cliSupport: true, sinceVersion: '1.0.0' },
      'tidy': { status: 'stable', module: 'core', category: 'system', syntax: 'udo tidy', cliSupport: true, sinceVersion: '1.0.0' },
      'ping': { status: 'stable', module: 'core', category: 'system', syntax: 'udo ping', cliSupport: true, sinceVersion: '1.0.0' },
      'pong': { status: 'stable', module: 'core', category: 'system', syntax: 'udo pong', cliSupport: true, sinceVersion: '1.0.0' },
      'health': { status: 'stable', module: 'core', category: 'system', syntax: 'udo health [options]', cliSupport: true, sinceVersion: '1.0.0' },
      'version': { status: 'stable', module: 'core', category: 'system', syntax: 'udo version', cliSupport: true, sinceVersion: '1.0.0' },
      'tour': { status: 'stable', module: 'core', category: 'system', syntax: 'udo tour', cliSupport: true, tuiSupport: true, sinceVersion: '1.0.0' },
      'update': { status: 'stable', module: 'core', category: 'system', syntax: 'udo update', cliSupport: true, sinceVersion: '1.0.0' },
      'uninstall': { status: 'stable', module: 'core', category: 'system', syntax: 'udo uninstall [options]', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Development commands
      'code': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo code <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'test': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo test <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'cost': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo cost <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'config': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo config <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'benchmark': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo benchmark <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'check': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo check <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'repair': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo repair <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'background': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo background <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Integration commands
      'network': { status: 'beta', module: 'core', category: 'integration', syntax: 'udo network <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'beacon': { status: 'beta', module: 'core', category: 'integration', syntax: 'udo beacon <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'adaptor': { status: 'beta', module: 'core', category: 'integration', syntax: 'udo adaptor <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'sync': { status: 'stub', module: 'core', category: 'integration', syntax: 'udo sync <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // UI commands
      'gui': { status: 'stable', module: 'ui-js', category: 'ui', syntax: 'udo gui [options]', cliSupport: true, guiSupport: true, webSupport: true, sinceVersion: '1.0.0' },
      'usxd': { status: 'stable', module: 'ui-js', category: 'ui', syntax: 'udo usxd <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'grid': { status: 'stable', module: 'ui-js', category: 'ui', syntax: 'udo grid <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'obf': { status: 'stable', module: 'ui-js', category: 'ui', syntax: 'udo obf <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'cell': { status: 'stable', module: 'ui-js', category: 'ui', syntax: 'udo cell <x> <y> <z>', cliSupport: true, sinceVersion: '1.0.0' },
      'cube': { status: 'stable', module: 'ui-js', category: 'ui', syntax: 'udo cube <x> <y>', cliSupport: true, sinceVersion: '1.0.0' },
      'surface': { status: 'stable', module: 'ui-js', category: 'ui', syntax: 'udo surface <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'font': { status: 'stub', module: 'ui-js', category: 'ui', syntax: 'udo font <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Tower of Knowledge
      'tower': { status: 'experimental', module: 'core', category: 'experimental', syntax: 'udo tower <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Trash/Compost
      'trash': { status: 'stable', module: 'core', category: 'system', syntax: 'udo trash <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      'compost': { status: 'stable', module: 'core', category: 'system', syntax: 'udo compost <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Admin panel
      'admin': { status: 'stable', module: 'core', category: 'system', syntax: 'udo admin <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Vibe integration
      'vibe': { status: 'beta', module: 'core', category: 'integration', syntax: 'udo vibe [options]', cliSupport: true, tuiSupport: true, sinceVersion: '1.0.0' },
      
      // App launcher
      'app': { status: 'beta', module: 'node', category: 'integration', syntax: 'udo app <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Workflow
      'workflow': { status: 'experimental', module: 'core', category: 'development', syntax: 'udo workflow <subcommand>', cliSupport: true, sinceVersion: '1.0.0' },
      
      // Default for unknown commands
      ...Object.fromEntries(Array.from({ length: 62 }, (_, i) => [i.toString(), { status: 'stable', module: 'core', category: 'system', syntax: 'udo ' + i.toString(), cliSupport: true }]))
    };

    return metadataMap[commandName] || {
      status: 'stable', 
      module: 'core', 
      category: 'system', 
      syntax: `udo ${commandName}`,
      cliSupport: true
    };
  }

  public displayCommandMatrix(): void {
    console.log(chalk.cyan('📊 uDos Command Matrix'));
    console.log(chalk.dim('='.repeat(80)));
    
    // Group commands by category
    const categories = new Map<string, CommandInfo[]>();
    
    for (const cmd of this.commands) {
      const category = cmd.category || 'system';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)?.push(cmd);
    }

    // Display by category
    const categoryOrder = [
      'vault', 'content', 'publishing', 'collaboration', 
      'system', 'development', 'integration', 'ui', 'experimental'
    ];

    for (const category of categoryOrder) {
      if (categories.has(category)) {
        const categoryCommands = categories.get(category) || [];
        console.log(chalk.blue(`\n📁 ${category.toUpperCase()} (${categoryCommands.length} commands)`));
        console.log(chalk.dim('-'.repeat(60)));
        
        // Create matrix table
        console.log(chalk.dim('Command'.padEnd(20) + 'Status'.padEnd(12) + 'Module'.padEnd(10) + 'Syntax'.padEnd(25) + 'TUI/GUI'));
        console.log(chalk.dim('='.repeat(80)));
        
        for (const cmd of categoryCommands.sort((a, b) => a.name.localeCompare(b.name))) {
          const statusColor = this.getStatusColor(cmd.status || 'stable');
          const tuiGui = [];
          if (cmd.tuiSupport) tuiGui.push('T');
          if (cmd.guiSupport) tuiGui.push('G');
          if (cmd.webSupport) tuiGui.push('W');
          
          console.log(
            chalk.blue(cmd.name.padEnd(20)) +
            statusColor((cmd.status || 'stable').padEnd(12)) +
            chalk.dim((cmd.module || 'core').padEnd(10)) +
            chalk.dim((cmd.syntax || `udo ${cmd.name}`).padEnd(25)) +
            chalk.green(tuiGui.length > 0 ? tuiGui.join('/') : '-')
          );
        }
      }
    }

    // Summary
    console.log(chalk.dim('\n' + '='.repeat(80)));
    console.log(chalk.cyan(`📈 Summary: ${this.commands.length} commands across ${categories.size} categories`));
    
    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const cmd of this.commands) {
      const status = cmd.status || 'stable';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
    
    console.log(chalk.dim('Status Distribution:'));
    for (const [status, count] of Object.entries(statusCounts)) {
      const color = this.getStatusColor(status as any);
      console.log(`  ${color(status.padEnd(12))}: ${count} commands`);
    }
  }

  private getStatusColor(status: string): (text: string) => string {
    switch (status) {
      case 'stable': return chalk.green;
      case 'beta': return chalk.yellow;
      case 'experimental': return chalk.magenta;
      case 'deprecated': return chalk.red;
      case 'stub': return chalk.blue;
      default: return chalk.dim;
    }
  }

  public displayModularHelp(commandName: string): void {
    const cmd = this.commands.find(c => c.name === commandName);
    
    if (!cmd) {
      console.log(chalk.red(`❌ Command '${commandName}' not found`));
      return;
    }

    console.log(chalk.cyan(`📚 Modular Help: ${cmd.name}`));
    console.log(chalk.dim('='.repeat(60)));
    
    // Basic info
    console.log(chalk.blue(`\n📌 ${cmd.name}`));
    console.log(chalk.dim(cmd.description));
    
    // Status badge
    const statusColor = this.getStatusColor(cmd.status || 'stable');
    console.log(`\n${chalk.dim('Status:')} ${statusColor(cmd.status || 'stable')}`);
    
    // Module info
    console.log(`${chalk.dim('Module:')} ${chalk.dim(cmd.module || 'core')}`);
    console.log(`${chalk.dim('Category:')} ${chalk.dim(cmd.category || 'system')}`);
    
    if (cmd.sinceVersion) {
      console.log(`${chalk.dim('Since:')} ${chalk.dim(cmd.sinceVersion)}`);
    }
    
    if (cmd.deprecatedIn) {
      console.log(`${chalk.red('Deprecated:')} ${chalk.dim(cmd.deprecatedIn)}`);
    }
    
    // Syntax
    console.log(`\n${chalk.blue('📝 Syntax')}`);
    console.log(chalk.dim(`  ${cmd.syntax || `udo ${cmd.name}`}`));
    
    // Interface support
    console.log(`\n${chalk.blue('🖥️ Interface Support')}`);
    const interfaces = [];
    if (cmd.cliSupport) interfaces.push('CLI');
    if (cmd.tuiSupport) interfaces.push('TUI');
    if (cmd.guiSupport) interfaces.push('GUI');
    if (cmd.webSupport) interfaces.push('Web');
    console.log(chalk.dim(`  ${interfaces.join(', ') || 'CLI only'}`));
    
    // Requirements
    console.log(`\n${chalk.blue('🔧 Requirements')}`);
    const requirements = [];
    if (cmd.requiresAuth) requirements.push('Authentication');
    if (cmd.requiresNetwork) requirements.push('Network');
    if (cmd.requiresVault) requirements.push('Vault');
    console.log(chalk.dim(requirements.length > 0 ? `  ${requirements.join(', ')}` : '  None'));
    
    // Options
    if (cmd.options && cmd.options.length > 0) {
      console.log(`\n${chalk.blue('⚙️ Options')}`);
      for (const option of cmd.options) {
        console.log(chalk.dim(`  ${option}`));
      }
    }
    
    // Subcommands
    if (cmd.subcommands && cmd.subcommands.length > 0) {
      console.log(`\n${chalk.blue('📋 Subcommands')}`);
      for (const subCmd of cmd.subcommands) {
        const subStatusColor = this.getStatusColor(subCmd.status || 'stable');
        console.log(chalk.dim(`  • ${subCmd.name}: ${subCmd.description} ${subStatusColor(`[${subCmd.status || 'stable'}]`)}`));
      }
    }
    
    // Examples
    if (cmd.examples && cmd.examples.length > 0) {
      console.log(`\n${chalk.blue('💡 Examples')}`);
      for (const example of cmd.examples) {
        console.log(chalk.dim(`  ${example}`));
      }
    }
    
    // Related commands
    if (cmd.relatedCommands && cmd.relatedCommands.length > 0) {
      console.log(`\n${chalk.blue('🔗 Related Commands')}`);
      console.log(chalk.dim(`  ${cmd.relatedCommands.join(', ')}`));
    }
    
    console.log(chalk.dim('\n' + '='.repeat(60)));
  }

  private async runSmokeTests(): Promise<void> {
    console.log(chalk.blue('🧪 Running smoke tests...'));
    
    // Define the smoke tests (same as in the test file)
    const tests = [
      { name: 'vault init subcommand', command: ['vault', '--help'] },
      { name: 'github command group', command: ['github', '--help'] },
      { name: 'pr command group', command: ['pr', '--help'] },
      { name: 'wp sync setup guidance', command: ['wp', 'sync'] },
      { name: 'obf render html format', command: ['obf', 'render', 'docs/specs/obf-ui-blocks.md', '--format', 'html'] },
      { name: 'gui command group', command: ['gui', '--help'] },
      { name: 'app command group', command: ['app', '--help'] },
      { name: 'app launch options', command: ['app', 'launch', '--help'] }
    ];

    // Find the project root directory
    const projectRoot = path.resolve(__dirname, '..', '..', '..');
    const udoBin = path.join(projectRoot, 'core', 'bin', 'udo.mjs');

    for (const test of tests) {
      try {
        const result = spawnSync(process.execPath, [
          udoBin,
          ...test.command
        ], {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 10000,
          env: {
            ...process.env,
            NODE_PATH: process.env.NODE_PATH,
            PATH: process.env.PATH
          }
        });

        const success = result.status === 0;
        this.smokeTestResults.push({
          name: test.name,
          passed: success,
          error: success ? undefined : result.stderr || 'Unknown error',
          output: result.stdout
        });

        console.log(chalk[success ? 'green' : 'red'](`  ${success ? '✅' : '❌'} ${test.name}`));
      } catch (error: unknown) {
        this.smokeTestResults.push({
          name: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(chalk.red(`  ❌ ${test.name} - ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    }
  }

  private displaySystemOverview(): void {
    console.log(chalk.cyan('\n📊 System Overview'));
    console.log(chalk.dim('-'.repeat(40)));
    console.log(`  uDos Version: ${this.packageJson.version}`);
    console.log(`  Node.js Version: ${process.version}`);
    console.log(`  Platform: ${process.platform} ${process.arch}`);
    console.log(`  Total Commands: ${this.commands.length}`);
    console.log(`  Working Directory: ${process.cwd()}`);
  }

  private displayCommandInventory(): void {
    console.log(chalk.cyan('\n📋 Command Inventory'));
    console.log(chalk.dim('-'.repeat(40)));
    
    for (const cmd of this.commands) {
      console.log(chalk.blue(`\n📌 ${cmd.name}`));
      console.log(chalk.dim(`   ${cmd.description}`));
      
      if (cmd.options && cmd.options.length > 0) {
        console.log(chalk.dim(`   Options:`));
        for (const option of cmd.options) {
          console.log(chalk.dim(`     • ${option}`));
        }
      }

      if (cmd.subcommands && cmd.subcommands.length > 0) {
        console.log(chalk.dim(`   Subcommands:`));
        for (const subCmd of cmd.subcommands) {
          console.log(chalk.dim(`     • ${subCmd.name}: ${subCmd.description}`));
        }
      }
    }
  }

  private displaySmokeTestStatus(): void {
    console.log(chalk.cyan('\n🔥 Smoke Test Status'));
    console.log(chalk.dim('-'.repeat(40)));
    
    const passed = this.smokeTestResults.filter(r => r.passed).length;
    const total = this.smokeTestResults.length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    console.log(`  Overall Status: ${chalk[passRate >= 80 ? 'green' : passRate >= 50 ? 'yellow' : 'red'](`${passRate}% (${passed}/${total})`)}`);
    
    for (const result of this.smokeTestResults) {
      const status = result.passed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      console.log(`  ${status} ${result.name}`);
      if (!result.passed && result.error) {
        console.log(chalk.dim(`     Error: ${result.error.substring(0, 80)}${result.error.length > 80 ? '...' : ''}`));
      }
    }
  }

  public async displayVersionInformation(): Promise<void> {
    console.log(chalk.cyan('\n📦 Version Information'));
    console.log(chalk.dim('-'.repeat(40)));
    console.log(`  CLI Version: ${this.packageJson.version}`);
    console.log(`  Name: ${this.packageJson.name}`);
    console.log(`  Description: ${this.packageJson.description}`);
    console.log(`  License: ${this.packageJson.license}`);
    console.log(`  Node.js: ${process.version}`);
    console.log(`  V8: ${process.versions.v8}`);
    console.log(`  Platform: ${process.platform} ${process.arch}`);
    console.log(`  Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
  }

  public displayHelp(): void {
    console.log(chalk.cyan('📚 uDos Admin Panel Help'));
    console.log(chalk.dim('='.repeat(60)));
    console.log('Usage: udo admin [command]');
    console.log('');
    console.log('Commands:');
    console.log('  udo admin panel          Show full admin panel with diagnostics');
    console.log('  udo admin commands       List all available commands');
    console.log('  udo admin matrix         Show command matrix with granular metrics');
    console.log('  udo admin help2 <cmd>    Show modular help for specific command');
    console.log('  udo admin smoke          Run smoke tests');
    console.log('  udo admin version        Show version information');
    console.log('  udo admin help           Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  udo admin panel          # Full system diagnostics');
    console.log('  udo admin matrix         # Command matrix with status/module info');
    console.log('  udo admin help2 vault    # Detailed help for vault command');
    console.log('  udo admin commands       # List all commands');
    console.log('  udo admin smoke          # Run smoke tests only');
  }

  public listCommands(): void {
    console.log(chalk.cyan('📋 Available Commands'));
    console.log(chalk.dim('='.repeat(40)));
    
    for (const cmd of this.commands) {
      console.log(chalk.blue(`• ${cmd.name.padEnd(20)} ${cmd.description}`));
    }
    
    console.log(chalk.dim(`\nTotal: ${this.commands.length} commands`));
  }

  public async runSmokeTestsOnly(): Promise<void> {
    console.log(chalk.cyan('🔥 Running Smoke Tests'));
    console.log(chalk.dim('='.repeat(40)));
    
    await this.runSmokeTests();
    this.displaySmokeTestStatus();
  }
}

export function registerAdminPanelCommands(program: Command): void {
  const admin = program.command('admin').description('uDos Admin Panel - System diagnostics and command inspection');

  admin
    .command('panel')
    .description('Show full admin panel with system diagnostics')
    .action(async () => {
      const panel = new AdminPanel(program);
      await panel.runFullDiagnostics();
    });

  admin
    .command('commands')
    .description('List all available commands')
    .action(() => {
      const panel = new AdminPanel(program);
      panel.listCommands();
    });

  admin
    .command('smoke')
    .description('Run smoke tests and show status')
    .action(async () => {
      const panel = new AdminPanel(program);
      await panel.runSmokeTestsOnly();
    });

  admin
    .command('version')
    .description('Show detailed version information')
    .action(async () => {
      const panel = new AdminPanel(program);
      await panel.loadPackageJson();
      await panel.displayVersionInformation();
    });

  admin
    .command('help')
    .description('Show admin panel help')
    .action(() => {
      const panel = new AdminPanel(program);
      panel.displayHelp();
    });

  admin
    .command('matrix')
    .description('Show command matrix with granular metrics')
    .action(async () => {
      const panel = new AdminPanel(program);
      await panel.loadPackageJson();
      await panel.collectCommandInformation();
      panel.displayCommandMatrix();
    });

  admin
    .command('help2 <command>')
    .description('Show modular help for specific command')
    .action(async (commandName: string) => {
      const panel = new AdminPanel(program);
      await panel.loadPackageJson();
      await panel.collectCommandInformation();
      panel.displayModularHelp(commandName);
    });

  // Alias 'admin' alone to show help
  admin.action(() => {
    const panel = new AdminPanel(program);
    panel.displayHelp();
  });
}