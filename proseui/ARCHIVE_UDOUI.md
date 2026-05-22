# UDOUI Archive Notice

**Status: ARCHIVED** — 2026-05-21

The UDOUI (Universal Document Oriented User Interface) specification and schema have been fully absorbed into **proseui**.

## What happened

- The `udoui/` directory has been removed from the workspace
- The UDOUI specification (`SPECIFICATION.md`) now lives at `proseui/SPECIFICATION.md`
- The UDOUI JSON Schema (`schema/v1.json`) now lives at `proseui/schema/v1.json`
- The UDOUI target configs (`targets/`) now live at `proseui/targets/`
- The UDOUI extension system (`extensions/`) now lives at `proseui/extensions/`
- The UDOUI examples (`examples/`) now live at `proseui/examples/`
- The UDOUI React renderer concept has been replaced by the **proseui React surface** using `@usx/styles` components

## Why

proseui is the working, production implementation of the UDOUI vision. Rather than maintaining a separate spec/schema directory, everything has been consolidated into the proseui project where it's actively used and developed.

## Key migration

| Old UDOUI concept | New proseui equivalent |
|---|---|
| `udoui/SPECIFICATION.md` | `proseui/SPECIFICATION.md` |
| `udoui/schema/v1.json` | `proseui/schema/v1.json` |
| `udoui/targets/` | `proseui/targets/` |
| `udoui/extensions/` | `proseui/extensions/` |
| `udoui/examples/` | `proseui/examples/` |
| UDOUI React Renderer | `ProseUISurface.tsx` + `@usx/styles/react` |
| UDOUI CSS (`ui/src/assets/udoui.css`) | `@usx/styles` tokens + `proseui-theme.css` |
