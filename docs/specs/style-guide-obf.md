---
title: "Style guide (OBF wireframe)"
tags: [--public]
audience: public
slot: 5
---

# Style guide — OBF wireframe (A1)

Canonical tokens for **wireframe** and **teletext**-aligned UIs. Copy the block into docs or themes; adjust values in one place.

**Fonts:** primary stack is **Monaspace** (Argon / Krypton / …) — [font-system-obf.md](font-system-obf.md). The sample below still lists **JetBrains Mono** for older snippets; swap to Monaspace in new work.

**Pixel grid:** **24×24 px** default cell for QR alignment — [grid-cell-cube-maths.md](grid-cell-cube-maths.md). The `GRID.cell_size` line below is **text-mode** (2×6 characters).

```obf-style name="udos-wireframe" version="A1.0.0"

COLORS:
  ink: "#00FF00"        # Teletext green
  paper: "#000000"      # Black background
  grid: "#1a1a1a"       # Grid lines
  accent: "#00FF00"     # Highlights
  error: "#FF0000"      # Errors
  warning: "#FFCC00"    # Warnings

TYPOGRAPHY:
  family: "JetBrains Mono, Monaco, monospace"
  size: "14px"
  line-height: "1.5"

SPACING:
  cell: "8px"
  tile: "16px"
  gap: "4px"

BORDERS:
  style: "solid"
  width: "1px"
  color: "var(--grid)"

SHADOWS: none
ANIMATIONS: none (wireframe)

GRID:
  visible: true
  cell_size: "2×6"
  color: "var(--grid)"

COMPONENTS:
  button: "px-4 py-2 bg-teletext text-black rounded"
  card: "border border-teletext rounded-lg p-4"
  input: "bg-gray-800 border border-gray-700 rounded px-3 py-2"
```

**Related:** [open-box-format.md](open-box-format.md), [obf-components.md](obf-components.md), [font-system-obf.md](font-system-obf.md), [grid-cell-cube-maths.md](grid-cell-cube-maths.md).
