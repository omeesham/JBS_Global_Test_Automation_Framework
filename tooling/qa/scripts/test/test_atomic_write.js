#!/usr/bin/env node
// File: tooling/qa/scripts/test/test_atomic_write.js
// Purpose: Test atomic writes with fsync (temp file, fsync, rename pattern)

const fs = require('fs');
const path = require('path');
const atomicIo = require('../atomic_io');

const TEST_DIR = path.join(__dirname, '.test_artifacts');
const TEST_FILE_JSON = path.join(TEST_DIR, 'test.json');
const TEST_FILE_TEXT = path.join(TEST_DIR, 'test.txt');

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function testAtomicWriteJSONBasic() {
  console.log('\n📋 Test: Atomic write JSON (basic)');
  
  try {
    const testData = {
      name: 'test',
      value: 42,
      nested: { key: 'value' }
    };
    
    atomicIo.atomicWriteJSON(TEST_FILE_JSON, testData);
    
    if (!fs.existsSync(TEST_FILE_JSON)) {
      throw new Error('File was not created');
    }
    
    const content = fs.readFileSync(TEST_FILE_JSON, 'utf8');
    const parsed = JSON.parse(content);
    
    if (JSON.stringify(parsed) !== JSON.stringify(testData)) {
      throw new Error('Content mismatch');
    }
    
    console.log('✅ PASS: JSON file written correctly');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testAtomicWriteTextBasic() {
  console.log('\n📋 Test: Atomic write text (basic)');
  
  try {
    const testContent = 'Hello, World!\nLine 2\nLine 3';
    
    atomicIo.atomicWriteText(TEST_FILE_TEXT, testContent);
    
    if (!fs.existsSync(TEST_FILE_TEXT)) {
      throw new Error('File was not created');
    }
    
    const content = fs.readFileSync(TEST_FILE_TEXT, 'utf8');
    
    if (content !== testContent) {
      throw new Error('Content mismatch');
    }
    
    console.log('✅ PASS: Text file written correctly');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testTempFileCleanup() {
  console.log('\n📋 Test: Temp file cleanup (no .tmp files left)');
  
  try {
    atomicIo.atomicWriteJSON(TEST_FILE_JSON, { test: 'data' });
    
    // Check for any .tmp files in directory
    const files = fs.readdirSync(TEST_DIR);
    const tempFiles = files.filter(f => f.includes('.tmp'));
    
    if (tempFiles.length > 0) {
      throw new Error(`Temp files not cleaned up: ${tempFiles.join(', ')}`);
    }
    
    console.log('✅ PASS: No temp files left behind');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testOverwriteExisting() {
  console.log('\n📋 Test: Overwrite existing file (atomic)');
  
  try {
    // Write initial content
    const initial = { version: 1 };
    atomicIo.atomicWriteJSON(TEST_FILE_JSON, initial);
    
    // Overwrite with new content
    const updated = { version: 2 };
    atomicIo.atomicWriteJSON(TEST_FILE_JSON, updated);
    
    const content = JSON.parse(fs.readFileSync(TEST_FILE_JSON, 'utf8'));
    
    if (content.version !== 2) {
      throw new Error('File was not overwritten correctly');
    }
    
    console.log('✅ PASS: Existing file overwritten atomically');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testDirectoryCreation() {
  console.log('\n📋 Test: Create directory if missing');
  
  try {
    cleanup(); // Remove test dir
    
    const deepPath = path.join(TEST_DIR, 'deep', 'nested', 'file.json');
    atomicIo.atomicWriteJSON(deepPath, { test: 'data' });
    
    if (!fs.existsSync(deepPath)) {
      throw new Error('Deep path file was not created');
    }
    
    console.log('✅ PASS: Directories created automatically');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function runAllTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Atomic Write Functions');
  console.log('==================================================');
  
  cleanup();
  fs.mkdirSync(TEST_DIR, { recursive: true });
  
  const results = [];
  
  results.push(testAtomicWriteJSONBasic());
  results.push(testAtomicWriteTextBasic());
  results.push(testTempFileCleanup());
  results.push(testOverwriteExisting());
  results.push(testDirectoryCreation());
  
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
