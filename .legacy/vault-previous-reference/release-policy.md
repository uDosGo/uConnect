# Family Release Policy

## Purpose

This document defines the current family release posture in one place.

## Release Classes

### Tagged Runtime Or Tooling Repos

Use semantic tags from `main` and keep release notes.

Typical examples:

- `uDOS-core`
- `uDOS-shell`
- `uDOS-host`
- `uDOS-wizard`
- `uDOS-empire`

### Tagged Optional Module Repos

Tag when the public module surface changes materially.

Typical examples:

- `uDOS-gameplay`
- `uDOS-plugin-index`
- `uDOS-themes`
- `uDOS-grid`

### Contract Or Docs First Repos

Keep release-light and avoid artifact pressure.

Examples:

- `uDOS-docs`
- `uDOS-dev`

## Notes-Only Default

Until a repo has a stable documented artifact output:

- tag from `main`
- prefer release notes
- do not attach placeholder artifacts

## Tier Rule

### Tier 1

Protect the core runtime spine first.

Current Tier 1 focus:

- `uDOS-core`
- `uDOS-host`
- `uDOS-shell`
- `uDOS-themes`
- `uDOS-thinui`
- `uDOS-workspace`
- `uDOS-docs`
- `uDOS-dev`

### Tier 2

Advance only if Tier 1 is not destabilized.

### Tier 3

Keep adjacent-family streams out of the core release path.

## Hardening Rule

For repos that ship tags, require:

- protected `main`
- clear promotion path
- runnable validation command
- release notes source
- explicit artifact policy

## Backlog Rule

Do not keep multiple public release ledgers. Keep the current policy here and
track forward-looking release work in `@dev`.
