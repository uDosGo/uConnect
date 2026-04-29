/**
 * uDos MCP Client - Main MCP Client Implementation
 * 
 * Core MCP client class that manages connection, requests, and notifications
 */

import { MCPMessage, MCPRequest, MCPResponse, MCPNotification, MCPError, MCPConfig, ConnectionState, MCPEvent, MCPEventListener } from './types';
import { Transport, TransportConfig, TransportEvent, TransportEventType } from './transports/base';
import { UnixSocketTransport, UnixSocketConfig } from './transports/unixSocket';
import { WebSocketTransport, WebSocketConfig } from './transports/webSocket';
import { HTTPTransport, HTTPConfig } from './transports/http';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom error class for MCP-related errors
 */
export class MCPClientError extends Error {
  constructor(
    public readonly code: MCPErrorCode,
    message: string,
    public readonly data?: any,
    public readonly stackTrace?: string
  ) {
    super(message);
    this.name = 'MCPClientError';
    if (stackTrace) {
      this.stack = stackTrace;
    }
  }
}

/**
 * MCP error codes
 */
export enum MCPErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  PROTOCOL_ERROR = 'PROTOCOL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  INVALID_PARAMS = 'INVALID_PARAMS',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_CONNECTED = 'NOT_CONNECTED',
  ALREADY_CONNECTED = 'ALREADY_CONNECTED',
}

/**
 * MCP client state
 */
export interface MCPClientState {
  /**
   * Current connection state
   */
  connectionState: ConnectionState;
  
  /**
   * Server version info
   */
  serverVersion?: string;
  
  /**
   * Available tools from server
   */
  availableTools: string[];
  
  /**
   * Last error
   */
  lastError?: Error;
  
  /**
   * Connection timestamp
   */
  connectedAt?: Date;
}

/**
 * Create transport based on configuration
 */
function createTransport(config: MCPConfig): Transport {
  switch (config.type) {
    case 'unix':
      return new UnixSocketTransport({
        socketPath: config.socketPath || '~/.local/share/udos/mcp/core.sock',
        timeout: config.timeout,
        reconnect: config.autoReconnect,
        maxReconnectDelay: config.reconnectDelay,
      } as UnixSocketConfig);
    
    case 'websocket':
      return new WebSocketTransport({
        url: config.websocketUrl || 'ws://localhost:30000',
        timeout: config.timeout,
        reconnect: config.autoReconnect,
        maxReconnectDelay: config.reconnectDelay,
      } as WebSocketConfig);
    
    case 'http':
      return new HTTPTransport({
        endpoint: config.httpEndpoint || 'http://localhost:30000',
        timeout: config.timeout,
      } as HTTPConfig);
    
    default:
      // Default to unix socket for Electron/Node environments
      return new UnixSocketTransport({
        socketPath: '~/.local/share/udos/mcp/core.sock',
        timeout: config.timeout,
        reconnect: config.autoReconnect,
        maxReconnectDelay: config.reconnectDelay,
      } as UnixSocketConfig);
  }
}

/**
 * Main MCP client class
 * Manages connection to MCP server and provides high-level API
 */
export class MCPClient {
  private transport: Transport;
  private config: MCPConfig;
  private state: MCPClientState;
  private eventListeners: Set<MCPEventListener> = new Set();
  private transportEventListener?: () => void;
  private requestIdCounter = 0;

  constructor(config: Partial<MCPConfig> = {}) {
    // Build configuration with defaults
    this.config = this.buildConfig(config);
    this.transport = createTransport(this.config);
    
    this.state = {
      connectionState: 'disconnected',
      availableTools: [],
    };
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(partial: Partial<MCPConfig>): MCPConfig {
    return {
      type: 'unix',
      socketPath: '~/.local/mcp.sock',
      vaultPath: '~/vault',
      timeout: 5000,
      autoReconnect: true,
      reconnectDelay: 1000,
      ...partial,
    };
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    if (this.state.connectionState === 'connected') {
      throw new MCPClientError(
        MCPErrorCode.ALREADY_CONNECTED,
        'Already connected to MCP server'
      );
    }

    this.updateState('connecting');

    try {
      await this.transport.connect();
      this.updateState('connected', new Date());
      
      // Setup transport event listener
      this.setupTransportListener();
      
      // Optionally: Get server status and available tools
      try {
        await this.fetchServerInfo();
      } catch (e) {
        // Non-fatal error - server might not support info endpoint
        console.debug('Could not fetch server info:', e);
      }
    } catch (error) {
      this.updateState('error', undefined, error as Error);
      throw new MCPClientError(
        MCPErrorCode.CONNECTION_FAILED,
        `Connection failed: ${error}`,
        undefined,
        (error as Error).stack
      );
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    // Cleanup transport listener
    if (this.transportEventListener) {
      this.transportEventListener();
      this.transportEventListener = undefined;
    }

    await this.transport.disconnect();
    this.updateState('disconnected');
  }

  /**
   * Check if connected to MCP server
   */
  isConnected(): boolean {
    return this.state.connectionState === 'connected' && this.transport.isConnected();
  }

  /**
   * Check if currently connecting
   */
  isConnecting(): boolean {
    return this.state.connectionState === 'connecting';
  }

  /**
   * Get current state
   */
  getState(): MCPClientState {
    return { ...this.state };
  }

  /**
   * Send a raw MCP message
   */
  async send(message: MCPMessage): Promise<void> {
    if (!this.isConnected()) {
      throw new MCPClientError(
        MCPErrorCode.NOT_CONNECTED,
        'Not connected to MCP server'
      );
    }

    await this.transport.send(message);
  }

  /**
   * Send a request and wait for response
   */
  async request<T>(method: string, params?: any): Promise<MCPResponse<T>> {
    if (!this.isConnected()) {
      throw new MCPClientError(
        MCPErrorCode.NOT_CONNECTED,
        'Not connected to MCP server'
      );
    }

    // Create request with unique ID
    const requestId = this.generateRequestId();
    const request: MCPRequest = {
      type: 'request',
      id: requestId,
      method,
      params,
    };

    try {
      return await this.transport.request<T>(request);
    } catch (error) {
      throw new MCPClientError(
        MCPErrorCode.INTERNAL_ERROR,
        `Request failed for ${method}: ${error}`,
        undefined,
        (error as Error).stack
      );
    }
  }

  /**
   * Send a notification to the server
   */
  async notify(method: string, params?: any): Promise<void> {
    if (!this.isConnected()) {
      throw new MCPClientError(
        MCPErrorCode.NOT_CONNECTED,
        'Not connected to MCP server'
      );
    }

    const notification: MCPNotification = {
      type: 'notification',
      method,
      params,
    };

    await this.transport.send(notification);
  }

  /**
   * Add event listener
   */
  on(listener: MCPEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Remove event listener
   */
  off(listener: MCPEventListener): void {
    this.eventListeners.delete(listener);
  }

  /**
   * Send a ping message to check connection
   */
  async ping(): Promise<MCPResponse<void>> {
    return this.request<void>('Ping', null);
  }

  /**
   * Get server status
   */
  async getStatus(): Promise<any> {
    return this.request<any>('Status', null);
  }

  /**
   * List available tools from server
   */
  async listTools(): Promise<MCPResponse<string[]>> {
    return this.request<string[]>('tools/list', null);
  }

  /**
   * Call a tool by name with arguments
   */
  async callTool(name: string, args: Record<string, any> = {}): Promise<MCPResponse<any>> {
    return this.request<any>('tools/call', {
      name,
      arguments: args,
    });
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    this.requestIdCounter++;
    return uuidv4();
  }

  /**
   * Setup transport event listener
   */
  private setupTransportListener(): void {
    if (this.transportEventListener) {
      this.transportEventListener();
    }

    this.transportEventListener = this.transport.on((event: TransportEvent) => {
      switch (event.type) {
        case 'connect':
          this.updateState('connected', new Date());
          this.emitEvent('connect');
          break;
        
        case 'disconnect':
          this.updateState('disconnected');
          this.emitEvent('disconnect');
          break;
        
        case 'error':
          if (event.error) {
            this.updateState('error', undefined, event.error);
            this.emitEvent('error', undefined, event.error);
          }
          break;
        
        case 'message':
          this.handleIncomingMessage(event.data);
          break;
      }
    });
  }

  /**
   * Handle incoming message from transport
   */
  private handleIncomingMessage(message: MCPMessage): void {
    switch (message.type) {
      case 'response':
        // Responses are handled by the transport's request method
        // and don't need to be propagated
        break;
      
      case 'notification':
        const notification = message as MCPNotification;
        this.emitEvent('notification', {
          method: notification.method,
          params: notification.params,
        });
        break;
    }
  }

  /**
   * Fetch server info on connection
   */
  private async fetchServerInfo(): Promise<void> {
    try {
      // Try to get status which may include version and tools
      const status = await this.getStatus();
      if (status.result) {
        this.state.serverVersion = status.result.version || this.state.serverVersion;
        if (status.result.tools) {
          this.state.availableTools = status.result.tools;
        }
      }
    } catch (e) {
      // Ignore - server might not support status endpoint
    }

    try {
      // Try to list tools
      const tools = await this.listTools();
      if (tools.result) {
        this.state.availableTools = tools.result;
      }
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Update client state and emit state change event
   */
  private updateState(
    connectionState: ConnectionState,
    connectedAt?: Date,
    error?: Error
  ): void {
    const previousState = this.state.connectionState;
    this.state.connectionState = connectionState;
    this.state.lastError = error;
    
    if (connectedAt) {
      this.state.connectedAt = connectedAt;
    }

    // Emit state change event if state actually changed
    if (previousState !== connectionState) {
      this.emitEvent('stateChange', { oldState: previousState, newState: connectionState });
    }

    // Also emit error event if there's an error
    if (error && connectionState === 'error') {
      this.emitEvent('error', undefined, error);
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emitEvent(type: MCPEvent['type'], data?: MCPEvent['data'], error?: Error): void {
    const event: MCPEvent = {
      type,
      timestamp: new Date(),
      data,
      error,
    };

    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('MCP client listener error:', e);
      }
    });
  }
}

/**
 * Convenience function to create an MCP client with default configuration
 */
export function createMCPClient(config?: Partial<MCPConfig>): MCPClient {
  return new MCPClient(config);
}

/**
 * Convenience function to test MCP server connection
 */
export async function testMCPConnection(config?: Partial<MCPConfig>): Promise<boolean> {
  const client = new MCPClient(config);
  
  try {
    await client.connect();
    const status = await client.ping();
    await client.disconnect();
    return true;
  } catch (e) {
    return false;
  }
}
