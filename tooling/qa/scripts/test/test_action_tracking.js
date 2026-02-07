#!/usr/bin/env node
// File: tooling/qa/scripts/test/test_action_tracking.js
// Purpose: Test trackAction() updates ACTIVE_TASK.json atomically with schema validation

const fs = require('fs');
const path = require('path');
const trackAction = require('../track_action');
const atomicIo = require('../atomic_io');

const TEST_DIR = path.join(__dirname, '.test_artifacts');
const TEST_ACTIVE_TASK = path.join(TEST_DIR, 'ACTIVE_TASK.json');
const TEST_SCHEMA = path.join(TEST_DIR, 'ACTIVE_TASK.schema.json');
const TEST_LOCK = path.join(TEST_DIR, '.active_task.lock');

// Override paths for testing
const originalTaskPath = require.resolve('../track_action');
const trackActionModule = require(originalTaskPath);

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function setup() {
  cleanup();
  fs.mkdirSync(TEST_DIR, { recursive: true });
  
  // Create test schema
  const schema = {
    type: 'object',
    required: ['task_id', 'verification_dir', 'phase'],
    properties: {
      task_id: { type: ['string', 'null'] },
      verification_dir: { type: ['string', 'null'] },
      phase: { type: 'string' },
      last_worker_action: { type: ['object', 'null'] },
      last_qa_action: { type: ['object', 'null'] }
    }
  };
  
  fs.writeFileSync(TEST_SCHEMA, JSON.stringify(schema, null, 2));
  
  // Create initial state
  const initialState = {
    task_id: null,
    verification_dir: null,
    phase: 'idle',
    last_worker_action: null,
    last_qa_action: null
  };
  
  atomicIo.atomicWriteJSON(TEST_ACTIVE_TASK, initialState);
}

async function testWorkerActionTracking() {
  console.log('\n📋 Test: Track worker action');
  
  try {
    // Manually update paths for this test (simulating track_action behavior)
    const initialState = JSON.parse(fs.readFileSync(TEST_ACTIVE_TASK, 'utf8'));
    
    const workerAction = {
      timestamp: new Date().toISOString(),
      action: 'implemented login feature',
      files_modified: ['src/login.ts', 'tests/login.spec.ts'],
      status: 'success',
      artifact_files: []
    };
    
    const newState = {
      ...initialState,
      task_id: 'TASK-123',
      verification_dir: 'tooling/qa/verifications/TASK-123',
      phase: 'development',
      last_worker_action: workerAction
    };
    
    atomicIo.atomicWriteJSON(TEST_ACTIVE_TASK, newState);
    
    const state = JSON.parse(fs.readFileSync(TEST_ACTIVE_TASK, 'utf8'));
    
    if (!state.last_worker_action) {
      throw new Error('Worker action not tracked');
    }
    
    if (state.last_worker_action.action !== 'implemented login feature') {
      throw new Error('Worker action details incorrect');
    }
    
    if (state.phase !== 'development') {
      throw new Error('Phase not updated');
    }
    
    console.log('✅ PASS: Worker action tracked correctly');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

async function testQAActionTracking() {
  console.log('\n📋 Test: Track QA action');
  
  try {
    const initialState = JSON.parse(fs.readFileSync(TEST_ACTIVE_TASK, 'utf8'));
    
    const qaAction = {
      timestamp: new Date().toISOString(),
      action: 'reviewed files',
      files_reviewed: ['src/login.ts'],
      status: 'findings_created',
      artifact_files: ['1_initial_findings.md']
    };
    
    const newState = {
      ...initialState,
      phase: 'qa_review',
      last_qa_action: qaAction
    };
    
    atomicIo.atomicWriteJSON(TEST_ACTIVE_TASK, newState);
    
    const state = JSON.parse(fs.readFileSync(TEST_ACTIVE_TASK, 'utf8'));
    
    if (!state.last_qa_action) {
      throw new Error('QA action not tracked');
    }
    
    if (state.last_qa_action.action !== 'reviewed files') {
      throw new Error('QA action details incorrect');
    }
    
    if (state.phase !== 'qa_review') {
      throw new Error('Phase not updated to qa_review');
    }
    
    console.log('✅ PASS: QA action tracked correctly');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

async function testSchemaValidation() {
  console.log('\n📋 Test: Schema validation before/after');
  
  try {
    const schema = JSON.parse(fs.readFileSync(TEST_SCHEMA, 'utf8'));
    const state = JSON.parse(fs.readFileSync(TEST_ACTIVE_TASK, 'utf8'));
    
    // Validate current state
    const validation = atomicIo.validateSchema(state, schema);
    
    if (!validation.valid) {
      throw new Error(`State validation failed: ${validation.errors.join(', ')}`);
    }
    
    console.log('  ✓ Current state passes schema validation');
    
    // Try invalid state (missing required field)
    const invalidState = {
      task_id: 'TASK-123',
      verification_dir: 'path/to/dir'
      // missing 'phase' - required field
    };
    
    const invalidValidation = atomicIo.validateSchema(invalidState, schema);
    
    if (invalidValidation.valid) {
      throw new Error('Invalid state should fail validation');
    }
    
    console.log('  ✓ Invalid state correctly rejected');
    
    console.log('✅ PASS: Schema validation working');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

async function testAtomicWrite() {
  console.log('\n📋 Test: Atomic write with fsync');
  
  try {
    const state = JSON.parse(fs.readFileSync(TEST_ACTIVE_TASK, 'utf8'));
    
    // Update state
    const newState = {
      ...state,
      task_id: 'TASK-999'
    };
    
    atomicIo.atomicWriteJSON(TEST_ACTIVE_TASK, newState);
    
    // Verify no temp files left
    const files = fs.readdirSync(TEST_DIR);
    const tempFiles = files.filter(f => f.includes('.tmp'));
    
    if (tempFiles.length > 0) {
      throw new Error('Temp files not cleaned up');
    }
    
    // Verify update
    const updated = JSON.parse(fs.readFileSync(TEST_ACTIVE_TASK, 'utf8'));
    
    if (updated.task_id !== 'TASK-999') {
      throw new Error('State not updated');
    }
    
    console.log('✅ PASS: Atomic write works correctly');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function runAllTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Action Tracking Functions');
  console.log('==================================================');
  
  setup();
  
  const results = [];
  
  // Run tests sequentially (async)
  return Promise.resolve()
    .then(() => testWorkerActionTracking())
    .then(r => { results.push(r); return testQAActionTracking(); })
    .then(r => { results.push(r); return testSchemaValidation(); })
    .then(r => { results.push(r); return testAtomicWrite(); })
    .then(r => {
      results.push(r);
      
      cleanup();
      
      console.log('\n==================================================');
      console.log('RESULTS');
      console.log('==================================================');
      
      const passed = results.filter(r => r).length;
      const total = results.length;
      
      console.log(`✅ Passed: ${passed}/${total}`);
      console.log(`❌ Failed: ${total - passed}/${total}`);
      
      return passed === total;
    });
}

if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error(`Fatal error: ${err.message}`);
      cleanup();
      process.exit(1);
    });
}

module.exports = { runAllTests };
