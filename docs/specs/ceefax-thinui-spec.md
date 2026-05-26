# CeefaxThinUI — Teletext Renderer Specification

> **Version:** v0.2.0 (Browser-based Vue Surface)
> **Status:** Draft
> **Last Updated:** 2026-05-23

## 1. Overview

CeefaxThinUI is a browser-based teletext renderer that displays Mode 7 teletext pages in a Vue 3 surface (gridui). It integrates with the uDos ecosystem via Feed subscription, Spool import/export, MCP command protocol, and BBC BASIC VDU bridge.

> **Note:** The external GUI app for uDos is the **Universal Surface XD App** (Electron). uCode UIs (including CeefaxThinUI) are served directly to localhost browser via Vite dev servers. There is no Tauri app — ThinUI is a Python bridge + API server, not a desktop wrapper.

### 1.1 Existing Assets

The following components already exist in the codebase:

| Component | Location | Status |
|-----------|----------|--------|
| **TeledeskPanel.vue** | `gridui/src/views/surfaces/gridui/panels/TeledeskPanel.vue` | ✅ Vue 3 component with 40x24 grid, RSS feeds, page navigation |
| **Teletext fonts** | `gridui/src/views/surfaces/gridui/styles/teletext-fonts.css` | ✅ Teletext50, Monaspace Krypton, PetMe128, C64 User Mono |
| **TeletextGrid (Python)** | `uCode1/core_py/ceefax/bridge.py` | ✅ 40x25 grid with colour attributes, ANSI parsing, HTML/ANSI export |
| **CeetexUCodeApp (Python)** | `uCode1/core_py/ceefax/ceetex_app.py` | ✅ Textual app with LENS/SKIN/MCP integration, RSS feed reader |
| **Ceetex snack.yaml** | `uCode1/snacks/ceetex/snack.yaml` | ✅ Snack definition with bridge config |
| **GridUI Surface** | `gridui/src/views/surfaces/gridui/` | ✅ Vue 3 surface with Teledesk, Dashboard, Maps, Terminal panels |
| **USX Grid spec** | `uDos-docs/specs/ucode1-grid-layout-spec.md` | ✅ Grid layout specification with fence syntax |
| **Feed format** | `uDos-docs/specs/feed-format.md` | ✅ Feed/spool format with teletext event types |
| **UDX format** | `uDos-docs/specs/UDX_FORMAT.md` | ✅ UDX document format with grid section type |

### 1.2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (localhost:5173)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              GridUI Surface (Vue 3)                      │    │
│  │  • TeledeskPanel.vue — Canvas 2D Mode 7 renderer        │    │
│  │  • Teletext page navigation (3-digit codes)             │    │
│  │  • Subtitle / reveal / flash animation                  │    │
│  │  • SKIN layer integration                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ▲                                   │
│                              │ HTTP / WebSocket                  │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ThinUI Python API Server (Flask)            │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  • Teletext page store                                   │    │
│  │  • Mode 7 character decoder                             │    │
│  │  • Level 1.5 enhancement (basic graphics)               │    │
│  │  • Feed consumer (live updates)                         │    │
│  │  • Spool importer/exporter (JSON/Binary)                │    │
│  │  • MCP command handler                                   │    │
│  │  • Component mapper (grid → UI elements)                │    │
│  │  • Grid renderer (TUI output)                           │    │
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

## 2. Teletext Mode 7 Specification

### 2.1 Standard Teletext Format

| Property | Value |
|----------|-------|
| Rows | 25 (24 visible + 1 status/control) |
| Columns | 40 |
| Character set | G0 (primary), G1 (mosaic), G2 (supplementary), G3 (supplementary) |
| Colours | 8 foreground + 8 background (Mode 7) |
| Control codes | 0x00–0x1F (C0 set) |
| Display attributes | Alpha, Mosaic, Contiguous, Separated, Double Height, Double Width, Flash, Conceal, Box, Black BG, New BG, Hold Mosaic, Release |

### 2.2 Colour Palette (Mode 7)

| Index | Name | Hex | ANSI Equivalent |
|-------|------|-----|-----------------|
| 0 | Black | `#000000` | 30/40 |
| 1 | Red | `#FF0000` | 31/41 |
| 2 | Green | `#00FF00` | 32/42 |
| 3 | Yellow | `#FFFF00` | 33/43 |
| 4 | Blue | `#0000FF` | 34/44 |
| 5 | Magenta | `#FF00FF` | 35/45 |
| 6 | Cyan | `#00FFFF` | 36/46 |
| 7 | White | `#FFFFFF` | 37/47 |

### 2.3 Control Codes (C0 Set)

| Code | Name | Description |
|------|------|-------------|
| 0x00 | NUL | Null |
| 0x08 | ALPHA RED | Switch to alpha charset, set fg=red |
| 0x09 | ALPHA GREEN | Switch to alpha charset, set fg=green |
| 0x0A | ALPHA YELLOW | Switch to alpha charset, set fg=yellow |
| 0x0B | ALPHA BLUE | Switch to alpha charset, set fg=blue |
| 0x0C | ALPHA MAGENTA | Switch to alpha charset, set fg=magenta |
| 0x0D | ALPHA CYAN | Switch to alpha charset, set fg=cyan |
| 0x0E | ALPHA WHITE | Switch to alpha charset, set fg=white |
| 0x10 | MOSAIC RED | Switch to mosaic charset, set fg=red |
| 0x11 | MOSAIC GREEN | Switch to mosaic charset, set fg=green |
| 0x12 | MOSAIC YELLOW | Switch to mosaic charset, set fg=yellow |
| 0x13 | MOSAIC BLUE | Switch to mosaic charset, set fg=blue |
| 0x14 | MOSAIC MAGENTA | Switch to mosaic charset, set fg=magenta |
| 0x15 | MOSAIC CYAN | Switch to mosaic charset, set fg=cyan |
| 0x16 | MOSAIC WHITE | Switch to mosaic charset, set fg=white |
| 0x18 | CONCEAL | Conceal (revealable) |
| 0x19 | CONTIGUOUS MOSAIC | Mosaic chars join neighbours |
| 0x1A | SEPARATED MOSAIC | Mosaic chars separated |
| 0x1B | ESC | Escape (for Level 2.5+) |
| 0x1C | BLACK BACKGROUND | Set bg=black |
| 0x1D | NEW BACKGROUND | Set bg to current fg |
| 0x1E | HOLD MOSAIC | Hold mosaic char |
| 0x1F | RELEASE | Release hold |

### 2.4 Character Sets

#### G0 Set (Primary Alpha)
Standard ASCII printable characters (0x20–0x7F) with teletext-specific glyphs:
- 0x23: `£` (pound sign instead of `#`)
- 0x5E: `↑` (up arrow)
- 0x5F: `←` (left arrow)
- 0x60: `½` (half)
- 0x7B: `¼` (quarter)
- 0x7C: `│` (vertical bar)
- 0x7D: `¾` (three-quarters)
- 0x7E: `÷` (division)
- 0x7F: `█` (full block)

#### G1 Set (Mosaic Graphics)
2×3 block mosaic characters for building graphics:
- 0x20–0x3F: Space + 63 mosaic patterns
- Each mosaic char is a 2×3 grid of "pixels" (on/off)
- Used for weather maps, charts, simple graphics

#### G2 Set (Supplementary)
Additional characters including accented letters and special symbols.

#### G3 Set (Supplementary)
More supplementary characters.

### 2.5 Level 1.5 Enhancements

Level 1.5 adds basic graphics capabilities beyond standard teletext:
- Box drawing characters (┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ═ ║)
- Simple shapes and arrows
- Enhanced colour mapping

## 3. Implementation Plan

### Phase 1: Research & Foundation (Current)
- [x] Research existing teletext code in codebase
- [x] Document teletext Mode 7 specifications
- [x] Implement Canvas 2D Mode 7 renderer in gridui surface
- [x] Create CeefaxSurface.vue with page navigation, skins, flash animation
- [x] Register Ceefax panel in gridUIStore and NavRail

### Phase 2: Mode 7 Rendering
- [x] Implement Canvas 2D Mode 7 renderer in JS
- [x] Implement 8-colour palette with proper teletext mapping
- [x] Implement G0 (alpha) character set rendering
- [x] Implement G1 (mosaic) character set rendering
- [x] Implement control code parsing (colour changes, attributes)
- [x] Implement flash animation
- [x] Implement conceal/reveal
- [x] Implement double-height and double-width

### Phase 3: Page Navigation & UI
- [x] Implement 3-digit page navigation
- [x] Implement page store
- [x] Implement index page rendering
- [x] Implement status bar (channel, page, time)
- [x] Implement footer navigation (prev, next, index)
- [x] Implement keyboard shortcuts

### Phase 4: Feed & Spool Integration
- [ ] Implement Feed consumer (subscribe to "teletext/output")
- [ ] Implement Spool importer (JSON format)
- [ ] Implement Spool exporter (JSON/Binary)
- [ ] Implement live page updates via Feed

### Phase 5: MCP Protocol
- [ ] Implement MCP command handler
- [ ] Implement PAGE command
- [ ] Implement NEXT/PREV commands
- [ ] Implement REVEAL/SUBTITLE commands
- [ ] Implement SKIN command
- [ ] Implement STATUS command

### Phase 6: BBC BASIC Bridge
- [ ] Implement VDU code → teletext page mapping
- [ ] Implement BBC BASIC output redirection
- [ ] Implement LENS state capture integration
- [ ] Implement SKIN hot-reload integration

### Phase 7: CLI & Export
- [ ] Implement CLI parser
- [ ] Implement export to PNG
- [ ] Implement export to HTML
- [ ] Implement export to ANSI

## 4. Data Structures

### 4.1 Page Structure (Python)

```python
@dataclass
class TeletextPage:
    page_id: int            # 3-digit page number (100–899)
    rows: list              # 25 rows × 40 columns
    subcode: int            # Sub-page code (0–9)
    status: str             # Active, Loading, Error
    timestamp: int          # Unix timestamp of last update

@dataclass
class Cell:
    char: str               # Character
    foreground: int         # 0–7
    background: int         # 0–7
    charset: str            # Alpha, Mosaic, G2, G3
    flash: bool
    conceal: bool
    double_height: bool
    double_width: bool
```

### 4.2 Feed Event Types

```json
{
  "event": "teletext/page_update",
  "page_id": 101,
  "timestamp": "2026-05-23T12:00:00Z",
  "rows": [
    [" ", " ", "H", "E", "L", "L", "O", ...],
    ...
  ],
  "colours": [
    [{"fg": 7, "bg": 0}, {"fg": 7, "bg": 0}, ...],
    ...
  ]
}
```

### 4.3 Spool Format

```json
{
  "format": "ceefax-spool-v1",
  "pages": {
    "100": {
      "title": "INDEX",
      "rows": [...],
      "colours": [...]
    },
    "101": {
      "title": "NEWS HEADLINES",
      "rows": [...],
      "colours": [...]
    }
  },
  "metadata": {
    "created": "2026-05-23T12:00:00Z",
    "source": "ceefax-thinui",
    "page_count": 10
  }
}
```

## 5. MCP Command Protocol

### 5.1 Commands

| Command | Args | Description |
|---------|------|-------------|
| `PAGE` | `page: int` | Navigate to page |
| `NEXT` | — | Next page in sequence |
| `PREV` | — | Previous page in sequence |
| `REVEAL` | — | Toggle concealed text |
| `SUBTITLE` | — | Toggle subtitle mode |
| `SKIN` | `name: string` | Change visual skin |
| `STATUS` | — | Get current state |
| `INDEX` | — | Return to index page |
| `SPOOL_EXPORT` | `path: string` | Export spool to file |
| `SPOOL_IMPORT` | `path: string` | Import spool from file |

### 5.2 Response Format

```json
{
  "command": "PAGE",
  "status": "ok",
  "page": 101,
  "title": "NEWS HEADLINES",
  "timestamp": "2026-05-23T12:00:00Z"
}
```

## 6. CLI Interface

```
ucode thinui api --port 8001    # Start ThinUI API server
ucode thinui parse mygrid.txt   # Parse grid to ThinUI format
ucode thinui render --file mygrid.txt  # Render grid in TUI
```

## 7. Integration Points

### 7.1 uDos Feed Integration

```
Subscribe:  teletext/output
Emit:       teletext/page_update
            teletext/status
            teletext/error
```

### 7.2 uDos MCP Integration

```
Commands:   PAGE, NEXT, PREV, REVEAL, SUBTITLE, SKIN, STATUS
Port:       8484 (shared with Snackbar)
Protocol:   JSON-RPC over TCP
```

### 7.3 BBC BASIC VDU Bridge

```
VDU 1, n    — Move cursor to column n
VDU 2       — Enable teletext mode
VDU 3       — Disable teletext mode
VDU 4       — Cursor home
VDU 5       — Cursor off
VDU 6       — Cursor on
VDU 7       — Bell
VDU 8       — Backspace
VDU 9       — Tab
VDU 10      — Line feed
VDU 11      — Cursor up
VDU 12      — Clear screen
VDU 13      — Carriage return
VDU 17, n   — Text colour n (0–7)
VDU 18, n   — Background colour n (0–7)
VDU 22, n   — Screen mode n
VDU 23, n, d1, d2, d3, d4, d5, d6, d7, d8 — Define custom character
VDU 31, x, y — Position cursor at column x, row y
```

## 8. Project Structure

```
uCode1/
├── core_py/
│   ├── ceefax/
│   │   ├── bridge.py           # TeletextGrid — 40x25 grid with colour attributes
│   │   └── ceetex_app.py       # Textual app with LENS/SKIN/MCP integration
│   ├── thinui/
│   │   ├── api.py              # Flask API server
│   │   ├── grid_bridge.py      # ParsedGrid → ThinUI bridge
│   │   ├── component_mapper.py # Grid components → UI elements
│   │   ├── grid_renderer.py    # TUI grid rendering
│   │   └── formats.py          # ThinUI format definitions
│   └── usxd/
│       ├── grid_parser.py      # ASCII grid parser
│       └── models.py           # USXD document models
├── snacks/
│   └── ceetex/
│       └── snack.yaml          # Snack definition
└── gridui/
    └── src/views/surfaces/gridui/
        ├── panels/
        │   └── TeledeskPanel.vue   # Vue 3 teletext renderer
        └── styles/
            └── teletext-fonts.css  # Teletext font definitions
```

## 9. References

- [BBC RD 1984/1: Teletext Specification](https://www.bbc.co.uk/rd/publications/rdreport_1984_01)
- [ETSI EN 300 706: Enhanced Teletext Specification](https://www.etsi.org/deliver/etsi_en/300700_300799/300706/01.02.01_60/en_300706v010201p.pdf)
- [World System Teletext (WST) Standard](https://en.wikipedia.org/wiki/World_System_Teletext)
- [Ceefax - Wikipedia](https://en.wikipedia.org/wiki/Ceefax)
- [Teletext character set - Wikipedia](https://en.wikipedia.org/wiki/Teletext_character_set)
- [Existing TeledeskPanel.vue](gridui/src/views/surfaces/gridui/panels/TeledeskPanel.vue)
- [Existing TeletextGrid (Python)](uCode1/core_py/ceefax/bridge.py)
- [Existing CeetexUCodeApp (Python)](uCode1/core_py/ceefax/ceetex_app.py)
