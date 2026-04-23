# Contributing to uDos

Thank you for contributing to uDos! This guide will help you get started with the development workflow.

## Development Workflow

### 1. Prerequisites

- Node.js (>= 18)
- npm (>= 9)
- Git
- Bash (or Zsh on macOS)

### 2. Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/fredporter/uDos.git
   cd uDos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install ESLint and related plugins:
   ```bash
   npm install --save-dev eslint eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin @eslint/js
   ```

4. Generate documentation (optional):
   ```bash
   npm run docs:generate
   ```

### 3. Development Scripts

- **Build the project**:
  ```bash
  npm run build
  ```

- **Run tests**:
  ```bash
  npm run test
  ```

- **Lint the code**:
  ```bash
  npm run lint:check
  ```

- **Fix linting issues**:
  ```bash
  npm run lint
  ```

- **Generate documentation**:
  ```bash
  npm run docs:generate
  ```

- **Update documentation index**:
  ```bash
  npm run docs:index
  ```

- **Check documentation**:
  ```bash
  npm run docs:check
  ```

### 4. Pre-Commit Hooks

The project uses a pre-commit hook to ensure code quality before committing. The hook performs the following checks:

1. **VibeCLI Configuration Validation**: Validates the VibeCLI configuration.
2. **ESLint Checks**: Runs ESLint on TypeScript, JavaScript, and Vue files.
3. **JSON Validation**: Validates JSON syntax in all JSON files.
4. **YAML Validation**: Validates YAML syntax in all YAML files.
5. **Workspace Validation**: Validates the npm workspaces configuration.
6. **Smoke Tests**: Runs smoke tests to ensure basic functionality.
7. **Large Files Check**: Prevents files larger than 1MB from being committed.
8. **Secrets Check**: Prevents potential secrets from being committed.

If any of these checks fail, the commit will be aborted. Fix the issues and try committing again.

#### Note
- **JSON/YAML Validation**: Now enabled and working properly.
- **ESLint**: Now checks Vue files in addition to TypeScript and JavaScript.

#### ESLint Configuration

The project uses ESLint to enforce code style and catch syntax errors. The configuration is defined in `eslint.config.js` and includes the following rules:

- `eslint:recommended`: Recommended ESLint rules.
- `plugin:@typescript-eslint/recommended`: Recommended TypeScript ESLint rules.
- Custom rules for `no-console`, `no-debugger`, `no-unused-vars`, and `no-useless-assignment`.

To lint the code manually, run:
```bash
npm run lint:check
```

To fix linting issues automatically, run:
```bash
npm run lint
```

### 5. Scripts

The project includes several scripts to help with development:

- **`scripts/fix_comma.sh`**: Removes trailing commas from Vue files.
- **`scripts/test_modular.sh`**: Tests the modular scripting functionality.
- **`scripts/lib/file_utils.sh`**: Library of reusable functions for file operations.

### 6. CI/CD Workflow

The project uses GitHub Actions for continuous integration and deployment. The workflow runs the following jobs on every push and pull request:

1. **Lint**: Code style checking with ESLint.
2. **Test**: Unit and integration tests.
3. **Safety**: Security and boundary checks.
4. **Documentation**: API and markdown documentation generation.
5. **Deploy**: Production deployment (on main branch only).
6. **Notify**: Sends uDos feed notifications on completion.

The CI/CD pipeline ensures code quality, test coverage, and proper documentation before deployment.

#### Auto-Healing Workflow

The project includes an auto-healing workflow that triggers on:

1. **Workflow Failure**: Automatically retries failed workflows and sends uDos feed notifications.
2. **uDos Feed Notifications**: Listens for uDos feed notifications and triggers auto-healing processes.

To trigger the auto-healing workflow manually, use the following command:
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/fredporter/uDos/dispatches \
  -d '{"event_type":"udos_feed_notification", "client_payload": {"event": "workflow_failure", "repo": "uDos", "workflow": "CI", "status": "failed"}}'
```

#### uDos Feed Format

The uDos feed format includes the following fields:

- `event`: The type of event (e.g., `workflow_failure`, `auto_heal_triggered`).
- `repo`: The repository name.
- `workflow`: The workflow name.
- `status`: The status of the workflow (e.g., `failed`, `triggered`).
- `timestamp`: The timestamp of the event.
- `message`: A descriptive message.
- `details`: Additional details (e.g., logs, error messages).

Example uDos Feed Notification:
```json
{
  "event": "workflow_failure",
  "repo": "uDos",
  "workflow": "CI",
  "status": "failed",
  "timestamp": "2026-04-18T12:00:00.000Z",
  "message": "CI workflow failed. Auto-healing triggered.",
  "details": {
    "run_id": 123456789,
    "run_number": 42,
    "workflow_url": "https://github.com/fredporter/uDos/actions/runs/123456789"
  }
}
```

### 7. Code Style

- Use `eslint` for linting Vue, JavaScript, and TypeScript files.
- Follow the Vue 3 style guide for Vue components.
- Use TypeScript for type safety.

### 8. Commit Messages

Use clear and descriptive commit messages. Follow the conventional commits format:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (e.g., formatting, missing semicolons)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (e.g., updating dependencies)

Example:
```bash
git commit -m "feat: Add new feature for user authentication"
```

### 9. Pull Requests

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Open a pull request to the main repository.

### 10. Issues

Report bugs and request features by opening an issue on GitHub. Include as much detail as possible.

## License

By contributing to uDos, you agree that your contributions will be licensed under the MIT License.
