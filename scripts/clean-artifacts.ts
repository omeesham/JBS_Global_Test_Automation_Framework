/**
 * @agent-doc
 * PURPOSE: Clean unbounded artifact directories (allure-results, .playwright-mcp) with age-based retention.
 * OWNER: scripts/ -- build/maintenance tooling
 * IMPACT: Cosmetic -- prevents disk bloat from test artifacts. No test/build dependency.
 * DEPENDS-ON: None (standalone Node.js script)
 * USED-BY: `npm run clean:artifacts`
 * RULES: Never delete reports/html-report/ (human-viewable). Age-based retention, not blanket delete.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

interface CleanTarget {
  dir: string;
  retentionDays: number;
  description: string;
}

const TARGETS: CleanTarget[] = [
  { dir: 'reports/allure-results', retentionDays: 7, description: 'Allure result files' },
  { dir: '.playwright-mcp', retentionDays: 3, description: 'Playwright MCP snapshots' },
];

function cleanDirectory(target: CleanTarget): number {
  const dirPath = path.join(ROOT, target.dir);
  if (!fs.existsSync(dirPath)) return 0;

  const cutoff = Date.now() - target.retentionDays * 24 * 60 * 60 * 1000;
  let deleted = 0;

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const filePath = path.join(dirPath, entry.name);
      try {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      } catch { /* skip locked files */ }
    }
  } catch { /* dir read failed */ }

  return deleted;
}

function main(): void {
  console.log('Artifact cleanup (age-based retention)');
  let totalDeleted = 0;

  for (const target of TARGETS) {
    const deleted = cleanDirectory(target);
    totalDeleted += deleted;
    if (deleted > 0) {
      console.log(`  ${target.description}: deleted ${deleted} file(s) older than ${target.retentionDays}d`);
    } else {
      console.log(`  ${target.description}: nothing to clean`);
    }
  }

  console.log(`[OK] Done -- ${totalDeleted} file(s) cleaned`);
}

main();
