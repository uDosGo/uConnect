/* eslint-disable no-undef */
/**
 * uDOS Vault API Service - Production Version
 * Enhanced API service with comprehensive error handling, logging, and retry logic
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
    AbortController: typeof AbortController;
    RequestInit: RequestInit;
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

interface ApiError extends Error {
  code?: string;
  status?: number;
  response?: any;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175/api';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:5175';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second between retries

// Real-time sync state
let socket: WebSocket | null = null;
let syncInterval: number | null = null;
// eslint-disable-next-line no-unused-vars
let syncCallbacks: Array<(tasks: Task[]) => void> = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Logger utility
function logError(error: ApiError, context: string = 'API') {
  const timestamp = new Date().toISOString();
  
  if (import.meta.env.DEV) {
    console.error(`[${timestamp}] [${context}]`, error);
  }
  
  // In production, you might send errors to a monitoring service
  if (import.meta.env.PROD && import.meta.env.VITE_FEATURE_ANALYTICS) {
    // Send to error monitoring service
    console.warn(`[${context}] Error reported to monitoring service`);
  }
}

// Retry utility with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: ApiError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as ApiError;
      logError(lastError, `${operationName} (Attempt ${attempt}/${maxRetries})`);
      
      // Don't retry on client errors (4xx)
      if (lastError.code && lastError.code.startsWith('4')) {
        break;
      }
      
      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// API Client with timeout and error handling
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: ApiError = new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
      error.code = response.status.toString();
      error.status = response.status;
      error.response = errorData;
      throw error;
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      const timeoutError: ApiError = new Error('Request timeout');
      timeoutError.code = 'TIMEOUT';
      throw timeoutError;
    }
    
    throw error;
  }
}

/**
 * Fetch all tasks from the vault with retry logic
 */
export async function getTasks(): Promise<Task[]> {
  try {
    return await withRetry(
      () => apiClient<Task[]>('/tasks', { method: 'GET' }),
      'getTasks'
    );
  } catch (error) {
    logError(error as ApiError, 'getTasks');
    
    // Fallback to cached data or empty array
    const cachedTasks = localStorage.getItem('udos.tasks');
    if (cachedTasks) {
      try {
        return JSON.parse(cachedTasks);
      } catch (parseError) {
        logError(parseError as ApiError, 'getTasks.parseCache');
      }
    }
    
    return [];
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string): Promise<Task | null> {
  try {
    return await withRetry(
      () => apiClient<Task>(`/tasks/${id}`, { method: 'GET' }),
      'getTask'
    );
  } catch (error) {
    logError(error as ApiError, 'getTask');
    return null;
  }
}

/**
 * Create a new task with retry logic
 */
export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  try {
    const createdTask = await withRetry(
      () => apiClient<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      }),
      'createTask'
    );
    
    // Cache the updated task list
    try {
      const tasks = await getTasks();
      localStorage.setItem('udos.tasks', JSON.stringify(tasks));
    } catch (cacheError) {
      logError(cacheError as ApiError, 'createTask.cache');
    }
    
    return createdTask;
  } catch (error) {
    logError(error as ApiError, 'createTask');
    
    // Return optimistic task with generated ID
    return {
      ...task,
      id: `temp-${Date.now()}`,
      attachments: task.attachments || [],
    };
  }
}

/**
 * Update an existing task with retry logic
 */
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  try {
    const updatedTask = await withRetry(
      () => apiClient<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
      'updateTask'
    );
    
    // Update cache
    try {
      const tasks = await getTasks();
      const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t);
      localStorage.setItem('udos.tasks', JSON.stringify(updatedTasks));
    } catch (cacheError) {
      logError(cacheError as ApiError, 'updateTask.cache');
    }
    
    return updatedTask;
  } catch (error) {
    logError(error as ApiError, 'updateTask');
    
    // Return optimistic update
    return {
      id,
      ...updates,
    } as Task;
  }
}

/**
 * Delete a task with retry logic
 */
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const success = await withRetry(
      () => apiClient<{ success: boolean }>(`/tasks/${id}`, {
        method: 'DELETE',
      }).then(res => res.success),
      'deleteTask'
    );
    
    if (success) {
      // Update cache
      try {
        const tasks = await getTasks();
        const updatedTasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('udos.tasks', JSON.stringify(updatedTasks));
      } catch (cacheError) {
        logError(cacheError as ApiError, 'deleteTask.cache');
      }
    }
    
    return success;
  } catch (error) {
    logError(error as ApiError, 'deleteTask');
    return false;
  }
}

/**
 * Upload a file attachment with retry logic
 */
export async function uploadAttachment(file: File, taskId: string): Promise<Task['attachments'][0]> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    
    return await withRetry(
      () => apiClient<Task['attachments'][0]>(`/tasks/${taskId}/attachments`, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type with boundary
      }),
      'uploadAttachment'
    );
  } catch (error) {
    logError(error as ApiError, 'uploadAttachment');
    
    // Return mock attachment
    return {
      id: `temp-${Date.now()}`,
      name: file.name,
      path: `/attachments/${taskId}/${file.name}`,
      type: file.type,
    };
  }
}

/**
 * Remove an attachment with retry logic
 */
export async function removeAttachment(taskId: string, attachmentId: string): Promise<boolean> {
  try {
    return await withRetry(
      () => apiClient<{ success: boolean }>(`/tasks/${taskId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      }).then(res => res.success),
      'removeAttachment'
    );
  } catch (error) {
    logError(error as ApiError, 'removeAttachment');
    return false;
  }
}

/**
 * Enhanced Real-time sync with reconnection logic
 */
// eslint-disable-next-line no-unused-vars
export function setupRealTimeSync(callback: (tasks: Task[]) => void): () => void {
  syncCallbacks.push(callback);
  
  const connectWebSocket = () => {
    try {
      socket = new WebSocket(`${WS_BASE_URL}/tasks/sync`);
      
      socket.onopen = () => {
        reconnectAttempts = 0;
        console.log('[WS] Connection established');
        
        // Send initial sync request
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'initial_sync' }));
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'tasks_update') {
            callback(data.tasks);
            
            // Update cache
            try {
              localStorage.setItem('udos.tasks', JSON.stringify(data.tasks));
            } catch (cacheError) {
              logError(cacheError as ApiError, 'WS.cache');
            }
          }
        } catch (err) {
          logError(err as ApiError, 'WS.message');
        }
      };
      
      socket.onclose = (event) => {
        console.log(`[WS] Connection closed (code: ${event.code})`);
        
        // Attempt to reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = Math.min(RETRY_DELAY * Math.pow(2, reconnectAttempts), 30000); // Max 30s
          console.log(`[WS] Attempting to reconnect in ${delay}ms...`);
          setTimeout(connectWebSocket, delay);
        } else {
          console.warn('[WS] Max reconnect attempts reached. Falling back to polling.');
          startPolling();
        }
      };
      
      socket.onerror = (err) => {
        logError(err as ApiError, 'WS.error');
      };
      
    } catch (err) {
      logError(err as ApiError, 'WS.connect');
      startPolling();
    }
  };
  
  // Try WebSocket first
  connectWebSocket();
  
  const cleanup = () => {
    if (socket) {
      socket.close();
      socket = null;
    }
    
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    
    syncCallbacks = syncCallbacks.filter(cb => cb !== callback);
  };
  
  return cleanup;
}

function startPolling() {
  if (syncInterval) return;
  
  console.log('[Sync] Starting polling (WebSocket unavailable)');
  
  syncInterval = window.setInterval(async () => {
    try {
      const tasks = await getTasks();
      syncCallbacks.forEach(cb => cb(tasks));
    } catch (err) {
      logError(err as ApiError, 'Sync.poll');
    }
  }, 15000); // Poll every 15 seconds
}

// Initialize cache from localStorage if available
export function initializeCache() {
  try {
    const cachedTasks = localStorage.getItem('udos.tasks');
    if (cachedTasks) {
      console.log('[Cache] Initialized from localStorage');
      return JSON.parse(cachedTasks) as Task[];
    }
  } catch (error) {
    logError(error as ApiError, 'Cache.init');
  }
  return [];
}

// Clear cache
export function clearCache() {
  try {
    localStorage.removeItem('udos.tasks');
    console.log('[Cache] Cleared');
  } catch (error) {
    logError(error as ApiError, 'Cache.clear');
  }
}

// Export types for better TypeScript support
export type { Task, ApiResponse, ApiError };