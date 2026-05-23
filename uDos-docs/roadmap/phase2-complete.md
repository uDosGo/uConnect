# Phase 2: Snack & Relic System — Archived Detail

> **Status:** ✅ Complete
> **Original timeline:** Month 4-6
> **Archived:** 2026-05-23
> **See current:** `uDos-docs/roadmap.md`

## Summary

Snackbar unified into a single cross-platform component within uServer. Snack/Relic/BBC BASIC/ACS emulator ecosystem complete. CeefaxThinUI teletext renderer, LENS/SKIN layers, and data pipeline integration done.

## Ecosystem Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                    Snackbar (uServer Module)                     │
│  Universal runtime/automator for snacks, skills, and spices     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Snacks (🍎 Mac only) — macOS scripts, shortcuts        │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Spices (🐧 Linux only) — Linux scripts, systemd units  │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Skills (🌐 Cross-platform) — Python/TS/JS libraries    │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Snackbox (📦 Plug-n-Play Container)                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SnackMachine (⚙️ Runtime / Automator) — Port 8484      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### Snack Implementation (✅ Complete)
- Snack schema, validator, execution engine, dependency resolution, CLI all done.

### CeefaxThinUI Implementation (Teletext Renderer) — ✅ Complete
- [x] Research and document teletext specifications
- [x] Implement Mode 7 Canvas 2D renderer in gridui surface
- [x] Create CeefaxSurface.vue with page navigation, skins, flash animation
- [x] Register Ceefax panel in gridUIStore and NavRail
- [x] Build browser-based Vue surface with Canvas renderer
- [x] Implement CLI interface with export options
- [x] Add Feed subscription for live teletext
- [x] Implement Spool import/export functionality
- [x] Add MCP command protocol integration
- [x] Create BBC BASIC bridge for VDU output

### Relic Implementation (✅ Complete)
- Binary format, integrity verification, registry, CLI all done.

### BBC BASIC Integration (uCode1 Core) — ✅ Complete
- [x] Matrix Brandy interpreter forked and embedded
- [x] Python ctypes wrapper for BBC BASIC
- [x] VDU output redirection, variable inspection API
- [x] VDU graphics to ThinUI mapping
- [x] BBC BASIC library system (SPRITELIB, SOUNDLIB)
- [x] MCP control protocol integration, Spool export
- [x] PROC_*/FN_* extension dispatch for LENS/SKIN/MCP/Spool
- [x] WHILE/ENDWHILE, CASE/OF/OTHERWISE/ENDCASE
- [x] ON ERROR / RESUME error handling
- [x] PROC/FN with parameter passing and LOCAL variables
- [x] DATA/READ/RESTORE with data pointer
- [x] RND with proper seeding

### LENS Layer (Looking Into the Game) — ✅ Complete
- [x] LENS architecture for memory data extraction
- [x] ACS memory map with known addresses
- [x] Tile grid extraction (15x15 maps)
- [x] Room description parsing, inventory extraction
- [x] Creature/character tracking, story flag monitoring
- [x] Player statistics capture, timestamp/metadata support

### SKIN Layer (Reskinning the Output) — ✅ Complete
- [x] SKIN transformation architecture
- [x] Teletext rendering engine with 128-character set
- [x] Teletext color mapping, ThinUI grid system
- [x] Layer stacking support (unified LensSkinMCP)
- [x] USXD export format, SVG conversion
- [x] Theme support (retro, modern, dark)

### ACS Emulator Core — ✅ Complete
- [x] 6502 CPU emulator (vendored from hspaans/python-6502-emulator)
- [x] Disk image handler (ACS .dsk format)
- [x] Memory management unit, input/output systems
- [x] Graphics mode emulation, sound support
- [x] Save/load functionality

### Data Pipeline Integration — ✅ Complete
- [x] Feed format for live gameplay
- [x] Spool format for saved adventures
- [x] MCP command protocol
- [x] Feed/spool validation
- [x] 117 integration tests across all systems

### Publishing & Export — ✅ Partial
- [x] Publishing architecture (ExportEngine, ExportFormat)
- [x] HTML export (FULL_SITE, SINGLE_PAGE, WIDGET)
- [x] Markdown support (Liquid engine + MDX runtime)
- [x] JSON export, publishing validation
- [ ] Tailwind Prose exporter
- [ ] Marp slides generator
- [ ] Typeform story integration
- [ ] Data compression
- [ ] PDF generation
