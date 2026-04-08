/** Recreate report directories after npm run clean. Called by clean/clean:reports scripts. */
const fs = require('fs');
const path = require('path');
const dirs = ['reports/allure-results', 'reports/html-report', 'reports/test-results', 'reports/diagnostics'];
dirs.forEach(d => fs.mkdirSync(path.join(process.cwd(), d), { recursive: true }));
