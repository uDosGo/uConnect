/**
 * uDos MCP Client - Transport Base Interface
 *
 * Common interface for all transport implementations
 */
import { MCPMessage, MCPRequest, MCPResponse } from '../types';
/**
 * Base transport configuration
 */
export interface TransportConfig {
    /**
     * Connection timeout in milliseconds
     * @default 5000
     */
    timeout?: number;
    /**
     * Whether to auto-reconnect on connection loss
     * @default true
     */
    reconnect?: boolean;
    /**
     * Maximum reconnect delay in milliseconds
     * @default 10000
     */
    maxReconnectDelay?: number;
}
/**
 * Transport event types
 */
export type TransportEventType = 'connect' | 'disconnect' | 'error' | 'message';
/**
 * Transport event
 */
export interface TransportEvent {
    type: TransportEventType;
    timestamp: Date;
    data?: any;
    error?: Error;
}
/**
 * Transport event listener
 */
export type TransportEventListener = (event: TransportEvent) => void;
/**
 * Base transport interface
 * All transport implementations must implement this interface
 */
export interface Transport {
    /**
     * Connect to the server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the server
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
     * Send a request and wait for the response
     */
    request<T>(request: MCPRequest): Promise<MCPResponse<T>>;
    /**
     * Add an event listener
     * Returns a function to remove the listener
     */
    on(listener: TransportEventListener): () => void;
    /**
     * Remove an event listener
     */
    off(listener: TransportEventListener): void;
}
