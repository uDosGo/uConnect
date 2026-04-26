#!/usr/bin/env node

/**
 * PublishLane CLI - Main entry point
 * The modular publishing system for uDos documentation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { build } from './builder';
import { deploy } from './deployer';
import { serve } from './server';
import { validate } from './validator';
import { checkStatus } from './status';
import { initProject } from './initializer';

// CLI Version
const VERSION = '1.0.0';

// Create CLI
const program = new Command();

program
  .name('publishlane')
  .description('Modular publishing system for uDos documentation')
  .version(VERSION);

// Build command
program
  .command('build')
  .description('Build static site from documentation')
  .option('-c, --config <path>', 'Config file path', '.publishlane/config.yaml')
  .option('-s, --source <path>', 'Source directory', 'docs')
  .option('-o, --output <path>', 'Output directory', '_site')
  .option('-f, --format <format>', 'Build format', 'jekyll')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n📦 Building documentation...'));
      await build(options);
      console.log(chalk.green('✅ Build complete!'));
    } catch (error) {
      console.error(chalk.red('❌ Build failed:'), error.message);
      process.exit(1);
    }
  });

// Deploy command
program
  .command('deploy')
  .description('Deploy to GitHub Pages or other targets')
  .option('-c, --config <path>', 'Config file path', '.publishlane/config.yaml')
  .option('-t, --target <target>', 'Deployment target', 'github')
  .option('-b, --branch <branch>', 'GitHub branch', 'gh-pages')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🚀 Deploying documentation...'));
      await deploy(options);
      console.log(chalk.green('✅ Deployment complete!'));
    } catch (error) {
      console.error(chalk.red('❌ Deployment failed:'), error.message);
      process.exit(1);
    }
  });

// Serve command
program
  .command('serve')
  .description('Local preview server')
  .option('-p, --port <port>', 'Port number', '4000')
  .option('-s, --source <path>', 'Source directory', '_site')
  .action(async (options) => {
    try {
      console.log(chalk.blue(`\n🌐 Starting server on port ${options.port}...`));
      await serve(options);
    } catch (error) {
      console.error(chalk.red('❌ Server failed:'), error.message);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate documentation structure')
  .option('-c, --config <path>', 'Config file path', '.publishlane/config.yaml')
  .option('-s, --strict', 'Strict validation mode')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🔍 Validating documentation...'));
      await validate(options);
      console.log(chalk.green('✅ Validation passed!'));
    } catch (error) {
      console.error(chalk.red('❌ Validation failed:'), error.message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check document statuses')
  .option('-c, --config <path>', 'Config file path', '.publishlane/config.yaml')
  .option('-a, --all', 'Show all documents')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n📊 Checking document statuses...'));
      await checkStatus(options);
    } catch (error) {
      console.error(chalk.red('❌ Status check failed:'), error.message);
      process.exit(1);
    }
  });

// Init command
program
  .command('init')
  .description('Initialize PublishLane in a project')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🛠️  Initializing PublishLane...'));
      await initProject(options);
      console.log(chalk.green('✅ Initialization complete!'));
    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

export { program };
