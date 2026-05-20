---
title: "Grid, cell, cube — pixel/QR maths (locked)"
tags: [--public]
audience: public
slot: 5
---

# Grid, cell, and cube — pixel/QR maths (locked)

This document locks **storage and layout maths** for **pixel cells**, **QR modules**, **logical cubes**, and **physical brick cubes**. It complements the **text-mode** Teletext cell (2×6 characters) in [grid-spec.md](grid-spec.md); use whichever model your renderer implements.

## Conventions

- **Character capacity** is stated in **decimal** (e.g. 45,000 characters ≈ **45KB** when 1 “KB” = 1,000 characters for human-readable storage labels).
- **QR module** size on the pixel grid: **8×8 pixels** per small QR “tile” in the diagrams below.
- **Storage per QR:** **5,000 characters** (locked constant for uDos QR payload planning).

---

## Standard 24 (default cell)

| Quantity | Value |
| --- | --- |
| **Cell size** | **24×24 pixels** |
| **QR module** | **8×8 pixels** |
| **QR grid per cell** | **3×3** QR (nine positions) |
| **QR per cell** | **9** |
| **Storage per cell** | 9 × 5,000 = **45,000 characters (45KB)** |

Layout: **3 QR across × 3 QR down** inside one 24×24 pixel cell (each QR occupies an 8×8 pixel region in a 24×24 grid).

---

## Cube (logical stack)

| Quantity | Value |
| --- | --- |
| **Cells stacked (depth)** | **6** |
| **Total QR** | 6 × 9 = **54** |
| **Storage per cube** | 54 × 5,000 = **270,000 characters (270KB)** |

---

## Physical cube (bricks)

| Quantity | Value |
| --- | --- |
| **Brick lattice** | **6×6×6** |
| **Total bricks** | **216** |
| **Bricks per QR** | 216 ÷ 54 = **4** |
| **Cluster** | **2×2** bricks per QR |
| **Storage per brick** | 5,000 ÷ 4 = **1,250 characters** |

---

## Grid size variants (locked)

| Name | Cell (px) | QR grid | QR / cell | Storage / cell | Typical use |
| --- | --- | --- | --- | --- | --- |
| **Retro 16** | 16×16 | 2×2 | 4 | **20KB** (20,000 chars) | Tiny displays, watches |
| **Standard 24** | 24×24 | 3×3 | 9 | **45KB** | Default, phones |
| **Console 32** | 32×32 | 4×4 | 16 | **80KB** | Tablets, terminals |
| **HD 64** | 64×64 | 8×8 | 64 | **320KB** | Desktop, monitors |
| **HDD 128** | 128×128 | 16×16 | 256 | **1.28MB** | Large displays, kiosks |

**Default:** **Standard 24** — balance of **45KB/cell** clarity and density. **Logical cube** at Standard 24 retains **270KB** as above (54 QR × 5,000 chars).

---

## Visual reference (Standard 24)

```
Standard cell (24×24 px, 3×3 QR grid):

┌────────────────────────┐
│  ┌────┬────┬────┐      │   each small box = one 8×8 QR module
│  │ QR │ QR │ QR │      │   QR indices 00–08
│  ├────┼────┼────┤      │
│  │ QR │ QR │ QR │      │
│  ├────┼────┼────┤      │
│  │ QR │ QR │ QR │      │
│  └────┴────┴────┘      │
│  9 QR  |  45KB/cell    │
└────────────────────────┘

Physical cube (6×6×6 = 216 bricks):

     ┌─────┐  Layer 5  (36 bricks)
     ├─────┤  Layer 4
     ├─────┤  Layer 3
     ├─────┤  Layer 2
     ├─────┤  Layer 1
     └─────┘  Layer 0

1 brick  ≈ 1,250 chars  
4 bricks (2×2) ≈ 1 QR (5,000 chars)  
9 QR ≈ 1 cell (45KB)  
6 cells ≈ 1 logical cube (270KB)
```

**Related:** [display-sizes.md](display-sizes.md) (terminal vs pixel profiles), [font-system-obf.md](font-system-obf.md) (24px cell + fonts).
