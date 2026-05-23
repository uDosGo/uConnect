/* ═══════════════════════════════════════════════════════════════════
   @udos/core/commands/vault — `udo vault` command handlers
   Layered vault architecture v3.0: user, shared, global layers
   with union filesystem semantics, orb management, and publishing.
   ═══════════════════════════════════════════════════════════════════ */

import type {
  VaultEntry,
  VaultLayer,
  VaultLayerConfig,
  VaultUnionConfig,
  Orb,
  GlobalCategory,
  PublishRequest,
} from '../types.ts'

// ─── Default Vault Configuration (v3.0) ──────────────────────────
const HOME = process.env.HOME || '~'

export const DEFAULT_VAULT_CONFIG: VaultUnionConfig = {
  virtualPath: `${HOME}/Vault`,
  layers: [
    {
      name: 'vault-user',
      repo: 'github.com/fredporter/vault-user',
      path: `${HOME}/Code/vault-user`,
      layer: 'user',
      priority: 100,
      mergeStrategy: 'overlay',
      sync: 'mirror',
      readOnly: false,
    },
    {
      name: 'vault-shared',
      repo: 'github.com/fredporter/vault-shared',
      path: `${HOME}/Code/vault-shared`,
      layer: 'shared',
      priority: 50,
      mergeStrategy: 'merge',
      sync: 'conditional',
      readOnly: false,
    },
    {
      name: 'vault-global',
      repo: 'github.com/uDosGo/vault-global',
      path: `${HOME}/Code/vault-global`,
      layer: 'global',
      priority: 0,
      mergeStrategy: 'reference',
      sync: 'pull-only',
      readOnly: true,
    },
  ],
  behavior: {
    read: 'union',
    write: 'copy-up',
    delete: 'whiteout',
  },
  conflictStrategy: 'highest-priority-wins',
  whiteoutSuffix: '.udos_whiteout',
}

// ─── Global Knowledge Categories ─────────────────────────────────
export const GLOBAL_CATEGORIES: GlobalCategory[] = [
  // Technology & Computing
  { id: 'cs',         name: 'Computer Science',       icon: '💻', subcategories: ['algorithms', 'data-structures', 'programming-languages', 'software-architecture', 'distributed-systems'] },
  { id: 'ai',         name: 'Artificial Intelligence', icon: '🧠', subcategories: ['machine-learning', 'deep-learning', 'llm', 'computer-vision', 'nlp', 'ai-agents'] },
  { id: 'dev',        name: 'Development',            icon: '🛠️', subcategories: ['web-dev', 'mobile-dev', 'devops', 'testing', 'security'] },
  { id: 'data',       name: 'Data Science',           icon: '📊', subcategories: ['analytics', 'visualization', 'databases', 'data-engineering'] },
  // Science & Nature
  { id: 'physics',    name: 'Physics',                icon: '⚛️', subcategories: ['quantum', 'classical', 'astrophysics', 'thermodynamics'] },
  { id: 'biology',    name: 'Biology',                icon: '🧬', subcategories: ['molecular', 'neuroscience', 'ecology', 'genetics'] },
  { id: 'math',       name: 'Mathematics',            icon: '📐', subcategories: ['calculus', 'linear-algebra', 'statistics', 'logic'] },
  // Human & Society
  { id: 'philosophy', name: 'Philosophy',             icon: '💭', subcategories: ['epistemology', 'ethics', 'metaphysics', 'mind'] },
  { id: 'psychology', name: 'Psychology',             icon: '🧠', subcategories: ['cognitive', 'behavioral', 'social', 'clinical'] },
  { id: 'economics',  name: 'Economics',              icon: '📈', subcategories: ['macro', 'micro', 'finance', 'crypto'] },
  { id: 'history',    name: 'History',                icon: '📜', subcategories: ['ancient', 'modern', 'technology-history', 'scientific-revolution'] },
  // Creative & Practical
  { id: 'design',     name: 'Design',                 icon: '🎨', subcategories: ['ui-ux', 'graphic', 'interaction', 'design-systems'] },
  { id: 'product',    name: 'Product',                icon: '🚀', subcategories: ['product-management', 'user-research', 'metrics', 'growth'] },
  { id: 'business',   name: 'Business',               icon: '🏢', subcategories: ['strategy', 'marketing', 'operations', 'entrepreneurship'] },
]

// ─── In-Memory Vault Store ───────────────────────────────────────
// In production, this would be backed by the actual layered filesystem.
const vaultStore = new Map<string, VaultEntry>()
const orbStore = new Map<string, Orb>()

// ─── Layer Resolution ────────────────────────────────────────────

/** Get layers sorted by priority (highest first = user wins) */
function getLayersSorted(): VaultLayerConfig[] {
  return [...DEFAULT_VAULT_CONFIG.layers].sort((a, b) => b.priority - a.priority)
}

/** Find which layer a path belongs to */
function resolveLayer(path: string): VaultLayerConfig | undefined {
  const sorted = getLayersSorted()
  for (const layer of sorted) {
    if (path.startsWith(layer.path) || path.startsWith(`/${layer.layer}/`)) {
      return layer
    }
  }
  return sorted[sorted.length - 1] // default to lowest priority
}

/** Resolve a canonical orb URI to its layer and path */
function resolveOrbURI(uri: string): { layer: VaultLayer; category?: string; subcategory?: string; name?: string } | null {
  // Format: udos://category/subcategory/orb-name
  //         user://workspaces/default/current
  //         shared://@sigs/ai-research/best-practices
  const match = uri.match(/^(udos|user|shared|global):\/\/(.+)$/)
  if (!match) return null

  const layer = match[1] === 'udos' ? 'global' : match[1] as VaultLayer
  const parts = match[2].split('/')
  
  if (parts.length >= 3) {
    return { layer, category: parts[0], subcategory: parts[1], name: parts.slice(2).join('/') }
  }
  return { layer }
}

// ─── Command Handlers ────────────────────────────────────────────

// ── Layer Operations ─────────────────────────────────────────────

export function handleVaultLayers() {
  return {
    success: true,
    config: DEFAULT_VAULT_CONFIG,
    layers: DEFAULT_VAULT_CONFIG.layers.map(l => ({
      name: l.name,
      layer: l.layer,
      priority: l.priority,
      path: l.path,
      repo: l.repo,
      sync: l.sync,
      readOnly: l.readOnly,
      mergeStrategy: l.mergeStrategy,
    })),
  }
}

export function handleVaultStatus() {
  const layers = getLayersSorted()
  const statuses = layers.map(l => {
    // In production, check actual filesystem/git status
    const exists = false // fs.existsSync(l.path)
    return {
      name: l.name,
      layer: l.layer,
      path: l.path,
      exists,
      synced: false,
      entryCount: 0,
    }
  })

  return {
    success: true,
    virtualPath: DEFAULT_VAULT_CONFIG.virtualPath,
    layers: statuses,
    totalEntries: vaultStore.size,
    totalOrbs: orbStore.size,
  }
}

// ── Entry Operations (Union Filesystem) ──────────────────────────

export function handleVaultGet(path: string, layer?: VaultLayer) {
  if (layer) {
    // Get from specific layer
    const key = `${layer}:${path}`
    const entry = vaultStore.get(key)
    if (!entry) return { success: false, error: `Path not found in ${layer}: ${path}` }
    return { success: true, entry, sourceLayer: layer }
  }

  // Union read: check layers from highest to lowest priority
  const sorted = getLayersSorted()
  for (const l of sorted) {
    const key = `${l.layer}:${path}`
    const entry = vaultStore.get(key)
    if (entry) {
      // Check for whiteout
      const whiteoutKey = `${l.layer}:${path}${DEFAULT_VAULT_CONFIG.whiteoutSuffix}`
      if (vaultStore.has(whiteoutKey)) {
        continue // This entry is whiteout-deleted
      }
      return { success: true, entry, sourceLayer: l.layer }
    }
  }

  return { success: false, error: `Path not found in any layer: ${path}` }
}

export function handleVaultSet(path: string, value: unknown, type: VaultEntry['type'] = 'string', layer?: VaultLayer) {
  // Default to user layer for writes (copy-up semantics)
  const targetLayer = layer || 'user'
  const layerConfig = DEFAULT_VAULT_CONFIG.layers.find(l => l.layer === targetLayer)
  
  if (layerConfig?.readOnly) {
    return { success: false, error: `Layer '${targetLayer}' is read-only. Writes go to 'user' layer.` }
  }

  const key = `${targetLayer}:${path}`
  const entry: VaultEntry = {
    path,
    value,
    type,
    updated_at: new Date().toISOString(),
    sourceLayer: targetLayer,
    originRepo: layerConfig?.repo,
  }
  vaultStore.set(key, entry)
  return { success: true, entry, layer: targetLayer }
}

export function handleVaultList(path: string = '/', layer?: VaultLayer) {
  const entries: VaultEntry[] = []
  const sorted = layer
    ? DEFAULT_VAULT_CONFIG.layers.filter(l => l.layer === layer)
    : getLayersSorted()

  const seen = new Set<string>()

  for (const l of sorted) {
    for (const [key, entry] of vaultStore) {
      if (!key.startsWith(`${l.layer}:`)) continue
      if (!entry.path.startsWith(path)) continue

      // Union dedup: higher priority wins
      if (seen.has(entry.path)) continue

      // Check whiteout
      const whiteoutKey = `${l.layer}:${entry.path}${DEFAULT_VAULT_CONFIG.whiteoutSuffix}`
      if (vaultStore.has(whiteoutKey)) {
        seen.add(entry.path) // Mark as deleted
        continue
      }

      seen.add(entry.path)
      entries.push(entry)
    }
  }

  return { success: true, entries, count: entries.length, layer: layer || 'union' }
}

export function handleVaultDelete(path: string) {
  // Whiteout: mark as deleted in user layer
  const userKey = `user:${path}`
  const whiteoutKey = `user:${path}${DEFAULT_VAULT_CONFIG.whiteoutSuffix}`
  
  // Remove from user layer if it exists there
  vaultStore.delete(userKey)
  
  // Add whiteout marker
  vaultStore.set(whiteoutKey, {
    path: `${path}${DEFAULT_VAULT_CONFIG.whiteoutSuffix}`,
    value: true,
    type: 'boolean',
    updated_at: new Date().toISOString(),
    sourceLayer: 'user',
  })

  return { success: true, message: `Deleted ${path} (whiteout in user layer)` }
}

export function handleVaultWatch(path: string, layer?: VaultLayer) {
  const targetLayer = layer || 'user'
  return {
    success: true,
    message: `Watching ${targetLayer}:${path} for changes...`,
    watch_id: `watch_${Date.now()}`,
    layer: targetLayer,
  }
}

// ── Orb Operations ───────────────────────────────────────────────

export function handleOrbList(category?: string, layer?: VaultLayer) {
  let orbs = Array.from(orbStore.values())
  
  if (category) {
    orbs = orbs.filter(o => o.category === category)
  }
  if (layer) {
    orbs = orbs.filter(o => o.sourceLayer === layer)
  }

  return { success: true, orbs, count: orbs.length }
}

export function handleOrbGet(canonical: string) {
  const orb = orbStore.get(canonical)
  if (!orb) {
    // Try to resolve via URI
    const resolved = resolveOrbURI(canonical)
    if (resolved) {
      const found = Array.from(orbStore.values()).find(
        o => o.category === resolved.category && o.name === resolved.name
      )
      if (found) return { success: true, orb: found }
    }
    return { success: false, error: `Orb not found: ${canonical}` }
  }
  return { success: true, orb }
}

export function handleOrbCreate(orb: Omit<Orb, 'sourceLayer' | 'synced'>) {
  const newOrb: Orb = {
    ...orb,
    sourceLayer: 'user',
    synced: new Date().toISOString(),
  }
  orbStore.set(orb.canonical, newOrb)
  return { success: true, orb: newOrb, layer: 'user' }
}

export function handleOrbUpdate(canonical: string, updates: Partial<Orb>) {
  const existing = orbStore.get(canonical)
  if (!existing) return { success: false, error: `Orb not found: ${canonical}` }
  
  const updated = { ...existing, ...updates, synced: new Date().toISOString() }
  orbStore.set(canonical, updated)
  return { success: true, orb: updated }
}

export function handleOrbLink(canonical: string, relation: 'parent' | 'child' | 'related', targetCanonical: string) {
  const orb = orbStore.get(canonical)
  if (!orb) return { success: false, error: `Orb not found: ${canonical}` }

  switch (relation) {
    case 'parent':
      if (!orb.parents.includes(targetCanonical)) orb.parents.push(targetCanonical)
      break
    case 'child':
      if (!orb.children.includes(targetCanonical)) orb.children.push(targetCanonical)
      break
    case 'related':
      if (!orb.related.includes(targetCanonical)) orb.related.push(targetCanonical)
      break
  }

  orb.synced = new Date().toISOString()
  orbStore.set(canonical, orb)
  return { success: true, orb }
}

export function handleOrbQuery(query: string, layer?: VaultLayer) {
  const q = query.toLowerCase()
  let results = Array.from(orbStore.values()).filter(orb =>
    orb.name.toLowerCase().includes(q) ||
    orb.description.toLowerCase().includes(q) ||
    orb.keywords.some(k => k.toLowerCase().includes(q))
  )

  if (layer) {
    results = results.filter(o => o.sourceLayer === layer)
  }

  return { success: true, results, count: results.length, query }
}

// ── Knowledge Graph Operations ───────────────────────────────────

export function handleKnowledgeGraph(orbId: string, depth: number = 1) {
  const orb = orbStore.get(orbId)
  if (!orb) return { success: false, error: `Orb not found: ${orbId}` }

  const graph: Record<string, { orb: Orb; depth: number }> = { [orbId]: { orb, depth: 0 } }
  const queue = [{ id: orbId, currentDepth: 0 }]

  while (queue.length > 0) {
    const { id, currentDepth } = queue.shift()!
    if (currentDepth >= depth) continue

    const current = orbStore.get(id)
    if (!current) continue

    const linkedIds = [...current.parents, ...current.children, ...current.related]
    for (const linkedId of linkedIds) {
      if (!graph[linkedId]) {
        const linked = orbStore.get(linkedId)
        if (linked) {
          graph[linkedId] = { orb: linked, depth: currentDepth + 1 }
          queue.push({ id: linkedId, currentDepth: currentDepth + 1 })
        }
      }
    }
  }

  return {
    success: true,
    root: orbId,
    nodes: Object.values(graph).map(g => ({
      id: g.orb.canonical,
      name: g.orb.name,
      depth: g.depth,
      category: g.orb.category,
    })),
    totalNodes: Object.keys(graph).length,
  }
}

export function handleKnowledgeSimilar(orbId: string) {
  const orb = orbStore.get(orbId)
  if (!orb) return { success: false, error: `Orb not found: ${orbId}` }

  // Simple keyword-based similarity
  const orbKeywords = new Set(orb.keywords.map(k => k.toLowerCase()))
  const similarities: Array<{ orb: Orb; score: number }> = []

  for (const [id, candidate] of orbStore) {
    if (id === orbId) continue
    const candidateKeywords = new Set(candidate.keywords.map(k => k.toLowerCase()))
    const intersection = new Set([...orbKeywords].filter(k => candidateKeywords.has(k)))
    const union = new Set([...orbKeywords, ...candidateKeywords])
    const score = union.size > 0 ? intersection.size / union.size : 0
    if (score > 0) {
      similarities.push({ orb: candidate, score })
    }
  }

  similarities.sort((a, b) => b.score - a.score)
  return { success: true, source: orbId, similar: similarities.slice(0, 10) }
}

export function handleKnowledgeContext(orbId: string) {
  const orb = orbStore.get(orbId)
  if (!orb) return { success: false, error: `Orb not found: ${orbId}` }

  return {
    success: true,
    operation: 'knowledge/context',
    orb_id: orbId,
    response: {
      content: {
        summary: orb.description,
        key_concepts: orb.keywords,
      },
      graph: {
        parents: orb.parents,
        children: orb.children,
        related: orb.related,
      },
    },
  }
}

// ── Category Operations ──────────────────────────────────────────

export function handleCategoriesList() {
  return {
    success: true,
    categories: GLOBAL_CATEGORIES,
    count: GLOBAL_CATEGORIES.length,
  }
}

export function handleCategoryGet(id: string) {
  const cat = GLOBAL_CATEGORIES.find(c => c.id === id)
  if (!cat) return { success: false, error: `Category not found: ${id}` }
  
  const orbs = Array.from(orbStore.values()).filter(o => o.category === id)
  return { success: true, category: cat, orbs, orbCount: orbs.length }
}

// ── Publishing Operations ────────────────────────────────────────

export function handlePublishToShared(sourcePath: string, targetPath?: string) {
  const entry = vaultStore.get(`user:${sourcePath}`)
  if (!entry) return { success: false, error: `Source not found in user layer: ${sourcePath}` }

  const destPath = targetPath || sourcePath
  const sharedKey = `shared:${destPath}`
  vaultStore.set(sharedKey, {
    ...entry,
    path: destPath,
    sourceLayer: 'shared',
    updated_at: new Date().toISOString(),
  })

  return { success: true, message: `Published to shared: ${sourcePath} → ${destPath}` }
}

export function handlePublishToPublic(sourcePath: string) {
  const entry = vaultStore.get(`user:${sourcePath}`)
  if (!entry) return { success: false, error: `Source not found in user layer: ${sourcePath}` }

  const publicPath = `/@public/${sourcePath.replace(/^\//, '')}`
  const sharedKey = `shared:${publicPath}`
  vaultStore.set(sharedKey, {
    ...entry,
    path: publicPath,
    sourceLayer: 'shared',
    updated_at: new Date().toISOString(),
  })

  return { success: true, message: `Published to public: ${sourcePath} → ${publicPath}` }
}

export function handlePublishRequestGlobal(sourcePath: string, description: string) {
  const entry = vaultStore.get(`user:${sourcePath}`)
  if (!entry) return { success: false, error: `Source not found in user layer: ${sourcePath}` }

  const request: PublishRequest = {
    sourcePath,
    sourceLayer: 'user',
    targetLayer: 'global',
    targetPath: `/categories/pending/${sourcePath.replace(/^\//, '')}`,
    visibility: 'global',
  }

  return {
    success: true,
    message: `Global contribution submitted for review: ${sourcePath}`,
    request,
    description,
    status: 'pending_approval',
  }
}

// ── GitHub Sync Operations ───────────────────────────────────────

export function handleVaultSync(layer?: VaultLayer) {
  const targets = layer
    ? DEFAULT_VAULT_CONFIG.layers.filter(l => l.layer === layer)
    : DEFAULT_VAULT_CONFIG.layers

  const results = targets.map(l => ({
    name: l.name,
    layer: l.layer,
    repo: l.repo,
    sync: l.sync,
    status: 'synced' as const,
    timestamp: new Date().toISOString(),
  }))

  return { success: true, synced: results }
}

export function handleVaultPull(layer?: VaultLayer) {
  const targets = layer
    ? DEFAULT_VAULT_CONFIG.layers.filter(l => l.layer === layer)
    : DEFAULT_VAULT_CONFIG.layers.filter(l => l.sync !== 'mirror')

  const results = targets.map(l => ({
    name: l.name,
    layer: l.layer,
    status: 'pulled' as const,
    timestamp: new Date().toISOString(),
  }))

  return { success: true, pulled: results }
}
