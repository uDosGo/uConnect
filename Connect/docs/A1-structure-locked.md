---
title: "uDos A1 — simplified repo structure (locked)"
tags: [--public]
audience: public
slot: 5
---

# uDos A1 — Simplified repo structure (locked)

**Principle:** **`uDos` is the one home** for runtime, tools, modules, UI views, dev scaffold, docs, templates, seed content, courses, and shared scripts.

**Documentation policy (tags, OBF, grid):** [`documentation-policy.md`](documentation-policy.md). **VA1 style + commands:** [`docs/specs/va1-style-guide.md`](specs/va1-style-guide.md), [`docs/public/ucode-commands.md`](public/ucode-commands.md).

| Area | Path | Role |
| --- | --- | --- |
| VA1 CLI | `core/` | **`udo`** — TypeScript vault / md / feeds / publish (static `.site/`), sync stubs |
| UI views | `ui/` | Vue peer package **`@udos/views`** (vault shell views; consumed by host apps) |
| External tools | `tools/` | Go/Python/Node processes spawned by core (`ucode-cli`, `sonic-express`, `usxd-express`, …) |
| Libraries | `modules/` | TS/Node packages consumed by `core/` (incl. **`@udos/obf-grid`** for OBF Grid / `udo grid`) |
| Contributors | `dev/` | Governance and workflow: **`TASKS.md`**, **`vibe/`** (VibeCLI), **`workflow/`** (imports, **beta**-era process snapshots), **`local/`** (gitignored scratch); CDN deploy notes **`cdn-cloud-setup.md`** |
| Student entry | `launcher/` | One-click **`udos.command`** (macOS), **`install.sh`** / **`install.ps1`** — delegate to **`tools/sonic-express/`** (no manual `npm install` in `core/` alone) |
| Docs | `docs/public/`, `docs/student/`, `docs/contributor/`, `docs/specs/` | Tagged audiences; technical specs and OBF in **`docs/specs/`**; policy in **`documentation-policy.md`** |
| Templates | `templates/` | Open-box markdown copied on init |
| Seed | `seed/` | Default vault for first run |
| Courses | `courses/` | Course-adjacent stubs and curriculum wiring (see repo `courses/README.md` when present) |
| Scripts | `scripts/` | Shared family helper scripts (maintenance, validation) |
| CDN wireframe | `cdn/` | **`fonts/manifest.json`** mirrors **`cdn.udo.space`**; **`fonts/seed/`** for offline bytes. Cloud: [`dev/cdn-cloud-setup.md`](../dev/cdn-cloud-setup.md) (`--devonly`) |

**No Git submodules** in this layout — product code is plain folders. **Governance** and **dev-standard (beta-era filenames in `dev/workflow/`)** live under **`dev/`**; the **A1 documentation grid** lives under **`docs/`** per [`documentation-policy.md`](documentation-policy.md).

**Versioning:** one repo version for `uDos`; each tool under `tools/` may keep its own `go.mod` / `package.json`.

**Node:** **npm workspaces** at the repo root — one hoisted **`node_modules/`**; workspaces include **`core/`**, **`ui/`**, **`tools/sonic-express/`**, **`tools/usxd-express/`**, and **`modules/*`**; shared **`@udos/shared-types`** / **`@udos/shared-utils`**. Sonic-express runs **`npm ci`** at the root (students do not need to run npm by hand for the default path). **Future:** optional single binary distribution so Node is not required for end users.

**Planned (uCode):** a **`USE "pkg"`**-style statement to declare npm dependencies with a **prompt before install** (security / transparency) — not implemented in VA1.
