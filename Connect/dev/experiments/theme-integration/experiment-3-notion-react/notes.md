# Experiment 3 — notion-design-system (React + Tailwind)

**Harness:** Vite app created locally per [`README.md`](README.md) (not committed).

**Runner:** @cursor  
**Date:** 2026-04-16  

## What we tested

- Package versions: Vite 8 scaffold + `notion-design-system@1.0.0`
- Components tried: `Sidebar`, `Card`, `Typography`, `Input`, `Button`, `Badge`, `Block(todo/text)` in a USXD-style header/sidebar/main/footer wrapper

## Results

- Block editor usable for uDos tasks (Y/N): partial — block primitives render; richer editor behaviors still untested
- `className` / layout overrides for USXD shell: yes for wrapper-level classes; component internals still opinionated
- Tailwind preset conflicts: peer warning remains (`lucide-react` expects React <=18; scaffold uses React 19); build still succeeds
- Build size (rough): with design-system wiring JS ~212.39 kB (gzip ~66.06 kB), CSS ~26.85 kB (gzip ~5.62 kB)

## Integration effort (1–5)

Score: 3/5
**Would we ship this path?** maybe, if React 18/19 compatibility is pinned and table component viability is proven

## Links

- Local app path: `dev/experiments/theme-integration/experiment-3-notion-react/notion-react-lab`
- App entry edited: `notion-react-lab/src/App.tsx`
