# TASKS.md — Rust Core (A1) Milestone

## Dev flow (where to work)


| What                                                              | Where                                                                                                                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Planning spine (paths, single repo)                               | `[docs/family-workspace-layout.md](../docs/family-workspace-layout.md)`                                                                                  |
| Experimental integration briefs                                   | `[dev/experiments/README.md](experiments/README.md)` (linked from Alpha roadmap rows)                                                                    |
| This file                                                         | Task IDs (T001–T021), TypeScript punch list, **Alpha roadmap** table (forward queue)                                                                     |
| Process + devlog/summary                                          | `[dev/workflow/dev-summary-and-devlog.md](workflow/dev-summary-and-devlog.md)`                                                                           |
| Beta-era reconciliation backlog (historical queue)                | `[dev/BACKLOG-A1-branch.md](BACKLOG-A1-branch.md)`                                                                                                       |
| Semver alpha versioning (replaces A1/A2/A3 labels for USXD lanes) | `[docs/specs/version-mapping-a1.md](../docs/specs/version-mapping-a1.md)`, `[docs/specs/version-ladder-a1-a2.md](../docs/specs/version-ladder-a1-a2.md)` |


**Remote hygiene:** legacy standalone repos (`uDosDev`, `uDosDocs`, template forks, etc.) were removed from GitHub in favor of **this monorepo only** — do not recreate those remotes for active work.

## Status: **A1 milestone complete** (automated); **operator live test** — `[OPERATOR-LIVE-TEST-A1.md](OPERATOR-LIVE-TEST-A1.md)`; one command: `npm run verify:a1` (repo root).

## A1 branch — merge before **alpha** A1 closes (beta backlog reconciled)

**Purpose:** **A1** and **A2** are **alpha** milestones. This branch held **beta**-program items (historical v4–v5 / imported checklists) now folded into one monorepo queue; remaining rows must land **before** A1 operator sign-off. When empty (or promoted into the table below), **merge**: add evidence to `dev/devlog/` + `dev/summary/` per `[dev/workflow/dev-summary-and-devlog.md](workflow/dev-summary-and-devlog.md)`, then archive or trim `[BACKLOG-A1-branch.md](BACKLOG-A1-branch.md)`.

**FYI:** `[dev/devlog/2026-04-15-fyi-agent-rules-architecture-alpha-beta-reconciliation.md](devlog/2026-04-15-fyi-agent-rules-architecture-alpha-beta-reconciliation.md)` · **Compost map:** `[dev/workflow/COMPOST-SUPERSEDED-BETA-TO-ALPHA.md](workflow/COMPOST-SUPERSEDED-BETA-TO-ALPHA.md)`.

**Link:** `[BACKLOG-A1-branch.md](BACKLOG-A1-branch.md)` — ordered queue, sync (**uDos** only), gates, **alpha A2** pointers.

**Migration (T012 / T013):** **phase closed** — `[dev/decisions/2026-04-15-migration-phase-closure.md](decisions/2026-04-15-migration-phase-closure.md)`, intentional gaps `[dev/workflow/migration-intentional-gaps-v1.md](workflow/migration-intentional-gaps-v1.md)`. Former governance/docs trees are **absorbed** into `**dev/`** and `**docs/**` (no root `uDosDev/` / `uDosDocs/` folders). See `dev/workflow/2026-04-15-docs-migration-restart.md`, `dev/workflow/imported/2026-04-15-uDosDev-snapshot/`, `dev/roadmaps/2026-04-14-submodule-migration-round-plan.md` for history only.

## Tasks


| ID   | Task                                                                           | Priority | Status     | Assignee | ETA        |
| ---- | ------------------------------------------------------------------------------ | -------- | ---------- | -------- | ---------- |
| T001 | Create `core-rs/` crate and module scaffold                                    | P0       | done       | @cursor  | 2026-04-14 |
| T002 | Implement P0 vault commands (`init/list/open/delete/restore/search`)           | P0       | done       | @cursor  | 2026-04-14 |
| T003 | Add `udo usxd render --mode teletext                                           | mono     | wireframe` | P0       | done       |
| T004 | Add grid bridge commands (`udo grid import` / `udo grid export --format xp`)   | P0       | done       | @cursor  | 2026-04-14 |
| T005 | Add integration tests for CLI P0 flows                                         | P1       | done       | @cursor  | 2026-04-14 |
| T006 | Wire uCode runtime command surface (`udo run`, `udo fmt`)                      | P2       | done       | @cursor  | 2026-04-15 |
| T007 | Create locked decision docs for Rust/USXD/REXPaint                             | P1       | done       | @cursor  | 2026-04-14 |
| T008 | Start Milkdown OBF/USXD plugin package scaffold                                | P1       | done       | @cursor  | 2026-04-14 |
| T009 | Capture IronPad inspiration patterns (no integration/fork)                     | P1       | done       | @cursor  | 2026-04-14 |
| T010 | Add ASCII↔Teletext bridge commands in `core-rs`                                | P0       | done       | @cursor  | 2026-04-14 |
| T011 | Create widget-test harness for edit.tf + NextChat                              | P1       | done       | @cursor  | 2026-04-14 |
| T012 | Run phased migration rounds — governance into `dev/`                           | P0       | done       | @cursor  | 2026-04-15 |
| T013 | Run phased migration rounds — documentation into `docs/`                       | P0       | done       | @cursor  | 2026-04-15 |
| T014 | Add `udo ascii banner` (FIGlet external tool lane)                             | P1       | done       | @cursor  | 2026-04-15 |
| T015 | Add FIGlet->Teletext conversion support                                        | P1       | done       | @cursor  | 2026-04-15 |
| T016 | Implement FIGlet external command surface in `core-rs`                         | P1       | done       | @cursor  | 2026-04-15 |
| T017 | Implement FIGlet font management commands                                      | P1       | done       | @cursor  | 2026-04-15 |
| T018 | Implement unified MCP registry scaffold (`core-rs/src/mcp`)                    | P0       | done       | @cursor  | 2026-04-14 |
| T019 | Add `udo server` always-on control surface                                     | P0       | done       | @cursor  | 2026-04-14 |
| T020 | Implement orchestrator command surface (`mcp/agent/personality/chat/workflow`) | P0       | done       | @cursor  | 2026-04-14 |
| T021 | Implement unified Remark markdown pipeline bridge (`udo md`)                   | P0       | done       | @cursor  | 2026-04-14 |


## Task Details

### T001: `core-rs` scaffold

**Description**: Create fresh Rust backend crate to replace TypeScript core over time.

**Acceptance Criteria**:

- `core-rs/Cargo.toml` created with baseline dependencies
- `src/` contains requested module layout
- `cargo check` passes

**Dependencies**: None

**Related**: Rust core decision lane (A1)

### T002: Vault P0 command surface

**Description**: Implement local-first vault operations required for day-one CLI usage.

**Acceptance Criteria**:

- `udo init` / `udo vault init` create `content/`, `ucode/`, `.compost/`, `system/`, `@toybox/`, `@sandbox/`, `.local/`, and `content/config.md` (from seed)
- `udo list` prints vault tree
- `udo open` launches `$EDITOR`
- `udo delete` moves files to `.compost` with index
- `udo restore` restores by compost id
- `udo search` scans vault text

**Dependencies**: T001

**Related**: A1 local-first boundary

### T003: USXD render command

**Description**: Add terminal render surface for USXD JSON/YAML with mode switching.

**Acceptance Criteria**:

- `udo usxd render <file> --mode teletext|mono|wireframe` works
- USXD parser accepts JSON and YAML
- Teletext mode uses green-on-black style output

**Dependencies**: T001

**Related**: USXD-RS decision lane

### T004: Grid bridge command

**Description**: Add initial REXPaint bridge commands to import/export between `.xp` and OBF.

**Acceptance Criteria**:

- `udo grid import file.xp` writes OBF output
- `udo grid export file.obf --format xp` writes XP output
- Unsupported format values fail with explicit A1 message

**Dependencies**: T001

**Related**: REXPaint integration lane

### T005: Integration tests (core-rs/tests)

**Description**: Add CLI-level integration tests for vault, usxd, and grid command flows.

**Acceptance Criteria**:

- `vault_tests.rs` covers `init`, `list`, `delete`, `restore`, `search`
- `usxd_tests.rs` covers render mode routing
- `grid_tests.rs` verifies import/export output files

**Dependencies**: T001-T004

**Related**: `core-rs/tests/`

### T006: uCode `udo run` / `udo fmt`

**Description**: Wire the mini **uCode** runtime in `core-rs` to top-level `**udo run`** and `**udo fmt**` (clap).

**Acceptance Criteria**:

- `udo run --file <path>` reads source and executes via `UCodeRuntime`
- `udo run --eval <snippet>` runs inline uCode
- `udo fmt <path>` formats `.ucode` files (trim line ends; trailing newline); `--check` for CI-style verification
- `core-rs/tests/ucode_tests.rs` covers eval, file, fmt, fmt --check

**Dependencies**: T001 (`UCodeRuntime` in `core-rs/src/ucode/mod.rs`)

**Related**: `core-rs/src/cli/ucode.rs`, `docs/public/ucode-commands.md`

### T007: Decision docs

**Description**: Create missing decision records in `dev/decisions/`.

**Acceptance Criteria**:

- `dev/decisions/2026-04-14-rust-core.md`
- `dev/decisions/2026-04-14-usxd-rs.md`
- `dev/decisions/2026-04-14-rexpaint.md`

**Dependencies**: None

**Related**: A1 locked architecture lane

### T008: Milkdown plugin scaffold

**Description**: Start OBF/USXD plugin package under `modules/` for editor integration.

**Acceptance Criteria**:

- `modules/milkdown-plugins/` package scaffold exists
- OBF fence parse/render starter implemented
- USXD fence parse/render starter implemented

**Dependencies**: None

**Related**: Milkdown editor lane

### T012: `uDosDev` migration rounds

**Description**: Execute round-based migration from `uDosDev` into `dev` with mapping and validation gates.

**Acceptance Criteria**:

- Round plan documented in `dev/roadmaps/2026-04-14-submodule-migration-round-plan.md`
- Round 1 moved and indexed high-value docs/process assets (first batch)
- Restart assessment 2026-04-15 (fresh delta snapshot + re-entry protocol): `dev/workflow/2026-04-15-docs-migration-restart.md`
- Dry-run delta reduced to **intentional** paths — catalogued in `[dev/workflow/migration-intentional-gaps-v1.md](workflow/migration-intentional-gaps-v1.md)` (Round 4 closure)
- **Filtered** upstream compare scripted — `[dev/workflow/compare-upstream-migration-delta.sh](workflow/compare-upstream-migration-delta.sh)` (excludes `.git/`, `.compost/`, `.cursor/`, `.github/`, `node_modules/`); spot check **2026-04-15:** `uDosDev`→`dev/` **~852** lines, `uDosDocs`→`docs/` **~398** lines (rsync item lines, not file counts)
- Delete-safe checklist completed — `[dev/decisions/2026-04-14-round5-deletion-readiness-checklist.md](decisions/2026-04-14-round5-deletion-readiness-checklist.md)` + `[dev/decisions/2026-04-15-migration-phase-closure.md](decisions/2026-04-15-migration-phase-closure.md)`
- Pre-v5 **single-lane** + public notes: `[dev/workflow/imported/2026-04-15-uDosDev-snapshot/future/PRE_V5_ROADMAP_SINGLE_LANE_v1.md](workflow/imported/2026-04-15-uDosDev-snapshot/future/PRE_V5_ROADMAP_SINGLE_LANE_v1.md)`, `[dev/workflow/family-pre-v5-index.md](workflow/family-pre-v5-index.md)`, `[docs/roadmap/pre-v5-family-notes.md](../docs/roadmap/pre-v5-family-notes.md)`

**Dependencies**: migration audit decision

**Related**: `dev/decisions/2026-04-14-submodule-migration-audit.md`

### T013: `uDosDocs` migration rounds

**Description**: Execute round-based migration from `uDosDocs` into `docs` with triage of legacy/valuable content.

**Acceptance Criteria**:

- Round plan documented in `dev/roadmaps/2026-04-14-submodule-migration-round-plan.md`
- Architecture/spec/reference content triaged and migrated (first batch)
- Archive-only content mapped into `/archive/v2-reference` (target sections documented)
- Delete-safe checklist drafted (`dev/decisions/2026-04-14-round5-deletion-readiness-checklist.md`)
- **Restart 2026-04-15:** fresh assessment + delta snapshot — `dev/workflow/2026-04-15-docs-migration-restart.md`
- Round 2 / 2b triage **re-validated** for **post-submodule** workflow (canonical `**docs/`** + `**dev/**` per `2026-04-15-docs-migration-restart.md`; nested `uDosDocs/` / `uDosDev/` paths retired)
- Next promotion batch **partial:** roadmap snapshot + uDosDocs scripts import — indexed from `docs/README.md` + `dev/workflow/uDos*-migration-map.md` (2026-04-15)
- `**site/`** snapshot: `docs/contributor/migrated-round2/site/` (upstream `uDosDocs` main, 2026-04-15); index `[docs/contributor/migrated-round2/README.md](../docs/contributor/migrated-round2/README.md)`
- Knowledge bank **topic trees** → archive path (Round 2C): `~/Code/archive/v2-reference/uDosDocs/knowledge/bank/` (upstream `uDosDocs` `1208a02`, 2026-04-15); pointer `[docs/contributor/migrated-round2/knowledge/README.md](../docs/contributor/migrated-round2/knowledge/README.md)`
- **Filtered** `rsync -ani` delta **closed for phase** — remaining lines explained in `[dev/workflow/migration-intentional-gaps-v1.md](workflow/migration-intentional-gaps-v1.md)`; tool: `[dev/workflow/compare-upstream-migration-delta.sh](workflow/compare-upstream-migration-delta.sh)`; counts in `[dev/workflow/migration-progress-2026-04.md](workflow/migration-progress-2026-04.md)`

**Dependencies**: migration audit decision

**Related**: `dev/decisions/2026-04-14-submodule-migration-audit.md`

### T014: FIGlet external command lane

**Description**: Add `udo ascii banner` command that shells out to FIGlet when available.

**Acceptance Criteria**:

- `udo ascii banner "Hello" --font slant` when `figlet` is installed (`core-rs`)
- Boxed fallback when `figlet` is missing
- `udo ascii fonts list` (`showfigfonts` / `figlet -I2` / stub)

**Dependencies**: teletext bridge baseline

**Related**: `[docs/tools/figlet.md](../docs/tools/figlet.md)`

### T015: FIGlet to Teletext bridge

**Description**: Convert FIGlet (or fallback) banner lines into teletext hex streams.

**Acceptance Criteria**:

- `udo ascii banner "Title" --to-teletext` emits hex lines (`core-rs/tests/ascii_tests.rs`)
- Uses `teletext::ascii::convert_ascii_text_to_codes` per line
- Integration tests for `--to-teletext` with `PATH` empty (fallback path)

**Dependencies**: T014

**Related**: `[docs/tools/figlet.md](../docs/tools/figlet.md)`

### T016: FIGlet external command implementation

**Description**: Implement `udo ascii …` in `core-rs`, shelling out to `figlet` when available.

**Acceptance Criteria**:

- `udo ascii banner` wired in `main.rs` → `cli/ascii.rs`
- Graceful fallback when `figlet` is missing
- `--to-teletext` supported

**Dependencies**: teletext bridge baseline

**Related**: `[docs/tools/figlet.md](../docs/tools/figlet.md)`

### T017: FIGlet font management

**Description**: Font helpers for FIGlet workflow.

**Acceptance Criteria**:

- `udo ascii fonts install <name>` (A1 stub — manual `.flf` instructions)
- `udo ascii fonts preview --font <name> <text>`
- `udo ascii fonts list`

**Dependencies**: T016

**Related**: `[docs/tools/figlet.md](../docs/tools/figlet.md)`

### T018: Unified MCP scaffold

**Description**: Implement single MCP registry and transports for A1/A2 architecture.

**Acceptance Criteria**:

- `core-rs/src/mcp/registry.rs` includes unified tool registry
- stdio MCP transport implemented for A1
- HTTP MCP transport scaffold implemented for A2
- A2-only namespaces return explicit stubs

**Dependencies**: none

**Related**: `dev/decisions/2026-04-14-unified-mcp-server-architecture.md`

### T019: uDosServer controls

**Description**: Add server lifecycle command group for background operations.

**Acceptance Criteria**:

- `udo server start`
- `udo server stop`
- `udo server status`
- `udo server logs`
- daemon entrypoint scaffold exists

**Dependencies**: T018

**Related**: `core-rs/src/server/mod.rs`

### T020: Unified orchestrator command surface

**Description**: Implement orchestrator modules and CLI groups for OK Handler, Personality, Chat, Agent, and Workflow lanes.

**Acceptance Criteria**:

- `core-rs/src/orchestrator/` module set exists
- `udo mcp start|list|call` works as scaffold
- `udo agent query|hivemind|status|rankings` exists (A2 stubs)
- `udo personality list|set` exists
- `udo chat` and `udo chat --history` persist and read history
- `udo workflow list|add|queue-status|retry` exists

**Dependencies**: T018, T019

**Related**: `dev/decisions/2026-04-14-unified-orchestrator-agent-system.md`

### T021: Unified Remark markdown pipeline

**Description**: Implement remark/unified-based markdown processing via shared pipeline and CLI bridge.

**Acceptance Criteria**:

- `modules/remark-pipeline` package scaffold with required deps
- custom uDos plugin stubs for OBF/USXD/uCode/teletext
- `udo md format|lint|toc|render|frontmatter|check` command surface wired in `core-rs`
- render supports `--format html|teletext`

**Dependencies**: none

**Related**: `dev/decisions/2026-04-14-remark-unified-markdown-pipeline.md`

# A1 — TypeScript / product punch list (legacy section)

**Status:** acceptance criteria below are **met**; tracking lives with `**@udos/core`** tests and docs. For milestone closure, run `**npm run verify:a1**` and `[OPERATOR-LIVE-TEST-A1.md](OPERATOR-LIVE-TEST-A1.md)`.

## Tasks


| ID   | Task                                                        | Priority    | Status | Assignee | ETA        |
| ---- | ----------------------------------------------------------- | ----------- | ------ | -------- | ---------- |
| T001 | Implement `udo usxd render` terminal ASCII renderer         | P0          | done   | @cursor  | 2026-04-15 |
| T002 | Add explicit `udo usxd export --format html                 | png` parity | P0     | done     | @cursor    |
| T003 | Implement OBF UI renderer for `obf` blocks (A1.2 scope)     | P0          | done   | @cursor  | 2026-04-15 |
| T004 | Clarify publish/Jekyll gap and document supported subset    | P1          | done   | @cursor  | 2026-04-15 |
| T005 | Harden boundary CI checks (imports + registry validation)   | P1          | done   | @cursor  | 2026-04-15 |
| T006 | Add release/version mapping for A1.0→A1.3 ladder            | P1          | done   | @cursor  | 2026-04-15 |
| T007 | Add command-level smoke tests for github/pr/wp/collab flows | P2          | done   | @cursor  | 2026-04-15 |


## Task Details

### T001: `udo usxd render` terminal ASCII renderer

**Description**: Add a terminal renderer for USXD surfaces (header/content/status + optional grid) using markdown as source, exposed through `usxd-express render` and `udo usxd render`.

**Acceptance Criteria**:

- `usxd-express render <file.md>` prints ASCII/teletext-friendly surface in terminal
- `udo usxd render <file.md>` delegates correctly
- Works with docs/content markdown containing  ````usxd` and optional  ````grid`
- Help/docs updated

**Dependencies**: Existing `usxd-express` parser/render stack (`parse-usxd`, `extract-grid`)

**Related**: A1.2 ladder target (`docs/specs/version-ladder-a1-a2.md`)

**Notes**: Keep A1 local-only and open-box; no cloud dependency.

### T002: `udo usxd export --format` parity

**Description**: Extend export command UX to support explicit format selection (`html` now, `png` target).

**Acceptance Criteria**:

- `udo usxd export ... --format html` works
- `--format png` either implemented or explicit A1 stub with clear message
- Docs reflect exact support

**Dependencies**: T001 renderer foundation

**Related**: USXD ASCII blocks spec

### T003: OBF UI renderer (A1.2)

**Description**: Parse/render  ````obf` blocks for `COLUMNS`, `CARD`, `TABS`, `ACCORDION` into terminal and/or HTML-safe output path.

**Acceptance Criteria**:

- Parser for core OBF block primitives
- Terminal render path for at least card/columns
- Publish/build-safe transform path documented

**Dependencies**: None

**Related**: `docs/specs/obf-ui-blocks.md`

### T004: Publish/Jekyll support subset documentation

**Description**: Document exactly what A1 publish supports and what Jekyll features remain out of scope.

**Acceptance Criteria**:

- A1 publish-supported subset listed in public docs
- Jekyll/Liquid incompatibilities called out explicitly
- Guidance provided for portable markdown authoring in A1

**Dependencies**: None

**Related**: `docs/public/publishing-guide.md`

### T005: Boundary CI hardening

**Description**: Strengthen lock/boundary checks in CI to catch registry drift and forbidden cloud imports earlier.

**Acceptance Criteria**:

- Validate lock registry + boundary spec presence
- Validate required lock IDs and format
- Validate whitelist paths in registry exist
- Add stricter cloud SDK import scan in A1 core

**Dependencies**: None

**Related**: `scripts/check-a1-boundary.sh`, `.github/workflows/lock-boundary.yml`

### T006: A1 release/version mapping

**Description**: Define explicit release mapping from locked ladder stages (A1.0→A1.3) to practical semver bumps.

**Acceptance Criteria**:

- Mapping table added for A1.0/A1.1/A1.2/A1.3
- Current package alignment and bump path documented
- Specs index links to the mapping doc

**Dependencies**: None

**Related**: `docs/specs/version-ladder-a1-a2.md`, `docs/specs/version-mapping-a1.md`

### T007: Command-level smoke tests (github/pr/wp/collab)

**Description**: Add lightweight command-surface tests to prevent CLI routing regressions.

**Acceptance Criteria**:

- `github`/`pr` command groups validated via `--help`
- `wp` command path validated for A2 guidance output
- `submit docs/...` route validated to WordPress-stub path

**Dependencies**: None

**Related**: `core/test/commands-smoke.test.mjs`

---

## Alpha roadmap tracked (post-baseline scope)


| ID                           | Task                                                                   | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T-ALPHA-MCP**              | Integrate Markdownify MCP server                                       | Target lane: `v0.2.0-alpha.1+`; connect to MCP orchestrator; implement `udo import` (or equivalent) — spec: [docs/specs/markdownify-integration.md](../docs/specs/markdownify-integration.md), template: [dev/tools/markdownify-config.yaml.example](../dev/tools/markdownify-config.yaml.example). **Status: done (2026-04-16).** `core-rs` includes `udo import` + `udo import-status` via MCP registry (`markdownify.import` / `markdownify.status`), framed stdio MCP (`initialize`/`tools.list`/`tools.call`), pinned runtime bootstrap (`scripts/bootstrap-markdownify-runtime.sh`), round-start smoke (`scripts/check-mcp-stdio.sh`), and deterministic import integration coverage (`core-rs/tests/markdownify_tests.rs`). |
| **T-ALPHA-RUN**              | `udo run` / literate markdown                                          | Target lane: `v0.2.0-alpha.1+`; informed by rnmd + marki experiments — [commonmark-reference.md](../docs/specs/commonmark-reference.md), clones: [dev/toybox-experiments/README.md](toybox-experiments/README.md). **Progress (2026-04-16):** `core-rs` `udo run --file <doc.md>` executes fenced `ucode` blocks in CommonMark order with shared runtime state; polish adds support for attribute-style fence info and UTF-8 BOM-safe eval path; tests expanded in `core-rs/tests/ucode_tests.rs`.                                                                                                                                                                      |
| **T-ALPHA-VECTOR**           | Vector DB + Cloud WordPress research                                   | **Deferred to A3** (after WordPress + cloud lanes are active). Until then, default local storage remains `sqlite.db` and vector work stays research-only. See [vector-db-research.md](../docs/specs/vector-db-research.md).                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **T-ALPHA-DOCKER**           | `udo docker` patterns                                                  | Target lane: `v0.3.0-alpha.1+`; CLI/compose/SDK per [docker-integration.md](../docs/specs/docker-integration.md). **Progress (2026-04-16):** `core-rs` includes `udo docker status`, `udo docker run -- <args...>`, and `udo docker compose -- <args...>` with runtime override support (`UDO_DOCKER_RUNTIME` / `UOS_RUNTIME`), explicit invalid-override errors, and missing-args guidance; tests expanded in `core-rs/tests/docker_tests.rs`.                                                                                                                                                                                                               |
| **T-ALPHA-IMAGE-NB**         | Experimental image module (`udos-image-nanobanana`)                    | Target lane: experimental / `v0.x`; Mono Core line layer + [nano-banana-pro-mcp](https://github.com/fredporter/nano-banana-pro-mcp) fork path — brief: [dev/experiments/udos-image-nanobanana/BRIEF.md](experiments/udos-image-nanobanana/BRIEF.md). **Progress (2026-04-16):** added `core-rs` `udo image` scaffold (`styles`, `render`) with Mono Core prompt validation guards and style preset surface; tests in `core-rs/tests/image_tests.rs`.                                                                                                                                                                                                          |
| **T-ALPHA-UNAMEGEN**         | Deterministic name generator (`udos-uname-stringgen` / uNameStringGen) | Target lane: experimental / `v0.x`; FNV-1a handles + LENS/SKIN lab; concept [TomDoesTech/wu-tang-clan-name-generator](https://github.com/TomDoesTech/wu-tang-clan-name-generator) — brief: [dev/experiments/udos-uname-stringgen/BRIEF.md](experiments/udos-uname-stringgen/BRIEF.md). **Progress (2026-04-16):** added `core-rs` `udo namegen "<seed>"` deterministic CLI (FNV-1a + internal word lists) with tests in `core-rs/tests/namegen_tests.rs`.                                                                                                                                                                                                     |
| **T-ALPHA-WIDGET**           | USXD interactive widgets                                               | Target lane: `v0.1.0-alpha.1`; experiment brief: [seed/toybox/experiments/usxd-widget/BRIEF.md](../seed/toybox/experiments/usxd-widget/BRIEF.md). **Progress (2026-04-16):** added `core-rs` `udo widget create|list|test` scaffold for TS/JS file-based widgets under `@toybox/widgets`, plus integration tests in `core-rs/tests/widget_tests.rs` and command docs update in `docs/public/ucode-commands.md`.                                                                                                                                                                                                                                                                                              |
| **T-ALPHA-ADAPTORS**         | Adaptor schema + sandbox foundation                                    | Target lane: `v0.1.0-alpha.1`; experiment brief: [seed/toybox/experiments/adaptors/BRIEF.md](../seed/toybox/experiments/adaptors/BRIEF.md). **Progress (2026-04-16):** added `core-rs` `udo adaptor create|list|validate` scaffold for file-based adaptor YAML under `@user/adaptors`, with baseline schema checks and integration tests in `core-rs/tests/adaptor_tests.rs`; command docs updated in `docs/public/ucode-commands.md`.                                                                                                                                                                                                                                                                     |
| **T-ALPHA-SKIN-TAILWIND**    | Tailwind + Tailwind Plus browser surfaces                              | Target lane: `v0.5.0-alpha.1`; build browser index/demo surfaces on USXD skin tokens. **Progress (2026-04-16):** added reusable skin preset map (`ui/src/views/styles/skin-presets.ts`), skin token variants in shared view tokens (`view-tokens.css` data-skin selectors), and browser demo switcher in widget test harness (`ui/src/widget-test/index.vue`) for `default|terminal|nord|amber` validation.                                                                                                                                                                                                                                                                                               |
| **T-ALPHA-THEME-EXP**        | Theme integration experiments (isolated)                               | Pre-integration lab: NES.css / Bedstead / C64, notion.css, notion-react — `[dev/experiments/theme-integration/README.md](experiments/theme-integration/README.md)`; **not** under legacy `uDosDev/`; decouple from unrelated MCP apps                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **T-ALPHA-USXD-GO-SCAFFOLD** | `usxd-go` runtime scaffold                                             | Target lane: `v0.1.0-alpha.1`; module in `[modules/usxd-go/](../modules/usxd-go/)`; spec [usxd-go.md](../docs/specs/usxd-go.md). **Progress (2026-04-16):** added repeatable scaffold gate `scripts/check-usxd-go-scaffold.sh` (module tests + live `usxd-server` `/healthz` + `/api/usxd/state` checks), wired as `npm run verify:usxd-go`, and documented in `scripts/README.md` + `modules/usxd-go/README.md`.                                                                                                                                                                                                                                                                  |
| **T-ALPHA-STORY**            | Story format (narrative spine) + TUI + live GUI                        | Target lane: `v0.2.0-alpha.1` story JSON; engine + Bubble Tea in `[modules/usxd-go/story/](../modules/usxd-go/story/)`; demos `/demo`, `/demo/final` on `usxd-server`. **Status: done (2026-04-16).** Added repeatable story gate `scripts/check-usxd-story.sh`; aligned story runtime to panel taxonomy + keyboard hints + enter-to-continue baseline; added machine validation in `modules/usxd-go/schema/validate_story.go`; published canonical spec [`docs/specs/usxd-story-format.md`](../docs/specs/usxd-story-format.md) and JSON schema artifact [`docs/specs/usxd-story-schema.json`](../docs/specs/usxd-story-schema.json). |
| **T-ALPHA-UDO-GUI-SVC**      | Single-terminal browser surfaces                                       | **Done (baseline):** `udo gui` / `udo gui start` runs USXD-Express in background with port fallback; `udo gui status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **T-ALPHA-UOS**              | External app launcher (`uos`)                                          | `[modules/uos/](../modules/uos/)` — `udo app launch --runtime docker` / `podman` (or env `UOS_RUNTIME`); quoted argv in OBX commands; **Status: done (2026-04-16).** Added operator contract spec [`docs/specs/uos-launcher.md`](../docs/specs/uos-launcher.md), repo smoke gate `scripts/check-uos.sh`, npm hook `npm run verify:uos`, and module/script docs updates. |
| **T-ALPHA-VENTOY**           | Ventoy packaging/installer lane (**external repo**)                    | **Moved out of `uDos` scope.** Ventoy install/packaging modules belong to `sonic-screwdriver` (and family `sonic-ventoy`) repo flow; this repo consumes `sonic-express` only. Keep `distro/ventoy/` as legacy scaffold reference, not an active alpha lane here.                                                                                                                                                                                                                                                                                                                                                                                   |
