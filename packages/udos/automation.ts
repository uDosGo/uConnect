/* ═══════════════════════════════════════════════════════════════════
   @udos/core/automation — Automation Rules Engine
   Cron-triggered, event-driven, and metric-based automation.
   Rules trigger Skills/Snacks/Spices automatically.
   ═══════════════════════════════════════════════════════════════════ */

import type { AutomationRule } from './types.ts'
import { executeSkill } from './skill.ts'

// ─── Rules Registry ──────────────────────────────────────────────
const rules = new Map<string, AutomationRule>()

// ─── Rule CRUD ───────────────────────────────────────────────────

export function addRule(rule: AutomationRule): void {
  rules.set(rule.name, rule)
}

export function getRule(name: string): AutomationRule | undefined {
  return rules.get(name)
}

export function listRules(): AutomationRule[] {
  return Array.from(rules.values())
}

export function removeRule(name: string): boolean {
  return rules.delete(name)
}

// ─── Rule Evaluation ─────────────────────────────────────────────

export interface RuleEvaluationResult {
  rule: string
  triggered: boolean
  action_result?: {
    success: boolean
    output: string
  }
}

export async function evaluateRule(rule: AutomationRule): Promise<RuleEvaluationResult> {
  const result: RuleEvaluationResult = {
    rule: rule.name,
    triggered: false,
  }

  // Check condition if present
  if (rule.condition) {
    const conditionMet = evaluateCondition(rule.condition)
    if (!conditionMet) {
      return result
    }
  }

  result.triggered = true

  // Execute the action
  if (rule.action.type === 'run' && rule.action.skill) {
    const execResult = await executeSkill(rule.action.skill, rule.action.params)
    result.action_result = {
      success: execResult.success,
      output: execResult.output,
    }
  }

  return result
}

// ─── Condition Evaluation ────────────────────────────────────────
// Simple expression evaluator for conditions like:
//   "task.labels contains 'deploy'"
//   "metric.disk_usage > 90"

function evaluateCondition(condition: string): boolean {
  // Parse simple conditions
  const containsMatch = condition.match(/(\w+(?:\.\w+)*)\s+contains\s+'([^']+)'/)
  if (containsMatch) {
    const [, path, value] = containsMatch
    return evaluateContains(path, value)
  }

  const comparisonMatch = condition.match(/(\w+(?:\.\w+)*)\s*(>|<|>=|<=|==)\s*(\d+)/)
  if (comparisonMatch) {
    const [, path, operator, numStr] = comparisonMatch
    const value = parseFloat(numStr)
    return evaluateComparison(path, operator, value)
  }

  console.warn(`[UDO] Unknown condition format: ${condition}`)
  return false
}

function evaluateContains(path: string, value: string): boolean {
  // In production, this would check actual state
  // For now, return true for demo purposes
  console.log(`[UDO] Checking if ${path} contains '${value}'`)
  return true
}

function evaluateComparison(path: string, operator: string, value: number): boolean {
  // In production, this would check actual metrics
  // For now, return true for demo purposes
  console.log(`[UDO] Checking if ${path} ${operator} ${value}`)
  return true
}

// ─── Cron Schedule Matching ──────────────────────────────────────
// Simple cron expression parser for schedules like:
//   "daily@03:00"
//   "0 0 * * 0" (weekly)

export interface CronSchedule {
  minute: number
  hour: number
  dayOfMonth: number | '*'
  month: number | '*'
  dayOfWeek: number | '*'
}

export function parseCronExpression(expr: string): CronSchedule | null {
  // Handle shorthand: "daily@03:00"
  const shorthandMatch = expr.match(/^(\w+)@(\d{2}):(\d{2})$/)
  if (shorthandMatch) {
    const [, period, hour, minute] = shorthandMatch
    const h = parseInt(hour)
    const m = parseInt(minute)

    switch (period) {
      case 'daily':
        return { minute: m, hour: h, dayOfMonth: '*', month: '*', dayOfWeek: '*' }
      case 'weekly':
        return { minute: m, hour: h, dayOfMonth: '*', month: '*', dayOfWeek: 0 }
      case 'monthly':
        return { minute: m, hour: h, dayOfMonth: 1, month: '*', dayOfWeek: '*' }
      default:
        return null
    }
  }

  // Handle standard cron: "0 0 * * 0"
  const parts = expr.split(/\s+/)
  if (parts.length === 5) {
    return {
      minute: parts[0] === '*' ? -1 : parseInt(parts[0]),
      hour: parts[1] === '*' ? -1 : parseInt(parts[1]),
      dayOfMonth: parts[2] === '*' ? '*' : parseInt(parts[2]),
      month: parts[3] === '*' ? '*' : parseInt(parts[3]),
      dayOfWeek: parts[4] === '*' ? '*' : parseInt(parts[4]),
    }
  }

  return null
}

export function isCronMatch(schedule: CronSchedule, date: Date = new Date()): boolean {
  if (schedule.minute >= 0 && date.getMinutes() !== schedule.minute) return false
  if (schedule.hour >= 0 && date.getHours() !== schedule.hour) return false
  if (schedule.dayOfMonth !== '*' && date.getDate() !== schedule.dayOfMonth) return false
  if (schedule.month !== '*' && date.getMonth() + 1 !== schedule.month) return false
  if (schedule.dayOfWeek !== '*' && date.getDay() !== schedule.dayOfWeek) return false
  return true
}

// ─── Default Rules ───────────────────────────────────────────────

export function registerDefaultRules(): void {
  const defaults: AutomationRule[] = [
    {
      name: 'auto-backup',
      trigger: { type: 'cron', schedule: 'daily@03:00' },
      action: { type: 'run', skill: 'vault-backup' },
    },
    {
      name: 'on-task-complete',
      trigger: { type: 'event', event: 'task.completed' },
      condition: "task.labels contains 'deploy'",
      action: {
        type: 'run',
        skill: 'deploy-skill',
        params: { env: 'production' },
      },
    },
    {
      name: 'low-storage',
      trigger: { type: 'metric', metric: 'disk_usage', operator: '>', value: 90 },
      action: { type: 'run', skill: 'cache-cleaner' },
    },
  ]

  for (const rule of defaults) {
    addRule(rule)
  }
}
