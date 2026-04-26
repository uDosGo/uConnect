# Shell MCP Consumption

`uDOS-shell` consumes MCP contracts from `uDOS-core` and exposes them through
operator-facing shell surfaces.

## Ownership Split

- Core owns MCP contract semantics
- Shell owns interactive invocation and presentation
- managed network execution stays outside Shell

## Validation Path

From repo root:

```bash
npm install
npm run build
bash scripts/run-shell-checks.sh
```

Inspect the sibling Core MCP contract when needed:

```bash
cat ../uDOS-core/contracts/mcp-tool-contract.json | head -60
cat ../uDOS-core/schemas/mcp-tool-contract.schema.json | head -60
```

## Operator Flow

1. Launch the shell TUI with `npm run go:run`.
2. Inspect help and command-palette paths.
3. Keep contract changes in Core and re-run shell checks after updates.

## Wizard online checks

- Runbook (start order, env vars, offline vs live): **`docs/wizard-shell-operator-runbook.md`**
- HTTP smoke (Wizard must be listening): **`scripts/smoke-wizard-http.sh`**
- Offline routing + illustrative JSON: `go run ./cmd/feature-walk -json`

## Rule

Shell does not redefine MCP schemas and does not own provider or network policy.
