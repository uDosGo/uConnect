# Workflow-Backed Schedule And Binder Operations

## Purpose

This document defines the active `v2.3` operating model for scheduled work,
manual work, binders, and submissions across the public family.

The goal is to make scheduler-backed work legible without collapsing human
review boundaries or turning `@dev` into a hidden background runtime.

## Canonical Surfaces

- `@dev/notes/roadmap/v2-roadmap-status.md`
- `@dev/requests/`
- `@dev/submissions/`
- `docs/family-workflow.md`
- `docs/roadmap-workflow.md`
- `scripts/run-v2-3-workflow-schedule-demo.sh`

## Operating Rule

Binders remain the authority for tracked work progression.

Schedules do not replace binders. Schedules decide when a workflow should be
evaluated or resumed. The binder still records:

- owner
- scope
- acceptance criteria
- lifecycle state
- handoff target

## Two Execution Modes

### Manual work

Manual work is operator-started and review-led.

Use manual work when:

- the task changes scope or boundary ownership
- implementation is actively being written or reviewed
- promotion, release, or cross-repo sequencing decisions are involved
- a human must interpret evidence before proceeding

Manual binder progression:

1. `Open`
2. `Hand off`
3. `Advance`
4. `Review`
5. `Commit`
6. `Complete`
7. `Compile`
8. `Promote`

### Scheduled work

Scheduled work is workflow-backed and bounded.

Use scheduled work when:

- the task gathers status or validation evidence
- the task refreshes reports or queue summaries
- the task performs a bounded dry run or poll step
- the result can safely stop at a review surface rather than self-promoting

Scheduled work may:

- refresh roadmap reports
- inspect binder or queue state
- collect validation evidence
- enqueue or reconcile bounded automation jobs

Scheduled work must not:

- invent or widen scope
- silently promote repos or release artifacts
- bypass binder lifecycle updates
- hide failures behind retries with no visible record

## Binder Progression Rules

### Scheduled progression

For scheduled work, the allowed binder movement is narrow:

- `Open` -> `Hand off`
- `Hand off` -> `Advance`
- `Advance` -> `Review`

Scheduled work may also refresh evidence while a binder remains in `Advance` or
`Review`.

Scheduled work must not move a binder through:

- `Commit`
- `Complete`
- `Compile`
- `Promote`

Those transitions remain human-reviewed.

### Manual progression

Manual work may move through the full lifecycle when:

- validation evidence exists
- repo boundaries still hold
- docs and examples are current
- the next binder handoff is ready

## Wizard And Shell Alignment

The shared operator model across repos is:

- Shell is the local operator entrypoint for workflow and automation inspection
- Wizard is the managed control plane for workflow handoff and automation state
- `uDOS-dev` owns binder rules, roadmap state, schedule expectations, and
  submission packaging

This means:

- Shell can inspect or trigger bounded workflow and automation actions
- Wizard can queue, reconcile, and expose workflow-adjacent automation state
- `uDOS-dev` decides how those outputs affect binder state and roadmap progress

## Runnable Demo Loop

Use the Round C demo script to exercise the workflow-backed schedule model:

```bash
bash scripts/run-v2-3-workflow-schedule-demo.sh
```

That script validates the required binder surfaces, prints the scheduled-vs-
manual progression rules, and runs the roadmap status refresh used in this lane.

## Review Outcome

The expected operating loop is:

1. a binder opens with explicit acceptance criteria
2. scheduled work refreshes evidence or queue state
3. Shell and Wizard expose local operator state for review
4. a human reviews the evidence
5. manual work advances the binder through commit/complete/compile
6. the resulting round output is recorded in `@dev/submissions/`
