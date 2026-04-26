# Pathway to Swift and Xcode

## Goal

Provide a clean route from UX design and browser prototyping into native Apple implementation.

## Recommended workflow

1. Define tokens in `spine/tokens/`
2. Build and review the pattern in Storybook
3. Stabilize names, hierarchy, states, and content rules
4. Capture wireframe notes for platform-specific changes
5. Export tokens into Swift constants or assets
6. Rebuild the view in SwiftUI
7. Use Xcode previews for refinement
8. Feed native learnings back into this repo rather than drifting silently

## Good fits for direct translation

- spacing scale
- card roles
- panel names
- typography roles
- state labels
- status language

## Things that need native judgment

- toolbar placement
- inspector behavior
- windowing and split views
- keyboard shortcuts
- share sheet / document picker behavior
- macOS sidebar conventions
- iPhone compact navigation

## Suggested repo handoff

- this repo owns the canonical view language
- app repos own production SwiftUI views and app state
- generated token files should be treated as consumables, not the source of truth
