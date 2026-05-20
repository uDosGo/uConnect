# uDos Core Architecture: Python/Rust Version Boundaries

## Overview

This document defines the version boundaries and architecture decisions for uDos core components, establishing clear separation between Python and Rust implementations.

## Version Boundaries

### uCode1: Python Core (Primary Development)

**Location**: `uCode1/core_py/`
**Language**: Python 3.11+
**Purpose**: Primary development platform, accessibility, rapid iteration

#### Key Characteristics:

- **Development Focus**: Primary development occurs in Python
- **Accessibility**: Lower barrier to entry for contributors
- **Ecosystem**: Rich Python ecosystem integration
- **Performance**: Good enough for 80% of use cases
- **Integration**: Optional uCode3 Rust components for performance-critical paths

#### Components:

```bash
uCode1/core_py/
├── snack/          # Python Snack system
├── relic/          # Python Relic system  
├── binder/         # Python Binder system
├── usxd/           # Python USXD/OBF system
└── integration/    # uCode3 Rust integration layer
```

### uCode3: Rust Core (Performance Components)

**Location**: `uCode3/core/`
**Language**: Rust 1.89.0+
**Purpose**: High-performance components, memory safety, zero-cost abstractions

#### Key Characteristics:

- **Performance Focus**: Optimized for speed and memory efficiency
- **Safety**: Memory safety through Rust's ownership model
- **Interoperability**: Python bindings via `pyo3`
- **Selective Usage**: Used only where performance is critical
- **Stability**: Mature Rust implementation from uCode1 migration

#### Components:

```bash
uCode3/core/src/
├── snack/          # Rust Snack system (performance)
├── relic/          # Rust Relic system (binary operations)
├── binder/         # Rust Binder system (large datasets)
├── usxd/           # Rust USXD/OBF system (grid operations)
└── ffi/            # Python bindings
```

## Architecture Decision Records

### ADR-001: Python Core Migration

**Status**: Accepted
**Date**: 2026-04-26

**Context**: 
- Rust core in uCode1 created high barrier to entry
- Python ecosystem better suited for rapid development
- Need to maintain performance for critical operations

**Decision**: 
- Migrate uCode1 to Python core
- Create uCode3 for Rust performance components
- Establish clear version boundaries

**Consequences**:
- ✅ Lower barrier to entry for contributors
- ✅ Faster development iteration
- ✅ Rich Python ecosystem integration
- ⚠️ Potential performance regression in some areas
- ⚠️ Need for careful performance monitoring

### ADR-002: Hybrid Architecture

**Status**: Accepted
**Date**: 2026-04-26

**Context**:
- Some operations require Rust-level performance
- Full Python rewrite not feasible for all components
- Need seamless integration between languages

**Decision**:
- Implement hybrid Python/Rust architecture
- Use uCode3 Rust components selectively via Python bindings
- Create clear integration layer in uCode1

**Consequences**:
- ✅ Maintain performance for critical operations
- ✅ Best of both worlds approach
- ⚠️ Increased build complexity
- ⚠️ FFI overhead for cross-language calls

## Development Workflow

### Python-First Development

1. **Implement in Python** (uCode1)
   - Rapid prototyping
   - Easier debugging
   - Rich ecosystem

2. **Identify Performance Bottlenecks**
   - Profile critical paths
   - Benchmark against requirements
   - Document performance characteristics

3. **Optimize Selectively**
   - Move performance-critical components to uCode3
   - Implement Rust versions with Python bindings
   - Maintain identical APIs for seamless switching

### Build System

```mermaid
graph TD
    A[Developer] --> B[uCode1 Python Core]
    B --> C[Fast Iteration]
    C --> D[Performance Profiling]
    D -->|Needs Optimization| E[uCode3 Rust Components]
    E --> F[Python Bindings]
    F --> B
```

## Performance Guidelines

### When to Use Python (uCode1)

- **Business logic** and application flow
- **Glue code** and integration layers
- **Prototyping** and rapid development
- **I/O operations** (files, network, databases)
- **Non-performance-critical** operations

### When to Use Rust (uCode3)

- **Performance-critical algorithms**
- **Memory-intensive operations**
- **Binary data processing**
- **Large dataset manipulation**
- **Real-time processing requirements**

## Integration Patterns

### Pattern 1: Direct Python Usage

```python
# Most common pattern - pure Python
from ucode1.core_py import Snack

snack = Snack.create("test", "Test Snack", "1.0.0", "echo hello")
result = snack.execute()
```

### Pattern 2: Optional Rust Optimization

```python
# Fallback to Rust for performance
from ucode1.core_py import Snack
from ucode3.ffi import RustSnack  # Optional import

# Try Python first
snack = Snack.create("test", "Test Snack", "1.0.0", "echo hello")

# Fallback to Rust if performance is inadequate
if snack.needs_optimization():
    rust_snack = RustSnack.from_python(snack)
    result = rust_snack.execute()
else:
    result = snack.execute()
```

### Pattern 3: Hybrid Processing Pipeline

```python
# Use Python for orchestration, Rust for heavy lifting
from ucode1.core_py import SnackProcessor
from ucode3.ffi import RustSnackExecutor

def process_batch(snacks: List[Snack]) -> List[Result]:
    # Python: Filter and prepare
    critical_snacks = [s for s in snacks if s.is_critical()]
    
    # Rust: Execute performance-critical operations
    rust_executor = RustSnackExecutor()
    critical_results = rust_executor.execute_batch(critical_snacks)
    
    # Python: Process remaining snacks
    normal_results = [s.execute() for s in snacks if not s.is_critical()]
    
    return critical_results + normal_results
```

## Build and Deployment

### Development Setup

```bash
# Python environment
python -m venv .venv
source .venv/bin/activate
pip install -e uCode1

# Rust environment (for uCode3)
cd uCode3
cargo build
cd ..

# Run tests
pytest uCode1/tests/
cargo test --manifest-path uCode3/Cargo.toml
```

### Production Deployment

```bash
# Build Python package
cd uCode1
python setup.py sdist bdist_wheel

# Build Rust components
cd uCode3
cargo build --release

# Create hybrid distribution
mkdir -p dist/hybrid
cp uCode1/dist/* dist/hybrid/
cp uCode3/target/release/libucode3.* dist/hybrid/
```

## Performance Monitoring

### Benchmarking Framework

```python
import time
from ucode1.core_py import Snack
from ucode3.ffi import RustSnack

def benchmark_implementation():
    test_data = load_test_data()
    
    # Python implementation
    start = time.time()
    python_results = [Snack.execute(data) for data in test_data]
    python_time = time.time() - start
    
    # Rust implementation
    start = time.time()
    rust_results = RustSnack.execute_batch(test_data)
    rust_time = time.time() - start
    
    # Compare and decide
    if rust_time < python_time * 0.8:  # 20% faster
        print(f"Using Rust: {rust_time:.3f}s vs Python: {python_time:.3f}s")
        return rust_results
    else:
        print(f"Using Python: {python_time:.3f}s vs Rust: {rust_time:.3f}s")
        return python_results
```

## Migration Guide

### For Existing uCode1 (Rust) Users

1. **Update imports**: Change from Rust to Python modules
   ```python
   # Old (Rust)
   from ucode1.core import Snack
   
   # New (Python)
   from ucode1.core_py import Snack
   ```

2. **Review performance requirements**: Identify components needing uCode3

3. **Update build system**: Add Python dependencies

4. **Test thoroughly**: Validate behavior matches expectations

### For New Developers

1. **Start with Python**: Use uCode1 for primary development
2. **Profile early**: Identify performance bottlenecks
3. **Optimize selectively**: Move only critical paths to uCode3
4. **Maintain compatibility**: Keep APIs consistent between implementations

## Version Compatibility Matrix

| uCode1 Version | uCode3 Version | Status |
|---------------|---------------|--------|
| 0.1.0 | 0.1.0 | ✅ Compatible |
| 0.2.0 | 0.1.0 | ✅ Compatible |
| 0.2.0 | 0.2.0 | ✅ Recommended |
| 1.0.0 | 1.0.0 | ✅ Required |

## Decision Tree

```mermaid
graph TD
    A[New Feature] --> B{Performance Critical?}
    B -->|Yes| C[Implement in uCode3 Rust]
    B -->|No| D[Implement in uCode1 Python]
    C --> E[Create Python bindings]
    D --> F[Profile performance]
    F -->|Adequate| G[Done]
    F -->|Inadequate| C
```

## Best Practices

### 1. API Consistency

Maintain identical APIs between Python and Rust implementations to allow seamless switching.

### 2. Performance Profiling

Profile before optimizing - don't assume Rust is always needed.

### 3. Documentation

Clearly document which components use Python vs Rust and why.

### 4. Testing

Test both implementations with identical test suites.

### 5. Benchmarking

Establish performance baselines and monitor regressions.

## Future Evolution

### uCode2: Next Generation Architecture

- **Unified runtime**: Seamless Python/Rust interoperability
- **Automatic optimization**: JIT compilation of hot paths
- **Adaptive execution**: Runtime switching between implementations
- **Unified packaging**: Single distribution with both runtimes

### uCode3: Performance Evolution

- **Expanded coverage**: More components available in Rust
- **Better bindings**: Improved Python/Rust interoperability
- **Performance guarantees**: SLA-based optimization targets
- **WASM compilation**: Browser-based execution options

## Appendix: Common Patterns

### Pattern: Conditional Import

```python
try:
    from ucode3.ffi import RustComponent
    USE_RUST = True
except ImportError:
    from ucode1.core_py import PythonComponent as RustComponent
    USE_RUST = False

def process_data(data):
    component = RustComponent()
    if USE_RUST:
        return component.process_fast(data)
    else:
        return component.process(data)
```

### Pattern: Configuration-Based Selection

```python
# config.yaml
performance:
  use_rust: true
  thresholds:
    dataset_size: 10000
    execution_time: 100

# loader.py
import yaml

with open('config.yaml') as f:
    config = yaml.safe_load(f)

if config['performance']['use_rust']:
    from ucode3.ffi import RustProcessor
else:
    from ucode1.core_py import PythonProcessor
```

## References

- [Python Performance Optimization Guide](https://docs.python.org/3/howto/optimization.html)
- [Rust Performance Guide](https://doc.rust-lang.org/1.89.0/book/ch13-04-performance.html)
- [Pyo3 User Guide](https://pyo3.rs/)
- [Hybrid Python/Rust Architecture Patterns](https://blog.rust-lang.org/inside-rust/2023/01/03/pyo3-maturate.html)