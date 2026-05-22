/* ═══════════════════════════════════════════════════════════════════
   UCode2PublishSurface — Publish and manage uCode2 content
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useMemo } from 'react'
import { Icon } from '@usx/styles/react/icon'

interface PublishDoc {
  id: number
  title: string
  type: string
  target: string
  status: 'draft' | 'published' | 'failed'
  updatedAt: string
}

const MOCK_DOCS: PublishDoc[] = [
  { id: 1, title: 'Getting Started Guide', type: 'doc', target: 'uCode1', status: 'published', updatedAt: '2d ago' },
  { id: 2, title: 'API Reference v2', type: 'doc', target: 'uCode2', status: 'draft', updatedAt: '3d ago' },
  { id: 3, title: 'Architecture Overview', type: 'doc', target: 'uCode1', status: 'published', updatedAt: '1d ago' },
  { id: 4, title: 'Workflow Automation Guide', type: 'guide', target: 'uCode2', status: 'draft', updatedAt: '5d ago' },
  { id: 5, title: 'USXD Format Spec', type: 'spec', target: 'uCode1', status: 'published', updatedAt: '1w ago' },
]

const TARGETS = ['uCode1', 'uCode2']

const UCode2PublishSurface: React.FC = () => {
  const [docs, setDocs] = useState<PublishDoc[]>(MOCK_DOCS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTarget, setSelectedTarget] = useState('all')
  const [publishing, setPublishing] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)

  const filteredDocs = useMemo(() => {
    return docs.filter(d => {
      if (selectedTarget !== 'all' && d.target !== selectedTarget) return false
      if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [docs, searchQuery, selectedTarget])

  const publishDoc = (doc: PublishDoc) => {
    setPublishing(doc.id)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setDocs(prevDocs => prevDocs.map(d =>
            d.id === doc.id ? { ...d, status: 'published' as const } : d
          ))
          setPublishing(null)
          return 0
        }
        return prev + 20
      })
    }, 300)
  }

  return (
    <div className="publish-surface">
      <div className="surface-header">
        <div className="header-left">
          <Icon name="publish" size={24} className="header-icon" />
          <div>
            <h1>uCode2 Publish</h1>
            <p className="surface-tagline">Publish and manage content across uCode editions.</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="publish-controls">
        <div className="publish-search">
          <Icon name="search" size={16} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search documents..." />
          {searchQuery && <button className="btn-icon btn-sm" onClick={() => setSearchQuery('')}><Icon name="close" size={14} /></button>}
        </div>
        <select className="publish-target-select" value={selectedTarget} onChange={e => setSelectedTarget(e.target.value)}>
          <option value="all">All Targets</option>
          {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="publish-stats">
        <span>{docs.filter(d => d.status === 'published').length} published</span>
        <span>{docs.filter(d => d.status === 'draft').length} drafts</span>
        <span>{docs.length} total</span>
      </div>

      {/* Document List */}
      <div className="publish-list">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="publish-item">
            <div className="publish-item-info">
              <div className="publish-item-title">{doc.title}</div>
              <div className="publish-item-meta">
                <span className="publish-item-type">{doc.type}</span>
                <span className="publish-item-target">{doc.target}</span>
                <span className={`status-badge ${doc.status}`}>{doc.status}</span>
                <span>{doc.updatedAt}</span>
              </div>
            </div>
            <div className="publish-item-actions">
              {publishing === doc.id ? (
                <div className="publish-progress">
                  <div className="publish-progress-bar" style={{ width: `${progress}%` }} />
                  <span>{progress}%</span>
                </div>
              ) : (
                <button className="btn-primary btn-sm" onClick={() => publishDoc(doc)}
                        disabled={doc.status === 'published'}>
                  <Icon name="publish" size={14} />
                  {doc.status === 'published' ? 'Published' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="empty-state">
            <Icon name="publish" size={48} />
            <h3>No documents found</h3>
            <p>Try a different search or target filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UCode2PublishSurface
