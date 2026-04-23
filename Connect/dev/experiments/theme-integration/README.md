# uDos Theme Experiments — Master Brief

**Location:** [`dev/experiments/theme-integration/`](.) (this folder) in **uDos** — not under legacy `uDosDev/`, and not coupled to `nano-banana-pro-mcp`.

**Status:** Pre-experiment

**Goal:** Exercise theme systems in isolation before choosing an integration path for the Universal Device Operating Surface (uDos) stack.

**Golden rule:** No changes to unrelated app repos (e.g. nano-banana-pro-mcp) until these harnesses are run and recorded. Standalone test pages and notes only.

---

## Experiment 1: Retro gaming themes (fredporter forks)

### Source forks

| Theme | Repository | Best for |
| --- | --- | --- |
| **NES.css** | [github.com/fredporter/NES.css](https://github.com/fredporter/NES.css) | Pixel art tools, retro UIs |
| **Bedstead** | [github.com/fredporter/bedstead](https://github.com/fredporter/bedstead) | Terminal views, monochrome debuggers |
| **C64.css** | [github.com/fredporter/c64css3](https://github.com/fredporter/c64css3) | Demoscene, retro database browsers |

### Setup (local clones; `vendor/` is gitignored)

From repo root:

```bash
mkdir -p dev/experiments/theme-integration/experiment-1-retro/vendor
cd dev/experiments/theme-integration/experiment-1-retro/vendor
git clone https://github.com/fredporter/NES.css
git clone https://github.com/fredporter/bedstead
git clone https://github.com/fredporter/c64css3
```

### Test page goals

**Harness:** [`experiment-1-retro/index.html`](experiment-1-retro/index.html) + [`experiment-1-retro/README.md`](experiment-1-retro/README.md) (clone/build instructions).

Build out or extend `index.html` so that it:

1. Renders a **USXD-style shell** (header / dock / centre / footer).
2. Provides a **theme selector** (NES / Bedstead / C64 / default).
3. Shows **example components:** buttons, tables, cards, forms.
4. **Documents** visual differences (see `notes.md`).

**Success criterion:** Each theme can be applied to the basic USXD layout without destroying shell structure.

---

## Experiment 2: Notion.css (pure CSS)

### Source

- **Repository:** [github.com/sreeram-venkitesh/notion.css](https://github.com/sreeram-venkitesh/notion.css) (consider a fork under `@fredporter` for stability).
- **Type:** CSS-only.
- **Freshness:** Last meaningful update circa 2020 (stable but stale).

### Setup

```bash
mkdir -p dev/experiments/theme-integration/experiment-2-notion-css/vendor
cd dev/experiments/theme-integration/experiment-2-notion-css/vendor
git clone https://github.com/sreeram-venkitesh/notion.css
```

(No build step — use `src/notion.css` as linked from the harness.)

### Test focus

| View | Component | Success signal |
| --- | --- | --- |
| Table | Data table with sortable headers | Reads like a Notion database |
| List | Task list with checkboxes | Tight, minimal spacing |
| Card | Gallery of items | Borders and shadows feel right |
| Form | Inputs, buttons, selects | Rounded Notion-like controls |

**Harness:** [`experiment-2-notion-css/index.html`](experiment-2-notion-css/index.html) + [`experiment-2-notion-css/README.md`](experiment-2-notion-css/README.md) — loads `vendor/notion.css/src/notion.css` inside a light `.notion-view` canvas; USXD chrome stays on the dark shell.

### Integration sketch

```html
<link rel="stylesheet" href="vendor/notion.css/src/notion.css" />
<div class="notion-view">
  <!-- USXD content -->
</div>
```

**Success criterion:** A credible task table built in under two hours of focused work.

---

## Experiment 3: Notion Design System (React + Tailwind)

### Source

- **Repository:** [github.com/shade-solutions/notion-design-system](https://github.com/shade-solutions/notion-design-system)
- **Type:** React components + Tailwind preset.
- **Dependencies:** React, Tailwind CSS.

### Setup

Create a **separate** Vite + React app under `experiment-3-notion-react/` (see [`experiment-3-notion-react/README.md`](experiment-3-notion-react/README.md); `node_modules/` gitignored).

```bash
cd dev/experiments/theme-integration/experiment-3-notion-react
npm create vite@latest notion-react-lab -- --template react-ts
cd notion-react-lab
npm install notion-design-system
npm install -D tailwindcss postcss autoprefixer
```

### Components to evaluate

| Component | uDos use | Priority |
| --- | --- | --- |
| Block (text / todo / toggle) | Rich task editor | High |
| Sidebar | Navigation | Medium |
| Table | Database views | High |
| Button / Input | Forms | Medium |
| Badge | Status | Low |

**Success criterion:** Interactive todo list with rich blocks in under four hours of focused work.

---

## Comparison matrix

| Theme | Type | Rough setup | uDos fit | Choose if… |
| --- | --- | --- | --- | --- |
| NES.css | CSS | ~15 min | Pixel / debug tools | You want explicit retro chrome |
| Bedstead | CSS | ~15 min | Terminal / mono | You want monospace-first surfaces |
| C64.css | CSS | ~15 min | Demoscene / retro | You target 8-bit aesthetic |
| notion.css | CSS | ~30 min | Table / list | You want lightweight Notion-like CSS only |
| notion-react | React + Tailwind | 2+ h | Block editors | You need editable blocks and React |

---

## Folder layout (this tree)

```
dev/experiments/theme-integration/
├── README.md                 # this master brief
├── DECISIONS.md              # integration decision after experiments
├── experiment-1-retro/
│   ├── index.html
│   ├── README.md
│   └── notes.md
├── experiment-2-notion-css/
│   ├── index.html
│   ├── README.md
│   └── notes.md
└── experiment-3-notion-react/
    ├── README.md
    ├── .gitignore            # ignores local notion-react-lab/
    └── notes.md
```

Add **vendor clones** and **node_modules** locally; keep them out of git (see `.gitignore` in `theme-integration/` and experiment-3).

---

## Success metrics (all experiments)

Each experiment should answer:

1. **USXD structure:** Does header / dock / centre / footer stay coherent?
2. **Dark / light:** Supported? If not, can we layer tokens?
3. **Tailwind / CSS conflicts:** Any namespace collisions? (React: preset compatibility.)
4. **Bundle size:** Measure before / after for production-like builds where relevant.

**Retro-specific:** Pixel fonts across browsers; grid / teletext backgrounds survive theme swaps.

**Notion-specific:** Map `notion-*` CSS variables to uDos design tokens where possible; React: `className` overrides for USXD layout shells.

---

## Suggested timeline

| Week | Focus | Deliverable |
| --- | --- | --- |
| 1 | Retro (all three) | Screenshots + filled `notes.md` per area |
| 2 | notion.css | Table + list demo + notes |
| 3 | notion-react | Block editor demo + notes |
| 4 | Decision | Update `DECISIONS.md` with recommended integration path |

---

## Next actions

1. Run **Experiment 1** first (lowest friction).
2. Record outcomes in each `notes.md` (what worked, what broke, integration effort 1–5, would ship?).
3. Close with **`DECISIONS.md`** — single path or “no integration” with rationale.

---

## Tracking

- Experiments index: [`dev/experiments/README.md`](../README.md)
- Alpha roadmap: **T-ALPHA-THEME-EXP** in [`dev/TASKS.md`](../../TASKS.md)
