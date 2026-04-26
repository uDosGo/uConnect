# Wizard + Shell — operator runbook

**Goal:** start **`uDOS-wizard`**, confirm HTTP probes, then use **`uDOS-shell`** (Go TUI) against the same host.

## 1. Environment

| Variable | Meaning | Typical value |
| --- | --- | --- |
| `UDOS_WIZARD_HOST` | Wizard bind address | `127.0.0.1` |
| `UDOS_WIZARD_PORT` | Wizard HTTP port | `8787` (see `uDOS-wizard/docs/first-launch-quickstart.md`) |

Shell reads these when invoking live Wizard/MCP paths (see `uDOS-shell` Go TUI and `examples/basic-ucode-session.md`).

## 2. Start order

1. **Wizard** — run the service from **`uDOS-wizard`** per that repo’s quickstart (venv + `uvicorn` / documented launcher).
2. **Smoke HTTP** — from **`uDOS-shell`** repo root:

   ```bash
   bash scripts/smoke-wizard-http.sh
   ```

3. **Shell TUI** — from **`uDOS-shell`**:

   ```bash
   npm ci   # once
   npm run go:run
   ```

## 3. Offline vs live checks

| Artifact | Network | Use |
| --- | --- | --- |
| `go run ./cmd/feature-walk` | None | Human routing demo |
| `go run ./cmd/feature-walk -json` | None | Preview + **illustrative** JSON samples |
| `go run ./cmd/feature-walk -compact` | None | One-line stable routing lines |
| `bash scripts/smoke-wizard-http.sh` | **Yes** (local Wizard) | Proves `GET /` and `GET /mcp/tools` |

## 4. Wizard contract tests (CI)

**`uDOS-wizard`** `tests/test_api_contracts.py` exercises `/`, `/mcp/tools`, MCP invoke, and JSON-RPC `tools/list`. **`scripts/run-wizard-checks.sh`** runs them on every validate workflow.

## 5. Family smoke (optional)

From **`uDOS-dev`** with sibling checkouts:

```bash
bash scripts/smoke-wizard-shell.sh
```

This delegates to **`uDOS-shell/scripts/smoke-wizard-http.sh`** (Wizard must already be running).

## Related

- `uDOS-wizard/docs/health-mcp-operator-probe.md`
- `docs/mcp-consumption.md`
- `QUICKSTART.md`
