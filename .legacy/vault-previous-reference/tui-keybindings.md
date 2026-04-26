# uDOS-shell TUI Keybinding Contract

Status: active  
Updated: 2026-04-02

## Purpose

Define the active terminal-first shortcut model for the `uDOS-shell` TUI.

## Platform Rule

`uDOS-shell` should not define custom `Cmd` or Command-key shortcuts.

The TUI should stay terminal-first and portable across macOS, Linux, remote
shells, and standard terminal emulators. Shortcut design should therefore prefer:

- `Ctrl` bindings
- `Esc`
- `Tab` and `Shift+Tab`
- arrow and paging keys
- function keys where needed

## Active Core Shortcuts

These shortcuts are implemented in the current Go bootstrap:

| Key | Meaning |
|---|---|
| `Ctrl+C` | Exit the shell immediately |
| `Esc` | Close help or menu overlay |
| `Enter` | Submit the current command |
| `Backspace` | Delete the previous character |
| `Ctrl+L` | Redraw the screen |
| `?` | Toggle help overlay |
| `:` | Open the reusable menu selector |
| `Up` `Down` | Move within the menu selector |

## Reserved Global Shortcuts

These are part of the contract but are not fully implemented yet:

| Key | Meaning |
|---|---|
| `Tab` | Move to the next pane or field |
| `Shift+Tab` | Move to the previous pane or field |
| `/` | Enter search or filter mode |

## Reserved Navigation Shortcuts

| Key | Meaning |
|---|---|
| `Left` `Right` | Change pane or level |
| `Home` | Jump to start |
| `End` | Jump to end |
| `PgUp` `PgDn` | Page through longer views |

## Reserved Input Editing Shortcuts

| Key | Meaning |
|---|---|
| `Ctrl+A` | Start of line |
| `Ctrl+E` | End of line |
| `Ctrl+U` | Delete line |
| `Ctrl+W` | Delete word |
| `Ctrl+K` | Delete to end |
| `Ctrl+Y` | Paste buffer |
| `Ctrl+D` | Delete character |

## Surface profile input mapping (help)

When **`UDOS_SURFACE_INPUT_MAPPING`** points at a profile **`input-mapping.json`**, or **`UDOS_SURFACE_REPO`** is set (optional **`UDOS_SURFACE_PROFILE_ID`**, default **`ubuntu-gnome`**), the shell resolves **`profiles/<id>/input-mapping.json`** under the repo and appends a short **Surface profile** section to the **`?`** help overlay. This is documentation-only today: bindings are not applied to dispatch until the keymap layer wires them.

## Phase 3 Scope

Phase 3 should implement:

- centralized Go keymap definitions as the runtime source of truth
- focused-component overrides that preserve global meanings
- generated help output from the same keymap source
- tests for stable terminal-first bindings
- no custom `Cmd` shortcuts
- reusable selector surfaces opened from prompt flow
