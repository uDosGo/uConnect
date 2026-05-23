/* ═══════════════════════════════════════════════════════════════════
   @udos/core/task — Task Management Engine
   First-class tasks that trigger Skills/Snacks/Spices on completion.
   Surface-aware rendering for uCode1/2/3/USXD.
   ═══════════════════════════════════════════════════════════════════ */

import type { Task, TaskStatus, TaskPriority } from './types.ts'

// ─── In-Memory Task Store ────────────────────────────────────────
// In production, this would be backed by the Vault or a database.
const tasks = new Map<string, Task>()

let nextId = 1

function generateId(): string {
  return `task_${Date.now()}_${nextId++}`
}

// ─── Task CRUD ───────────────────────────────────────────────────

export function createTask(
  title: string,
  opts?: {
    description?: string
    priority?: TaskPriority
    labels?: string[]
    surface?: string
    assigned_to?: string
    depends_on?: string[]
    on_complete?: Task['on_complete']
  }
): Task {
  const task: Task = {
    id: generateId(),
    title,
    description: opts?.description,
    status: 'pending',
    priority: opts?.priority ?? 'medium',
    labels: opts?.labels ?? [],
    surface: opts?.surface,
    assigned_to: opts?.assigned_to,
    created_at: new Date().toISOString(),
    completed_at: null,
    depends_on: opts?.depends_on ?? [],
    on_complete: opts?.on_complete,
  }
  tasks.set(task.id, task)
  return task
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id)
}

export function listTasks(filters?: {
  status?: TaskStatus
  priority?: TaskPriority
  surface?: string
  label?: string
}): Task[] {
  let result = Array.from(tasks.values())

  if (filters?.status) {
    result = result.filter(t => t.status === filters.status)
  }
  if (filters?.priority) {
    result = result.filter(t => t.priority === filters.priority)
  }
  if (filters?.surface) {
    result = result.filter(t => t.surface === filters.surface)
  }
  if (filters?.label) {
    result = result.filter(t => t.labels.includes(filters.label!))
  }

  // Sort by priority (critical first), then by created_at
  const priorityOrder: Record<TaskPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }
  result.sort((a, b) => {
    const pa = priorityOrder[a.priority]
    const pb = priorityOrder[b.priority]
    if (pa !== pb) return pa - pb
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return result
}

export function completeTask(id: string): Task | undefined {
  const task = tasks.get(id)
  if (!task) return undefined

  // Check dependencies
  const blocked = task.depends_on.some(depId => {
    const dep = tasks.get(depId)
    return dep && dep.status !== 'completed'
  })
  if (blocked) {
    task.status = 'blocked'
    return task
  }

  task.status = 'completed'
  task.completed_at = new Date().toISOString()

  // Trigger on_complete action
  if (task.on_complete) {
    triggerAction(task.on_complete)
  }

  return task
}

export function reopenTask(id: string): Task | undefined {
  const task = tasks.get(id)
  if (!task) return undefined
  task.status = 'in_progress'
  task.completed_at = null
  return task
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id)
}

export function updateTaskStatus(id: string, status: TaskStatus): Task | undefined {
  const task = tasks.get(id)
  if (!task) return undefined
  task.status = status
  return task
}

export function addTaskLabel(id: string, label: string): Task | undefined {
  const task = tasks.get(id)
  if (!task) return undefined
  if (!task.labels.includes(label)) {
    task.labels.push(label)
  }
  return task
}

export function assignTask(id: string, assignee: string): Task | undefined {
  const task = tasks.get(id)
  if (!task) return undefined
  task.assigned_to = assignee
  return task
}

// ─── Action Trigger ──────────────────────────────────────────────

function triggerAction(action: Task['on_complete']): void {
  if (!action) return

  switch (action.action) {
    case 'run':
      console.log(`[UDO] Triggering skill: ${action.skill}`, action.params)
      // In production, this would call the run command
      break
    case 'notify':
      console.log(`[UDO] Notification: ${action.skill}`)
      break
    case 'webhook':
      console.log(`[UDO] Webhook: ${action.url}`)
      break
  }
}

// ─── Surface-Aware Rendering ─────────────────────────────────────

export function renderTaskForSurface(task: Task, surface: string): string {
  const statusIcon: Record<TaskStatus, string> = {
    pending: '☐',
    in_progress: '▶',
    completed: '✓',
    blocked: '⊗',
    archived: '◷',
  }

  const priorityTag: Record<TaskPriority, string> = {
    low: 'LOW',
    medium: 'MED',
    high: 'HIGH',
    critical: '!!!',
  }

  switch (surface) {
    case 'ucode1':
      // Teletext-style: monospace, block chars
      return [
        `[${statusIcon[task.status]}] ${task.title.toUpperCase()}`,
        `    [${priorityTag[task.priority]}] ${task.labels.join(', ')}`,
        task.depends_on.length > 0 ? `    DEPENDS: ${task.depends_on.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n')

    case 'ucode2':
    case 'ucode3':
      // Web-style: JSON for frontend rendering
      return JSON.stringify(task, null, 2)

    case 'usxd':
      // Desktop-style: compact
      return `${statusIcon[task.status]} ${task.title} [${priorityTag[task.priority]}]`

    default:
      return JSON.stringify(task)
  }
}
