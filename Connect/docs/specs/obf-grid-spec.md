---
title: "OBF Grid specification"
version: "1.0.0"
audience: "--public"
tags:
  - "--public"
  - "--spec"
slot: 5
---

# OBF Grid specification

**Audience:** public — design-time tool for surfaces (not dev-only). **Implementation:** npm workspace [`@udos/obf-grid`](../../modules/obf-grid/) · CLI **`udo grid`**.

## Principle

Every grid is **text** inside a markdown **fenced block**. No GUI builder: edit the OBF block, render in the terminal or export. See also [open-box-format.md](open-box-format.md) and [grid-spec.md](grid-spec.md).

## Fence syntax

````markdown
```grid [options]
…cell data…
```
````

### Options (header line)

| Option | Values | Default |
| --- | --- | --- |
| `size` | `WxH` cells | `12x12` (coordinate mode) or inferred (compact) |
| `mode` | `teletext` \| `mono` \| `wireframe` | `teletext` |
| `cell_size` | e.g. `2x6` chars | documentation only in VA1 parser |
| `show_coords` | `true` \| `false` | `false` |
| `editable` | `true` \| `false` | `true` |
| `compact` | flag or `compact=true` | off |

### Coordinate format

Each token: `[x,y]<char>` with zero-based indices.

```grid size="12x12" mode="teletext" show_coords="true"
[0,0]█ [0,1]█ [0,2]█
```

### Compact format

Add **`compact`** to the header. One character per column; one row per line:

```grid size="12x6" mode="teletext" compact
████████████
█░░░░░░░░░░█
█░░▒▒░░░░░░█
```

### Character set (locked)

| Char | Notes |
| --- | --- |
| `█` `▓` `▒` `░` | Blocks / shades |
| `□` `■` | Boxes |
| space | Empty (render may show `·` in terminal) |

## File conventions

- Embed in any **`.md`** file, or use a dedicated **`.grid.md`** / **`.grid`** file containing a fence or raw compact art.

## CLI (VA1)

| Command | Status |
| --- | --- |
| `udo grid render <file> [--mode]` | Terminal ANSI (teletext / mono / wireframe) |
| `udo grid export <file> --format ascii\|obf` | Plain text or fenced OBF |
| `udo grid export --format svg\|png` | **P1** — not yet |
| `udo grid validate <file>` | Dimension check |
| `udo grid edit <file>` | Opens `$EDITOR`; creates minimal grid if missing |
| `udo grid resize` / `rotate` / `layer …` | **P1** — planned |

Full-screen **h/j/k/l** TUI is **planned**; until then, editing is **plain text** (open box).

## Layers

Multi-layer grids (`layers="3"`, merge, z-order) are **P1** — see implementation tasks in repo issues / future spec revision.

## Related

- Pixel / QR storage: [grid-cell-cube-maths.md](grid-cell-cube-maths.md)
- Module source: [`modules/obf-grid/`](../../modules/obf-grid/)
