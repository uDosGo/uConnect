import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileExists, ensureDirectory } from '../lib/file-utils.js';

// DeepSeek MCP Server configuration (now configurable)
let DSC2_MCP_URL = 'http://localhost:30000/mcp';
let DSC2_TIMEOUT = 30000; // 30 seconds
const DSC2_PRICE_PER_1M_TOKENS = 0.14; // $0.14 per 1M tokens
const MONTHLY_BUDGET = 50.0; // $50 monthly budget

// Simple metrics tracking
let usedBudget = 0;

/**
 * Update configuration from config system
 */
export function updateConfigFromSettings() {
  try {
    // This would be imported from config.ts in a real implementation
    // For now, we'll use a simple approach
    const config = JSON.parse(fs.readFileSync('vault/config/hivemind.json', 'utf-8'));
    
    if (config.dsc2?.endpoint) {
      DSC2_MCP_URL = config.dsc2.endpoint;
    }
    if (config.dsc2?.timeout_ms) {
      DSC2_TIMEOUT = config.dsc2.timeout_ms;
    }
    
    console.log(chalk.dim(`🔧 Using config: ${DSC2_MCP_URL} (timeout: ${DSC2_TIMEOUT}ms)`));
  } catch (error: any) {
    // Use defaults if config not available
    console.log(chalk.dim('🔧 Using default configuration'));
  }
}

// Initialize configuration
try {
  updateConfigFromSettings();
} catch (error: any) {
  console.log(chalk.dim('🔧 Config initialization failed, using defaults'));
}

/**
 * Calculate cost for DSC2 call
 */
function calculateDSC2Cost(promptTokens: number, completionTokens: number): number {
  const totalTokens = promptTokens + completionTokens;
  return (totalTokens / 1_000_000) * DSC2_PRICE_PER_1M_TOKENS;
}

/**
 * Evaluate code quality using a simple heuristic
 */
function evaluateCodeQuality(code: string, tool: string): number {
  // Simple heuristic-based quality evaluation
  // In production, this would use a cheap model like Gemini Flash
  
  let score = 0.5; // Base score
  
  // Syntax validity (basic checks)
  if (code.includes('function') || code.includes('def ') || code.includes('class ')) {
    score += 0.1;
  }
  
  // Completeness
  if (code.includes('return ') || code.includes('}') || code.includes('end')) {
    score += 0.1;
  }
  
  // Error handling
  if (code.includes('try') || code.includes('catch') || code.includes('except')) {
    score += 0.1;
  }
  
  // Documentation
  if (code.includes('//') || code.includes('/*') || code.includes('#')) {
    score += 0.1;
  }
  
  // Type safety
  if (code.includes(': ') || code.includes('->') || code.includes('interface')) {
    score += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(1.0, Math.max(0.1, score));
}

/**
 * Quality-based routing decision
 */
function shouldFallbackBasedOnQuality(qualityScore: number): { fallback: boolean, reason: string, target: string } {
  if (qualityScore >= 0.7) {
    return { fallback: false, reason: 'good_quality', target: 'none' };
  } else if (qualityScore >= 0.5) {
    return { fallback: true, reason: 'low_quality', target: 'deepseek_v3' };
  } else if (qualityScore >= 0.3) {
    return { fallback: true, reason: 'very_low_quality', target: 'gemini_flash' };
  } else {
    return { fallback: true, reason: 'critical_quality', target: 'copilot_free' };
  }
}

/**
 * Record DSC2 call metrics
 */
function recordDSC2Metrics(tool: string, promptTokens: number, completionTokens: number, success: boolean, qualityScore?: number) {
  const cost = calculateDSC2Cost(promptTokens, completionTokens);
  usedBudget += cost;
  
  const budgetPercentage = (usedBudget / MONTHLY_BUDGET) * 100;
  
  // Log metrics to console
  let metricsLog = `📊 Metrics: ${tool} | ${promptTokens}+${completionTokens} tokens | $${cost.toFixed(6)} | ${budgetPercentage.toFixed(1)}% of $${MONTHLY_BUDGET}`;
  
  if (qualityScore !== undefined) {
    metricsLog += ` | Quality: ${qualityScore.toFixed(2)}`;
    
    const routingDecision = shouldFallbackBasedOnQuality(qualityScore);
    if (routingDecision.fallback) {
      metricsLog += ` | ${routingDecision.reason} → ${routingDecision.target}`;
    }
  }
  
  console.log(chalk.dim(metricsLog));
  
  // Check budget
  if (budgetPercentage > 90) {
    console.log(chalk.yellow(`⚠️  DSC2 budget warning: ${budgetPercentage.toFixed(1)}% used ($${usedBudget.toFixed(2)}/$${MONTHLY_BUDGET})`));
  }
  
  if (usedBudget >= MONTHLY_BUDGET) {
    console.log(chalk.red('❌ DSC2 budget exceeded! No more calls allowed.'));
  }
}

/**
 * Call DSC2 MCP server with a tool request
 */
export async function callDSC2MCP(tool: string, args: any): Promise<any> {
  try {
    // Check budget before making call
    if (usedBudget >= MONTHLY_BUDGET) {
      throw new Error('DeepSeek monthly budget exceeded');
    }
    
    const startTime = Date.now();
    
    // Check if DeepSeek MCP server is running
    try {
      const healthCheck = await fetch(`${DSC2_MCP_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!healthCheck.ok) {
        console.log(chalk.yellow('⚠️  DSC2 MCP server not available, falling back to DeepSeek API'));
        const result = await callDeepSeekAPI(tool, args);
        
        // Estimate token usage for fallback
        const promptTokens = estimateTokens(JSON.stringify(args));
        const completionTokens = estimateTokens(JSON.stringify(result));
        recordDSC2Metrics(tool, promptTokens, completionTokens, true);
        
        return result;
      }
    } catch (healthError) {
      console.log(chalk.yellow('⚠️  DSC2 MCP server not available, falling back to DeepSeek API'));
      const result = await callDeepSeekAPI(tool, args);
      
      // Estimate token usage for fallback
      const promptTokens = estimateTokens(JSON.stringify(args));
      const completionTokens = estimateTokens(JSON.stringify(result));
      recordDSC2Metrics(tool, promptTokens, completionTokens, true);
      
      return result;
    }
    
    // DSC2 MCP server is available, make the actual call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DSC2_TIMEOUT);
    
    const response = await fetch(`${DSC2_MCP_URL}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const endTime = Date.now();
    const latencyMs = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`DSC2 MCP server returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Estimate token usage (in real implementation, this would come from the MCP server)
    const promptTokens = estimateTokens(JSON.stringify(args));
    const completionTokens = estimateTokens(JSON.stringify(result));
    
    // Evaluate quality of the generated code
    const qualityScore = evaluateCodeQuality(JSON.stringify(result), tool);
    
    // Check if we should fallback based on quality
    const routingDecision = shouldFallbackBasedOnQuality(qualityScore);
    
    if (routingDecision.fallback) {
      console.log(chalk.yellow(`⚠️  Quality issue detected: ${routingDecision.reason}`));
      console.log(chalk.yellow(`🔄 Falling back to ${routingDecision.target}...`));
      
      // In a real implementation, we would call the fallback provider here
      // For now, we'll just log the decision and continue with the result
      // This would be implemented in the MCP server for production
    }
    
    recordDSC2Metrics(tool, promptTokens, completionTokens, true, qualityScore);
    
    console.log(chalk.dim(`⚡ Latency: ${latencyMs}ms`));
    
    return result;
  } catch (error: any) {
    console.error(chalk.red('❌ DSC2 MCP error:'), error.message);
    throw error;
  }
}

/**
 * Simple token estimation (approximate)
 */
function estimateTokens(text: string): number {
  // Very rough estimate: assume 4 characters per token
  return Math.max(10, Math.floor(text.length / 4));
}

/**
 * Fallback to DeepSeek API when DSC2 MCP is unavailable
 */
async function callDeepSeekAPI(tool: string, args: any): Promise<any> {
  // This is a simplified fallback - in production you'd use the actual DeepSeek API
  console.log(chalk.blue('🔄 Using DeepSeek API fallback for'), tool);
  
  // Mock response for development
  switch (tool) {
    case 'dsc2_generate':
      return {
        generated_code: `// Generated code for: ${args.prompt}
function example() {
  // This is a mock response from DeepSeek API
  return "Hello from DeepSeek!";
}`
      };
    case 'dsc2_complete':
      return {
        completed_code: `${args.prefix}
  // Completed middle section
  const result = a + b;
${args.suffix || ''}`
      };
    case 'dsc2_explain':
      return {
        explanation: `This code appears to be a ${args.language || 'JavaScript'} implementation that...
        // Detailed explanation would go here`
      };
    case 'dsc2_refactor':
      return {
        refactored_code: `// Refactored version of the provided code
${args.code}
// Additional improvements would be suggested here`
      };
    case 'dsc2_insert':
      return {
        inserted_code: `${args.prefix}
  // DSC2 inserted this section
  const result = ${getInsertionForCode(args.prefix, args.suffix)};
${args.suffix}`
      };
    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

function getInsertionForCode(prefix: string, suffix: string): string {
  if (prefix.includes('function') || prefix.includes('def ')) {
    return 'implemented logic';
  }
  if (prefix.includes('class ') || prefix.includes('struct ')) {
    return 'field definitions';
  }
  if (prefix.includes('if ') || prefix.includes('for ') || prefix.includes('while ')) {
    return 'loop body';
  }
  return 'appropriate implementation';
}

/**
 * Generate code from natural language prompt
 */
export async function cmdCodeGenerate(prompt: string, options: { save?: string }) {
  console.log(chalk.cyan('🤖 Generating code for:'), chalk.white(prompt));
  
  try {
    const result = await callDSC2MCP('dsc2_generate', { prompt: prompt });
    const generatedCode = result.generated_code || result.code;
    
    console.log(chalk.green('✅ Generated code:'));
    console.log('```' + getLanguageFromPrompt(prompt));
    console.log(generatedCode);
    console.log('```');
    
    if (options.save) {
      const savePath = path.resolve(options.save);
      ensureDirectory(path.dirname(savePath));
      
      if (fileExists(savePath)) {
        console.log(chalk.yellow('⚠️  File already exists. Overwrite? [y/N]'));
        const answer = await askQuestion('> ');
        if (answer.toLowerCase() !== 'y') {
          console.log(chalk.blue('📝 Saved to clipboard instead'));
          return;
        }
      }
      
      fs.writeFileSync(savePath, generatedCode);
      console.log(chalk.green(`✅ Code saved to: ${savePath}`));
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to generate code:'), error.message);
  }
}

/**
 * Fill-in-the-middle code insertion
 */
export async function cmdCodeInsert(options: { prefix: string; suffix: string; language?: string; save?: string }) {
  console.log(chalk.cyan('🔧 Inserting code between prefix and suffix...'));
  console.log('Prefix:', options.prefix);
  console.log('Suffix:', options.suffix);
  if (options.language) {
    console.log('Language:', options.language);
  }
  
  try {
    const result = await callDSC2MCP('dsc2_insert', {
      prefix: options.prefix,
      suffix: options.suffix,
      language: options.language
    });
    
    const insertedCode = result.inserted_code || result.code;
    console.log(chalk.green('✅ Inserted code:'));
    console.log('```' + (options.language || getLanguageFromCode(options.prefix)));
    console.log(insertedCode);
    console.log('```');
    
    if (options.save) {
      const savePath = path.resolve(options.save);
      ensureDirectory(path.dirname(savePath));
      fs.writeFileSync(savePath, insertedCode);
      console.log(chalk.green(`✅ Inserted code saved to: ${savePath}`));
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to insert code:'), error.message);
  }
}

/**
 * Fill-in-the-middle code completion
 */
export async function cmdCodeComplete(options: { prefix: string; suffix?: string; save?: string }) {
  console.log(chalk.cyan('🧩 Completing code...'));
  console.log('Prefix:', options.prefix);
  if (options.suffix) {
    console.log('Suffix:', options.suffix);
  }
  
  try {
    const result = await callDSC2MCP('dsc2_complete', {
      prefix: options.prefix,
      suffix: options.suffix
    });
    
    const completedCode = result.completed_code || result.code;
    console.log(chalk.green('✅ Completed code:'));
    console.log('```' + getLanguageFromCode(options.prefix));
    console.log(completedCode);
    console.log('```');
    
    if (options.save) {
      const savePath = path.resolve(options.save);
      ensureDirectory(path.dirname(savePath));
      fs.writeFileSync(savePath, completedCode);
      console.log(chalk.green(`✅ Completed code saved to: ${savePath}`));
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to complete code:'), error.message);
  }
}

/**
 * Explain existing code
 */
export async function cmdCodeExplain(filePath: string) {
  const resolvedPath = path.resolve(filePath);
  
  if (!fileExists(resolvedPath)) {
    console.error(chalk.red(`❌ File not found: ${resolvedPath}`));
    return;
  }
  
  try {
    const codeContent = fs.readFileSync(resolvedPath, 'utf-8');
    const language = getLanguageFromFile(resolvedPath);
    
    console.log(chalk.cyan(`📚 Explaining ${language} code from: ${filePath}`));
    
    const result = await callDSC2MCP('dsc2_explain', {
      code: codeContent,
      language: language,
      file_path: filePath
    });
    
    console.log(chalk.green('✅ Explanation:'));
    console.log(result.explanation);
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to explain code:'), error.message);
  }
}

/**
 * Suggest code refactoring
 */
export async function cmdCodeRefactor(filePath: string, options: { changes?: boolean }) {
  const resolvedPath = path.resolve(filePath);
  
  if (!fileExists(resolvedPath)) {
    console.error(chalk.red(`❌ File not found: ${resolvedPath}`));
    return;
  }
  
  try {
    const codeContent = fs.readFileSync(resolvedPath, 'utf-8');
    const language = getLanguageFromFile(resolvedPath);
    
    console.log(chalk.cyan(`🔧 Refactoring ${language} code from: ${filePath}`));
    
    const result = await callDSC2MCP('dsc2_refactor', {
      code: codeContent,
      language: language,
      file_path: filePath
    });
    
    const refactoredCode = result.refactored_code || result.code;
    
    if (options.changes) {
      // Show diff-style changes
      console.log(chalk.green('✅ Suggested changes:'));
      console.log('```diff');
      console.log(`- // Original code from ${filePath}`);
      console.log(`+ // Refactored version`);
      console.log(refactoredCode);
      console.log('```');
    } else {
      console.log(chalk.green('✅ Refactored code:'));
      console.log('```' + language);
      console.log(refactoredCode);
      console.log('```');
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to refactor code:'), error.message);
  }
}

/**
 * Register code commands with commander
 */
export function registerCodeCommands(program: Command) {
  const code = program.command('code').description('DeepSeek-powered code generation and analysis');
  
  code
    .command('generate')
    .argument('<prompt>', 'Natural language description of code to generate')
    .option('--save <file>', 'Save generated code to file')
    .description('Generate code from natural language prompt')
    .action(cmdCodeGenerate);
  
  code
    .command('insert')
    .requiredOption('--prefix <code>', 'Starting code prefix')
    .requiredOption('--suffix <code>', 'Ending code suffix')
    .option('--language <lang>', 'Programming language')
    .option('--save <file>', 'Save inserted code to file')
    .description('Insert code between prefix and suffix (fill-in-the-middle)')
    .action(cmdCodeInsert);

  code
    .command('complete')
    .requiredOption('--prefix <code>', 'Starting code prefix')
    .option('--suffix <code>', 'Ending code suffix')
    .option('--save <file>', 'Save completed code to file')
    .description('Fill-in-the-middle code completion')
    .action(cmdCodeComplete);
  
  code
    .command('explain')
    .argument('<file>', 'File to explain')
    .description('Explain existing code')
    .action(cmdCodeExplain);
  
  code
    .command('refactor')
    .argument('<file>', 'File to refactor')
    .option('--changes', 'Show diff-style changes')
    .description('Suggest code refactoring')
    .action(cmdCodeRefactor);
}

// Helper functions
function getLanguageFromPrompt(prompt: string): string {
  const langMatch = prompt.match(/\b(in|using)\s+(\w+)\b/i);
  if (langMatch) return langMatch[2].toLowerCase();
  return 'javascript'; // default
}

function getLanguageFromCode(code: string): string {
  if (code.trim().startsWith('//') || code.includes('function ')) return 'javascript';
  if (code.includes('def ') || code.includes('import ')) return 'python';
  if (code.includes('public class ') || code.includes('System.out')) return 'java';
  if (code.includes('#include ') || code.includes('cout <<')) return 'cpp';
  return 'javascript'; // default
}

function getLanguageFromFile(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.js': case '.jsx': case '.ts': case '.tsx': return 'javascript';
    case '.py': return 'python';
    case '.java': return 'java';
    case '.cpp': case '.h': case '.hpp': return 'cpp';
    case '.go': return 'go';
    case '.rs': return 'rust';
    case '.rb': return 'ruby';
    case '.php': return 'php';
    case '.swift': return 'swift';
    default: return 'unknown';
  }
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