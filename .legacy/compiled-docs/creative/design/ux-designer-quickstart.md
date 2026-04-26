# UX designer quickstart

Fastest path to run the browser-based UX designer in **UniversalSurfaceXD** ([open source, MIT](../LICENSE)).

## What you need

- macOS (for `.command` launcher) or any shell for npm commands
- Node.js 20+ (`node -v`)
- This repository cloned locally (any folder name; upstream is [github.com/fredporter/UniversalSurfaceXD](https://github.com/fredporter/UniversalSurfaceXD))

## Option A (double-click launcher)

Use the Finder launcher inside `browser-mockup/`:

- `browser-mockup/UX Designer Quickstart.command`

What it does:

1. Installs `browser-mockup` dependencies on first run.
2. Starts Vite dev server.
3. Opens the lab hub at <http://localhost:5173/lab>.

If macOS blocks the file on first run, right-click it and choose **Open** once.

## Option B (terminal)

From repo root:

```bash
npm install --prefix browser-mockup
npm run dev --prefix browser-mockup
```

Then open:

- Lab hub: <http://localhost:5173/lab>
- Composer: <http://localhost:5173/lab/composer>
- Gallery: <http://localhost:5173/lab/gallery>
- UX I/O: <http://localhost:5173/lab/ux-io>

## Useful companion commands

From repo root:

```bash
npm run ux:validate-surfaces
npm run ux-designer:dev
```

- `ux:validate-surfaces` checks interchange examples against schema.
- `ux-designer:dev` is a root shortcut to run the same dev server.

## Troubleshooting

### Port 5173 is already in use

If startup says the port is busy, stop the other process or run on a different port:

```bash
npm run dev --prefix browser-mockup -- --port 5175
```

Then open <http://localhost:5175/lab>.

### macOS blocks the `.command` launcher

If Finder shows a security warning:

1. Right-click `browser-mockup/UX Designer Quickstart.command`.
2. Choose **Open**.
3. Confirm **Open** in the prompt.

You usually only need this once.

### Node version mismatch

If install/dev fails with engine or syntax errors, verify Node:

```bash
node -v
```

Use Node 20+ and then reinstall:

```bash
npm install --prefix browser-mockup
```
