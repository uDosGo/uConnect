import { readFile } from 'fs/promises';
import { pathExists } from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Configuration management for uDos
 * Supports environment variables, config files, and defaults
 */

export interface UdosConfig {
  VAULT_ROOT?: string;
  [key: string]: any;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get configuration from multiple sources with precedence:
 * 1. Environment variables
 * 2. Local config file (.udos/config.json)
 * 3. Vault config file (vault/.udos/config.json)
 * 4. Defaults
 */
export async function getConfig(): Promise<UdosConfig> {
  const config: UdosConfig = {};

  // 1. Environment variables (highest precedence)
  if (process.env.WORDPRESS_URL) config.WORDPRESS_URL = process.env.WORDPRESS_URL;
  if (process.env.WORDPRESS_USERNAME) config.WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME;
  if (process.env.WORDPRESS_APPLICATION_PASSWORD) config.WORDPRESS_APPLICATION_PASSWORD = process.env.WORDPRESS_APPLICATION_PASSWORD;
  if (process.env.POST_TYPE) config.POST_TYPE = process.env.POST_TYPE;
  if (process.env.UDOS_VAULT_ROOT) config.VAULT_ROOT = process.env.UDOS_VAULT_ROOT;

  // 2. Local config file
  try {
    const localConfigPath = path.join(process.cwd(), '.udos', 'config.json');
    if (await pathExists(localConfigPath)) {
      const localConfig = JSON.parse(await readFile(localConfigPath, 'utf8'));
      Object.assign(config, localConfig);
    }
  } catch (error) {
    // Silently fail if config file doesn't exist or can't be read
  }

  // 3. Vault config file
  try {
    const vaultRoot = config.VAULT_ROOT || path.join(process.cwd(), 'vault');
    const vaultConfigPath = path.join(vaultRoot, '.udos', 'config.json');
    if (await pathExists(vaultConfigPath)) {
      const vaultConfig = JSON.parse(await readFile(vaultConfigPath, 'utf8'));
      Object.assign(config, vaultConfig);
    }
  } catch (error) {
    // Silently fail if config file doesn't exist or can't be read
  }

  // 4. Defaults (lowest precedence)
  config.POST_TYPE = config.POST_TYPE || 'post';

  return config;
}

/**
 * Get a specific configuration value
 */
export async function getConfigValue(key: string): Promise<any> {
  const config = await getConfig();
  return config[key];
}

/**
 * Set a configuration value
 */
export async function setConfigValue(key: string, value: any): Promise<void> {
  const config = await getConfig();
  config[key] = value;
  
  // Save to local config file
  const configDir = path.join(process.cwd(), '.udos');
  const configPath = path.join(configDir, 'config.json');
  
  // Ensure directory exists
  await ensureDir(configDir);
  
  // Write config file
  const fs = await import('fs-extra');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Ensure directory exists (helper function)
 */
async function ensureDir(dir: string): Promise<void> {
  const fs = await import('fs-extra');
  await fs.ensureDir(dir);
}

