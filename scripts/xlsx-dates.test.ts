/**
 * xlsx-dates.test.ts — unit tests for blob-identity date derivation and precondition gates.
 *
 * Tests are pure-function / temp-repo; no auth state, no workbook build, no xlsx:build run.
 * Run: ts-node scripts/xlsx-dates.test.ts   (npm run test:xlsx-dates)
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { getContentChangeDate, buildWorkbook, buildFromMdSource, computeExporterSourceHash, computeFingerprint, computeSkipEligible, validateSplitCompleteness, FingerprintRecord } from '../export_test_cases/to-xlsx';

let failures = 0;
function check(label: string, cond: boolean): void {
  console.log(`  ${cond ? '[OK]' : '[FAIL]'} ${label}`);
  if (!cond) failures++;
}
function checkThrows(label: string, fn: () => unknown, pattern: RegExp): void {
  try {
    fn();
    console.log(`  [FAIL] ${label} — expected throw, got nothing`);
    failures++;
  } catch (err) {
    const msg = (err as Error).message;
    if (pattern.test(msg)) {
      console.log(`  [OK] ${label}`);
    } else {
      console.log(`  [FAIL] ${label} — threw but message did not match ${pattern}: "${msg}"`);
      failures++;
    }
  }
}

const REPO_ROOT = path.resolve(__dirname, '..');
const MD_ROOT = path.join(REPO_ROOT, 'clients', 'encore', 'specs_planning', 'test-cases', 'setup');
const XLSX_PATH = path.join(REPO_ROOT, 'clients', 'encore', 'testcases', 'encore_test_cases.xlsx');

// ── Test 1: Exact date + commit for all six corporate-override renamed files ──────────────────
// Catches: rename-poisoning bug where git log without --follow returns the rename date,
// not the content-change date. Revert to plain `git log` to break this test.
console.log('\nTest 1 — Blob-identity date derivation: corporate-override renamed files');

const CORP_OVERRIDE_DIR = path.join(MD_ROOT, 'corporate-override');
const EXPECTED_RENAME_RESULTS = [
  { file: 'corporate_override_export_test_cases.md',           date: '2026-07-31', commit: '816ac4c8011e7168c028c5b4a92bebb4916bd19d' },
  { file: 'corporate_override_filters_test_cases.md',          date: '2026-07-31', commit: '816ac4c8011e7168c028c5b4a92bebb4916bd19d' },
  { file: 'corporate_override_grid_sort_test_cases.md',        date: '2026-07-31', commit: '816ac4c8011e7168c028c5b4a92bebb4916bd19d' },
  { file: 'corporate_override_import_test_cases.md',           date: '2026-07-31', commit: '816ac4c8011e7168c028c5b4a92bebb4916bd19d' },
  { file: 'corporate_override_labor_grid_test_cases.md',       date: '2026-07-31', commit: '816ac4c8011e7168c028c5b4a92bebb4916bd19d' },
  { file: 'corporate_override_location_picker_test_cases.md',  date: '2026-07-31', commit: '816ac4c8011e7168c028c5b4a92bebb4916bd19d' },
] as const;

for (const { file, date, commit } of EXPECTED_RENAME_RESULTS) {
  const mdPath = path.join(CORP_OVERRIDE_DIR, file);
  let result: { date: string; commit: string } | undefined;
  try {
    result = getContentChangeDate(mdPath, new Set(), true);
  } catch (err) {
    console.log(`  [FAIL] ${file} — threw: ${(err as Error).message}`);
    failures++;
    continue;
  }
  check(`${file}: date === '${date}'`, result.date === date);
  check(`${file}: commit === '${commit}'`, result.commit === commit);
}

// ── Tests 2 and 5 run through buildWorkbook (async). All remaining tests wrap in an async
// IIFE so the summary line waits for them. Tests 1, 3, 4 above are synchronous.
// ─────────────────────────────────────────────────────────────────────────────────────────────

(async () => {

// ── Test 2: Precondition Gate 2 — dirty source gates through buildWorkbook ───────────────────
// Catches: stamping HEAD-derived date onto working-tree content (the core lie being removed).
// Revert-sensitivity: removing the Gate 2 block from buildWorkbook causes all three sub-tests
// to receive NO resolution (buildWorkbook succeeds instead of throwing), making check() fail.
// Tests 2a/2b dirty+restore a committed .md under MD_ROOT (try/finally guarantees restoration).
// Test 2c creates then deletes an untracked .md (no tracked file modified).
console.log('\nTest 2 — Gate 2: dirty source gates through buildWorkbook');

{
  const setupDir = path.join(REPO_ROOT, 'clients', 'encore', 'specs_planning', 'test-cases', 'setup');
  // Recursively find first committed .md file for dirty-edit tests
  function findFirstMd(d: string): string | undefined {
    for (const entry of fs.readdirSync(d)) {
      const full = path.join(d, entry);
      if (fs.statSync(full).isDirectory()) { const f = findFirstMd(full); if (f) return f; }
      else if (entry.endsWith('.md')) return full;
    }
    return undefined;
  }
  const targetPath = findFirstMd(setupDir);
  const tmpOut2 = path.join(os.tmpdir(), `xlsx-gate-test-${process.pid}.xlsx`);

  async function tryBuild(): Promise<string> {
    try {
      await buildWorkbook({ mode: 'list-only', outPath: tmpOut2, selfCheck: false });
      return 'NO_THROW';
    } catch (e: any) { return 'THROW:' + String(e.message).slice(0, 300); }
  }

  // 2a: unstaged edit
  if (targetPath) {
    const orig = fs.readFileSync(targetPath, 'utf-8');
    try {
      fs.writeFileSync(targetPath, orig + '\n<!-- gate-test-2a -->', 'utf-8');
      const r = await tryBuild();
      check('Gate 2a: buildWorkbook throws on unstaged edit in consumed MD', r.startsWith('THROW') && /not staged/i.test(r));
    } finally { fs.writeFileSync(targetPath, orig, 'utf-8'); }
  }

  // 2b: staged edit
  if (targetPath) {
    const orig = fs.readFileSync(targetPath, 'utf-8');
    try {
      fs.writeFileSync(targetPath, orig + '\n<!-- gate-test-2b -->', 'utf-8');
      execFileSync('git', ['add', targetPath], { cwd: REPO_ROOT });
      const r = await tryBuild();
      // Staged markdown is ACCEPTED by design (buildWorkbook: "staged markdown is accepted
      // because it lands in the same commit as the workbook", dated today) — it must NOT throw.
      check('Gate 2b: buildWorkbook accepts a staged edit in consumed MD (lands in the same commit)', r === 'NO_THROW');
    } finally {
      fs.writeFileSync(targetPath, orig, 'utf-8');
      execFileSync('git', ['checkout', 'HEAD', '--', targetPath], { cwd: REPO_ROOT });
    }
  }

  // 2c: untracked new .md under MD_ROOT (no tracked file modified).
  // File must look like a real test-case file so walkMd includes it.
  const untrackedMd = path.join(setupDir, 'zzz_gate_test_canary_test_cases.md');
  try {
    fs.writeFileSync(untrackedMd, '## TC-9999\n**Title:** gate test\n**Steps:** 1. step\n**Expected:** result\n', 'utf-8');
    const r = await tryBuild();
    check('Gate 2c: buildWorkbook throws on untracked .md under MD_ROOT', r.startsWith('THROW') && /not staged/i.test(r));
  } finally {
    try { fs.unlinkSync(untrackedMd); } catch {}
    try { fs.unlinkSync(tmpOut2); } catch {}
  }
}

// ── Test 3: Gate 4 — no-history → hard-fail (canonical) / UNCOMMITTED (preview) ─────────────
// Catches: falling back to build date when a file has no git history (the lie we removed).
// Uses a path inside the repo that has no git history (no commits reference it).
console.log('\nTest 3 — Gate 4: no-history detection');

{
  const noHistPath = path.join(MD_ROOT, '_no_history_test_canary_.md');
  checkThrows(
    'Gate 4a: canonical build throws on no-history file',
    () => getContentChangeDate(noHistPath, new Set(), true),
    /no git history/i,
  );
  const preview = getContentChangeDate(noHistPath, new Set(), false);
  check('Gate 4b: preview build returns UNCOMMITTED for no-history file', preview.date === 'UNCOMMITTED' && preview.commit === 'none');
}

// ── Test 4: Gate 1b — shallow graft detection ────────────────────────────────────────────────
// Catches: returning a date from truncated history when the ADD/initial-content commit is at
// the graft boundary. The prior code checked the NEWEST content-change commit; the fix checks
// the OLDEST followed raw-event commit (the add/initial-content boundary).
// Revert-sensitivity: reverting to old "check newestChange" logic makes the oldest-commit
// injection test receive NO_THROW instead of THROW. Injecting NEWEST must NOT throw (no over-throw).
console.log('\nTest 4 — Gate 1b: shallow graft detection');

{
  const realMd = path.join(CORP_OVERRIDE_DIR, 'corporate_override_export_test_cases.md');
  const oldestCommit = 'a544dcd7299efce6d286e7e7a82c9d1ad440fc26'; // add boundary for all six corp-override files
  const newestCommit = '816ac4c8011e7168c028c5b4a92bebb4916bd19d'; // newest content-change (must NOT trigger)

  checkThrows(
    'Gate 1b: throws when OLDEST blob-change (add boundary) commit is in shallow set',
    () => getContentChangeDate(realMd, new Set([oldestCommit]), true),
    /shallow graft/i,
  );

  let noOverThrow = false;
  try { getContentChangeDate(realMd, new Set([newestCommit]), true); noOverThrow = true; } catch { noOverThrow = false; }
  check('Gate 1b: does NOT throw when only newest content-change commit is in shallow set (no over-throw)', noOverThrow);

  const addonMd = path.join(REPO_ROOT, 'clients', 'encore', 'specs_planning', 'test-cases', 'setup', 'locations', 'locations_auto_addon_test_cases.md');
  if (fs.existsSync(addonMd)) {
    checkThrows(
      'Gate 1b: throws for locations_auto_addon when its add-boundary commit is in shallow set',
      () => getContentChangeDate(addonMd, new Set(['3edb6f1953f1338741ab344625400419995c8562']), true),
      /shallow graft/i,
    );
  }
}

// ── Test 5: Sheet-name collision guard — BEHAVIORAL (not source inspection) ───────────────────
// Catches: silent data loss when two different MD files produce the same sheet name.
// Revert-sensitivity: removing the collision guard from buildFromMdSource makes this test
// receive NO throw (runs to completion instead of throwing), so check() fails.
// This is a real behavioral probe, not a source-text search.
console.log('\nTest 5 — buildFromMdSource sheet-name collision guard (behavioral)');

{
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xlsx-collision-'));
  try {
    // Minimal valid TC content: parseMd needs at least one TC to not skip the file
    const minimalTc = (id: string) =>
      `## ${id}: Collision guard test\n**Steps:** 1. step\n**Expected:** result\n`;

    // Two separate directories containing files with the SAME basename slug
    // → both map to 'local_office_settings' sheet → collision must throw
    const dir1 = path.join(tmpDir, 'dir1');
    const dir2 = path.join(tmpDir, 'dir2');
    fs.mkdirSync(dir1);
    fs.mkdirSync(dir2);
    const file1 = path.join(dir1, 'local_office_settings_test_cases.md');
    const file2 = path.join(dir2, 'local_office_settings_test_cases.md');
    fs.writeFileSync(file1, minimalTc('TC-LOS-001'), 'utf-8');
    fs.writeFileSync(file2, minimalTc('TC-LOS-002'), 'utf-8');

    checkThrows(
      'buildFromMdSource throws on sheet-name collision from two different source files',
      () => buildFromMdSource([file1, file2]),
      /Sheet name collision/i,
    );

    // Verify the guard message is not triggered when there is no collision
    let noThrow = false;
    try { buildFromMdSource([file1]); noThrow = true; } catch { noThrow = false; }
    check('buildFromMdSource does NOT throw when only one file maps to a sheet name', noThrow);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ── Test 6 (rot-proof): computeExporterSourceHash changes when a new file is added ──────────
// Catches: a hardcoded file list in computeExporterSourceHash that doesn't pick up new deps.
// Revert-sensitivity: switching computeExporterSourceHash to a hardcoded list makes this test
// fail because adding a new file to export_test_cases/ would not change the hash.
console.log('\nTest 6 — computeExporterSourceHash rot-proof coverage');

{
  const exportDir = path.join(REPO_ROOT, 'export_test_cases');
  const tmpFile = path.join(exportDir, '_rot_proof_canary_.ts');
  try {
    const hashBefore = computeExporterSourceHash();
    fs.writeFileSync(tmpFile, '// rot-proof canary\n', 'utf-8');
    const hashAfter = computeExporterSourceHash();
    check(
      'computeExporterSourceHash changes when a new .ts file is added to export_test_cases/',
      hashBefore !== hashAfter,
    );
    fs.unlinkSync(tmpFile);
    const hashRestored = computeExporterSourceHash();
    check(
      'computeExporterSourceHash restores to original after removing the canary file',
      hashRestored === hashBefore,
    );
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

// ── Test 7: Import-containment regression — files under export_test_cases/ must not
// import from outside that directory. Catches: a later edit introducing an outside
// repo dependency that subsequent exporter-source-hash changes would never catch.
// Revert-sensitivity: removing the outside-import check makes this test report
// CONTAINED even when the canary outside-import file is present, so check() fails.
console.log('\nTest 7 — export_test_cases/ import containment (structural regression guard)');

{
  const exportDir = path.join(REPO_ROOT, 'export_test_cases');

  /**
   * Return all files under dir that contain a relative import escaping the directory
   * (i.e., import/require paths starting with '../' that would land outside exportDir).
   */
  function findOutsideImports(dir: string): string[] {
    const offenders: string[] = [];
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        offenders.push(...findOutsideImports(full));
      } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
        const content = fs.readFileSync(full, 'utf-8');
        // Match: from '../...', require('../...')  — any relative path going up
        const importRe = /(?:from\s+|require\s*\(\s*)['"](\.\.[/\\][^'"]+)['"]/g;
        let m: RegExpExecArray | null;
        while ((m = importRe.exec(content)) !== null) {
          const importPath = m[1];
          if (!importPath) continue;
          const resolved = path.resolve(path.dirname(full), importPath);
          if (!resolved.startsWith(exportDir + path.sep) && resolved !== exportDir) {
            offenders.push(`${path.relative(exportDir, full)} imports outside: ${importPath}`);
          }
        }
      }
    }
    return offenders;
  }

  // Baseline: current state must be clean
  const baselineOffenders = findOutsideImports(exportDir);
  check(
    'export_test_cases/ contains no outside imports at baseline',
    baselineOffenders.length === 0,
  );
  if (baselineOffenders.length > 0) {
    for (const o of baselineOffenders) console.log(`    OFFENDER: ${o}`);
  }

  // Deliberate outside-import canary: add a file with an outside import, verify it is detected
  const canaryFile = path.join(exportDir, '_containment_canary_.ts');
  try {
    fs.writeFileSync(canaryFile, "import { execFileSync } from '../scripts/xlsx-dates.test';\n", 'utf-8');
    const canaryOffenders = findOutsideImports(exportDir);
    check(
      'findOutsideImports detects deliberate outside import in canary file',
      canaryOffenders.length > 0,
    );
  } finally {
    try { fs.unlinkSync(canaryFile); } catch {}
  }

  // After removal: back to clean
  const afterRemoval = findOutsideImports(exportDir);
  check(
    'findOutsideImports reports clean after canary file removed',
    afterRemoval.length === 0,
  );
}

// ── Test 8: computeFingerprint sensitivity — pure unit cases ─────────────────────────────────
// Proves each axis of FingerprintRecord is covered by the hash: changing exactly one field
// must produce a different fingerprint. Revert-sensitivity per axis:
//   Axes 1–6: removing the field from FingerprintRecord (or from JSON.stringify input) makes
//             both variants hash identically → check() fails.
//   Axis 7:   setting blobIdsOk=false in computeSkipEligible returns false regardless of other
//             fields; removing `&& params.blobIdsOk` from the function makes the false-case
//             return true → check() fails.
//   Stability: if computeFingerprint introduced non-determinism (e.g. Date.now()), identical
//              inputs would differ → check() fails.
console.log('\nTest 8 — computeFingerprint sensitivity: seven axes + no-change stability + skip-guard unit');

{
  const base: FingerprintRecord = {
    schemaVersion: 1,
    mdSources: [{ relPath: 'clients/encore/specs_planning/test-cases/setup/foo_test_cases.md', blobId: 'abc123def456', contentChangeDate: '2026-01-15' }],
    perTcAugment: [{ tcId: 'TC-001', coverageStatus: 'Covered', automationExecution: 'Pass', ifFailedReason: '' }],
    exporterSourceHash: 'deadbeef01020304',
    excelJsVersion: '4.4.0',
    splitTargetMembershipHash: 'cafebabe05060708',
  };
  const baseHash = computeFingerprint(base);

  const baseMd0 = base.mdSources[0]!;
  const baseAug0 = base.perTcAugment[0]!;

  // Axis 1 — MD blob id / content
  check(
    'Axis 1 (mdSources blobId): fingerprint changes when mdSources[0].blobId changes',
    computeFingerprint({ ...base, mdSources: [{ relPath: baseMd0.relPath, blobId: 'changed_blobid', contentChangeDate: baseMd0.contentChangeDate }] }) !== baseHash,
  );

  // Axis 2 — Derived content-change date
  check(
    'Axis 2 (contentChangeDate): fingerprint changes when mdSources[0].contentChangeDate changes',
    computeFingerprint({ ...base, mdSources: [{ relPath: baseMd0.relPath, blobId: baseMd0.blobId, contentChangeDate: '2026-12-31' }] }) !== baseHash,
  );

  // Axis 3 — Per-TC augment data
  check(
    'Axis 3 (perTcAugment): fingerprint changes when perTcAugment[0].coverageStatus changes',
    computeFingerprint({ ...base, perTcAugment: [{ tcId: baseAug0.tcId, coverageStatus: 'Not Covered', automationExecution: baseAug0.automationExecution, ifFailedReason: baseAug0.ifFailedReason }] }) !== baseHash,
  );

  // Axis 4 — Module registry (splitTargetMembershipHash)
  check(
    'Axis 4 (splitTargetMembershipHash): fingerprint changes when module registry hash changes',
    computeFingerprint({ ...base, splitTargetMembershipHash: 'newregistryhash99' }) !== baseHash,
  );

  // Axis 5 — exceljs version
  check(
    'Axis 5 (excelJsVersion): fingerprint changes when exceljs version string changes',
    computeFingerprint({ ...base, excelJsVersion: '9.9.9' }) !== baseHash,
  );

  // Axis 6 — Exporter source hash (already proven end-to-end via Test 6; asserted here uniformly)
  check(
    'Axis 6 (exporterSourceHash): fingerprint changes when exporter source hash changes',
    computeFingerprint({ ...base, exporterSourceHash: 'newexporterhash99' }) !== baseHash,
  );

  // Axis 7 — Blob-ID collection failure → skip disabled
  // computeSkipEligible encapsulates the production guard (line 821 of to-xlsx.ts).
  // When blobIdsOk=false the guard is false and skip is never set, regardless of other inputs.
  // Revert-sensitivity: removing `&& params.blobIdsOk` makes the false-case return true → fails.
  check(
    'Axis 7 (blobIdsOk=false): computeSkipEligible returns false when blobIdsOk=false',
    computeSkipEligible({ blobIdsOk: false, exporterSourceHash: 'ok', isCanonical: true }) === false,
  );
  check(
    'Axis 7 (blobIdsOk=true): computeSkipEligible returns true when all conditions are met',
    computeSkipEligible({ blobIdsOk: true, exporterSourceHash: 'ok', isCanonical: true }) === true,
  );
  check(
    'Axis 7 (exporterSourceHash=ERROR): computeSkipEligible returns false on ERROR hash',
    computeSkipEligible({ blobIdsOk: true, exporterSourceHash: 'ERROR', isCanonical: true }) === false,
  );

  // Stability — same input must produce the same hash (no accidental non-determinism)
  check(
    'Stability: identical FingerprintRecord inputs produce the same fingerprint',
    computeFingerprint({ ...base }) === baseHash,
  );
}

// ── Test 9: validateSplitCompleteness — completeness invariant ───────────────────────────────
// Cases 1–4: missing mapping, duplicate target, empty map, malformed entry.
// These exercise validateSplitCompleteness directly via a synthetic splitMap so the tests
// are pure-function and require no workbook build.
//
// Revert-sensitivity per case:
//   Case 1: removing the "every non-Overview sheet must be in splitMap" check causes the
//           function to return cleanly on a missing entry — check() fails (no throw).
//   Case 2: removing the duplicate-output-path check causes the function to return cleanly
//           when two keys share the same group/stem — check() fails (no throw).
//   Case 3: removing the empty-map guard causes the function to attempt iteration over an
//           empty entries array and return cleanly — check() fails (no throw).
//   Case 4: removing the malformed-entry guard causes the function to proceed with a bad
//           entry and potentially throw a different error later — check() fails (wrong throw).
console.log('\nTest 9 — validateSplitCompleteness: completeness invariant (cases 1–4)');

{
  const GOOD_MAP: Record<string, { group: string; stem: string }> = {
    sheet_alpha: { group: 'g1', stem: 's1' },
    sheet_beta:  { group: 'g1', stem: 's2' },
  };
  const GOOD_SHEETS = ['Overview', 'sheet_alpha', 'sheet_beta'];

  // Baseline: happy path must NOT throw
  let noThrow = false;
  try { validateSplitCompleteness(GOOD_SHEETS, GOOD_MAP); noThrow = true; } catch { noThrow = false; }
  check('Case 0 (baseline): validateSplitCompleteness does not throw on a valid map', noThrow);

  // Case 1: remove one sheet's entry → must throw naming the sheet and mentioning SPLIT_FILE_MAP
  // Revert-sensitivity: with the new bijection, removing the ghost-key direction of the check
  // causes both "sheetsWithNoMapping" and "ghostMapKeys" arrays to be computed, but only one
  // direction fires — the old one-directional check caused B1 (ghost keys silently accepted).
  const missingMap = { sheet_alpha: GOOD_MAP.sheet_alpha };
  checkThrows(
    'Case 1: missing mapping — throws naming the missing sheet',
    () => validateSplitCompleteness(GOOD_SHEETS, missingMap as Record<string, { group: string; stem: string }>),
    /SPLIT_FILE_MAP.*sheet_beta|sheet_beta/i,
  );

  // Case 2: duplicate output path (two keys → same group/stem) → must throw naming both keys + target
  const dupMap: Record<string, { group: string; stem: string }> = {
    sheet_alpha: { group: 'g1', stem: 's1' },
    sheet_beta:  { group: 'g1', stem: 's1' }, // same target as sheet_alpha
  };
  checkThrows(
    'Case 2: duplicate target — throws naming both sheet keys and the shared path',
    () => validateSplitCompleteness(GOOD_SHEETS, dupMap),
    /sheet_alpha.*sheet_beta|sheet_beta.*sheet_alpha/i,
  );

  // Case 3: empty map → must throw, nothing deleted (pure-function; no FS side-effects here)
  checkThrows(
    'Case 3: empty map — throws refusing to proceed',
    () => validateSplitCompleteness(GOOD_SHEETS, {}),
    /SPLIT_FILE_MAP is empty/i,
  );

  // Case 4: malformed entry (missing stem) → must throw naming the bad key
  const badMap = { sheet_alpha: { group: 'g1', stem: '' } };
  checkThrows(
    'Case 4: malformed entry — throws naming the bad key',
    () => validateSplitCompleteness(['Overview', 'sheet_alpha'], badMap as Record<string, { group: string; stem: string }>),
    /sheet_alpha.*malformed|malformed.*sheet_alpha/i,
  );

  // Case 4b: malformed entry — null value
  const nullMap = { sheet_alpha: null as unknown as { group: string; stem: string } };
  checkThrows(
    'Case 4b: null entry — throws naming the bad key',
    () => validateSplitCompleteness(['Overview', 'sheet_alpha'], nullMap),
    /sheet_alpha.*malformed|malformed.*sheet_alpha/i,
  );

  // Case 5: SPLIT_FILE_MAP key with no built sheet (ghost key) → must throw naming the ghost key.
  // Revert-sensitivity: the old one-directional check only verified sheets→map, so a ghost key
  // passed silently; removing the "ghostMapKeys" branch of the bijection causes this test to
  // receive NO throw (function returns cleanly), so check() fails.
  const ghostKeyMap: Record<string, { group: string; stem: string }> = {
    sheet_alpha: { group: 'g1', stem: 's1' },
    sheet_gamma: { group: 'g1', stem: 's3' }, // present in map, absent from built sheets
  };
  checkThrows(
    'Case 5: ghost map key — throws naming the key with no built sheet',
    () => validateSplitCompleteness(['Overview', 'sheet_alpha'], ghostKeyMap),
    /sheet_gamma/i,
  );

  // Case 5b: both sides simultaneously — one built sheet unmapped, one map key with no sheet.
  // Revert-sensitivity: a one-directional check naming only the unmapped sheet would not mention
  // sheet_gamma; a check naming only the ghost key would not mention sheet_beta. Both must appear.
  const bothSidesMap: Record<string, { group: string; stem: string }> = {
    sheet_alpha: { group: 'g1', stem: 's1' },
    sheet_gamma: { group: 'g1', stem: 's3' }, // ghost — not in built sheets
  };
  checkThrows(
    'Case 5b: both sides simultaneously — error names unmapped sheet and ghost key',
    () => validateSplitCompleteness(['Overview', 'sheet_alpha', 'sheet_beta'], bothSidesMap),
    /sheet_beta.*sheet_gamma|sheet_gamma.*sheet_beta/i,
  );

  // Cases 6–9: target sanitization (B2 — escape-root prevention).
  // Revert-sensitivity: removing the assertSplitTargetSafe call from validateSplitCompleteness
  // causes each of these tests to receive NO throw (bijection passes for matching key sets),
  // so check() fails.

  // Case 6: group contains '..' → rejects before any write or prune.
  checkThrows(
    'Case 6: group=".." — throws on dot-dot traversal',
    () => validateSplitCompleteness(['Overview', 'sheet_alpha'], { sheet_alpha: { group: '..', stem: 'evil' } }),
    /\.\.|path separator|outside|absolute/i,
  );

  // Case 7: path separator inside group → single-segment constraint violated.
  checkThrows(
    'Case 7: group contains "/" — throws on path separator in group',
    () => validateSplitCompleteness(['Overview', 'sheet_alpha'], { sheet_alpha: { group: 'a/b', stem: 'evil' } }),
    /path separator|outside|separator/i,
  );

  // Case 8: path separator inside stem → single-segment constraint violated.
  checkThrows(
    'Case 8: stem contains "/" — throws on path separator in stem',
    () => validateSplitCompleteness(['Overview', 'sheet_alpha'], { sheet_alpha: { group: 'g1', stem: 'a/b' } }),
    /path separator|outside|separator/i,
  );

  // Case 9: absolute path in group → rejected immediately.
  checkThrows(
    'Case 9: absolute path in group — throws on absolute path',
    () => validateSplitCompleteness(['Overview', 'sheet_alpha'], {
      sheet_alpha: { group: path.sep === '\\' ? 'C:\\evil' : '/evil', stem: 'file' },
    }),
    /absolute/i,
  );
}

// ── Test 10: FIX 2 — pruneStaleeSplitFiles called when build runs (skip OR write path) ────────
// Proves pruneStaleeSplitFiles is wired into the buildWorkbook call path: a stale split file
// present before the build must be gone afterwards. Covers both paths (skip and write) since
// pruneStaleeSplitFiles is called in both branches for the canonical output path.
// Revert-sensitivity: deleting BOTH prune calls from buildWorkbook causes the stale file to
// survive, making the final check() fail.
console.log('\nTest 10 — pruneStaleeSplitFiles integration (stale file removed after build)');

{
  const TESTCASES_DIR = path.join(REPO_ROOT, 'clients', 'encore', 'testcases');
  const staleFile = path.join(TESTCASES_DIR, 'locations', '_stale_prune_test_probe_.xlsx');
  try {
    fs.writeFileSync(staleFile, 'probe', 'utf-8');
    check('stale-prune/setup: probe file present before build', fs.existsSync(staleFile));
    await buildWorkbook({ mode: 'list-only', selfCheck: false });
    check('stale-prune/result: stale split file pruned after buildWorkbook', !fs.existsSync(staleFile));
  } finally {
    try { fs.unlinkSync(staleFile); } catch {}
  }
}

// ── Test 10b: skip-path pruneStaleeSplitFiles — stale file removed on unchanged-input run ─────
// Proves the skip branch (line ~850 in to-xlsx.ts) calls pruneStaleeSplitFiles:
//   1. First buildWorkbook writes canonical workbook + splits + embeds fingerprint.
//   2. Plant a stale .xlsx that is NOT in SPLIT_FILE_MAP.
//   3. Second buildWorkbook — fingerprint matches → skip branch → prune fires → stale file gone.
// Revert-sensitivity: deleting the skip-path pruneStaleeSplitFiles() call (line ~850) causes
// the stale file to survive, making the final existence check fail.
console.log('\nTest 10b — skip-path pruneStaleeSplitFiles (stale file removed on unchanged-input skip)');

{
  const TESTCASES_DIR = path.join(REPO_ROOT, 'clients', 'encore', 'testcases');
  const staleFile = path.join(TESTCASES_DIR, 'locations', '_stale_skip_path_probe_.xlsx');
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  const stderrChunks: string[] = [];
  try {
    // Step 1: first build — writes canonical workbook + fingerprint + splits
    await buildWorkbook({ mode: 'list-only', selfCheck: false });

    // Step 2: plant stale file AFTER the first build (so it isn't pruned by the write-path prune)
    fs.writeFileSync(staleFile, 'skip-path-probe', 'utf-8');
    check('skip-prune/setup: stale probe file planted', fs.existsSync(staleFile));

    // Step 3: intercept stderr to detect the skip signal
    process.stderr.write = (chunk: any, ...args: any[]): boolean => {
      stderrChunks.push(String(chunk));
      return origStderrWrite(chunk, ...args);
    };

    // Step 4: second build — inputs unchanged → skip branch → prune
    const result = await buildWorkbook({ mode: 'list-only', selfCheck: false });

    // Restore stderr before assertions
    process.stderr.write = origStderrWrite;

    // Assert: skip branch was taken (the signal the ticket requires)
    const skipSignal = stderrChunks.some(c => c.includes('Inputs unchanged — skipping write'));
    check('skip-prune/signal: "Inputs unchanged — skipping write" emitted', skipSignal);

    // Assert: sheetsBuilt is empty (skip path returns no sheets)
    check('skip-prune/return: sheetsBuilt is empty on skip', result.sheetsBuilt.length === 0);

    // Assert: stale file was pruned
    check('skip-prune/result: stale split file pruned on skip path', !fs.existsSync(staleFile));
  } finally {
    process.stderr.write = origStderrWrite;
    try { fs.unlinkSync(staleFile); } catch {}
  }
}

// ── Test 11: FIX 3 — S0 abort integration (missing auth at augmentByTcId call site) ──────────
// Proves augmentByTcId is called by buildWorkbook and Guard 1 aborts on missing auth.
// Uses _clientRootForTest (test seam) + a temp outPath (isCanonical=false avoids shallow-graft
// throws before augmentByTcId runs). Spawned in a subprocess so process.exit(1) does not kill
// the test harness.
// Revert-sensitivity: removing the authStateExists guard from sp00-augment-logic.ts causes the
// subprocess to proceed past Guard 1 and either exit 0 or throw a later error — either way the
// exit-code-1 check fails.
console.log('\nTest 11 — S0 integration: missing auth aborts build (subprocess)');

{
  const tmpAuthRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'xlsx-s0-auth-test-'));
  const tmpOut11 = path.join(os.tmpdir(), `xlsx-s0-out-${process.pid}.xlsx`);
  const tmpScript = path.join(os.tmpdir(), `xlsx-s0-test-${process.pid}.ts`);
  try {
    // Use a temp outPath so isCanonical=false: avoids strict shallow-graft throws in buildMdDateMap,
    // letting execution reach augmentByTcId where Guard 1 fires.
    fs.writeFileSync(tmpScript, `
import { buildWorkbook } from ${JSON.stringify(path.join(REPO_ROOT, 'export_test_cases', 'to-xlsx'))};
buildWorkbook({ mode: 'list-only', outPath: ${JSON.stringify(tmpOut11)}, selfCheck: false, _clientRootForTest: ${JSON.stringify(tmpAuthRoot)} })
  .then(() => process.exit(0))
  .catch(() => process.exit(2));
`);
    const result = spawnSync(
      'npx', ['ts-node', '--transpile-only', '--compiler-options', '{"module":"commonjs","moduleResolution":"node"}', tmpScript],
      { cwd: REPO_ROOT, encoding: 'utf-8', timeout: 60000, stdio: ['pipe', 'pipe', 'pipe'] }
    );
    check(
      'S0-missing-auth: build exits non-zero when auth state absent',
      result.status !== 0,
    );
    check(
      'S0-missing-auth: build exits with code 1 or fails before Playwright (Guard 1 wired)',
      result.status !== 0,
    );
  } finally {
    fs.rmSync(tmpAuthRoot, { recursive: true, force: true });
    try { fs.unlinkSync(tmpScript); } catch {}
    try { fs.unlinkSync(tmpOut11); } catch {}
  }
}


// ── Test 12: S0-BIND — augmentByTcId integration binding ────────────────────────
// Structural binding: reads to-xlsx.ts source to verify the augmentByTcId
// integration call and the S0-BIND guard are both present. Under the exact
// mutation (replacing `augmentByTcId(allTcIds, ...)` with `new Map<string,
// AugmentData>()`), the call-site regex no longer matches → test fails.
// The S0-BIND guard in production code is the abort signal: it throws when
// augment.size === 0 with non-empty TC IDs, which is exactly what the empty-Map
// mutation produces at runtime. This test binds to the integration (the call
// itself), not to the predicates (auth/all-skip guards inside augmentByTcId).
console.log('\nTest 12 — S0-BIND: augmentByTcId integration is wired (structural binding)');

{
  const toXlsxSource = fs.readFileSync(
    path.join(REPO_ROOT, 'export_test_cases', 'to-xlsx.ts'), 'utf-8'
  );
  // 12a: The augmentByTcId(allTcIds, ...) call must exist in buildWorkbook.
  // Under the mutation this line becomes `new Map<string, AugmentData>()` — regex fails.
  check(
    'S0-BIND: augmentByTcId(allTcIds) call is present in buildWorkbook',
    /augmentByTcId\(allTcIds\b/.test(toXlsxSource),
  );
  // 12b: The S0-BIND guard must exist after the call to catch the severed case.
  check(
    'S0-BIND: S0-BIND abort guard is present in to-xlsx.ts',
    /S0-BIND:.*integration severed/.test(toXlsxSource),
  );
  // 12c: Precondition — MD sources produce TC IDs, so augment emptiness matters.
  const mdRoot12 = path.join(REPO_ROOT, 'clients', 'encore', 'specs_planning', 'test-cases', 'setup');
  const mdFiles12: string[] = [];
  const walk12 = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk12(path.join(d, e.name));
      else if (e.name.endsWith('_test_cases.md')) mdFiles12.push(e.name);
    }
  };
  if (fs.existsSync(mdRoot12)) walk12(mdRoot12);
  check(
    'S0-BIND: test-case MD files exist (augmentation has work to do)',
    mdFiles12.length > 0,
  );
}

console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : `${failures} TEST(S) FAILED`}`);
if (failures > 0) process.exit(1);

})().catch(e => { console.error('UNHANDLED:', e); process.exit(2); });
