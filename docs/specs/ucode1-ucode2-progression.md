# Progression of uDos Runtime & Lexicon: uCode1 → uCode2

This document traces the evolution of the **Lexicon**, **MDX/UDX runtime**, **commands**, **snacks**, **Vibe skills**, and **GitHub Spark** from uCode1 to uCode2. It shows how each component scales, integrates, and unlocks new capabilities.

---

## 📊 Comparative Overview: uCode1 vs uCode2

| Feature | uCode1 (Lo‑Fi) | uCode2 (Expanded) |
|---------|----------------|-------------------|
| **Max Slots** | 128 | 256 |
| **Commands** | 32 (slots 0-31) | 64 (slots 0-63) |
| **Snacks** | 32 (slots 32-63) | 64 (slots 64-127) |
| **Aliases** | 32 (slots 96-127) | 64 (slots 192-255) |
| **Visual‑only** | 32 (slots 64-95) | 64 (slots 128-191) |
| **Emoji/Teletext** | 128 overlays | 256 overlays |
| **Word Aliases** | 128 (`:word:`) | 256 (`:word:`) |
| **Vibe Skills** | Not native | First‑class (Snack wrappers) |
| **GitHub Spark** | Not available | Full integration |
| **MDX Runtime** | Basic (static) | Dynamic, executable |
| **UDX Grid** | ASCII only | ASCII + Tailwind + React |
| **Publishing** | Local only | GitHub Pages + Spark deployment |

---

## 🧬 uCode1: The Foundation (128 Slots, Lo‑Fi)

### Slot Map (uCode1)

```
┌────────┬──────────────────┬─────────────────────────┐
│ Slots  │ Type             │ Purpose                 │
├────────┼──────────────────┼─────────────────────────┤
│ 0-31   │ Commands         │ Core uCode functions    │
│ 32-63  │ Snacks           │ Executable containers   │
│ 64-95  │ Visual‑only      │ ANSI/emoji/teletext     │
│ 96-127 │ Aliases          │ Pointers to 0-63        │
└────────┴──────────────────┴─────────────────────────┘
```

### MDX Runtime (uCode1)

In uCode1, MDX is **static** – it renders `.mdx` files as HTML with basic component support.

```mdx
# My Dashboard

<Snack id="32" />  <!-- Renders Postie snack output as static HTML -->
```

**Limitations:** No user interaction, no dynamic data, no publishing.

### UDX Grid (uCode1)

ASCII‑only grid rendering in TUI.

```yaml
# flows/dashboard.udx
ascii_layout: |
  ┌─────┬─────┐
  │  H  │  S  │
  ├─────┼─────┤
  │  F  │  N  │
  └─────┴─────┘
```

**Rendered in:** TUI (ASCII/Teletext).

---

## 🧬 uCode2: The Expansion (256 Slots, Full Spectrum)

### Slot Map (uCode2)

```
┌─────────┬──────────────────┬─────────────────────────┐
│ Slots   │ Type             │ Purpose                 │
├─────────┼──────────────────┼─────────────────────────┤
│ 0-63    │ Commands         │ Core + extended functions│
│ 64-127  │ Snacks           │ Executable containers   │
│ 128-191 │ Visual‑only      │ ANSI/emoji/teletext     │
│ 192-255 │ Aliases          │ Pointers to 0-127       │
└─────────┴──────────────────┴─────────────────────────┘
```

### New Commands in uCode2 (Slots 32-63)

| Slot | Machine | Human | Emoji | Description |
|------|---------|-------|-------|-------------|
| 32 | `udos:spark` | Spark | ✨ | "Launch GitHub Spark micro‑app" |
| 33 | `udos:publish` | Publish | 📤 | "Deploy to GitHub Pages" |
| 34 | `udos:skill` | Skill | 🎯 | "Run Vibe skill" |
| 35 | `udos:snackbox` | SnackBox | 📦 | "Manage snack collections" |
| 36 | `udos:lexicon` | Lexicon | 📖 | "Edit term mappings" |
| 37 | `udos:yarn` | Yarn | 🧶 | "Generate stories from feed" |
| 38 | `udos:grid` | Grid | 🧩 | "Render dynamic grid" |
| 39 | `udos:cell` | Cell | 🔲 | "Access storage cells" |
| 40-63 | (reserved) | – | – | "Future commands" |

### New Snacks in uCode2 (Slots 64-127)

| Slot | Snack ID | Human | Emoji | Description |
|------|----------|-------|-------|-------------|
| 64 | `SPARK-001` | Spark Launcher | ✨ | "Launch a Spark from spec" |
| 65 | `SKILL-001` | Skill Runner | 🎯 | "Execute Vibe skill" |
| 66 | `PUBLISH-001` | Pages Deployer | 📤 | "Deploy to GitHub Pages" |
| 67 | `SNACKBOX-001` | Box Packer | 📦 | "Pack snacks into box" |
| 68-127 | (available) | – | – | "User snacks" |

---

## 🎯 Vibe Skills Become Snacks

In uCode2, **Vibe skills** are first‑class citizens – they become **snacks** that can be executed, aliased, and composed.

### Mapping: Vibe Skill → Snack

```yaml
# .snacks/github-pr-summary.snack (originally a Vibe skill)
id: SKILL-001
name: "GitHub PR Summary"
runtime: vebe-skill
source: |
  # Original Vibe skill script
  fetch_github_prs()
  summarize()
  post_to_slack()
emoji: "📊"
tags: ["github", "pr", "summary"]
```

### Executing a Vibe Skill as a Snack

```bash
# uCode1 way (not available)
# uCode2 way
ucode snack run SKILL-001 --repo uDosGo/uCode1 --pr 42
```

Or via alias:

```bash
ucode alias add pr-summary --target SKILL-001 --emoji 📊
ucode pr-summary --repo uDosGo/uCode1 --pr 42
```

---

## ✨ GitHub Spark Integration (uCode2)

**GitHub Spark** is a micro‑app framework. In uCode2, Sparks become **executable snacks** that can be:
- Launched from the CLI
- Embedded in MDX
- Deployed to GitHub Pages

### Spark → Snack Mapping

```yaml
# .snacks/weather-spark.snack
id: SPARK-001
name: "Weather Spark"
runtime: github-spark
spark_url: "https://spark.github.com/weather"
emoji: "🌤️"
tags: ["weather", "widget"]
```

### Launching a Spark from CLI

```bash
ucode spark run weather-spark --location "San Francisco"
```

### Embedding Spark in MDX

```mdx
# My Dashboard

<Spark id="SPARK-001" params={{ location: "San Francisco" }} />
```

When rendered in ThinUI, the Spark micro‑app loads and becomes interactive.

---

## 📦 SnackBox Deployment to GitHub Pages (uCode2)

A **SnackBox** is a collection of snacks. In uCode2, snackboxes can be **published** to GitHub Pages as a website.

### Creating a SnackBox

```bash
ucode snackbox create my-dashboard
ucode snackbox add SPARK-001   # Weather Spark
ucode snackbox add SKILL-001   # PR Summary
ucode snackbox add P100-U899    # Postie
```

### Publishing to GitHub Pages

```bash
ucode publish --target my-dashboard --type snackbox
```

This generates:
- `index.html` – Grid UI showing all snacks as cards
- `snackbox.json` – Machine‑readable manifest
- Each snack rendered as an interactive widget (Spark) or static output (Snack)

### Result: `https://username.github.io/my-dashboard/`

Users can:
- Click a snack to execute it (via uDos backend)
- See live output from snacks
- Launch Spark micro‑apps

---

## 🔄 MDX Runtime Evolution (uCode1 → uCode2)

| Feature | uCode1 | uCode2 |
|---------|--------|--------|
| **Static rendering** | ✅ | ✅ |
| **Dynamic snacks** | ❌ | ✅ (live execution) |
| **Spark embedding** | ❌ | ✅ |
| **User interaction** | ❌ | ✅ (forms, buttons) |
| **Real‑time updates** | ❌ | ✅ (WebSocket) |
| **Publishing** | ❌ | ✅ (GitHub Pages) |

### uCode2 MDX Example (Interactive)

```mdx
# Live Dashboard

<Snack id="SPARK-001" params={{ location: "San Francisco" }} />

<Form onSubmit="/api/run-snack">
  <input name="repo" />
  <button>Run PR Summary</button>
</Form>

<Grid src="/flows/dashboard.udx" interactive={true} />
```

---

## 🧩 UDX Grid Evolution (uCode1 → uCode2)

| Feature | uCode1 | uCode2 |
|---------|--------|--------|
| **ASCII layout** | ✅ | ✅ |
| **Component mapping** | ✅ | ✅ |
| **Tailwind CSS** | ❌ | ✅ |
| **React components** | ❌ | ✅ |
| **Interactive cells** | ❌ | ✅ (click, drag) |
| **Real‑time updates** | ❌ | ✅ |

### uCode2 UDX Example (Tailwind + React)

```yaml
# flows/dashboard.udx
version: 2
renderer: "blitz"
tailwind: true

ascii_layout: |
  ┌─────────┬─────────┐
  │    H    │    S    │
  ├─────────┼─────────┤
  │    F    │    N    │
  └─────────┴─────────┘

mapping:
  - cell: [0,0]
    component: "HealthWidget"
    props: { class: "bg-green-100 p-4 rounded" }
    interactive: true
    refresh_ms: 5000
```

---

## 📈 Summary: Progression Roadmap

| Edition | Slots | Commands | Snacks | Aliases | Vibe Skills | GitHub Spark | MDX | UDX | Publishing |
|---------|-------|----------|--------|---------|-------------|--------------|-----|-----|------------|
| **uCode1** | 128 | 32 | 32 | 32 | ❌ | ❌ | Static | ASCII | Local |
| **uCode2** | 256 | 64 | 64 | 64 | ✅ | ✅ | Dynamic | Tailwind+React | GitHub Pages |
| **uCode3** | 512 | 128 | 128 | 128 | ✅ (native) | ✅ (full) | AI‑generated | Spatial | Decentralised / Console |
| **uCode4** | 1024 | 256 | 256 | 256 | ✅ (orchestrated) | ✅ (metaverse) | Immersive | 3D Voxel | Interdimensional / VR |

---

## uCode3: Console / Tablet / Touch (512 Slots)

uCode3 bridges uCode2's grid layers to uCode4's 3D space. It introduces **console-mode rendering**, **game controller input**, and **tablet touch surfaces**.

### New Commands (Slots 64–127)

| Slot | Machine | Human | Emoji | Description |
|------|---------|-------|-------|-------------|
| 64 | `udos:console` | Console | 🎮 | "Launch console mode" |
| 65 | `udos:layback` | Layback | 🛋️ | "Enter layback computing mode" |
| 66 | `udos:controller` | Controller | 🕹️ | "Configure game controller" |
| 67 | `udos:spatial-nav` | SpatialNav | 🧭 | "Navigate spatial map" |
| 68 | `udos:teleport` | Teleport | 🌐 | "Jump to grid coordinate" |
| 69 | `udos:voice` | Voice | 🎤 | "Voice command input" |
| 70 | `udos:gesture` | Gesture | ✋ | "Gesture control input" |
| 71–127 | (reserved) | – | – | "Future console commands" |

### Layback Computing

The game controller becomes the primary input device:
- **D-pad**: Navigate grid rows/columns
- **A/B/X/Y**: Activate, back, context, quick-launch
- **L1/R1**: Layer up/down
- **L2/R2**: Zoom out/in on spatial view
- **Start/Select**: Menu, map toggle

---

## uCode4: Interdimensional / 3D (1024 Slots)

uCode4 adds true 3D rendering, volumetric spatial indexing, and immersive input.

### Slot Architecture

```
┌───────────┬─────────────────────┬───────────────────────────────┐
│ Slots     │ Type                │ Purpose                       │
├───────────┼─────────────────────┼───────────────────────────────┤
│ 0–127     │ Commands            │ Core + extended (from uCode3) │
│ 128–255   │ Snacks              │ Executable containers         │
│ 256–383   │ Visual (ANSI/Emoji) │ 3D-optimised visual overlays  │
│ 384–511   │ Aliases             │ Pointers to 0–255             │
│ 512–639   │ Spatial objects     │ 3D models, voxels, volumes    │
│ 640–767   │ Animation channels  │ Motion sequences, timelines   │
│ 768–895   │ Sound / Audio       │ 3D spatial audio sources      │
│ 896–1023  │ Reserved            │ Future expansion              │
└───────────┴─────────────────────┴───────────────────────────────┘
```

---

## 🔑 Key Takeaways

1. **Vibe skills become snacks** in uCode2 – they are executable containers with slots, aliases, and descriptions.
2. **GitHub Spark** is a first‑class runtime – sparks are snacks that render as interactive micro‑apps in MDX.
3. **MDX evolves** from static (uCode1) to dynamic + interactive (uCode2) with real‑time updates.
4. **UDX grids** gain Tailwind + React + interactivity – same ASCII layout, richer rendering.
5. **SnackBox publishing** to GitHub Pages turns collections of snacks into deployable websites.
6. **Slot count doubles** – 128 → 256 – accommodating more commands, snacks, and aliases.

---

**Locked for uCode2 planning.** This progression shows exactly how uCode1's tight, constrained system expands gracefully into uCode2's rich, web‑connected ecosystem – without breaking backwards compatibility.
