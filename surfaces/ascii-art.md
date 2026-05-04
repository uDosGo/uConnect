# ASCII Art Gallery

A surface for displaying complex ASCII art with precise grid alignment.

```usxd
SURFACE name="ascii-art" version="2.1.0"

STYLE
background: "#000000"
color: "#FFEB3B"
typography: "ui-monospace, Courier New, monospace"
font-size: "12px"
line-height: "1.0"
letter-spacing: "0px"

REGIONS
header: "ASCII Art Gallery"
art1: "Art Piece 1"
art2: "Art Piece 2"
art3: "Art Piece 3"
footer: "Use arrows to navigate"

CONTROLS
up: scroll-up
down: scroll-down
left: prev-art
right: next-art
+: zoom-in
-: zoom-out
0: reset-zoom
```

```grid size="30x15" mode="ascii"
┌──────────────────────────────────┐
│ ASCII Art Gallery v2.1           │
├──────────────────────────────────┤
│                                  │
│   ████████████████████████████    │
│   ████████████████████████████    │
│   ████████████████████████████    │
│   ████████████████████████████    │
│                                  │
├──────────────────────────────────┤
│   (◕‿◕)  (◕‿◕)  (◕‿◕)           │
│   (◕‿◕)  (◕‿◕)  (◕‿◕)           │
│   (◕‿◕)  (◕‿◕)  (◕‿◕)           │
├──────────────────────────────────┤
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└──────────────────────────────────┘
```