# Monaspace Font Integration — uDos Teletext Grid Engine

**Status:** Planned for next feature bump  
**Location:** `~/code-vault/vendors/fonts/monaspace/`  
**Purpose:** Base font family + texture healing for ultimate ASCII grid design

---

## 1. What Monaspace Offers uDos (Grid Surfaces Only)

**Core Principle:** Monaspace is for **Grid Themes only**. Prose remains static with JetBrains Mono for simplicity and consistency.

| Feature | Value for uDos |
|---------|----------------|
| **Metrics-compatible families** | Mix `Neon` (code), `Argon` (prose), `Krypton` (dense), `Radon` (wide), `Xenon` (script) — all align on grid |
| **Texture healing** (`calt`) | Automatically adjusts spacing around specific character pairs — prevents awkward gaps in teletext blocks |
| **Variable axes** | Weight, width, italic — dynamic adjustment for different USXD render modes |
| **Character variants** (`cvNN`) | Slashed zeros, alternate asterisks, special symbols — perfect for lo-res graphics |
| **Ligatures** (`liga`, `ss01-ss10`) | `->`, `=>`, `::`, `///` — code-like readability in markdown |
| **Nerd Fonts** (optional) | Icons within monospace grid — could replace some USXD widgets |
| **Web fonts** (WOFF2) | Use same font in terminal, ThinUI, and web surfaces |

**The killer feature for uDos Grid surfaces:** Texture healing + metrics compatibility = **variable-width monospace**. This means teletext blocks can have perfect alignment while still allowing expressive typography.

**Prose surfaces** continue to use JetBrains Mono (static) for code blocks and system fonts for body text.

---

## 2. Lightweight Clone (Grid Only — Variable Fonts)

Since Monaspace is only for Grid surfaces, we only need the variable fonts (not static, not web, not nerd fonts):

```bash
# Shallow clone without history, only fonts/ directory
cd ~/code-vault/vendors/fonts
git clone --depth 1 --filter=blob:none --sparse https://github.com/githubnext/monaspace
cd monaspace
git sparse-checkout set fonts/variable fonts/otf  # OTF as fallback
```

**What we keep for Grid:**
```
fonts/variable/
├── MonaspaceNeonVar.ttf
├── MonaspaceArgonVar.ttf
├── MonaspaceKryptonVar.ttf
├── MonaspaceRadonVar.ttf
└── MonaspaceXenonVar.ttf
```

**What we skip:** `fonts/webfonts/`, `fonts/nerdfonts/`, `fonts/frozen/`, `sources/`

**Size:** ~10MB (vs 750MB full repo, vs 45MB with all fonts)

---

## 3. Integration Points (Grid Only)

### 3.1 Prose Surface (Static — No Monaspace)

Prose surfaces continue to use JetBrains Mono for code blocks and system fonts for body text:

```css
/* Prose surface — JetBrains Mono for code, system for body */
.prose-surface {
  font-family: system-ui, -apple-system, sans-serif; /* Body text */
}

.prose-surface code,
.prose-surface pre {
  font-family: 'JetBrains Mono', 'Menlo', monospace; /* Static, no features */
}
```

### 3.2 Grid Surface (Monaspace — Variable Fonts Only)

Grid surfaces use Monaspace variable fonts exclusively:

```yaml
# ~/code-vault/config/usxd-renderer.yaml
fonts:
  grid:
    family: "Monaspace Neon Var"
    fallback: "Menlo, Monaco, monospace"
    features:
      - calt    # Texture healing (critical for teletext)
      - liga    # Ligatures for code blocks
      - ss01    # Arrow ligatures
      - ss04    # Markup ligatures (</, />)
    axes:
      wdth: 85   # Semi-wide for teletext
      wght: 400
  
  grid_teletext:
    family: "Monaspace Argon Var"
    features:
      - calt
      - cv01    # Slashed zero (teletext style)
      - cv31    # Six-pointed asterisk (block fill)
  
  grid_terminal:
    family: "Monaspace Neon Var"
    axes:
      wdth: 85
      wght: 400
```

### 3.3 Teletext Grid Healing Rules

```css
/* ThinUI / Web rendering */
.teletext-grid {
  font-family: 'Monaspace Argon', monospace;
  font-feature-settings: 'calt' on, 'liga' on, 'cv01' 2, 'cv31' 1;
  line-height: 1.2;
  letter-spacing: 0;
}

/* Teletext block alignment (variable width within monospace) */
.teletext-block {
  font-family: 'Monaspace Neon Var';
  font-variation-settings: 'wdth' 85, 'wght' 450;
}
```

### 3.4 ASCII Grid Designer (New Capability)

With Monaspace, we can build a **grid designer playground** that upgrades to perfect retro graphics:

```
┌─────────────────────────────────────────────────────────────┐
│  Teletext Grid Designer — Monaspace Engine                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ███████████████████████████████████████████████  │    │
│  │  █  ┌─────┐      ┌─────┐      ┌─────┐  ████████████  │    │
│  │  █  │▒▒▒▒▒│      │▒▒▒▒▒│      │▒▒▒▒▒│  ██  LO-RES  ██  │    │
│  │  █  │▒ ▒ ▒│      │▒ ▒ ▒│      │▒ ▒ ▒│  ██  GRID    ██  │    │
│  │  █  │▒▒▒▒▒│      │▒▒▒▒▒│      │▒▒▒▒▒│  ████████████  │    │
│  │  █  └─────┘      └─────┘      └─────┘  ████████████  │    │
│  │  █  [Monaspace Neon]  [Argon]  [Krypton]  [Radon]    │    │
│  │  ███████████████████████████████████████████████████  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Controls: [↺ Reset] [🎨 Palette] [📐 Grid Size] [💾 Export] │
│  Status: Texture healing ON | Variable width: 85%          │
└─────────────────────────────────────────────────────────────┘
```

**Features enabled by Monaspace:**
- **Variable width** — characters like `W` and `i` take different widths but align on grid
- **Texture healing** — no awkward gaps, smooth teletext blocks
- **Character variants** — custom block shapes, lo-res graphics
- **Nerd Fonts** — icons as grid elements (folder, file, widget)

---

## 4. Integration into McSnackS / SwiftBar (Grid Only)

```bash
# ~/Code/McSnackS/automations/font-install.obf
---
title: "Install Monaspace Fonts (Grid Only)"
triggers:
  - type: manual
---

## 1. Clone lightweight fonts (variable only)
```bash
cd ~/code-vault/vendors/fonts
git clone --depth 1 --filter=blob:none --sparse https://github.com/githubnext/monaspace
cd monaspace
git sparse-checkout set fonts/variable fonts/otf
```

## 2. Configure USXD renderer (Grid surfaces only)
```vault
path: "@system/config/usxd-renderer.yaml"
content: |
  fonts:
    # Prose surfaces: static JetBrains Mono
    prose:
      code: "JetBrains Mono"
      body: "system-ui, -apple-system, sans-serif"
      features: []  # No variable features
    
    # Grid surfaces: Monaspace variable
    grid:
      family: "Monaspace Neon Var"
      features: ["calt", "liga", "ss01"]
      axes:
        wdth: 85
        wght: 400
mode: overwrite
```

## 3. Document the separation
```markdown
# Font Strategy

## Prose Surfaces
- **Body text:** System fonts (static)
- **Code blocks:** JetBrains Mono (static)
- **Reason:** Fast, reliable, no complexity

## Grid Surfaces
- **All text:** Monaspace variable fonts
- **Features:** Texture healing, variable width, character variants
- **Reason:** Perfect teletext/ASCII grid alignment
```
```

---

## 5. Teletext Healing Rules Mapping

| Monaspace Feature | Teletext Equivalent | USXD Mode |
|-------------------|---------------------|-----------|
| `calt` | Character spacing healing | `teletext`, `mono` |
| `cv01` (slashed zero) | Teletext `Ø` style | `grid`, `lo-res` |
| `cv31` (6-point asterisk) | Block fill pattern | `teletext` |
| `ss03` (arrows) | Navigation symbols | `gui`, `tui` |
| `ss04` (markup) | Widget borders `</>` | `usxd` |

---

## 6. Success Criteria (Corrected)

### Prose Surface (Static)
- [ ] JetBrains Mono used for code blocks
- [ ] System fonts used for body text
- [ ] No Monaspace dependency
- [ ] Fast, reliable rendering

### Grid Surface (Monaspace)
- [ ] Lightweight clone in `~/code-vault/vendors/fonts/monaspace/` (< 10MB)
- [ ] USXD renderer references Monaspace for Grid only
- [ ] Teletext grid renders with texture healing enabled
- [ ] Character variants work for lo-res graphics
- [ ] Grid designer prototype accepts variable width fonts

### Documentation
- [ ] Clear separation between Prose and Grid font strategies
- [ ] Monaspace only for Grid surfaces documented
- [ ] JetBrains Mono for Prose code blocks documented

---

## Next Steps (Corrected)

### Prose Surface (Static — Already Working)
- [x] JetBrains Mono for code blocks
- [x] System fonts for body text
- [x] No changes needed

### Grid Surface (Monaspace Integration)
1. **Create lightweight clone** in vendor/fonts (variable only)
2. **Update USXD renderer config** to reference Monaspace for Grid
3. **Build grid designer prototype** in `@toybox/experiments/monaspace-grid/`
4. **Test texture healing** with teletext blocks
5. **Document font features** for USXD surface designers

### Documentation Updates
1. **Update all docs** to reflect Prose/Grid separation
2. **Add examples** showing when to use each
3. **Create migration guide** for existing surfaces

---

**This is a major upgrade for uDos Grid rendering.** Monaspace gives us variable-width monospace + texture healing — the perfect foundation for teletext grids that look both retro and polished.

**Key Correction:** Monaspace is for **Grid surfaces only**. Prose surfaces continue to use JetBrains Mono (static) for code blocks and system fonts for body text. This separation ensures:
- **Prose:** Fast, reliable, simple
- **Grid:** Advanced typography, perfect alignment, expressive

**Priority:** High (transforms USXD Grid rendering quality)
**Effort:** Medium (clone + config + testing)
**Impact:** Transformative (teletext blocks, lo-res graphics, perfect grids)
