# Decision: Unified MCP + uDosServer Architecture

- Date: 2026-04-14
- Status: locked
- Scope: `core-rs/src/mcp/`, `core-rs/src/server/`, CLI server controls

## Decision

Implement a single uDos MCP server surface in `core-rs` that supports:

- A1 stdio mode for local command-driven use
- A2 HTTP mode for always-on external tool access

Use one registry to expose vault/feed/spool/publish/grid/usxd/diagram/image namespaces, with A2-first lanes (`sync`, `apple`, `agent`, `webhook`, `actions`) as stubs where runtime is not yet implemented.

## A1 Implemented Scaffold

- `core-rs/src/mcp/registry.rs` tool registry + handlers
- `core-rs/src/mcp/server.rs` stdio transport + minimal HTTP JSON-RPC transport
- `core-rs/src/server/mod.rs` background process controls and config loading
- `udo server start|stop|status|logs|mcp-stdio` command surface

## A2 Direction (stubbed)

- HTTP endpoint on configured port
- webhook/sync/actions integration lanes as staged stubs
- server config in `~/.config/udos/server.yaml`

## Notes

- FIGlet routing is wired through MCP tool methods (`diagram.banner`, `diagram.fonts.list`).
- Non-implemented methods return explicit A1 scaffold/stub responses.
