/**
 * uDos MCP Client - Unix Socket Transport
 *
 * Unix domain socket transport for Electron/Node.js environments
 */
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
export declare class UnixSocketTransport implements Transport {
    private socket?;
    private config;
    private listeners;
    private reconnectTimeout;
    private reconnectAttempts;
    private static readonly MAX_RECONNECT_ATTEMPTS;
    private static readonly RECONNECT_DELAY;
    constructor(config: UnixSocketConfig);
    /**
     * Connect to the Unix socket
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the socket
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected
     */
    isConnected(): boolean;
    /**
     * Send a message to the server
     */
    send(message: MCPMessage): Promise<void>;
    /**
     * Send a request and wait for response
     */
    request<T>(request: MCPRequest): Promise<MCPResponse<T>>;
    /**
     * Add event listener
     */
    on(listener: TransportEventListener): () => void;
    /**
     * Remove event listener
     */
    off(listener: TransportEventListener): void;
    /**
     * Notify all listeners of an event
     */
    private notifier;
    /**
     * Handle incoming data (message framing)
     * Messages are newline-delimited JSON
     */
    private handleIncomingData;
    /**
     * Handle connection error
     */
    private handleConnectionError;
    /**
     * Handle connection close
     */
    private handleConnectionClose;
    /**
     * Schedule reconnection with exponential backoff
     */
    private scheduleReconnect;
    /**
     * Ensure socket path exists and is a valid socket
     */
    private ensureSocketPath;
}
