# vibecli Configuration Patterns

## .viberc Structure

```json
{
  "version": "1.0.0",
  "aliases": {
    "g": "generate",
    "t": "test",
    "b": "build"
  },
  "defaultAgent": "codegen",
  "apiKeys": {
    "deepseek": "${DEEPSEEK_API_KEY}",
    "openai": "${OPENAI_API_KEY}"
  },
  "paths": {
    "vault": "${UDOS_VAULT}",
    "code": "${UDOS_CODE}"
  }
}
```

## Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| `UDOS_VAULT` | `~/vault` | ✅ Yes |
| `UDOS_CODE` | `~/code-vault` | ✅ Yes |
| `DEEPSEEK_API_KEY` | `sk-...` | ❌ Optional |
| `OPENAI_API_KEY` | `sk-...` | ❌ Optional |
