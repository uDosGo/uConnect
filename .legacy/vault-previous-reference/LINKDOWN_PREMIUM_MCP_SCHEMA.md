LINKDOWN_PREMIUM_MCP_SCHEMA.md

Linkdown Premium — MCP Tool Schema

Private / paid orchestration layer for vaults, contacts, lists, feeds, and workflows

⸻

1. Purpose

Linkdown Premium adds an MCP-compatible tool layer on top of the Linkdown vault.

This layer allows LLMs and agents to safely interact with:
	•	vault notes
	•	binders
	•	lists
	•	tasks
	•	contacts
	•	feeds
	•	spools
	•	workflows
	•	publishing targets
	•	GitHub-connected content

Core rule

Linkdown core stores the truth.
Linkdown Premium exposes controlled MCP tools over that truth.

⸻

2. Product boundary

Linkdown v4+ core

Open/public fork:
	•	vault
	•	binders
	•	notes
	•	lists
	•	Task Forge parsing
	•	Obsidian compatibility
	•	local index
	•	contacts.db support
	•	feeds/spools storage

Linkdown Premium

Private/paid stream:
	•	MCP server/client runtime
	•	advanced orchestration
	•	permission layer
	•	tool execution logs
	•	premium automation flows
	•	GitHub publishing orchestration
	•	mail/calendar/contact enrichment
	•	advanced CRM intelligence
	•	AI action panels

⸻

3. MCP design principle

Linkdown Premium should treat MCP as a protocol adapter, not a magic AI blob.

MCP responsibilities
	•	expose tools
	•	define schemas
	•	validate inputs
	•	return structured results
	•	request permissions where needed
	•	log tool access
	•	keep vault operations deterministic

MCP should not
	•	silently mutate vault state
	•	invent hidden data models
	•	bypass Markdown truth
	•	create unreachable proprietary records

⸻

4. Tool groups

Recommended top-level MCP tool namespaces:

vault.*
binder.*
note.*
list.*
task.*
contact.*
feed.*
spool.*
workflow.*
publish.*
github.*
system.*


⸻

5. Standard MCP tool envelope

Each tool should follow this conceptual shape:

{
  "name": "note.read",
  "title": "Read note",
  "description": "Read a note from the active vault",
  "inputSchema": {},
  "outputSchema": {}
}

Internal implementation can follow whichever MCP runtime you use, but the contract should stay stable.

⸻

6. Vault tools

vault.get_active

Returns active vault metadata.

Input

{}

Output

{
  "vault_name": "My Vault",
  "vault_path": "/Users/fred/Documents/My Vault",
  "binders_path": "/Users/fred/Documents/My Vault/Binders",
  "assets_path": "/Users/fred/Documents/My Vault/Assets",
  "data_path": "/Users/fred/Documents/My Vault/Data"
}


⸻

vault.list_binders

Input

{
  "recursive": true
}

Output

{
  "binders": [
    {
      "name": "Projects",
      "path": "Binders/Projects"
    },
    {
      "name": "People",
      "path": "Binders/People"
    }
  ]
}


⸻

vault.search

Input

{
  "query": "Sam Rivers launch followup",
  "types": ["note", "contact", "task"],
  "limit": 20
}

Output

{
  "results": [
    {
      "type": "contact",
      "id": "contact.sam-rivers",
      "title": "Sam Rivers",
      "path": "Binders/People/Sam Rivers.md",
      "snippet": "Promoter for Venue Co..."
    }
  ]
}


⸻

7. Binder tools

binder.list_notes

Input

{
  "binder": "Projects",
  "recursive": true
}

Output

{
  "notes": [
    {
      "id": "note.project.launch-plan",
      "title": "Launch Plan",
      "path": "Binders/Projects/Launch Plan.md",
      "type": "note"
    }
  ]
}


⸻

binder.create_note

Input

{
  "binder": "Projects",
  "title": "Venue Launch Notes",
  "type": "note",
  "template": "note"
}

Output

{
  "id": "note.projects.venue-launch-notes",
  "path": "Binders/Projects/Venue Launch Notes.md"
}


⸻

8. Note tools

note.read

Input

{
  "id": "note.project.launch-plan"
}

Output

{
  "id": "note.project.launch-plan",
  "title": "Launch Plan",
  "path": "Binders/Projects/Launch Plan.md",
  "frontmatter": {
    "type": "note",
    "tags": ["project", "launch"]
  },
  "content": "# Launch Plan\n..."
}


⸻

note.write

Used only with explicit permission.

Input

{
  "id": "note.project.launch-plan",
  "content": "# Launch Plan\nUpdated content..."
}

Output

{
  "ok": true,
  "updated_at": "2026-04-09T18:00:00+10:00"
}


⸻

note.append

Input

{
  "id": "contact.sam-rivers",
  "content": "\n## Activity\n- [[2026-04-09 Follow-up Call]]"
}

Output

{
  "ok": true
}


⸻

note.resolve_link

Input

{
  "link": "Sam Rivers"
}

Output

{
  "resolved": true,
  "id": "contact.sam-rivers",
  "path": "Binders/People/Sam Rivers.md",
  "title": "Sam Rivers"
}


⸻

9. List tools

Lists are Markdown task lists in Task Forge format.

list.list_all

Input

{}

Output

{
  "lists": [
    {
      "id": "list.followups",
      "title": "Follow Ups",
      "path": "Binders/Projects/Follow Ups.md",
      "task_count": 12,
      "open_count": 8
    }
  ]
}


⸻

list.read

Input

{
  "id": "list.followups"
}

Output

{
  "id": "list.followups",
  "title": "Follow Ups",
  "path": "Binders/Projects/Follow Ups.md",
  "tasks": [
    {
      "id": "task.sam-rivers.call.2026-04-10",
      "text": "Call Sam about launch",
      "done": false,
      "due": "2026-04-10",
      "contact": "contact.sam-rivers"
    }
  ]
}


⸻

list.create

Input

{
  "binder": "Projects",
  "title": "Follow Ups",
  "spool": "followups"
}

Output

{
  "id": "list.followups",
  "path": "Binders/Projects/Follow Ups.md"
}


⸻

10. Task tools

task.list

Input

{
  "status": "open",
  "due_before": "2026-04-15",
  "contact": "contact.sam-rivers"
}

Output

{
  "tasks": [
    {
      "id": "task.sam-rivers.call.2026-04-10",
      "text": "Call Sam about launch",
      "source_note_id": "list.followups",
      "done": false,
      "due": "2026-04-10",
      "priority": "high"
    }
  ]
}


⸻

task.create

Input

{
  "list_id": "list.followups",
  "text": "Call Sam about launch",
  "due": "2026-04-10",
  "contact": "contact.sam-rivers",
  "priority": "high",
  "tags": ["followup", "sales"]
}

Output

{
  "id": "task.sam-rivers.call.2026-04-10",
  "ok": true
}


⸻

task.complete

Input

{
  "id": "task.sam-rivers.call.2026-04-10"
}

Output

{
  "ok": true,
  "completed": true
}


⸻

task.move

Input

{
  "id": "task.sam-rivers.call.2026-04-10",
  "target_list_id": "list.completed-followups"
}

Output

{
  "ok": true
}


⸻

11. Contact tools

contact.search

Input

{
  "query": "Sam Rivers"
}

Output

{
  "results": [
    {
      "id": "contact.sam-rivers",
      "full_name": "Sam Rivers",
      "primary_email": "sam@example.com",
      "company": "Venue Co",
      "note_path": "Binders/People/Sam Rivers.md"
    }
  ]
}


⸻

contact.read

Input

{
  "id": "contact.sam-rivers"
}

Output

{
  "id": "contact.sam-rivers",
  "full_name": "Sam Rivers",
  "emails": ["sam@example.com"],
  "phones": ["+61..."],
  "company": "Venue Co",
  "role": "Promoter",
  "note_path": "Binders/People/Sam Rivers.md",
  "links": {
    "notes": 4,
    "tasks": 3,
    "mail": 2
  }
}


⸻

contact.create

Input

{
  "full_name": "Sam Rivers",
  "emails": ["sam@example.com"],
  "company": "Venue Co",
  "role": "Promoter"
}

Output

{
  "id": "contact.sam-rivers",
  "note_path": "Binders/People/Sam Rivers.md"
}


⸻

contact.attach_note

Input

{
  "contact_id": "contact.sam-rivers",
  "note_id": "mail.sam-rivers.2026-04-09"
}

Output

{
  "ok": true
}


⸻

12. Feed tools

feed.list

Input

{}

Output

{
  "feeds": [
    {
      "id": "project-launch",
      "name": "Project Launch",
      "item_count": 24
    }
  ]
}


⸻

feed.items

Input

{
  "feed_id": "project-launch",
  "limit": 20
}

Output

{
  "items": [
    {
      "id": "feed.project-launch.item-001",
      "title": "Launch update",
      "date": "2026-04-07",
      "status": "queued"
    }
  ]
}


⸻

13. Spool tools

spool.list

Input

{}

Output

{
  "spools": [
    {
      "id": "followups",
      "name": "Follow Ups"
    }
  ]
}


⸻

spool.items

Input

{
  "spool_id": "followups",
  "status": "open"
}

Output

{
  "items": [
    {
      "id": "spool.followups.sam-rivers.2026-04-10",
      "title": "Follow up Sam Rivers",
      "due": "2026-04-10",
      "contact": "contact.sam-rivers"
    }
  ]
}


⸻

14. Workflow tools

workflow.list

Input

{}

Output

{
  "workflows": [
    {
      "id": "crm.followup.v1",
      "name": "CRM Follow-up"
    }
  ]
}


⸻

workflow.run

Premium-only, permissioned.

Input

{
  "workflow_id": "crm.followup.v1",
  "input": {
    "contact_id": "contact.sam-rivers"
  }
}

Output

{
  "ok": true,
  "created_note_ids": ["mail.sam-rivers.2026-04-09"],
  "created_task_ids": ["task.sam-rivers.call.2026-04-10"]
}


⸻

15. Publish tools

publish.preview

Input

{
  "binder": "Projects"
}

Output

{
  "ok": true,
  "items": 12,
  "warnings": []
}


⸻

publish.github_pages

Input

{
  "repo": "fredporter/project-launch-site",
  "branch": "main",
  "path": "/docs"
}

Output

{
  "ok": true,
  "published_items": 12
}


⸻

16. GitHub tools

github.status

Input

{}

Output

{
  "repo_connected": true,
  "branch": "main",
  "dirty": true,
  "changed_files": 4
}


⸻

github.commit

Input

{
  "message": "Update follow-up notes and tasks"
}

Output

{
  "ok": true,
  "commit": "abc123"
}


⸻

github.push

Input

{
  "remote": "origin",
  "branch": "main"
}

Output

{
  "ok": true
}


⸻

17. System tools

system.permissions

Input

{}

Output

{
  "write_notes": false,
  "write_tasks": false,
  "write_contacts": false,
  "run_workflows": false,
  "publish": false
}


⸻

system.request_permission

Input

{
  "scope": "write_tasks",
  "reason": "Create a follow-up task for Sam Rivers"
}

Output

{
  "granted": true
}


⸻

system.audit_log

Input

{
  "limit": 50
}

Output

{
  "events": [
    {
      "time": "2026-04-09T18:12:00+10:00",
      "tool": "task.create",
      "status": "ok"
    }
  ]
}


⸻

18. Premium security rules

Rule 1

All write tools require permission.

Rule 2

All mutations must be logged.

Rule 3

All mutations must map back to vault files or explicit structured data.

Rule 4

No premium-only hidden task or note model.

Rule 5

Premium features must degrade gracefully when MCP is unavailable.

⸻

19. Architectural support statement

Linkdown Premium should explicitly document these as standard protocols:

Obsidian
	•	vault layout
	•	Markdown notes
	•	YAML frontmatter
	•	wikilinks
	•	tags
	•	obsidian URLs

Task Forge
	•	Markdown task syntax
	•	task metadata blocks
	•	portable list files

Structured context (YAML)
	•	machine-readable fields in frontmatter
	•	schema-safe extension keys (see [SPEC_STANDARDS.md](SPEC_STANDARDS.md); premium docs may use “MDC” internally)

MCP
	•	premium tool protocol for safe agent interaction

⸻

20. Clean positioning

This gives you a very strong product story:

Linkdown Core
  = vault + notes + lists + contacts + compatibility

Linkdown Premium
  = MCP + workflows + CRM intelligence + publishing orchestration

And the protocol stack becomes:

Obsidian   = document protocol
Task Forge = task/list protocol
Structured context = YAML frontmatter + index (premium: “MDC” in internal specs)
MCP        = agent/tool protocol


⸻
