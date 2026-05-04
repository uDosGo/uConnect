# `templates/usxd/`

Each **child folder** is a theme pack (e.g. `default/`). VA1 **`udo usxd apply <name>`** copies `templates/usxd/<name>/` into `vault/system/usxd/current/` and records `system/usxd/active.json`.

Required for publish styling: include **`theme.css`** (used for `udo publish build` → `vault/.site/assets/theme.css`).
