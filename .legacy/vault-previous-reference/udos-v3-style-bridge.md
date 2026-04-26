# uDOS v3 style guide ↔ UniversalSurfaceXD browser-mockup

**License:** This repository is [MIT](../LICENSE). The uDOS v3 documents linked below are in a separate repository under their own license.

**Purpose:** keep the UX designer **default dark shell** aligned with the uDOS v3 reference palette and grid CSS variable names.

**Authoritative uDOS v3 docs (sibling monorepo):**

- [style-guide.md](https://github.com/fredporter/uDOS-v3/blob/main/docs/style-guide.md) — §0 scale model, §2 colour system, §3 typography, `--udos-viewport-*` / `--udos-tile-px-*`
- [GRID-GRAPHICS-CANON.md](https://github.com/fredporter/uDOS-v3/blob/main/docs/GRID-GRAPHICS-CANON.md) — 80×30, 16×24, teletext 2×3, fallback ladder
- [DISPLAY_STACK.md](https://github.com/fredporter/uDOS-v3/blob/main/docs/DISPLAY_STACK.md) — read order

**Implemented in this repo:**

| uDOS v3 style guide (§2) | `browser-mockup` token |
| --- | --- |
| Primary `#0A0F1C` | `--ux-bridge-surface-deep` (page gradient top) |
| Surface `#121826` | `--ux-bridge-surface`, `--ux-bridge-inset-bg` |
| Elevated `#1B2436` | `--ux-bridge-panel` |
| Border `#2A3550` | `--ux-bridge-card-border`, `--ux-bridge-inset-border`, … |
| Blue `#4DA3FF` | `--ux-bridge-accent`, `--ux-bridge-link-active` |
| Teal `#2DD4BF` | `--ux-bridge-doc-link`, link hover mix |
| Purple `#8B5CF6` | callout C / violet pills (tinted) |
| Orange `#FB923C` | callout B |
| Green `#22C55E` | success, callout A |
| Red `#EF4444` | danger text |
| Text Primary `#E6EDF3` | `--ux-bridge-foreground`, headings |
| Text Secondary `#9AA6B2` | `--ux-bridge-muted` |
| Text Muted `#6B7280` | `--ux-bridge-subtle` |

**Grid variables** on `:root` (same names as ThinUI):

- `--udos-viewport-cols: 80`
- `--udos-viewport-rows: 30`
- `--udos-tile-px-w: 16`
- `--udos-tile-px-h: 24`

**TypeScript constants** for lab/docs parity: `browser-mockup/src/lib/udos/grid-canonical.ts` (keep in sync with uDOS-v3 `packages/shared/src/grid-canonical.ts`).

**Lab:** [`/lab/grid-canon`](../browser-mockup/src/routes/lab/grid-canon/+page.svelte) — human-readable summary + links to GitHub.

**Overrides:** `?sd=` (Syncdown v4) and `?theme=udos-cm` replace the default bridge tokens; they do not change the grid constants.
