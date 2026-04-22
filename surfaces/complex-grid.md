# Complex Grid Test

A surface with a complex grid layout for testing advanced rendering.

```usxd
SURFACE name="complex-grid" version="3.2.0"

STYLE
background: "#0f0f23"
color: "#4fc3f7"
typography: "ui-monospace, monospace"
border: "2px solid #1a237e"

REGIONS
header: "Complex Grid Test v3.2"
nav: "Navigation Panel"
main: "Main Content Area"
sidebar: "Right Sidebar"
status1: "Status Panel 1"
status2: "Status Panel 2"
status3: "Status Panel 3"
footer: "Footer with multiple sections"

CONTROLS
esc: quit
ctrl+1: focus-nav
ctrl+2: focus-main
ctrl+3: focus-sidebar
ctrl+4: cycle-status
ctrl+r: refresh-layout
```

```grid size="24x12" mode="complex"
┌──────────────────────────────────┐
│ Complex Grid Test v3.2           │
├──────────┬───────────────┬───────┤
│ Nav      │               │ Side  │
│          │   Main        │ bar   │
│          │   Content     │       │
│          │               │       │
├──────────┼───────────────┼───────┤
│ Status1  │ Status2       │ St3   │
├──────────┴───────────────┴───────┤
│ Footer Section A | Sec B | Sec C │
└──────────────────────────────────┘
```