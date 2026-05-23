/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/devmode — `udo devmode` command handlers
   Development mode with hot reload for rapid iteration
   ═══════════════════════════════════════════════════════════════════ */

import { watch, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve, relative, extname, dirname, basename } from 'node:path'
import { spawn, ChildProcess, execSync } from 'node:child_process'
import { createServer, IncomingMessage, ServerResponse } from 'node:http'

// ─── Types ─────────────────────────────────────────────────────────

export interface DevModeOptions {
  dir?: string
  port?: number
  watch?: boolean
  build?: boolean
  serve?: boolean
  command?: string
  extensions?: string[]
  debounceMs?: number
  verbose?: boolean
}

export interface DevModeStatus {
  mode: 'active' | 'stopped' | 'error'
  watchDir: string
  port: number
  watching: boolean
  serving: boolean
  building: boolean
  lastBuild: string | null
  errors: string[]
  watchedFiles: number
}

export interface BuildResult {
  success: boolean
  duration_ms: number
  output: string
  errors: string[]
}

// ─── File Watcher ──────────────────────────────────────────────────

interface WatchEvent {
  type: 'change' | 'add' | 'unlink'
  path: string
  timestamp: number
}

type ChangeHandler = (events: WatchEvent[]) => void

class FileWatcher {
  private watchers: Map<string, ReturnType<typeof watch>> = new Map()
  private pendingEvents: WatchEvent[] = []
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private handler: ChangeHandler
  private debounceMs: number
  private watchedFiles: Set<string> = new Set()
  private verbose: boolean

  constructor(dir: string, extensions: string[], handler: ChangeHandler, debounceMs = 300, verbose = false) {
    this.handler = handler
    this.debounceMs = debounceMs
    this.verbose = verbose
    this.watchDirectory(dir, extensions)
  }

  private watchDirectory(dir: string, extensions: string[]): void {
    if (!existsSync(dir)) {
      console.warn(`[DEVMODE] Watch directory does not exist: ${dir}`)
      return
    }

    try {
      const w = watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return

        const ext = extname(filename).toLowerCase()
        if (extensions.length > 0 && !extensions.includes(ext)) return

        const fullPath = join(dir, filename.toString())
        this.watchedFiles.add(fullPath)

        this.pendingEvents.push({
          type: eventType as WatchEvent['type'],
          path: fullPath,
          timestamp: Date.now(),
        })

        this.scheduleFlush()
      })

      this.watchers.set(dir, w)

      if (this.verbose) {
        console.log(`[DEVMODE] Watching: ${dir} (${extensions.join(', ') || 'all files'})`)
      }
    } catch (error) {
      console.error(`[DEVMODE] Failed to watch directory ${dir}:`, error)
    }
  }

  private scheduleFlush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      const events = [...this.pendingEvents]
      this.pendingEvents = []

      if (events.length > 0) {
        if (this.verbose) {
          console.log(`[DEVMODE] ${events.length} change(s) detected`)
        }
        this.handler(events)
      }
    }, this.debounceMs)
  }

  getWatchedFileCount(): number {
    return this.watchedFiles.size
  }

  stop(): void {
    for (const [dir, w] of this.watchers) {
      w.close()
      if (this.verbose) {
        console.log(`[DEVMODE] Stopped watching: ${dir}`)
      }
    }
    this.watchers.clear()
  }
}

// ─── Build Runner ──────────────────────────────────────────────────

class BuildRunner {
  private buildProcess: ChildProcess | null = null
  private verbose: boolean

  constructor(verbose = false) {
    this.verbose = verbose
  }

  async runBuild(command: string): Promise<BuildResult> {
    const start = performance.now()

    // Kill any previous build
    this.killBuild()

    return new Promise((resolve) => {
      const parts = command.split(/\s+/)
      const cmd = parts[0]
      const args = parts.slice(1)

      this.buildProcess = spawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      })

      let output = ''
      const errors: string[] = []

      this.buildProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString()
      })

      this.buildProcess.stderr?.on('data', (data: Buffer) => {
        const msg = data.toString()
        output += msg
        if (msg.toLowerCase().includes('error')) {
          errors.push(msg)
        }
      })

      this.buildProcess.on('close', (code) => {
        const duration_ms = Math.round(performance.now() - start)
        this.buildProcess = null

        if (this.verbose) {
          console.log(`[DEVMODE] Build ${code === 0 ? 'succeeded' : 'failed'} (${duration_ms}ms)`)
        }

        resolve({
          success: code === 0,
          duration_ms,
          output,
          errors,
        })
      })

      this.buildProcess.on('error', (error) => {
        const duration_ms = Math.round(performance.now() - start)
        this.buildProcess = null
        resolve({
          success: false,
          duration_ms,
          output: '',
          errors: [error.message],
        })
      })
    })
  }

  killBuild(): void {
    if (this.buildProcess) {
      this.buildProcess.kill('SIGTERM')
      this.buildProcess = null
    }
  }
}

// ─── Dev Server ────────────────────────────────────────────────────

class DevServer {
  private server: ReturnType<typeof createServer> | null = null
  private port: number
  private buildRunner: BuildRunner
  private buildCommand: string
  private lastBuildResult: BuildResult | null = null
  private verbose: boolean

  constructor(port: number, buildCommand: string, verbose = false) {
    this.port = port
    this.buildCommand = buildCommand
    this.buildRunner = new BuildRunner(verbose)
    this.verbose = verbose
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
        if (req.url === '/health' || req.url === '/api/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            status: 'ok',
            mode: 'development',
            lastBuild: this.lastBuildResult?.success ?? null,
            port: this.port,
          }))
          return
        }

        if (req.url === '/api/build-status') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(this.lastBuildResult || { success: true, message: 'no builds yet' }))
          return
        }

        // Static file serving from dist/
        const filePath = req.url === '/' ? '/index.html' : req.url || '/index.html'
        const fullPath = join(process.cwd(), 'dist', filePath)

        try {
          const content = readFileSync(fullPath)
          const ext = extname(filePath).toLowerCase()
          const mimeTypes: Record<string, string> = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
          }
          res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
          res.end(content)
        } catch {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not found')
        }
      })

      this.server.listen(this.port, () => {
        if (this.verbose) {
          console.log(`[DEVMODE] Dev server running on http://localhost:${this.port}`)
        }
        resolve()
      })
    })
  }

  async triggerBuild(): Promise<BuildResult> {
    this.lastBuildResult = await this.buildRunner.runBuild(this.buildCommand)
    return this.lastBuildResult
  }

  stop(): void {
    if (this.server) {
      this.server.close()
      this.server = null
    }
    this.buildRunner.killBuild()
  }
}

// ─── Main DevMode Engine ───────────────────────────────────────────

export class DevModeEngine {
  private watcher: FileWatcher | null = null
  private server: DevServer | null = null
  private buildRunner: BuildRunner
  private options: Required<DevModeOptions>
  private status: DevModeStatus
  private buildCount = 0

  constructor(options: DevModeOptions = {}) {
    this.options = {
      dir: options.dir || process.cwd(),
      port: options.port || 3000,
      watch: options.watch ?? true,
      build: options.build ?? true,
      serve: options.serve ?? true,
      command: options.command || 'npm run build',
      extensions: options.extensions || ['.ts', '.tsx', '.js', '.jsx', '.css', '.vue', '.json'],
      debounceMs: options.debounceMs || 300,
      verbose: options.verbose ?? true,
    }

    this.buildRunner = new BuildRunner(this.options.verbose)

    this.status = {
      mode: 'stopped',
      watchDir: resolve(this.options.dir),
      port: this.options.port,
      watching: false,
      serving: false,
      building: false,
      lastBuild: null,
      errors: [],
      watchedFiles: 0,
    }
  }

  async start(): Promise<DevModeStatus> {
    console.log(`\n🚀 DevMode — Hot Reload Development Server`)
    console.log(`   Directory: ${this.options.dir}`)
    console.log(`   Port:      ${this.options.port}`)
    console.log(`   Watch:     ${this.options.watch ? 'ON' : 'OFF'}`)
    console.log(`   Build:     ${this.options.build ? 'ON' : 'OFF'}`)
    console.log(`   Serve:     ${this.options.serve ? 'ON' : 'OFF'}`)
    console.log(`   Command:   ${this.options.command}`)
    console.log()

    // Start dev server
    if (this.options.serve) {
      this.server = new DevServer(this.options.port, this.options.command, this.options.verbose)
      await this.server.start()
      this.status.serving = true
    }

    // Initial build
    if (this.options.build) {
      this.status.building = true
      console.log('[DEVMODE] Running initial build...')
      const result = await this.buildRunner.runBuild(this.options.command)
      this.status.lastBuild = result.success ? `Build #${++this.buildCount} succeeded` : `Build #${++this.buildCount} failed`
      this.status.building = false

      if (result.success) {
        console.log(`[DEVMODE] ✅ Initial build succeeded (${result.duration_ms}ms)`)
      } else {
        console.error(`[DEVMODE] ❌ Initial build failed (${result.duration_ms}ms)`)
        this.status.errors.push(`Initial build failed: ${result.errors.join('; ')}`)
      }
    }

    // Start file watcher
    if (this.options.watch) {
      this.watcher = new FileWatcher(
        this.options.dir,
        this.options.extensions,
        async (events) => {
          if (!this.options.build) return

          this.status.building = true
          console.log(`\n[DEVMODE] 🔄 Change detected — rebuilding...`)

          const result = await this.buildRunner.runBuild(this.options.command)
          this.status.lastBuild = result.success
            ? `Build #${++this.buildCount} succeeded`
            : `Build #${++this.buildCount} failed`
          this.status.building = false

          if (result.success) {
            console.log(`[DEVMODE] ✅ Rebuild #${this.buildCount} succeeded (${result.duration_ms}ms)`)
          } else {
            console.error(`[DEVMODE] ❌ Rebuild #${this.buildCount} failed (${result.duration_ms}ms)`)
            for (const err of result.errors.slice(0, 3)) {
              console.error(`   ${err.trim()}`)
            }
          }
        },
        this.options.debounceMs,
        this.options.verbose,
      )
      this.status.watching = true
      this.status.watchedFiles = this.watcher.getWatchedFileCount()
    }

    this.status.mode = 'active'

    console.log(`\n✅ DevMode active — http://localhost:${this.options.port}`)
    console.log(`   Watching ${this.options.dir} for changes...`)
    console.log(`   Press Ctrl+C to stop\n`)

    return this.status
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.stop()
      this.watcher = null
    }

    if (this.server) {
      this.server.stop()
      this.server = null
    }

    this.buildRunner.killBuild()
    this.status.mode = 'stopped'
    this.status.watching = false
    this.status.serving = false

    console.log('\n[DEVMODE] DevMode stopped')
  }

  getStatus(): DevModeStatus {
    return { ...this.status }
  }
}

// ─── CLI Handlers ──────────────────────────────────────────────────

let activeEngine: DevModeEngine | null = null

export async function handleDevModeStart(options: DevModeOptions = {}): Promise<DevModeStatus> {
  if (activeEngine) {
    console.log('[DEVMODE] Stopping previous DevMode instance...')
    activeEngine.stop()
  }

  activeEngine = new DevModeEngine(options)
  const status = await activeEngine.start()

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[DEVMODE] Shutting down...')
    activeEngine?.stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\n[DEVMODE] Shutting down...')
    activeEngine?.stop()
    process.exit(0)
  })

  return status
}

export function handleDevModeStop(): DevModeStatus | null {
  if (activeEngine) {
    activeEngine.stop()
    activeEngine = null
    return null
  }
  console.log('[DEVMODE] No active DevMode instance')
  return null
}

export function handleDevModeStatus(): DevModeStatus | null {
  if (activeEngine) {
    return activeEngine.getStatus()
  }
  console.log('[DEVMODE] No active DevMode instance')
  return null
}

export function handleDevModeBuild(options: { command?: string } = {}): Promise<BuildResult> {
  const runner = new BuildRunner(true)
  return runner.runBuild(options.command || 'npm run build')
}
