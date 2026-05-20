🌐 Universal Dev Notes  
📋 TASKS.md + Task Spec (UDN v1.4)

⸻

# Scope

This specification applies to all repositories under:  
`github.com/fredporter/`

Developer identity:  
`fredporter` (also known as `AgentDigital`)

Default local development root:  
`~/Code/`

All local repositories are assumed to live under `~/Code/` by default, but may also exist in other local locations when needed.

This document is universal across all projects and must remain project-agnostic.

Key local-only rules:

- `.local/` is untracked private working space for notes, ideas, scratch, planning, and early thinking
- `.compost/` is untracked local decay space for removed or replaced material
- Neither `.local/` nor `.compost/` should ever be committed

***

1. 🧠 Core Principle

Tasks are not notes.  
Tasks are executable units of work.

⸻

2. 📋 TASKS.md (Canonical Structure)

Every repo MUST include:

# TASKS.md

⸻

🧱 Base Layout

# TASKS.md

## Backlog

## In Progress

## Blocked

## Done

⸻

🧭 Meaning of Each Section

Section	Purpose  
Backlog	Defined but not started  
In Progress	Actively being worked  
Blocked	Waiting on something  
Done	Completed (recent only)

⸻

🔑 Rules  
•	Tasks move top → bottom  
•	No duplicates  
•	No vague entries  
•	Done list is trimmed periodically

⸻

3. 🧩 Task Format (Core Syntax)

⸻

✅ Standard Task

- [ ] Build grid renderer

⸻

✅ With Context

- [ ] Build grid renderer  
  ↳ Scope: renderer.ts only  
  ↳ Outcome: supports dynamic columns

⸻

✅ With Tagging (Protocol Layer)

- [ ] Build grid renderer #feature #core

⸻

✅ With ID (Optional but Powerful)

- [ ] [TASK-001] Build grid renderer

⸻

4. 🧬 Task Metadata (Lightweight, Inline)

Avoid heavy frontmatter. Use inline signals.

⸻

Supported Fields

- [ ] [TASK-002] Refactor parser #refactor  
  ↳ Scope: parser.ts  
  ↳ Depends: TASK-001  
  ↳ Notes: remove legacy logic

⸻

Field Meanings

Field	Purpose  
Scope	Where work happens  
Outcome	What “done” means  
Depends	Dependency chain  
Notes	Extra context

⸻

5. 🔁 Task Lifecycle (Strict)

⸻

Flow

.local → TASKS.md → /src → Done → (optional compost mentally)

⸻

States

Backlog → In Progress → Done  
↓  
Blocked

⸻

Movement Rules

Start work:

Move:

Backlog → In Progress

⸻

Finish work:

Move:

In Progress → Done

⸻

Stuck:

Move:

In Progress → Blocked

⸻

6. 🔗 Cross-System Compatibility

This is where the format becomes a portable protocol across all repositories.

⸻

Tasks are:  
•	Markdown-native ✅  
•	Human-readable ✅  
•	Machine-parseable ✅  
• Compatible with:  
• Markdown-native repositories  
• Obsidian-style parsing  
• Future parser, automation, and agent tooling

⸻

Example (Fully Compatible)

- [ ] [TASK-014] Implement Task parser #core #taskforge  
  ↳ Scope: /src/task-parser.ts  
  ↳ Outcome: parses checkbox + tags + metadata

⸻

7. 🧠 Task Granularity Rules

⸻

✅ Good Tasks

- [ ] Add pagination to API endpoint

⸻

❌ Too Vague

- [ ] Improve backend

⸻

❌ Too Big

- [ ] Build entire system

⸻

🔑 Rule

A task should be completable in one focused dev pass

⸻

8. 🧩 Tags (Standard Set)

Keep tags minimal and universal.

⸻

Core Tags

#feature  
#fix  
#refactor  
#docs  
#core  
#ui  
#infra

⸻

Rules  
•	Max 2–3 tags per task  
•	No custom tag explosion  
•	Keep consistent across repos

⸻

9. 🔄 TASKS ↔ .local Bridge

⸻

Example Workflow

⸻

Step 1 — Idea (local)

.local/ideas/grid.md

⸻

Step 2 — Promote to Task

## Backlog

- [ ] Build grid renderer #feature  
  ↳ Scope: renderer.ts

⸻

Step 3 — Build

/src/renderer.ts

⸻

Step 4 — Cleanup

Old version:

.compost/code/renderer-v1.ts

⸻

10. 🧹 Maintenance Rules

⸻

Weekly Cleanup (or periodic)

1. Trim Done

Keep only recent:

## Done

- [x] Setup repo structure
- [x] Implement parser

⸻

2. Re-evaluate Backlog  
   •	Remove irrelevant tasks  
   •	Rewrite unclear ones

⸻

3. Clear Blocked  
   •	Resolve or remove

⸻

11. ⚠️ Anti-Patterns

⸻

❌ TASKS as notes

- [ ] Think about architecture

⸻

❌ TASKS as backlog dump

100+ unstructured tasks → unusable

⸻

❌ No movement

Tasks stuck in Backlog forever

⸻

❌ Hidden work

Doing work not tracked in TASKS

⸻

12. 🚀 Advanced (Optional, Future-Ready)

⸻

Task IDs Across Projects

[TASK-WEB-001] → website project  
[TASK-APP-001] → app project

⸻

Machine Parsing Ready

This format supports:  
•	AI agents  
•	Task extraction  
•	Sync systems  
•	UI layers (List View, detailed Task View)

⸻

13. 🧠 Final Mental Model

⸻

.local     = raw thought  
TASKS.md   = structured intent  
/src       = execution  
.compost   = safe discard

⸻

🔑 Final Principle

If it’s not in TASKS.md, it’s not real work.

⸻

🔚 Summary

Think → Define → Build → Move → Clean

⸻

👉 Here’s the next canonical layer: a Task Parser spec that turns TASKS.md into a real interoperable protocol for dev-projects systems and independent projects.

⸻

🌐 Universal Dev Notes

🧩 Task Parser Spec + TypeScript Types (UDN v1.5)

⸻

1. 🧠 Purpose

Define a lightweight, Markdown-native task format that is:  
•	human-readable  
•	easy to edit manually  
•	easy to parse  
•	stable across repos  
•	compatible with List View, detailed Task View / future uDOS tooling

This parser targets:

TASKS.md

and any other Markdown file using the same task syntax.

⸻

2. 📋 Canonical Task Format

Minimal Task

- [ ] Build grid renderer

Completed Task

- [x] Setup repo structure

Task with ID and Tags

- [ ] [TASK-001] Build grid renderer #feature #core

Task with Metadata Lines

- [ ] [TASK-002] Refactor parser #refactor  
  ↳ Scope: parser.ts  
  ↳ Outcome: remove legacy branching  
  ↳ Depends: TASK-001  
  ↳ Notes: keep tokenizer unchanged

⸻

3. 🧱 Parsing Scope

The parser should recognise:  
1.	section headings  
2.	task checkbox lines  
3.	optional task IDs  
4.	inline tags  
5.	indented metadata lines

It should ignore:  
•	normal prose  
•	bullets without checkboxes  
•	unsupported metadata forms

⸻

4. 📚 Section Model

Canonical sections:

Backlog  
In Progress  
Blocked  
Done

Parser should support any heading level:

## Backlog

### Backlog

# Backlog

But normalised output should use canonical section names where matched.

⸻

5. 🧩 Grammar

Task Line

Pattern conceptually:

- [ ] [TASK-001] Title text #tag1 #tag2
- [x] Title text

Components

Checkbox state  
•	[ ] = open  
•	[x] = done

Optional ID

[TASK-001]  
[LD-014]  
[PROJECT-3]

ID is optional but if present should be captured as the first bracketed token after checkbox.

Title

All text after optional ID, excluding trailing tags.

Tags

Hashtag tokens at end or inline:

#feature #core #docs

Recommendation: parser captures tags anywhere in title line, then strips them from display title.

⸻

6. 🧾 Metadata Lines

Metadata lines are attached to the most recent task if indented and in supported format.

Canonical form:

↳ Key: Value

Supported ASCII fallback:

> Key: Value

- Key: Value

Recommended canonical authoring form remains:

↳

Supported Keys

Scope  
Outcome  
Depends  
Notes  
Priority  
Owner

Parser should preserve unknown keys rather than discard them.

⸻

7. 🧬 Normalised Data Model

Each parsed task should produce:  
•	source file path  
•	section  
•	checkbox state  
•	optional ID  
•	title  
•	tags  
•	metadata map  
•	line numbers  
•	raw lines

⸻

8. ✅ TypeScript Types

export type TaskSectionName =  
| "Backlog"  
| "In Progress"  
| "Blocked"  
| "Done"  
| "Other";

export type TaskStatus = "open" | "done";

export interface TaskMetadata {  
Scope?: string;  
Outcome?: string;  
Depends?: string;  
Notes?: string;  
Priority?: string;  
Owner?: string;  
[key: string]: string | undefined;  
}

export interface ParsedTask {  
id?: string;  
title: string;  
status: TaskStatus;  
tags: string[];  
section: TaskSectionName;  
sectionRaw: string;  
metadata: TaskMetadata;  
sourcePath: string;  
lineStart: number;  
lineEnd: number;  
raw: string[];  
}

export interface ParsedTaskDocument {  
sourcePath: string;  
sections: ParsedTaskSection[];  
tasks: ParsedTask[];  
}

export interface ParsedTaskSection {  
name: TaskSectionName;  
rawName: string;  
lineStart: number;  
lineEnd: number;  
}

⸻

9. 🧠 Section Normalisation Rules

Map headings like this:

"backlog"      -> Backlog  
"in progress"  -> In Progress  
"blocked"      -> Blocked  
"done"         -> Done  
everything else -> Other

Case-insensitive. Trim whitespace.

⸻

10. 🧩 Parsing Rules

Rule 1: Heading starts a section

A Markdown heading updates current section context.

Rule 2: Checkbox bullet creates a task

Recognise lines like:

- [ ] 
- [x] 

- [ ] 

Prefer supporting both - and *.

Rule 3: Indented metadata attaches to previous task

Only if it immediately follows the task or another metadata line.

Rule 4: Blank lines end metadata block

Once broken, following indented lines should not attach unless a new task starts.

Rule 5: Tags are extracted from task line

Capture #tag tokens and remove them from clean title.

Rule 6: Unknown sections still allowed

Tasks under non-canonical headings map to section Other, preserving sectionRaw.

⸻

11. 🔍 Regex Guidance

You do not need a perfect single regex. A small staged parser is better.

Suggested task-line approach  
1.	match checkbox prefix  
2.	strip bullet + checkbox  
3.	optionally parse leading ID  
4.	extract tags  
5.	remainder becomes title

Example regex fragments:

const TASK_LINE_RE = /^(\s*)[-*]\s+[([ xX])]\s+(.*)$/;
const ID_RE = /^\[([A-Za-z0-9._-]+)\]\s+(.*)$/;  
const TAG_RE = /(^|\s)(#[A-Za-z0-9._/-]+)/g;  
const META_RE = /^\s+(?:↳|>|-)\s+([^:]+):\s*(.*)$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;

⸻

12. 🛠 Reference Parser Behaviour

Input

# TASKS.md

## Backlog

- [ ] [TASK-001] Build grid renderer #feature #core  
  ↳ Scope: renderer.ts  
  ↳ Outcome: supports dynamic columns

## In Progress

- [ ] [TASK-002] Refactor parser #refactor  
  ↳ Depends: TASK-001  
  ↳ Notes: keep tokenizer unchanged

## Done

- [x] Setup repo structure #docs

Output shape

{  
sourcePath: "TASKS.md",  
sections: [  
{ name: "Backlog", rawName: "Backlog", lineStart: 3, lineEnd: 7 },  
{ name: "In Progress", rawName: "In Progress", lineStart: 8, lineEnd: 12 },  
{ name: "Done", rawName: "Done", lineStart: 13, lineEnd: 15 }  
],  
tasks: [  
{  
id: "TASK-001",  
title: "Build grid renderer",  
status: "open",  
tags: ["feature", "core"],  
section: "Backlog",  
sectionRaw: "Backlog",  
metadata: {  
Scope: "renderer.ts",  
Outcome: "supports dynamic columns"  
},  
sourcePath: "TASKS.md",  
lineStart: 5,  
lineEnd: 7,  
raw: [  
"- [ ] [TASK-001] Build grid renderer #feature #core",  
"  ↳ Scope: renderer.ts",  
"  ↳ Outcome: supports dynamic columns"  
]  
}  
]  
}

⸻

13. 🧪 Reference TypeScript Parser

export type TaskSectionName =  
| "Backlog"  
| "In Progress"  
| "Blocked"  
| "Done"  
| "Other";

export type TaskStatus = "open" | "done";

export interface TaskMetadata {  
Scope?: string;  
Outcome?: string;  
Depends?: string;  
Notes?: string;  
Priority?: string;  
Owner?: string;  
[key: string]: string | undefined;  
}

export interface ParsedTask {  
id?: string;  
title: string;  
status: TaskStatus;  
tags: string[];  
section: TaskSectionName;  
sectionRaw: string;  
metadata: TaskMetadata;  
sourcePath: string;  
lineStart: number;  
lineEnd: number;  
raw: string[];  
}

export interface ParsedTaskSection {  
name: TaskSectionName;  
rawName: string;  
lineStart: number;  
lineEnd: number;  
}

export interface ParsedTaskDocument {  
sourcePath: string;  
sections: ParsedTaskSection[];  
tasks: ParsedTask[];  
}

const HEADING_RE = /^(#{1,6})\s+(.*)**/;  
const TASK_LINE_RE = /^(\s*)[-*]\s+\[([ xX])\]\s+(.*)**/;  
const ID_RE = /^[([A-Za-z0-9._-]+)]\s+(.*)$/;
const META_RE = /^\s+(?:↳|>|-)\s+([^:]+):\s*(.*)$/;  
const TAG_RE = /(^|\s)#([A-Za-z0-9._/-]+)/g;

function normaliseSectionName(raw: string): TaskSectionName {  
const s = raw.trim().toLowerCase();  
if (s === "backlog") return "Backlog";  
if (s === "in progress") return "In Progress";  
if (s === "blocked") return "Blocked";  
if (s === "done") return "Done";  
return "Other";  
}

function extractTags(input: string): { cleanTitle: string; tags: string[] } {  
const tags: string[] = [];  
const cleanTitle = input.replace(TAG_RE, (_m, leading, tag) => {  
tags.push(tag);  
return leading || "";  
}).replace(/\s+/g, " ").trim();

return { cleanTitle, tags };  
}

function parseTaskPayload(payload: string): {  
id?: string;  
title: string;  
tags: string[];  
} {  
let id: string | undefined;  
let rest = payload.trim();

const idMatch = rest.match(ID_RE);  
if (idMatch) {  
id = idMatch[1];  
rest = idMatch[2].trim();  
}

const { cleanTitle, tags } = extractTags(rest);

return {  
id,  
title: cleanTitle,  
tags,  
};  
}

export function parseTaskDocument(  
markdown: string,  
sourcePath = "TASKS.md"  
): ParsedTaskDocument {  
const lines = markdown.split(/\r?\n/);

const tasks: ParsedTask[] = [];  
const sections: ParsedTaskSection[] = [];

let currentSectionRaw = "Other";  
let currentSection: TaskSectionName = "Other";  
let currentSectionStart = 1;  
let activeTask: ParsedTask | null = null;

const closeActiveTask = (lineIndexInclusive?: number) => {  
if (!activeTask) return;  
activeTask.lineEnd = lineIndexInclusive ?? activeTask.lineEnd;  
tasks.push(activeTask);  
activeTask = null;  
};

const closeActiveSection = (lineIndexInclusive: number) => {  
const last = sections[sections.length - 1];  
if (last && last.lineEnd < last.lineStart) {  
last.lineEnd = lineIndexInclusive;  
}  
};

sections.push({  
name: currentSection,  
rawName: currentSectionRaw,  
lineStart: currentSectionStart,  
lineEnd: 0,  
});

for (let i = 0; i < lines.length; i++) {  
const line = lines[i];  
const lineNo = i + 1;

````
const headingMatch = line.match(HEADING_RE);
if (headingMatch) {
  closeActiveTask(lineNo - 1);
  closeActiveSection(lineNo - 1);

  currentSectionRaw = headingMatch[2].trim();
  currentSection = normaliseSectionName(currentSectionRaw);
  currentSectionStart = lineNo;

  sections.push({
    name: currentSection,
    rawName: currentSectionRaw,
    lineStart: currentSectionStart,
    lineEnd: 0,
  });

  continue;
}

const taskMatch = line.match(TASK_LINE_RE);
if (taskMatch) {
  closeActiveTask(lineNo - 1);

  const checked = taskMatch[2].toLowerCase() === "x";
  const payload = taskMatch[3];
  const parsed = parseTaskPayload(payload);

  activeTask = {
    id: parsed.id,
    title: parsed.title,
    status: checked ? "done" : "open",
    tags: parsed.tags,
    section: currentSection,
    sectionRaw: currentSectionRaw,
    metadata: {},
    sourcePath,
    lineStart: lineNo,
    lineEnd: lineNo,
    raw: [line],
  };

  continue;
}

const metaMatch = line.match(META_RE);
if (metaMatch && activeTask) {
  const key = metaMatch[1].trim();
  const value = metaMatch[2].trim();

  activeTask.metadata[key] = value;
  activeTask.lineEnd = lineNo;
  activeTask.raw.push(line);
  continue;
}

if (activeTask) {
  if (line.trim() === "") {
    activeTask.lineEnd = lineNo;
    activeTask.raw.push(line);
    closeActiveTask(lineNo);
  } else {
    closeActiveTask(lineNo - 1);
  }
}
````

}

closeActiveTask(lines.length);  
closeActiveSection(lines.length);

return {  
sourcePath,  
sections: sections.filter((s, index) => {  
if (index < sections.length - 1) {  
return true;  
}  
return true;  
}).map((s, index, arr) => {  
if (s.lineEnd === 0) {  
const next = arr[index + 1];  
s.lineEnd = next ? next.lineStart - 1 : lines.length;  
}  
return s;  
}),  
tasks,  
};  
}

⸻

14. 🧭 Recommended Authoring Rules

To keep parsing reliable, standardise on these rules:

Use one task per bullet

- [ ] Do thing

Put metadata directly underneath

↳ Scope: src/file.ts

Keep tags simple

#feature #docs #core

Prefer IDs for durable tasks

[TASK-001]

⸻

15. ⚠️ Parser Boundaries

This parser intentionally does not try to support:  
•	nested subtasks  
•	multi-line descriptions under titles  
•	arbitrary Markdown tables  
•	dates, priorities, or owners as special syntax beyond metadata lines

Those can be added later, but this baseline should stay simple.

⸻

16. 🚀 Future Extensions

Planned-compatible additions:

Due  
Estimate  
Links  
Assignee  
Subtasks

Possible future form:

↳ Due: 2026-04-10  
↳ Estimate: 2h  
↳ Links: docs/ARCHITECTURE.md

⸻

17. 🔑 Final Principle

Write tasks for humans first, parse them second.

That keeps the protocol durable.

⸻

18. 🔚 Summary

Markdown task  
-> parsed task object  
-> portable task protocol  
-> usable by repos / tools / future agents

⸻

Below is a production-grade canonical spec for:

/docs/TASK.md

You can use this as the standard across all project repositories.

⸻

TASK.md

# Task Specification

## Canonical Markdown Task Protocol

### Version 1.0

***

# 1. Purpose

Task defines a lightweight, Markdown-native task format for software projects.

It is designed to be:

- human-readable
- easy to write manually
- easy to parse programmatically
- portable across repositories
- stable enough for long-term tooling support

Task is intended for use in:

- `TASKS.md`
- project planning files
- Markdown-native task systems
- future parser, agent, and UI integrations

***

# 2. Design Principles

Task follows five principles:

## 2.1 Human first

Tasks must remain easy to read and edit in plain Markdown.

## 2.2 Markdown native

The format should work naturally inside normal `.md` files without requiring custom file types.

## 2.3 Lightweight

The protocol should avoid heavy frontmatter, verbose schemas, or overcomplicated syntax.

## 2.4 Parseable

Tasks should be structured consistently enough for reliable parsing by software.

## 2.5 Portable

The same task file should work across:

- all repositories under `github.com/fredporter/`
- local editors
- future task UIs
- agent-driven workflows
- parser and automation tooling

***

# 3. Canonical File

The standard task file for a repository is:

```txt
TASKS.md

This file acts as the active work surface for the project.

⸻

4. Core Task Model

A Task task is a Markdown checkbox item.

Open task

- [ ] Build grid renderer

Completed task

- [x] Setup repo structure


⸻

5. Canonical Sections

A TASKS.md file should be organised into these sections:

## Backlog

## In Progress

## Blocked

## Done

Section meanings

Backlog

Defined work that has not started.

In Progress

Work currently being executed.

Blocked

Work that cannot proceed yet.

Done

Recently completed work.

⸻

6. Task Syntax

6.1 Minimal task

- [ ] Build grid renderer

6.2 Task with ID

- [ ] [TASK-001] Build grid renderer

6.3 Task with tags

- [ ] Build grid renderer #feature #core

6.4 Task with ID and tags

- [ ] [TASK-001] Build grid renderer #feature #core

6.5 Task with metadata

- [ ] [TASK-001] Build grid renderer #feature #core
  ↳ Scope: renderer.ts
  ↳ Outcome: supports dynamic columns
  ↳ Depends: TASK-000
  ↳ Notes: keep layout API unchanged


⸻

7. Task Components

Each task may contain the following components:

7.1 Checkbox state

Supported values:
	•	[ ] = open
	•	[x] = done

Uppercase X may also be accepted by parsers, but canonical authoring should use lowercase x.

⸻

7.2 Task ID

Task IDs are optional.

Example:

[TASK-001]
[LD-014]
[SYNC-003]

Rules:
	•	ID appears immediately after checkbox
	•	ID should be unique within the file
	•	ID should be short and stable
	•	Use uppercase where practical

⸻

7.3 Title

The title is the main executable unit of work.

Good:

- [ ] Refactor parser token handling

Bad:

- [ ] Improve system

A task title should describe a concrete, actionable outcome.

⸻

7.4 Tags

Tags are optional classification markers.

Example:

#feature
#fix
#refactor
#docs
#core
#ui
#infra

Rules:
	•	keep tags short
	•	use 2–3 max per task
	•	avoid tag explosion
	•	prefer shared repo-wide tag conventions

⸻

7.5 Metadata lines

Metadata provides structured context.

Canonical form:

  ↳ Key: Value

Example:

  ↳ Scope: parser.ts
  ↳ Outcome: remove legacy branching
  ↳ Depends: TASK-001

Metadata lines belong to the task directly above them.

⸻

8. Supported Metadata Keys

Task supports lightweight metadata keys.

Recommended keys:
	•	Scope
	•	Outcome
	•	Depends
	•	Notes
	•	Priority
	•	Owner

Example:

- [ ] [TASK-002] Refactor parser #refactor
  ↳ Scope: parser.ts
  ↳ Outcome: remove legacy branching
  ↳ Depends: TASK-001
  ↳ Notes: keep tokenizer unchanged

Key meanings

Scope

Where the task applies.

Outcome

What counts as done.

Depends

What must be completed first.

Notes

Supporting context.

Priority

Optional urgency or ordering hint.

Owner

Optional responsible person or agent.

⸻

9. Authoring Rules

9.1 One task per bullet

Correct:

- [ ] Build parser
- [ ] Add tests

Incorrect:

- [ ] Build parser and add tests and update docs


⸻

9.2 Keep tasks small

A task should usually fit into one focused dev pass.

Good:

- [ ] Add pagination to search endpoint

Too large:

- [ ] Build the entire backend


⸻

9.3 Keep titles actionable

Good:

- [ ] Extract grid sizing into utility module

Bad:

- [ ] Think about layout


⸻

9.4 Place metadata directly under the task

Correct:

- [ ] Add parser tests
  ↳ Scope: tests/parser.test.ts

Avoid separating metadata from its task with unrelated content.

⸻

9.5 Keep Done short

The Done section should contain recent completions only.

Trim it periodically.

⸻

10. Canonical TASKS.md Template

# TASKS.md

## Backlog

- [ ] [TASK-001] Build grid renderer #feature #core
  ↳ Scope: src/renderer.ts
  ↳ Outcome: supports dynamic columns

## In Progress

- [ ] [TASK-002] Refactor parser #refactor
  ↳ Scope: src/parser.ts
  ↳ Depends: TASK-001
  ↳ Notes: keep tokenizer unchanged

## Blocked

- [ ] [TASK-003] Add release packaging #infra
  ↳ Notes: waiting for build layout decision

## Done

- [x] [TASK-000] Setup repo structure #docs


⸻

11. Task Lifecycle

Task assumes this workflow:

.local -> TASKS.md -> /src + /docs -> .compost
Both `.local/` and `.compost/` are local-only and untracked.

Stage meanings

.local

Private thinking space. Untracked.

TASKS.md

Structured active work. Tracked.

/src and /docs

Execution and system output. Tracked.

.compost

Removed or replaced material. Untracked.

⸻

12. Section Flow

Tasks should normally move through the file like this:

Backlog -> In Progress -> Done
               |
               -> Blocked

Rules
	•	do not duplicate tasks across sections
	•	move tasks rather than rewriting them
	•	blocked tasks should either be resolved or removed later
	•	stale backlog items should be rewritten or dropped

⸻

13. Parsing Guarantees

A conforming Task parser should support:
	•	Markdown headings as section boundaries
	•	checkbox tasks
	•	optional task IDs
	•	inline tags
	•	metadata lines attached to the preceding task

A parser may also support:
	•	uppercase X in [X]
	•	both - and * list markers
	•	unknown section names mapped as non-canonical sections

⸻

14. ASCII-Compatible Metadata Fallback

Canonical metadata syntax uses:

↳

However, for environments where that character is inconvenient, these fallbacks may be accepted:

  > Scope: parser.ts
  - Scope: parser.ts

Canonical authoring still prefers:

  ↳ Scope: parser.ts


⸻

15. Interoperability Goals

Task is intended to interoperate with:
- Markdown-native task systems
- Obsidian-style Markdown workflows
- parser-driven automation
- future agent-based systems
- repository-local tooling

The syntax must remain simple enough that any Markdown editor can handle it.

⸻

16. Non-Goals

Task does not currently standardise:
	•	nested subtasks
	•	deadlines as required syntax
	•	estimates as required syntax
	•	recurrence
	•	kanban metadata beyond section placement
	•	rich tables or YAML frontmatter for each task

These may be layered on later, but are intentionally excluded from v1.0.

⸻

17. Recommended Tag Set

Projects should keep tag vocabulary minimal and shared.

Recommended baseline tags:

#feature
#fix
#refactor
#docs
#core
#ui
#infra

Projects may extend this set, but should do so sparingly.

⸻

18. Examples

Example A — minimal

- [ ] Add parser tests

Example B — structured

- [ ] [TASK-014] Add parser tests #fix #core
  ↳ Scope: tests/parser.test.ts
  ↳ Outcome: covers checkbox parsing edge cases

Example C — blocked

- [ ] [TASK-020] Package release bundle #infra
  ↳ Notes: waiting for final build output structure

Example D — completed

- [x] [TASK-000] Setup repo structure #docs


⸻

19. Best Practices

Do
	•	keep tasks concrete
	•	keep sections current
	•	move tasks as work progresses
	•	use metadata for clarity
	•	keep tags consistent
	•	trim Done periodically

Do not
	•	use tasks as notes
	•	leave vague backlog items forever
	•	mix planning prose into task lines
	•	commit .local/ or .compost/
	•	overload tasks with excessive metadata

⸻

20. Final Principle

Write tasks for humans first.
Structure them well enough for machines second.

Task succeeds when it remains easy to author, easy to scan, and reliable to parse.

⸻


### Suggested companion files

The cleanest set is:

```txt
/docs/TASK.md
/docs/DEV_FLOW.md
/TASKS.md

A useful companion document would be:

/docs/AGENTS.md_SPEC.md

to standardise how Cursor and agent instructions work across all repositories.
```