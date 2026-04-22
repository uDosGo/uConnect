# Decision: IronPad as Inspiration (Not Integration)

- Date: 2026-04-14
- Status: locked
- Scope: A1 architecture guidance, A2 planning inputs

## Decision

Treat IronPad as a reference pattern library for uDos A1/A2 planning. Do not fork, embed, or directly integrate IronPad code into uDos at this stage.

## Why

- Alignment is high on local-first markdown workflows, Git-first versioning, and Milkdown editor architecture.
- Core models differ (`~/vault/` + OBF/USXD + uCode + feed/spool) so direct integration would create heavy mismatch.
- Pattern borrowing keeps velocity and preserves uDos architecture choices.

## Borrow Patterns

- Git auto-commit batching and diff-view workflow patterns
- Milkdown WYSIWYG/editor ergonomics for markdown-first UX
- Task/project schema patterns and calendar interaction concepts
- Prompt template/variable-management UX patterns
- System-tray and lightweight runtime behavior targets

## uDos Adaptations

- Keep `~/vault/` as source of truth (not `data/`)
- Preserve OBF/USXD as first-class formats
- Add uCode execution and feed/spool surfaces in uDos-native flows
- Map real-time sync ideas to A2 boundary work

## Explicit Non-Goals

- No IronPad fork
- No direct code copy
- No replacement of uDos data model or command surface with IronPad conventions
