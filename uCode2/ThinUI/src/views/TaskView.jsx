import { useState } from 'react';

const INITIAL_TASKS = [
  { id: '1', title: 'Set up Gift Wrapper theme',    status: 'done',       priority: 'high',   assignee: 'A', notes: 'Flowbite dark mode palette configured.' },
  { id: '2', title: 'Integrate Vault browser',       status: 'in_progress',priority: 'high',   assignee: 'B', notes: 'Wire up VaultStorage API bridge.' },
  { id: '3', title: 'Build Kanban drag-drop',        status: 'in_progress',priority: 'medium', assignee: 'A', notes: 'react-dnd columns with card reordering.' },
  { id: '4', title: 'DocView split panel',           status: 'review',    priority: 'medium', assignee: 'C', notes: 'Typo-style editor + live preview.' },
  { id: '5', title: 'Reader prose layout',           status: 'review',    priority: 'low',    assignee: 'B', notes: 'Centred max-width with responsive levels.' },
  { id: '6', title: 'Monaspace font integration',    status: 'todo',      priority: 'low',    assignee: 'A', notes: 'Radon for editor, Argon for prose.' },
  { id: '7', title: 'Add vault file picker UI',      status: 'todo',      priority: 'medium', assignee: 'C', notes: 'Tree browser with folder navigation.' },
];

const COLUMNS = [
  { id: 'todo',        label: 'To Do',    color: '#6b7280' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'review',      label: 'Review',   color: '#f59e0b' },
  { id: 'done',        label: 'Done',     color: '#10b981' },
];

export default function TaskView() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (colId) => {
    if (!draggedTask) return;
    setTasks(tasks.map(t => t.id === draggedTask.id ? { ...t, status: colId } : t));
    setDraggedTask(null);
  };

  return (
    <div className="taskview">
      <div className="kanban">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="kanban-header">
                <span className="kanban-dot" style={{ background: col.color }} />
                <span className="kanban-col-label">{col.label}</span>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className={`kanban-card${selectedTask?.id === task.id ? ' selected' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="kanban-card-title">{task.title}</div>
                    <div className="kanban-card-meta">
                      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                      <span className="kanban-card-assignee">{task.assignee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {selectedTask && (
        <div className="task-sidebar">
          <div className="task-sidebar-header">
            <input className="task-sidebar-title-input" value={selectedTask.title} onChange={e => {
              setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, title: e.target.value } : t));
              setSelectedTask({ ...selectedTask, title: e.target.value });
            }} />
            <button className="task-sidebar-close" onClick={() => setSelectedTask(null)}>✕</button>
          </div>
          <div className="task-sidebar-body">
            <div className="task-prop-row">
              <span className="task-prop-label">Status</span>
              <select className="task-prop-select" value={selectedTask.status} onChange={e => {
                const newStatus = e.target.value;
                setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: newStatus } : t));
                setSelectedTask({ ...selectedTask, status: newStatus });
              }}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="task-prop-row">
              <span className="task-prop-label">Priority</span>
              <select className="task-prop-select" value={selectedTask.priority}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="task-prop-row">
              <span className="task-prop-label">Assignee</span>
              <span className="task-prop-value">{selectedTask.assignee}</span>
            </div>
            <div className="task-prop-section">
              <label className="task-prop-label">Notes</label>
              <textarea className="task-notes-area" rows="6" value={selectedTask.notes} onChange={e => {
                setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, notes: e.target.value } : t));
                setSelectedTask({ ...selectedTask, notes: e.target.value });
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
