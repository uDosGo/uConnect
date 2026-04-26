# uDos Core Specification – v4.2.1 (Grid‑Graphics & Orchestration Extension)

**Status:** Draft (not yet locked)  
**Based on:** v4.0.0 core + deferred spatial / display / view engine features + Hivemind orchestration  
**Principle:** Markdown is truth. Views are projections. Spatial layout is independent. Hivemind orchestrates.

---

## 1. What's new in v4.2.1 (vs v4.0.0)

| Area | v4.0.0 | v4.2.1 addition |
|------|--------|------------------|
| **Grid engine** | not specified | full spatial layout engine (collision, layers, reflow) |
| **Spatial maps** | not specified | named maps (earth, space, abstract), regions, markers, paths |
| **View engine** | table, list (basic) | board, timeline, feed, story, slide, map, workflow |
| **Teletext** | canonical encoding | full mosaic rendering engine (2×3 blocks, signage) |
| **Render pipeline** | not defined | USXD → View → Layout → Raster → Output |
| **Spatial metadata** | deferred | `#loc/PlaceRef`, frontmatter `location:` |
| **Orchestration** | MCP (deferred) | **Hivemind** (4‑role agent loop) + OK Assist CLI |

---

## 2. Core scale model (unchanged from v4.0.0)

| Layer | Definition |
|-------|------------|
| **Spatial layout** | abstract integer grid (tiles, maps); variable size; not pixels |
| **Character grid** | 80×30 canonical (cols × rows); mini 40×15 |
| **Raster cell** | 16×24 px per character cell; 2×3 teletext mosaic inside |

**Rule:** Spatial layout is independent of character grid. Projection maps spatial coordinates onto 80×30 for canonical export.

---

## 3. Grid Engine (spatial layout)

From `grid_engine.md` (uDos‑Go) – now part of v4.2.1.

**Snap modes:** hard, soft, free  
**Collision:** same‑layer overlap invalid; layers separate  
**Layer stack:** 0 = base, 1 = surface, 2 = content, 3 = overlay, 4 = UI  
**Reflow modes:** none, stack, flow, columnar  
**Object types:** note, task, panel, media, map_region, marker, form_block, story_card, slide_block, table, etc.

**Integration:** USXD `layout:` and `objects:` bind to Grid Engine.

---

## 4. Spatial Map System

From `spatial_map_spec.md` – now part of v4.2.1.

**Map types:** earth, space, system, abstract  
**Regions** (bounded areas) and **Markers** (points)  
**Relationships:** near, inside, connected, orbiting  
**Paths / routes**  
**Multi‑map linking** (zoom, pan)

**Stable identity:** LocId / PlaceRef (v4 canon) used for map locations in vault, feeds, USXD.

---

## 5. View Engine (full set for v4.2.1)

| View kind | Owner | Purpose |
|-----------|-------|---------|
| `table` | Syncdown | structured data |
| `list` | Linkdown / Syncdown | linear tasks |
| `board` | Syncdown | Kanban workflow |
| `timeline` | Syncdown | date‑based scheduling |
| `feed` | Syncdown | activity streams |
| `story` | Syncdown | narrative / step‑by‑step |
| `slide` | Syncdown | Marp‑compatible decks |
| `map` | Syncdown | spatial maps |
| `workflow` | Syncdown | automation sequences |

**Render modes:** `grid` (spatial), `ascii` (symbolic), `teletext` (mosaic).

**Matrix:** USXD `kind` + `render.mode` selects engine.

---

## 6. Teletext Engine (full mosaic rendering)

From `teletext_engine.md` – now part of v4.2.1.

- **Cell:** 16×24 px, 2×3 mosaic blocks (Acorn‑style)
- **Mosaic primitives:** left/right columns, top/middle/bottom bands, any combination of 6 blocks
- **Signage / newsroom UI** built from repeated mosaic cells – not ASCII boxes
- **Fallback ladder** (v4.0.0) remains: Teletext → ASCII block → Shades → ASCII

**Integration:** USXD `render.mode: teletext` triggers this engine.

---

## 7. Render Pipeline (v4.2.1)

From `RENDER_PIPELINE.md`:

```text
USXD → View Engine → Layout Engine → Render Engine → Output
```

- **Parse** USXD (validate, normalise)
- **Resolve view** (select layout + render mode)
- **Layout** (Grid Engine or Spatial Map)
- **Render** (ASCII / Teletext / Grid / Map output)
- **Output** (TUI, ThinUI, browser, Markdown, SVG)

---

## 8. Spatial metadata in markdown (v4.2.1)

Extends v4.0.0 markdown canon:

**Frontmatter:**
```yaml
location:
  map: earth
  x: 8
  y: 4
  layer: 2
  place_ref: "EARTH:SUR:L305-DA11"
```

**Inline token:**
```markdown
- [ ] Place marker #loc/EARTH:SUR:L305-DA11
```

**Indented metadata:**
```markdown
- [ ] Place marker
  ↳ loc:: EARTH:SUR:L305-DA11
  ↳ layer:: 2
```

**Resolution:** `#loc/` and `location:` use PlaceRef grammar; resolved by uDos spatial services (Syncdown).

---

## 9. Hivemind orchestration (v4.2.1)

From `ARCHITECTURE.md`, `DEMO.md`, `BACKLOG.md`, etc. – Hivemind is the **AI orchestration layer** for uDos v4.2.1.

### 9.1 Four‑role loop

```text
Scout → Planner → Maker → Reviewer
```

| Role | Responsibility |
|------|----------------|
| **Scout** | classify incoming feed item, determine intent |
| **Planner** | create task graph (ordered steps, dependencies) |
| **Maker** | execute tools (via Host), write to vault |
| **Reviewer** | verify outcome, pass/fail, suggest fixes |

### 9.2 Provider & budget awareness

- Supports multiple providers: OpenAI, Anthropic, Groq, Ollama, LM Studio, custom OpenAI‑compatible endpoints.
- Budget thresholds: primary, fallback, block.
- Events emitted for every decision (`feed.classified`, `task.created`, `tool.finished`, `provider.request`, `budget.warning`).

### 9.3 Host API integration

Hivemind communicates with Host (local API) – never writes directly to disk.

- `POST /api/v1/feed/items` – submit input
- `GET /api/v1/tasks` – read task state
- Tool execution via Host's execution adapter (sandboxed, timeout, size caps).

### 9.4 Vault / spool / events

- Feed items stored in spool (`feed-items.json`)
- Tasks persisted (`tasks.json`)
- Events append to `events/log.json` (SSE stream to ThinUI)

### 9.5 Relation to Chatdown & Linkdown

- **Chatdown** may become a UI frontend to Hivemind (send prompts, receive responses).  
  *Stub in v4.0.2, enabled in v4.2.1.*
- **Linkdown** provides vault and MCP tools (via premium) that Hivemind calls.
- **Syncdown** runs rules triggered by Hivemind events.

---

## 10. OK Assist (CLI / command interface)

From `OK-AGENT-DEV-CONTRACT.md` and earlier `OK Assist` spec – now part of v4.2.1 as a **human‑oriented command layer** over Hivemind.

**Command format:**
```text
> OK ASSIST: VERB TARGET PARAMS
```

**Examples:**
```text
> OK ASSIST: CREATE TASK "Deploy system"
> OK ASSIST: MOVE TILE 2,3 → 4,5
> OK ASSIST: RUN WORKFLOW launch-prep
```

**Responsibilities:**
- Deterministic, command‑driven (not freeform chat)
- Translates to Hivemind tasks / tool calls
- Can be embedded in markdown (`> OK ASSIST: ...`)

**Not a replacement for Chatdown** – OK Assist is for power users and automation scripts; Chatdown is the conversational UI.

---

## 11. Product ownership (v4.2.1)

| Component | Owner |
|-----------|-------|
| **Grid Engine** | Syncdown |
| **Spatial Map System** | Syncdown |
| **Teletext Engine** | ThinUI / Syncdown |
| **View Engine** (board/timeline/feed/story/slide/map/workflow) | Syncdown |
| **Hivemind** | uDos‑Go (core) |
| **OK Assist** | uDos‑Go (core) |
| **Host / API** | uDos‑Go (core) |
| **Markdown / vault / tasks** | Linkdown Core |
| **Chatdown UI** | Chatdown (frontend to Hivemind) |

---

## 12. Relationship to v4.0.0

- **v4.0.0** core remains locked (markdown canon, task spec, contact schema, vault topology, system health, attribution).
- **v4.2.1** adds the **spatial / display / view engine / Hivemind / OK Assist** features as optional extensions (implemented by Syncdown and uDos‑Go).
- **v4.0.x** products (Linkdown Core, Chatdown v4.0.2) do not require these features.

---

**End of uDos Core Specification v4.2.1 – Draft**

---
