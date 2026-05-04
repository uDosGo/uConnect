---
title: "Material Design 3 notes (uDos)"
tags: [--public]
audience: public
slot: 5
status: "draft"
---

# Material Design 3 notes (uDos)

This document captures MD3 as a design reference, not a mandatory implementation framework.

## Intent

- Reuse useful interaction principles (hierarchy, spacing, feedback).
- Avoid hard dependency on MD3 component libraries for VA1/A2 core.

## Useful MD3 principles for uDos

- **Color roles:** separate surface/background/primary/secondary/error tokens.
- **Typography scale:** consistent heading/body hierarchy.
- **Motion:** short, purposeful transitions; avoid decorative animation.
- **State feedback:** clear focus/hover/pressed/error states.
- **Spacing rhythm:** predictable spacing scale for forms/cards/tables.

## Out of scope

- Full MD3 compliance as a product requirement.
- Rebuilding uDos as a Material-only system.

## Practical adoption guidance

- Keep uDos token names stable and map MD3-like roles onto existing tokens.
- Prioritize readability in terminal + browser parity.
- Use MD3 ideas where they improve usability without coupling architecture.
