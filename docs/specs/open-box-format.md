---
title: "Open Box Format (OBF) — locked"
tags: [--public]
audience: public
slot: 5
---

# Open Box Format (OBF) — locked

**Definition:** **Open Box Format** means any UI, layout, or style is defined **only** as text inside a **markdown fenced code block**. No proprietary canvas; no binary UI source.

**Principle:** If it is not in a text code block, it is not open box.

## Rules

1. **UI components** → fenced block with language tag **`obf`**.
2. **Style rules** (tokens, Tailwind-ish strings) → **`obf-style`**.
3. **Grid layouts** (Teletext / cell addressing) → **`grid`**.
4. **USXD surfaces** → **`usxd`** (aligned with repo `templates/usxd/`).
5. **Reusable markdown skeletons** → **`template`**.
6. Students and contributors **copy, paste, and edit** blocks; no lock-in.

## Block types (summary)

| Fence | Purpose |
| --- | --- |
| ` ```obf ` | Component definitions: `COMPONENT`, `STYLE`, `VARIANTS`, … |
| ` ```obf-style ` | Named theme: colours, typography, spacing, grid visibility |
| ` ```grid ` | Cell grid: attributes `size`, `mode`, cell addresses — full spec [obf-grid-spec.md](obf-grid-spec.md) |
| ` ```usxd ` | Surface definition (interchange with USXD tooling) |
| ` ```template ` | Markdown-first boilerplate |

**Examples:** [obf-components.md](obf-components.md), [style-guide-obf.md](style-guide-obf.md), [grid-spec.md](grid-spec.md).

**Parsers:** VA1 may treat these as opaque documentation; future renderers validate and emit HTML/CSS from the same text.
