/**
 * uDos Startup Actions
 * Dependency validation and startup sequence management
 * Part of Round 1: Startup & Process Management
 */

import { validate, checkDependency, getDependencyStatus, dependencies as dependencyList } from '../lib/dependency-checker.js';
import { processManager } from './process-manager.js';
import chalk from 'chalk';
import { getVaultRoot } from '../paths.js';

/**
 * Validate system dependencies before startup
 * Returns validation result with missing dependencies
 */
export async function validateStartup(): Promise<{
  valid: boolean;
  missing: string[];
  warnings: string[];
}> {
  const result = await validate();
  return result;
}

/**
 * Perform system startup with dependency validation
 * Implements graceful degradation for missing optional dependencies
 */
export async function startupSystem(): Promise<{
  success: boolean;
  message: string;
  warnings: string[];
}> {
  const validation = await validateStartup();
  
  if (!validation.valid) {
    console.warn(chalk.yellow('⚠️  Missing required dependencies:'));
    validation.missing.forEach(dep => {
      console.warn(chalk.yellow(`  - ${dep}`));
    });
    return {
      success: false,
      message: 'Required dependencies missing',
      warnings: validation.warnings
    };
  }
  
  if (validation.warnings.length > 0) {
    console.warn(chalk.yellow('⚠️  Optional dependencies missing (continuing with graceful degradation):'));
    validation.warnings.forEach(warning => {
      console.warn(chalk.yellow(`  - ${warning}`));
    });
  }
  
  console.log(chalk.green('✓ All dependencies validated'));
  
  // Start core processes
  const startResult = await processManager.startAll();
  
  if (!startResult.success) {
    console.error(chalk.red('✗ Failed to start processes:'));
    startResult.errors.forEach(error => {
      console.error(chalk.red(`  - ${error}`));
    });
    return {
      success: false,
      message: 'Process startup failed',
      warnings: validation.warnings
    };
  }
  
  console.log(chalk.green('✓ System startup complete'));
  
  return {
    success: true,
    message: 'System started successfully',
    warnings: validation.warnings
  };
}

/**
 * Graceful system shutdown
 * Cleans up all processes and resources
 */
export async function shutdownSystem(): Promise<{
  success: boolean;
  message: string;
}> {
  console.log(chalk.blue('Shutting down uDos system...'));
  
  const result = await processManager.stopAll();
  
  if (result.success) {
    console.log(chalk.green('✓ System shutdown complete'));
    return {
      success: true,
      message: 'System stopped successfully'
    };
  } else {
    console.error(chalk.red('✗ Shutdown completed with errors'));
    result.errors.forEach(error => {
      console.error(chalk.red(`  - ${error}`));
    });
    return {
      success: false,
      message: 'Shutdown completed with errors'
    };
  }
}

/**
 * System restart with failure recovery
 * Implements retry logic for unreliable processes
 */
export async function restartSystem(maxAttempts: number = 3): Promise<{
  success: boolean;
  message: string;
  attempts: number;
}> {
  console.log(chalk.blue(`Restarting system (max attempts: ${maxAttempts})...`));
  
  let attempts = 0;
  let lastError: Error | null = null;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Shutdown first
    await shutdownSystem();
    
    try {
      // Start again
      const startupResult = await startupSystem();
      
      if (startupResult.success) {
        console.log(chalk.green(`✓ System restarted successfully (attempt ${attempts}/${maxAttempts})`));
        return {
          success: true,
          message: 'System restarted successfully',
          attempts
        };
      } else {
        lastError = new Error(startupResult.message);
        console.warn(chalk.yellow(`Attempt ${attempts}: Restart failed, retrying...`));
      }
    } catch (error: unknown) {
      lastError = error as Error;
      console.warn(chalk.yellow(`Attempt ${attempts}: ${error instanceof Error ? error.message : String(error)}`));
    }
    
    // Wait before retry
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
  
  console.error(chalk.red(`✗ Failed to restart after ${maxAttempts} attempts`));
  if (lastError) {
    console.error(chalk.red(`  Last error: ${lastError.message}`));
  }
  
  return {
    success: false,
    message: `Failed to restart after ${maxAttempts} attempts`,
    attempts
  };
}

/**
 * Get system status with health checks
 * Returns detailed status of all components
 */
export async function getSystemStatus(): Promise<{
  healthy: boolean;
  components: Record<string, {
    status: 'healthy' | 'degraded' | 'failed';
    message?: string;
  }>;
  warnings: string[];
}> {
  const vaultRoot = getVaultRoot();
  
  const status = await processManager.getStatus();
  
  return {
    healthy: status.healthy,
    components: status.processes,
    warnings: status.warnings
  };
}

// Export types for better IDE support
export type StartupResult = Awaited<ReturnType<typeof startupSystem>>;
export type ShutdownResult = Awaited<ReturnType<typeof shutdownSystem>>;
export type RestartResult = Awaited<ReturnType<typeof restartSystem>>;
export type StatusResult = Awaited<ReturnType<typeof getSystemStatus>>;
