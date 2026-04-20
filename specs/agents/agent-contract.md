# Agent Contract Specification

## Overview

Agents in the Sonic Family (Mastra, Hivemind, DSC2) follow a common contract.

## Input Format

```json
{
  "agent": "codegen",
  "prompt": "Write a function that...",
  "context": {
    "language": "typescript",
    "max_tokens": 2000,
    "temperature": 0.2
  },
  "session_id": "uuid-optional"
}
```

## Output Format

```json
{
  "result": "Generated code or response",
  "usage": {
    "input_tokens": 150,
    "output_tokens": 250,
    "total_tokens": 400
  },
  "model": "deepseek-chat",
  "agent": "codegen"
}
```

## Error Response

```json
{
  "error": "API key missing",
  "code": 2,
  "fallback": "Using mock response",
  "suggestion": "Run `sonic config set deepseek.key`"
}
```

## Agent Manifest Schema

All agents are declared in `manifest.yaml`:

```yaml
agents:
  - name: codegen
    endpoint: http://localhost:8080/agent/codegen
    capabilities: ["generate", "complete", "insert"]
    model: deepseek-chat
    timeout: 30s
    fallback: mock
EOF
