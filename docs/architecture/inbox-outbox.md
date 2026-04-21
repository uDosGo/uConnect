# Inbox/Outbox System

## Quick Reference

### @inbox
- **Location:** `~/code-vault/@inbox/`
- **Purpose:** Operator instructions and incoming tasks
- **Format:** Markdown files with structured metadata

### @outbox  
- **Location:** `~/code-vault/@outbox/`
- **Purpose:** Development summaries and completed work reports
- **Format:** Markdown files documenting what was done

## When to Use

**Use @inbox/@outbox for:**
- Cross-repository coordination
- High-level operator instructions
- Ecosystem-wide changes
- Summary reports of completed work

**Don't use for:**
- Repo-specific development (use repo's own issue tracker)
- Detailed technical documentation (belongs in repo docs)
- Small, single-repo changes (handle directly in the repo)

## Basic Workflow

1. Operator creates task in `@inbox/YYYY-MM-DD_description.md`
2. Developer implements changes in the appropriate repo(s)
3. Developer creates summary in `@outbox/YYYY-MM-DD_summary.md`
4. Operator reviews and archives completed work

## File Templates

### @inbox Template
```markdown
# [Task Title]

**Date:** YYYY-MM-DD
**Operator:** @your-name
**Priority:** [high|medium|low]
**Projects:** [list affected projects]

## Description
[Clear description of what needs to be done]

## Requirements
- [Specific requirement 1]
- [Specific requirement 2]

## Acceptance Criteria
- [How to verify completion]
```

### @outbox Template
```markdown
# [Task Summary]

**Date:** YYYY-MM-DD
**Developer:** @your-name
**Original:** @inbox/YYYY-MM-DD_original.md

## Changes Made
- [What was implemented]
- [Files modified]

## Testing
- [How it was tested]
- [Results]

## Notes
- [Any issues or considerations]
```

## Best Practices

1. **Keep it lightweight** - This is a communication system, not a ticketing system
2. **One task per file** - Makes tracking and archiving easier
3. **Reference original instructions** - Always link to the @inbox file in summaries
4. **Archive completed work** - Move finished items to `@outbox/completed/`
5. **Use clear filenames** - `YYYY-MM-DD-descriptive-name.md` format

## Integration with uDevFramework

This system works alongside uDevFramework:
- **uDevFramework** provides technical standards and governance
- **@inbox/@outbox** provides operator-developer communication
- **Repos** contain the actual implementation and detailed docs

## See Also

- Full specification: `specs/architecture/inbox-outbox-system.md`
- Universal Spine: `specs/architecture/universal-spine.md`
- Workspace patterns: `specs/architecture/workspace-dev.md`
