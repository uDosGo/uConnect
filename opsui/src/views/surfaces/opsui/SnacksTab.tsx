/* ═══════════════════════════════════════════════════════════════════
   opsui Snacks Tab — Package Manager & Containerisation Surface
   
   Provides a scripting package manager for snack development and a
   container runtime view for managing Docker containers. Supports
   browsing snack catalog, installing from registry, building containers,
   and viewing running/stopped containers with logs.
   ═══════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react'
import { useOpsUIStore } from './stores/opsUIStore'

// ─── Container Row ───────────────────────────────────────────────
function ContainerRow({ id }: { id: string }) {
  const store = useOpsUIStore()
  const ctr = store.containers.find(c => c.id === id)
  if (!ctr) return null

  return (
    <div className={`ops-container-row ${ctr.status}`}>
      <div className="ops-container-info">
        <div className="ops-container-name">{ctr.name}</div>
        <div className="ops-container-image">{ctr.image}</div>
      </div>
      <div className="ops-container-meta">
        <span className={`ops-container-status ${ctr.status}`}>
          {ctr.status === 'running' ? '● Running' : ctr.status === 'stopped' ? '■ Stopped' : '✗ Error'}
        </span>
        {ctr.port && (
          <span className="ops-container-port">:{ctr.port}</span>
        )}
        {ctr.started_at && (
          <span className="ops-container-started">
            {new Date(ctr.started_at).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="ops-container-actions">
        {ctr.status === 'running' && (
          <button
            className="ops-spice-btn"
            onClick={() => store.stopContainer(ctr.id)}
            title="Stop container"
          >
            <span className="material-symbols-outlined">stop</span>
          </button>
        )}
        <button
          className="ops-spice-btn"
          onClick={() => store.viewContainerLogs(ctr.id)}
          title="View logs"
        >
          <span className="material-symbols-outlined">terminal</span>
        </button>
      </div>
    </div>
  )
}

// ─── Spawn Container Form ────────────────────────────────────────
function SpawnContainerForm({ onClose }: { onClose: () => void }) {
  const store = useOpsUIStore()
  const [name, setName] = useState('')
  const [image, setImage] = useState('')

  const presets = [
    { name: 'github-mcp', image: 'ghcr.io/github/github-mcp-server:latest' },
    { name: 'deepseek-mcp', image: 'ghcr.io/universui/mcp-deepseek:latest' },
    { name: 'feed-watcher', image: 'ghcr.io/universui/feed-watcher:latest' },
  ]

  return (
    <div className="ops-modal-overlay" onClick={onClose}>
      <div className="ops-modal ops-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="ops-modal-header">
          <h3>Spawn Container</h3>
          <button className="ops-action-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="ops-modal-body">
          <div className="ops-form-group">
            <label className="ops-form-label">Container Name</label>
            <input
              className="ops-form-input"
              type="text"
              placeholder="my-container"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="ops-form-group">
            <label className="ops-form-label">Image</label>
            <input
              className="ops-form-input"
              type="text"
              placeholder="ghcr.io/org/image:latest"
              value={image}
              onChange={e => setImage(e.target.value)}
            />
          </div>
          <div className="ops-form-group">
            <label className="ops-form-label">Presets</label>
            <div className="ops-preset-list">
              {presets.map(p => (
                <button
                  key={p.name}
                  className="ops-preset-btn"
                  onClick={() => { setName(p.name); setImage(p.image) }}
                >
                  <span className="ops-preset-name">{p.name}</span>
                  <span className="ops-preset-image">{p.image}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="ops-modal-footer">
          <button className="ops-action-btn" onClick={onClose}>Cancel</button>
          <button
            className="ops-action-btn"
            style={{ background: 'var(--ops-accent-dim)', color: 'var(--ops-accent)' }}
            disabled={!name || !image}
            onClick={() => {
              store.spawnContainer(name, image)
              onClose()
            }}
          >
            <span className="material-symbols-outlined">play_arrow</span>
            Spawn
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Snack Catalog Browser ───────────────────────────────────────
const catalogItems = [
  { uuid: 'auto-label@devstudio', name: 'Auto-label GitHub Issues', description: 'AI-powered labels for new GitHub issues', author: 'DevStudio', version: '1.2.0', type: 'snack' as const },
  { uuid: 'code-review@devstudio', name: 'Code Review Skill', description: 'AI-powered code review for any snack', author: 'DevStudio', version: '1.0.0', type: 'skill' as const },
  { uuid: 'daily-reminder@community', name: 'Daily Reminder', description: 'Morning task summary reminder', author: 'Community', version: '0.9.0', type: 'snack' as const },
  { uuid: 'pr-reviewer@devstudio', name: 'PR Reviewer', description: 'Automated PR review on creation', author: 'DevStudio', version: '1.1.0', type: 'skill' as const },
  { uuid: 'webhook-github@devstudio', name: 'GitHub Webhook Handler', description: 'Process incoming GitHub webhooks', author: 'DevStudio', version: '1.0.0', type: 'trigger' as const },
  { uuid: 'feed-poller@community', name: 'Feed Poller', description: 'Poll RSS/Atom feeds for new content', author: 'Community', version: '0.5.0', type: 'snack' as const },
  { uuid: 'slack-notify@devstudio', name: 'Slack Notifier', description: 'Send notifications to Slack channels', author: 'DevStudio', version: '1.0.0', type: 'snack' as const },
  { uuid: 'discord-bridge@community', name: 'Discord Bridge', description: 'Bridge events to Discord webhooks', author: 'Community', version: '0.8.0', type: 'trigger' as const },
]

function CatalogBrowser() {
  const store = useOpsUIStore()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'snack' | 'skill' | 'trigger'>('all')

  const filtered = catalogItems.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.uuid.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  const installedUuids = new Set(store.spices.map(s => s.manifest.uuid))

  return (
    <div className="ops-card">
      <div className="ops-card-header">
        <h3>Snack Catalog</h3>
        <div className="ops-catalog-filters">
          {(['all', 'snack', 'skill', 'trigger'] as const).map(t => (
            <button
              key={t}
              className={`ops-filter-tab ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>
      <div className="ops-card-content">
        <div className="ops-log-filter">
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="ops-catalog-list">
          {filtered.map(item => {
            const installed = installedUuids.has(item.uuid)
            return (
              <div key={item.uuid} className={`ops-catalog-item ${installed ? 'installed' : ''}`}>
                <div className="ops-catalog-item-info">
                  <div className="ops-catalog-item-name">{item.name}</div>
                  <div className="ops-catalog-item-desc">{item.description}</div>
                  <div className="ops-catalog-item-meta">
                    <span className="ops-badge" style={{ background: 'var(--ops-accent-dim)', color: 'var(--ops-accent)' }}>
                      {item.type}
                    </span>
                    <span>v{item.version}</span>
                    <span>{item.author}</span>
                  </div>
                </div>
                <div className="ops-catalog-item-actions">
                  {installed ? (
                    <span className="ops-installed-badge">Installed</span>
                  ) : (
                    <button
                      className="ops-action-btn"
                      onClick={() => store.installSpice(item.uuid)}
                    >
                      <span className="material-symbols-outlined">download</span>
                      Install
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="ops-text" style={{ textAlign: 'center', padding: 20 }}>
              No items match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Script Editor (Simple) ──────────────────────────────────────
function ScriptEditor() {
  const [code, setCode] = useState(`// Snack Script
// Write your snack logic here.
// Triggers: github:issue.created, schedule:daily, webhook:github

export async function run(context: SnackContext) {
  const { event, vault, log } = context
  
  log.info('Snack started!')
  
  // Access secrets from vault
  const token = await vault.get('github_token')
  
  // Your logic here
  const result = await fetch('https://api.github.com/repos/owner/repo/issues', {
    headers: { Authorization: \`Bearer \${token}\` }
  })
  
  return { success: true, data: await result.json() }
}`)

  return (
    <div className="ops-card">
      <div className="ops-card-header">
        <h3>Script Editor</h3>
        <div className="ops-catalog-filters">
          <button className="ops-action-btn" onClick={() => alert('Script saved!')}>
            <span className="material-symbols-outlined">save</span>
            Save
          </button>
          <button className="ops-action-btn" onClick={() => alert('Script tested!')}>
            <span className="material-symbols-outlined">play_arrow</span>
            Test
          </button>
        </div>
      </div>
      <div className="ops-card-content">
        <textarea
          className="ops-script-editor"
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  )
}

// ─── Main Snacks Tab ─────────────────────────────────────────────
export default function SnacksTab() {
  const store = useOpsUIStore()
  const [showSpawnForm, setShowSpawnForm] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<'containers' | 'catalog' | 'editor'>('containers')

  const runningCount = store.containers.filter(c => c.status === 'running').length
  const stoppedCount = store.containers.filter(c => c.status === 'stopped').length

  return (
    <div>
      {/* Toolbar */}
      <div className="ops-toolbar">
        <div className="ops-toolbar-left">
          <h2 className="ops-heading">Snacks</h2>
          <span className="ops-badge" style={{ background: 'var(--ops-accent-dim)', color: 'var(--ops-accent)' }}>
            {runningCount} running / {stoppedCount} stopped
          </span>
        </div>
        <div className="ops-toolbar-right">
          <button className="ops-action-btn" onClick={store.refreshContainers}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
          <button className="ops-action-btn" onClick={() => setShowSpawnForm(true)}>
            <span className="material-symbols-outlined">add</span>
            Spawn Container
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="ops-filter-tabs">
        <button
          className={`ops-filter-tab ${activeSubTab === 'containers' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('containers')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>inventory_2</span>
          Containers
        </button>
        <button
          className={`ops-filter-tab ${activeSubTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('catalog')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>store</span>
          Catalog
        </button>
        <button
          className={`ops-filter-tab ${activeSubTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('editor')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>code</span>
          Script Editor
        </button>
      </div>

      {/* Container Search */}
      {activeSubTab === 'containers' && (
        <div className="ops-log-filter">
          <input
            type="text"
            placeholder="Search containers by name or image..."
            value={store.containerFilter}
            onChange={e => store.setContainerFilter(e.target.value)}
          />
        </div>
      )}

      {/* Containers View */}
      {activeSubTab === 'containers' && (
        <div className="ops-card">
          <div className="ops-card-header">
            <h3>Running Containers ({runningCount})</h3>
          </div>
          <div className="ops-card-content ops-card-content--no-pad">
            {store.containers.filter(c => c.status === 'running').length === 0 ? (
              <p className="ops-text" style={{ textAlign: 'center', padding: 20 }}>
                No running containers. Spawn one to get started.
              </p>
            ) : (
              store.containers
                .filter(c => c.status === 'running')
                .filter(c => !store.containerFilter || c.name.includes(store.containerFilter) || c.image.includes(store.containerFilter))
                .map(ctr => <ContainerRow key={ctr.id} id={ctr.id} />)
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'containers' && (
        <div className="ops-card" style={{ marginTop: 12 }}>
          <div className="ops-card-header">
            <h3>Stopped Containers ({stoppedCount})</h3>
          </div>
          <div className="ops-card-content ops-card-content--no-pad">
            {store.containers.filter(c => c.status === 'stopped').length === 0 ? (
              <p className="ops-text" style={{ textAlign: 'center', padding: 20 }}>
                No stopped containers.
              </p>
            ) : (
              store.containers
                .filter(c => c.status === 'stopped')
                .filter(c => !store.containerFilter || c.name.includes(store.containerFilter) || c.image.includes(store.containerFilter))
                .map(ctr => <ContainerRow key={ctr.id} id={ctr.id} />)
            )}
          </div>
        </div>
      )}

      {/* Catalog View */}
      {activeSubTab === 'catalog' && <CatalogBrowser />}

      {/* Script Editor View */}
      {activeSubTab === 'editor' && <ScriptEditor />}

      {/* Spawn Container Modal */}
      {showSpawnForm && <SpawnContainerForm onClose={() => setShowSpawnForm(false)} />}
    </div>
  )
}
