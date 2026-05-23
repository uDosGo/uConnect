/* ═══════════════════════════════════════════════════════════════════
   @udos/core — UDO Core Automation & Execution Framework
   
   Skills, Snacks, Spices & The Unified Command Layer
   
   The Containerised Action Trinity:
   - Skills: User-installed, reusable actions
   - Snacks: Session-only, temporary actions
   - Spices: System-level, pre-installed actions
   
   All are the same thing — containerised, portable actions that
   execute anywhere in the uDOS ecosystem.
   ═══════════════════════════════════════════════════════════════════ */

// ─── Types ───────────────────────────────────────────────────────
export type {
  ActionType,
  ActionManifest,
  InputSpec,
  OutputSpec,
  Task,
  TaskStatus,
  TaskPriority,
  TaskAction,
  Agent,
  AgentInstruction,
  Surface,
  SurfaceId,
  VaultEntry,
  MCPTool,
  MCPServer,
  AutomationRule,
  AutomationTrigger,
  AutomationAction,
  UDOCommand,
  FlagSpec,
  SkillLibrary,
} from './types.ts'

// ─── Core Engines ────────────────────────────────────────────────
export {
  createTask,
  getTask,
  listTasks,
  completeTask,
  reopenTask,
  deleteTask,
  updateTaskStatus,
  addTaskLabel,
  assignTask,
  renderTaskForSurface,
} from './task.ts'

export {
  registerSkill,
  getSkill,
  listSkills,
  removeSkill,
  installLibrary,
  removeLibrary,
  listLibraries,
  executeSkill,
  registerBuiltinSpices,
} from './skill.ts'
export type { ExecutionResult } from './skill.ts'

export {
  registerAgent,
  getAgent,
  listAgents,
  removeAgent,
  callAgent,
  getAgentStatus,
  stopAgent,
  registerBuiltinAgents,
} from './agent.ts'
export type { AgentCallResult } from './agent.ts'

export {
  addRule,
  getRule,
  listRules,
  removeRule,
  evaluateRule,
  parseCronExpression,
  isCronMatch,
  registerDefaultRules,
} from './automation.ts'
export type { RuleEvaluationResult, CronSchedule } from './automation.ts'

// ─── Command Handlers ────────────────────────────────────────────
export {
  handleTaskAdd,
  handleTaskList,
  handleTaskShow,
  handleTaskDo,
  handleTaskUndo,
  handleTaskDelete,
  handleTaskTag,
  handleTaskAssign,
  handleTaskRender,
} from './commands/task.ts'

export {
  handleRunSkill,
  handleRunSnack,
  handleRunSpice,
  handleRunList,
  handleRunInit,
} from './commands/run.ts'

export {
  registerBuiltinSurfaces,
  handleSurfaceList,
  handleSurfaceOpen,
  handleSurfaceClose,
  handleSurfaceFocus,
} from './commands/surface.ts'

export {
  handleVaultGet,
  handleVaultSet,
  handleVaultList,
  handleVaultWatch,
} from './commands/vault.ts'

export {
  handleAgentList,
  handleAgentCall,
  handleAgentStatus,
  handleAgentStop,
  handleAgentInit,
} from './commands/agent.ts'

export {
  handleMCPList,
  handleMCPCall,
  handleMCPServerStart,
  handleMCPServerStop,
  registerMCPTool,
  registerBuiltinMCPTools,
} from './commands/mcp.ts'

export {
  handleDevBuild,
  handleDevTest,
  handleDevLogs,
  handleDevShell,
} from './commands/dev.ts'

// ─── Initialization ──────────────────────────────────────────────

export interface UDOInitOptions {
  registerSpices?: boolean
  registerAgents?: boolean
  registerSurfaces?: boolean
  registerMCP?: boolean
  registerAutomation?: boolean
}

export function initUDO(opts: UDOInitOptions = {}): void {
  const {
    registerSpices = true,
    registerAgents = true,
    registerSurfaces = true,
    registerMCP = true,
    registerAutomation = true,
  } = opts

  if (registerSpices) {
    const { registerBuiltinSpices } = require('./skill.ts')
    registerBuiltinSpices()
  }

  if (registerAgents) {
    const { registerBuiltinAgents } = require('./agent.ts')
    registerBuiltinAgents()
  }

  if (registerSurfaces) {
    const { registerBuiltinSurfaces } = require('./commands/surface.ts')
    registerBuiltinSurfaces()
  }

  if (registerMCP) {
    const { registerBuiltinMCPTools } = require('./commands/mcp.ts')
    registerBuiltinMCPTools()
  }

  if (registerAutomation) {
    const { registerDefaultRules } = require('./automation.ts')
    registerDefaultRules()
  }

  console.log('[UDO] Core initialized')
}
