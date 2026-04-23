# A1 completion checklist (final)

**Status:** Operator-test ready (gate passed)  
**Date:** 2026-04-15  
**Purpose:** Complete all A1 deliverables before A2 begins.

**Status legend:** **Done** — landed in repo · **Partial** — spec/template only or subset · **Deferred** — moved out of A1 closure scope.

**Related spec (feeds/spool model):** [docs/specs/feeds-and-spool.md](../docs/specs/feeds-and-spool.md)  
**Examples:** [tools/feeds.yaml.example](tools/feeds.yaml.example), [tools/spools.yaml.example](tools/spools.yaml.example)

---

## Part 1: Core CLI and code

### 1.1 CLI rename (`do` → `udo`)

| Task | Status | Notes |
| --- | --- | --- |
| Replace `do` with `udo` in code and docs | Done | Ongoing `grep` hygiene for false positives (`doctor`, uCode `DO`, etc.) |
| `core/bin/udo.mjs` (no `do.mjs`) | Done | |
| `launcher/udos.command` | Done | |
| Shell scripts under `scripts/` | Done | Re-verify when adding scripts |
| `udo --version` / `udo --help` | Done | |

### 1.2 Rust dead code warnings

| Task | Status | Notes |
| --- | --- | --- |
| `#![allow(dead_code)]` in `core-rs/src/main.rs` | Done | Binary crate; no `lib.rs` |
| `cargo build` without dead_code spam | Done | Other warning kinds may still appear |

---

## Part 2: Compost system (implemented baseline)

### 2.1 Compost foundation

| Task | Status | Notes |
| --- | --- | --- |
| `.compost/` with `objects/`, `versions/`, `imports/` | Done | Created/maintained by trash lane + index helpers |
| `.compost/` in `.gitignore` templates | Partial | Vault root `.gitignore` from `udo init` / `udo vault init` includes `.compost/` |
| `index.db` SQLite schema | Done | `core/src/actions/trash.ts` (`node:sqlite`) |
| `is_binary` for cleanup priority | Done | Extension-based classification in index rows |

### 2.2 Compost index schema (target)

```sql
CREATE TABLE compost_entries (
    id TEXT PRIMARY KEY,
    original_path TEXT NOT NULL,
    compost_path TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER,
    hash TEXT,
    is_binary INTEGER DEFAULT 0,
    restored_at TEXT,
    deleted_at TEXT
);

CREATE TABLE version_chain (
    file_path TEXT NOT NULL,
    version_timestamp TEXT NOT NULL,
    compost_id TEXT NOT NULL,
    is_current BOOLEAN DEFAULT 0,
    PRIMARY KEY (file_path, version_timestamp)
);

CREATE TABLE import_records (
    original_file TEXT NOT NULL,
    converted_to TEXT NOT NULL,
    compost_id TEXT NOT NULL,
    imported_at TEXT NOT NULL
);

CREATE INDEX idx_original_path ON compost_entries(original_path);
CREATE INDEX idx_timestamp ON compost_entries(timestamp);
CREATE INDEX idx_is_binary ON compost_entries(is_binary);
```

### 2.3 Compost / trash commands (target)

| Command | Status | Notes |
| --- | --- | --- |
| `udo trash move <file>` | Done | New command group (`trash move/restore/list/search/clean`) |
| `udo trash restore/list/search` | Done | |
| `udo trash clean --older-than … --priority-binary [--dry-run]` | Done | |
| `udo compost index rebuild|verify|stats` | Done | |

---

## Part 3: Feed system (implemented baseline)

| Task | Status | Notes |
| --- | --- | --- |
| `.local/feeds.yaml` schema + example | Partial | Example: [tools/feeds.yaml.example](tools/feeds.yaml.example) |
| Parse and validate | Done | `.local/feeds.yaml` parsed with `yaml` package |
| `udo feed list` / `show` / `test --dry-run` | Done | Also keeps legacy JSONL list/view/export |
| `udo feed enable` / `disable` | Done | Explicit A2 stubs with actionable output |

---

## Part 4: Spool system (implemented baseline)

| Task | Status | Notes |
| --- | --- | --- |
| `.local/spools.yaml` schema + example | Partial | Example: [tools/spools.yaml.example](tools/spools.yaml.example) |
| Parse and validate | Done | `.local/spools.yaml` parsed with `yaml` package |
| `udo spool list` / `show` / `run` / `run --all` / `status` | Done | `info`/`extract` retained for compatibility |

### 4.1 Text processors (A1 target)

| Processor | Status |
| --- | --- |
| `condense` | Done |
| `dedupe-sections` | Done |
| `summarize` | Done |
| `dedupe-list-items` | Done |

---

## Part 5: Clean / tidy / health (implemented baseline)

| Command | Status |
| --- | --- |
| `udo clean` (+ `--logs`, `--dry-run`) | Done |
| `udo tidy` | Done |
| `udo ping` / `udo pong` | Done |
| `udo health` / `udo health --quick` | Done |

---

## Part 6: Markdownify integration

| Task | Status | Notes |
| --- | --- | --- |
| `vendor/markdownify-mcp/` complete | Partial | [vendor/markdownify-mcp/README.md](../vendor/markdownify-mcp/README.md) placeholder |
| [docs/specs/markdownify-integration.md](../docs/specs/markdownify-integration.md) | Done | |
| [dev/tools/markdownify-config.yaml.example](../dev/tools/markdownify-config.yaml.example) | Done | |
| Import flow documented | Partial | Spec points A2 + T-A2-MCP |

---

## Part 7: Vault workspaces foundation

| Task | Status | Notes |
| --- | --- | --- |
| [docs/specs/vault-workspaces.md](../docs/specs/vault-workspaces.md) | Done | |
| `udo init` / `udo vault init` → `@toybox/`, `@sandbox/`, `.local/`, `state.db` placeholder | Done | [`core/src/actions/vault.ts`](../core/src/actions/vault.ts) |

---

## Part 8: Documentation

| Task | Status | Notes |
| --- | --- | --- |
| Root `README.md` — `udo` | Done | Re-verify on edits |
| `docs/README.md` — spec links | Done | Includes vault + markdownify |
| `CONTRIBUTING.md` — `udo` | Done | |
| `dev/TASKS.md` — T-A2-MCP | Done | |
| This checklist | Done | |
| [docs/specs/feeds-and-spool.md](../docs/specs/feeds-and-spool.md) | Done | Refined feeds/spool spec |
| [docs/specs/commonmark-reference.md](../docs/specs/commonmark-reference.md) | Done | |
| [docs/specs/docker-integration.md](../docs/specs/docker-integration.md) | Done | |
| [docs/specs/vector-db-research.md](../docs/specs/vector-db-research.md) | Done | Stub until Foam findings |
| `@toybox` seed + `dev/toybox-experiments/` | Done | `seed/toybox/` copied on init; optional clones (see README) |
| `dev/TASKS.md` T-A2-RUN, T-A3-VECTOR, T-A2-DOCKER | Done | |

### Active experiments (priority)

| Task | Status | Notes |
| --- | --- | --- |
| rnmd + marki clones | Partial | In-repo: [dev/toybox-experiments](toybox-experiments/README.md); **rnmd** URL: `markuspeitl/rnmd` (not `rnmd/rnmd`) |
| Foam clone | Partial | Cloned under `dev/toybox-experiments/foam/foam` (gitignored) |
| Findings markdown | Partial | Fill `findings.md` in vault or repo mirror |

---

## Part 9: Verification

### Current gate (implemented today)

| Check | Command | Expected |
| --- | --- | --- |
| Workspace tests | `npm run verify:a1` | Exit 0 |
| Shakedown | `./scripts/shakedown.sh` | Exit 0 |
| Vault scaffold | `udo vault init /tmp/…` | `@toybox`, `@sandbox`, `.local/` present |
| Rust build | `cd core-rs && cargo build` | Success |

### Operator test record (latest)

- Timestamp: `2026-04-15 16:48 AEST`
- Git SHA: `12a3a59`
- `npm run verify:a1`: pass
- Manual smoke: `udo help`, `udo doctor`, `udo tour`, `cargo run -- --help`, `cargo run -- init --path /tmp/udos-vault-smoke-test`: pass

### After Parts 2–5 ship (target)

| Check | Command | Expected |
| --- | --- | --- |
| No stray `do` CLI | `grep` (review hits) | No CLI `do` |
| Compost / trash | `udo trash` / `index.db` | Per Part 2 |
| Feeds / spools | `udo feed …`, `udo spool …` | Per Parts 3–4 |
| Clean / health | `udo clean`, `udo health` | Per Part 5 |

---

## Part 10: Deferred to A2 (not this closure)

| Item | Reason |
| --- | --- |
| Full feed watchers | A2 |
| Spool async + cron | A2 |
| LLM compression | A2 |
| Network RSS / webhooks | A3+ |
| FIGlet lane T014–T017 | Lower priority |
| uCode depth T006 | Lower priority |
| VA2 Go tools | Explicit defer |
| Punch-list acceptance | Ceremony |
| Full Markdownify MCP | T-A2-MCP |
| Full CHASIS SKIN/LENS behavior | A3 |
| CHASIS curated library commands (`list-available`, `install`) | A2 |
| CHASIS curated catalog (`modules/chasis/library/index.yaml`) | A2 |
| CHASIS curated target pack (express, fastapi, nethack, elite, wordpress) | A3 |
| Widget runtime/API implementation (`udo widget …`) | A2 |
| Curated widget registry and plugin ecosystem | A3 |
| A2 execution start | Requires explicit operator permission after A1 operator check |

---

## Part 11: Suggested execution order (Cursor)

1. **Toybox experiments first** — maintain `@toybox/experiments/manifest.yaml` (seed: `seed/toybox/experiments/manifest.yaml`, copied into the vault by `udo init` / `udo vault init`). Clone or refresh **rnmd**, **marki**, and **foam** under `@toybox/experiments/`. Treat **`@toybox/experiments/usxd-widget/BRIEF.md`**, **`@toybox/experiments/chasis/BRIEF.md`**, and **`@toybox/experiments/adaptors/BRIEF.md`** as testable experiment specs before A2/A3; use **`@toybox/experiments/adaptors/manifest.yaml`** for the three adaptor probes (GitHub, WordPress, Docker).  
2. **CHASIS A1 prototype stubs** — implement in `dev/experiments/chasis/`, document and stub command surface (`udo chasis init|list|start|stop|logs|remove`, `udo chasis adaptor edit`, `udo surface open`) and keep SKIN/LENS at env-var-only level (`UDOS_SKIN`/`UDOS_THEME`, `UDOS_LENS`) with full behavior deferred to A3.  
3. **Hygiene** — `do`/`udo` grep; keep tests green.  
4. **Compost** — schema + `index.db` + `udo trash` lane (reconcile with `delete`).  
5. **Feeds** — load `.local/feeds.yaml`; stubs + `test --dry-run`.  
6. **Spools** — load `.local/spools.yaml`; sync processors.  
7. **Clean / health** — small command group.  
8. **Markdownify** — vendor pin when ready (T-A2-MCP).  
9. **Docs** — command tables + [public/ucode-commands.md](../docs/public/ucode-commands.md).  
10. **Verify** — `npm run verify:a1`.  
11. **Git** — operator `commit` / tag `a1-complete` when satisfied.

---

## Part 12: Sign-off

| Role | Approval | Date |
| --- | --- | --- |
| Cursor | ________ | |
| Human | ________ | |

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-04-15 | Initial final checklist |
| 2026-04-15 | Integrated feeds/spool spec as `docs/specs/feeds-and-spool.md`; examples under `dev/tools/`; status vs repo |
| 2026-04-15 | Executed Part 11 steps 2–5: hygiene + trash/index + feed config/stubs + spool baseline processors + clean/tidy/health commands |
| 2026-04-15 | Expanded `@toybox` experiment briefs (USXD widgets, adaptors + adaptor catalog); execution order Part 11 step 1 updated |
| 2026-04-15 | Added CHASIS experiment brief + test-project matrix; execution order now includes CHASIS command stubs and SKIN/LENS env-var-only A1 scope |
| 2026-04-15 | Scaffolded `dev/experiments/chasis/` bootstrap CLI, templates, tests, and promotion doc; added sibling placeholders for winboat/retroarch |
| 2026-04-15 | CHASIS storage hardened to central SQLite (`~/.local/share/chasis/chasis.db`) + repo/adaptor dirs; operator check runbook updated; A2 hold gate made explicit |
| 2026-04-15 | CHASIS charter amended to curated-library-first model; `init --unsupported` positioned as advanced path; A2/A3 impacts documented |
| 2026-04-15 | Widgets charter simplified (TS/JS-only, returns USXD, file-based); added `dev/experiments/widgets/` docs + promotion criteria (A2 hold) |
| 2026-04-15 | Added design references (`docs/themes/nord.md`, `docs/design/material-design-notes.md`) and `docs/specs/usxd-go.md` draft + module placeholder (`modules/usxd-go/README.md`) |
| 2026-04-15 | A1 operator test executed (pass); Parts 2–5 marked deferred (A2+) to reflect closure scope |
| 2026-04-17 | Updated vendor symlink setup to `~/vendor/` and added `UDOS_VENDOR` environment variable support. |
| 2026-04-17 | Noted future transition of `~/Code/uDos/` to `~/code-vault/uDos/`. |
