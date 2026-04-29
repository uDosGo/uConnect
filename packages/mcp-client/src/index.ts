/**
 * uDos MCP Client - Entry Point
 *
 * Re-exports all public API from the MCP client package
 */

export {
  MCPClient,
  MCPClientError,
  MCPErrorCode,
  createMCPClient,
  testMCPConnection,
} from "./client";
export type { MCPClientState } from "./client";

export type {
  // MCP Protocol
  MCPRequest,
  MCPResponse,
  MCPError,
  MCPNotification,
  MCPMessage,

  // Vault types
  VaultItem,
  VaultSearchResult,
  VaultMetadata,
  VaultListParams,
  VaultReadParams,
  VaultWriteParams,
  VaultSearchParams,
  VaultDeleteParams,
  VaultMetadataParams,

  // Chat types
  ChatMessageRole,
  EnhancedChatMessage,
  ChatMessageMetadata,
  ChatContext,

  // Tool types
  MCPTool,
  ToolParameterSchema,
  ToolParameter,
  ToolCall,
  ToolResult,

  // Connection types
  ConnectionType,
  MCPConfig,
  ConnectionState,
  MCPEventType,
  MCPEvent,
  MCPEventListener,

  // Chat enhancer
  ChatEnhancerOptions,
  MentionPatterns,
  ExtractedMention,

  // Status
  MCPStatus,
  HealthCheckResponse,

  // JSON-RPC
  JSONRPCRequest,
  JSONRPCResponse,
} from "./types";
