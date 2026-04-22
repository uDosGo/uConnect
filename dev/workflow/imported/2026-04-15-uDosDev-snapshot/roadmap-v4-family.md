# Roadmap — uDos v4 family (cross-repo)

**Monorepo note (uDos):** Paths like `../TASKS.md`, `docs/specs/...`, and `~/Code/uDos/uDosDev` refer to **historical uDosDev layout**. For **canonical links in this repo**, use [`../../family-pre-v5-index.md`](../../family-pre-v5-index.md) and [`docs/roadmap/pre-v5-family-notes.md`](../../../../docs/roadmap/pre-v5-family-notes.md).

**Role:** One-page spine for **v4** work that spans **uDosGo**, **uDos**, **UniversalSurfaceXD**, **Macdown (Syncdown-app)**, and **Sonic**.  
**Execution:** Task [`../TASKS.md`](../TASKS.md); per-repo roadmaps stay in each repository.

### v4.6+ integration tranche — **closed (2026-04)**

The cross-repo **v4.6+** backlog (feeds, operators, spatial layers, degrade/image CLI, dev-log → uFeedThru, TASKS/GitHub → spool) is **complete** and recorded in **[`docs/future/uDos-v4.6-plus-roadmap-family-closure.md`](future/uDos-v4.6-plus-roadmap-family-closure.md)**. Planning detail and P2 deferrals remain in **uDosGo** [`docs/dev/CURSOR_PRECURSOR_LOADOUT_v4.6_plus.md`](../../../apps/uDosGo/docs/dev/CURSOR_PRECURSOR_LOADOUT_v4.6_plus.md).

### Pre-v5 (v4.5.1 → v4.6) — active execution

**Roadmap + work rounds (locked process):** [`docs/future/PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md`](future/PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md) (**v1.7.0**) — bundles **Tower of Knowledge**, **spatial algebra v1.2**, **uCell ↔ voxel mapping**, **complete master v12.0** (physical/display narrative), WordPress **two-gates** / **wpmudev-agent** checklists, **PRE5-R01–R07** batches with task-id prefixes, and **§2** → **`UDOS_STREAMLINED_OPS_UNIFIED_UI_LOCKED_v1`**, **`UDOS_DOCKER_STRATEGY_LOCKED_v1`**, **`UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1`**, **`UDOS_USXD_WIREFRAME_SHELL_ALL_APPS_LOCKED_ADDENDUM_v1`**, **`UDOS_MULTI_DEVICE_VAULT_ARCHITECTURE_LOCKED_v1`**, **`UDOS_PRIVACY_SCRUBBING_CONTENT_INJECTION_LOCKED_v1`**, **`UDOS_INFORMATION_COMPRESSION_AND_ARCHIVAL_LOCKED_ADDENDUM_v1`** (browser ThinUI optional).

**New locked specs (index):** [`docs/specs/v4/README.md`](specs/v4/README.md) — filter for **UDOS_SPATIAL_ALGEBRA**, **UDOS_UCELL_VOXEL_MAPPING**, **UDOS_TOWER_OF_KNOWLEDGE**; **COMPLETE** spec includes **Surface vs OS** naming reconciliation.

### PRE-v5 & v5 — UI / grid / USVG / physical (locked work brief)

**Current execution (flat 2D grid, USVG, uGridComposer PRE-v5):** **[`docs/future/UDOS_PRE_V5_AND_V5_WORK_BRIEF_LOCKED.md`](future/UDOS_PRE_V5_AND_V5_WORK_BRIEF_LOCKED.md)** — **Part 1** — 2D map layers, **UniversalSketchSVG** pipeline, **uGridComposer** modes (pixel / character / sprite / emoji / grid), 16-color palette, seed/world data, import/export with USVG; milestone checklist §3.

**Next program (v5 — depth + physical, after family v5 lock):** same file — **Part 2** — Z-depth (6 layers per cell), digital ↔ **uCube**, Lego prototyping, **teleport --v5** / 3D print, **uGridComposer** 3D mode; **Part 3** — v5 checklist. **Preview-only** until promoted; does not override **spatial algebra** / **uCell** economics without a merge review. **Part 2 *Consideration* (roadmap):** optional **24×(≤24) px** variable sub-cell, **2:3 teletext** semantics preserved, **[Monaspace](https://github.com/githubnext/monaspace)** layout review, and implications for **2:3×6 → 6×6×6** cube mapping — before full 3D cube implementation.

**Workspace:** open **`~/Code/UI-dev.code-workspace`** for **uDos**, **uDosGo**, **UniversalSurfaceXD**, **UniversalSketchSVG**, **nano-banana-pro-mcp**, **uNameStringGen**, **uGridComposer** (see [`WORKSPACES.md`](../../../WORKSPACES.md) at `~/Code`).

---

## Workspace setup (~/Code/)

| Step | Action |
| --- | --- |
| **1** | **Sonic:** open `~/Code/SonicScrewdriver/SonicScrewdriver.code-workspace` — roots: **SonicScrewdriver**, **`../Ventoy`** (**`fredporter/Ventoy`**), **`../uDos/uDosDev`**. **`~/Code/cursor-master.code-workspace`** loads all `~/Code` git repos. |
| **2** | **Macdown:** open `~/Code/Macdown.code-workspace` (native app + USXD + docs). |
| **3** | **USXD lab:** open `UniversalSurfaceXD/UniversalSurfaceXD-v4.siblings.code-workspace` (paths aligned to `~/Code/`). |
| **4** | **Full family:** `~/Code/uDosFamily.code-workspace` or `uDos.code-workspace` (includes `../uDosGo` where listed). |

---

## Canonical v4 specs

**[`docs/specs/v4/README.md`](specs/v4/README.md)** — copied from Obsidian; **[`docs/specs/v4/DECISIONS-2026-04_v4.md`](specs/v4/DECISIONS-2026-04_v4.md)** — locked decisions (Sonic, USXD, Shell, Macdown naming). **MCP (full family):** [`specs/v4/INTEGRATION_v4_mcp-family-full.md`](specs/v4/INTEGRATION_v4_mcp-family-full.md) — uDosGo Host, uChatDown client, governance here. **Versioned execution (4.2.0–4.9.9):** [`future/uDos-v4-execution-plan-versioned-moves.md`](future/uDos-v4-execution-plan-versioned-moves.md).

**Round A — core architecture (locked):** **[`docs/specs/v4/ROUND_A_CORE_ARCHITECTURE_v4.md`](specs/v4/ROUND_A_CORE_ARCHITECTURE_v4.md)** — **uDosGo** reference implementation, **uDos** governance-only boundary, **vault** as shared state (`.md` / `.fdx`); dev process alignment.

**Round B — product boundaries (locked):** **[`docs/specs/v4/ROUND_B_PRODUCT_BOUNDARIES_v4.md`](specs/v4/ROUND_B_PRODUCT_BOUNDARIES_v4.md)** — **Linkdown Core** first; **uMacDown** (Apple-native); **uChatDown** (chat IDE); **uFeedThru** (feed engine). Sibling repos — not **uDosGo** runtime code.

**Round C — physical layer (locked):** **[`docs/specs/v4/ROUND_C_PHYSICAL_LAYER_v4.md`](specs/v4/ROUND_C_PHYSICAL_LAYER_v4.md)** — **uRing** commercial matrix + mechanical diagrams, **DIY** NFC + **SonicScrewdriver**, **LEGO uNode** stub (**v4.1**); pairs with **`SPATIAL_STORAGE_ECOSYSTEM_v1`**.

**Round D — publishing and graphics (locked):** **[`docs/specs/v4/ROUND_D_PUBLISHING_GRAPHICS_v4.md`](specs/v4/ROUND_D_PUBLISHING_GRAPHICS_v4.md)** — **uDosPublish** (media, email, Apple Mail/tags), **UniversalVectorIL** implementation + **`uvil`** CLI vocabulary, **Classic Modern** tokens; pairs with **`UNIVERSAL_VECTOR_IL_UVIL_v1`**.

**Round E — development process (locked):** **[`docs/specs/v4/ROUND_E_DEVELOPMENT_PROCESS_v4.md`](specs/v4/ROUND_E_DEVELOPMENT_PROCESS_v4.md)** — checklists, **`uDos/scripts/shakedown.sh`**, Task surfaces at monorepo + submodule roots.

**Round F — roadmap (locked):** **[`docs/specs/v4/ROUND_F_ROADMAP_v4.md`](specs/v4/ROUND_F_ROADMAP_v4.md)** — parallel **A–E** tracks (uDosGo, Linkdown, Macdown, Chatdown/uFeedThru, uRing), **alpha** archive strategy, **v5+** deferrals; complements this spine and the consolidated execution plan.

**Spatial and storage ecosystem (locked):** **[`docs/specs/v4/SPATIAL_STORAGE_ECOSYSTEM_v1.md`](specs/v4/SPATIAL_STORAGE_ECOSYSTEM_v1.md)** — **uCell** (storage accounting), **uTile** / **uGrid** (layered coordinates + optional QR payload model), **uCoin** (base-rate convention), **uRing** (device matrix + DIY NFC). Complements grid geometry in **`uDos-Grid-Spec-v4-2-1.md`**; informs **v4.4.0** spatial / map work in **[`docs/future/uDos-v4-rounds-consolidated-execution-plan.md`](future/uDos-v4-rounds-consolidated-execution-plan.md)**.

**Spatial algebra + billing (locked, pre-v5):** **[`docs/specs/v4/UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md`](specs/v4/UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md)** — **1 QR = 1 voxel**, **2×3** cells, depth **cube**, binder chain; **[`docs/specs/v4/UDOS_UCELL_VOXEL_MAPPING_v1.md`](specs/v4/UDOS_UCELL_VOXEL_MAPPING_v1.md)** — uCell ↔ voxel for tariffs.

**Tower of Knowledge (locked, pre-v5):** **[`docs/specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md`](specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md)** — slots **0–7**, publication and privacy; **Global Knowledge Bank** = **slot 5**.

**Spatial hosting / cloud fallback (locked):** **[`docs/specs/v4/SPATIAL_HOSTING_USPACE_CLOUD_FALLBACK_v1.md`](specs/v4/SPATIAL_HOSTING_USPACE_CLOUD_FALLBACK_v1.md)** — **uSpace** cloud fallback plans (free through enterprise), view limits, overage rule, bundled package examples, illustrative **`space.publish`** / **`space.cloud`** `POKE` lines. Uses **uCoin** rates from **`SPATIAL_STORAGE_ECOSYSTEM_v1`**.

**Unified user data (locked):** **[`docs/specs/v4/UNIFIED_DATA_SCHEMA_WP_HUBSPOT_uDOS_v1.md`](specs/v4/UNIFIED_DATA_SCHEMA_WP_HUBSPOT_uDOS_v1.md)** — WordPress user + usermeta ↔ HubSpot ↔ **`$user.*$`**; **`wp_udos_activity`**; FDX-compatible interchange; pairs with **`CONTACT_SCHEMA_v4`**.

**Contact & identity architecture (locked):** **[`docs/specs/v4/UDOS_UNIFIED_CONTACT_IDENTITY_ARCHITECTURE_LOCKED_v1.md`](specs/v4/UDOS_UNIFIED_CONTACT_IDENTITY_ARCHITECTURE_LOCKED_v1.md)** — WordPress **MySQL** as master registry (no separate `contacts.db`); **`wp_udos_*`** tables; local WP SQLite replica; vault SQLite + optional **v5** vector search (e.g. LanceDB) as non-contact index.

**UniversalVectorIL / UVIL (locked boundary):** **[`docs/specs/v4/UNIVERSAL_VECTOR_IL_UVIL_v1.md`](specs/v4/UNIVERSAL_VECTOR_IL_UVIL_v1.md)** — dedicated **vector, schematic, teletext tile, uGrid map, and uDos6QR** tooling repo (target **`UniversalVectorIL/`**); **USXD** consumes assets; **uDosGo** does not own full graphic editors.

---

## Repo responsibilities

| Repo | v4 focus |
| --- | --- |
| **uDos-Go** | Runnable core, ThinUI, **MCP** ([`INTEGRATION_v4_mcp-family-full.md`](specs/v4/INTEGRATION_v4_mcp-family-full.md)), grid canon, USXD validation |
| **uDos** | Governance, `uDosDev` specs, `v2-reference` archive |
| **UniversalSurfaceXD** | USXD interchange, schemas, browser-mockup lab |
| **UniversalVectorIL** (sibling clone) | UVIL — blueprint / teletext / QR / map editors; CLI **`uvil`** (illustrative); feeds USXD + themes + Linkdown — **[`ROUND_D_PUBLISHING_GRAPHICS_v4.md`](specs/v4/ROUND_D_PUBLISHING_GRAPHICS_v4.md)** |
| **Syncdown-app** | **Macdown** — native macOS client, Apple sync architecture |
| **Sonic** | **`SonicScrewdriver`** at `~/Code/SonicScrewdriver/` — execution roadmap [`SonicScrewdriver/docs/ROADMAP-v4.md`](https://github.com/fredporter/SonicScrewdriver/blob/main/docs/ROADMAP-v4.md); Ventoy fork at **`~/Code/Ventoy/`** (**`fredporter/Ventoy`**) — [`Ventoy/DOC/uDos-family-alignment.md`](https://github.com/fredporter/Ventoy/blob/master/DOC/uDos-family-alignment.md) |

---

## Future plans (draft — not scheduled)

**v5 UI / spatial / physical (locked brief, preview):** **[`docs/future/UDOS_PRE_V5_AND_V5_WORK_BRIEF_LOCKED.md`](future/UDOS_PRE_V5_AND_V5_WORK_BRIEF_LOCKED.md)** — **Part 2–3** bridge from **PRE-v5** 2D completion to **v5** Z-depth, Lego, teleport; use with **[`docs/specs/v4/UDOS_COMPLETE_MASTER_SPEC_v12.0.0_LOCKED.md`](specs/v4/UDOS_COMPLETE_MASTER_SPEC_v12.0.0_LOCKED.md)** for packaging narrative.

Gameplay extension, uCode TUI, spatial maps, Docker/VM infrastructure, and **Chatdown** experiment lanes (Gameplay & Fantasy) are captured in:

- **[`docs/future/uDos-v4-gameplay-chatdown-development-cycle-brief.md`](future/uDos-v4-gameplay-chatdown-development-cycle-brief.md)** — phased **4.4.0 → 4.8.0** narrative (after **v4.2.1** launch); dependencies and success criteria; **not** immediate execution.
- **[`docs/future/gameplay-v4-gap-analysis-v2-integration.md`](future/gameplay-v4-gap-analysis-v2-integration.md)** — v2 gameplay notes → **PLAY** taxonomy (eight families), Toybox, plugin registry (**4.7**), optional **3D** (**4.8**), locked architecture principles.

---

## Obsolete layout

Multi-root workspaces that pointed at **`uDOS-family/*`** or **`syncdown`** (lowercase) beside USXD are **replaced** by **`~/Code/`** paths (`uDosGo`, `Syncdown-app`, **`SonicScrewdriver`**, **`Ventoy`**). Legacy **`sonic-v1/*`** trees are obsolete for new work. Keep **v2** material only under **`uDos/v2-reference/`**.
