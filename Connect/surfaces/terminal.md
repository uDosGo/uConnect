# Terminal Emulator

A terminal-style surface with monospace formatting.

```usxd
SURFACE name="terminal" version="1.5.0"

STYLE
background: "#121212"
color: "#00FF00"
typography: "ui-monospace, Consolas, monospace"
line-height: "1.2"
font-size: "14px"

REGIONS
header: "Terminal: ~"
content: "Command Output"
input: "Input Line"
status: "Ready"

CONTROLS
esc: clear
ctrl+c: interrupt
ctrl+d: eof
ctrl+l: clear-screen
up: history-up
down: history-down
```

```grid size="15x8" mode="terminal"
┌─────────────────┐
│ Terminal v1.5   │
├─────────────────┤
│                 │
│  Command Output │
│  Area           │
│                 │
├─────────────────┤
│ $               │
└─────────────────┘
```