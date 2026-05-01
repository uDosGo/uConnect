import React, { useState, useEffect, useCallback } from 'react';
import * as API from './VaultStorage';

const FILE_ICONS = {
  '.md': '📝', '.json': '📋', '.udx': '📦', '.js': '⚙️',
  '.jsx': '⚛️', '.ts': '🦾', '.py': '🐍', '.rs': '🦀',
  '.css': '🎨', '.html': '🌐', '.svg': '🖼️', '.png': '🖼️',
  '.jpg': '🖼️', '.yaml': '📐', '.yml': '📐', '.toml': '📐',
};

function getIcon(name, isDir) {
  if (isDir) return '📁';
  const ext = name.match(/\.[^.]+$/)?.[0]?.toLowerCase();
  return FILE_ICONS[ext] || '📄';
}

function TreeNode({ name, path, isDir, depth, selected, onSelect, onToggle, expanded }) {
  const icon = getIcon(name, isDir);
  return (
    <div>
      <div
        className={`vb-node${selected === path ? ' selected' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(path, isDir)}
      >
        {isDir && (
          <span className="vb-expand" onClick={(e) => { e.stopPropagation(); onToggle(path); }}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        <span className="vb-icon">{icon}</span>
        <span className="vb-name">{name}</span>
      </div>
    </div>
  );
}

export default function VaultBrowser() {
  const [tree, setTree] = useState({});
  const [expanded, setExpanded] = useState({});
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedIsDir, setSelectedIsDir] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);

  const rootPath = '';

  const loadDir = useCallback(async (dirPath) => {
    try {
      const items = await API.listDir(dirPath);
      setTree(prev => ({ ...prev, [dirPath]: items }));
    } catch (e) {
      console.error('Failed to load', dirPath, e);
    }
  }, []);

  useEffect(() => { loadDir(rootPath); }, [loadDir]);

  const toggleDir = (path) => {
    const next = !expanded[path];
    setExpanded(prev => ({ ...prev, [path]: next }));
    if (next) loadDir(path);
  };

  const handleSelect = async (path, isDir) => {
    setSelectedPath(path);
    setSelectedIsDir(isDir);
    if (!isDir) {
      setLoading(true);
      try {
        const content = await API.readFile(path);
        setFileContent(content);
      } catch {
        setFileContent('Error loading file.');
      }
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const fullPath = selectedIsDir && selectedPath ? `${selectedPath}/${newName}` : newName;
    const ok = await API.writeFile(fullPath, '');
    if (ok) {
      setNewName('');
      setShowNew(false);
      const dir = selectedIsDir && selectedPath ? selectedPath : '';
      loadDir(dir);
    }
  };

  const handleDelete = async () => {
    if (!selectedPath || selectedIsDir) return;
    if (!window.confirm(`Delete ${selectedPath}?`)) return;
    const ok = await API.deleteFile(selectedPath);
    if (ok) {
      setSelectedPath(null);
      setFileContent('');
      const dir = selectedPath.includes('/') ? selectedPath.substring(0, selectedPath.lastIndexOf('/')) : '';
      loadDir(dir);
    }
  };

  const handleSave = async () => {
    if (!selectedPath || selectedIsDir) return;
    await API.writeFile(selectedPath, fileContent);
  };

  // Render tree nodes recursively
  const renderTree = (dirPath, depth = 0) => {
    const items = tree[dirPath] || [];
    return items.map(item => {
      const fullPath = dirPath ? `${dirPath}/${item.name}` : item.name;
      const isExpanded = expanded[fullPath];
      return (
        <React.Fragment key={fullPath}>
          <TreeNode
            name={item.name}
            path={fullPath}
            isDir={item.is_directory ?? item.type === 'directory'}
            depth={depth}
            selected={selectedPath}
            onSelect={handleSelect}
            onToggle={toggleDir}
            expanded={isExpanded}
          />
          {item.is_directory && isExpanded && renderTree(fullPath, depth + 1)}
        </React.Fragment>
      );
    });
  };

  const isMarkdown = selectedPath?.endsWith('.md');
  const isImage = selectedPath?.match(/\.(png|jpg|jpeg|gif|svg)$/i);

  return (
    <div className="vb">
      <div className="vb-toolbar">
        <span className="vb-title">Vault Browser</span>
        <span className="vb-path">{selectedPath || '~/Code/Vault'}</span>
        <div style={{ flex: 1 }} />
        <button className="vb-action-btn" onClick={() => setShowNew(!showNew)} title="New file">+ New</button>
        {selectedPath && !selectedIsDir && (
          <button className="vb-action-btn" onClick={handleDelete} title="Delete">🗑</button>
        )}
      </div>
      {showNew && (
        <div className="vb-new-row">
          <input className="vb-new-input" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="filename.ext" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          <button className="vb-action-btn" onClick={handleCreate}>Create</button>
        </div>
      )}
      <div className="vb-body">
        <div className="vb-tree">
          {renderTree(rootPath)}
        </div>
        <div className="vb-preview">
          {!selectedPath && <div className="vb-placeholder">Select a file to preview</div>}
          {selectedPath && selectedIsDir && <div className="vb-placeholder">📁 {selectedPath}</div>}
          {selectedPath && !selectedIsDir && loading && <div className="vb-placeholder">Loading...</div>}
          {selectedPath && !selectedIsDir && !loading && isImage && (
            <div className="vb-image-preview">
              <span className="vb-image-icon">🖼️</span>
              <span className="vb-image-name">{selectedPath}</span>
              <span className="vb-image-hint">(Image preview requires server support)</span>
            </div>
          )}
          {selectedPath && !selectedIsDir && !loading && !isImage && (
            <textarea
              className="vb-editor"
              value={fileContent}
              onChange={e => setFileContent(e.target.value)}
              spellCheck={false}
            />
          )}
          {selectedPath && !selectedIsDir && !loading && !isImage && (
            <div className="vb-save-bar">
              <span className="vb-save-hint">{isMarkdown ? 'Markdown' : 'Text'} file</span>
              <button className="vb-action-btn primary" onClick={handleSave}>Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
