# Contributing to uDevFramework

## 🎉 Welcome!

Thank you for your interest in contributing to uDevFramework! This document outlines how you can help make the universal scaffolding system better.

## 📋 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Git
- GitHub account
- Basic understanding of TypeScript/JavaScript

### Setup

```bash
# Fork the repository
gh repo fork fredporter/uDevFramework

# Clone your fork
git clone https://github.com/your-username/uDevFramework.git
cd uDevFramework

# Install dependencies
npm install

# Build the project
npm run build
```

## 📝 How to Contribute

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/fredporter/uDevFramework/issues) and include:

- Clear description
- Steps to reproduce (for bugs)
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

### Suggesting Features

We welcome feature suggestions! Please open an issue with:

- Use case description
- Proposed solution (if you have one)
- Benefits
- Potential drawbacks

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the universal spine** structure
3. **Add tests** for your changes
4. **Update documentation** if needed
5. **Run tests** to ensure nothing breaks
6. **Submit a pull request** with clear description

## 📦 Development Workflow

### Branch Naming

```
feature/[issue-number]-description
fix/[issue-number]-description
docs/[issue-number]-description
chore/[issue-number]-description
```

Examples:
- `feature/42-mastra-integration`
- `fix/57-memory-leak`
- `docs/61-update-readme`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(codegen): add mastra agent integration"
git commit -m "fix(cli): handle missing API key gracefully"
git commit -m "docs: update getting started guide"
```

### Pull Request Template

```markdown
## Description

[Clear description of changes]

## Related Issue

Fixes #

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All tests passing

## Documentation

- [ ] README updated (if needed)
- [ ] Specs updated (if needed)
- [ ] Examples added (if needed)

## Checklist

- [ ] Code follows universal spine
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Linting passes
- [ ] Build passes
- [ ] Tests pass
```

## 📚 Coding Standards

### TypeScript/JavaScript

- Use TypeScript with strict mode
- Follow [Airbnb Style Guide](https://github.com/airbnb/javascript)
- Use Prettier for formatting
- Add JSDoc comments for public APIs
- Prefer `const` over `let` where possible

### Documentation

- Use Markdown
- Follow the existing structure
- Keep it concise and clear
- Add examples where helpful
- Update specs when changing behavior

### Testing

- Write unit tests for new functionality
- Update existing tests when changing behavior
- Aim for >80% coverage
- Test edge cases
- Use descriptive test names

## 🎯 Architecture Guidelines

### Universal Spine Compliance

All contributions must follow the [Universal Spine Specification](specs/architecture/universal-spine.md):

```
project/
├── src/
├── dev/
├── tests/
├── docs/
└── scripts/
```

### Agent Contract Compliance

If your contribution involves agents, follow the [Agent Contract Specification](specs/agents/agent-contract.md).

## 🤖 AI Agent Contributions

We welcome contributions from AI agents! Please:

1. Follow the [Agent Contract](specs/agents/agent-contract.md)
2. Include clear documentation
3. Add tests for your agent
4. Follow the universal spine

Example agent contribution:
```bash
# Generate agent code
devcli code generate "Mastra agent for code explanation" --save agents/explain.ts

# Add to manifest
# Update docs
# Add tests
```

## 📊 Review Process

1. **Automated Checks**
   - Linting
   - Build
   - Tests

2. **Maintainer Review**
   - Code quality
   - Architecture fit
   - Documentation

3. **Approval & Merge**
   - Squash and merge
   - Delete branch after merge

## 🎁 Rewards

Contributors who make significant impacts may receive:

- 🏆 Recognition in CONTRIBUTORS.md
- 🎟️ Invitation to contributor meetings
- 💬 Early access to new features
- 🤝 Co-maintainer status (for major contributors)

## 🤝 Community

- **Discussions**: [GitHub Discussions](https://github.com/fredporter/uDevFramework/discussions)
- **Issues**: [GitHub Issues](https://github.com/fredporter/uDevFramework/issues)
- **Twitter**: [@sonic_family](https://twitter.com/sonic_family)

## 📚 Resources

- [Universal Spine](specs/architecture/universal-spine.md)
- [Agent Contract](specs/agents/agent-contract.md)
- [Codegen Rules](rules/codegen-rules.md)
- [Implementation Status](status/IMPLEMENTATION_STATUS.md)

## 🎉 Thank You!

Your contributions make uDevFramework better for everyone. We appreciate your time and effort!

---

**Happy Coding!** 🚀
