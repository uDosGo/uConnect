# Dev Template

Standardized development workflow template for all projects in the code-vault ecosystem.

## Structure

```
.dev/
├── config.yaml              # Main configuration
├── safety/                  # Safety rules and exceptions
│   ├── rules.yaml
│   └── exceptions.yaml
├── tasks/                   # Task management
│   ├── backlog.md
│   ├── in-progress.md
│   └── completed/
├── agents/                  # Agent configurations
│   ├── codegen.agent.yaml
│   ├── tester.agent.yaml
│   └── reviewer.agent.yaml
├── flows/                   # Workflow definitions
│   ├── dev-cycle.flow.yaml
│   ├── review.flow.yaml
│   └── release.flow.yaml
├── roadmap/                 # Project roadmap
│   ├── milestones.yaml
│   └── major/
├── devlog/                  # Development logs
├── feed/                    # Activity feed
├── spines/                  # Architecture spines
│   ├── main/
│   └── experimental/
└── docs/                    # Documentation
    ├── api/
    └── guides/
```

## Usage

1. Copy this template to your project root
2. Customize `config.yaml` with your project details
3. Update `roadmap/milestones.yaml` with your project milestones
4. Start using the workflow!

## Agents

- **codegen**: Code generation and refactoring
- **tester**: Test writing and execution
- **reviewer**: Code review and quality assurance

## Flows

- **dev-cycle**: Complete development cycle
- **review**: Code review process
- **release**: Release management process

## Safety

The safety system ensures code quality and prevents common issues. Customize rules in `safety/rules.yaml` and add exceptions in `safety/exceptions.yaml`.

## License

MIT License - see LICENSE file for details.