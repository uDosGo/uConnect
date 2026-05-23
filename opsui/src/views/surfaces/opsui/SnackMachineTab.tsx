/* ═══════════════════════════════════════════════════════════════════
   opsui SnackMachine Tab — USXD Table View for Snacks/Skills/Spices
   
   Displays all installed snacks, skills, spices, triggers, and blocks
   in a USXD-style table. Supports enable/disable, install, remove,
   and execution of snacks directly from the UI.
   ═══════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react'
import { useOpsUIStore, type SpiceType } from './stores/opsUIStore'

// ─── Spice Type Config ───────────────────────────────────────────
const spiceTypeConfig: Record<SpiceType, { icon: string; color: string }> = {
  snack: { icon: 'restaurant_menu', color: '#58a6ff' },
  skill: { icon: 'psychology', color: '#3fb950' },
  spice: { icon: 'auto_awesome', color: '#d29922' },
  trigger: { icon: 'bolt', color: '#f85149' },
  block: { icon: 'widgets', color: '#bc8cff' },
  container: { icon: 'inventory_2', color: '#79c0ff' },
}

const spiceTypeLabels: Record<SpiceType, string> = {
  snack: 'Snack',
  skill: 'Skill',
  spice: 'Spice',
  trigger: 'Trigger',
  block: 'Block',
  container: 'Container',
}

// ─── Spice Detail Modal ──────────────────────────────────────────
function SpiceDetailModal({ uuid, onClose }: { uuid: string; onClose: () => void }) {
  const store = useOpsUIStore()
  const spice = store.spices.find(s => s.manifest.uuid === uuid)
  if (!spice) return null

  const m = spice.manifest
  const cfg = spiceTypeConfig[m.spice_type]

  return (
    <div className="ops-modal-overlay" onClick={onClose}>
      <div className="ops-modal" onClick={e => e.stopPropagation()}>
        <div className="ops-modal-header">
          <div className="ops-modal-title">
            <span className="material-symbols-outlined" style={{ color: cfg.color }}>{cfg.icon}</span>
            <h3>{m.name}</h3>
            <span className="ops-badge" style={{ background: `${cfg.color}22`, color: cfg.color }}>
              {spiceTypeLabels[m.spice_type]}
            </span>
          </div>
          <button className="ops-action-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="ops-modal-body">
          <div className="ops-detail-grid">
            <div className="ops-detail-field">
              <span className="ops-detail-label">UUID</span>
              <span className="ops-detail-value mono">{m.uuid}</span>
            </div>
            <div className="ops-detail-field">
              <span className="ops-detail-label">Version</span>
              <span className="ops-detail-value">{m.version}</span>
            </div>
            <div className="ops-detail-field">
              <span className="ops-detail-label">Author</span>
              <span className="ops-detail-value">{m.author}</span>
            </div>
            <div className="ops-detail-field">
              <span className="ops-detail-label">Installed</span>
              <span className="ops-detail-value">{new Date(spice.installed_at).toLocaleString()}</span>
            </div>
            <div className="ops-detail-field">
              <span className="ops-detail-label">Platforms</span>
              <span className="ops-detail-value">{m.platforms.join(', ') || 'all'}</span>
            </div>
            <div className="ops-detail-field">
              <span className="ops-detail-label">System</span>
              <span className="ops-detail-value">{m.system ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <p className="ops-text" style={{ marginTop: 12 }}>{m.description}</p>

          {m.triggers.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span className="ops-detail-label">Triggers</span>
              <div className="ops-tag-list" style={{ marginTop: 4 }}>
                {m.triggers.map(t => (
                  <span key={t} className="ops-tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {m.dependencies.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span className="ops-detail-label">Dependencies</span>
              <div className="ops-tag-list" style={{ marginTop: 4 }}>
                {m.dependencies.map(d => (
                  <span key={d} className="ops-tag">{d}</span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(m.scripts).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span className="ops-detail-label">Scripts</span>
              <div className="ops-tag-list" style={{ marginTop: 4 }}>
                {Object.entries(m.scripts).map(([name, path]) => (
                  <span key={name} className="ops-tag">{name}: {path}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="ops-modal-footer">
          <button
            className="ops-action-btn"
            onClick={() => { store.toggleSpice(uuid); onClose() }}
          >
            <span className="material-symbols-outlined">
              {spice.enabled ? 'toggle_off' : 'toggle_on'}
            </span>
            {spice.enabled ? 'Disable' : 'Enable'}
          </button>
          {m.spice_type === 'snack' && (
            <button className="ops-action-btn" onClick={() => { store.runSnack(uuid); onClose() }}>
              <span className="material-symbols-outlined">play_arrow</span>
              Run Now
            </button>
          )}
          {!m.system && (
            <button
              className="ops-action-btn"
              style={{ color: 'var(--ops-error)' }}
              onClick={() => { store.removeSpice(uuid); onClose() }}
            >
              <span className="material-symbols-outlined">delete</span>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Spice Table Row ─────────────────────────────────────────────
function SpiceRow({ uuid }: { uuid: string }) {
  const store = useOpsUIStore()
  const spice = store.spices.find(s => s.manifest.uuid === uuid)
  if (!spice) return null

  const m = spice.manifest
  const cfg = spiceTypeConfig[m.spice_type]

  return (
    <div
      className={`ops-spice-row ${spice.enabled ? '' : 'disabled'}`}
      onClick={() => store.setSelectedSpice(uuid)}
    >
      <div className="ops-spice-icon" style={{ color: cfg.color }}>
        <span className="material-symbols-outlined">{cfg.icon}</span>
      </div>
      <div className="ops-spice-info">
        <div className="ops-spice-name">{m.name}</div>
        <div className="ops-spice-desc">{m.description}</div>
      </div>
      <div className="ops-spice-meta">
        <span className="ops-badge" style={{ background: `${cfg.color}22`, color: cfg.color }}>
          {spiceTypeLabels[m.spice_type]}
        </span>
        <span className="ops-spice-version">{m.version}</span>
        <span className="ops-spice-author">{m.author}</span>
      </div>
      <div className="ops-spice-actions">
        <button
          className={`ops-toggle ${spice.enabled ? 'on' : 'off'}`}
          onClick={e => { e.stopPropagation(); store.toggleSpice(uuid) }}
          title={spice.enabled ? 'Disable' : 'Enable'}
        >
          <span className="material-symbols-outlined">
            {spice.enabled ? 'toggle_on' : 'toggle_off'}
          </span>
        </button>
        {m.spice_type === 'snack' && (
          <button
            className="ops-spice-btn"
            onClick={e => { e.stopPropagation(); store.runSnack(uuid) }}
            title="Run snack"
          >
            <span className="material-symbols-outlined">play_arrow</span>
          </button>
        )}
        <button
          className="ops-spice-btn"
          onClick={e => { e.stopPropagation(); store.setSelectedSpice(uuid) }}
          title="View details"
        >
          <span className="material-symbols-outlined">info</span>
        </button>
      </div>
    </div>
  )
}

// ─── Execution History ───────────────────────────────────────────
function ExecutionHistory() {
  const store = useOpsUIStore()

  return (
    <div className="ops-card">
      <div className="ops-card-header">
        <h3>Execution History</h3>
        <button className="ops-action-btn" onClick={store.refreshExecutions}>
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>
      <div className="ops-card-content">
        {store.executions.length === 0 ? (
          <p className="ops-text" style={{ textAlign: 'center', padding: 20 }}>
            No executions yet. Run a snack to see results here.
          </p>
        ) : (
          store.executions.slice(0, 10).map(ex => (
            <div key={ex.id} className="ops-execution-row">
              <div className="ops-execution-info">
                <span className="ops-execution-snack">{ex.snack_id}</span>
                <span className="ops-execution-time">
                  {new Date(ex.started_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="ops-execution-meta">
                <span className={`ops-execution-status ${ex.status}`}>
                  {ex.status === 'running' ? '● Running' : ex.status === 'completed' ? '✓ Done' : '✗ Failed'}
                </span>
                {ex.duration_ms > 0 && (
                  <span className="ops-execution-duration">{ex.duration_ms}ms</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main SnackMachine Tab ───────────────────────────────────────
export default function SnackMachineTab() {
  const store = useOpsUIStore()
  const [showInstallInput, setShowInstallInput] = useState(false)
  const [installUuid, setInstallUuid] = useState('')

  const filteredSpices = store.spices.filter(sp => {
    if (store.spiceTypeFilter !== 'all' && sp.manifest.spice_type !== store.spiceTypeFilter) return false
    if (store.spiceFilter) {
      const q = store.spiceFilter.toLowerCase()
      return (
        sp.manifest.name.toLowerCase().includes(q) ||
        sp.manifest.uuid.toLowerCase().includes(q) ||
        sp.manifest.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = {
    all: store.spices.length,
    snack: store.spices.filter(s => s.manifest.spice_type === 'snack').length,
    skill: store.spices.filter(s => s.manifest.spice_type === 'skill').length,
    spice: store.spices.filter(s => s.manifest.spice_type === 'spice').length,
    trigger: store.spices.filter(s => s.manifest.spice_type === 'trigger').length,
  }

  const typeFilters: { id: SpiceType | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'snack', label: 'Snacks', count: counts.snack },
    { id: 'skill', label: 'Skills', count: counts.skill },
    { id: 'spice', label: 'Spices', count: counts.spice },
    { id: 'trigger', label: 'Triggers', count: counts.trigger },
  ]

  return (
    <div>
      {/* Toolbar */}
      <div className="ops-toolbar">
        <div className="ops-toolbar-left">
          <h2 className="ops-heading">SnackMachine</h2>
          <span className="ops-badge" style={{ background: 'var(--ops-accent-dim)', color: 'var(--ops-accent)' }}>
            {store.spices.length} installed
          </span>
        </div>
        <div className="ops-toolbar-right">
          <button className="ops-action-btn" onClick={store.refreshSpices}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
          <button className="ops-action-btn" onClick={() => setShowInstallInput(true)}>
            <span className="material-symbols-outlined">add</span>
            Install
          </button>
        </div>
      </div>

      {/* Install Input */}
      {showInstallInput && (
        <div className="ops-install-bar">
          <input
            type="text"
            placeholder="Spice UUID (e.g., auto-label@devstudio) or registry URL..."
            value={installUuid}
            onChange={e => setInstallUuid(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && installUuid.trim()) {
                store.installSpice(installUuid.trim())
                setInstallUuid('')
                setShowInstallInput(false)
              }
            }}
            autoFocus
          />
          <button
            className="ops-action-btn"
            onClick={() => {
              if (installUuid.trim()) {
                store.installSpice(installUuid.trim())
                setInstallUuid('')
                setShowInstallInput(false)
              }
            }}
          >
            Install
          </button>
          <button className="ops-action-btn" onClick={() => { setShowInstallInput(false); setInstallUuid('') }}>
            Cancel
          </button>
        </div>
      )}

      {/* Type Filter Tabs */}
      <div className="ops-filter-tabs">
        {typeFilters.map(tf => (
          <button
            key={tf.id}
            className={`ops-filter-tab ${store.spiceTypeFilter === tf.id ? 'active' : ''}`}
            onClick={() => store.setSpiceTypeFilter(tf.id)}
          >
            {tf.label}
            <span className="ops-filter-count">{tf.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="ops-log-filter">
        <input
          type="text"
          placeholder="Search by name, UUID, or description..."
          value={store.spiceFilter}
          onChange={e => store.setSpiceFilter(e.target.value)}
        />
        {store.spiceFilter && (
          <button className="ops-action-btn" onClick={() => store.setSpiceFilter('')}>
            Clear
          </button>
        )}
      </div>

      {/* Spice Table */}
      <div className="ops-card">
        <div className="ops-card-header">
          <h3>Installed Spices ({filteredSpices.length})</h3>
        </div>
        <div className="ops-card-content ops-card-content--no-pad">
          {filteredSpices.length === 0 ? (
            <p className="ops-text" style={{ textAlign: 'center', padding: 20 }}>
              {store.spiceFilter
                ? 'No spices match your filter.'
                : 'No spices installed. Click "Install" to add one.'}
            </p>
          ) : (
            <div className="ops-spice-table">
              {filteredSpices.map(sp => (
                <SpiceRow key={sp.manifest.uuid} uuid={sp.manifest.uuid} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Execution History */}
      <div style={{ marginTop: 12 }}>
        <ExecutionHistory />
      </div>

      {/* Detail Modal */}
      {store.selectedSpice && (
        <SpiceDetailModal
          uuid={store.selectedSpice}
          onClose={() => store.setSelectedSpice(null)}
        />
      )}
    </div>
  )
}
