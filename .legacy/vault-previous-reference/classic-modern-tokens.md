# Classic Modern Tokens

## Philosophy

Classic Modern should read as **mono first**, with restrained use of one primary accent and one optional secondary accent.

It should feel:

- calm
- readable
- compact
- slightly retro
- still modern underneath

## Base palette

```css
:root {
  --cm-bg: #e8e8e8;
  --cm-surface: #f2f2f2;
  --cm-panel: #dddddd;
  --cm-border: #222222;
  --cm-text: #111111;
  --cm-text-muted: #444444;

  --cm-accent: #3a7bd5;
  --cm-accent-alt: #c97a2b;

  --cm-success: #2f6b3c;
  --cm-warning: #a56412;
  --cm-danger: #8a2c2c;
}
```

## Rules

- mono at first glance
- no alpha transparency as a default language
- no gradients as a default language
- accent only for selection, active state, links, or meaningful status
- keep warning/danger colours muted, not neon

## Borders

- 1px solid dark border as default
- optional inset/outset bevel for classic depth cues
- minimal border radius; square by default is acceptable

## Spacing

- tighter vertical rhythm than current mainstream desktop UI
- default components should avoid oversized empty padding
- prioritize readability over density extremes

## Typography

### UI roles

- menus / toolbars / labels / desktop filenames: Chicago-style family or compatible equivalent
- body / document text: readable modern sans, SF-style equivalent preferred

### Accessibility posture

- larger default sizes than many current desktop UIs
- preserve strong line-height and clear contrast
- avoid tiny utility text

## Pattern language

### Optional checkerboard

Low-contrast classic Mac checkerboard can be used for:

- desktop/wallpaper background
- empty-state surfaces
- subtle panel texture

Do not use it behind body copy.

## Interaction states

- focus should be obvious
- active should be obvious
- selected surfaces should be visually anchored, not glowy
- hover is optional and subtle
