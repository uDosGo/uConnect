# @udos/milkdown-plugins

Starter package for Milkdown-oriented OBF and USXD fence handling in the uDos monorepo.

## Current scope

- Parse ` ```obf` fenced blocks from markdown
- Parse ` ```usxd` fenced blocks from markdown
- Provide minimal HTML render helpers for editor previews

## Next steps

- Wire real Milkdown node/schema plugins
- Add command bindings for insert/toggle OBF and USXD blocks
- Add bridge calls to `core-rs` via HTTP or WASM for canonical render/validation
