# Classic Modern — Ubuntu Host Profile

## Goal

De-modernise GNOME without replacing it.

Ubuntu remains the host environment. The goal is not to create a new desktop environment, but to simplify the existing one so it supports ThinUI as the preferred work surface.

## Required host tools

- GNOME Tweaks
- User Themes extension

## Optional

- Gradience, if needed for GTK theme creation/tuning
- light shell extensions for layout simplification only

## Host posture

- GNOME remains available
- ThinUI becomes the preferred fullscreen launch surface
- users can still use normal apps and windows whenever needed

## Visual direction

- remove blur
- remove transparency
- reduce or remove heavy shadows
- reduce oversized spacing where practical
- align colors to Classic Modern tokens
- maintain high contrast and strong borders

## Behavioural direction

- reduce unnecessary animations
- avoid flashy transitions
- prefer immediate feedback
- keep navigation simple and quiet

## Launch posture

Recommended modes:

1. boot into Ubuntu host
2. launch ThinUI as the primary work environment
3. allow escape/fallback to native GNOME

## Boundaries

- do not replace the host DE in MVP
- do not force a browser-first shell for utilities
- do not move runtime ownership away from Ubuntu/Core
