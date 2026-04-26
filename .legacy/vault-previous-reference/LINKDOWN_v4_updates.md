## Brief 1: Inkdown‑book → Linkdown‑core (Publishing & Story Views)

**Goal:** Bring book‑style publishing and story/slide rendering into Linkdown (free or premium, as decided).

**What inkdown‑book does well:**
- Converts a folder of markdown into a navigable HTML book/site
- Handles table of contents, cross‑linking, assets
- Supports a simple rendering pipeline (markdown → HTML with layout)

**What Linkdown needs (v4 or v5):**
- **Story view** – narrative flow with optional decisions (Typeform‑style)
- **Slide view** – Marp‑compatible markdown slides
- **Publishing** – export vault sections as static sites (GitHub Pages, local HTML)

**How to integrate (phased):**

| Phase | Work | Output |
|-------|------|--------|
| **1 (v4.0.x)** | Study inkdown‑book’s routing and markdown‑to‑HTML pipeline. Do not copy code – reimplement cleanly in Linkdown’s own TypeScript/Electron stack. | Internal story viewer (read‑only) |
| **2 (v4.1+)** | Add slide support using Marp or similar. Integrate with View Engine (`layout: slide`). | Slide export to PDF/HTML |
| **3 (v5 / premium)** | Full site generator: themes, navigation, RSS, custom domains. Publish to GitHub Pages or local folder. | Premium publishing feature |

**Recommendation:** Start with Phase 1 in Linkdown‑core as a **free feature** (simple story viewer). Move advanced publishing to Linkdown‑premium.

**Action items:**
1. Clone `inkdown-book` and map its rendering pipeline.
2. Write a small spec for Linkdown’s `layout: story` and `layout: slide`.
3. Implement basic markdown → HTML with TOC in Linkdown.

---

## Brief 2: Shiki → Linkdown‑core (Syntax Highlighting)

**Goal:** Add beautiful, fast syntax highlighting to code blocks in Linkdown.

**Why Shiki:**
- Uses VS Code themes (light/dark, many presets)
- Server‑side / static – no client‑side JS required
- Supports most languages
- Small bundle when treeshaken

**Integration plan:**

| Step | Work |
|------|------|
| **1** | Add `shiki` as a dependency in Linkdown‑core |
| **2**** | In the markdown renderer, detect fenced code blocks |
| **3** | Use `shiki.getHighlighter({ theme: 'github-dark' })` once at startup |
| **4** | For each code block, call `highlighter.codeToHtml(code, lang)` |
| **5** | Inject the HTML into the preview pane |

**Theme switching:** Allow user to choose from a few light/dark themes (GitHub, One Dark, etc.) in Settings.

**Performance:** Highlight on save / preview refresh; cache results per file if needed.

**Fallback:** If Shiki fails or language not supported, fall back to plain `<pre><code>`.

**Action items:**
1. Add Shiki to Linkdown‑core.
2. Implement a simple code block renderer hook.
3. Add theme selection to Settings.

---

