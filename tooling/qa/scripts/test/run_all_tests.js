#!/usr/bin/env node
// File: tooling/qa/scripts/test/run_all_tests.js
// Purpose: Orchestrate all test files and provide summary

const test_lock = require('./test_lock');
const test_atomic_write = require('./test_atomic_write');
const test_schema_validation = require('./test_schema_validation');
const test_boundary_symlink = require('./test_boundary_symlink');
const test_action_tracking = require('./test_action_tracking');
const test_agent_helpers = require('./test_agent_helpers');

async function runAllTestSuites() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  QA INFRASTRUCTURE - COMPREHENSIVE TEST SUITE    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  
  const suites = [
    { name: 'Async Lock Functions', run: test_lock.runAllTests },
    { name: 'Atomic Write Functions', run: test_atomic_write.runAllTests },
    { name: 'Schema Validation', run: test_schema_validation.runAllTests },
    { name: 'Symlink-Safe Boundaries', run: test_boundary_symlink.runAllTests },
    { name: 'Action Tracking', run: test_action_tracking.runAllTests },
    { name: 'Agent Helpers', run: test_agent_helpers.runAllTests }
  ];
  
  const results = [];
  
  for (const suite of suites) {
    try {
      const success = await suite.run();
      results.push({ name: suite.name, success });
    } catch (error) {
      console.error(`\nFatal error in ${suite.name}: ${error.message}`);
      results.push({ name: suite.name, success: false });
    }
    console.log('\n');
  }
  
  // Summary
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║              FINAL SUMMARY                       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const padding = ' '.repeat(40 - result.name.length);
    console.log(`${result.name}${padding}${status}`);
  });
  
  console.log('');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`Total: ${passed}/${total} test suites passed (${percentage}%)`);
  console.log('');
  
  if (passed === total) {
    console.log('🎉 All test suites passed!');
    console.log('✅ Infrastructure is production-ready');
    return true;
  } else {
    console.log('⚠️  Some test suites failed');
    console.log('❌ Fix failing tests before deployment');
    return false;
  }
}

if (require.main === module) {
  runAllTestSuites()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error(`\nFatal error: ${err.message}`);
      console.error(err.stack);
      process.exit(1);
    });
}

module.exports = { runAllTestSuites };
