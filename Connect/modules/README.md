# uDosConnect — `modules/`

**A1 rule:** in-repo **npm packages** (plain folders — **not** Git submodules). They participate in the **root npm workspace** (`package.json` at repo root) with a **single hoisted `node_modules/`**.

## Shared (core + sonic-express)

| Package | Role |
| --- | --- |
| [`shared-types/`](shared-types/) | Shared TypeScript types (`SemverParts`, …) |
| [`shared-utils/`](shared-utils/) | Shared helpers (`parseSemver`, …); depends on `shared-types` |
| [`obf-grid/`](obf-grid/) | **OBF Grid** — parse ` ```grid` fences, terminal render; used by **`udo grid`** (surface design, `--public`) |

## A1 packages (TS stubs — port from uDosGo)

| Package | Role |
| --- | --- |
| [`vault-manager/`](vault-manager/) | Vault paths and table helpers |
| [`feed-engine/`](feed-engine/) | Feed ingestion and pipeline |
| [`spool-archiver/`](spool-archiver/) | Spool / JSONL / task push |
| [`publish-gateway/`](publish-gateway/) | GitHub / static publish |
| [`usxd-renderer/`](usxd-renderer/) | USXD validation and emit |

## Other in-tree modules

| Module | Version | Role |
| --- | --- | --- |
| [`ucoin/`](ucoin/) | **1.0.0.0** (spec) | uCoin ledger — barter default; implementation → [`tools/ucoin-ledger/`](../tools/ucoin-ledger/) |
| [`udos-db-schema/`](udos-db-schema/) | **v1.0** (DDL) | T1–T5 SQL — [`MIGRATION.md`](udos-db-schema/MIGRATION.md); init: [`scripts/init-udos-sqlite.sh`](../scripts/init-udos-sqlite.sh) |
| [`udos-local-llm/`](udos-local-llm/) | (Python) | Ollama bridge — optional |
| [`udos-template/`](udos-template/) | — | Templates |

**Historical note:** older README text mentioned extracting modules to separate remotes; **A1** keeps everything in this repo unless a later policy says otherwise.

## Planned: uCode `USE` and npm modules

Future uCode may support a **`USE "package-name"`** declaration: the runtime checks **`node_modules`**, prompts before **`npm install`**, and refuses silent installs (security / disk control). VA1 does not include a uCode parser or auto-installer yet.
