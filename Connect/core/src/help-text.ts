/** Full help for `udo help` / empty invocation — VA1 pure TypeScript (locked). */
export const VA1_HELP = `udo — uDos VA1 (Pure TypeScript)

Usage:
  udo <command> [options]

VAULT:
  udo init                 Initialize vault (full scaffold: content/, @toybox/, @sandbox/, .local/, …)
  udo vault init [path]    Same bootstrap; optional explicit vault root path
  udo list                 List vault contents
  udo open <file>          Open in $EDITOR
  udo edit <file>          Edit in terminal
  udo delete <file>        Move to .compost/
  udo restore <id>         Restore from compost
  udo search <query>       Search vault

MARKDOWN:
  udo md format <file>     Format markdown
  udo md lint <file>       Check syntax
  udo md toc <file>        Generate table of contents

FRONTMATTER:
  udo fm add <file> --tag <tag>   Add frontmatter tag
  udo fm list <file>       List frontmatter fields
  udo fm edit <file>       Edit frontmatter

TEMPLATES:
  udo template list        List templates
  udo template apply <name> Apply template
  udo template show <name> Show template

FEEDS:
  udo feed list            List feed sources/configured feeds
  udo feed view <name>     View feed items or configured feed
  udo feed show <name>     Show configured feed
  udo feed enable <name>   Enable feed (A2 stub)
  udo feed disable <name>  Disable feed (A2 stub)
  udo feed test <name> --dry-run  Inspect configured feed action
  udo feed export <name>   Export JSONL feed as JSON

SPOOLS:
  udo spool list           List spools
  udo spool info <name>    Show metadata/config
  udo spool show <name>    Show configured spool
  udo spool run <name> [--dry-run]
  udo spool run --all [--dry-run]
  udo spool status         Show last run status
  udo spool extract <name> Extract contents

PUBLISHING:
  udo publish build        Build static site
  udo publish preview      Preview locally
  udo publish status       Show status
  udo publish deploy       Deploy to GitHub Pages only (gh-pages)

GITHUB:
  udo github clone <repo>  Clone vault/repo from GitHub
  udo github pull          Pull from origin
  udo github push          Commit + push local changes
  udo github status        Git status summary
  udo github sync          Pull then push
  udo github fork [repo]   Fork repo with gh
  udo github release <tag> Create GitHub release
  udo github configure     Save github defaults
  udo issue create --title <t> [--body]
  udo issue list [--limit]
  udo pr create [--title|--body|--base]
  udo pr list [--limit]
  udo pr checkout <id>
  udo pr review <id>
  udo pr approve <id>
  udo pr merge <id>
  udo submit [path] [--target code|docs]
  udo review [path] [--target code|docs] [--pr <id>]
  udo approve [path] [--target code|docs] [--pr <id>]
  udo wp sync|publish|review (A1 stubs)

SYNC:
  udo sync status          WP cloud sync status (stub; Universe/uDos.space)
  udo sync pull            WP cloud pull (stub; Universe/uDos.space)
  udo sync push            WP cloud push (stub; Universe/uDos.space)

WORKFLOW:
  udo workflow list
  udo workflow create <name> --step 'action'
  udo workflow run <name>
  udo workflow schedule <name> --cron '0 2 * * *'
  udo workflow status <name>
  udo workflow logs <name>
  udo workflow webhook add <name> --url <url>
  udo workflow webhook list
  udo workflow queue list

A2 SERVER / BRIDGE:
  udo a2 configure --url <url> [--api-key]
  udo a2 status
  udo a2 server start|stop|status|logs
  udo a2 server configure --port 8080
  udo workflow server start|status
  udo beacon scan

USXD:
  udo usxd list            List theme packs (templates/usxd/)
  udo usxd apply <name>    Apply theme to vault
  udo usxd show            Show active theme
  udo usxd serve [--file|--dir] [--port]   USXD-Express preview (live reload)
  udo usxd export [--file|--dir] -o <dir> [--format html|svg]
                           Export markdown surfaces (svg is [A2 stub])
  udo usxd render <file> [--mode] Terminal render from markdown surface
  udo usxd edit [file]     Preview (prefers ~/vault/surfaces)
  udo usxd validate <file> Validate usxd + optional grid fences in .md

GUI:
  udo gui                  Start GUI service in background (port-managed)
  udo gui start            Explicit start (same as \`udo gui\`)
  udo gui index            Alias for \`udo gui\` (explicit "open index" wording)
  udo gui demos            Start bundled demo surfaces GUI in background
  udo gui status           Show GUI service status (pid, port, url)
  udo gui logs [-n 80]     Show GUI service log tail
  udo gui open             Open running GUI URL in browser
  udo gui stop             Stop background GUI service

ADAPTOR:
  udo adaptor validate <file>   Validate adaptor YAML/JSON against A2 baseline schema

APP (uos — requires Go):
  udo app list                  List OBX app manifests
  udo app launch <app> [args…]  Dry-run: print docker/podman line (default)

GRID (OBF — see docs/specs/obf-grid-spec.md):
  udo grid render <file> [--mode]   Render grid (ANSI)
  udo grid export <file> --format ascii|obf|…
  udo grid validate <file>          Check dimensions
  udo grid edit <file>              Open in $EDITOR (creates stub if missing)
  udo grid resize <file> --size WxH Resize grid
  udo grid rotate <file> --degrees 90|180|270
  udo grid flip <file> [--horizontal|--vertical]
  udo grid layer add <file> --name <name>
  udo grid layer list <file>
  udo grid layer show <file> --layer <index>
  udo grid layer merge <file> --layers 0,1,2

SPATIAL ALGEBRA (v1.4 — see docs/specs/v4/UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md):
  udo cell <x> <y> <z>             Navigate to voxel cell
  udo cube <x> <y>                 Render depth cube
  udo surface create <id>         Create surface from cubes
  udo surface list                 List surfaces
  udo surface show <id>            Show surface details

TOWER OF KNOWLEDGE (v1.4 — see docs/specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md):
  udo tower view                   View all slots
  udo tower list <slot>             List surfaces in slot
  udo tower move <surface> --to <slot> Move surface to slot
  udo tower publish <surface>      Publish to slot 5 (Global Knowledge Bank)

OBF UI BLOCKS:
  udo obf render <file> [--format terminal|html]
                           Render obf CARD/COLUMNS/TABS/ACCORDION/GRID blocks

FONT:
  udo font install [retro] Download/cache bundle (CDN or cdn/fonts/seed/)
  udo font list            List cache + active font
  udo font activate <name> Set active font for publish preview/build
  udo font preview <name>  Cache path + teletext strip (terminal)

TRASH / COMPOST:
  udo trash move <file>    Move file to .compost/objects + index.db
  udo trash restore <idOrPath> [--to <path>]
  udo trash list           List indexed trash entries
  udo trash search <query> Search indexed trash entries
  udo trash clean [--older-than 30d] [--priority-binary] [--dry-run]
  udo compost index rebuild|verify|stats

UTILITY:
  udo status               System status
  udo doctor               Health check
  udo cleanup              Clean cache
  udo clean [--logs] [--dry-run]   Clean vault-local .local cache/tmp/logs
  udo tidy                 Print sorted cwd entries
  udo ping / udo pong      Simple responsiveness checks
  udo health [--quick]     Health report (doctor alias)
  udo version              Show version
  udo tour                 Quickstart walkthrough
  udo update               Rebuild / relink via sonic-express
  udo uninstall            Remove global udo (see --delete-vault)
  udo help                 Show this help

VA2 adds: uCode execution, TUI, uCoin, device scanning, 3D worlds, AR portals, trading, multiplayer.
`;
