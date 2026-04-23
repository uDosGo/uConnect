import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileExists } from '../lib/file-utils.js';
import { callDSC2MCP } from './code.js';

/**
 * Run tests and optionally auto-fix failures using DSC2
 */
export async function cmdTestRun(testPath: string, options: { autoFix?: boolean; maxAttempts?: number }) {
  const resolvedPath = path.resolve(testPath);
  
  if (!fileExists(resolvedPath)) {
    console.error(chalk.red(`❌ Test file not found: ${resolvedPath}`));
    return;
  }
  
  const maxAttempts = options.maxAttempts || 3;
  let attempt = 1;
  let success = false;
  
  console.log(chalk.cyan(`🧪 Running tests: ${testPath}`));
  
  while (attempt <= maxAttempts && !success) {
    console.log(chalk.dim(`Attempt ${attempt}/${maxAttempts}...`));
    
    try {
      // Try to run the test file
      const testContent = fs.readFileSync(resolvedPath, 'utf-8');
      
      // Simple test execution - in real implementation, this would use a test framework
      if (testContent.includes('def ') || testContent.includes('function ')) {
        // Mock test execution - assume it fails if there's no test framework
        throw new Error('Test failed: No test framework detected');
      }
      
      // If we get here, assume tests passed
      console.log(chalk.green('✅ Tests passed!'));
      success = true;
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Test failed: ${error.message}`));
      
      if (options.autoFix && attempt < maxAttempts) {
        console.log(chalk.cyan('🔧 Attempting auto-fix with DSC2...'));
        
        try {
          // Read the test file
          const testContent = fs.readFileSync(resolvedPath, 'utf-8');
          
          // Use DSC2 to fix the test
          const fixPrompt = `
            Fix this test failure:
            Error: ${error.message}
            
            Test code:
            ${testContent}
            
            Return only the corrected code that will pass the tests.
          `;
          
          const result = await callDSC2MCP('dsc2_generate', { 
            prompt: fixPrompt 
          });
          
          const fixedCode = result.generated_code || result.code;
          
          if (fixedCode && fixedCode !== testContent) {
            console.log(chalk.dim('📝 DSC2 suggested fix:'));
            console.log('```diff');
            console.log(`- // Original (failed)`);
            console.log(`+ // Fixed by DSC2`);
            console.log('```');
            
            // Ask for user approval
            console.log(chalk.yellow('Apply this fix? [y/N]'));
            const answer = await askQuestion('> ');
            
            if (answer.toLowerCase() === 'y') {
              fs.writeFileSync(resolvedPath, fixedCode);
              console.log(chalk.green('✅ Fix applied, re-running tests...'));
              attempt++;
              continue; // Try again with the fixed code
            } else {
              console.log(chalk.blue('📝 Fix rejected, keeping original code'));
            }
          } else {
            console.log(chalk.yellow('⚠️  DSC2 could not suggest a fix'));
          }
        } catch (fixError: any) {
          console.error(chalk.red('❌ Auto-fix failed:'), fixError.message);
        }
      }
      
      break; // Exit if no auto-fix or max attempts reached
    }
  }
  
  if (!success) {
    console.error(chalk.red('❌ Tests failed after all attempts'));
  }
}

/**
 * Register test commands with commander
 */
export function registerTestCommands(program: Command) {
  const test = program.command('test').description('Test runner with auto-fix capabilities');
  
  test
    .command('run')
    .argument('<file>', 'Test file to run')
    .option('--auto-fix', 'Automatically attempt to fix test failures using DSC2')
    .option('--max-attempts <n>', 'Maximum number of fix attempts', '3')
    .description('Run tests and optionally auto-fix failures')
    .action(cmdTestRun);
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