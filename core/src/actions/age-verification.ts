import { readProfile } from './ghost.js';
import { getVaultRoot } from '../paths.js';
import chalk from 'chalk';

export function verifyAge(): boolean {
  const vaultRoot = getVaultRoot();
  const profile = readProfile(vaultRoot);
  
  if (!profile) {
    console.log(chalk.red('❌ No profile found. Please complete setup first.'));
    return false;
  }
  
  // If ghost with today's DOB, fail age check
  if (profile.user.role === 'ghost' && !profile.user.is_registered) {
    const today = new Date().toISOString().split('T')[0];
    if (profile.user.date_of_birth === today) {
      console.log(chalk.yellow('⚠️ Age verification required.'));
      console.log(chalk.yellow('Please complete registration (udo setup) to verify your age.'));
      return false;
    }
  }
  
  // If registered user with encrypted DOB, we'd decrypt it here
  // For now, assume registered users pass age verification
  if (profile.user.is_registered) {
    return true;
  }
  
  // If ghost with custom DOB (shouldn't happen, but handle it)
  if (profile.user.date_of_birth) {
    try {
      const dob = new Date(profile.user.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (age >= 18) {
        return true;
      } else {
        console.log(chalk.red('❌ You must be at least 18 years old to access this feature.'));
        return false;
      }
    } catch (error) {
      console.log(chalk.red('❌ Could not verify age from profile.'));
      return false;
    }
  }
  
  // Default: fail
  console.log(chalk.yellow('⚠️ Age verification required.'));
  console.log(chalk.yellow('Please complete registration (udo setup) to verify your age.'));
  return false;
}

export function requireAgeVerification() {
  if (!verifyAge()) {
    process.exit(1);
  }
}
