# Surface input mapping and UCI

**uDOS-surface** profiles may ship an **`input-mapping.json`** next to **`surface.json`** (e.g. `profiles/ubuntu-gnome/input-mapping.json`). That file is **not** interpreted by ThinUI for rendering; it is an **intent contract** for:

- **uDOS-shell** — keyboard chords, command palette, TUI routing  
- **uDOS-core** UCI — universal controller semantics (radial, actions, session model)

## Rules

1. **ThinUI** does not own global shortcut dispatch. It may consume **host-provided** events once Core/Shell wire them into the state packet or event channel.
2. **Shell** remains the natural place to register **terminal-safe** chords that must not require a browser.
3. **Controller** paths align with the family UCI contract (`uDOS-core`); `input-mapping.json` only names **alignment** (e.g. `uciAlignment: radial-and-actions-contract`), not duplicate action tables.

## Environment variables (Shell)

- **`UDOS_SURFACE_INPUT_MAPPING`** — absolute path to **`input-mapping.json`**.
- **`UDOS_SURFACE_REPO`** — checkout root of **`uDOS-surface`**; with optional **`UDOS_SURFACE_PROFILE_ID`** (default **`ubuntu-gnome`**) resolves **`profiles/<id>/input-mapping.json`**.

## ubuntu-gnome mapping (summary)

| Intent | Declared binding | Consumer (target) |
| --- | --- | --- |
| Command palette | `Ctrl+Shift+P`, `Super+Period` | Shell / host compositor |
| Next / previous panel | `Ctrl+Tab` / `Ctrl+Shift+Tab` | ThinUI host adapter (future) |
| Toggle ThinUI fullscreen | `F11` | GNOME + ThinUI window |
| Escape to host | `Escape` | GNOME focus policy |

## Related

- `uDOS-surface/profiles/ubuntu-gnome/input-mapping.json`  
- `uDOS-surface/contracts/surface-input-mapping.v0.1.schema.json`  
- `examples/uci-command-palette-session.md`  
- `uDOS-surface/docs/surface-experience-layer.md`  
