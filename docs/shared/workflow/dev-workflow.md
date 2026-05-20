# Scope

This specification applies to all repositories under:  
[https://github.com/fredporter/](https://github.com/fredporter/)

Developer identity:  
fredporter (AgentDigital)

Local development environment (default):  
~/Code/

All project repositories are assumed to live within this directory, unless explicitly placed elsewhere.

This specification is universal across all projects, independent of product (no project-specific references).

***

Here’s a clean, canonical brief you can reuse across all repos and systems.

⸻

🌐 Universal Dev Notes

🧱 Local vs System Boundary + Task Flow (UDN v1.3)

⸻

1. 🧠 Core Principle

Separate thinking, building, and discarding into distinct spaces.

SYSTEM   = what exists (Git)  
LOCAL    = what you're thinking  
COMPOST  = what you've abandoned

⸻

2. 📁 The Three Zones

⸻

🟦 1. SYSTEM (Tracked / Remote)

This is the real product.

/src/     → code  
/docs/    → documentation

Rules  
•	Only intentional, working content  
•	Clean, structured, presentable  
•	Safe for sharing (even if private repo)

⸻

🟨 2. LOCAL (.local/) — Untracked

Private workspace for thinking and iteration.

.local/

🔒 MUST be in .gitignore

.local/

⸻

✅ What belongs here  
•	Notes  
•	Ideas  
•	Brain dumps  
•	Planning  
•	Experiments  
•	Debug scratch  
•	Early product thinking

⸻

❌ What does NOT belong  
•	Production code  
•	Final documentation  
•	Anything required by the system

⸻

🧠 Definition

.local/ = non-system space

⸻

🟫 3. COMPOST (.compost/) — Untracked

Safe holding area for removed or replaced content.

.compost/

🔒 MUST be in .gitignore

.compost/

⸻

✅ What belongs here  
•	Old code  
•	Replaced implementations  
•	Dead experiments  
•	Temporary backups

⸻

❌ What does NOT belong  
•	Active code  
•	Anything referenced by the system

⸻

🧠 Definition

.compost/ = decayed system material

⸻

3. 🔁 Flow Between Zones

This is the key system.

.local → TASKS.md → /src → .compost

⸻

🧭 Lifecycle

1. Think

.local/notes/idea.md

````
•	Raw
•	Unstructured
•	Private
````

⸻

2. Formalise

Move to:

TASKS.md

⸻

3. Build

Implement in:

/src/

⸻

4. Remove / Replace

Move old work to:

.compost/

⸻

4. 📋 TASKS.md — The Bridge Layer

Converts thinking into execution.

⸻

🎯 Purpose  
•	Single source of active work  
•	Replaces scattered TODOs  
•	Bridges .local → system

⸻

🧱 Structure (Task aligned)

# TASKS.md

## Backlog

- [ ] Implement View Engine v2
- [ ] Refactor parser logic

## In Progress

- [ ] Fix layout overflow bug

## Done

- [x] Setup repo structure

⸻

🧭 Task Lifecycle

.local idea  
↓  
TASKS.md (defined)  
↓  
src implementation  
↓  
done or compost

⸻

🔑 Rules

1. No vague tasks

Bad:

- [ ] Improve system

Good:

- [ ] Refactor renderer.ts to remove grid coupling

⸻

2. Tasks must be actionable  
   •	Clear scope  
   •	Clear outcome

⸻

3. TASKS.md is always current  
   •	No stale items  
   •	No abandoned tasks (move to compost mentally or rewrite)

⸻

5. 🔁 Dev Flow (Updated)

⸻

Standard Loop

1. Think (.local)
2. Define (TASKS.md)
3. Build (/src)
4. Verify
5. Commit
6. Compost

⸻

🔧 Example

Idea → .local/ideas/grid.md

Task → TASKS.md

- [ ] Build grid renderer

Code → /src/renderer.ts

Old version → .compost/code/renderer-v1.ts

⸻

6. 🧰 Dev Toolkit

A consistent dev process also needs a consistent debugging and testing toolkit.

The goal is not to over-engineer tooling, but to ensure that every repo remains observable, debuggable, and easy to maintain.

***

### 6.1 Logging Format

Use concise, human-readable log lines.

Recommended shape:

```txt
[SCOPE] message
```

Examples:

```txt
[BOOT] starting dev server
[DB] loaded contacts.db
[VIEW] rendered story frame
[ERROR] failed to parse task metadata
```

Rules:

- Logs must be short and readable
- Prefix logs with a stable scope label
- Avoid noisy, repetitive console spam
- Prefer one clear log over many low-signal logs

***

### 6.2 Debug Logging

Debug output should be easy to enable and easy to ignore.

Recommended approach:

- Normal logs for important lifecycle events
- Debug logs for temporary inspection only
- Remove or reduce temporary debug noise before commit

Suggested debug prefixes:

```txt
[DEBUG]
[TRACE]
```

Example:

```txt
[DEBUG] parser token count: 14
[TRACE] entering grid layout pass
```

Rule:

> Debug logs may exist during development, but committed code should keep only high-value logs.

***

### 6.3 Console Tooling

Each repo should provide a minimal, predictable console entry surface.

Recommended:

- one primary dev command
- one primary test command
- one primary build or validation command

Examples:

```txt
npm run dev
npm test
npm run build
```

or equivalent for the stack in use.

Rules:

- Avoid command sprawl
- Prefer obvious names
- Keep the most common workflows easy to remember

***

### 6.4 Error Handling

Errors must be useful, not dramatic.

Rules:

- Fail clearly
- Fail early when appropriate
- Include enough context to diagnose the issue
- Do not swallow errors silently
- Do not emit vague messages like `Something went wrong`

Preferred error style:

```txt
[ERROR] failed to load TASKS.md: file not found
[ERROR] parser.ts: invalid checkbox token on line 14
```

Error messages should answer:

- What failed?
- Where did it fail?
- Why did it fail, if known?

***

### 6.5 Testing and Verification

Every dev pass should have a basic verification habit.

Minimum rule:

- If you change behaviour, verify behaviour
- If you fix a bug, reproduce it first if possible
- If you add parsing or transformation logic, include representative test cases

Simple verification ladder:

```txt
1. Run the feature
2. Check expected output
3. Check error path
4. Check no unrelated behaviour broke
```

***

### 6.6 Working File Boundaries

During the dev process, every file should have a clear home.

```txt
.local/     = thinking, scratch, private notes
TASKS.md    = active work tracking
/src/       = implementation
/docs/      = canonical documentation
.compost/   = removed or replaced material
```

Rules:

- Do not keep active plans in `.local/` once they become real work
- Do not keep temporary scratch in `/src/`
- Do not keep outdated docs in `/docs/`
- Move dead material to `.compost/`, not back into the active tree

***

7. 🛡 Drift Prevention Guardrails

Consistency must be defended with simple rules.

***

### 7.1 One Repo, One Shape

Each repo should preserve the same basic structure:

```txt
README.md
DEV.md
TASKS.md
AGENTS.md
/src/
/docs/
.local/
.compost/
```

This reduces decision fatigue and makes project switching fast.

***

### 7.2 One Active Task Surface

`TASKS.md` is the single active backlog.

Rules:

- Do not split active work across random notes
- Do not maintain hidden TODO systems elsewhere
- If work matters, it must appear in `TASKS.md`

***

### 7.3 Commit Discipline

Each commit should reflect one clear change.

Rules:

- Avoid mixing refactor + feature + docs in one commit unless tightly related
- Remove temporary debug noise before commit
- Keep commit scope understandable in one sentence

***

### 7.4 Documentation Discipline

Rules:

- `/docs/` contains canonical docs only
- `README.md` is the entry point
- `DEV.md` defines working method
- `TASKS.md` tracks active work
- `.local/` does not become a shadow documentation system

***

### 7.5 Default Review Questions

Before commit, ask:

- Is this in the right place?
- Is this still active, or should it move to `.compost/`?
- Is this task captured in `TASKS.md`?
- Is this log/error message useful?
- Did I leave behind unnecessary debug noise?

***

8. 📉 Backlog Control

A good dev system must prevent task rot.

***

### 8.1 Backlog Limits

Rules:

- Keep backlog finite
- Rewrite vague tasks immediately
- Remove or defer tasks that no longer matter
- Prefer fewer, sharper tasks over long wishlists

Recommended soft limit:

- If backlog becomes hard to scan in one screen, it needs pruning

***

### 8.2 No Zombie Tasks

A zombie task is a task that sits in `Backlog` forever without clarity or movement.

Rules:

- Rewrite it
- Move it to `.local/` as thinking if it is not ready
- Delete it from active backlog if it is not real work yet

***

### 8.3 Done Must Stay Short

`Done` is for recent wins, not full project history.

Rules:

- Trim regularly
- Keep only the latest relevant completions
- Let Git history hold the long-term record

***

### 8.4 Blocked Must Be Actively Managed

Blocked work should not become hidden backlog.

Rules:

- Every blocked task should state why it is blocked
- Re-check blocked items regularly
- Remove blocked tasks that are no longer worth doing

***

### 8.5 Backlog Review Rhythm

Use a simple recurring hygiene pass:

```txt
1. Trim Done
2. Review Blocked
3. Rewrite vague Backlog items
4. Remove non-essential tasks
5. Confirm In Progress is truly active
```

***

9. ⚠️ Anti-Patterns

⸻

❌ Skipping .local

Leads to:  
•	messy commits  
•	unclear direction

⸻

❌ Coding directly from ideas

Without TASKS:  
•	scope creep  
•	inconsistent results

⸻

❌ Keeping old code in /src

Leads to:  
•	clutter  
•	confusion

⸻

❌ Committing .local or .compost

Breaks the system entirely.

⸻

10. 🧠 Mental Model

⸻

Clean Separation

THINKING   → .local  
DOING      → /src  
TRACKING   → TASKS.md  
DISCARDING → .compost

⸻

11. 🔑 Final Principles

⸻

1. Protect the System

Only clean, intentional work enters Git

⸻

2. Protect Thinking

.local/ is free, messy, and private

⸻

3. Never Delete Prematurely

.compost/ is your safety net

⸻

4. Always Bridge with Tasks

No idea goes straight to code

⸻

🔚 Summary

.local     → think freely  
TASKS.md   → define clearly  
/src       → build cleanly  
.compost   → discard safely

***

# 12. 🌐 Scope Clarification

This system is designed to be:

- Project-agnostic
- Framework-independent
- Consistent across all repositories

It applies to:

- All repos under github.com/fredporter/
- All local development environments under ~/Code/
- All current and future projects (AgentDigital / fredporter)

This document intentionally avoids any project-specific naming (e.g. uDOS, Linkdown) to maintain portability and clarity.

***

# 13. 🔑 Final Principle

One system. Every project.

No exceptions.

***

If you want to push this to “production-grade dev OS”, next step would be:

👉 a repo bootstrap script (init-repo.sh or CLI) that auto-creates:  
•	.gitignore (with .local, .compost)  
•	TASKS.md  
•	DEV.md  
•	AGENTS.md  
•	DEV_CHECKLIST.md

So every new repo is instantly compliant with zero thinking.