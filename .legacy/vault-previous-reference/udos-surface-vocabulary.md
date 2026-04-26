# uDOS — surface vocabulary (UniversalSurfaceXD ↔ ThinUI / themes / host)

Single place to name **`meta.profileId`**, proposed **`catalogId`** prefixes, and upstream-repo sources. Pair with [ux-designer-udos-surfaces-roadmap.md](ux-designer-udos-surfaces-roadmap.md).

## Upstream repos (public)

| Repo | GitHub |
|------|--------|
| ThinUI | [fredporter/uDOS-thinui](https://github.com/fredporter/uDOS-thinui) |
| Themes | [fredporter/uDOS-themes](https://github.com/fredporter/uDOS-themes) |
| Docs (Classic Modern, etc.) | [fredporter/uDOS-docs](https://github.com/fredporter/uDOS-docs) |
| Host | [fredporter/uDOS-host](https://github.com/fredporter/uDOS-host) |

## Optional sibling clone paths

Committed **v4** workspaces (e.g. [`UniversalSurfaceXD-v4.siblings.code-workspace`](../UniversalSurfaceXD-v4.siblings.code-workspace)) group uDOS repos under **`../uDOS-family/`**. If you use a **flat** layout instead (each repo next to UniversalSurfaceXD), shift the prefix accordingly or set per-repo env vars (see Host contracts below).

| Repo | Example path (family layout) |
|------|----------------|
| ThinUI | `../uDOS-family/uDOS-thinui/` |
| Themes | `../uDOS-family/uDOS-themes/` |
| Classic Modern / product docs | `../uDOS-family/uDOS-docs/docs/` (exact subpath varies by branch; see [uDOS-docs](https://github.com/fredporter/uDOS-docs)) |
| Host | `../uDOS-family/uDOS-host/` |

## ThinUI `SurfaceProfileThinUiV01` → interchange

Authoritative TypeScript: `uDOS-thinui/src/surface/surface-profile.ts`.

| Surface profile `id` | Typical `thinui.theme` | Suggested `meta.profileId` (interchange) | Notes |
|----------------------|-------------------------|------------------------------------------|--------|
| `ubuntu-gnome` | `udos-default` | `udos.thinui` | Builtin mirror of uDOS-surface profile JSON |
| *(custom file)* | `thinui-c64`, etc. | `udos.thinui` | Pass `surfaceProfileData` / file path per ThinUI README |

**`theme` string** maps through `surfaceThemeToThinUiThemeId` → ThinUI `themeId` (e.g. `udos-default`).

## Proposed `catalogId` prefixes (interchange / gallery)

Until dedicated Svelte blocks exist, reuse **`shell.panel`** and **`shell.device-card`**.

| Prefix | Use |
|--------|-----|
| `udos.thinui.*` | Workspace chrome, binder rail, mode labels (future components) |
| `udos.host.*` | HTTP / command-centre contract summaries as panels |
| `udos.themes.*` | Theme-token or fork previews (future) |

## Theme registry

| Doc / entry | Link |
|-------------|------|
| Theme upstream index | [uDOS-themes/docs/theme-upstream-index.md](https://github.com/fredporter/uDOS-themes/blob/main/docs/theme-upstream-index.md) |
| ThinUI ↔ themes workflow | [uDOS-themes/docs/integration-thinui-workflow-prose-gtx.md](https://github.com/fredporter/uDOS-themes/blob/main/docs/integration-thinui-workflow-prose-gtx.md) |
| ThinUI README (surface profiles) | [uDOS-thinui/README.md](https://github.com/fredporter/uDOS-thinui/blob/main/README.md) |
| ThinUI → themes bridge (stub) | [uDOS-thinui/docs/themes-sibling-bridge.md](https://github.com/fredporter/uDOS-thinui/blob/main/docs/themes-sibling-bridge.md) |

## Demo binder (layout labels)

ThinUI demo binder JSON: `uDOS-thinui/src/workspace/demo-binder.json` (`id`: `binder-demo-unified`). Interchange wireframe: [`surface-udos-thinui-workspace.json`](../interchange/examples/surface-udos-thinui-workspace.json).

## Host contracts

Example static command-centre contract: `uDOS-host/contracts/udos-web/command-centre-static-demo.v1.json`. Panel wireframe: [`surface-udos-host-command-centre.json`](../interchange/examples/surface-udos-host-command-centre.json).

**Manifest:** [interchange/manifests/udos-host-contracts.manifest.json](../interchange/manifests/udos-host-contracts.manifest.json) lists every `contracts/**/*.json` file; run `npm run ux:validate-udos-host-contracts` from **this repo root**. Default host root is **`../uDOS-family/uDOS-host`** (same as the siblings workspace); override with **`UDOS_HOST_ROOT`** if your clone lives elsewhere (for example a flat `../uDOS-host`). Prints a skip message and exits **0** if that directory is missing.

## browser-mockup samples

- **No uDOS JSON** under `browser-mockup/src/lib/surface/samples/` except generic `device-modes-row.json` (product-neutral). uDOS surfaces live under **`interchange/examples/surface-udos-*.json`** only.

## ThinUI chrome vs MDC Mac shell (audit)

| Region | MDC (`MdcMacAppShell`) | ThinUI (conceptual) |
|--------|-------------------------|---------------------|
| Window chrome | Title bar + traffic lights | Boot / windowed mode from surface profile |
| Primary nav | Sidebar sections (Workspace / Content / …) | Mode rail (Board, Docs, Calendar, Social, Ops) |
| Detail | Single `detailContent` | Binder-selected view |

Do **not** reuse `mdc.mac.app-shell` for ThinUI wireframes; keep **`meta.profileId: udos.thinui`** and panel labels until stable `udos.thinui.*` components exist.

## Classic Modern in the lab (theme bridge)

Source CSS: `uDOS-docs/docs/classic-modern-mvp-0.1/themes/classic-modern.css` (`--cm-*` variables).

**browser-mockup:** add query **`?theme=udos-cm`** on any lab URL to apply a light Classic Modern–tinted shell (see `browser-mockup/src/app.css`). This is a **preview aid**, not a fork of uDOS-docs; bump a comment in `app.css` if upstream tokens change.

## Retro themes (C64 / NES / Teletext)

Keep as **CSS stacks** in `uDOS-themes` / demos; do not duplicate registries in UniversalSurfaceXD. Lab does not load them automatically (run ThinUI or theme demos separately).
