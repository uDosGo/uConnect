# 📡 Universal Feed Integration Plan for Shakedown & Logging

## 🎯 Overview

This document outlines the **scaffold/peg design** for integrating the **Shakedown System** and **Logging** with the **Universal Feed Format** in preparation for the upcoming **major structural update and rename**. This integration will enable seamless data flow between system components and external agents.

## 🚀 Current State Analysis

### Existing Components
1. **Shakedown System** (`core/src/commands/shakedown.ts`)
   - Generates JSON reports
   - Creates MCP-compatible feedback
   - Saves to `.udos/reports/` and `.udos/mcp/`

2. **Admin Panel** (`core/src/commands/admin-panel.ts`)
   - Command matrix with granular metrics
   - Modular help system
   - Detailed command documentation

3. **Universal Feed Format** (Pending Structural Update)
   - Standardized data structure
   - Agent communication protocol
   - Cross-component compatibility

## 🔧 Integration Strategy

### Phase 1: Scaffold Design (Current - Pre-Restructure)

#### 1. Feed Format Adapter Layer

```typescript
// core/src/feed/adapter.ts (Scaffold)
export interface UniversalFeedItem {
  id: string;
  type: 'shakedown' | 'log' | 'command' | 'system';
  timestamp: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'success' | 'failure' | 'warning' | 'info';
  data: any;
  metadata?: {
    category?: string;
    module?: string;
    relatedCommands?: string[];
    healingActions?: string[];
  };
  context?: {
    system: string;
    version: string;
    environment: string;
  };
}

export class FeedAdapter {
  // Scaffold methods - will be fully implemented post-restructure
  static shakedownToFeed(shakedownReport: any): UniversalFeedItem[] {
    // TODO: Full implementation after structural update
    return [{
      id: `shakedown-${Date.now()}`,
      type: 'shakedown',
      timestamp: new Date().toISOString(),
      source: 'shakedown.system',
      severity: shakedownReport.summary.passRate >= 90 ? 'info' : 
                shakedownReport.summary.passRate >= 70 ? 'medium' : 'high',
      status: shakedownReport.summary.passRate >= 90 ? 'success' : 'warning',
      data: shakedownReport,
      metadata: {
        category: 'system.health',
        module: 'core'
      },
      context: {
        system: shakedownReport.system,
        version: shakedownReport.version,
        environment: shakedownReport.environment
      }
    }];
  }

  static commandMatrixToFeed(commandData: any): UniversalFeedItem[] {
    // TODO: Full implementation after structural update
    return commandData.map((cmd: any) => ({
      id: `command-${cmd.name}-${Date.now()}`,
      type: 'command',
      timestamp: new Date().toISOString(),
      source: 'admin.matrix',
      severity: 'info',
      status: 'success',
      data: cmd,
      metadata: {
        category: cmd.category,
        module: cmd.module,
        relatedCommands: cmd.relatedCommands
      }
    }));
  }

  static logToFeed(logEntry: any): UniversalFeedItem {
    // TODO: Full implementation after structural update
    return {
      id: `log-${Date.now()}`,
      type: 'log',
      timestamp: logEntry.timestamp || new Date().toISOString(),
      source: logEntry.source || 'system',
      severity: logEntry.level || 'info',
      status: 'info',
      data: logEntry,
      metadata: {
        category: logEntry.category || 'system'
      }
    };
  }
}
```

#### 2. Feed Storage Scaffold

```typescript
// core/src/feed/storage.ts (Scaffold)
export class FeedStorage {
  private static FEED_DIR = '.udos/feed';
  private static MAX_ITEMS = 1000; // Configurable

  static async initialize(): Promise<void> {
    // Create feed directory if it doesn't exist
    const feedDir = path.join(process.cwd(), this.FEED_DIR);
    if (!fs.existsSync(feedDir)) {
      fs.mkdirSync(feedDir, { recursive: true });
    }
  }

  static async saveFeedItem(item: UniversalFeedItem): Promise<string> {
    // TODO: Full implementation after structural update
    const feedDir = path.join(process.cwd(), this.FEED_DIR);
    const filePath = path.join(feedDir, `feed-${Date.now()}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(item, null, 2));
    return filePath;
  }

  static async getRecentItems(limit: number = 50): Promise<UniversalFeedItem[]> {
    // TODO: Full implementation after structural update
    const feedDir = path.join(process.cwd(), this.FEED_DIR);
    if (!fs.existsSync(feedDir)) return [];
    
    const files = fs.readdirSync(feedDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);
    
    return files.map(file => {
      try {
        const content = fs.readFileSync(path.join(feedDir, file), 'utf-8');
        return JSON.parse(content);
      } catch (error) {
        return null;
      }
    }).filter(Boolean) as UniversalFeedItem[];
  }

  static async getItemsByType(type: string, limit: number = 50): Promise<UniversalFeedItem[]> {
    // TODO: Full implementation after structural update
    const allItems = await this.getRecentItems(this.MAX_ITEMS);
    return allItems.filter(item => item.type === type).slice(0, limit);
  }
}
```

#### 3. Feed Integration with Shakedown

```typescript
// core/src/commands/shakedown.ts (Additions)
// Import the feed adapter (scaffold)
import { FeedAdapter, UniversalFeedItem } from '../feed/adapter.js';

// Add to ShakedownSystem class
private async publishToFeed(report: MCPReport): Promise<void> {
  try {
    // Convert shakedown report to universal feed format
    const feedItems = FeedAdapter.shakedownToFeed(report);
    
    // Save to feed storage
    for (const item of feedItems) {
      await FeedStorage.saveFeedItem(item);
    }
    
    console.log(chalk.green(`📡 Published ${feedItems.length} items to universal feed`));
    
  } catch (error: unknown) {
    console.error(chalk.red('❌ Failed to publish to feed:'), 
                  error instanceof Error ? error.message : String(error));
  }
}

// Update runFullShakedown method
public async runFullShakedown(): Promise<MCPReport> {
  // ... existing code ...
  
  // Add feed publishing
  await this.publishToFeed(report);
  
  return report;
}
```

#### 4. Feed Integration with Admin Panel

```typescript
// core/src/commands/admin-panel.ts (Additions)
// Import the feed adapter (scaffold)
import { FeedAdapter, UniversalFeedItem } from '../feed/adapter.js';

// Add to AdminPanel class
public async publishCommandMatrixToFeed(): Promise<void> {
  try {
    await this.collectCommandInformation();
    
    // Convert command matrix to universal feed format
    const feedItems = FeedAdapter.commandMatrixToFeed(this.commands);
    
    // Save to feed storage
    for (const item of feedItems) {
      await FeedStorage.saveFeedItem(item);
    }
    
    console.log(chalk.green(`📡 Published ${feedItems.length} commands to universal feed`));
    
  } catch (error: unknown) {
    console.error(chalk.red('❌ Failed to publish commands to feed:'), 
                  error instanceof Error ? error.message : String(error));
  }
}

// Update runFullDiagnostics method
public async runFullDiagnostics(): Promise<void> {
  // ... existing code ...
  
  // Add feed publishing for command matrix
  await this.publishCommandMatrixToFeed();
}
```

### Phase 2: Post-Structural Update Implementation

#### 1. Universal Feed Format Specification

```typescript
// After structural update: core/src/feed/format.ts
export interface UniversalFeedItem {
  id: string; // UUID or timestamp-based
  type: 'shakedown' | 'log' | 'command' | 'system' | 'agent' | 'workflow';
  timestamp: string; // ISO 8601
  source: string; // Component/source identifier
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'debug';
  status: 'success' | 'failure' | 'warning' | 'info' | 'pending';
  data: any; // Type-specific payload
  metadata?: {
    category?: string;
    module?: string;
    version?: string;
    relatedItems?: string[];
    tags?: string[];
    agentContext?: string;
  };
  context?: {
    system: string;
    version: string;
    environment: string;
    user?: string;
    session?: string;
  };
  workflow?: {
    id?: string;
    step?: number;
    totalSteps?: number;
    status?: string;
  };
}

export interface ShakedownFeedItem extends UniversalFeedItem {
  type: 'shakedown';
  data: {
    summary: {
      total: number;
      passed: number;
      failed: number;
      healed: number;
      passRate: number;
    };
    tests: Array<{
      name: string;
      passed: boolean;
      category: string;
      severity: string;
      durationMs: number;
    }>;
    healingActions: Array<{
      testName: string;
      action: string;
      success: boolean;
      message: string;
    }>;
  };
}

export interface CommandFeedItem extends UniversalFeedItem {
  type: 'command';
  data: {
    name: string;
    description: string;
    status?: string;
    module?: string;
    category?: string;
    syntax?: string;
    options?: string[];
    subcommands?: Array<{
      name: string;
      description: string;
    }>;
  };
}

export interface LogFeedItem extends UniversalFeedItem {
  type: 'log';
  data: {
    message: string;
    level: string;
    context?: any;
    stack?: string;
  };
}
```

#### 2. Feed Query System

```typescript
// After structural update: core/src/feed/query.ts
export class FeedQuery {
  static async query(options: {
    type?: string;
    severity?: string;
    source?: string;
    limit?: number;
    since?: string;
    category?: string;
  } = {}): Promise<UniversalFeedItem[]> {
    // Implement feed querying with filters
    const allItems = await FeedStorage.getRecentItems(options.limit || 1000);
    
    return allItems.filter(item => {
      if (options.type && item.type !== options.type) return false;
      if (options.severity && item.severity !== options.severity) return false;
      if (options.source && item.source !== options.source) return false;
      if (options.category && item.metadata?.category !== options.category) return false;
      if (options.since && item.timestamp < options.since) return false;
      return true;
    });
  }

  static async getShakedownHistory(limit: number = 20): Promise<ShakedownFeedItem[]> {
    const items = await this.query({ type: 'shakedown', limit });
    return items as ShakedownFeedItem[];
  }

  static async getCommandReference(limit: number = 50): Promise<CommandFeedItem[]> {
    const items = await this.query({ type: 'command', limit });
    return items as CommandFeedItem[];
  }

  static async getCriticalIssues(): Promise<UniversalFeedItem[]> {
    return this.query({ severity: 'critical' });
  }
}
```

#### 3. MCP Feed Bridge

```typescript
// After structural update: core/src/feed/mcp-bridge.ts
export class MCPFeedBridge {
  static async submitToMCP(feedItem: UniversalFeedItem, simulate: boolean = true): Promise<void> {
    if (simulate) {
      console.log(chalk.yellow('🔶 MCP Submission Simulation'));
      console.log(chalk.dim('Item to be submitted:'));
      console.log(JSON.stringify({
        id: feedItem.id,
        type: feedItem.type,
        severity: feedItem.severity,
        status: feedItem.status,
        timestamp: feedItem.timestamp,
        summary: feedItem.type === 'shakedown' ? 
                  `Tests: ${feedItem.data.summary.passed}/${feedItem.data.summary.total}` : 
                  feedItem.data.message || 'No summary'
      }, null, 2));
      
      // Save to MCP directory for simulation
      const mcpDir = path.join(process.cwd(), '.udos', 'mcp');
      if (!fs.existsSync(mcpDir)) {
        fs.mkdirSync(mcpDir, { recursive: true });
      }
      
      const filePath = path.join(mcpDir, `mcp-${feedItem.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(feedItem, null, 2));
      
      console.log(chalk.green(`💾 MCP item saved: ${path.relative(process.cwd(), filePath)}`));
    } else {
      // Actual MCP submission would go here
      // This is a peg/scaffold for the real implementation
      console.log(chalk.blue('🔄 Submitting to MCP...'));
      // TODO: Actual MCP API integration after structural update
    }
  }

  static async submitBatch(items: UniversalFeedItem[], simulate: boolean = true): Promise<void> {
    for (const item of items) {
      await this.submitToMCP(item, simulate);
    }
  }
}
```

### Phase 3: CLI Integration

```typescript
// After structural update: core/src/cli.ts additions
// Register feed commands
const { FeedQuery, FeedStorage } = await import("./feed/query.js");

program
  .command('feed')
  .description('Universal feed management')
  .action(async () => {
    console.log(chalk.cyan('📡 Universal Feed Management'));
    console.log(chalk.dim('Usage: udo feed [query|history|submit]'));
  });

program
  .command('feed:query')
  .description('Query universal feed items')
  .option('--type <type>', 'Filter by type (shakedown, command, log)')
  .option('--severity <severity>', 'Filter by severity')
  .option('--limit <limit>', 'Limit results', '20')
  .action(async (options) => {
    const items = await FeedQuery.query({
      type: options.type,
      severity: options.severity,
      limit: parseInt(options.limit)
    });
    
    console.log(chalk.cyan(`📊 Found ${items.length} feed items`));
    items.forEach(item => {
      const color = item.severity === 'critical' ? chalk.red : 
                   item.severity === 'high' ? chalk.yellow : 
                   item.severity === 'medium' ? chalk.blue : chalk.dim;
      console.log(`  ${color(item.type.padEnd(12))} ${color(item.severity.padEnd(10))} ${item.id}`);
      console.log(chalk.dim(`     ${item.timestamp} - ${item.source}`));
    });
  });

program
  .command('feed:history')
  .description('Show shakedown history from feed')
  .option('--limit <limit>', 'Limit results', '10')
  .action(async (options) => {
    const items = await FeedQuery.getShakedownHistory(parseInt(options.limit));
    
    console.log(chalk.cyan('📊 Shakedown History'));
    console.log(chalk.dim('='.repeat(40)));
    
    items.forEach(item => {
      const data = item.data as any;
      const color = data.summary.passRate >= 90 ? chalk.green : 
                   data.summary.passRate >= 70 ? chalk.yellow : chalk.red;
      console.log(`\n📋 ${item.id}`);
      console.log(chalk.dim(`   Date: ${item.timestamp}`));
      console.log(chalk.dim(`   Pass Rate: ${color(data.summary.passRate + '%')}`));
      console.log(chalk.dim(`   Tests: ${data.summary.passed}/${data.summary.total}`));
      console.log(chalk.dim(`   Self-Healed: ${data.summary.healed}`));
    });
  });

program
  .command('feed:submit')
  .description('Submit feed items to MCP')
  .option('--dry-run', 'Dry run (no actual submission)')
  .option('--all', 'Submit all items')
  .option('--id <id>', 'Submit specific item by ID')
  .action(async (options) => {
    let items: UniversalFeedItem[] = [];
    
    if (options.id) {
      // Get specific item
      const feedDir = path.join(process.cwd(), '.udos', 'feed');
      try {
        const content = fs.readFileSync(path.join(feedDir, `${options.id}.json`), 'utf-8');
        items = [JSON.parse(content)];
      } catch (error) {
        console.error(chalk.red('❌ Item not found:'), options.id);
        return;
      }
    } else if (options.all) {
      // Get all items
      items = await FeedQuery.getRecentItems();
    } else {
      // Get recent critical/high items
      items = await FeedQuery.query({ 
        severity: { $in: ['critical', 'high'] }, 
        limit: 10 
      });
    }
    
    if (items.length === 0) {
      console.log(chalk.yellow('No items to submit'));
      return;
    }
    
    console.log(chalk.blue(`🔄 Submitting ${items.length} items to MCP...`));
    await MCPFeedBridge.submitBatch(items, options.dryRun);
    console.log(chalk.green('✅ Submission complete'));
  });
```

## 📋 Implementation Roadmap

### Pre-Structural Update (Current Phase)
1. ✅ **Scaffold Feed Adapter** - Basic type conversions
2. ✅ **Scaffold Feed Storage** - File-based storage
3. ✅ **Integrate with Shakedown** - Publish shakedown results
4. ✅ **Integrate with Admin Panel** - Publish command matrix
5. ✅ **Document Design** - This comprehensive plan

### During Structural Update
1. **Finalize Universal Feed Format** - Complete specification
2. **Implement Feed Query System** - Advanced filtering and search
3. **Build MCP Bridge** - Actual API integration
4. **Enhance Storage** - Database/IndexedDB support
5. **Add Feed CLI Commands** - Full feed management

### Post-Structural Update
1. **Agent Workflow Integration** - Real-time feed processing
2. **Webhook Notifications** - Event-driven alerts
3. **Dashboard Visualization** - Feed analytics UI
4. **Multi-Environment Sync** - Cross-deployment feed sharing
5. **Compliance & Audit** - Long-term feed archiving

## 🎯 Benefits of Integration

### Immediate Benefits (Post-Structural Update)
1. **Unified Data Format** - Consistent structure across all components
2. **Agent Communication** - Seamless MCP workflow integration
3. **Historical Analysis** - Complete system health timeline
4. **Automated Reporting** - Agent-ready briefings
5. **Cross-Component Insights** - Holistic system understanding

### Long-Term Benefits
1. **Predictive Analytics** - Pattern detection and anomaly alerting
2. **Knowledge Base** - Shared learning across deployments
3. **Compliance Reporting** - Audit-ready historical data
4. **Multi-Agent Coordination** - Team-based issue resolution
5. **Continuous Improvement** - Data-driven system optimization

## 📝 Notes for Structural Update

### Naming Considerations
- Current: `shakedown`, `admin`, `feed`
- Post-update: Align with new naming convention
- Suggested: `health`, `inspect`, `telemetry`

### Directory Structure
- Current: `.udos/reports/`, `.udos/mcp/`, `.udos/feed/`
- Post-update: Consolidate under `.udos/telemetry/`
- Format: `.udos/telemetry/{shakedown,commands,logs,agent}/`

### Breaking Changes
- Feed format will be finalized post-restructure
- CLI commands will be renamed
- Storage locations will be consolidated
- API endpoints will be standardized

### Migration Path
1. **Backward Compatibility** - Support old formats temporarily
2. **Automatic Conversion** - Migrate existing reports
3. **Deprecation Warnings** - Guide users to new commands
4. **Documentation Updates** - Comprehensive migration guide

## 🏆 Conclusion

This **scaffold/peg design** provides a **comprehensive blueprint** for integrating the shakedown and logging systems with the universal feed format. The implementation is **intentionally lightweight** at this stage, focusing on:

1. **Type Safety** - Proper TypeScript interfaces
2. **File Structure** - Logical organization
3. **Integration Points** - Clear connection points
4. **Future-Proofing** - Designed for upcoming changes

The **full implementation** will occur **after the structural update**, ensuring compatibility with the new architecture and naming conventions. This approach allows us to:

- ✅ **Maintain momentum** - Keep developing features
- ✅ **Prepare for changes** - Design for upcoming restructure
- ✅ **Minimize rework** - Scaffold now, implement later
- ✅ **Ensure compatibility** - Future-proof design

**Status**: 📋 **DESIGN COMPLETE - READY FOR STRUCTURAL UPDATE** 🚀