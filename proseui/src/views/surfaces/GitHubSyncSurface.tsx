/* ═══════════════════════════════════════════════════════════════════
   GitHubSyncSurface — Sync content with GitHub repositories
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState } from 'react'
import { Icon } from '@usx/styles/react/icon'

interface Repo {
  id: number
  name: string
  owner: string
  branch: string
  status: 'synced' | 'pending' | 'conflict'
  lastSync: string
}

const INITIAL_REPOS: Repo[] = [
  { id: 1, name: 'uConnect', owner: 'uDosGo', branch: 'main', status: 'synced', lastSync: '2m ago' },
  { id: 2, name: 'uCode2', owner: 'uDosGo', branch: 'develop', status: 'pending', lastSync: '1h ago' },
  { id: 3, name: 'docs', owner: 'uDosGo', branch: 'main', status: 'conflict', lastSync: '3h ago' },
]

const GitHubSyncSurface: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>(INITIAL_REPOS)
  const [syncing, setSyncing] = useState<number | null>(null)

  const syncRepo = (id: number) => {
    setSyncing(id)
    setTimeout(() => {
      setRepos(prev => prev.map(r => r.id === id ? { ...r, status: 'synced' as const, lastSync: 'just now' } : r))
      setSyncing(null)
    }, 1500)
  }

  const pushRepo = (id: number) => {
    setSyncing(id)
    setTimeout(() => {
      setRepos(prev => prev.map(r => r.id === id ? { ...r, status: 'synced' as const, lastSync: 'just now' } : r))
      setSyncing(null)
    }, 2000)
  }

  return (
    <div className="githubsync-surface">
      <div className="surface-header">
        <div className="header-left">
          <Icon name="code" size={24} className="header-icon" />
          <div>
            <h1>GitHub Sync</h1>
            <p className="surface-tagline">Sync content with GitHub repositories.</p>
          </div>
        </div>
      </div>

      {/* Repo List */}
      <div className="githubsync-list">
        {repos.map(repo => (
          <div key={repo.id} className="githubsync-repo">
            <div className="githubsync-repo-info">
              <div className="githubsync-repo-name">
                <Icon name="folder" size={16} />
                {repo.owner}/{repo.name}
              </div>
              <div className="githubsync-repo-meta">
                <span className="githubsync-branch">
                  <Icon name="account_tree" size={12} />
                  {repo.branch}
                </span>
                <span className={`status-badge ${repo.status}`}>{repo.status}</span>
                <span className="githubsync-time">{repo.lastSync}</span>
              </div>
            </div>
            <div className="githubsync-repo-actions">
              {syncing === repo.id ? (
                <span className="githubsync-spinner">Syncing...</span>
              ) : (
                <>
                  <button className="btn-secondary btn-sm" onClick={() => syncRepo(repo.id)} title="Pull latest changes">
                    <Icon name="download" size={14} />
                    Pull
                  </button>
                  <button className="btn-primary btn-sm" onClick={() => pushRepo(repo.id)} title="Push local changes">
                    <Icon name="upload" size={14} />
                    Push
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sync Status */}
      <div className="githubsync-status">
        <span>{repos.filter(r => r.status === 'synced').length} synced</span>
        <span>{repos.filter(r => r.status === 'pending').length} pending</span>
        <span>{repos.filter(r => r.status === 'conflict').length} conflicts</span>
      </div>
    </div>
  )
}

export default GitHubSyncSurface
