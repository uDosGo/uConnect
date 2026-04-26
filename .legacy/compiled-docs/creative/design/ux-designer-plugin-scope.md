# UX designer — scope (UniversalSurfaceXD v4)

“UX designer” means the **browser-mockup** app plus the **contracts and docs** it depends on—not a separate npm package. It is the **primary v4 working surface** for MDC Mac layout, uDOS samples, and Syncdown theme experiments. **Product strategy** (pricing, store trains, long-form briefs) may live in sibling app repos or wikis; this repo ships **schemas, examples, and the SvelteKit lab**. Roadmap: [docs/roadmap-v4.md](roadmap-v4.md).

## In scope

| Area | Location | Role |
|------|-----------|------|
| **Designer UI** | `browser-mockup/` | SvelteKit lab: catalog, composer, UX I/O, canvas |
| **Catalog** | `browser-mockup/src/lib/catalog/` | Stable block ids (`mdc.*`, `shell.*`) → Svelte previews |
| **Surfaces** | `interchange/examples/surface-*.json` | Canonical layout documents (`meta.profileId`) |
| **Schema** | `interchange/schemas/surface-document.schema.json` | Validate surfaces in CI |
| **Strategy (external)** | sibling `mdc-mac-app` / program wiki | App Store, pricing, release trains — not vendored in UniversalSurfaceXD |
| **Figma handoff** | `docs/figma-handoff-mdc-mac-app.md` | Frames and variables notes |

## App Store story catalog (`mdc.v26`)

- **`mdc.v26.app-store-story`** — three-step App Store narrative (input → structured markdown → route).
- **`mdc.mac.app-shell`** — Mac `NavigationSplitView` wireframe.
- **Composer sample:** [`interchange/examples/surface-mdc-v26-app-store-story.json`](../interchange/examples/surface-mdc-v26-app-store-story.json) — story block + shell (`profileId`: `mdc.v26`).

## Mac layout board (`mdc.v3.*` ids, v4 working line)

- **Category `mdc-v4-board` in gallery** — isolated previews for each mode/shell variant; **Composer** → Load MDC Mac layout board or `/lab/composer?sample=mdcV4` (alias `mdcV3`).
- **Mode panels (reuse `Panel`):** `mdc.v3.layout-board-intro`, `mdc.v3.setup-home`, `mdc.v3.workspace-shell`, `mdc.v3.workspace-chrome`, `mdc.v3.doc-reader`, `mdc.v3.apple-sync`, `mdc.v3.focus-mode`, `mdc.v3.shell-collapsed-rail`.
- **Shell variants (reuse `MdcMacAppShell`):** `mdc.v3.shell.workspace-expanded`, `mdc.v3.shell.vault-closed`, `mdc.v3.shell-collapsed-rail` (`sidebarCollapsed: true`).
- **Interchange:** [`interchange/examples/surface-mdc-mac-v3-layouts.json`](../interchange/examples/surface-mdc-mac-v3-layouts.json) (`meta.profileId`: `mdc.v3`) — same `catalogId`s as the registry; filename unchanged for history.
- **Figma / PDF exports:** keep large binaries in **`mdc-mac-app`** or your design tool export path.
- **Markdown UI reference (optional):** separate `typo/` or similar repo if you use one — unrelated to `mdc.v3` unless you document an explicit bridge.

## uDOS surfaces (`udos.thinui` / `udos.host`)

- **Vocabulary:** [docs/udos-surface-vocabulary.md](udos-surface-vocabulary.md) — `meta.profileId`, sibling paths, theme bridge.
- **Interchange:** `surface-udos-thinui-workspace.json`, `surface-udos-host-command-centre.json` — `shell.panel` only until `udos.*` catalog components are justified.
- **Composer:** `?sample=udosThinui`, `?sample=udosHost` (see [uxNav.ts](../browser-mockup/src/lib/designer/uxNav.ts)).
- **Figma:** [docs/udos-figma-handoff.md](udos-figma-handoff.md).

## Commands

From repo root:

```bash
npm run ux-designer:dev
```

Runs `npm run dev` in `browser-mockup` (see root `package.json`).

```bash
npm run ux:validate-surfaces
```

Validates every `interchange/examples/surface*.json` against `interchange/schemas/surface-document.schema.json` (same check as CI).

## Specs and templates

- **Designer-local spec/template guide:** `browser-mockup/docs/ux-designer-specs-and-templates.md`
- Keep canonical schema + examples in `interchange/schemas/` and `interchange/examples/`.

## Cursor rules

- **UniversalSurfaceXD v4 lab:** `.cursor/rules/usxd-v4-lab.mdc` — interchange, browser-mockup, Mac layout board.
- **Syncdown / MDC product v4 ops:** `.cursor/rules/syncdown-mdc-v4-ops.mdc` — sibling Syncdown developer docs (not the same as USXD repo “v4” line; see [roadmap-v4.md](roadmap-v4.md)).
- **mdc-mac-app / mdc-ios-app:** point agents at **this repo’s** `docs/` + `interchange/examples/` for surface ids; product rules live in those app repos.

## Out of scope

- Shipping **StoreKit** or **Swift** implementation (product repos).
- Replacing **Figma** or **official Figma MCP**; designer complements them.
