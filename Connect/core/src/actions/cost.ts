import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileExists, ensureDirectory, writeFile } from '../lib/file-utils.js';

// Cost tracking and approval system
interface PendingApproval {
  id: string;
  description: string;
  estimated_cost: number;
  task_type: string;
  created_at: number;
  approved?: boolean;
}

const PENDING_APPROVALS_FILE = 'vault/logs/pending_approvals.ndjson';
let pendingApprovals: PendingApproval[] = [];

/**
 * Load pending approvals from file
 */
function loadPendingApprovals(): PendingApproval[] {
  try {
    if (fileExists(PENDING_APPROVALS_FILE)) {
      const content = fs.readFileSync(PENDING_APPROVALS_FILE, 'utf-8');
      return content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to load pending approvals:'), error.message);
  }
  return [];
}

/**
 * Save pending approvals to file
 */
function savePendingApprovals() {
  try {
    ensureDirectory(path.dirname(PENDING_APPROVALS_FILE));
    const content = pendingApprovals
      .map(approval => JSON.stringify(approval))
      .join('\n') + '\n';
    writeFile(PENDING_APPROVALS_FILE, content);
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to save pending approvals:'), error.message);
  }
}

/**
 * Initialize pending approvals
 */
function initPendingApprovals() {
  pendingApprovals = loadPendingApprovals();
}

/**
 * Add a task requiring cost approval
 */
export function addPendingApproval(description: string, estimatedCost: number, taskType: string): string {
  if (pendingApprovals.length === 0) {
    initPendingApprovals();
  }
  
  const id = `cost-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const approval: PendingApproval = {
    id,
    description,
    estimated_cost: estimatedCost,
    task_type: taskType,
    created_at: Date.now(),
    approved: false
  };
  
  pendingApprovals.push(approval);
  savePendingApprovals();
  
  return id;
}

/**
 * Get pending approval by ID
 */
export function getPendingApproval(id: string): PendingApproval | undefined {
  if (pendingApprovals.length === 0) {
    initPendingApprovals();
  }
  return pendingApprovals.find(a => a.id === id);
}

/**
 * List all pending approvals
 */
export async function cmdCostList() {
  if (pendingApprovals.length === 0) {
    initPendingApprovals();
  }
  
  if (pendingApprovals.length === 0) {
    console.log(chalk.green('✅ No pending cost approvals'));
    return;
  }
  
  console.log(chalk.cyan(`💰 ${pendingApprovals.length} pending cost approval(s):`));
  console.log('='.repeat(60));
  
  pendingApprovals.forEach((approval, index) => {
    console.log(`${index + 1}. ${chalk.white(approval.id)}`);
    console.log(`   Description: ${approval.description}`);
    console.log(`   Estimated cost: $${approval.estimated_cost.toFixed(4)}`);
    console.log(`   Type: ${approval.task_type}`);
    console.log(`   Created: ${new Date(approval.created_at).toLocaleString()}`);
    console.log(`   Status: ${approval.approved ? chalk.green('APPROVED') : chalk.yellow('PENDING')}`);
    console.log('-'.repeat(60));
  });
  
  console.log(chalk.dim(`Total pending cost: $${pendingApprovals.reduce((sum, a) => sum + a.estimated_cost, 0).toFixed(4)}`));
}

/**
 * Approve a pending cost
 */
export async function cmdCostApprove(id: string) {
  if (pendingApprovals.length === 0) {
    initPendingApprovals();
  }
  
  const approval = getPendingApproval(id);
  if (!approval) {
    console.error(chalk.red(`❌ No pending approval found with ID: ${id}`));
    return;
  }
  
  if (approval.approved) {
    console.log(chalk.yellow(`⚠️  Approval ${id} is already approved`));
    return;
  }
  
  console.log(chalk.cyan('💰 Cost Approval Request'));
  console.log('='.repeat(60));
  console.log(`ID: ${approval.id}`);
  console.log(`Description: ${approval.description}`);
  console.log(`Estimated Cost: $${approval.estimated_cost.toFixed(4)}`);
  console.log(`Type: ${approval.task_type}`);
  console.log('='.repeat(60));
  
  console.log(chalk.yellow('⚠️  Approve this cost?'));
  const answer = await askQuestion('> ');
  
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    approval.approved = true;
    savePendingApprovals();
    console.log(chalk.green('✅ Cost approved!'));
    console.log(chalk.dim(`You can now execute: udo execute ${approval.id}`));
  } else {
    console.log(chalk.red('❌ Cost approval cancelled'));
  }
}

/**
 * Set daily cost limit
 */
export async function cmdCostLimit(options: { daily?: string; monthly?: string, list?: boolean }) {
  const COST_LIMITS_FILE = 'vault/config/cost_limits.json';
  
  if (options.list) {
    // List current limits
    try {
      if (fileExists(COST_LIMITS_FILE)) {
        const limits = JSON.parse(fs.readFileSync(COST_LIMITS_FILE, 'utf-8'));
        console.log(chalk.cyan('💰 Current Cost Limits:'));
        console.log(`Daily: $${limits.daily || 'unlimited'}`);
        console.log(`Monthly: $${limits.monthly || 'unlimited'}`);
      } else {
        console.log(chalk.yellow('⚠️  No cost limits configured'));
      }
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to read cost limits:'), error.message);
    }
    return;
  }
  
  let dailyLimit: number | null = null;
  let monthlyLimit: number | null = null;
  
  if (options.daily) {
    dailyLimit = parseFloat(options.daily);
    if (isNaN(dailyLimit) || dailyLimit <= 0) {
      console.error(chalk.red('❌ Invalid daily limit. Must be a positive number.'));
      return;
    }
  }
  
  if (options.monthly) {
    monthlyLimit = parseFloat(options.monthly);
    if (isNaN(monthlyLimit) || monthlyLimit <= 0) {
      console.error(chalk.red('❌ Invalid monthly limit. Must be a positive number.'));
      return;
    }
  }
  
  if (dailyLimit === null && monthlyLimit === null) {
    console.error(chalk.red('❌ Please specify --daily or --monthly limit'));
    return;
  }
  
  const limits = {
    daily: dailyLimit,
    monthly: monthlyLimit,
    updated_at: new Date().toISOString()
  };
  
  try {
    ensureDirectory(path.dirname(COST_LIMITS_FILE));
    fs.writeFileSync(COST_LIMITS_FILE, JSON.stringify(limits, null, 2));
    console.log(chalk.green('✅ Cost limits updated:'));
    if (dailyLimit !== null) {
      console.log(`Daily: $${dailyLimit.toFixed(2)}`);
    }
    if (monthlyLimit !== null) {
      console.log(`Monthly: $${monthlyLimit.toFixed(2)}`);
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to save cost limits:'), error.message);
  }
}

/**
 * Show cost usage and savings
 */
export async function cmdCostReport() {
  const VALUE_METRICS_FILE = 'vault/logs/dsc2_metrics.ndjson';
  
  try {
    if (!fileExists(VALUE_METRICS_FILE)) {
      console.log(chalk.yellow('⚠️  No cost metrics available yet'));
      return;
    }
    
    const content = fs.readFileSync(VALUE_METRICS_FILE, 'utf-8');
    const metrics = content.split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
    
    if (metrics.length === 0) {
      console.log(chalk.yellow('⚠️  No cost metrics available yet'));
      return;
    }
    
    const totalCost = metrics.reduce((sum: number, m: any) => sum + (m.cost_usd || 0), 0);
    const totalTokens = metrics.reduce((sum: number, m: any) => sum + (m.prompt_tokens || 0) + (m.completion_tokens || 0), 0);
    const successRate = metrics.filter((m: any) => m.success).length / metrics.length;
    
    console.log(chalk.cyan('💰 Cost Usage Report'));
    console.log('='.repeat(60));
    console.log(`Total Cost: $${totalCost.toFixed(4)}`);
    console.log(`Total Tokens: ${totalTokens.toLocaleString()}`);
    console.log(`Success Rate: ${(successRate * 100).toFixed(1)}%`);
    console.log(`Calls Made: ${metrics.length}`);
    console.log('='.repeat(60));
    
    // Show breakdown by tool
    const byTool: Record<string, { cost: number, count: number }> = {};
    metrics.forEach((m: any) => {
      const tool = m.tool || 'unknown';
      if (!byTool[tool]) {
        byTool[tool] = { cost: 0, count: 0 };
      }
      byTool[tool].cost += m.cost_usd || 0;
      byTool[tool].count += 1;
    });
    
    console.log(chalk.cyan('Breakdown by Tool:'));
    Object.entries(byTool).forEach(([tool, stats]) => {
      console.log(`  ${tool}: $${stats.cost.toFixed(4)} (${stats.count} calls)`);
    });
    
    // Show quality distribution if available
    const withQuality = metrics.filter((m: any) => m.quality_score !== undefined);
    if (withQuality.length > 0) {
      const avgQuality = withQuality.reduce((sum: number, m: any) => sum + m.quality_score, 0) / withQuality.length;
      console.log(chalk.cyan(`\nQuality Metrics:`));
      console.log(`  Average Quality Score: ${avgQuality.toFixed(2)}/1.0`);
      
      const qualityBands = [0.9, 0.7, 0.5, 0.3];
      const bandNames = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];
      const bandCounts = qualityBands.map(threshold => 
        withQuality.filter((m: any) => m.quality_score >= threshold).length
      );
      
      qualityBands.forEach((threshold, index) => {
        const count = bandCounts[index] - (bandCounts[index + 1] || 0);
        const percentage = (count / withQuality.length * 100).toFixed(1);
        console.log(`  ${bandNames[index]} (>=${threshold}): ${count} (${percentage}%)`);
      });
    }
    
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to generate cost report:'), error.message);
  }
}

/**
 * Register cost commands with commander
 */
export function registerCostCommands(program: Command) {
  const cost = program.command('cost').description('Cost management and approval workflows');
  
  cost
    .command('list')
    .description('List pending cost approvals')
    .action(cmdCostList);
  
  cost
    .command('approve')
    .argument('<id>', 'Approval ID to approve')
    .description('Approve a pending cost')
    .action(cmdCostApprove);
  
  cost
    .command('limit')
    .option('--daily <amount>', 'Set daily cost limit')
    .option('--monthly <amount>', 'Set monthly cost limit')
    .option('--list', 'Show current limits')
    .description('Set or view cost limits')
    .action(cmdCostLimit);
  
  cost
    .command('report')
    .description('Show cost usage and savings report')
    .action(cmdCostReport);
}

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(question, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
}