---
title: "uDos A1 Style Guide"
version: "1.0.0"
audience: "--public"
tags:
  - "--public"
  - "--spec"
slot: 5
---

# uDos A1 Style Guide

**Canonical detail:** colours also appear in [style-guide-obf.md](style-guide-obf.md); pixel/QR storage in [grid-cell-cube-maths.md](grid-cell-cube-maths.md); fonts in [font-system-obf.md](font-system-obf.md).

## Core principles

- **Open box:** Every UI component is a text code block (see [open-box-format.md](open-box-format.md)).
- **Wireframe first:** Black background, green ink (`#00FF00`).
- **Dual grid:** Teletext **text** cells **2×6** characters ([grid-spec.md](grid-spec.md)); **pixel** cells **24×24** with **3×3** QR ([grid-cell-cube-maths.md](grid-cell-cube-maths.md)).
- **Type:** **Monaspace** — Krypton for grids/code, Neon for prose ([font-system-obf.md](font-system-obf.md)).

## Colours

| Role | Hex | CSS variable | Use |
| --- | --- | --- | --- |
| Ink | `#00FF00` | `--udos-ink` | Primary text |
| Paper | `#000000` | `--udos-paper` | Background |
| Grid | `#1A1A1A` | `--udos-grid` | Grid lines |
| Accent | `#00FF00` | `--udos-accent` | Highlights |
| Error | `#FF0000` | `--udos-error` | Errors |
| Warning | `#FFCC00` | `--udos-warning` | Warnings |

## Typography

```obf-style
FONT_SYSTEM:
  default: "Monaspace Krypton"
  prose: "Monaspace Neon"
  grid: "Monaspace Krypton"
  display: "Monaspace Argon"

  sizes:
    small: "12px"
    base: "14px"
    large: "16px"
    h1: "24px"
    h2: "20px"
    h3: "18px"

  line_height: 1.5
  variable_width: true
```

## Grid system (summary)

```grid size="12x12" mode="teletext"
# Text mode: 2×6 char cells — see grid-spec.md
# Pixel mode (locked):
STANDARD_CELL: 24×24 px | QR: 3×3 = 9 QR/cell | ~45KB/cell
CELL_STACK×6: 1 cube | ~270KB — grid-cell-cube-maths.md
```

## UI components

### Button

```obf
COMPONENT button
  STYLE: "px-4 py-2 bg-teletext text-black rounded"
  VARIANTS:
    primary: "bg-teletext text-black"
    secondary: "bg-gray-700 text-white"
    danger: "bg-red-600 text-white"
```

### Card

```obf
COMPONENT card
  STYLE: "border border-teletext rounded-lg p-4"
  PARTS:
    header: "border-b border-gray-800 pb-2 mb-2 font-bold"
    body: "text-gray-300"
    footer: "border-t border-gray-800 pt-2 mt-2 text-xs"
```

## Layout blocks

```obf
BLOCK two-column
  STYLE: "display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"

BLOCK three-column
  STYLE: "display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;"

BLOCK card-grid
  STYLE: "display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;"
```

## Maintenance

Update this file when UI tokens, grid maths, or Monaspace roles change; keep [style-guide-obf.md](style-guide-obf.md) wireframe block in sync where overlapping.

## Version history

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2026-04-14 | Initial VA1 style guide |
