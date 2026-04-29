/**
 * uDos MCP Client - Unix Socket Transport
 * 
 * Unix domain socket transport for Electron/Node.js environments
 */

import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MCPMessage, MCPRequest, MCPResponse } from '../types';
import { Transport, TransportConfig, TransportEventListener } from './base';

/**
 * Unix socket transport configuration
 */
export interface UnixSocketConfig extends TransportConfig {
  socketPath: string;
}

/**
 * Unix socket transport implementation
 * Provides bidirectional communication over a Unix domain socket
 */
export class UnixSocketTransport implements Transport {
  private socket?: net.Socket;
  private config: UnixSocketConfig;
  private listeners: Set<TransportEventListener> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private static readonly MAX_RECONNECT_ATTEMPTS = 5;
  private static readonly RECONNECT_DELAY = 1000; // ms

  constructor(config: UnixSocketConfig) {
    this.config = {
      reconnect: true,
      maxReconnectDelay: 10000,
      ...config,
    };
  }

  /**
   * Connect to the Unix socket
   */
  async connect(): Promise<void> {
    if (this.socket && !this.socket.destroyed) {
      // Already connected
      return;
    }

    // Ensure socket path exists and is valid
    this.ensureSocketPath();

    return new Promise((resolve, reject) => {
      this.notifier('connect' as any);

      const sock = net.createConnection(this.config.socketPath, () => {
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

      sock.on('end', () => {
        this.handleConnectionClose();
      });

      // Set timeout
      sock.setTimeout(this.config.timeout || 5000, () => {
        sock.destroy(new Error('Connection timeout'));
      });

      // Setup data handler
      let buffer = Buffer.alloc(0);
      sock.on('data', (data) => {
        buffer = Buffer.concat([buffer, data]);
        this.handleIncomingData(buffer);
      });
    });
  }

  /**
   * Disconnect from the socket
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.destroy();
      this.socket = undefined;
    }

    this.notifier('disconnect');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket !== undefined && !this.socket.destroyed;
  }

  /**
   * Send a message to the server
   */
  async send(message: MCPMessage): Promise<void> {
    if (!this.socket || this.socket.destroyed) {
      throw new Error('Not connected to socket');
    }

    return new Promise((resolve, reject) => {
      const messageStr = JSON.stringify(message) + '\n';
      this.socket!.write(messageStr, 'utf8', (error) => {
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
    if (!this.socket || this.socket.destroyed) {
      throw new Error('Not connected to socket');
    }

    // Send the request
    await this.send(request);

    // Wait for response with matching id
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout: ${request.method}`));
      }, this.config.timeout || 5000);

      const listener: TransportEventListener = (event) => {
        if (event.type === 'message' && (event as any).message.type === 'response') {
          const response = (event as any).message as MCPResponse<T>;
          if (response.id === request.id) {
            clearTimeout(timeout);
            this.listeners.delete(listener);
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response);
            }
          }
        }
      };

      this.listeners.add(listener);
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
    const event = { type, data, error, timestamp: new Date() };
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
  private handleIncomingData(buffer: Buffer): void {
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
          this.notifier('message', message as any);
        } catch (e) {
          console.error('Failed to parse MCP message:', e, messageStr);
        }
      }
    }

    // Keep remaining incomplete data
    if (offset > 0 && offset < buffer.length) {
      const remaining = buffer.subarray(offset);
      // Reset buffer with remaining data
      // Note: This is simplified - in production, we'd need to maintain state
    }
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(error: Error, reject: (e: Error) => void): void {
    this.notifier('error', undefined, error);
    
    if (this.config.reconnect && this.reconnectAttempts < UnixSocketTransport.MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    }

    reject(error);
  }

  /**
   * Handle connection close
   */
  private handleConnectionClose(): void {
    this.notifier('disconnect');
    
    if (this.config.reconnect && this.reconnectAttempts < UnixSocketTransport.MAX_RECONNECT_ATTEMPTS) {
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
      UnixSocketTransport.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
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

  /**
   * Ensure socket path exists and is a valid socket
   */
  private ensureSocketPath(): void {
    const socketPath = this.config.socketPath;
    
    // Expand ~ in path
    const expandedPath = socketPath.replace(/^~/, os.homedir());
    
    // Check if socket file exists
    if (!fs.existsSync(expandedPath)) {
      // Try to create parent directory if it doesn't exist
      const dir = path.dirname(expandedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Update config with expanded path
    this.config.socketPath = expandedPath;
  }
}
