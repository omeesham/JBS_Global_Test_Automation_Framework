#!/usr/bin/env node
// File: tooling/qa/scripts/test/test_agent_helpers.js
// Purpose: Test agent helper functions (especially safe auto-fix)

const fs = require('fs');
const path = require('path');
const agentHelpers = require('../agent_helpers');

const TEST_DIR = path.join(__dirname, '.test_artifacts');
const TEST_FILE = path.join(TEST_DIR, 'test.ts');

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function setup() {
  cleanup();
  fs.mkdirSync(TEST_DIR, { recursive: true });
  
  const content = `function fetchUser(id: string) {
  const response = await fetch(\`/api/users/\${id}\`);
  return await response.json();
}

console.log("Debug message");

// TODO: Add error handling
`;
  
  fs.writeFileSync(TEST_FILE, content);
}

function testPerformQAReview() {
  console.log('\n📋 Test: performQAReview() basic heuristics');
  
  try {
    const findings = agentHelpers.performQAReview([TEST_FILE]);
    
    if (!findings.includes('API calls found without try-catch')) {
      throw new Error('Missing try-catch not detected');
    }
    
    if (!findings.includes('console.log')) {
      throw new Error('console.log not detected');
    }
    
    console.log('✅ PASS: QA review detects basic issues');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testCountIssues() {
  console.log('\n📋 Test: countIssues() parses markdown');
  
  try {
    const markdown = `
# Findings

## 🔴 Critical Issue
Something bad

## 🟡 Medium Issue  
Something concerning

## 🟢 Minor Issue
Something small
`;
    
    const count = agentHelpers.countIssues(markdown);
    
    if (count !== 3) {
      throw new Error(`Expected 3 issues, got ${count}`);
    }
    
    console.log('✅ PASS: Issue counting works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testValidateFinding() {
  console.log('\n📋 Test: validateFinding() checks files and lines');
  
  try {
    // Valid file
    const result1 = agentHelpers.validateFinding(
      'Missing try-catch',
      TEST_FILE,
      1
    );
    
    if (!result1.valid) {
      throw new Error('Existing file should be valid');
    }
    console.log('  ✓ Existing file validated');
    
    // Non-existent file
    const result2 = agentHelpers.validateFinding(
      'Missing try-catch',
      path.join(TEST_DIR, 'does_not_exist.ts'),
      1
    );
    
    if (result2.valid) {
      throw new Error('Non-existent file should be invalid');
    }
    console.log('  ✓ Non-existent file rejected');
    
    // Line out of range
    const result3 = agentHelpers.validateFinding(
      'Missing try-catch',
      TEST_FILE,
      9999
    );
    
    if (result3.valid) {
      throw new Error('Line out of range should be invalid');
    }
    console.log('  ✓ Line out of range rejected');
    
    console.log('✅ PASS: Finding validation works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testApplyAutoFixSafety() {
  console.log('\n📋 Test: applyAutoFix() does NOT mutate files');
  
  try {
    const originalContent = fs.readFileSync(TEST_FILE, 'utf8');
    
    const validation = {
      filePath: TEST_FILE,
      lineNumber: 1,
      issueType: 'missing_try_catch',
      issueText: 'No try-catch around fetch'
    };
    
    const result = agentHelpers.applyAutoFix(validation);
    
    // Check returned object
    if (result.applied !== false) {
      throw new Error('applyAutoFix should return applied: false');
    }
    
    if (!result.patch) {
      throw new Error('applyAutoFix should return patch suggestion');
    }
    
    if (result.patch.length === 0) {
      throw new Error('Patch should not be empty');
    }
    
    console.log('  ✓ Returns patch with applied: false');
    
    // CRITICAL: Verify file was NOT modified
    const currentContent = fs.readFileSync(TEST_FILE, 'utf8');
    
    if (currentContent !== originalContent) {
      throw new Error('SECURITY VIOLATION: applyAutoFix() modified the file!');
    }
    
    console.log('  ✓ File NOT modified (safety verified)');
    
    console.log('✅ PASS: applyAutoFix is safe (patch-only)');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testGenerateFeedback() {
  console.log('\n📋 Test: generateFeedback() formats validations');
  
  try {
    const validations = [
      {
        findingTitle: 'Missing error handling',
        claim: 'No try-catch',
        validation: 'VALID',
        evidence: 'Line 1: const response = await fetch(...)',
        explanation: 'Confirmed - no error handling'
      },
      {
        findingTitle: 'Type issue',
        claim: 'Wrong return type',
        validation: 'FALSE_ALARM',
        evidence: 'Tests pass with new type',
        explanation: 'This was intentional refactor',
        mistakePattern: 'Flagging intentional improvements'
      }
    ];
    
    const feedback = agentHelpers.generateFeedback(validations);
    
    if (!feedback.includes('✅ VALID')) {
      throw new Error('Valid finding not marked');
    }
    
    if (!feedback.includes('❌ FALSE ALARM')) {
      throw new Error('False alarm not marked');
    }
    
    if (!feedback.includes('Summary')) {
      throw new Error('Summary not included');
    }
    
    console.log('✅ PASS: Feedback generation works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function runAllTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Agent Helper Functions');
  console.log('==================================================');
  
  setup();
  
  const results = [];
  
  results.push(testCountIssues());
  results.push(testValidateFinding());
  results.push(testApplyAutoFixSafety());
  results.push(testGenerateFeedback());
  
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
