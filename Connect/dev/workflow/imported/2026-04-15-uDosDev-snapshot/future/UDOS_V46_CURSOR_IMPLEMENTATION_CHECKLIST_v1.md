# uDos v4.6 — Implementation checklist for Cursor

**Audience:** Cursor and operators tracking **v4.6.0** execution against family specs.  
**Pairs with:** [`V451_TO_V46_CURSOR_ACTIVE_CHECKLIST_v1.md`](V451_TO_V46_CURSOR_ACTIVE_CHECKLIST_v1.md) (phased verification), [`PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md`](PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md).

**Cell/cube persistence decision (v4.6):** see **§ Cell/Cube schema — Part 5** below (SQLite default; PostgreSQL for shared cloud).

---

## Section A: Current WIP (status awareness only)

Check these items are already in progress.

| Item | Repo | Status | Notes |
|------|------|--------|-------|
| Cell/Cube storage schema | uDosGo | Blocked → **resolved in Part 5** | Was: SQLite vs PostgreSQL |
| uFeedThru OpenAPI spec | uFeedThru | In progress | Swagger UI at `/docs` |
| uChatDown feed commands | uChatDown | In progress | `/feeds`, `/feed`, `/spool` |
| PING/PONG uCode commands | uDosGo | Complete | Needs testing confirmation |

---

## Section B: New tasks — v4.6.0 (implement now)

### B1. NetHack container

```yaml
task: "Implement NetHack container with Amiga version and teletext SKIN"
repo: uDosGo
version: v4.6.0
priority: [*]

requirements:
  - Download Amiga NetHack binary (neozeed/hack-1.01-Amiga)
  - Store in ~/.local/share/udos/games/nethack/
  - Implement teletext SKIN (2x6 grid, coloured sprites)
  - Add Ctrl+L LENS toggle (show original Amiga view)
  - Save games to ~/.local/share/udos/games/nethack/saves/
  - Command: `udos game nethack --skin teletext`

acceptance:
  - Game launches in terminal
  - Sprites render in teletext grid
  - Ctrl+L shows original (or fallback)
  - Ctrl+S saves game
  - Ctrl+Q quits
```

**Locked spec:** [`UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1.md`](../specs/v4/UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1.md).

### B2. Elite container (Oolite fallback)

```yaml
task: "Implement Elite container with Oolite fallback and wireframe SKIN"
repo: uDosGo
version: v4.6.0
priority: [*]

requirements:
  - If Docker installed: run original Elite (headless container)
  - If Docker not installed: run Oolite (native binary)
  - Oolite install: `brew install oolite` (macOS) or package manager
  - Store in ~/.local/share/udos/games/elite/
  - Implement wireframe SKIN (vector overlay)
  - Add Ctrl+L LENS toggle (show original)
  - Save games to ~/.local/share/udos/games/elite/saves/
  - Command: `udos game elite --skin wireframe`

acceptance:
  - Game launches with or without Docker
  - Wireframe SKIN renders correctly
  - Ctrl+L shows original (Docker) or Oolite native
  - Fallback works seamlessly
```

**Locked spec:** [`UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1.md`](../specs/v4/UDOS_NETHACK_ELITE_GAMES_LENS_SKIN_LOCKED_v1.md).

### B3. Tower of Knowledge (slots 0–7)

```yaml
task: "Implement Tower of Knowledge with slots 0-7 and colour-coded flags"
repo: uDosGo
version: v4.6.0
priority: [*]

requirements:
  - Create directory structure: ~/vault/tower/slot_{0-7}_{name}/
  - Slot 0: private (local only, never sync)
  - Slot 1: public local (LAN, opt-in sync)
  - Slot 2: password local (LAN + password)
  - Slot 3: group local (LAN + group members)
  - Slot 4: unpublished cloud (user only, sync)
  - Slot 5: published public (cloud, public)
  - Slot 6: password cloud (cloud + password)
  - Slot 7: group cloud (cloud + group members)
  - Add colour-coded flags (black, green, yellow, orange, white, blue, purple, red)
  - Command: `udos tower view`
  - Command: `udos tower move --from slot4 --to slot5`

acceptance:
  - All 8 slots created with correct permissions
  - Sync rules enforced per slot
  - Flags display correctly in UI
  - Move command changes slot assignment
```

**Locked spec:** [`UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md`](../specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md).

### B4. Wizard role and submission workflow

```yaml
task: "Implement Wizard role and submission workflow documentation"
repo: uDos
version: v4.6.0
priority: [*]

requirements:
  - Define Wizard as collective dev team
  - Create submission endpoint: `udos submit --path <file>`
  - Submission goes to Wizard review queue
  - Wizard approval/rejection via CLI or GitHub
  - Credit attribution tracking
  - User content outranking process
  - Command: `udos submit --path content/doc.md`
  - Command: `udos review list` (Wizard only)
  - Command: `udos review approve --id 123`

acceptance:
  - Submissions go to review queue
  - Wizard can approve/reject/challenge
  - Credit attribution stored in frontmatter
  - Outranking process documented
```

**Locked spec:** [`UDOS_WIZARD_AGENT_DIGITAL_AND_KNOWLEDGE_RANKING_LOCKED_v1.md`](../specs/v4/UDOS_WIZARD_AGENT_DIGITAL_AND_KNOWLEDGE_RANKING_LOCKED_v1.md). Runtime wiring may span **uDosGo** CLI + governance docs in this repo.

---

## Section C: New tasks — v4.6.1 (next)

### C1. uname-generator

```yaml
task: "Build uname-generator for collectible 2/3-word handles"
repo: uname (new repo)
version: v4.6.1
priority: [~]

requirements:
  - Support 2-word and 3-word names
  - Modes: github-style, uDosStyle, wutang, combo
  - 1-2 optional seed input fields
  - Locked field: word-count mode (cannot edit after preview)
  - Generation progress stages (parsing → style map → candidates → validation → uniqueness → stamp)
  - Validation: length 6-32, char rules per mode, no duplicates
  - Fun extra: BubBLeMoOD123 mode (playful casing, suffix patterns)
  - Output: display_name, slug, stamp_id (UNM-GEN-*), timestamp, style signature
  - Commands: `udos namegen --words 2 --mode wutang`

acceptance:
  - Names feel collectible and intentional
  - Validation catches broken outputs
  - Stamping feels like reward moment
  - Fun extra produces playful but usable names
```

**Locked flow:** [`UDOS_UNAME_GENERATOR_FLOW_LOCKED_v1.md`](../specs/v4/UDOS_UNAME_GENERATOR_FLOW_LOCKED_v1.md).

### C2. USXDRenderer.swift

```yaml
task: "Implement USXDRenderer.swift in uMacDown"
repo: uMacDown
version: v4.6.1
priority: [~]

requirements:
  - Fetch USXD JSON from API endpoint
  - Render with SwiftUI sheets (no .usxd file parsing)
  - Support feed-console and spool-player surfaces
  - Handle loading states and errors
  - Integrate with existing uMacDown feed client
  - Files to create: Services/USXDRenderer.swift

acceptance:
  - Surfaces load from API
  - SwiftUI sheets display correctly
  - No local .usxd parsing required
  - Errors handled gracefully
```

---

## Section D: Deferred items (not for v4.6)

```yaml
deferred_to_v4.6.2:
  - Oolite integration (native binary fallback for Elite)
  - Multi-device sync improvements

deferred_to_v5.0.0:
  - 3D world rendering (ComfyUI, Three.js)
  - AR overlay (phone as portal device)
  - uHomeNest v5 refactor
  - Immersive gameplay (first-person)
  - Real-time multiplayer mesh
```

*(Adjust deferrals if family roadmap re-prioritises.)*

---

## Section E: Blocked items (require decision)

```yaml
blocked_items:
  - Cell/Cube storage schema:
      question: "SQLite (simpler, single-user) vs PostgreSQL (scalable, multi-user)?"
      decision_needed: "Recorded in Part 5 below"
      impact: "Drives sync architecture, multi-device, cloud backup"
```

---

## Section F: Version tracking

```yaml
current_version: v4.6.0
next_patch: v4.6.1
next_minor: v4.6.2
next_major: v5.0.0

changelog_location: "Each repo /CHANGELOG.md"
tagging: "Use semantic versioning: v4.6.0, v4.6.1, etc."
```

---

## Summary for Cursor

```yaml
immediate_priority:
  - NetHack container (v4.6.0)
  - Elite container with Oolite fallback (v4.6.0)
  - Tower of Knowledge slots 0-7 (v4.6.0)
  - Wizard role + submission workflow (v4.6.0)

next_priority:
  - uname-generator (v4.6.1)
  - USXDRenderer.swift (v4.6.1)

blocked:
  - Cell/Cube schema — use Part 5 decision (SQLite + optional PostgreSQL hub)

deferred:
  - v5 features (3D, AR, uHomeNest refactor)
```

---

## Cell/Cube schema — status check

### Part 1: Already locked (no new schema for dimensions)

```yaml
locked_and_ready:
  cell_dimensions:
    - "2×3 pixels = 6 QR = ~5,000 chars"
    - "Aspect ratio: 2:3"

  cube_dimensions:
    - "6×6×6 voxels = 216 QR = ~180,000 chars"
    - "True cube (equal sides)"

  allocation:
    - "1 free cube per new user"
    - "Additional cubes purchasable (uCoin or USD)"

  pricing:
    - "Free tier: 1 cube"
    - "Individual: 10 cubes (~$10/month)"
    - "Power: 100 cubes (~$25/month)"

  physical_forms:
    - "Cell = single QR sticker"
    - "Cube = sequence of 36 QR codes OR flash device"

  url_patterns:
    - "cell: udos://cell/{layer}/{x},{y}"
    - "cube: udos://cube/{layer}/{x},{y},{z}"
```

### Part 2: What actually needs schema

```yaml
schema_needed_for:
  persistence:
    - "Store cell/cube ownership (user_id)"
    - "Store coordinates (x, y, z, layer)"
    - "Store data content (text, uCode, USVG)"
    - "Store metadata (created_at, updated_at, size)"
    - "Store encryption status"
    - "Store sync state"

  relationships:
    - "User to cells/cubes (one-to-many)"
    - "Cell to cube (one-to-one, optional depth)"
    - "Spatial links between cubes (many-to-many)"

  queries_needed:
    - "Find cell/cube at coordinates"
    - "Find cells/cubes owned by user"
    - "Find cubes within radius of coordinates"
    - "Find spatial links from cube"
```

### Part 3: Minimal schema (SQLite) — implementation baseline

```sql
-- users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- cells table (2D)
CREATE TABLE cells (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  layer TEXT CHECK(layer IN ('L300','L400','L500','L600','L700')),
  x INTEGER,
  y INTEGER,
  data TEXT,
  size INTEGER,
  encrypted BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(layer, x, y)
);

-- cubes table (3D)
CREATE TABLE cubes (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  layer TEXT CHECK(layer IN ('L300','L400','L500','L600','L700')),
  x INTEGER,
  y INTEGER,
  z INTEGER,
  data TEXT,
  size INTEGER,
  encrypted BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(layer, x, y, z)
);

-- spatial links (between cubes)
CREATE TABLE spatial_links (
  id TEXT PRIMARY KEY,
  from_cube_id TEXT REFERENCES cubes(id),
  to_cube_id TEXT REFERENCES cubes(id),
  link_type TEXT CHECK(link_type IN ('portal','path','reference','teleport')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- sync state (for multi-device)
CREATE TABLE sync_state (
  device_id TEXT PRIMARY KEY,
  last_sync TIMESTAMP,
  version_vector TEXT
);
```

### Part 4: Beyond schema (implementation tasks)

```yaml
implementation_tasks:
  - [ ] Create database migrations (up/down)
  - [ ] Implement cell/cube CRUD API
  - [ ] Add spatial index for coordinates (GiST or R-tree)
  - [ ] Implement encryption at rest (optional)
  - [ ] Add sync conflict resolution
  - [ ] Integrate with uDosGo storage layer
  - [ ] Add `udos cell` and `udos cube` CLI commands
  - [ ] Add `udos spatial near --x --y --z --radius`

not_needed_for_v4.6:
  - "Full 3D spatial queries (GiST, PostGIS) — v5"
  - "Multi-user collaborative cubes — v5"
  - "Real-time spatial events — v5"
```

### Part 5: Persistence decision (SQLite vs PostgreSQL)

**Decision (v4.6):** Use **SQLite** as the **default** persistence layer for **local / single-user / offline-first** cell and cube registry data in the **Host + CLI** path (matches vault-native, single-file backup, and the minimal DDL in Part 3).

Use **PostgreSQL** (optionally **PostGIS**) for a **shared cloud registry** or **multi-tenant hub** when uSpace / portal lanes need fleet-scale queries, concurrent writers, and server-side spatial indexes. That is a **separate deployment** from the per-machine SQLite file, not a replacement for local-first storage.

**Rationale:** Vault-native and multi-device specs assume a **local** source of truth with explicit sync; SQLite fits the default machine. PostgreSQL fits **udo.space**-class services and team scale without forcing every developer install to run a server.

**One-liner for implementers:** Dimensions and pricing are already locked; **implement the Part 3 schema in SQLite first** for Host/CLI. Add a **PostgreSQL** projection or service only when a cloud registry ships; advanced 3D queries and real-time mesh remain **v5** deferrals.

**Five-tier lock:** Full stack (T1 SQLite, T2 RDS, T3 WordPress MySQL, T4 LMDB+CRDT vector, T5 air-gap profile) — [`UDOS_FIVE_TIER_DATABASE_STRATEGY_LOCKED_v1.md`](../specs/v4/UDOS_FIVE_TIER_DATABASE_STRATEGY_LOCKED_v1.md).

---

## Revision

| Version | Date | Notes |
| --- | --- | --- |
| 1.0.0 | 2026-04-13 | Ingested Cursor checklist Sections A–F; Cell/Cube Parts 1–4; Part 5 SQLite/PostgreSQL decision |
