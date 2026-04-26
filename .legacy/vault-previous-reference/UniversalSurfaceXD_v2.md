# Universal Surface XD (v2 lane)

**Grid–graphics canon:** **80×30** viewport, **16×24 px** tile raster, teletext **2×3** bridge — locked with uDOS v3. Authoritative spec: **[UniversalSurfaceXD_v2-cannon.md](UniversalSurfaceXD_v2-cannon.md)** · implementation-facing copy in uDOS-v3: **[GRID-GRAPHICS-CANON.md](https://github.com/fredporter/uDOS-v3/blob/main/docs/GRID-GRAPHICS-CANON.md)** (clone sibling optional) · **[usxd_udos_integrated_template.md](usxd_udos_integrated_template.md)**.

**Open source:** This repository is distributed under the [MIT License](../../LICENSE). Upstream: [github.com/fredporter/UniversalSurfaceXD](https://github.com/fredporter/UniversalSurfaceXD).

---

## A. Importer → Surface mapping rules

This is the part that stops Universal Surface XD from becoming vague. Every importer must end in the same internal shape.

Canonical flow

Input
→ Parse
→ Normalise
→ Detect structure
→ Map to primitives
→ Place on grid
→ Emit SurfaceDocument

Shared intermediate format

Every importer should output this before grid mapping:

type NormalisedScene = {
  meta: {
    sourceType: "pdf" | "figma" | "json"
    sourceRef?: string
    title?: string
  }
  frame: {
    width: number
    height: number
  }
  regions: Region[]
  texts: TextSpan[]
  elements: DetectedElement[]
  assets?: AssetRef[]
}

type Region = {
  id: string
  role?: "header" | "sidebar" | "main" | "footer" | "panel" | "group"
  x: number
  y: number
  w: number
  h: number
}

type TextSpan = {
  id: string
  text: string
  styleHint?: "h1" | "h2" | "body" | "caption" | "code"
  x: number
  y: number
  w: number
  h: number
}

type DetectedElement = {
  id: string
  type:
    | "panel"
    | "button"
    | "input"
    | "list"
    | "media"
    | "table"
    | "chart"
    | "group"
  x: number
  y: number
  w: number
  h: number
  props?: Record<string, unknown>
}

type AssetRef = {
  id: string
  type: "image" | "pdf-page" | "figma-node"
  ref: string
}

Mapping rules by importer

PDF → Surface

PDF import should prefer structure over appearance.

Parse stage
Extract:
	•	text blocks
	•	page size
	•	vector rectangles and lines where possible
	•	embedded images
	•	reading order

Detection stage
Infer:
	•	page title
	•	section blocks
	•	side notes
	•	tables
	•	chart/image placeholders
	•	panel-like regions

Primitive mapping
Use these rules:

PDF pattern	Surface node
page/section title	text(h1/h2)
paragraph	text(body)
bullet list	list
boxed content region	panel
form-like field area	input or grouped panel
image/chart	media
table	panel with list or deferred table node later

Grid mapping
Map page bounds into 80×30 grid.

gridX = Math.round((x / pageWidth) * 80)
gridY = Math.round((y / pageHeight) * 30)
gridW = Math.max(1, Math.round((w / pageWidth) * 80))
gridH = Math.max(1, Math.round((h / pageHeight) * 30))

PDF import rules
	•	merge tiny adjacent text spans into one paragraph block
	•	cap top-level regions to about 8 per page
	•	preserve reading order
	•	never import raw styling noise
	•	attach original page ref in refs

⸻

Figma → Surface

Figma import should be structural, not faithful.

Parse stage
Extract:
	•	frames
	•	groups
	•	auto-layout stacks
	•	text layers
	•	basic components
	•	fills, corner radius, stroke only as hints
	•	node ids and source links

Detection stage
Infer:
	•	frame as page/surface
	•	auto-layout as stack
	•	card/group as panel
	•	button component as button
	•	text style as h1/h2/body/caption
	•	image fill as media

Primitive mapping
Use these rules:

Figma node	Surface node
top-level frame	root region / panel
auto-layout vertical	stack(vertical)
auto-layout horizontal	stack(horizontal)
rectangle with grouped contents	panel
text	text
button-like component	button
input-like component	input
image node	media

Figma import rules
	•	flatten excessive nesting
	•	ignore visual-only wrappers unless they define layout
	•	preserve source node ids in refs
	•	map spacing into gap where possible
	•	map style into profile hints, not hardcoded values

⸻

JSON → Surface

This is the easiest and should be first.

Support two kinds of JSON:

1. Native JSON
Already matches SurfaceDocument

2. Mappable JSON
Uses adapters.

type JsonAdapter = {
  id: string
  match(input: unknown): boolean
  toScene(input: unknown): NormalisedScene
}

Good early adapter targets:
	•	dashboard config JSON
	•	form schema JSON
	•	cards/list JSON
	•	markdown-like structured docs JSON

Final mapping rules

After any importer produces NormalisedScene:

Rule 1

Everything must become one of:

grid | stack | panel | text | list | button | input | media

Rule 2

Max node depth: 3

Rule 3

No raw imported styles in core document

Rule 4

All imported sources attach diagnostics

type Diagnostic = {
  level: "info" | "warning" | "error"
  message: string
  sourceId?: string
}

Rule 5

Low-confidence regions should still import, but as panel with warnings

⸻

B. Editor interaction model

This is the product feel. It should feel fast, strict, and obvious.

Core editor idea

Universal Surface XD is not a freeform artboard.

It is:
	•	a fixed grid editor
	•	with direct text editing
	•	block composition
	•	strong snap rules
	•	simple resize and move behaviour

Main editing modes

1. Select mode

For:
	•	selecting nodes
	•	moving nodes
	•	resizing nodes
	•	multi-select

2. Text mode

For:
	•	direct inline editing
	•	heading/body/code style switch
	•	link editing

3. Insert mode

For:
	•	adding panel
	•	text
	•	list
	•	button
	•	input
	•	media

4. Link mode

For:
	•	linking node → node
	•	node → external URL
	•	node → uDOS coordinate
	•	node → source ref

Core interactions

Move

Drag node. It snaps to grid cells.

Rules:
	•	movement is always grid-based
	•	no sub-cell positioning
	•	show ghost preview before drop

Resize

Resize from edges/corners.

Rules:
	•	resize snaps to grid units
	•	minimum width and height per node type
	•	text blocks may auto-grow vertically

Direct text edit

Double-click or Enter on text.

Rules:
	•	edit in place
	•	preserve node bounds where possible
	•	allow overflow warning if content exceeds space

Insert

Toolbar or slash command.

Examples:

/panel
/text
/list
/button
/input
/media

Then place on grid.

Nesting

Only these nesting patterns should be allowed:

grid → positioned nodes
panel → children
stack → children

No arbitrary deep wrapping.

Snap model

Use three snap levels:

1. Grid snap

Primary snap. Always on.

2. Edge alignment

Snap to nearby node edges.

3. Gap rhythm

Snap to preferred spacing units.

Recommended internal spacing rhythm:
1, 2, 3, 4 grid cells

Selection behaviour

Single click:
	•	select node

Shift click:
	•	multi-select

Double click:
	•	enter text or inner content

Escape:
	•	step back out of nested content

Right panel inspector

Keep it small.

For selected node, allow:
	•	kind
	•	title/label/value
	•	text style
	•	link target
	•	source ref
	•	diagnostics
	•	profile hint

Do not recreate a giant design panel.

Keyboard model

Keep this tight:

V   select
T   text
P   panel
L   list
B   button
I   input
M   media
K   link
Del delete
Cmd/Ctrl+D duplicate
Cmd/Ctrl+G group into panel or stack
Arrow keys move by 1 cell
Shift+Arrow resize by 1 cell

Auto-layout behaviour

For stack nodes:
	•	children flow automatically
	•	parent size may auto-fit
	•	gap is editable
	•	alignment is simple: start, centre, end, stretch

This is where Figma-like behaviour is useful, but keep it minimal.

Import review mode

This is important.

After PDF/Figma import, do not drop users straight into a messy canvas.

Show:

Imported Surface Review
- detected regions
- warnings
- source refs
- accept / simplify / split / merge

This turns import into an editable starting point, not a magical promise.

⸻

C. Profile system

This is how you stay on-brand while still allowing “design and demo almost anything”.

Profile model

A profile is not a component set.
It is a rendering skin + spacing + typography rule set.

type SurfaceProfile = {
  id: string
  title: string
  typography: TypographyProfile
  spacing: SpacingProfile
  colour: ColourProfile
  radius: RadiusProfile
  iconSet: IconProfile
  componentHints?: ComponentHints
}

v2.0.1 profiles

1. udos.core

This should be default.

Identity:
	•	mono-icon set
	•	disciplined prose sizing
	•	clear grid rhythm
	•	restrained colour use
	•	strong panel logic
	•	slightly terminal/editorial feel

Suggested characteristics:
	•	base grid: 80×30
	•	tile raster: **16×24 px** per cell (canonical; not square)
	•	font stack: one prose, one mono
	•	spacing scale: 1, 2, 3, 4 cells
	•	radius: low to medium
	•	border use: visible but clean
	•	no emoji

2. udos.wip-brand

This is your public starter template profile.

Identity:
	•	“on-brand” evolving look
	•	same structure as udos.core
	•	more opinionated defaults for demos
	•	ready-made surface examples

Use this for:
	•	public examples
	•	landing pages
	•	dashboards
	•	product mockups

3. neutral.demo

For generic prototyping.

Identity:
	•	minimal styling
	•	broad compatibility
	•	useful for importing external designs without making them instantly “too uDOS”

Profile application rules

Profiles should control:
	•	text sizes and line heights
	•	default padding
	•	default gaps
	•	panel appearance
	•	button appearance
	•	input appearance
	•	colour tokens
	•	icon style

Profiles should not change:
	•	document structure
	•	node semantics
	•	importer logic

That separation is crucial.

Example profile shape

type TypographyProfile = {
  h1: { size: string; lineHeight: string; weight: number }
  h2: { size: string; lineHeight: string; weight: number }
  body: { size: string; lineHeight: string; weight: number }
  caption: { size: string; lineHeight: string; weight: number }
  code: { size: string; lineHeight: string; weight: number }
}

type SpacingProfile = {
  /** Base grid step in px; align with `grid.tile_px.w` (16) for horizontal rhythm. */
  cell_w: number
  cell_h: number
  scale: number[]
  panelPadding: number
  stackGap: number
}

type ColourProfile = {
  bg: string
  fg: string
  muted: string
  border: string
  accent: string
}

type RadiusProfile = {
  panel: number
  button: number
  input: number
}

type IconProfile = {
  family: "mono"
  stroke: number
}

Starter public templates

To make the project useful immediately, ship a few public templates under udos.wip-brand:
	•	app shell
	•	dashboard
	•	form/story flow
	•	document/article
	•	settings screen
	•	data table shell
	•	mobile panel layout

That’s how it becomes easy to demo almost anything.

⸻

📄 docs/SURFACE_DOCUMENT_SCHEMA.md

# SurfaceDocument v2.0.1

Canonical data model for Universal Surface XD.

All importers, editor operations, and exports MUST resolve to this structure.

---

## Overview

SurfaceDocument represents a grid-based UI surface composed of primitive nodes.

Key properties:
- Grid-native (default 80×30)
- Minimal node types
- No styling baked in (handled by profiles)
- Import-friendly and deterministic

---

## Schema

```ts
type SurfaceDocument = {
  meta: {
    id: string
    title: string
    version: "2.0.1"
    profileId: string

    source?: {
      type: "pdf" | "figma" | "json"
      ref?: string
    }
  }

  grid: {
    cols: number   // default: 80
    rows: number   // default: 30
    tile_px: { w: number; h: number }   // default: 16×24
  }

  root: SurfaceNode

  links?: SurfaceLink[]
  refs?: ExternalRef[]
  diagnostics?: Diagnostic[]
}


⸻

Node Types

Only these node types are allowed:

type SurfaceNode =
  | GridNode
  | StackNode
  | PanelNode
  | TextNode
  | ListNode
  | ButtonNode
  | InputNode
  | MediaNode


⸻

Layout Nodes

GridNode

type GridNode = {
  kind: "grid"
  children: PositionedNode[]
}

type PositionedNode = {
  node: SurfaceNode
  grid: {
    x: number
    y: number
    w: number
    h: number
  }
}


⸻

StackNode

type StackNode = {
  kind: "stack"
  direction: "vertical" | "horizontal"
  gap?: number
  children: SurfaceNode[]
}


⸻

PanelNode

type PanelNode = {
  kind: "panel"
  title?: string
  children: SurfaceNode[]
}


⸻

Content Nodes

TextNode

type TextNode = {
  kind: "text"
  style?: "h1" | "h2" | "body" | "caption" | "code"
  value: string
}


⸻

ListNode

type ListNode = {
  kind: "list"
  items: string[]
}


⸻

ButtonNode

type ButtonNode = {
  kind: "button"
  label: string
  action?: string
}


⸻

InputNode

type InputNode = {
  kind: "input"
  name: string
  placeholder?: string
}


⸻

MediaNode

type MediaNode = {
  kind: "media"
  src: string
  alt?: string
}


⸻

Links

type SurfaceLink = {
  fromNodeId: string
  to:
    | { type: "surface"; id: string }
    | { type: "external"; url: string }
    | { type: "coordinate"; value: string }
}


⸻

Diagnostics

type Diagnostic = {
  level: "info" | "warning" | "error"
  message: string
  nodeId?: string
}


⸻

Rules
	1.	Max node depth: 3
	2.	No styling inside nodes
	3.	All layouts must resolve to grid positions
	4.	Importers must attach diagnostics
	5.	Profiles handle all visual appearance

⸻

Philosophy

SurfaceDocument is:
	•	structural, not visual
	•	minimal, not expressive
	•	deterministic, not ambiguous

It is designed for:
	•	ingestion
	•	editing
	•	export
	•	runtime rendering

---

# 📄 `docs/IMPORT_MAPPING_RULES.md`

```markdown
# Import Mapping Rules

Defines how external inputs are converted into SurfaceDocument.

---

## Pipeline

Input → Parse → Normalise → Analyse → Map → Grid → SurfaceDocument

---

## Intermediate Format

All importers must output:

```ts
type NormalisedScene = {
  meta: {
    sourceType: "pdf" | "figma" | "json"
    sourceRef?: string
  }

  frame: {
    width: number
    height: number
  }

  regions: Region[]
  texts: TextSpan[]
  elements: DetectedElement[]
}


⸻

Grid Mapping

All coordinates must map to 80×30 grid:

gridX = (x / width) * 80
gridY = (y / height) * 30

Rounded to nearest integer.

⸻

Primitive Mapping

Input	Output
title	text(h1/h2)
paragraph	text(body)
list	list
box/container	panel
button-like	button
input-like	input
image/chart	media


⸻

PDF Rules
	•	prefer text extraction over OCR
	•	merge small text spans into paragraphs
	•	detect section blocks → panels
	•	preserve reading order
	•	attach page references

⸻

Figma Rules
	•	frames → panels or grid regions
	•	auto-layout → stack
	•	text → text nodes
	•	flatten excessive nesting
	•	ignore styling details
	•	attach node IDs as refs

⸻

JSON Rules
	•	native SurfaceDocument passes through
	•	adapters convert external JSON → NormalisedScene

⸻

Constraints
	•	max 8 top-level regions
	•	max depth: 3
	•	no styling import
	•	unknown elements → panel + warning

⸻

Diagnostics

Importers must emit:
	•	missing structure
	•	low confidence regions
	•	unsupported elements

⸻

Philosophy

We reconstruct structure, not visuals.

The goal is:
	•	editable surfaces
	•	consistent layout
	•	predictable output

---

# 📄 `docs/EDITOR_INTERACTION_MODEL.md`

```markdown
# Editor Interaction Model

Defines how users interact with surfaces.

---

## Core Principle

The editor is grid-based, not freeform.

All interactions align to the grid.

---

## Modes

- Select
- Text
- Insert
- Link

---

## Movement

- drag to move
- snaps to grid
- no sub-cell positioning

---

## Resize

- resize handles
- snaps to grid
- min size enforced

---

## Text Editing

- inline editing
- double-click to edit
- no floating text boxes

---

## Insert

Commands:

/panel
/text
/list
/button
/input
/media

---

## Nesting

Allowed:

grid → positioned nodes
panel → children
stack → children

Max depth: 3

---

## Snap System

1. Grid snap (always on)
2. Edge alignment
3. Gap rhythm (1–4 cells)

---

## Keyboard

V select
T text
P panel
L list
B button
I input
M media
K link

Del delete
Cmd+D duplicate
Arrows move
Shift+Arrows resize

---

## Import Review

After import:

- show detected regions
- show warnings
- allow quick fixes
- then enter editor

---

## Philosophy

- fast
- predictable
- minimal
- no design clutter


⸻

📄 docs/PROFILE_SYSTEM.md

# Profile System

Profiles define visual appearance of surfaces.

---

## Overview

Profiles control:
- typography
- spacing
- colour
- radius
- icons

Profiles DO NOT affect:
- structure
- layout
- node types

---

## Profile Type

```ts
type SurfaceProfile = {
  id: string
  typography: TypographyProfile
  spacing: SpacingProfile
  colour: ColourProfile
  radius: RadiusProfile
  icon: IconProfile
}


⸻

Default Profiles

udos.core
	•	grid-native
	•	mono icon set
	•	consistent spacing
	•	minimal colour
	•	terminal-inspired

⸻

udos.wip-brand
	•	public demo profile
	•	slightly more styled
	•	used for examples

⸻

neutral.demo
	•	minimal styling
	•	good for imports
	•	low visual bias

⸻

Rules
	•	no inline styles in nodes
	•	all visuals from profile
	•	profiles must be swappable

⸻

Philosophy

Profiles are skins, not systems.

They allow:
	•	consistency
	•	theming
	•	flexibility

Without:
	•	complexity
	•	fragmentation

---

# ✅ Next steps

Now that docs are defined:

👉 Implement in this order:

1. `core/` → SurfaceDocument types
2. JSON loader/editor (no UI yet)
3. Basic Svelte grid renderer
4. Manual editing (text + panel)
5. JSON importer (first working pipeline)
6. Then PDF

---

I’ve laid down the bootstrap scaffold and first renderer in the canvas.

It includes:
	•	core TypeScript surface types
	•	basic runtime guards
	•	sample welcomeSurface
	•	Svelte grid renderer
	•	primitive node renderer
	•	starter folder structure

Next best move is wiring:
	1.	workspace package aliases
	2.	click-to-select
	3.	inline text edit
	4.	JSON import path first