# DEV.md — Quick Operating Manual

Fast day-to-day operating guide for work in `dev/`.

## 1) Start Here

1. Read `dev/README.md` for scaffold orientation.
2. Open `dev/TASKS.md` and confirm active priorities.
3. Pick one task and set scope before editing.

## 2) Execution Default

- **Mode:** continuous rounds by default.
- Move round `N` -> `N+1` immediately when deliverables are complete.
- Pause only if:
  - task explicitly says `checkpointed`, or
  - high-risk / data-loss blocker appears.

## 3) Working Surfaces

- `dev/TASKS.md` -> active tracked work
- `dev/experiments/` -> forwarded upstream integration briefs (Mono image, etc.); see `experiments/README.md`
- `dev/summary/` + `dev/devlog/` -> period handover (process: [`workflow/dev-summary-and-devlog.md`](workflow/dev-summary-and-devlog.md)); new summary **assesses previous** and rolls watches forward
- `dev/DOC-TODO.md` -> **later** public-doc round only (not parallel to implementation)
- `dev/decisions/` -> locked decisions and audits
- `dev/roadmaps/` -> round/milestone plans (keep thin; link TASKS + summary)
- `dev/workflow/` -> proposal/decision/review/promotion templates
- `dev/workflow/2026-04-15-docs-migration-restart.md` -> **uDosDocs → docs** / **uDosDev → dev** migration re-entry (delta snapshot + next batch)
- `dev/local/` -> scratch (ignored)

## 4) Template Flow

Use these in order:

1. `TEMPLATE_TASKS.md` -> `TASKS.md` or dated milestone task file
2. `workflow/TEMPLATE_proposal.md` (when choices/tradeoffs exist)
3. `workflow/TEMPLATE_decision.md` (lock direction)
4. `workflow/TEMPLATE_review.md` (capture review findings)
5. `workflow/TEMPLATE_promotion.md` (promotion/release move)
6. `TEMPLATE_CHECKLIST.md` (pre/post pass hygiene)

## 5) Daily Loop

1. Define task in `TASKS.md`
2. Implement in scoped files
3. Validate (tests/lints/smoke)
4. Update docs/decision notes
5. Update task status
6. Continue next round

## 6) Safety Rules

- No destructive deletes/resets without explicit approval.
- Keep changes in declared scope.
- Archive-first for uncertain removals.
- If migration/deletion is planned, require a documented delete-safe checklist.

## 7) Done Criteria

A unit of work is done when:

- acceptance criteria are checked,
- validation is run,
- task state is updated,
- and the next round/task can begin without ambiguity.
