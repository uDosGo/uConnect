# Self-Destruct Conditions

> Edit this file to enable scheduled cleanup. If this file is **missing**, no automated self-destruct runs.

## Conditions
| Condition | Action | Trigger |
|-----------|--------|---------|
| `inactive_days` | archive | 90 |
| `disk_space` | clear_cache | <100MB |

## Schedule
- Check: Daily at 02:00 (product default; override in Host config when implemented)
