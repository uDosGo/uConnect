# DEV_CHECKLIST.md

## 1. Purpose

A fast, repeatable checklist to keep development clean, consistent, and drift-free.

Use this before and after each dev pass.

***

# 2. ⚡ Pre-Dev Pass (30–60 seconds)

## Context

- [ ] I understand the current system (README / DEV / TASKS)
- [ ] I am working on ONE clear task

## Task Definition

- [ ] Task exists in TASKS.md
- [ ] Task is specific and actionable
- [ ] Scope is clear (what is NOT included)

## Placement

- [ ] I know where the code will live (/src, /docs, etc.)

***

# 3. 🔧 During Dev (keep in mind)

## Focus

- Stay within task scope
- Avoid side quests
- Avoid silent refactors

## Logging

- [ ] Logs are concise: `[SCOPE] message`
- [ ] No console spam

## Debugging

- [ ] Debug logs are temporary (`[DEBUG]`, `[TRACE]`)
- [ ] Remove or reduce before commit

## Errors

- [ ] Errors are clear and actionable
- [ ] No vague messages

***

# 4. ✅ Post-Dev Pass (before commit)

## Functionality

- [ ] Feature works as expected
- [ ] Bug is actually fixed
- [ ] No obvious regressions

## Verification

- [ ] Tested main path
- [ ] Tested basic error path

## Code Cleanliness

- [ ] No leftover debug noise
- [ ] No dead code in /src
- [ ] No experimental junk in active folders

## File Placement

- [ ] Correct location (/src, /docs)
- [ ] Scratch moved to `.local/` if needed
- [ ] Old code moved to `.compost/`

***

# 5. 📋 Task Hygiene

- [ ] Task moved to correct section (In Progress → Done)
- [ ] No duplicate tasks
- [ ] No hidden work outside TASKS.md

***

# 6. 🧾 Commit Quality

- [ ] Commit represents one clear change
- [ ] Message is understandable in one line
- [ ] No unrelated changes bundled in

Example:

````
feat(parser): add checkbox parsing support
fix(view): resolve grid overflow issue
````

***

# 7. 📉 Backlog Hygiene (quick scan)

- [ ] Backlog is readable in one screen
- [ ] No vague tasks
- [ ] No zombie tasks
- [ ] Blocked tasks have reasons

If not:

- rewrite
- remove
- move back to `.local/`

***

# 8. 🧠 Final Sanity Check

- [ ] Is everything in the right place?
- [ ] Did I accidentally leave thinking in the system?
- [ ] Did I accidentally commit noise?
- [ ] Is the repo cleaner than before?

***

# 🔑 Rule

If this checklist is skipped, drift begins.

Keep it fast. Keep it consistent.

***

# 9. 🔔 Optional: Terminal Reminder Hook

To reinforce this checklist as a habit, add a simple reminder to your dev workflow.

Example (Node / package.json):

```json
{
  "scripts": {
    "dev": "node dev.js && echo \"\n[CHECK] Did you run DEV_CHECKLIST.md?\""
  }
}
```

Or a simple shell alias:

```bash
alias devdone='echo "\n[CHECK] Review DEV_CHECKLIST.md before commit"'
```

Or Git commit hook (`.git/hooks/pre-commit`):

```bash
echo "\n[CHECK] Pre-commit checklist: DEV_CHECKLIST.md"
```

***

## 🔑 Purpose

This is not enforcement.

It is a **gentle interrupt** to prevent:

- rushed commits
- missed cleanup
- backlog drift

***

## Rule

> The checklist should become muscle memory.

The reminder exists only to help build that habit.