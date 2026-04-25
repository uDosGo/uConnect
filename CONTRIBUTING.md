# Contributing to uDos

Welcome! We're excited you want to contribute to uDos. This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Rust (latest stable)
- Node.js (v18+)
- Git
- Make

### Installation

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/uDosGo.git
   cd uDosGo
   ```
3. Build the project:
   ```bash
   make build
   ```

### Development Workflow

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Commit your changes with a clear message:
   ```bash
   git commit -m "feat: add new feature"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request to the main repository

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

## Development Mode

Run the development environment:

```bash
# Start all services
make dev

# Or start individual components
make core      # Start uCode1 daemon
make thinui    # Start ThinUI
make doctor    # Run health check
```

## Testing

Run tests with:

```bash
make test
```

## Documentation

Documentation is automatically generated from code comments and Markdown files in the `docs/` directory.

## Reporting Issues

Found a bug? Please open an issue on GitHub with:
- A clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

## License

By contributing to uDos, you agree that your contributions will be licensed under the project's license.
