/**
 * uDos MCP Client - HTTP Transport
 * 
 * HTTP/REST transport for browser and Node.js environments
 * Useful when connecting via mcp-gateway
 */

import { MCPMessage, MCPRequest, MCPResponse } from '../types';
import { Transport, TransportConfig, TransportEventListener, TransportEvent, TransportEventType } from './base';

/**
 * HTTP transport configuration
 */
export interface HTTPConfig extends TransportConfig {
  endpoint: string;
}

/**
 * HTTP transport implementation
 * Provides HTTP/REST-based communication with the MCP server via gateway
 */
export class HTTPTransport implements Transport {
  private config: HTTPConfig;
  private listeners: Set<TransportEventListener> = new Set();
  private pendingRequests: Map<string, { resolve: (r: MCPResponse<any>) => void; reject: (e: Error) => void; timeout: NodeJS.Timeout }> = new Map();

  constructor(config: HTTPConfig) {
    this.config = {
      timeout: 5000,
      maxReconnectDelay: 10000,
      ...config,
    };
  }

  /**
   * Connect to the HTTP endpoint
   * For HTTP, this is mostly a no-op since each request is independent
   */
  async connect(): Promise<void> {
    this.notifier('connect');
    // HTTP is connectionless, so we just test connectivity
    await this.testConnection();
  }

  /**
   * Disconnect from the HTTP endpoint
   */
  async disconnect(): Promise<void> {
    // Clear all pending requests
    for (const [, value] of this.pendingRequests) {
      clearTimeout(value.timeout);
      value.reject(new Error('Disconnected'));
    }
    this.pendingRequests.clear();
    
    this.notifier('disconnect');
  }

  /**
   * Check if connected
   * For HTTP, we return true if the endpoint is reachable
   */
  isConnected(): boolean {
    // HTTP is connectionless, so we assume connected if last request succeeded
    // In a real implementation, we might want to track this differently
    return true;
  }

  /**
   * Send a message to the server
   * For HTTP transport, we use POST requests
   */
  async send(message: MCPMessage): Promise<void> {
    // For HTTP transport, send is the same as request since we need to send and receive
    if (message.type !== 'request') {
      throw new Error('HTTP transport only supports request messages');
    }
    
    await this.sendHTTP(message);
  }

  /**
   * Send a request and wait for response
   */
  async request<T>(request: MCPRequest): Promise<MCPResponse<T>> {
    return this.sendHTTP<T>(request);
  }

  /**
   * Add event listener
   */
  on(listener: TransportEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Remove event listener
   */
  off(listener: TransportEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of an event
   */
  private notifier(type: TransportEventType, data?: any, error?: Error): void {
    const event: TransportEvent = { type, data, error, timestamp: new Date() };
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Transport listener error:', e);
      }
    });
  }

  /**
   * Test connection to the endpoint
   */
  private async testConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout || 5000),
      });
      
      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }
    } catch (error) {
      this.notifier('error', undefined, error as Error);
      throw error;
    }
  }

  /**
   * Send HTTP request to the gateway
   */
  private async sendHTTP<T>(request: MCPRequest): Promise<MCPResponse<T>> {
    // Determine if we're in Node.js or browser
    const isNode = typeof window === 'undefined';
    
    try {
      // Build the request body
      const body = JSON.stringify(request);
      
      // Use fetch API (works in both Node 18+ and browsers)
      const response = await fetch(`${this.config.endpoint}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body,
        signal: AbortSignal.timeout(this.config.timeout || 5000),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const responseBody = await response.json() as MCPResponse<T>;
      
      // For HTTP transport, we expect the response to be direct
      if (responseBody.type !== 'response') {
        throw new Error('Invalid response type from server');
      }
      
      if (responseBody.error) {
        throw new Error(responseBody.error.message);
      }
      
      return responseBody;
    } catch (error) {
      this.notifier('error', undefined, error as Error);
      throw error;
    }
  }
}
