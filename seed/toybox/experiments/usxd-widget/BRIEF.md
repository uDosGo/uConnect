# USXD Widget Brief

**Status:** Experiment (A2/A3 candidate)  
**Location:** `@toybox/experiments/usxd-widget/`  
**Purpose:** Keep widgets simple: TypeScript/JavaScript components that return USXD

---

## 1. Scope Reduction (Locked)

Widgets are intentionally reduced to a narrow contract:

- TypeScript/JavaScript only
- Execute in uDos runtime (main thread or worker), not external language runtimes
- Import uDos APIs directly (no cross-process MCP bridge required for baseline)
- Return USXD output that existing surfaces already render
- Stored as files (no marketplace packaging in baseline)

If an integration needs heavy runtime isolation, it is a CHASIS app, not a widget.

---

## 2. Widget Contract

```typescript
// @toybox/widgets/health-gauge.ts
import { Widget } from "@udos/widget-api";

export default class HealthWidget extends Widget {
  async onInit() {
    this.title = "Health";
    this.type = "gauge";
  }

  async onRender() {
    const health = await udos.lens.get("nethack.health");
    return `<gauge value="${health}" min="0" max="100" />`;
  }

  async onAction(action: string) {
    if (action === "drink") await udos.lens.inject("nethack", "q\ny\n");
  }
}
```

---

## 3. File Layout

Curated (official):

- `@modules/udos/plugins/widgets/`

User-local:

- `@toybox/widgets/`

Widgets are plain `.ts` / `.js` files.

---

## 4. Rendering Model

Widgets return USXD markup fragments; the same surface renderer consumes them.

```typescript
return `
  <card title="Nethack Health">
    <gauge value="${health}" min="0" max="100" />
    <button action="drink">Drink Potion</button>
  </card>
`;
```

No new renderer layer is required in baseline.

---

## 5. Experiment Goals (`@toybox/experiments/usxd-widget/`)

| Goal | Success Criteria |
|------|------------------|
| TS/JS-only contract | Widget class/function renders USXD |
| Direct API usage | Widget reads LENS and triggers actions directly |
| File-based install | Load widgets from `@toybox/widgets/` |
| Minimal CLI scaffold | `udo widget create|test|list` (A2 path) |

---

## 6. A2/A3 Path

| Phase | Work |
|-------|------|
| **A2** | Baseline widget runtime + CLI scaffolds + local file loading |
| **A3** | Curated plugin registry, promoted widget packs, hardened runtime boundaries |

---

## 7. Guardrail

If a feature needs external runtime, system resources, or deep process isolation:

- move it to CHASIS and embed its surface output

Widgets remain lightweight UI/data components.

---

## Experiment tracking

Listed in `@toybox/experiments/manifest.yaml` (seed: `seed/toybox/experiments/manifest.yaml`).
