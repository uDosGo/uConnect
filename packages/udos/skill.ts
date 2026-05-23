/* ═══════════════════════════════════════════════════════════════════
   @udos/core/skill — Skill/Snack/Spice Execution Engine
   The Containerised Action Trinity — same binary, different scope.
   ═══════════════════════════════════════════════════════════════════ */

import type { ActionManifest, ActionType, SkillLibrary } from './types.ts'

// ─── Skill Registry ──────────────────────────────────────────────
const skills = new Map<string, ActionManifest>()
const libraries = new Map<string, SkillLibrary>()

// ─── Skill CRUD ──────────────────────────────────────────────────

export function registerSkill(manifest: ActionManifest): void {
  const key = `${manifest.type}:${manifest.name}`
  skills.set(key, manifest)
}

export function getSkill(name: string, type?: ActionType): ActionManifest | undefined {
  if (type) {
    return skills.get(`${type}:${name}`)
  }
  // Search all types
  for (const [key, manifest] of skills) {
    if (key.endsWith(`:${name}`)) {
      return manifest
    }
  }
  return undefined
}

export function listSkills(type?: ActionType): ActionManifest[] {
  const result: ActionManifest[] = []
  for (const [key, manifest] of skills) {
    if (!type || key.startsWith(`${type}:`)) {
      result.push(manifest)
    }
  }
  return result
}

export function removeSkill(name: string, type?: ActionType): boolean {
  if (type) {
    return skills.delete(`${type}:${name}`)
  }
  // Remove all types with this name
  let removed = false
  for (const [key] of skills) {
    if (key.endsWith(`:${name}`)) {
      skills.delete(key)
      removed = true
    }
  }
  return removed
}

// ─── Library Management ──────────────────────────────────────────

export function installLibrary(library: SkillLibrary): void {
  libraries.set(library.name, library)
  for (const skillName of library.skills) {
    registerSkill({
      manifest_version: 1,
      name: `${library.name}/${skillName}`,
      type: 'skill',
      inputs: {},
      outputs: {},
    })
  }
}

export function removeLibrary(name: string): boolean {
  const library = libraries.get(name)
  if (!library) return false

  // Remove all skills from this library
  for (const skillName of library.skills) {
    removeSkill(`${library.name}/${skillName}`)
  }

  return libraries.delete(name)
}

export function listLibraries(): SkillLibrary[] {
  return Array.from(libraries.values())
}

// ─── Execution ───────────────────────────────────────────────────

export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  duration_ms: number
}

export async function executeSkill(
  name: string,
  params: Record<string, unknown> = {},
  type: ActionType = 'skill'
): Promise<ExecutionResult> {
  const manifest = getSkill(name, type)
  if (!manifest) {
    return {
      success: false,
      output: '',
      error: `Skill not found: ${type}:${name}`,
      duration_ms: 0,
    }
  }

  const start = Date.now()

  try {
    // Validate required inputs
    for (const [key, spec] of Object.entries(manifest.inputs)) {
      if (spec.required && !(key in params)) {
        throw new Error(`Missing required input: ${key}`)
      }
    }

    // In production, this would:
    // 1. Pull the container image (if specified)
    // 2. Run the container with params as env vars
    // 3. Capture stdout/stderr
    // 4. Return the result

    console.log(`[UDO] Executing ${type}:${name}`, params)

    return {
      success: true,
      output: `Executed ${name} successfully`,
      duration_ms: Date.now() - start,
    }
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - start,
    }
  }
}

// ─── Built-in Spices ─────────────────────────────────────────────

export function registerBuiltinSpices(): void {
  const spices: ActionManifest[] = [
    {
      manifest_version: 1,
      name: 'save-to-vault',
      type: 'spice',
      inputs: {
        path: { type: 'string', required: true },
        value: { type: 'json', required: true },
      },
      outputs: {
        success: { type: 'boolean' },
      },
    },
    {
      manifest_version: 1,
      name: 'open-surface',
      type: 'spice',
      inputs: {
        surface: { type: 'string', required: true },
      },
      outputs: {
        url: { type: 'string' },
      },
    },
    {
      manifest_version: 1,
      name: 'vault-backup',
      type: 'spice',
      inputs: {},
      outputs: {
        path: { type: 'string' },
      },
    },
    {
      manifest_version: 1,
      name: 'cache-cleaner',
      type: 'spice',
      inputs: {},
      outputs: {
        freed_bytes: { type: 'integer' },
      },
    },
  ]

  for (const spice of spices) {
    registerSkill(spice)
  }
}
