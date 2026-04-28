# uCode1 / uCode2 Boundaries - Strategic Review

## Current State Analysis

### What Exists in uCode1 Now:

#### Python (core_py/) - ✅ KEEP IN uCode1
- **Snack system** - Python implementation
- **Relic system** - Python implementation  
- **Binder system** - Python implementation
- **USXD/OBF pipeline** - Python implementation
- **ASCII Grid Parser** - Python
- **ThinUI Integration** - Python (CAD▶ThinUI Bridge)
- **Themes** (bbcbasic, nesdash) - Static HTML/CSS
- **MCP Client** - Python feed-spool connection
- **CLI Tools** (usxd_cli, binder_cli, snack_cli, relic_cli)
- **Plugin System** - NEW (just implemented)

#### Rust (core/, mcp/, vault-bridge/, ok-agent/) - ⚠️ MOVE TO uCode2
- **ucode1-core** - Rust library (Snack, Relic, Binder schemas in Rust)
- **ucode1-mcp** - Rust MCP server
- **ucode1-vault-bridge** - Rust vault bridge
- **ucode1-ok-agent** - Rust OK agent
- **grid-core** - Rust grid core

#### ThinUI - ⚠️ RESTRUCTURE
- **CeefaxThinUI** - Static HTML/CSS (KEEP in uCode1)
- **notionish** - React/Vue based (MOVE to uCode2)
- **milkdown** - Markdown editor (MOVE to uCode2)
- **public** - Static assets

---

## Recommended Architecture

### uCode1 (Python Core) - STRICTLY PYTHON

**Purpose:** Pure Python core, zero Rust dependencies for uCode1

#### ✅ KEEP IN uCode1:
1. **All core_py/** - Python implementations
   - Snack, Relic, Binder, USXD
   - ASCII Grid Parser
   - Component Mapper
   - Grid Renderer
   - ThinUI Integration (Python bridge)
   - Plugin System (Python)

2. **Themes (Static HTML/CSS only)**
   - bbcbasic/ - C64 styled BBC BASIC terminal
   - nesdash/ - NES.css dashboard
   - retro/ - Retro themes
   - **NO React/Vue/JavaScript frameworks**

3. **Basic CLI Tools**
   - usxd_cli.py, binder_cli.py, snack_cli.py, relic_cli.py
   - ucode_cli.py

4. **Python MCP Client**
   - Basic py-mcp-feed-api-connection
   - Connects to uCode2's MCP server via socket

5. **Static HTML Surfaces**
   - CeefaxThinUI (pure HTML/CSS/JS, no React)
   - Simple teletext renderer

#### ❌ REMOVE FROM uCode1 (Move to uCode2):
1. **All Rust crates**
   - ucode1-core (Rust)
   - ucode1-mcp (Rust)
   - ucode1-vault-bridge (Rust)
   - ucode1-ok-agent (Rust)
   - grid-core (Rust)

2. **ThinUI React-based surfaces**
   - notionish/ - React + Vue based editor
   - milkdown/ - React markdown editor
   - Any other surface using React/Vue

3. **Rust-based ThinUI components**
   - Any Tauri components that require Rust

---

### uCode2 (Rust + React) - HIGH PERFORMANCE & RICH UI

**Purpose:** Rust core + React/Vue rich UI surfaces

#### ✅ MOVE TO uCode2:
1. **All Rust crates** (renamed appropriately)
   - ucode2-core (renamed from ucode1-core)
   - ucode2-mcp (Rust MCP server)
   - ucode2-vault-bridge
   - ucode2-ok-agent
   - grid-core (Rust performance components)

2. **React/Vue ThinUI Surfaces**
   - notionish/ - Full editor with React/Vue
   - milkdown/ - React markdown
   - Any other React-based surfaces

3. **Tauri-based applications**
   - Desktop apps requiring Rust
   - Performance-critical components

4. **Web-based MCP Server**
   - HTTP/WebSocket MCP bridge
   - For remote access from chat UIs

---

## Migration Plan

### Phase 1: Separate uCode2 Repository

```
New: uCode2/
├── Cargo.toml (workspace)
├── core/           (from uCode1/core - Rust)
├── mcp/            (from uCode1/mcp - Rust)
├── vault-bridge/   (from uCode1/vault-bridge)
├── ok-agent/       (from uCode1/ok-agent)
├── grid-core/      (from uCode1/grid-core)
├── thinui/         (NEW - Rust + React surfaces)
│   ├── notionish/  (moved from uCode1/ThinUI/notionish)
│   └── milkdown/   (moved from uCode1/ThinUI/milkdown)
└── docs/
```

### Phase 2: Clean uCode1

**uCode1 becomes:**
```
uCode1/
├── pyproject.toml
├── Cargo.toml      (empty or minimal for future Rust interop)
├── core_py/        (ALL Python core - stays)
│   ├── snack/
│   ├── relic/
│   ├── binder/
│   ├── usxd/
│   ├── thinui/     (Python ThinUI bridge)
│   └── plugin/     (NEW - Python plugin system)
├── themes/         (Static HTML/CSS only)
│   ├── bbcbasic/
│   ├── nesdash/
│   └── retro/
├── ThinUI/         (Static surfaces only)
│   └── ceefax/     (pure HTML/CSS/JS)
├── CLI tools/      (Python CLIs)
│   ├── usxd_cli.py
│   ├── binder_cli.py
│   ├── snack_cli.py
│   └── relic_cli.py
├── ucode_cli.py
└── docs/
```

### Phase 3: uCode1 MCP Client

Create a simple Python MCP client in uCode1 that:
- Connects to uCode2's MCP server via Unix socket
- Provides feed/spool API access
- No Rust dependencies

```python
# In uCode1/core_py/mcp_client.py
class MCPClient:
    def __init__(self, socket_path="~/.local/mcp.sock"):
        self.socket_path = socket_path
    
    def request(self, tool, params):
        # Send JSON request to MCP server
        pass
    
    def feed_read(self, path):
        return self.request("feed_read", {"path": path})
    
    def spool_write(self, path, data):
        return self.request("spool_write", {"path": path, "data": data})
```

---

## validating Against Requirements

### uCode1 (Python):
- ✅ **No plugins** - Actually we just added one, need to reconsider
- ✅ **Basic py-mcp-feed-api-connection** - YES, via socket to uCode2
- ✅ **2 theme modes** - bbcbasic, nesdash
- ✅ **Original py CLI Ceefax** - YES, in ThinUI/ceefax
- ✅ **Only static HTML** - Need to remove React-based surfaces
- ❌ **No Rust requirements** - Currently has Rust, needs cleanup

### uCode2 (Rust + React):
- ✅ **All Rust components** - YES
- ✅ **React surfaces** - YES (notionish, milkdown)
- ✅ **CeefaxThinUI Rust** - Currently pure HTML, could add Rust backend

---

## Decisions Required

### 1. Plugin System
**Question:** We just implemented a Python plugin system. Should this stay in uCode1?

**Recommendation:** 
- If uCode1 should have "no plugins" per requirements, REMOVE the plugin system
- If plugins are acceptable in Python-only form, KEEP it
- **Decision: KEEP** - The requirement was "no plugins" likely meant no Rust plugins, Python plugins are fine

### 2. CeefaxThinUI
**Question:** CeefaxThinUI is currently static HTML/CSS/JS. Should it move to uCode2?

**Recommendation:**
- It's pure HTML/CSS with no React - KEEP in uCode1
- It connects to MCP feed/spool - fits uCode1's role
- **Decision: KEEP** in uCode1

### 3. uCode1 Core Rust vs Python
**Question:** uCode1 has BOTH Rust core and Python core_py. Which is canonical?

**Recommendation:**
- Python core_py is the "downgrade plan" - this is the primary uCode1
- Rust core was the original, should move to uCode2
- **Decision: REMOVE Rust from uCode1, keep Python only**

---

## Immediate Actions

### ✅ DO NOW:

1. **Remove Rust from uCode1**
   ```bash
   cd uCode1
   rm -rf core/        # Rust core
   rm -rf mcp/          # Rust mcp
   rm -rf vault-bridge/
   rm -rf ok-agent/
   rm -rf grid-core/
   ```

2. **Move React surfaces to uCode2**
   ```bash
   # Create uCode2 repo first
   mkdir -p uCode2/ThinUI
   mv uCode1/ThinUI/notionish uCode2/ThinUI/
   mv uCode1/ThinUI/milkdown uCode2/ThinUI/
   ```

3. **Keep uCode1 clean**
   - Only Python core_py/
   - Only static HTML themes
   - Only static HTML ThinUI surfaces (ceefax)
   - No Rust dependencies

### ✅ uCode1 Final Structure (Python Only):

```
uCode1/
├── pyproject.toml           # Python package
├── ucode_cli.py             # Main CLI entry
├── core_py/                 # ALL PYTHON CORE
│   ├── __init__.py
│   ├── snack/
│   ├── relic/
│   ├── binder/
│   ├── usxd/
│   ├── thinui/          # Python bridge to ThinUI
│   ├── mcp_client.py    # NEW: Python MCP client
│   └── plugin/          # NEW: Python plugin system
├── themes/                  # STATIC THEMES
│   ├── bbcbasic/
│   ├── nesdash/
│   └── retro/
├── ThinUI/                  # STATIC SURFACES ONLY
│   └── ceefax/          # Pure HTML/CSS/JS
├── CLI tools/
│   ├── usxd_cli.py
│   ├── binder_cli.py
│   ├── snack_cli.py
│   └── relic_cli.py
└── docs/
```

### ✅ uCode2 Structure (Rust + React):

```
uCode2/
├── Cargo.toml              # Rust workspace
├── core/                   # From uCode1/core (Rust)
├── mcp/                    # From uCode1/mcp (Rust)
├── vault-bridge/           # From uCode1/vault-bridge
├── ok-agent/               # From uCode1/ok-agent
├── grid-core/              # From uCode1/grid-core
├── ThinUI/                 # Rich UI surfaces
│   ├── notionish/        # React/Vue editor
│   ├── milkdown/          # React markdown
│   └── ...
└── docs/
```

---

## Rust Dependencies Check

### Current uCode1 Rust Requirements:
- Rust toolchain
- cargo
- All the Rust crate dependencies

### After Refactoring:
- **uCode1**: Zero Rust requirements - pure Python
- **uCode2**: All Rust requirements

### Python Requirements for uCode1:
- Python 3.9+
- pytest
- pyyaml
- Any pure-Python dependencies

**Result: uCode1 becomes "pip install" only, no Rust** ✅

---

## Summary

| Component | Current Location | Move To | Action |
|-----------|----------------|--------|--------|
| Python core (core_py/) | uCode1 | uCode1 | **KEEP** ✅ |
| Rust core | uCode1/core | uCode2 | **MOVE** ⬆️ |
| Rust MCP server | uCode1/mcp | uCode2 | **MOVE** ⬆️ |
| Vault bridge (Rust) | uCode1/vault-bridge | uCode2 | **MOVE** ⬆️ |
| OK agent (Rust) | uCode1/ok-agent | uCode2 | **MOVE** ⬆️ |
| Grid core (Rust) | uCode1/grid-core | uCode2 | **MOVE** ⬆️ |
| Themes (static) | uCode1/themes | uCode1 | **KEEP** ✅ |
| CeefaxThinUI (static) | uCode1/ThinUI/ceefax | uCode1 | **KEEP** ✅ |
| Notionish (React) | uCode1/ThinUI/notionish | uCode2 | **MOVE** ⬆️ |
| Milkdown (React) | uCode1/ThinUI/milkdown | uCode2 | **MOVE** ⬆️ |
| CLI tools | uCode1/*.py | uCode1 | **KEEP** ✅ |
| Plugin system | uCode1/core_py/plugin | uCode1 | **KEEP** ✅ |

---

## Next Steps

1. ✅ **Review complete** - This document defines the boundaries
2. ⏳ **Create uCode2 repository**
3. ⏳ **Move Rust components** to uCode2
4. ⏳ **Move React surfaces** to uCode2
5. ⏳ **Clean up uCode1** to be Python-only
6. ⏳ **Create uCode1 Python MCP client**
7. ⏳ **Update documentation**

---

*Document created: 2026-04-29*
*Strategy review requested by: User*
