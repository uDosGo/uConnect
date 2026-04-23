/**
 * Vector DB Service
 * Implements semantic search using SQLite-vec extension
 */

import db from '../db.js';

// Mock embedding model for testing
class MockSentenceTransformer {
  constructor(modelName) {
    this.modelName = modelName;
    this.dimension = 384; // all-MiniLM-L6-v2 dimension
  }
  
  async encode(text) {
    // Simple mock: create a deterministic "embedding" based on text length
    // In production, this would use a real ML model
    const embedding = new Float32Array(this.dimension);
    let hash = this._simpleHash(text);
    
    // Fill embedding with pseudo-random values based on hash
    for (let i = 0; i < this.dimension; i++) {
      embedding[i] = (hash % 1000) / 1000.0 - 0.5; // Values between -0.5 and 0.5
      hash = (hash * 1664525 + 1013904223) >>> 0; // Simple pseudo-random
    }
    
    return embedding;
  }
  
  _simpleHash(text) {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 33) ^ text.charCodeAt(i);
    }
    return hash >>> 0;
  }
}

class VectorService {
  constructor() {
    this.model = null;
    this.modelName = 'all-MiniLM-L6-v2'; // 384-dimensional embeddings
    this.dimension = 384;
    this.initialized = false;
  }
  
  /**
   * Initialize vector service
   */
  async initialize() {
    if (this.initialized) return;
    
    // Load embedding model (mock for now)
    try {
      this.model = new MockSentenceTransformer(this.modelName);
      console.log(`✅ Loaded embedding model: ${this.modelName} (mock)`);
    } catch (error) {
      console.error('Failed to load embedding model:', error.message);
      throw error;
    }
    
    // Ensure vector tables exist
    await this._ensureDatabaseTables();
    
    this.initialized = true;
    console.log('✅ Vector DB service initialized');
  }
  
  /**
   * Ensure database tables exist
   */
  async _ensureDatabaseTables() {
    // Check if embedding column exists, if not add it
    try {
      await db.execute(`
        ALTER TABLE replies 
        ADD COLUMN embedding BLOB
      `);
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column')) {
        throw error;
      }
    }
    
    // Vector metadata table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vector_metadata (
        reply_id TEXT PRIMARY KEY,
        model TEXT NOT NULL,
        dimension INTEGER NOT NULL,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (reply_id) REFERENCES replies(id)
      )
    `);
    
    // Index for vector searches (would use sqlite-vec in production)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_replies_embedding 
      ON replies(id) WHERE embedding IS NOT NULL
    `);
  }
  
  /**
   * Generate embedding for text
   * @param {string} text - Text to embed
   * @returns {Promise<Float32Array>} Embedding vector
   */
  async generateEmbedding(text) {
    if (!this.model) {
      await this.initialize();
    }
    
    try {
      const embedding = await this.model.encode(text);
      return Float32Array.from(embedding);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error('Failed to generate embedding');
    }
  }
  
  /**
   * Index all replies in a thread
   * @param {string} threadId - Thread ID
   * @returns {Promise<number>} Number of replies indexed
   */
  async indexThread(threadId) {
    const replies = await db.fetchAll(`
      SELECT * FROM replies 
      WHERE thread_id = ? 
      AND (embedding IS NULL OR embedding = '')
    `, [threadId]);
    
    let indexed = 0;
    
    for (const reply of replies) {
      try {
        // Generate embedding
        const text = `${reply.prompt}\n${reply.output}`;
        const embedding = await this.generateEmbedding(text);
        
        // Store embedding
        await db.execute(`
          UPDATE replies 
          SET embedding = ? 
          WHERE id = ?
        `, [embedding.buffer, reply.id]);
        
        // Store metadata
        await db.execute(`
          INSERT OR REPLACE INTO vector_metadata 
          (reply_id, model, dimension, updated_at) 
          VALUES (?, ?, ?, datetime('now'))
        `, [reply.id, this.modelName, this.dimension]);
        
        indexed++;
      } catch (error) {
        console.error(`Failed to index reply ${reply.id}:`, error.message);
      }
    }
    
    return indexed;
  }
  
  /**
   * Index all replies (batch processing)
   * @param {number} batchSize - Batch size
   * @returns {Promise<number>} Total replies indexed
   */
  async indexAllReplies(batchSize = 100) {
    let totalIndexed = 0;
    let offset = 0;
    
    while (true) {
      const replies = await db.fetchAll(`
        SELECT id, prompt, output 
        FROM replies 
        WHERE embedding IS NULL OR embedding = ''
        LIMIT ? OFFSET ?
      `, [batchSize, offset]);
      
      if (replies.length === 0) break;
      
      for (const reply of replies) {
        try {
          const text = `${reply.prompt}\n${reply.output}`;
          const embedding = await this.generateEmbedding(text);
          
          await db.execute(`
            UPDATE replies 
            SET embedding = ? 
            WHERE id = ?
          `, [embedding.buffer, reply.id]);
          
          await db.execute(`
            INSERT OR REPLACE INTO vector_metadata 
            (reply_id, model, dimension, updated_at) 
            VALUES (?, ?, ?, datetime('now'))
          `, [reply.id, this.modelName, this.dimension]);
          
          totalIndexed++;
        } catch (error) {
          console.error(`Failed to index reply ${reply.id}:`, error.message);
        }
      }
      
      offset += batchSize;
      console.log(`Indexed batch: ${offset}/${totalIndexed + offset}`);
    }
    
    return totalIndexed;
  }
  
  /**
   * Search for similar replies
   * @param {string} query - Search query
   * @param {number} topK - Number of results
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Similar replies with scores
   */
  async searchSimilar(query, topK = 5, filters = {}) {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    // In production, this would use sqlite-vec's vector search
    // For now, we'll simulate with a simple cosine similarity search
    
    const replies = await this._getFilteredReplies(filters);
    
    // Calculate similarities
    const results = [];
    
    for (const reply of replies) {
      if (!reply.embedding) continue;
      
      try {
        // Convert buffer to Float32Array
        const embedding = new Float32Array(reply.embedding);
        const similarity = this._cosineSimilarity(queryEmbedding, embedding);
        
        results.push({
          reply_id: reply.id,
          similarity,
          prompt: reply.prompt,
          output: reply.output,
          user_id: reply.user_id,
          created_at: reply.created_at
        });
      } catch (error) {
        console.error(`Failed to compare reply ${reply.id}:`, error.message);
      }
    }
    
    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results.slice(0, topK);
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * @param {Float32Array} a - Vector A
   * @param {Float32Array} b - Vector B
   * @returns {number} Similarity score (0-1)
   */
  _cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Get RAG context for a query
   * @param {string} query - User query
   * @param {Object} filters - Search filters
   * @returns {Promise<string>} RAG context
   */
  async getRagContext(query, filters = {}) {
    const similar = await this.searchSimilar(query, 3, filters);
    
    if (similar.length === 0) {
      return '';
    }
    
    // Format context
    const contextParts = similar.map((item, index) => {
      return `Previous similar request ${index + 1}:
Prompt: ${item.prompt}
Response: ${item.output}
---
`;
    });
    
    return `Context from past similar requests:
${contextParts.join('\n')}
Current request:
${query}`;
  }
  
  /**
   * Get embedding statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    const [total, indexed, models] = await Promise.all([
      db.fetchOne(`SELECT COUNT(*) as count FROM replies`),
      db.fetchOne(`SELECT COUNT(*) as count FROM replies WHERE embedding IS NOT NULL`),
      db.fetchOne(`SELECT COUNT(DISTINCT model) as count FROM vector_metadata`)
    ]);
    
    const indexedPercentage = total.count > 0 ? (indexed.count / total.count) * 100 : 0;
    
    return {
      total_replies: total.count || 0,
      indexed_replies: indexed.count || 0,
      indexed_percentage: indexedPercentage.toFixed(2) + '%',
      embedding_models: models.count || 0,
      dimension: this.dimension
    };
  }
  
  /**
   * Get filtered replies for search
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} Filtered replies
   */
  async _getFilteredReplies(filters) {
    let query = `SELECT * FROM replies WHERE embedding IS NOT NULL`;
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
    
    return db.fetchAll(query, params);
  }
  
  /**
   * Delete embedding for a reply
   * @param {string} replyId - Reply ID
   * @returns {Promise<void>}
   */
  async deleteEmbedding(replyId) {
    await db.execute(`
      UPDATE replies 
      SET embedding = NULL 
      WHERE id = ?
    `, [replyId]);
    
    await db.execute(`
      DELETE FROM vector_metadata 
      WHERE reply_id = ?
    `, [replyId]);
  }
  
  /**
   * Rebuild all embeddings
   * @returns {Promise<number>} Total embeddings rebuilt
   */
  async rebuildAllEmbeddings() {
    // First, clear all existing embeddings
    await db.execute(`
      UPDATE replies 
      SET embedding = NULL
    `);
    
    await db.execute(`
      DELETE FROM vector_metadata
    `);
    
    // Then index all replies
    return this.indexAllReplies();
  }
  
  /**
   * Export embeddings to file
   * @param {string} format - Export format (json, binary)
   * @returns {Promise<Object>} Export result
   */
  async exportEmbeddings(format = 'json') {
    const embeddings = await db.fetchAll(`
      SELECT r.id, r.prompt, r.output, r.embedding, v.model, v.dimension
      FROM replies r
      JOIN vector_metadata v ON r.id = v.reply_id
      WHERE r.embedding IS NOT NULL
    `);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `embeddings-${timestamp}.${format}`;
    
    let content;
    
    if (format === 'json') {
      content = JSON.stringify(embeddings.map(emb => ({
        reply_id: emb.id,
        prompt: emb.prompt,
        output: emb.output,
        embedding: Array.from(new Float32Array(emb.embedding)),
        model: emb.model,
        dimension: emb.dimension
      })), null, 2);
    } else {
      // Binary format would be more efficient for large datasets
      throw new Error('Binary export not yet implemented');
    }
    
    return {
      format,
      count: embeddings.length,
      filename,
      content
    };
  }
}

export default new VectorService();