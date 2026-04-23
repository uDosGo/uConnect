# Widgets (Experiment)

TypeScript/JavaScript widget experiment for uDos.

Status:

- A1: docs and contract lock only
- A2: runtime/CLI scaffolds (with explicit operator permission)
- A3: curated registry and promotion paths

## Scope (locked)

- Widgets are TS/JS only.
- Widgets return USXD (no new renderer layer).
- Widgets use direct uDos APIs for baseline.
- Widgets are file-based (`@toybox/widgets/*.ts|*.js`).
- Heavy isolated integrations belong in CHASIS, not widgets.

## Planned folder shape (A2 work, not started here)

```text
dev/experiments/widgets/
  bin/widget
  src/widget-runtime.ts
  src/widget-api.ts
  src/widget-manager.ts
  src/usxd-renderer.ts
  examples/
  tests/
```

## Curated vs user widgets

- Curated: `@modules/udos/plugins/widgets/`
- User-local: `@toybox/widgets/`

## Guardrail

Do not start A2 implementation from this folder until operator explicitly authorizes A2 start.
