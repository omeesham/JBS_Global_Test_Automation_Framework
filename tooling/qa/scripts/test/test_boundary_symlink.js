#!/usr/bin/env node
// File: tooling/qa/scripts/test/test_boundary_symlink.js
// Purpose: Test symlink-safe boundary validation

const fs = require('fs');
const path = require('path');
const atomicIo = require('../atomic_io');

const TEST_DIR = path.join(__dirname, '.test_artifacts');
const ALLOWED_DIR = path.join(TEST_DIR, 'allowed');
const FORBIDDEN_DIR = path.join(TEST_DIR, 'forbidden');
const SYMLINK_PATH = path.join(ALLOWED_DIR, 'symlink_to_forbidden');

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    // Remove symlink first (if exists)
    if (fs.existsSync(SYMLINK_PATH)) {
      fs.unlinkSync(SYMLINK_PATH);
    }
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function setup() {
  cleanup();
  fs.mkdirSync(ALLOWED_DIR, { recursive: true });
  fs.mkdirSync(FORBIDDEN_DIR, { recursive: true });
  
  // Create test files
  fs.writeFileSync(path.join(ALLOWED_DIR, 'allowed.txt'), 'allowed');
  fs.writeFileSync(path.join(FORBIDDEN_DIR, 'forbidden.txt'), 'forbidden');
}

function testDirectPathValidation() {
  console.log('\n📋 Test: Direct path validation (no symlinks)');
  
  try {
    const allowedFile = path.join(ALLOWED_DIR, 'allowed.txt');
    const forbiddenFile = path.join(FORBIDDEN_DIR, 'forbidden.txt');
    
    // Test allowed path
    const result1 = atomicIo.validateBoundary(allowedFile, [ALLOWED_DIR]);
    if (!result1.valid) {
      throw new Error(`Allowed file rejected: ${result1.error}`);
    }
    console.log('  ✓ Allowed file accepted');
    
    // Test forbidden path
    const result2 = atomicIo.validateBoundary(forbiddenFile, [ALLOWED_DIR]);
    if (result2.valid) {
      throw new Error('Forbidden file should be rejected');
    }
    console.log('  ✓ Forbidden file rejected');
    
    console.log('✅ PASS: Direct path validation works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testSymlinkDetection() {
  console.log('\n📋 Test: Symlink detection (prevents bypass)');
  
  try {
    // Create symlink from allowed dir to forbidden file
    const forbiddenFile = path.join(FORBIDDEN_DIR, 'forbidden.txt');
    
    try {
      fs.symlinkSync(forbiddenFile, SYMLINK_PATH, 'file');
    } catch (err) {
      if (err.code === 'EPERM') {
        console.log('⚠️  SKIP: Symlink creation requires admin privileges on Windows');
        return true; // Skip test on Windows without admin
      }
      throw err;
    }
    
    console.log('  Created symlink: allowed/symlink_to_forbidden -> forbidden/forbidden.txt');
    
    // Try to validate symlink - should resolve to real path and reject
    const result = atomicIo.validateBoundary(SYMLINK_PATH, [ALLOWED_DIR]);
    
    if (result.valid) {
      throw new Error('Symlink to forbidden file should be rejected after resolution');
    }
    
    console.log('  ✓ Symlink resolved and rejected');
    console.log(`  Resolved path: ${result.resolvedPath}`);
    
    console.log('✅ PASS: Symlink bypass prevented');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testNonExistentPath() {
  console.log('\n📋 Test: Non-existent path validation');
  
  try {
    const nonExistent = path.join(ALLOWED_DIR, 'does_not_exist.txt');
    
    // Should still validate based on directory
    const result = atomicIo.validateBoundary(nonExistent, [ALLOWED_DIR]);
    
    if (!result.valid) {
      throw new Error(`Non-existent file in allowed dir should be valid: ${result.error}`);
    }
    
    console.log('  ✓ Non-existent file in allowed dir accepted');
    console.log(`  Resolved path: ${result.resolvedPath}`);
    
    console.log('✅ PASS: Non-existent path validation works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testMultipleAllowedDirs() {
  console.log('\n📋 Test: Multiple allowed directories');
  
  try {
    const allowedDirs = [ALLOWED_DIR, FORBIDDEN_DIR];
    
    const file1 = path.join(ALLOWED_DIR, 'allowed.txt');
    const file2 = path.join(FORBIDDEN_DIR, 'forbidden.txt');
    
    // Both should now be valid
    const result1 = atomicIo.validateBoundary(file1, allowedDirs);
    if (!result1.valid) {
      throw new Error('File in first allowed dir rejected');
    }
    
    const result2 = atomicIo.validateBoundary(file2, allowedDirs);
    if (!result2.valid) {
      throw new Error('File in second allowed dir rejected');
    }
    
    console.log('  ✓ Files in multiple allowed dirs accepted');
    
    console.log('✅ PASS: Multiple allowed directories work');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function runAllTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Symlink-Safe Boundary Validation');
  console.log('==================================================');
  
  setup();
  
  const results = [];
  
  results.push(testDirectPathValidation());
  results.push(testSymlinkDetection());
  results.push(testNonExistentPath());
  results.push(testMultipleAllowedDirs());
  
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
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runAllTests };
