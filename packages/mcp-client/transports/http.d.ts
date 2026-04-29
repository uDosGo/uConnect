/**
 * uDos MCP Client - HTTP Transport
 *
 * HTTP/REST transport for browser and Node.js environments
 * Useful when connecting via mcp-gateway
 */
import { MCPMessage, MCPRequest, MCPResponse } from '../types';
import { Transport, TransportConfig, TransportEventListener } from './base';
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
export declare class HTTPTransport implements Transport {
    private config;
    private listeners;
    private pendingRequests;
    constructor(config: HTTPConfig);
    /**
     * Connect to the HTTP endpoint
     * For HTTP, this is mostly a no-op since each request is independent
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the HTTP endpoint
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected
     * For HTTP, we return true if the endpoint is reachable
     */
    isConnected(): boolean;
    /**
     * Send a message to the server
     * For HTTP transport, we use POST requests
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
     * Test connection to the endpoint
     */
    private testConnection;
    /**
     * Send HTTP request to the gateway
     */
    private sendHTTP;
}
