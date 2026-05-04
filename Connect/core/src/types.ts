/**
 * uDos Core Types
 * Type definitions for uDos data structures
 */

export interface UdosNote {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  excerpt?: string;
  tags?: string[];
  categories?: string[];
  metadata?: {
    [key: string]: any;
  };
  [key: string]: any;
}

export interface UdosPost extends UdosNote {
  slug: string;
  author: string;
  featuredImage?: string;
}

export interface SyncConfig {
  enabled: boolean;
  intervalMinutes: number;
  autoResolveConflicts: boolean;
  defaultConflictStrategy: 'udos' | 'manual';
}

export interface AdaptorConfig {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface VaultConfig {
  rootPath: string;
  defaultNoteStatus: string;
  compostEnabled: boolean;
}