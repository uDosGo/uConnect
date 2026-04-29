/**
 * uDos MCP Client - Main MCP Client Implementation
 *
 * Core MCP client class that manages connection, requests, and notifications
 */
import { MCPMessage, MCPResponse, MCPConfig, ConnectionState, MCPEventListener } from './types';
/**
 * Custom error class for MCP-related errors
 */
export declare class MCPClientError extends Error {
    readonly code: MCPErrorCode;
    readonly data?: any | undefined;
    readonly stackTrace?: string | undefined;
    constructor(code: MCPErrorCode, message: string, data?: any | undefined, stackTrace?: string | undefined);
}
/**
 * MCP error codes
 */
export declare enum MCPErrorCode {
    CONNECTION_FAILED = "CONNECTION_FAILED",
    TIMEOUT = "TIMEOUT",
    PROTOCOL_ERROR = "PROTOCOL_ERROR",
    INVALID_REQUEST = "INVALID_REQUEST",
    METHOD_NOT_FOUND = "METHOD_NOT_FOUND",
    INVALID_PARAMS = "INVALID_PARAMS",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    NOT_CONNECTED = "NOT_CONNECTED",
    ALREADY_CONNECTED = "ALREADY_CONNECTED"
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
 * Main MCP client class
 * Manages connection to MCP server and provides high-level API
 */
export declare class MCPClient {
    private transport;
    private config;
    private state;
    private eventListeners;
    private transportEventListener?;
    private requestIdCounter;
    constructor(config?: Partial<MCPConfig>);
    /**
     * Build configuration with defaults
     */
    private buildConfig;
    /**
     * Connect to the MCP server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the MCP server
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected to MCP server
     */
    isConnected(): boolean;
    /**
     * Check if currently connecting
     */
    isConnecting(): boolean;
    /**
     * Get current state
     */
    getState(): MCPClientState;
    /**
     * Send a raw MCP message
     */
    send(message: MCPMessage): Promise<void>;
    /**
     * Send a request and wait for response
     */
    request<T>(method: string, params?: any): Promise<MCPResponse<T>>;
    /**
     * Send a notification to the server
     */
    notify(method: string, params?: any): Promise<void>;
    /**
     * Add event listener
     */
    on(listener: MCPEventListener): () => void;
    /**
     * Remove event listener
     */
    off(listener: MCPEventListener): void;
    /**
     * Send a ping message to check connection
     */
    ping(): Promise<MCPResponse<void>>;
    /**
     * Get server status
     */
    getStatus(): Promise<any>;
    /**
     * List available tools from server
     */
    listTools(): Promise<MCPResponse<string[]>>;
    /**
     * Call a tool by name with arguments
     */
    callTool(name: string, args?: Record<string, any>): Promise<MCPResponse<any>>;
    /**
     * Generate a unique request ID
     */
    private generateRequestId;
    /**
     * Setup transport event listener
     */
    private setupTransportListener;
    /**
     * Handle incoming message from transport
     */
    private handleIncomingMessage;
    /**
     * Fetch server info on connection
     */
    private fetchServerInfo;
    /**
     * Update client state and emit state change event
     */
    private updateState;
    /**
     * Emit an event to all listeners
     */
    private emitEvent;
}
/**
 * Convenience function to create an MCP client with default configuration
 */
export declare function createMCPClient(config?: Partial<MCPConfig>): MCPClient;
/**
 * Convenience function to test MCP server connection
 */
export declare function testMCPConnection(config?: Partial<MCPConfig>): Promise<boolean>;
