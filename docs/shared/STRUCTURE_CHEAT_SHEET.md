# uDos/Dev Structure Cheat Sheet

## 📁 Directory Structure

### Flat Architecture — Single-Level Repo Layout

All repos live directly under `~/Code/` — no nested org folders. Each repo is authored under one of three GitHub orgs:

| Org | Prefix | Purpose |
|-----|--------|---------|
| **uDosGo** | `u` | Core uCode infrastructure (uConnect, uServer, uCode1-4, uScript, uSystem, uVector) |
| **OkAgentDigital** | `Ok` | Agent/component ecosystem (DevStudio, uPlace, GoExchange, OkGuide, PublishLane) |
| **fredporter** | (none) | Personal/user repos (Groovebox, SonicScrewdriver, Apps, Vendor, vibe-fresh) |

```
~/Code/
├── _archived/            # 📦 Archived repos & legacy content (not in active rotation)
├── DevStudio/            # 🛠 Development framework & automation (OkAgentDigital)
├── uConnect/             # 🔗 Shared infrastructure (udo CLI, udoui, skills, fonts) (uDosGo)
├── uServer/              # 🖥 Server-side services (Snackbar, monitoring) (uDosGo)
├── uPlace/               # 📍 Location-aware services (OkAgentDigital)
├── uCode1/               # 🧱 Foundation: BBC BASIC, teletext, local LLM (uDosGo)
├── uCode2/               # ⚙️ Services: MCP Gateway, Vault Bridge, Feed Spool (uDosGo)
├── uCode3/               # 🏠 Application: HomeNest, HA bridge, kiosk UI (uDosGo)
├── uCode4/               # 🌌 Spatial/3D: Three.js, scene composition (uDosGo)
├── uScript/              # 📜 Scripting utilities & helpers (uDosGo)
├── uSystem/              # ⚡ System-level tooling (uDosGo)
├── uVector/              # 🧠 Vector/embedding utilities (uDosGo)
├── Groovebox/            # 🎵 Music/sound tools (fredporter)
├── SonicScrewdriver/     # 🔧 Multi-tool CLI utilities (fredporter)
├── GoExchange/           # 🔄 Go-based exchange services (OkAgentDigital)
├── OkGuide/              # 📚 Guide documentation (OkAgentDigital)
├── PublishLane/          # 📤 Publishing pipeline (OkAgentDigital)
├── Apps/                 # 📱 Application projects (fredporter)
├── Vendor/               # 📦 Third-party vendor code (fredporter)
├── vibe-fresh/           # 🌿 Fresh vibe/skill projects (fredporter)
├── vault-global/         # 🌐 Global knowledge (shared across all repos)
├── vault-shared/         # 🤝 Shared vault (team/collaboration knowledge)
└── vault-user/           # 👤 User vault (personal knowledge, git repo)
```

### Vault Architecture — Three-Tier Knowledge System

```
~/Code/vault-global/      # 🌐 Global — immutable reference knowledge
├── concepts/             # Universal concepts, patterns, principles
├── device-library/       # Device specifications & configurations
├── knowledge/            # Cross-repo knowledge base
├── learning/             # Learning resources & curricula
└── templates/            # Reusable templates

~/Code/vault-shared/      # 🤝 Shared — team/collaboration knowledge
├── @feeds/               # Shared feed data

~/Code/vault-user/        # 👤 User — personal knowledge (git repo)
├── @inbox/               # Incoming documents (dropbox)
├── @outbox/              # Outgoing documents (to publish)
├── @feeds/               # Feed inbox
├── @user/                # User data
├── @projects/            # Active projects
├── @sandbox/             # Sandbox/experimental content
├── @transport/           # Transport layer
└── {system}/             # System data (contacts, feeds, MCP, spools)
```

### DevStudio (`~/Code/DevStudio/`)
- **Purpose**: Development framework, automation, agentic workflows
- **Structure**:
  ```
  ~/Code/DevStudio/
  ├── docs/              # Framework documentation
  ├── scripts/           # Automation scripts
  ├── config/            # Configuration files
  ├── specs/             # Specifications
  ├── bin/               # Binary wrappers
  ├── global/            # Global config templates
  ├── user/              # User config templates
  ├── dev/               # Development rounds & notes
  ├── docker/            # Docker configurations
  ├── k8s/               # Kubernetes manifests
  ├── monitoring/        # Monitoring configurations
  ├── lexicons/          # Lexicon/vocabulary files
  ├── examples/          # Example files
  ├── tests/             # Test suites
  ├── vibe-skills/       # Vibe coding skills
  ├── github-templates/  # GitHub templates
  └── DevStudio.code-workspace  # VS Code workspace
  ```

## 🔑 Key Principles

1. **Flat structure** — All repos at `~/Code/`, no nested org folders
2. **Three vaults** — Global (immutable), Shared (team), User (personal git)
3. **Three orgs** — uDosGo (infra), OkAgentDigital (agents), fredporter (personal)
4. **DevStudio is for framework** — Automation, scripts, config, specs
5. **_archived for legacy** — Archived repos go to `~/Code/_archived/`
6. **NEVER commit**: `node_modules/`, `vendor/`, `.local/`, `.env`, build artifacts
7. **XDG compliance**: `~/.config/udos/` for config, `~/.local/share/udos/` for state

## 🚀 Quick Reference

### Find documentation
```bash
# Framework docs
ls ~/Code/DevStudio/docs/

# Repo-specific docs
ls ~/Code/uConnect/docs/
ls ~/Code/uServer/docs/

# Vault knowledge
ls ~/Code/vault-global/knowledge/
ls ~/Code/vault-user/@inbox/
```

### Validate structure
```bash
ls ~/Code/          # All repos at top level
ls ~/Code/_archived/   # Archived content
```

## 📋 Where Things Go

| Item | Location |
|------|----------|
| Framework docs | `~/Code/DevStudio/docs/` |
| uCode infrastructure | `~/Code/uConnect/`, `~/Code/uCode1-4/`, `~/Code/uServer/` |
| Agent ecosystem | `~/Code/uPlace/`, `~/Code/GoExchange/`, `~/Code/OkGuide/` |
| Personal projects | `~/Code/Groovebox/`, `~/Code/SonicScrewdriver/`, `~/Code/Apps/` |
| Global knowledge | `~/Code/vault-global/` |
| Shared knowledge | `~/Code/vault-shared/` |
| User knowledge | `~/Code/vault-user/` |
| Archived repos | `~/Code/_archived/` |

## 🎯 Remember This!

1. **Flat ~/Code/** — No nested org folders, all repos at top level
2. **Three vaults** — Global (immutable), Shared (team), User (personal)
3. **Three orgs** — uDosGo, OkAgentDigital, fredporter
4. **DevStudio = Framework** — Automation, scripts, config, specs
5. **_archived = Legacy** — Archived repos go here
6. **XDG paths**: `~/.config/udos/` and `~/.local/share/udos/`

**Saved in:** `~/Code/DevStudio/docs/STRUCTURE_CHEAT_SHEET.md`
