# Experiment 3 — notion-design-system (React + Tailwind)

This experiment is a **local Vite app** (gitignored `node_modules/`, `dist/`). Do not commit generated project files; only this README and `notes.md` stay in uDos.

## One-time scaffold

From **this directory**:

```bash
cd dev/experiments/theme-integration/experiment-3-notion-react
npm create vite@latest notion-react-lab -- --template react-ts
cd notion-react-lab
npm install
npm install notion-design-system
npm install -D tailwindcss postcss autoprefixer
```

Configure Tailwind for Vite and wire the design system per [notion-design-system](https://www.npmjs.com/package/notion-design-system) (content globs / preset — follow the package README).

## Evaluate

| Component | Priority |
| --- | --- |
| Block (todo / text) | High |
| Table | High |
| Sidebar | Medium |
| Button / Input | Medium |
| Badge | Low |

Build a single page that wraps content in a `udos-shell` layout (header / main / footer) and imports design-system components.

## Run

```bash
cd notion-react-lab
npm run dev
```

## Record

Fill [`notes.md`](notes.md) with bundle size, Tailwind conflicts, and whether `className` overrides work for USXD layout.
