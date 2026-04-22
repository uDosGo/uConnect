---
title: "Teletext Console Surface"
usxd_version: "1.0"
---

# Teletext Console

## USXD Surface Definition

```usxd
SURFACE name="teletext-console" version="A1.0.0"

STYLE
  background: #000000
  ink: #00FF00
  typography: "ui-monospace, monospace"

REGIONS
  header: "uDos Console"
  content: "Main display area"
  status: "Ready"

CONTROLS
  Ctrl+H: help
  Ctrl+Q: quit
  Ctrl+R: refresh
```

## Grid Layout

```grid size="8x4" mode="teletext" compact
████████████████
█░░░░░░░░░░░░░░█
█░░░░░░░░░░░░░░█
████████████████
```

## Preview

Open: `http://localhost:3000/surface/teletext-console` (after `usxd-express serve --dir ./surfaces` from `tools/usxd-express/`).
