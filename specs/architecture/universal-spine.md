# Universal Spine Specification

## Root Directory Structure

Every project in the Sonic Family follows this structure:

```
project-root/
├── src/                    # Source code
│   ├── core/               # Essential logic
│   ├── commands/           # CLI commands
│   ├── services/           # External services (Mastra, Sonic)
│   └── types/              # TypeScript/Go types
├── dev/                    # Development experiments
│   ├── experiments/        # Stubs, prototypes
│   └── scratch/            # Throwaway code
├── tests/                  # Unit and integration tests
├── docs/                   # Documentation
├── scripts/                # Automation scripts
├── .github/workflows/      # CI/CD
├── package.json (or go.mod)
├── Makefile
└── README.md
```

## Environment Variables

All projects use:

| Variable | Purpose | Default |
|----------|---------|---------|
| `UDOS_VAULT` | Document vault path | `~/vault` |
| `UDOS_CODE` | Source code path | `~/code-vault` |
| `UDOS_STATE` | Runtime state | `~/.local/udos` |
| `SONIC_SOCKET` | Sonic daemon socket | `/run/user/1000/sonic.sock` |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Missing dependency |
| 3 | Permission denied |
| 4 | Timeout |
| 5 | Not found |
| 6 | Invalid input |
| 7 | Configuration error |

## Logging

All projects use structured logging (JSON lines):

```json
{"level":"info","time":"2025-04-20T10:00:00Z","msg":"Container started","game":"doom"}
```

Logs go to `~/.local/share/<project>/logs/` with rotation (10MB, 7 days).