# USXD-Express

Text-only **OBF / USXD** surface designer: edit markdown (` ```usxd``` + optional ` ```grid``` `), preview in the browser with **live reload** (WebSocket), export static HTML.

## Commands

| Command | Purpose |
| --- | --- |
| `usxd-express serve` | Preview server; watches `**/*.md` under the current directory (or `--dir` / `--file`) |
| `usxd-express export` | Write one `.html` per `SURFACE` to `-o` / `--output` (`--format html`; `svg` is `[A2 stub]`) |
| `usxd-express render <file>` | Render first surface in markdown to terminal (ASCII/teletext) |
| `usxd-express validate <file>` | Check USXD + grid dimensions |
| `usxd-express list` | List `SURFACE` names in markdown under `--dir` |

Environment: **`USXD_PORT`** (default **3000**).

## From the repo

```bash
cd tools/usxd-express
npm run build   # from monorepo root: npm run build -w @udos/usxd-express
node bin/usxd-express.mjs serve --dir ./surfaces
# → http://localhost:3000/surface/teletext-console
```

## `udo` integration

- `udo usxd serve` — forwards to USXD-Express `serve`
- `udo usxd export` — static export
- `udo usxd render` — terminal render of markdown surface
- `udo usxd edit` — preview; prefers `~/vault/surfaces` when present, else current directory

Theme commands **`udo usxd list` / `apply` / `show`** (templates under `templates/usxd/`) are unchanged.

## Stack

TypeScript, **Express**, **Marked** (lexer — fenced `usxd` / `grid` blocks), **WebSocket** (`ws`) + **chokidar**, **`@udos/obf-grid`** for grid parse/render, optional **Tailwind CDN** in preview only; **export** is self-contained inline CSS.

**Scripts:** `npm run dev` → `tsx src/cli.ts serve`; `npm run export` → `tsx src/cli.ts export` (requires `tsx` devDependency).
