# UX designer: distribution, workspaces, Figma, and Swift I/O

How to open this repo in Cursor/VS Code, wire optional product repos, run the browser UX designer, exchange JSON with Swift/tooling, and connect Figma—without committing machine-specific paths.

## Workspace files (what to open)

| File | Use when |
|------|-----------|
| [`UniversalSurfaceXD-v4.template.code-workspace`](../UniversalSurfaceXD-v4.template.code-workspace) | **Minimal**: repo root + `browser-mockup` + `typo`. Root folder name **`UniversalSurfaceXD-v4`** (tasks use `${workspaceFolder:UniversalSurfaceXD-v4}`). |
| [`UniversalSurfaceXD-v4.siblings.code-workspace`](../UniversalSurfaceXD-v4.siblings.code-workspace) | **Multi-repo (v4)**: UniversalSurfaceXD + **`uDOS-v3`** (`../uDOS-family/uDOS-v3`) + optional product siblings (`mdc-mac-app`, `mdc-ios-app`, `uDOS-themes`, …). |
| [`UniversalSurfaceXD-v4.code-workspace`](../UniversalSurfaceXD-v4.code-workspace) | **Same folder set** as `.siblings` (pick one filename for your team). |
| `*.local.code-workspace` | **Gitignored** — copy a template, add **absolute** paths or extra roots for your machine (see below). |

Both **`UniversalSurfaceXD-v4.siblings.code-workspace`** and **`UniversalSurfaceXD-v4.code-workspace`** are committed so clones match without editing; pick one and stick with it for your team to avoid duplicate “current workspace” confusion.

**uDOS integration plan:** [ux-designer-udos-surfaces-roadmap.md](ux-designer-udos-surfaces-roadmap.md).

### Sibling clone layout (relative paths, no `~/` in git)

```text
your-projects/
  UniversalSurfaceXD/     ← clone; open the .code-workspace from here
  uDOS-family/
    uDOS-v3/              ← optional; runnable v3 monorepo (matches workspace path)
    uDOS-themes/
    uDOS-thinui/
    uDOS-docs/
    uDOS-host/
  mdc-mac-app/
  mdc-ios-app/
  sonic-screwdriver/      ← optional
```

Paths in committed `.code-workspace` files are **relative** to UniversalSurfaceXD (for example `../uDOS-family/uDOS-host`). You can group repos under any parent folder name; adjust workspace JSON if your layout differs.

Optional uDOS / Sonic folders can be omitted; the editor may show missing roots until you clone them or remove those entries.

If a sibling folder is missing, the editor may show that root as unavailable until you clone it or remove that entry from the workspace JSON.

### Local overrides (`*.local.code-workspace`)

1. Copy `UniversalSurfaceXD-v4.template.code-workspace` → `UniversalSurfaceXD-v4.local.code-workspace` (gitignored).
2. Add folders with **absolute** paths or non-standard relative paths, e.g.:

```json
{
  "name": "mdc-mac-app",
  "path": "/Users/you/Code/mdc-mac-app"
}
```

3. Open the `.local` file in Cursor/VS Code. Never commit it.

## UX designer (browser app)

From repo root:

```bash
npm install
npm run ux-designer:dev
```

Equivalent:

```bash
cd browser-mockup && npm install && npm run dev
```

- **Lab hub:** [http://localhost:5173/lab](http://localhost:5173/lab)
- **Composer:** edit [surface documents](../interchange/schemas/surface-document.schema.json), preview catalog blocks (e.g. `mdc.mac.app-shell`).
- **UX I/O lab:** paste/download [UX bundles](../interchange/README.md) (stories + tokens).

Details: [browser-mockup/README.md](../browser-mockup/README.md).

## Optional: uDOS-host contract check

When you have a local clone of **[uDOS-host](https://github.com/fredporter/uDOS-host)**, validate that every `contracts/**/*.json` file is listed in [interchange/manifests/udos-host-contracts.manifest.json](../interchange/manifests/udos-host-contracts.manifest.json):

```bash
npm run ux:validate-udos-host-contracts
```

Default lookup is **`../uDOS-family/uDOS-host`** (matches [`UniversalSurfaceXD-v4.siblings.code-workspace`](../UniversalSurfaceXD-v4.siblings.code-workspace)). Set **`UDOS_HOST_ROOT`** to point at your clone if it lives elsewhere. If the directory is missing, the script prints a skip message and exits successfully — same behavior as a machine without optional siblings.

## Swift UX I/O (interchange)

**CLI (authoritative for CI and merges):** from **UniversalSurfaceXD** repo root:

```bash
npm install
npm run ux:export -- --out interchange/exports/bundle.json
npm run ux:import -- interchange/examples/sample-ux-bundle.json
```

- **Export** — scans Storybook story titles + `spine/tokens`.
- **Import** — validates; optional `--apply` for token merge (use with care).

Surface layouts (composer) live as separate JSON under [`interchange/examples/`](../interchange/examples/) (e.g. `surface-mdc-mac-shell.json`). Swift does not consume these automatically today; they are the **contract** for naming and layout intent alongside [`docs/swift-xcode-path.md`](swift-xcode-path.md) and product repos.

## Figma

### Static handoff (no MCP)

- **Mac shell wireframe → Figma frames:** [figma-handoff-mdc-mac-app.md](figma-handoff-mdc-mac-app.md)
- **Tokens:** mirror [`spine/tokens/`](../spine/tokens/) into Figma Variables; keep **semantic names** aligned with this repo.

### MCP (AI / Cursor talking to Figma)

1. **Official Figma MCP** — [Figma developer docs: MCP server](https://developers.figma.com/docs/figma-mcp-server/) (remote or desktop). Prefer this when you care about **vendor support**, docs, and security review.
2. **Third-party “Figma MCP Magic”** (Mac App Store) — runs a **local** MCP bridge for tools like Cursor/Claude. It can be **convenient** for experiments; treat it like any third-party client: review **privacy**, updates, and whether your org allows it. For production or sensitive files, compare features and trust model with **Figma’s official** MCP path above.

Neither MCP replaces **this repo** as the source for **tokens and naming**; use Figma for visuals and exploration, interchange + spine for structured UX I/O.

## Related docs

- [interchange/README.md](../interchange/README.md) — bundle CLI and schemas
- [browser-mockup/README.md](../browser-mockup/README.md) — UX designer app
- [figma-handoff-mdc-mac-app.md](figma-handoff-mdc-mac-app.md) — MDC Mac shell in Figma
- [swift-xcode-path.md](swift-xcode-path.md) — Xcode / Swift handoff notes
