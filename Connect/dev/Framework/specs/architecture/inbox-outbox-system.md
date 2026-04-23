# Inbox/Outbox System Specification

**Status:** Proposed
**Last Updated:** 2025-04-22
**Applies To:** code-vault root level

## Overview

The `@inbox` and `@outbox` system provides a standardized communication interface between operators and the development ecosystem. This system is designed for the **code-vault root level** and serves as a bridge for high-level instructions and summaries.

## System Components

### @inbox

**Location:** `~/code-vault/@inbox/`

**Purpose:**
- Receive operator instructions
- Store incoming tasks and requirements
- Serve as the entry point for new work

**Structure:**
```
@inbox/
├── README.md                  # System documentation
├── YYYY-MM-DD_task-name.md    # Individual instructions
└── active/                    # Currently active tasks
```

**File Format:**
```markdown
# Task Title

**Date:** YYYY-MM-DD
**Operator:** @operator-name
**Priority:** [high|medium|low]
**Related Projects:** [project1, project2]

## Description
Detailed description of the task...

## Requirements
- Requirement 1
- Requirement 2

## Context
Additional background information...

## Acceptance Criteria
- What defines completion
- Testable outcomes
```

### @outbox

**Location:** `~/code-vault/@outbox/`

**Purpose:**
- Store completed work summaries
- Provide status updates to operators
- Document implementation details
- Serve as a record of completed work

**Structure:**
```
@outbox/
├── README.md                  # System documentation
├── YYYY-MM-DD_task-summary.md  # Individual summaries
└── completed/                 # Archived completed work
```

**File Format:**
```markdown
# Task Summary: [Original Task Name]

**Date:** YYYY-MM-DD
**Developer:** @dev-name
**Status:** completed
**Original Instruction:** @inbox/YYYY-MM-DD_task-name.md

## What Was Done
Summary of implementation...

## Changes Made
- Change 1
- Change 2

## Issues Encountered
- Any problems and solutions

## Testing
- How it was tested
- Test results

## Next Steps (if any)
- Follow-up items
```

## Workflow

1. **Operator creates instruction** in `@inbox/` with clear requirements
2. **Developer picks up task**, moves to `@inbox/active/` if needed
3. **Developer implements** the task within the appropriate repo
4. **Developer creates summary** in `@outbox/` documenting the work
5. **Operator reviews** the summary and completed work
6. **Archive completed work** by moving to `@outbox/completed/`

## Scope and Governance

### What Belongs Here
- High-level operator instructions
- Cross-repo coordination tasks
- Ecosystem-wide changes
- Summary reports of completed work

### What Does NOT Belong Here
- Repo-specific development (belongs in the repo)
- Detailed technical documentation (belongs in repo docs)
- Individual commit messages (belongs in git history)
- Build artifacts or logs

## Relationship to uDevFramework

This system **complements** uDevFramework by:
- Providing a **communication layer** above the technical framework
- Maintaining **separation of concerns** (governance vs. implementation)
- Allowing **focused development** within repos while enabling **high-level coordination**

## Implementation Notes

1. **Repo-specific instructions** should live in the repo's own `docs/` or `DEV.md` files
2. **uDevFramework** remains focused on technical governance and standards
3. **This system** handles the operator-developer communication at the ecosystem level
4. **No framework changes required** - this is an organizational pattern, not a technical constraint

## Gaps and Recommendations

### Current Gaps
1. No automated notification system for new @inbox items
2. No standard way to track task status across multiple repos
3. No enforcement of the file format (voluntary compliance)

### Recommendations
1. **Add a simple watch script** in `scripts/watch-inbox.sh` to notify when new items arrive
2. **Create a task tracker** in `dev/tasks/` to complement this system for multi-repo work
3. **Document the pattern** in each major repo's CONTRIBUTING.md to ensure consistency
4. **Consider a lightweight CLI** extension to `udev` for managing inbox/outbox items

### Overkill to Avoid
1. Don't create a full ticketing system (use existing tools for that)
2. Don't enforce strict validation (keep it lightweight)
3. Don't duplicate repo-specific documentation here
4. Don't make this a required step for every small change

## Example Use Cases

### Use Case 1: New Feature Request
**Operator:** Creates `@inbox/2025-04-22_add-video-support.md` with requirements
**Developer:** Implements in uHomeNest, creates `@outbox/2025-04-23_video-support-summary.md`

### Use Case 2: Ecosystem Update
**Operator:** Creates `@inbox/2025-04-22_update-all-repos.md` for framework changes
**Developer:** Updates each repo, creates summary in `@outbox/` with changes per repo

### Use Case 3: Bug Report
**Operator:** Creates `@inbox/2025-04-22_fix-memory-leak.md` with reproduction steps
**Developer:** Fixes in sonic-screwdriver, creates summary with testing details

## See Also
- `specs/architecture/universal-spine.md` - Overall ecosystem structure
- `specs/architecture/workspace-dev.md` - Development workflow patterns
- `docs/operations/COMPOST_POLICY.md` - Information lifecycle management
