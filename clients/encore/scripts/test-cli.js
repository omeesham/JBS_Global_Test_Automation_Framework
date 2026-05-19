#!/usr/bin/env node
/**
 * Daily test runner — preserves Allure history across runs.
 *
 * Pattern: stash history/ before clean -> clean reports -> restore history/ ->
 * run tests -> regenerate Allure report (history rolls forward).
 *
 * Replaces six legacy scripts (archive-allure, archive-html, ensure-report-dirs,
 * preserve-allure-history, preserve-failure-summary, run-test-daily) with stock
 * Allure plumbing. Trend chart in Allure UI requires history/ to survive cleans.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const RESULTS_DIR = path.join('reports', 'allure-results');
const HISTORY_DIR = path.join(RESULTS_DIR, 'history');
const STASH_DIR = path.join('reports', '.allure-history-stash');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

if (fs.existsSync(HISTORY_DIR)) {
  fs.rmSync(STASH_DIR, { recursive: true, force: true });
  fs.cpSync(HISTORY_DIR, STASH_DIR, { recursive: true });
}

run('npm run clean');

if (fs.existsSync(STASH_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.cpSync(STASH_DIR, HISTORY_DIR, { recursive: true });
  fs.rmSync(STASH_DIR, { recursive: true, force: true });
}

let testExit = 0;
try {
  run('npx playwright test --config=playwright.config.ts');
} catch (err) {
  testExit = err.status || 1;
}

run('npx allure generate reports/allure-results --clean -o reports/allure-report');
process.exit(testExit);
