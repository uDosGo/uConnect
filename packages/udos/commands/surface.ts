/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/surface — `udo surface` command handlers
   List, open, close, and focus surfaces.
   ═══════════════════════════════════════════════════════════════════ */

import type { Surface, SurfaceId } from '../types.ts'

// ─── Surface Registry ────────────────────────────────────────────
const surfaces = new Map<SurfaceId, Surface>()

// ─── Built-in Surfaces ───────────────────────────────────────────

export function registerBuiltinSurfaces(): void {
  const defaults: Surface[] = [
    { id: 'ucode1', name: 'uCode1 Terminal', type: 'terminal', status: 'running' },
    { id: 'ucode2', name: 'uCode2 Web', type: 'web', status: 'running' },
    { id: 'ucode3', name: 'uCode3 Web', type: 'web', status: 'running' },
    { id: 'ucode4', name: 'uCode4 Web', type: 'web', status: 'stopped' },
    { id: 'usxd', name: 'USXD Desktop', type: 'desktop', status: 'stopped' },
    { id: 'proseui', name: 'ProseUI Editor', type: 'web', status: 'running' },
    { id: 'gridui', name: 'GridUI', type: 'web', status: 'running' },
    { id: 'code4wf', name: 'Code4 Wireframe', type: 'web', status: 'stopped' },
  ]

  for (const surface of defaults) {
    surfaces.set(surface.id, surface)
  }
}

// ─── Command Handlers ────────────────────────────────────────────

export function handleSurfaceList() {
  const all = Array.from(surfaces.values())
  return { success: true, surfaces: all, count: all.length }
}

export function handleSurfaceOpen(id: SurfaceId) {
  const surface = surfaces.get(id)
  if (!surface) return { success: false, error: `Surface not found: ${id}` }
  surface.status = 'running'
  return { success: true, surface, url: getSurfaceUrl(id) }
}

export function handleSurfaceClose(id: SurfaceId) {
  const surface = surfaces.get(id)
  if (!surface) return { success: false, error: `Surface not found: ${id}` }
  surface.status = 'stopped'
  return { success: true, surface }
}

export function handleSurfaceFocus(id: SurfaceId) {
  const surface = surfaces.get(id)
  if (!surface) return { success: false, error: `Surface not found: ${id}` }
  surface.status = 'running'
  return { success: true, surface, message: `Focused on ${surface.name}` }
}

// ─── Helpers ─────────────────────────────────────────────────────

function getSurfaceUrl(id: SurfaceId): string | undefined {
  const urls: Record<SurfaceId, string> = {
    ucode1: 'http://localhost:3001',
    ucode2: 'http://localhost:5173',
    ucode3: 'http://localhost:5174',
    ucode4: 'http://localhost:5175',
    usxd: 'udos://desktop',
    proseui: 'http://localhost:5176',
    gridui: 'http://localhost:5177',
    code4wf: 'http://localhost:5178',
  }
  return urls[id]
}
