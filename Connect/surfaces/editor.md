# Code Editor Surface

A surface designed for code editing with syntax highlighting regions.

```usxd
SURFACE name="editor" version="3.0.0"

STYLE
background: "#1e1e1e"
color: "#d4d4d4"
typography: "ui-monospace, Fira Code, monospace"
line-height: "1.5"
gutter: "#333333"

REGIONS
header: "Editor: untitled.txt"
sidebar: "File Explorer"
editor: "Code Editor Area"
status: "Ln 1, Col 1"
footer: "Status: Modified"

CONTROLS
esc: command-mode
ctrl+s: save
ctrl+f: find
ctrl+g: goto-line
ctrl+z: undo
ctrl+y: redo
ctrl+/: toggle-comment
```

```grid size="25x12"
┌─────────────────────────────┐
│ Editor v3.0 - untitled.txt  │
├──────────┬───────────────────┤
│ Files    │                   │
│          │  ~                │
│          │  ~ Code Area      │
│          │  ~                │
│          │  ~                │
│          │  ~                │
│          │                   │
├──────────┴───────────────────┤
│ Ln: 1, Col: 1 | Modified     │
└─────────────────────────────┘
```