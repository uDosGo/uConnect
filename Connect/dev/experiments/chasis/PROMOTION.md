# CHASIS Promotion Criteria

```yaml
promotion_to_modules:
  requirements:
    - "Works with 5+ different repo types (Node, Python, Static, Amiga, BBC)"
    - "Test coverage >80%"
    - "No critical bugs for 30 days"
    - "At least 2 external contributors"
    - "Documentation complete"

  process:
    - "Move to @modules/chasis/"
    - "Add --experimental flag requirement"
    - "Keep /dev/experiments/chasis/ as symlink for 1 release"

  final_state:
    - "Remove symlink"
    - "Promote to stable after 6 months"
    - "Remove --experimental flag requirement"
```
