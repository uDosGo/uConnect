# Roadmap: uDOS surfaces in the UX designer (UniversalSurfaceXD)

Plan for bringing **uDOS** layout and theme semantics (ThinUI, themes, host contracts) into the same lab and interchange discipline as MDC, without forking truth into `browser-mockup`.

**Scope:** This file is **not** the MDC v3 product spine. Mac v3 **layout wireframes** live in [`interchange/examples/surface-mdc-mac-v3-layouts.json`](../interchange/examples/surface-mdc-mac-v3-layouts.json); product briefs stay in sibling **`mdc-mac-app`** (or your program wiki), not in this repo.

**Status:** Phases 0–5 below are **implemented or documented** in UniversalSurfaceXD (2026-04-07). Optional automation (host contract manifest script) remains future work.

## Authority and naming

| Layer | Owner | UX designer hook |
|--------|--------|-------------------|
| ThinUI runtime / binder spine | `uDOS-thinui` | Reference demos and `surface-profile` types; do not reimplement runtime here |
| Theme registry / retro forks | `uDOS-themes` | `theme_id` → CSS stacks; document mapping to `meta.profileId` in interchange |
| Classic Modern tokens (`--cm-*`) | `uDOS-docs` → `docs/classic-modern-mvp-0.1/` | Optional import into `spine/tokens` or browser-mockup CSS variables |
| Host HTTP surfaces | `uDOS-host` | Contract JSON under `contracts/`; wireframes as optional `shell.panel` scenarios |
| Portable layout trees | **UniversalSurfaceXD** `interchange/examples/` | New `surface-udos-*.json` only when stable |

Use **`meta.profileId`** values such as `udos.thinui`, `udos.host`, `udos.themes` on surface documents so composer and gallery stay filterable.

## Phase 0 — Workspace and discovery (done)

- Multi-root workspace: [UniversalSurfaceXD-v4.siblings.code-workspace](../UniversalSurfaceXD-v4.siblings.code-workspace) includes `uDOS-v3`, `uDOS-themes`, `uDOS-thinui`, `uDOS-docs`, `uDOS-host`, `sonic-screwdriver`.
- Docs index: [docs/README.md](README.md) (uDOS theme paths).

## Phase 1 — Vocabulary and registry alignment

**Goal:** One table of ids that matches ThinUI + themes docs.

- [x] Add [docs/udos-surface-vocabulary.md](udos-surface-vocabulary.md) mapping: ThinUI `SurfaceProfileThinUiV01` / theme ids ↔ proposed `catalogId` prefixes (`udos.thinui.*`, `udos.host.*`).
- [x] Cross-link `uDOS-thinui/docs/themes-sibling-bridge.md` (stub), `uDOS-themes/docs/theme-upstream-index.md`, and `uDOS-themes/docs/integration-thinui-workflow-prose-gtx.md` from vocabulary (sibling paths).
- [x] Confirm no duplicate JSON under `browser-mockup/src/lib/surface/samples/` for uDOS; uDOS surfaces live in `interchange/examples/surface-udos-*.json` only.

**Exit:** A contributor can name a surface without guessing ids.

## Phase 2 — Interchange examples (thin slices)

**Goal:** Diff-friendly surface documents for canonical uDOS scenarios.

- [x] Add [interchange/examples/surface-udos-thinui-workspace.json](../interchange/examples/surface-udos-thinui-workspace.json) — demo binder + mode rail labels (`shell.panel` only).
- [x] Add [interchange/examples/surface-udos-host-command-centre.json](../interchange/examples/surface-udos-host-command-centre.json) — static command-centre contract as panels.
- [x] `npm run ux:validate-surfaces` includes both files; schema unchanged.

**Exit:** CI validates uDOS-tagged surfaces; composer loads them via `?sample=udosThinui` / `?sample=udosHost` and toolbar buttons.

## Phase 3 — Catalog components (only where needed)

**Goal:** Dedicated Svelte blocks only when `shell.panel` is not enough.

- [x] Audit documented in [udos-surface-vocabulary.md](udos-surface-vocabulary.md) (ThinUI chrome vs MDC shell). New `registry.json` rows wait until a region repeats in multiple surfaces.
- [x] Retro themes stay **CSS layers** in `uDOS-themes` (no lab fork); vocabulary states scope.

**Exit:** Gallery unchanged until new `udos.*` catalog ids are justified; wireframes use existing `shell.panel`.

## Phase 4 — Theme bridge in the lab

**Goal:** Optional visual parity with Classic Modern inside `/lab`.

- [x] Document import path + token source in [udos-surface-vocabulary.md](udos-surface-vocabulary.md); mirror key colors in `browser-mockup/src/app.css` for `?theme=udos-cm`.
- [x] Lab toggle: **`?theme=udos-cm`** on any route (see root `+layout.svelte` + `app.css`).

**Exit:** Designer can switch light Classic Modern page chrome without leaving the lab.

## Phase 5 — Automation and handoff

**Goal:** Repeatable updates when ThinUI or host contracts change.

- [x] [docs/udos-figma-handoff.md](udos-figma-handoff.md) + pointer from [figma-handoff-mdc-mac-app.md](figma-handoff-mdc-mac-app.md).
- [x] Script `npm run ux:validate-udos-host-contracts` + [interchange/manifests/udos-host-contracts.manifest.json](../interchange/manifests/udos-host-contracts.manifest.json); CI workflow clones `fredporter/uDOS-host` when manifest or script changes.

**Exit:** Release notes can cite interchange + lab without manual grep.

## Non-goals (near term)

- Running ThinUI or host services inside SvelteKit (keep separate `npm` dev processes).
- Replacing `uDOS-themes` registries with copies inside this repo.

## Success criteria (program-level)

- [x] At least one `surface-udos-*.json` in CI with `meta.profileId` set (`udos.thinui`, `udos.host`).
- [x] Composer + expanded nav document uDOS sample surfaces ([browser-mockup README](../browser-mockup/README.md), [uxNav.ts](../browser-mockup/src/lib/designer/uxNav.ts)).
- [x] Workspace file remains the single recommended multi-repo entry for MDC + uDOS + themes.
