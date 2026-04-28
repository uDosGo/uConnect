# uDos Development Roadmap

## Current Status

**Version**: 1.0.0 (Pre-Alpha)
**Last Updated**: 2026-04-26
**Current Focus**: Python core migration, stabilizing architecture

### Core Version Boundaries

- **uCode1**: Python core (primary development focus)
- **uCode2**: Python core (next-gen architecture)
- **uCode3**: Rust core (high-performance components)

**Migration Complete**: Rust core has been successfully migrated from uCode1 to uCode3, allowing uCode1 to focus on Python-based development while maintaining access to high-performance Rust components through uCode3.

---

## Phase 1: Core Migration & Stabilization (Month 1-3)

### ✅ Completed
- [x] Fixed ThinUI whitescreen issue with proper error handling
- [x] Implemented comprehensive plugin loading system
- [x] Added loading and error states to AppShell
- [x] Created basic dashboard plugin structure
- [x] Implemented mock core method responses
- [x] **Python Core Migration**: Successfully converted Rust core to Python for uCode1
- [x] **uCode3 Creation**: Migrated Rust core to dedicated uCode3 package
- [x] **Version Boundaries**: Established clear Python/Rust core separation

### 🚧 In Progress
- [ ] Testing ThinUI with improved error handling
- [ ] Verifying MCP socket connection
- [ ] Implementing proper plugin discovery system
- [ ] Documenting Snack & Relic Specification (Python version)
- [ ] Documenting uCode1 128-Character ANSI Set + Emoji Overlays + Word Aliases
- [ ] Performance benchmarking: Python vs Rust implementations

### 📌 Upcoming
- [ ] Add comprehensive logging system
- [ ] Implement proper Tauri command integration
- [ ] Add unit and integration tests
- [x] Implement CONDENSE for document consolidation (basic deduplication)
- [x] Apply CONDENSE to docs-process collection (1,543 files → 1,543 files, 0% reduction)
- [x] Implement CONDENSE v2 with semantic analysis (1,543 files → 1,543 files, 0% reduction)
- [x] Implement CONDENSE v2 filtered (1,543 files → 519 files, 66% reduction with <50 lines and <100 words filter)
- [ ] Implement CONDENSE v3 with AI-assisted merging (target 30-50% reduction) - ON HOLD
- [ ] Implement development mode with hot reload

---

## Phase 2: Snack & Relic System (Month 4-6)

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

### Snack Implementation
- [x] Create Snack schema and validator
- [x] Implement Snack execution engine
- [x] Add Snack dependency resolution
- [x] Add CLI commands: `snack list/show/create/validate/run/test`

### Relic Implementation
- [x] Create Relic binary format
- [x] Implement Relic integrity verification
- [x] Add Relic registry support
- [x] Add CLI commands: `relic list/show/create/validate/unpack/run/test`

### Gameplay & Code Emulation System

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

### Binder Implementation
- [ ] Create Binder structure and configuration
- [ ] Implement sub-binder inheritance
- [ ] Add Binder state management
- [ ] Implement Binder registry

### MDX Runtime
- [ ] Support `<Snack>` shortcode in MDX files
- [ ] Implement Snack resolution and execution
- [ ] Add Snack output rendering
- [ ] Implement Snack error handling

### Story Format
- [ ] Add `save_binder` action to Story format
- [ ] Implement Story data saving to binder
- [ ] Add Story execution tracking
- [ ] Implement Story error handling

---

## Phase 4: USXD/OBF & ASCII Grid Parser (Month 10-12)

### USXD/OBF Implementation
- [ ] Create USXD/OBF format specification
- [ ] Implement ASCII grid parser
- [ ] Add component mapping support
- [ ] Implement grid rendering in TUI

### ThinUI Integration
- [ ] Add ASCII grid rendering in ThinUI
- [ ] Implement component mapping in ThinUI
- [ ] Add grid editing support
- [ ] Implement grid error handling

### Grid & Spatial Hierarchy Integration
- [ ] Create `.state/cells/` directory structure
- [ ] Implement `ucode cell` commands (read/write)
- [ ] Extend `.udx` parser to support Cell mapping
- [ ] Modify feed spool archiving to use Cells
- [ ] Add Cube storage format for SnackBox packing

### Lexicon & Character System
- [ ] Implement 128-Character ANSI Set
- [ ] Add Emoji Overlays for each slot
- [ ] Add Word Aliases for each slot
- [ ] Implement rendering priority (emoji > word > teletext > ANSI)

### Lexicon + Yarnspinner Integration
- [ ] Implement Command Slots (0-31)
- [ ] Implement Snack Slots (32-63)
- [ ] Implement Alias Slots (96-127)
- [ ] Add Yarnspinner Lexicon Lookup
- [ ] Add CLI commands for Lexicon & Yarnspinner

### Architecture Evolution
- [ ] Document Python/Rust core architecture
- [ ] Create integration guides for uCode1 + uCode3
- [ ] Develop performance benchmarking framework
- [ ] Establish hybrid development workflow

---

## Phase 5: Testing & Documentation (Month 13-15)

### Testing
- [ ] Implement comprehensive test suite
- [ ] Add unit tests for Snack & Relic system
- [ ] Add integration tests for Binder & MDX runtime
- [ ] Add end-to-end tests for USXD/OBF

### Documentation
- [ ] Complete API documentation
- [ ] Add developer guides
- [ ] Create user manual
- [ ] Add troubleshooting guide

---

## Phase 6: Deployment & Release (Month 16-18)

### Deployment
- [ ] Implement CI/CD pipeline for Python core
- [ ] Add automated builds for uCode1 (Python) and uCode3 (Rust)
- [ ] Implement release management for both versions
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

### Future Enhancements
- [ ] Add AI-powered features
- [ ] Implement voice interface
- [ ] Add AR/VR support
- [ ] Implement blockchain integration

### Ecosystem
- [ ] Build plugin ecosystem
- [ ] Create theme marketplace
- [ ] Develop integration partners
- [ ] Build community

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

#### v1.0.0 (Stable)
- Production ready Python core
- Full feature set
- Comprehensive documentation
- Enterprise support
- Optional uCode3 performance components

### uCode3 (Rust Core)

#### v0.1.0 (Alpha)
- Rust core components
- Performance-critical modules
- Python bindings (pyo3)
- Benchmarking suite

#### v0.2.0 (Beta)
- Expanded component coverage
- Optimization passes
- Documentation
- Integration examples

#### v1.0.0 (Stable)
- Production-ready Rust components
- Full Python interoperability
- Performance guarantees
- Enterprise support

---

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to uDos.

---

## Support

For issues, questions, or feature requests, please open an issue on our GitHub repository or contact our support team.

---

*This roadmap is subject to change based on development progress and community feedback.*
