/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/run — `udo run` command handlers
   Execute Skills, Snacks, and Spices.
   ═══════════════════════════════════════════════════════════════════ */

import { executeSkill, listSkills, registerBuiltinSpices } from '../skill.ts'
import type { ActionType } from '../types.ts'

export interface RunCommandOptions {
  params?: Record<string, unknown>
  type?: ActionType
}

export async function handleRunSkill(name: string, opts: RunCommandOptions = {}) {
  const result = await executeSkill(name, opts.params, opts.type ?? 'skill')
  return result
}

export async function handleRunSnack(name: string, opts: RunCommandOptions = {}) {
  const result = await executeSkill(name, opts.params, 'snack')
  return result
}

export async function handleRunSpice(name: string, opts: RunCommandOptions = {}) {
  const result = await executeSkill(name, opts.params, 'spice')
  return result
}

export function handleRunList(type?: ActionType) {
  const skills = listSkills(type)
  return { success: true, skills, count: skills.length }
}

export function handleRunInit() {
  registerBuiltinSpices()
  return { success: true, message: 'Built-in spices registered' }
}
