/**
 * VaultStorage — uDos vault filesystem bridge.
 * API endpoints served by the Vite dev server proxy.
 */
const API_BASE = '/api/vault';

async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`);
  if (!res.ok) throw new Error(`Vault API error: ${res.status}`);
  return res;
}

export async function listDir(path = '') {
  try {
    const res = await apiGet(`list?path=${encodeURIComponent(path)}`);
    return await res.json();
  } catch { return []; }
}

export async function readFile(path) {
  const res = await apiGet(`read?path=${encodeURIComponent(path)}`);
  return await res.text();
}

export async function writeFile(path, content) {
  const res = await fetch(`${API_BASE}/write`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  return res.ok;
}

export async function deleteFile(path) {
  const res = await apiGet(`delete?path=${encodeURIComponent(path)}`);
  return res.ok;
}
