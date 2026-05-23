/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/task — `udo task` command handlers
   ═══════════════════════════════════════════════════════════════════ */

import {
  createTask,
  getTask,
  listTasks,
  completeTask,
  reopenTask,
  deleteTask,
  addTaskLabel,
  assignTask,
  renderTaskForSurface,
} from '../task.ts'
import type { TaskPriority, TaskStatus } from '../types.ts'

export interface TaskCommandOptions {
  description?: string
  priority?: TaskPriority
  labels?: string[]
  surface?: string
  assigned_to?: string
  depends_on?: string[]
  status?: TaskStatus
  label?: string
}

export function handleTaskAdd(title: string, opts: TaskCommandOptions = {}) {
  const task = createTask(title, opts)
  return { success: true, task }
}

export function handleTaskList(opts: { status?: TaskStatus; priority?: TaskPriority; surface?: string; label?: string } = {}) {
  const tasks = listTasks(opts)
  return { success: true, tasks, count: tasks.length }
}

export function handleTaskShow(id: string) {
  const task = getTask(id)
  if (!task) return { success: false, error: `Task not found: ${id}` }
  return { success: true, task }
}

export function handleTaskDo(id: string) {
  const task = completeTask(id)
  if (!task) return { success: false, error: `Task not found: ${id}` }
  return { success: true, task }
}

export function handleTaskUndo(id: string) {
  const task = reopenTask(id)
  if (!task) return { success: false, error: `Task not found: ${id}` }
  return { success: true, task }
}

export function handleTaskDelete(id: string) {
  const deleted = deleteTask(id)
  if (!deleted) return { success: false, error: `Task not found: ${id}` }
  return { success: true }
}

export function handleTaskTag(id: string, tag: string) {
  const task = addTaskLabel(id, tag)
  if (!task) return { success: false, error: `Task not found: ${id}` }
  return { success: true, task }
}

export function handleTaskAssign(id: string, assignee: string) {
  const task = assignTask(id, assignee)
  if (!task) return { success: false, error: `Task not found: ${id}` }
  return { success: true, task }
}

export function handleTaskRender(id: string, surface: string) {
  const task = getTask(id)
  if (!task) return { success: false, error: `Task not found: ${id}` }
  const rendered = renderTaskForSurface(task, surface)
  return { success: true, rendered }
}
