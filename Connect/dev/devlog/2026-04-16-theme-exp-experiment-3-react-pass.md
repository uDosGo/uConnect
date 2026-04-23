# DEVLOG — Theme Experiment 3 React pass

**Date:** 2026-04-16

## What was done

- Wired `notion-design-system` components into local lab:
  - `Sidebar`, `Card`, `Typography`, `Input`, `Button`, `Badge`, `Block`
- Kept a USXD-style shell wrapper (header / sidebar / main / footer) around the component surface.
- Built successfully: JS ~212.39 kB (gzip ~66.06 kB), CSS ~26.85 kB (gzip ~5.62 kB).

## Risks noted

- Peer warning remains: `lucide-react` in transitive deps expects React <=18 while lab scaffold uses React 19.
- No final decision yet; Exp 1 and Exp 2 visual scoring still pending.

## Files touched (local + tracked docs)

- Local lab: `experiment-3-notion-react/notion-react-lab/src/App.tsx`
- Tracked notes: `experiment-3-notion-react/notes.md`
- Decision tracker: `theme-integration/DECISIONS.md`
