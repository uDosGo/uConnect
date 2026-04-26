# uDOS-shell TUI Viewport Contract

Status: active  
Updated: 2026-03-15

## Purpose

Define the active character-based viewport model for the `uDOS-shell` TUI.

## Core Rule

Viewport sizing is defined in characters as `WIDTHxHEIGHT`.
Shell layout decisions should be based on terminal columns and rows, not pixel
classes.

## Viewport Tiers

| Tier | Character viewport |
|---|---|
| `V0` | `25x25` minimum supported |
| `V1` | `40x25` compact |
| `V2` | `64x32` medium portrait |
| `V3` | `80x40` tablet landscape baseline |
| `V4` | `100x40` laptop baseline |
| `V5` | `120x50` desktop baseline |
| `V6` | `80x45` widescreen compact |
| `V7` | `120x67` widescreen full |

## Rendering Rules

- crop before pad
- do not rely on uncontrolled wrap for primary layout
- keep command input usable at the minimum supported tier
- preserve ASCII-safe output at every tier
- richer glyphs are additive, not required

## Phase 3 Scope

Phase 3 should implement:

- deterministic width and height allocation helpers
- narrow-layout fallbacks
- snapshot-style rendering tests across key tiers
- explicit viewport handling for overlays and inspector panels
