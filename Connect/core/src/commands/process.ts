/**
 * uDos Process Commands
 * CLI commands for process management
 * Part of Round 1: Startup & Process Management
 */

import { Command } from 'commander';
import { startupSystem, shutdownSystem, restartSystem, getSystemStatus } from '../actions/startup.js';
import chalk from 'chalk';

/**
 * Register process management commands with the CLI
 */
export function registerProcessCommands(program: Command): void {
  // Start command
  program
    .command('start')
    .description('Start all uDos services and processes')
    .action(async () => {
      try {
        const result = await startupSystem();
        if (result.success) {
          console.log(chalk.green('✓ System started successfully'));
          if (result.warnings.length > 0) {
            console.warn(chalk.yellow('⚠️  Continuing with graceful degradation:'));
            result.warnings.forEach(warning => {
              console.warn(chalk.yellow(`  - ${warning}`));
            });
          }
        } else {
          console.error(chalk.red('✗ Failed to start system:'));
          console.error(chalk.red(`  ${result.message}`));
          process.exitCode = 1;
        }
      } catch (error) {
        console.error(chalk.red('✗ Unexpected error during startup:'));
        console.error(chalk.red(String(error)));
        process.exitCode = 1;
      }
    });

  // Stop command
  program
    .command('stop')
    .description('Stop all uDos services and processes')
    .action(async () => {
      try {
        const result = await shutdownSystem();
        if (result.success) {
          console.log(chalk.green('✓ System stopped successfully'));
        } else {
          console.error(chalk.red('✗ Failed to stop system:'));
          console.error(chalk.red(`  ${result.message}`));
          process.exitCode = 1;
        }
      } catch (error) {
        console.error(chalk.red('✗ Unexpected error during shutdown:'));
        console.error(chalk.red(String(error)));
        process.exitCode = 1;
      }
    });

  // Restart command
  program
    .command('restart')
    .description('Restart all uDos services and processes')
    .option('-a, --attempts <number>', 'Maximum restart attempts', '3')
    .action(async (options) => {
      const maxAttempts = parseInt(options.attempts, 10) || 3;
      
      try {
        const result = await restartSystem(maxAttempts);
        if (result.success) {
          console.log(chalk.green(`✓ System restarted successfully (attempts: ${result.attempts})`));
        } else {
          console.error(chalk.red(`✗ Failed to restart after ${result.attempts} attempts`));
          console.error(chalk.red(`  ${result.message}`));
          process.exitCode = 1;
        }
      } catch (error) {
        console.error(chalk.red('✗ Unexpected error during restart:'));
        console.error(chalk.red(String(error)));
        process.exitCode = 1;
      }
    });

  // Status command (registered as process:status to avoid conflict with main status)
  program
    .command('process:status')
    .description('Check the status of uDos services and processes')
    .option('-j, --json', 'Output status as JSON')
    .action(async (options) => {
      try {
        const status = await getSystemStatus();
        
        if (options.json) {
          console.log(JSON.stringify(status, null, 2));
        } else {
          if (status.healthy) {
            console.log(chalk.green('✓ System status: Healthy'));
          } else {
            console.log(chalk.red('✗ System status: Unhealthy'));
          }
          
          console.log(chalk.blue('\nComponent Status:'));
          Object.entries(status.components).forEach(([name, comp]) => {
            const statusIcon = comp.status === 'healthy' ? chalk.green('✓') : 
                              comp.status === 'degraded' ? chalk.yellow('⚠️ ') : 
                              chalk.red('✗');
            console.log(`  ${statusIcon} ${name}: ${comp.status}`);
            if (comp.message) {
              console.log(`    ${chalk.gray(comp.message)}`);
            }
          });
          
          if (status.warnings.length > 0) {
            console.log(chalk.yellow('\nWarnings:'));
            status.warnings.forEach(warning => {
              console.log(`  ⚠️  ${warning}`);
            });
          }
        }
      } catch (error) {
        console.error(chalk.red('✗ Unexpected error checking status:'));
        console.error(chalk.red(String(error)));
        process.exitCode = 1;
      }
    });

  // Process group
  program
    .command('process')
    .description('Manage uDos processes')
    .addHelpText('after', `
Examples:
  $ udo start          Start all services
  $ udo stop           Stop all services
  $ udo restart        Restart all services
  $ udo status         Check system status
  $ udo status --json  Check status as JSON`);
}

// Export for testing (removed - already exported above)
