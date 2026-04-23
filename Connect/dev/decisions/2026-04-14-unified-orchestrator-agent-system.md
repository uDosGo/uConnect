# Decision: Unified Orchestrator & Agent System

- Date: 2026-04-14
- Status: locked
- Scope: `core-rs/src/orchestrator/`, CLI command surface for mcp/agent/personality/chat/workflow

## Decision

Adopt a single orchestrator architecture with:

- OK Handler (A1 core MCP router),
- Personality Engine (A1),
- Workflow Manager (A1 scaffold),
- Chat integration lane (A1 scaffold),
- Hivemind multi-agent orchestration (A2 stub).

## Implemented in this pass

- `core-rs/src/orchestrator/{ok_handler,hivemind,personality,workflow,chat}.rs`
- CLI groups:
  - `udo mcp ...`
  - `udo agent ...`
  - `udo personality ...`
  - `udo chat ...`
  - `udo workflow ...`

## A1 vs A2 split

- A1 active:
  - tool list/call plumbing through OK Handler
  - personality list/set + chat history persistence
  - workflow file-based schedule scaffold
- A2 deferred stubs:
  - hivemind provider execution
  - quality synthesis routing
  - HTTP/SSE-first agent execution surfaces

## Notes

- Chat history persists to `~/.cache/udos/chat/history.jsonl`.
- Workflow config persists to `~/.config/udos/workflow.yaml`.
