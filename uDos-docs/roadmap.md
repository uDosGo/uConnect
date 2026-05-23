# uDos Development Roadmap

> **⚠️ CONSOLIDATED RELEASE SCHEDULE:** The single source of truth for release planning has moved to [`~/Code/DevStudio/RELEASE_SCHEDULE.md`](../~/Code/DevStudio/RELEASE_SCHEDULE.md).  
> This file is maintained for historical reference and long-term vision. For current priorities, milestones, and plans-vs-actuals, see the consolidated schedule.

## Current Status

**Version**: v1.1.1
**Last Updated**: 2026-05-05
**Current Focus**: Python core migration, ASCII grid parser implementation, stabilizing architecture, theme system deployment

### Core Version Boundaries

| Tier | Stack | Slots | Theme | Rendering | Input | Status |
|------|-------|-------|-------|-----------|-------|--------|
| **uCode1** | Python core | 128 | NetHack/D&D | ASCII / Teletext | Keyboard | 🟢 **Active** |
| **uCode2** | Rust + React | 256 | Classic Literature | Web / Tailwind / React | Keyboard + Mouse | 🟡 **In development** |
| **uCode3** | Rust + Console | 512 | Space / Elite | Console / Tablet / Touch | Keyboard + Game Controller | 🔵 **Planning** |
| **uCode4** | Rust + 3D | 1024 | Omniverse / Interdimensional | 3D / Voxel / VR | Touch + Motion + Voice | ⚪ **Speculative** |

**uCode2 will not be immediately released** — uCode1 comes first with documentation publishing. uCode2's publishing pipeline will be used to deploy docs for uCode1.

---

## Phase 1: Core Migration & Stabilization (Month 1-3)

### ✅ Completed
All Phase 1 objectives achieved. The Python core migration, theme system, plugin discovery, MCP integration, testing, and ThinUI error handling are complete. The full test suite of 133+ tests passes across uCode1 (Python) and uCode2 (Rust) components.

### 📌 Remaining Backlog
- [ ] Performance benchmarking: Python vs Rust implementations
- [ ] Implement CONDENSE v3 with AI-assisted merging (target 30-50% reduction) — ON HOLD
- [ ] Implement development mode with hot reload

**Active Sprint:** [Sprint #6 — MCP Integration & Plugin System](./../SPRINT_PLAN.md) *(archived to .compost/)*

---

## Phase 2: Snack & Relic System (Month 4-6)

### Ecosystem Boundaries (Updated 2026-05-23)

The Snackbar system has been unified into a single cross-platform component within uServer, with clear boundaries:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Snackbar (uServer Module)                     │
│  Universal runtime/automator for snacks, skills, and spices     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Snacks (🍎 Mac only)                                   │    │
│  │  • macOS scripts, shortcuts, single-file automations    │    │
│  │  • .command files, .workflow, .shortcut                 │    │
│  │  • Platform: macOS                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Spices (🐧 Linux only)                                 │    │
│  │  • Linux scripts, systemd units, shell skills           │    │
│  │  • .sh, .service, .timer, udev rules                    │    │
│  │  • Platform: Linux                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Skills (🌐 Cross-platform)                              │    │
│  │  • Python libraries, maintenance tasks, regular actions │    │
│  │  • .py, .ts, .js — any runtime available on both        │    │
│  │  • Platform: macOS + Linux                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Snackbox (📦 Plug-n-Play Container)                     │    │
│  │  • Repo or larger app/script collection                 │    │
│  │  • Skin/Lens connections for data extraction/UI         │    │
│  │  • Preserves original runtime (or modified for uDos)    │    │
│  │  • A plugin is also a Snackbox (uDos extensions/tools)  │    │
│  │  • Also called "Chassis"                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SnackMachine (⚙️ Runtime / Automator)                   │    │
│  │  • Table list view with actions and triggers            │    │
│  │  • Surfaces in opsui (Server Operations Surface)        │    │
│  │  • Snackbar menu panel (toolbar icon)                   │    │
│  │  • Port 8484 — REST API + MCP + CLI                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         uCode Container System                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    SNACK: ACS Emulator                   │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │ 6502 Core   │  │ Disk Handler│  │ Memory Mgr  │     │    │
│  │  │ (Python)    │  │ (Python)    │  │ (Python)    │     │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │    │
│  │         │                │                │             │    │
│  │         └────────────────┼────────────────┘             │    │
│  │                          │                              │    │
│  │                    ┌─────▼─────┐                        │    │
│  │                    │ LENS Layer│ ← Data extraction      │    │
│  │                    │ (Capture) │   from emulation       │    │
│  │                    └─────┬─────┘                        │    │
│  │                          │                              │    │
│  │                    ┌─────▼─────┐                        │    │
│  │                    │ SKIN Layer│ ← UI transformation    │    │
│  │                    │ (Reskin)  │   to uCode formats     │    │
│  │                    └─────┬─────┘                        │    │
│  └──────────────────────────┼──────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────┼──────────────────────────────┐    │
│  │                    ┌─────▼─────┐                         │    │
│  │                    │  ThinUI   │                         │    │
│  │                    │  Renderer │                         │    │
│  │                    └─────┬─────┘                         │    │
│  │                          │                               │    │
│  │         ┌────────────────┼────────────────┐             │    │
│  │         │                │                │             │    │
│  │    ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐       │    │
│  │    │Teletext │      │  USXD    │    │Grid/Layer│       │    │
│  │    │ 128chr  │      │ Portable │    │  Mapper  │       │    │
│  │    │ Output  │      │  Layout  │    │          │       │    │
│  │    └─────────┘      └──────────┘    └──────────┘       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SNACKPACK: Classic Adventures              │    │
│  │  • ACS - Adventure Construction Set                     │    │
│  │  • Eamon - Dungeon Designer                             │    │
│  │  • NetHack - (via tty pipe)                             │    │
│  │  • Apple Panic - (uCode3 lane)                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### BBC BASIC Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BBC BASIC Integration Layer                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                Matrix Brandy Interpreter               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │  C Core     │  │ VDU Router  │  │ Python      │     │    │
│  │  │ (Embedded)  │  │ (Redirect)  │  │ Wrapper     │     │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │    │
│  │         │                │                │             │    │
│  │         └────────────────┼────────────────┘             │    │
│  │                          │                              │    │
│  │                    ┌─────▼─────┐                        │    │
│  │                    │ LENS Hooks │ ← Variable inspection │    │
│  │                    │ (Capture)  │   for game state       │    │
│  │                    └─────┬─────┘                        │    │
│  │                          │                              │    │
│  │                    ┌─────▼─────┐                        │    │
│  │                    │ SKIN Hooks │ ← Visual reskinning   │    │
│  │                    │ (Reskin)   │   to uCode formats     │    │
│  │                    └─────┬─────┘                        │    │
│  └──────────────────────────┼──────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────┼──────────────────────────────┐    │
│  │                    ┌─────▼─────┐                         │    │
│  │                    │  ThinUI   │                         │    │
│  │                    │  Renderer │                         │    │
│  │                    └─────┬─────┘                         │    │
│  │                          │                               │    │
│  │         ┌────────────────┼────────────────┐             │    │
│  │         │                │                │             │    │
│  │    ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐       │    │
│  │    │Teletext │      │  USXD    │    │Grid/Layer│       │    │
│  │    │ 128chr  │      │ Portable │    │  Mapper  │       │    │
│  │    │ Output  │      │  Layout  │    │          │       │    │
│  │    └─────────┘      └──────────┘    └──────────┘       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SNACKPACK: Classic Adventures              │    │
│  │  • ACS - Adventure Construction Set                     │    │
│  │  • Eamon - Dungeon Designer                             │    │
│  │  • NetHack - (via tty pipe)                             │    │
│  │  • Apple Panic - (uCode3 lane)                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### CeefaxThinUI Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CeefaxThinUI (Tauri App)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Frontend (WebView)                    │    │
│  │  • Canvas 2D Mode 7 renderer (JS)                       │    │
│  │  • Teletext page navigation (3-digit codes)             │    │
│  │  • Subtitle / reveal / flash animation                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ▲                                   │
│                              │ IPC (Tauri events)                │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Backend (Rust Core)                         │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  • Teletext page store (HashMap<u16, Page>)             │    │
│  │  • Mode 7 character decoder                             │    │
│  │  • Level 1.5 enhancement (basic graphics)               │    │
│  │  • Feed consumer (live updates)                         │    │
│  │  • Spool importer/exporter (JSON/Binary)                │    │
│  │  • MCP command handler                                   │    │
│  │  • CLI parser (clap)                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ▲                                   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              uDOS Integration Layer                      │    │
│  │  • Subscribe to uDOS Feed (e.g., "teletext/output")     │    │
│  │  • Emit Spool snapshots to uDOS                         │    │
│  │  • Respond to MCP commands (NEXT, SUB, INDEX, REVEAL)   │    │
│  │  • Bridge BBC BASIC VDU codes → Teletext pages          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Snack Implementation (✅ Complete)
- Snack schema, validator, execution engine, dependency resolution, CLI all done.

### CeefaxThinUI Implementation (Teletext Renderer)
- [ ] Research and document teletext specifications
- [ ] Implement Mode 7 rendering with 64 colors
- [ ] Build Tauri app with Canvas renderer
- [ ] Implement CLI interface with export options
- [ ] Add Feed subscription for live teletext
- [ ] Implement Spool import/export functionality
- [ ] Add MCP command protocol integration
- [ ] Create BBC BASIC bridge for VDU output

### Relic Implementation (✅ Complete)
- Binary format, integrity verification, registry, CLI all done.

### Gameplay & Code Emulation System

#### BBC BASIC Integration (uCode1 Core) — ✅ Sprint 1 Complete
- [x] Research and select BBC BASIC interpreter (Matrix Brandy)
- [x] Fork and modify Matrix Brandy for embedding
- [x] Create Python ctypes wrapper for BBC BASIC
- [x] Implement basic VDU output redirection
- [x] Test with simple BBC BASIC programs
- [x] Add variable inspection API for LENS
- [x] Implement VDU graphics to ThinUI mapping
- [x] Create BBC BASIC library system (SPRITELIB, SOUNDLIB)
- [x] Add MCP control protocol integration
- [x] Implement Spool export for game state
- [x] Add PROC_*/FN_* extension dispatch for LENS/SKIN/MCP/Spool
- [x] Implement WHILE/ENDWHILE, CASE/OF/OTHERWISE/ENDCASE
- [x] Implement ON ERROR / RESUME error handling
- [x] Implement PROC/FN with parameter passing and LOCAL variables
- [x] Implement DATA/READ/RESTORE with data pointer
- [x] Fix RND with proper seeding

#### LENS Layer (Looking Into the Game)
- [ ] Design LENS architecture for memory data extraction
- [ ] Create ACS memory map with known addresses
- [ ] Implement tile grid extraction (15x15 maps)
- [ ] Add room description parsing
- [ ] Implement inventory data extraction
- [ ] Add creature/character tracking
- [ ] Create story flag monitoring
- [ ] Implement player statistics capture
- [ ] Add timestamp and metadata support
- [ ] Create LENS output format specification

#### SKIN Layer (Reskinning the Output)
- [ ] Design SKIN transformation architecture
- [ ] Implement teletext rendering engine
- [ ] Add 128-character set support
- [ ] Create teletext color mapping
- [ ] Implement ThinUI grid system
- [ ] Add layer stacking support
- [ ] Create USXD export format
- [ ] Implement SVG conversion
- [ ] Add theme support (retro, modern, dark)
- [ ] Create responsive layout system

#### ACS Emulator Core
- [ ] Research and document ACS memory layout
- [ ] Implement 6502 CPU emulator
- [ ] Create disk image handler
- [ ] Add memory management unit
- [ ] Implement input/output systems
- [ ] Create graphics mode emulation
- [ ] Add sound support (optional)
- [ ] Implement save/load functionality
- [ ] Create debugging interface
- [ ] Add performance optimization

#### Data Pipeline Integration
- [ ] Design Feed format for live gameplay
- [ ] Implement Spool format for saved adventures
- [ ] Create MCP command protocol
- [ ] Add Tailwind Prose exporter
- [ ] Implement Marp slides generator
- [ ] Create Typeform story integration
- [ ] Add feed/spool validation
- [ ] Implement data compression
- [ ] Create pipeline testing suite

#### Publishing & Export
- [ ] Design publishing architecture
- [ ] Implement Tailwind Prose templates
- [ ] Create Marp slide themes
- [ ] Add Typeform story mapping
- [ ] Implement HTML export
- [ ] Create PDF generation
- [ ] Add Markdown support
- [ ] Implement JSON export
- [ ] Create publishing validation
- [ ] Add export testing

### Integration
- [ ] Modify feed spool to accept `snack_execution` event types
- [ ] Extend Yarnspinner to generate story entries from snack executions
- [ ] Add ASCII flowchart parser to `.udx` and `.md` files

---

## Phase 3: Binder & MDX Runtime (Month 7-9)

### Binder Implementation (✅ Complete)
- Binder structure, inheritance, state management, registry, serialization, integrity, CLI all done.

### MDX Runtime (✅ Complete)
- [x] Support `<Snack>` shortcode in MDX files
- [x] Implement Snack resolution and execution
- [x] Add Snack output rendering (text, JSON, HTML)
- [x] Implement Snack error handling with fallback blocks
     `ucode mdx process|render|list --snack-dir <dir>`

### Story Format
- [ ] Add `save_binder` action to Story format
- [ ] Implement Story data saving to binder
- [ ] Add Story execution tracking
- [ ] Implement Story error handling

---

## Phase 4: USXD/OBF & ASCII Grid Parser (Month 10-12)

### USXD/OBF Implementation (✅ Complete)
Full pipeline: format spec, document structure, section management, registry, serialization, integrity, format converters, ASCII grid parser with all format support (simple, box, teletext, markdown, CSV), component mapping (ComponentMapper with rule-based, auto-detection, layout formats), grid rendering in TUI (ANSI colors, keyboard nav, focus/selection, curses support), CLI commands (binder_cli with 11 commands, usxd_cli with 10 commands, grid subcommands), ThinUI integration (bridge, format defs, color conversion, component tree generation), and comprehensive 28-test suite. All complete.

### ThinUI Integration (✅ Complete)
- [x] Add ASCII grid rendering in ThinUI (React Grid Viewer surface)
     `ucode thinui api` starts Flask API, Grid Viewer surface in ThinUI
- [x] Implement grid editing via Monodraw.app integration
     `ucode grid edit`, `ucode grid monodraw import|export|install`
- [x] Decluttered VS Code workspace: distraction-free 2-column layout
     Tabbed panel (Problems|Output|Debug|Ports|Tests|Timeline) behind Terminal

### Grid & Spatial Hierarchy Integration (✅ Complete)
- [x] Create `.state/cells/` directory with UDX-addressed storage
- [x] Implement `ucode cell` commands (write|read|delete|list|count|purge)
- [x] Add Cube storage format for SnackBox packing (create|add|remove|show)
- [x] Extend `.udx`/USXD parser with Cell mapping
     `usxd cell archive|restore|link|show`
- [x] Modify feed spool archiving to use Cells
     `ucode feed archive|list|report`

### Lexicon & Character System (✅ Complete)
- [x] Implement 128-Character ANSI Set
- [x] Add Emoji Overlays for each slot
- [x] Add Word Aliases for each slot
- [x] Implement rendering priority (emoji > word > teletext > ANSI)

### Lexicon + Character System Integration (✅ Complete)
- [x] Implement Command Slots (0-31)
- [x] Implement Snack Slots (32-63)
- [x] Implement Alias Slots (96-127)
- [x] Add Lexicon Lookup to Character System
- [x] Add CLI commands: `ucode character list|show|render|assign|alias|emoji`

### Architecture Evolution
- [ ] Document Python/Rust core architecture
- [ ] Create integration guides for uCode1 + uCode3
- [ ] Develop performance benchmarking framework
- [ ] Establish hybrid development workflow

---

## Phase 5: Testing & Documentation (Month 13-15)

### Testing
- [x] Implement comprehensive end-to-end test suite for USXD pipeline (28 tests)
- [x] Add unit tests for Snack & Relic system (13 tests)
- [x] Adding 117 integration tests across all systems
     Narrator (20), Lexicon (16), Character (28), MDX (15), Cell (38)
- [ ] Add additional end-to-end tests for remaining systems

### Documentation (✅ Complete)
- [x] API reference (`docs/api-reference.md`) — all Python modules, CLI entry points, HTTP endpoints
- [x] Developer guide (`docs/dev-guide.md`) — architecture, how to add commands/surfaces/snacks/cells, testing, CI/CD
- [x] User manual (`docs/user-guide.md`) — all CLI commands with examples, common workflows, configuration
- [x] Troubleshooting guide (`docs/troubleshooting.md`) — CLI, tests, ThinUI, Monodraw, cells, MDX, vault, env, build, CI

---

## Phase 6: Deployment & Release (Month 16-18)

### Deployment
- [x] CI/CD pipeline for Python core + uCode2 Rust + ThinUI (GitHub Actions)
     Python: multi-version (3.10-3.13), ruff lint, pytest, coverage
     Rust: cargo build/test/clippy/fmt on uCode2 workspace
     ThinUI: npm ci + npm run build
     Release: Python wheel + Rust binaries on tagged releases
- [x] Release management: `make release VERSION=x.y.z` bumps version, tags, pushes
- [ ] Add update notifications with version compatibility checks
- [ ] Create hybrid build system (Python + Rust components)

### Release
- [ ] uCode1 v1.0 official release (Python core)
- [ ] uCode3 v0.1 alpha release (Rust performance components)
- [ ] Community call to showcase Python migration and Rust integration
- [ ] Gather user feedback on performance characteristics
- [ ] Plan next steps for hybrid architecture evolution

---

## Long-Term Roadmap

### uCode3 + uCode4 Future Enhancements
- [ ] Console rendering pipeline (scaled ASCII → framebuffer)
- [ ] Game controller input layer (SDL2 abstraction)
- [ ] Layback computing mode (couch/TV UI with controller)
- [ ] Tablet touch gestures (swipe, pinch, tap)
- [ ] Voice command input ("Show L500-AA00-0000-0")
- [ ] L100–899 spatial layer system completion
- [ ] 3D voxel rendering for uCode4
- [ ] Octree-based 3D spatial index
- [ ] AR/VR portal navigation
- [ ] Multidimensional knowledge spaces
- [ ] AI-powered features (Oracle Trinity)
- [ ] Metaverse publishing

### Ecosystem
- [ ] Build plugin ecosystem
- [ ] Create theme marketplace
- [ ] Develop integration partners
- [ ] Build community
- [ ] Console store deployment
- [ ] App store deployment

---

## Release Plan

### uCode1 (Python Core)

#### v0.1.0 (Alpha - Current)
- Python core implementation
- Basic functionality
- Core plugin system
- Basic dashboard
- Development mode

#### v0.2.0 (Beta)
- MCP integration with Python bindings
- Real data support
- Theme system
- Basic plugins
- uCode3 Rust integration layer
- Documentation published via uCode2 pipeline

#### v0.3.0 (Release Candidate)
- Production ready Python core
- Full feature set
- Comprehensive documentation
- BBC BASIC integration (Matrix Brandy)
- ACS emulator (6502 CPU)

#### v1.0.0 (Stable)
- Production ready Python core
- Complete Snack/Relic/Binder/USXD ecosystem
- Plugin marketplace
- Enterprise support

### uCode2 (Rust + React)

> **Note:** uCode2 will NOT be immediately released. It is used first as a publishing pipeline for uCode1 documentation, then gradually opened for interactive surfaces.

#### v0.1.0 (Docs Publishing — Q3 2026)
- SnackBox → GitHub Pages deployment
- MDX runtime with static rendering
- UDX grid rendering (Tailwind + React)
- Documentation site generation

#### v0.2.0 (Interactive — Q4 2026)
- Dynamic snack execution
- GitHub Spark integration
- Interactive MDX
- Real-time grid updates

#### v1.0.0 (Full Release)
- Complete uCode2 feature set
- Community snack marketplace
- GitHub Pages publishing for all users

### uCode3 (Console / Tablet — Rust Core)

> **Reference implementation:** [`~/Code/HomeKit/`](https://github.com/uDosGo/HomeKit) — uHomeNest media server with USXD console layouts and controller-first UX.

#### v0.1.0 (Alpha — Q4 2026)
- Console rendering mode (scaled terminal framebuffer)
- Game controller input layer (SDL2/gamepad)
- 2.5D spatial layer mapping (R-tree foundation)
- Layback computing mode (TV/couch UI)

#### v0.2.0 (Beta — Q1 2027)
- Tablet/touch interface (React Native / Tauri)
- Voice command input
- Full controller nav of grid/spatial system
- 8 level bands (L100–899) accessible

#### v1.0.0 (Stable)
- Console store deployment
- App store deployment (tablet)
- Complete spatial layer system
- Retro game controller as first-class input

### uCode4 (3D Spatial — Rust Core)

#### v0.1.0 (Pre-Alpha — 2027)
- 3D voxel rendering prototype
- Octree spatial index
- L100–899 3D terrain mapping
- Portal-based navigation

#### v0.2.0 (Alpha)
- True 3D grid rendering
- Touch + motion input
- Game controller → 3D camera mapping
- 1024-slot architecture (512 + spatial/audio/animation)

#### v1.0.0 (Stable)
- AR/VR support
- Metaverse publishing
- Multidimensional knowledge spaces
- Enterprise support

---

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to uDos.

---

## Support

For issues, questions, or feature requests, please open an issue on our GitHub repository or contact our support team.

---

*This roadmap is subject to change based on development progress and community feedback.*
