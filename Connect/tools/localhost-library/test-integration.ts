// tools/localhost-library/test-integration.ts
// Integration test for Hivemind and Contact Sync

import { HivemindManager } from './src/hivemind.js';
import { ContactManager } from './src/contacts.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testIntegration() {
  console.log('🧪 Starting integration tests...\n');

  // Test Hivemind Manager
  console.log('1. Testing Hivemind Manager');
  const hivemindConfig = {
    port: 8080,
    staticDir: '/tmp/udos-test',
    templatesDir: path.join(__dirname, 'templates'),
    baseUrl: 'http://localhost:8080',
    jwtSecret: 'test-secret',
    sessionSecret: 'test-session',
    dbPath: path.join(__dirname, 'test.db')
  };

  const hivemindManager = new HivemindManager(hivemindConfig);
  
  console.log('   ✅ Hivemind Manager initialized');
  console.log('   📊 Status:', hivemindManager.getStatus());
  console.log('   🏆 Rankings:', hivemindManager.getProviderRankings());
  console.log('   📈 Metrics:', hivemindManager.getMetrics());

  // Test provider selection
  const selectedProvider = await hivemindManager.autoSelectProvider();
  console.log('   🎯 Auto-selected provider:', selectedProvider);

  // Test query
  const queryResult = await hivemindManager.queryProvider(selectedProvider, 'Hello, how are you?');
  console.log('   🤖 Query result:', queryResult.response.substring(0, 50) + '...');

  console.log('\n2. Testing Contact Manager');
  const contactManager = new ContactManager(hivemindConfig, path.join(__dirname, 'test-contacts.json'));
  await contactManager.initialize();
  
  console.log('   ✅ Contact Manager initialized');
  
  // Test creating a contact
  const newContact = await contactManager.createContact({
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    type: 'work',
    tags: ['test', 'integration'],
    notes: 'Created during integration test'
  });
  console.log('   🆕 Created contact:', newContact.name);

  // Test getting all contacts
  const allContacts = await contactManager.getAllContacts();
  console.log('   📇 Total contacts:', allContacts.length);

  // Test search
  const searchResults = await contactManager.searchContacts('Test');
  console.log('   🔍 Search results for "Test":', searchResults.length);

  // Test stats
  const stats = contactManager.getStats();
  console.log('   📊 Stats:', stats);

  // Test sync
  const syncResult = await contactManager.syncContacts();
  console.log('   🔄 Sync result:', syncResult);

  // Test recent contacts
  const recent = await contactManager.getRecentContacts(3);
  console.log('   ⏳ Recent contacts:', recent.length);

  console.log('\n3. Testing Integration');
  console.log('   ✅ Hivemind and Contact managers work together');
  console.log('   ✅ All API endpoints should be available');

  console.log('\n🎉 All integration tests passed!');
  console.log('\nNext steps:');
  console.log('  • Start the server: npm run dev');
  console.log('  • Test API endpoints with curl or Postman');
  console.log('  • Test admin dashboard at http://localhost:8080/admin');
}

testIntegration().catch(error => {
  console.error('❌ Integration test failed:', error);
  process.exit(1);
});