---
title: "Monaspace font system & OBF font management (locked)"
tags: [--public]
audience: public
slot: 5
---

# Monaspace font system and OBF font management (locked)

**Grid alignment:** default **24×24 px** cell — see [grid-cell-cube-maths.md](grid-cell-cube-maths.md).

---

## Monaspace family (locked)

| Variant | Role |
| --- | --- |
| **Monaspace Argon** | Structural, wide — headers / display |
| **Monaspace Krypton** | Monospace — grids, Teletext, code |
| **Monaspace Neon** | Clean sans — prose |
| **Monaspace Radon** | Cursive — quotes / emphasis |
| **Monaspace Xenon** | Serif — publishing |

**Why Monaspace:** variable font (single file, multiple axes), built for code and prose, open source (GitHub), works with **24px** cell metrics.

### Variable-width healing

Proportional glyphs are **not** forced to one advance width: text “heals” into natural reading rhythm while **cell size (24px)** bounds the layout box. Renderers may still snap to grid lines for Teletext overlays.

---

## Font sources (locked)

| Source | Behaviour |
| --- | --- |
| **system** | Installed OS fonts |
| **google** | Google Fonts (via CDN where allowed) |
| **local** | `~/.local/share/udos/fonts/` |
| **cdn** | `https://cdn.udo.space/fonts/` (repo wireframe: [`cdn/fonts/`](../../cdn/fonts/); deploy: [`dev/cdn-cloud-setup.md`](../../dev/cdn-cloud-setup.md)) |

**User config file:** `~/.config/udos/fonts.yaml`

### Example `fonts.yaml`

```yaml
# ~/.config/udos/fonts.yaml
defaults:
  mono: "Monaspace Krypton"
  sans: "Monaspace Neon"
  serif: "Monaspace Xenon"
  display: "Monaspace Argon"
  cursive: "Monaspace Radon"

sources:
  google:
    - "JetBrains Mono"
    - "IBM Plex Mono"
  local:
    - "~/.local/share/udos/fonts/C64_Pro_Mono.ttf"
  cdn:
    - "https://cdn.udo.space/fonts/Teletext50.woff2"

grid:
  cell_width: 24
  cell_height: 24
  fallback: "Courier New"
```

### OBF-style font block (locked)

```obf-style
FONT_SYSTEM:
  family: "Monaspace"
  sources:
    - type: "system"
      name: "Monaspace Krypton"
      weight: "400"
    - type: "google"
      name: "JetBrains Mono"
      fallback: true
    - type: "local"
      path: "~/.local/share/udos/fonts/retro.ttf"
    - type: "cdn"
      url: "https://cdn.udo.space/fonts/teletext.woff2"

  grid_cell:
    width: 24
    height: 24
    unit: "pixels"

  variable_width: true
  ligatures: true
```

---

## CDN delivery (locked)

- **Base:** `https://cdn.udo.space/fonts/`
- **Package (example):** `udos-retro-fonts` — may include e.g. `Teletext50.woff2`, `C64_Pro_Mono.ttf`, `PressStart2P.ttf`, `VT323.ttf`
- **Policy:** fonts are **not** vendored in this Git repo; first use may **download** and cache under **`~/.cache/udos/fonts/`**

### CLI (planned VA1+ behaviour)

```text
udo font install retro
udo font list
udo font activate Teletext50
```

VA1 may ship **stubs** that print the spec path until download/cache is implemented.

---

## USXD example (Teletext display)

```usxd
SURFACE name="teletext-display" version="A1.0.0"

STYLE
  font_family: "Monaspace Krypton"
  font_source: "system"
  font_size: "14px"
  line_height: "1.4"
  letter_spacing: "0"
  variable_width: true

GRID
  cell_size: "24px"
  visible: true
  color: "#00FF00"

COMPONENT teletext-block
  style: "font-family: 'Monaspace Krypton'; font-size: 14px;"
  grid: "2×6 cells"
```

**Note:** `grid: "2×6 cells"` refers to **text-cell** Teletext layout from [grid-spec.md](grid-spec.md); **pixel** cell size for alignment remains **24px** when compositing with the QR model.

---

## See also

- [style-guide-obf.md](style-guide-obf.md) — wireframe colour tokens  
- [documentation-policy.md](../documentation-policy.md) — OBF fences
