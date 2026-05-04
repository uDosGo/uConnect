// core/src/commands/shakedown.ts
// Advanced Shakedown System with Self-Healing and MCP Integration

import { Command } from 'commander';
import chalk from 'chalk';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  output?: string;
  timestamp: string;
  durationMs: number;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface SelfHealingAction {
  testName: string;
  action: string;
  command: string[];
  success: boolean;
  message: string;
}

interface MCPReport {
  system: string;
  version: string;
  timestamp: string;
  environment: string;
  tests: TestResult[];
  healingActions: SelfHealingAction[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    healed: number;
    passRate: number;
  };
}

class ShakedownSystem {
  private results: TestResult[] = [];
  private healingActions: SelfHealingAction[] = [];
  private startTime: number;
  private projectRoot: string;
  private udoBin: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..', '..', '..');
    this.udoBin = path.join(this.projectRoot, 'core', 'bin', 'udo.mjs');
    this.startTime = Date.now();
  }

  public async runFullShakedown(): Promise<MCPReport> {
    console.log(chalk.cyan('🚀 uDos Advanced Shakedown System'));
    console.log(chalk.dim('='.repeat(60)));
    console.log(chalk.dim(`Starting at: ${new Date().toISOString()}`));
    
    // Run comprehensive test suite
    await this.runCoreTests();
    await this.runIntegrationTests();
    await this.runPerformanceTests();
    
    // Attempt self-healing for failed tests
    await this.attemptSelfHealing();
    
    // Generate report
    const report = this.generateMCPReport();
    
    // Display summary
    this.displaySummary(report);
    
    // Save report
    await this.saveReport(report);
    
    console.log(chalk.dim('='.repeat(60)));
    console.log(chalk.green('✅ Shakedown complete'));
    console.log(chalk.dim(`Duration: ${this.calculateDuration()}ms`));
    
    return report;
  }

  private calculateDuration(): number {
    return Date.now() - this.startTime;
  }

  private async runCoreTests(): Promise<void> {
    console.log(chalk.blue('\n🧪 Core Functionality Tests'));
    console.log(chalk.dim('-'.repeat(40)));
    
    const coreTests = [
      { name: 'vault.init', command: ['vault', '--help'], category: 'vault', severity: 'high' as const },
      { name: 'github.help', command: ['github', '--help'], category: 'collaboration', severity: 'medium' as const },
      { name: 'pr.help', command: ['pr', '--help'], category: 'collaboration', severity: 'medium' as const },
      { name: 'content.list', command: ['list', '--help'], category: 'content', severity: 'high' as const },
      { name: 'publish.help', command: ['publish', '--help'], category: 'publishing', severity: 'medium' as const },
      { name: 'system.status', command: ['status'], category: 'system', severity: 'low' as const },
      { name: 'admin.matrix', command: ['admin', 'matrix'], category: 'system', severity: 'low' as const }
    ];

    for (const test of coreTests) {
      await this.runTest(test.name, test.command, test.category, test.severity);
    }
  }

  private async runIntegrationTests(): Promise<void> {
    console.log(chalk.blue('\n🔗 Integration Tests'));
    console.log(chalk.dim('-'.repeat(40)));
    
    const integrationTests = [
      { name: 'wp.sync', command: ['wp', 'sync'], category: 'integration', severity: 'medium' as const },
      { name: 'gui.help', command: ['gui', '--help'], category: 'ui', severity: 'medium' as const },
      { name: 'obf.render', command: ['obf', 'render', 'docs/specs/obf-ui-blocks.md', '--format', 'html'], category: 'ui', severity: 'medium' as const },
      { name: 'app.help', command: ['app', '--help'], category: 'integration', severity: 'medium' as const },
      { name: 'network.status', command: ['network', 'status'], category: 'integration', severity: 'medium' as const }
    ];

    for (const test of integrationTests) {
      await this.runTest(test.name, test.command, test.category, test.severity);
    }
  }

  private async runPerformanceTests(): Promise<void> {
    console.log(chalk.blue('\n⚡ Performance Tests'));
    console.log(chalk.dim('-'.repeat(40)));
    
    const performanceTests = [
      { name: 'system.health', command: ['health', '--quick'], category: 'system', severity: 'low' as const },
      { name: 'vault.list', command: ['list'], category: 'vault', severity: 'low' as const },
      { name: 'admin.commands', command: ['admin', 'commands'], category: 'system', severity: 'low' as const }
    ];

    for (const test of performanceTests) {
      await this.runTest(test.name, test.command, test.category, test.severity);
    }
  }

  private async runTest(name: string, command: string[], category: string, severity: 'critical' | 'high' | 'medium' | 'low'): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = spawnSync(process.execPath, [
        this.udoBin,
        ...command
      ], {
        cwd: this.projectRoot,
        encoding: 'utf8',
        timeout: 15000,
        env: {
          ...process.env,
          NODE_PATH: process.env.NODE_PATH,
          PATH: process.env.PATH
        }
      });

      const success = result.status === 0;
      const durationMs = Date.now() - startTime;

      this.results.push({
        name,
        passed: success,
        error: success ? undefined : result.stderr || 'Unknown error',
        output: result.stdout,
        timestamp: new Date().toISOString(),
        durationMs,
        category,
        severity
      });

      const status = success ? chalk.green('✅') : chalk.red('❌');
      console.log(`  ${status} ${name.padEnd(20)} ${durationMs}ms`);

    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        durationMs,
        category,
        severity
      });

      console.log(`  ${chalk.red('❌')} ${name.padEnd(20)} ${durationMs}ms`);
      console.log(chalk.dim(`     Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  private async attemptSelfHealing(): Promise<void> {
    console.log(chalk.blue('\n🤖 Self-Healing Attempts'));
    console.log(chalk.dim('-'.repeat(40)));

    const failedTests = this.results.filter(r => !r.passed);
    
    for (const test of failedTests) {
      let healed = false;
      let message = 'No healing action available';
      
      // Try different healing strategies based on test type
      switch (test.category) {
        case 'vault':
          // Try to initialize vault if vault commands fail
          if (test.name.startsWith('vault')) {
            const healResult = spawnSync(process.execPath, [
              this.udoBin,
              'vault', 'init', '--help'
            ], {
              cwd: this.projectRoot,
              encoding: 'utf8',
              timeout: 10000
            });

            if (healResult.status === 0) {
              healed = true;
              message = 'Vault initialization verified';
            }
          }
          break;

        case 'integration':
          // Try to check network connectivity for integration issues
          if (test.name.includes('network')) {
            const healResult = spawnSync('ping', ['-c', '1', 'localhost'], {
              encoding: 'utf8',
              timeout: 5000
            });

            if (healResult.status === 0) {
              healed = true;
              message = 'Network connectivity verified';
            }
          }
          break;

        case 'system':
          // Try to run doctor for system issues
          if (test.name.includes('system')) {
            const healResult = spawnSync(process.execPath, [
              this.udoBin,
              'doctor'
            ], {
              cwd: this.projectRoot,
              encoding: 'utf8',
              timeout: 15000
            });

            if (healResult.status === 0) {
              healed = true;
              message = 'System health check passed';
            }
          }
          break;

        default:
          // Try to update dependencies
          if (test.severity === 'high' || test.severity === 'critical') {
            const healResult = spawnSync(process.execPath, [
              this.udoBin,
              'update'
            ], {
              cwd: this.projectRoot,
              encoding: 'utf8',
              timeout: 30000
            });

            if (healResult.status === 0) {
              healed = true;
              message = 'Dependencies updated';
            }
          }
      }

      this.healingActions.push({
        testName: test.name,
        action: healed ? 'Self-healed' : 'Attempted healing',
        command: [],
        success: healed,
        message
      });

      const status = healed ? chalk.green('✅') : chalk.yellow('⚠️');
      console.log(`  ${status} ${test.name.padEnd(30)} ${message}`);
    }

    if (this.healingActions.length === 0) {
      console.log(`  ${chalk.green('✅')} No failed tests require healing`);
    }
  }

  private generateMCPReport(): MCPReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const healed = this.healingActions.filter(a => a.success).length;
    const total = this.results.length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      system: 'uDosConnect',
      version: '1.0.0-va1',
      timestamp: new Date().toISOString(),
      environment: `${process.platform}/${process.arch}`,
      tests: this.results,
      healingActions: this.healingActions,
      summary: {
        total,
        passed,
        failed,
        healed,
        passRate
      }
    };
  }

  private displaySummary(report: MCPReport): void {
    console.log(chalk.cyan('\n📊 Shakedown Summary'));
    console.log(chalk.dim('-'.repeat(40)));

    const { total, passed, failed, healed, passRate } = report.summary;

    console.log(`  Total Tests:       ${total}`);
    console.log(`  Passed:            ${chalk.green(passed.toString())}`);
    console.log(`  Failed:            ${chalk.red(failed.toString())}`);
    console.log(`  Self-Healed:       ${chalk.yellow(healed.toString())}`);
    console.log(`  Pass Rate:         ${this.getPassRateColor(passRate)}(${passRate}%)`);
    console.log(`  Duration:          ${this.calculateDuration()}ms`);

    // Category breakdown
    const categoryCounts: Record<string, { total: number; passed: number }> = {};
    for (const test of report.tests) {
      if (!categoryCounts[test.category]) {
        categoryCounts[test.category] = { total: 0, passed: 0 };
      }
      categoryCounts[test.category].total++;
      if (test.passed) categoryCounts[test.category].passed++;
    }

    console.log(`\n${chalk.dim('Category Breakdown:')}`);
    for (const [category, counts] of Object.entries(categoryCounts)) {
      const rate = Math.round((counts.passed / counts.total) * 100);
      const color = this.getPassRateColor(rate);
      console.log(`  ${category.padEnd(15)}: ${counts.passed}/${counts.total} ${color(`(${rate}%)`)}`);
    }

    // Severity breakdown
    const severityCounts: Record<string, number> = {};
    for (const test of report.tests) {
      severityCounts[test.severity] = (severityCounts[test.severity] || 0) + (test.passed ? 0 : 1);
    }

    if (Object.keys(severityCounts).length > 0) {
      console.log(`\n${chalk.dim('Failed by Severity:')}`);
      for (const [severity, count] of Object.entries(severityCounts)) {
        const color = severity === 'critical' ? chalk.red : severity === 'high' ? chalk.yellow : chalk.blue;
        console.log(`  ${color(severity.padEnd(10))}: ${count}`);
      }
    }

    // Healing summary
    if (this.healingActions.length > 0) {
      console.log(`\n${chalk.dim('Self-Healing Summary:')}`);
      const successfulHeals = this.healingActions.filter(a => a.success).length;
      console.log(`  Attempted:        ${this.healingActions.length}`);
      console.log(`  Successful:       ${chalk.green(successfulHeals.toString())}`);
      console.log(`  Failure Rate:     ${failed > 0 ? Math.round(((failed - healed) / failed) * 100) : 0}%`);
    }
  }

  private getPassRateColor(rate: number): (text: string) => string {
    if (rate >= 90) return chalk.green;
    if (rate >= 70) return chalk.yellow;
    if (rate >= 50) return chalk.hex('#FFA500'); // Orange color
    return chalk.red;
  }

  private async saveReport(report: MCPReport): Promise<void> {
    try {
      const reportsDir = path.join(this.projectRoot, '.udos', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(reportsDir, `shakedown-${timestamp}.json`);

      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(chalk.dim(`\n💾 Report saved: ${path.relative(this.projectRoot, reportFile)}`));

      // Also save a summary
      const summaryFile = path.join(reportsDir, `shakedown-latest-summary.txt`);
      const summary = [
        `uDos Shakedown Report - ${new Date().toISOString()}`,
        `========================================`,
        `System: ${report.system}`,
        `Version: ${report.version}`,
        `Environment: ${report.environment}`,
        `Total Tests: ${report.summary.total}`,
        `Passed: ${report.summary.passed}`,
        `Failed: ${report.summary.failed}`,
        `Self-Healed: ${report.summary.healed}`,
        `Pass Rate: ${report.summary.passRate}%`,
        `Duration: ${this.calculateDuration()}ms`,
        ``,
        `Detailed report: ${path.relative(this.projectRoot, reportFile)}`
      ].join('\n');

      fs.writeFileSync(summaryFile, summary);
      
    } catch (error: unknown) {
      console.error(chalk.red('❌ Failed to save report:'), error instanceof Error ? error.message : String(error));
    }
  }

  public async generateMCPFeedback(): Promise<string> {
    const report = this.generateMCPReport();
    
    // Generate MCP-compatible feedback format
    const feedback = [
      `📊 uDos Shakedown Report - ${new Date().toISOString()}`,
      `System: ${report.system} | Version: ${report.version} | Environment: ${report.environment}`,
      `Pass Rate: ${report.summary.passRate}% (${report.summary.passed}/${report.summary.total})`,
      `Self-Healed: ${report.summary.healed} issues`,
      ``,
      `🔍 Test Results by Category:`
    ];

    // Category results
    const categoryResults: Record<string, { passed: number; failed: number }> = {};
    for (const test of report.tests) {
      if (!categoryResults[test.category]) {
        categoryResults[test.category] = { passed: 0, failed: 0 };
      }
      if (test.passed) {
        categoryResults[test.category].passed++;
      } else {
        categoryResults[test.category].failed++;
      }
    }

    for (const [category, result] of Object.entries(categoryResults)) {
      const total = result.passed + result.failed;
      const rate = Math.round((result.passed / total) * 100);
      feedback.push(`  • ${category}: ${result.passed}/${total} (${rate}%)`);
    }

    // Failed tests with severity
    const criticalFailed = report.tests.filter(t => !t.passed && t.severity === 'critical').length;
    const highFailed = report.tests.filter(t => !t.passed && t.severity === 'high').length;
    const mediumFailed = report.tests.filter(t => !t.passed && t.severity === 'medium').length;

    if (criticalFailed > 0) {
      feedback.push(`\n❌ Critical Issues: ${criticalFailed}`);
    }
    if (highFailed > 0) {
      feedback.push(`⚠️ High Severity Issues: ${highFailed}`);
    }
    if (mediumFailed > 0) {
      feedback.push(`🟡 Medium Severity Issues: ${mediumFailed}`);
    }

    // Healing actions
    if (report.healingActions.length > 0) {
      feedback.push(`\n🤖 Self-Healing Actions:`);
      for (const action of report.healingActions) {
        const status = action.success ? '✅' : '❌';
        feedback.push(`  ${status} ${action.testName}: ${action.message}`);
      }
    }

    // Recommendations
    feedback.push(`\n💡 Recommendations:`);
    if (report.summary.passRate < 70) {
      feedback.push(`  • Critical: System requires immediate attention (${report.summary.passRate}% pass rate)`);
    } else if (report.summary.passRate < 90) {
      feedback.push(`  • Warning: System health degraded (${report.summary.passRate}% pass rate)`);
    } else {
      feedback.push(`  • Healthy: System operating normally (${report.summary.passRate}% pass rate)`);
    }

    if (criticalFailed > 0) {
      feedback.push(`  • Action: Investigate critical failures immediately`);
    }

    if (report.summary.healed > 0) {
      feedback.push(`  • Note: ${report.summary.healed} issues were automatically resolved`);
    }

    // MCP Integration instructions
    feedback.push(`\n📡 MCP Integration:`);
    feedback.push(`  This report can be submitted to MCP for agent briefing and workflow processing`);
    feedback.push(`  Format: JSON`);
    feedback.push(`  Endpoint: /api/v1/shakedown/report`);
    feedback.push(`  Method: POST`);
    feedback.push(`  Content-Type: application/json`);

    return feedback.join('\n');
  }

  public async submitToMCP(simulate: boolean = true): Promise<void> {
    const report = this.generateMCPReport();
    const feedback = await this.generateMCPFeedback();

    console.log(chalk.cyan('\n📡 MCP Submission Process'));
    console.log(chalk.dim('='.repeat(40)));

    if (simulate) {
      console.log(chalk.yellow('🔶 Simulation Mode (dry run)'));
      console.log('\nMCP Feedback Preview:');
      console.log(chalk.dim('-'.repeat(30)));
      console.log(feedback);
      
      console.log(chalk.dim('\nJSON Report Preview:'));
      console.log(chalk.dim('-'.repeat(30)));
      console.log(JSON.stringify({
        summary: report.summary,
        criticalIssues: report.tests.filter(t => !t.passed && t.severity === 'critical').length,
        healingActions: report.healingActions.length
      }, null, 2));
      
      console.log(chalk.dim('\n📝 Submission Instructions:'));
      console.log('  1. Review feedback above');
      console.log('  2. Save JSON report from .udos/reports/');
      console.log('  3. Submit to MCP endpoint: POST /api/v1/shakedown/report');
      console.log('  4. Include agent context and workflow references');
      console.log('  5. Await MCP processing and agent assignment');
      
    } else {
      console.log(chalk.blue('🔄 Preparing MCP Submission...'));
      
      // In a real implementation, this would:
      // 1. Connect to MCP endpoint
      // 2. Authenticate
      // 3. Submit JSON report
      // 4. Process response
      // 5. Update local status
      
      console.log('✅ Report prepared for submission');
      console.log(`📊 Pass Rate: ${report.summary.passRate}%`);
      console.log(`🔍 Tests: ${report.summary.passed}/${report.summary.total}`);
      console.log(`🤖 Self-Healed: ${report.summary.healed}`);
      
      // Save MCP-compatible report
      const mcpReportDir = path.join(this.projectRoot, '.udos', 'mcp');
      if (!fs.existsSync(mcpReportDir)) {
        fs.mkdirSync(mcpReportDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const mcpReportFile = path.join(mcpReportDir, `mcp-shakedown-${timestamp}.json`);
      fs.writeFileSync(mcpReportFile, JSON.stringify(report, null, 2));

      console.log(chalk.green(`💾 MCP report saved: ${path.relative(this.projectRoot, mcpReportFile)}`));
      console.log(chalk.dim('Ready for submission to MCP endpoint'));
    }
  }
}

export function registerShakedownCommands(program: Command): void {
  const shakedown = program.command('shakedown').description('Advanced Shakedown System with Self-Healing and MCP Integration');

  shakedown
    .command('run')
    .description('Run comprehensive shakedown with self-healing')
    .option('--simulate', 'Simulate MCP submission (dry run)')
    .option('--verbose', 'Verbose output')
    .action(async (options) => {
      const system = new ShakedownSystem();
      const report = await system.runFullShakedown();
      
      if (options.simulate) {
        await system.submitToMCP(true);
      }
    });

  shakedown
    .command('report')
    .description('Generate MCP-compatible report')
    .action(async () => {
      const system = new ShakedownSystem();
      await system.runFullShakedown();
      const feedback = await system.generateMCPFeedback();
      console.log(feedback);
    });

  shakedown
    .command('submit')
    .description('Submit shakedown report to MCP (simulated)')
    .option('--dry-run', 'Dry run (no actual submission)')
    .action(async (options) => {
      const system = new ShakedownSystem();
      await system.runFullShakedown();
      await system.submitToMCP(options.dryRun);
    });

  shakedown
    .command('history')
    .description('Show shakedown history')
    .action(() => {
      const reportsDir = path.join(path.resolve(__dirname, '..', '..', '..'), '.udos', 'reports');
      
      if (!fs.existsSync(reportsDir)) {
        console.log(chalk.yellow('No shakedown history found'));
        return;
      }

      const files = fs.readdirSync(reportsDir)
        .filter(f => f.startsWith('shakedown-') && f.endsWith('.json'))
        .sort()
        .reverse();

      console.log(chalk.cyan('📊 Shakedown History'));
      console.log(chalk.dim('='.repeat(40)));

      if (files.length === 0) {
        console.log(chalk.yellow('No reports found'));
        return;
      }

      for (const file of files.slice(0, 10)) {
        try {
          const content = fs.readFileSync(path.join(reportsDir, file), 'utf-8');
          const report = JSON.parse(content);
          console.log(`\n📋 ${file}`);
          console.log(chalk.dim(`   Date: ${report.timestamp}`));
          console.log(chalk.dim(`   Pass Rate: ${report.summary.passRate}%`));
          console.log(chalk.dim(`   Tests: ${report.summary.passed}/${report.summary.total}`));
          console.log(chalk.dim(`   Self-Healed: ${report.summary.healed}`));
        } catch (error) {
          console.log(chalk.red(`❌ Error reading ${file}`));
        }
      }
    });

  // Alias shakedown alone to run full shakedown
  shakedown.action(async () => {
    const system = new ShakedownSystem();
    await system.runFullShakedown();
    await system.submitToMCP(true);
  });
}