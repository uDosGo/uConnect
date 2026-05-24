# uDos DevFlow Roadmap — uConnect / uCode Ecosystem

> **Last Updated:** 2026-05-24  
> **Version:** 1.0.0  
> **Status:** ✅ Active — Single source of truth for development workflow & phased execution

---

## Table of Contents

1. [Ecosystem Overview](#1-ecosystem-overview)
2. [Development Philosophy](#2-development-philosophy)
3. [Phase Status Summary](#3-phase-status-summary)
4. [Phase 1 — Foundation & Core Infrastructure](#4-phase-1--foundation--core-infrastructure)
5. [Phase 2 — Snack & Relic System](#5-phase-2--snack--relic-system)
6. [Phase 3 — Binder & MDX Runtime](#6-phase-3--binder--mdx-runtime)
7. [Phase 4 — USX/UDO & ASCII Grid Parser](#7-phase-4--usxudo--ascii-grid-parser)
8. [Phase 5 — Testing & Documentation](#8-phase-5--testing--documentation)
9. [Phase 6 — Deployment & Release](#9-phase-6--deployment--release)
10. [Phase 7 — uCode3 Rust Performance & uCode4 3D/Voxel](#10-phase-7--ucode3-rust-performance--ucode4-3dvoxel)
11. [Phase 8 — AI & Metaverse](#11-phase-8--ai--metaverse)
12. [Phase 9 — WordPress Integration & Feed System](#12-phase-9--wordpress-integration--feed-system)
13. [Phase 10 — Ecosystem & Community](#13-phase-10--ecosystem--community)
14. [Development Workflow Standards](#14-development-workflow-standards)
15. [Architecture & Layer Boundaries](#15-architecture--layer-boundaries)
16. [Release Pipeline](#16-release-pipeline)
17. [Quick Reference](#17-quick-reference)

---

## 1. Ecosystem Overview

### Layered Architecture

```
uCode1 ──► uCode2 ──► uCode3 ──► uCode4
(Foundation) (Services) (Application) (Spatial/3D)
```

| Layer | Repo | Language | Size | Role | Depends On |
|-------|------|----------|------|------|------------|
| **uCode1** | `uDosGo/uCode1` | Python | 8.0M / 25K lines | Grid/cell system, BBC BASIC runtime, teletext | None |
| **uCode2** | `uDosGo/uCode2` | Python | 2.8K lines src | MCP Gateway, Vault Bridge, Feed Spool, Spatial, Sprites/BOBs | uCode1 (grid types) |
| **uCode3** | `uDosGo/uCode3` | Python + Rust | 6.3M / 11K lines | HomeNest: media server, HA bridge, kiosk UI | uCode2 (MCP client) |
| **uCode4** | `uDosGo/uCode4` | Python + Three.js | 1.0M / 1K lines | 3D worlds, portals, scene composition | uCode2 (spatial), uCode1 (grid) |

### Boundary Rules

- **uCode1** → Foundation. No dependencies. Owns grid/cell system, BASIC runtime, teletext.
- **uCode2** → Services. May import from uCode1. Owns MCP, vault, feed, spatial, sprites/BOBs.
- **uCode3** → Application. May import from uCode2. Owns HomeNest (media, HA, kiosk).
- **uCode4** → Spatial/3D. May import from uCode2 and uCode1. Owns 3D worlds, portals.

### Repository Layout

All repos live directly under `~/Code/` — no nested org folders:

| Org | Prefix | Repos |
|-----|--------|-------|
| **uDosGo** | `u` | uConnect, uServer, uCode1-4, uScript, uSystem, uVector, uPlace |
| **OkAgentDigital** | `Ok` | DevStudio, GoExchange, OkGuide, PublishLane |
| **fredporter** | (none) | Groovebox, SonicScrewdriver, Apps, Vendor, vibe-fresh |

---

## 2. Development Philosophy

### Python-First, Rust-When-Needed

```
1. Prototype in Python  ──►  2. Profile & identify hot paths
         │                              │
         ▼                              ▼
3. Ship with Python         4. Move hot paths to Rust
         │                              │
         └─────────── 5. Benchmark & verify ──────────┘
```

### Three-Zone Development Model

| Zone | Path | Purpose | Git Status |
|------|------|---------|------------|
| **SYSTEM** | `/src/`, `/docs/` | Production code & docs | ✅ Tracked |
| **LOCAL** | `.local/` | Thinking, notes, scratch | 🔒 Ignored |
| **COMPOST** | `.compost/` | Discarded/old code | 🔒 Ignored |

### Dev Loop

```
.local (think) → TASKS.md (define) → /src (build) → verify → commit → .compost (discard)
```

---

## 3. Phase Status Summary

| Phase | Title | Status | Timeline |
|-------|-------|--------|----------|
| **1** | Foundation & Core Infrastructure | 🔄 In Progress (3/7 items) | Months 1-3 |
| **2** | Snack & Relic System | ✅ Complete | Months 4-6 |
| **3** | Binder & MDX Runtime | ✅ Complete | Months 7-9 |
| **4** | USX/UDO & ASCII Grid Parser | 🔄 Mostly Complete (4/5 items) | Months 10-12 |
| **5** | Testing & Documentation | 🔄 Mostly Complete | Months 13-15 |
| **6** | Deployment & Release | 🔄 Partial (CI/CD done) | Months 16-18 |
| **7** | uCode3 Rust & uCode4 3D/Voxel | ❌ Not Started | Months 19-21 |
| **8** | AI & Metaverse | ❌ Not Started | Months 22-24 |
| **9** | WordPress Integration & Feed System | ❌ Not Started | Months 25-27 |
| **10** | Ecosystem & Community | ❌ Not Started | Months 28-30+ |

---

## 4. Phase 1 — Foundation & Core Infrastructure

> **Status:** 🔄 In Progress (3 items remaining)  
> **Timeline:** Months 1-3

### ✅ Complete Items

#### 1.1 Core CLI
- `ucode` CLI with 11 commands
- `usxd_cli` with 10 commands
- Grid subcommands

#### 1.2 Vault v3
- Layered architecture (user/shared/global)
- Vault union mount
- Publish/subscribe system

#### 1.3 Snack System
- Snackbar module in uServer
- SnackMachine runtime
- Skills, Snacks, Spices trinity

#### 1.4 Binder Foundation
- Binder structure, inheritance, state management
- Registry, serialization, integrity, CLI

### 🔄 In Progress Items

#### 1.5 Performance Benchmarking
- **Location:** `packages/udos/commands/bench.ts`
- **Status:** Python vs Rust benchmark framework exists
- **Remaining:** 7 benchmark definitions across 5 categories, JSON/CSV output, warmup iterations
- **Run:** `npx tsx packages/udos/commands/bench.ts`

#### 1.6 CONDENSE v3
- **Location:** `packages/udos/commands/condense.ts`
- **Status:** AI-assisted content merging framework exists
- **Remaining:** 3 strategies (ai, rule, hybrid), target 30-50% reduction with semantic preservation
- **Integration:** OpenAI API with rule-based fallback

#### 1.7 Dev Mode
- **Location:** `packages/udos/commands/devmode.ts`
- **Status:** Hot reload development server scaffolded
- **Remaining:** File watcher with debounce, auto-build on change, dev server with health API

### 📋 Phase 1 Action Items

- [ ] Complete bench.ts — finalize benchmark definitions, add CI integration
- [ ] Complete condense.ts — wire up AI strategies, test reduction targets
- [ ] Complete devmode.ts — implement file watcher, auto-build, health API
- [ ] Write tests for all three remaining components
- [ ] Update phase-setup/phase1/setup.sh to reflect completion

---

## 5. Phase 2 — Snack & Relic System

> **Status:** ✅ Complete  
> **Timeline:** Months 4-6

### ✅ Completed Items

#### 2.1 Snackbar Module
- Universal runtime/automator in uServer
- Snacks (macOS), Spices (Linux), Skills (cross-platform)
- Snackbox container format
- SnackMachine runtime with REST API + MCP + CLI

#### 2.2 Relic Vault
- Relic storage and retrieval
- Version tracking
- Cross-referencing

#### 2.3 uCode Container System
- SNACK: ACS Emulator
- SPICE: Linux Systemd Units
- SKILL: Cross-platform Python/TS

#### 2.4 Integration
- Snackbar ↔ Relic Vault integration
- uCode1 ↔ uCode2 ↔ uCode3 ↔ uCode4 pipeline
- opsui SnackMachine surface

---

## 6. Phase 3 — Binder & MDX Runtime

> **Status:** ✅ Complete  
> **Timeline:** Months 7-9

### ✅ Completed Items

#### 3.1 Binder Implementation
- Binder structure, inheritance, state management
- Registry, serialization, integrity, CLI

#### 3.2 MDX Runtime
- `<Snack>` shortcode support in MDX
- Snack resolution and execution
- Snack output rendering (text, JSON, HTML)
- Error handling with fallback blocks

#### 3.3 Story Format
- `save_binder` action with namespace/tags support
- Story data saving to binder (`.binder/` directory)
- Execution tracking (execution ID, step results, duration)
- Error handling (`on_error` handlers, step-level capture)
- JSON and Markdown story format support
- Dry-run mode, template generation, validation, listing
- Example story: `stories/example.story.json`
- **Run:** `udo story run|validate|list|template`

---

## 7. Phase 4 — USX/UDO & ASCII Grid Parser

> **Status:** 🔄 Mostly Complete (4/5 items)  
> **Timeline:** Months 10-12

### ✅ Completed Items

#### 4.1 USX/UDO Implementation
- Full pipeline: format spec, document structure
- Section management, registry, serialization
- Format converters, ASCII grid parser
- Component mapping, grid rendering in TUI
- CLI commands, ThinUI integration
- 28-test comprehensive suite
- Canonical specs: `uCode1/docs/specs/usx/` (USX)
- Canonical specs: `uCode1/docs/specs/udo/` (UDO)

#### 4.2 ThinUI Integration
- ThinUI is a Python bridge + API server (transport layer)
- External GUI app: UniversalSurfaceXD USXD-app (Electron)
- ASCII grid rendering in ThinUI (Flask API + browser surface)
- Grid editing via Monodraw.app
- Decluttered VS Code workspace

#### 4.3 Grid & Spatial Hierarchy
- `.state/cells/` directory with UDX addressing
- `ucode cell` commands
- Cube storage format
- Feed spool archiving using Cells

#### 4.4 Lexicon & Character System
- 128-Character ANSI Set
- Emoji Overlays, Word Aliases
- Rendering priority system
- Command/Snack/Alias Slots

### ❌ Not Started

#### 4.5 Architecture Evolution
- [ ] Document Python/Rust core architecture (see `CORE_ARCHITECTURE.md` for progress)
- [ ] Create integration guides for uCode1 + uCode3
- [ ] Develop performance benchmarking framework
- [ ] Establish hybrid development workflow

### 📋 Phase 4 Action Items

- [ ] Complete Architecture Evolution documentation
- [ ] Create integration guide for Python/Rust boundary
- [ ] Establish performance benchmarking as CI gate
- [ ] Update phase-setup/phase4/setup.sh to reflect completion

---

## 8. Phase 5 — Testing & Documentation

> **Status:** 🔄 Mostly Complete  
> **Timeline:** Months 13-15

### ✅ Completed Items

#### 5.1 Testing
- 28 end-to-end tests for USXD pipeline
- 13 unit tests for Snack & Relic system
- 117 integration tests across all systems
  - Narrator (20), Lexicon (16), Character (28)
  - MDX (15), Cell (38)

#### 5.2 Documentation
- API reference (`docs/api-reference.md`)
- Developer guide (`docs/dev-guide.md`)
- User manual (`docs/user-guide.md`)
- Troubleshooting guide (`docs/troubleshooting.md`)

### ❌ Remaining

- [ ] Additional end-to-end tests needed
- [ ] Test coverage for edge cases in all systems
- [ ] Performance regression test suite

### 📋 Phase 5 Action Items

- [ ] Add E2E tests for remaining systems
- [ ] Set up coverage reporting in CI
- [ ] Create performance regression detection
- [ ] Update phase-setup/phase5/setup.sh

---

## 9. Phase 6 — Deployment & Release

> **Status:** 🔄 Partial (CI/CD done, releases pending)  
> **Timeline:** Months 16-18

### ✅ Completed Items

#### 6.1 CI/CD Pipeline
- Python: multi-version (3.10-3.13), ruff lint, pytest, coverage
- Rust: cargo build/test/clippy/fmt on uCode2 workspace
- ThinUI: npm ci + npm run build
- Release: Python wheel + Rust binaries on tagged releases
- Release management: `make release VERSION=x.y.z`

### ❌ Not Started

#### 6.2 Remaining Items
- [ ] Add update notifications with version compatibility checks
- [ ] Create hybrid build system (Python + Rust components)

#### 6.3 Official Releases
- [ ] uCode1 v1.0 official release (Python core)
- [ ] uCode3 v0.1 alpha release (Rust performance components)
- [ ] Community call to showcase Python migration and Rust integration
- [ ] Gather user feedback on performance characteristics
- [ ] Plan next steps for hybrid architecture evolution

### 📋 Phase 6 Action Items

- [ ] Implement update notification system
- [ ] Create hybrid build pipeline (Python + Rust)
- [ ] Plan and execute uCode1 v1.0 release
- [ ] Plan and execute uCode3 v0.1 alpha release
- [ ] Update phase-setup/phase6/setup.sh

---

## 10. Phase 7 — uCode3 Rust Performance & uCode4 3D/Voxel

> **Status:** ❌ Not Started  
> **Timeline:** Months 19-21

### 📋 Planned Items

#### 7.1 Rust Core Migration
- [ ] Port performance-critical Python paths to Rust
- [ ] Implement zero-copy grid parsing
- [ ] Add SIMD-accelerated grid transformations
- [ ] Create Rust FFI bridge for Python

#### 7.2 3D/Voxel Rendering
- [ ] Console rendering pipeline (scaled ASCII → framebuffer)
- [ ] 3D voxel rendering for uCode4
- [ ] Octree-based 3D spatial index
- [ ] L100–899 spatial layer system completion

#### 7.3 Input Systems
- [ ] Game controller input layer (SDL2 abstraction)
- [ ] Layback computing mode (couch/TV UI with controller)
- [ ] Tablet touch gestures (swipe, pinch, tap)
- [ ] Voice command input

---

## 11. Phase 8 — AI & Metaverse

> **Status:** ❌ Not Started  
> **Timeline:** Months 22-24

### 📋 Planned Items

#### 8.1 AI Features
- [ ] AI-powered features (Oracle Trinity)
  - Oracle of Knowledge — Vault search, semantic retrieval, Q&A
  - Oracle of Creation — Content/code/story generation
  - Oracle of Insight — Pattern recognition, anomaly detection
- [ ] Multidimensional knowledge spaces
- [ ] AR/VR portal navigation

#### 8.2 Centralized LLM Architecture
- [ ] Linux Server Ollama deployment (DeepSeek Coder 33B, Llama 3 70B, etc.)
- [ ] Tiny local fallback LLM (~100MB) for offline/basic operations
- [ ] Provider Router (remote → local → fallback → cloud API)
- [ ] uServer as LLM Proxy (model routing, caching, rate limiting)

#### 8.3 Metaverse Publishing
- [ ] Build plugin ecosystem
- [ ] Create theme marketplace
- [ ] Develop integration partners
- [ ] Build community
- [ ] Console store deployment
- [ ] App store deployment

---

## 12. Phase 9 — WordPress Integration & Feed System

> **Status:** ❌ Not Started  
> **Timeline:** Months 25-27

### 📋 Planned Items

#### 9.1 WordPress Bridge
- [ ] WordPress REST API integration
- [ ] Content sync between uDos and WordPress
- [ ] WordPress plugin for uDos content blocks
- [ ] Webhook-based content publishing

#### 9.2 Feed Aggregation
- [ ] Multi-source feed aggregation
- [ ] Feed filtering and categorization
- [ ] Feed-to-binder content pipeline
- [ ] Scheduled feed polling

#### 9.3 Content Sync
- [ ] Bidirectional content sync
- [ ] Conflict resolution
- [ ] Version-aware content updates
- [ ] Media asset management

---

## 13. Phase 10 — Ecosystem & Community

> **Status:** ❌ Not Started  
> **Timeline:** Months 28-30+

### 📋 Planned Items

#### 10.1 Plugin Ecosystem
- [ ] Plugin SDK and API
- [ ] Plugin registry and marketplace
- [ ] Plugin sandboxing and security
- [ ] Plugin version management

#### 10.2 Theme Marketplace
- [ ] Theme system for all surfaces
- [ ] Theme creation tools
- [ ] Theme distribution and sharing
- [ ] Premium theme support

#### 10.3 Community
- [ ] Community forums and discussion
- [ ] Contribution guidelines and templates
- [ ] Community showcase
- [ ] Regular community calls

#### 10.4 Store Deployment
- [ ] Console store deployment
- [ ] App store deployment (macOS App Store)
- [ ] In-app purchases and licensing
- [ ] Analytics and telemetry

---

## 14. Development Workflow Standards

### 14.1 Universal Dev Workflow

Every repo should follow this structure:

```
README.md          # Entry point
DEV.md             # Working method
TASKS.md           # Active work tracking
AGENTS.md          # Agent instructions
/src/              # Implementation
/docs/             # Canonical documentation
.local/            # Private thinking (gitignored)
.compost/          # Discarded material (gitignored)
```

### 14.2 Task Management

**TASKS.md** is the single source of active work:

```markdown
## Backlog
- [ ] [TASK-001] Build grid renderer #feature #core
  ↳ Scope: renderer.ts
  ↳ Outcome: supports dynamic columns

## In Progress
- [ ] [TASK-002] Refactor parser #refactor
  ↳ Depends: TASK-001

## Blocked
- [ ] [TASK-003] Deploy to production #infra
  ↳ Blocked by: DNS configuration

## Done
- [x] Setup repo structure #docs
```

### 14.3 Pre-Commit Checklist

- [ ] Feature works as expected
- [ ] Tested main path and basic error path
- [ ] No leftover debug noise
- [ ] No dead code in /src
- [ ] Correct file placement (/src, /docs)
- [ ] Old code moved to .compost/
- [ ] Task moved to correct section in TASKS.md
- [ ] Commit represents one clear change
- [ ] Message is understandable in one line

### 14.4 Logging Standards

```
[SCOPE] message
```

Examples:
```
[BOOT] starting dev server
[DB] loaded contacts.db
[VIEW] rendered story frame
[ERROR] failed to parse task metadata
```

### 14.5 Console Tooling Standards

Each repo should provide:
- `npm run dev` or equivalent — primary dev command
- `npm test` or equivalent — primary test command
- `npm run build` or equivalent — primary build/validation command

---

## 15. Architecture & Layer Boundaries

### 15.1 MCP Architecture

All MCP traffic flows through a **single Unix socket** — the uCode2 MCP Gateway:

```
Socket: ~/.local/share/udos/ucode2.sock
Protocol: Length-prefixed JSON-RPC 2.0
```

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

### 15.2 USX Surface Architecture

Each surface is a standalone Vite application:

| Surface | Port | Purpose | Framework |
|---------|------|---------|-----------|
| **ui** (Hub) | 5173 | Index page with 5 surface cards | React/TypeScript |
| **proseui** | 5174 | Prose editor, kanban, chat | React/TypeScript |
| **code3ui** | 5175 | Code editor v3 | React/TypeScript |
| **code4ui** | 5176 | Code editor v4 | React/TypeScript |
| **opsui** | 5177 | Server operations | React/TypeScript |
| **gridui** | 5178 | Grid workspace | Vue 3 |

### 15.3 Python/Rust Hybrid Architecture

| Component | Language | Location | Purpose |
|-----------|----------|----------|---------|
| uCode1 Core | Python | `uCode1/core_py/` | Primary development, rapid iteration |
| uCode3 Core | Rust | `uCode3/core/` | Performance-critical components |
| Integration | Python + Rust | `uCode1/core_py/integration/` | FFI bridge |

**Decision Matrix:**

| Metric | Action |
|--------|--------|
| < 10ms per call | Keep Python |
| 10-100ms per call | Consider Rust if called frequently |
| > 100ms per call | Strong candidate for Rust |
| Called 1000+ times | Strong candidate for Rust |

### 15.4 Vault Structure — Three-Tier Knowledge System

```
~/Code/vault-global/     # 🌐 Global — immutable reference knowledge
~/Code/vault-shared/     # 🤝 Shared — team/collaboration knowledge
~/Code/vault-user/       # 👤 User — personal knowledge (git repo)
```

---

## 16. Release Pipeline

### 16.1 Tag Patterns

| Component | Tag Pattern | Artifact | Workflow |
|-----------|-------------|----------|----------|
| uCode1 | `ucode1-*` | Python wheel | `release-python.yaml` |
| uCode2 | `ucode2-*` | Python package | `release-python.yaml` |
| uCode3 | `ucode3-*` | Python + Rust | `release-python.yaml` + `release-rust.yaml` |
| uCode4 | `ucode4-*` | Python wheel | `release-python.yaml` |
| Snackbar | `snackbar-*` | Rust binary | `release-rust.yaml` |
| UniversalSurfaceXD | `usxd-*` | Electron app | `release-node.yaml` |
| OkGuide | `okguide-*` | Python wheel | `release-python.yaml` |
| PublishLane | `publishlane-*` | npm tarball | `release-node.yaml` |
| uSystem | `usystem-*` | Rust crate | `release-rust.yaml` |
| GoExchange | `goexchange-*` | Go binary | `release-go.yaml` |
| DevStudio | `devstudio-*` | Bash scripts | `release-scripts.yaml` |

### 16.2 Release Command

```bash
release all v1.0.0    # Tags + pushes all components
```

### 16.3 CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `continue-checks.yml` | PR to main/dev | Quality gates (lint, test, build, security) |
| `ci.yml` | Push/PR | General CI pipeline |
| `ci-cd.yml` | Push to main | Build and deploy |
| `auto-fix.yml` | Issues/PRs | Automated fixes |
| `auto-heal.yml` | Schedule | Self-healing checks |
| `core-ci.yml` | Push/PR | Core module tests |
| `publish.yml` | Release | Package publishing |
| `publish-student-kit.yml` | Push | Student kit publishing |
| `publish-extension.yml` | Push to manifests | Extension catalog publishing |
| `lock-boundary.yml` | Push | Boundary lock validation |
| `validate-courses.yml` | Push | Course validation |
| `validate_config.yml` | Push | Config validation |

---

## 17. Quick Reference

### 17.1 Common Commands

```bash
# Start all surfaces
node scripts/udos.js start --all

# Start with server
node scripts/udos.js start --all --with-server

# Run benchmarks
node scripts/udos.js bench

# Run story system
udo story run|validate|list|template

# Oracle Trinity
udo oracle ask "What is in the vault?"
udo oracle ask --domain creation "Write a story"
udo oracle ask --domain insight "Find patterns"

# Release
make release VERSION=x.y.z
```

### 17.2 Key Documentation

| Document | Location | Description |
|----------|----------|-------------|
| Ecosystem Map | `docs/shared/ECOSYSTEM_MAP.md` | Full ecosystem architecture |
| Core Architecture | `uDos-docs/CORE_ARCHITECTURE.md` | Python/Rust version boundaries |
| Hybrid Workflow | `uDos-docs/hybrid-workflow.md` | Cross-language development workflow |
| Integration Guide | `uDos-docs/integration-guide.md` | Python/Rust FFI technical details |
| Dev Workflow | `docs/shared/workflow/dev-workflow.md` | Universal development workflow |
| Dev Checklist | `docs/shared/workflow/dev-checklist.md` | Pre/post dev pass checklist |
| Task Spec | `docs/shared/workflow/dev-tasks.md` | Task management specification |
| Doc Index | `docs/shared/DOC_INDEX.md` | Cross-repo documentation index |
| Structure Cheat Sheet | `docs/shared/STRUCTURE_CHEAT_SHEET.md` | Flat repo layout reference |
| DevStudio Roadmap | `../DevStudio/ROADMAP.md` | DevStudio project roadmap |

### 17.3 Environment Variables

```bash
export UDOS_CODE="$HOME/Code"
export UDOS_VAULT="$HOME/Vault"
export UDOS_UCODE1="$HOME/Code/uCode1"
export UDOS_UCODE2="$HOME/Code/uCode2"
export UDOS_UCODE3="$HOME/Code/uCode3"
export UDOS_UCODE4="$HOME/Code/uCode4"
export UDOS_CONNECT="$HOME/Code/uConnect"
export UDOS_SERVER="$HOME/Code/uServer"
```

### 17.4 XDG Paths

```bash
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_STATE_HOME="$HOME/.local/state"
export XDG_CACHE_HOME="$HOME/.cache"

# uDos specific
export UDOS_DATA="$XDG_DATA_HOME/udos"
export UDOS_CONFIG="$XDG_CONFIG_HOME/udos"
export UDOS_STATE="$XDG_STATE_HOME/udos"
export UDOS_CACHE="$XDG_CACHE_HOME/udos"
```

---

## Appendix A: Legacy Roadmap Index

Superseded roadmaps preserved for reference:

| Document | Location | Status |
|----------|----------|--------|
| Phase 1 Complete | `uDos-docs/legacy/roadmap/phase1-complete.md` | Archived |
| Phase 2 Complete | `uDos-docs/legacy/roadmap/phase2-complete.md` | Archived |
| Phase 3 Complete | `uDos-docs/legacy/roadmap/phase3-complete.md` | Archived |
| Phase 4 Complete | `uDos-docs/legacy/roadmap/phase4-complete.md` | Archived |
| Phase 8 Implementation Plan | `uDos-docs/legacy/roadmaps/CONSOLIDATED_PHASE_8_IMPLEMENTATION_PLAN.md` | Archived |
| Development Log Round 1 | `uDos-docs/legacy/roadmaps/DEVELOPMENT_LOG_ROUND_1.md` | Archived |
| Development Roadmap Rounds | `uDos-docs/legacy/roadmaps/DEVELOPMENT_ROADMAP_ROUNDS.md` | Archived |
| Future Integration Roadmap | `uDos-docs/legacy/roadmaps/FUTURE_INTEGRATION_ROADMAP.md` | Archived |
| Pre-v5 Family Notes | `uDos-docs/legacy/roadmaps/pre-v5-family-notes.md` | Archived |
| Round Advancement | `uDos-docs/legacy/roadmaps/ROUND_ADVANCEMENT.md` | Archived |
| Universal Feed Integration | `uDos-docs/legacy/roadmaps/UNIVERSAL_FEED_INTEGRATION_PLAN.md` | Archived |
| WordPress Round 1 | `uDos-docs/legacy/roadmaps/WORDPRESS_ROUND_1_CLOSED.md` | Archived |
| WordPress Round 2 | `uDos-docs/legacy/roadmaps/WORDPRESS_ROUND_2_ROADMAP.md` | Archived |

---

## Appendix B: Phase Setup Scripts

The phase setup scripts in `phase-setup/` provide executable automation for each phase:

```bash
# Run all phases in sequence
bash phase-setup/setup-all.sh

# Run individual phase
bash phase-setup/phase1/setup.sh
bash phase-setup/phase2/setup.sh
# ... etc
```

Each script validates dependencies, checks prerequisites, and reports status.

---

*This roadmap is the single source of truth for uDos/uCode development planning.  
See also: [DevStudio ROADMAP.md](../DevStudio/ROADMAP.md) for DevStudio-specific planning.*
