# uDos A1 — cleanup & status checklist

**Last verified:** 2026-04-15 (automated `npm run verify:a1` green; Part 4 operator sign-off pending)

## Part 1 — Cleanup (complete)

- [x] `~/Code/uDos/` is the only active uDos repo at `~/Code/` root
- [x] `~/Code/archive/` holds backups: `uDosGo-v4-backup`, `uHomeNest-backup`, `uDosFamily-backup`, `uDOS-family-backup`, `udos-a1-backup`, `udos-a2-backup`, `udos-pre-alpha/`
- [x] `~/Code/udos-a1/`, `~/Code/udos-a2/`, `~/Code/uDosFamily/`, `~/Code/uDosGo/`, etc. **removed** from `~/Code/` (moved to archive, not shredded)
- [x] `uDos.code-workspace` lists `core`, `ui`, `tools`, `modules`, `dev`, `templates`, `seed`, `docs`, `courses`, `scripts`, … (no stale `../apps/uDosGo`)
- [x] `README.md`, `CONTRIBUTING.md`, `AGENTS.md` updated
- [x] `docs/family-workspace-layout.md` updated
- [x] `docs/shared-resources-architecture.md` updated
- [x] `docs/A1-structure-locked.md` updated
- [x] `dev/vibe/QUICKSTART.md` updated
- [x] `dev/vibe/config/vibe.yaml.example` exists
- [x] `~/Code/archive/README.md` indexes backups (canonical name: **`README.md`**, not `README-archive.md`)

## Part 2 — Monorepo docs + path alignment (rolling)

- [x] Root `README.md`, `CONTRIBUTING.md`, `AGENTS.md` point at **`dev/`** and **`docs/`** (no root **`uDosDev/`** / **`uDosDocs/`** submodule folders)
- [x] **`docs/specs/audience-tags.md`** — governance canonical under **`dev/`**
- [x] **`docs/A1-structure-locked.md`** — matches npm workspaces (**`core`**, **`ui`**, **`tools/*`**, **`modules/*`**) and top-level folders
- [x] **`dev/workflow/migrated-round1/process/dev-beta-flow-and-resume.md`** — checklist links prefer **`dev/workflow/imported/2026-04-15-uDosDev-snapshot/`** where files exist *(beta-era imported snapshot tree).*

## Part 3 — VA1 development priorities

- [x] Unit tests — `core/npm test` (`core/test/*.test.mjs`)
- [x] CI — `.github/workflows/core-ci.yml`
- [x] `udo publish build` — `core/src/lib/publish-build.ts` → `~/vault/.site/`
- [x] `udo usxd apply` — `core/src/lib/usxd-theme.ts`, `templates/usxd/default/`
- [x] `npm link` — `core/package.json` script `link:global` + `core/README.md`
- [ ] **VA2 Go tools** (`tools/ucode-cli/`, …) — deferred phase (next milestone, not A1)

## Part 4 — A1 operator acceptance (next gate)

- [ ] Run **`npm run verify:a1`** at repo root (build + `@udos/core` tests + `./scripts/shakedown.sh` + `core-rs` `cargo test`)
- [ ] Walk **[`dev/OPERATOR-LIVE-TEST-A1.md`](../dev/OPERATOR-LIVE-TEST-A1.md)** manual smoke (`udo help`, optional `cargo run` in `core-rs`)
- [ ] Record pass + git SHA in PR or dev notes when promoting the milestone
