# udos-image-nanobanana — integration brief (experimental)

**Status:** ingested into dev-flow · **Upstream:** [nano-banana-pro-mcp](https://github.com/fredporter/nano-banana-pro-mcp) (Fred Porter)

**Module name (target):** `udos-image-nanobanana` (experimental)

This brief captures **Mono Core** rendering rules, style presets, vault hooks, and the fork path for a Universal Device Operating Surface (uDos) native wrapper (not stdio MCP).

---

## Core image rendering (Mono Core)

Upstream defines line/glyph rules in `src/mono-rules.ts` as **`MONO_CORE_INSTRUCTIONS`**:

- Line and glyph layer: **pure `#000000` ink** only on a **fully transparent** background (alpha 0 outside ink).
- No grey, no anti-aliased grey halos, no semi-transparent strokes in the line layer.
- No mid-tones for linework; if shading is needed, use discrete black fills or hatching, still `#000000` only.
- Any colour, gradients, or overlays must be requested as a **separate layer or pass** — default output is **black ink on transparency**.

## Style presets (upstream `src/styles.ts`)

| Preset | Role |
| --- | --- |
| `mono_blueprint` | Industrial blueprint / engineering drawing |
| `mono_botanical` | Specimen plate with stippling |
| `mono_chrome` | Polished chrome specular highlights as white ink |
| `mono_teletext` | Coarse pixel grid / videotext matrix |
| `mono_editorial` | Bold black ink shapes, magazine spot-illustration |

## uGrid framing (upstream `src/prompt-builder.ts`)

Canvas described as **`width_utiles × height_utiles`** with positioning phrases in the assembled prompt.

---

## Output specification (uDos contract)

```yaml
Output Specification:
  - Layer 0 (Mandatory): "#000000" ink on RGBA(0,0,0,0) — pure black linework
  - Layer 1 (Optional): User-requested colour overlay pass
  - No grey intermediates, no anti-aliasing on line strokes
  - Resolution: 1K / 2K / 4K (Flash caps 4K → 2K)
  - Aspect: 1:1, 3:4, 4:3, 9:16, 16:9

Validation Rules:
  - Reject prompts asking for: grey lines, semi-transparent strokes, opacity < 1.0, anti-aliased line art
```

---

## Vault hooks (already present in upstream MCP)

Upstream reads **`vault/system/config.md`** (e.g. `GEMINI_API_KEY`, `DEFAULT_ASPECT_RATIO`, `DEFAULT_IMAGE_SIZE`) and style override via **`UDO_IMAGE_STYLE`** (e.g. in `memory.md`). Generated PNGs land under **`vault/.udos/cache/{uuid}.png`** with history in **`vault/system/memory.md`**.

---

## Integration points (mapping)

| uDos concern | Upstream support |
| --- | --- |
| Tier routing | `tier: "bronze"` → Flash; `"platinum"` → Pro |
| Batch window | 02:00–06:00 UTC → 2s delay for Bronze |
| Cost hints | `estimated_relative_units` per generation |
| USXD alignment | Static wireframe at `public/index.html` (Tailwind + header/dock/centre/footer) |
| Style presets | Five Mono presets + `UDO_IMAGE_STYLE` from memory |

---

## Fork / wrap checklist for uDos

1. **Swap Gemini → uDos-native image endpoint** when/if the monorepo exposes one.
2. **Add uDos authentication** instead of raw `GEMINI_API_KEY` where policy requires it.
3. **Extend style presets** to match uDos design language (keep Mono Core as base).
4. **Wrap as a uDos module** (library / internal API), not only stdio MCP — see sketch below.

---

## Minimal module wrapper (concept)

```typescript
// udos-module-image.ts (conceptual)
import { NanoBananaPro } from "./src/gemini.js";

export const udosImageModule = {
  name: "image.nanobanana",
  version: "0.1.0-experimental",

  render: async (spec: {
    prompt: string;
    style?: "blueprint" | "botanical" | "chrome" | "teletext" | "editorial";
    grid?: { width: number; height: number; placement: string };
    tier?: "bronze" | "silver" | "gold" | "platinum";
  }) => {
    // Apply Mono validation
    // Build prompt with style + grid + Mono Core
    // Call Gemini (or uDos image service)
    // Return { image: base64, cost: number, layers: ["line", "optional-color"] }
  },
};
```

---

## Key upstream files to extract

| File | Purpose |
| --- | --- |
| `src/mono-rules.ts` | Line layer contract — `#000000` on transparent, validation patterns |
| `src/styles.ts` | Five style presets + prompt suffixes |
| `src/prompt-builder.ts` | Prompt assembly (style + uGrid + continue_editing + Mono Core) |
| `src/tier.ts` | Model routing, cost estimation, batch window |
| `src/vault-config.ts` | Vault integration (`config.md`, `memory.md`, cache paths) |

**Design note:** Mono Core rules are the critical invariant — base output is pure black linework on transparency; colour is an optional second pass. This matches a multi-layer image model for uDos.

---

## Tracking

- Alpha roadmap: **T-ALPHA-IMAGE-NB** in [`dev/TASKS.md`](../../TASKS.md).
