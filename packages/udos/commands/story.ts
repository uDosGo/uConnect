/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/story — `udo story` command handlers
   Story Format: save_binder action, execution tracking, error handling
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'

// ─── Types ─────────────────────────────────────────────────────────

export interface StoryAction {
  type: 'save_binder' | 'run_snack' | 'render_mdx' | 'emit_event' | 'log'
  params: Record<string, unknown>
}

export interface StoryStep {
  id: string
  name: string
  description?: string
  actions: StoryAction[]
  on_success?: StoryAction[]
  on_error?: StoryAction[]
  timeout_ms?: number
}

export interface Story {
  id: string
  version: string
  title: string
  description?: string
  author?: string
  tags?: string[]
  steps: StoryStep[]
  binder_target?: string
  created_at?: string
  updated_at?: string
}

export interface StoryExecution {
  story_id: string
  execution_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial'
  current_step: number
  total_steps: number
  started_at: string
  completed_at?: string
  results: StoryStepResult[]
  error?: string
}

export interface StoryStepResult {
  step_id: string
  status: 'success' | 'failed' | 'skipped'
  duration_ms: number
  actions: StoryActionResult[]
  error?: string
}

export interface StoryActionResult {
  type: string
  status: 'success' | 'failed'
  output?: string
  error?: string
  duration_ms: number
}

export interface StoryOptions {
  input: string
  output?: string
  binder?: string
  dryRun?: boolean
  verbose?: boolean
}

// ─── Story Parser ──────────────────────────────────────────────────

export function parseStory(content: string): Story {
  // Try JSON first
  try {
    const parsed = JSON.parse(content)
    validateStory(parsed)
    return parsed
  } catch {
    // Not JSON, try YAML-like frontmatter
    return parseStoryFromMarkdown(content)
  }
}

function parseStoryFromMarkdown(content: string): Story {
  const lines = content.split('\n')
  const story: Story = {
    id: `story-${Date.now()}`,
    version: '1.0',
    title: 'Untitled Story',
    steps: [],
  }

  let inFrontmatter = false
  let currentStep: StoryStep | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '---') {
      inFrontmatter = !inFrontmatter
      continue
    }

    if (inFrontmatter) {
      const [key, ...rest] = trimmed.split(':')
      const value = rest.join(':').trim()
      switch (key.trim()) {
        case 'id':
          story.id = value
          break
        case 'title':
          story.title = value
          break
        case 'version':
          story.version = value
          break
        case 'author':
          story.author = value
          break
        case 'description':
          story.description = value
          break
        case 'binder_target':
          story.binder_target = value
          break
        case 'tags':
          story.tags = value.split(',').map((t) => t.trim())
          break
      }
      continue
    }

    if (trimmed.startsWith('## Step:')) {
      if (currentStep) {
        story.steps.push(currentStep)
      }
      currentStep = {
        id: `step-${story.steps.length + 1}`,
        name: trimmed.replace('## Step:', '').trim(),
        actions: [],
      }
      continue
    }

    if (trimmed.startsWith('- action:')) {
      const actionType = trimmed.replace('- action:', '').trim() as StoryAction['type']
      if (currentStep) {
        currentStep.actions.push({
          type: actionType,
          params: {},
        })
      }
      continue
    }

    if (trimmed.startsWith('  param:')) {
      const paramStr = trimmed.replace('  param:', '').trim()
      const colonIdx = paramStr.indexOf(':')
      if (colonIdx > 0 && currentStep && currentStep.actions.length > 0) {
        const key = paramStr.substring(0, colonIdx).trim()
        const value = paramStr.substring(colonIdx + 1).trim()
        const lastAction = currentStep.actions[currentStep.actions.length - 1]
        lastAction.params[key] = value
      }
      continue
    }

    if (trimmed.startsWith('  timeout:')) {
      if (currentStep) {
        currentStep.timeout_ms = parseInt(trimmed.replace('  timeout:', '').trim(), 10) || 30000
      }
      continue
    }
  }

  if (currentStep) {
    story.steps.push(currentStep)
  }

  validateStory(story)
  return story
}

function validateStory(story: Story): void {
  if (!story.id) throw new Error('Story must have an id')
  if (!story.title) throw new Error('Story must have a title')
  if (!story.steps || story.steps.length === 0) throw new Error('Story must have at least one step')
  for (const step of story.steps) {
    if (!step.id) throw new Error('Each step must have an id')
    if (!step.name) throw new Error('Each step must have a name')
    if (!step.actions || step.actions.length === 0) throw new Error(`Step "${step.name}" must have at least one action`)
  }
}

// ─── Story Loader ──────────────────────────────────────────────────

export function loadStory(path: string): Story {
  const content = readFileSync(path, 'utf-8')
  return parseStory(content)
}

export function saveStory(story: Story, path: string): void {
  const dir = dirname(path)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(path, JSON.stringify(story, null, 2), 'utf-8')
}

// ─── Binder Save Action ────────────────────────────────────────────

interface BinderSaveParams {
  key: string
  value: unknown
  namespace?: string
  tags?: string[]
}

function executeSaveBinder(params: Record<string, unknown>, binderDir?: string): StoryActionResult {
  const start = performance.now()
  try {
    const { key, value, namespace = 'default', tags = [] } = params as unknown as BinderSaveParams

    if (!key) {
      return {
        type: 'save_binder',
        status: 'failed',
        error: 'Missing required parameter: key',
        duration_ms: Math.round(performance.now() - start),
      }
    }

    const binderPath = binderDir
      ? join(binderDir, namespace, `${key}.json`)
      : join(process.cwd(), '.binder', namespace, `${key}.json`)

    const dir = dirname(binderPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    const entry = {
      key,
      value,
      namespace,
      tags,
      saved_at: new Date().toISOString(),
    }

    writeFileSync(binderPath, JSON.stringify(entry, null, 2), 'utf-8')

    return {
      type: 'save_binder',
      status: 'success',
      output: `Saved ${namespace}:${key} to binder`,
      duration_ms: Math.round(performance.now() - start),
    }
  } catch (error) {
    return {
      type: 'save_binder',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      duration_ms: Math.round(performance.now() - start),
    }
  }
}

// ─── Action Executor ───────────────────────────────────────────────

function executeAction(action: StoryAction, binderDir?: string): StoryActionResult {
  const start = performance.now()

  switch (action.type) {
    case 'save_binder':
      return executeSaveBinder(action.params, binderDir)

    case 'run_snack':
      return {
        type: 'run_snack',
        status: 'success',
        output: `Snack execution: ${JSON.stringify(action.params)}`,
        duration_ms: Math.round(performance.now() - start),
      }

    case 'render_mdx':
      return {
        type: 'render_mdx',
        status: 'success',
        output: `MDX render: ${JSON.stringify(action.params)}`,
        duration_ms: Math.round(performance.now() - start),
      }

    case 'emit_event':
      return {
        type: 'emit_event',
        status: 'success',
        output: `Event emitted: ${JSON.stringify(action.params)}`,
        duration_ms: Math.round(performance.now() - start),
      }

    case 'log':
      console.log(`[STORY LOG] ${JSON.stringify(action.params)}`)
      return {
        type: 'log',
        status: 'success',
        output: `Logged: ${JSON.stringify(action.params)}`,
        duration_ms: Math.round(performance.now() - start),
      }

    default:
      return {
        type: action.type,
        status: 'failed',
        error: `Unknown action type: ${action.type}`,
        duration_ms: Math.round(performance.now() - start),
      }
  }
}

// ─── Story Executor ────────────────────────────────────────────────

export async function executeStory(
  story: Story,
  options: StoryOptions = {},
): Promise<StoryExecution> {
  const execution: StoryExecution = {
    story_id: story.id,
    execution_id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    status: 'running',
    current_step: 0,
    total_steps: story.steps.length,
    started_at: new Date().toISOString(),
    results: [],
  }

  const binderDir = options.binder || process.env.UDO_BINDER_DIR

  if (options.verbose) {
    console.log(`\n📖 Executing Story: "${story.title}" (${story.id})`)
    console.log(`   Execution ID: ${execution.execution_id}`)
    console.log(`   Steps: ${story.steps.length}`)
    if (options.dryRun) console.log('   [DRY RUN — no side effects]')
    console.log()
  }

  for (let i = 0; i < story.steps.length; i++) {
    const step = story.steps[i]
    execution.current_step = i + 1

    if (options.verbose) {
      console.log(`   Step ${i + 1}/${story.steps.length}: ${step.name}`)
    }

    const stepResult: StoryStepResult = {
      step_id: step.id,
      status: 'success',
      duration_ms: 0,
      actions: [],
    }

    const stepStart = performance.now()

    for (const action of step.actions) {
      if (options.dryRun) {
        stepResult.actions.push({
          type: action.type,
          status: 'success',
          output: `[DRY RUN] Would execute: ${action.type}`,
          duration_ms: 0,
        })
        continue
      }

      const result = executeAction(action, binderDir)
      stepResult.actions.push(result)

      if (result.status === 'failed') {
        stepResult.status = 'failed'
        stepResult.error = result.error

        // Execute on_error handlers
        if (step.on_error) {
          for (const errorAction of step.on_error) {
            const errorResult = executeAction(errorAction, binderDir)
            stepResult.actions.push(errorResult)
          }
        }

        break
      }
    }

    stepResult.duration_ms = Math.round(performance.now() - stepStart)
    execution.results.push(stepResult)

    if (options.verbose) {
      const icon = stepResult.status === 'success' ? '✅' : '❌'
      console.log(`   ${icon} ${stepResult.status} (${stepResult.duration_ms}ms)`)
      for (const action of stepResult.actions) {
        console.log(`      ${action.status === 'success' ? '✓' : '✗'} ${action.type}: ${action.output || action.error}`)
      }
      console.log()
    }

    // Execute on_success handlers
    if (stepResult.status === 'success' && step.on_success) {
      for (const successAction of step.on_success) {
        const successResult = executeAction(successAction, binderDir)
        stepResult.actions.push(successResult)
      }
    }
  }

  // Determine overall status
  const failedSteps = execution.results.filter((r) => r.status === 'failed')
  const partialSteps = execution.results.filter((r) => r.status === 'skipped')

  if (failedSteps.length === execution.total_steps) {
    execution.status = 'failed'
  } else if (failedSteps.length > 0 || partialSteps.length > 0) {
    execution.status = 'partial'
  } else {
    execution.status = 'completed'
  }

  execution.completed_at = new Date().toISOString()

  if (options.verbose) {
    const totalDuration = execution.results.reduce((sum, r) => sum + r.duration_ms, 0)
    console.log(`\n📊 Execution Complete`)
    console.log(`   Status: ${execution.status}`)
    console.log(`   Duration: ${totalDuration}ms`)
    console.log(`   Steps: ${execution.results.filter((r) => r.status === 'success').length}/${execution.total_steps} succeeded`)
  }

  return execution
}

// ─── CLI Handlers ──────────────────────────────────────────────────

export async function handleStoryRun(options: StoryOptions): Promise<StoryExecution> {
  if (!options.input) {
    throw new Error('Input file path is required. Use --input <path>')
  }
  const story = loadStory(options.input)
  return executeStory(story, options)
}

export function handleStoryValidate(options: { input: string }): { valid: boolean; errors: string[] } {
  try {
    const story = loadStory(options.input)
    return { valid: true, errors: [] }
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

export function handleStoryList(dir?: string): Story[] {
  const storyDir = dir || join(process.cwd(), 'stories')
  if (!existsSync(storyDir)) {
    return []
  }

  const { readdirSync } = require('node:fs')
  const files = readdirSync(storyDir).filter((f: string) => f.endsWith('.story.json') || f.endsWith('.story.md'))

  return files.map((file: string) => {
    try {
      return loadStory(join(storyDir, file))
    } catch {
      return null
    }
  }).filter(Boolean)
}

export function handleStoryTemplate(): Story {
  return {
    id: 'example-story',
    version: '1.0',
    title: 'Example Story',
    description: 'A template story demonstrating the Story format',
    author: 'uDos',
    tags: ['example', 'template'],
    binder_target: 'stories',
    steps: [
      {
        id: 'step-1',
        name: 'Save initial data',
        actions: [
          {
            type: 'save_binder',
            params: {
              key: 'example-data',
              value: { message: 'Hello from Story!' },
              namespace: 'stories',
              tags: ['example'],
            },
          },
        ],
        on_success: [
          {
            type: 'log',
            params: { level: 'info', message: 'Step 1 completed successfully' },
          },
        ],
        on_error: [
          {
            type: 'log',
            params: { level: 'error', message: 'Step 1 failed' },
          },
        ],
      },
      {
        id: 'step-2',
        name: 'Process and save results',
        actions: [
          {
            type: 'save_binder',
            params: {
              key: 'processed-results',
              value: { status: 'done', timestamp: new Date().toISOString() },
              namespace: 'stories',
              tags: ['processed'],
            },
          },
        ],
      },
    ],
  }
}
