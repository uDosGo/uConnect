# uDos Developer Guide

This guide explains how to extend and contribute to the uDos ecosystem.

---

## Architecture Overview

```
uCode1 (Python Core)          uCode2 (Rust + React)
┌─────────────────────┐       ┌──────────────────────┐
│ core_py/            │       │ mcp/                 │
│   snack/            │◄─────►│   MCP server         │
│   relic/            │  MCP  │ grid-core/           │
│   binder/           │       │ vault-bridge/        │
│   usxd/             │       │ ok-agent/            │
│   grid/             │       │ spatial/             │
│   cell/             │       │ feed-spool/          │
│   feed/             │       │ tui/                 │
│   mdx/              │       │ ThinUI/ (React shell)│
│   thinui/           │       └──────────────────────┘
│   text/             │
│   plugin/           │
│ narrator/           │
│ ok_agent/           │
└─────────────────────┘
```

## Project Structure

```
uDosGo/
├── uCode1/              # Python core (active development)
│   ├── core_py/         # Core modules
│   │   ├── snack/       #   Executable container system
│   │   ├── relic/       #   Binary unit system
│   │   ├── binder/      #   Structured data containers
│   │   ├── usxd/        #   USXD format + grid parser
│   │   ├── grid/        #   Grid data structures + Monodraw
│   │   ├── cell/        #   UDX-addressed atomic storage
│   │   ├── feed/        #   Feed event archiving
│   │   ├── mdx/         #   MDX shortcode runtime
│   │   ├── thinui/      #   ThinUI bridge + API server
│   │   ├── plugin/      #   Plugin discovery/loading
│   │   └── text/        #   Text processing tools
│   ├── narrator/        # Story generation + Lexicon + Character System
│   ├── ok_agent/        # Local AI intent classification
│   ├── tests/           # 129 integration tests
│   ├── *.py             # CLI entry points (snack_cli, grid_cli, etc.)
│   └── ucode            # Unified CLI entry point
├── uCode2/              # Rust workspace (supporting)
│   ├── mcp/             #   MCP server binary
│   ├── core/            #   Core library (snack, relic, binder, usxd)
│   ├── vault-bridge/    #   Vault storage bridge
│   ├── ok-agent/        #   OK agent (Rust)
│   ├── grid-core/       #   Grid operations (Rust)
│   ├── ThinUI/          #   React shell with surfaces
│   └── ...
├── docs/                # Documentation
│   ├── roadmap.md       # Development roadmap
│   ├── user-guide.md    # User manual
│   ├── dev-guide.md     # This file
│   ├── api-reference.md # API documentation
│   ├── troubleshooting.md
│   └── specs/           # Format specifications
└── .github/workflows/   # CI/CD
```

## Development Setup

```bash
# Clone and enter
cd ~/Code/uDosGo

# Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r uCode1/requirements.txt

# Run tests
cd uCode1 && python3 -m pytest tests/ -v

# Run lint
python3 -m ruff check core_py/ narrator/ tests/
```

## How to Add a New CLI Command

### 1. Create a CLI module
Create `mything_cli.py` in `uCode1/`:

```python
#!/usr/bin/env python3
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def build_arg_parser():
    import argparse
    p = argparse.ArgumentParser(prog="ucode mything", description="Do my thing")
    p.add_argument("action", help="What to do")
    return p

def main():
    p = build_arg_parser()
    args = p.parse_args()
    print(f"Doing: {args.action}")

if __name__ == "__main__":
    main()
```

### 2. Wire into unified CLI
In `ucode`, add to the `handlers` dict:
```python
"mything": lambda: dispatch("mything_cli"),
```

And add to the help text above.

### 3. Add core module (optional)
Create `core_py/mything/__init__.py` and add to `core_py/__init__.py`:
```python
from . import mything  # NEW
```

### 4. Add tests
Create `tests/test_mything.py` with pytest tests.

## How to Add a ThinUI Surface

### 1. Create React component
`uCode2/ThinUI/src/surfaces/my-surface/MySurface.jsx`

### 2. Register in App.jsx
Add to `SURFACES` array and `SurfaceFrame` switch.

## How Snacks Work

Snacks are atomic executable units defined as JSON/YAML:

```json
{
  "id": "hello",
  "name": "Hello World",
  "version": "1.0.0",
  "runtime": "bash",
  "code": "echo Hello, $NAME!",
  "inputs": [
    {"name": "NAME", "type": "string", "default": "World"}
  ]
}
```

**Supported runtimes:** `bash`, `python`, `node`, `apple-script-osx`

Snacks are stored in `.snacks/` and executed via `SnackEngine`:

```python
from core_py.snack import Snack, SnackEngine, execute_snack
engine = SnackEngine()
result = engine.execute(my_snack, {"NAME": "uDos"})
```

## How Cells Work

Cells use UDX addressing: `L<band>-<col><row><sub>-<layer><slot>-<version>`

**Layer types:**
| Layer | Code | Description |
|-------|------|-------------|
| 0 | grid | Grid data |
| 1 | spatial | Spatial index |
| 2 | snack | Snack execution |
| 3 | feed | Event/feed log |
| 4 | meta | Metadata |
| 5 | char | Character slot |
| 6 | binder | Binder snapshot |
| 7 | usxd | USXD document |
| 8 | cube | SnackBox packaging |
| 9 | user | User-defined |

**Usage:**
```python
from core_py.cell import Cell, CellAddress, CellStore, Cube

store = CellStore()
addr = CellAddress.parse("L100-AA00-0000-0")
cell = Cell(address=addr, data={"hello": "world"})
store.write(cell)
read = store.read("L100-AA00-0000-0")
```

## Testing Guidelines

- All tests go in `uCode1/tests/`
- Test files are named `test_*.py`
- Use `pytest` with `setup_method`/`teardown_method` for isolation
- Temp directories: use `tempfile.mkdtemp()` to avoid side effects
- Run: `python3 -m pytest tests/ -v --tb=short`
- Target: 129+ tests and growing

## CI/CD

```bash
# Run all tests
make test

# Lint code
make lint

# Create a release
make release VERSION=0.2.0
```

CI runs on every push to `main`/`dev`:
- Python: matrix (3.10-3.13), lint, test
- Rust: build, test, clippy
- ThinUI: npm ci, build
