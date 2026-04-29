# uDosGo Architecture Guide

## Overview

uDosGo is organized into **three runtime tiers** with clear separation of concerns:

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐     ┌────────────────────┐
│       uCode1             │     │       uCode2             │     │       uCode3             │     │      uCode4         │
│   (Pure Python Core)     │◄───►│   (Rust + React)        │◄───►│  (Console/Tablet/Touch)  │◄───►│  (3D Spatial/VR)   │
└─────────────────────────┘  MCP └─────────────────────────┘  MCP └─────────────────────────┘  MCP └────────────────────┘
                                          │
                                          ▼
                              ~/.local/share/udos/mcp/core.sock (Unix Domain Socket)
```

- **uCode1**: Pure Python, zero Rust dependencies. Contains core business logic, CLI tools, and static HTML surfaces.
- **uCode2**: Rust core + React/Vue rich UI surfaces. Provides MCP server for uCode1 communication.
- **uCode3**: Console/tablet runtime with game controller input. Reference impl: `~/Code/HomeKit/`.
- **uCode4**: 3D spatial / VR runtime. 1024-slot architecture. *(Planning phase)*

## Quick Start

### Prerequisites

- Python 3.9+
- Rust 2024 edition
- Cargo (Rust package manager)
- Node.js (for React surfaces in uCode2)

### Build Everything

```bash
# Build uCode2 Rust workspace
cd uCode2
cargo build --workspace

# Run Python tests
cd uCode1
python3 -m pytest tests/ test_*.py
```

### Start MCP Server

```bash
# In one terminal:
cd uCode2
cargo run --package ucode2-mcp

# In another terminal, test the connection:
cd uCode1
python3 -c "from core_py.mcp_client import test_connection; print(test_connection())"
```

### Run Integration Demo

```bash
# Start MCP server first (see above)
# Then run the demo:
cd uCode1
python3 examples/mcp_integration.py
```

### Using Makefile

```bash
# See all available commands
make -f Makefile.dev help

# Build uCode2
make -f Makefile.dev build

# Run all tests
make -f Makefile.dev test

# Start MCP server
make -f Makefile.dev start-mcp

# Run integration demo
make -f Makefile.dev runDemo
```

---

## Directory Structure

### uCode1/ (Pure Python)

```
uCode1/
├── core_py/                           # Python core modules
│   ├── snack/                         # Snack system
│   ├── relic/                         # Relic system
│   ├── binder/                        # Binder system
│   ├── usxd/                          # USXD/CEETEX pipeline
│   ├── thinui/                        # ThinUI integration (Python)
│   ├── plugin/                        # Plugin system
│   ├── grid/                          # Grid operations (Python)
│   ├── text/                          # Text/MD tools (Python)
│   ├── mcp_client.py                  # MCP client for uCode2 communication
│   └── __init__.py
│
├── tests/                            # Python test suites
│   ├── test_snack_relic.py
│   ├── test_usxd_pipeline.py
│   ├── test_thinui_integration.py
│   └── ui/
│
├── test_mcp_client.py                # MCP client tests (19 tests)
├── test_grid_core.py                  # Grid core tests (14 tests)
├── test_text_tools.py                 # Text tools tests (7 tests)
├── test_mcp_integration.py            # MCP integration tests (15 tests)
│
├── examples/                         # Example scripts
│   └── mcp_integration.py             # Demo of MCP communication
│
├── themes/                           # Static HTML/CSS themes
│   ├── bbcbasic/
│   ├── nesdash/
│   └── retro/
│
└── ThinUI/                           # Static HTML surfaces (no React)
    └── ceefax/
```

**Key Principle**: uCode1 contains **no Rust code**. All Rust dependencies have been moved to uCode2/.

### uCode2/ (Rust + React)

```
uCode2/
├── Cargo.toml                         # Workspace manifest
├── core/                              # Core Rust library
│   └── src/lib.rs
│
├── mcp/                               # MCP server (Unix socket)
│   ├── Cargo.toml
│   ├── src/lib.rs
│   └── src/main.rs
│
├── vault-bridge/                      # Vault bridge (SQLite)
│   ├── Cargo.toml
│   └── src/lib.rs
│
├── ok-agent/                          # OK Agent (intent classification)
│   ├── Cargo.toml
│   └── src/lib.rs
│
├── grid-core/                         # Grid core (Rust performance)
│   ├── Cargo.toml
│   └── src/lib.rs
│
├── spatial/                           # Spatial map operations
│   ├── Cargo.toml
│   └── src/lib.rs
│
├── feed-spool/                        # RSS/Atom feed spool
│   ├── Cargo.toml
│   └── src/lib.rs
│
├── usystem/                           # User system
│   ├── Cargo.toml
│   └── src/lib.rs
│
├── ucode1-cli/                        # CLI binary (was uCode1/src/)
│   ├── Cargo.toml
│   ├── main.rs
│   ├── bin/
│   ├── ceetex/
│   ├── mcp/
│   └── tools/
│
└── ThinUI/                            # React/Vue surfaces
    ├── notionish/                      # Notion-like editor
    └── milkdown/                       # Markdown editor
```

**Socket Path**: All MCP communication uses `~/.local/mcp.sock` (Unix domain socket)

### uCode3/ (Optional Extensions)

```
uCode3/
├── Cargo.toml
├── core/
└── README.md
```

uCode3 is a separate workspace for extended Rust components. It can be integrated via MCP or merged into uCode2 as needed.

---

## Communication Architecture

### MCP Server (uCode2)

The uCode2 MCP server provides a Unix domain socket interface at `~/.local/mcp.sock`.

**Supported Operations:**
- Notes: `ListNotes`, `ReadNote`, `SearchNotes`
- Vault: `VaultRead`, `VaultWrite`, `VaultList`, `VaultSearch`, `VaultDelete`, `VaultMetadata`
- Intent: `ClassifyIntent`
- System: `Status`, `Ping`, `Shutdown`

**Protocol**: Simple JSON-based protocol. Each request is a JSON object with a `type` field, sent as a line of text followed by a newline. Response is returned as a JSON object.

**Example Request:**
```json
{"type": "ReadNote", "name": "my-note"}
```

**Example Response:**
```json
{"NoteContent": {"name": "my-note", "content": "..."}}
```

### Python MCP Client (uCode1)

The `core_py.mcp_client` module provides a clean Python API for communicating with the MCP server.

**Basic Usage:**
```python
from core_py.mcp_client import McpClient, test_connection

# Check if server is available
if test_connection():
    client = McpClient()  # Connects to ~/.local/mcp.sock

    # Read a note
    response = client.read_note("my-note")
    print(response.note_content)

    # List vault contents
    response = client.vault_list("/")
    print(response.vault_list)

    client.close()
```

**High-Level API Methods:**
```python
client.list_notes()           # List all notes
client.read_note("name")      # Read specific note
client.search_notes("query")  # Search notes
client.classify_intent("text") # Classify intent
client.status()               # Get server status
client.ping()                  # Test connection
client.shutdown()             # Request shutdown

# Vault operations
client.vault_read("path")     # Read file
client.vault_write("path", "content")  # Write file
client.vault_list("path")     # List directory
client.vault_search("query") # Search files
client.vault_delete("path")  # Delete file
client.vault_metadata("path") # Get file metadata
```

---

## Testing

### Run All Tests

```bash
# From root directory
python3 -m pytest uCode1/tests/ uCode1/test_*.py -v

# Or use Makefile
make -f Makefile.dev test
```

### Test Breakdown

| Category | File | Tests | Status |
|----------|------|-------|--------|
| uCode1 Existing | `uCode1/tests/` | 73 | ✅ |
| MCP Client | `uCode1/test_mcp_client.py` | 19 | ✅ |
| Grid Core | `uCode1/test_grid_core.py` | 14 | ✅ |
| Text Tools | `uCode1/test_text_tools.py` | 7 | ✅ |
| MCP Integration | `uCode1/test_mcp_integration.py` | 15 | ✅ |
| Plugin System | `uCode1/test_plugin_system.py` | 5 | ✅ |
| MCP Connection | `test_mcp_connection.py` | 5 | ✅ |
| **Total** | | **133** | ✅ **All pass** |

---

## Development Workflow

### Adding New Python Modules to uCode1

1. Create module in `uCode1/core_py/`
2. Add exports to `uCode1/core_py/__init__.py`
3. Create test file in `uCode1/`
4. Update `__all__` in `uCode1/core_py/__init__.py`

### Adding New Rust Crates to uCode2

1. Create crate directory in `uCode2/`
2. Add `Cargo.toml` with package name prefixed with `ucode2-`
3. Add to `uCode2/Cargo.toml` workspace members
4. Update all internal references to use `ucode2-*`

### MCP Protocol Extensions

1. Add new request type to `uCode2/mcp/src/lib.rs` McpRequest enum
2. Add corresponding response type to McpResponse enum
3. Add handler in `McpServer::handle_connection()`
4. Add method to `uCode1/core_py/mcp_client.py` McpClient class

---

## Key Design Decisions

### 1. uCode1 Pure Python

**Rationale**: uCode1 serves as the portable, easy-to-deploy core that can run anywhere Python runs. Zero Rust dependencies means no compilation step, no Cargo, no platform-specific issues.

**Communication**: uCode1 connects to uCode2's MCP server via Unix domain socket when Rust performance or features are needed.

### 2. Unix Domain Socket Path

**Path**: All MCP communication uses `~/.local/mcp.sock` (not `.uds/`)

**Rationale**:
- `.local/` is more standard on Unix systems (used by systemd, XDG, etc.)
- Consistent with XDG Base Directory Specification
- Easier to find and debug

### 3. Workspace Separation

- **uCode1**: Python only, for core business logic
- **uCode2**: Rust + React, for performance-critical and rich UI components
- **uCode3**: Optional extensions, can be merged into uCode2 if needed

This separation ensures:
- Clear ownership of functionality
- Independent development and deployment
- Technology-appropriate implementation (Python for glue code, Rust for performance)

---

## Troubleshooting

### "MCP server not available"

Ensure the MCP server is running:

```bash
# Start the server
cd uCode2 && cargo run --package ucode2-mcp

# Test connection
cd uCode1 && python3 -c "from core_py.mcp_client import socket_exists; print(socket_exists())"
```

### "Module not found" errors

Ensure you're running from the correct directory and Python path is set:

```bash
cd uCode1
python3 -c "import sys; sys.path.insert(0, '.'); from core_py import mcp_client"
```

### uCode2 build errors

```bash
# Clean and rebuild
cd uCode2 && cargo clean && cargo build --workspace
```

---

## Directory Index

| Directory | Purpose | Language |
|-----------|---------|----------|
| `uCode1/` | Pure Python core | Python |
| `uCode1/core_py/` | Core Python modules | Python |
| `uCode1/core_py/grid/` | Grid operations | Python |
| `uCode1/core_py/text/` | Text/MD tools | Python |
| `uCode1/core_py/plugin/` | Plugin system | Python |
| `uCode2/` | Rust + React workspace | Rust, React |
| `uCode2/mcp/` | MCP server | Rust |
| `uCode2/core/` | Core library | Rust |
| `uCode2/vault-bridge/` | Vault operations | Rust |
| `uCode3/` | Extended Rust (optional) | Rust |

---

## See Also

- [UCODE1_UCODE2_BOUNDARIES.md](UCODE1_UCODE2_BOUNDARIES.md) - Detailed boundary analysis
- [SPRINT_PLAN.md](SPRINT_PLAN.md) - Sprint planning and roadmap
- [MCP_VAULT_INTEGRATION.md](uCode1/MCP_VAULT_INTEGRATION.md) - MCP integration guide
