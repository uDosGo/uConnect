# System Monitor

A surface for displaying system statistics and monitoring.

```usxd
SURFACE name="monitor" version="1.2.0"

STYLE
background: "#0a0a0a"
color: "#00BCD4"
typography: "ui-monospace, Roboto Mono, monospace"
border: "1px solid #00838F"

REGIONS
header: "System Monitor - Real-time Stats"
cpu: "CPU Usage"
memory: "Memory Usage"
disk: "Disk Usage"
network: "Network Activity"
processes: "Top Processes"
footer: "Updated: [timestamp]"

CONTROLS
esc: quit
ctrl+r: refresh-stats
ctrl+1: view-cpu
ctrl+2: view-memory
ctrl+3: view-disk
ctrl+4: view-network
ctrl+5: view-processes
```

```grid size="22x14"
┌──────────────────────────┐
│ System Monitor v1.2      │
├──────────┬───────────────┤
│ CPU      │ Memory        │
├──────────┼───────────────┤
│          │               │
│ Disk     │ Network       │
├──────────┴───────────────┤
│ Processes                │
│                          │
│                          │
│                          │
├──────────────────────────┤
│ Updated: 2024-04-18      │
└──────────────────────────┘
```