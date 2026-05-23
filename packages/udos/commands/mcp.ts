/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/mcp — `udo mcp` command handlers
   List MCP tools, call MCP tools, manage MCP servers.
   ═══════════════════════════════════════════════════════════════════ */

import type { MCPTool, MCPServer } from '../types.ts'

// ─── In-Memory MCP Registry ──────────────────────────────────────
const servers = new Map<string, MCPServer>()
const tools = new Map<string, MCPTool>()

// ─── Command Handlers ────────────────────────────────────────────

export function handleMCPList(available?: boolean) {
  if (available) {
    const all = Array.from(tools.values())
    return { success: true, tools: all, count: all.length }
  }
  const all = Array.from(servers.values())
  return { success: true, servers: all, count: all.length }
}

export async function handleMCPCall(toolName: string, params?: Record<string, unknown>) {
  const tool = tools.get(toolName)
  if (!tool) return { success: false, error: `Tool not found: ${toolName}` }

  // In production, this would call the actual MCP tool
  console.log(`[UDO] Calling MCP tool: ${toolName}`, params)

  return {
    success: true,
    tool: toolName,
    result: `Executed ${toolName} with params: ${JSON.stringify(params)}`,
  }
}

export function handleMCPServerStart(name: string) {
  const server: MCPServer = {
    name,
    status: 'running',
    tools: [],
  }
  servers.set(name, server)
  return { success: true, server }
}

export function handleMCPServerStop(name: string) {
  const server = servers.get(name)
  if (!server) return { success: false, error: `Server not found: ${name}` }
  server.status = 'stopped'
  return { success: true, server }
}

// ─── Tool Registration ───────────────────────────────────────────

export function registerMCPTool(tool: MCPTool): void {
  tools.set(tool.name, tool)

  // Ensure server exists
  if (!servers.has(tool.server)) {
    servers.set(tool.server, {
      name: tool.server,
      status: 'running',
      tools: [],
    })
  }

  const server = servers.get(tool.server)!
  if (!server.tools.includes(tool.name)) {
    server.tools.push(tool.name)
  }
}

// ─── Built-in MCP Tools ──────────────────────────────────────────

export function registerBuiltinMCPTools(): void {
  const builtins: MCPTool[] = [
    {
      name: 'monodraw',
      description: 'Export monopic diagrams to various formats',
      input_schema: {
        type: 'object',
        properties: {
          file: { type: 'string', description: 'Path to .monopic file' },
          format: { type: 'string', enum: ['svg', 'png', 'ascii'], default: 'svg' },
        },
      },
      server: 'monodraw',
    },
    {
      name: 'summarize',
      description: 'Summarize text content',
      input_schema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          max_length: { type: 'integer', default: 100 },
        },
      },
      server: 'ai-tools',
    },
    {
      name: 'translate',
      description: 'Translate text between languages',
      input_schema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          target_lang: { type: 'string' },
        },
      },
      server: 'ai-tools',
    },
  ]

  for (const tool of builtins) {
    registerMCPTool(tool)
  }
}
