# 🧠 Hivemind Local Model Integration & Offline Intelligence System

**Status:** Proposed
**Last Updated:** 2025-04-22
**Author:** @fredporter

## Overview

This specification defines the integration of local offline models into Hivemind, enabling complete offline operation with intelligent model selection and routing. Hivemind becomes the orchestrator that can leverage local models hosted by Sonic's Ollama instance as a primary or fallback inference source.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Hivemind                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Model Router (Intelligent)                      │   │
│  │  • Task classification (code, chat, reasoning, extraction)          │   │
│  │  • Model selection (local vs cloud, which local model)              │   │
│  │  • Budget awareness (use free local when possible)                  │   │
│  │  • Fallback chain (local → cheap cloud → premium cloud)             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    │ API call                               │
│                                    ▼                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Sonic-Screwdriver                                    │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                    │
│  │   Ollama      │  │   llama.cpp   │  │   GPT4All     │                    │
│  │   Server      │  │   (future)    │  │   (future)    │                    │
│  └───────────────┘  └───────────────┘  └───────────────┘                    │
│         │                  │                  │                             │
│         └──────────────────┼──────────────────┘                             │
│                            ▼                                                │
│              ┌─────────────────────────┐                                    │
│              │   Local Model Registry   │                                    │
│              │   ~/.local/share/models/ │                                    │
│              └─────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Benefits

1. **Complete offline operation** – No internet, no API keys, no cost
2. **Task-specific small models** – Lean models optimized for specific tasks
3. **Model packaging & distribution** – Bundle models with Hivemind or download on demand
4. **Intelligent model selection** – Hivemind chooses the right model for each task
5. **Graceful degradation** – Falls back to smaller models when needed
6. **Performance optimization** – Model caching and keep-alive strategies

## Phase 1: Local Model Registry & Management

### 1.1 Directory Structure

```
~/.local/share/models/
├── registry.json              # Index of all available models
├── code/
│   ├── deepseek-coder-1.3b/   # Tiny code model
│   │   ├── model.gguf
│   │   └── metadata.json
│   └── starcoder-1b/
├── chat/
│   ├── llama3.2-3b/
│   ├── phi-2/
│   └── tinyllama-1.1b/
├── embedding/
│   ├── all-MiniLM-L6-v2/      # For RAG
│   └── bge-small/
└── classification/
    ├── zero-shot-classifier/
    └── intent-detector/
```

### 1.2 Registry Schema

**File:** `~/.local/share/models/registry.json`

```json
{
  "version": 1,
  "models": {
    "deepseek-coder-1.3b": {
      "path": "code/deepseek-coder-1.3b/model.gguf",
      "size_mb": 800,
      "task": ["code_generation", "code_completion"],
      "quality": 0.75,
      "speed": 0.85,
      "quantization": "Q4_K_M",
      "source": "builtin"
    },
    "llama3.2-3b": {
      "path": "chat/llama3.2-3b/model.gguf",
      "size_mb": 1800,
      "task": ["chat", "reasoning", "summarization"],
      "quality": 0.82,
      "speed": 0.70,
      "source": "ollama_pull"
    },
    "all-MiniLM-L6-v2": {
      "path": "embedding/all-MiniLM-L6-v2/",
      "size_mb": 90,
      "task": ["embedding", "similarity"],
      "quality": 0.88,
      "speed": 0.95,
      "source": "builtin"
    }
  },
  "defaults": {
    "code_generation": "deepseek-coder-1.3b",
    "chat": "llama3.2-3b",
    "embedding": "all-MiniLM-L6-v2"
  }
}
```

## Phase 2: Built-in Lean Models

### 2.1 Model Selection for Bundling

| Model | Size | Task | Why Include |
|-------|------|------|-------------|
| **deepseek-coder-1.3b** | 800MB | Code generation | Tiny, fast, decent code quality |
| **phi-2** (Microsoft) | 2.7GB | General reasoning | Small but powerful |
| **tinyllama-1.1b** | 600MB | Chat, simple tasks | Ultra-light, runs anywhere |
| **all-MiniLM-L6-v2** | 90MB | Embeddings | Essential for RAG |
| **bart-large-mnli** | 500MB | Zero-shot classification | Intent detection |

**Total bundled size:** ~5GB (optional, can download on demand)

### 2.2 Bundle Distribution

```bash
# Models are stored in Hivemind's .dev/models/ during build
hivemind/.dev/models/
├── deepseek-coder-1.3b.Q4_K_M.gguf
├── phi-2.Q4_K_M.gguf
├── tinyllama-1.1b.Q4_K_M.gguf
├── all-MiniLM-L6-v2/
└── bart-large-mnli/

# During first run, copy to ~/.local/share/models/
# Or download on demand if not present
```

### 2.3 Model Download Command

```bash
# List available models (built-in + remote)
hivemind model list

# Download a model (if not already cached)
hivemind model pull deepseek-coder-1.3b

# Use a specific model for generation
hivemind generate "Fibonacci" --model deepseek-coder-1.3b
```

## Phase 3: Hivemind Model Router with Local Awareness

### 3.1 Model Router Implementation

**File:** `hivemind/src/router/local-models.ts`

```typescript
export interface ModelCapability {
    name: string;
    tasks: string[];
    quality: number;      // 0-1
    speed: number;        // 0-1 (higher = faster)
    cost: number;         // USD per 1M tokens (0 for local)
    memory_mb: number;
    offline: boolean;
}

export class LocalModelRegistry {
    private models: Map<string, ModelCapability> = new Map();
    
    constructor(private sonic: SonicClient) {}
    
    async refresh(): Promise<void> {
        // Get models from Sonic's Ollama
        const ollamaModels = await this.sonic.listLocalModels();
        
        // Add built-in models from registry
        const builtin = await this.loadBuiltinRegistry();
        
        for (const model of [...ollamaModels, ...builtin]) {
            this.models.set(model.name, model);
        }
    }
    
    async selectBestModel(task: string, constraints: {
        max_memory_mb?: number;
        min_quality?: number;
        prefer_offline?: boolean;
        max_cost?: number;
    }): Promise<ModelCapability | null> {
        let candidates = Array.from(this.models.values())
            .filter(m => m.tasks.includes(task));
        
        if (constraints.min_quality) {
            candidates = candidates.filter(m => m.quality >= constraints.min_quality);
        }
        if (constraints.max_memory_mb) {
            candidates = candidates.filter(m => m.memory_mb <= constraints.max_memory_mb);
        }
        if (constraints.prefer_offline) {
            candidates = candidates.filter(m => m.offline);
        }
        if (constraints.max_cost !== undefined) {
            candidates = candidates.filter(m => m.cost <= constraints.max_cost);
        }
        
        // Sort by quality/speed tradeoff
        candidates.sort((a, b) => {
            const scoreA = a.quality * a.speed;
            const scoreB = b.quality * b.speed;
            return scoreB - scoreA;
        });
        
        return candidates[0] || null;
    }
}
```

### 3.2 Integrated Router Decision

**File:** `hivemind/src/router/index.ts` (updated)

```typescript
export class Router {
    private localRegistry: LocalModelRegistry;
    
    constructor(private sonic: SonicClient) {
        this.localRegistry = new LocalModelRegistry(sonic);
        await this.localRegistry.refresh();
    }
    
    async decide(request: {
        prompt: string;
        taskType?: string;
        maxBudget?: number;
        preferOffline?: boolean;
    }): Promise<Decision> {
        const task = request.taskType || this.classifyTask(request.prompt);
        
        // 1. Try local models first (free, offline)
        if (request.preferOffline !== false) {  // default true
            const localModel = await this.localRegistry.selectBestModel(task, {
                min_quality: 0.6,
                prefer_offline: true,
                max_cost: 0  // free
            });
            
            if (localModel) {
                return {
                    type: 'local',
                    model: localModel.name,
                    provider: 'ollama',
                    cost: 0,
                    endpoint: `http://sonic.local:11434/api/generate`
                };
            }
        }
        
        // 2. Check budget for cloud models
        const remainingBudget = await this.getRemainingBudget();
        if (remainingBudget < (request.maxBudget || 0.01)) {
            // No budget left, force local even if lower quality
            const anyLocal = await this.localRegistry.selectBestModel(task, {});
            if (anyLocal) {
                return {
                    type: 'local',
                    model: anyLocal.name,
                    provider: 'ollama',
                    cost: 0,
                    warning: 'Budget exhausted, using local model'
                };
            }
        }
        
        // 3. Cloud models (cheapest first)
        const cloudModels = [
            { provider: 'deepseek', costPer1M: 0.14, quality: 0.85 },
            { provider: 'gemini-flash', costPer1M: 0.25, quality: 0.88 },
            { provider: 'openrouter/claude', costPer1M: 3.00, quality: 0.95 }
        ];
        
        for (const cloud of cloudModels) {
            const estimatedCost = this.estimateCost(request.prompt, cloud.costPer1M);
            if (estimatedCost <= (request.maxBudget || Infinity)) {
                return {
                    type: 'cloud',
                    provider: cloud.provider,
                    model: cloud.provider,
                    cost: estimatedCost,
                    quality: cloud.quality
                };
            }
        }
        
        // 4. Fallback to lowest quality local
        const fallback = await this.localRegistry.selectBestModel(task, {});
        return {
            type: 'local',
            model: fallback?.name || 'tinyllama-1.1b',
            provider: 'ollama',
            cost: 0,
            warning: 'No suitable cloud model within budget, using local fallback'
        };
    }
    
    private classifyTask(prompt: string): string {
        if (prompt.match(/code|function|class|generate|write.*program|implement/i)) {
            return 'code_generation';
        }
        if (prompt.match(/explain|what is|how does|describe/i)) {
            return 'explanation';
        }
        if (prompt.match(/summarize|brief|tl;dr/i)) {
            return 'summarization';
        }
        if (prompt.match(/classify|categorize|sentiment/i)) {
            return 'classification';
        }
        return 'chat';
    }
}
```

## Phase 4: Task-Specific Fine-Tuned Models

### 4.1 Model Fine-Tuning Pipeline (Future)

```bash
# Train a small intent classifier
hivemind train intent-classifier \
  --data ~/vault/datasets/intents.jsonl \
  --model microsoft/phi-2 \
  --output ~/.local/share/models/classification/intent-detector

# Train code summarizer
hivemind train code-summarizer \
  --data ~/vault/datasets/code-summaries.jsonl \
  --model deepseek-coder-1.3b \
  --output ~/.local/share/models/code/summarizer
```

### 4.2 Model Export for Distribution

```bash
# Package a model for distribution with Hivemind
hivemind model package intent-detector \
  --output ./dist/models/intent-detector.gguf

# This model can be included in future Hivemind releases
```

## Phase 5: Offline-First User Experience

### 5.1 Hivemind Commands for Local Models

```bash
# List all available local models
hivemind model list

# Show details of a specific model
hivemind model show deepseek-coder-1.3b

# Download a model (if not cached)
hivemind model pull llama3.2-3b

# Remove a model to free space
hivemind model rm tinyllama-1.1b

# Set default model for a task type
hivemind model set-default code_generation deepseek-coder-1.3b

# Compare two models on a prompt
hivemind model compare deepseek-coder-1.3b tinyllama-1.1b --prompt "Fibonacci"

# Force offline mode (no cloud calls)
hivemind config set offline-mode true
```

### 5.2 Offline Mode Behavior

```bash
$ hivemind generate "Explain quantum computing" --offline
🔒 Offline mode: using local model llama3.2-3b
💡 Response: Quantum computing uses qubits...
💰 Cost: $0.00
```

### 5.3 Graceful Degradation

```yaml
fallback_chain:
  1. Try requested model
  2. If fails, try best local model for task
  3. If fails, try tinyllama (smallest)
  4. If fails, return error with instructions to install models
```

## Phase 6: Model Caching & Performance

### 6.1 Model Loading Strategy

```typescript
class ModelCache {
    private loadedModels: Map<string, any> = new Map();
    private loadingPromises: Map<string, Promise<any>> = new Map();
    
    async getModel(name: string): Promise<any> {
        // Check if already loaded
        if (this.loadedModels.has(name)) {
            return this.loadedModels.get(name);
        }
        
        // Check if currently loading
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }
        
        // Load model
        const promise = this.loadModel(name);
        this.loadingPromises.set(name, promise);
        
        try {
            const model = await promise;
            this.loadedModels.set(name, model);
            return model;
        } finally {
            this.loadingPromises.delete(name);
        }
    }
    
    async loadModel(name: string): Promise<any> {
        // Ask Sonic to load the model via Ollama
        return await this.sonic.loadModel(name);
    }
    
    unloadModel(name: string): void {
        this.loadedModels.delete(name);
        // Tell Sonic to unload
        this.sonic.unloadModel(name);
    }
}
```

### 6.2 Keep-Alive for Frequently Used Models

```yaml
# .dev/config/hivemind.yaml
models:
  keep_alive:
    - deepseek-coder-1.3b
    - all-MiniLM-L6-v2
  unload_after_seconds: 300
```

## Phase 7: Integration with Existing Hivemind API

### 7.1 Updated API Endpoints

```typescript
// POST /api/generate - now uses local models intelligently
app.post('/api/generate', async (req, res) => {
    const { prompt, model, prefer_offline = true, max_budget } = req.body;
    
    const decision = await router.decide({
        prompt,
        taskType: req.body.task_type,
        maxBudget: max_budget,
        preferOffline: prefer_offline
    });
    
    let result;
    if (decision.type === 'local') {
        result = await sonic.callLocalModel(decision.model, prompt);
    } else {
        const apiKey = await sonic.getSecret(`${decision.provider}_api_key`);
        result = await sonic.callCloudModel(decision.provider, prompt, apiKey);
    }
    
    res.json({ result, decision });
});

// GET /api/models - list available local models
app.get('/api/models', async (req, res) => {
    const models = await localRegistry.list();
    res.json({ models });
});

// POST /api/models/load - preload a model
app.post('/api/models/load', async (req, res) => {
    const { model } = req.body;
    await modelCache.getModel(model);
    res.json({ status: 'loaded' });
});
```

## Success Criteria

- [ ] Hivemind can run completely offline using local models
- [ ] Built-in models (deepseek-coder-1.3b, tinyllama, phi-2) are packaged
- [ ] Model router prefers local when budget is low or offline mode enabled
- [ ] `hivemind model` commands work for list, pull, show, rm
- [ ] Task classification works for code, chat, explanation, classification
- [ ] Graceful fallback when local model unavailable
- [ ] Model caching prevents redundant loads

## Benefits

1. **Offline capability** – Full functionality without internet
2. **Cost savings** – Use free local models when possible
3. **Privacy** – No data leaves the local machine
4. **Performance** – Local models respond faster
5. **Reliability** – Works in restricted environments
6. **Flexibility** – Mix local and cloud as needed

## Risks and Mitigations

### Risk: Large Model Sizes
**Mitigation:**
- Use quantized models (Q4_K_M)
- Allow selective installation
- Provide download on demand

### Risk: Model Loading Time
**Mitigation:**
- Implement model caching
- Keep frequently used models loaded
- Show loading progress

### Risk: Quality Gap vs Cloud
**Mitigation:**
- Use task-specific models
- Implement fallback to cloud when needed
- Allow user to force cloud for critical tasks

### Risk: Outdated Models
**Mitigation:**
- Provide update mechanism
- Show model versions
- Allow easy upgrades

## Conclusion

This local model integration makes Hivemind truly independent – able to run entirely offline with its own intelligence, while still able to leverage cloud APIs when beneficial. The intelligent router ensures the best model is used for each task, balancing quality, cost, and availability.

**Next Steps:**
1. Package built-in models with Hivemind
2. Implement local model registry
3. Update router logic
4. Add CLI commands
5. Test offline operation

This completes the vision of Hivemind as a self-sufficient intelligence layer.
