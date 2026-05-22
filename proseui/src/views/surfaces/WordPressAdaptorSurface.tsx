/* ═══════════════════════════════════════════════════════════════════
   WordPressAdaptorSurface — Publish content to WordPress
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState } from 'react'
import { Icon } from '@usx/styles/react/icon'

interface WPConnection {
  url: string
  username: string
  connected: boolean
}

interface WPLog {
  id: number
  action: string
  status: 'success' | 'failed'
  timestamp: string
}

const WordPressAdaptorSurface: React.FC = () => {
  const [connection, setConnection] = useState<WPConnection>({ url: '', username: '', connected: false })
  const [form, setForm] = useState({ url: 'https://example.com', username: 'admin', password: '' })
  const [logs, setLogs] = useState<WPLog[]>([
    { id: 1, action: 'Connection test', status: 'success', timestamp: '2h ago' },
    { id: 2, action: 'Published "Getting Started Guide"', status: 'success', timestamp: '1d ago' },
  ])
  const [connecting, setConnecting] = useState(false)

  const connect = () => {
    if (!form.url || !form.username) return
    setConnecting(true)
    setTimeout(() => {
      setConnection({ url: form.url, username: form.username, connected: true })
      setLogs(prev => [{ id: Date.now(), action: 'Connected to WordPress', status: 'success', timestamp: 'just now' }, ...prev])
      setConnecting(false)
    }, 1000)
  }

  const disconnect = () => {
    setConnection({ url: '', username: '', connected: false })
    setLogs(prev => [{ id: Date.now(), action: 'Disconnected', status: 'success', timestamp: 'just now' }, ...prev])
  }

  const testPublish = () => {
    setLogs(prev => [{ id: Date.now(), action: 'Publishing test post...', status: 'success', timestamp: 'just now' }, ...prev])
  }

  return (
    <div className="wp-surface">
      <div className="surface-header">
        <div className="header-left">
          <Icon name="language" size={24} className="header-icon" />
          <div>
            <h1>WordPress Adaptor</h1>
            <p className="surface-tagline">Publish content to WordPress sites.</p>
          </div>
        </div>
      </div>

      {/* Connection Form */}
      {!connection.connected ? (
        <div className="wp-connect-form">
          <h3>Connect to WordPress</h3>
          <div className="modal-field">
            <label>Site URL</label>
            <input type="text" className="modal-input" value={form.url}
                   onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                   placeholder="https://yoursite.com" />
          </div>
          <div className="modal-field">
            <label>Username</label>
            <input type="text" className="modal-input" value={form.username}
                   onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                   placeholder="admin" />
          </div>
          <div className="modal-field">
            <label>Application Password</label>
            <input type="password" className="modal-input" value={form.password}
                   onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                   placeholder="••••••••" />
          </div>
          <button className="btn-primary" onClick={connect} disabled={connecting || !form.url || !form.username}>
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      ) : (
        <div className="wp-connected">
          <div className="wp-connected-info">
            <Icon name="check_circle" size={20} style={{ color: 'var(--m3-primary)' }} />
            <div>
              <div className="wp-connected-site">{connection.url}</div>
              <div className="wp-connected-user">Connected as {connection.username}</div>
            </div>
          </div>
          <div className="wp-connected-actions">
            <button className="btn-secondary btn-sm" onClick={testPublish}>
              <Icon name="publish" size={14} />
              Test Publish
            </button>
            <button className="btn-secondary btn-sm" onClick={disconnect}>
              <Icon name="logout" size={14} />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="wp-logs">
        <h3>Activity Log</h3>
        {logs.map(log => (
          <div key={log.id} className="wp-log-entry">
            <Icon name={log.status === 'success' ? 'check_circle' : 'error'} size={14}
                  style={{ color: log.status === 'success' ? 'var(--m3-primary)' : '#ef4444' }} />
            <span className="wp-log-action">{log.action}</span>
            <span className="wp-log-time">{log.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WordPressAdaptorSurface
