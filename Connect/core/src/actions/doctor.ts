import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Get the project root directory
 */
function getProjectRoot(): string {
  // Hardcoded for now - we'll fix dynamic resolution later
  return '/Users/fredbook/code-vault/uDosConnect';
}

/**
 * Run comprehensive health check
 */
export async function cmdHealthFull() {
  console.log(chalk.cyan('🩺 Running Hivemind Health Check'));
  console.log('='.repeat(60));
  
  const checks = [
    { name: 'DSC2 CLI Commands', test: checkDSC2Commands },
    { name: 'Configuration System', test: checkConfigSystem },
    { name: 'Cost Management', test: checkCostSystem },
    { name: 'Quality Routing', test: checkQualitySystem },
    { name: 'Free Tier Arbiter', test: checkFreeTierSystem },
    { name: 'Caching System', test: checkCacheSystem },
    { name: 'CI/CD Workflow', test: checkCICDSystem },
    { name: 'OBX Rules', test: checkOBXRules },
    { name: 'MCP Server', test: checkMCPServer },
    { name: 'Benchmarking', test: checkBenchmarkSystem }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    try {
      const result = await check.test();
      if (result.success) {
        console.log(`${chalk.green('✅')} ${check.name}: ${result.message}`);
        passed++;
      } else {
        console.log(`${chalk.red('❌')} ${check.name}: ${result.message}`);
        failed++;
      }
    } catch (error: any) {
      console.log(`${chalk.red('❌')} ${check.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log('='.repeat(60));
  console.log(chalk.cyan('Health Check Summary:'));
  console.log(`  Passed: ${passed}/${checks.length}`);
  console.log(`  Failed: ${failed}/${checks.length}`);
  console.log(`  Status: ${failed === 0 ? chalk.green('HEALTHY') : chalk.yellow('DEGRADED')}`);
  
  if (failed > 0) {
    console.log(chalk.yellow('\n⚠️  Some components need attention'));
    console.log(chalk.blue('\n🩹 Self-Healing Options:'));
    console.log('   • Run: udo doctor repair  # Attempt automatic repairs');
    console.log('   • Run: udo doctor rebuild # Rebuild core components');
    console.log('   • Run: udo doctor install # Install missing dependencies');
  } else {
    console.log(chalk.green('\n✅ All systems operational'));
  }
}

/**
 * Attempt automatic repairs
 */
export async function cmdHealthRepair() {
  console.log(chalk.cyan('🩹 Attempting Automatic Repairs'));
  console.log('='.repeat(60));
  
  // Get project root from script location
  const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
  
  // Check if core components need rebuilding
  const coreDistExists = fs.existsSync(path.join(projectRoot, 'core', 'dist', 'cli.js'));
  const coreBinExists = fs.existsSync(path.join(projectRoot, 'core', 'bin', 'udo.mjs'));
  
  if (!coreDistExists || !coreBinExists) {
    console.log('🔨 Rebuilding core components...');
    try {
      execSync('cd core && npm run build', {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: 'inherit'
      });
      console.log(chalk.green('✅ Core components rebuilt'));
    } catch (error: any) {
      console.log(chalk.red('❌ Failed to rebuild core:'), error.message);
    }
  }
  
  if (!coreDistExists || !coreBinExists) {
    console.log('🔨 Rebuilding core components...');
    try {
      execSync('cd core && npm run build', {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: 'inherit'
      });
      console.log(chalk.green('✅ Core components rebuilt'));
    } catch (error: any) {
      console.log(chalk.red('❌ Failed to rebuild core:'), error.message);
    }
  }
  
  // Check if wrapper script is installed
  const wrapperPath = path.join(process.env.HOME || '', '.local', 'bin', 'udo');
  const wrapperSource = path.join(projectRoot, 'udo-wrapper');
  
  if (!fs.existsSync(wrapperPath) && fs.existsSync(wrapperSource)) {
    console.log('🔧 Installing udo wrapper...');
    try {
      const homeLocalBin = path.join(process.env.HOME || '', '.local', 'bin');
      if (!fs.existsSync(homeLocalBin)) {
        fs.mkdirSync(homeLocalBin, { recursive: true });
      }
      fs.copyFileSync(wrapperSource, wrapperPath);
      fs.chmodSync(wrapperPath, 0o755);
      console.log(chalk.green('✅ udo wrapper installed to'), wrapperPath);
      console.log('   Add this to your PATH: export PATH="$HOME/.local/bin:$PATH"');
    } catch (error: any) {
      console.log(chalk.red('❌ Failed to install wrapper:'), error.message);
    }
  }
  
  // Check configuration files
  const configDir = path.join(projectRoot, 'vault', 'config');
  const configFile = path.join(configDir, 'hivemind.json');
  
  if (!fs.existsSync(configFile)) {
    console.log('📝 Creating default configuration...');
    try {
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      const defaultConfig = {
        dsc2: {
          endpoint: 'http://localhost:30000/mcp',
          use_real_server: false,
          timeout_ms: 30000
        },
        cost: {
          daily_limit: null,
          monthly_limit: 50.0,
          require_approval: true
        },
        cache: {
          enabled: true,
          ttl_seconds: 3600,
          max_size_mb: 100
        },
        quality: {
          min_score: 0.7,
          fallback_enabled: true
        },
        free_tier: {
          prefer_free: true,
          apple_intel_enabled: true,
          copilot_enabled: true,
          gemini_enabled: true
        }
      };
      fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
      console.log(chalk.green('✅ Default configuration created'));
    } catch (error: any) {
      console.log(chalk.red('❌ Failed to create config:'), error.message);
    }
  }
  
  console.log('='.repeat(60));
  console.log(chalk.cyan('Repair Attempt Complete'));
  console.log('Run: udo check full  # Verify system health');
}

/**
 * Rebuild core components
 */
export async function cmdHealthRebuild() {
  console.log(chalk.cyan('🔨 Rebuilding Core Components'));
  console.log('='.repeat(60));
  
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    
    console.log('Cleaning previous build...');
    const { rimraf } = await import('rimraf');
    await rimraf(path.join(projectRoot, 'core', 'dist'));
    await rimraf(path.join(projectRoot, 'core', 'bin'));
    
    console.log('Installing dependencies...');
    execSync('npm install', {
      cwd: path.join(projectRoot, 'core'),
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log('Building TypeScript...');
    execSync('npm run build', {
      cwd: path.join(projectRoot, 'core'),
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log(chalk.green('✅ Core components rebuilt successfully'));
  } catch (error: any) {
    console.log(chalk.red('❌ Rebuild failed:'), error.message);
  }
  
  console.log('='.repeat(60));
}

/**
 * Install missing dependencies
 */
export async function cmdHealthInstall() {
  console.log(chalk.cyan('📦 Installing Dependencies'));
  console.log('='.repeat(60));
  
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    console.log('Installing core dependencies...');
    execSync('npm install', {
      cwd: path.join(projectRoot, 'core'),
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log('Installing Rust core dependencies...');
    try {
      execSync('npm install', {
        cwd: path.join(projectRoot, 'core-rs'),
        encoding: 'utf8',
        stdio: 'inherit'
      });
    } catch (error) {
      console.log(chalk.yellow('⚠️  Rust core dependencies may not be needed'));
    }
    
    console.log(chalk.green('✅ Dependencies installed successfully'));
  } catch (error: any) {
    console.log(chalk.red('❌ Installation failed:'), error.message);
  }
  
  console.log('='.repeat(60));
}

/**
 * Check DSC2 commands
 */
async function checkDSC2Commands(): Promise<{ success: boolean; message: string }> {
  try {
    const commands = ['generate', 'complete', 'insert', 'explain', 'refactor'];
    let working = 0;
    
    for (const cmd of commands) {
      try {
        const projectRoot = getProjectRoot();
        const result = execSync(`node core/bin/udo.mjs code ${cmd} --help`, { 
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 5000
        });
        // Check for command-specific descriptions
        if (cmd === 'generate' && (result.includes('natural language prompt') || result.includes('code to generate'))) {
          working++;
        } else if (cmd === 'complete' && result.includes('Fill-in-the-middle code completion')) {
          working++;
        } else if (cmd === 'insert' && result.includes('Insert code between prefix and suffix')) {
          working++;
        } else if (cmd === 'explain' && result.includes('Explain existing code')) {
          working++;
        } else if (cmd === 'refactor' && result.includes('Suggest code refactoring')) {
          working++;
        }
      } catch (error) {
        // Command failed
      }
    }
    
    return {
      success: working === commands.length,
      message: `${working}/${commands.length} commands working`
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check configuration system
 */
async function checkConfigSystem(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = getProjectRoot();
    const result = execSync(`node core/bin/udo.mjs config show`, { 
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 5000
    });
    
    return {
      success: result.includes('Hivemind Configuration') || result.includes('🎛') || result.includes('No configuration set'),
      message: 'Configuration system operational'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check cost management
 */
async function checkCostSystem(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    const result = execSync(`node core/bin/udo.mjs cost list`, { 
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 5000
    });
    
    return {
      success: result.includes('pending cost approvals') || result.includes('No pending'),
      message: 'Cost management operational'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check quality routing
 */
async function checkQualitySystem(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    const configResult = execSync(`node core/bin/udo.mjs config quality`, { 
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 5000
    });
    
    const hasQualityConfig = configResult.includes('Minimum score');
    
    return {
      success: hasQualityConfig,
      message: 'Quality routing configured'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check free tier arbiter
 */
async function checkFreeTierSystem(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    const configResult = execSync(`node core/bin/udo.mjs config free-tier`, { 
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 5000
    });
    
    const hasFreeTierConfig = configResult.includes('Prefer free');
    
    return {
      success: hasFreeTierConfig,
      message: 'Free tier arbiter configured'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check caching system
 */
async function checkCacheSystem(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    const configResult = execSync(`node core/bin/udo.mjs config cache`, { 
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 5000
    });
    
    const hasCacheConfig = configResult.includes('Enabled');
    
    return {
      success: hasCacheConfig,
      message: 'Caching system configured'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check CI/CD system
 */
async function checkCICDSystem(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    const workflowPath = path.join(projectRoot, '.github', 'workflows', 'auto-fix.yml');
    const exists = fs.existsSync(workflowPath);
    
    return {
      success: exists,
      message: exists ? 'CI/CD workflow present' : 'CI/CD workflow missing'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check OBX rules
 */
async function checkOBXRules(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    const obxDir = path.join(projectRoot, 'dev', 'vibe', 'obx');
    if (!fs.existsSync(obxDir)) {
      return { success: false, message: 'OBX rules directory missing' };
    }
    
    const files = fs.readdirSync(obxDir);
    const requiredRules = ['dsc2-integration.obx', 'quality-routing.obx'];
    const missingRules = requiredRules.filter(rule => !files.includes(rule));
    
    return {
      success: missingRules.length === 0,
      message: missingRules.length === 0 ? 'OBX rules complete' : `Missing: ${missingRules.join(', ')}`
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check MCP server
 */
async function checkMCPServer(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    // Check if MCP server files exist
    const mcpDir = path.join(projectRoot, 'core-rs', 'src', 'mcp');
    if (!fs.existsSync(mcpDir)) {
      return { success: false, message: 'MCP server directory missing' };
    }
    
    const files = fs.readdirSync(mcpDir);
    const hasServer = files.includes('server.rs');
    
    return {
      success: hasServer,
      message: hasServer ? 'MCP server implementation present' : 'MCP server missing'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Check benchmark system
 */
async function checkBenchmarkSystem(): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = path.resolve(path.dirname(process.argv[1]), '..');
    const result = execSync(`node core/bin/udo.mjs benchmark --help`, { 
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 5000
    });
    
    return {
      success: result.includes('Performance benchmarking'),
      message: 'Benchmarking system operational'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Register system check commands
 */
export function registerSystemCheckCommands(program: Command) {
  const check = program.command('check').description('System verification');
  
  check
    .command('full')
    .description('Run comprehensive system check')
    .action(cmdHealthFull);
  
  // Self-healing commands
  const repair = program.command('repair').description('System self-healing');
  
  repair
    .command('auto')
    .description('Attempt automatic repairs for common issues')
    .action(cmdHealthRepair);
    
  repair
    .command('rebuild')
    .description('Rebuild core components')
    .action(cmdHealthRebuild);
    
  repair
    .command('install')
    .description('Install missing dependencies')
    .action(cmdHealthInstall);
}