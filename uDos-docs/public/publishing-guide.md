---
title: "Publishing guide (VA1)"
tags:
  - "--public"
audience: public
slot: 5
apple_color: Blue
---

# Publishing guide (VA1)

**Commands:** [ucode-commands.md](ucode-commands.md) (publishing section).

- **`udo publish build`** — writes HTML + assets under **`$UDOS_VAULT/.site/`** (default vault **`~/vault`** → **`~/vault/.site/`**).
- **`udo publish preview`** — local server; port **`DO_PREVIEW_PORT`** (default **4173**).
- **`udo publish status`** — last build metadata when present.

## A1 publish subset (current)

- Source is vault `content/**/*.md`.
- Frontmatter currently uses `title` (other Jekyll-style keys are ignored in A1 build output).
- Markdown is rendered to static `.html` files plus `.site/index.html` and `.site/build.json`.
- Active USXD theme CSS and active font injection are included in `.site/assets/theme.css`.
- `udo publish deploy` pushes `.site` output to GitHub Pages `gh-pages`.

## Jekyll compatibility notes

- A1 does **not** run Jekyll or Liquid processing.
- A1 does **not** process Jekyll collections/plugins/layout inheritance.
- A1 treats OBF authoring blocks (` ```obf`, ` ```usxd`, ` ```grid`) as source markdown content unless a dedicated renderer command is used.
- For Jekyll-specific pipelines, keep content portable in markdown and use A2/downstream transforms where needed.

See also [../specs/va1-style-guide.md](../specs/va1-style-guide.md) for surface styling.
