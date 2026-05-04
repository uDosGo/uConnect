import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './kanban.css';
import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: string;
  content: string;
  priority: string;
  status: string;
  column: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanSurface: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  useEffect(() => {
    // Load tasks from the local file
    fetch('/projects/active-board.json')
      .then((response) => response.json())
      .then((data: any) => {
        const initialColumns: Column[] = [
          { id: 'backlog', title: 'Backlog', tasks: [] },
          { id: 'in-progress', title: 'In Progress', tasks: [] },
          { id: 'review', title: 'Review', tasks: [] },
          { id: 'done', title: 'Done', tasks: [] },
        ];
        
        // Distribute tasks into columns
        data.tasks.forEach((task: Task) => {
          const column = initialColumns.find(c => c.id === task.column);
          if (column) {
            column.tasks.push(task);
          }
        });
        
        setColumns(initialColumns);
      });
  }, []);

  const addTask = () => {
    if (newTask.trim() === '') return;
    
    const newTaskObj: Task = {
      id: uuidv4(),
      content: newTask,
      priority: newPriority,
      status: 'pending',
      column: 'backlog',
    };
    
    setColumns(prevColumns => {
      const updatedColumns = [...prevColumns];
      const backlogColumn = updatedColumns.find(c => c.id === 'backlog');
      if (backlogColumn) {
        backlogColumn.tasks.push(newTaskObj);
      }
      return updatedColumns;
    });
    
    // Update the local file
    fetch('/projects/active-board.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'uDos Sprint',
        columns: ['backlog', 'in-progress', 'review', 'done'],
        tasks: [...columns[0]?.tasks || [], newTaskObj],
      }),
    });
    
    setNewTask('');
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
      }));
      
      // Save to local file
      fetch('/projects/active-board.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'uDos Sprint',
          columns: ['backlog', 'in-progress', 'review', 'done'],
          tasks: updatedColumns.flatMap(c => c.tasks),
        }),
      });
      
      return updatedColumns;
    });
  };

  const deleteTask = (taskId: string) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== taskId),
      }));
      
      // Save to local file
      fetch('/projects/active-board.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'uDos Sprint',
          columns: ['backlog', 'in-progress', 'review', 'done'],
          tasks: updatedColumns.flatMap(c => c.tasks),
        }),
      });
      
      return updatedColumns;
    });
  };

  const moveTask = (taskId: string, fromColumn: string, toColumn: string) => {
    setColumns(prevColumns => {
      const updatedColumns = [...prevColumns];
      
      // Find the task and move it
      let taskToMove: Task | null = null;
      let fromColumnIndex = updatedColumns.findIndex(c => c.id === fromColumn);
      
      if (fromColumnIndex !== -1) {
        const fromColumnTasks = updatedColumns[fromColumnIndex].tasks;
        const taskIndex = fromColumnTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          taskToMove = fromColumnTasks[taskIndex];
          updatedColumns[fromColumnIndex].tasks.splice(taskIndex, 1);
        }
      }
      
      if (taskToMove) {
        const toColumnIndex = updatedColumns.findIndex(c => c.id === toColumn);
        if (toColumnIndex !== -1) {
          updatedColumns[toColumnIndex].tasks.push({ ...taskToMove, column: toColumn });
        }
      }
      
      // Save to local file
      fetch('/projects/active-board.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'uDos Sprint',
          columns: ['backlog', 'in-progress', 'review', 'done'],
          tasks: updatedColumns.flatMap(c => c.tasks),
        }),
      });
      
      return updatedColumns;
    });
  };

  const TaskCard = ({ task, columnId }: { task: Task, columnId: string }) => {
    const [, drag] = useDrag({
      type: 'TASK',
      item: { taskId: task.id, fromColumn: columnId },
    });
    
    const [, drop] = useDrop({
      accept: 'TASK',
      drop: (item: { taskId: string, fromColumn: string }) => {
        if (item.fromColumn !== columnId) {
          moveTask(item.taskId, item.fromColumn, columnId);
        }
      },
    });
    
    return (
      <div ref={(node) => drag(drop(node))} className={`task-card ${task.priority}`}>
        <div className="task-content">{task.content}</div>
        <div className="task-actions">
          <button onClick={() => deleteTask(task.id)}>✕</button>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-container">
        <div className="kanban-header">
          <h1>Kanban Board</h1>
          <div className="task-input">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="New task..."
            />
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button onClick={addTask}>Add Task</button>
          </div>
        </div>
        <div className="kanban-columns">
          {columns.map((column) => (
            <div key={column.id} className="kanban-column">
              <div className="column-header">{column.title}</div>
              <div className="column-tasks">
                {column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} columnId={column.id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanSurface;