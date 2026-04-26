/**
 * Deployment system for PublishLane
 * Handles GitHub Pages, Vercel, and other targets
 */

import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { loadConfig } from './utils';

const execAsync = promisify(exec);

/**
 * Deploy documentation
 */
export async function deploy(options: any) {
  // Load configuration
  const config = await loadConfig(options.config);
  
  // Determine deployment target
  const target = options.target || config.github?.target || 'github';
  const branch = options.branch || config.github?.branch || 'gh-pages';
  const outputDir = config.output || '_site';
  
  console.log(`Target: ${target}`);
  console.log(`Branch: ${branch}`);
  console.log(`Output: ${outputDir}`);
  
  // Verify output directory exists
  if (!(await fs.pathExists(outputDir))) {
    throw new Error(`Output directory ${outputDir} does not exist. Run 'publishlane build' first.`);
  }
  
  // Deploy based on target
  if (target === 'github') {
    await deployToGitHub(outputDir, branch);
  } else if (target === 'vercel') {
    await deployToVercel(outputDir);
  } else if (target === 'netlify') {
    await deployToNetlify(outputDir);
  } else {
    throw new Error(`Unknown deployment target: ${target}`);
  }
}

/**
 * Deploy to GitHub Pages
 */
async function deployToGitHub(outputDir: string, branch: string) {
  console.log('Deploying to GitHub Pages...');
  
  // Check if git is available
  try {
    await execAsync('git --version');
  } catch (error) {
    throw new Error('Git is not installed or not in PATH');
  }
  
  // Initialize git repo if not exists
  if (!(await fs.pathExists('.git'))) {
    await execAsync('git init');
    await execAsync('git add .');
    await execAsync('git commit -m "Initial commit"');
  }
  
  // Check for existing gh-pages branch
  try {
    await execAsync(`git rev-parse --verify ${branch}`);
    // Branch exists, update it
    await execAsync(`git worktree add _gh-pages ${branch}`);
  } catch (error) {
    // Branch doesn't exist, create it
    await execAsync(`git checkout --orphan ${branch}`);
    await execAsync('git reset --hard');
  }
  
  // Copy built files to deployment branch
  await fs.copy(outputDir, '.');
  
  // Add and commit
  await execAsync('git add .');
  await execAsync(`git commit -m "Deploy to ${branch}: $(date)"`);
  
  // Push to remote
  await execAsync(`git push origin ${branch} --force`);
  
  // Clean up
  await execAsync('git checkout -');
  
  console.log('✅ Deployed to GitHub Pages');
}

/**
 * Deploy to Vercel
 */
async function deployToVercel(outputDir: string) {
  console.log('Deploying to Vercel...');
  
  // Check if Vercel CLI is available
  try {
    await execAsync('vercel --version');
  } catch (error) {
    throw new Error('Vercel CLI is not installed. Install with: npm install -g vercel');
  }
  
  // Deploy using Vercel CLI
  await execAsync(`vercel --prod --confirm`, { cwd: outputDir });
  
  console.log('✅ Deployed to Vercel');
}

/**
 * Deploy to Netlify
 */
async function deployToNetlify(outputDir: string) {
  console.log('Deploying to Netlify...');
  
  // Check if Netlify CLI is available
  try {
    await execAsync('netlify --version');
  } catch (error) {
    throw new Error('Netlify CLI is not installed. Install with: npm install -g netlify-cli');
  }
  
  // Deploy using Netlify CLI
  await execAsync(`netlify deploy --prod --dir=${outputDir}`);
  
  console.log('✅ Deployed to Netlify');
}
