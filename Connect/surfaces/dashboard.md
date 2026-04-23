# Dashboard Surface

A complex dashboard with multiple regions and controls.

```usxd
SURFACE name="dashboard" version="2.0.0"

STYLE
background: "#1a1a1a"
color: "#4CAF50"
typography: "ui-monospace, SF Mono, monospace"
border: "1px solid #333"

REGIONS
header: "Dashboard Header"
sidebar: "Navigation Sidebar"
main: "Main Content Area"
stats: "Statistics Panel"
footer: "Footer Status"

CONTROLS
esc: quit
ctrl+1: view-home
ctrl+2: view-stats
ctrl+3: view-settings
ctrl+r: refresh-data
ctrl+s: save-config
```

```grid size="20x10"
┌──────────────────────────┐
│ Dashboard v2.0           │
├──────────┬───────────────┤
│ Sidebar  │               │
│          │   Main        │
│          │   Content     │
│          │               │
├──────────┼───────────────┤
│ Stats    │  Footer       │
└──────────┴───────────────┘
```