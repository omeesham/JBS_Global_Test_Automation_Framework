/**
 * scripts/lib/spec-scan-helpers.mjs
 *
 * Shared helpers for scripts that scan spec files under clients/<client>/tests/.
 * Imported by check-spec-sleeps.mjs and check-unfailable-assertions.mjs (walkSpecFiles),
 * and by check-spec-sleeps.mjs and check-swallowed-failures.mjs (isCommentLine,
 * markerInCommentBlockAbove).
 */

import fs from 'node:fs';
import path from 'node:path';

/** True when a comment-only line (`// …` or a `* …` / `/* …` JSDoc line). */
export function isCommentLine(l) { return /^\s*(?:\/\/|\*|\/\*)/.test(l ?? ''); }

/** True when `re` appears in the contiguous comment block immediately above line index `i`. */
export function markerInCommentBlockAbove(lines, i, re) {
  for (let j = i - 1; j >= 0 && isCommentLine(lines[j]); j--) {
    if (re.test(lines[j])) return true;
  }
  return false;
}

/** Collect all `.spec.ts` files under `clients/<client>/tests/` recursively. */
export function walkSpecFiles(repoRoot) {
  const out = [];
  const clientsDir = path.join(repoRoot, 'clients');
  if (!fs.existsSync(clientsDir)) return out;
  for (const client of fs.readdirSync(clientsDir)) {
    const testsRoot = path.join(clientsDir, client, 'tests');
    if (!fs.existsSync(testsRoot)) continue;
    walkDir(testsRoot, out);
  }
  return out;
}

function walkDir(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkDir(full, out); continue; }
    if (entry.isFile() && entry.name.endsWith('.spec.ts')) out.push(full);
  }
}
