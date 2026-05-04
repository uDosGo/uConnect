# uDos Development Guide

## Getting Started

### Prerequisites
- Node.js >= 24
- npm >= 9
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/fredporter/uDos.git
   cd uDos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install development tools:
   ```bash
   npm install --save-dev eslint eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin @eslint/js
   ```

## Development Scripts

- **Build**: `npm run build`
- **Test**: `npm run test`
- **Lint**: `npm run lint`
- **Lint (check only)**: `npm run lint:check`
- **Workspace validation**: `npm run workspace:drift`

## Pre-Commit Hooks

The project includes comprehensive pre-commit hooks that:
- Validate VibeCLI configuration
- Check for syntax errors
- Validate JSON/YAML files
- Run linting
- Check for large files
- Check for potential secrets

## CI/CD Workflow

The GitHub Actions workflow includes:
1. **Lint**: Code style checking
2. **Test**: Unit and integration tests
3. **Safety**: Security and boundary checks
4. **Documentation**: API and markdown documentation generation
5. **Deploy**: Production deployment (on main branch)

## Code Style

- Use ESLint for linting
- Follow Vue 3 style guide for components
- Use TypeScript for type safety
- Follow conventional commits format

## Commit Messages

Use conventional commits format:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Maintenance tasks

Example:
```bash
git commit -m "feat: Add user authentication module"
```

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to your fork
5. Open a pull request

## Issues

Report bugs and request features via GitHub Issues.
