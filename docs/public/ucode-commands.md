---
title: "uDos A1 uCode Command Reference"
version: "1.0.0"
audience: "--public"
tags:
  - "--public"
  - "--reference"
slot: 5
apple_color: Blue
---

# uDos A1 `udo` command reference (VA1)

**Scope:** commands implemented by **`@udos/core`** (TypeScript) for the default npm workspace CLI. The **`udos-core`** Rust binary adds **`udo run`** / **`udo fmt`** for the mini uCode runtime (see **uCode runtime** below). Run **`udo <command> --help`** for flags.

**Style / tokens:** [../specs/va1-style-guide.md](../specs/va1-style-guide.md)

## Vault

| Command | Description | Example |
| --- | --- | --- |
| `udo init` | Create vault (default `~/vault` or `UDOS_VAULT`); full scaffold including `@toybox/`, `@sandbox/`, `.local/` | `udo init` |
| `udo vault init [path]` | Same bootstrap; optional explicit vault root | `udo vault init /tmp/my-vault` |
| `udo list` | List vault file paths | `udo list` |
| `udo open <file>` | Open in `$EDITOR` (default `nano`) | `udo open content/note.md` |
| `udo edit <file>` | Same as open (VA1) | `udo edit content/note.md` |
| `udo delete <file>` | Move to `.compost/` | `udo delete draft.md` |
| `udo restore <id>` | Restore from compost | `udo restore abc123` |
| `udo search <query>` | Search `.md` / `.txt` in vault | `udo search hello` |

## uCode runtime (Rust `udos-core`)

Implemented by **`core-rs`** (`udos-core`). Language subset: `PRINT`, `LET`, `IF … THEN`, `FOR … DO` (see `core-rs/src/ucode/mod.rs`).

| Command | Description | Example |
| --- | --- | --- |
| `udo run --file <path>` | Execute a `.ucode` file | `udo run -f ucode/hello.ucode` |
| `udo run --file <doc.md>` | Execute all fenced ` ```ucode ` blocks in markdown (CommonMark fence order) | `udo run -f notes/lab.md` |
| `udo run --eval <snippet>` | Inline uCode (quote as needed) | `udo run --eval 'PRINT "hello"'` |
| `udo fmt <path>` | Format `.ucode` under a file or directory (trim trailing spaces; ensure final newline) | `udo fmt ucode/` |
| `udo fmt --check <path>` | Exit with error if any file would change (CI-style) | `udo fmt --check script.ucode` |

## ASCII / FIGlet (`udos-core`)

Requires external **`figlet`** on `PATH` for large banners; boxed fallback if missing. Details: [`../tools/figlet.md`](../tools/figlet.md).

| Command | Description | Example |
| --- | --- | --- |
| `udo ascii banner <text>` | FIGlet banner (`--font`, default `standard`) | `udo ascii banner Hi --font slant` |
| `udo ascii banner <text> --to-teletext` | Hex teletext codes per line | `udo ascii banner Hi --to-teletext` |
| `udo ascii fonts list` | List fonts (`showfigfonts` / `figlet -I2` / stub) | `udo ascii fonts list` |
| `udo ascii fonts install <name>` | A1 stub (manual `.flf` install hint) | `udo ascii fonts install mine` |
| `udo ascii fonts preview --font <f> <text>` | Preview font | `udo ascii fonts preview --font standard OK` |

## Markdown

| Command | Description | Example |
| --- | --- | --- |
| `udo md format <file>` | Format markdown | `udo md format note.md` |
| `udo md lint <file>` | Lint | `udo md lint note.md` |
| `udo md toc <file>` | Insert / refresh TOC | `udo md toc note.md` |
| `udo md publish <file> [--vault-path <path> \| --out-dir <dir>] [--layout <name>] [--theme <id>]` | Write vault publishing markdown with Jekyll-style frontmatter | `udo md publish content/note.md --theme github-dark` |

## Frontmatter

| Command | Description | Example |
| --- | --- | --- |
| `udo fm add <file> --tag <tag>` | Add tag in frontmatter | `udo fm add post.md --tag published` |
| `udo fm list <file>` | List fields | `udo fm list post.md` |
| `udo fm edit <file>` | Edit frontmatter | `udo fm edit post.md` |

## Templates

| Command | Description | Example |
| --- | --- | --- |
| `udo template list` | List templates | `udo template list` |
| `udo template show <name>` | Show template | `udo template show blog` |
| `udo template apply <name>` | Apply into vault | `udo template apply blog` |

## Feeds

| Command | Description | Example |
| --- | --- | --- |
| `udo feed list` | List configured feeds (`.local/feeds.yaml`) or JSONL feeds | `udo feed list` |
| `udo feed view <name>` | View configured feed details or JSONL items | `udo feed view news` |
| `udo feed show <name>` | Alias for `view` (configured feed details) | `udo feed show sandbox-versioning` |
| `udo feed enable <name>` | A2 stub — mark feed as enabled conceptually | `udo feed enable sandbox-versioning` |
| `udo feed disable <name>` | A2 stub — mark feed as disabled conceptually | `udo feed disable sandbox-versioning` |
| `udo feed test <name> --dry-run` | Inspect configured feed action | `udo feed test sandbox-versioning --dry-run` |
| `udo feed export <name>` | Export JSON lines | `udo feed export news --json` |

## Spools

| Command | Description | Example |
| --- | --- | --- |
| `udo spool list` | List spools | `udo spool list` |
| `udo spool info <name>` | Metadata | `udo spool info weekly` |
| `udo spool show <name>` | Show configured spool details | `udo spool show condense-sandbox` |
| `udo spool run <name> [--dry-run]` | Run one spool now (sync) | `udo spool run condense-sandbox --dry-run` |
| `udo spool run --all [--dry-run]` | Run all enabled spools | `udo spool run --all` |
| `udo spool status` | Show last run status from `.local/spool-status.json` | `udo spool status` |
| `udo spool extract <name>` | Extract | `udo spool extract weekly` |

## Publishing

| Command | Description | Example |
| --- | --- | --- |
| `udo publish build` | Build static site under vault `.site/` | `udo publish build` |
| `udo publish preview` | Local preview (port `DO_PREVIEW_PORT`, default 4173) | `udo publish preview` |
| `udo publish status` | Last build info | `udo publish status` |
| `udo publish deploy` | Deploy built output to GitHub Pages (`gh-pages`) | `udo publish deploy` |

## GitHub (native workflow)

| Command | Description | Example |
| --- | --- | --- |
| `udo github clone <repo>` | Clone GitHub repo into vault/default target | `udo github clone bro/udos-vault` |
| `udo github pull` | Pull latest changes | `udo github pull` |
| `udo github push` | Commit and push local changes | `udo github push -m "update vault"` |
| `udo github status` | Show repo sync/status summary | `udo github status` |
| `udo github sync` | Pull then push | `udo github sync` |
| `udo github fork [repo]` | Fork upstream repo via `gh` | `udo github fork udos/uDos` |
| `udo github release <tag>` | Create GitHub release | `udo github release v1.2.0` |
| `udo github configure --username --repo` | Save defaults in `~/.config/udos/github.yaml` | `udo github configure --username bro --repo bro/udos-vault` |

Config file:

- `~/.config/udos/github.yaml`
- keys: `token`, `username`, `default_repo` (supports `${GITHUB_TOKEN}` expansion)

## Issues and PRs (GitHub)

| Command | Description | Example |
| --- | --- | --- |
| `udo issue create --title <t> [--body]` | Create issue in current/default repo | `udo issue create --title "Fix docs"` |
| `udo issue list [--limit]` | List open issues | `udo issue list --limit 50` |
| `udo pr create [--title --body --base]` | Create pull request | `udo pr create --title "Update docs"` |
| `udo pr list [--limit]` | List open PRs | `udo pr list` |
| `udo pr checkout <id>` | Checkout PR branch | `udo pr checkout 42` |
| `udo pr review <id> [--body]` | Add PR review/comment | `udo pr review 42 --body "Looks good"` |
| `udo pr approve <id>` | Approve PR | `udo pr approve 42` |
| `udo pr merge <id>` | Merge PR (auto/squash) | `udo pr merge 42` |

## Unified collaboration terms

| Command | Code track (GitHub) | Docs/content track (WordPress terms) |
| --- | --- | --- |
| `udo submit [path] [--target]` | Create PR draft (`udo pr create`) | Submit draft (A1 stub) |
| `udo review [path] [--target] [--pr]` | Review PR (`udo pr review`) | Editorial review (A1 stub) |
| `udo approve [path] [--target] [--pr]` | Approve PR (`udo pr approve`) | Approve draft (A1 stub) |

Auto-detection defaults:

- `docs/`, `courses/`, `templates/`, `content/` => docs/content track
- everything else => code track

## WordPress terminology commands (A1 stubs)

| Command | Description |
| --- | --- |
| `udo wp sync` | WordPress sync stub (upgrade message) |
| `udo wp publish` | WordPress publish stub (upgrade message) |
| `udo wp review` | WordPress editorial review stub (upgrade message) |
| `udo wp submit` | WordPress draft submission stub (upgrade message) |
| `udo wp approve` | WordPress draft approval stub (upgrade message) |

## WordPress sync commands (A2 implementation)

| Command | Description |
| --- | --- |
| `udo wp sync run` | Run bidirectional synchronization (dry-run mode) |
| `udo wp sync status` | Show synchronization status and state |
| `udo wp sync --apply` | Apply synchronization changes (future) |

## WordPress adaptor commands (A2 implementation)

| Command | Description |
| --- | --- |
| `udo wp setup` | Configure WordPress connection and credentials |
| `udo wp status` | Check WordPress connection status with API test |
| `udo wp import [--all] [--category <cat>] [--tag <tag>] [--since <date>] [--limit <num>] [--include-media] [--dry-run]` | Import WordPress posts with filtering options |
| `udo wp export [--all] [--category <cat>] [--tag <tag>] [--since <date>] [--limit <num>] [--include-media] [--dry-run]` | Export uDos notes with filtering options |

## WordPress API commands (A2 direct access)

| Command | Description |
| --- | --- |
| `udo wp api test` | Test WordPress API connectivity |
| `udo wp api posts` | List WordPress posts from API |
| `udo wp api posts <id>` | Get specific post details |
| `udo wp api categories` | List all categories |
| `udo wp api tags` | List all tags |

## Sync (A1 stubs for WP cloud actions)

| Command | Description |
| --- | --- |
| `udo sync status` | Stub — WP cloud status is handled by uDos Universe / uDos.space |
| `udo sync pull` | Stub — WP cloud pull requires Universe / uDos.space |
| `udo sync push` | Stub — WP cloud push requires Universe / uDos.space |

> A1 still supports local publishing and normal GitHub workflows (`git push`) for open content/code.

## Workflow (A1 local, SQLite-backed)

| Command | Description | Example |
| --- | --- | --- |
| `udo workflow list` | List workflows from local SQLite | `udo workflow list` |
| `udo workflow create <name> --step 'action'` | Create workflow with one or more steps | `udo workflow create nightly --step 'shell:echo hi' --step 'spool:create'` |
| `udo workflow run <name>` | Run workflow now | `udo workflow run nightly` |
| `udo workflow schedule <name> --cron '<expr>'` | Save cron metadata | `udo workflow schedule nightly --cron '0 2 * * *'` |
| `udo workflow status <name>` | Show latest run state | `udo workflow status nightly` |
| `udo workflow logs <name>` | Show local workflow log lines | `udo workflow logs nightly` |
| `udo workflow webhook add <name> --url <url>` | Queue webhook registration for A2 | `udo workflow webhook add ingest --url https://example.com/hook` |
| `udo workflow webhook list` | A2 webhook list stub | `udo workflow webhook list` |
| `udo workflow queue list` | Queue visibility stub | `udo workflow queue list` |

## A2 bridge and server stubs

| Command | Description | Example |
| --- | --- | --- |
| `udo a2 server start` | A2 server start stub | `udo a2 server start` |
| `udo a2 server stop` | A2 server stop stub | `udo a2 server stop` |
| `udo a2 server status` | A2 server status stub | `udo a2 server status` |
| `udo a2 server logs` | A2 server logs stub | `udo a2 server logs` |
| `udo a2 server configure --port 8080` | A2 server config stub | `udo a2 server configure --port 8080` |
| `udo a2 configure --url <url> [--api-key <key>]` | Configure A2 bridge endpoint | `udo a2 configure --url https://api.example.com --api-key abc` |
| `udo a2 status` | Show A2 stub inventory and upgrade guidance | `udo a2 status` |
| `udo workflow server start` | A2-oriented workflow server start stub | `udo workflow server start` |
| `udo workflow server status` | A2-oriented workflow server status stub | `udo workflow server status` |
| `udo beacon scan` | Local discovery stub (A2/LAN future) | `udo beacon scan` |

## USXD

| Command | Description | Example |
| --- | --- | --- |
| `udo usxd list` | List **theme** packs under `templates/usxd/` | `udo usxd list` |
| `udo usxd apply <name>` | Copy theme into vault | `udo usxd apply default` |
| `udo usxd show` | Active theme metadata | `udo usxd show` |
| `udo usxd serve` | **USXD-Express** — preview ` ```usxd``` ` surfaces (live reload) | `udo usxd serve --dir ./surfaces` |
| `udo usxd export` | Export markdown surfaces (`--format html`; `svg` is `[A2 stub]`) | `udo usxd export -d ./surfaces -o ./dist --format html` |
| `udo usxd render <file>` | Render markdown USXD surface to terminal | `udo usxd render docs/surface.md --mode teletext` |
| `udo usxd edit [file]` | Preview (uses `~/vault/surfaces` when present) | `udo usxd edit` |
| `udo usxd validate <file>` | Check ` ```usxd``` ` + optional ` ```grid``` ` | `udo usxd validate ui.md` |

Tool: [`tools/usxd-express/README.md`](../../tools/usxd-express/README.md).

## OBF Grid (surface design)

| Command | Description | Example |
| --- | --- | --- |
| `udo grid render <file>` | Render ` ```grid` block to terminal (ANSI) | `udo grid render map.grid.md --mode mono` |
| `udo grid export <file> --format <f>` | `ascii`, `obf`, `svg`, `png` | `udo grid export x.md --format png -o out.png` |
| `udo grid validate <file>` | Check row/column dimensions | `udo grid validate map.grid.md` |
| `udo grid edit <file>` | Open in `$EDITOR`; creates minimal grid if new | `udo grid edit dungeon.grid.md` |
| `udo grid resize <file> --size WxH` | Resize all layers to dimensions | `udo grid resize map.grid --size 24x24` |
| `udo grid rotate <file> --degrees 90` | Rotate all layers | `udo grid rotate map.grid --degrees 90` |
| `udo grid flip <file> --horizontal` | Flip all layers horizontally (`--vertical` default) | `udo grid flip map.grid --horizontal` |
| `udo grid layer add <file> --name <name>` | Append empty layer | `udo grid layer add map.grid --name overlay` |
| `udo grid layer list <file>` | List layer indices/names | `udo grid layer list map.grid` |
| `udo grid layer show <file> --layer <n>` | Render one layer to terminal | `udo grid layer show map.grid --layer 2` |
| `udo grid layer merge <file> --layers a,b,c` | Merge selected layers (non-space overlays) | `udo grid layer merge map.grid --layers 0,1,2` |

Spec: [../specs/obf-grid-spec.md](../specs/obf-grid-spec.md) · package: `@udos/obf-grid`.

## OBF UI Blocks

| Command | Description | Example |
| --- | --- | --- |
| `udo obf render <file> [--format terminal|html]` | Render ` ```obf` ` `CARD`/`COLUMNS`/`TABS`/`ACCORDION`/`GRID` blocks | `udo obf render docs/specs/obf-ui-blocks.md --format html` |

Spec: [../specs/obf-ui-blocks.md](../specs/obf-ui-blocks.md).

## Font (CDN + cache)

| Command | Description |
| --- | --- |
| `udo font install [bundle]` | Fetch bundle from **`UDOS_CDN_BASE`** (default `https://cdn.udo.space`) or copy from **`cdn/fonts/seed/`** → `~/.cache/udos/fonts/` |
| `udo font list` | List cached files + active font |
| `udo font activate <id>` | Set active font for **`udo publish build`** / **`udo publish preview`** (injects `@font-face` into site CSS) |
| `udo font preview <id>` | Show resolved path + terminal sample strip |

See [../specs/font-system-obf.md](../specs/font-system-obf.md), repo [`cdn/README.md`](../../cdn/README.md), dev [`../../dev/cdn-cloud-setup.md`](../../dev/cdn-cloud-setup.md).

## Utility

| Command | Description |
| --- | --- |
| `udo status` | Vault path, cwd, Node version |
| `udo doctor` | Health checks |
| `udo cleanup` | Remove `~/.cache/udos` |
| `udo clean [--logs] [--dry-run]` | Clean vault-local `.local/cache`, `.local/tmp`, optional logs |
| `udo tidy` | Print sorted entries for current directory |
| `udo ping` / `udo pong` | Basic responsiveness checks |
| `udo health [--quick]` | Doctor alias (`--quick` prints healthy/unhealthy) |
| `udo version` / `udo -V` | Package version |
| `udo tour` | Quickstart walkthrough |
| `udo update` | Rebuild workspace via sonic-express |
| `udo uninstall` | Remove global `udo`; optional `--delete-vault` |
| `udo help` | Full help text |

## Docker (alpha lane, `udos-core`)

| Command | Description |
| --- | --- |
| `udo docker status` | Show docker/podman availability and selected runtime |
| `udo docker run -- <args...>` | Pass through to `docker run` (fallback `podman run`) |
| `udo docker compose -- <args...>` | Pass through to `docker compose` (fallback `podman compose`) |

## Image (experimental nanobanana lane, `udos-core`)

| Command | Description |
| --- | --- |
| `udo image styles` | List Mono preset ids (`mono_blueprint`, `mono_botanical`, `mono_chrome`, `mono_teletext`, `mono_editorial`) |
| `udo image render --prompt <text> [--style ... --aspect ... --size ...]` | Validate Mono-Core prompt constraints and print render scaffold settings (A2-alpha stub) |

## Name generator (experimental `uNameStringGen` lane, `udos-core`)

| Command | Description |
| --- | --- |
| `udo namegen "<seed>"` | Generate deterministic handle from a seed using FNV-1a + internal word lists |

## Widget (experimental USXD widget lane, `udos-core`)

| Command | Description |
| --- | --- |
| `udo widget create <name> [--lang js|ts] [--path <vault-root>]` | Create widget scaffold under `@toybox/widgets` |
| `udo widget list [--path <vault-root>]` | List `.js`/`.ts` widgets under `@toybox/widgets` |
| `udo widget test <file>` | Validate basic widget contract (`onRender` + return presence) |

## Adaptor (experimental integration lane, `udos-core`)

| Command | Description |
| --- | --- |
| `udo adaptor create <name> [--kind import|export|sync|event|widget] [--path <vault-root>]` | Create adaptor YAML scaffold under `@user/adaptors` |
| `udo adaptor list [--path <vault-root>]` | List `.adaptor.yaml` files under `@user/adaptors` |
| `udo adaptor validate <file>` | Validate baseline adaptor YAML contract (`name`, `version >= 1`, optional non-empty capabilities) |

## Trash / compost index

| Command | Description |
| --- | --- |
| `udo trash move <file>` | Move file into `.compost/objects` and index it in `.compost/index.db` |
| `udo trash restore <idOrPath> [--to <path>]` | Restore by id or original path |
| `udo trash list` | List indexed entries |
| `udo trash search <query>` | Search indexed trash entries |
| `udo trash clean [--older-than 30d] [--priority-binary] [--dry-run]` | Cleanup indexed entries |
| `udo compost index rebuild` | Rebuild index from `.compost/*` dirs |
| `udo compost index verify` | Verify index rows point to existing files |
| `udo compost index stats` | Show index totals / bytes / binary count |

Use **`udo <command> --help`** for subcommands (e.g. `udo feed export --help`).

## Output format (VA1)

Most commands print **plain text** to stdout. **`udo feed export … --json`** emits JSON lines where implemented. A single JSON envelope for every command is **not** guaranteed in VA1; treat scripting as best-effort until documented per command.

## Exit codes (VA1)

| Code | Typical meaning |
| --- | --- |
| `0` | Success |
| `1` | Error / failed check (e.g. `udo doctor`, missing vault) |

Finer codes (2–5) are **not** consistently assigned in VA1.

## Environment variables

| Variable | Role |
| --- | --- |
| `UDOS_VAULT` | Override vault root (default `~/vault`) |
| `UDOS_TEMPLATES_ROOT` | Override templates directory |
| `UDOS_CDN_BASE` | Font CDN origin (default `https://cdn.udo.space`) |
| `EDITOR` | Editor for `udo open` / `udo edit` |
| `DO_PREVIEW_PORT` | Port for `udo publish preview` (default `4173`) |

## Version history

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2026-04-14 | Initial VA1 command reference |
