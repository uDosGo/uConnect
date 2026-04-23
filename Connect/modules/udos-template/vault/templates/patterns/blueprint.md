---
template: pattern
style: Mono Blueprint
output: svg
---

## Blueprint Layout

{{#grid size="12x12"}}
| x:0-12 | y:0-12 | subject: uRing |
{{/grid}}

{{#cutaway}}
- NFC coil: (2,2) to (10,10)
- MCU: (6,10)
- Battery: (6,2)
{{/cutaway}}
