---
title: "OBF component sheet template"
tags: [--public, --published]
audience: public
slot: 5
apple_color: Blue
---

# Component: {{name}}

Define the component **only** inside fenced blocks (Open Box Format). See [../specs/open-box-format.md](../specs/open-box-format.md).

## Definition

```obf
COMPONENT {{name}}
  STYLE: ""
  VARIANTS:
    default: ""
```

## Style tokens

Reference [../specs/style-guide-obf.md](../specs/style-guide-obf.md) or embed a delta:

```obf-style name="{{name}}-theme" version="A1.0.0"

COLORS:
  ink: "#00FF00"
  paper: "#000000"
```
