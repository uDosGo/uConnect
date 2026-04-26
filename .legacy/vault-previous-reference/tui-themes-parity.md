# TUI and uDOS-themes parity (Workspace 06)

Shell TUI flows should stay aligned with the **shared display-mode vocabulary** and **step-form** model documented in **`uDOS-themes/docs/display-modes.md`**.

## Surfaces

| Shell role | Themes lane | Notes |
| --- | --- | --- |
| Full-viewport guided text | `tui-default` (`uDOS-themes/src/adapters/tui/index.mjs`) | `renderTuiScreen` — title, steps, actions, progress bar |
| Step-by-step forms (parity with GTX) | `forms-gtx-step` + `renderTuiFormStep` | Same step ids as `examples/gtx-form-flow.json` when mirroring a wizard |

## Thin GUI handoff

Shell already routes theme preview toward Wizard / themes (`src/ucode/preview.ts`, `src/thingui/index.ts`). Keep **theme adapter** strings consistent with family registries (`uDOS-themes/registry/adapter-registry.json`).

## Related

- `uDOS-themes/examples/cross-surface-rendering-matrix.json`
- `uDOS-thinui/docs/themes-sibling-bridge.md`
- `uDOS-dev/docs/gui-system-family-contract.md`
