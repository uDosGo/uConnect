# uDosGo Release Schedule

**Version:** v1.2.0  
**Last Updated:** 2026-05-05  
**Status:** Active development — breaking changes expected

---

## Core Version Boundaries

| Tier | Stack | Slots | Theme | Rendering | Input | Status |
|------|-------|-------|-------|-----------|-------|--------|
| **uCode1** | Python core | 128 | NetHack/D&D | ASCII / Teletext | Keyboard | 🟢 **Active** |
| **uCode2** | Rust + React | 256 | Classic Literature | Web / Tailwind / React | Keyboard + Mouse | 🟡 **In development** |
| **uCode3** | Rust + Console | 512 | Space / Elite | Console / Tablet / Touch | Keyboard + Game Controller | 🔵 **Planning** |
| **uCode4** | Rust + 3D | 1024 | Omniverse / Interdimensional | 3D / Voxel / VR | Touch + Motion + Voice | ⚪ **Speculative** |

---

## Release Priority Queue

### Priority 1: uCode1 (Python Core) — Active
**Version:** v1.2.0  
**Location:** `uCode1/`  
**Stack:** Pure Python, zero Rust dependencies  
**Status:** 🟢 Active development — core business logic, CLI tools, Liquid template engine

| Milestone | Version | Status | Target |
|-----------|---------|--------|--------|
| Current baseline | v1.1.1 | ✅ Done | Current |
| Liquid integration | v1.2.0 | ✅ **Done** | **Completed** |
| Static HTML export | v1.3.0 | 🔵 **Next** | TBD |
| React renderer bridge | v1.4.0 | 🔵 Planned | TBD |
| SKIN (Tailwind variables) | v1.5.0 | 🔵 Planned | TBD |
| LENS overlays | v1.6.0 | 🔵 Planned | TBD |
| **Release** | **v1.7.0** | 🎯 **Target** | **TBD** |

### Priority 2: uCode2 (Rust + React) — In Development
**Version:** v0.1.0  
**Location:** `uCode2/`  
**Stack:** Rust workspace + React/Vue UI surfaces  
**Status:** 🟡 In development — MCP server, grid core, vault bridge, TUI

| Milestone | Version | Status | Target |
|-----------|---------|--------|--------|
| Docs publishing (SnackBox → GitHub Pages) | v0.1.0 | 🟡 In development | Q3 2026 |
| Interactive (dynamic snack execution, Spark) | v0.2.0 | 🔵 Planned | Q4 2026 |
| Full release | v1.0.0 | ⚪ Speculative | TBD |

### Priority 3: uCode3 (Console / Tablet) — Planning
**Version:** v0.1.0  
**Location:** `uCode3/`  
**Stack:** Rust + Console rendering  
**Status:** 🔵 Planning — reference implementation at `~/Code/HomeKit/`

| Milestone | Version | Status | Target |
|-----------|---------|--------|--------|
| Console rendering + game controller input | v0.1.0 | 🔵 Planning | Q4 2026 |
| Tablet/touch + voice input | v0.2.0 | 🔵 Planning | Q1 2027 |
| Full release | v1.0.0 | ⚪ Speculative | TBD |

### Priority 4: uCode4 (3D Spatial / VR) — Speculative
**Version:** v0.0.1  
**Location:** `uCode4/`  
**Stack:** Rust + 3D rendering  
**Status:** ⚪ Speculative — planning docs only

| Milestone | Version | Status | Target |
|-----------|---------|--------|--------|
| 3D voxel rendering prototype | v0.0.1 | ⚪ Speculative | 2027 |
| True 3D grid + touch/motion input | v0.1.0 | ⚪ Speculative | TBD |
| Full release | v1.0.0 | ⚪ Speculative | TBD |

---

## Version Ladder (Path to v1.7.0)

| Version | Focus | Status |
|---------|-------|--------|
| v1.1.1 | Current baseline — Python core, CHASIS, Go widgets | ✅ Done |
| **v1.2.0** | **Liquid integration** — template engine, `ucode liquid render` | ✅ **Done** |
| v1.3.0 | Static HTML export — site generation from snacks/binders | 🔵 **Next** |
| v1.4.0 | React renderer bridge — interactive surfaces | 🔵 Planned |
| v1.5.0 | SKIN (Tailwind variables) — theming system | 🔵 Planned |
| v1.6.0 | LENS overlays — data extraction layer | 🔵 Planned |
| **v1.7.0** | **Release** — polish, docs, benchmarks, packaging | 🎯 **Target** |

---

## A1 Milestone (Completed)

**Status:** ✅ Complete (operator test passed 2026-04-15)  
**Git SHA:** `12a3a59`  
**Tasks:** T001–T021 all done

### Core Tasks Delivered
- `core-rs/` crate and module scaffold
- Vault P0 commands (init/list/open/delete/restore/search)
- USXD render command (teletext/mono/wireframe)
- Grid bridge commands (import/export)
- Integration tests for CLI P0 flows
- uCode runtime command surface (run/fmt)
- Decision docs for Rust/USXD/REXPaint
- Milkdown OBF/USXD plugin scaffold
- ASCII↔Teletext bridge commands
- Unified MCP registry scaffold
- Server lifecycle controls
- Unified orchestrator command surface
- Unified Remark markdown pipeline

### Alpha Roadmap Items (In Progress)
| ID | Task | Status |
|----|------|--------|
| T-ALPHA-MCP | Markdownify MCP server integration | ✅ Done |
| T-ALPHA-RUN | `udo run` / literate markdown | ✅ Done |
| T-ALPHA-VECTOR | Vector DB + Cloud WordPress research | 🔵 Deferred to A3 |
| T-ALPHA-DOCKER | `udo docker` patterns | ✅ Done |
| T-ALPHA-IMAGE-NB | Experimental image module | ✅ Done |
| T-ALPHA-UNAMEGEN | Deterministic name generator | ✅ Done |
| T-ALPHA-WIDGET | USXD interactive widgets | ✅ Done |
| T-ALPHA-ADAPTORS | Adaptor schema + sandbox foundation | ✅ Done |
| T-ALPHA-SKIN-TAILWIND | Tailwind browser surfaces | ✅ Done |
| T-ALPHA-THEME-EXP | Theme integration experiments | 🔵 In progress |
| T-ALPHA-USXD-GO-SCAFFOLD | `usxd-go` runtime scaffold | ✅ Done |
| T-ALPHA-STORY | Story format + TUI + live GUI | ✅ Done |
| T-ALPHA-UDO-GUI-SVC | Single-terminal browser surfaces | ✅ Done |
| T-ALPHA-UOS | External app launcher (uos) | ✅ Done |
| T-ALPHA-VENTOY | Ventoy packaging/installer | 🔵 Moved to sonic-screwdriver |

---

## Plans vs Actuals

| Planned | Actual | Delta |
|---------|--------|-------|
| A1 milestone by 2026-04-15 | ✅ Completed 2026-04-15 | On track |
| A2 execution start | 🔵 Not started — requires operator permission | Deferred |
| uCode1 v1.1.1 | ✅ v1.1.1 active | Done |
| uCode1 v1.2.0 (Liquid integration) | ✅ **v1.2.0 completed** | **Done** |
| uCode1 v1.3.0 (HTML export) | 🔵 **Next** | On track |
| uCode1 v1.4.0 (React bridge) | 🔵 Not started | On track |
| uCode1 v1.5.0 (SKIN) | 🔵 Not started | On track |
| uCode1 v1.6.0 (LENS) | 🔵 Not started | On track |
| uCode1 v1.7.0 (Release) | 🔵 Not started | 🎯 Target |
| uCode2 v0.1.0 (Docs Publishing — Q3 2026) | 🔵 Not started | On track |
| uCode3 v0.1.0 (Console — Q4 2026) | 🔵 Not started | On track |
| uCode4 v0.0.1 (3D prototype — 2027) | 🔵 Not started | On track |

---

## Dev Workflow

### Daily Loop
1. Open `dev/TASKS.md` — confirm active priorities
2. Pick one task, set scope before editing
3. Implement in scoped files
4. Validate (tests/lints/smoke)
5. Update docs/decision notes
6. Update task status
7. Continue next round

### Verification
```bash
# One-shot automated gate
npm run verify:a1

# Manual smoke
udo help
udo doctor
udo tour
```

### Pre-commit Hooks
```bash
make hooks-install    # Install pre-commit hooks
make hooks-verify     # Verify hook installation
make hooks-run        # Run pre-commit checks manually
```

### Build & Test
```bash
# Build everything
make build

# Run all tests
make test

# Start MCP server
make start-mcp
```

---

## Key Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Release Schedule | `~/Code/DevStudio/RELEASE_SCHEDULE.md` | **This file** — single source of truth |
| Architecture Guide | `ARCHITECTURE_README.md` | System architecture overview |
| Dev Tasks | `dev/TASKS.md` | Active task tracking |
| Dev Workflow | `dev/DEV.md` | Daily operating manual |
| A1 Completion | `dev/A1-COMPLETION-CHECKLIST.md` | A1 milestone closure |
| Version Ladder | `docs/specs/version-ladder-a1-a2.md` | Version track |
| Roadmap | `docs/roadmap.md` | Long-term roadmap |

---

*This schedule is subject to change based on development progress and community feedback.*
