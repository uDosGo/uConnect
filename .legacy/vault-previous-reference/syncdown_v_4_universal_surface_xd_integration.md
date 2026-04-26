# Syncdown v4 Integration to UniversalSurfaceXD

> Status: locked integration spec  
> Target: Syncdown v4 and its existing Figma / Material 3 UI design  
> Standard: UniversalSurfaceXD v0.1  
> Audience: `uDOS-dev`, Syncdown app implementation, Figma-to-code pipeline, theme and ThinUI adapter implementers

---

## 1. Purpose

This document defines how **Syncdown v4** adopts the new **UniversalSurfaceXD** standard without throwing away the existing detailed Figma UI work.

The goal is to make the current Syncdown browser UI, its Material 3 design system, and its future low-resource / transportable surfaces all resolve to the same canonical surface model.

Locked additions in this revision:

- Syncdown v4 adopts the locked colour/style system from `Syncdown-app/Docs/COLOURS-v4.md` for browser adapter and surface contract alignment.
- The USXD template now explicitly carries Syncdown Figma source lanes:
  - `MDC v3 App` Figma source set (legacy baseline and migration reference)
  - `MDC v4 / Syncdown app` Figma source set (current primary browser fidelity source)
- Companion files are now canonical outputs for this decision:
  - `docs/syncdown-surface-inventory.md`
  - `surfaces/syncdown-shell.surface.yaml`
  - `surfaces/syncdown-activity-feed.surface.yaml`
  - `surfaces/syncdown-connect-source.surface.yaml`

In practice, this means:

- the existing Figma design remains the primary rich browser reference
- Syncdown views are re-expressed as UniversalSurfaceXD surface kinds and regions
- Material 3 becomes a **browser adapter/theme lane**, not the only implementation
- selected Syncdown flows become portable to ThinUI, TUI, Markdown, and SVG export where appropriate
- Syncdown-specific UX stays rich, but semantics and structure become transportable across the uDOS family

The existing Syncdown code bundle is already tied to the Figma project, and the MDC Material 3 Surface3 system already provides reusable tokens, panels, cards, list, board, timeline and table view primitives that align well with UniversalSurfaceXD surface kinds. The same family docs also make clear that themes/adapters own appearance while runtime semantics stay elsewhere, and that ThinUI is a low-resource local runtime rather than a second browser planner app. fileciteturn5file0 fileciteturn5file1 fileciteturn4file4 fileciteturn5file2

---

## 2. Integration outcome

At the end of this integration, Syncdown v4 should be understood as:

```text
Figma design system + view layouts
  -> UniversalSurfaceXD surface definitions
  -> Material 3 browser adapter
  -> Syncdown runtime implementation
  -> optional ThinUI/TUI/Markdown/SVG derivatives where useful
```

This preserves the existing visual investment while normalising Syncdown into the shared uDOS surface universe.

---

## 3. What stays the same

The following parts of Syncdown v4 remain valid and should be preserved:

### 3.1 Figma remains the rich source of truth for browser UX

The existing Syncdown Figma design and code bundle remain the authoritative source for:

- browser-first interaction patterns
- Material 3 spacing and elevation feel
- panel composition
- sidebar/navigation rhythm
- card/list/table/timeline presentation
- detailed visual hierarchy and motion intent

The Syncdown bundle is already explicitly linked to the Figma design source. fileciteturn5file0

### 3.2 Material 3 Surface3 remains the browser adapter lane

The current MDC design system already includes:

- design tokens
- card and panel shells
- table/list/board/timeline views
- sidebar items
- chips, flags, status markers
- auto-layout friendly composition

Those should be treated as the **browser adapter/component library** for UniversalSurfaceXD, not as a competing surface model. fileciteturn5file1

### 3.3 Syncdown remains browser-primary

Syncdown v4 should continue to be a rich browser application first.

ThinUI is reserved for local low-resource launcher, status, recovery, sync-progress, selector and handoff style surfaces rather than becoming a duplicate of the full browser planner/workspace. That boundary is already explicit in the ThinUI runtime spec. fileciteturn5file2

---

## 4. What changes

The main change is conceptual and structural:

**Syncdown no longer defines its screens only as Figma frames or React views.**
It also defines them as **UniversalSurfaceXD surfaces**.

That means every major Syncdown screen should now have:

- a `surface.kind`
- a canonical region layout
- a stable object model
- a binding contract
- adapter targets
- fallback behaviour

So the Figma design becomes the **best browser rendering of a canonical surface**, not the canonical surface itself.

---

## 5. Syncdown v4 within the UniversalSurfaceXD model

## 5.1 Canonical position

Syncdown v4 sits primarily in the **browser runtime lane** with the Material 3 adapter, but should expose surface definitions that can also support:

- ThinUI handoff or lightweight local panels
- TUI summaries / deterministic text views
- Markdown export for docs/binders
- SVG export for diagrams or presentational snapshots

This fits the current family model where themes/adapters translate contracts into renderable output for browser, ThinUI, TUI, workflow, publish and forms. fileciteturn4file4

## 5.2 Recommended adapter map

```yaml
adapters:
  browser: material3-surface
  thinui: thinui-default
  tui: tui-default
  markdown: markdown-diagram
  svg: svg-surface
```

Not every Syncdown view needs all adapters implemented immediately. Browser is mandatory; ThinUI, TUI, Markdown and SVG are selective lanes.

---

## 6. Surface taxonomy for Syncdown v4

The existing MDC design system strongly supports table, list, board and timeline patterns already, so Syncdown v4 should map its UI into the following UniversalSurfaceXD surface kinds.

### 6.1 Core workspace surfaces

- `table`
- `list`
- `board`
- `timeline`
- `panel`

These map directly onto existing implemented view/component families such as `TableView`, `ListView`, `BoardView`, `TimelineView`, plus panel shells and cards. fileciteturn5file1

### 6.2 Syncdown operational surfaces

- `feed`
- `workflow`
- `step-form`
- `story`
- `handoff`
- `recovery`

These align with the promoted feeds/spool direction, the guided step-form rules, and the family boundary between browser-rich surfaces and ThinUI handoff/status/recovery surfaces. fileciteturn5file3 fileciteturn5file2 fileciteturn5file4

### 6.3 Optional future surfaces

- `slide`
- `map`
- `launcher`

These should remain optional for Syncdown v4, but the schema should not block them.

---

## 7. Canonical region grammar for Syncdown

Every major Syncdown surface should be reducible to a shared region grammar rather than bespoke frame composition.

## 7.1 Required region roles

- `header`
- `nav`
- `primary`
- `secondary`
- `inspector`
- `status`
- `controls`
- `overlay`
- `modal`

## 7.2 Browser interpretation

In browser Material 3:

- `header` -> top app bar / toolbar row
- `nav` -> sidebar rail / left navigation
- `primary` -> main content surface
- `secondary` -> companion surface or split pane
- `inspector` -> right details panel
- `status` -> footer bar / sync status row / inline chip lane
- `controls` -> action row, filters, sort bar
- `overlay` -> sheets, drawers, transient overlays
- `modal` -> focused task dialog or confirmation sheet

## 7.3 ThinUI interpretation

In ThinUI:

- `header` -> title bar
- `nav` -> selector list or tab strip
- `primary` -> main panel block
- `secondary` / `inspector` -> side information block when space allows
- `status` -> bottom status strip
- `controls` -> action hints / key legend

This follows ThinUI’s role as a low-resource local view runtime rather than a full browser clone. fileciteturn5file2

---

## 8. Mapping the existing Figma/MDC system to UniversalSurfaceXD

## 8.1 Tokens

The current design system tokens should map to the UniversalSurfaceXD browser adapter layer.

### Direct carry-over

- colour tokens
- spacing tokens
- radius tokens
- elevation tokens
- typography tokens

The existing design system already defines these comprehensively, including an 8pt spacing grid, Material 3 surface palette, radius and elevation levels. fileciteturn5file1

### Rule

These tokens stay inside the Material 3 adapter/theme lane. They must not become required canonical semantics.

UniversalSurfaceXD only needs to know:

- density intent
- emphasis intent
- hierarchy intent
- surface role
- optional adapter hints

## 8.2 Components

The current MDC components should map as follows:

| Existing Figma/MDC component | UniversalSurfaceXD role |
| --- | --- |
| `Card` / `CardHeader` / `CardBody` / `CardFooter` | `surface.panel`, `surface.feed-card`, generic region container |
| `PanelShell` and panel sections | `inspector`, `secondary`, `panel` region shells |
| `SidebarItem` | `nav` item renderer |
| `TableRow`, `TableCell`, `TableHeaderCell` | `surface.table` renderer |
| `ListItem` | `surface.list` item renderer |
| `BoardCard`, `BoardColumn` | `surface.board` renderer |
| `TimelineItem` | `surface.timeline` renderer |
| `StatusChip`, `TagChip`, `FlagDot` | metadata/status adornments |
| `RuleCard`, `RuleSectionCard`, `ConditionRow`, `ActionRow` | `workflow` / automation builder objects |

This mapping lets Syncdown keep its current component investment while normalising meaning across surfaces. fileciteturn5file1

---

## 9. Syncdown view mapping

## 9.1 Workspace shell

The main Syncdown shell should be represented as a `panel` surface with nested region definitions.

```yaml
surface:
  kind: panel
  regions:
    - role: header
    - role: nav
    - role: controls
    - role: primary
    - role: inspector
    - role: status
```

Browser rendering uses the full Material 3 shell. ThinUI should only implement this where a narrow local utility shell is genuinely useful.

## 9.2 Table view

The existing table view should map to:

```yaml
surface:
  kind: table
```

Rules:

- stable column ordering
- explicit density options later
- selection state stays semantic
- sort/filter are `controls`, not part of raw table semantics

This matches the existing table component family and the canonical fixed-width/deterministic table thinking in the grid rendering docs. fileciteturn5file1 fileciteturn4file9

## 9.3 List view

The existing list view should map to:

```yaml
surface:
  kind: list
```

Use for:

- inboxes
- record lists
- compact result sets
- activity lists when feed chrome is unnecessary

## 9.4 Board view

The existing board view should map to:

```yaml
surface:
  kind: board
```

Use for:

- stages
- status columns
- kanban-like grouping
- automation or triage lanes

## 9.5 Timeline view

The existing timeline view should map to:

```yaml
surface:
  kind: timeline
```

Use for:

- dates
- schedule-like records
- progress and temporal grouping

## 9.6 Feed view

Syncdown v4 should add or formalise a dedicated `feed` surface.

This should be used for:

- sync activity
- incoming changes
- notification digests
- spool/reduction views
- event streams

This aligns directly with the promoted feed/spool direction, which separates logs, feeds and spools and explicitly anticipates feed browser, digest view and spool manager surfaces. fileciteturn5file4

## 9.7 Workflow / rules view

The existing rule system components should map to:

```yaml
surface:
  kind: workflow
```

The `RuleCard`, `RuleSectionCard`, `ConditionRow`, and `ActionRow` become a canonical workflow builder lane instead of being just app-local widgets. fileciteturn5file1

## 9.8 Step-form surfaces

Any Syncdown setup, onboarding, source connection, or multi-step configuration flow should move to canonical `step-form` surfaces.

This follows the current rule that step-by-step forms are the preferred pattern for multi-field setup, with one primary action per step and explicit progress. fileciteturn5file3

## 9.9 Story / presentation surfaces

Read-mostly onboarding, explanation, or preview flows should map to:

```yaml
surface:
  kind: story
```

If later exported or presented in frame-based mode, the same content family may be rendered via `slide` adapters.

---

## 10. Syncdown-specific integration rules

## 10.1 Browser-first fidelity rule

When there is tension between rich browser UX and low-resource portability, Syncdown v4 should favour browser fidelity **for the primary app path**.

UniversalSurfaceXD does not require every Syncdown surface to be equally rich on every runtime. It requires that each surface have a stable semantic structure and optional fallback paths.

## 10.2 ThinUI boundary rule

Syncdown should only use ThinUI for:

- sync status
- operation progress
- binder / vault / location selection where relevant
- handoff to browser
- recovery-safe panels
- compact local dashboards

It should **not** try to rebuild the whole Syncdown browser workspace inside ThinUI. That is directly consistent with the current ThinUI contract and non-goals. fileciteturn5file2

## 10.3 Feed rule

Syncdown feeds must not be raw logs.

If Syncdown displays activity streams, digest views, or spool browsers, they should follow the family rule:

- logs record execution
- feeds carry meaningful change
- spool is local retention and transformation

This rule should be reflected in both browser UI naming and data bindings. fileciteturn5file4

## 10.4 Step-form rule

Do not scatter critical setup across disconnected modals.

For three or more ordered decisions, use a canonical `step-form` surface with:

- stable step IDs
- one primary action per step
- visible progress
- reusable GTX-compatible step data

This is already the current canonical posture. fileciteturn5file3

---

## 11. Proposed Syncdown UniversalSurfaceXD profiles

Syncdown v4 should begin by defining these canonical surface profiles.

### 11.1 App shell profile

```yaml
surface:
  id: syncdown-shell
  kind: panel
```

Purpose:
- sidebar navigation
- header controls
- central workspace
- optional right inspector
- bottom sync/status bar

### 11.2 Records table profile

```yaml
surface:
  id: syncdown-records-table
  kind: table
```

Purpose:
- structured records
- filters/sort in controls region
- details in inspector

### 11.3 Inbox list profile

```yaml
surface:
  id: syncdown-inbox-list
  kind: list
```

Purpose:
- compact work queue
- fast triage
- metadata-rich rows

### 11.4 Automation workflow profile

```yaml
surface:
  id: syncdown-rules
  kind: workflow
```

Purpose:
- rule cards
- trigger → conditions → actions
- deterministic builder structure

### 11.5 Activity feed profile

```yaml
surface:
  id: syncdown-activity-feed
  kind: feed
```

Purpose:
- sync events
- reductions/digests
- spool-related views

### 11.6 Connect-source step-form profile

```yaml
surface:
  id: syncdown-connect-source
  kind: step-form
```

Purpose:
- source setup
- auth/progressive decisions
- validation flow

### 11.7 Browser handoff / recovery profile

```yaml
surface:
  id: syncdown-handoff
  kind: handoff
```

Purpose:
- local launcher
- failure recovery
- retry/open browser paths

---

## 12. Example UniversalSurfaceXD definition for Syncdown

```yaml
surface:
  id: syncdown-activity-feed
  version: usxd/0.1
  title: Sync Activity
  kind: feed
  mode: canonical

  grid:
    cols: 80
    rows: 30
    tile_px: { w: 16, h: 24 }
    graphics:
      canonical: teletext-2x3
      fallback: [ascii-block, shades, ascii]

  theme:
    family: material3-surface
    density: comfortable

  regions:
    - id: header
      role: header
      rect: { x: 0, y: 0, w: 80, h: 3 }
    - id: controls
      role: controls
      rect: { x: 0, y: 3, w: 80, h: 3 }
    - id: primary
      role: primary
      rect: { x: 0, y: 6, w: 56, h: 21 }
    - id: inspector
      role: inspector
      rect: { x: 56, y: 6, w: 24, h: 21 }
    - id: status
      role: status
      rect: { x: 0, y: 27, w: 80, h: 3 }

  bindings:
    source: feeds.fetch
    params:
      feed_type: event
      spool: syncdown/default

  objects:
    - id: activity-list
      type: surface.feed
      region: primary
      renderer: material3-feed-list
    - id: digest-panel
      type: surface.panel
      region: inspector
      renderer: material3-panel

  actions:
    - id: refresh
      label: Refresh
      kind: primary
    - id: open-spool
      label: Open Spool
      kind: secondary

  adapters:
    browser: material3-surface
    thinui: thinui-default
    tui: tui-default
    markdown: markdown-diagram
    svg: svg-surface

  fallback:
    safe_mode_theme: minimal-safe
    reduced_view: list
```

---

## 13. Figma-to-UniversalSurfaceXD workflow

### 13.0 Syncdown Figma source registration (MDCv3 + MDCv4 app)

USXD template registration for Syncdown should track two Figma lanes:

```yaml
figma_sources:
  - id: syncdown-mdcv3-app
    title: Syncdown / MDC v3 App
    role: legacy-reference
    usage: migration and parity checks
  - id: syncdown-mdcv4-app
    title: Syncdown / MDC v4 App
    role: primary-rich-browser-source
    usage: canonical browser adapter source
```

Rule: v4 lane is primary for new surface contracts; v3 lane is read-only reference for migration parity.

## 13.1 Recommended pipeline

```text
Figma frame / component set
  -> identify surface kind
  -> identify regions
  -> map components to object families
  -> attach bindings/actions
  -> emit UniversalSurfaceXD document
  -> bind browser adapter to Material 3 components
```

## 13.2 Practical mapping pass for each Figma screen

For every major Syncdown Figma frame, record:

- `surface.id`
- `surface.kind`
- `regions[]`
- `objects[]`
- `actions[]`
- `bindings`
- `adapterHints`
- `fallback`

## 13.3 What not to encode from Figma

Do not treat these as canonical semantics:

- pixel-perfect browser spacing values beyond token use
- one-off animation details
- colour styling choices specific to one theme
- app-only nesting that exists just because of implementation

Those stay in the adapter/component layer.

---

## 14. Implementation plan for Syncdown v4

## Phase 1 — Surface inventory

Create an inventory of current Syncdown/Figma screens and classify each into a UniversalSurfaceXD surface kind.

Output:
- `docs/syncdown-surface-inventory.md`

## Phase 2 — Region mapping

For each key screen, define:

- canonical regions
- object families
- browser adapter mapping

Output:
- `surfaces/*.surface.yaml`

## Phase 3 — Browser adapter binding

Wire each surface file to existing Material 3 components.

Output:
- adapter lookup tables
- view wrappers that render by surface kind + object type

## Phase 4 — Flow normalisation

Convert setup/configuration flows to `step-form` surfaces.

This should use the existing step-form posture and GTX shape rather than inventing new per-screen JSON structures. fileciteturn5file3

## Phase 5 — Feed/spool surfaces

Add first-class feed surfaces for:

- activity
- digest
- spool browser
- reduction views

These should reflect the promoted feeds/spool model and avoid conflating logs with feeds. fileciteturn5file4

## Phase 6 — ThinUI/handoff slice

Implement only the ThinUI-relevant subset:

- sync status
- operation progress
- recovery panel
- browser handoff

This matches the documented ThinUI responsibilities and initial view set. fileciteturn5file2

---

## 15. Validation rules

A Syncdown UniversalSurfaceXD integration is valid when:

- every major browser screen has a declared `surface.kind`
- every screen can be reduced to canonical region roles
- browser Material 3 components are treated as adapter renderers, not canonical semantics
- setup flows use `step-form` when they are ordered multi-step decisions
- feed surfaces follow feed/spool semantics, not raw logs
- ThinUI usage stays within launcher/status/recovery/handoff boundaries
- canonical exports remain possible for Markdown or simplified text views where useful

---

## 16. Anti-patterns

Do not:

- rebuild Syncdown browser UX separately from UniversalSurfaceXD
- fork a Syncdown-only surface schema
- encode Material 3 tokens as canonical semantics
- treat every modal as a surface kind
- use raw execution logs as a user-facing feed
- port the entire rich browser workspace into ThinUI
- duplicate step-form data shapes outside the canonical form adapter pattern

These all work against transportability and cross-family consistency. fileciteturn5file3 fileciteturn5file4 fileciteturn5file2

---

## 17. Recommended next files

1. `docs/SYNCDOWN-V4-UNIVERSAL-SURFACE-XD-INTEGRATION.md`
2. `docs/syncdown-surface-inventory.md`
3. `surfaces/syncdown-shell.surface.yaml` ✅
4. `surfaces/syncdown-activity-feed.surface.yaml` ✅
5. `surfaces/syncdown-connect-source.surface.yaml` ✅
6. `adapters/browser/material3-surface-syncdown.ts` ✅
7. `adapters/browser/material3-surface-syncdown-theme.ts` (light/dark + semantic token mapping) ✅

---

## 18. Closing statement

Syncdown v4 should not abandon its detailed Figma work.
It should **subsume** it into the UniversalSurfaceXD model.

That gives Syncdown:

- a stable canonical surface contract
- reuse across the uDOS family
- browser-first fidelity through the Material 3 adapter lane
- cleaner setup/story/feed/workflow semantics
- selective portability to ThinUI, TUI, Markdown and SVG when valuable

In short:

**Figma remains the rich visual source. UniversalSurfaceXD becomes the canonical structural source. Material 3 becomes the primary browser adapter.**

