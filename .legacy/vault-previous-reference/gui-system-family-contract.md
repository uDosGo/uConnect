# GUI system family contract (Workspace 05 baseline)

**Updated:** 2026-04-01  
**Cursor lane:** `docs/cursor-focused-workspaces.md` § Workspace 05  
**Round:** `@dev/notes/rounds/cursor-05-gui-system-2026-04-01.md`  
**Workspace file:** `workspaces/cursor-05-gui-system.code-workspace` includes **`uDOS-host`** for command-centre and host-boundary docs alongside GUI repos.

## Purpose

One vocabulary for **who owns which GUI surface**, how **ThinUI** relates to
**browser** apps, and where **Typo** / markdown editing fits. Deeper theme and
display-mode work stays in **Workspace 06** (`cursor-06-themes-display-modes`); inventory: **`uDOS-themes/docs/display-modes.md`**.

**Wizard beyond surface-ui (family organisation):** the **Wizard** browser app is
also the intended **operator dashboard** for **family health and resources**
(disk, library bloat, compost/retention hints, delegated checks). It **does not**
own `~/.udos/` layout or Core semantics; it **routes** to **uDOS-host** scripts,
Sonic profiles, and repo checks. See `docs/udos-host-platform-posture.md` §
**System health, disk budget, and retention** and
`docs/family-first-run-operator-flow.md` principles **1** and **10**.

## ThinUI versus browser GUI

| Surface | Owner repo | Role | Tech notes |
| --- | --- | --- | --- |
| **ThinUI takeover runtime** | `uDOS-thinui` | Full-screen, low-resource operator shell between TUI and full browser; Core semantics, theme adapters | TypeScript runtime loop, view registry, `renderThinUiState`; not the primary Svelte stack |
| **Browser operator / workspace shell** | `uDOS-workspace` (`apps/web`) | Binder-facing, execution-aware web shell | **SvelteKit** (Svelte 5) |
| **Wizard browser UI** | `uDOS-wizard` (`apps/surface-ui`) | Wizard operator surface, workflows, automation lanes | **Svelte** (4.x) + Vite |
| **Command centre (HTML demo)** | `uDOS-host` | Family-visible static/demo server for spine and foundation sign-off | Static HTML + documented serve scripts |
| **Themes / tokens** | `uDOS-themes` | Cross-surface adapter and skin packs consumed by ThinUI and others | Scaffold → real adapters in Workspace 06 |

**Boundary rule:** Core owns **contracts and verbs**; ThinUI owns **takeover
frame rendering**; browser apps own **rich web UX**; Themes own **skin/token
delivery** once adapters are live.

## Shared GUI inventory (initial)

| Area | Location | Notes |
| --- | --- | --- |
| ThinUI views / boot / teletext | `uDOS-thinui/src/views/` | Named views (`boot-loader`, `teletext-display`, …) |
| ThinUI runtime / registry | `uDOS-thinui/src/runtime/` | View registry, loop, default theme resolver |
| Workspace web routes / components | `uDOS-workspace/apps/web/src/` | SvelteKit app |
| Wizard surface UI | `uDOS-wizard/apps/surface-ui/` | Primary Svelte operator UI |
| Typo editor package | `uDOS-workspace/packages/editor-typo/` | Shared markdown / binder editing direction |

New shared primitives should be **named in this file** when they become
cross-repo dependencies, and **owned** by exactly one repo.

## Component ownership and reuse

| Concern | Owner | Reuse rule |
| --- | --- | --- |
| Takeover / kiosk frame | `uDOS-thinui` | Other repos **do not** fork the runtime loop; integrate via documented bridges (`docs/thinui-boot-launch-sequence.md`, launcher contracts). |
| Workspace + binder editing | `uDOS-workspace` | Consumes Core/Wizard APIs; publishes `editor-typo` for markdown-first UX. |
| Wizard forms / OK surface | `uDOS-wizard` | Browser UI stays in `surface-ui`; Shell/TUI parallels stay in `uDOS-shell`. |
| Design tokens / skins | `uDOS-themes` | Consumers use resolver hooks; no duplicate token registries in app repos. |

## Typo integration contract

- **Package:** `uDOS-workspace/packages/editor-typo/`  
- **Responsibilities (as documented there):** binder markdown editing, frontmatter helpers, preview/render modes, future script-aware components.  
- **Family rule:** prose and quick-code editing for **binder/workspace** flows
  should go through **Typo** (or explicitly document why a surface uses a
  different editor). Expand this section when API surfaces stabilize.

## Validation (lane smoke)

From each repo root when touching that surface:

- `uDOS-dev` — `bash scripts/install-thinui-themes-lane.sh` (optional bootstrap: themes fork submodules + ThinUI `npm install` when siblings exist under the family root)
- `uDOS-themes` — `bash scripts/run-theme-checks.sh` (and `bash scripts/init-vendor-forks.sh` after clone if `vendor/forks` is empty)
- `uDOS-thinui` — `bash scripts/run-thinui-checks.sh`
- `uDOS-workspace` — `bash scripts/run-workspace-checks.sh`
- `uDOS-wizard` — `bash scripts/run-wizard-checks.sh`
- `uDOS-host` — `bash scripts/run-ubuntu-checks.sh` (when touching host vs Surface boundaries)

## Operator visual sign-off (Workspace 05 close)

With the Surface stack running (e.g. `udos-surface-demo` or `uvicorn wizard.main:app` on **127.0.0.1:8787**):

1. **ThinUI terminal proof:** `cd uDOS-thinui && node scripts/demo-thinui.js --theme thinui-c64` (and other themes) — ASCII frames on stdout.
2. **ThinUI Vite demo (fonts):** `cd uDOS-thinui && npm run dev` — confirm C64 / NES / teletext selector shows **C64 User Mono**, **Press Start 2P**, and **Teletext50** when network font sources load (`demo/theme-fonts.css` + Google Fonts).
3. **Browser Thin GUI + shell themes:** open **`/demo`** on the Wizard base URL — use the **Browser Thin GUI** links for **thinui-c64**, **thinui-nes-sonic**, **thinui-teletext** (Core `shell-theme-map.json`), or **`/app/thin-gui`** in the built Surface app and use the **ThinUI C64 / NES/Sonic / Teletext** preset buttons.

Wizard **delegation broker** role and Core field semantics: `uDOS-core/docs/wizard-surface-delegation-boundary.md`, `uDOS-wizard/docs/wizard-broker.md`.

## Related

- `docs/family-operator-organisation-map.md`  
- `docs/family-first-run-operator-flow.md`  
- `docs/udos-host-platform-posture.md`  
- `docs/cursor-execution.md`  
- `docs/cursor-focused-workspaces.md` § Workspace 05–06  
- `uDOS-themes/@dev/next-round.md`
