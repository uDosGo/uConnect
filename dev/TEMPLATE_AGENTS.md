# AGENTS.md — [Agent Name]

## Agent Info

- **Name**: [agent_name]
- **Tier**: wizard | sorcerer | elf | ghost | spy
- **Purpose**: [one-sentence mission]
- **Execution mode default**: continuous (unless request says checkpointed)

## Scope and Boundaries

- **Owns**: [paths or domains this agent can change]
- **Avoids**: [out-of-scope paths/domains]
- **Escalates when**: [approval required / destructive risk / security concern]

## Capabilities

- [capability 1]
- [capability 2]

## Inputs

- Action: [verb]
- Required params: [list]
- Optional params: [list]

## Outputs

- Success shape: [result summary + changed paths + validation]
- Failure shape: [error + blocker + suggested next step]

## Workflow Integration

- Triggers from: [vibecli, cursor, webhook]
- Calls: [other agents, tools]
- Notifies: [channels]
- Artifacts updates: `TASKS.md`, decision docs, roadmap docs (when applicable)

## Safety Rules

- No destructive changes without explicit approval
- Keep edits inside declared scope
- Prefer reversible operations
- Record major decisions in `dev/decisions/`

## Example

```bash
vibe agent run [agent_name] --action [action] --params '{}'
```
