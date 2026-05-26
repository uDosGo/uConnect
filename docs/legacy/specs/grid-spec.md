---
title: "Teletext grid specification"
tags: [--public]
audience: public
slot: 5
---

# Teletext grid specification — locked

**Two grid models (both valid):**

1. **Text / Teletext cell** — **2×6 characters** per cell (this page): OBF `grid` blocks, monospace terminals.
2. **Pixel / QR storage cell** — **24×24 px** default, **8×8** QR modules, **3×3** QR per cell — locked maths, cubes, bricks: **[grid-cell-cube-maths.md](grid-cell-cube-maths.md)**.

| Property | Value |
| --- | --- |
| **Name** | Teletext Grid |
| **Cell size** | **2×6** characters (width × height) |
| **Default display** | **12×12** cells |
| **Total cells (default)** | **144** per screen |
| **Character set** | ASCII + block glyphs (e.g. `█ ░ ▒ ▓ ■ □`) |

## Coordinates

- Cells addressed **(0,0)** through **(11,11)** for a 12×12 grid.
- **uTile** = one **2×6** cell region (e.g. for QR or storage layout).
- Logical model: `grid[x][y]` with origin top-left unless a renderer specifies otherwise.

## Display modes

| Mode | Description |
| --- | --- |
| **mono** | Black background, green text (`#00FF00`) |
| **teletext** | Black background, coloured blocks (Teletext palette) |
| **wireframe** | White background, black text |

## Example `grid` block

```grid size="12x12" mode="teletext"
[0,0]█ [0,1]█ [0,2]█ [0,3]█ [0,4]█ [0,5]█
[1,0]█ [1,1]░ [1,2]░ [1,3]░ [1,4]░ [1,5]█
[2,0]█ [2,1]░ [2,2]▒ [2,3]▒ [2,4]░ [2,5]█
[3,0]█ [3,1]░ [3,2]▒ [3,3]▒ [3,4]░ [3,5]█
[4,0]█ [4,1]░ [4,2]░ [4,3]░ [4,4]░ [4,5]█
[5,0]█ [5,1]█ [5,2]█ [5,3]█ [5,4]█ [5,5]█
```

Larger layouts may use the same cell size with a bigger `size` attribute; see [display-sizes.md](display-sizes.md).
