#!/usr/bin/env ts-node
/**
 * sp00-fixme-path.test.ts — regression test for the POM-restructure (specs/ -> tests/)
 * spec-path resolution in the deliverable workbook's blocked-reason pipeline.
 *
 * Guards the 2026-06-09 fix (chip task_a8298e85): the export reason-resolution paths in
 * export_test_cases/sp00-augment-logic.ts hardcoded the pre-2026-06-05 `specs/` dir, so a
 * runtime fixme annotation's reason could no longer be read after the POM restructure
 * renamed specs/ -> tests/ (LR-017). The workbook then leaked the generic
 * "... call in spec" placeholder reason, which trips the xlsx vocab deny-list
 * (scripts/xlsx-lint-rules.mjs) and FAILS the entire `npm run xlsx:build` self-lint.
 *
 * Run: ts-node scripts/sp00-fixme-path.test.ts
 *   OR: npm run test:sp00-fixme-path
 */

import * as path from 'path';
import {
  resolveSpecsDir,
  resolveSpecPath,
  scanSpecRuntimeFixmes,
} from '../export_test_cases/sp00-augment-logic';

const REPO_ROOT = path.resolve(__dirname, '..');
const CLIENT_ROOT = path.join(REPO_ROOT, 'clients', 'encore');
const SSL_SPEC_REL = 'clients/encore/tests/locations/location-shared-setup-locations.spec.ts';
const SSL_SPEC_STALE = 'clients/encore/specs/locations/location-shared-setup-locations.spec.ts';
const PLACEHOLDER = 'call in spec'; // substring of the generic leaked reason

let failures = 0;
function ok(label: string, cond: boolean, detail = ''): void {
  console.log(`  ${cond ? '[OK]' : '[FAIL]'} ${label}${cond ? '' : ` -> ${detail}`}`);
  if (!cond) failures++;
}

console.log('resolveSpecsDir — prefers tests/ over the legacy specs/');
const specsDir = resolveSpecsDir(CLIENT_ROOT);
ok('returns the clients/encore/tests dir', specsDir === path.join(CLIENT_ROOT, 'tests'), `got '${specsDir}'`);
ok('returns null for a client root with neither tests/ nor specs/',
   resolveSpecsDir(path.join(REPO_ROOT, '__no_such_client__')) === null);

console.log('resolveSpecPath — resolves a stale specs/ path to the existing tests/ file');
const swapped = resolveSpecPath(SSL_SPEC_STALE, REPO_ROOT);
ok('stale specs/ path swaps to the real tests/ file',
   swapped === path.join(REPO_ROOT, 'clients', 'encore', 'tests', 'locations', 'location-shared-setup-locations.spec.ts'),
   `got '${swapped}'`);
const direct = resolveSpecPath(SSL_SPEC_REL, REPO_ROOT);
ok('a correct tests/ path resolves directly',
   direct !== null && direct.replace(/\\/g, '/').endsWith(SSL_SPEC_REL), `got '${direct}'`);
ok('a genuinely missing file returns null',
   resolveSpecPath('clients/encore/specs/locations/__nope__.spec.ts', REPO_ROOT) === null);

console.log('scanSpecRuntimeFixmes — reads runtime blocked-reason text from tests/');
const fixmes = scanSpecRuntimeFixmes(CLIENT_ROOT);
// The pre-fix bug scanned clients/encore/specs/ (gone post-restructure) and so returned
// an EMPTY map — the root cause of the placeholder leak. A non-empty map proves the scan
// now reaches the tests/ dir.
ok('finds runtime fixme annotations (0 would mean it still scans the dead specs/ dir)',
   fixmes.size > 0, `size=${fixmes.size}`);
const ssl031 = fixmes.get('TC-LOC-SSL-031') ?? '';
ok('TC-LOC-SSL-031 maps to its real client-facing reason, not the generic placeholder',
   ssl031.includes('Delete control') && !ssl031.includes(PLACEHOLDER),
   `got '${ssl031.slice(0, 80)}'`);

console.log('');
if (failures === 0) {
  console.log('[sp00 fixme-path tests] PASS — specs/ -> tests/ resolution holds');
  process.exit(0);
} else {
  console.log(`[sp00 fixme-path tests] FAIL — ${failures} assertion(s) failed`);
  process.exit(1);
}
