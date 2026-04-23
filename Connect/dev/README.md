# uDos `dev/` — contributor scaffold (`--devonly` templates)

**Principle:** This tree holds **templates and policy text**, not personal project state. Scratch work stays under **`local/`** (ignored). **VibeCLI** lives in **`vibe/`**; CDN deploy notes: [`cdn-cloud-setup.md`](cdn-cloud-setup.md).

## Start dev flow (daily)

1. **One repo:** work only in **uDos** — planning spine: [`docs/family-workspace-layout.md`](../docs/family-workspace-layout.md).
2. **Live queue:** open **[`TASKS.md`](TASKS.md)** — section **Dev flow** + table **Alpha roadmap tracked** (semver lanes, Story, `usxd-go`, `uos`, image experiments, Ventoy, GUI service).
3. **Experimental integration briefs:** [`experiments/README.md`](experiments/README.md) (module briefs + [`experiments/theme-integration/`](experiments/theme-integration/) harness plan) — linked from the Alpha table when a task ID exists.
4. **Beta-era backlog (reference):** [`BACKLOG-A1-branch.md`](BACKLOG-A1-branch.md) — reconciled; not the primary execution list.
5. **Verify:** `npm run verify:a1` (repo root) and [`OPERATOR-LIVE-TEST-A1.md`](OPERATOR-LIVE-TEST-A1.md) when touching CLI surfaces.

## Contributor tiers (tags)

| Tier | Role | Tag | Notes |
| --- | --- | --- | --- |
| Wizard | Architect, super admin | `--wizard` | [`tiers/wizard.md`](tiers/wizard.md) |
| Sorcerer | Trusted contributor, approvals | `--sorcerer` | [`tiers/sorcerer.md`](tiers/sorcerer.md) |
| Elf | Submitter (issue/PR) | `--elf` | [`tiers/elf.md`](tiers/elf.md) |
| Ghost | No unique username | `--ghost` | [`tiers/ghost.md`](tiers/ghost.md) |
| Spy | Anonymous / not logged in | `--spy` | [`tiers/spy.md`](tiers/spy.md) |

## Folder structure

| Path | Purpose |
| --- | --- |
| [`DEV.md`](DEV.md) | Quick operating manual (daily execution flow) |
| [`AGENTS.md`](AGENTS.md) | Pointer; copy from [`TEMPLATE_AGENTS.md`](TEMPLATE_AGENTS.md) |
| [`TASKS.md`](TASKS.md) | Family **Task** surface (Backlog / In Progress / Done); template: [`TEMPLATE_TASKS.md`](TEMPLATE_TASKS.md) |
| [`summary/README.md`](summary/README.md) | **Period dev summaries** (template [`TEMPLATE_DEV_SUMMARY.md`](TEMPLATE_DEV_SUMMARY.md)); new file **assesses previous**, rolls incomplete/watch forward |
| [`devlog/README.md`](devlog/README.md) | **DEVLOG** — short dated notes; summaries **link here** |
| [`workflow/dev-summary-and-devlog.md`](workflow/dev-summary-and-devlog.md) | Process: summary + DEVLOG + `DOC-TODO` (no verbose parallel writeups) |
| [`DOC-TODO.md`](DOC-TODO.md) | Public / user doc backlog for a **later** round (not parallel to coding) |
| [`OPERATOR-LIVE-TEST-A1.md`](OPERATOR-LIVE-TEST-A1.md) | **A1 milestone** — automated `npm run verify:a1` + manual smoke checklist |
| [`TEMPLATE_DEV_SUMMARY.md`](TEMPLATE_DEV_SUMMARY.md) | Copy to `summary/` for each period roll-up |
| [`TEMPLATE_AGENTS.md`](TEMPLATE_AGENTS.md) | Agent contract template |
| [`TEMPLATE_TASKS.md`](TEMPLATE_TASKS.md) | Task table template |
| [`TEMPLATE_CHECKLIST.md`](TEMPLATE_CHECKLIST.md) | Fast pre/post dev pass checklist template |
| [`TEMPLATE_DECISION_RECORD.md`](TEMPLATE_DECISION_RECORD.md) | Canonical decision record template + naming standard |
| [`tiers/`](tiers/) | Tier reference docs |
| [`workflow/`](workflow/) | Workflow templates, migration maps, [`workflow/imported/`](workflow/imported/2026-04-15-uDosDev-snapshot/README.md) governance snapshots |
| [`local/`](local/) | **Ignored** — create `mkdir -p dev/local/{notes,drafts,scratch}` |
| [`roadmaps/`](roadmaps/) | Template only (see [`roadmaps/README.md`](roadmaps/README.md)) |
| [`features/`](features/) | Template only (see [`features/README.md`](features/README.md)) |
| [`experiments/`](experiments/) | Module briefs + [`experiments/theme-integration/`](experiments/theme-integration/) theme experiment suite (see [`experiments/README.md`](experiments/README.md)) |
| [`vibe/`](vibe/) | VibeCLI rules + config |
| [`.gitignore`](.gitignore) | Ignores `local/`, non-template `roadmaps/*.md`, `features/*.md`, `*.notes.md` |

## Workflow (summary)

1. **Elf** opens issue/PR (tag `--elf` where applicable).
2. **Sorcerer** reviews (`--sorcerer`).
3. **Wizard** approves major or risky changes (`--wizard`).
4. Merge and release per **monorepo** process (`dev/TASKS.md`, family workflow docs).

**Ghost / spy:** read-only or public per platform; no direct write to protected branches without account tier.

## Continuous Round Mode (default)

- **Default execution mode:** continuous rounds.
- **Rule:** once a round's deliverables are complete, proceed immediately to the next round.
- **No approval pause by default:** round gates are completion checks, not stop points.
- **Exception:** pause only when a task explicitly requests a stop/approval checkpoint, or when a data-loss/high-risk blocker appears.

## VibeCLI ↔ Cursor handover

| Tool | Role |
| --- | --- |
| **VibeCLI** | `vibe task …`, agent runs (when configured) — can write into a local **`TASKS.md`** |
| **Cursor / IDE** | Implementation, tests, PRs, doc updates |

Copy **`TEMPLATE_TASKS.md`** → **`TASKS.md`** (or a dated file) for a milestone; keep backlog canonical in the active repo `dev/TASKS.md` unless a task explicitly defines another owner surface.

## Local work

```bash
mkdir -p dev/local/{notes,drafts,scratch}
```

Nothing under **`local/`** is committed (see [`.gitignore`](.gitignore)).

## VibeCLI

Rules: **`vibe/rules/*.toml`** · Config: **`vibe/config/vibe.yaml.example`** → `~/.config/vibe.yaml` · Onboarding: **`vibe/QUICKSTART.md`**.
