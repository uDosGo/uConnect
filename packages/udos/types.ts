/* ═══════════════════════════════════════════════════════════════════
   @udos/core/types — Core Type Definitions
   Skills, Snacks, Spices, Tasks, Agents, and MCP bridge types.
   ═══════════════════════════════════════════════════════════════════ */

// ─── Action Types (Skills / Snacks / Spices) ─────────────────────
export type ActionType = 'skill' | 'snack' | 'spice'

export interface ActionManifest {
  manifest_version: number
  name: string
  type: ActionType
  image?: string
  entrypoint?: string
  inputs: Record<string, InputSpec>
  outputs: Record<string, OutputSpec>
  mcp_tools?: string[]
}

export interface InputSpec {
  type: 'string' | 'integer' | 'boolean' | 'file' | 'json'
  required?: boolean
  default?: unknown
  description?: string
}

export interface OutputSpec {
  type: 'string' | 'integer' | 'boolean' | 'json'
  description?: string
}

// ─── Task Types ──────────────────────────────────────────────────
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'archived'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  labels: string[]
  surface?: string
  assigned_to?: string
  created_at: string
  completed_at?: string | null
  depends_on: string[]
  on_complete?: TaskAction
}

export interface TaskAction {
  action: 'run' | 'notify' | 'webhook'
  skill?: string
  params?: Record<string, unknown>
  url?: string
}

// ─── Agent Types ─────────────────────────────────────────────────
export interface AgentInstruction {
  id: string
  version: string
  system_prompt: string
  tools: string[]
  models: string[]
  fallback: string
}

export interface Agent {
  id: string
  name: string
  instruction: AgentInstruction
  status: 'idle' | 'running' | 'error'
  surface?: string
}

// ─── Surface Types ───────────────────────────────────────────────
export type SurfaceId = 'ucode1' | 'ucode2' | 'ucode3' | 'ucode4' | 'usxd' | 'proseui' | 'gridui' | 'code4wf'

export interface Surface {
  id: SurfaceId
  name: string
  type: 'terminal' | 'web' | 'desktop'
  url?: string
  status: 'running' | 'stopped' | 'error'
}

// ─── Vault Types ─────────────────────────────────────────────────
export interface VaultEntry {
  path: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'json' | 'file'
  updated_at: string
}

// ─── MCP Types ───────────────────────────────────────────────────
export interface MCPTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
  server: string
}

export interface MCPServer {
  name: string
  status: 'running' | 'stopped' | 'error'
  tools: string[]
}

// ─── Automation Types ────────────────────────────────────────────
export interface AutomationRule {
  name: string
  trigger: AutomationTrigger
  condition?: string
  action: AutomationAction
}

export type AutomationTrigger =
  | { type: 'cron'; schedule: string }
  | { type: 'event'; event: string }
  | { type: 'metric'; metric: string; operator: '>' | '<' | '==' | '>=' | '<='; value: number }

export interface AutomationAction {
  type: 'run' | 'notify' | 'webhook'
  skill?: string
  params?: Record<string, unknown>
  url?: string
}

// ─── Command Types ───────────────────────────────────────────────
export interface UDOCommand {
  verb: string
  noun: string
  description: string
  args?: string[]
  flags?: Record<string, FlagSpec>
}

export interface FlagSpec {
  type: 'string' | 'boolean' | 'integer'
  short?: string
  default?: unknown
  required?: boolean
  description: string
}

// ─── Library Types ───────────────────────────────────────────────
export interface SkillLibrary {
  name: string
  source: string
  skills: string[]
  version: string
}
