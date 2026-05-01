import React, { useState } from 'react';

const INITIAL_TASKS = [
  { id: '1', title: 'Set up Gift Wrapper theme',    status: 'done',       priority: 'high',   assignee: 'A', due: '2026-05-05', notes: 'Flowbite dark mode palette configured.' },
  { id: '2', title: 'Integrate Vault browser',       status: 'in_progress',priority: 'high',   assignee: 'B', due: '2026-05-10', notes: 'Wire up VaultStorage API bridge.' },
  { id: '3', title: 'Build Kanban drag-drop',        status: 'in_progress',priority: 'medium', assignee: 'A', due: '2026-05-12', notes: 'react-dnd columns with card reordering.' },
  { id: '4', title: 'DocView split panel',           status: 'review',    priority: 'medium', assignee: 'C', due: '2026-05-08', notes: 'Typo-style editor + live preview.' },
  { id: '5', title: 'Reader prose layout',           status: 'review',    priority: 'low',    assignee: 'B', due: '', notes: 'Centred max-width with responsive levels.' },
  { id: '6', title: 'Monaspace font integration',    status: 'todo',      priority: 'low',    assignee: 'A', due: '', notes: 'Radon for editor, Argon for prose.' },
  { id: '7', title: 'Add vault file picker UI',      status: 'todo',      priority: 'medium', assignee: 'C', due: '2026-05-15', notes: 'Tree browser with folder navigation.' },
];

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#6b7280' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'review',      label: 'Review',      color: '#f59e0b' },
  { id: 'done',        label: 'Done',        color: '#10b981' },
];

const PRIORITY_ICONS = { high: '⬆', medium: '⬡', low: '⬇' };

export default function TaskView() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // board | table

  const updateTask = (id, updates) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
    if (selectedTask?.id === id) setSelectedTask(s => ({ ...s, ...updates }));
  };

  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (colId) => {
    if (!draggedTask) return;
    updateTask(draggedTask.id, { status: colId });
    setDraggedTask(null);
  };

  if (viewMode === 'table') {
    return (
      <div className="taskview-table-view">
        <div className="taskview-table-bar">
          <div className="taskview-mode-switch">
            <button className={`mode-btn${viewMode === 'board' ? ' active' : ''}`} onClick={() => setViewMode('board')}>Kanban</button>
            <button className={`mode-btn${viewMode === 'table' ? ' active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
          </div>
          <span className="taskview-count">{tasks.length} items</span>
        </div>
        <div className="notion-table">
          <div className="notion-table-header">
            <span className="nt-col nt-col-title">Title</span>
            <span className="nt-col">Status</span>
            <span className="nt-col">Priority</span>
            <span className="nt-col">Assignee</span>
            <span className="nt-col">Due</span>
          </div>
          {tasks.map(task => (
            <div key={task.id} className="notion-table-row" onClick={() => setSelectedTask(task)}>
              <span className="nt-col nt-col-title">{task.title}</span>
              <span className="nt-col"><span className="status-tag" style={{ background: COLUMNS.find(c => c.id === task.status)?.color + '33', color: COLUMNS.find(c => c.id === task.status)?.color }}>{COLUMNS.find(c => c.id === task.status)?.label}</span></span>
              <span className="nt-col">{PRIORITY_ICONS[task.priority]} {task.priority}</span>
              <span className="nt-col">{task.assignee}</span>
              <span className="nt-col">{task.due || '—'}</span>
            </div>
          ))}
        </div>
        {selectedTask && <TaskSidebar task={selectedTask} tasks={tasks} updateTask={updateTask} onClose={() => setSelectedTask(null)} />}
      </div>
    );
  }

  return (
    <div className="taskview">
      <div className="taskview-mode-bar">
        <div className="taskview-mode-switch">
          <button className={`mode-btn${viewMode === 'board' ? ' active' : ''}`} onClick={() => setViewMode('board')}>Kanban</button>
          <button className={`mode-btn${viewMode === 'table' ? ' active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
        </div>
        <span className="taskview-count">{tasks.length} items</span>
      </div>
      <div className="kanban">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="kanban-column" onDragOver={handleDragOver} onDrop={() => handleDrop(col.id)}>
              <div className="kanban-header">
                <span className="kanban-dot" style={{ background: col.color }} />
                <span className="kanban-col-label">{col.label}</span>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {colTasks.map(task => (
                  <div key={task.id} className={`kanban-card${selectedTask?.id === task.id ? ' selected' : ''}`} draggable onDragStart={() => handleDragStart(task)} onClick={() => setSelectedTask(task)}>
                    <div className="kanban-card-title">{task.title}</div>
                    <div className="kanban-card-meta">
                      <span className="kanban-priority">{PRIORITY_ICONS[task.priority]}</span>
                      {task.due && <span className="kanban-due">{task.due}</span>}
                      <span className="kanban-assignee">{task.assignee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {selectedTask && <TaskSidebar task={selectedTask} tasks={tasks} updateTask={updateTask} onClose={() => setSelectedTask(null)} />}
    </div>
  );
}

function TaskSidebar({ task, tasks, updateTask, onClose }) {
  return (
    <div className="task-sidebar">
      <div className="task-sidebar-header">
        <input className="task-sidebar-title" value={task.title} onChange={e => updateTask(task.id, { title: e.target.value })} />
        <button className="task-sidebar-close" onClick={onClose}>✕</button>
      </div>
      <div className="task-sidebar-body">
        <div className="prop-row">
          <span className="prop-label">Status</span>
          <select className="prop-select" value={task.status} onChange={e => updateTask(task.id, { status: e.target.value })}>
            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="prop-row">
          <span className="prop-label">Priority</span>
          <select className="prop-select" value={task.priority} onChange={e => updateTask(task.id, { priority: e.target.value })}>
            <option value="low">⬇ Low</option>
            <option value="medium">⬡ Medium</option>
            <option value="high">⬆ High</option>
          </select>
        </div>
        <div className="prop-row">
          <span className="prop-label">Assignee</span>
          <select className="prop-select" value={task.assignee} onChange={e => updateTask(task.id, { assignee: e.target.value })}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <div className="prop-row">
          <span className="prop-label">Due</span>
          <input className="prop-input" type="date" value={task.due} onChange={e => updateTask(task.id, { due: e.target.value })} />
        </div>
        <div className="prop-section">
          <span className="prop-label">Notes</span>
          <textarea className="prop-textarea" rows="6" value={task.notes} onChange={e => updateTask(task.id, { notes: e.target.value })} placeholder="Add notes..." />
        </div>
      </div>
    </div>
  );
}

