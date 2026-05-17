/**
 * uDos ConnectUI — Production API Service
 * 
 * Centralized API client for communicating with uCode1's ThinUI API
 * and the UDO runtime backend.
 * 
 * In dev mode, points to localhost:8001 (ThinUI API).
 * In production, points to the configured backend URL.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api'
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8001'

// ─── Generic fetch wrapper ───────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Health ───────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string; version: string }> {
  return apiFetch('/thinui/health')
}

// ─── USXD / Grid ──────────────────────────────────────────────────

export interface ThinUIGridData {
  format: { version: string; type: string }
  title: string
  root: any
  grid?: any
  styles?: Record<string, any>
}

export async function parseGrid(text: string, title?: string): Promise<ThinUIGridData> {
  return apiFetch('/thinui/parse', {
    method: 'POST',
    body: JSON.stringify({ text, title }),
  })
}

export async function parseGridFromFile(filepath: string): Promise<ThinUIGridData> {
  return apiFetch('/thinui/from-file', {
    method: 'POST',
    body: JSON.stringify({ filepath }),
  })
}

export async function renderGrid(cells: any[], rows: number, cols: number, title?: string): Promise<ThinUIGridData> {
  return apiFetch('/thinui/render', {
    method: 'POST',
    body: JSON.stringify({ cells, rows, cols, title }),
  })
}

export async function getComponentTree(text: string, title?: string): Promise<any> {
  return apiFetch('/thinui/tree', {
    method: 'POST',
    body: JSON.stringify({ text, title }),
  })
}

export async function createLayout(text: string, title?: string): Promise<any> {
  return apiFetch('/thinui/layout', {
    method: 'POST',
    body: JSON.stringify({ text, title }),
  })
}

// ─── UDO Runtime ──────────────────────────────────────────────────

export interface UDOSkill {
  id: string
  name: string
  description: string
  trigger: 'event' | 'schedule' | 'manual'
  eventType?: string
  action: string
  enabled: boolean
}

export interface UDOTask {
  id: string
  type: 'agent' | 'workflow' | 'autoloop'
  status: 'running' | 'completed' | 'failed' | 'pending'
  priority: number
  createdAt: string
  updatedAt: string
}

export interface UDOVariable {
  key: string
  value: string
  scope: 'user' | 'workspace' | 'system'
  encrypted: boolean
  usedBy: string[]
}

export interface UDOAgent {
  id: string
  name: string
  type: string
  status: 'idle' | 'running' | 'error'
  health: number
  tasksCompleted: number
}

export interface UDOWorkflow {
  id: string
  name: string
  file: string
  type: string
  status: 'active' | 'disabled' | 'error'
  runs: number
  lastRun?: string
}

export interface UDOPublishTarget {
  id: string
  name: string
  type: 'github' | 'wordpress' | 'local'
  status: 'connected' | 'disconnected' | 'error'
}

// ─── Skills ───────────────────────────────────────────────────────

export async function listSkills(): Promise<UDOSkill[]> {
  return apiFetch('/udo/skills')
}

export async function enableSkill(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/skills/${id}/enable`, { method: 'POST' })
}

export async function disableSkill(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/skills/${id}/disable`, { method: 'POST' })
}

export async function runSkill(id: string): Promise<{ success: boolean; result: string }> {
  return apiFetch(`/udo/skills/${id}/run`, { method: 'POST' })
}

// ─── Tasks ────────────────────────────────────────────────────────

export async function listTasks(): Promise<UDOTask[]> {
  return apiFetch('/udo/tasks')
}

export async function cancelTask(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/tasks/${id}/cancel`, { method: 'POST' })
}

export async function retryTask(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/tasks/${id}/retry`, { method: 'POST' })
}

// ─── Variables ────────────────────────────────────────────────────

export async function listVariables(): Promise<UDOVariable[]> {
  return apiFetch('/udo/variables')
}

export async function setVariable(key: string, value: string, scope: string, encrypted: boolean): Promise<{ success: boolean }> {
  return apiFetch('/udo/variables', {
    method: 'POST',
    body: JSON.stringify({ key, value, scope, encrypted }),
  })
}

export async function deleteVariable(key: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/variables/${key}`, { method: 'DELETE' })
}

// ─── Agents ───────────────────────────────────────────────────────

export async function listAgents(): Promise<UDOAgent[]> {
  return apiFetch('/udo/agents')
}

export async function startAgent(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/agents/${id}/start`, { method: 'POST' })
}

export async function stopAgent(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/agents/${id}/stop`, { method: 'POST' })
}

export async function getAgentHealth(id: string): Promise<{ health: number; status: string }> {
  return apiFetch(`/udo/agents/${id}/health`)
}

// ─── Workflows ────────────────────────────────────────────────────

export async function listWorkflows(): Promise<UDOWorkflow[]> {
  return apiFetch('/udo/workflows')
}

export async function runWorkflow(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/workflows/${id}/run`, { method: 'POST' })
}

export async function disableWorkflow(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/workflows/${id}/disable`, { method: 'POST' })
}

export async function createWorkflow(name: string, description?: string): Promise<UDOWorkflow> {
  return apiFetch('/udo/workflows', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
}

// ─── Publish ──────────────────────────────────────────────────────

export async function listPublishTargets(): Promise<UDOPublishTarget[]> {
  return apiFetch('/udo/publish/targets')
}

export async function publishTo(targetId: string, content: any): Promise<{ success: boolean; url?: string }> {
  return apiFetch(`/udo/publish/${targetId}`, {
    method: 'POST',
    body: JSON.stringify(content),
  })
}

// ─── Vault ────────────────────────────────────────────────────────

export async function listVaultEntries(path?: string): Promise<any[]> {
  const qs = path ? `?path=${encodeURIComponent(path)}` : ''
  return apiFetch(`/udo/vault${qs}`)
}

export async function readVaultFile(path: string): Promise<{ content: string; metadata: any }> {
  return apiFetch(`/udo/vault/read`, {
    method: 'POST',
    body: JSON.stringify({ path }),
  })
}

export async function writeVaultFile(path: string, content: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/vault/write`, {
    method: 'POST',
    body: JSON.stringify({ path, content }),
  })
}

// ─── MCP ──────────────────────────────────────────────────────────

export interface MCPServerStatus {
  id: string
  name: string
  running: boolean
  output: string[]
  error?: string
  startedAt?: number
}

export async function getMCPStatus(): Promise<MCPServerStatus[]> {
  return apiFetch('/udo/mcp/status')
}

export async function startMCPServer(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/mcp/${id}/start`, { method: 'POST' })
}

export async function stopMCPServer(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/mcp/${id}/stop`, { method: 'POST' })
}

export async function callMCPTool(serverId: string, tool: string, args: Record<string, any>): Promise<any> {
  return apiFetch(`/udo/mcp/${serverId}/call`, {
    method: 'POST',
    body: JSON.stringify({ tool, args }),
  })
}

// ─── Checks ───────────────────────────────────────────────────────

export interface CheckResult {
  id: string
  name: string
  status: 'pass' | 'fail' | 'running'
  duration: number
  timestamp: string
  output: string
  repository: string
}

export async function listChecks(): Promise<CheckResult[]> {
  return apiFetch('/udo/checks')
}

export async function runCheck(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/udo/checks/${id}/run`, { method: 'POST' })
}

export async function getCheckResults(id: string): Promise<CheckResult> {
  return apiFetch(`/udo/checks/${id}/results`)
}

// ─── Command Execution ────────────────────────────────────────────

export async function executeCommand(command: string): Promise<{ output: string; exitCode: number }> {
  return apiFetch('/udo/exec', {
    method: 'POST',
    body: JSON.stringify({ command }),
  })
}
