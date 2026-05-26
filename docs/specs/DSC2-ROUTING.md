# DSC2 vs DeepSeek-V3 Routing Guide

This document explains how uDos routes requests between DSC2 (DeepSeek-Coder-V2) and DeepSeek-V3.

## 🎯 Routing Rules

### 1. CLI Commands (`udo code *`)

All `udo code` commands route to **DSC2** (code-optimized model):

```bash
# These use DSC2
udo code generate "..."      # → DSC2
udo code complete --prefix "..." # → DSC2  
udo code insert --prefix "..." --suffix "..." # → DSC2
udo code explain file.py     # → DSC2
udo code refactor file.ts    # → DSC2
```

### 2. uDOS Chat Interface

The NextChat fork routes based on message content:

#### Code-related messages → DSC2
```
User: "/code generate sort function"
User: "write a Python class for..."
User: "fix this code: def add(a,b):..."
```

#### General chat → DeepSeek-V3 (with R1 verbose)
```
User: "Explain recursion to me"
User: "What's the meaning of life?"
User: "Help me understand this concept..."
```

### 3. MCP Server Routing

The MCP server (`core-rs/src/mcp/server.rs`) implements:

```rust
match request.tool {
    "dsc2_generate" | "dsc2_complete" | "dsc2_insert" | "dsc2_explain" | "dsc2_refactor" => {
        // Route to DSC2 model
        dsc2_handler(request).await
    }
    "chat" | "explain" | "reason" => {
        // Route to DeepSeek-V3 with thinking: true
        deepseek_v3_handler(request, true).await
    }
    _ => {
        // Default to DeepSeek-V3 without verbose
        deepseek_v3_handler(request, false).await
    }
}
```

## 🔧 Implementation Status

### ✅ Implemented
- `udo code *` commands → DSC2 routing
- Value metrics collection for DSC2 calls
- Budget tracking and rate limiting

### 🚧 In Progress
- NextChat integration for `/code` prefix detection
- MCP server tool routing
- Fallback logic when DSC2 unavailable

### 📋 Planned
- Quality-based routing (try DSC2 first, fallback to V3)
- Cost optimization (use cheaper model when appropriate)
- Caching frequent code patterns

## 📊 Routing Metrics

Track routing decisions in `vault/logs/routing.ndjson`:

```json
{
  "timestamp": 1234567890,
  "input": "write a sort function",
  "routed_to": "dsc2",
  "reason": "contains code keywords",
  "tokens": 25,
  "cost": 0.0000035
}
```

## 🧪 Testing Routing

```bash
# Test DSC2 routing
udo code generate "fibonacci in Rust" --debug

# Test chat routing (in uDOS Chat UI)
# Type: "/code generate sort" → should show DSC2 response
# Type: "explain recursion" → should show V3 response with thinking

# Check routing logs
cat vault/logs/routing.ndjson | jq .
```

## 🔗 Related Components

- `core/src/actions/code.ts` - CLI command routing
- `core-rs/src/mcp/server.rs` - MCP server routing
- `vendor/nextchat/src/api/route.ts` - Chat message routing
- `dev/vibe/obx/dsc2-integration.obx` - OBX routing rules

## 📝 Notes

- DSC2 is optimized for code, V3 for general chat
- Use `/code` prefix in chat to force DSC2 routing
- R1 verbose mode only available with DeepSeek-V3
- Budget tracking applies to both models separately