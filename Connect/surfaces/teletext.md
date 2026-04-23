# Teletext Console

A retro teletext-style USXD surface.

```usxd
SURFACE name="teletext" version="1.1.0"

STYLE
background: "#000000"
color: "#00FF00"
typography: "ui-monospace"

REGIONS
header: "Teletext Console"
content: "Main Display"
status: "Ready - Page 100"

CONTROLS
ctrl+h: help
ctrl+q: quit
ctrl+r: refresh
f1: menu
f2: options
```

```grid size="8x4" mode="teletext"
████████████████
█░░░░░░░░░░░░░░█
█░░░░░░░░░░░░░░█
████████████████
```