# uDosConnect Dev @inbox

This folder is for **development framework operations** within the uDosConnect repo.

## Purpose
- Receive development instructions from operators
- Store incoming tasks specific to uDosConnect development
- Coordinate development work within this repo

## Scope
This @inbox is for **repo-specific development operations**, including:
- Feature development tasks
- Bug fixes
- Code refactoring
- Testing requirements
- Documentation updates

## Relationship to Ecosystem @inbox

**This repo's dev/@inbox** is for uDosConnect-specific development work.

**Ecosystem @inbox** (`~/code-vault/@inbox/`) is for:
- Cross-repo coordination
- High-level operator instructions
- Ecosystem-wide changes
- User-facing documentation

## Usage

1. **Operator creates instruction** in `dev/@inbox/YYYY-MM-DD_task-name.md`
2. **Developer picks up task** and implements within this repo
3. **Developer creates summary** in `dev/@outbox/YYYY-MM-DD_summary.md`
4. **Operator reviews** and archives completed work

## File Format

```markdown
# [Task Title]

**Date:** YYYY-MM-DD
**Operator:** @operator-name
**Priority:** [high|medium|low]
**Component:** [core|ui|modules|etc]

## Description
[Detailed description of the development task]

## Requirements
- [Specific requirement 1]
- [Specific requirement 2]

## Technical Notes
- [Implementation considerations]
- [Dependencies]

## Acceptance Criteria
- [How to verify completion]
- [Test requirements]
```

## Example

```
@inbox/
├── 2025-04-22_fix-auth-bug.md
├── 2025-04-23_add-video-support.md
└── 2025-04-24_refactor-core-module.md
```

## Best Practices

1. **One task per file** - Makes tracking easier
2. **Clear filenames** - Use `YYYY-MM-DD-descriptive-name.md` format
3. **Reference related files** - Link to relevant code or docs
4. **Keep it technical** - Focus on implementation details
5. **Move to active/** - For tasks currently being worked on

## See Also

- `dev/@outbox/` - Completed work summaries
- `dev/README.md` - Development guidelines
- `docs/` - Technical documentation
- `~/code-vault/@inbox/` - Ecosystem-level instructions
