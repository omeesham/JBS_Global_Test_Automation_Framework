#!/usr/bin/env node
// File: tooling/qa/scripts/pre_dev_check.js
// Purpose: Pre-development safety guard - validates environment before code changes
// Usage: node pre_dev_check.js --files file1.js,file2.js [--level full|light]

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const QA_ROOT = path.join(PROJECT_ROOT, 'tooling/qa');
const CURRENT_DIR = path.join(QA_ROOT, 'current');
const ACTIVE_TASK_PATH = path.join(CURRENT_DIR, 'ACTIVE_TASK.json');

// ============================================================================
// CONFIGURATION
// ============================================================================

const QA_PATHS = [
  'tooling/qa/**',
  'tooling/qa/enforcement/**',
  'tooling/qa/current/**',
  'tooling/qa/scripts/**'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function exec(command, silent = false) {
  try {
    const output = execSync(command, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: output ? output.trim() : '' };
  } catch (error) {
    return {
      success: false,
      output: error.stdout ? error.stdout.toString().trim() : '',
      error: error.stderr ? error.stderr.toString().trim() : error.message
    };
  }
}

function readActiveTask() {
  if (fs.existsSync(ACTIVE_TASK_PATH)) {
    return JSON.parse(fs.readFileSync(ACTIVE_TASK_PATH, 'utf8'));
  }
  return { task_id: null, verification_dir: null, phase: 'idle' };
}

function matchesQAPaths(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.startsWith('tooling/qa/');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ============================================================================
// PRE-CHECK FUNCTIONS
// ============================================================================

function runSmokeTests() {
  console.log('\n📋 Running smoke tests...\n');
  
  const modules = [
    'tooling/qa/scripts/atomic_io.js',
    'tooling/qa/scripts/track_action.js',
    'tooling/qa/scripts/agent_helpers.js'
  ];
  
  const results = [];
  
  for (const module of modules) {
    const modulePath = path.join(PROJECT_ROOT, module);
    
    if (!fs.existsSync(modulePath)) {
      results.push({
        module,
        success: false,
        error: 'Module file does not exist'
      });
      continue;
    }
    
    try {
      require(modulePath);
      console.log(`  ✅ ${module}`);
      results.push({ module, success: true });
    } catch (error) {
      console.log(`  ❌ ${module}: ${error.message}`);
      results.push({ module, success: false, error: error.message });
    }
  }
  
  return results;
}

function runGrepSafetyChecks() {
  console.log('\n📋 Running grep safety checks...\n');
  
  const checks = [
    {
      pattern: 'fsyncSync',
      description: 'fsync in atomic writes',
      required: true
    },
    {
      pattern: 'realpathSync',
      description: 'symlink resolution in boundaries',
      required: true
    },
    {
      pattern: 'async function acquireLock|await acquireLock',
      description: 'async lock acquisition',
      required: true
    },
    {
      pattern: 'while \\(Date\\.now\\(\\) <|while\\(true\\)',
      description: 'busy-wait loops (should NOT exist)',
      required: false,
      shouldNotExist: true
    },
    {
      pattern: 'validateSchema\\(|validateBoundary\\(',
      description: 'validation function calls',
      required: true
    }
  ];
  
  const results = [];
  const searchDir = path.join(PROJECT_ROOT, 'tooling/qa');
  
  for (const check of checks) {
    try {
      // Use grep or findstr depending on platform
      const isWindows = process.platform === 'win32';
      let command;
      
      if (isWindows) {
        // Windows: use PowerShell's Select-String
        command = `powershell -Command "Get-ChildItem -Path '${searchDir}' -Recurse -Include *.js | Select-String -Pattern '${check.pattern}' -SimpleMatch:$false"`;
      } else {
        // Unix: use grep
        command = `grep -r -E "${check.pattern}" "${searchDir}" --include="*.js"`;
      }
      
      const result = exec(command, true);
      
      const found = result.success && result.output.length > 0;
      const passed = check.shouldNotExist ? !found : found;
      
      if (passed) {
        console.log(`  ✅ ${check.description}`);
      } else {
        console.log(`  ❌ ${check.description}`);
      }
      
      results.push({
        check: check.description,
        pattern: check.pattern,
        found,
        passed,
        required: check.required
      });
      
    } catch (error) {
      console.log(`  ⚠️  ${check.description} (check failed: ${error.message})`);
      results.push({
        check: check.description,
        passed: !check.required,
        error: error.message
      });
    }
  }
  
  return results;
}

function runTestSuite() {
  console.log('\n📋 Running test suite...\n');
  
  const testScript = path.join(PROJECT_ROOT, 'tooling/qa/scripts/test/run_all_tests.js');
  
  if (!fs.existsSync(testScript)) {
    console.log('  ⚠️  Test suite not found, skipping');
    return { ran: false, success: true }; // Not critical
  }
  
  const result = exec(`node "${testScript}"`);
  
  return {
    ran: true,
    success: result.success,
    output: result.output,
    error: result.error
  };
}

function checkIdempotency(verificationDir) {
  console.log('\n📋 Checking idempotency (output files)...\n');
  
  const outputFiles = [
    '1_initial_findings.md',
    '2_review_request.md',
    '3_worker_feedback.md',
    'pre_dev_check.md'
  ];
  
  const existing = [];
  
  for (const file of outputFiles) {
    const filePath = path.join(verificationDir, file);
    if (fs.existsSync(filePath)) {
      existing.push(file);
      console.log(`  ⚠️  ${file} already exists`);
    }
  }
  
  if (existing.length === 0) {
    console.log('  ✅ No existing output files');
  }
  
  return { existing };
}

function checkDirectWrites() {
  console.log('\n📋 Checking for direct file writes...\n');
  
  try {
    const searchDir = path.join(PROJECT_ROOT, 'tooling/qa/scripts');
    const isWindows = process.platform === 'win32';
    
    let command;
    if (isWindows) {
      command = `powershell -Command "Get-ChildItem -Path '${searchDir}' -Recurse -Include *.js | Select-String -Pattern 'fs\\.writeFileSync\\(|fs\\.renameSync\\(' -SimpleMatch:$false | Where-Object { $_.Path -notmatch 'atomic_io\\.js' }"`;
    } else {
      command = `grep -r -E "fs\\.writeFileSync\\(|fs\\.renameSync\\(" "${searchDir}" --include="*.js" | grep -v atomic_io.js`;
    }
    
    const result = exec(command, true);
    
    if (result.success && result.output) {
      console.log('  ⚠️  Direct file writes found outside atomic_io.js:');
      console.log(result.output);
      return { found: true, details: result.output };
    } else {
      console.log('  ✅ No direct writes outside atomic_io.js');
      return { found: false };
    }
    
  } catch (error) {
    console.log(`  ⚠️  Check failed: ${error.message}`);
    return { found: false, error: error.message };
  }
}

// ============================================================================
// DECISION LOGIC
// ============================================================================

function determineCheckLevel(plannedFiles, activeTask) {
  // FULL check if any file touches QA paths
  for (const file of plannedFiles) {
    if (matchesQAPaths(file)) {
      return 'full';
    }
  }
  
  // FULL check if active verification workflow
  if (activeTask.verification_dir) {
    return 'full';
  }
  
  return 'light';
}

function runFullChecks(verificationDir) {
  const results = {
    smokeTests: runSmokeTests(),
    grepChecks: runGrepSafetyChecks(),
    testSuite: runTestSuite(),
    idempotency: checkIdempotency(verificationDir),
    directWrites: checkDirectWrites()
  };
  
  // Determine if all checks passed
  const smokePassed = results.smokeTests.every(t => t.success);
  const grepPassed = results.grepChecks.every(c => !c.required || c.passed);
  const testsPassed = !results.testSuite.ran || results.testSuite.success;
  const noDirectWrites = !results.directWrites.found;
  
  const allPassed = smokePassed && grepPassed && testsPassed && noDirectWrites;
  
  return { ...results, allPassed };
}

function runLightChecks() {
  const results = {
    smokeTests: runSmokeTests(),
    grepChecks: runGrepSafetyChecks()
  };
  
  const smokePassed = results.smokeTests.every(t => t.success);
  const grepPassed = results.grepChecks.every(c => !c.required || c.passed);
  
  const allPassed = smokePassed && grepPassed;
  
  return { ...results, allPassed };
}

// ============================================================================
// ARTIFACT CREATION
// ============================================================================

function createPreDevCheck(verificationDir, checkLevel, results, plannedFiles, decision) {
  ensureDir(verificationDir);
  
  const filePath = path.join(verificationDir, 'pre_dev_check.md');
  
  const content = [];
  
  content.push('# Pre-Development Check');
  content.push('');
  content.push(`**Timestamp:** ${new Date().toISOString()}`);
  content.push(`**Check Level:** ${checkLevel.toUpperCase()}`);
  content.push(`**Status:** ${decision}`);
  content.push('');
  
  content.push('## Planned Files');
  content.push('');
  plannedFiles.forEach(f => content.push(`- ${f}`));
  content.push('');
  
  content.push('## Checks Run');
  content.push('');
  
  // Smoke tests
  if (results.smokeTests) {
    content.push('### Smoke Tests');
    content.push('');
    results.smokeTests.forEach(t => {
      const status = t.success ? '✅' : '❌';
      content.push(`${status} \`${t.module}\``);
      if (t.error) content.push(`  - Error: ${t.error}`);
    });
    content.push('');
  }
  
  // Grep checks
  if (results.grepChecks) {
    content.push('### Safety Greps');
    content.push('');
    results.grepChecks.forEach(c => {
      const status = c.passed ? '✅' : '❌';
      content.push(`${status} ${c.check}`);
      if (c.error) content.push(`  - Error: ${c.error}`);
    });
    content.push('');
  }
  
  // Test suite
  if (results.testSuite && results.testSuite.ran) {
    content.push('### Test Suite');
    content.push('');
    content.push(results.testSuite.success ? '✅ All tests passed' : '❌ Some tests failed');
    content.push('');
  }
  
  // Idempotency
  if (results.idempotency) {
    content.push('### Idempotency Check');
    content.push('');
    if (results.idempotency.existing.length > 0) {
      content.push('⚠️  Existing output files:');
      results.idempotency.existing.forEach(f => content.push(`- ${f}`));
    } else {
      content.push('✅ No existing output files');
    }
    content.push('');
  }
  
  // Direct writes
  if (results.directWrites) {
    content.push('### Direct File Writes');
    content.push('');
    content.push(results.directWrites.found ? '⚠️  Direct writes found' : '✅ No direct writes');
    content.push('');
  }
  
  content.push('## Decision');
  content.push('');
  content.push(`**${decision}**`);
  content.push('');
  
  if (decision === 'FAIL') {
    content.push('See `pre_dev_fix_suggestions.md` for recommended fixes.');
  }
  
  fs.writeFileSync(filePath, content.join('\n'));
  
  return filePath;
}

function createFixSuggestions(verificationDir, results) {
  const filePath = path.join(verificationDir, 'pre_dev_fix_suggestions.md');
  
  const content = [];
  
  content.push('# Pre-Development Fix Suggestions');
  content.push('');
  content.push(`**Generated:** ${new Date().toISOString()}`);
  content.push('');
  
  content.push('## Issues Found');
  content.push('');
  
  // Smoke test failures
  const failedSmoke = results.smokeTests?.filter(t => !t.success) || [];
  if (failedSmoke.length > 0) {
    content.push('### Module Loading Errors');
    content.push('');
    failedSmoke.forEach(t => {
      content.push(`**${t.module}**`);
      content.push(`- Error: ${t.error}`);
      content.push(`- Fix: Ensure module exists and has no syntax errors`);
      content.push('');
    });
  }
  
  // Grep failures
  const failedGrep = results.grepChecks?.filter(c => c.required && !c.passed) || [];
  if (failedGrep.length > 0) {
    content.push('### Safety Feature Failures');
    content.push('');
    failedGrep.forEach(c => {
      content.push(`**${c.check}**`);
      content.push(`- Pattern: \`${c.pattern}\``);
      content.push(`- Found: ${c.found ? 'Yes' : 'No'}`);
      content.push(`- Fix: Implement this safety feature as designed`);
      content.push('');
    });
  }
  
  content.push('## Recommended Actions');
  content.push('');
  content.push('1. Review each fix suggestion above');
  content.push('2. Apply fixes in a feature branch');
  content.push('3. Re-run pre-dev check');
  content.push('4. Only proceed when check passes');
  content.push('');
  
  fs.writeFileSync(filePath, content.join('\n'));
  
  return filePath;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('==================================================');
  console.log('PRE-DEVELOPMENT SAFETY CHECK');
  console.log('==================================================');
  
  // Parse arguments
  const args = process.argv.slice(2);
  const filesArg = args.find(a => a.startsWith('--files='));
  const levelArg = args.find(a => a.startsWith('--level='));
  
  let plannedFiles = [];
  
  if (filesArg) {
    plannedFiles = filesArg.replace('--files=', '').split(',').map(f => f.trim()).filter(f => f);
  } else {
    // Try to detect from git diff
    const gitResult = exec('git diff --name-only --staged', true);
    if (gitResult.success && gitResult.output) {
      plannedFiles = gitResult.output.split('\n').filter(f => f.trim());
    }
  }
  
  console.log(`\n📂 Planned files (${plannedFiles.length}):`);
  if (plannedFiles.length === 0) {
    console.log('  (none specified)');
  } else {
    plannedFiles.forEach(f => console.log(`  - ${f}`));
  }
  
  // Read active task
  const activeTask = readActiveTask();
  console.log(`\n📋 Active task: ${activeTask.task_id || 'none'}`);
  console.log(`   Phase: ${activeTask.phase}`);
  
  // Determine check level
  let checkLevel = levelArg ? levelArg.replace('--level=', '') : null;
  if (!checkLevel) {
    checkLevel = determineCheckLevel(plannedFiles, activeTask);
  }
  
  console.log(`\n🔍 Check level: ${checkLevel.toUpperCase()}`);
  
  // Determine verification directory
  const verificationDir = activeTask.verification_dir || path.join(QA_ROOT, 'verifications/pre_dev_check');
  
  // Run checks
  let results;
  if (checkLevel === 'full') {
    results = runFullChecks(verificationDir);
  } else {
    results = runLightChecks();
  }
  
  // Decision
  const decision = results.allPassed ? 'PASS' : 'FAIL';
  
  // Create artifacts
  console.log('\n📝 Creating artifacts...\n');
  
  const checkFile = createPreDevCheck(verificationDir, checkLevel, results, plannedFiles, decision);
  console.log(`  ✅ ${checkFile}`);
  
  if (decision === 'FAIL') {
    const fixFile = createFixSuggestions(verificationDir, results);
    console.log(`  ✅ ${fixFile}`);
  }
  
  // Final output
  console.log('\n==================================================');
  console.log(`DECISION: ${decision}`);
  console.log('==================================================');
  
  if (decision === 'PASS') {
    console.log('\n✅ All checks passed');
    console.log('✅ Safe to proceed with development');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed');
    console.log('❌ Fix issues before proceeding');
    console.log(`📄 See: ${path.join(verificationDir, 'pre_dev_fix_suggestions.md')}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  determineCheckLevel,
  runFullChecks,
  runLightChecks
};
