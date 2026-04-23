/**
 * WordPress Integration Types
 * Type definitions for WP user synchronization
 */

export interface WpUser {
  ID: number;
  user_login: string;
  user_email: string;
  user_registered: string;
  display_name: string;
  user_status: number;
  roles: string[];
  meta: Record<string, any>;
}

export interface UdosUser extends WpUser {
  udos_id: string;
  last_sync: string;
  context: string;
  permissions: string[];
}

export interface SyncConfig {
  wpDb: {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
  };
  sqliteDb: {
    path: string;
  };
  syncInterval: number;
  batchSize: number;
}

export interface SyncResult {
  success: boolean;
  syncedUsers: number;
  failedUsers: number;
  errors: string[];
  timestamp: string;
}

export type SyncDirection = 'wp-to-udos' | 'udos-to-wp' | 'bidirectional';
