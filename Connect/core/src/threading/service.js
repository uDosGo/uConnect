/**
 * Reply Threading Service
 * Implements ASCII tree visualization for reply threads
 */

const db = require('../db');

class ThreadingService {
  constructor() {
    this.maxDepth = 10; // Maximum tree depth to prevent infinite recursion
  }
  
  /**
   * Get thread replies as a tree structure
   * @param {string} threadId - Thread ID
   * @param {Object} options - Options
   * @param {number} options.depth - Maximum depth
   * @param {boolean} options.compact - Compact format
   * @returns {Promise<Object>} Thread tree
   */
  async getThreadTree(threadId, options = {}) {
    const { depth = this.maxDepth, compact = false } = options;
    
    // Get all replies in thread
    const replies = await db.fetchAll(`
      SELECT * FROM replies 
      WHERE thread_id = ? 
      ORDER BY created_at ASC
    `, [threadId]);
    
    if (replies.length === 0) {
      return { root: null, children: {}, depth: 0 };
    }
    
    // Build tree structure
    const tree = this._buildTree(replies, depth);
    
    return {
      thread_id: threadId,
      root: tree.root,
      children: tree.children,
      depth: tree.depth,
      reply_count: replies.length
    };
  }
  
  /**
   * Build tree structure from replies
   * @param {Array} replies - Replies in thread
   * @param {number} maxDepth - Maximum depth
   * @returns {Object} Tree structure
   */
  _buildTree(replies, maxDepth) {
    const map = {};
    const children = {};
    let root = null;
    let actualDepth = 0;
    
    // Create map and find root
    replies.forEach(reply => {
      map[reply.id] = {
        ...reply,
        children: []
      };
    });
    
    // Build relationships and calculate depth
    replies.forEach(reply => {
      if (reply.parent_id) {
        const parent = map[reply.parent_id];
        if (parent) {
          parent.children.push(map[reply.id]);
          // Update depth
          const parentDepth = parent.depth || 0;
          map[reply.id].depth = parentDepth + 1;
          actualDepth = Math.max(actualDepth, map[reply.id].depth);
        }
      } else {
        // Root reply
        if (!root) {
          root = map[reply.id];
          map[reply.id].depth = 0;
        }
      }
    });
    
    // Build children map
    if (root) {
      this._buildChildrenMap(root, children);
    }
    
    return {
      root,
      children,
      depth: Math.min(actualDepth, maxDepth)
    };
  }
  
  /**
   * Build children map recursively
   * @param {Object} node - Tree node
   * @param {Object} childrenMap - Children map
   */
  _buildChildrenMap(node, childrenMap) {
    if (node.children.length > 0) {
      childrenMap[node.id] = node.children.map(child => child.id);
      node.children.forEach(child => {
        this._buildChildrenMap(child, childrenMap);
      });
    }
  }
  
  /**
   * Render thread as ASCII tree
   * @param {string} threadId - Thread ID
   * @param {Object} options - Rendering options
   * @param {number} options.depth - Maximum depth
   * @param {boolean} options.compact - Compact format
   * @param {number} options.context - Context lines
   * @returns {Promise<string>} ASCII tree representation
   */
  async renderThreadTree(threadId, options = {}) {
    const { depth = this.maxDepth, compact = false, context = 0 } = options;
    
    const tree = await this.getThreadTree(threadId, { depth });
    
    if (!tree.root) {
      return `Thread ${threadId}: No replies found`;
    }
    
    if (compact) {
      return this._renderCompactTree(tree);
    } else {
      return this._renderAsciiTree(tree, context);
    }
  }
  
  /**
   * Render compact tree (one line per reply)
   * @param {Object} tree - Thread tree
   * @returns {string} Compact representation
   */
  _renderCompactTree(tree) {
    let result = `Thread: ${tree.thread_id}\n`;
    
    const renderNode = (node, level = 0) => {
      const indent = '  '.repeat(level);
      const prefix = level > 0 ? '├── ' : '';
      
      result += `${indent}${prefix}${node.id} (${node.user_id}): ${node.prompt.substring(0, 50)}${node.prompt.length > 50 ? '...' : ''}\n`;
      
      node.children.forEach(child => renderNode(child, level + 1));
    };
    
    renderNode(tree.root);
    
    return result;
  }
  
  /**
   * Render ASCII tree with box drawing characters
   * @param {Object} tree - Thread tree
   * @param {number} context - Context lines to show
   * @returns {string} ASCII tree representation
   */
  _renderAsciiTree(tree, context = 0) {
    let result = `🌲 Thread: ${tree.thread_id}\n`;
    result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    const renderNode = (node, level = 0, prefixes = []) => {
      // Determine tree characters
      const isLast = level > 0 && 
                    node.parent && 
                    node.parent.children[node.parent.children.length - 1].id === node.id;
      
      const currentPrefix = isLast ? '└── ' : '├── ';
      const newPrefixes = [...prefixes];
      
      if (level > 0) {
        if (isLast) {
          newPrefixes[level - 1] = '    ';
        }
        result += prefixes.join('') + currentPrefix;
      }
      
      // Add reply info
      result += ` ${node.id} (${node.user_id})\n`;
      
      // Add timestamp
      result += prefixes.join('') + (level > 0 ? (isLast ? '    ' : '│   ') : '') + ` ${node.created_at}\n`;
      
      // Add prompt
      result += prefixes.join('') + (level > 0 ? (isLast ? '    ' : '│   ') : '') + ` "${node.prompt}"\n`;
      
      // Add output (with context)
      if (context > 0) {
        const outputLines = node.output.split('\n');
        const contextLines = outputLines.slice(0, context).join('\n');
        result += prefixes.join('') + (level > 0 ? (isLast ? '    ' : '│   ') : '') + ` \`\`\`\n${contextLines}\n`;
        result += prefixes.join('') + (level > 0 ? (isLast ? '    ' : '│   ') : '') + ` \`\`\`\n`;
      }
      
      // Add tags if present
      if (node.tags && node.tags.length > 0) {
        result += prefixes.join('') + (level > 0 ? (isLast ? '    ' : '│   ') : '') + ` Tags: ${node.tags.join(', ')}\n`;
      }
      
      result += '\n';
      
      // Update prefixes for children
      if (level > 0) {
        newPrefixes.push(isLast ? '    ' : '│   ');
      }
      
      // Render children
      node.children.forEach((child, index) => {
        const isChildLast = index === node.children.length - 1;
        renderNode(child, level + 1, newPrefixes);
      });
    };
    
    renderNode(tree.root);
    
    return result;
  }
  
  /**
   * Get thread as Markdown
   * @param {string} threadId - Thread ID
   * @param {Object} options - Options
   * @returns {Promise<string>} Markdown representation
   */
  async getThreadMarkdown(threadId, options = {}) {
    const tree = await this.getThreadTree(threadId, options);
    
    let markdown = `# Thread: ${threadId}\n\n`;
    markdown += `**Created:** ${new Date().toISOString()}\n\n`;
    markdown += `**Replies:** ${tree.reply_count}\n\n`;
    markdown += `---\n\n`;
    
    const renderNode = (node, level = 0) => {
      const indent = '  '.repeat(level);
      
      markdown += `${indent}### ${node.id}\n\n`;
      markdown += `${indent}**User:** ${node.user_id}\n\n`;
      markdown += `${indent}**Timestamp:** ${node.created_at}\n\n`;
      markdown += `${indent}**Prompt:** ${node.prompt}\n\n`;
      markdown += `${indent}**Output:**\n\n`;
      markdown += `${indent}\`\`\`\n${node.output}\n${indent}\`\`\`\n\n`;
      
      if (node.tags && node.tags.length > 0) {
        markdown += `${indent}**Tags:** ${node.tags.join(', ')}\n\n`;
      }
      
      // Render children
      node.children.forEach(child => renderNode(child, level + 1));
    };
    
    if (tree.root) {
      renderNode(tree.root);
    }
    
    return markdown;
  }
  
  /**
   * Get reply hierarchy for CLI display
   * @param {string} threadId - Thread ID
   * @param {Object} options - Options
   * @returns {Promise<Array>} Hierarchy array
   */
  async getReplyHierarchy(threadId, options = {}) {
    const tree = await this.getThreadTree(threadId, options);
    const hierarchy = [];
    
    const traverse = (node, parentId = null, level = 0) => {
      hierarchy.push({
        reply_id: node.id,
        parent_id: parentId,
        user_id: node.user_id,
        prompt: node.prompt,
        level,
        children: node.children.length
      });
      
      node.children.forEach(child => {
        traverse(child, node.id, level + 1);
      });
    };
    
    if (tree.root) {
      traverse(tree.root);
    }
    
    return hierarchy;
  }
  
  /**
   * Find conflicts in thread (replies with same parent and similar timestamps)
   * @param {string} threadId - Thread ID
   * @param {number} thresholdSeconds - Time threshold for conflicts
   * @returns {Promise<Array>} Array of conflict groups
   */
  async findConflicts(threadId, thresholdSeconds = 5) {
    const replies = await db.fetchAll(`
      SELECT * FROM replies 
      WHERE thread_id = ? 
      ORDER BY created_at ASC
    `, [threadId]);
    
    const conflicts = [];
    const grouped = {};
    
    // Group by parent_id
    replies.forEach(reply => {
      const parentKey = reply.parent_id || 'root';
      if (!grouped[parentKey]) {
        grouped[parentKey] = [];
      }
      grouped[parentKey].push(reply);
    });
    
    // Find conflicts in each group
    for (const [parentKey, group] of Object.entries(grouped)) {
      if (group.length < 2) continue;
      
      for (let i = 0; i < group.length - 1; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const timeDiff = Math.abs(new Date(group[i].created_at) - new Date(group[j].created_at)) / 1000;
          
          if (timeDiff <= thresholdSeconds) {
            conflicts.push({
              reply_a: group[i],
              reply_b: group[j],
              time_diff_seconds: timeDiff,
              parent_id: parentKey
            });
          }
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * Get thread statistics
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object>} Thread statistics
   */
  async getThreadStats(threadId) {
    const replies = await db.fetchAll(`
      SELECT * FROM replies 
      WHERE thread_id = ?
    `, [threadId]);
    
    if (replies.length === 0) {
      return {
        thread_id: threadId,
        reply_count: 0,
        user_count: 0,
        depth: 0,
        created_at: null,
        last_reply_at: null
      };
    }
    
    // Build tree to calculate depth
    const tree = this._buildTree(replies, 100);
    
    // Count unique users
    const users = new Set(replies.map(r => r.user_id));
    
    // Get time range
    const timestamps = replies.map(r => new Date(r.created_at)).sort((a, b) => a - b);
    
    return {
      thread_id: threadId,
      reply_count: replies.length,
      user_count: users.size,
      depth: tree.depth,
      created_at: timestamps[0].toISOString(),
      last_reply_at: timestamps[timestamps.length - 1].toISOString(),
      users: Array.from(users)
    };
  }
  
  /**
   * CLI command handler for thread visualization
   * @param {string} threadId - Thread ID
   * @param {Object} options - CLI options
   */
  async handleCliCommand(threadId, options = {}) {
    const { format = 'tree', depth = 10, compact = false, context = 0 } = options;
    
    switch (format) {
      case 'tree':
        const tree = await this.renderThreadTree(threadId, { depth, compact, context });
        console.log(tree);
        break;
      case 'hierarchy':
        const hierarchy = await this.getReplyHierarchy(threadId, { depth });
        console.log(JSON.stringify(hierarchy, null, 2));
        break;
      case 'markdown':
        const markdown = await this.getThreadMarkdown(threadId, { depth });
        console.log(markdown);
        break;
      case 'stats':
        const stats = await this.getThreadStats(threadId);
        console.log(JSON.stringify(stats, null, 2));
        break;
      case 'conflicts':
        const conflicts = await this.findConflicts(threadId);
        console.log(JSON.stringify(conflicts, null, 2));
        break;
      default:
        console.log(`Unknown format: ${format}`);
    }
  }
}

module.exports = new ThreadingService();