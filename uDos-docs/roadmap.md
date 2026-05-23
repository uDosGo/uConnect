# uDos Development Roadmap

> **⚠️ CONSOLIDATED RELEASE SCHEDULE:** The single source of truth for release planning has moved to [`~/Code/DevStudio/RELEASE_SCHEDULE.md`](../~/Code/DevStudio/RELEASE_SCHEDULE.md).  
> This file is maintained for historical reference and long-term vision. For current priorities, milestones, and plans-vs-actuals, see the consolidated schedule.

## Current Status

**Version**: v1.2.0
**Last Updated**: 2026-05-23
**Current Focus**: Phase 4 Architecture Evolution (documentation, integration guides, benchmarking)

### Core Version Boundaries

| Tier | Stack | Slots | Theme | Rendering | Input | Status |
|------|-------|-------|-------|-----------|-------|--------|
| **uCode1** | Python core | 128 | NetHack/D&D | ASCII / Teletext | Keyboard | 🟢 **Active** |
| **uCode2** | Rust + React | 256 | Classic Literature | Web / Tailwind / React | Keyboard + Mouse | 🟡 **In development** |
| **uCode3** | Rust + Console | 512 | Space / Elite | Console / Tablet / Touch | Keyboard + Game Controller | 🔵 **Planning** |
| **uCode4** | Rust + 3D | 1024 | Omniverse / Interdimensional | 3D / Voxel / VR | Touch + Motion + Voice | ⚪ **Speculative** |

**uCode2 will not be immediately released** — uCode1 comes first with documentation publishing. uCode2's publishing pipeline will be used to deploy docs for uCode1.

---

## Phase 1: Core Migration & Stabilization (Month 1-3) — ✅ Complete

All Phase 1 objectives achieved. Python core migration, theme system, plugin discovery, MCP integration, testing, and ThinUI error handling are complete. Full test suite of 133+ tests passes across uCode1 (Python) and uCode2 (Rust).

**Key deliverables:**
- Performance benchmarking framework (`packages/udos/commands/bench.ts`)
- CONDENSE v3 AI-assisted content merging (`packages/udos/commands/condense.ts`)
- Development mode with hot reload (`packages/udos/commands/devmode.ts`)

*Archived detail: `uDos-docs/roadmap/phase1-complete.md`*

---

## Phase 2: Snack & Relic System (Month 4-6) — ✅ Complete

Snackbar unified into a single cross-platform component within uServer. Snack schema, validator, execution engine, dependency resolution, and CLI all done. CeefaxThinUI teletext renderer, BBC BASIC integration (Matrix Brandy), LENS/SKIN layers, ACS 6502 emulator, and data pipeline integration complete.

**Key deliverables:**
- Snack/Relic/BBC BASIC/ACS emulator ecosystem
- CeefaxThinUI Vue surface with Canvas Mode 7 renderer
- LENS (data extraction) + SKIN (UI transformation) layers
- 117 integration tests across all systems

*Archived detail: `uDos-docs/roadmap/phase2-complete.md`*

---

## Phase 3: Binder & MDX Runtime (Month 7-9) — ✅ Complete

Binder structure, inheritance, state management, registry, serialization, integrity, and CLI all done. MDX runtime with Snack shortcode support. Story format with execution tracking, error handling, and template generation.

**Key deliverables:**
- Binder document processing system
- MDX runtime with `<Snack>` shortcode support
- Story format (`packages/udos/commands/story.ts`) with JSON/Markdown support

*Archived detail: `uDos-docs/roadmap/phase3-complete.md`*

---

## Phase 4: USX/UDO & ASCII Grid Parser (Month 10-12)

> **Naming Evolution:** The former "OBF" (Open Box Format) has been split into two canonical formats:
> - **USX** (Unified Surface eXchange) — style/design/surface format. Canonical specs: `uCode1/docs/specs/usx/`
> - **UDO** (Unified Document Object) — system-layer document format. Canonical specs: `uCode1/docs/specs/udo/`
> Legacy OBF/USXD redirect stubs: `uCode1/docs/specs/usxd/`

### ✅ Complete
- **USX/UDO Implementation** — Full pipeline: format spec, document structure, section management, registry, serialization, integrity, format converters, ASCII grid parser (simple, box, teletext, markdown, CSV), component mapping, TUI grid rendering, CLI commands, 28-test suite
- **ThinUI Integration** — Python Flask API + React Grid Viewer surface, Monodraw.app grid editing, VS Code workspace declutter
- **Grid & Spatial Hierarchy** — `.state/cells/` UDX-addressed storage, Cube storage format, feed spool archiving
- **Lexicon & Character System** — 128-Character ANSI Set, Emoji Overlays, Word Aliases, rendering priority system

### ❌ Architecture Evolution (Not Started)
- [ ] Document Python/Rust core architecture (canonical specs at `uCode1/docs/specs/usx/` and `uCode1/docs/specs/udo/`)
- [ ] Create integration guides for uCode1 + uCode3
- [ ] Develop performance benchmarking framework
- [ ] Establish hybrid development workflow

*Archived detail: `uDos-docs/roadmap/phase4-complete.md`*

---

## Phase 5: Testing & Documentation (Month 13-15)

### ✅ Complete
- Documentation: API reference, developer guide, user manual, troubleshooting guide

### ❌ Remaining
- [ ] Add additional end-to-end tests for remaining systems

---

## Phase 6: Deployment & Release (Month 16-18)

### ✅ Complete
- CI/CD pipeline for Python core + uCode2 Rust + ThinUI (GitHub Actions)
- Release management: `make release VERSION=x.y.z`

### ❌ Remaining
- [ ] Add update notifications with version compatibility checks
- [ ] Create hybrid build system (Python + Rust components)
- [ ] uCode1 v1.0 official release
- [ ] uCode3 v0.1 alpha release
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
- [ ] Voice command input
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

| Version | Status | Key Features |
|---------|--------|-------------|
| **v0.1.0** (Alpha) | ✅ Current | Python core, basic functionality, plugin system, dashboard, dev mode |
| **v0.2.0** (Beta) | 🔜 Next | MCP integration, theme system, uCode3 Rust integration, docs publishing |
| **v0.3.0** (RC) | 🔮 Planned | Production core, full feature set, BBC BASIC, ACS emulator |
| **v1.0.0** (Stable) | 🔮 Planned | Complete Snack/Relic/Binder/USXD ecosystem, plugin marketplace |

### uCode2 (Rust + React)

> **Note:** uCode2 will NOT be immediately released. Used first as publishing pipeline for uCode1 docs.

| Version | Timeline | Key Features |
|---------|----------|-------------|
| **v0.1.0** | Q3 2026 | SnackBox → GitHub Pages, MDX static rendering, UDX grid rendering |
| **v0.2.0** | Q4 2026 | Dynamic snack execution, GitHub Spark, interactive MDX |
| **v1.0.0** | Future | Complete feature set, community snack marketplace |

### uCode3 (Console / Tablet — Rust Core)

| Version | Timeline | Key Features |
|---------|----------|-------------|
| **v0.1.0** | Q4 2026 | Console rendering, game controller input, 2.5D spatial mapping |
| **v0.2.0** | Q1 2027 | Tablet/touch interface, voice input, 8 level bands (L100–899) |
| **v1.0.0** | Future | Console/app store deployment, complete spatial layer system |

### uCode4 (3D Spatial — Rust Core)

| Version | Timeline | Key Features |
|---------|----------|-------------|
| **v0.1.0** | 2027 | 3D voxel rendering prototype, octree spatial index, portal navigation |
| **v0.2.0** | Future | True 3D grid rendering, touch/motion input, 1024-slot architecture |
| **v1.0.0** | Future | AR/VR support, metaverse publishing, multidimensional knowledge spaces |

---

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to uDos.

---

## Support

For issues, questions, or feature requests, please open an issue on our GitHub repository or contact our support team.

---

*This roadmap is subject to change based on development progress and community feedback.*
