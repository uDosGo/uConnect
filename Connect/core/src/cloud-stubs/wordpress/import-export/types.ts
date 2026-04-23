/**
 * Import/Export System Types
 * Type definitions for WordPress ↔ uDos data transfer
 */

export interface ImportOptions {
  /**
   * Import posts modified since this date (ISO format)
   */
  since?: string;
  
  /**
   * Import posts modified before this date (ISO format)
   */
  before?: string;
  
  /**
   * Import only posts with these statuses
   */
  status?: string[];
  
  /**
   * Import only posts in these categories (WordPress category IDs)
   */
  categories?: number[];
  
  /**
   * Import only posts with these tags (WordPress tag IDs)
   */
  tags?: number[];
  
  /**
   * Import only posts by these authors (WordPress user IDs)
   */
  authors?: number[];
  
  /**
   * Limit the number of posts to import
   */
  limit?: number;
  
  /**
   * Include media attachments in import
   */
  includeMedia?: boolean;
  
  /**
   * Dry run - don't actually import, just show what would be imported
   */
  dryRun?: boolean;
  
  /**
   * Show detailed progress information
   */
  verbose?: boolean;
  
  /**
   * Additional filter criteria for import
   */
  filterCriteria?: any;
}

export interface ImportResult {
  /**
   * Whether the import operation succeeded
   */
  success: boolean;
  
  /**
   * Number of posts successfully imported
   */
  imported: number;
  
  /**
   * Number of posts skipped (already exist, don't meet criteria, etc.)
   */
  skipped: number;
  
  /**
   * Number of media files imported
   */
  mediaImported?: number;
  
  /**
   * Any errors that occurred during import
   */
  errors: string[];
  
  /**
   * Duration of the import operation in milliseconds
   */
  durationMs: number;
  
  /**
   * Detailed statistics about the import
   */
  statistics?: ImportStatistics;
  
  /**
   * Total number of posts available for import
   */
  totalPosts?: number;
  
  /**
   * Sample of imported posts for display
   */
  samplePosts?: any[];
}

export interface ImportStatistics {
  /**
   * Total posts considered for import
   */
  totalConsidered: number;
  
  /**
   * Posts that already existed in uDos
   */
  alreadyExisted: number;
  
  /**
   * Posts that were actually created
   */
  created: number;
  
  /**
   * Posts that were updated
   */
  updated: number;
  
  /**
   * Media files downloaded
   */
  mediaDownloaded: number;
  
  /**
   * Media files that already existed
   */
  mediaAlreadyExisted: number;
  
  /**
   * Average import time per post in milliseconds
   */
  avgTimePerPostMs: number;
  
  /**
   * Number of failed import operations
   */
  failed: number;
}

export interface ExportOptions {
  /**
   * Export notes modified since this date (ISO format)
   */
  since?: string;
  
  /**
   * Export notes modified before this date (ISO format)
   */
  before?: string;
  
  /**
   * Export only notes with these statuses
   */
  status?: string[];
  
  /**
   * Export only notes with these tags
   */
  tags?: string[];
  
  /**
   * Export only notes in these categories
   */
  categories?: string[];
  
  /**
   * Limit the number of notes to export
   */
  limit?: number;
  
  /**
   * Include media attachments in export
   */
  includeMedia?: boolean;
  
  /**
   * Dry run - don't actually export, just show what would be exported
   */
  dryRun?: boolean;
  
  /**
   * Show detailed progress information
   */
  verbose?: boolean;
  
  /**
   * Post type to create in WordPress (default: 'post')
   */
  postType?: string;
  
  /**
   * Additional filter criteria for export
   */
  filterCriteria?: any;
}

export interface ExportResult {
  /**
   * Whether the export operation succeeded
   */
  success: boolean;
  
  /**
   * Number of notes successfully exported
   */
  exported: number;
  
  /**
   * Number of notes skipped (don't meet criteria, etc.)
   */
  skipped: number;
  
  /**
   * Number of media files exported
   */
  mediaExported?: number;
  
  /**
   * Any errors that occurred during export
   */
  errors: string[];
  
  /**
   * Duration of the export operation in milliseconds
   */
  durationMs: number;
  
  /**
   * Detailed statistics about the export
   */
  statistics?: ExportStatistics;
  
  /**
   * Total number of notes available for export
   */
  totalNotes?: number;
  
  /**
   * Sample of exported notes for display
   */
  sampleNotes?: any[];
}

export interface ExportStatistics {
  /**
   * Total notes considered for export
   */
  totalConsidered: number;
  
  /**
   * Notes that were actually created in WordPress
   */
  created: number;
  
  /**
   * Notes that were updated in WordPress
   */
  updated: number;
  
  /**
   * Notes that already existed in WordPress
   */
  alreadyExisted: number;
  
  /**
   * Media files uploaded
   */
  mediaUploaded: number;
  
  /**
   * Media files that already existed
   */
  mediaAlreadyExisted: number;
  
  /**
   * Average export time per note in milliseconds
   */
  avgTimePerNoteMs: number;
  
  /**
   * Number of failed export operations
   */
  failed: number;
}

export interface FilterCriteria {
  /**
   * Date range filter
   */
  date?: {
    since?: string;
    before?: string;
  };
  
  /**
   * Status filter
   */
  status?: string[];
  
  /**
   * Category filter (WordPress IDs for import, uDos categories for export)
   */
  categories?: (number | string)[];
  
  /**
   * Tag filter (WordPress IDs for import, uDos tags for export)
   */
  tags?: (number | string)[];
  
  /**
   * Author filter (WordPress user IDs for import)
   */
  authors?: number[];
  
  /**
   * Custom query filter
   */
  custom?: string;
}

export interface MediaOperationResult {
  /**
   * Whether the media operation succeeded
   */
  success: boolean;
  
  /**
   * Local path for downloads, URL for uploads
   */
  pathOrUrl?: string;
  
  /**
   * Media ID (WordPress media ID)
   */
  mediaId?: number;
  
  /**
   * Error message if operation failed
   */
  error?: string;
  
  /**
   * Original URL for downloads
   */
  originalUrl?: string;
  
  /**
   * File size in bytes
   */
  sizeBytes?: number;
  
  /**
   * MIME type
   */
  mimeType?: string;
}

export interface ProgressStatus {
  /**
   * Name of the operation being tracked
   */
  operation: string;
  
  /**
   * Total items to process
   */
  total: number;
  
  /**
   * Items completed so far
   */
  completed: number;
  
  /**
   * Completion percentage (0-100)
   */
  percentage: number;
  
  /**
   * Estimated time remaining in milliseconds
   */
  estimatedTimeRemaining?: number;
  
  /**
   * When the operation started
   */
  startedAt: string;
  
  /**
   * Current status message
   */
  statusMessage?: string;
}

export interface ProgressSummary {
  /**
   * Name of the operation
   */
  operation: string;
  
  /**
   * Total items processed
   */
  total: number;
  
  /**
   * Items completed successfully
   */
  completed: number;
  
  /**
   * Items that succeeded
   */
  success: number;
  
  /**
   * Items that failed
   */
  failed: number;
  
  /**
   * Duration in milliseconds
   */
  durationMs: number;
  
  /**
   * When the operation started
   */
  startedAt: string;
  
  /**
   * When the operation completed
   */
  completedAt: string;
  
  /**
   * Any warnings encountered
   */
  warnings?: string[];
}

export interface ImportExportConfig {
  /**
   * Default import options
   */
  defaultImportOptions: ImportOptions;
  
  /**
   * Default export options
   */
  defaultExportOptions: ExportOptions;
  
  /**
   * Media handling configuration
   */
  media: {
    /**
     * Maximum media file size to import/export in bytes
     */
    maxFileSize: number;
    
    /**
     * Supported MIME types
     */
    supportedMimeTypes: string[];
    
    /**
     * Timeout for media operations in milliseconds
     */
    timeoutMs: number;
    
    /**
     * Whether to create thumbnails for imported media
     */
    createThumbnails: boolean;
  };
  
  /**
   * Progress reporting configuration
   */
  progress: {
    /**
     * Update interval in milliseconds
     */
    updateIntervalMs: number;
    
    /**
     * Whether to show progress by default
     */
    showByDefault: boolean;
  };
}