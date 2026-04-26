---
title: "Display size specifications"
tags: [--public]
audience: public
slot: 5
---

# Display size specifications — locked

## Text-terminal profiles

Reference dimensions when the **cell** is counted in **characters** (Teletext / monospace). Character **cell** size stays **2×6** unless a profile scales the font.

| Profile | Width | Height | Grid (cells) | Cell size |
| --- | --- | --- | --- | --- |
| **terminal** | 80 columns | 24 rows | 12×12 | 2×6 chars |
| **mobile** | 40 columns (scaled) | 12 rows (scaled) | 6×6 | 2×6 chars (scaled) |
| **desktop** | 120 columns | 36 rows | 18×18 | 2×6 chars |

## Pixel / QR cell variants (locked)

Aligned with [grid-cell-cube-maths.md](grid-cell-cube-maths.md). **Standard** = **24×24 px**.

| Name | Cell (px) | Storage/cell | Notes |
| --- | --- | --- | --- |
| **Retro 16** | 16×16 | 20KB | Tiny / watch |
| **Standard 24** | 24×24 | **45KB** (default) | Phones |
| **Console 32** | 32×32 | 80KB | Tablets |
| **HD 64** | 64×64 | 320KB | Desktop |
| **HDD 128** | 128×128 | 1.28MB | Kiosks |

## Default fonts (text mode)

| Platform | Font |
| --- | --- |
| macOS | Monaco |
| Linux / Windows | JetBrains Mono |
| Fallback | Courier New |

**Pixel/UI surfaces:** prefer **Monaspace** stack — [font-system-obf.md](font-system-obf.md).

## Fallback glyphs

- **Blocks:** `█ ░ ▒ ▓ ■ □`
- **Lines:** `┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼`
- **Arrows:** `← ↑ → ↓ ↔ ↕`

Renderers should substitute down gracefully when a font lacks Teletext glyphs.
