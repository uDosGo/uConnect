# uCode1 Grid & Layout Specification

**Version:** 1.0 (Final)
**Status:** LOCKED
**Last Updated:** 2026-04-30
**Supersedes:** UDO_FORMAT.md, ucode1-128-char-spec.md, UDX_FORMAT.md, display.css conventions

---

## Table of Contents

1. [Core Grid](#1-core-grid)
2. [Slot Architecture (128 Characters)](#2-slot-architecture-128-characters)
3. [Display System](#3-display-system)
4. [Layout Formats](#4-layout-formats)
5. [Rendering Pipeline](#5-rendering-pipeline)
6. [Surfaces](#6-surfaces)
7. [Implementation Reference](#7-implementation-reference)

---

## 1. Core Grid

### 1.1 Grid Dimensions

The uCode1 grid is a **character-cell grid** where every cell occupies exactly one character width and one line height.

| Property | Standard | Minimum | Maximum |
|----------|----------|---------|---------|
| Columns  | 40       | 20      | 80      |
| Rows     | 25       | 10      | 48      |
| **Ceefax/Teletext** | **40×25** | 20×10 | 80×24 |

The **Ceefax teletext standard (40×25)** is the design baseline for all surfaces.

### 1.2 Grid Formats (USXD)

```python
class GridFormat(Enum):
    SIMPLE       = "simple"        # Raw characters
    BOX_DRAWING  = "box"           # ─│┌┐└┘├┤┬┴┼
    TELETEXT     = "teletext"      # CP437 blocks (slots 0-31)
    MARKDOWN     = "markdown"      # | table | format |
    CSV          = "csv"           # comma,separated,values
```

### 1.3 Coordinate System

- Origin: `(0, 0)` at top-left
- X-axis: column (increasing right)
- Y-axis: row (increasing down)
- Units: character cells (1 cell = 1 character)

```python
@dataclass
class Coordinate:
    x: int
    y: int
    system: CoordSystem = CoordSystem.CARTESIAN
```

### 1.4 Grid Data Model

```python
@dataclass
class GridCell:
    char: str              # Single character
    fg_color: Optional[str]  # Foreground color
    bg_color: Optional[str]  # Background color
    bold: bool = False
    blink: bool = False
    cell_type: Optional[str]  # Semantic type hint

@dataclass
class Grid:
    width: int
    height: int
    cells: List[List[GridCell]]
    format: GridFormat
```

---

## 2. Slot Architecture (128 Characters)

### 2.1 Slot Map

| Slot Range | Count | Type | Purpose |
|------------|-------|------|---------|
| 0-31 | 32 | **Teletext blocks** | CP437 block graphics (█▄▀▌▐░▒▓☺♥♦♣♠ etc.) |
| 32-126 | 95 | **Printable ASCII** | A-Z a-z 0-9 !@#$%^&*() etc. |
| 127 | 1 | DEL | Reserved / empty / fallback |
| **Total** | **128** | | |

### 2.2 Teletext Block Characters (Slots 0-31)

These are the CP437-derived block graphics used in teletext mode.

```
 0: '\u0000'  NULL          16: '\u25BA'  ►  Right arrow
 1: '\u263A'  ☺  Smile      17: '\u25C4'  ◄  Left arrow
 2: '\u263B'  ☻  Inv smile  18: '\u2195'  ↕  Up/down arrow
 3: '\u2665'  ♥  Heart      19: '\u203C'  ‼  Dbl exclamation
 4: '\u2666'  ♦  Diamond    20: '\u00B6'  ¶  Paragraph
 5: '\u2663'  ♣  Club       21: '\u00A7'  §  Section
 6: '\u2660'  ♠  Spade      22: '\u2588'  █  Full block
 7: '\u2022'  •  Bullet     23: '\u2584'  ▄  Lower half
 8: '\u25D8'  ◘  Inv bullet 24: '\u2580'  ▀  Upper half
 9: '\u25CB'  ○  Circle     25: '\u258C'  ▌  Left half
10: '\u25D9'  ◙  Inv circle 26: '\u2590'  ▐  Right half
11: '\u2642'  ♂  Male       27: '\u2591'  ░  Quarter block
12: '\u2640'  ♀  Female     28: '\u2592'  ▒  Mid block
13: '\u266A'  ♪  Music note 29: '\u2593'  ▓  Dark block
14: '\u266B'  ♫  Dbl note   30: '\u2588'  █  Light block
15: '\u263C'  ☼  Sun        31: ' '        Reserved
```

### 2.3 Emoji Overlays (Slots 0-127)

Each slot can have **one emoji overlay**. Emoji overlays are metadata on existing slots — they do not consume additional slots.

**Rendering priority:**
> Emoji → Word Alias → Teletext (slots 0-31) → ANSI (slots 32-126)

### 2.4 Rendering Priority

```
If emoji_mode is ON and slot has emoji overlay → show emoji
Else if word_alias mode is ON and slot has alias → show :word:
Else if slot in 0-31 and teletext mode → show CP437 block
Else → show ANSI base character
```

---

## 3. Display System

### 3.1 Three Scaling Modes

Each surface uses a different scaling strategy:

#### Mode A: BBC BASIC — Locked Viewport Grid (Proportional)

The grid has a **fixed number of columns × rows** (e.g. 40×24). The font size scales proportionally to make the grid fill 80% of the viewport. The grid dimensions never change — only the font scales.

```
targetW = viewport_width  * 0.8
targetH = viewport_height * 0.8
fontFromW = targetW / (cols * char_aspect_ratio)
fontFromH = targetH / rows
fontSize  = min(fontFromW, fontFromH)
```

Used by: BBC BASIC terminal surface.

#### Mode B: NES Dashboard — Fluid Layout (Responsive)

No fixed grid. Uses CSS flexbox/grid with block-style components that fill available space. Font size is adjustable via A+/A- controls but doesn't change the layout structure — components reflow naturally.

Used by: NES Dashboard surface.

#### Mode C: Ceefax Teletext — Full Window, Dynamic Grid (Fit-to-Window)

Fills the **entire window** (100vw × 100vh). The font size is **fixed** (user-adjustable via A+/A-). The grid dimensions (cols × rows) are calculated dynamically to fit the current window at the current font size:

```
fontSize  = user-set (default 25px for Teletext50)
cols      = Math.floor(viewport_width  / (fontSize * CHAR_ASPECT))
rows      = Math.floor(viewport_height / fontSize) - chromeRows
```

- `CHAR_ASPECT` = 0.60 for Teletext50
- `chromeRows` = 6 (header + sub-header + ticker + fasttext + nav + footer)
- Font +/- adjusts font size and recalculates grid dimensions
- Content clips at the calculated grid boundary

Used by: Ceefax teletext surface.

### 3.2 Font Aspect Ratios

| Surface | Font | Columns × Rows | Aspect Ratio (`--udos-aspect`) |
|---------|------|----------------|-------------------------------|
| Ceefax/Teletext | **Teletext50** | 40×25 | 0.60 |
| BBC BASIC | C64 User Mono | 40×24 (80×30) | 0.55 |
| NES Dashboard | Press Start 2P | Fluid layout | N/A (font controls) |

### 3.3 CSS Custom Properties

```css
:root {
  --udos-cols: 40;
  --udos-rows: 25;
  --udos-font-base: 25px;   /* Teletext50 native size */
  --udos-aspect: 0.60;      /* char width ratio */
  --udos-font-size: 25px;
}
```

### 3.4 Surface Class

```html
<div class="udos-surface" data-surface="ceefax">
```

The `udos-surface` class centers the grid in the viewport:
```css
.udos-surface {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
}
```

---

## 4. Layout Formats

### 4.1 UDO (Universal Document Object)

JSON-based block layout format for teletext-inspired interfaces.

```json
{
  "version": "1.0",
  "type": "dashboard",
  "title": "Document Title",
  "layout": "grid-12",
  "blocks": [],
  "theme": "teletext",
  "refreshInterval": 30
}
```

**Block types:** text, metric, activity, health
**Grid:** 12-column layout via `span` property
**Storage:** `~/Code/Vault/.udo/`

### 4.2 UDX (Universal Document eXchange)

JSON-based code atlas format for mapping ASCII grids to components.

```json
{
  "version": "1.0",
  "type": "layout",
  "sections": [],
  "metadata": {},
  "codeAtlas": {}
}
```

**ASCII grid → component mapping** via USXD parser.

### 4.3 Page Data (Ceefax Teletext)

JavaScript object defining teletext pages as arrays of 40-character strings:

```javascript
var pageData = {
  100: { title: 'MAIN MENU', lines: [
    '                                        ',
    '  ██╗░░░░░░░██╗██████╗░░█████╗░░██████╗',
    ...
  ]}
};
```

- Each line is exactly 40 characters wide
- Lines are rendered `white-space: pre` with `line-height: 1em`
- HTML spans can be embedded for styling (`.flash`, `.hl`, `.rev`, `.yellow`, `.green`, `.cyan`, `.red`, `.magenta`, `.blue-bg`)

---

## 5. Rendering Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    uCode1 Rendering Pipeline                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐    │
│  │ Source   │───▶│ Parser   │───▶│ Grid Data Model      │    │
│  │ (.udo)   │    │ (USXD)   │    │ (Grid of GridCells)  │    │
│  │ (pageData│    │          │    │                      │    │
│  │ (ASCII)  │    └──────────┘    └──────────┬───────────┘    │
│  └──────────┘                               │                │
│                                              ▼                │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐    │
│  │ Surface  │◀───│ Renderer │◀───│ Component Mapper     │    │
│  │ (HTML)   │    │ (CSS)    │    │ (cell → widget)      │    │
│  │ (TUI)    │    │ (JS)     │    │                      │    │
│  └──────────┘    └──────────┘    └──────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Display Scaling (udos-widgets.js)                   │    │
│  │  font-size = min(fontFromW, fontFromH)               │    │
│  │  width = cols × 1ch   height = rows × 1em           │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 5.1 Font Loading

```css
@font-face {
  font-family: Teletext50;
  src: url(Teletext50.otf) format("opentype");
}
```

Fonts are stored alongside their theme:
- `themes/ceefax/Teletext50.otf`
- `themes/bbcbasic/` (C64 User Mono from Google Fonts)
- `themes/nesdash/` (Press Start 2P from Google Fonts)

### 5.2 Color System

| Color | Hex | CSS Class | Purpose |
|-------|-----|-----------|---------|
| White | `#ffffff` | — | Default body text |
| Yellow | `#ffff00` | `.yellow` | Page numbers, highlights |
| Cyan | `#00ffff` | `.cyan` | Secondary info |
| Green | `#00ff00` | `.green` | Success, active status |
| Red | `#ff0000` | `.red` | Alerts, fasttext |
| Magenta | `#ff00ff` | `.magenta` | Special emphasis |
| Blue bg | `#0000ff` | `.blue-bg` | Header/ticker bars |

---

## 6. Surfaces

### 6.1 Ceefax Teletext (Primary Surface)

| Property | Value |
|----------|-------|
| Grid | **40×25** |
| Font | **Teletext50** (25px native) |
| Chrome | Blue header, status bar, ticker tape, fasttext bar |
| Navigation | 3-digit keyboard input + clickable page keys |
| Pages | Data-driven JS objects |
| Rendering | ANSI → Teletext blocks (slots 0-31) → Emoji overlays |
| Menu | Shared display.css Tailwind menu |

**Chrome layout (top to bottom):**
1. Header bar (blue bg, white text, page number, clock)
2. Sub-header (black bg, green text, page info)
3. Content area (40×25 character grid)
4. Ticker tape (blue bg, scrolling latest info)
5. Fasttext bar (colored category labels)
6. Footer (CEETEX info, date)

### 6.2 BBC BASIC Terminal

| Property | Value |
|----------|-------|
| Grid | 40×24 default (switchable to 80×30, 32×16, 20×10) |
| Font | C64 User Mono |
| Chrome | Dark blue viewport, loader bars on boot, keyboard input |
| Menu | Shared display.css Tailwind menu |

### 6.3 NES Dashboard

| Property | Value |
|----------|-------|
| Grid | Fluid (A+/A- font controls) |
| Font | Press Start 2P |
| Chrome | White bg, black borders, NES.css widgets |
| Menu | Shared display.css Tailwind menu |

---

## 7. Implementation Reference

### 7.1 File Structure

```
uCode1/
  themes/
    display.css             # Shared surface + menu styles
    udos-widgets.js         # Display scaling + widget system
    ceefax/
      index.html            # Teletext surface (Teletext50 font)
      Teletext50.otf        # Teletext font file
    bbcbasic/
      index.html            # BBC BASIC terminal (C64 User Mono)
      css.css               # BBC BASIC-specific styles
    nesdash/
      index.html            # NES dashboard (Press Start 2P)
      nes.css               # NES.css ThinUI Edition
    grid-test.html          # Grid size verification matrix
  core_py/
    usxd/
      grid_parser.py        # ASCII grid → structured data
      grid_renderer.py      # TUI rendering
      component_mapper.py   # Cell → component mapping
      models.py             # USXD data models
      cell_mapping.py       # Cell resolution
    grid/
      models.py             # Grid core data structures
      coords.py             # Coordinate systems
      layers.py             # Grid layering
      operations.py         # Grid operations
      monodraw.py           # Monodraw integration
```

### 7.2 Key CLI Commands

```bash
ucode grid parse --text "<ascii>"           # Parse ASCII grid
ucode grid render <file>                    # Render to terminal
ucode grid to-usxd <file> --output <path>   # Convert to USXD
ucode grid edit                             # Edit in Monodraw
```

### 7.3 Validation Rules

1. All UDO documents must be valid JSON
2. Block IDs must be unique within a document
3. `span` values must sum to ≤ 12 per row in grid-12 layout
4. Teletext page lines must be exactly 40 characters wide
5. Font files must be served alongside their theme directory

### 7.4 Quick Reference

```yaml
# Canonical teletext page structure (40 columns × 25 rows)
page:
  format: teletext
  grid: 40x25
  font: Teletext50
  font_size: 25px
  aspect_ratio: 0.60
  chrome:
    header: blue_bg + white text
    subheader: black_bg + green text
    ticker: blue_bg + white text
    fasttext: colored categories
    footer: black_bg + white text
  navigation:
    input: 3-digit keyboard buffer
    click: page key buttons
  rendering:
    - ANSI base (slots 32-126)
    - Teletext blocks (slots 0-31, CP437)
    - Emoji overlays (toggleable, slots 0-127)
```

---

**End of Specification.**
