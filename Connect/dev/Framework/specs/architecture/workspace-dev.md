# Workspace Development Folder Architecture

## Standard Structure

```
dev/
├── experiments/          # Long-lived experiments
│   ├── hivemind/         # Agent prototypes
│   └── dsc2/            # Reasoning engine stubs
├── scratch/              # Temporary throwaway code
│   ├── test-agent/       # Quick tests
│   └── demo-surface/     # UI experiments
├── tasks/                # Task tracking
│   ├── active/           # Current tasks
│   └── completed/        # Done tasks
└── backlog/             # Future ideas
```

## Task File Format

```markdown
# dev/tasks/active/mastra-integration.md

**Status:** 🟨 IN PROGRESS
**Started:** 2025-04-20
**Owner:** @fredporter

## Goal
Integrate Mastra agents into vibecli code generation

## Checklist
- [x] Install @mastra/core
- [x] Create agent service
- [x] Update code commands
- [ ] Write integration tests
- [ ] Update documentation

## Blockers
- None

## Notes
- Using DeepSeek as primary provider
- Fallback to mock responses when no API key
