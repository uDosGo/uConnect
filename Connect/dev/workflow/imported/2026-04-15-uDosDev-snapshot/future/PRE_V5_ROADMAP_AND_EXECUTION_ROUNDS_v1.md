# Pre-v5 roadmap and execution rounds (v4.5.1 → v4.6)

**Status:** **Active** — ties **locked specs** (2026-04) to **shippable work rounds** before any **v5** program.  
**Version:** 1.7.3  
**Dev flow standard:** [dev-beta-flow-and-resume.md](../../../migrated-round1/process/dev-beta-flow-and-resume.md) — `.local/` thinking → **`TASKS.md`** → implementation → **`npm` / `bash` gates` in **uDos**; round naming in imported [v4-dev-rounds.md](../v4-dev-rounds.md) *(beta-era filename).*

**Completion target:** [wpmudev-agent `PRE_V5_COMPLETION_CHECKLIST.md`](https://github.com/fredporter/wpmudev-agent/blob/main/docs/PRE_V5_COMPLETION_CHECKLIST.md) (checklist) plus round exit criteria below.

**Cursor / operator verification:** [`V451_TO_V46_CURSOR_ACTIVE_CHECKLIST_v1.md`](V451_TO_V46_CURSOR_ACTIVE_CHECKLIST_v1.md) — phased checklist (foundation → integration) with links to locked specs; mark checkboxes as implementations are validated.

---

## 1. Locked spec bundle (promoted 2026-04)

These are **engineering authority** for pre-v5 work; implement against them in order of **rounds** (§4).

| Topic | Spec (uDosDev `docs/specs/v4/` unless noted) |
| --- | --- |
| **Naming** | [UDOS_V451_COMPLETE_LOCKED_SPEC_v4.5.1.md](../specs/v4/UDOS_V451_COMPLETE_LOCKED_SPEC_v4.5.1.md) — *Surface* vs *OS* metaphor (subsection); **`udo.space`**, URLs, `wpmudev-agent` |
| **Spatial algebra** | [UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md](../specs/v4/UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md) — voxel, 2×3 cell, depth cube, binder, layers L300–L700, API paths |
| **Billing / economy** | [UDOS_UCELL_VOXEL_MAPPING_v1.md](../specs/v4/UDOS_UCELL_VOXEL_MAPPING_v1.md) — uCell ↔ voxel; macrocube vs algebra reconciliation |
| **Physical / display packaging (narrative)** | [UDOS_COMPLETE_MASTER_SPEC_v12.0.0_LOCKED.md](../specs/v4/UDOS_COMPLETE_MASTER_SPEC_v12.0.0_LOCKED.md) — voxel ↔ uCube, tiles, sprites, maps, teleport, **`.uvox`**; **coexists** with spatial algebra + uCell mapping |
| **Economy base** | [SPATIAL_STORAGE_ECOSYSTEM_v1.md](../specs/v4/SPATIAL_STORAGE_ECOSYSTEM_v1.md) — uCell, uCoin, uTile |
| **Privacy / publication** | [UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md](../specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md) — slots **0–7**, `~/vault/tower/`, Global Knowledge Bank (**slot 5**) |
| **Vault UI** | [UDOS_VAULT_NATIVE_ARCHITECTURE_v4.5.1.md](../specs/v4/UDOS_VAULT_NATIVE_ARCHITECTURE_v4.5.1.md) — cockpit; pairs Tower |
| **Infra** | [UDOS_V451_AWS_INFRASTRUCTURE_ADDENDUM_v4.5.1.md](../specs/v4/UDOS_V451_AWS_INFRASTRUCTURE_ADDENDUM_v4.5.1.md) |
| **Operator UX** | [UDOS_STREAMLINED_OPS_UNIFIED_UI_LOCKED_v1.md](../specs/v4/UDOS_STREAMLINED_OPS_UNIFIED_UI_LOCKED_v1.md) — one terminal, one Bubble Tea TUI, teletext grid (full detail) |
| **Containers** | [UDOS_DOCKER_STRATEGY_LOCKED_v1.md](../specs/v4/UDOS_DOCKER_STRATEGY_LOCKED_v1.md) — native-first; optional headless; Podman-class long-term |
| **Classic games** | [UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1.md](../specs/v4/UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1.md) — NetHack / Elite-class, LENS/SKIN, Oolite fallback |
| **USXD shell** | [UDOS_USXD_WIREFRAME_SHELL_ALL_APPS_LOCKED_ADDENDUM_v1.md](../specs/v4/UDOS_USXD_WIREFRAME_SHELL_ALL_APPS_LOCKED_ADDENDUM_v1.md) — one wireframe shell for all docked apps; open-box overrides |
| **Browser GUI stack** | [UDOS_GUI_ARCHITECTURE_TAILWIND_USXD_INTEGRATION_LOCKED_v1.md](../specs/v4/UDOS_GUI_ARCHITECTURE_TAILWIND_USXD_INTEGRATION_LOCKED_v1.md) — Tailwind v4.2+, Tailwind Plus–style blocks, teletext overlay, USXD vector blocks, Mono icons, uGridComposer; ThinUI + USXD lab |
| **Browser GUI — toolbar & fonts** | [UDOS_GUI_ADDENDUM_DISTRACTION_FREE_TOOLBAR_AND_FONT_SYSTEM_LOCKED_v1.md](../specs/v4/UDOS_GUI_ADDENDUM_DISTRACTION_FREE_TOOLBAR_AND_FONT_SYSTEM_LOCKED_v1.md) — **uDos Control Bar**, heading/body/prose fonts, relative scale, presets, shortcuts; extends browser GUI stack |
| **Browser markdown editor (Typo-style)** | [UDOS_MARKDOWN_EDITOR_TYPO_STYLE_BROWSER_LOCKED_v1.md](../specs/v4/UDOS_MARKDOWN_EDITOR_TYPO_STYLE_BROWSER_LOCKED_v1.md) — static **vanilla** editor (CodeMirror 6, marked, DOMPurify, USXD blocks); **Linkdown** boundary; lab **`udos-editor/`** |
| **Multi-device vault** | [UDOS_MULTI_DEVICE_VAULT_ARCHITECTURE_LOCKED_v1.md](../specs/v4/UDOS_MULTI_DEVICE_VAULT_ARCHITECTURE_LOCKED_v1.md) — one Master Vault per user, sync.yaml, device replicas, Tower path rules |
| **Privacy / ingestion** | [UDOS_PRIVACY_SCRUBBING_CONTENT_INJECTION_LOCKED_v1.md](../specs/v4/UDOS_PRIVACY_SCRUBBING_CONTENT_INJECTION_LOCKED_v1.md) — PII scrub, URL vetting, source disposal, Wizard gates |
| **Compression / archival** | [UDOS_INFORMATION_COMPRESSION_AND_ARCHIVAL_LOCKED_ADDENDUM_v1.md](../specs/v4/UDOS_INFORMATION_COMPRESSION_AND_ARCHIVAL_LOCKED_ADDENDUM_v1.md) — tiny derived artifacts, gzip/spool/JSONL, mirrors, research CLI intent |

**wpmudev-agent** (private repo) — publishing / WordPress spine:

| Doc | Role |
| --- | --- |
| [`docs/infrastructure/udos-wordpress-gates-mapping.md`](https://github.com/fredporter/wpmudev-agent/blob/main/docs/infrastructure/udos-wordpress-gates-mapping.md) | Universe vs local gate, REST map |
| [`docs/publishing/WPMUDEV_CELL_STORAGE_LOCKED_SPEC.md`](https://github.com/fredporter/wpmudev-agent/blob/main/docs/publishing/WPMUDEV_CELL_STORAGE_LOCKED_SPEC.md) | WPMU DEV single-site + cell economy |
| [`docs/PRE_V5_COMPLETION_CHECKLIST.md`](https://github.com/fredporter/wpmudev-agent/blob/main/docs/PRE_V5_COMPLETION_CHECKLIST.md) | Portal + grid + cloud/user lane + tests |

**Index of all v4 specs:** [`specs/v4/README.md`](../specs/v4/README.md).

---

## 2. Streamlined operations and unified UI (locked conclusion)

**Full locked specs (canonical detail):**

- **[`UDOS_STREAMLINED_OPS_UNIFIED_UI_LOCKED_v1.md`](../specs/v4/UDOS_STREAMLINED_OPS_UNIFIED_UI_LOCKED_v1.md)** — one terminal, one Bubble Tea TUI, teletext **2×6**, hotkeys, resource comparison, child-process model.
- **[`UDOS_DOCKER_STRATEGY_LOCKED_v1.md`](../specs/v4/UDOS_DOCKER_STRATEGY_LOCKED_v1.md)** — native-first; optional headless containers; Podman-class long-term; **no** Docker fork.
- **[`UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1.md`](../specs/v4/UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1.md)** — NetHack / Elite-class games, **SKIN/LENS**, Oolite fallback, optional Docker for Elite original only.
- **[`UDOS_USXD_WIREFRAME_SHELL_ALL_APPS_LOCKED_ADDENDUM_v1.md`](../specs/v4/UDOS_USXD_WIREFRAME_SHELL_ALL_APPS_LOCKED_ADDENDUM_v1.md)** — **USXD** wireframe **shell** wraps every docked app; header / sidebars / content / footer; `~/.local/share/udos/shell/` overrides.
- **[`UDOS_GUI_ARCHITECTURE_TAILWIND_USXD_INTEGRATION_LOCKED_v1.md`](../specs/v4/UDOS_GUI_ARCHITECTURE_TAILWIND_USXD_INTEGRATION_LOCKED_v1.md)** — **Tailwind + USXD** four-layer browser model (teletext grid → Tailwind chrome → USXD blocks → uGridComposer); static-first build; **`udos-ui/`** scaffold in **UniversalSurfaceXD**.
- **[`UDOS_GUI_ADDENDUM_DISTRACTION_FREE_TOOLBAR_AND_FONT_SYSTEM_LOCKED_v1.md`](../specs/v4/UDOS_GUI_ADDENDUM_DISTRACTION_FREE_TOOLBAR_AND_FONT_SYSTEM_LOCKED_v1.md)** — distraction-free **Control Bar**; **heading / body / prose** font variables; **`font-presets.json`**; keyboard shortcuts; pairs lab **`toolbar.html`**, **`font-system.css`**, **`udos-controls.js`**.
- **[`UDOS_MARKDOWN_EDITOR_TYPO_STYLE_BROWSER_LOCKED_v1.md`](../specs/v4/UDOS_MARKDOWN_EDITOR_TYPO_STYLE_BROWSER_LOCKED_v1.md)** — **Typo-style** portable **markdown** editor (no Svelte runtime); **CodeMirror** + **USXD** embed syntax; static deploy; pairs **`udos-editor/`** in **UniversalSurfaceXD** (does **not** replace **Linkdown** Core).
- **[`UDOS_MULTI_DEVICE_VAULT_ARCHITECTURE_LOCKED_v1.md`](../specs/v4/UDOS_MULTI_DEVICE_VAULT_ARCHITECTURE_LOCKED_v1.md)** — one **account-scoped** Master Vault, **`vault/system/sync.yaml`**, local **device** state, **Tower** paths that never sync (**slots 0–3**).
- **[`UDOS_PRIVACY_SCRUBBING_CONTENT_INJECTION_LOCKED_v1.md`](../specs/v4/UDOS_PRIVACY_SCRUBBING_CONTENT_INJECTION_LOCKED_v1.md)** — **PII** scrub on inject, **URL** four-criteria vetting, **raw source** disposal, **Wizard** approval for canon URLs.

**Terminal lane** (shared): [`SHELL_v4_bubble-tea-tui.md`](../specs/v4/SHELL_v4_bubble-tea-tui.md), [`SHELL_v4_command-palette.md`](../specs/v4/SHELL_v4_command-palette.md). **Browser vs terminal:** [`INTEGRATION_v4_usxd-operational-gui.md`](../specs/v4/INTEGRATION_v4_usxd-operational-gui.md).

**Core answer (unchanged):** **Yes** — one primary terminal window, one Bubble Tea shell, workloads composed **inside**; **Docker Desktop** is **not** the default operator baseline; optional **web ThinUI** remains a user choice.

**Implementation pairing:** **uDosGo** (Host + Shell); **SonicScrewdriver** (palette alignment); **ThinUI** (React) as optional second surface.

---

## 3. Task id convention (optional but traceable)

| Prefix | Repo | Use |
| --- | --- | --- |
| **`UDEV-PRE5-R0x-*`** | uDosDev | Docs, governance, spec promotion |
| **`UDGO-PRE5-R0x-*`** | uDosGo | Host, ThinUI, vault, CLI |
| **`WP-PRE5-R0x-*`** | wpmudev-agent | WordPress, mu-plugins, deploy scripts |
| **`UFT-PRE5-R0x-*`** | uFeedThru | Feeds, spools, cell items |
| **`UMD-PRE5-R0x-*`** | uMacDown | Native viewer, Apple Tags |
| **`UCD-PRE5-R0x-*`** | uChatDown | `/cell`, `/cube` commands |

Rounds are **batches**, not strict releases; close a round when **exit criteria** pass.

---

## 4. Execution rounds (pre-v5 standard)

### PRE5-R01 — Spec spine and roadmap parity

**Goal:** Every consumer repo points at the new specs; no broken governance links.

| Action | Exit |
| --- | --- |
| Confirm `docs/specs/v4/README.md` lists Tower, Spatial algebra, uCell mapping | ✅ Done |
| uDos `docs/specs/README.md` includes v1.4 rows | ✅ Done |
| `docs/roadmap/pre-v5-family-notes.md` references v1.4 specs | ✅ Done |

**Primary repo:** uDosDev → uDosGo.

---

### PRE5-R02 — WordPress portal and two gates

**Goal:** Universe gate (`udo.space`) and local gate (`wp.udo.space` / Docker) plan matches code; portal tasks from checklist advanced.

| Specs | [`udos-wordpress-gates-mapping`](https://github.com/fredporter/wpmudev-agent/blob/main/docs/infrastructure/udos-wordpress-gates-mapping.md), [COMPLETE v4.5.1](../specs/v4/UDOS_V451_COMPLETE_LOCKED_SPEC_v4.5.1.md), [PRE_V5 checklist — Part 1](https://github.com/fredporter/wpmudev-agent/blob/main/docs/PRE_V5_COMPLETION_CHECKLIST.md) |
| Primary repo | **wpmudev-agent** |
| Exit | JWT secret documented; OAuth apps registered; `/login/` + `/dashboard/` live or staged; Apple/linking tracked in `TASKS.md` |

---

### PRE5-R03 — Spatial registry (voxel / cell / depth)

**Goal:** CRUD and QR paths align with **spatial algebra v1.2** and **uCell mapping**; macrocube SKUs documented if sold.

| Specs | [UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md](../specs/v4/UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md), [UDOS_UCELL_VOXEL_MAPPING_v1.md](../specs/v4/UDOS_UCELL_VOXEL_MAPPING_v1.md) |
| Primary repos | wpmudev-agent (`udos-spatial` / new tables), optional Lambda |
| Exit | Voxel rows + binder validation; REST `/api/voxel/...` or `/wp-json/udos/v1/...` stub **matches** URL patterns in spec |

---

### PRE5-R04 — Tower of Knowledge (slots 0–7)

**Goal:** Slot metadata, `~/vault/tower/` layout, CLI intents (`udos tower view`, `udos map`, `udos knowledge pull`).

| Spec | [UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md](../specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md) |
| Primary repo | **uDosGo** (CLI + vault); uMacDown (Apple Tags) |
| Exit | Slot field in doc index or front matter; tower path or virtual view documented; slot **4→5** publish path defined |

---

### PRE5-R05 — Cloud lane and Global Knowledge Bank

**Goal:** `udo.space/knowledge/` or equivalent; seed + `udos knowledge pull`; S3/CloudFront per AWS addendum.

| Specs | Tower (Part 4), [AWS addendum](../specs/v4/UDOS_V451_AWS_INFRASTRUCTURE_ADDENDUM_v4.5.1.md), [WPMUDEV cell spec](https://github.com/fredporter/wpmudev-agent/blob/main/docs/publishing/WPMUDEV_CELL_STORAGE_LOCKED_SPEC.md) |
| Primary repos | wpmudev-agent, static deploy scripts |
| Exit | Public knowledge URL live or staging; offline mirror story documented |

---

### PRE5-R06 — User lane and sync

**Goal:** Local cache of cells/cubes; user-initiated sync; conflict policy (user wins) per checklist Part 3.

| Specs | Tower + spatial algebra (local `udos://`) |
| Primary repo | uDosGo |
| Exit | Offline read path for tower + cached registry objects |

---

### PRE5-R07 — Sibling integrations and verification

**Goal:** uFeedThru (feed items), uMacDown (viewer), uChatDown (commands); run **PRE_V5** testing section.

| Primary repos | uFeedThru, uMacDown, uChatDown |
| Exit | [PRE_V5 checklist](https://github.com/fredporter/wpmudev-agent/blob/main/docs/PRE_V5_COMPLETION_CHECKLIST.md) testing + documentation sections addressed or ticketed |

---

## 5. Relationship to v5

**v5** remains **preview-only** until a separate family decision doc promotes it. **Pre-v5 rounds** must **not** depend on v5 themes (3D product, AR, ComfyUI, etc.) — see uDosGo [CURSOR_PRECURSOR_LOADOUT_v4.6_plus.md](https://github.com/fredporter/uDosGo/blob/main/docs/dev/CURSOR_PRECURSOR_LOADOUT_v4.6_plus.md).

---

## 6. Changelog

| Version | Change |
| --- | --- |
| 1.7.0 | Bundle §1 — **`UDOS_COMPLETE_MASTER_SPEC_v12.0.0_LOCKED`** (v12 narrative: voxel/uCube, teletext tiles, sprites, maps, teleport, `.uvox`; authority split vs spatial algebra + uCell mapping) |
| 1.6.0 | Bundle §1 — **`UDOS_INFORMATION_COMPRESSION_AND_ARCHIVAL_LOCKED_ADDENDUM_v1`** (text-first footprint, spool/feed compression, mirrors, research) |
| 1.5.0 | Bundle §1 + §2 — **`UDOS_PRIVACY_SCRUBBING_CONTENT_INJECTION_LOCKED_v1`** (PII scrub, URL vetting, ingestion, feeds pair) |
| 1.4.0 | Bundle §1 — **`UDOS_MULTI_DEVICE_VAULT_ARCHITECTURE_LOCKED_v1`** (one user, many devices, sync + Tower alignment) |
| 1.3.0 | Bundle §1 — **`UDOS_USXD_WIREFRAME_SHELL_ALL_APPS_LOCKED_ADDENDUM_v1`** (USXD shell for all docked apps); §2 bullet list updated |
| 1.2.0 | **§2** — summary only; full detail in **`UDOS_STREAMLINED_OPS_UNIFIED_UI_LOCKED_v1`**, **`UDOS_DOCKER_STRATEGY_LOCKED_v1`**, **`UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1`**; bundle table §1 updated |
| 1.1.0 | **§2 Streamlined operations and unified UI** — locked conclusion (one terminal, one Bubble Tea TUI, teletext grid, hotkey switching, native-first; ThinUI browser as optional surface) |
| 1.0.0 | Initial — spec bundle + PRE5-R01–R07 + task prefixes |
