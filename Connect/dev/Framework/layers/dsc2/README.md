# DSC2 Layer for uDevFramework

This layer integrates the DeepSeek Reasoning Engine (DSC2) into the uDevFramework ecosystem.

## Features

- **DSC2 Server**: Local reasoning server running on port 30000
- **Mastra Integration**: Seamless integration with Mastra agents
- **PM2 Management**: Production-ready process management
- **Easy Deployment**: Simple installation and configuration

## Installation

```bash
# Navigate to your uDevFramework directory
cd ~/code-vault/uDevFramework

# Install the DSC2 layer
./bin/udf layer install dsc2
```

## Usage

### Start DSC2 Server
```bash
# Using the layer command
./bin/udf dsc2:start

# Or manually
cd layers/dsc2/dsc2-server
npm run pm2:start
```

### Stop DSC2 Server
```bash
./bin/udf dsc2:stop
```

### View Logs
```bash
./bin/udf dsc2:logs
```

### Test the Server
```bash
./bin/udf dsc2:test
```

## Configuration

Copy `.env.example` to `.env` and add your DeepSeek API key:

```bash
cd layers/dsc2/dsc2-server
cp .env.example .env
nano .env
```

## Integration with Mastra

The DSC2 layer automatically integrates with Mastra agents. You can use the `planner` agent to access DSC2 reasoning capabilities:

```bash
# Use DSC2 reasoning via vibecli
vibecli code reason "Plan a migration from monolith to microservices" --steps
```

## API Endpoints

- `GET /health` - Health check
- `POST /mcp` - Main reasoning endpoint
- `POST /mcp/batch` - Batch processing endpoint

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vibecli (User Command)                    │
│  "Plan a deployment for my Express app"                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mastra (Routing)                          │
│  Recognises complex task → routes to DSC2                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DSC2 Reasoning Engine                     │
│  - Receives task                                             │
│  - Breaks into steps                                         │
│  - Calls DeepSeek API for each step                          │
│  - Synthesises final plan                                    │
└─────────────────────────────────────────────────────────────┘
```

## License

MIT License