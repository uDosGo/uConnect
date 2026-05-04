/**
 * WordPress Integration Types
 * Type definitions for WordPress-specific data structures
 */

export interface WordPressNoteMetadata {
  wordpressId?: number;
  wordpressUrl?: string;
  wordpressStatus?: string;
  wordpressType?: string;
  wordpressSlug?: string;
  wordpressGuid?: string;
  publishToWordPress?: boolean;
  [key: string]: any;
}

export type WordPressConflictStrategy = 'udos' | 'wordpress' | 'manual';

export interface WordPressSyncConfig extends SyncConfig {
  defaultConflictStrategy: WordPressConflictStrategy;
}

export interface UdosNoteWithWordPress extends UdosNote {
  metadata?: UdosNoteMetadata & WordPressNoteMetadata;
}
