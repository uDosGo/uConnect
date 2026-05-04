/**
 * uDos Dependency Checker
 * Validates system dependencies and requirements
 * Part of Round 1: Startup & Process Management
 */

import fs from 'fs-extra';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { getVaultRoot } from '../paths.js';

const execAsync = promisify(exec);

/**
 * Dependency categories and their validation functions
 */
type DependencyCategory = 'required' | 'optional' | 'external';

type Dependency = {
  name: string;
  category: DependencyCategory;
  check: () => Promise<boolean>;
  message: string;
  recovery?: string;
};

/**
 * List of all dependencies to check
 */
const DEPENDENCIES: Dependency[] = [
  // Required: Core system files
  {
    name: 'vault-root',
    category: 'required',
    check: async () => {
      try {
        const vaultRoot = getVaultRoot();
        return fs.pathExists(vaultRoot);
      } catch (error) {
        return false;
      }
    },
    message: 'Vault root directory not found',
    recovery: 'Run `udo init` to create vault'
  },
  
  // Required: Configuration files
  {
    name: 'config-file',
    category: 'required',
    check: async () => {
      try {
        const vaultRoot = getVaultRoot();
        const configPath = path.join(vaultRoot, 'config.json');
        return fs.pathExists(configPath);
      } catch (error) {
        return false;
      }
    },
    message: 'Configuration file not found',
    recovery: 'Default configuration will be created'
  },
  
  // Optional: External tools
  {
    name: 'git',
    category: 'optional',
    check: async () => {
      try {
        await execAsync('git --version');
        return true;
      } catch (error) {
        return false;
      }
    },
    message: 'Git not found (optional for full functionality)',
    recovery: 'Install git for version control features'
  },
  
  // Optional: Network tools
  {
    name: 'curl',
    category: 'optional',
    check: async () => {
      try {
        await execAsync('curl --version');
        return true;
      } catch (error) {
        return false;
      }
    },
    message: 'cURL not found (optional for network features)',
    recovery: 'Install curl for network operations'
  },
  
  // External: Node.js (should always be available)
  {
    name: 'nodejs',
    category: 'external',
    check: async () => {
      try {
        await execAsync('node --version');
        return true;
      } catch (error) {
        return false;
      }
    },
    message: 'Node.js not found (required for uDos)',
    recovery: 'Install Node.js 18+ from nodejs.org'
  }
];

/**
 * Validate all dependencies
 * Returns validation result with categorized issues
 */
export async function validate(): Promise<{
  valid: boolean;
  missing: string[];
  warnings: string[];
}> {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  for (const dep of DEPENDENCIES) {
    const isAvailable = await dep.check();
    
    if (!isAvailable) {
      if (dep.category === 'required') {
        missing.push(dep.name);
      } else if (dep.category === 'optional') {
        warnings.push(`${dep.name}: ${dep.message} (${dep.recovery || 'optional'})`);
      } else if (dep.category === 'external') {
        missing.push(dep.name);
      }
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Check specific dependency
 * Useful for conditional feature enablement
 */
export async function checkDependency(name: string): Promise<{
  available: boolean;
  message?: string;
  recovery?: string;
}> {
  const dep = DEPENDENCIES.find(d => d.name === name);
  
  if (!dep) {
    return { available: false, message: `Unknown dependency: ${name}` };
  }
  
  const available = await dep.check();
  
  return {
    available,
    message: available ? undefined : dep.message,
    recovery: available ? undefined : dep.recovery
  };
}

/**
 * Get all dependencies with their status
 * Useful for status reporting
 */
export async function getDependencyStatus(): Promise<{
  [key: string]: {
    available: boolean;
    category: DependencyCategory;
    message?: string;
    recovery?: string;
  };
}> {
  const status: Record<string, any> = {};
  
  for (const dep of DEPENDENCIES) {
    const available = await dep.check();
    
    status[dep.name] = {
      available,
      category: dep.category,
      message: available ? undefined : dep.message,
      recovery: available ? undefined : dep.recovery
    };
  }
  
  return status;
}

// Export dependency list for inspection
export const dependencies = DEPENDENCIES;

// Export types
export type { Dependency, DependencyCategory };
