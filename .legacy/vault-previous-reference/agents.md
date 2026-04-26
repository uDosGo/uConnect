# Vault Agent Context

This is an **Obsidian vault** managed by Obsidian Companion using the **uDOS** workflow system. All files are plain markdown with YAML frontmatter. Structured task and project data lives in JSON files inside `@binders/`.

AI tools should read this file first. It describes what every folder contains, how the JSON schemas work, and what is safe to read or write.

---

## Folder Structure

| Folder | Purpose | AI access |
|--------|---------|-----------|
| `@binders/` | Missions (projects) + pipeline task board | Read / Write |
| `@public/` | Notes intended for publishing | Read / Write |
| `@private/` | Personal notes | Read / Write |
| `@shared/` | Collaboration notes | Read / Write |
| `@sandbox/` | Drafts and experiments | Read / Write |
| `@inbox/` | Unsorted incoming items | Read / Write |
| `@user/` | Apple data synced from device | Read only |
| `.compost/` | Auto-versioned file history (managed by app) | Do not touch |
| `.companion/` | App databases (SQLite) | Do not touch |
| `.state/` | App session state | Do not touch |

---

## @user — Synced Apple Data

```
@user/
  email/<account>/<mailbox>/     Mail messages (one .md per message)
  calendar/<account>/<name>/     Calendar events
  contacts/                      One .md file per contact
  notes/<account>/<folder>/      Apple Notes
  tasks/<account>/<list>/        Reminders
```

Files use date-prefix naming (`YYYY-MM-DD-subject.md`) and YAML frontmatter metadata.

---

## @binders — Missions and Tasks

`@binders/tasks/` is the **pipeline task board** — individual action items from Apple apps (flagged emails, calendar events, reminders) collected into one place.

Each mission lives in `@binders/<slug>/` with three JSON files:

### project.json — Mission Definition

```json
{
  "mission_id": "uuid",
  "title": "Mission Title",
  "description": "Overview of this project",
  "goals": ["Goal 1", "Goal 2"],
  "workflow_prompts": ["Guiding prompt for AI or team"],
  "linked_workspaces": ["@public"],
  "generative_content_paths": ["@binders/slug/output.md"],
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "status": "active"
}
```

Status: `active` | `inactive` | `completed`

### tasks.json — Active To-Do List

```json
{
  "tasks": [
    {
      "task_id": "uuid",
      "title": "Task title",
      "description": "Details",
      "due_date": "YYYY-MM-DD",
      "priority": "high",
      "status": "pending",
      "source_path": "@user/email/account/inbox/2024-01-01-thread.md",
      "linked_contacts": ["@user/contacts/person-name.md"],
      "linked_calendar_events": ["@user/calendar/account/event.md"],
      "generative_content": []
    }
  ]
}
```

Priority: `high` | `medium` | `low`
Status: `pending` | `in_progress` | `completed`

### completed.json — Archived Completed Tasks

```json
{
  "milestones": [
    {
      "milestone_id": "uuid",
      "title": "What was achieved",
      "completed_date": "YYYY-MM-DD",
      "tasks_completed": ["task_id_1", "task_id_2"],
      "notes": "Reflections or lessons learned"
    }
  ]
}
```

---

## Frontmatter Conventions

Every markdown file starts with a YAML block:

```yaml
---
source: mail        # mail | calendar | contacts | reminders | notes | manual
account: me@icloud.com
date: 2024-01-15
tags: [project, follow-up]
status: pending     # for task files: pending | in_progress | completed
---
```

Contact files also include: `name`, `email[]`, `phone[]`, `company`, `job_title`, `vip` (bool), `contact_groups[]`.

---

## Working with This Vault

**To add a task to a mission:** append to the `tasks` array in `tasks.json`.
**To complete a task:** remove it from `tasks.json`, add a milestone to `completed.json`.
**To update a mission:** edit `project.json` — keep `mission_id` unchanged.
**To create notes:** write `.md` files with frontmatter to any workspace folder.

Do not modify files in `.compost/`, `.companion/`, or `.state/`.