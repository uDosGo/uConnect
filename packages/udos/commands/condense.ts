/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/condense — `udo condense` command handlers
   CONDENSE v3: AI-assisted content merging and reduction
   Target: 30-50% reduction with semantic preservation
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

// ─── Types ─────────────────────────────────────────────────────────

export interface CondenseOptions {
  input: string
  output?: string
  strategy?: 'ai' | 'rule' | 'hybrid'
  targetReduction?: number // 0.3 = 30% reduction
  preserve?: string[] // sections to preserve verbatim
  dryRun?: boolean
  verbose?: boolean
}

export interface CondenseResult {
  inputPath: string
  outputPath: string
  inputSize: number // bytes
  outputSize: number // bytes
  reduction: number // 0.0 - 1.0
  sectionsRemoved: number
  sectionsMerged: number
  strategy: string
  duration_ms: number
  warnings: string[]
}

export interface CondenseReport {
  timestamp: string
  results: CondenseResult[]
  totalInputSize: number
  totalOutputSize: number
  averageReduction: number
}

// ─── Section Types ─────────────────────────────────────────────────

interface DocumentSection {
  id: string
  type: 'comment' | 'docstring' | 'code' | 'whitespace' | 'import' | 'test' | 'config'
  content: string
  lines: number
  priority: 'preserve' | 'normal' | 'compress' | 'remove'
}

// ─── Rule-Based Condenser ──────────────────────────────────────────

function splitIntoSections(content: string): DocumentSection[] {
  const lines = content.split('\n')
  const sections: DocumentSection[] = []
  let currentSection: string[] = []
  let currentType: DocumentSection['type'] = 'code'
  let sectionStart = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Detect section type changes
    let newType: DocumentSection['type'] | null = null

    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      newType = 'comment'
    } else if (trimmed.startsWith('import ') || trimmed.startsWith('from ') || trimmed.startsWith('require(')) {
      newType = 'import'
    } else if (trimmed === '' && currentType === 'whitespace') {
      // skip consecutive blank lines
      continue
    } else if (trimmed === '') {
      newType = 'whitespace'
    } else if (trimmed.startsWith('describe(') || trimmed.startsWith('it(') || trimmed.startsWith('test(')) {
      newType = 'test'
    }

    if (newType && newType !== currentType && currentSection.length > 0) {
      sections.push({
        id: `sec-${sectionStart}`,
        type: currentType,
        content: currentSection.join('\n'),
        lines: currentSection.length,
        priority: getPriority(currentType),
      })
      currentSection = []
      sectionStart = i
      currentType = newType
    }

    currentSection.push(line)
  }

  // Push final section
  if (currentSection.length > 0) {
    sections.push({
      id: `sec-${sectionStart}`,
      type: currentType,
      content: currentSection.join('\n'),
      lines: currentSection.length,
      priority: getPriority(currentType),
    })
  }

  return sections
}

function getPriority(type: DocumentSection['type']): DocumentSection['priority'] {
  switch (type) {
    case 'import':
      return 'compress'
    case 'comment':
      return 'compress'
    case 'whitespace':
      return 'remove'
    case 'test':
      return 'normal'
    case 'config':
      return 'normal'
    default:
      return 'preserve'
  }
}

function condenseSection(section: DocumentSection, targetReduction: number): string {
  if (section.priority === 'preserve') return section.content
  if (section.priority === 'remove') return ''

  let content = section.content

  if (section.type === 'comment') {
    // Condense multi-line comments to single line
    const lines = content.split('\n')
    if (lines.length > 3) {
      // Keep first and last line of block comments, condense middle
      const firstLine = lines[0]
      const lastLine = lines[lines.length - 1]
      const middleLines = lines.slice(1, -1).filter((l) => {
        const t = l.trim()
        return t.length > 0 && !t.startsWith('*') && !t.startsWith('//')
      })
      if (middleLines.length > 2) {
        content = [firstLine, ' * ... (condensed)', lastLine].join('\n')
      }
    }
  }

  if (section.type === 'import') {
    // Group imports and remove duplicates
    const imports = content.split('\n').filter((l) => l.trim().length > 0)
    const uniqueImports = [...new Set(imports.map((l) => l.trim()))]
    if (uniqueImports.length < imports.length) {
      content = uniqueImports.join('\n')
    }
  }

  if (section.type === 'whitespace') {
    content = ''
  }

  return content
}

// ─── AI-Assisted Condenser (Scaffold) ──────────────────────────────

interface AICondenseOptions {
  model?: string
  apiKey?: string
  endpoint?: string
}

async function condenseWithAI(
  content: string,
  targetReduction: number,
  preserveSections: string[],
  options: AICondenseOptions = {},
): Promise<{ condensed: string; warnings: string[] }> {
  const warnings: string[] = []

  // Check if AI mode is available
  const apiKey = options.apiKey || process.env.UDO_AI_API_KEY
  if (!apiKey) {
    warnings.push('AI condensation unavailable: no API key configured. Falling back to rule-based.')
    return { condensed: condenseWithRules(content, targetReduction, preserveSections), warnings }
  }

  try {
    const endpoint = options.endpoint || 'https://api.openai.com/v1/chat/completions'
    const model = options.model || 'gpt-4o-mini'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a code condensation assistant. Reduce the following content by ${Math.round(targetReduction * 100)}% while preserving all semantic meaning, structure, and important details. Remove redundant comments, condense verbose sections, and merge related content. Preserve these sections verbatim: ${preserveSections.join(', ')}. Return ONLY the condensed content, no explanations.`,
          },
          {
            role: 'user',
            content,
          },
        ],
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      warnings.push(`AI API returned ${response.status}. Falling back to rule-based.`)
      return { condensed: condenseWithRules(content, targetReduction, preserveSections), warnings }
    }

    const data = await response.json()
    const condensed = data.choices?.[0]?.message?.content || ''

    if (!condensed) {
      warnings.push('AI returned empty response. Falling back to rule-based.')
      return { condensed: condenseWithRules(content, targetReduction, preserveSections), warnings }
    }

    return { condensed, warnings }
  } catch (error) {
    warnings.push(`AI condensation failed: ${error instanceof Error ? error.message : String(error)}. Falling back to rule-based.`)
    return { condensed: condenseWithRules(content, targetReduction, preserveSections), warnings }
  }
}

// ─── Rule-Based Condenser (Fallback) ───────────────────────────────

function condenseWithRules(
  content: string,
  targetReduction: number,
  preserveSections: string[],
): string {
  const sections = splitIntoSections(content)
  let condensedLines: string[] = []
  let sectionsRemoved = 0
  let sectionsMerged = 0

  for (const section of sections) {
    if (section.priority === 'remove') {
      sectionsRemoved++
      continue
    }

    const condensed = condenseSection(section, targetReduction)
    if (condensed.length > 0) {
      condensedLines.push(condensed)
    } else {
      sectionsRemoved++
    }
  }

  // Remove excessive blank lines (max 1 between sections)
  const result = condensedLines
    .join('\n')
    .split('\n')
    .reduce((acc: string[], line, i, arr) => {
      if (line.trim() === '' && i > 0 && arr[i - 1].trim() === '') {
        return acc // skip consecutive blank lines
      }
      acc.push(line)
      return acc
    }, [])
    .join('\n')

  return result
}

// ─── Main Handler ──────────────────────────────────────────────────

export async function handleCondense(options: CondenseOptions): Promise<CondenseResult> {
  const start = performance.now()
  const warnings: string[] = []

  // Read input
  let content: string
  try {
    content = readFileSync(options.input, 'utf-8')
  } catch (error) {
    throw new Error(`Cannot read input file: ${options.input} — ${error instanceof Error ? error.message : String(error)}`)
  }

  const inputSize = Buffer.byteLength(content, 'utf-8')
  const targetReduction = options.targetReduction || 0.3
  const preserve = options.preserve || []

  // Condense
  let condensed: string
  const strategy = options.strategy || 'hybrid'

  if (strategy === 'ai') {
    const result = await condenseWithAI(content, targetReduction, preserve)
    condensed = result.condensed
    warnings.push(...result.warnings)
  } else if (strategy === 'rule') {
    condensed = condenseWithRules(content, targetReduction, preserve)
  } else {
    // hybrid: try AI first, fall back to rules
    const result = await condenseWithAI(content, targetReduction, preserve)
    condensed = result.condensed
    warnings.push(...result.warnings)
  }

  const outputSize = Buffer.byteLength(condensed, 'utf-8')
  const reduction = inputSize > 0 ? 1 - outputSize / inputSize : 0

  // Determine output path
  const outputPath = options.output || options.input.replace(/\.(\w+)$/, '.condensed.$1')

  // Write output (unless dry run)
  if (!options.dryRun) {
    const dir = dirname(outputPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(outputPath, condensed, 'utf-8')
  }

  const duration_ms = Math.round(performance.now() - start)

  if (options.verbose || options.dryRun) {
    console.log(`\n📊 CONDENSE v3 Report`)
    console.log(`   Input:  ${options.input} (${formatBytes(inputSize)})`)
    console.log(`   Output: ${outputPath} (${formatBytes(outputSize)})`)
    console.log(`   Reduction: ${Math.round(reduction * 100)}%`)
    console.log(`   Strategy: ${strategy}`)
    console.log(`   Duration: ${duration_ms}ms`)
    if (options.dryRun) console.log(`   [DRY RUN — no files written]`)
    if (warnings.length > 0) {
      console.log(`   Warnings:`)
      for (const w of warnings) console.log(`     ⚠️  ${w}`)
    }
  }

  return {
    inputPath: options.input,
    outputPath,
    inputSize,
    outputSize,
    reduction,
    sectionsRemoved: 0,
    sectionsMerged: 0,
    strategy,
    duration_ms,
    warnings,
  }
}

export async function handleCondenseBatch(
  inputs: string[],
  options: CondenseOptions,
): Promise<CondenseReport> {
  const results: CondenseResult[] = []
  let totalInputSize = 0
  let totalOutputSize = 0

  for (const input of inputs) {
    const result = await handleCondense({ ...options, input })
    results.push(result)
    totalInputSize += result.inputSize
    totalOutputSize += result.outputSize
  }

  const report: CondenseReport = {
    timestamp: new Date().toISOString(),
    results,
    totalInputSize,
    totalOutputSize,
    averageReduction: totalInputSize > 0 ? 1 - totalOutputSize / totalInputSize : 0,
  }

  console.log(`\n📊 Batch Condense Report`)
  console.log(`   Files: ${results.length}`)
  console.log(`   Total Input:  ${formatBytes(totalInputSize)}`)
  console.log(`   Total Output: ${formatBytes(totalOutputSize)}`)
  console.log(`   Average Reduction: ${Math.round(report.averageReduction * 100)}%`)

  return report
}

export function handleCondenseStrategies(): string[] {
  return ['ai', 'rule', 'hybrid']
}

// ─── Helpers ───────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
