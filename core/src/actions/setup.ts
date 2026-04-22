import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getVaultRoot } from '../paths.js';
import { GhostProfile, readProfile, isGhostProfile } from './ghost.js';
import { execSync } from 'child_process';
import * as readline from 'readline';

export interface RegisteredProfile extends GhostProfile {
  user: {
    name: string;
    email: string;
    role: 'developer' | 'admin' | 'user';
    user_id: string;
    date_of_birth: string | null;
    date_of_birth_encrypted?: string;
    is_registered: true;
  };
}

// Simple encryption stub (in real implementation, use proper encryption)
function simpleEncrypt(data: string): string {
  // In production, use proper encryption with user's public key
  return Buffer.from(data).toString('base64');
}

async function promptUser(question: string, defaultValue?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]` : question;
    rl.question(chalk.blue(prompt + ' '), (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

async function promptEmail(): Promise<string> {
  while (true) {
    const email = await promptUser('Enter your email address:');
    if (!email) {
      console.log(chalk.red('❌ Email is required for registration.'));
      continue;
    }
    if (!email.includes('@') || !email.includes('.')) {
      console.log(chalk.red('❌ Please enter a valid email address.'));
      continue;
    }
    return email;
  }
}

async function promptDateOfBirth(): Promise<string> {
  while (true) {
    const dob = await promptUser('Enter your date of birth (YYYY-MM-DD):');
    if (!dob) {
      console.log(chalk.red('❌ Date of birth is required.'));
      continue;
    }
    
    // Basic validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      console.log(chalk.red('❌ Please use YYYY-MM-DD format.'));
      continue;
    }
    
    const dobDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    
    if (age < 18) {
      console.log(chalk.red('❌ You must be at least 18 years old to register.'));
      continue;
    }
    
    return dob;
  }
}

async function promptRole(): Promise<'developer' | 'admin' | 'user'> {
  console.log(chalk.dim('Select your role:'));
  console.log(chalk.dim('  1. Developer (full access, can create content)'));
  console.log(chalk.dim('  2. Admin (management access)'));
  console.log(chalk.dim('  3. User (standard access)'));
  
  while (true) {
    const choice = await promptUser('Enter choice (1-3):');
    if (choice === '1') return 'developer';
    if (choice === '2') return 'admin';
    if (choice === '3') return 'user';
    console.log(chalk.red('❌ Please enter 1, 2, or 3.'));
  }
}

async function promptInstallationType(): Promise<string> {
  console.log(chalk.dim('Select installation type:'));
  console.log(chalk.dim('  1. ghost (default, anonymous)'));
  console.log(chalk.dim('  2. drone (automated worker)'));
  console.log(chalk.dim('  3. crypt (secure storage)'));
  console.log(chalk.dim('  4. tomb (archive node)'));
  console.log(chalk.dim('  5. knight (defensive node)'));
  console.log(chalk.dim('  6. sorcerer (transformation node)'));
  console.log(chalk.dim('  7. wizard (master node)'));
  
  while (true) {
    const choice = await promptUser('Enter choice (1-7):');
    const types = ['ghost', 'drone', 'crypt', 'tomb', 'knight', 'sorcerer', 'wizard'];
    if (choice >= '1' && choice <= '7') {
      return types[parseInt(choice) - 1];
    }
    console.log(chalk.red('❌ Please enter a number between 1 and 7.'));
  }
}

async function promptDeviceType(): Promise<'master' | 'child'> {
  const choice = await promptUser('Is this the master device? (y/n)', 'y');
  return choice.toLowerCase() === 'y' ? 'master' : 'child';
}

async function upgradeGhostToRegistered(ghostProfile: GhostProfile): Promise<RegisteredProfile> {
  console.log(chalk.green('🌟 uDosConnect Setup Wizard'));
  console.log(chalk.dim('Upgrade from Ghost to Registered User\n'));
  
  // Step 1: Name
  const name = await promptUser('Enter your name:', ghostProfile.user.name);
  
  // Step 2: Email
  const email = await promptEmail();
  
  // Step 3: Date of Birth
  const dob = await promptDateOfBirth();
  
  // Step 4: Role
  const role = await promptRole();
  
  // Step 5: Installation Type
  const installType = await promptInstallationType();
  
  // Step 6: Device Type
  const deviceType = await promptDeviceType();
  
  // Generate real user ID
  const realUserId = `usr_${uuidv4().slice(0, 12)}`;
  
  // Create registered profile
  const registeredProfile: RegisteredProfile = {
    ...ghostProfile,
    user: {
      name: name,
      email: email,
      role: role,
      user_id: realUserId,
      date_of_birth: null, // Clear plaintext DOB
      date_of_birth_encrypted: simpleEncrypt(dob), // Encrypted DOB
      is_registered: true
    },
    install: {
      ...ghostProfile.install,
      install_type: installType
    },
    device: {
      ...ghostProfile.device,
      type: deviceType
    }
  };
  
  return registeredProfile;
}

export async function cmdSetup() {
  const vaultRoot = getVaultRoot();
  const profile = readProfile(vaultRoot);
  
  if (!profile) {
    console.log(chalk.red('❌ No profile found. Please run the launcher first.'));
    return;
  }
  
  if (!isGhostProfile(profile)) {
    console.log(chalk.green('✅ You are already a registered user.'));
    console.log(chalk.white('User ID:'), chalk.cyan(profile.user.user_id));
    console.log(chalk.white('Name:'), chalk.cyan(profile.user.name));
    console.log(chalk.white('Role:'), chalk.cyan(profile.user.role));
    return;
  }
  
  console.log(chalk.blue('👻 You are currently a Ghost. Let\'s complete your registration...\n'));
  
  try {
    const registeredProfile = await upgradeGhostToRegistered(profile);
    
    // Write the updated profile
    const userDir = resolve(vaultRoot, '@user');
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true });
    }
    
    const profilePath = resolve(userDir, 'profile.json');
    writeFileSync(profilePath, JSON.stringify(registeredProfile, null, 2), 'utf8');
    
    // Register in contact database
    try {
      const { ContactDatabase } = await import('./contacts.js');
      const db = new ContactDatabase();
      db.registerUser(profile, registeredProfile.user.user_id);
      db.close();
    } catch (error) {
      console.log(chalk.yellow('⚠️ Could not register in contact database:'), error.message);
    }
    
    console.log(chalk.green('\n✅ Registration complete!'));
    console.log(chalk.white('User ID:'), chalk.cyan(registeredProfile.user.user_id));
    console.log(chalk.white('Name:'), chalk.cyan(registeredProfile.user.name));
    console.log(chalk.white('Role:'), chalk.cyan(registeredProfile.user.role));
    console.log(chalk.white('Email:'), chalk.cyan(registeredProfile.user.email));
    
    // If this is a master device, initialize secret store
    if (registeredProfile.device.type === 'master') {
      console.log(chalk.blue('\n🔐 Initializing master secret store...'));
      try {
        execSync('udo secret init', { cwd: vaultRoot, stdio: 'pipe' });
        console.log(chalk.green('✅ Master secret store initialized'));
      } catch (error) {
        console.log(chalk.yellow('⚠️ Could not initialize secret store:'), error.message);
      }
    }
    
    console.log(chalk.green('\n🎉 You are now a registered uDosConnect user!'));
    
  } catch (error: any) {
    console.error(chalk.red('❌ Setup failed:'), error.message);
  }
}

export function registerSetupCommand(program: Command) {
  program
    .command('setup')
    .description('Complete user registration (upgrade from Ghost)')
    .action(async () => {
      await cmdSetup();
    });
}
