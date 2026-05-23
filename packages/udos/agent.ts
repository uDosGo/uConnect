/* ═══════════════════════════════════════════════════════════════════
   @udos/core/agent — Agent Orchestration Engine
   Agents are themselves Skills that orchestrate other Skills.
   Cross-platform: uCode1 (terminal), uCode2/3 (web), USXD (desktop).
   ═══════════════════════════════════════════════════════════════════ */

import type { Agent, AgentInstruction } from './types.ts'
import { executeSkill } from './skill.ts'

// ─── Agent Registry ──────────────────────────────────────────────
const agents = new Map<string, Agent>()

// ─── Agent CRUD ──────────────────────────────────────────────────

export function registerAgent(agent: Agent): void {
  agents.set(agent.id, agent)
}

export function getAgent(id: string): Agent | undefined {
  return agents.get(id)
}

export function listAgents(): Agent[] {
  return Array.from(agents.values())
}

export function removeAgent(id: string): boolean {
  return agents.delete(id)
}

// ─── Agent Execution ─────────────────────────────────────────────

export interface AgentCallResult {
  agent_id: string
  response: string
  tools_used: string[]
  duration_ms: number
}

export async function callAgent(
  agentId: string,
  prompt: string,
  context?: Record<string, unknown>
): Promise<AgentCallResult> {
  const agent = agents.get(agentId)
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`)
  }

  const start = Date.now()
  const toolsUsed: string[] = []

  agent.status = 'running'

  try {
    // In production, this would:
    // 1. Load the agent's instruction (system prompt)
    // 2. Call the LLM with the prompt + context
    // 3. The LLM may call tools (which are Skills)
    // 4. Return the response

    console.log(`[UDO] Calling agent: ${agent.name}`, {
      prompt,
      context,
      instruction: agent.instruction.id,
    })

    // Simulate tool calls based on the agent's available tools
    for (const tool of agent.instruction.tools) {
      const result = await executeSkill(tool, { prompt })
      if (result.success) {
        toolsUsed.push(tool)
      }
    }

    agent.status = 'idle'

    return {
      agent_id: agent.id,
      response: `[${agent.name}] Processed: ${prompt.substring(0, 50)}...`,
      tools_used: toolsUsed,
      duration_ms: Date.now() - start,
    }
  } catch (err) {
    agent.status = 'error'
    throw err
  }
}

export function getAgentStatus(agentId: string): Agent['status'] | undefined {
  return agents.get(agentId)?.status
}

export function stopAgent(agentId: string): boolean {
  const agent = agents.get(agentId)
  if (!agent) return false
  agent.status = 'idle'
  return true
}

// ─── Built-in Agents ─────────────────────────────────────────────

export function registerBuiltinAgents(): void {
  const hivemind: Agent = {
    id: 'hivemind',
    name: 'Hivemind',
    instruction: {
      id: 'hivemind-instruct',
      version: '1.0',
      system_prompt: 'You are Hivemind, the uDOS orchestration agent. You coordinate Skills, manage tasks, and route requests to the appropriate backend.',
      tools: ['summarize', 'translate', 'classify', 'code-review', 'vault-read', 'vault-write'],
      models: ['deepseek-coder', 'claude-sonnet'],
      fallback: 'basic-llm',
    },
    status: 'idle',
    surface: 'ucode3',
  }

  const codeReviewer: Agent = {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    instruction: {
      id: 'code-review-instruct',
      version: '1.0',
      system_prompt: 'You are a senior code reviewer. Analyze code for bugs, security issues, and best practices.',
      tools: ['git-diff', 'eslint', 'vault-read'],
      models: ['deepseek-coder'],
      fallback: 'basic-llm',
    },
    status: 'idle',
    surface: 'ucode1',
  }

  registerAgent(hivemind)
  registerAgent(codeReviewer)
}
