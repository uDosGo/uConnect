# uDos Development Spine Structure

**The definitive guide to uDos development organization**

## 🎯 Overview

The uDos ecosystem is organized around **two primary spines** that serve as the foundation for all development work:

1. **Code Home** (`~/Code/`) - Source code, projects, components
2. **Document Vault** (`~/Vault/`) - Documentation, binders, notes

**All agents must respect these paths.**

## 📁 Normalized Structure (XDG Compliant)

All uDos data is now organized under `~/.local/` following the XDG Base Directory Specification:

```
~/.local/
├── share/                          # XDG_DATA_HOME
│   ├── udos/                         # uDos data
│   │   ├── hivemind/                 # Hivemind binaries/data
│   │   ├── thinui/                   # ThinUI build
│   │   ├── models/                   # Local LLMs (Ollama)
│   │   └── vault/                    # User documents (moved from ~/Vault)
│   │
│   └── code/                        # Source code (moved from ~/Code)
│       ├── OkAgentDigital/           # Core components
│       ├── Apps/                     # User-facing applications
│       └── Projects/                  # Shared data
│
├── config/                          # XDG_CONFIG_HOME
│   ├── udos/                        # uDos config
│   │   ├── hivemind.yaml            # Hivemind config
│   │   ├── mcp_servers.yaml           # MCP server list
│   │   └── providers.yaml             # AI providers
│   │
│   ├── continue/                   # Continue config
│   │   └── config.json
│   │
│   ├── cline/                      # Cline config
│   │   └── config.yaml
│   │
│   └── ollama/                     # Ollama config
│
├── state/                           # XDG_STATE_HOME
│   ├── udos/                        # uDos state
│   │   ├── logs/                    # All uDos logs
│   │   ├── feeds/                   # Reply feeds
│   │   ├── board.json               # Cline Kanban board
│   │   └── .first-run
│   │
│   └── continue/                   # Continue session history
│       └── sessions/
│
└── cache/                           # XDG_CACHE_HOME
    ├── udos/                        # uDos cache
    │   ├── cargo/                   # Rust build cache
    │   ├── npm/                    # Node modules
    │   └── thinui/                  # Vite cache
    │
    └── ollama/                     # Model cache
```

## 🔗 Symbolic Links for Backward Compatibility

To maintain compatibility with existing tools and scripts, symbolic links are created:

```bash
~/Code/          → ~/.local/share/code/
~/Vault/          → ~/.local/share/udos/vault/
~/.continue/      → ~/.local/config/continue/
~/.cline/         → ~/.local/config/cline/
~/.config/hivemind → ~/.local/config/udos/hivemind/
```

## 🌐 Environment Variables

All paths are accessible via environment variables in `~/.zshrc`:

```bash
# uDos Core Paths (Immutable)
export UDOS_CODE="$HOME/Code"
export UDOS_VAULT="$HOME/Vault"

# Derived Paths
export UDOS_COMPONENTS="$UDOS_CODE/OkAgentDigital"
export UDOS_APPS="$UDOS_CODE/Apps"
export UDOS_PROJECTS="$UDOS_CODE/Projects"
export UDOS_UCORE="$UDOS_CODE/uDosGo"                    # ← uCode core

# Component Shortcuts
export UDOS_HIVEMIND="$UDOS_COMPONENTS/Hivemind"
export UDOS_THINUI="$UDOS_COMPONENTS/ThinUI"
export UDOS_RE3ENGINE="$UDOS_COMPONENTS/Re3Engine"
export UDOS_MCPGATEWAY="$UDOS_COMPONENTS/MCPGateway"
export UDOS_OKAGENT="$UDOS_COMPONENTS/OkAgent"
export UDOS_SNACKBAR="$UDOS_APPS/Snackbar"
export UDOS_MARKSMOTH="$UDOS_APPS/Marksmoth"

# uCode shortcuts
export UDOS_UCODE1="$UDOS_UCORE/uCode1"
export UDOS_UCODE2="$UDOS_UCORE/uCode2"
export UDOS_UCODE3="$UDOS_UCORE/uCode3"
export UDOS_UCODE4="$UDOS_UCORE/uCode4"

# Vault Shortcuts
export UDOS_INBOX="$UDOS_VAULT/inbox"
export UDOS_OUTBOX="$UDOS_VAULT/@outbox"
export UDOS_WORKSPACE="$UDOS_VAULT/@workspace"
export UDOS_BINDER="$UDOS_VAULT/binder"
export UDOS_FEEDS="$UDOS_VAULT/feeds"
export UDOS_UCODE_DOCS="$UDOS_VAULT/uCode"

# XDG Paths
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_STATE_HOME="$HOME/.local/state"
export XDG_CACHE_HOME="$HOME/.cache"

# uDos XDG-specific
export UDOS_DATA="$XDG_DATA_HOME/udos"
export UDOS_CONFIG="$XDG_CONFIG_HOME/udos"
export UDOS_STATE="$XDG_STATE_HOME/udos"
export UDOS_CACHE="$XDG_CACHE_HOME/udos"
export UDOS_BOARD="$UDOS_STATE/board.json"
```

## 📋 Agent Rules

### Rule 1: Never Hardcode Paths

```bash
# ❌ WRONG
cd /Users/fredbook/Code/uDosGo/uCode2

# ✅ RIGHT
cd $UDOS_UCODE2
```

### Rule 2: uDosGo is Core – Do Not Archive

```bash
# ❌ NEVER move or delete uDosGo
# ✅ uDosGo contains uCode1, uCode2, uCode3, uCode4 – ACTIVE DEVELOPMENT
```

### Rule 3: Document Vault is for Markdown, Not Code

```bash
# ✅ Store specs, docs, notes in ~/Vault/
# ❌ Never store code in ~/Vault/
```

### Rule 4: Board File Location

```bash
export UDOS_BOARD="$UDOS_PROJECTS/ucode-board.json"
# Cline Kanban reads from this location
```

### Rule 5: Logs and State Go to `~/.local/state/`

```bash
export UDOS_LOGS="$HOME/.local/state/udos/logs"
export UDOS_FEEDS="$HOME/.local/state/udos/feeds"
```

## 🚀 Benefits of Normalization

| Before | After |
|--------|-------|
| Scattered configs | All under `~/.local/config/` |
| Multiple state folders | All under `~/.local/state/` |
| Hard to backup | Backup `~/.local/` once |
| Confusing for new devs | XDG standard, predictable |
| Mixed data types | Clear separation (share/config/state/cache) |

## 🔧 Migration Commands

```bash
# === Phase 1: Create structure ===
mkdir -p ~/.local/{share,config,state,cache}
mkdir -p ~/.local/share/udos/{hivemind,thinui,models,vault}
mkdir -p ~/.local/share/code/{OkAgentDigital,Apps,Projects}
mkdir -p ~/.local/config/udos
mkdir -p ~/.local/config/{continue,cline,ollama}
mkdir -p ~/.local/state/udos/{logs,feeds}
mkdir -p ~/.local/cache/udos/{cargo,npm,thinui}

# === Phase 2: Move existing data ===
# Source code
mv ~/Code/* ~/.local/share/code/ 2>/dev/null
# Documents
mv ~/Vault/* ~/.local/share/udos/vault/ 2>/dev/null
# Configs
mv ~/.continue ~/.local/config/continue 2>/dev/null
mv ~/.cline ~/.local/config/cline 2>/dev/null
mv ~/.config/hivemind ~/.local/config/udos/hivemind 2>/dev/null
# State
mv ~/Code/Projects/ucode-board.json ~/.local/state/udos/board.json 2>/dev/null

# === Phase 3: Update symlinks (backward compatibility) ===
ln -sf ~/.local/share/code ~/Code
ln -sf ~/.local/share/udos/vault ~/Vault
ln -sf ~/.local/config/continue ~/.continue
ln -sf ~/.local/config/cline ~/.cline

# === Phase 4: Update environment variables ===
cat >> ~/.zshrc << 'EOF'
# uDos XDG paths
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_STATE_HOME="$HOME/.local/state"
export XDG_CACHE_HOME="$HOME/.cache"

# uDos specific
export UDOS_DATA="$XDG_DATA_HOME/udos"
export UDOS_CONFIG="$XDG_CONFIG_HOME/udos"
export UDOS_STATE="$XDG_STATE_HOME/udos"
export UDOS_CACHE="$XDG_CACHE_HOME/udos"
export UDOS_CODE="$XDG_DATA_HOME/code"
export UDOS_VAULT="$UDOS_DATA/vault"
export UDOS_BOARD="$UDOS_STATE/board.json"
EOF

source ~/.zshrc
```

## 📝 Configuration Files

### Continue Config (`~/.local/config/continue/config.json`)

```json
{
  "version": "1.0.0",
  "models": [],
  "experimental": {
    "mcpServers": {
      "hivemind": {
        "command": "npx",
        "args": ["-y", "mcp-remote", "http://localhost:30000/mcp"]
      }
    }
  },
  "dataDir": "~/.local/state/continue"
}
```

### Cline Config (`~/.local/config/cline/config.yaml`)

```yaml
cline:
  model: hivemind
  provider: custom
  apiBase: "http://localhost:30000/v1"
 
kanban:
  boardPath: "~/.local/state/udos/board.json"
 
dataDir: "~/.local/state/cline"
```

### Hivemind Config (`~/.local/config/udos/hivemind.yaml`)

```yaml
server:
  port: 30000
  host: localhost

paths:
  data: "~/.local/share/udos/hivemind"
  state: "~/.local/state/udos"
  logs: "~/.local/state/udos/logs"
  board: "~/.local/state/udos/board.json"

mcp:
  servers_dir: "~/.local/config/udos/mcp_servers"
```

### ThinUI Config (`~/.local/share/code/OkAgentDigital/ThinUI/.env`)

```env
VITE_UDOS_API=http://localhost:30000
VITE_UDOS_WS=ws://localhost:30000
VITE_UDOS_BOARD=~/.local/state/udos/board.json
```

## 🎛️ One-Command Startup

**File:** `~/.local/bin/start-udos`

```bash
#!/bin/bash
# uDos startup script – XDG compliant

export XDG_DATA_HOME="$HOME/.local/share"
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_STATE_HOME="$HOME/.local/state"
export XDG_CACHE_HOME="$HOME/.cache"

cd "$XDG_DATA_HOME/code/OkAgentDigital/Hivemind"
cargo run --release &

cd "$XDG_DATA_HOME/code/OkAgentDigital/ThinUI"
npm run dev &

echo "✅ uDos started"
echo "📍 Dashboard: http://localhost:3000/dashboard"
echo "📍 Board: $XDG_STATE_HOME/udos/board.json"
```

```bash
chmod +x ~/.local/bin/start-udos
export PATH="$HOME/.local/bin:$PATH"
```

## 🔍 Verification Commands

```bash
# Check if spines are correct
echo $UDOS_CODE
echo $UDOS_VAULT
echo $UDOS_UCORE

# List uCode products
ls $UDOS_UCODE1 $UDOS_UCODE2 $UDOS_UCODE3 $UDOS_UCODE4

# List components
ls $UDOS_COMPONENTS

# Open vault binder
cd $UDOS_BINDER

# Show board status
cat $UDOS_BOARD | jq '.tasks[] | {title, status}'
```

## 📋 Summary for All Agents

| What | Where | Env Var |
|------|-------|---------|
| Source code root | `~/Code/` | `$UDOS_CODE` |
| Documents root | `~/Vault/` | `$UDOS_VAULT` |
| uCode core | `~/Code/uDosGo/` | `$UDOS_UCORE` |
| uCode1 (OK Agent) | `~/Code/uDosGo/uCode1/` | `$UDOS_UCODE1` |
| uCode2 (Chat Surface) | `~/Code/uDosGo/uCode2/` | `$UDOS_UCODE2` |
| uCode3 (Dev) | `~/Code/uDosGo/uCode3/` | `$UDOS_UCODE3` |
| uCode4 (Publish) | `~/Code/uDosGo/uCode4/` | `$UDOS_UCODE4` |
| Components | `~/Code/OkAgentDigital/` | `$UDOS_COMPONENTS` |
| Apps | `~/Code/Apps/` | `$UDOS_APPS` |
| Task board | `~/Code/Projects/ucode-board.json` | `$UDOS_BOARD` |
| uCode docs | `~/Vault/uCode/` | `$UDOS_UCODE_DOCS` |
| Logs | `~/.local/state/udos/logs` | `$UDOS_LOGS` |

**These spines are locked. All agents must comply.** 🎯