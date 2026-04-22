# uDos Documentation

Welcome to the uDos documentation hub. Here you'll find comprehensive guides, API references, and architectural information.

## Getting Started

- **[Development Guide](DEVELOPMENT_GUIDE.md)**: Everything you need to start developing with uDos
- **[Project Structure](STRUCTURE.md)**: Overview of the project organization
- **[Architecture](ARCHITECTURE.md)**: Technical architecture and design principles

## API Documentation

- **[API Reference](api/)**: Auto-generated API documentation

## Additional Resources

- **[Contributing](../CONTRIBUTING.md)**: How to contribute to uDos
- **[Templates](../../templates/)**: Project templates and examples
- **[Scripts](../../scripts/)**: Utility scripts for development

## Generated Documentation

This documentation is automatically generated and updated as part of the CI/CD pipeline.

### Documentation Structure

```
docs/
├── README.md                # This file
├── DEVELOPMENT_GUIDE.md     # Development guide
├── STRUCTURE.md             # Project structure
├── ARCHITECTURE.md          # Architecture overview
├── api/                     # API documentation
└── (other generated docs)
```

### Updating Documentation

To regenerate documentation:

```bash
# Generate all documentation
bash scripts/generate-docs.sh

# Update the documentation index
bash scripts/update-docs-index.sh
```

### Documentation Standards

- Use Markdown format
- Follow consistent heading structure
- Include code examples where applicable
- Keep documentation up-to-date with code changes

## Support

For issues or questions about the documentation:
- Open an issue on GitHub
- Check the contributing guidelines
- Review existing documentation for similar topics
