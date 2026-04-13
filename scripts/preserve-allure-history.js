/**
 * preserve-allure-history.js
 *
 * Copies allure-report/history/ into allure-results/history/ before cleaning results.
 * This lets `allure generate` include trend data from previous runs without keeping
 * stale test results in allure-results/.
 *
 * Usage: node scripts/preserve-allure-history.js
 * Called by: npm run allure:history
 *
 * Flow:
 *   1. Copy allure-report/history/ → allure-results/history/
 *   2. Clean stale result/attachment files (keep categories.json, environment.properties, history/)
 *   3. Run tests (allure-playwright writes new results)
 *   4. allure generate picks up history + new results = trend graphs work
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'reports', 'allure-results');
const REPORT_DIR = path.join(__dirname, '..', 'reports', 'allure-report');
const HISTORY_SRC = path.join(REPORT_DIR, 'history');
const HISTORY_DEST = path.join(RESULTS_DIR, 'history');
const PRESERVE = new Set(['categories.json', 'environment.properties', 'history']);

// Step 1: Copy history from previous report into results dir
if (fs.existsSync(HISTORY_SRC)) {
  fs.cpSync(HISTORY_SRC, HISTORY_DEST, { recursive: true });
  console.log('[OK] History preserved from allure-report/history/');
} else {
  console.log('[INFO] No prior history found — first run, trend data will start now');
}

// Step 2: Clean stale result/attachment files, keep config + history
const entries = fs.readdirSync(RESULTS_DIR);
let cleaned = 0;
for (const entry of entries) {
  if (!PRESERVE.has(entry)) {
    fs.unlinkSync(path.join(RESULTS_DIR, entry));
    cleaned++;
  }
}
console.log(`[OK] Cleaned ${cleaned} stale result files from allure-results/`);
console.log('[OK] Ready for test run — results will include trend history');
