# USXD ↔ uDOS integrated template spec

**Purpose:** single checklist binding **uDOS v3** implementation repos and **UniversalSurfaceXD** (interchange + designer) so grid, tile, graphics, and surface declarations stay compatible.

**Status:** normative template (2026-04-09)  
**Canon pair:** [uDOS-v3 `docs/GRID-GRAPHICS-CANON.md`](https://github.com/fredporter/uDOS-v3/blob/main/docs/GRID-GRAPHICS-CANON.md) (web) · sibling path `../uDOS-v3/docs/GRID-GRAPHICS-CANON.md` if cloned · [UniversalSurfaceXD_v2-cannon.md](UniversalSurfaceXD_v2-cannon.md)

---

## 1. Non-negotiable geometry

| Item | Value |
| --- | --- |
| Viewport grid | **80 × 30** |
| Mini grid (when used) | **40 × 15** |
| Tile raster per cell | **16 × 24 px** |
| Teletext subcell | **8 × 8 px** (2×3 inside one cell) |
| Wide glyph / emoji footprint | **2×1** cells = **32 × 24 px** |
| Canonical graphics encoding | **teletext-2×3** |
| Fallback ladder | Teletext → ASCII block → Shades → ASCII |

---

## 2. Document shapes (two layers)

**A. Transport / design (YAML-first in canon)**  
Use the **UniversalSurfaceXD v0.1** shape from the cannon doc (`surface.version: usxd/0.1`, `grid.tile_px`, `graphics`, `regions`, `adapters`, …). This is the **portable** file you validate and pass between repos.

**B. Runtime / designer interchange (JSON)**  
Existing `SurfaceDocument`-style JSON (meta + grid + root nodes) used in `interchange/` and browser-mockup must encode tile size as **width and height**, not a single `cell` scalar:

```ts
grid: {
  cols: 80;
  rows: 30;
  tile_px: { w: 16; h: 24 };
}
```

Legacy samples that used `cell: 16` for both dimensions are **obsolete**; replace with `tile_px` so canvas math is **width = cols × w**, **height = rows × h**.

---

## 3. uDOS repo responsibilities

| Repo | Role |
| --- | --- |
| **uDOS-v3** | Host / ThinUI / schemas implement **canonical** layout and tests; [GRID-GRAPHICS-CANON.md](https://github.com/fredporter/uDOS-v3/blob/main/docs/GRID-GRAPHICS-CANON.md) is the monorepo entry. |
| **UniversalSurfaceXD** | Portable spec, interchange JSON, designer mockups; cannon doc + this template. |
| **uDOS-themes** | Token/skin **dialects** mapped to the same USXD structure (no semantic forks). |

---

## 4. Validation checklist (CI / handoff)

- [ ] `grid.cols === 80` and `grid.rows === 30` for **canonical** mode surfaces.
- [ ] `grid.tile_px.w === 16` and `grid.tile_px.h === 24`.
- [ ] `graphics.canonical` includes **teletext-2×3** (or equivalent enum) where graphics block is present.
- [ ] Fallback list includes **ascii** as terminal rung.
- [ ] **Feed** surfaces use `kind: feed` and bindings (not log-dump UI pretending to be a feed).
- [ ] Story / step-form / slide share one schema family (steps vs frames; shared attrs per cannon §10).
- [ ] Region rects are **integer** grid units; roles from shared grammar (header, primary, …).

---

## 5. Path note

Relative links in some decision docs assume **UniversalSurfaceXD** and **uDOS-v3** are **siblings** (for example `../uDOS-v3/...`). If you only clone UniversalSurfaceXD, use the **GitHub** links next to those paths. Adjust paths if your folder layout differs.

---

## 6. Syncdown Figma source registration (v4 integration)

When integrating Syncdown into USXD templates, register both Figma lanes:

```yaml
figma_sources:
  - id: syncdown-mdcv3-app
    title: Syncdown / MDC v3 App
    role: legacy-reference
    usage: migration parity and visual regression checks
  - id: syncdown-mdcv4-app
    title: Syncdown / MDC v4 App
    role: primary-rich-browser-source
    usage: source of truth for browser adapter composition
```

Template rule:

- New Syncdown surface contracts must target `syncdown-mdcv4-app`.
- `syncdown-mdcv3-app` remains reference-only and should not receive new canonical contracts.
