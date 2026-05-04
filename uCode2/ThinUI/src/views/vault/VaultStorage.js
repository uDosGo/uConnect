/**
 * VaultStorage — uDos vault filesystem bridge.
 * API endpoints served by the Vite dev server proxy.
 */
const API_BASE = '/api/mcp'; // Using MCP Gateway

async function mcpCall(name, args = {}) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name, arguments: args },
      id: Date.now()
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result.content[0].text;
}

export async function listDir(path = '') {
  try {
    const res = await mcpCall('vault_list', { path });
    return JSON.parse(res);
  } catch { return []; }
}

export async function readFile(path) {
  return await mcpCall('vault_read', { path });
}

export async function writeFile(path, content) {
  try {
    await mcpCall('vault_write', { path, content });
    return true;
  } catch { return false; }
}

export async function deleteFile(path) {
  try {
    await mcpCall('vault_delete', { path });
    return true;
  } catch { return false; }
}
