# Contributing to uDos

Welcome! Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Quick Links
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Development Setup](docs/dev/setup.md)
- [Logging Specification](docs/specs/logging.md)

## How to Contribute
1. Fork the relevant submodule repository (e.g., `uCode1`).
2. Make changes, test with `make dev`.
3. Open a pull request against the submodule's main branch.
4. Ensure all commits follow the [Conventional Commits](https://www.conventionalcommits.org/) spec.

## Development Mode
Always test your changes with `--dev` flag to isolate logs and state.

## Reporting Issues
- Use GitHub Issues for the appropriate repository
- Include reproduction steps
- Specify environment (OS, Rust version, etc.)

## Code Standards
- Rust: Follow Rust API Guidelines
- TypeScript: Use ESLint with our config
- Shell: Use shellcheck for validation

## Testing
- Run `make test` before submitting PRs
- Ensure all health checks pass
- Test in both dev and production modes

## Documentation
- Update docs when adding features
- Use markdown format
- Keep API documentation in code comments

Thank you for contributing to uDos! 🚀