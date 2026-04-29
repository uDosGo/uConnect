/**
 * uDos MCP Client - WebSocket Transport
 * 
 * WebSocket transport for browser and Node.js environments
 */

import { WebSocket as WS } from 'ws';
import { MCPMessage, MCPRequest, MCPResponse } from '../types';
import { Transport, TransportConfig, TransportEventListener, TransportEvent, TransportEventType } from './base';

/**
 * WebSocket transport configuration
 */
export interface WebSocketConfig extends TransportConfig {
  url: string;
}

/**
 * WebSocket transport implementation
 * Provides WebSocket-based communication with the MCP server
 */
export class WebSocketTransport implements Transport {
  private socket?: WS;
  private config: WebSocketConfig;
  private listeners: Set<TransportEventListener> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private static readonly MAX_RECONNECT_ATTEMPTS = 5;
  private static readonly RECONNECT_DELAY = 1000; // ms
  private pendingRequests: Map<string, { resolve: (r: MCPResponse<any>) => void; reject: (e: Error) => void; timeout: NodeJS.Timeout }> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnect: true,
      maxReconnectDelay: 10000,
      timeout: 5000,
      ...config,
    };
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket && this.socket.readyState === WS.OPEN) {
      // Already connected
      return;
    }

    return new Promise((resolve, reject) => {
      this.notifier('connect' as any);

      const sock = new WS(this.config.url);

      sock.on('open', () => {
        this.socket = sock;
        this.reconnectAttempts = 0;
        this.notifier('connect');
        resolve();
      });

      sock.on('error', (error) => {
        this.handleConnectionError(error, reject);
      });

      sock.on('close', () => {
        this.handleConnectionClose();
      });

      sock.on('message', (data) => {
        this.handleIncomingData(data);
      });

      // Setup ping/pong for keepalive
      sock.on('ping', () => {
        if (sock.readyState === WS.OPEN) {
          sock.pong();
        }
      });

      // Set up connection timeout
      const timeout = setTimeout(() => {
        sock.terminate();
        reject(new Error('WebSocket connection timeout'));
      }, this.config.timeout);

      sock.once('open', () => clearTimeout(timeout));
      sock.once('error', () => clearTimeout(timeout));
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Clear all pending requests
    for (const [, value] of this.pendingRequests) {
      clearTimeout(value.timeout);
      value.reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();

    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }

    this.notifier('disconnect');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket !== undefined && this.socket.readyState === WS.OPEN;
  }

  /**
   * Send a message to the server
   */
  async send(message: MCPMessage): Promise<void> {
    if (!this.socket || this.socket.readyState !== WS.OPEN) {
      throw new Error('Not connected to WebSocket');
    }

    return new Promise((resolve, reject) => {
      const messageStr = JSON.stringify(message) + '\n';
      this.socket!.send(messageStr, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Send a request and wait for response
   */
  async request<T>(request: MCPRequest): Promise<MCPResponse<T>> {
    if (!this.socket || this.socket.readyState !== WS.OPEN) {
      throw new Error('Not connected to WebSocket');
    }

    // Send the request
    await this.send(request);

    // Wait for response with matching id
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error(`Request timeout: ${request.method}`));
      }, this.config.timeout || 5000);

      this.pendingRequests.set(request.id, {
        resolve: resolve as (r: MCPResponse<any>) => void,
        reject,
        timeout,
      });
    });
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
  private notifier(type: 'connect' | 'disconnect' | 'error' | 'message', data?: any, error?: Error): void {
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
   * Handle incoming data (message framing)
   * Messages are newline-delimited JSON
   */
  private handleIncomingData(data: any): void {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data as string, 'utf8');
    let offset = 0;
    
    while (offset < buffer.length) {
      // Find the next newline
      const newlineIndex = buffer.indexOf('\n', offset);
      
      if (newlineIndex === -1) {
        // No complete message yet
        break;
      }

      // Extract complete message
      const messageStr = buffer.subarray(offset, newlineIndex).toString('utf8');
      offset = newlineIndex + 1;

      if (messageStr.trim()) {
        try {
          const message: MCPMessage = JSON.parse(messageStr);
          
          // Check if this is a response to a pending request
          if (message.type === 'response') {
            const response = message as MCPResponse<any>;
            const pending = this.pendingRequests.get(response.id);
            if (pending) {
              clearTimeout(pending.timeout);
              this.pendingRequests.delete(response.id);
              if (response.error) {
                pending.reject(new Error(response.error.message));
              } else {
                pending.resolve(response as any);
              }
              continue; // Don't propagate response events to listeners
            }
          }

          // Notify listeners
          this.notifier('message', message);
        } catch (e) {
          console.error('Failed to parse MCP message:', e, messageStr);
        }
      }
    }
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(error: Error, reject: (e: Error) => void): void {
    this.notifier('error', undefined, error);
    
    if (this.config.reconnect && this.reconnectAttempts < WebSocketTransport.MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    }

    reject(error);
  }

  /**
   * Handle connection close
   */
  private handleConnectionClose(): void {
    this.notifier('disconnect');
    
    // Clear all pending requests
    for (const [, value] of this.pendingRequests) {
      clearTimeout(value.timeout);
      value.reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();
    
    if (this.config.reconnect && this.reconnectAttempts < WebSocketTransport.MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    }

    this.socket = undefined;
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      WebSocketTransport.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      this.config.maxReconnectDelay || 10000
    );

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect();
      } catch (e) {
        // Error is already handled in handleConnectionError
      }
    }, delay);
  }
}
