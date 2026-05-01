import React, { useState } from 'react';

const SAMPLE = [
  { id: '1', name: 'Setup Gift Wrapper',   status: 'Done',       priority: 'High',   assignee: 'Alice', due: '2026-05-01' },
  { id: '2', name: 'Vault integration',     status: 'In Progress', priority: 'High',   assignee: 'Bob',   due: '2026-05-10' },
  { id: '3', name: 'Kanban drag-drop',      status: 'In Progress', priority: 'Medium', assignee: 'Alice', due: '2026-05-12' },
  { id: '4', name: 'DocView panel',         status: 'Review',      priority: 'Medium', assignee: 'Carol', due: '2026-05-08' },
  { id: '5', name: 'Reader prose layout',   status: 'Review',      priority: 'Low',    assignee: 'Bob',   due: '' },
  { id: '6', name: 'Font integration',      status: 'To Do',       priority: 'Low',    assignee: 'Alice', due: '' },
  { id: '7', name: 'File picker UI',        status: 'To Do',       priority: 'Medium', assignee: 'Carol', due: '2026-05-15' },
];

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

export default function BinderView() {
  const [items, setItems] = useState(SAMPLE);
  const [view, setView] = useState('table'); // table | board
  const [editId, setEditId] = useState(null);
  const [editField, setEditField] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sorted = [...items].sort((a, b) => {
    if (!sortKey) return 0;
    const va = a[sortKey], vb = b[sortKey];
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    setEditId(null); setEditField(null);
  };

  const renderCell = (item, field) => {
    const isEditing = editId === item.id && editField === field;
    if (isEditing) {
      return (
        <input className="bt-cell-input" defaultValue={item[field]}
          autoFocus onBlur={e => updateItem(item.id, field, e.target.value)}
          onKeyDown={e => e.key === 'Enter' && updateItem(item.id, field, e.target.value)} />
      );
    }
    return (
      <span onClick={() => { setEditId(item.id); setEditField(field); }} className="bt-cell-value">
        {item[field]}
      </span>
    );
  };

  const sortArrow = (key) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div className="bt">
      <div className="bt-bar">
        <div className="bt-mode-switch">
          <button className={`bt-mode-btn${view === 'table' ? ' active' : ''}`} onClick={() => setView('table')}>Table</button>
          <button className={`bt-mode-btn${view === 'board' ? ' active' : ''}`} onClick={() => setView('board')}>Board</button>
        </div>
        <span className="bt-count">{items.length} items</span>
      </div>

      {view === 'table' ? (
        <div className="bt-table">
          <div className="bt-header">
            <span className="bt-hc" onClick={() => toggleSort('name')}>Name{sortArrow('name')}</span>
            <span className="bt-hc" onClick={() => toggleSort('status')}>Status{sortArrow('status')}</span>
            <span className="bt-hc" onClick={() => toggleSort('priority')}>Priority{sortArrow('priority')}</span>
            <span className="bt-hc" onClick={() => toggleSort('assignee')}>Assignee{sortArrow('assignee')}</span>
            <span className="bt-hc" onClick={() => toggleSort('due')}>Due{sortArrow('due')}</span>
          </div>
          {sorted.map(item => (
            <div key={item.id} className="bt-row">
              <span className="bt-cell">{renderCell(item, 'name')}</span>
              <span className="bt-cell">{renderCell(item, 'status')}</span>
              <span className="bt-cell">{renderCell(item, 'priority')}</span>
              <span className="bt-cell">{renderCell(item, 'assignee')}</span>
              <span className="bt-cell">{renderCell(item, 'due')}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bt-board">
          {COLUMNS.map(col => (
            <div key={col} className="bt-col">
              <div className="bt-col-header">
                <span className="bt-dot" style={{ background: '#3b82f6' }} />
                <span>{col}</span>
                <span className="bt-col-count">{items.filter(i => i.status === col).length}</span>
              </div>
              {items.filter(i => i.status === col).map(item => (
                <div key={item.id} className="bt-card">
                  <div className="bt-card-title">{item.name}</div>
                  <div className="bt-card-meta">
                    <span className={`bt-pr-${item.priority.toLowerCase()}`}>{item.priority}</span>
                    <span className="bt-card-assignee">{item.assignee}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
