/* ═══════════════════════════════════════════════════════════════════
   VaultSurface — Browse and manage vault files
   Ported from Vue VaultSurface.vue
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Icon } from '@usx/styles/react/icon'

interface VaultFile {
  id: number
  name: string
  type: string
  size: number
  updatedAt: string
  tags?: string[]
  previewUrl?: string
}

const MOCK_FILES: VaultFile[] = [
  { id: 1, name: 'Project Notes.md', type: 'markdown', size: 2048, updatedAt: new Date(Date.now() - 3600000).toISOString(), tags: ['notes', 'project'] },
  { id: 2, name: 'Architecture Diagram.png', type: 'image', size: 512000, updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), tags: ['diagram'] },
  { id: 3, name: 'config.yaml', type: 'code', size: 1024, updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(), tags: ['config'] },
  { id: 4, name: 'README.md', type: 'markdown', size: 4096, updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(), tags: ['docs'] },
  { id: 5, name: 'Screenshot 2024.png', type: 'image', size: 1024000, updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(), tags: ['screenshot'] },
  { id: 6, name: 'api.ts', type: 'code', size: 8192, updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), tags: ['code', 'api'] },
]

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const getFileIconName = (file: VaultFile): string => {
  const typeMap: Record<string, string> = {
    markdown: 'description',
    md: 'description',
    txt: 'description',
    image: 'image',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    svg: 'image',
    code: 'code',
    js: 'code',
    ts: 'code',
    py: 'code',
    yaml: 'code',
    json: 'code',
  }
  return typeMap[file.type?.toLowerCase()] || 'insert_drive_file'
}

const VaultSurface: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null)
  const [files, setFiles] = useState<VaultFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files
    const query = searchQuery.toLowerCase()
    return files.filter(file =>
      file.name.toLowerCase().includes(query) ||
      (file.tags && file.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }, [files, searchQuery])

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files])

  const loadFiles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setFiles(MOCK_FILES)
    } catch (err: any) {
      setError(err.message || 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadFiles() }, [])

  const handleUpload = () => setShowUploadModal(true)

  const triggerFileInput = () => fileInputRef.current?.click()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      alert(`Uploaded ${selectedFiles.length} file(s)`)
      setShowUploadModal(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      alert(`Uploaded ${droppedFiles.length} file(s)`)
      setShowUploadModal(false)
    }
  }

  const createNewDocument = () => {
    const newFile: VaultFile = {
      id: Date.now(),
      name: 'Untitled Document.md',
      type: 'markdown',
      size: 0,
      updatedAt: new Date().toISOString(),
    }
    setFiles(prev => [newFile, ...prev])
  }

  const createNewFolder = () => {
    const name = prompt('Folder name:')
    if (name) {
      alert(`Created folder: ${name}`)
    }
  }

  const syncAll = async () => {
    alert('Syncing with connected services...')
  }

  const openFile = (file: VaultFile) => {
    setPreviewFile(file)
  }

  const closePreview = () => setPreviewFile(null)

  const shareFile = (file: VaultFile) => {
    alert(`Share link created for ${file.name}`)
  }

  const downloadFile = (file: VaultFile) => {
    alert(`Downloading ${file.name}`)
  }

  const deleteFile = (file: VaultFile) => {
    if (confirm(`Delete ${file.name}? This cannot be undone.`)) {
      setFiles(prev => prev.filter(f => f.id !== file.id))
    }
  }

  return (
    <div className="vault-surface">
      {/* Surface Header */}
      <div className="surface-header">
        <div className="header-left">
          <Icon name="folder" size={24} className="header-icon" />
          <h1>Vault Browser</h1>
        </div>
        <div className="header-right">
          <button className="btn-secondary btn-sm" onClick={syncAll} title="Sync changes with connected services">
            <Icon name="refresh" size={16} />
            Sync
          </button>
          <button className="btn-primary btn-sm" onClick={handleUpload} title="Upload files from your computer">
            <Icon name="upload" size={16} />
            Upload
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="vault-action-bar">
        <button className="btn-secondary" onClick={createNewDocument} title="Create a new document">
          <Icon name="description" size={16} />
          New Document
        </button>
        <button className="btn-secondary" onClick={createNewFolder} title="Create a new folder">
          <Icon name="folder" size={16} />
          New Folder
        </button>
        <div className="vault-search-container">
          <Icon name="search" size={16} className="vault-search-icon" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search files..." className="vault-search-input" />
          {searchQuery && (
            <button className="btn-icon btn-sm" onClick={() => setSearchQuery('')} title="Clear search">
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your files...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="error-state">
          <div className="error-icon">
            <Icon name="error" size={48} />
          </div>
          <h3>Couldn't load your files</h3>
          <p>We tried to reach your Vault, but something blocked the connection.</p>
          <button className="btn-primary" onClick={loadFiles}>
            <Icon name="refresh" size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredFiles.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="folder" size={64} />
          </div>
          <h3>{searchQuery ? 'No files found' : 'Your Vault is empty'}</h3>
          <p>{searchQuery ? 'Try a different search term' : 'Add your first file to get started'}</p>
          {!searchQuery && (
            <div className="empty-actions">
              <button className="btn-primary" onClick={handleUpload}>
                <Icon name="upload" size={16} />
                Upload File
              </button>
              <button className="btn-secondary" onClick={createNewDocument}>
                <Icon name="description" size={16} />
                Create Document
              </button>
            </div>
          )}
        </div>
      )}

      {/* File Grid */}
      {!isLoading && !error && filteredFiles.length > 0 && (
        <div className="vault-file-container">
          <div className="vault-file-grid">
            {filteredFiles.map(file => (
              <div key={file.id} className="vault-file-card" onClick={() => openFile(file)}>
                <div className="vault-file-icon-container">
                  <Icon name={getFileIconName(file)} size={32} className="vault-file-icon" />
                </div>
                <div className="vault-file-info">
                  <div className="vault-file-name" title={file.name}>{file.name}</div>
                  <div className="vault-file-meta">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatRelativeTime(file.updatedAt)}</span>
                  </div>
                </div>
                <div className="vault-file-actions">
                  <button className="btn-icon btn-sm" onClick={e => { e.stopPropagation(); shareFile(file) }} title="Share this file">
                    <Icon name="share" size={14} />
                  </button>
                  <button className="btn-icon btn-sm" onClick={e => { e.stopPropagation(); downloadFile(file) }} title="Download">
                    <Icon name="download" size={14} />
                  </button>
                  <button className="btn-icon btn-sm" onClick={e => { e.stopPropagation(); deleteFile(file) }} title="Delete this file">
                    <Icon name="delete" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="vault-file-stats">
            <span>{filteredFiles.length} files</span>
            <span>{formatFileSize(totalSize)} total</span>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Files</h3>
              <button className="btn-icon btn-sm" onClick={() => setShowUploadModal(false)}>
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="upload-area" onClick={triggerFileInput} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                <div className="upload-icon">
                  <Icon name="upload" size={48} />
                </div>
                <p>Drag files here or click to browse</p>
                <p className="text-secondary text-sm">Supported: Documents, images, code, archives</p>
                <input type="file" ref={fileInputRef} multiple onChange={handleFileSelect} style={{ display: 'none' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-left">
                <Icon name={getFileIconName(previewFile)} size={20} />
                <h3>{previewFile.name}</h3>
              </div>
              <div className="header-actions">
                <button className="btn-secondary btn-sm" onClick={() => downloadFile(previewFile)}>
                  <Icon name="download" size={14} />
                  Download
                </button>
                <button className="btn-secondary btn-sm" onClick={() => shareFile(previewFile)}>
                  <Icon name="share" size={14} />
                  Share
                </button>
                <button className="btn-icon btn-sm" onClick={closePreview}>
                  <Icon name="close" size={16} />
                </button>
              </div>
            </div>
            <div className="modal-body preview-content">
              {previewFile.type === 'image' ? (
                <div className="image-preview">
                  <div style={{ width: 200, height: 200, background: 'var(--usx-color-surface)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--usx-color-on-surface-variant)' }}>
                    <Icon name="image" size={48} />
                  </div>
                </div>
              ) : (
                <div className="text-preview">
                  <pre>Preview of {previewFile.name} ({formatFileSize(previewFile.size)})</pre>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <div className="preview-meta">
                <span>{formatFileSize(previewFile.size)}</span>
                <span>Updated {formatRelativeTime(previewFile.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VaultSurface
