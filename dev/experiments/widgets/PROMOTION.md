# Widgets Promotion Criteria

```yaml
promotion_to_modules:
  requirements:
    - "Widget API stable for 30 days"
    - "At least 5 example widgets working"
    - "CHASIS LENS integration proven"
    - "Test coverage >80%"
    - "Documentation complete"

  process:
    - "Move curated widgets to @modules/udos/plugins/widgets/"
    - "Update imports from dev experiment paths to stable SDK paths"
    - "Keep dev/experiments/widgets/ as compatibility pointer for one release"

  final_state:
    - "Remove compatibility pointer"
    - "Promote to stable after 6 months"
    - "Widget CLI graduates to udo widget"
```
