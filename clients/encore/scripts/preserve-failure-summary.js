// Preserve reports/failure-summary.json with an ISO timestamp before each test run.
// Without this, every run overwrites the rolling file and per-run RCA history is lost.
// Called from test:daily and `pretest` so manual `npm test` invocations also benefit.

const fs = require('fs');
const path = require('path');

const src = path.join('reports', 'failure-summary.json');
if (!fs.existsSync(src)) {
  console.log('[preserve-failure-summary] no existing failure-summary.json to preserve');
  process.exit(0);
}

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dst = path.join('reports', `_failure-summary-${ts}.json`);
fs.renameSync(src, dst);
console.log(`[preserve-failure-summary] ${src} -> ${dst}`);
