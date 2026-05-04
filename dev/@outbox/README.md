# uDosConnect Dev @outbox

This folder is for **development summaries** within the uDosConnect repo.

## Purpose
- Store completed development work summaries
- Document implementation details
- Provide technical reports to operators
- Serve as a record of development activities

## Scope
This @outbox is for **repo-specific development summaries**, including:
- Feature implementation reports
- Bug fix documentation
- Code refactoring summaries
- Testing results
- Technical decisions

## Relationship to Ecosystem @outbox

**This repo's dev/@outbox** is for uDosConnect-specific development summaries.

**Ecosystem @outbox** (`~/code-vault/@outbox/`) is for:
- Cross-repo coordination summaries
- High-level operator reports
- Ecosystem-wide change documentation
- User-facing release notes

## Usage

1. **Developer completes task** from `dev/@inbox/`
2. **Developer creates summary** in `dev/@outbox/YYYY-MM-DD_summary.md`
3. **Developer references** the original instruction
4. **Operator reviews** and archives completed work

## File Format

```markdown
# [Task Summary: Original Task Name]

**Date:** YYYY-MM-DD
**Developer:** @dev-name
**Status:** completed
**Original Instruction:** dev/@inbox/YYYY-MM-DD_original.md
**Component:** [core|ui|modules|etc]

## Changes Made
- [What was implemented]
- [Files modified]
- [Lines of code changed]

## Technical Details
- [Implementation approach]
- [Key decisions made]
- [Dependencies added/changed]

## Testing
- [How it was tested]
- [Test results]
- [Test coverage]

## Issues Encountered
- [Any problems and solutions]
- [Workarounds implemented]

## Performance Impact
- [Memory usage changes]
- [CPU usage changes]
- [Startup time changes]

## Documentation Updated
- [Docs modified]
- [New docs created]

## Next Steps (if any)
- [Follow-up items]
- [Related tasks]
```

## Example

```
@outbox/
├── 2025-04-22_auth-bug-fix-summary.md
├── 2025-04-23_video-support-implementation.md
└── 2025-04-24_core-refactoring-report.md
```

## Best Practices

1. **Reference original instruction** - Always link to the dev/@inbox file
2. **Be technical** - Include implementation details
3. **Document decisions** - Explain why choices were made
4. **Include metrics** - Performance impact, test coverage, etc.
5. **Archive completed work** - Move finished items to `completed/`
6. **Use clear filenames** - `YYYY-MM-DD-descriptive-summary.md` format

## See Also

- `dev/@inbox/` - Original instructions
- `dev/README.md` - Development guidelines
- `docs/` - Technical documentation
- `~/code-vault/@outbox/` - Ecosystem-level summaries
