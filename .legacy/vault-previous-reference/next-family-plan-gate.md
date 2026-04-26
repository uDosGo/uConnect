# When to open the next numbered family plan after `v2.6`

**Gap matrix row 2 (Workspace 08).** `v2.5` and **`v2.6`** are **complete**; repo semver and engineering work continue without an automatic `v2.7` (or other `v2.x`) label until this **gate** trips.

## Default mode (no new `v2.x` required)

Until the gate below trips, treat work as:

- **Repo-local semver** from baseline **`2.3.0`**: default **patch** bumps; **minor
  or major** only with explicit family approval (`docs/pr-checklist.md`, roadmap
  notes in `@dev/notes/roadmap/archive/v2/v2-family-roadmap.md` for v2 history).
- **Forward backlog:** `@dev/notes/roadmap/v3-feed.md`. **Historical engineering backlog:** `@dev/notes/roadmap/archive/v2/v2-family-roadmap.md` § Engineering backlog (continuous).
- **Cursor post-08** execution: Workspaces **01–09** are **closed** (09 Classic Modern MVP **2026-04-02**); further work uses [`docs/archive/cursor-handover-plan.md`](archive/cursor-handover-plan.md) (archived),
  `@dev/notes/reports/family-readiness-audit-*.md`, and the engineering backlog — not an additional numbered workspace in the 01–09 list.

Individual features (themes adapter follow-up, `udos-commandd` CLI, pathways,
wiki units, GitHub contract roll-forward, Groovebox Docker depth, **v2.5 /
v2.6 deferred** items such as remote Deer Flow clusters) **do not** by themselves
require a new family plan if they can ship as backlog + PRs.

## Open a new `v2.x` family plan when

Open a **named** plan (e.g. `v2.7`, or a themed codename later captured in
`v2.*-rounds.md`) when **both** are true:

1. **Coordinated scope** — the same sequencing, ownership, or contract change
   must land across **multiple** tier-1 repos with an agreed **round order**
   (similar to historical `v2.4` / `v2.5` / `v2.6` binders), **and**
2. **Backlog overflow** — that scope is too large or cross-cutting to track
   honestly in the engineering backlog table alone without a version-round
   **ledger row** and promotion narrative.

**Examples that typically qualify:** a new **platform-wide** contract revision
(Core + Shell + Wizard + Ubuntu must move together); a **release train** that
requires tagged alignment across many public repos; a deliberate **breaking**
semver wave approved at family level.

**Examples that typically do not qualify alone:** a single-repo feature;
documentation-only convergence; optional plugin lanes; items already listed as
**Deferred** until product need appears.

## What “opening” a plan means

1. Add **`v2.X-rounds.md`** (or equivalent) under `@dev/notes/roadmap/` with
   rounds, owners, and binders.
2. Extend **`v2-roadmap-status.md`** version table and **Current Focus** to
   **`active family plan: v2.X`**.
3. Update **`v2-family-roadmap.md`** § Current Family Baseline and version index.
4. Record handoff in **`@dev/notes/rounds/`** or devlog as appropriate.

Workspace 08 **does not** open a new `v2.x` by default; it only documents this gate.

## Preparing a future plan (without opening it yet)

Use **`@dev/notes/roadmap/next-plan-readiness.md`** when you are **gathering** evidence and a round sketch but have **not** decided the gate has tripped. Opening the plan still requires **both** triggers above.

**Below-gate automation:** `scripts/verify-engineering-backlog-below-gate.sh` (gate-doc checks + `automation/check-github-contract-rollforward.sh` strict pass for repos present under `ROOT_DIR` / `UDOS_GITHUB_CONTRACT_REPO_ROOTS`).

## Related

- **`docs/archive/v2/preparing-for-v2-6.md`** — historical runbook for **`v2.6`** (open through close); **§ After `v2.6`** points here for **`v2.7+`**
- **`@dev/notes/roadmap/archive/v2/v2.6-rounds.md`** — **completed** `v2.6` rounds **A–E**; evidence **`scripts/run-v2-6-release-pass.sh`**
- **`@dev/notes/roadmap/v2-family-roadmap.md`** — stub index; baseline vs repo semver (full narrative in **`archive/v2/`**)
- **`@dev/notes/roadmap/v2-roadmap-status.md`** — stub feed (full ledger in **`archive/v2/`**)
- `@dev/notes/rounds/cursor-08-family-convergence-2026-04-01.md` — gap matrix
- `docs/pr-checklist.md` — branch and semver discipline
- **`@dev/notes/reports/optional-backlog-round-5-2026-04-03.md`** — OB-R5 gate packet (**2026-04-03**): **defer** opening a new `v2.x` until both criteria in this doc are met
- **`docs/deferred-product-rfc-stubs.md`** — OB-R6 scope-only stubs for Workspace 08 deferred themes (no implementation commitment)
- **`@dev/notes/roadmap/next-plan-readiness.md`** — prep checklist before opening a future `v2.x`
- `@dev/notes/rounds/v2-6-family-plan-closed-2026-04-05.md` — **`v2.6`** closure handoff (below gate)
