/* ═══════════════════════════════════════════════════════════════════
   localhost-library — Static Site Server
   Serves published content on port 8080 with health endpoint
   ═══════════════════════════════════════════════════════════════════ */

import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { homedir } from 'node:os'

// ─── Configuration ────────────────────────────────────────────────

const PORT = parseInt(process.env.UDOS_PUBLISH_PORT || '8080', 10)
const PUBLISH_DIR = process.env.UDOS_PUBLISH_DIR || join(homedir(), '.udos', 'publish')
const HOST = process.env.UDOS_PUBLISH_HOST || '127.0.0.1'

// ─── MIME Types ───────────────────────────────────────────────────

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml',
  '.yaml': 'text/yaml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
}

// ─── Server ────────────────────────────────────────────────────────

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function serveFile(filePath: string, res: ServerResponse): void {
  try {
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('404 Not Found')
      return
    }

    const stat = statSync(filePath)
    if (!stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('404 Not Found')
      return
    }

    const content = readFileSync(filePath)
    const contentType = getContentType(filePath)

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Last-Modified': stat.mtime.toUTCString(),
    })
    res.end(content)
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`500 Internal Server Error: ${err instanceof Error ? err.message : String(err)}`)
  }
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  let pathname = url.pathname

  // ─── Health Endpoint ──────────────────────────────────────────
  if (pathname === '/health' || pathname === '/v1/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(JSON.stringify({
      status: 'ok',
      service: 'localhost-library',
      version: '1.0.0',
      publishDir: PUBLISH_DIR,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }))
    return
  }

  // ─── CORS Preflight ───────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  // ─── API Routes ───────────────────────────────────────────────
  if (pathname === '/v1/list') {
    // List all published files
    try {
      const { readdirSync } = require('node:fs')
      const { relative } = require('node:path')

      const files: Array<{ path: string; size: number; modified: string }> = []
      function collectFiles(dir: string) {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const fullPath = join(dir, entry.name)
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            collectFiles(fullPath)
          } else if (entry.isFile()) {
            const stat = statSync(fullPath)
            files.push({
              path: relative(PUBLISH_DIR, fullPath),
              size: stat.size,
              modified: stat.mtime.toISOString(),
            })
          }
        }
      }
      collectFiles(PUBLISH_DIR)

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify({ files, count: files.length }))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: String(err) }))
    }
    return
  }

  // ─── Static Files ─────────────────────────────────────────────
  // Default to index.html for directory requests
  if (pathname.endsWith('/')) {
    pathname += 'index.html'
  }

  // Security: prevent directory traversal
  const safePath = join(PUBLISH_DIR, pathname)
  if (!safePath.startsWith(PUBLISH_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('403 Forbidden')
    return
  }

  serveFile(safePath, res)
}

// ─── Start Server ─────────────────────────────────────────────────

export function startServer(port: number = PORT, host: string = HOST): void {
  const server = createServer(handleRequest)

  server.listen(port, host, () => {
    console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║           localhost-library — Static Site Server            ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  Server:     http://${host}:${port}                              ║
  ║  Serving:    ${PUBLISH_DIR}  ║
  ║  Health:     http://${host}:${port}/health                       ║
  ║  API:        http://${host}:${port}/v1/list                       ║
  ╚══════════════════════════════════════════════════════════════╝
    `)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`  ❌ Port ${port} is already in use`)
      console.error('  💡 Try: UDOS_PUBLISH_PORT=8081 node server.ts')
    } else {
      console.error(`  ❌ Server error: ${err.message}`)
    }
    process.exit(1)
  })

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n  📦 Shutting down server...')
    server.close(() => {
      console.log('  ✅ Server stopped')
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

// ─── CLI Entry Point ──────────────────────────────────────────────

// Run directly: node tools/localhost-library/server.ts
if (process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'))) {
  startServer()
}
