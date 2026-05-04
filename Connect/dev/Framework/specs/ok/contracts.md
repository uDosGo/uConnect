# OK Contracts Specification

**Status:** Draft
**Last Updated:** 2025-04-22
**Author:** @fredporter

## Overview

This specification defines the standard contracts for the OK (Orchestration Kernel) system in the uDos ecosystem. These contracts ensure interoperability between the orchestrator (uDosHivemind) and tools (uDosRe3ngine and others).

## Core Contracts

### 1. OKTool Contract

The fundamental interface that all OK tools must implement.

```typescript
/**
 * OKTool - Standard interface for all OK tools
 * All tools in the uDos ecosystem must implement this interface
 */
interface OKTool {
    /**
     * Unique identifier for the tool
     * @example "reasoning", "code", "chat"
     */
    name: string;

    /**
     * Capabilities this tool provides
     * Used for tool selection and routing
     */
    capabilities: string[];

    /**
     * Check tool health and readiness
     * @returns Promise<HealthStatus> - Current health status
     */
    healthCheck(): Promise<HealthStatus>;

    /**
     * Execute a task using this tool
     * @param task - Task to execute
     * @returns Promise<OKResult> - Execution result
     */
    execute(task: OKTask): Promise<OKResult>;

    /**
     * Get tool metadata and capabilities
     * @returns ToolMetadata - Tool information
     */
    getMetadata(): ToolMetadata;
}

/**
 * Health status types
 */
type HealthStatus = {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    timestamp: Date;
    details?: any;
};

/**
 * Tool metadata
 */
type ToolMetadata = {
    name: string;
    version: string;
    description: string;
    capabilities: string[];
    config?: any;
};
```

### 2. OKOrchestrator Contract

The interface for the OK orchestrator (uDosHivemind).

```typescript
/**
 * OKOrchestrator - Orchestrator interface
 * Implemented by uDosHivemind
 */
interface OKOrchestrator {
    /**
     * Register a tool with the orchestrator
     * @param tool - Tool to register
     */
    registerTool(tool: OKTool): void;

    /**
     * Unregister a tool
     * @param name - Name of tool to unregister
     */
    unregisterTool(name: string): void;

    /**
     * Route a task to the appropriate tool
     * @param task - Task to route
     * @returns Promise<OKResult> - Execution result
     */
    routeTask(task: OKTask): Promise<OKResult>;

    /**
     * Get list of available tools
     * @returns OKTool[] - Array of registered tools
     */
    getAvailableTools(): OKTool[];

    /**
     * Get orchestrator status
     * @returns OrchestratorStatus - Current status
     */
    getStatus(): OrchestratorStatus;
}

type OrchestratorStatus = {
    tools: number;
    activeTasks: number;
    queueLength: number;
    uptime: number;
    mode: 'online' | 'offline' | 'degraded';
};
```

### 3. OKTask Contract

Standard task format for the OK system.

```typescript
/**
 * OKTask - Standard task format
 * Used for all task executions
 */
interface OKTask {
    /**
     * Unique task identifier
     */
    id: string;

    /**
     * Task type (used for routing)
     * @example "reasoning", "code_generation", "chat", "summarization"
     */
    type: string;

    /**
     * Task input data
     * Structure depends on task type
     */
    input: any;

    /**
     * Optional context for task execution
     */
    context?: OKContext;

    /**
     * Task execution constraints
     */
    constraints?: TaskConstraints;
}

/**
 * Task context
 */
interface OKContext {
    sessionId?: string;
    userId?: string;
    previousTasks?: string[];
    metadata?: any;
}

/**
 * Task constraints
 */
interface TaskConstraints {
    maxCost?: number;      // USD
    maxTime?: number;      // milliseconds
    maxTokens?: number;    // for LLM tasks
    qualityThreshold?: number; // 0-1
    preferOffline?: boolean;
}
```

### 4. OKResult Contract

Standard result format for task execution.

```typescript
/**
 * OKResult - Standard result format
 * Returned by all tool executions
 */
interface OKResult {
    /**
     * Task output/result
     * Structure depends on task type
     */
    output: any;

    /**
     * Quality score (0-1)
     * 1 = perfect, 0 = unusable
     */
    quality: number;

    /**
     * Execution cost in USD
     */
    cost: number;

    /**
     * Execution steps (for multi-step tasks)
     */
    steps?: OKStep[];

    /**
     * Result metadata
     */
    metadata: ResultMetadata;

    /**
     * Warnings or issues
     */
    warnings?: string[];
}

interface OKStep {
    description: string;
    result?: any;
    duration?: number;
    tool?: string;
}

interface ResultMetadata {
    taskId: string;
    tool: string;
    timestamp: Date;
    duration: number;
    model?: string;
    tokens?: number;
}
```

## Contract Implementation Examples

### OKTool Implementation (uDosRe3ngine)

```typescript
// src/reasoning/engine.ts
import { OKTool, OKTask, OKResult, HealthStatus, ToolMetadata } from '@udos/ok-contracts';

export class Re3ngine implements OKTool {
    name = 'reasoning';
    capabilities = ['deep_reasoning', 'multi_step_planning', 'batch_processing'];

    async healthCheck(): Promise<HealthStatus> {
        // Check model availability, load, etc.
        return {
            status: 'healthy',
            timestamp: new Date(),
            message: 'Re3ngine ready'
        };
    }

    async execute(task: OKTask): Promise<OKResult> {
        // Execute reasoning task
        const startTime = Date.now();
        const result = await this.processTask(task);
        
        return {
            output: result,
            quality: this.estimateQuality(result),
            cost: this.calculateCost(task),
            metadata: {
                taskId: task.id,
                tool: this.name,
                timestamp: new Date(),
                duration: Date.now() - startTime
            }
        };
    }

    getMetadata(): ToolMetadata {
        return {
            name: this.name,
            version: '1.0.0',
            description: 'Deep Reasoning Engine',
            capabilities: this.capabilities
        };
    }

    private async processTask(task: OKTask): Promise<any> {
        // Task-specific processing
    }

    private estimateQuality(result: any): number {
        // Estimate result quality
        return 0.85;
    }

    private calculateCost(task: OKTask): number {
        // Calculate execution cost
        return 0.00; // Free for local models
    }
}
```

### OKOrchestrator Implementation (uDosHivemind)

```typescript
// src/router/index.ts
import { OKOrchestrator, OKTool, OKTask, OKResult, OrchestratorStatus } from '@udos/ok-contracts';

export class Hivemind implements OKOrchestrator {
    private tools: Map<string, OKTool> = new Map();

    registerTool(tool: OKTool): void {
        this.tools.set(tool.name, tool);
        console.log(`Registered tool: ${tool.name}`);
    }

    unregisterTool(name: string): void {
        this.tools.delete(name);
        console.log(`Unregistered tool: ${name}`);
    }

    async routeTask(task: OKTask): Promise<OKResult> {
        // 1. Select appropriate tool
        const tool = this.selectTool(task);
        
        // 2. Execute task
        return await tool.execute(task);
    }

    getAvailableTools(): OKTool[] {
        return Array.from(this.tools.values());
    }

    getStatus(): OrchestratorStatus {
        return {
            tools: this.tools.size,
            activeTasks: 0, // TODO: track active tasks
            queueLength: 0, // TODO: implement queue
            uptime: process.uptime(),
            mode: 'online' // TODO: detect offline mode
        };
    }

    private selectTool(task: OKTask): OKTool {
        // Intelligent tool selection based on:
        // - Task type
        // - Capabilities
        // - Quality requirements
        // - Budget constraints
        // - Availability
        
        const candidates = Array.from(this.tools.values())
            .filter(tool => tool.capabilities.includes(task.type));
        
        if (candidates.length === 0) {
            throw new Error(`No tool available for task type: ${task.type}`);
        }
        
        // Simple selection: first available tool
        // TODO: Implement intelligent selection
        return candidates[0];
    }
}
```

## Contract Compliance

### Compliance Requirements

All OK tools must:
1. **Implement OKTool interface** fully
2. **Return valid OKResult** for all executions
3. **Handle health checks** properly
4. **Provide accurate metadata**
5. **Respect task constraints**
6. **Report errors gracefully**

### Validation

```typescript
// Contract validator
import { OKTool } from '@udos/ok-contracts';

function validateOKTool(tool: any): tool is OKTool {
    return typeof tool.name === 'string' &&
           Array.isArray(tool.capabilities) &&
           typeof tool.healthCheck === 'function' &&
           typeof tool.execute === 'function' &&
           typeof tool.getMetadata === 'function';
}

// Usage
if (!validateOKTool(myTool)) {
    throw new Error('Tool does not implement OKTool interface');
}
```

## Versioning

### Contract Versioning

```yaml
# specs/ok/contracts.yaml
versions:
  v1.0:
    status: current
    description: Initial OK contracts
    date: 2025-04-22
  
  v1.1:
    status: planned
    description: Add streaming support
    date: 2025-06-01
```

### Backward Compatibility

- All v1.x contracts are backward compatible
- New fields are optional
- Deprecated fields marked with `@deprecated`
- Major version changes require migration

## Testing Contracts

### Unit Tests

```typescript
// tests/unit/contracts.test.ts
import { Re3ngine } from '../../src/reasoning/engine';
import { validateOKTool } from '@udos/ok-contracts';

describe('OKTool Contract Compliance', () => {
    it('should implement OKTool interface', () => {
        const tool = new Re3ngine();
        expect(validateOKTool(tool)).toBe(true);
    });

    it('should have correct name', () => {
        const tool = new Re3ngine();
        expect(tool.name).toBe('reasoning');
    });

    it('should have required capabilities', () => {
        const tool = new Re3ngine();
        expect(tool.capabilities).toContain('deep_reasoning');
    });
});
```

### Integration Tests

```typescript
// tests/integration/orchestrator.test.ts
import { Hivemind } from '../../src/router/index';
import { Re3ngine } from '../../src/reasoning/engine';

describe('OK Orchestrator Integration', () => {
    let orchestrator: Hivemind;
    let reasoningTool: Re3ngine;

    beforeAll(() => {
        orchestrator = new Hivemind();
        reasoningTool = new Re3ngine();
        orchestrator.registerTool(reasoningTool);
    });

    it('should register tools correctly', () => {
        const tools = orchestrator.getAvailableTools();
        expect(tools.length).toBe(1);
        expect(tools[0].name).toBe('reasoning');
    });

    it('should route tasks to appropriate tools', async () => {
        const task = {
            id: 'test-123',
            type: 'deep_reasoning',
            input: 'Test reasoning task'
        };
        
        const result = await orchestrator.routeTask(task);
        expect(result).toBeDefined();
        expect(result.output).toBeDefined();
    });
});
```

## Best Practices

### 1. Interface Implementation
- **Be explicit**: Implement all interface methods
- **Type safety**: Use TypeScript types
- **Document**: Add JSDoc comments
- **Validate**: Check inputs and outputs

### 2. Error Handling
- **Graceful degradation**: Handle errors without crashing
- **Meaningful errors**: Provide clear error messages
- **Fallbacks**: Implement fallback strategies
- **Logging**: Log errors for debugging

### 3. Performance
- **Async/await**: Use async patterns properly
- **Caching**: Cache frequent operations
- **Batching**: Batch similar tasks
- **Cleanup**: Release resources promptly

### 4. Testing
- **Unit tests**: Test individual methods
- **Integration tests**: Test component interactions
- **Contract tests**: Verify interface compliance
- **Performance tests**: Benchmark execution

## Migration Guide

### From Legacy Systems

```bash
# Old system using direct calls
const result = await reasoningEngine.process(prompt);

# New system using OK contracts
const task = {
    id: 'task-123',
    type: 'deep_reasoning',
    input: prompt
};
const result = await orchestrator.routeTask(task);
```

### Version Migration

```bash
# Migrating from v1.0 to v1.1
# 1. Update contract dependencies
npm update @udos/ok-contracts@^1.1.0

# 2. Implement new optional fields
interface OKTask {
    id: string;
    type: string;
    input: any;
    context?: OKContext;
    constraints?: TaskConstraints;
    stream?: boolean; // New in v1.1
}

# 3. Update implementations
class Re3ngine implements OKTool {
    // Add stream support
    async execute(task: OKTask): Promise<OKResult> {
        if (task.stream) {
            return this.streamExecution(task);
        }
        return this.standardExecution(task);
    }
}
```

## Conclusion

This OK Contracts specification defines the standard interfaces that enable interoperability in the uDos ecosystem. By adhering to these contracts, tools and orchestrators can work together seamlessly, allowing for flexible composition and independent evolution of components.

**Next Steps:**
1. Implement contracts in uDosRe3ngine
2. Implement contracts in uDosHivemind
3. Create contract validation tests
4. Document contract usage examples
