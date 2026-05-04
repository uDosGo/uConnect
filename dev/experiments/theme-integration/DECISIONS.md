# Theme integration — decisions

**Status:** In progress (partial evidence captured).

After Experiments 1–3, record here:

- Chosen direction (none / CSS-only / React / hybrid).
- Rationale tied to USXD shell constraints and bundle cost.
- Follow-up tasks (TASKS IDs, docs updates).

## Interim snapshot (2026-04-16)

- **Experiment 1 (retro):** harness + vendor clones ready; NES local build blocked by legacy `node-sass`, mitigated with CDN fallback in harness. Visual scoring pending.
- **Experiment 2 (notion.css):** harness + vendor clone ready. Visual scoring pending.
- **Experiment 3 (notion-react):** local Vite lab wired with notion-design-system primitives; build passes. Peer warning on `lucide-react` vs React 19 remains a compatibility risk to validate.

## Pending before final decision

1. Run visual pass for Exp 1 and Exp 2 and fill scores.
2. For Exp 3, validate table-heavy workflow and dark mode behavior.
3. Decide final path: CSS-only, React, hybrid, or no integration.
