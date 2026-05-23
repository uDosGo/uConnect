# uDos Ecosystem Map v4.0

## Overview — Flat Architecture

All repos live directly under `~/Code/` — no nested org folders. Each repo is authored under one of three GitHub orgs:

| Org | Prefix | Repos |
|-----|--------|-------|
| **uDosGo** | `u` | uConnect, uServer, uCode1-4, uScript, uSystem, uVector, uPlace |
| **OkAgentDigital** | `Ok` | DevStudio, GoExchange, OkGuide, PublishLane |
| **fredporter** | (none) | Groovebox, SonicScrewdriver, Apps, Vendor, vibe-fresh |

```
┌──────────────────────────────────────────────────────────────────┐
│                    uDos Ecosystem — Layered Architecture           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  uCode4 — Spatial/3D Layer (Python + Three.js)           │    │
│  │  3D worlds, portals, scene composition, camera system    │    │
│  │  Depends on: uCode2 (spatial, sprites), uCode1 (grid)    │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                              │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │  uCode3 — Application Layer (Python + Rust)              │    │
│  │  HomeNest: media server, HA bridge, kiosk UI, installer  │    │
│  │  Depends on: uCode2 (MCP client, vault, feed)            │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                              │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │  uCode2 — Services Layer (Python)                        │    │
│  │  MCP Gateway, Vault Bridge, Feed Spool, Spatial,         │    │
│  │  Sprites/BOBs, ok-seeker, marked                         │    │
│  │  Depends on: uCode1 (grid types, cell addressing)        │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                              │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │  uCode1 — Foundation Layer (Python)                      │    │
│  │  Grid/cell system, BBC BASIC runtime, teletext           │    │
│  │  Depends on: None (pure stdlib)                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Shared Infrastructure                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │    │
│  │  │ Vault    │  │ Compost  │  │ Feed Spool       │       │    │
│  │  │ (3-tier) │  │ (Archive)│  │ (Event Log)      │       │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │    │
│  │  │ Secrets  │  │ Linux    │  │ GitHub Actions   │       │    │
│  │  │ (Store)  │  │ (Server) │  │ (Release Pipe)   │       │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Snackbar │  │ USXD     │  │DevStudio │  │ PublishLane  │    │
│  │ (Rust)   │  │(Electron)│  │ (Bash)   │  │ (TypeScript) │    │
│  │ Daemon   │  │ Desktop  │  │Automation│  │ Publishing   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Component Roles

### Core uCode Layers

| Layer | Language | Role | MCP Role | Port/Socket | Depends On |
|-------|----------|------|----------|-------------|------------|
| **uCode1** | Python | Grid/cell system, BBC BASIC runtime, teletext | **Client** | CLI only | None |
| **uCode2** | Python | MCP Gateway, Vault Bridge, Feed Spool, Spatial, Sprites/BOBs, ok-seeker, marked | **Server** (Unix socket) | `~/.local/share/udos/ucode2.sock` | uCode1 (grid types) |
| **uCode3** | Python + Rust | HomeNest: media server, HA bridge, kiosk UI, installer | **Server** (HTTP) | Port 7890 | uCode2 (MCP client) |
| **uCode4** | Python + Three.js | 3D worlds, portals, scene composition, camera | Future | Future | uCode2 (spatial), uCode1 (grid) |

### Applications

| Component | Language | Role | MCP Role |
|-----------|----------|------|----------|
| **Snackbar** | Rust | Universal runtime & container workflow orchestrator (macOS + Linux) | **Server** (Unix socket) |
| **USXD** | Electron/React | Desktop app — surfaces for all uCode layers | **Client** (MCP) |
| **DevStudio** | Bash | Development automation, agentic workflows | **Client** (MCP) |
| **OkGuide** | Python | Local LLM assistant (→ uCode1) | **Client** (uses uCode1) |
| **PublishLane** | TypeScript | Publishing pipeline (→ uCode2) | **Client** (MCP to uCode2) |
| **GoExchange** | Go | System utilities (→ HomeNest patterns) | **Client** (MCP) |

### Deprecated / Archived

| Component | Reason | Replacement |
|-----------|--------|-------------|
| **Hivemind** | MCP gateway — Snackbar replaces | Snackbar |
| **Re3Engine** | Reasoning engine — MCP tools direct in apps | `udo` CLI |
| **ThinUI** | Python UI bridge + API server — merged into uCode1 core_py | `core_py.thinui` |
| **RusTui** | Terminal UI — doesn't fit any uCode surface | Archived |
| **MCPGateway** | Node.js MCP gateway — Snackbar replaces | Snackbar |

## MCP Architecture

### Unified Gateway (v3.0)

All MCP traffic flows through a **single Unix socket** — the uCode2 MCP Gateway at `~/.local/share/udos/ucode2.sock`. The gateway routes requests to the appropriate backend:

```
                    ┌──────────────────────────────────┐
                    │   uCode2 MCP Gateway (Python)     │
                    │   ~/.local/share/udos/ucode2.sock │
                    │   Length-prefixed JSON-RPC 2.0    │
                    └──────┬───────────────┬───────────┘
                           │               │
              ┌────────────┼───────┐       │
              │            │       │       │
     ┌────────▼───┐ ┌─────▼─────┐ │ ┌─────▼──────────┐
     │ Local      │ │ core.*    │ │ │ homenest.*      │
     │ Python     │ │ methods   │ │ │ methods         │
     │ Handlers   │ │           │ │ │                 │
     │            │ │ uCode3    │ │ │ uCode3          │
     │ vault.*    │ │ Rust MCP  │ │ │ HomeNest Rust   │
     │ feed.*     │ │ core.sock │ │ │ homenest.sock   │
     │ spatial.*  │ │           │ │ │                 │
     │ seek.*     │ │           │ │ │ media.*         │
     │ grid.*     │ │           │ │ │ automation.*    │
     │ marked.*   │ │           │ │ │ tv.*            │
     └────────────┘ └───────────┘ │ │ system.*        │
                                  │ └─────────────────┘
                                  │
                          ┌───────┼──────────┐
                          │       │          │
                    ┌─────▼──┐ ┌──▼───┐ ┌───▼─────┐
                    │USXD    │ │Dev   │ │Publish   │
                    │(Elect) │ │Studio│ │Lane      │
                    └────────┘ └──────┘ └─────────┘
```

### Socket Layout

| Socket | Server | Protocol | Purpose |
|--------|--------|----------|---------|
| `~/.local/share/udos/ucode2.sock` | uCode2 Python Gateway | Length-prefixed JSON-RPC 2.0 | **Single client entry point** |
| `~/.local/share/udos/mcp/core.sock` | uCode3 Rust MCP | Newline-delimited JSON | Core vault/ok-seeker backend |
| `~/.local/share/udos/mcp/homenest.sock` | uCode3 Rust HomeNest MCP | Newline-delimited JSON | Media/TV/automation backend |

### Method Namespaces

| Prefix | Handler | Backend |
|--------|---------|---------|
| `vault.*` | Local Python | uCode2 VaultBridge |
| `feed.*` | Local Python | uCode2 FeedSpool |
| `spatial.*` | Local Python | uCode2 Spatial |
| `seek.*` | Local Python | uCode2 OkSeeker |
| `grid.*` | Local Python | uCode2 GridCore |
| `marked.*` | Local Python | uCode2 Marked |
| `core.*` | Routed to Rust | uCode3 core.sock |
| `homenest.*` | Routed to Rust | uCode3 homenest.sock |
| `ping`, `status`, `list_methods` | Built-in | Gateway itself |

## Release Pipeline

All components share the same release pipeline via `config/release`:

```bash
release all v1.0.0    # Tags + pushes all components
```

| Component | Tag Pattern | Artifact | Workflow |
|-----------|-------------|----------|----------|
| uCode1 | `ucode1-*` | Python wheel | `release-python.yaml` |
| uCode2 | `ucode2-*` | Python package | `release-python.yaml` |
| uCode3 | `ucode3-*` | Python + Rust | `release-python.yaml` + `release-rust.yaml` |
| uCode4 | `ucode4-*` | Python wheel | `release-python.yaml` |
| Snackbar | `snackbar-*` | Rust binary | `release-rust.yaml` |
| USXD | `usxd-*` | Electron app | `release-node.yaml` |
| OkGuide | `okguide-*` | Python wheel | `release-python.yaml` |
| PublishLane | `publishlane-*` | npm tarball | `release-node.yaml` |
| uSystem | `usystem-*` | Rust crate | `release-rust.yaml` |
| GoExchange | `goexchange-*` | Go binary | `release-go.yaml` |
| DevStudio | `devstudio-*` | Bash scripts | `release-scripts.yaml` |

## Vault Structure — Three-Tier Knowledge System

```
~/Code/vault-global/              # 🌐 Global — immutable reference knowledge
├── concepts/                     # Universal concepts, patterns, principles
├── device-library/               # Device specifications & configurations
├── knowledge/                    # Cross-repo knowledge base
├── learning/                     # Learning resources & curricula
└── templates/                    # Reusable templates

~/Code/vault-shared/              # 🤝 Shared — team/collaboration knowledge
├── @feeds/                       # Shared feed data

~/Code/vault-user/                # 👤 User — personal knowledge (git repo)
├── @inbox/                       # Incoming documents (dropbox)
├── @outbox/                      # Outgoing documents (to publish)
├── @feeds/                       # Feed inbox
├── @user/                        # User data
├── @projects/                    # Active projects
├── @sandbox/                     # Sandbox/experimental content
├── @transport/                   # Transport layer
└── {system}/                     # System data (contacts, feeds, MCP, spools)
```

## Shared Infrastructure

| Service | Location | Role |
|---------|----------|------|
| **Secret Store** | Linux Server `:30001` | Encrypted secrets (API keys, tokens) |
| **Feed Spool** | `~/.local/spool/feed/` | Event log (JSON entries) |
| **Compost** | `~/Vault/.compost/` | Elastic trash (archive, don't delete) |
| **Linux Server** | `wizard@192.168.20.11` | Ollama LLM, HomeNest server |
| **GitHub Actions** | `.github/workflows/` | Release pipeline for all components |

---

## Repository Structure — Flat Layout

All repos live directly under `~/Code/` — no nested org folders.

### uDosGo Org — Core uCode Infrastructure

| Repo | Path | Description |
|------|------|-------------|
| **uConnect** | `~/Code/uConnect/` | Shared infrastructure (udo CLI, USXD, skills, fonts) |
| **uServer** | `~/Code/uServer/` | Server-side services (Snackbar, monitoring) |
| **uCode1** | `~/Code/uCode1/` | Foundation: BBC BASIC, teletext, local LLM |
| **uCode2** | `~/Code/uCode2/` | Services: MCP Gateway, Vault Bridge, Feed Spool |
| **uCode3** | `~/Code/uCode3/` | Application: HomeNest, HA bridge, kiosk UI |
| **uCode4** | `~/Code/uCode4/` | Spatial/3D: Three.js, scene composition |
| **uScript** | `~/Code/uScript/` | Scripting utilities & helpers |
| **uSystem** | `~/Code/uSystem/` | System-level tooling |
| **uVector** | `~/Code/uVector/` | Vector/embedding utilities |

### OkAgentDigital Org — Agent/Component Ecosystem

| Repo | Path | Description |
|------|------|-------------|
| **DevStudio** | `~/Code/DevStudio/` | Development automation, agentic workflows, docs |
| **uPlace** | `~/Code/uPlace/` | Location-aware services |
| **GoExchange** | `~/Code/GoExchange/` | Go-based exchange services |
| **OkGuide** | `~/Code/OkGuide/` | Guide documentation |
| **PublishLane** | `~/Code/PublishLane/` | Publishing pipeline |

### fredporter Org — Personal/User Repos

| Repo | Path | Description |
|------|------|-------------|
| **Groovebox** | `~/Code/Groovebox/` | Music/sound tools |
| **SonicScrewdriver** | `~/Code/SonicScrewdriver/` | Multi-tool CLI utilities |
| **Apps** | `~/Code/Apps/` | Application projects |
| **Vendor** | `~/Code/Vendor/` | Third-party vendor code |
| **vibe-fresh** | `~/Code/vibe-fresh/` | Fresh vibe/skill projects |

### Vaults

| Vault | Path | Purpose |
|-------|------|---------|
| **Global** | `~/Code/vault-global/` | Immutable reference knowledge |
| **Shared** | `~/Code/vault-shared/` | Team/collaboration knowledge |
| **User** | `~/Code/vault-user/` | Personal knowledge (git repo) |

### Archived

| Path | Purpose |
|------|---------|
| `~/Code/_archived/` | Archived repos & legacy content |

---

*Last Updated: 2026-05-20*
*Version: 4.0.0*
