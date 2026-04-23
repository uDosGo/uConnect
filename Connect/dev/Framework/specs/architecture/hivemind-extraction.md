# 🧠 Hivemind Extraction Specification

**Status:** Proposed
**Last Updated:** 2025-04-22
**Author:** @fredporter

## Overview

This specification defines the extraction of intelligence-related code from uDosConnect into a standalone Hivemind repository, transforming uDosConnect into a thin domain-specific CLI that calls Hivemind via API.

## Mission

**Extract all intelligence-related code** from `~/code-vault/uDosConnect/` into a new standalone repository `~/code-vault/hivemind/`, leaving uDosConnect as a thin domain-specific CLI that calls Hivemind via API.

## Architecture

### Before Extraction

```
uDosConnect (Monolithic)
├── core/
│   ├── orchestrator/  (intelligence)
│   ├── swarm/         (intelligence)
│   ├── feed/          (intelligence)
│   ├── rag/           (intelligence)
│   ├── quality/       (intelligence)
│   ├── budget/        (intelligence)
│   ├── agents/        (intelligence)
│   └── commands/     (CLI - stays)
├── src/
│   ├── vault/         (domain - stays)
│   └── domain/        (domain - stays)
└── core-rs/           (moves to Sonic)
```

### After Extraction

```
Hivemind (Intelligence Layer)
├── src/
│   ├── router/        (from orchestrator)
│   ├── swarm/         (multi-agent)
│   ├── feed/          (memory)
│   ├── rag/           (vector search)
│   ├── quality/       (scoring)
│   ├── budget/        (cost tracking)
│   ├── agents/        (definitions)
│   └── api/           (HTTP server)
├── tests/
│   ├── unit/
│   └── integration/
└── .dev/
    ├── agents/
    └── flows/

uDosConnect (Thin CLI)
├── src/
│   ├── commands/     (calls Hivemind API)
│   ├── vault/         (domain-specific)
│   └── domain/        (business logic)
└── (no intelligence code)

Sonic-Screwdriver (API Hub)
└── services/
    ├── mcp-server/    (from core-rs)
    ├── feed-engine/   (from core-rs)
    └── vector-db/      (from core-rs)
```

## Source to Target Mapping

### Files to Extract

| Source Path | Target Path | Description |
|-------------|-------------|-------------|
| `core/src/orchestrator/` | `src/router/` | Model selection, budget routing, fallback logic |
| `core/src/swarm/` | `src/swarm/` | Multi-agent task decomposition, parallel execution |
| `core/src/feed/` | `src/feed/` | Reply memory, thread management, context |
| `core/src/rag/` | `src/rag/` | Vector search, embeddings, similarity |
| `core/src/quality/` | `src/quality/` | Confidence scoring, quality synthesis |
| `core/src/budget/` | `src/budget/` | Cost tracking, daily/monthly limits |
| `core/src/agents/` | `src/agents/` | Agent definitions (VibeCLI, DSC2, etc.) |
| `core/src/mcp/client.ts` | `src/sonic-client.ts` | Client for calling Sonic API |

### Files to Leave in uDosConnect

| Path | Reason |
|------|--------|
| `src/commands/*.ts` | CLI commands (now call Hivemind API) |
| `src/vault/*.ts` | Vault integration (domain-specific) |
| `src/domain/*.ts` | uDos business logic |
| `core-rs/` | MCP server (moves to Sonic, not Hivemind) |

## Step-by-Step Extraction Process

### Step 1: Create Hivemind Repository

```bash
cd ~/code-vault
mkdir hivemind
cd hivemind

# Initialize from uDevFramework
udev init . --layers base-node --flavour linux-mint

# Create directory structure
mkdir -p src/{router,swarm,feed,rag,quality,budget,agents,api}
mkdir -p tests/unit tests/integration
mkdir -p .dev/agents .dev/flows
```

### Step 2: Copy Intelligence Code

```bash
# Copy orchestrator (router logic)
cp -r ../uDosConnect/core/src/orchestrator/* src/router/

# Copy swarm
cp -r ../uDosConnect/core/src/swarm/* src/swarm/

# Copy feed
cp -r ../uDosConnect/core/src/feed/* src/feed/

# Copy RAG
cp -r ../uDosConnect/core/src/rag/* src/rag/

# Copy quality
cp -r ../uDosConnect/core/src/quality/* src/quality/

# Copy budget
cp -r ../uDosConnect/core/src/budget/* src/budget/

# Copy agents
cp -r ../uDosConnect/core/src/agents/* src/agents/
```

### Step 3: Create Sonic Client

**File:** `src/sonic-client.ts`

```typescript
export interface SonicClientConfig {
    endpoint: string;  // e.g., http://sonic.local:3010
    token: string;
}

export class SonicClient {
    constructor(private config: SonicClientConfig) {}

    async getSecret(name: string): Promise<string> {
        const res = await fetch(`${this.config.endpoint}/api/secrets/${name}`, {
            headers: { Authorization: `Bearer ${this.config.token}` }
        });
        const data = await res.json();
        return data.value;
    }

    async callLocalModel(model: string, prompt: string): Promise<string> {
        const res = await fetch(`http://sonic.local:11434/api/generate`, {
            method: 'POST',
            body: JSON.stringify({ model, prompt, stream: false })
        });
        const data = await res.json();
        return data.response;
    }

    async callCloudModel(provider: string, prompt: string, apiKey: string): Promise<string> {
        const res = await fetch(`${this.config.endpoint}/api/proxy/${provider}`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${this.config.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, api_key: apiKey })
        });
        const data = await res.json();
        return data.response;
    }

    async listLocalModels(): Promise<string[]> {
        const res = await fetch(`http://sonic.local:11434/api/tags`);
        const data = await res.json();
        return data.models?.map((m: any) => m.name) || [];
    }
}
```

### Step 4: Create Hivemind API Server

**File:** `src/api/server.ts`

```typescript
import express from 'express';
import { Router } from '../router/index.js';
import { SwarmOrchestrator } from '../swarm/index.js';
import { FeedManager } from '../feed/index.js';
import { RAGEngine } from '../rag/index.js';
import { SonicClient } from '../sonic-client.js';

const app = express();
app.use(express.json());

// Initialize components
const sonic = new SonicClient({
    endpoint: process.env.SONIC_ENDPOINT || 'http://sonic.local:3010',
    token: process.env.SONIC_TOKEN || ''
});

const router = new Router(sonic);
const swarm = new SwarmOrchestrator(sonic);
const feed = new FeedManager();
const rag = new RAGEngine();

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

// Generate endpoint (single model inference)
app.post('/api/generate', async (req, res) => {
    const { prompt, model_hint, max_budget, task_type } = req.body;
    
    try {
        const decision = await router.decide({
            prompt,
            modelHint: model_hint,
            maxBudget: max_budget,
            taskType: task_type || 'general',
            availableModels: await sonic.listLocalModels()
        });
        
        let result: string;
        if (decision.type === 'local') {
            result = await sonic.callLocalModel(decision.model, prompt);
        } else {
            const apiKey = await sonic.getSecret(`${decision.provider}_api_key`);
            result = await sonic.callCloudModel(decision.provider, prompt, apiKey);
        }
        
        // Store in feed
        const replyId = await feed.add({
            prompt,
            output: result,
            model: decision.model || decision.provider,
            cost: decision.cost,
            timestamp: new Date()
        });
        
        res.json({ result, reply_id: replyId, decision });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Swarm endpoint (multi-agent)
app.post('/api/swarm', async (req, res) => {
    const { goal, agents, max_budget } = req.body;
    
    const result = await swarm.orchestrate({
        goal,
        agents: agents || ['dsc2', 'gemini', 'openrouter'],
        maxBudget: max_budget,
        sonicClient: sonic
    });
    
    res.json(result);
});

// RAG search
app.post('/api/rag/search', async (req, res) => {
    const { query, top_k } = req.body;
    const results = await rag.search(query, top_k || 5);
    res.json({ results });
});

// Feed endpoints
app.get('/api/feed/recent', async (req, res) => {
    const { limit, thread_id } = req.query;
    const replies = await feed.getRecent(
        parseInt(limit as string) || 50,
        thread_id as string
    );
    res.json({ replies });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🧠 Hivemind API listening on port ${PORT}`);
});
```

### Step 5: Update uDosConnect to Call Hivemind

**File:** `~/code-vault/uDosConnect/src/commands/generate.ts` (rewritten)

```typescript
// BEFORE: local intelligence
// import { dsc2 } from '../agents/dsc2.js';

// AFTER: call Hivemind API
import fetch from 'node-fetch';

export async function generateCommand(prompt: string, options: any) {
    const response = await fetch('http://hivemind.local:3002/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt,
            task_type: 'code_generation',
            max_budget: options.budget || 0.05
        })
    });
    
    const data = await response.json();
    
    if (options.save) {
        await fs.writeFile(options.save, data.result);
        console.log(`✅ Saved to ${options.save}`);
    } else {
        console.log(data.result);
    }
    
    console.log(`📝 Reply ID: ${data.reply_id}`);
    console.log(`💰 Cost: $${data.decision.cost}`);
}
```

### Step 6: Update uDosConnect Package.json

```json
{
  "dependencies": {
    "node-fetch": "^3.3.0"
  }
}
```

### Step 7: Create Hivemind Dev Configuration

**File:** `.dev/agents/hivemind.agent.yaml`

```yaml
name: hivemind
type: api
endpoint: http://localhost:3002
capabilities:
  - generate
  - swarm
  - rag_search
  - feed_query
health_check: /health
timeout: 30000
```

## Verification Steps

### 1. Start Hivemind

```bash
cd ~/code-vault/hivemind
npm install
npm run build
npm start
# 🧠 Hivemind API listening on port 3002
```

### 2. Test Hivemind Directly

```bash
curl -X POST http://localhost:3002/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Write a fibonacci function"}'
```

### 3. Test uDosConnect (now thin)

```bash
cd ~/code-vault/uDosConnect
npm run build
udo code generate "Write a fibonacci function"
# Should call Hivemind and return result
```

### 4. Verify No Intelligence Left in uDosConnect

```bash
grep -r "orchestrator\|swarm\|feed\|rag" ~/code-vault/uDosConnect/src --include="*.ts"
# Should return few or no results (only imports)
```

## Success Criteria

- [ ] Hivemind repo created with all intelligence code
- [ ] Hivemind API server responds to `/api/generate`
- [ ] Hivemind can route to local Ollama models (via Sonic)
- [ ] Hivemind can route to cloud APIs (via Sonic secrets)
- [ ] uDosConnect `code generate` calls Hivemind API
- [ ] uDosConnect no longer has local intelligence code
- [ ] Feed, RAG, Swarm all work through Hivemind API

## Cleanup After Extraction

```bash
# Remove intelligence code from uDosConnect
cd ~/code-vault/uDosConnect
rm -rf core/src/orchestrator/
rm -rf core/src/swarm/
rm -rf core/src/feed/
rm -rf core/src/rag/
rm -rf core/src/quality/
rm -rf core/src/budget/
rm -rf core/src/agents/

# Update imports in remaining files
find src -name "*.ts" -exec sed -i 's/from.*orchestrator.*//g' {} \;
```

## API Contract

### Hivemind API Endpoints

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/health` | GET | - | `{status: 'ok', version: string}` |
| `/api/generate` | POST | `{prompt, model_hint?, max_budget?, task_type?}` | `{result, reply_id, decision}` |
| `/api/swarm` | POST | `{goal, agents?, max_budget?}` | `{result, steps, cost}` |
| `/api/rag/search` | POST | `{query, top_k?}` | `{results: {text, score, source}[]}` |
| `/api/feed/recent` | GET | `?limit=50&thread_id=abc` | `{replies: Reply[]}` |

### Decision Object (from /api/generate)

```typescript
interface Decision {
    type: 'local' | 'cloud';
    model?: string;        // for local
    provider?: string;     // for cloud
    cost: number;          // estimated cost
    reason: string;        // why this was chosen
}
```

## Security Considerations

### Authentication
- Hivemind API should require API key
- uDosConnect should authenticate with Hivemind
- Sonic should authenticate Hivemind for secret access

### Data Protection
- No API keys stored in Hivemind
- All secrets fetched from Sonic at runtime
- Feed data should be encrypted at rest

### Rate Limiting
- Implement rate limiting on Hivemind API
- Respect budget limits from requests
- Log all API calls for auditing

## Performance Optimization

### Caching
- Cache local model list
- Cache recent feed queries
- Cache RAG embeddings

### Connection Pooling
- Reuse Sonic connections
- Pool database connections
- Keep WebSocket connections open

### Batching
- Batch multiple RAG queries
- Batch feed updates
- Batch logging

## Monitoring

### Metrics to Track
- Request latency
- Error rates
- Model usage
- Cost per request
- Concurrent connections

### Health Checks
- `/health` endpoint
- Dependency checks (Sonic, DB)
- Model availability

## Deployment Strategy

### Staging
1. Deploy Hivemind to staging
2. Test with sample requests
3. Verify Sonic integration
4. Test uDosConnect calls

### Production
1. Deploy Hivemind
2. Update uDosConnect
3. Monitor for errors
4. Rollback if needed

### Rollback
- Keep old uDosConnect version
- Switch back if Hivemind fails
- Monitor during transition

## Migration Path

### Phase 1: Extract and Test
- Create Hivemind repo
- Copy intelligence code
- Create API server
- Test locally

### Phase 2: Integrate with Sonic
- Create SonicClient
- Test secret fetching
- Test model calls
- Verify rate limiting

### Phase 3: Update uDosConnect
- Change commands to call API
- Remove local intelligence
- Test end-to-end
- Update documentation

### Phase 4: Deploy
- Deploy Hivemind
- Update uDosConnect
- Monitor performance
- Optimize as needed

## Benefits

### For uDosConnect
- **Smaller size**: ~50-100MB instead of ~500MB
- **Simpler code**: Only domain logic
- **Easier maintenance**: Less code to manage
- **Faster startup**: No intelligence to load

### For Hivemind
- **Focused intelligence**: All AI logic in one place
- **Reusable**: Other products can use it
- **Easier to improve**: Centralized intelligence
- **Better monitoring**: Single point for AI metrics

### For the Ecosystem
- **Clear separation**: Domain vs intelligence
- **Better scalability**: Hivemind can scale independently
- **Faster innovation**: Improve intelligence once
- **Consistent behavior**: All products use same AI

## Risks and Mitigations

### Risk: Network Dependency
**Mitigation:**
- Implement local fallback
- Cache common responses
- Retry failed requests

### Risk: Performance Overhead
**Mitigation:**
- Optimize API calls
- Use connection pooling
- Implement caching

### Risk: Complex Debugging
**Mitigation:**
- Unified logging
- Distributed tracing
- Detailed error responses

### Risk: Version Mismatch
**Mitigation:**
- API versioning
- Backward compatibility
- Clear upgrade path

## Conclusion

Extracting intelligence from uDosConnect into Hivemind provides significant benefits:
- **Lighter uDosConnect**: Focused on domain logic
- **Reusable intelligence**: Hivemind for all products
- **Better separation**: Clear boundaries
- **Easier maintenance**: Centralized AI improvements

This extraction aligns with the hybrid architecture and enables the creation of new products that can leverage the same intelligence layer.
