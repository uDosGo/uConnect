import { Command } from 'commander';
import { execSync, spawn } from 'child_process';
import chalk from 'chalk';

export function registerVibeCommand(program: Command) {
  program
    .command('vibe')
    .description('Launch Mistral Vibe TUI with uDosConnect context')
    .option('--model <model>', 'Specify model to use')
    .option('--config <path>', 'Custom config path')
    .option('--no-gui', 'Disable GUI integration')
    .action(async (options) => {
      await launchVibe(options);
    });
}

async function launchVibe(options: any) {
  console.log(chalk.cyan('🌀 Launching Mistral Vibe...'));
  console.log(chalk.dim('Integration: uDosConnect + Vibe TUI\n'));
  
  // Find vibe binary
  const vibePath = findVibeBinary();
  if (!vibePath) {
    console.error(chalk.red('❌ Vibe not found. Installing...'));
    await installVibe();
    return launchVibe(options); // retry after install
  }
  
  // Set up environment for vibe
  const env = {
    ...process.env,
    UDOS_VAULT: process.env.UDOS_VAULT || `${process.env.HOME}/vault`,
    UDOS_CONTEXT: process.cwd(),
    VIBE_CONFIG: options.config || `${process.env.HOME}/.vibe/config.json`,
    VIBE_GUI_PORT: options.gui !== false ? '5174' : undefined,
  };
  
  // Spawn vibe with proper TUI
  const vibeProcess = spawn(vibePath, {
    stdio: 'inherit',
    shell: true,
    env,
  });
  
  vibeProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.yellow(`\nVibe exited with code ${code}`));
    }
  });
}

function findVibeBinary(): string | null {
  // Check common locations
  const locations = [
    'vibe',
    'node_modules/.bin/vibe',
    '/usr/local/bin/vibe',
    `${process.env.HOME}/.local/bin/vibe`,
    `${process.env.HOME}/vendor/bin/vibe`,
  ];
  
  for (const loc of locations) {
    try {
      execSync(`which ${loc}`);
      return loc;
    } catch {
      continue;
    }
  }
  return null;
}

async function installVibe(): Promise<void> {
  console.log(chalk.yellow('📦 Installing Mistral Vibe CLI...'));
  try {
    execSync('npm install -g @mistralai/vibe-cli', { stdio: 'inherit' });
    console.log(chalk.green('✅ Vibe installed successfully!'));
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to install Vibe:'), error.message);
    process.exit(1);
  }
}
