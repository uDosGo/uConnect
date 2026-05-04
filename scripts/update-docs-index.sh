#!/bin/bash

# Documentation index update script for uDos
# This script updates the documentation index to include all generated docs

echo "📑 Updating documentation index..."

set -e  # Exit on error

# Create or update the main documentation index
cat > docs/README.md << 'EOF'
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
EOF

# Update the main README to include docs link
echo "Updating main README with documentation link..."

# Check if README has a docs section, if not add it
if ! grep -q "## Documentation" README.md; then
    echo "" >> README.md
    echo "## Documentation" >> README.md
    echo "" >> README.md
    echo "Comprehensive documentation is available in the [docs/](docs/) directory:" >> README.md
    echo "" >> README.md
    echo "- [Development Guide](docs/DEVELOPMENT_GUIDE.md)" >> README.md
    echo "- [Project Structure](docs/STRUCTURE.md)" >> README.md
    echo "- [Architecture](docs/ARCHITECTURE.md)" >> README.md
    echo "- [API Reference](docs/api/)" >> README.md
    echo "" >> README.md
fi

echo "✅ Documentation index updated successfully!"
echo "📋 Updated files:"
echo "   - docs/README.md"
echo "   - README.md (if needed)"

exit 0