# Matrix Rain

A surface simulating the Matrix digital rain effect.

```usxd
SURFACE name="matrix" version="1.3.0"

STYLE
background: "#000000"
color: "#00FF40"
typography: "ui-monospace, Consolas, monospace"
font-size: "10px"
line-height: "1.1"
text-shadow: "0 0 5px #00FF40"

REGIONS
header: "Matrix Digital Rain v1.3"
rain: "Rain Animation Area"
stats: "Characters: 0 | Speed: 1x"
controls: "Controls: Space=Pause, +=Faster, -=Slower"

CONTROLS
space: toggle-pause
+: increase-speed
-: decrease-speed
r: reset
up: scroll-up
down: scroll-down
esc: quit
```

```grid size="40x20" mode="matrix"
┌──────────────────────────────────────────┐
│ Matrix Digital Rain v1.3                 │
├──────────────────────────────────────────┤
│  01010101010101010101010101010101010101  │
│  10101010101010101010101010101010101010  │
│  01010101010101010101010101010101010101  │
│  10101010101010101010101010101010101010  │
│  01010101010101010101010101010101010101  │
│  10101010101010101010101010101010101010  │
│  01010101010101010101010101010101010101  │
│  10101010101010101010101010101010101010  │
│  01010101010101010101010101010101010101  │
│  10101010101010101010101010101010101010  │
│  01010101010101010101010101010101010101  │
│  10101010101010101010101010101010101010  │
│  01010101010101010101010101010101010101  │
│  10101010101010101010101010101010101010  │
│  01010101010101010101010101010101010101  │
│  10101010101010101010101010101010101010  │
├──────────────────────────────────────────┤
│ Chars: 0 | Speed: 1x | Status: Running   │
└──────────────────────────────────────────┘
```