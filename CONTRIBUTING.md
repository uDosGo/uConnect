# Contributing to uDos

Thank you for your interest in contributing to uDos! This document outlines the guidelines and workflow for contributing to the project.

## Documentation Workflow

### Source of Truth

The **source of truth** for all uDos documentation is located in `~/Vault/documentation/`. This repository contains a **read-only mirror** of the documentation.

### How to Contribute Documentation

1. **Edit in Vault**:
   - Navigate to `~/Vault/documentation/`.
   - Make your changes in the appropriate folder (e.g., `Framework/`, `Hivemind/`, `GrooveBox/`).

2. **Sync to Repositories**:
   - Run the sync script to push updates to all repositories:
     ```bash
     ~/Vault/documentation/sync-to-upstream.sh
     ```

3. **Compile View**:
   - Generate the compiled view for local browsing:
     ```bash
     ~/Code/Docs/compile.sh
     ```

### Rules

- **Never edit documentation directly in this repository.**
- **Never commit documentation changes directly to GitHub.**
- Always edit the source in `~/Vault/documentation/` and sync.

## Code Contributions

### Getting Started

1. Fork the repository.
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/uDosConnect.git
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Submitting Changes

1. Commit your changes:
   ```bash
   git commit -m "Add your commit message here"
   ```
2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a pull request to the `main` branch of the original repository.

### Code Standards

- Follow the existing code style.
- Write clear and concise commit messages.
- Include tests for new features.
- Update documentation as needed.

## Reporting Issues

If you encounter any issues or have suggestions for improvements, please open an issue on GitHub. Include as much detail as possible to help us understand and address the problem.

## License

By contributing to uDos, you agree that your contributions will be licensed under the project's license.

Thank you for contributing to uDos!