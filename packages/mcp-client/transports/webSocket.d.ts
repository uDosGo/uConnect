/**
 * uDos MCP Client - WebSocket Transport
 *
 * WebSocket transport for browser and Node.js environments
 */
import { MCPMessage, MCPRequest, MCPResponse } from '../types';
import { Transport, TransportConfig, TransportEventListener } from './base';
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
export declare class WebSocketTransport implements Transport {
    private socket?;
    private config;
    private listeners;
    private reconnectTimeout;
    private reconnectAttempts;
    private static readonly MAX_RECONNECT_ATTEMPTS;
    private static readonly RECONNECT_DELAY;
    private pendingRequests;
    constructor(config: WebSocketConfig);
    /**
     * Connect to the WebSocket server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the WebSocket server
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
}
