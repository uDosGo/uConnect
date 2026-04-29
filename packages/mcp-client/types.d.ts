/**
 * uDos MCP Client - Type Definitions
 *
 * Shared types for MCP protocol, vault operations, and chat enhancement
 */
/**
 * Base MCP Request
 * Sent from client to server
 */
export interface MCPRequest<T = any> {
    type: 'request';
    id: string;
    method: string;
    params?: T;
}
/**
 * Base MCP Response
 * Sent from server to client
 */
export interface MCPResponse<T = any> {
    type: 'response';
    id: string;
    result?: T;
    error?: MCPError;
}
/**
 * MCP Error
 */
export interface MCPError {
    code: number;
    message: string;
    data?: any;
}
/**
 * MCP Notification (server-initiated)
 */
export interface MCPNotification {
    type: 'notification';
    method: string;
    params?: any;
}
/**
 * Any MCP message (request, response, or notification)
 */
export type MCPMessage = MCPRequest | MCPResponse | MCPNotification;
/**
 * Vault file or directory item
 */
export interface VaultItem {
    name: string;
    is_directory: boolean;
    size?: number;
    modified?: string;
    path: string;
    tags?: string[];
}
/**
 * Result from vault search
 */
export interface VaultSearchResult {
    path: string;
    name: string;
    score: number;
    preview: string;
}
/**
 * Vault metadata
 */
export interface VaultMetadata {
    path: string;
    exists: boolean;
    is_directory: boolean;
    size?: number;
    created?: string;
    modified?: string;
    tags: string[];
}
/**
 * Parameters for vault list operation
 */
export interface VaultListParams {
    path?: string;
}
/**
 * Parameters for vault read operation
 */
export interface VaultReadParams {
    path: string;
}
/**
 * Parameters for vault write operation
 */
export interface VaultWriteParams {
    path: string;
    content: string;
}
/**
 * Parameters for vault search operation
 */
export interface VaultSearchParams {
    query: string;
    path?: string;
    limit?: number;
}
/**
 * Parameters for vault delete operation
 */
export interface VaultDeleteParams {
    path: string;
}
/**
 * Parameters for vault metadata operation
 */
export interface VaultMetadataParams {
    path: string;
}
/**
 * Basic chat message role
 */
export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'tool';
/**
 * Enhanced chat message with vault context
 */
export interface EnhancedChatMessage {
    role: ChatMessageRole;
    content: string;
    metadata?: ChatMessageMetadata;
}
/**
 * Metadata for enhanced chat messages
 */
export interface ChatMessageMetadata {
    /**
     * List of vault file paths referenced in this message
     */
    vaultReferences?: string[];
    /**
     * MCP tool calls made during message processing
     */
    toolCalls?: MCPRequest[];
    /**
     * Tool results from executed tool calls
     */
    toolResults?: MCPResponse[];
    /**
     * Timestamp of message creation
     */
    timestamp?: string;
    /**
     * Unique message identifier
     */
    id?: string;
    /**
     * Context used to enhance this message
     */
    context?: ChatContext;
}
/**
 * Context information for chat enhancement
 */
export interface ChatContext {
    /**
     * Vault files included as context
     */
    vaultFiles?: VaultItem[];
    /**
     * Snippets of vault content used
     */
    contentSnippets?: Map<string, string>;
    /**
     * Search queries that were executed
     */
    searchQueries?: string[];
    /**
     * User's current working directory in vault
     */
    currentPath?: string;
}
/**
 * Generic tool definition for MCP tool calling
 */
export interface MCPTool {
    name: string;
    description: string;
    parameters?: ToolParameterSchema;
}
/**
 * Tool parameter schema
 */
export interface ToolParameterSchema {
    type: 'object';
    properties?: Record<string, ToolParameter>;
    required?: string[];
}
/**
 * Individual tool parameter
 */
export interface ToolParameter {
    type: string;
    description?: string;
    default?: any;
    enum?: any[];
    items?: ToolParameter;
    properties?: Record<string, ToolParameter>;
}
/**
 * Tool call made by an LLM or client
 */
export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>;
}
/**
 * Result of a tool call
 */
export interface ToolResult {
    id: string;
    name: string;
    content: any;
    error?: string;
}
/**
 * Connection type enum
 */
export type ConnectionType = 'unix' | 'websocket' | 'http';
/**
 * MCP server configuration
 */
export interface MCPConfig {
    /**
     * Connection type: 'unix' for Electron/Node, 'websocket' for browser
     */
    type: ConnectionType;
    /**
     * Unix socket path (for type: 'unix')
     * @default ~/.local/share/udos/mcp/core.sock
     */
    socketPath?: string;
    /**
     * WebSocket URL (for type: 'websocket')
     * @default ws://localhost:30000
     */
    websocketUrl?: string;
    /**
     * HTTP endpoint (for type: 'http', used by mcp-gateway)
     * @default http://localhost:30000
     */
    httpEndpoint?: string;
    /**
     * Vault root path
     * @default ~/vault
     */
    vaultPath?: string;
    /**
     * Connection timeout in milliseconds
     * @default 5000
     */
    timeout?: number;
    /**
     * Whether to auto-reconnect on connection loss
     * @default true
     */
    autoReconnect?: boolean;
    /**
     * Reconnect delay in milliseconds
     * @default 1000
     */
    reconnectDelay?: number;
}
/**
 * Connection state
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
/**
 * Event types for MCP connection
 */
export type MCPEventType = 'connect' | 'disconnect' | 'error' | 'message' | 'notification' | 'stateChange';
/**
 * Event data for MCP connection events
 */
export interface MCPEvent {
    type: MCPEventType;
    timestamp: Date;
    data?: any;
    error?: Error;
}
/**
 * Event listener function
 */
export type MCPEventListener = (event: MCPEvent) => void;
/**
 * Options for chat enhancer
 */
export interface ChatEnhancerOptions {
    /**
     * Vault root path
     * @default ~/vault
     */
    vaultPath?: string;
    /**
     * Whether to automatically index/search vault for context
     * When false, only uses explicit mentions (Option 5)
     * When true, uses semantic search (Option 4)
     * @default false
     */
    autoIndex?: boolean;
    /**
     * Maximum number of context files to include
     * @default 3
     */
    maxContextFiles?: number;
    /**
     * Maximum length of context snippets (in characters)
     * @default 10000
     */
    maxContextLength?: number;
    /**
     * Custom patterns for mention detection
     */
    mentionPatterns?: MentionPatterns;
    /**
     * Whether to include file content in messages
     * @default true
     */
    includeFileContent?: boolean;
    /**
     * Prefix for injected vault content
     * @default '=== VAULT DOCUMENT: {path} ==='
     */
    contentPrefix?: string;
    /**
     * Whether to use tool calling if available
     * @default false
     */
    useToolCalling?: boolean;
}
/**
 * Patterns for detecting mentions in chat input
 */
export interface MentionPatterns {
    /**
     * Pattern for file mentions (e.g., @path/to/file.md)
     * @default /@([\w\-\/\.\s]+)/g
     */
    file?: RegExp;
    /**
     * Pattern for tag mentions (e.g., #tag)
     * @default /#([\w\-]+)/g
     */
    tag?: RegExp;
    /**
     * Pattern for binder/workspace mentions (e.g., @workspace/binder-name)
     * @default /@workspace\/([^\s]+)/g
     */
    binder?: RegExp;
    /**
     * Pattern for collection mentions (e.g., #collection)
     * @default /#collection\/([^\s]+)/g
     */
    collection?: RegExp;
}
/**
 * Result of mention extraction
 */
export interface ExtractedMention {
    type: 'file' | 'tag' | 'binder' | 'collection';
    raw: string;
    value: string;
    startIndex: number;
    endIndex: number;
}
/**
 * MCP server status information
 */
export interface MCPStatus {
    /**
     * Server version
     */
    version: string;
    /**
     * Current mode or state
     */
    mode: string;
    /**
     * Path to the vault
     */
    vaultPath: string;
    /**
     * Available tools/methods
     */
    tools?: string[];
    /**
     * Server uptime in milliseconds
     */
    uptime?: number;
}
/**
 * Health check response
 */
export interface HealthCheckResponse {
    healthy: boolean;
    timestamp: string;
    version?: string;
    issues?: string[];
}
/**
 * Generic JSON-RPC 2.0 request
 */
export interface JSONRPCRequest {
    jsonrpc: '2.0';
    method: string;
    params?: any;
    id: number | string;
}
/**
 * Generic JSON-RPC 2.0 response
 */
export interface JSONRPCResponse<T = any> {
    jsonrpc: '2.0';
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: number | string;
}
/**
 * Promisable result type
 */
export type Promisable<T> = T | Promise<T>;
/**
 * Callback type for async operations
 */
export type Callback<T> = (error?: Error | null, result?: T) => void;
