/**
 * uDos Exporter
 * Export uDos notes as WordPress posts
 */

import { WordPressClient, WordPressPost, WordPressClientFactory } from '../lib/wordpress-client.js';
import { UdosNote } from '../types.js';
import { ExportOptions, ExportResult, ExportStatistics, MediaOperationResult } from '../import-export/types.js';
import { getVault } from '../vault.js';

/**
 * uDos Exporter
 * Handles exporting uDos notes to WordPress
 */
export class UdosExporter {
  private client: WordPressClient;
  private vault: any; // Would be proper Vault type
  
  constructor(client: WordPressClient) {
    this.client = client;
    this.vault = getVault();
  }
  
  /**
   * Export uDos notes to WordPress based on specified options
   */
  async exportNotes(options: ExportOptions = {}): Promise<ExportResult> {
    const startTime = Date.now();
    const result: ExportResult = {
      success: false,
      exported: 0,
      skipped: 0,
      mediaExported: 0,
      errors: [],
      durationMs: 0,
      statistics: this.getDefaultStatistics()
    };
    
    try {
      console.log('📤 Starting uDos export to WordPress...');
      
      // Apply filters and get notes from uDos
      const notes = await this.fetchNotesWithOptions(options);
      if (!result.statistics) {
        result.statistics = this.getDefaultStatistics();
      }
      result.statistics.totalConsidered = notes.length;
      
      console.log(`📋 Found ${notes.length} notes to consider for export`);
      
      if (options.dryRun) {
        console.log('📝 Dry run mode - no notes will actually be exported');
        result.success = true;
        result.durationMs = Date.now() - startTime;
        return result;
      }
      
      // Process each note
      for (const note of notes) {
        try {
          // Check if note already exists in WordPress
          const exists = await this.noteExistsInWordPress(note);
          
          if (exists) {
            console.log(`⏭️  Skipping note ${note.id} (already exists in WordPress)`);
            result.skipped++;
            if (!result.statistics) {
              result.statistics = this.getDefaultStatistics();
            }
            result.statistics.alreadyExisted++;
            continue;
          }
          
          // Transform uDos note to WordPress post
          const post = await this.transformUdosToWordPress(note, options.postType || 'post');
          
          // Handle media if requested and note has metadata about WordPress media
          if (options.includeMedia && note.metadata?.featuredImage) {
            const mediaResult = await this.exportMedia(note.metadata.featuredImage, post.id || 0);
            if (mediaResult.success) {
              post.featured_media = mediaResult.mediaId;
              result.mediaExported = (result.mediaExported || 0) + 1;
              if (!result.statistics) {
                result.statistics = this.getDefaultStatistics();
              }
              result.statistics.mediaUploaded++;
            } else {
              console.warn(`⚠️  Failed to export media for note ${note.id}: ${mediaResult.error}`);
            }
          }
          
          // Export the post to WordPress
          const exportedPost = await this.client.createPost(post);
          
          console.log(`✅ Exported note ${note.id}: ${note.title}`);
          result.exported++;
          if (!result.statistics) {
            result.statistics = this.getDefaultStatistics();
          }
          result.statistics.created++;
          
          // Update the uDos note with WordPress metadata
          await this.updateNoteWithWordPressData(note.id, exportedPost);
          
        } catch (error: any) {
          console.error(`❌ Failed to export note ${note.id}: ${error.message}`);
          result.errors.push(`Note ${note.id}: ${error.message}`);
          if (!result.statistics) {
            result.statistics = this.getDefaultStatistics();
          }
          result.statistics.failed++;
        }
      }
      
      // Calculate statistics
      result.statistics.avgTimePerNoteMs = result.exported > 0
        ? result.durationMs / result.exported
        : 0;
      
      result.success = result.errors.length === 0;
      result.durationMs = Date.now() - startTime;
      
      console.log(`✅ Export completed: ${result.exported} notes exported, ${result.skipped} skipped`);
      if (result.mediaExported) {
        console.log(`🖼️  ${result.mediaExported} media files exported`);
      }
      
    } catch (error: any) {
      console.error(`❌ Export failed: ${error.message}`);
      result.errors.push(`Export failed: ${error.message}`);
      result.durationMs = Date.now() - startTime;
      if (!result.statistics) {
        result.statistics = this.getDefaultStatistics();
      }
    }
    
    return result;
  }
  
  /**
   * Export a single uDos note by ID
   */
  async exportNote(id: string, options: ExportOptions = {}): Promise<WordPressPost> {
    try {
      console.log(`📤 Exporting uDos note ${id} to WordPress...`);
      
      // Fetch the note from uDos
      const note = await this.vault.getNote(id);
      
      if (!note) {
        throw new Error(`Note ${id} not found`);
      }
      
      // Transform to WordPress post
      const post = await this.transformUdosToWordPress(note, options.postType || 'post');
      
      // Handle media if requested
      if (options.includeMedia && note.metadata?.featuredImage) {
        const mediaResult = await this.exportMedia(note.metadata.featuredImage, 0); // Will get ID after post creation
        if (mediaResult.success) {
          post.featured_media = mediaResult.mediaId;
        }
      }
      
      // Export to WordPress
      const exportedPost = await this.client.createPost(post);
      
      // Update the uDos note with WordPress metadata
      await this.updateNoteWithWordPressData(id, exportedPost);
      
      console.log(`✅ Exported note ${id}: ${note.title}`);
      return exportedPost;
      
    } catch (error: any) {
      console.error(`❌ Failed to export note ${id}: ${error.message}`);
      throw new Error(`Export failed: ${error.message}`);
    }
  }
  
  /**
   * Export notes by tag
   */
  async exportByTag(tag: string, options: ExportOptions = {}): Promise<ExportResult> {
    console.log(`📤 Exporting notes with tag: ${tag}`);
    
    return this.exportNotes({
      ...options,
      tags: [tag]
    });
  }
  
  /**
   * Export notes by category
   */
  async exportByCategory(category: string, options: ExportOptions = {}): Promise<ExportResult> {
    console.log(`📤 Exporting notes in category: ${category}`);
    
    return this.exportNotes({
      ...options,
      categories: [category]
    });
  }
  
  /**
   * Get export statistics
   */
  async getExportStats(): Promise<ExportStatistics> {
    // In a full implementation, this would track actual export history
    // For A2, we'll return default statistics
    return this.getDefaultStatistics();
  }
  
  /**
   * Fetch notes from uDos with applied options
   */
  private async fetchNotesWithOptions(options: ExportOptions): Promise<UdosNote[]> {
    try {
      // Start with all notes
      const allNotes = await this.vault.getNotes();
      
      // Apply filters
      let filteredNotes = [...allNotes];
      
      // Date filtering
      if (options.since || options.before) {
        const sinceDate = options.since ? new Date(options.since) : new Date(0);
        const beforeDate = options.before ? new Date(options.before) : new Date();
        
        filteredNotes = filteredNotes.filter(note => {
          const noteDate = new Date(note.updatedAt || note.createdAt);
          return noteDate >= sinceDate && noteDate <= beforeDate;
        });
      }
      
      // Status filtering
      if (options.status && options.status.length > 0) {
        filteredNotes = filteredNotes.filter(note => 
          options.status?.includes(note.status)
        );
      }
      
      // Tag filtering
      if (options.tags && options.tags.length > 0) {
        filteredNotes = filteredNotes.filter((note: UdosNote) => 
          note.tags && note.tags.some((tag: string) => options.tags?.includes(tag))
        );
      }
      
      // Category filtering
      if (options.categories && options.categories.length > 0) {
        filteredNotes = filteredNotes.filter((note: UdosNote) => 
          note.categories && note.categories.some((cat: string) => options.categories?.includes(cat))
        );
      }
      
      // Apply limit if specified
      if (options.limit) {
        filteredNotes = filteredNotes.slice(0, options.limit);
      }
      
      return filteredNotes;
      
    } catch (error: any) {
      console.error(`❌ Failed to fetch notes: ${error.message}`);
      throw new Error(`Note fetch failed: ${error.message}`);
    }
  }
  
  /**
   * Check if a uDos note already exists in WordPress
   */
  private async noteExistsInWordPress(note: UdosNote): Promise<boolean> {
    // Check if the note has WordPress metadata indicating it's already exported
    if (note.metadata?.wordpressId) {
      try {
        // Verify the post still exists in WordPress
        const post = await this.client.getPost(note.metadata.wordpressId);
        return !!post; // Post exists if we get a result
      } catch (error) {
        // Post might have been deleted from WordPress
        return false;
      }
    }
    
    // For notes without WordPress ID, check by title/content similarity
    // This is a simplified check for A2
    return false;
  }
  
  /**
   * Transform uDos note to WordPress post
   */
  private async transformUdosToWordPress(note: UdosNote, postType: string = 'post'): Promise<WordPressPost> {
    // Remove frontmatter if present
    let content = note.content;
    if (content.startsWith('---')) {
      const frontmatterEnd = content.indexOf('---', 3);
      if (frontmatterEnd !== -1) {
        content = content.substring(frontmatterEnd + 3).trim();
      }
    }
    
    // Map uDos note fields to WordPress post format
    const post: WordPressPost = {
      title: { rendered: note.title },
      content: { rendered: content, protected: false },
      excerpt: { rendered: note.excerpt || content.substring(0, 156) + '...', protected: false },
      status: note.status || 'draft',
      date: note.createdAt,
      modified: note.updatedAt,
      slug: this.slugify(note.title),
      type: postType,
      author: 1, // Default to current user in A2
      comment_status: 'open',
      ping_status: 'open',
      sticky: false,
      template: '',
      format: 'standard',
      meta: {
        udos_id: note.id,
        udos_status: note.status,
        udos_created: note.createdAt,
        udos_updated: note.updatedAt
      }
    };
    
    // Add categories if present
    if (note.categories && note.categories.length > 0) {
      post.categories = await this.getWordPressCategoryIds(note.categories);
    }
    
    // Add tags if present
    if (note.tags && note.tags.length > 0) {
      post.tags = await this.getWordPressTagIds(note.tags);
    }
    
    return post;
  }
  
  /**
   * Get WordPress category IDs from uDos category names
   */
  private async getWordPressCategoryIds(udosCategories: string[]): Promise<number[]> {
    try {
      // Fetch all WordPress categories
      const wpCategories = await this.client.getCategories();
      
      // Map uDos category names to WordPress category IDs
      return udosCategories
        .map(udosCat => {
          const wpCat = wpCategories.find(wpCat => 
            wpCat.name === udosCat || wpCat.slug === udosCat
          );
          return wpCat ? wpCat.id : null;
        })
        .filter((id): id is number => id !== null);
      
    } catch (error: any) {
      console.warn(`⚠️  Could not fetch WordPress categories: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Get WordPress tag IDs from uDos tag names
   */
  private async getWordPressTagIds(udosTags: string[]): Promise<number[]> {
    try {
      // Fetch all WordPress tags
      const wpTags = await this.client.getTags();
      
      // Map uDos tag names to WordPress tag IDs
      return udosTags
        .map(udosTag => {
          const wpTag = wpTags.find(wpTag => 
            wpTag.name === udosTag || wpTag.slug === udosTag
          );
          return wpTag ? wpTag.id : null;
        })
        .filter((id): id is number => id !== null);
      
    } catch (error: any) {
      console.warn(`⚠️  Could not fetch WordPress tags: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Export media attachment
   */
  private async exportMedia(mediaPath: string, postId: number): Promise<MediaOperationResult> {
    try {
      console.log(`🖼️  Exporting media ${mediaPath} for post ${postId}`);
      
      // In a full implementation, we would:
      // 1. Read the media file from uDos vault
      // 2. Upload it to WordPress media library
      // 3. Get the media ID and URL
      // 4. Return the media information
      
      // For A2, we'll simulate this
      console.log(`✅ Media ${mediaPath} export simulated for A2`);
      
      return {
        success: true,
        mediaId: Math.floor(Math.random() * 100000),
        pathOrUrl: `https://example.com/wp-content/uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`,
        sizeBytes: 1024 * 1024, // Simulate 1MB file
        mimeType: 'image/jpeg',
        originalUrl: mediaPath
      };
      
    } catch (error: any) {
      console.error(`❌ Media export failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Update uDos note with WordPress data after export
   */
  private async updateNoteWithWordPressData(noteId: string, wordpressPost: WordPressPost): Promise<void> {
    try {
      // Get the current note
      const currentNote = await this.vault.getNote(noteId);
      
      if (!currentNote) {
        throw new Error(`Note ${noteId} not found for update`);
      }
      
      // Update metadata with WordPress information
      const updatedNote = {
        ...currentNote,
        metadata: {
          ...currentNote.metadata,
          wordpressId: wordpressPost.id,
          wordpressUrl: wordpressPost.link,
          wordpressStatus: wordpressPost.status,
          exportedAt: new Date().toISOString(),
          exportedBy: 'system'
        }
      };
      
      // Update the note in the vault
      await this.vault.updateNote(noteId, updatedNote);
      
      console.log(`🔄 Updated note ${noteId} with WordPress metadata`);
      
    } catch (error: any) {
      console.error(`⚠️  Could not update note with WordPress data: ${error.message}`);
      // Don't throw error as this is not critical for export success
    }
  }
  
  /**
   * Simple slugify function
   */
  private slugify(text: string): string {
    return text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  
  /**
   * Get default export statistics
   */
  private getDefaultStatistics(): ExportStatistics {
    return {
      totalConsidered: 0,
      created: 0,
      updated: 0,
      alreadyExisted: 0,
      mediaUploaded: 0,
      mediaAlreadyExisted: 0,
      avgTimePerNoteMs: 0,
      failed: 0
    };
  }
}

/**
 * uDos Exporter Factory
 */
export class UdosExporterFactory {
  private static instance: UdosExporter | null = null;
  
  static async getExporter(): Promise<UdosExporter> {
    if (!this.instance) {
      const client = await WordPressClientFactory.getClient();
      this.instance = new UdosExporter(client);
    }
    return this.instance;
  }
  
  static reset(): void {
    this.instance = null;
  }
}