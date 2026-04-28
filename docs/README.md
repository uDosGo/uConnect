# uDos Go – Home Repository

This repository contains **all uDos components as submodules**. Use it to clone the entire ecosystem.

## Quick Start

```bash
git clone --recursive git@github.com:uDosGo/home-repo.git ~/Code/uDosGo
cd ~/Code/uDosGo
make doctor          # verify environment
make build           # compile everything
make dev             # start core + ThinUI + Re3Chat
```

## Directory Structure

- `uCode1/` – Core CLI, MCP server, feed spool (production)
- `uCode2/` – Web publishing (future)
- `ThinUI/` – Graphical dashboard (Tauri + Blitz)
- `SonicExpress/` – Packaging & installer (new)
- `DevStudio/` – Internal dev tooling (private submodule)
- `Registry/` – Promoted plugins/themes
- `Sandbox/` – Local experiments (ignored)
- `docs/` – Shared documentation

## Updating

```bash
make update
```

## Development Mode

Use `--dev` flag with any `udos` command to isolate logs and state:

```bash
udos --dev note create test.md
```

Dev logs go to `~/.uds/dev/` and are never synced remotely.

## Logging

Every command execution is recorded in the feed spool (`replies.jsonl`). Agents can query:

```bash
udos feed search --tag event,command
```

See `docs/logging.md` for schema.

## License

MIT (unless otherwise noted in submodules)
