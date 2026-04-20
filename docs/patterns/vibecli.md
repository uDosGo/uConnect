# vibecli Configuration Patterns

## 📁 Configuration Structure

```
project/
├── .viberc              # Main configuration
├── .viberc.local       # Local overrides (gitignored)
└── config/
    ├── agents/         # Agent configurations
    │   ├── codegen.json
    │   ├── explain.json
    │   └── refactor.json
    ├── providers/       # Provider configurations
    │   ├── deepseek.json
    │   └── openai.json
    └── surfaces/         # Surface configurations
        └── default.json
```

## 📄 .viberc Reference

### Basic Configuration

```json
{
  "version": "1.0.0",
  "project": {
    "name": "my-project",
    "description": "AI-powered CLI tool",
    "version": "0.1.0"
  },
  "paths": {
    "vault": "~/vault",
    "code": "~/code-vault",
    "state": "~/.local/udos"
  },
  "aliases": {
    "g": "generate",
    "t": "test",
    "b": "build",
    "r": "refactor"
  },
  "defaultAgent": "codegen",
  "logging": {
    "level": "info",
    "file": "~/.vibecli/logs/vibecli.log",
    "maxSize": "10MB",
    "maxFiles": 5
  }
}
```

### Environment Variables

```bash
# Required paths
export UDOS_VAULT="~/vault"
export UDOS_CODE="~/code-vault"

# Optional API keys
export DEEPSEEK_API_KEY="sk-..."
export OPENAI_API_KEY="sk-..."

# Optional settings
export VIBECLI_LOG_LEVEL="debug"
export VIBECLI_DEFAULT_AGENT="explain"
```

### Loading Order

```
1. Defaults (hardcoded)
2. .viberc
3. .viberc.local
4. Environment variables (UDEV_*, VIBECLI_*)
5. Command line flags
```

## 🤖 Agent Configuration

### Agent Manifest

```json
{
  "agents": {
    "codegen": {
      "enabled": true,
      "provider": "deepseek",
      "model": "deepseek-chat",
      "temperature": 0.2,
      "maxTokens": 2000,
      "timeout": 30000,
      "fallback": "mock",
      "instructions": "You are a code generation expert. Write clean, efficient, well-commented code. Return ONLY the code, no explanations."
    },
    "explain": {
      "enabled": true,
      "provider": "deepseek",
      "model": "deepseek-chat",
      "temperature": 0.5,
      "maxTokens": 1000,
      "instructions": "You explain code concisely. Focus on what it does, how it works, and any edge cases. Keep responses under 200 words."
    },
    "refactor": {
      "enabled": true,
      "provider": "deepseek",
      "model": "deepseek-chat",
      "temperature": 0.3,
      "maxTokens": 2000,
      "instructions": "You refactor code for better readability, performance, and maintainability. Suggest specific changes with before/after examples."
    },
    "test": {
      "enabled": false,
      "provider": "deepseek",
      "model": "deepseek-chat",
      "temperature": 0.2,
      "maxTokens": 1500,
      "instructions": "You generate unit tests. Use the appropriate framework (Jest, Vitest, etc.). Cover edge cases and main functionality."
    }
  }
}
```

### Provider Configuration

```json
{
  "providers": {
    "deepseek": {
      "apiKey": "${DEEPSEEK_API_KEY}",
      "endpoint": "https://api.deepseek.com/v1",
      "models": {
        "deepseek-chat": {
          "pricePerToken": 0.0000014,
          "contextWindow": 4096
        }
      }
    },
    "openai": {
      "apiKey": "${OPENAI_API_KEY}",
      "endpoint": "https://api.openai.com/v1",
      "models": {
        "gpt-4": {
          "pricePerToken": 0.00003,
          "contextWindow": 8192
        },
        "gpt-3.5-turbo": {
          "pricePerToken": 0.000002,
          "contextWindow": 4096
        }
      }
    },
    "local": {
      "type": "ollama",
      "endpoint": "http://localhost:11434",
      "models": {
        "llama2": {
          "pricePerToken": 0,
          "contextWindow": 4096
        }
      }
    }
  }
}
```

## 🎨 Surface Configuration

### Default Surface

```json
{
  "surfaces": {
    "default": {
      "type": "tui",
      "theme": "dark",
      "layout": "vertical",
      "components": [
        "header",
        "main",
        "footer",
        "status"
      ],
      "keybindings": {
        "quit": "q",
        "help": "?",
        "search": "/",
        "command": ":"
      }
    },
    "code": {
      "type": "tui",
      "syntaxHighlighting": true,
      "lineNumbers": true,
      "wrapLines": false,
      "theme": "monokai"
    },
    "docs": {
      "type": "tui",
      "theme": "light",
      "layout": "horizontal",
      "components": [
        "toc",
        "content",
        "search"
      ]
    }
  }
}
```

## 🛡️ Security Configuration

### API Key Management

```json
{
  "security": {
    "apiKeys": {
      "strategy": "env",  // env, file, or prompt
      "validation": true,
      "rotation": {
        "warningDays": 30,
        "expiryDays": 90
      }
    },
    "network": {
      "allowedHosts": [
        "api.deepseek.com",
        "api.openai.com",
        "localhost"
      ],
      "timeout": 30000,
      "retries": 3
    },
    "logging": {
      "redact": [
        "apiKey",
        "password",
        "token",
        "secret"
      ]
    }
  }
}
```

## 🔧 Performance Configuration

### Caching

```json
{
  "cache": {
    "enabled": true,
    "directory": "~/.vibecli/cache",
    "maxSize": "100MB",
    "ttl": "7d",  // Time to live
    "strategies": {
      "agentResponses": true,
      "apiCalls": false,
      "layerFiles": true
    }
  }
}
```

### Rate Limiting

```json
{
  "rateLimits": {
    "agentCalls": {
      "window": "1m",
      "limit": 30,
      "message": "Rate limit exceeded. Please wait."
    },
    "apiRequests": {
      "window": "1m",
      "limit": 60
    }
  }
}
```

## 📊 Budget Configuration

### Cost Tracking

```json
{
  "budget": {
    "monthlyLimit": 50.00,  // USD
    "currency": "USD",
    "notifications": [
      {
        "threshold": 0.50,
        "level": "info",
        "message": "Budget usage: ${used}/${limit}"
      },
      {
        "threshold": 0.80,
        "level": "warning",
        "message": "⚠️ Approaching budget limit"
      },
      {
        "threshold": 0.95,
        "level": "error",
        "message": "❌ Budget limit almost reached"
      }
    ],
    "providers": {
      "deepseek": {
        "limit": 30.00,
        "used": 0.00
      },
      "openai": {
        "limit": 20.00,
        "used": 0.00
      }
    }
  }
}
```

## 📚 Example Configurations

### Minimal Configuration

```json
{
  "version": "1.0.0",
  "paths": {
    "vault": "~/vault",
    "code": "~/code-vault"
  },
  "defaultAgent": "codegen"
}
```

### Full Production Configuration

```json
{
  "version": "1.0.0",
  "project": {
    "name": "production-app",
    "description": "Production AI application",
    "version": "1.2.3",
    "environment": "production"
  },
  "paths": {
    "vault": "/opt/vault",
    "code": "/opt/code",
    "state": "/var/lib/udos"
  },
  "agents": {
    "codegen": {
      "enabled": true,
      "provider": "deepseek",
      "model": "deepseek-chat",
      "temperature": 0.1,
      "maxTokens": 1000
    },
    "explain": {
      "enabled": true,
      "provider": "deepseek",
      "model": "deepseek-chat",
      "temperature": 0.3
    }
  },
  "providers": {
    "deepseek": {
      "apiKey": "${DEEPSEEK_API_KEY}",
      "endpoint": "https://api.deepseek.com/v1"
    }
  },
  "security": {
    "apiKeys": {
      "strategy": "env",
      "validation": true
    },
    "network": {
      "timeout": 10000,
      "retries": 2
    }
  },
  "budget": {
    "monthlyLimit": 100.00,
    "notifications": [
      {
        "threshold": 0.80,
        "level": "warning"
      }
    ]
  },
  "logging": {
    "level": "warn",
    "file": "/var/log/vibecli/production.log"
  }
}
```

## 🤖 Agent Integration

### Configuration for Mastra Agents

```json
{
  "agent": "codegen",
  "task": "configure_vibecli",
  "configuration": {
    "defaultAgent": "codegen",
    "providers": {
      "deepseek": {
        "model": "deepseek-chat",
        "temperature": 0.2
      }
    },
    "paths": {
      "vault": "~/vault",
      "code": "~/code-vault"
    }
  },
  "validation": {
    "required": ["vault", "code"],
    "optional": ["defaultAgent", "providers"]
  }
}
```

### Configuration for Hivemind Agents

```json
{
  "agent": "config",
  "task": "validate_vibecli_config",
  "config_file": ".viberc",
  "rules": [
    "paths.vault must be set",
    "paths.code must be set",
    "defaultAgent must be valid agent name",
    "API keys must not be hardcoded"
  ]
}
```

### Configuration for DSC2 Agents

```json
{
  "agent": "review",
  "task": "optimize_vibecli_config",
  "config": {
    "current": {
      "temperature": 0.7,
      "maxTokens": 4000
    },
    "recommendations": {
      "temperature": 0.2,
      "maxTokens": 2000,
      "reason": "Better for code generation"
    }
  }
}
```

## 📚 Best Practices

### 1. Environment Variables

```bash
# Good
export DEEPSEEK_API_KEY="sk-..."

# Bad
# Hardcoded in config
```

### 2. Separate Configs

```
# Good
.viberc          # Committed, no secrets
.viberc.local    # Gitignored, local overrides

# Bad
# Single config with secrets
```

### 3. Validate Config

```bash
vibecli config validate
```

### 4. Document Changes

```markdown
# CHANGELOG.md

## v1.2.3
- Added deepseek provider configuration
- Increased default timeout to 30s
- Added budget tracking
```

### 5. Version Config

```json
// Good
"version": "1.0.0"

// Bad
"version": "latest"
```

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `API key not found` | Set DEEPSEEK_API_KEY in environment |
| `Invalid provider` | Check provider name in config |
| `Rate limit exceeded` | Wait or increase limit in config |
| `Budget limit reached` | Increase monthlyLimit or wait |

### Debugging

```bash
# Enable debug logging
vibecli config set logging.level debug

# View effective config
vibecli config show

# Reset to defaults
vibecli config reset
```

## 📚 References

- [Universal Spine Specification](../../specs/architecture/universal-spine.md)
- [Agent Contract](../../specs/agents/agent-contract.md)
- [Codegen Rules](../../rules/codegen-rules.md)

---

**vibecli Configuration Patterns** — Flexible, secure, agent-friendly CLI configuration 🎛️
