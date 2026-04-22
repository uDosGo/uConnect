/**
 * Media Handler
 * Handles media attachments for import/export operations
 */

import { WordPressClient, WordPressClientFactory } from '../lib/wordpress-client.js';
import { MediaOperationResult } from './types.js';
import { ensureDir, readFile, writeFile, pathExists } from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

/**
 * Media Handler
 * Handles downloading media from WordPress and uploading media to WordPress
 */
export class MediaHandler {
  private client: WordPressClient;
  private mediaDir: string;
  
  constructor(client: WordPressClient) {
    this.client = client;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.mediaDir = path.join(process.cwd(), '.udos', 'media');
  }
  
  /**
   * Initialize media directory
   */
  private async initializeMediaDir(): Promise<void> {
    try {
      await ensureDir(this.mediaDir);
    } catch (error: any) {
      console.error(`❌ Failed to create media directory: ${error.message}`);
      throw new Error(`Media directory creation failed: ${error.message}`);
    }
  }
  
  /**
   * Download media from WordPress
   */
  async downloadMedia(mediaId: number): Promise<MediaOperationResult> {
    try {
      await this.initializeMediaDir();
      
      console.log(`📥 Downloading media ${mediaId} from WordPress...`);
      
      // Get media metadata from WordPress
      const media = await this.client.getMedia(mediaId);
      
      if (!media.source_url) {
        throw new Error(`Media ${mediaId} has no source URL`);
      }
      
      // Download the media file
      const response = await axios.get(media.source_url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      // Determine file extension from MIME type
      const extension = this.getExtensionFromMimeType(media.mime_type || 'application/octet-stream');
      const filename = `wp-media-${mediaId}-${Date.now()}${extension}`;
      const filePath = path.join(this.mediaDir, filename);
      
      // Save the file
      await writeFile(filePath, response.data as string | NodeJS.ArrayBufferView);
      
      console.log(`✅ Downloaded media ${mediaId} to ${filePath}`);
      
      return {
        success: true,
        pathOrUrl: filePath,
        mediaId: media.id,
        originalUrl: media.source_url,
        sizeBytes: (response.data as ArrayBufferView).byteLength,
        mimeType: media.mime_type
      };
      
    } catch (error: any) {
      console.error(`❌ Media download failed: ${error.message}`);
      return {
        success: false,
        mediaId: mediaId,
        error: error.message
      };
    }
  }
  
  /**
   * Upload media to WordPress
   */
  async uploadMedia(filePath: string, postId: number): Promise<MediaOperationResult> {
    try {
      console.log(`📤 Uploading media ${filePath} to WordPress...`);
      
      // Check if file exists
      const fileExists = await pathExists(filePath);
      if (!fileExists) {
        throw new Error(`Media file not found: ${filePath}`);
      }
      
      // Read the file
      const fileData = await readFile(filePath);
      const fileName = path.basename(filePath);
      const mimeType = this.getMimeTypeFromExtension(path.extname(filePath));
      
      // Prepare form data for WordPress upload
      const formData = new FormData();
      formData.append('file', new Blob([fileData]), fileName);
      
      // Upload to WordPress
      const response = await this.client.uploadMedia(filePath, fileName);
      
      console.log(`✅ Uploaded media to WordPress: ${response.source_url}`);
      
      return {
        success: true,
        mediaId: response.id,
        pathOrUrl: response.source_url,
        sizeBytes: fileData.byteLength,
        mimeType: response.mime_type
      };
      
    } catch (error: any) {
      console.error(`❌ Media upload failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Process media references in content
   * Updates local media URLs to WordPress URLs after import
   */
  async processMediaInContent(
    content: string,
    mediaMappings: Record<string, string>
  ): Promise<string> {
    try {
      // Replace local media URLs with WordPress URLs
      let processedContent = content;
      
      for (const [localUrl, wordpressUrl] of Object.entries(mediaMappings)) {
        processedContent = processedContent.replace(
          new RegExp(escapeRegExp(localUrl), 'g'),
          wordpressUrl
        );
      }
      
      return processedContent;
      
    } catch (error: any) {
      console.error(`⚠️  Media content processing failed: ${error.message}`);
      return content; // Return original content if processing fails
    }
  }
  
  /**
   * Get media metadata from WordPress
   */
  async getMediaMetadata(mediaId: number): Promise<any> {
    try {
      return await this.client.getMedia(mediaId);
    } catch (error: any) {
      console.error(`⚠️  Failed to get media metadata: ${error.message}`);
      throw new Error(`Media metadata fetch failed: ${error.message}`);
    }
  }
  
  /**
   * Cleanup orphaned media files
   */
  async cleanupOrphanedMedia(maxAgeDays: number = 30): Promise<{ cleaned: number; failed: number }> {
    try {
      await this.initializeMediaDir();
      
      const files = await fsExtra.readdir(this.mediaDir);
      const now = Date.now();
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
      
      let cleaned = 0;
      let failed = 0;
      
      for (const file of files) {
        try {
          const filePath = path.join(this.mediaDir, file);
          const stats = await fsExtra.stat(filePath);
          
          // Check if file is older than maxAgeDays
          if (now - stats.mtimeMs > maxAgeMs) {
            await fsExtra.remove(filePath);
            cleaned++;
          }
        } catch (error: any) {
          console.warn(`⚠️  Failed to cleanup media ${file}: ${error.message}`);
          failed++;
        }
      }
      
      console.log(`🧹 Media cleanup completed: ${cleaned} files cleaned, ${failed} failed`);
      return { cleaned, failed };
      
    } catch (error: any) {
      console.error(`❌ Media cleanup failed: ${error.message}`);
      throw new Error(`Media cleanup failed: ${error.message}`);
    }
  }
  
  /**
   * Get file extension from MIME type
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const extensionMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
      'application/zip': '.zip',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'text/plain': '.txt',
      'text/csv': '.csv'
    };
    
    return extensionMap[mimeType] || '.bin';
  }
  
  /**
   * Get MIME type from file extension
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.txt': 'text/plain',
      '.csv': 'text/csv'
    };
    
    return mimeMap[extension.toLowerCase()] || 'application/octet-stream';
  }
}

/**
 * Media Handler Factory
 */
export class MediaHandlerFactory {
  private static instance: MediaHandler | null = null;
  
  static async getMediaHandler(): Promise<MediaHandler> {
    if (!this.instance) {
      const client = await WordPressClientFactory.getClient();
      this.instance = new MediaHandler(client);
    }
    return this.instance;
  }
  
  static reset(): void {
    this.instance = null;
  }
}

/**
 * Helper function to escape regex special characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Helper for file system operations
 */
const fsExtra = await import('fs-extra');