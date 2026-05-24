# uCode1 + uCode3 Integration Guide

> **Last Updated:** 2026-05-24  
> **Status:** ✅ Active  
> **Applies to:** uCode1 (Python core) ↔ uCode3 (Rust performance layer), @udos/core (Oracle Trinity), uServer (Snackbar LLM Proxy)

## Overview

This guide documents how uCode1 (Python) and uCode3 (Rust) integrate to form a hybrid architecture. The Python core handles rapid development and 80% of use cases, while Rust components provide performance-critical optimizations via FFI bindings.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    uCode1 (Python Core)                       │
│  snack/  relic/  binder/  usxd/  integration/                │
│                    │                                          │
│                    ▼                                          │
│              integration/ffi.py  ◄── pyo3 bindings            │
│                    │                                          │
└────────────────────┼──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    uCode3 (Rust Performance)                   │
│  core/src/  snack/  relic/  binder/  usxd/  ffi/             │
└─────────────────────────────────────────────────────────────┘
```

## When to Use Python vs Rust

### Use Python (uCode1) When:

| Scenario | Example |
|----------|---------|
| Business logic & application flow | Workflow orchestration, user input handling |
| Glue code & integration layers | API wrappers, data format conversion |
| Prototyping & rapid development | New features, experimental components |
| I/O-bound operations | File reads, network requests, database queries |
| Non-performance-critical paths | Configuration parsing, logging, reporting |

### Use Rust (uCode3) When:

| Scenario | Example |
|----------|---------|
| Performance-critical algorithms | Grid transformations, teletext rendering |
| Memory-intensive operations | Large dataset processing, batch operations |
| Binary data processing | Serialization/deserialization of binary formats |
| Real-time processing | Audio/video processing, game loop |
| Hot paths identified by profiling | Operations taking >100ms in Python |

## FFI Bridge Setup

### Prerequisites

```bash
# Python side
pip install maturin  # Rust-Python binding builder

# Rust side
rustup target add x86_64-apple-darwin  # or aarch64 for Apple Silicon
```

### Building the Bridge

```bash
# From uCode3 directory
cd ~/Code/uCode3

# Build Python bindings
maturin develop --release  # Installs into current Python env

# Or build a wheel
maturin build --release
pip install target/wheels/ucode3-*.whl
```

### Python Usage

```python
# Import Rust components (optional — falls back to Python)
try:
    from ucode3.ffi import RustGridParser, RustSnackExecutor
    HAS_RUST = True
except ImportError:
    from ucode1.core_py.grid import GridParser as RustGridParser
    from ucode1.core_py.snack import SnackExecutor as RustSnackExecutor
    HAS_RUST = False

# Use the component (same API regardless of backend)
parser = RustGridParser()
result = parser.parse("fixtures/grid_40x25.txt")
```

## Shared Type Definitions

Types that cross the Python/Rust boundary must be defined in both languages with identical structure:

### Grid Types

```python
# Python (uCode1/core_py/grid/types.py)
@dataclass
class GridCell:
    char: str
    fg_color: str
    bg_color: str
    bold: bool = False

@dataclass
class Grid:
    cells: list[list[GridCell]]
    width: int
    height: int
```

```rust
// Rust (uCode3/core/src/grid/types.rs)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GridCell {
    pub char: String,
    pub fg_color: String,
    pub bg_color: String,
    pub bold: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Grid {
    pub cells: Vec<Vec<GridCell>>,
    pub width: usize,
    pub height: usize,
}
```

### Snack Types

```python
# Python
@dataclass
class Snack:
    name: str
    version: str
    command: str
    dependencies: list[str]
```

```rust
// Rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snack {
    pub name: String,
    pub version: String,
    pub command: String,
    pub dependencies: Vec<String>,
}
```

## Build System

### Development Build

```bash
# Terminal 1: Python dev server
cd ~/Code/uCode1
source .venv/bin/activate
pip install -e .
python -m ucode1.dev

# Terminal 2: Rust compilation (when needed)
cd ~/Code/uCode3
cargo build
maturin develop --release
```

### CI/CD Pipeline

```yaml
# .github/workflows/hybrid-build.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: uDosGo/uCode3
      
      - name: Build Rust components
        run: |
          cargo build --release
          maturin build --release
      
      - name: Upload Python wheel
        uses: actions/upload-artifact@v4
        with:
          name: ucode3-wheel
          path: target/wheels/*.whl
```

## Testing Across Language Boundaries

### Python Test Suite

```python
# tests/test_grid_parser.py
import pytest
from ucode1.core_py.grid import GridParser

def test_parse_simple_grid():
    parser = GridParser()
    grid = parser.parse("fixtures/grid_10x10.txt")
    assert grid.width == 10
    assert grid.height == 10
```

### Rust Test Suite

```rust
// tests/grid_parser_test.rs
#[cfg(test)]
mod tests {
    use ucode3::grid::GridParser;

    #[test]
    fn test_parse_simple_grid() {
        let parser = GridParser::new();
        let grid = parser.parse("fixtures/grid_10x10.txt").unwrap();
        assert_eq!(grid.width, 10);
        assert_eq!(grid.height, 10);
    }
}
```

### Cross-Language Integration Tests

```python
# tests/test_hybrid.py
"""Tests that verify Python and Rust implementations produce identical results."""

import pytest
from ucode1.core_py.grid import GridParser as PyGridParser

try:
    from ucode3.ffi import GridParser as RustGridParser
    HAS_RUST = True
except ImportError:
    HAS_RUST = False

@pytest.mark.skipif(not HAS_RUST, reason="Rust components not built")
def test_parsers_produce_same_output():
    py_parser = PyGridParser()
    rust_parser = RustGridParser()
    
    py_result = py_parser.parse("fixtures/grid_40x25.txt")
    rust_result = rust_parser.parse("fixtures/grid_40x25.txt")
    
    assert py_result.width == rust_result.width
    assert py_result.height == rust_result.height
    assert py_result.cells == rust_result.cells
```

## Performance Benchmarking

Use the `udo bench` command to compare Python vs Rust performance:

```bash
# Run all benchmarks
node scripts/udos.js bench

# Run specific category
node scripts/udos.js bench --category parsing

# Output as JSON for analysis
node scripts/udos.js bench --json > bench-results.json
```

### Benchmark Results Interpretation

| Ratio | Meaning |
|-------|---------|
| < 0.8 | Rust is significantly faster |
| 0.8 - 1.2 | Comparable performance |
| > 1.2 | Python is faster (unusual — investigate) |

## Migration Path

### Step 1: Implement in Python
```python
# uCode1/core_py/feature.py
class NewFeature:
    def process(self, data):
        # Python implementation
        return [item.upper() for item in data]
```

### Step 2: Profile and Identify Hot Paths
```bash
python -m cProfile -o profile.stats my_script.py
python -c "import pstats; p = pstats.Stats('profile.stats'); p.sort_stats('time').print_stats(20)"
```

### Step 3: Move Hot Paths to Rust
```rust
// uCode3/core/src/feature.rs
use pyo3::prelude::*;

#[pyclass]
pub struct RustFeature;

#[pymethods]
impl RustFeature {
    fn process(&self, data: Vec<String>) -> Vec<String> {
        data.into_iter()
            .map(|s| s.to_uppercase())
            .collect()
    }
}

#[pymodule]
fn ucode3_ffi(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<RustFeature>()?;
    Ok(())
}
```

### Step 4: Create Python Fallback
```python
# uCode1/core_py/integration/feature.py
try:
    from ucode3.ffi import RustFeature as Feature
except ImportError:
    from ucode1.core_py.feature import NewFeature as Feature
```

## Troubleshooting

### FFI ImportError
```bash
# Ensure Rust bindings are built for the correct Python version
maturin develop --release  # Rebuild
python -c "from ucode3.ffi import *"  # Test import
```

### Performance Regression
```bash
# Run benchmarks before and after changes
node scripts/udos.js bench --json > before.json
# ... make changes ...
node scripts/udos.js bench --json > after.json
# Compare
```

### Type Mismatch
Ensure serialization formats match between Python and Rust. Use JSON for complex types:
```python
import json
# Python → JSON → Rust
json_str = json.dumps(python_object)
rust_object = rust_parser.parse_json(json_str)
```

## Oracle Trinity Integration

### Overview

The Oracle Trinity (`@udos/core/oracle.ts`) provides three specialized AI oracles that integrate with the existing agent, skill, task, and automation systems. Each oracle is registered as both an Agent and a Skill.

### Oracle Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OracleConductor (Hivemind)                 │
│                                                              │
│  Receives query → determines domain(s) → routes to oracles   │
│  → merges responses → returns unified answer                 │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │Knowledge │ │ Creation │ │ Insight  │                     │
│  │ Oracle   │ │ Oracle   │ │ Oracle   │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│         │            │            │                          │
│         ▼            ▼            ▼                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Provider Router                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │  Remote  │ │  Local   │ │  Fallback│              │   │
│  │  │ (uServer)│ │ (Ollama) │ │ (Tiny)   │              │   │
│  │  └──────────┘ └──────────┘ └──────────┘              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

#### 1. Agent System

Each oracle is registered as an Agent with its own instruction set:

```typescript
// From oracle.ts — registerOracleAgents()
const oracleAgents: Agent[] = [
  {
    id: 'oracle-knowledge',
    name: 'Oracle of Knowledge',
    instruction: {
      system_prompt: 'You are the Oracle of Knowledge...',
      tools: ['oracle-knowledge', 'vault-read', 'vault-list', 'mcp-list'],
      models: ['deepseek-coder', 'claude-sonnet'],
      fallback: 'basic-llm',
    },
    status: 'idle',
    surface: 'ucode1',
  },
  // ... creation, insight
]
```

**CLI usage:**
```bash
udo agent list                    # Shows oracle-knowledge, oracle-creation, oracle-insight
udo agent call oracle-knowledge --prompt "What is in the vault?"
```

#### 2. Skill System

Each oracle is registered as a Skill with typed inputs/outputs:

```typescript
// From oracle.ts — registerOracleSkills()
{
  name: 'oracle-knowledge',
  type: 'skill',
  inputs: {
    query: { type: 'string', required: true, description: 'Question or search query' },
    context: { type: 'json', required: false, description: 'Additional context' },
  },
  outputs: {
    answer: { type: 'string', description: 'The oracle response' },
    confidence: { type: 'integer', description: 'Confidence score (0-1)' },
  },
}
```

**CLI usage:**
```bash
udo run oracle-knowledge --params '{"query":"What is in the vault?"}'
```

#### 3. Task System

Oracles can be triggered by task completion:

```json
{
  "id": "task-123",
  "title": "Review code changes",
  "on_complete": {
    "action": "run",
    "skill": "oracle-insight",
    "params": { "query": "Analyze the code changes for patterns" }
  }
}
```

#### 4. Automation System

Oracles can be invoked by cron schedules or event rules:

```typescript
// From automation.ts
{
  name: 'daily-knowledge-sync',
  trigger: { type: 'cron', expression: '0 6 * * *' },
  action: {
    skill: 'oracle-knowledge',
    params: { query: 'Summarize new vault entries from yesterday' },
  },
}
```

#### 5. MCP Bridge

Oracles reference MCP tools for external data access:

| Oracle | MCP Tools Used |
|--------|---------------|
| Knowledge | `vault-read`, `vault-list`, `mcp-list` |
| Creation | `vault-write`, `surface-open`, `mcp-call` |
| Insight | `bench-run`, `task-list`, `vault-read` |

### CLI Commands

```bash
# Ask the oracles (auto-routes to correct domain)
udo oracle ask "What is in the vault?"

# Ask a specific oracle
udo oracle ask --domain creation "Write a poem about code"

# List all oracles
udo oracle list

# Show oracle status
udo oracle status
```

### Provider Router

The Oracle Trinity uses a pluggable provider system defined in `oracle.ts`:

```typescript
export interface LLMProviderConfig {
  type: 'openai' | 'anthropic' | 'deepseek' | 'local'
  model: string
  apiKey?: string
  endpoint?: string
  timeout?: number
}
```

**Provider priority:**
1. `remote` — Routes to uServer Snackbar's Ollama proxy (Linux server)
2. `local` — Routes to local Ollama instance (if installed)
3. `fallback` — Uses the tiny embedded LLM (~100MB, always available)
4. `openai` / `anthropic` / `deepseek` — Cloud API providers (optional)

### Adding a Custom Provider

```typescript
import { registerProvider, type LLMProvider } from './oracle.ts'

const myProvider: LLMProvider = {
  async generate(prompt, systemPrompt, config) {
    const response = await fetch(config.endpoint!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, system: systemPrompt, model: config.model }),
    })
    const data = await response.json()
    return { text: data.response, tokens_used: data.usage?.total_tokens }
  },
}

registerProvider('my-custom', myProvider)
```

## Centralized LLM Architecture (Phase 9)

### Design Principle

All large language models run on the **Linux server** via Ollama. Local machines (macOS/Linux) use a tiny fallback LLM (~100MB) for offline/basic operations. The uServer Snackbar acts as an LLM proxy.

### Server Setup (Linux)

```bash
# 1. Install Ollama on the Linux server
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull models
ollama pull deepseek-coder:33b
ollama pull llama3:70b
ollama pull mistral:7b
ollama pull codellama:34b

# 3. Verify Ollama is running
curl http://localhost:11434/api/tags

# 4. uServer Snackbar auto-discovers Ollama on startup
# The Snackbar's MCP server exposes LLM tools at :8484
```

### Client Configuration (macOS/Linux)

```yaml
# ~/.config/udos/config.yaml
oracle:
  default_provider: remote  # Use Linux server by default
  providers:
    remote:
      type: ollama
      endpoint: http://linux-server:11434  # Your Linux server's address
      default_model: deepseek-coder:33b
    local:
      type: ollama
      endpoint: http://localhost:11434
      default_model: mistral:7b
    fallback:
      type: embedded
      model: tiny-llm  # ~100MB, distributed with @udos/core
```

### LLM Proxy Features (uServer Snackbar)

The Snackbar on the Linux server provides:

1. **Model Routing**: Routes queries to the appropriate model based on oracle domain
   - Knowledge → `deepseek-coder:33b` (reasoning)
   - Creation → `llama3:70b` (creative writing)
   - Insight → `mistral:7b` (pattern analysis)

2. **Response Caching**: Caches LLM responses keyed by `(model, prompt_hash)` to avoid redundant calls

3. **Rate Limiting**: Prevents resource exhaustion with configurable limits per client

4. **Request Queuing**: Fair scheduling across multiple clients

### Tiny Fallback LLM

The fallback LLM is a distilled model (~100MB) that ships with `@udos/core`:

```bash
# Location
packages/udos/providers/fallback/model.bin

# Capabilities
- Basic pattern matching
- Keyword extraction
- Simple Q&A templates
- Offline operation
- < 50ms response time
```

It is used when:
- The Linux server is unreachable
- Network latency is too high
- The query is simple enough for local processing
- All other providers are unavailable

## References

- [CORE_ARCHITECTURE.md](CORE_ARCHITECTURE.md) — Version boundaries and ADRs, Oracle Trinity, Centralized LLM architecture
- [USX Specs](../uCode1/docs/specs/usx/) — Surface format specifications
- [UDO Specs](../uCode1/docs/specs/udo/) — Document format specifications
- [Pyo3 Documentation](https://pyo3.rs/) — Rust-Python bindings
- [Maturin Guide](https://maturin.rs/) — Building and publishing Rust-Python packages
- [Ollama Documentation](https://github.com/ollama/ollama) — Local LLM runtime
- [uServer Snackbar](../uServer/snackbar/) — LLM proxy and MCP server
