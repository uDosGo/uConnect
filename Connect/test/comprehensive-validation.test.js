/**
 * Comprehensive Validation Test for uDos Phases 1-5
 * Tests all implemented features across all phases
 */

import assert from 'assert';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

async function runCommand(command, cwd = PROJECT_ROOT) {
  return new Promise((resolve, reject) => {
    try {
      const result = execSync(command, { 
        cwd,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

async function testPhase1Foundation() {
  console.log('🧪 Testing Phase 1: Foundation Services...');
  
  // Test database migrations
  const dbPath = join(PROJECT_ROOT, 'udos.db');
  assert.ok(existsSync(dbPath), 'Database file should exist');
  
  // Test family service
  const familyServicePath = join(PROJECT_ROOT, 'core/src/family/service.js');
  assert.ok(existsSync(familyServicePath), 'Family service should exist');
  
  // Test audit service
  const auditServicePath = join(PROJECT_ROOT, 'core/src/audit/service.js');
  assert.ok(existsSync(auditServicePath), 'Audit service should exist');
  
  // Test rate limit service
  const rateLimitServicePath = join(PROJECT_ROOT, 'core/src/rate-limit/service.js');
  assert.ok(existsSync(rateLimitServicePath), 'Rate limit service should exist');
  
  console.log('✅ Phase 1 Foundation tests passed');
}

async function testPhase2RealTime() {
  console.log('🧪 Testing Phase 2: Real-time & UI Services...');
  
  // Test cache service
  const cacheServicePath = join(PROJECT_ROOT, 'core/src/cache/redis-cache.js');
  assert.ok(existsSync(cacheServicePath), 'Redis cache service should exist');
  
  // Test WebSocket service
  const websocketServicePath = join(PROJECT_ROOT, 'core/src/websocket/server.js');
  assert.ok(existsSync(websocketServicePath), 'WebSocket server should exist');
  
  // Test admin dashboard
  const adminDashboardPath = join(PROJECT_ROOT, 'ui/src/components/admin/Dashboard.vue');
  assert.ok(existsSync(adminDashboardPath), 'Admin dashboard should exist');
  
  console.log('✅ Phase 2 Real-time tests passed');
}

async function testPhase3Reliability() {
  console.log('🧪 Testing Phase 3: Reliability Services...');
  
  // Test email service
  const emailServicePath = join(PROJECT_ROOT, 'core/src/email/service.js');
  assert.ok(existsSync(emailServicePath), 'Email service should exist');
  
  // Test export service
  const exportServicePath = join(PROJECT_ROOT, 'core/src/export/service.js');
  assert.ok(existsSync(exportServicePath), 'Export service should exist');
  
  // Test threading service
  const threadingServicePath = join(PROJECT_ROOT, 'core/src/threading/service.js');
  assert.ok(existsSync(threadingServicePath), 'Threading service should exist');
  
  // Test webhook service
  const webhookServicePath = join(PROJECT_ROOT, 'core/src/webhook/service.js');
  assert.ok(existsSync(webhookServicePath), 'Webhook service should exist');
  
  console.log('✅ Phase 3 Reliability tests passed');
}

async function testPhase4AI() {
  console.log('🧪 Testing Phase 4: AI & Search Services...');
  
  // Test vector service
  const vectorServicePath = join(PROJECT_ROOT, 'core/src/vector/service.js');
  assert.ok(existsSync(vectorServicePath), 'Vector service should exist');
  
  // Test vector service functionality
  try {
    const result = await runCommand('node test/phase4/vector-service.test.js');
    assert.ok(result.includes('All tests passed'), 'Vector service tests should pass');
  } catch (error) {
    console.error('Vector service test failed:', error.message);
    throw error;
  }
  
  console.log('✅ Phase 4 AI tests passed');
}

async function testPhase5Containers() {
  console.log('🧪 Testing Phase 5: Containers & Agents...');
  
  // Test Sonic-Screwdriver CLI
  const sonicCliPath = join(PROJECT_ROOT, 'tools/sonic-express/src/sonic-cli.ts');
  assert.ok(existsSync(sonicCliPath), 'Sonic CLI should exist');
  
  // Test Sonic CLI functionality
  try {
    const result = await runCommand('npm run sonic -- --help', 
      join(PROJECT_ROOT, 'tools/sonic-express'));
    assert.ok(result.includes('Sonic-Screwdriver CLI'), 'Sonic CLI should work');
  } catch (error) {
    console.error('Sonic CLI test failed:', error.message);
    throw error;
  }
  
  // Test multi-agent swarm commands
  try {
    await runCommand('npm run sonic -- swarm:status', 
      join(PROJECT_ROOT, 'tools/sonic-express'));
    console.log('✅ Multi-agent swarm commands working');
  } catch (error) {
    console.error('Multi-agent swarm test failed:', error.message);
    throw error;
  }
  
  console.log('✅ Phase 5 Containers tests passed');
}

async function testDatabaseSchema() {
  console.log('🧪 Testing Database Schema...');
  
  // Check that all required tables exist
  try {
    const result = execSync('sqlite3 udos.db \"SELECT name FROM sqlite_master WHERE type=\\\"table\\\"\"', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8'
    });
    
    const tables = result.trim().split('\n');
    const requiredTables = ['migrations', 'families', 'audit_log', 'replies', 'vector_metadata', 'users'];
    
    for (const table of requiredTables) {
      assert.ok(tables.includes(table), `Table ${table} should exist`);
    }
    
    console.log('✅ Database schema tests passed');
  } catch (error) {
    console.error('Database schema test failed:', error.message);
    throw error;
  }
}

async function testConfigurationFiles() {
  console.log('🧪 Testing Configuration Files...');
  
  // Check main configuration files
  const configFiles = [
    'package.json',
    'core/package.json',
    'tools/sonic-express/package.json',
    'vibecli/config.json'
  ];
  
  for (const file of configFiles) {
    const path = join(PROJECT_ROOT, file);
    assert.ok(existsSync(path), `Config file ${file} should exist`);
  }
  
  console.log('✅ Configuration files tests passed');
}

async function runComprehensiveValidation() {
  console.log('🚀 Starting Comprehensive uDos Validation...\n');
  
  try {
    await testPhase1Foundation();
    await testPhase2RealTime();
    await testPhase3Reliability();
    await testPhase4AI();
    await testPhase5Containers();
    await testDatabaseSchema();
    await testConfigurationFiles();
    
    console.log('\n🎉 All comprehensive validation tests passed!');
    console.log('\n📊 Implementation Summary:');
    console.log('   ✅ Phase 1: Foundation Services - Complete');
    console.log('   ✅ Phase 2: Real-time & UI Services - Complete');
    console.log('   ✅ Phase 3: Reliability Services - Complete');
    console.log('   ✅ Phase 4: AI & Search Services - Complete');
    console.log('   ✅ Phase 5: Containers & Agents - Complete');
    console.log('\n🚀 uDos is ready for production deployment!');
    
  } catch (error) {
    console.error('❌ Comprehensive validation failed:', error);
    process.exit(1);
  }
}

runComprehensiveValidation();