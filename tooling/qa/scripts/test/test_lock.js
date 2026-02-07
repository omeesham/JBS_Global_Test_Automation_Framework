#!/usr/bin/env node
// File: tooling/qa/scripts/test/test_lock.js
// Purpose: Test async lock acquisition (non-blocking, stale detection, concurrent)

const fs = require('fs');
const path = require('path');
const atomicIo = require('../atomic_io');

const TEST_DIR = path.join(__dirname, '.test_artifacts');
const LOCK_PATH = path.join(TEST_DIR, 'test.lock');

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

async function testAsyncLockAcquisition() {
  console.log('\n📋 Test: Async lock acquisition (non-blocking)');
  
  try {
    const startTime = Date.now();
    const releaseLock = await atomicIo.acquireLock(LOCK_PATH, 5000);
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      throw new Error(`Lock acquisition took ${duration}ms (should be instant for new lock)`);
    }
    
    console.log(`✅ PASS: Lock acquired in ${duration}ms`);
    releaseLock();
    
    if (fs.existsSync(LOCK_PATH)) {
      throw new Error('Lock file still exists after release');
    }
    
    console.log('✅ PASS: Lock released correctly');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

async function testStaleLockDetection() {
  console.log('\n📋 Test: Stale lock detection and removal');
  
  try {
    // Create a stale lock (31 seconds old)
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
    
    fs.writeFileSync(LOCK_PATH, JSON.stringify({
      pid: 99999,
      timestamp: Date.now() - 31000, // 31 seconds ago
      hostname: 'test-host'
    }));
    
    console.log('  Created stale lock (31s old)');
    
    // Try to acquire - should remove stale lock and succeed
    const releaseLock = await atomicIo.acquireLock(LOCK_PATH, 5000);
    console.log('✅ PASS: Stale lock removed and new lock acquired');
    
    releaseLock();
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

async function testConcurrentLockAttempts() {
  console.log('\n📋 Test: Concurrent lock attempts (one succeeds, others wait)');
  
  try {
    // First acquire locks
    const releaseLock1 = await atomicIo.acquireLock(LOCK_PATH, 5000);
    console.log('  Lock 1 acquired');
    
    // Try to acquire second lock (should timeout quickly)
    const startTime = Date.now();
    
    try {
      await atomicIo.acquireLock(LOCK_PATH, 1000); // 1 second timeout
      throw new Error('Second lock should not have been acquired');
    } catch (lockError) {
      const duration = Date.now() - startTime;
      
      if (duration < 900 || duration > 1500) {
        throw new Error(`Timeout duration ${duration}ms unexpected (should be ~1000ms)`);
      }
      
      console.log(`✅ PASS: Second lock timed out after ${duration}ms`);
    }
    
    // Release first lock
    releaseLock1();
    
    // Now second lock should acquire immediately
    const releaseLock2 = await atomicIo.acquireLock(LOCK_PATH, 5000);
    console.log('✅ PASS: Lock acquired after first was released');
    
    releaseLock2();
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Async Lock Functions');
  console.log('==================================================');
  
  cleanup();
  
  const results = [];
  
  results.push(await testAsyncLockAcquisition());
  cleanup();
  
  results.push(await testStaleLockDetection());
  cleanup();
  
  results.push(await testConcurrentLockAttempts());
  cleanup();
  
  console.log('\n==================================================');
  console.log('RESULTS');
  console.log('==================================================');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  return passed === total;
}

if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error(`Fatal error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runAllTests };
