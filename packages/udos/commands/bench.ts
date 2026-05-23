/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/bench — `udo bench` command handlers
   Performance benchmarking: Python vs Rust implementations
   ═══════════════════════════════════════════════════════════════════ */

import { execSync } from 'node:child_process'

export interface BenchResult {
  name: string
  category: string
  python: { duration_ms: number; memory_kb: number }
  rust: { duration_ms: number; memory_kb: number }
  ratio: number // rust / python (lower = faster relative to python)
  winner: 'python' | 'rust' | 'tie'
}

export interface BenchSuite {
  name: string
  description: string
  results: BenchResult[]
  timestamp: string
}

// ─── Benchmark Categories ──────────────────────────────────────────

export const BENCH_CATEGORIES = {
  PARSING: 'parsing',
  RENDERING: 'rendering',
  GRID_OPS: 'grid_operations',
  FEED: 'feed_processing',
  SERIALIZATION: 'serialization',
  CRYPTO: 'cryptography',
} as const

// ─── Benchmark Definitions ─────────────────────────────────────────

export interface BenchDefinition {
  name: string
  category: string
  description: string
  iterations: number
  pythonCommand: string
  rustCommand: string
}

const DEFAULT_ITERATIONS = 100

export const BENCHMARKS: BenchDefinition[] = [
  {
    name: 'grid_parse_simple',
    category: BENCH_CATEGORIES.PARSING,
    description: 'Parse a simple ASCII grid (10x10)',
    iterations: DEFAULT_ITERATIONS,
    pythonCommand: 'ucode1 grid parse --format simple --input fixtures/grid_10x10.txt',
    rustCommand: 'ucode2 grid parse --format simple --input fixtures/grid_10x10.txt',
  },
  {
    name: 'grid_parse_teletext',
    category: BENCH_CATEGORIES.PARSING,
    description: 'Parse a teletext-format ASCII grid (40x25)',
    iterations: DEFAULT_ITERATIONS,
    pythonCommand: 'ucode1 grid parse --format teletext --input fixtures/grid_40x25.txt',
    rustCommand: 'ucode2 grid parse --format teletext --input fixtures/grid_40x25.txt',
  },
  {
    name: 'grid_render_ansi',
    category: BENCH_CATEGORIES.RENDERING,
    description: 'Render grid to ANSI-colored output',
    iterations: DEFAULT_ITERATIONS,
    pythonCommand: 'ucode1 grid render --format ansi --input fixtures/grid_40x25.txt',
    rustCommand: 'ucode2 grid render --format ansi --input fixtures/grid_40x25.txt',
  },
  {
    name: 'grid_render_svg',
    category: BENCH_CATEGORIES.RENDERING,
    description: 'Render grid to SVG output',
    iterations: 20,
    pythonCommand: 'ucode1 grid render --format svg --input fixtures/grid_40x25.txt',
    rustCommand: 'ucode2 grid render --format svg --input fixtures/grid_40x25.txt',
  },
  {
    name: 'feed_process_1000',
    category: BENCH_CATEGORIES.FEED,
    description: 'Process 1000 feed entries',
    iterations: 10,
    pythonCommand: 'ucode1 feed process --count 1000',
    rustCommand: 'ucode2 feed process --count 1000',
  },
  {
    name: 'serialize_binder',
    category: BENCH_CATEGORIES.SERIALIZATION,
    description: 'Serialize 100 binder entries to JSON',
    iterations: DEFAULT_ITERATIONS,
    pythonCommand: 'ucode1 binder export --format json --count 100',
    rustCommand: 'ucode2 binder export --format json --count 100',
  },
  {
    name: 'grid_transform_50x50',
    category: BENCH_CATEGORIES.GRID_OPS,
    description: 'Transform a 50x50 grid (rotate + flip)',
    iterations: 50,
    pythonCommand: 'ucode1 grid transform --rotate 90 --flip h --input fixtures/grid_50x50.txt',
    rustCommand: 'ucode2 grid transform --rotate 90 --flip h --input fixtures/grid_50x50.txt',
  },
]

// ─── Benchmark Runner ──────────────────────────────────────────────

export interface BenchRunOptions {
  category?: string
  name?: string
  iterations?: number
  json?: boolean
  csv?: boolean
  compare?: boolean
}

function execCommand(command: string): { stdout: string; duration_ms: number } {
  const start = performance.now()
  const stdout = execSync(command, { encoding: 'utf-8', timeout: 30000 })
  const duration_ms = performance.now() - start
  return { stdout, duration_ms }
}

async function runSingleBench(
  definition: BenchDefinition,
  iterations: number,
): Promise<BenchResult> {
  const pythonTimes: number[] = []
  const rustTimes: number[] = []

  // Warmup (3 iterations, not counted)
  for (let i = 0; i < 3; i++) {
    try {
      execCommand(definition.pythonCommand)
      execCommand(definition.rustCommand)
    } catch {
      // warmup may fail, ignore
    }
  }

  // Python benchmarks
  for (let i = 0; i < iterations; i++) {
    try {
      const result = execCommand(definition.pythonCommand)
      pythonTimes.push(result.duration_ms)
    } catch {
      // skip failed runs
      continue
    }
  }

  // Rust benchmarks
  for (let i = 0; i < iterations; i++) {
    try {
      const result = execCommand(definition.rustCommand)
      rustTimes.push(result.duration_ms)
    } catch {
      continue
    }
  }

  const avgPythonTime = pythonTimes.reduce((a, b) => a + b, 0) / pythonTimes.length
  const avgRustTime = rustTimes.reduce((a, b) => a + b, 0) / rustTimes.length

  const ratio = avgPythonTime > 0 ? avgRustTime / avgPythonTime : 1
  const winner = ratio < 0.9 ? 'rust' : ratio > 1.1 ? 'python' : 'tie'

  return {
    name: definition.name,
    category: definition.category,
    python: { duration_ms: Math.round(avgPythonTime * 100) / 100, memory_kb: 0 },
    rust: { duration_ms: Math.round(avgRustTime * 100) / 100, memory_kb: 0 },
    ratio: Math.round(ratio * 100) / 100,
    winner,
  }
}

export async function handleBenchRun(options: BenchRunOptions = {}): Promise<BenchSuite> {
  const iterations = options.iterations || DEFAULT_ITERATIONS

  let benchmarks = BENCHMARKS

  if (options.category) {
    benchmarks = benchmarks.filter((b) => b.category === options.category)
  }

  if (options.name) {
    benchmarks = benchmarks.filter((b) => b.name === options.name)
  }

  const results: BenchResult[] = []

  for (const bench of benchmarks) {
    console.log(`[BENCH] Running: ${bench.name} (${bench.description})`)
    const result = await runSingleBench(bench, iterations)
    results.push(result)

    const icon = result.winner === 'rust' ? '🦀' : result.winner === 'python' ? '🐍' : '⚖️'
    console.log(
      `  ${icon} Python: ${result.python.duration_ms}ms | Rust: ${result.rust.duration_ms}ms | Ratio: ${result.ratio}x | Winner: ${result.winner}`,
    )
  }

  const suite: BenchSuite = {
    name: options.category || 'full',
    description: `Benchmark suite: ${benchmarks.length} tests × ${iterations} iterations`,
    results,
    timestamp: new Date().toISOString(),
  }

  if (options.json) {
    console.log(JSON.stringify(suite, null, 2))
  }

  if (options.csv) {
    console.log('name,category,python_ms,rust_ms,ratio,winner')
    for (const r of results) {
      console.log(`${r.name},${r.category},${r.python.duration_ms},${r.rust.duration_ms},${r.ratio},${r.winner}`)
    }
  }

  return suite
}

export function handleBenchList(): BenchDefinition[] {
  return BENCHMARKS
}

export function handleBenchCategories(): string[] {
  return Object.values(BENCH_CATEGORIES)
}
