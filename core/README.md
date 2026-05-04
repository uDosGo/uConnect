# `@udos/core` — VA1 `udo` CLI

**Pure TypeScript, Node ≥ 20.** No Go, no TUI, no uCode runtime — those belong to **VA2** (see [`VA2.md`](VA2.md)).

## Install / run (development)

This package is part of the **repo-root npm workspace**. From **`uDos/`** (parent of `core/`):

```bash
npm ci
npm run build -w @udos/core
node core/bin/udo.mjs help
```

## Global `udo` on your PATH

From this directory (still works with `"private": true` — local link only):

```bash
npm run link:global
# or: npm link
udo help
```

## Test & CI

```bash
npm test
```

From repo root: **`npm test`** (builds workspace, then runs these tests).

Non-interactive command sweep (skips blocking `publish preview`):

```bash
bash scripts/smoke-udo.sh
```

GitHub Actions: [`.github/workflows/core-ci.yml`](../.github/workflows/core-ci.yml) runs **`npm ci && npm test`** at the repo root when workspace paths change.

## Publishing (static site)

- **`udo publish build`** — reads `content/**/*.md`, writes HTML + `index.html` + `build.json` under **`$UDOS_VAULT/.site/`** (default vault `~/vault` → **`~/vault/.site/`**).
- **`udo publish preview`** — serves `.site` at **`http://127.0.0.1:4173`** until Ctrl+C. Override port: **`DO_PREVIEW_PORT`**.
- **`udo publish status`** — prints last `build.json` if present.

## USXD themes

Themes live in the repo at **`templates/usxd/<name>/`** (see [`templates/usxd/README.md`](../templates/usxd/README.md)). VA1 ships **`default`** (`theme.css`, `usxd.yaml`).

```bash
udo usxd list
udo usxd apply default
udo usxd show
```

Applied files are copied to **`vault/system/usxd/current/`**; metadata in **`vault/system/usxd/active.json`**. The active theme’s `theme.css` is copied into **`.site/assets/theme.css`** on **`udo publish build`**.

## Environment

| Variable | Meaning |
| --- | --- |
| `UDOS_VAULT` | Vault root (default: `~/vault`) |
| `UDOS_TEMPLATES_ROOT` | Override templates directory (default: `../templates` from this repo) |
| `DO_PREVIEW_PORT` | Port for `udo publish preview` (default `4173`) |

## Stack

`commander`, `chalk`, `fs-extra`, `glob`, `marked`, `gray-matter` — npm only.

## VA2

Commands such as `udo run` (uCode), `udo tui`, `udo ucoin`, hardware, 3D, etc. are **not** in VA1. See [`VA2.md`](VA2.md).
