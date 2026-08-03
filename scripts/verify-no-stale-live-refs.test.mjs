#!/usr/bin/env node
/**
 * verify-no-stale-live-refs.test.mjs — fixture tests for the stale-ref guard.
 *
 * Verifies that the guard:
 *   - still flags genuinely-moved paths (corporate-override restructure, a544dcd7)
 *   - no longer false-positives on corporate-pricing-override-nav.spec.ts (exists)
 *   - remains fail-closed: unresolvable matches are still reported as stale
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCheck } from './verify-no-stale-live-refs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Stale-path constants — assembled from fragments so this source file does not
// itself contain literal stale tokens that would trip the guard.
// ---------------------------------------------------------------------------
// Token: /(?:pages|tests)\/corporate-pricing\/corporate-pricing-override/
const STALE_SPEC    = 'tests/corporate-pricing/'  + 'corporate-pricing-override.spec.ts';
const STALE_PAGE    = 'pages/corporate-pricing/'  + 'corporate-pricing-override.page';
const STALE_MYSTERY = 'tests/corporate-pricing/'  + 'corporate-pricing-override-mystery.spec.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'stale-refs-test-')); }

/**
 * Write a referencing file into a synthetic repo root and return a tracked list
 * that includes it plus any extra tracked paths supplied.
 *
 * The referencing file is always written to scripts/ref.ts (matches INCLUDE's
 * `/^scripts\//.test(p)` rule so the scanner processes it).
 */
function makeRepo(repoRoot, refContent, extraTracked = []) {
  const refRel = 'scripts/ref.ts';
  fs.mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, refRel), refContent, 'utf8');
  // Write any extra tracked files so they appear on disk too
  for (const rel of extraTracked) {
    const abs = path.join(repoRoot, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, '// fixture\n', 'utf8');
  }
  return [refRel, ...extraTracked];
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Fixture 1 — genuinely-moved spec (DELETED in a544dcd7) → still flagged
// The old spec (STALE_SPEC) was deleted; any reference to it must still be caught.
// ---------------------------------------------------------------------------
{
  const tmp = makeTmp();
  const tracked = makeRepo(tmp,
    // Reference to the deleted spec — does NOT exist in tracked set or on disk
    `import "./${STALE_SPEC}";\n`
  );
  const { hits } = runCheck(tmp, tracked);
  assert(
    hits.some(h => h.includes('corporate-pricing-override.spec.ts')),
    `Fixture 1: deleted spec (${STALE_SPEC}) is still flagged as stale`
  );
}

// ---------------------------------------------------------------------------
// Fixture 2 — genuinely-moved page (RENAMED in a544dcd7) → still flagged
// The old page (STALE_PAGE) was renamed to corporate-override/; old path must be caught.
// ---------------------------------------------------------------------------
{
  const tmp = makeTmp();
  const tracked = makeRepo(tmp,
    `import "./${STALE_PAGE}";\n`
  );
  const { hits } = runCheck(tmp, tracked);
  assert(
    hits.some(h => h.includes('corporate-pricing-override.page')),
    `Fixture 2: renamed page (${STALE_PAGE}) is still flagged as stale`
  );
}

// ---------------------------------------------------------------------------
// Fixture 3 — corporate-pricing-override-nav.spec.ts EXISTS → NOT flagged
// This is the false-positive the ticket fixes. The file lives in
// clients/encore/tests/corporate-pricing/ and was NOT moved in the restructure.
// ---------------------------------------------------------------------------
{
  const tmp = makeTmp();
  const navRel = 'clients/encore/tests/corporate-pricing/corporate-pricing-override-nav.spec.ts';
  const tracked = makeRepo(tmp,
    // Manifest-style reference (the exact form that triggered the false positive)
    '"tests/corporate-pricing/corporate-pricing-override-nav.spec.ts"\n',
    [navRel]  // the file exists in the tracked set
  );
  const { hits } = runCheck(tmp, tracked);
  assert(
    !hits.some(h => h.includes('corporate-pricing-override-nav')),
    'Fixture 3: existing nav spec (corporate-pricing-override-nav.spec.ts) is NOT flagged'
  );
}

// ---------------------------------------------------------------------------
// Fixture 4 — ref matches no pattern and does not exist → not flagged
// Behaviour is unchanged from before the fix.
// ---------------------------------------------------------------------------
{
  const tmp = makeTmp();
  const tracked = makeRepo(tmp,
    'import "./tests/corporate-pricing/some-other-test.spec.ts";\n'
  );
  const { hits } = runCheck(tmp, tracked);
  assert(
    !hits.some(h => h.includes('some-other-test')),
    'Fixture 4: non-matching, non-existent ref is not flagged (behaviour unchanged)'
  );
}

// ---------------------------------------------------------------------------
// Fixture 5 — matches a pattern but cannot be resolved to any base → flagged
// Fail-closed: an unresolvable match is treated as stale.
// ---------------------------------------------------------------------------
{
  const tmp = makeTmp();
  // References a path that matches the token but is not in the tracked set
  const tracked = makeRepo(tmp,
    `"${STALE_MYSTERY}"\n`
    // NOTE: no matching file written to disk or tracked set → unresolvable
  );
  const { hits } = runCheck(tmp, tracked);
  assert(
    hits.some(h => h.includes('corporate-pricing-override-mystery')),
    'Fixture 5: unresolvable match (matches pattern, file absent) is flagged (fail-closed)'
  );
}

// ---------------------------------------------------------------------------
// Fixture 6 — real repo after fix → gate exits 0
// Run against the actual repo root; this is also the acceptance check #2.
// ---------------------------------------------------------------------------
{
  const { hits } = runCheck(REPO_ROOT);
  assert(
    hits.length === 0,
    `Fixture 6: real repo gate exits 0 (${hits.length} hits)`
  );
  if (hits.length > 0) {
    for (const h of hits) console.error('  remaining hit:', h);
  }
}

console.log('\nAll fixtures complete.');
