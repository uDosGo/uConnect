/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/agent — `udo agent` command handlers
   List, call, check status, and stop agents.
   ═══════════════════════════════════════════════════════════════════ */

import {
  listAgents,
  callAgent,
  getAgentStatus,
  stopAgent,
  registerBuiltinAgents,
} from '../agent.ts'

export function handleAgentList() {
  const agents = listAgents()
  return { success: true, agents, count: agents.length }
}

export async function handleAgentCall(id: string, prompt: string, context?: Record<string, unknown>) {
  try {
    const result = await callAgent(id, prompt, context)
    return { success: true, result }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export function handleAgentStatus(id: string) {
  const status = getAgentStatus(id)
  if (!status) return { success: false, error: `Agent not found: ${id}` }
  return { success: true, status }
}

export function handleAgentStop(id: string) {
  const stopped = stopAgent(id)
  if (!stopped) return { success: false, error: `Agent not found: ${id}` }
  return { success: true, message: `Agent ${id} stopped` }
}

export function handleAgentInit() {
  registerBuiltinAgents()
  return { success: true, message: 'Built-in agents registered' }
}
