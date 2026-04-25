// src/mcpClient.ts
// MCP Client for ThinUI - connects directly to uCode1's MCP server via fetch

export async function callMcpTool(tool: string, args: any) {
  const res = await fetch(`http://localhost:3000/tools/${tool}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args }),
  });
  if (!res.ok) {
    throw new Error(`MCP tool ${tool} failed with status ${res.status}`);
  }
  return res.json();
}

export const sparkLaunch = (prompt: string) => 
  callMcpTool('spark_launch', { prompt });

export const createAgenticWorkflow = (description: string, repo: string) => 
  callMcpTool('agentic_workflow_create', { description, repo });

export const scheduleFlatData = (source: string, schedule: string) => 
  callMcpTool('flat_data_schedule', { source, schedule });

export const indexCopernicus = (repo: string) => 
  callMcpTool('copernicus_index', { repo });

export const discoverRepo = (repo: string) => 
  callMcpTool('discover_repo', { repo });

export const getSystemStatus = () => 
  callMcpTool('system_status', {});

export const listRegistry = () => 
  callMcpTool('registry_list', {});

export const runDoctor = () => 
  callMcpTool('doctor', {});

export const getConfig = (key: string) => 
  callMcpTool('config_get', { key });

export const setConfig = (key: string, value: any) => 
  callMcpTool('config_set', { key, value });
