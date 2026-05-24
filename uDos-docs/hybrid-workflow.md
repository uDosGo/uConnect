# Hybrid Development Workflow

> **Last Updated:** 2026-05-24  
> **Status:** ✅ Active  
> **Applies to:** All uDos developers working across Python/Rust boundary

## Overview

This guide describes the recommended workflow for developing across the uDos hybrid Python/Rust architecture. It covers environment setup, the development loop, profiling, optimization, and CI/CD.

## Development Philosophy

**Python-first, Rust-when-needed.** The goal is to maximize development velocity while maintaining performance where it matters.

```
1. Prototype in Python  ──►  2. Profile & identify hot paths
         │                              │
         ▼                              ▼
3. Ship with Python         4. Move hot paths to Rust
         │                              │
         └─────────── 5. Benchmark & verify ──────────┘
```

## Environment Setup

### Prerequisites

```bash
# Python 3.11+
python3 --version  # Should be 3.11+

# Rust toolchain
rustup show         # Should be 1.89.0+

# Node.js (for uConnect surfaces)
node --version      # Should be 18+
```

### One-Time Setup

```bash
# 1. Clone all repos
cd ~/Code
git clone git@github.com:uDosGo/uConnect.git
git clone git@github.com:uDosGo/uCode1.git
git clone git@github.com:uDosGo/uCode3.git
git clone git@github.com:uDosGo/uServer.git

# 2. Set up Python environment
cd ~/Code/uCode1
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# 3. Set up Rust toolchain
cd ~/Code/uCode3
cargo build

# 4. Set up uConnect surfaces
cd ~/Code/uConnect
npm install
```

### Daily Setup

```bash
# Terminal 1: Python core
cd ~/Code/uCode1
source .venv/bin/activate

# Terminal 2: uConnect surfaces
cd ~/Code/uConnect
node scripts/udos.js start --all

# Terminal 3: Rust development (when needed)
cd ~/Code/uCode3
cargo watch -x build
```

## The Development Loop

### Step 1: Python-First Implementation

Always start with a Python implementation:

```python
# uCode1/core_py/feature.py
class NewFeature:
    """Implement in Python first — fast iteration."""
    
    def process(self, data: list[str]) -> list[str]:
        return [item.upper() for item in data]
```

### Step 2: Write Tests

```python
# tests/test_feature.py
def test_new_feature():
    feature = NewFeature()
    result = feature.process(["hello", "world"])
    assert result == ["HELLO", "WORLD"]
```

### Step 3: Profile

```bash
# Profile the feature
python -m cProfile -o profile.stats -m pytest tests/test_feature.py

# Analyze results
python -c "
import pstats
p = pstats.Stats('profile.stats')
p.sort_stats('time').print_stats(20)
"
```

### Step 4: Decide on Optimization

Use the decision matrix:

| Metric | Action |
|--------|--------|
| < 10ms per call | Keep Python |
| 10-100ms per call | Consider Rust if called frequently |
| > 100ms per call | Strong candidate for Rust |
| Called 1000+ times | Strong candidate for Rust |

### Step 5: Implement in Rust

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
```

### Step 6: Create Python Fallback

```python
# uCode1/core_py/integration/feature.py
try:
    from ucode3.ffi import RustFeature as Feature
    HAS_RUST = True
except ImportError:
    from ucode1.core_py.feature import NewFeature as Feature
    HAS_RUST = False
```

### Step 7: Benchmark

```bash
# Run benchmarks
node scripts/udos.js bench

# Compare Python vs Rust
node scripts/udos.js bench --json | jq '.results[] | {name, winner, ratio}'
```

## Profiling Tools

### Python Profiling

```bash
# cProfile (built-in)
python -m cProfile -o output.prof my_script.py

# py-spy (sampling profiler, works on running processes)
pip install py-spy
py-spy record -o profile.svg --pid 12345

# memory_profiler
pip install memory_profiler
python -m memory_profiler my_script.py
```

### Rust Profiling

```bash
# perf (Linux)
perf record ./target/release/ucode3
perf report

# flamegraph
cargo install flamegraph
cargo flamegraph --bin ucode3

# Valgrind (macOS/Linux)
valgrind --tool=callgrind ./target/release/ucode3
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/hybrid.yml
name: Hybrid Build & Test

on: [push, pull_request]

jobs:
  test-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -e .
      - run: pytest

  test-rust:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: uDosGo/uCode3
      - uses: actions-rust-lang/setup-rust-toolchain@v1
      - run: cargo test

  hybrid-bench:
    runs-on: ubuntu-latest
    needs: [test-python, test-rust]
    steps:
      - uses: actions/checkout@v4
      - run: |
          # Build Rust bindings
          cd uCode3
          maturin build --release
          pip install target/wheels/*.whl
      - run: node scripts/udos.js bench --json
```

## Common Workflows

### Adding a New Feature

```bash
# 1. Create Python implementation
touch uCode1/core_py/new_feature.py

# 2. Write tests
touch tests/test_new_feature.py

# 3. Run tests
pytest tests/test_new_feature.py

# 4. Profile
python -m cProfile -o profile.stats -m pytest tests/test_new_feature.py

# 5. If needed, create Rust version
touch uCode3/core/src/new_feature.rs

# 6. Build Rust bindings
cd uCode3 && maturin develop --release

# 7. Run integration tests
pytest tests/test_hybrid.py

# 8. Benchmark
node scripts/udos.js bench --name new_feature
```

### Debugging Cross-Language Issues

```bash
# Enable verbose logging
export RUST_LOG=debug
export PYTHONVERBOSE=1

# Run with strace (Linux)
strace -f -e trace=openat python my_script.py

# Check FFI boundary
python -c "
from ucode3.ffi import RustFeature
import inspect
print(inspect.getsource(RustFeature.process))
"
```

### Performance Regression Detection

```bash
# Run benchmark suite and compare with baseline
node scripts/udos.js bench --json > current.json

# Compare with previous run
python -c "
import json
with open('baseline.json') as f: baseline = json.load(f)
with open('current.json') as f: current = json.load(f)
for b, c in zip(baseline['results'], current['results']):
    change = (c['rust']['duration_ms'] - b['rust']['duration_ms']) / b['rust']['duration_ms'] * 100
    print(f'{b[\"name\"]}: {change:+.1f}%')
"
```

## Best Practices

### 1. API Consistency
Keep Python and Rust APIs identical. Use the same function names, parameter order, and return types.

### 2. Graceful Degradation
Always provide a Python fallback. The system should work without Rust components.

### 3. Test Both Paths
Test both Python-only and Rust-accelerated paths in CI.

### 4. Document Decisions
When moving a component to Rust, document why in the code:
```python
# Uses Rust for performance (grid operations > 100ms in Python)
# See: uCode3/core/src/grid/parser.rs
```

### 5. Monitor Performance
Track benchmark results over time. Set up alerts for regressions > 10%.

## Troubleshooting

### Rust Bindings Not Found
```bash
# Rebuild bindings
cd ~/Code/uCode3
maturin develop --release --force

# Verify
python -c "from ucode3.ffi import *; print('OK')"
```

### Python/Rust Type Mismatch
```bash
# Enable debug logging
export PYO3_DEBUG=1
python my_script.py 2>&1 | grep "type mismatch"
```

### Build Failures
```bash
# Clean rebuild
cd ~/Code/uCode3
cargo clean
maturin build --release --force
```

## References

- [Integration Guide](integration-guide.md) — Technical details of Python/Rust FFI
- [CORE_ARCHITECTURE.md](CORE_ARCHITECTURE.md) — Version boundaries and ADRs
- [Benchmarking Framework](../packages/udos/commands/bench.ts) — `udo bench` command
- [DevStudio ROADMAP.md](../DevStudio/ROADMAP.md) — Project roadmap
