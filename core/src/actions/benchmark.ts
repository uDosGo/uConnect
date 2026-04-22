import { Command } from 'commander';
import chalk from 'chalk';
import { callDSC2MCP } from './code.js';
import { getConfig } from './config.js';
import fs from 'fs';
import path from 'path';

interface BenchmarkResult {
  tool: string;
  prompt: string;
  iterations: number;
  total_time_ms: number;
  avg_time_ms: number;
  min_time_ms: number;
  max_time_ms: number;
  success_count: number;
  failure_count: number;
  total_tokens: number;
  total_cost: number;
  timestamp: number;
}

/**
 * Run performance benchmark
 */
export async function cmdBenchmarkRun(options: { tool?: string; iterations?: string; prompt?: string; baseline?: boolean }) {
  const tool = options.tool || 'generate';
  const iterations = options.iterations ? parseInt(options.iterations) : 10;
  const prompt = options.prompt || 'write a hello world function';
  const isBaseline = options.baseline || false;
  
  if (iterations <= 0) {
    console.error(chalk.red('❌ Iterations must be a positive number'));
    return;
  }
  
  console.log(chalk.cyan(`🏎 Running benchmark: ${tool} x ${iterations}`));
  console.log(chalk.dim(`Prompt: "${prompt}"`));
  console.log(chalk.dim(`Baseline: ${isBaseline}`));
  console.log('='.repeat(60));
  
  const times: number[] = [];
  let successCount = 0;
  let failureCount = 0;
  let totalTokens = 0;
  let totalCost = 0;
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      const result = await callDSC2MCP(`dsc2_${tool}`, { prompt });
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      times.push(latency);
      successCount++;
      
      // Estimate tokens and cost (in real implementation, this would come from the result)
      const promptTokens = estimateTokens(prompt);
      const completionTokens = estimateTokens(JSON.stringify(result));
      const cost = calculateDSC2Cost(promptTokens, completionTokens);
      
      totalTokens += promptTokens + completionTokens;
      totalCost += cost;
      
      console.log(chalk.dim(`Iteration ${i + 1}/${iterations}: ${latency}ms`));
      
    } catch (error: any) {
      failureCount++;
      console.log(chalk.red(`Iteration ${i + 1}/${iterations}: Failed - ${error.message}`));
    }
  }
  
  // Calculate statistics
  const totalTime = times.reduce((sum, t) => sum + t, 0);
  const avgTime = totalTime / Math.max(1, times.length);
  const minTime = times.length > 0 ? Math.min(...times) : 0;
  const maxTime = times.length > 0 ? Math.max(...times) : 0;
  
  const result: BenchmarkResult = {
    tool,
    prompt,
    iterations,
    total_time_ms: totalTime,
    avg_time_ms: avgTime,
    min_time_ms: minTime,
    max_time_ms: maxTime,
    success_count: successCount,
    failure_count: failureCount,
    total_tokens: totalTokens,
    total_cost: totalCost,
    timestamp: Date.now()
  };
  
  // Save results
  saveBenchmarkResult(result);
  
  // Display summary
  console.log('='.repeat(60));
  console.log(chalk.cyan('📊 Benchmark Results:'));
  console.log(`  Tool: ${tool}`);
  console.log(`  Iterations: ${iterations}`);
  console.log(`  Success: ${successCount} (${(successCount / iterations * 100).toFixed(1)}%)`);
  console.log(`  Failures: ${failureCount} (${(failureCount / iterations * 100).toFixed(1)}%)`);
  console.log(`  Total Time: ${totalTime}ms`);
  console.log(`  Average: ${avgTime.toFixed(2)}ms`);
  console.log(`  Min: ${minTime}ms`);
  console.log(`  Max: ${maxTime}ms`);
  console.log(`  Total Tokens: ${totalTokens}`);
  console.log(`  Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`  Cost per Request: $${(totalCost / Math.max(1, successCount)).toFixed(6)}`);
  
  if (isBaseline) {
    console.log(chalk.yellow('\n📝 Baseline benchmark completed'));
    console.log('Use this as reference for future comparisons');
  }
}

/**
 * Save benchmark result to file
 */
function saveBenchmarkResult(result: BenchmarkResult) {
  try {
    const benchmarkDir = 'vault/logs/benchmarks';
    const benchmarkFile = path.join(benchmarkDir, `benchmark-${result.timestamp}.json`);
    
    // Ensure directory exists
    if (!fs.existsSync(benchmarkDir)) {
      fs.mkdirSync(benchmarkDir, { recursive: true });
    }
    
    fs.writeFileSync(benchmarkFile, JSON.stringify(result, null, 2));
    console.log(chalk.dim(`💾 Results saved to: ${benchmarkFile}`));
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to save benchmark results:'), error.message);
  }
}

/**
 * Generate benchmark report
 */
export async function cmdBenchmarkReport(options: { format?: string }) {
  try {
    const fs = require('fs');
    const path = require('path');
    const benchmarkDir = 'vault/logs/benchmarks';
    
    if (!fs.existsSync(benchmarkDir)) {
      console.log(chalk.yellow('⚠️  No benchmark results found'));
      return;
    }
    
    const files = fs.readdirSync(benchmarkDir);
    if (files.length === 0) {
      console.log(chalk.yellow('⚠️  No benchmark results found'));
      return;
    }
    
    const results = files
      .map((file: string) => {
        try {
          const content = fs.readFileSync(path.join(benchmarkDir, file), 'utf-8');
          return JSON.parse(content);
        } catch (error) {
          return null;
        }
      })
      .filter((r: any) => r !== null)
      .sort((a: any, b: any) => b.timestamp - a.timestamp);
    
    if (results.length === 0) {
      console.log(chalk.yellow('⚠️  No valid benchmark results found'));
      return;
    }
    
    const format = options.format || 'text';
    
    if (format === 'markdown' || format === 'md') {
      generateMarkdownReport(results);
    } else {
      generateTextReport(results);
    }
    
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to generate benchmark report:'), error.message);
  }
}

/**
 * Generate text report
 */
function generateTextReport(results: BenchmarkResult[]) {
  console.log(chalk.cyan('📊 Benchmark Report'));
  console.log('='.repeat(80));
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${new Date(result.timestamp).toLocaleString()}`);
    console.log(`   Tool: ${result.tool}`);
    console.log(`   Prompt: ${result.prompt}`);
    console.log(`   Iterations: ${result.iterations}`);
    console.log(`   Success Rate: ${(result.success_count / result.iterations * 100).toFixed(1)}%`);
    console.log(`   Avg Latency: ${result.avg_time_ms.toFixed(2)}ms`);
    console.log(`   Cost per Request: $${(result.total_cost / result.success_count).toFixed(6)}`);
    console.log('-'.repeat(80));
  });
  
  // Calculate overall statistics
  const totalRequests = results.reduce((sum, r) => sum + r.iterations, 0);
  const totalSuccess = results.reduce((sum, r) => sum + r.success_count, 0);
  const avgLatency = results.reduce((sum, r) => sum + r.avg_time_ms, 0) / results.length;
  const totalCost = results.reduce((sum, r) => sum + r.total_cost, 0);
  
  console.log(chalk.cyan('\n📈 Overall Statistics:'));
  console.log(`  Total Requests: ${totalRequests}`);
  console.log(`  Success Rate: ${(totalSuccess / totalRequests * 100).toFixed(1)}%`);
  console.log(`  Average Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`  Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`  Cost per Request: $${(totalCost / totalSuccess).toFixed(6)}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results: BenchmarkResult[]) {
  console.log('```markdown');
  console.log('# Benchmark Report');
  console.log('');
  console.log('| Date | Tool | Success Rate | Avg Latency | Cost per Request |');
  console.log('|------|------|--------------|-------------|-----------------|');
  
  results.forEach(result => {
    const date = new Date(result.timestamp).toLocaleString();
    const successRate = (result.success_count / result.iterations * 100).toFixed(1);
    const avgLatency = result.avg_time_ms.toFixed(2);
    const costPerRequest = (result.total_cost / result.success_count).toFixed(6);
    
    console.log(`| ${date} | ${result.tool} | ${successRate}% | ${avgLatency}ms | $${costPerRequest} |`);
  });
  
  // Calculate overall statistics
  const totalRequests = results.reduce((sum, r) => sum + r.iterations, 0);
  const totalSuccess = results.reduce((sum, r) => sum + r.success_count, 0);
  const avgLatency = results.reduce((sum, r) => sum + r.avg_time_ms, 0) / results.length;
  const totalCost = results.reduce((sum, r) => sum + r.total_cost, 0);
  
  console.log('');
  console.log('## Summary');
  console.log(`- **Total Requests**: ${totalRequests}`);
  console.log(`- **Success Rate**: ${(totalSuccess / totalRequests * 100).toFixed(1)}%`);
  console.log(`- **Average Latency**: ${avgLatency.toFixed(2)}ms`);
  console.log(`- **Total Cost**: $${totalCost.toFixed(6)}`);
  console.log(`- **Cost per Request**: $${(totalCost / totalSuccess).toFixed(6)}`);
  console.log('```');
}

/**
 * Estimate tokens for cost calculation
 */
function estimateTokens(text: string): number {
  // Rough estimate: 4 characters per token
  return Math.max(10, Math.floor(text.length / 4));
}

/**
 * Calculate DSC2 cost
 */
function calculateDSC2Cost(promptTokens: number, completionTokens: number): number {
  const DSC2_PRICE_PER_1M_TOKENS = 0.14;
  const totalTokens = promptTokens + completionTokens;
  return (totalTokens / 1_000_000) * DSC2_PRICE_PER_1M_TOKENS;
}

/**
 * Register benchmark commands with commander
 */
export function registerBenchmarkCommands(program: Command) {
  const benchmark = program.command('benchmark').description('Performance benchmarking');
  
  benchmark
    .command('run')
    .option('--tool <tool>', 'Tool to benchmark (generate, complete, etc.)')
    .option('--iterations <n>', 'Number of iterations')
    .option('--prompt <prompt>', 'Prompt to use for benchmarking')
    .option('--baseline', 'Mark as baseline benchmark')
    .description('Run performance benchmark')
    .action(cmdBenchmarkRun);
  
  benchmark
    .command('report')
    .option('--format <format>', 'Output format (text, markdown)')
    .description('Generate benchmark report')
    .action(cmdBenchmarkReport);
}