# OK Base Layer

**Base OK contracts and types for the uDos ecosystem**

## Overview

This layer provides the foundational contracts and type definitions for the OK (Orchestration Kernel) system. All OK-compatible tools and orchestrators must implement these interfaces.

## Installation

```bash
# Install as dependency
npm install @udos/ok-base

# Or use from uDevFramework
udev init my-project --layers ok-base
```

## Core Contracts

### 1. OKTool Interface

All tools must implement this interface:

```typescript
interface OKTool {
    name: string;
    capabilities: string[];
    healthCheck(): Promise<HealthStatus>;
    execute(task: OKTask): Promise<OKResult>;
    getMetadata(): ToolMetadata;
}
```

### 2. OKOrchestrator Interface

Orchestrators must implement this interface:

```typescript
interface OKOrchestrator {
    registerTool(tool: OKTool): void;
    unregisterTool(name: string): void;
    routeTask(task: OKTask): Promise<OKResult>;
    getAvailableTools(): OKTool[];
    getStatus(): OrchestratorStatus;
}
```

### 3. OKTask Format

Standard task format:

```typescript
interface OKTask {
    id: string;
    type: string;
    input: any;
    context?: OKContext;
    constraints?: TaskConstraints;
}
```

### 4. OKResult Format

Standard result format:

```typescript
interface OKResult {
    output: any;
    quality: number;      // 0-1
    cost: number;         // USD
    steps?: OKStep[];
    metadata: ResultMetadata;
    warnings?: string[];
}
```

## Usage

### Implementing a Tool

```typescript
import { OKTool, OKTask, OKResult } from '@udos/ok-base';

class MyTool implements OKTool {
    name = 'my-tool';
    capabilities = ['text_generation', 'summarization'];

    async healthCheck() {
        return { status: 'healthy', timestamp: new Date() };
    }

    async execute(task: OKTask): Promise<OKResult> {
        // Process task
        return {
            output: result,
            quality: 0.9,
            cost: 0.01,
            metadata: {
                taskId: task.id,
                tool: this.name,
                timestamp: new Date(),
                duration: 100
            }
        };
    }

    getMetadata() {
        return {
            name: this.name,
            version: '1.0.0',
            capabilities: this.capabilities
        };
    }
}
```

### Using the Orchestrator

```typescript
import { OKOrchestrator } from '@udos/ok-base';

class MyOrchestrator implements OKOrchestrator {
    private tools: Map<string, OKTool> = new Map();

    registerTool(tool: OKTool) {
        this.tools.set(tool.name, tool);
    }

    async routeTask(task: OKTask): Promise<OKResult> {
        const tool = this.selectTool(task);
        return await tool.execute(task);
    }
    
    // ... implement other methods
}
```

## Layer Structure

```
layers/ok-base/
├── src/
│   ├── contracts/       # Contract interfaces
│   ├── types/           # Type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Main export
├── tests/               # Contract tests
├── package.json
└── README.md
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Integration with uDevFramework

### Manifest Example

```yaml
# .udev/manifest.yaml
layers:
  base: uDevFramework/layers/ok-base@^1.0
  domain: ./
```

### CLI Usage

```bash
# Initialize project with OK base layer
udev init my-tool --layers ok-base

# Validate OK compliance
udev ok validate

# List available OK tools
udev ok list
```

## Best Practices

1. **Type Safety**: Always use TypeScript types
2. **Error Handling**: Implement graceful error handling
3. **Documentation**: Add JSDoc comments
4. **Testing**: Test contract compliance
5. **Versioning**: Follow semantic versioning

## Examples

See `examples/` directory for complete implementations:
- Simple tool implementation
- Basic orchestrator
- Integration tests

## License

MIT License
