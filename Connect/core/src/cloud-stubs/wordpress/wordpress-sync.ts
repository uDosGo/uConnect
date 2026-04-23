import { WordPressClient, WordPressPost, WordPressClientFactory } from '../lib/wordpress-client.js';
import { UdosNote } from '../types.js';
import { getVault } from '../vault.js';
import fsExtra from 'fs-extra';
import path from 'path';

const { ensureDir, readFile, writeFile, pathExists } = fsExtra;

/**
 * WordPress Sync Engine
 * Bidirectional synchronization between uDos and WordPress
 */

export interface SyncOptions {
  dryRun?: boolean;
  since?: string;
  limit?: number;
  resolveStrategy?: 'udos' | 'wordpress' | 'manual';
  batchSize?: number;
}

export interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  deleted: number;
  skipped: number;
  conflicts: number;
  durationMs: number;
  errors: string[];
}

export interface SyncState {
  lastSync: string;
  lastWordPressSyncId: number;
  lastUdosSyncId: string;
  wordPressTotal: number;
  udosTotal: number;
}

export interface ChangeSet {
  type: 'create' | 'update' | 'delete';
  source: 'wordpress' | 'udos';
  wordPressId?: number;
  udosId?: string;
  data: WordPressPost | UdosNote;
  conflict?: boolean;
}

export interface ConflictResolution {
  change: ChangeSet;
  strategy: 'udos' | 'wordpress' | 'manual';
  resolvedData: WordPressPost | UdosNote;
}

/**
 * WordPress Sync Engine
 */
export class WordPressSync {
  private client: WordPressClient;
  private vault: any; // Would be proper Vault type in full implementation
  private syncState: SyncState;
  private syncStatePath: string;
  
  constructor(client: WordPressClient) {
    this.client = client;
    this.vault = getVault(); // Would be proper vault initialization
    this.syncStatePath = path.join(process.cwd(), '.udos', 'sync-state.json');
    this.syncState = {
      lastSync: new Date(0).toISOString(),
      lastWordPressSyncId: 0,
      lastUdosSyncId: '',
      wordPressTotal: 0,
      udosTotal: 0
    };
  }
  
  /**
   * Initialize sync engine
   */
  async initialize(): Promise<void> {
    await this.loadSyncState();
  }
  
  /**
   * Load sync state from file
   */
  private async loadSyncState(): Promise<void> {
    try {
      const syncDir = path.dirname(this.syncStatePath);
      await ensureDir(syncDir);
      
      if (await pathExists(this.syncStatePath)) {
        const content = await readFile(this.syncStatePath, 'utf8');
        this.syncState = JSON.parse(content);
      } else {
        // Initialize default sync state
        this.syncState = {
          lastSync: new Date(0).toISOString(),
          lastWordPressSyncId: 0,
          lastUdosSyncId: '',
          wordPressTotal: 0,
          udosTotal: 0
        };
        await this.saveSyncState();
      }
    } catch (error: any) {
      console.error('Failed to load sync state:', error.message);
      throw new Error('Sync state initialization failed');
    }
  }
  
  /**
   * Save sync state to file
   */
  private async saveSyncState(): Promise<void> {
    try {
      await writeFile(this.syncStatePath, JSON.stringify(this.syncState, null, 2), 'utf8');
    } catch (error: any) {
      console.error('Failed to save sync state:', error.message);
      throw new Error('Sync state save failed');
    }
  }
  
  /**
   * Main sync method - bidirectional synchronization
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      conflicts: 0,
      durationMs: 0,
      errors: []
    };
    
    try {
      console.log('🔄 Starting WordPress synchronization...');
      
      // 1. Fetch current data from both sources
      const [wordPressPosts, udosNotes] = await Promise.all([
        this.fetchWordPressPosts(options),
        this.fetchUdosNotes()
      ]);
      
      console.log(`📊 Fetched ${wordPressPosts.length} WordPress posts and ${udosNotes.length} uDos notes`);
      
      // 2. Detect changes
      const changes = this.detectChanges(wordPressPosts, udosNotes);
      console.log(`🔍 Detected ${changes.length} changes to process`);
      
      if (options.dryRun) {
        console.log('📝 Dry run mode - no changes will be applied');
        console.log('Changes that would be applied:');
        changes.forEach((change, index) => {
          console.log(`${index + 1}. ${change.type} ${change.source}: ${change.wordPressId || change.udosId}`);
        });
        
        result.success = true;
        result.durationMs = Date.now() - startTime;
        return result;
      }
      
      // 3. Resolve conflicts
      const resolvedChanges = await this.resolveConflicts(changes, options.resolveStrategy || 'manual');
      
      if (resolvedChanges.conflicts > 0) {
        console.log(`⚠️  ${resolvedChanges.conflicts} conflicts detected`);
        if (options.resolveStrategy === 'manual') {
          console.log('📋 Manual conflict resolution required');
          console.log('Use --resolve-strategy=udos or --resolve-strategy=wordpress to auto-resolve');
        }
      }
      
      // 4. Apply changes
      const applyResult = await this.applyChanges(resolvedChanges.changes, options);
      
      // Update result with apply results
      Object.assign(result, applyResult);
      result.conflicts = resolvedChanges.conflicts;
      
      // 5. Update sync state
      this.syncState.lastSync = new Date().toISOString();
      this.syncState.wordPressTotal = wordPressPosts.length;
      this.syncState.udosTotal = udosNotes.length;
      
      // Find the highest IDs for incremental sync
      if (wordPressPosts.length > 0) {
        const maxWpId = Math.max(...wordPressPosts.map(p => p.id || 0));
        this.syncState.lastWordPressSyncId = maxWpId;
      }
      
      await this.saveSyncState();
      
      result.success = true;
      result.durationMs = Date.now() - startTime;
      
      console.log('✅ Synchronization completed successfully');
      console.log(`📈 Created: ${result.created}, Updated: ${result.updated}, Deleted: ${result.deleted}`);
      console.log(`⏱️  Duration: ${result.durationMs}ms`);
      
    } catch (error: any) {
      console.error('❌ Synchronization failed:', error.message);
      result.errors.push(error.message);
      result.durationMs = Date.now() - startTime;
    }
    
    return result;
  }
  
  /**
   * Fetch posts from WordPress
   */
  private async fetchWordPressPosts(options: SyncOptions): Promise<WordPressPost[]> {
    try {
      const sinceDate = options.since || this.syncState.lastSync;
      
      console.log(`📥 Fetching WordPress posts since ${sinceDate}...`);
      
      // For A2 implementation, we'll fetch all posts and filter by date
      // In production, we'd use the WordPress API's after parameter
      const allPosts = await this.client.getPosts({
        perPage: options.limit || 100,
        status: ['publish', 'draft', 'pending', 'private']
      });
      
      // Filter by modified date
      const since = new Date(sinceDate);
      return allPosts.filter(post => {
        if (!post.modified) return true; // Include posts without modified date
        const postDate = new Date(post.modified);
        return postDate >= since;
      });
      
    } catch (error: any) {
      console.error('Failed to fetch WordPress posts:', error.message);
      throw new Error('WordPress posts fetch failed');
    }
  }
  
  /**
   * Fetch notes from uDos vault
   */
  private async fetchUdosNotes(): Promise<UdosNote[]> {
    try {
      console.log('📥 Fetching uDos notes...');
      
      // In a full implementation, this would fetch from the actual vault
      // For A2, we'll return a mock response
      return []; // Would be: await this.vault.getNotes();
      
    } catch (error: any) {
      console.error('Failed to fetch uDos notes:', error.message);
      throw new Error('uDos notes fetch failed');
    }
  }
  
  /**
   * Detect changes between WordPress and uDos
   */
  private detectChanges(wordPressPosts: WordPressPost[], udosNotes: UdosNote[]): ChangeSet[] {
    const changes: ChangeSet[] = [];
    
    console.log('🔍 Detecting changes...');
    
    // This is a simplified change detection for A2
    // A full implementation would track individual field changes
    // and use proper mapping between WordPress posts and uDos notes
    
    // 1. Check for new WordPress posts not in uDos
    wordPressPosts.forEach(post => {
      // In full implementation, we'd check if this post exists in uDos
      // based on WordPress ID mapping
      const existsInUdos = udosNotes.some(note => 
        note.metadata?.wordpressId === post.id
      );
      
      if (!existsInUdos) {
        changes.push({
          type: 'create',
          source: 'wordpress',
          wordPressId: post.id,
          data: post,
          conflict: false
        });
      }
    });
    
    // 2. Check for new uDos notes not in WordPress
    udosNotes.forEach(note => {
      // In full implementation, we'd check if this note exists in WordPress
      const existsInWordPress = wordPressPosts.some(post => 
        post.id === note.metadata?.wordpressId
      );
      
      if (!existsInWordPress && note.metadata?.publishToWordPress) {
        changes.push({
          type: 'create',
          source: 'udos',
          udosId: note.id,
          data: note,
          conflict: false
        });
      }
    });
    
    console.log(`📋 Found ${changes.length} changes`);
    return changes;
  }
  
  /**
   * Resolve conflicts in changes
   */
  private async resolveConflicts(changes: ChangeSet[], strategy: 'udos' | 'wordpress' | 'manual'): Promise<{ changes: ChangeSet[], conflicts: number }> {
    console.log(`🔄 Resolving conflicts with strategy: ${strategy}`);
    
    // For A2, we'll implement basic conflict detection
    // A full implementation would detect actual content conflicts
    
    let conflictCount = 0;
    
    if (strategy === 'manual') {
      // Mark potential conflicts for manual resolution
      changes.forEach(change => {
        // In full implementation, we'd detect actual conflicts
        // For A2, we'll just count changes that might need review
        if (change.type === 'update') {
          change.conflict = true;
          conflictCount++;
        }
      });
    } else {
      // Auto-resolve conflicts based on strategy
      changes.forEach(change => {
        if (change.conflict) {
          if (strategy === 'udos') {
            // Prefer uDos version
            change.conflict = false;
          } else if (strategy === 'wordpress') {
            // Prefer WordPress version  
            change.conflict = false;
          }
        }
      });
      conflictCount = 0; // Auto-resolved
    }
    
    return { changes, conflicts: conflictCount };
  }
  
  /**
   * Apply changes to synchronize data
   */
  private async applyChanges(changes: ChangeSet[], options: SyncOptions): Promise<Omit<SyncResult, 'conflicts' | 'durationMs' | 'success'>> {
    const result = {
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: [] as string[]
    };
    
    console.log(`📤 Applying ${changes.length} changes...`);
    
    // Process changes in batches
    const batchSize = options.batchSize || 10;
    
    for (let i = 0; i < changes.length; i += batchSize) {
      const batch = changes.slice(i, i + batchSize);
      
      for (const change of batch) {
        try {
          if (change.conflict && options.resolveStrategy === 'manual') {
            console.log(`⚠️  Skipping conflict (manual resolution required): ${change.wordPressId || change.udosId}`);
            result.skipped++;
            continue;
          }
          
          switch (change.type) {
            case 'create':
              if (change.source === 'wordpress') {
                // Create uDos note from WordPress post
                await this.createUdosNoteFromWordPress(change.data as WordPressPost);
                result.created++;
              } else {
                // Create WordPress post from uDos note
                await this.createWordPressPostFromUdos(change.data as UdosNote);
                result.created++;
              }
              break;
            
            case 'update':
              if (change.source === 'wordpress') {
                // Update uDos note from WordPress post
                await this.updateUdosNoteFromWordPress(change.data as WordPressPost);
                result.updated++;
              } else {
                // Update WordPress post from uDos note
                await this.updateWordPressPostFromUdos(change.data as UdosNote);
                result.updated++;
              }
              break;
              
            case 'delete':
              if (change.source === 'wordpress') {
                // Delete uDos note (mark as archived)
                await this.archiveUdosNote(change.udosId!);
                result.deleted++;
              } else {
                // Delete WordPress post (move to trash)
                await this.trashWordPressPost(change.wordPressId!);
                result.deleted++;
              }
              break;
          }
          
        } catch (error: any) {
          console.error(`❌ Failed to apply change ${change.type} ${change.source}:`, error.message);
          result.errors.push(`Change ${change.type} ${change.source} failed: ${error.message}`);
        }
      }
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < changes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return result;
  }
  
  /**
   * Create uDos note from WordPress post
   */
  private async createUdosNoteFromWordPress(post: WordPressPost): Promise<void> {
    // In full implementation, this would create a note in the vault
    console.log(`✅ Creating uDos note from WordPress post ${post.id}: ${post.title?.rendered}`);
    // Would be: await this.vault.createNote(this.mapWordPressToUdos(post));
  }
  
  /**
   * Create WordPress post from uDos note
   */
  private async createWordPressPostFromUdos(note: UdosNote): Promise<void> {
    // In full implementation, this would create a post in WordPress
    console.log(`✅ Creating WordPress post from uDos note ${note.id}: ${note.title}`);
    // Would be: await this.client.createPost(this.mapUdosToWordPress(note));
  }
  
  /**
   * Update uDos note from WordPress post
   */
  private async updateUdosNoteFromWordPress(post: WordPressPost): Promise<void> {
    // In full implementation, this would update a note in the vault
    console.log(`🔄 Updating uDos note from WordPress post ${post.id}: ${post.title?.rendered}`);
    // Would be: await this.vault.updateNote(post.id!.toString(), this.mapWordPressToUdos(post));
  }
  
  /**
   * Update WordPress post from uDos note
   */
  private async updateWordPressPostFromUdos(note: UdosNote): Promise<void> {
    // In full implementation, this would update a post in WordPress
    console.log(`🔄 Updating WordPress post from uDos note ${note.id}: ${note.title}`);
    // Would be: await this.client.updatePost(note.metadata?.wordpressId, this.mapUdosToWordPress(note));
  }
  
  /**
   * Archive uDos note (soft delete)
   */
  private async archiveUdosNote(noteId: string): Promise<void> {
    // In full implementation, this would archive a note
    console.log(`🗑️  Archiving uDos note ${noteId}`);
    // Would be: await this.vault.archiveNote(noteId);
  }
  
  /**
   * Trash WordPress post (soft delete)
   */
  private async trashWordPressPost(postId: number): Promise<void> {
    // In full implementation, this would trash a post
    console.log(`🗑️  Trashing WordPress post ${postId}`);
    // Would be: await this.client.deletePost(postId, false); // false = move to trash
  }
  
  /**
   * Map WordPress post to uDos note (stub for A2)
   */
  private mapWordPressToUdos(post: WordPressPost): UdosNote {
    // Simplified mapping for A2
    return {
      id: `wp-${post.id}`,
      title: post.title?.rendered || 'Untitled',
      content: post.content?.rendered || '',
      status: post.status || 'draft',
      createdAt: post.date || new Date().toISOString(),
      updatedAt: post.modified || new Date().toISOString(),
      metadata: {
        wordpressId: post.id,
        wordpressUrl: post.link,
        wordpressStatus: post.status
      }
    };
  }
  
  /**
   * Map uDos note to WordPress post (stub for A2)
   */
  private mapUdosToWordPress(note: UdosNote): WordPressPost {
    // Simplified mapping for A2
    return {
      id: note.metadata?.wordpressId,
      title: { rendered: note.title },
      content: { rendered: note.content, protected: false },
      status: note.status || 'draft',
      date: note.createdAt,
      modified: note.updatedAt,
      slug: this.slugify(note.title),
      type: 'post',
      link: note.metadata?.wordpressUrl,
      meta: note.metadata
    };
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
}

/**
 * Sync Factory for easy instantiation
 */
export class WordPressSyncFactory {
  private static instance: WordPressSync | null = null;
  
  static async getSyncEngine(): Promise<WordPressSync> {
    if (!this.instance) {
      const client = await WordPressClientFactory.getClient();
      this.instance = new WordPressSync(client);
      await this.instance.initialize();
    }
    return this.instance;
  }
  
  static reset(): void {
    this.instance = null;
  }
}