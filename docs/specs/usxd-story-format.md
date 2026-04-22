---
title: "USXD Story format (narrative baseline)"
tags: [--public]
audience: public
slot: 5
status: "draft"
last_reviewed: "2026-04-16"
applies_to: "v0.2.0-alpha.1 story surfaces (browser, ThinUI, TUI)"
---

# USXD Story format (narrative baseline)

## Definition

Story is a **linear step-form surface** with presentation-slide styling:

- typeform-like progression and pacing
- keyboard-first controls (`Enter` as primary action)
- one focal decision per panel
- optional presentation blocks around input
- shared semantics across browser, ThinUI, and TUI adapters

Story is a **surface pattern**, not a separate workflow engine.

## Core principles

| Principle | Baseline rule |
| --- | --- |
| Linear navigation | Start -> Step 1 -> ... -> End |
| Enter to continue | Primary action is `Enter` on every step |
| Input density | Prefer one primary field per panel |
| Progress visibility | Show `Step X/Y` or progress bar for multi-step flows |
| Surface separation | GTX/core owns semantics; themes own presentation |
| Marp-style support | Presentation blocks are allowed inside a story step |

## Navigation and keyboard rules

- `Enter` advances to next step; on last step it submits/completes
- `Back` or `Esc` returns to previous step when enabled
- Progress is visible by default for multi-step stories
- Completion step must explicitly confirm/submit
- Validation must render inline before action row

Canonical controls:

- `Left/Right`: stars and scale selection
- `Space`: multi-choice toggle
- `Enter`: continue/submit

## Input density rules

- Preferred: 1 primary field per panel
- Acceptable: 2-3 tightly related fields
- Maximum: 4 small grouped fields
- Avoid unrelated decisions in one panel

## Story panel anatomy

Required regions:

- header
- progress
- body
- primary interaction region
- action row

Optional regions:

- subtitle
- media/presentation block
- helper text
- validation/error text
- footer hint

Reference frame:

```text
┌─────────────────────────────────────────────────────────────┐
│ Story Title                                Step 2 / 7       │
│ Optional subtitle / helper text                             │
├─────────────────────────────────────────────────────────────┤
│ Presentation block / prompt / instructions                  │
│ Primary interaction area                                    │
├─────────────────────────────────────────────────────────────┤
│ [ Back ]                                      [ Continue ]  │
│ Hint: Enter = continue                                      │
└─────────────────────────────────────────────────────────────┘
```

## Panel taxonomy

| Kind | Purpose |
| --- | --- |
| `story-intro` | Opening frame before input |
| `story-input` | Single or grouped text input |
| `story-choice` | Single or multi-select |
| `story-scale` | Numeric scale (typically 1-5) |
| `story-rating-stars` | Star rating (typically 1-5) |
| `story-summary` | Review answers before submit |
| `story-confirm` | Explicit confirmation/submit |
| `story-slide` | Presentation-only step |
| `story-slide-input` | Hybrid presentation + input |
| `story-end` | Completion state |

## Step types (v0.2.0-alpha.1 baseline)

| Type | Purpose | Control model |
| --- | --- | --- |
| `presentation` | Read-mostly framing content | Enter to continue |
| `input` | Text/textarea capture | One primary field |
| `single_choice` | One option | Radio semantics |
| `multi_choice` | Multiple options | Checkbox semantics (`Space` toggle) |
| `stars` | 1..N star rating | `Left/Right` then `Enter` |
| `scale` | Numeric range | `Left/Right` then `Enter` |

## Presentation block behavior (Marp-style in Story)

Presentation blocks are allowed inside step body as read-mostly content:

- heading block
- bullet block
- quote/emphasis block
- split content block
- hero slide block
- hybrid slide + input block

These blocks must not introduce independent navigation logic.

## Progress styles

- numeric: `Step 2 / 6` (default)
- bar: `[######------------] 2 / 6`
- labeled sequence: `Feedback · Rating · Comment · Confirm`

## Story JSON contract (USXD extension)

```json
{
  "open_box": {
    "id": "onboarding-story",
    "type": "application/vnd.usxd.story",
    "usxd_version": "v0.2.0-alpha.1"
  },
  "story": {
    "title": "Welcome to uDos",
    "steps": [
      { "type": "presentation", "content": "# Welcome", "next_action": "enter" },
      { "type": "input", "label": "Workspace name", "field": "text", "required": true },
      { "type": "multi_choice", "label": "Select features", "options": [] },
      { "type": "stars", "label": "How familiar are you?", "max": 5, "value": 4 },
      { "type": "scale", "label": "Rate CLI experience", "min": 1, "max": 5, "value": 4 },
      { "type": "single_choice", "label": "Launch dashboard?", "options": [] }
    ],
    "navigation": {
      "back": true,
      "cancel": true,
      "progress": "visible",
      "enter_to_continue": true
    }
  }
}
```

Machine-readable schema for non-Go tooling:

- [`usxd-story-schema.json`](usxd-story-schema.json)

## Extended GTX-compatible step shape

```json
{
  "id": "rating",
  "type": "scale",
  "title": "Rate your experience",
  "prompt": "How satisfied are you?",
  "min": 1,
  "max": 5,
  "style": { "surface": "story", "themeVariant": "presentation" },
  "presentation": { "headline": "Customer Feedback", "lede": "A few quick questions" },
  "actions": { "primary": "Continue", "secondary": "Back" }
}
```

## Theme abstraction

Story semantics remain fixed while adapters theme output:

- Typeform (minimal)
- Marp (presentation-forward)
- Teletext (retro terminal)
- ThinUI (low-resource web)

Themes change chrome/tokens only, not step meaning.

## Good defaults

- one primary action per panel
- visible progress
- explicit back navigation where allowed
- inline validation
- explicit completion state

## Anti-patterns

- giant multi-decision survey pages
- hidden progress
- ambiguous completion state
- heavy presentation content that hides the next action

## Implementation handover (alpha scope)

- add/maintain step types: `presentation`, `input`, `single_choice`, `multi_choice`, `stars`, `scale`
- keep linear navigation contract with `Enter` default
- keep progress visible by default
- serialize as `application/vnd.usxd.story`
- render with theme abstraction without changing semantics

