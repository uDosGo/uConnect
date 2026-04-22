import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { getVaultRoot } from '../paths.js';
import { Command } from 'commander';

// Ghost profile constants
const GHOST_PREFIX = 'ghost_';
const PROFILE_FILE = 'profile.json';
const FIRST_RUN_FLAG = '.first_run_complete';

export interface GhostProfile {
  user: {
    name: string;
    email: string | null;
    role: string;
    user_id: string;
    date_of_birth: string;
    is_registered: boolean;
  };
  install: {
    install_id: string;
    install_type: string;
    first_install_at: string;
    timezone: string;
    timezone_city: string;
    grid_code: string | null;
  };
  preferences: {
    editor: string;
    language: string;
  };
  device: {
    type: string;
    name: string;
  };
  version: number;
}

export function isGhostProfile(profile: GhostProfile): boolean {
  return profile.user.role === 'ghost' && !profile.user.is_registered;
}

export function createGhostProfile(vaultRoot: string): GhostProfile {
  const today = new Date().toISOString().split('T')[0];
  const ghostId = `${GHOST_PREFIX}${uuidv4().slice(0, 12)}`;
  const installId = `ins_${uuidv4().slice(0, 12)}`;
  
  // Get system timezone and hostname
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const timezoneParts = timezone.split('/');
  const timezoneCity = timezoneParts[timezoneParts.length - 1].replace('_', ' ');
  const hostname = require('os').hostname();
  
  const profile: GhostProfile = {
    user: {
      name: 'Ghost',
      email: null,
      role: 'ghost',
      user_id: ghostId,
      date_of_birth: today, // Today's date will fail age checks
      is_registered: false
    },
    install: {
      install_id: installId,
      install_type: 'ghost',
      first_install_at: new Date().toISOString(),
      timezone: timezone,
      timezone_city: timezoneCity,
      grid_code: null
    },
    preferences: {
      editor: 'cursor',
      language: 'typescript'
    },
    device: {
      type: 'master', // Default to master, can be changed during setup
      name: hostname
    },
    version: 2
  };
  
  return profile;
}

export function writeGhostProfile(profile: GhostProfile, vaultRoot: string): void {
  const userDir = resolve(vaultRoot, '@user');
  
  // Create @user directory if it doesn't exist
  if (!existsSync(userDir)) {
    mkdirSync(userDir, { recursive: true });
  }
  
  const profilePath = resolve(userDir, PROFILE_FILE);
  writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf8');
}

export function readProfile(vaultRoot: string): GhostProfile | null {
  const profilePath = resolve(vaultRoot, '@user', PROFILE_FILE);
  
  if (!existsSync(profilePath)) {
    return null;
  }
  
  try {
    const content = readFileSync(profilePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red('❌ Failed to read profile:'), error);
    return null;
  }
}

export function isFirstRun(vaultRoot: string): boolean {
  const flagPath = resolve(vaultRoot, FIRST_RUN_FLAG);
  return !existsSync(flagPath);
}

export function markFirstRunComplete(vaultRoot: string): void {
  const flagPath = resolve(vaultRoot, FIRST_RUN_FLAG);
  writeFileSync(flagPath, 'completed', 'utf8');
}

export function cmdGhostStatus() {
  const vaultRoot = getVaultRoot();
  const profile = readProfile(vaultRoot);
  
  if (!profile) {
    console.log(chalk.yellow('⚠️ No profile found. This appears to be a fresh installation.'));
    return;
  }
  
  if (isGhostProfile(profile)) {
    console.log(chalk.blue('👻 Ghost Mode Active'));
    console.log(chalk.dim('You are currently running as an unregistered ghost user.'));
    console.log();
    console.log(chalk.white('User ID:'), chalk.cyan(profile.user.user_id));
    console.log(chalk.white('Role:'), chalk.cyan(profile.user.role));
    console.log(chalk.white('Registration:'), chalk.red('Not registered'));
    console.log(chalk.white('Installation Type:'), chalk.cyan(profile.install.install_type));
    console.log();
    console.log(chalk.green('To complete registration, run:'));
    console.log(chalk.yellow('  udo setup'));
  } else {
    console.log(chalk.green('✅ Registered User'));
    console.log(chalk.white('User ID:'), chalk.cyan(profile.user.user_id));
    console.log(chalk.white('Name:'), chalk.cyan(profile.user.name));
    console.log(chalk.white('Role:'), chalk.cyan(profile.user.role));
    console.log(chalk.white('Registration:'), chalk.green('Registered'));
    console.log(chalk.white('Email:'), profile.user.email || chalk.dim('Not set'));
  }
}

export function registerGhostCommands(program: Command) {
  program
    .command('ghost')
    .description('Ghost mode management')
    .action(async () => {
      cmdGhostStatus();
    });
  
  program
    .command('whoami')
    .description('Show current user status')
    .action(async () => {
      cmdGhostStatus();
    });
}
