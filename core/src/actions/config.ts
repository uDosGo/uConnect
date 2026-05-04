import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileExists, ensureDirectory, writeFile } from '../lib/file-utils.js';

interface HivemindConfig {
  [key: string]: any;
  dsc2?: {
    endpoint?: string;
    use_real_server?: boolean;
    timeout_ms?: number;
  };
  cost?: {
    daily_limit?: number | null;
    monthly_limit?: number | null;
    require_approval?: boolean;
  };
  cache?: {
    enabled?: boolean;
    ttl_seconds?: number;
    max_size_mb?: number;
  };
  quality?: {
    min_score?: number;
    fallback_enabled?: boolean;
  };
  free_tier?: {
    prefer_free?: boolean;
    apple_intel_enabled?: boolean;
    copilot_enabled?: boolean;
    gemini_enabled?: boolean;
  };
}

const CONFIG_FILE = 'vault/config/hivemind.json';
let currentConfig: HivemindConfig = {};

/**
 * Load configuration from file
 */
function loadConfig(): HivemindConfig {
  try {
    if (fileExists(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to load config:'), error.message);
  }
  return {};
}

/**
 * Save configuration to file
 */
function saveConfig() {
  try {
    ensureDirectory(path.dirname(CONFIG_FILE));
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2));
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to save config:'), error.message);
  }
}

/**
 * Initialize configuration
 */
function initConfig() {
  currentConfig = loadConfig();
}

/**
 * Get configuration value
 */
export function getConfig(key: string): any {
  if (Object.keys(currentConfig).length === 0) {
    initConfig();
  }
  
  const keys = key.split('.');
  let value = currentConfig;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Set configuration value
 */
export function setConfig(key: string, value: any) {
  if (Object.keys(currentConfig).length === 0) {
    initConfig();
  }
  
  const keys = key.split('.');
  let configRef = currentConfig;
  
  // Navigate to the parent object
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!configRef[k]) {
      configRef[k] = {};
    }
    configRef = configRef[k];
  }
  
  // Set the final key
  configRef[keys[keys.length - 1]] = value;
  saveConfig();
}

/**
 * Show current configuration
 */
export async function cmdConfigShow() {
  if (Object.keys(currentConfig).length === 0) {
    initConfig();
  }
  
  if (Object.keys(currentConfig).length === 0) {
    console.log(chalk.yellow('⚠️  No configuration set. Using defaults.'));
    return;
  }
  
  console.log(chalk.cyan('🎛 Hivemind Configuration:'));
  console.log('='.repeat(60));
  console.log(JSON.stringify(currentConfig, null, 2));
  console.log('='.repeat(60));
}

/**
 * Set DSC2 endpoint configuration
 */
export async function cmdConfigDSC2(options: { endpoint?: string; real?: boolean; timeout?: string }) {
  if (options.endpoint) {
    setConfig('dsc2.endpoint', options.endpoint);
    console.log(chalk.green(`✅ DSC2 endpoint set to: ${options.endpoint}`));
  }
  
  if (options.real !== undefined) {
    setConfig('dsc2.use_real_server', options.real);
    console.log(chalk.green(`✅ Real DSC2 server: ${options.real ? 'enabled' : 'disabled'}`));
  }
  
  if (options.timeout) {
    const timeout = parseInt(options.timeout);
    if (isNaN(timeout) || timeout <= 0) {
      console.error(chalk.red('❌ Invalid timeout. Must be a positive number.'));
      return;
    }
    setConfig('dsc2.timeout_ms', timeout);
    console.log(chalk.green(`✅ DSC2 timeout set to: ${timeout}ms`));
  }
  
  if (!options.endpoint && options.real === undefined && !options.timeout) {
    console.log(chalk.cyan('Current DSC2 Configuration:'));
    console.log(`  Endpoint: ${getConfig('dsc2.endpoint') || 'http://localhost:30000/mcp'}`);
    console.log(`  Real server: ${getConfig('dsc2.use_real_server') || false}`);
    console.log(`  Timeout: ${getConfig('dsc2.timeout_ms') || 30000}ms`);
  }
}

/**
 * Set cost management configuration
 */
export async function cmdConfigCost(options: { daily?: string; monthly?: string; approval?: boolean }) {
  if (options.daily) {
    const daily = parseFloat(options.daily);
    if (isNaN(daily) || daily <= 0) {
      console.error(chalk.red('❌ Invalid daily limit. Must be a positive number.'));
      return;
    }
    setConfig('cost.daily_limit', daily);
    console.log(chalk.green(`✅ Daily cost limit set to: $${daily.toFixed(2)}`));
  }
  
  if (options.monthly) {
    const monthly = parseFloat(options.monthly);
    if (isNaN(monthly) || monthly <= 0) {
      console.error(chalk.red('❌ Invalid monthly limit. Must be a positive number.'));
      return;
    }
    setConfig('cost.monthly_limit', monthly);
    console.log(chalk.green(`✅ Monthly cost limit set to: $${monthly.toFixed(2)}`));
  }
  
  if (options.approval !== undefined) {
    setConfig('cost.require_approval', options.approval);
    console.log(chalk.green(`✅ Cost approval ${options.approval ? 'required' : 'not required'}`));
  }
  
  if (!options.daily && !options.monthly && options.approval === undefined) {
    console.log(chalk.cyan('Current Cost Configuration:'));
    console.log(`  Daily limit: $${getConfig('cost.daily_limit') || 'unlimited'}`);
    console.log(`  Monthly limit: $${getConfig('cost.monthly_limit') || 'unlimited'}`);
    console.log(`  Require approval: ${getConfig('cost.require_approval') || false}`);
  }
}

/**
 * Set cache configuration
 */
export async function cmdConfigCache(options: { enable?: boolean; ttl?: string; size?: string }) {
  if (options.enable !== undefined) {
    setConfig('cache.enabled', options.enable);
    console.log(chalk.green(`✅ Cache ${options.enable ? 'enabled' : 'disabled'}`));
  }
  
  if (options.ttl) {
    const ttl = parseInt(options.ttl);
    if (isNaN(ttl) || ttl <= 0) {
      console.error(chalk.red('❌ Invalid TTL. Must be a positive number.'));
      return;
    }
    setConfig('cache.ttl_seconds', ttl);
    console.log(chalk.green(`✅ Cache TTL set to: ${ttl} seconds`));
  }
  
  if (options.size) {
    const size = parseInt(options.size);
    if (isNaN(size) || size <= 0) {
      console.error(chalk.red('❌ Invalid size. Must be a positive number.'));
      return;
    }
    setConfig('cache.max_size_mb', size);
    console.log(chalk.green(`✅ Cache size set to: ${size} MB`));
  }
  
  if (options.enable === undefined && !options.ttl && !options.size) {
    console.log(chalk.cyan('Current Cache Configuration:'));
    console.log(`  Enabled: ${getConfig('cache.enabled') || true}`);
    console.log(`  TTL: ${getConfig('cache.ttl_seconds') || 3600} seconds`);
    console.log(`  Max size: ${getConfig('cache.max_size_mb') || 32} MB`);
  }
}

/**
 * Set quality configuration
 */
export async function cmdConfigQuality(options: { min?: string; fallback?: boolean }) {
  if (options.min) {
    const minScore = parseFloat(options.min);
    if (isNaN(minScore) || minScore < 0 || minScore > 1) {
      console.error(chalk.red('❌ Invalid quality score. Must be between 0 and 1.'));
      return;
    }
    setConfig('quality.min_score', minScore);
    console.log(chalk.green(`✅ Minimum quality score set to: ${minScore.toFixed(2)}`));
  }
  
  if (options.fallback !== undefined) {
    setConfig('quality.fallback_enabled', options.fallback);
    console.log(chalk.green(`✅ Quality-based fallback ${options.fallback ? 'enabled' : 'disabled'}`));
  }
  
  if (!options.min && options.fallback === undefined) {
    console.log(chalk.cyan('Current Quality Configuration:'));
    console.log(`  Minimum score: ${getConfig('quality.min_score') || 0.7}`);
    console.log(`  Fallback enabled: ${getConfig('quality.fallback_enabled') || true}`);
  }
}

/**
 * Set free tier configuration
 */
export async function cmdConfigFreeTier(options: { prefer?: boolean; apple?: boolean; copilot?: boolean; gemini?: boolean }) {
  if (options.prefer !== undefined) {
    setConfig('free_tier.prefer_free', options.prefer);
    console.log(chalk.green(`✅ Prefer free tier: ${options.prefer ? 'enabled' : 'disabled'}`));
  }
  
  if (options.apple !== undefined) {
    setConfig('free_tier.apple_intel_enabled', options.apple);
    console.log(chalk.green(`✅ Apple Intelligence: ${options.apple ? 'enabled' : 'disabled'}`));
  }
  
  if (options.copilot !== undefined) {
    setConfig('free_tier.copilot_enabled', options.copilot);
    console.log(chalk.green(`✅ Copilot Free: ${options.copilot ? 'enabled' : 'disabled'}`));
  }
  
  if (options.gemini !== undefined) {
    setConfig('free_tier.gemini_enabled', options.gemini);
    console.log(chalk.green(`✅ Gemini Free: ${options.gemini ? 'enabled' : 'disabled'}`));
  }
  
  if (options.prefer === undefined && options.apple === undefined && options.copilot === undefined && options.gemini === undefined) {
    console.log(chalk.cyan('Current Free Tier Configuration:'));
    console.log(`  Prefer free: ${getConfig('free_tier.prefer_free') || true}`);
    console.log(`  Apple Intelligence: ${getConfig('free_tier.apple_intel_enabled') || true}`);
    console.log(`  Copilot Free: ${getConfig('free_tier.copilot_enabled') || true}`);
    console.log(`  Gemini Free: ${getConfig('free_tier.gemini_enabled') || true}`);
  }
}

/**
 * Reset configuration to defaults
 */
export async function cmdConfigReset() {
  currentConfig = {
    dsc2: {
      endpoint: 'http://localhost:30000/mcp',
      use_real_server: false,
      timeout_ms: 30000
    },
    cost: {
      daily_limit: undefined,
      monthly_limit: undefined,
      require_approval: false
    },
    cache: {
      enabled: true,
      ttl_seconds: 3600,
      max_size_mb: 32
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
  
  saveConfig();
  console.log(chalk.green('✅ Configuration reset to defaults'));
}

/**
 * Register config commands with commander
 */
export function registerConfigCommands(program: Command) {
  const config = program.command('config').description('Hivemind configuration management');
  
  config
    .command('show')
    .description('Show current configuration')
    .action(cmdConfigShow);
  
  config
    .command('dsc2')
    .option('--endpoint <url>', 'Set DSC2 endpoint URL')
    .option('--real', 'Use real DSC2 server')
    .option('--no-real', 'Use mock server')
    .option('--timeout <ms>', 'Set timeout in milliseconds')
    .description('Configure DSC2 settings')
    .action(cmdConfigDSC2);
  
  config
    .command('cost')
    .option('--daily <amount>', 'Set daily cost limit')
    .option('--monthly <amount>', 'Set monthly cost limit')
    .option('--approval', 'Require cost approval')
    .option('--no-approval', 'Disable cost approval')
    .description('Configure cost management')
    .action(cmdConfigCost);
  
  config
    .command('cache')
    .option('--enable', 'Enable caching')
    .option('--disable', 'Disable caching')
    .option('--ttl <seconds>', 'Set cache TTL')
    .option('--size <mb>', 'Set cache size in MB')
    .description('Configure caching')
    .action(cmdConfigCache);
  
  config
    .command('quality')
    .option('--min <score>', 'Set minimum quality score (0-1)')
    .option('--fallback', 'Enable quality-based fallback')
    .option('--no-fallback', 'Disable quality-based fallback')
    .description('Configure quality settings')
    .action(cmdConfigQuality);
  
  config
    .command('free-tier')
    .option('--prefer', 'Prefer free tier providers')
    .option('--no-prefer', 'Don\'t prefer free tier')
    .option('--apple', 'Enable Apple Intelligence')
    .option('--no-apple', 'Disable Apple Intelligence')
    .option('--copilot', 'Enable Copilot Free')
    .option('--no-copilot', 'Disable Copilot Free')
    .option('--gemini', 'Enable Gemini Free')
    .option('--no-gemini', 'Disable Gemini Free')
    .description('Configure free tier usage')
    .action(cmdConfigFreeTier);
  
  config
    .command('reset')
    .description('Reset configuration to defaults')
    .action(cmdConfigReset);
}