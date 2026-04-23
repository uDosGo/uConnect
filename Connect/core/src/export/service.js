/**
 * Feed Export/Import Service
 * Implements data export and import functionality
 */

const fs = require('fs').promises;
const path = require('path');
const { parse } = require('json2csv');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class ExportService {
  constructor() {
    this.exportDir = path.join(__dirname, '../../exports');
    this.supportedFormats = ['json', 'csv', 'markdown'];
  }
  
  /**
   * Ensure export directory exists
   */
  async _ensureExportDir() {
    try {
      await fs.access(this.exportDir);
    } catch (error) {
      await fs.mkdir(this.exportDir, { recursive: true });
    }
  }
  
  /**
   * Export feed data
   * @param {string} format - Export format (json, csv, markdown)
   * @param {Object} filters - Export filters
   * @param {string} filters.thread - Thread ID
   * @param {string} filters.since - Export since date
   * @param {string} filters.user - User ID
   * @param {Array} filters.tags - Tags to filter by
   * @param {Array} filters.fields - Fields to include (CSV only)
   * @returns {Promise<Object>} Export result
   */
  async exportFeed(format, filters = {}) {
    if (!this.supportedFormats.includes(format)) {
      throw new Error(`Unsupported format: ${format}. Supported: ${this.supportedFormats.join(', ')}`);
    }
    
    await this._ensureExportDir();
    
    // Get replies from database
    const replies = await this._getFilteredReplies(filters);
    
    // Generate export
    let content, filename;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    switch (format) {
      case 'json':
        content = this._generateJsonExport(replies);
        filename = `export-${timestamp}.json`;
        break;
      case 'csv':
        content = this._generateCsvExport(replies, filters.fields);
        filename = `export-${timestamp}.csv`;
        break;
      case 'markdown':
        content = this._generateMarkdownExport(replies);
        filename = `export-${timestamp}.md`;
        break;
    }
    
    // Save to file
    const filePath = path.join(this.exportDir, filename);
    await fs.writeFile(filePath, content);
    
    return {
      format,
      count: replies.length,
      file: filename,
      path: filePath,
      timestamp
    };
  }
  
  /**
   * Get filtered replies from database
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} Array of replies
   */
  async _getFilteredReplies(filters) {
    let query = `SELECT * FROM replies WHERE 1=1`;
    const params = [];
    
    if (filters.thread) {
      query += ` AND thread_id = ?`;
      params.push(filters.thread);
    }
    
    if (filters.user) {
      query += ` AND user_id = ?`;
      params.push(filters.user);
    }
    
    if (filters.since) {
      query += ` AND created_at >= ?`;
      params.push(filters.since);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      const tagPlaceholders = filters.tags.map(() => '?').join(',');
      query += ` AND id IN (
        SELECT reply_id FROM reply_tags 
        WHERE tag IN (${tagPlaceholders})
      )`;
      params.push(...filters.tags);
    }
    
    query += ` ORDER BY created_at ASC`;
    
    return db.fetchAll(query, params);
  }
  
  /**
   * Generate JSON export
   * @param {Array} replies - Replies to export
   * @returns {string} JSON content
   */
  _generateJsonExport(replies) {
    return JSON.stringify({
      version: 1,
      exported_at: new Date().toISOString(),
      compartment: 'global', // Could be made configurable
      count: replies.length,
      replies: replies.map(this._formatReplyForExport)
    }, null, 2);
  }
  
  /**
   * Format reply for export
   * @param {Object} reply - Database reply
   * @returns {Object} Formatted reply
   */
  _formatReplyForExport(reply) {
    return {
      reply_id: reply.id,
      timestamp: reply.created_at,
      user_id: reply.user_id,
      thread_id: reply.thread_id,
      parent_id: reply.parent_id,
      prompt: reply.prompt,
      output: reply.output,
      tags: reply.tags || [],
      quality_score: reply.quality_score,
      model: reply.model,
      metadata: reply.metadata ? JSON.parse(reply.metadata) : {}
    };
  }
  
  /**
   * Generate CSV export
   * @param {Array} replies - Replies to export
   * @param {Array} fields - Fields to include
   * @returns {string} CSV content
   */
  _generateCsvExport(replies, fields = null) {
    const defaultFields = [
      'reply_id', 'timestamp', 'user_id', 'thread_id',
      'prompt', 'output', 'quality_score', 'model'
    ];
    
    const exportFields = fields || defaultFields;
    const formattedReplies = replies.map(this._formatReplyForExport);
    
    try {
      return parse(formattedReplies, {
        fields: exportFields
      });
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new Error('Failed to generate CSV export');
    }
  }
  
  /**
   * Generate Markdown export
   * @param {Array} replies - Replies to export
   * @returns {string} Markdown content
   */
  _generateMarkdownExport(replies) {
    let markdown = `# uDos Feed Export\n\n`;
    markdown += `**Exported:** ${new Date().toISOString()}\n\n`;
    markdown += `**Total Replies:** ${replies.length}\n\n`;
    markdown += `---\n\n`;
    
    // Group by thread
    const threads = {};
    replies.forEach(reply => {
      if (!threads[reply.thread_id]) {
        threads[reply.thread_id] = [];
      }
      threads[reply.thread_id].push(reply);
    });
    
    for (const [threadId, threadReplies] of Object.entries(threads)) {
      markdown += `## Thread: ${threadId}\n\n`;
      
      // Build tree structure
      const tree = this._buildReplyTree(threadReplies);
      
      // Render tree
      this._renderReplyTree(markdown, tree, 0);
      
      markdown += '\n---\n\n';
    }
    
    return markdown;
  }
  
  /**
   * Build reply tree structure
   * @param {Array} replies - Replies in thread
   * @returns {Object} Tree structure
   */
  _buildReplyTree(replies) {
    const tree = {};
    const map = {};
    
    // Create map and find root
    replies.forEach(reply => {
      map[reply.id] = {
        ...reply,
        children: []
      };
    });
    
    // Build relationships
    replies.forEach(reply => {
      if (reply.parent_id) {
        const parent = map[reply.parent_id];
        if (parent) {
          parent.children.push(map[reply.id]);
        }
      } else {
        // Root reply
        tree[reply.id] = map[reply.id];
      }
    });
    
    return tree;
  }
  
  /**
   * Render reply tree to markdown
   * @param {string} markdown - Markdown string
   * @param {Object} tree - Tree structure
   * @param {number} level - Indentation level
   */
  _renderReplyTree(markdown, tree, level) {
    const indent = '  '.repeat(level);
    
    for (const [replyId, reply] of Object.entries(tree)) {
      markdown += `${indent}### Reply: ${reply.id}\n\n`;
      markdown += `${indent}**User:** ${reply.user_id}\n\n`;
      markdown += `${indent}**Prompt:** ${reply.prompt}\n\n`;
      markdown += `${indent}**Output:**\n\n`;
      markdown += `${indent}\`\`\`\n${reply.output}\n${indent}\`\`\`\n\n`;
      
      if (reply.tags && reply.tags.length > 0) {
        markdown += `${indent}**Tags:** ${reply.tags.join(', ')}\n\n`;
      }
      
      // Render children
      if (reply.children.length > 0) {
        this._renderReplyTree(markdown, reply.children, level + 1);
      }
    }
  }
  
  /**
   * Import feed data
   * @param {string} filePath - Path to import file
   * @param {Object} options - Import options
   * @param {string} options.mode - Import mode (merge, replace, skip-duplicates, conflict-rename)
   * @param {boolean} options.dryRun - Dry run (validate only)
   * @returns {Promise<Object>} Import result
   */
  async importFeed(filePath, options = {}) {
    const { mode = 'merge', dryRun = false } = options;
    
    // Read file
    const content = await fs.readFile(filePath, 'utf-8');
    let data;
    
    // Parse based on extension
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      if (ext === '.json') {
        data = JSON.parse(content);
        if (!this._validateJsonImport(data)) {
          throw new Error('Invalid JSON format');
        }
      } else if (ext === '.csv') {
        // For CSV, we'd need to parse it
        throw new Error('CSV import not yet implemented');
      } else {
        throw new Error(`Unsupported import format: ${ext}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse import file: ${error.message}`);
    }
    
    if (dryRun) {
      return {
        imported: 0,
        skipped: 0,
        conflicts: 0,
        mode,
        dryRun: true,
        message: 'Validation successful'
      };
    }
    
    // Process import based on mode
    switch (mode) {
      case 'merge':
        return this._importMerge(data);
      case 'replace':
        return this._importReplace(data);
      case 'skip-duplicates':
        return this._importSkipDuplicates(data);
      case 'conflict-rename':
        return this._importConflictRename(data);
      default:
        throw new Error(`Unknown import mode: ${mode}`);
    }
  }
  
  /**
   * Validate JSON import format
   * @param {Object} data - Import data
   * @returns {boolean} True if valid
   */
  _validateJsonImport(data) {
    return data && 
           data.version && 
           data.exported_at && 
           Array.isArray(data.replies);
  }
  
  /**
   * Import with merge mode
   * @param {Object} data - Import data
   * @returns {Promise<Object>} Import result
   */
  async _importMerge(data) {
    let imported = 0;
    let skipped = 0;
    let conflicts = 0;
    const errors = [];
    
    for (const reply of data.replies) {
      try {
        // Check if reply already exists
        const existing = await db.fetchOne(
          'SELECT id FROM replies WHERE id = ?',
          [reply.reply_id]
        );
        
        if (existing) {
          // Update existing reply
          await db.execute(`
            UPDATE replies 
            SET prompt = ?, output = ?, updated_at = datetime('now')
            WHERE id = ?
          `, [reply.prompt, reply.output, reply.reply_id]);
          skipped++;
        } else {
          // Insert new reply
          await db.execute(`
            INSERT INTO replies 
            (id, user_id, thread_id, parent_id, prompt, output, 
             quality_score, model, metadata, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(?), datetime('now'))
          `, [
            reply.reply_id, reply.user_id, reply.thread_id, reply.parent_id,
            reply.prompt, reply.output, reply.quality_score, reply.model,
            JSON.stringify(reply.metadata), reply.timestamp
          ]);
          
          // Insert tags
          if (reply.tags && reply.tags.length > 0) {
            for (const tag of reply.tags) {
              await db.execute(`
                INSERT INTO reply_tags (reply_id, tag) VALUES (?, ?)
              `, [reply.reply_id, tag]);
            }
          }
          
          imported++;
        }
      } catch (error) {
        errors.push({
          reply_id: reply.reply_id,
          error: error.message
        });
        conflicts++;
      }
    }
    
    return {
      imported,
      skipped,
      conflicts,
      errors,
      mode: 'merge'
    };
  }
  
  /**
   * Import with replace mode
   * @param {Object} data - Import data
   * @returns {Promise<Object>} Import result
   */
  async _importReplace(data) {
    // This would be dangerous - requires confirmation in real implementation
    throw new Error('Replace mode not implemented (dangerous operation)');
  }
  
  /**
   * Import with skip duplicates mode
   * @param {Object} data - Import data
   * @returns {Promise<Object>} Import result
   */
  async _importSkipDuplicates(data) {
    let imported = 0;
    let skipped = 0;
    const errors = [];
    
    for (const reply of data.replies) {
      try {
        const existing = await db.fetchOne(
          'SELECT id FROM replies WHERE id = ?',
          [reply.reply_id]
        );
        
        if (existing) {
          skipped++;
        } else {
          // Insert new reply (same as merge mode)
          await db.execute(`
            INSERT INTO replies 
            (id, user_id, thread_id, parent_id, prompt, output, 
             quality_score, model, metadata, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(?), datetime('now'))
          `, [
            reply.reply_id, reply.user_id, reply.thread_id, reply.parent_id,
            reply.prompt, reply.output, reply.quality_score, reply.model,
            JSON.stringify(reply.metadata), reply.timestamp
          ]);
          
          // Insert tags
          if (reply.tags && reply.tags.length > 0) {
            for (const tag of reply.tags) {
              await db.execute(`
                INSERT INTO reply_tags (reply_id, tag) VALUES (?, ?)
              `, [reply.reply_id, tag]);
            }
          }
          
          imported++;
        }
      } catch (error) {
        errors.push({
          reply_id: reply.reply_id,
          error: error.message
        });
      }
    }
    
    return {
      imported,
      skipped,
      conflicts: 0,
      errors,
      mode: 'skip-duplicates'
    };
  }
  
  /**
   * Import with conflict rename mode
   * @param {Object} data - Import data
   * @returns {Promise<Object>} Import result
   */
  async _importConflictRename(data) {
    let imported = 0;
    let conflicts = 0;
    const errors = [];
    
    for (const reply of data.replies) {
      try {
        const existing = await db.fetchOne(
          'SELECT id FROM replies WHERE id = ?',
          [reply.reply_id]
        );
        
        if (existing) {
          // Rename with suffix
          const newId = `${reply.reply_id}_import_${Date.now()}`;
          
          await db.execute(`
            INSERT INTO replies 
            (id, user_id, thread_id, parent_id, prompt, output, 
             quality_score, model, metadata, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(?), datetime('now'))
          `, [
            newId, reply.user_id, reply.thread_id, reply.parent_id,
            reply.prompt, reply.output, reply.quality_score, reply.model,
            JSON.stringify(reply.metadata), reply.timestamp
          ]);
          
          // Update tags to use new ID
          if (reply.tags && reply.tags.length > 0) {
            for (const tag of reply.tags) {
              await db.execute(`
                INSERT INTO reply_tags (reply_id, tag) VALUES (?, ?)
              `, [newId, tag]);
            }
          }
          
          imported++;
          conflicts++;
        } else {
          // Insert normally
          await db.execute(`
            INSERT INTO replies 
            (id, user_id, thread_id, parent_id, prompt, output, 
             quality_score, model, metadata, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(?), datetime('now'))
          `, [
            reply.reply_id, reply.user_id, reply.thread_id, reply.parent_id,
            reply.prompt, reply.output, reply.quality_score, reply.model,
            JSON.stringify(reply.metadata), reply.timestamp
          ]);
          
          // Insert tags
          if (reply.tags && reply.tags.length > 0) {
            for (const tag of reply.tags) {
              await db.execute(`
                INSERT INTO reply_tags (reply_id, tag) VALUES (?, ?)
              `, [reply.reply_id, tag]);
            }
          }
          
          imported++;
        }
      } catch (error) {
        errors.push({
          reply_id: reply.reply_id,
          error: error.message
        });
      }
    }
    
    return {
      imported,
      skipped: 0,
      conflicts,
      errors,
      mode: 'conflict-rename'
    };
  }
  
  /**
   * List available export files
   * @returns {Promise<Array>} List of export files
   */
  async listExports() {
    await this._ensureExportDir();
    const files = await fs.readdir(this.exportDir);
    
    return files
      .filter(f => this.supportedFormats.some(ext => f.endsWith(`.${ext}`)))
      .map(file => ({
        name: file,
        path: path.join(this.exportDir, file),
        size: fs.stat(path.join(this.exportDir, file)).then(stat => stat.size)
      }));
  }
  
  /**
   * Get export file info
   * @param {string} filename - Export filename
   * @returns {Promise<Object>} File info
   */
  async getExportInfo(filename) {
    const filePath = path.join(this.exportDir, filename);
    const stat = await fs.stat(filePath);
    
    return {
      name: filename,
      path: filePath,
      size: stat.size,
      created_at: stat.birthtime,
      modified_at: stat.mtime
    };
  }
  
  /**
   * Delete export file
   * @param {string} filename - Export filename
   * @returns {Promise<void>}
   */
  async deleteExport(filename) {
    const filePath = path.join(this.exportDir, filename);
    await fs.unlink(filePath);
  }
}

module.exports = new ExportService();