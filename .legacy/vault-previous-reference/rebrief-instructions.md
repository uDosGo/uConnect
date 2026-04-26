# Rebrief Instructions

Use this file as the single-source quick handoff note for future implementation requests.

## Single source of truth

Read:

- `uDOS-docs/docs/v2/classic-modern-mvp-0.1/README.md`
- `sonic-screwdriver/docs/sonic-tui-charter.md`

Then implement the requested phase **within those boundaries**.

## Scope line

Sonic = TUI only for install/repair/doctor; no browser; DB GUI = ThinUI/uDOS.

## Example phase wording

- Phase 1: deprecate `sonic-open` browser path.
- Phase 2: Bubble Tea MVP for first-run + doctor only.
- Phase 3: add repair lane and guided remediation.

## Rebrief template

- Charter: 1–2 sentences
- Non-goals: especially no browser installer
- Target stack: or explicit comparison if not locked
- Flows: numbered
- Current pain: concrete operator confusion
- Constraints: platform, packaging, binary/posture
- Definition of done: testable bullets

## Preferred one-liner

"Read `uDOS-docs/docs/v2/classic-modern-mvp-0.1/README.md` and `sonic-screwdriver/docs/sonic-tui-charter.md`; implement X under those boundaries."
