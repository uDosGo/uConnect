# DEVLOG — Theme experiments setup pass + blockers

**Date:** 2026-04-16

## Setup completed

- **Experiment 1 vendor clones:** `NES.css`, `bedstead`, `c64css3` under `experiment-1-retro/vendor/`
- **Experiment 2 vendor clone:** `notion.css` under `experiment-2-notion-css/vendor/`
- **Experiment 3 local scaffold:** `experiment-3-notion-react/notion-react-lab` created with Vite React TS + `notion-design-system`

## Blockers / observations

- **NES local build blocked on modern Node:** `node-sass` toolchain (`node-gyp` python expectation) fails on current environment.
  - Mitigation applied: Experiment 1 harness now falls back to CDN `nes.css@2.3.0` if local `vendor/NES.css/css/nes.min.css` is missing.
- **notion-design-system peer warning:** transitive `lucide-react` expects React <=18 while scaffold is React 19.
  - Baseline build still succeeds; component integration compatibility remains a validation item.

## Evidence updates

- Experiment notes updated with setup status and pending visual checks:
  - `experiment-1-retro/notes.md`
  - `experiment-2-notion-css/notes.md`
  - `experiment-3-notion-react/notes.md`

