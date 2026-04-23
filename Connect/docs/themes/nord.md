---
title: "Nord theme notes (uDos)"
tags: [--public]
audience: public
slot: 5
status: "draft"
---

# Nord theme notes (uDos)

This document records Nord as an optional visual reference for uDos surfaces.

## Scope

- Reference palette and usage guidance only in A1.
- Runtime theming flags (for example `--theme nord`) are optional follow-up work.

## Nord palette (reference)

- Polar night: `#2E3440`, `#3B4252`, `#434C5E`, `#4C566A`
- Snow storm: `#D8DEE9`, `#E5E9F0`, `#ECEFF4`
- Frost: `#8FBCBB`, `#88C0D0`, `#81A1C1`, `#5E81AC`
- Aurora: `#BF616A`, `#D08770`, `#EBCB8B`, `#A3BE8C`, `#B48EAD`

## Suggested mapping

| uDos token | Nord reference |
| --- | --- |
| background | `#2E3440` |
| surface | `#3B4252` |
| text | `#E5E9F0` |
| text-dim | `#4C566A` |
| primary | `#88C0D0` |
| accent | `#81A1C1` |
| success | `#A3BE8C` |
| warning | `#EBCB8B` |
| error | `#BF616A` |

## Notes

- Preserve high-contrast defaults for accessibility.
- Keep terminal rendering readable in monochrome and teletext fallback modes.
