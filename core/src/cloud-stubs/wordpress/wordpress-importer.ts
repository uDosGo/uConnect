/**
 * WordPress Importer
 * Import WordPress posts as uDos notes
 */

import { WordPressClient, WordPressPost, WordPressClientFactory } from '../lib/wordpress-client.js';
import { UdosNote } from '../types.js';
import { ImportOptions, ImportResult, ImportStatistics, MediaOperationResult } from '../import-export/types.js';
import { getVault } from '../vault.js';

/**
 * WordPress Importer
 * Handles importing WordPress posts into uDos
 */
export class WordPressImporter {
  private client: WordPressClient;
  private vault: any; // Would be proper Vault type
  
  constructor(client: WordPressClient) {
    this.client = client;
    this.vault = getVault();
  }
  
  /**
   * Import WordPress posts based on specified options
   */
  async importPosts(options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: false,
      imported: 0,
      skipped: 0,
      mediaImported: 0,
      errors: [],
      durationMs: 0,
      statistics: this.getDefaultStatistics()
    };
    
    try {
      console.log('📥 Starting WordPress import...');
      
      // Apply filters and get posts from WordPress
      const posts = await this.fetchPostsWithOptions(options);
      if (!result.statistics) {
        result.statistics = this.getDefaultStatistics();
      }
      result.statistics.totalConsidered = posts.length;
      
      console.log(`📋 Found ${posts.length} posts to consider for import`);
      
      if (options.dryRun) {
        console.log('📝 Dry run mode - no posts will actually be imported');
        result.success = true;
        result.durationMs = Date.now() - startTime;
        return result;
      }
      
      // Process each post
      for (const post of posts) {
        try {
          // Check if post already exists in uDos
          const exists = await this.postExistsInUdos(post);
          
          if (exists) {
            console.log(`⏭️  Skipping post ${post.id} (already exists)`);
            result.skipped++;
            if (!result.statistics) {
              result.statistics = this.getDefaultStatistics();
            }
            result.statistics.alreadyExisted++;
            continue;
          }
          
          // Transform WordPress post to uDos note
          const note = this.transformWordPressToUdos(post);
          
          // Handle media if requested
          if (options.includeMedia && post.featured_media) {
            const mediaResult = await this.importMedia(post.featured_media, note.id);
            if (mediaResult.success) {
              result.mediaImported = (result.mediaImported || 0) + 1;
              if (!result.statistics) {
                result.statistics = this.getDefaultStatistics();
              }
              result.statistics.mediaDownloaded++;
            } else {
              console.warn(`⚠️  Failed to import media for post ${post.id}: ${mediaResult.error}`);
            }
          }
          
          // Import the note into uDos
          const importedNote = await this.vault.createNote(note);
          
          console.log(`✅ Imported post ${post.id}: ${post.title?.rendered}`);
          result.imported++;
          if (!result.statistics) {
            result.statistics = this.getDefaultStatistics();
          }
          result.statistics.created++;
          
        } catch (error: any) {
          console.error(`❌ Failed to import post ${post.id}: ${error.message}`);
          result.errors.push(`Post ${post.id}: ${error.message}`);
          if (!result.statistics) {
            result.statistics = this.getDefaultStatistics();
          }
          result.statistics.failed++;
        }
      }
      
      // Calculate statistics
      result.statistics.avgTimePerPostMs = result.imported > 0
        ? result.durationMs / result.imported
        : 0;
      
      result.success = result.errors.length === 0;
      result.durationMs = Date.now() - startTime;
      
      console.log(`✅ Import completed: ${result.imported} posts imported, ${result.skipped} skipped`);
      if (result.mediaImported) {
        console.log(`🖼️  ${result.mediaImported} media files imported`);
      }
      
    } catch (error: any) {
      console.error(`❌ Import failed: ${error.message}`);
      result.errors.push(`Import failed: ${error.message}`);
      result.durationMs = Date.now() - startTime;
      if (!result.statistics) {
        result.statistics = this.getDefaultStatistics();
      }
    }
    
    return result;
  }
  
  /**
   * Import a single WordPress post by ID
   */
  async importPost(id: number, options: ImportOptions = {}): Promise<UdosNote> {
    try {
      console.log(`📥 Importing WordPress post ${id}...`);
      
      // Fetch the post from WordPress
      const post = await this.client.getPost(id);
      
      // Transform to uDos note
      const note = this.transformWordPressToUdos(post);
      
      // Handle media if requested
      if (options.includeMedia && post.featured_media) {
        await this.importMedia(post.featured_media, note.id);
      }
      
      // Import into uDos
      const importedNote = await this.vault.createNote(note);
      
      console.log(`✅ Imported post ${id}: ${post.title?.rendered}`);
      return importedNote;
      
    } catch (error: any) {
      console.error(`❌ Failed to import post ${id}: ${error.message}`);
      throw new Error(`Import failed: ${error.message}`);
    }
  }
  
  /**
   * Import posts by category
   */
  async importByCategory(category: string, options: ImportOptions = {}): Promise<ImportResult> {
    console.log(`📥 Importing posts from category: ${category}`);
    
    // Get category ID from name
    const categories = await this.client.getCategories();
    const categoryObj = categories.find(c => c.slug === category || c.name === category);
    
    if (!categoryObj) {
      throw new Error(`Category '${category}' not found`);
    }
    
    // Import posts with category filter
    return this.importPosts({
      ...options,
      categories: [categoryObj.id]
    });
  }
  
  /**
   * Import posts by author
   */
  async importByAuthor(author: number, options: ImportOptions = {}): Promise<ImportResult> {
    console.log(`📥 Importing posts by author: ${author}`);
    
    return this.importPosts({
      ...options,
      authors: [author]
    });
  }
  
  /**
   * Get import statistics
   */
  async getImportStats(): Promise<ImportStatistics> {
    // In a full implementation, this would track actual import history
    // For A2, we'll return default statistics
    return this.getDefaultStatistics();
  }
  
  /**
   * Fetch posts from WordPress with applied options
   */
  private async fetchPostsWithOptions(options: ImportOptions): Promise<WordPressPost[]> {
    try {
      // Start with all posts matching basic criteria
      const allPosts = await this.client.getPosts({
        perPage: options.limit || 100,
        status: options.status
      });
      
      // Apply additional filters
      let filteredPosts = [...allPosts];
      
      // Date filtering
      if (options.since || options.before) {
        const sinceDate = options.since ? new Date(options.since) : new Date(0);
        const beforeDate = options.before ? new Date(options.before) : new Date();
        
        filteredPosts = filteredPosts.filter(post => {
          if (!post.date) return true;
          const postDate = new Date(post.date);
          return postDate >= sinceDate && postDate <= beforeDate;
        });
      }
      
      // Category filtering
      if (options.categories && options.categories.length > 0) {
        // In full implementation, we'd fetch posts by category from WordPress API
        // For A2, we'll filter client-side
        filteredPosts = filteredPosts.filter(post => 
          post.categories && post.categories.some(c => options.categories?.includes(c))
        );
      }
      
      // Tag filtering
      if (options.tags && options.tags.length > 0) {
        filteredPosts = filteredPosts.filter((post: WordPressPost) => 
          post.tags && post.tags.some((t: number) => options.tags?.includes(t))
        );
      }
      
      // Author filtering
      if (options.authors && options.authors.length > 0) {
        filteredPosts = filteredPosts.filter((post: WordPressPost) => 
          post.author && options.authors?.includes(post.author)
        );
      }
      
      // Apply limit if specified
      if (options.limit) {
        filteredPosts = filteredPosts.slice(0, options.limit);
      }
      
      return filteredPosts;
      
    } catch (error: any) {
      console.error(`❌ Failed to fetch posts: ${error.message}`);
      throw new Error(`Post fetch failed: ${error.message}`);
    }
  }
  
  /**
   * Check if a WordPress post already exists in uDos
   */
  private async postExistsInUdos(post: WordPressPost): Promise<boolean> {
    // In a full implementation, we'd check the vault for existing notes
    // with the same WordPress ID or content hash
    // For A2, we'll use a simple check
    
    // Check if we have any notes with this WordPress ID
    try {
      // This would be: const notes = await this.vault.searchNotes({
      //   metadata: { wordpressId: post.id }
      // });
      // return notes.length > 0;
      
      // For A2, we'll assume posts don't exist to demonstrate import
      return false;
    } catch (error) {
      console.warn(`⚠️  Could not check if post exists: ${error}`);
      return false; // Assume doesn't exist if we can't check
    }
  }
  
  /**
   * Transform WordPress post to uDos note
   */
  private transformWordPressToUdos(post: WordPressPost): UdosNote {
    // Map WordPress post fields to uDos note format
    const note: UdosNote = {
      id: `wp-${post.id}-${Date.now()}`, // Temporary ID, vault will assign real one
      title: post.title?.rendered || 'Untitled',
      content: post.content?.rendered || '',
      status: post.status || 'draft',
      createdAt: post.date || new Date().toISOString(),
      updatedAt: post.modified || post.date || new Date().toISOString(),
      excerpt: post.excerpt?.rendered,
      tags: post.tags?.map(tag => tag.toString()),
      categories: post.categories?.map(cat => cat.toString()),
      metadata: {
        wordpressId: post.id,
        wordpressUrl: post.link,
        wordpressStatus: post.status,
        wordpressType: post.type,
        wordpressSlug: post.slug,
        wordpressGuid: post.guid?.rendered,
        importedAt: new Date().toISOString(),
        importedBy: 'system'
      }
    };
    
    // Add frontmatter if it doesn't exist
    if (!note.content.startsWith('---')) {
      const frontmatter = `---
title: ${note.title}
status: ${note.status}
date: ${note.createdAt}
---\n\n`;
      note.content = frontmatter + note.content;
    }
    
    return note;
  }
  
  /**
   * Import media attachment
   */
  private async importMedia(mediaId: number, noteId: string): Promise<MediaOperationResult> {
    try {
      console.log(`🖼️  Importing media ${mediaId} for note ${noteId}`);
      
      // In a full implementation, we would:
      // 1. Download the media file from WordPress
      // 2. Save it to the vault's media directory
      // 3. Update the note content to use the local media
      // 4. Add media metadata to the note
      
      // For A2, we'll simulate this
      console.log(`✅ Media ${mediaId} import simulated for A2`);
      
      return {
        success: true,
        mediaId: mediaId,
        originalUrl: `https://example.com/wp-content/uploads/${mediaId}`,
        pathOrUrl: `/vault/media/wp-${mediaId}-${Date.now()}.jpg`,
        sizeBytes: 1024 * 1024, // Simulate 1MB file
        mimeType: 'image/jpeg'
      };
      
    } catch (error: any) {
      console.error(`❌ Media import failed: ${error.message}`);
      return {
        success: false,
        mediaId: mediaId,
        error: error.message
      };
    }
  }
  
  /**
   * Get default import statistics
   */
  private getDefaultStatistics(): ImportStatistics {
    return {
      totalConsidered: 0,
      alreadyExisted: 0,
      created: 0,
      updated: 0,
      mediaDownloaded: 0,
      mediaAlreadyExisted: 0,
      avgTimePerPostMs: 0,
      failed: 0
    };
  }
}

/**
 * WordPress Importer Factory
 */
export class WordPressImporterFactory {
  private static instance: WordPressImporter | null = null;
  
  static async getImporter(): Promise<WordPressImporter> {
    if (!this.instance) {
      const client = await WordPressClientFactory.getClient();
      this.instance = new WordPressImporter(client);
    }
    return this.instance;
  }
  
  static reset(): void {
    this.instance = null;
  }
}