/**
 * archive-allure.js
 *
 * Copies reports/allure-report/ to reports/allure-archive/<timestamp>/ so past runs
 * survive the next `allure generate`. Noop-safe when no report exists yet.
 *
 * Usage: node scripts/archive-allure.js
 * Called by: npm run reports:archive, npm run test:daily
 *
 * Pruning: if ALLURE_ARCHIVE_MAX_DAYS > 0, delete archive dirs older than N days.
 * Default 0 = no pruning (never delete user data without opt-in).
 */

const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '..', 'reports', 'allure-report');
const ARCHIVE_ROOT = path.join(__dirname, '..', 'reports', 'allure-archive');
const MAX_DAYS = parseInt(process.env.ALLURE_ARCHIVE_MAX_DAYS || '0', 10);

if (!fs.existsSync(path.join(REPORT_DIR, 'index.html'))) {
  console.log('[archive-allure] no allure report to archive — skipping');
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dest = path.join(ARCHIVE_ROOT, stamp);
fs.mkdirSync(ARCHIVE_ROOT, { recursive: true });
fs.cpSync(REPORT_DIR, dest, { recursive: true });
console.log(`[archive-allure] allure → reports/allure-archive/${stamp}/`);

if (MAX_DAYS > 0) {
  const cutoff = Date.now() - MAX_DAYS * 24 * 60 * 60 * 1000;
  for (const entry of fs.readdirSync(ARCHIVE_ROOT)) {
    const full = path.join(ARCHIVE_ROOT, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && stat.mtimeMs < cutoff) {
      fs.rmSync(full, { recursive: true, force: true });
      console.log(`[archive-allure] pruned ${entry} (older than ${MAX_DAYS}d)`);
    }
  }
}
