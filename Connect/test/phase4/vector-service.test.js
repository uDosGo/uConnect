import assert from 'assert';
import VectorService from '../../core/src/vector/service.js';
import db from '../../core/src/db.js';

const testReplyId = 'r_test_vector';
const testThreadId = 't_test_vector';

async function setupTestData() {
  console.log('🔧 Setting up test data...');
  
  // Add test user if not exists
  try {
    await db.execute(
      `INSERT INTO users (id, username, email, password_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      ['test_user', 'test_user', 'test@example.com', 'hashed_password']
    );
  } catch (error) {
    // User already exists, ignore
  }
  
  // Clean up test data
  await db.execute('DELETE FROM replies WHERE id = ?', [testReplyId]);
  await db.execute('DELETE FROM vector_metadata WHERE reply_id = ?', [testReplyId]);
  
  // Insert test reply
  await db.execute(
    `INSERT INTO replies (id, thread_id, user_id, prompt, output, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [testReplyId, testThreadId, 'test_user', 'Test prompt', 'Test output']
  );
  
  // Verify insertion
  const reply = await db.fetchOne('SELECT * FROM replies WHERE id = ?', [testReplyId]);
  console.log('✅ Test data inserted:', reply ? 'success' : 'failed');
}

async function cleanupTestData() {
  // Clean up test data
  await db.execute('DELETE FROM replies WHERE id = ?', [testReplyId]);
  await db.execute('DELETE FROM vector_metadata WHERE reply_id = ?', [testReplyId]);
}

async function testInitialize() {
  console.log('🧪 Testing #initialize()');
  
  // Note: This would actually load the ML model
  // For testing, we'll just check that the service is properly structured
  assert.ok(VectorService.modelName);
  assert.strictEqual(VectorService.dimension, 384);
  assert.strictEqual(VectorService.initialized, false);
  
  console.log('✅ Initialize test passed');
}

async function testCosineSimilarity() {
  console.log('🧪 Testing #_cosineSimilarity()');
  
  const a = new Float32Array([1, 0, 0]);
  const b = new Float32Array([1, 0, 0]);
  const c = new Float32Array([0, 1, 0]);
  
  const sim1 = VectorService._cosineSimilarity(a, b);
  const sim2 = VectorService._cosineSimilarity(a, c);
  
  assert.strictEqual(sim1, 1); // Identical vectors
  assert.strictEqual(sim2, 0); // Orthogonal vectors
  
  console.log('✅ Cosine similarity test passed');
}

async function testGetStats() {
  console.log('🧪 Testing #getStats()');
  
  const stats = await VectorService.getStats();
  
  assert.ok(stats);
  assert.ok(typeof stats.total_replies === 'number');
  assert.ok(typeof stats.indexed_replies === 'number');
  assert.ok(typeof stats.indexed_percentage === 'string');
  assert.ok(typeof stats.embedding_models === 'number');
  assert.strictEqual(stats.dimension, 384);
  
  console.log('✅ Get stats test passed');
}

async function testGetFilteredReplies() {
  console.log('🧪 Testing #_getFilteredReplies()');
  
  // First, add an embedding to our test reply so it gets included
  const embedding = await VectorService.generateEmbedding('Test prompt\nTest output');
  await db.execute('UPDATE replies SET embedding = ? WHERE id = ?', [embedding.buffer, testReplyId]);
  
  const replies = await VectorService._getFilteredReplies({});
  
  assert.ok(Array.isArray(replies));
  console.log('Replies found:', replies.length);
  console.log('Looking for reply:', testReplyId);
  
  // Should include our test reply
  assert.ok(replies.some(r => r.id === testReplyId));
  
  console.log('✅ Get filtered replies test passed');
}

async function testDeleteEmbedding() {
  console.log('🧪 Testing #deleteEmbedding()');
  
  // This should not fail even if embedding doesn't exist
  await VectorService.deleteEmbedding(testReplyId);
  
  // Verify deletion
  const reply = await db.fetchOne('SELECT embedding FROM replies WHERE id = ?', [testReplyId]);
  assert.strictEqual(reply.embedding, null);
  
  console.log('✅ Delete embedding test passed');
}

async function runTests() {
  console.log('🚀 Starting VectorService tests...\n');
  
  try {
    await setupTestData();
    
    await testInitialize();
    await testCosineSimilarity();
    await testGetStats();
    await testGetFilteredReplies();
    await testDeleteEmbedding();
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await cleanupTestData();
  }
}

runTests();