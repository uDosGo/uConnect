/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/vault — `udo vault` command handlers
   Read, write, list, and watch vault paths.
   ═══════════════════════════════════════════════════════════════════ */

import type { VaultEntry } from '../types.ts'

// ─── In-Memory Vault Store ───────────────────────────────────────
// In production, this would be backed by the actual Vault service.
const vault = new Map<string, VaultEntry>()

// ─── Command Handlers ────────────────────────────────────────────

export function handleVaultGet(path: string) {
  const entry = vault.get(path)
  if (!entry) return { success: false, error: `Path not found: ${path}` }
  return { success: true, entry }
}

export function handleVaultSet(path: string, value: unknown, type: VaultEntry['type'] = 'string') {
  const entry: VaultEntry = {
    path,
    value,
    type,
    updated_at: new Date().toISOString(),
  }
  vault.set(path, entry)
  return { success: true, entry }
}

export function handleVaultList(path: string = '/') {
  const entries: VaultEntry[] = []
  for (const [key, entry] of vault) {
    if (key.startsWith(path)) {
      entries.push(entry)
    }
  }
  return { success: true, entries, count: entries.length }
}

export function handleVaultWatch(path: string) {
  // In production, this would set up a file watcher
  return {
    success: true,
    message: `Watching ${path} for changes...`,
    watch_id: `watch_${Date.now()}`,
  }
}
