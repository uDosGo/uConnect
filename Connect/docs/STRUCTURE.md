# uDos Project Structure

## Root Level
- `package.json`: Main package configuration
- `README.md`: Project overview
- `CONTRIBUTING.md`: Contribution guidelines
- `docs/`: Documentation directory
- `core/`: Core functionality
- `ui/`: User interface components
- `tools/`: Development tools
- `modules/`: Project modules
- `scripts/`: Utility scripts
- `templates/`: Project templates

## Key Components

### Core
The core directory contains the main business logic and functionality.

### UI
The UI directory contains Vue.js components and user interface code.

### Tools
Development tools including:
- `sonic-express`: Fast development server
- `usxd-express`: USXD processing tools

### Modules
Modular components that can be used independently or together.

## Development Workflow

1. **Installation**: `npm install`
2. **Building**: `npm run build`
3. **Testing**: `npm test`
4. **Linting**: `npm run lint`

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:
- Linting checks
- Unit tests
- Safety checks
- Documentation generation
- Production deployment
