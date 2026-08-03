/**
 * scripts/lib/git-staged.mjs
 *
 * Shared helper for scripts that need the set of currently staged file paths.
 * Imported by check-dead-exports.mjs, check-save-route-parity.mjs,
 * check-per-test-baseline.mjs, and check-weak-reset.mjs.
 */

import { execSync } from 'node:child_process';

/** Return the set of staged file paths from `git diff --cached --name-only`. Falls back to an empty set on error. */
export function stagedFiles() {
  try {
    return new Set(
      execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n').map((s) => s.trim()).filter(Boolean),
    );
  } catch {
    return new Set();
  }
}
