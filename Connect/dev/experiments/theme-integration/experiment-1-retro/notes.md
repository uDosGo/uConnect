# Experiment 1 — Retro themes (NES.css, Bedstead, C64.css)

**Harness:** `index.html` + [`README.md`](README.md) (clone `vendor/`, build NES.css, `npx serve`).

**Runner:** @cursor  
**Date:** 2026-04-16  

## What we tested

- Themes applied: default, NES (CDN fallback), Bedstead, C64 (assets prepared)
- Browser(s): Not yet run (setup pass only)

## Results

- USXD shell preserved (Y/N): pending visual run
- Dark/light (Y/N / notes): pending visual run
- Tailwind or global CSS conflicts: pending visual run
- Bundle / weight notes (if any): CSS-only; local NES build blocked by legacy node-sass toolchain on Node 24

## Retro-specific

- Pixel fonts: pending visual run
- Grid / background: pending visual run

## Integration effort (1 trivial → 5 major)

Score: pending
**Would we ship this path?** pending

## Screenshots / links

- `vendor/` cloned for NES.css / bedstead / c64css3
- NES local build failed (`node-gyp` python + node-sass); harness now supports CDN fallback for NES
