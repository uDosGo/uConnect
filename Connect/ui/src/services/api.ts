/* eslint-disable no-undef */
/**
 * uDOS Vault API Service
 * Centralized API service for interacting with the uDOS Vault
 * Note: This file uses browser APIs (WebSocket, fetch, localStorage, etc.)
 * which are globally available in browser environments.
 */

declare global {
  interface Window {
    WebSocket: typeof WebSocket;
    fetch: typeof fetch;
    localStorage: Storage;
    clearTimeout: typeof clearTimeout;
    setTimeout: typeof setTimeout;
    clearInterval: typeof clearInterval;
    File: typeof File;
    FormData: typeof FormData;
  }
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  tags: string[];
  notes: string;
  properties: Record<string, any>;
  attachments: Array<{
    id: string;
    name: string;
    path: string;
    type: string;
  }>;
  selected?: boolean;
}

const API_BASE_URL = 'http://localhost:5175/api';

const WS_BASE_URL = 'ws://localhost:5175';

// Real-time sync state
let socket: WebSocket | null = null;
let syncInterval: number | null = null;
// eslint-disable-next-line no-unused-vars
let syncCallbacks: Array<(tasks: Task[]) => void> = [];

/**
 * Fetch all tasks from the vault
const WS_BASE_URL = 'ws://localhost:5175';

// Real-time sync state
let socket: WebSocket | null = null;
let syncInterval: number | null = null;
let syncCallbacks: Array<(tasks: Task[]) => void> = [];

/**
 * Fetch all tasks from the vault
const WS_BASE_URL = 'ws://localhost:5175';

// Real-time sync state
let socket: WebSocket | null = null;
let syncInterval: number | null = null;
let syncCallbacks: Array<(tasks: Task[]) => void> = [];

/**
 * Fetch all tasks from the vault
 */
export async function getTasks(): Promise<Task[]> {
  try {
    // Try to fetch from actual API
    const response = await fetch(`${API_BASE_URL}/tasks`);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      // Fallback to mock data if API fails
      console.warn('Failed to fetch tasks from API, using mock data');
      return getMockTasks();
    }
  } catch (error) {
    console.error('API error:', error);
    return getMockTasks();
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string): Promise<Task | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    
    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
}

/**
 * Create a new task
 */
export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to create task');
    }
  } catch (error) {
    console.error('API error:', error);
    // Return a mock task with generated ID
    return {
      ...task,
      id: Date.now().toString(),
      attachments: task.attachments || [],
    };
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to update task');
    }
  } catch (error) {
    console.error('API error:', error);
    // Return optimistic update
    return {
      id,
      ...updates,
    } as Task;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
}

/**
 * Upload a file attachment
 */
export async function uploadAttachment(file: File, taskId: string): Promise<Task['attachments'][0]> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to upload attachment');
    }
  } catch (error) {
    console.error('API error:', error);
    // Return mock attachment
    return {
      id: Date.now().toString(),
      name: file.name,
      path: `/attachments/${taskId}/${file.name}`,
      type: file.type,
    };
  }
}

/**
 * Remove an attachment
 */
export async function removeAttachment(taskId: string, attachmentId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
}

/**
 * Real-time sync functionality
 */

export function setupRealTimeSync(callback: (tasks: Task[]) => void): () => void { // eslint-disable-line no-unused-vars
  syncCallbacks.push(callback);
  
  // Try WebSocket first
  try {
    socket = new WebSocket(`${WS_BASE_URL}/tasks/sync`);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'tasks_update') {
          syncCallbacks.forEach(cb => cb(data.tasks));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed, falling back to polling');
      startPolling();
    };
    
    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      socket = null;
      startPolling();
    };
    
    return () => {
      cleanupSync();
    };
  } catch (err) {
    console.warn('WebSocket not available, using polling:', err);
    startPolling();
    return () => {
      cleanupSync();
    };
  }
}

function startPolling() {
  if (syncInterval) return;
  
  syncInterval = window.setInterval(async () => {
    try {
      const tasks = await getTasks();
      syncCallbacks.forEach(cb => cb(tasks));
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, 15000); // Poll every 15 seconds
}

function cleanupSync() {
  if (socket) {
    socket.close();
    socket = null;
  }
  
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  syncCallbacks = syncCallbacks.filter(cb => cb !== callback);
}

/**
 * Mock data fallback
 */
function getMockTasks(): Task[] {
  return [
    {
      id: '1',
      title: 'Implement Task List View',
      status: 'in-progress',
      dueDate: '2026-04-20',
      tags: ['frontend', 'vue'],
      notes: 'Create a Notion-like table view for tasks',
      properties: {},
      attachments: [],
    },
    {
      id: '2',
      title: 'Add Inline Editing',
      status: 'todo',
      dueDate: '2026-04-21',
      tags: ['frontend', 'ux'],
      notes: 'Allow editing task fields directly in the table',
      properties: {},
      attachments: [],
    },
    {
      id: '3',
      title: 'Integrate with uDOS Vault',
      status: 'todo',
      dueDate: '2026-04-22',
      tags: ['backend', 'api'],
      properties: {},
      attachments: [],
    },
  ];
}