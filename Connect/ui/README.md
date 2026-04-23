# uDos Connect UI — unified views (`@udos/views`)

Single-source Vue 3 views for vault, tasks, contacts, workflows, dashboard, chat, and settings. Inkdown and the web shell import these components; **do not fork** duplicate implementations elsewhere.

- **Package:** `ui/` → npm name `@udos/views`
- **Entry:** `src/views/index.ts` (types + component re-exports)
- **Tokens:** `src/views/styles/view-tokens.css` (imported per view)
- **Themes:** `src/views/themes/udos-themes.ts` (GitHub/NES/Bedstead/C64 remap to USXD tokens)
- **Publishing bridge:** `src/views/themes/usxd-publish.ts` (`toJekyllMarkdown()` for vault export)
- **Mock data:** `src/views/data/defaults.ts` (override via props when wiring the vault)

**Host bundler alias:** map `@udos/views` → `…/uDos/ui/src/views` (or to this package name once published).

```bash
cd ui && npm run typecheck
```

NextChat embed (`ChatView.vue`) expects `/vendor/nextchat` to be served like the existing widget test bed.

`ProseSurfaceView.vue` is the default browser-oriented surface primitive (cards, panel, prose area, export event).
`ProseSurfaceRouteView.vue` is the route-shell wrapper intended for host router integration.
