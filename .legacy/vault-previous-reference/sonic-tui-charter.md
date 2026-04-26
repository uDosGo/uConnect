# Sonic Screwdriver — TUI Charter

**Canonical charter text:** `uDOS-docs/docs/classic-modern-mvp-0.1/docs/sonic-tui-charter.md`. This file is a **mirror** for Sonic implementation work; keep it aligned when the boundary changes.

---

## One-line charter

sonic-screwdriver is a terminal-only fixer/installer/setup tool; it must never require or open a browser for its core job.

---

## Scope

### In

- install — including applying the **Classic Modern uDOS-host profile** (canonical: `uDOS-docs/docs/classic-modern-mvp-0.1/docs/classic-modern-host-profile.md`) as the **default** outcome when Sonic is used to install the family **Ubuntu baseline** host, unless the operator explicitly selects a different profile. This is intentionally **not** “whatever stock GNOME looks like”; it is the de-modernised host posture the family ships for uDOS-host.
- repair
- environment setup
- health checks
- guided fixes
- clear logs + next steps

### Out

- browser GUI
- visual dashboards
- sonic-db GUI

These belong in uDOS (ThinUI or other surfaces)

---

## Stack

Preferred (longer term):

- Go + Bubble Tea + Lip Gloss

Reason:

- single binary
- fast
- interactive
- SSH-safe

**Track A implementation (today):** `sonic tui` ships in this repo as **Python + Textual** (`[tui]` extra), sharing doctor/plan logic with the existing CLI. This matches the charter behaviours (no browser for the preview path; SSH-safe) while avoiding a second toolchain until a Go binary is prioritized.

---

## User flows

### 1. First run

Input:

- `sonic`

Output:

- setup complete
- clear summary
- exit success

### 2. Repair

Input:

- broken env

Output:

- detected issue
- fixed or instructions

### 3. Doctor

Input:

- `sonic doctor`

Output:

- system health summary

---

## Failure handling

- human-readable messages
- no stack traces by default
- always provide next action

---

## Deprecation

- remove browser-based UI from this repo
- move UI to uDOS layer if needed

---

## Acceptance criteria

- no browser launched
- works over SSH
- no GUI dependency
- single command entry
- deterministic output

---

## Principle

Sonic is a tool, not a product surface.
