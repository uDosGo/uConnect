/**
 * VaultStorage — uDos vault filesystem bridge.
 *
 * Reads/writes JSON tasks, markdown docs, and UDX files
 * to ~/Code/Vault via the ThinUI Vite dev server API.
 *
 * In production (Tauri), this would use window.__TAURI__.invoke().
 */

const API_BASE = '/api/vault';

// ─── Helpers ───

function apiUrl(endpoint, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return `${API_BASE}/${endpoint}${qs ? '?' + qs : ''}`;
}

async function apiGet(endpoint, params = {}) {
  const res = await fetch(apiUrl(endpoint, params));
  if (!res.ok) throw new Error(`Vault API error: ${res.status}`);
  return res;
}

async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Vault API error: ${res.status}`);
  return res.json();
}

// ─── Tasks (stored as JSON in vault/.udx/tasks.json) ───

const TASKS_FILE = '.udx/tasks.json';

export async function loadTasks() {
  try {
    const res = await apiGet('read', { path: TASKS_FILE });
    return JSON.parse(await res.text());
  } catch {
    return { tasks: [], views: [], properties: [] };
  }
}

export async function saveTasks(data) {
  return apiPost('write', { path: TASKS_FILE, content: JSON.stringify(data, null, 2) });
}

// ─── Documents (stored as .md files in vault/docs/) ───

const DOCS_DIR = 'docs';

export async function listDocs() {
  try {
    const res = await apiGet('list', { path: DOCS_DIR });
    const items = await res.json();
    return items.filter(i => i.name.endsWith('.md'));
  } catch {
    return [];
  }
}

export async function readDoc(name) {
  const res = await apiGet('read', { path: `${DOCS_DIR}/${name}` });
  return await res.text();
}

export async function saveDoc(name, content) {
  return apiPost('write', { path: `${DOCS_DIR}/${name}`, content });
}

export async function deleteDoc(name) {
  return apiGet('delete', { path: `${DOCS_DIR}/${name}` });
}

// ─── UDX (dashboard files in vault/.udx/) ───

export async function listUDX() {
  try {
    const res = await apiGet('list', { path: '.udx' });
    const items = await res.json();
    return items.filter(i => i.name.endsWith('.udx'));
  } catch {
    return [];
  }
}

export async function readUDX(name) {
  const res = await apiGet('read', { path: `.udx/${name}` });
  return await res.text();
}
