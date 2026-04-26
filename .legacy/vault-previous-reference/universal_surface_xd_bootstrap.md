# Universal Surface XD bootstrap

**Geometry:** canonical viewport **80×30**, tile raster **16×24 px** per cell (not square). Prefer `grid.tile_px: { w, h }` over a single `cell` size so canvas math matches [GRID-GRAPHICS-CANON.md](https://github.com/fredporter/uDOS-v3/blob/main/docs/GRID-GRAPHICS-CANON.md) and [UniversalSurfaceXD_v2-cannon.md](UniversalSurfaceXD_v2-cannon.md).

## Folder scaffold

```text
universal-surface-xd/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── lib/
│       │   │   ├── components/
│       │   │   │   ├── SurfaceCanvas.svelte
│       │   │   │   ├── SurfaceNodeView.svelte
│       │   │   │   └── GridOverlay.svelte
│       │   │   └── sample/
│       │   │       └── welcome.surface.ts
│       │   └── routes/
│       │       └── +page.svelte
│       └── package.json
├── packages/
│   └── core/
│       └── src/
│           ├── index.ts
│           ├── types.ts
│           └── guards.ts
└── docs/
    ├── SURFACE_DOCUMENT_SCHEMA.md
    ├── IMPORT_MAPPING_RULES.md
    ├── EDITOR_INTERACTION_MODEL.md
    └── PROFILE_SYSTEM.md
```

## `packages/core/src/types.ts`

```ts
export type SurfaceTextStyle = "h1" | "h2" | "body" | "caption" | "code";

export type SurfaceDocument = {
  meta: {
    id: string;
    title: string;
    version: "2.0.1";
    profileId: string;
    source?: {
      type: "pdf" | "figma" | "json";
      ref?: string;
    };
  };
  grid: {
    cols: number;
    rows: number;
    /** Pixel width/height of one grid cell (canonical: 16×24). */
    tile_px: { w: number; h: number };
  };
  root: GridNode;
  links?: SurfaceLink[];
  refs?: ExternalRef[];
  diagnostics?: Diagnostic[];
};

export type SurfaceNode =
  | GridNode
  | StackNode
  | PanelNode
  | TextNode
  | ListNode
  | ButtonNode
  | InputNode
  | MediaNode;

export type GridNode = {
  kind: "grid";
  children: PositionedNode[];
};

export type PositionedNode = {
  id: string;
  node: Exclude<SurfaceNode, GridNode>;
  grid: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};

export type StackNode = {
  kind: "stack";
  direction: "vertical" | "horizontal";
  gap?: number;
  children: Exclude<SurfaceNode, GridNode>[];
};

export type PanelNode = {
  kind: "panel";
  title?: string;
  children: Exclude<SurfaceNode, GridNode>[];
};

export type TextNode = {
  kind: "text";
  style?: SurfaceTextStyle;
  value: string;
};

export type ListNode = {
  kind: "list";
  items: string[];
};

export type ButtonNode = {
  kind: "button";
  label: string;
  action?: string;
};

export type InputNode = {
  kind: "input";
  name: string;
  placeholder?: string;
};

export type MediaNode = {
  kind: "media";
  src: string;
  alt?: string;
};

export type SurfaceLink = {
  fromNodeId: string;
  to:
    | { type: "surface"; id: string }
    | { type: "external"; url: string }
    | { type: "coordinate"; value: string };
};

export type ExternalRef = {
  id: string;
  type: "pdf-page" | "figma-node" | "json-source";
  ref: string;
};

export type Diagnostic = {
  level: "info" | "warning" | "error";
  message: string;
  nodeId?: string;
};
```

## `packages/core/src/guards.ts`

```ts
import type { SurfaceDocument, SurfaceNode } from "./types";

const NODE_KINDS = new Set([
  "grid",
  "stack",
  "panel",
  "text",
  "list",
  "button",
  "input",
  "media",
]);

export function isSurfaceNode(value: unknown): value is SurfaceNode {
  if (!value || typeof value !== "object") return false;
  const kind = (value as { kind?: unknown }).kind;
  return typeof kind === "string" && NODE_KINDS.has(kind);
}

export function isSurfaceDocument(value: unknown): value is SurfaceDocument {
  if (!value || typeof value !== "object") return false;

  const doc = value as Partial<SurfaceDocument>;

  return Boolean(
    doc.meta &&
      typeof doc.meta.id === "string" &&
      typeof doc.meta.title === "string" &&
      doc.meta.version === "2.0.1" &&
      doc.grid &&
      typeof doc.grid.cols === "number" &&
      typeof doc.grid.rows === "number" &&
      doc.grid.tile_px &&
      typeof doc.grid.tile_px.w === "number" &&
      typeof doc.grid.tile_px.h === "number" &&
      doc.root?.kind === "grid" &&
      Array.isArray(doc.root.children),
  );
}
```

## `packages/core/src/index.ts`

```ts
export * from "./types";
export * from "./guards";
```

## `apps/web/src/lib/sample/welcome.surface.ts`

```ts
import type { SurfaceDocument } from "../../../../packages/core/src";

export const welcomeSurface: SurfaceDocument = {
  meta: {
    id: "welcome-surface",
    title: "Universal Surface XD",
    version: "2.0.1",
    profileId: "udos.wip-brand",
  },
  grid: {
    cols: 80,
    rows: 30,
    tile_px: { w: 16, h: 24 },
  },
  root: {
    kind: "grid",
    children: [
      {
        id: "hero",
        grid: { x: 2, y: 2, w: 76, h: 6 },
        node: {
          kind: "panel",
          title: "Universal Surface XD",
          children: [
            {
              kind: "text",
              style: "body",
              value:
                "Grid-native surface designer for PDFs, Figma and JSON. Fast structure first, styling second.",
            },
          ],
        },
      },
      {
        id: "left-panel",
        grid: { x: 2, y: 10, w: 24, h: 14 },
        node: {
          kind: "panel",
          title: "Inputs",
          children: [
            {
              kind: "list",
              items: ["PDF import", "Figma import", "JSON adapters", "Surface review"],
            },
          ],
        },
      },
      {
        id: "centre-panel",
        grid: { x: 28, y: 10, w: 24, h: 14 },
        node: {
          kind: "panel",
          title: "Editor",
          children: [
            {
              kind: "stack",
              direction: "vertical",
              gap: 1,
              children: [
                { kind: "text", style: "body", value: "Direct text editing" },
                { kind: "text", style: "body", value: "Grid snapping" },
                { kind: "button", label: "Insert panel" },
              ],
            },
          ],
        },
      },
      {
        id: "right-panel",
        grid: { x: 54, y: 10, w: 24, h: 14 },
        node: {
          kind: "panel",
          title: "Links",
          children: [
            {
              kind: "stack",
              direction: "vertical",
              gap: 1,
              children: [
                { kind: "text", style: "body", value: "Surface links" },
                { kind: "text", style: "body", value: "External refs" },
                { kind: "text", style: "body", value: "uDOS coordinates" },
              ],
            },
          ],
        },
      },
    ],
  },
};
```

## `apps/web/src/lib/components/GridOverlay.svelte`

```svelte
<script lang="ts">
  export let cols = 80;
  export let rows = 30;
</script>

<div
  class="pointer-events-none absolute inset-0 opacity-20"
  style={`background-image:
    linear-gradient(to right, currentColor 1px, transparent 1px),
    linear-gradient(to bottom, currentColor 1px, transparent 1px);
    background-size: calc(100% / ${cols}) calc(100% / ${rows});`}
/>
```

## `apps/web/src/lib/components/SurfaceNodeView.svelte`

```svelte
<script lang="ts">
  import type {
    ButtonNode,
    InputNode,
    ListNode,
    MediaNode,
    PanelNode,
    StackNode,
    SurfaceNode,
    TextNode,
  } from "../../../../packages/core/src";

  export let node: Exclude<SurfaceNode, { kind: "grid" }>;

  const textClass: Record<string, string> = {
    h1: "text-2xl font-semibold",
    h2: "text-xl font-semibold",
    body: "text-sm leading-6",
    caption: "text-xs uppercase tracking-wide opacity-70",
    code: "font-mono text-xs",
  };

  function isText(value: SurfaceNode): value is TextNode {
    return value.kind === "text";
  }

  function isPanel(value: SurfaceNode): value is PanelNode {
    return value.kind === "panel";
  }

  function isStack(value: SurfaceNode): value is StackNode {
    return value.kind === "stack";
  }

  function isList(value: SurfaceNode): value is ListNode {
    return value.kind === "list";
  }

  function isButton(value: SurfaceNode): value is ButtonNode {
    return value.kind === "button";
  }

  function isInput(value: SurfaceNode): value is InputNode {
    return value.kind === "input";
  }

  function isMedia(value: SurfaceNode): value is MediaNode {
    return value.kind === "media";
  }
</script>

{#if isPanel(node)}
  <section class="flex h-full flex-col rounded-xl border border-black/15 bg-white/90 p-4 shadow-sm">
    {#if node.title}
      <div class="mb-3 font-mono text-xs uppercase tracking-wide text-black/60">{node.title}</div>
    {/if}
    <div class="flex min-h-0 flex-1 flex-col gap-3">
      {#each node.children as child}
        <svelte:self node={child} />
      {/each}
    </div>
  </section>
{:else if isStack(node)}
  <div class={`flex ${node.direction === "horizontal" ? "flex-row" : "flex-col"}`} style={`gap:${(node.gap ?? 1) * 0.5}rem;`}>
    {#each node.children as child}
      <svelte:self node={child} />
    {/each}
  </div>
{:else if isText(node)}
  <p class={textClass[node.style ?? "body"]}>{node.value}</p>
{:else if isList(node)}
  <ul class="list-disc space-y-2 pl-5 text-sm leading-6">
    {#each node.items as item}
      <li>{item}</li>
    {/each}
  </ul>
{:else if isButton(node)}
  <button class="w-fit rounded-lg border border-black/15 px-3 py-2 font-mono text-xs uppercase tracking-wide">
    {node.label}
  </button>
{:else if isInput(node)}
  <label class="flex flex-col gap-2">
    <span class="font-mono text-xs uppercase tracking-wide text-black/60">{node.name}</span>
    <input class="rounded-lg border border-black/15 px-3 py-2 text-sm" placeholder={node.placeholder} />
  </label>
{:else if isMedia(node)}
  <figure class="overflow-hidden rounded-lg border border-black/15">
    <img class="h-full w-full object-cover" src={node.src} alt={node.alt ?? ""} />
  </figure>
{/if}
```

## `apps/web/src/lib/components/SurfaceCanvas.svelte`

```svelte
<script lang="ts">
  import type { SurfaceDocument } from "../../../../packages/core/src";
  import GridOverlay from "./GridOverlay.svelte";
  import SurfaceNodeView from "./SurfaceNodeView.svelte";

  export let document: SurfaceDocument;

  const tw = document.grid.tile_px.w;
  const th = document.grid.tile_px.h;
  const width = document.grid.cols * tw;
  const height = document.grid.rows * th;
</script>

<div class="rounded-2xl border border-black/15 bg-neutral-50 p-4 shadow-sm">
  <div
    class="relative overflow-hidden rounded-xl bg-white text-black"
    style={`width:${width}px; height:${height}px;`}
  >
    <GridOverlay cols={document.grid.cols} rows={document.grid.rows} />

    {#each document.root.children as child}
      <div
        class="absolute p-1"
        style={`left:${child.grid.x * tw}px;
          top:${child.grid.y * th}px;
          width:${child.grid.w * tw}px;
          height:${child.grid.h * th}px;`}
      >
        <SurfaceNodeView node={child.node} />
      </div>
    {/each}
  </div>
</div>
```

## `apps/web/src/routes/+page.svelte`

```svelte
<script lang="ts">
  import SurfaceCanvas from "$lib/components/SurfaceCanvas.svelte";
  import { welcomeSurface } from "$lib/sample/welcome.surface";
</script>

<svelte:head>
  <title>Universal Surface XD</title>
  <meta name="description" content="Universal Surface XD bootstrap renderer" />
</svelte:head>

<div class="min-h-screen bg-neutral-100 px-6 py-8 text-black">
  <div class="mx-auto flex max-w-[1400px] flex-col gap-6">
    <header class="flex flex-col gap-2">
      <p class="font-mono text-xs uppercase tracking-[0.2em] text-black/60">Universal Surface XD</p>
      <h1 class="text-3xl font-semibold">First working renderer</h1>
      <p class="max-w-3xl text-sm leading-6 text-black/75">
        This bootstrap proves the core data model, grid layout, and primitive rendering path.
        Importers can target this document format next.
      </p>
    </header>

    <SurfaceCanvas document={welcomeSurface} />
  </div>
</div>
```

## Notes for immediate next implementation

1. Move shared package imports to a proper workspace alias such as `@universal-surface-xd/core`.
2. Add a `surface.schema.json` and runtime validation layer after the first render is stable.
3. Add click selection state to `SurfaceCanvas.svelte` before drag/resize.
4. Make `TextNode` editable inline before adding insert mode.
5. Implement JSON import first, then PDF.
```

