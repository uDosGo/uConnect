---
title: "OBF component examples"
tags: [--public]
audience: public
slot: 5
---

# OBF component examples

Illustrative **Open Box** blocks. Style strings may reference [style-guide-obf.md](style-guide-obf.md) tokens.

## Button

```obf
COMPONENT button
  STYLE: "px-4 py-2 bg-teletext text-black rounded hover:bg-green-400"
  VARIANTS:
    primary: "bg-teletext text-black"
    secondary: "bg-gray-700 text-white"
    danger: "bg-red-600 text-white"
  SIZE:
    sm: "px-2 py-1 text-sm"
    md: "px-4 py-2 text-base"
    lg: "px-6 py-3 text-lg"
```

## Card

```obf
COMPONENT card
  STYLE: "border border-teletext rounded-lg p-4 bg-gray-900"
  PARTS:
    header: "border-b border-gray-800 pb-2 mb-2 font-bold"
    body: "text-gray-300"
    footer: "border-t border-gray-800 pt-2 mt-2 text-xs text-gray-500"
```

## Form

```obf
COMPONENT form
  STYLE: "space-y-4"
  FIELD:
    label: "block text-sm font-medium mb-1"
    input: "w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-teletext"
    error: "text-red-400 text-xs mt-1"
```
