/**
 * @agent-doc
 * PURPOSE: Deletes stale root-level artifacts (li_run*.txt, seed.spec.ts, test-results/)
 * OWNER: scripts/ -- build/maintenance tooling
 * IMPACT: Cosmetic only -- prevents repo root pollution; no test/build dependency
 * DEPENDS-ON: None (standalone Node.js script)
 * USED-BY: `npm run clean:root`
 * RULES: Never target `nul` (Windows reserved device name -- fs.unlinkSync resolves to NUL device, not the literal file)
 */

import * as fs from 'fs';
import * as path from 'path';

// Resolve project root from scripts/ directory
const ROOT = path.resolve(__dirname, '..');

// Files that pollute root when Playwright runs without --config or after MCP sessions
const FILES = ['li_run.txt', 'li_run2.txt', 'seed.spec.ts'];

// Glob patterns for ad-hoc files that accumulate at root
const GLOB_PATTERNS = [
  { pattern: /^new-.*\.md$/, description: 'ad-hoc plan drafts' },
  { pattern: /^li_.*\.txt$/, description: 'ad-hoc test logs' },
];

// Directories created by Playwright default outputDir when --config is missing
const DIRS = ['test-results'];

for (const f of FILES) {
  const p = path.join(ROOT, f);
  try { fs.unlinkSync(p); console.log(`Deleted: ${f}`); }
  catch { /* not present -- skip */ }
}

// Glob-based cleanup for patterns
try {
  const rootEntries = fs.readdirSync(ROOT, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (!entry.isFile()) continue;
    for (const { pattern, description } of GLOB_PATTERNS) {
      if (pattern.test(entry.name)) {
        try { fs.unlinkSync(path.join(ROOT, entry.name)); console.log(`Deleted (${description}): ${entry.name}`); }
        catch { /* skip */ }
        break;
      }
    }
  }
} catch { /* root read failed -- skip */ }

for (const d of DIRS) {
  const p = path.join(ROOT, d);
  try { fs.rmSync(p, { recursive: true }); console.log(`Deleted: ${d}/`); }
  catch { /* not present -- skip */ }
}

// NOTE: `nul` intentionally skipped -- Windows reserved device name.
// fs.unlinkSync('nul') resolves to the NUL device, not the literal file.
// Use `del nul` from cmd.exe if manual cleanup is needed.
