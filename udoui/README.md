# UDOUI — Universal Document Oriented User Interface

A browser-based GUI layer that extends USX principles to the web for uCode1 and uCode2.

## Directory Structure

```
udoui/
├── README.md              # This file
├── SPECIFICATION.md       # Full UDOUI specification
├── schema/
│   └── v1.json            # JSON Schema (Draft 2020-12) for UDOUI interfaces
├── targets/
│   ├── ucode1.json        # Legacy browser target configuration
│   └── ucode2.json        # Modern browser target configuration
├── examples/
│   └── workspace.json     # Complete workspace example
└── extensions/
    ├── README.md
    ├── market.yaml
    ├── catalog/
    ├── manifests/
    └── registry/
```

## Key Files

| File | Description |
|------|-------------|
| `schema/v1.json` | Complete JSON Schema for validating UDOUI interface definitions |
| `SPECIFICATION.md` | Full specification with component library docs and examples |
| `targets/ucode1.json` | uCode1 legacy browser target (polyfills, limited features) |
| `targets/ucode2.json` | uCode2 modern browser target (PWA, WebGL, full features) |
| `examples/workspace.json` | Complete workspace interface example |

## CSS

The UDOUI CSS framework is at `ui/src/assets/udoui.css` and provides:

- Mono theme with light/dark mode
- Complete component styling (Navbar, Sidebar, Prose, Card, Table, Terminal, Form, Chart)
- Responsive breakpoints
- Font zoom support
- Scrollbar styling

## Core Philosophy

| Aspect | USX (Document) | UDOUI (Interface) |
|--------|----------------|-------------------|
| **Primary output** | Terminal, desktop viewer | Browser (Chrome, Safari, Electron) |
| **Layout engine** | ASCII grid → CSS Grid | CSS Grid + Flexbox native |
| **Interaction** | Keyboard-first | Mouse + keyboard + touch |
| **State** | Static document + form answers | Live reactive components |
| **Target** | uDOS CLI, USXD viewer | uCode1, uCode2 web UI |
