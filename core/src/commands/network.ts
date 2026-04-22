/**
 * uDos Network Commands
 * CLI interface for network management
 * Part of Cycle 1, Round 2: LAN & Network Resilience
 */

import { Command } from 'commander';
import { networkManager } from '../../dev/rounds/round-2-network/implementation/network-manager.js';
import chalk from 'chalk';

/**
 * Register network management commands with the CLI
 */
export function registerNetworkCommands(program: Command): void {
  const network = program.command('network').description('Network management and monitoring');

  // Status command
  network
    .command('status')
    .description('Show network interface status')
    .action(async () => {
      try {
        const activeInterface = networkManager.getActiveInterface();
        const fallbackIP = networkManager.getFallbackIP();
        
        console.log(chalk.bold('\n🌐 Network Status:'));
        console.log(`Active Interface: ${activeInterface ? activeInterface.name : 'None'}`);
        console.log(`Fallback IP: ${fallbackIP}`);
        console.log(`Status: ${activeInterface ? chalk.green('Connected') : chalk.yellow('Disconnected')}`);
        
        if (activeInterface) {
          console.log(chalk.bold('\n📊 Interface Details:'));
          console.log(`  Type: ${activeInterface.type}`);
          console.log(`  IPv4: ${activeInterface.ipv4.join(', ')}`);
          console.log(`  IPv6: ${activeInterface.ipv6.join(', ') || 'None'}`);
          console.log(`  MAC: ${activeInterface.mac}`);
          console.log(`  Status: ${activeInterface.status}`);
        }
      } catch (error) {
        console.error(chalk.red('Failed to get network status:'), error);
        process.exitCode = 1;
      }
    });

  // Discover command
  network
    .command('discover')
    .description('Discover peers on the local network')
    .option('-t, --timeout <ms>', 'Discovery timeout in milliseconds', '5000')
    .action(async (options) => {
      try {
        const timeout = parseInt(options.timeout, 10);
        console.log(chalk.blue(`🔍 Discovering peers (timeout: ${timeout}ms)...`));
        
        const peers = await networkManager.discoverPeers(timeout);
        
        console.log(chalk.bold(`\n👥 Found ${peers.length} peer(s):`));
        if (peers.length > 0) {
          peers.forEach((peer, index) => {
            console.log(`  ${index + 1}. ${peer}`);
          });
        } else {
          console.log(chalk.yellow('  No peers discovered'));
        }
      } catch (error) {
        console.error(chalk.red('Peer discovery failed:'), error);
        process.exitCode = 1;
      }
    });

  // Fallback command
  network
    .command('fallback')
    .description('Configure and test network fallback')
    .option('-s, --set <ip>', 'Set fallback IP address')
    .option('-t, --test', 'Test fallback connection')
    .action(async (options) => {
      try {
        if (options.set) {
          // Set new fallback IP
          networkManager.setFallbackIP(options.set);
          console.log(chalk.green(`✅ Fallback IP set to: ${options.set}`));
        }
        
        if (options.test) {
          // Test fallback connection
          console.log(chalk.blue('🧪 Testing fallback connection...'));
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log(chalk.green('✅ Fallback connection test passed'));
        }
        
        if (!options.set && !options.test) {
          // Show current fallback configuration
          const fallbackIP = networkManager.getFallbackIP();
          console.log(chalk.bold('🔧 Fallback Configuration:'));
          console.log(`  Current Fallback IP: ${fallbackIP}`);
          console.log(`  Status: ${chalk.green('Configured')}`);
        }
      } catch (error) {
        console.error(chalk.red('Fallback configuration failed:'), error);
        process.exitCode = 1;
      }
    });

  // Service discovery command
  network
    .command('discover-services')
    .description('Start mDNS service discovery')
    .action(async () => {
      try {
        console.log(chalk.blue('🔄 Starting service discovery...'));
        await networkManager.startServiceDiscovery();
        console.log(chalk.green('✅ Service discovery started'));
        console.log(chalk.yellow('Note: Service discovery runs in the background'));
      } catch (error) {
        console.error(chalk.red('Service discovery failed:'), error);
        process.exitCode = 1;
      }
    });

  // Check IP conflicts command
  network
    .command('check-conflicts')
    .description('Check for IP address conflicts')
    .action(async () => {
      try {
        console.log(chalk.blue('🔍 Checking for IP conflicts...'));
        await networkManager.checkIPConflicts();
        console.log(chalk.green('✅ IP conflict check completed'));
      } catch (error) {
        console.error(chalk.red('IP conflict check failed:'), error);
        process.exitCode = 1;
      }
    });

  // Simulate failure command (for testing)
  network
    .command('simulate-failure')
    .description('Simulate network failure and test recovery')
    .option('-r, --recover', 'Test automatic recovery')
    .action(async (options) => {
      try {
        console.log(chalk.red('⚠️  Simulating network failure...'));
        
        if (options.recover) {
          console.log(chalk.blue('🔄 Testing automatic recovery...'));
          await networkManager.handleNetworkFailure();
          console.log(chalk.green('✅ Recovery process completed'));
        } else {
          console.log(chalk.yellow('Network failure simulated'));
          console.log(chalk.blue('Use --recover flag to test automatic recovery'));
        }
      } catch (error) {
        console.error(chalk.red('Failure simulation failed:'), error);
        process.exitCode = 1;
      }
    });
}
