// src/mcpClient.ts
// MCP Client for ThinUI - connects to uCode1's MCP server

import { invoke } from '@tauri-apps/api/core';

interface McpResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Plugin {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface SystemStatus {
  vault: string;
  mcpServer: string;
  plugins: string;
}

class McpClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  private async callMcpTool<T>(tool: string, params: any = {}): Promise<McpResponse<T>> {
    try {
      // Use Tauri's invoke to call the Rust backend
      // The Rust backend will forward the request to uCode1's MCP server
      const result = await invoke('call_mcp_tool', {
        tool,
        params,
      });
      
      return {
        success: true,
        data: result as T,
      };
    } catch (error) {
      console.error(`MCP tool ${tool} failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getPlugins(): Promise<McpResponse<Plugin[]>> {
    return this.callMcpTool<Plugin[]>('plugin_list');
  }

  async getSystemStatus(): Promise<McpResponse<SystemStatus>> {
    return this.callMcpTool<SystemStatus>('system_status');
  }

  async createAgenticWorkflow(repo: string, name: string, description: string): Promise<McpResponse<{ success: boolean }>> {
    return this.callMcpTool<{ success: boolean }>('agentic_workflow_create', {
      repo,
      name,
      description,
    });
  }

  async scheduleFlatData(repo: string, url: string, schedule: string, destination: string): Promise<McpResponse<{ success: boolean }>> {
    return this.callMcpTool<{ success: boolean }>('flat_data_schedule', {
      repo,
      url,
      schedule,
      destination,
    });
  }

  async launchSpark(prompt: string): Promise<McpResponse<{ previewUrl: string }>> {
    return this.callMcpTool<{ previewUrl: string }>('spark_launch', {
      prompt,
    });
  }

  async createCopernicusIndex(repoUrl: string, indexPath: string): Promise<McpResponse<{ success: boolean; indexPath: string }>> {
    return this.callMcpTool<{ success: boolean; indexPath: string }>('copernicus_index', {
      repoUrl,
      indexPath,
    });
  }

  async discoverRepo(repoUrl: string): Promise<McpResponse<{ success: boolean; logs: string }>> {
    return this.callMcpTool<{ success: boolean; logs: string }>('discover_repo', {
      repoUrl,
    });
  }
}

export const mcpClient = new McpClient();

export default McpClient;
