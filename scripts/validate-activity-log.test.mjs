#!/usr/bin/env node
/**
 * Unit tests for validate-activity-log.mjs — parseStagedAddedRows() + computeRowViolations()
 * + extractFiles(). Zero deps; mirrors the check-testid-preference.test.mjs harness.
 * Run: node scripts/validate-activity-log.test.mjs   (exit 0 = all pass, 1 = a case failed)
 *
 * Proves the LR-037 staged-scoping fix (2026-07-06):
 *   (1) staged-diff parsing keeps ONLY the added real data rows (drops '-' rows + non-row noise);
 *   (2) anti-backdating STILL fires on a fresh backdated row (the LR-037 canonical case) — the
 *       fix removes false positives WITHOUT weakening the actual threat detection;
 *   (3) tolerance boundary (1 min) is exact;
 *   (4) the FP class is structurally gone because only STAGED-ADDED rows are ever passed to the
 *       checker — already-committed rows (89/90) whose files drifted are never in the input set.
 */
import {
  parseStagedAddedRows,
  computeRowViolations,
  extractFiles,
  parseRowTime,
  isGeneratedFile,
} from './validate-activity-log.mjs';

let pass = 0, fail = 0;
const check = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; } else { fail++; console.error(`  FAIL ${name}: got ${g}, want ${w}`); }
};

// Local-time ms for a 'YYYY-MM-DDTHH:MM' string — reuse the module's own parser so test times
// line up exactly with how the checker interprets a row's "When".
const at = parseRowTime;
const mkRow = (when, filesCell, lineNo = 1) =>
  ({ lineNo, when, whenMs: at(when), agent: 'OWNER', action: 'done', filesCell });

// ---- parseStagedAddedRows: only ADDED real data rows survive ----
const diff = [
  'diff --git a/clients/encore/specs_planning/_internal/agent-activity-log.md b/clients/encore/specs_planning/_internal/agent-activity-log.md',
  'index abc1234..def5678 100644',
  '--- a/clients/encore/specs_planning/_internal/agent-activity-log.md',
  '+++ b/clients/encore/specs_planning/_internal/agent-activity-log.md',
  '@@ -100,0 +101,2 @@',
  '+| 2026-07-06T22:00 | OWNER | done | scripts/foo.mjs | did a thing |',
  '+| 2026-07-06T22:05 | OWNER | done | scripts/bar.mjs | did another |',
  '@@ -50,1 +53,1 @@',
  '-| 2026-01-01T00:00 | OWNER | done | old.md | a removed row (must be ignored) |',
  '+| 2026-07-06T22:10 | OWNER | done | scripts/baz.mjs | replaced row |',
  '@@ -200,0 +206,1 @@',
  '+Some prose line that is not a markdown table row',
].join('\n');

const parsed = parseStagedAddedRows(diff);
check('staged-added-count', parsed.length, 3);
check('staged-added-whens', parsed.map(r => r.when),
  ['2026-07-06T22:00', '2026-07-06T22:05', '2026-07-06T22:10']);
check('staged-added-files', parsed.map(r => r.filesCell),
  ['scripts/foo.mjs', 'scripts/bar.mjs', 'scripts/baz.mjs']);
check('staged-excludes-removed', parsed.some(r => r.when === '2026-01-01T00:00'), false);

// Added header/separator lines are NOT data rows.
const diffHdr = [
  '+++ b/x.md',
  '@@ -1,0 +1,2 @@',
  '+| When | Agent | Status | Files | Description |',
  '+|---|---|---|---|---|',
].join('\n');
check('staged-skips-header-separator', parseStagedAddedRows(diffHdr).length, 0);

// Empty / undefined diff → no rows (the "nothing staged → exit 0" case).
check('staged-empty', parseStagedAddedRows('').length, 0);
check('staged-undefined', parseStagedAddedRows(undefined).length, 0);

// ---- computeRowViolations: anti-backdating STILL fires (LR-037 canonical case) ----
// File 'late.mjs' truly last touched 2026-07-06T14:32; a row claiming 09:00 is BACKDATED.
const resolverLate = (f) => f === 'scripts/late.mjs'
  ? { time: at('2026-07-06T14:32'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };

const backdated = computeRowViolations([mkRow('2026-07-06T09:00', 'scripts/late.mjs')], resolverLate);
check('backdated-fires', backdated.violations.length, 1);
check('backdated-file', backdated.violations[0]?.file, 'scripts/late.mjs');
check('backdated-delta-min', backdated.violations[0]?.deltaMinutes, 332); // 14:32 - 09:00 = 5h32m

// A truthful row (claim AFTER the file's true time) → clean.
const truthful = computeRowViolations([mkRow('2026-07-06T15:00', 'scripts/late.mjs')], resolverLate);
check('truthful-clean', truthful.violations.length, 0);

// ---- tolerance boundary (1 min, strictly greater-than fires) ----
const constResolver = (ms) => () => ({ time: ms, source: 'mtime', exists: true });
const base = at('2026-07-06T10:00');
const rowAt10 = [mkRow('2026-07-06T10:00', 'scripts/x.mjs')];
check('tol-plus-1min-ok',   computeRowViolations(rowAt10, constResolver(base + 60_000)).violations.length, 0);
check('tol-plus-2min-fires', computeRowViolations(rowAt10, constResolver(base + 120_000)).violations.length, 1);

// ---- missing files → skipped, never a violation ----
const resolverMissing = () => ({ time: null, source: 'missing', exists: false });
const miss = computeRowViolations([mkRow('2026-07-06T10:00', 'scripts/gone.mjs')], resolverMissing);
check('missing-no-violation', miss.violations.length, 0);
check('missing-skipped', miss.skipped.length, 1);

// ---- FP class is structurally gone: rows 89/90-shaped inputs, if not staged, are never checked.
// (The real gate feeds computeRowViolations ONLY parseStagedAddedRows output; an empty staged
//  diff yields zero rows → zero violations, regardless of how far the referenced files drifted.)
const noStagedRows = computeRowViolations(parseStagedAddedRows(''), resolverLate);
check('fp-gone-empty-input', noStagedRows.violations.length, 0);

// ---- generated-file exemption (LR-037 FP fix v2): plans/INDEX.md is regenerated + re-staged
// by the pre-commit hook, bumping its mtime PAST an honest row's When — must NOT be a violation.
check('isGenerated-index',      isGeneratedFile('plans/INDEX.md'), true);
check('isGenerated-real-file',  isGeneratedFile('scripts/foo.mjs'), false);
check('isGenerated-other-index', isGeneratedFile('docs/INDEX.md'), false);

// A row whose ONLY file is the hook-bumped INDEX.md, with an honest earlier When → CLEAN.
// (This is the exact founding incident: row at 22:21, INDEX.md re-touched to 22:35 by the hook.)
const idxResolver = (f) => f === 'plans/INDEX.md'
  ? { time: at('2026-07-06T22:35'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };
const genOnly = computeRowViolations([mkRow('2026-07-06T22:21', 'plans/INDEX.md')], idxResolver);
check('generated-only-clean', genOnly.violations.length, 0);
check('generated-only-skipped', genOnly.skipped.some(s => /all-files-generated/.test(s.reason)), true);

// Mixed row: honest real file + the generated INDEX.md → still CLEAN (real file not backdated,
// INDEX.md exempt). Real file last touched 10:00, row claims 10:00.
const mixResolver = (f) => f === 'plans/INDEX.md'
  ? { time: at('2026-07-06T22:35'), source: 'mtime', exists: true }
  : f === 'plans/done/X.md'
  ? { time: at('2026-07-06T10:00'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };
const mixed = computeRowViolations([mkRow('2026-07-06T10:00', 'plans/done/X.md, plans/INDEX.md')], mixResolver);
check('mixed-clean', mixed.violations.length, 0);

// CRITICAL — the exemption must NOT mask a genuinely backdated REAL file sitting next to INDEX.md.
const mixBackResolver = (f) => f === 'plans/INDEX.md'
  ? { time: at('2026-07-06T22:35'), source: 'mtime', exists: true }
  : f === 'scripts/late.mjs'
  ? { time: at('2026-07-06T14:32'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };
const mixBack = computeRowViolations([mkRow('2026-07-06T09:00', 'scripts/late.mjs, plans/INDEX.md')], mixBackResolver);
check('mixed-still-fires-on-real', mixBack.violations.length, 1);
check('mixed-fires-file-is-real', mixBack.violations[0]?.file, 'scripts/late.mjs');

// ---- staged + latest-per-file: earlier row for same file is not checked ----
// Row A (earlier) and Row B (later) both reference 'scripts/shared.mjs'.
// File true time is AFTER Row A's claim but BEFORE Row B's claim.
// Under latest-per-file Row A must be skipped; Row B must pass.
const sharedResolver = (f) => f === 'scripts/shared.mjs'
  ? { time: at('2026-07-06T12:00'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };

const rowA = mkRow('2026-07-06T09:00', 'scripts/shared.mjs', 10);
const rowB = mkRow('2026-07-06T13:00', 'scripts/shared.mjs', 20);
const latestForShared = new Map([['scripts/shared.mjs', rowB.whenMs]]);

const lpfBothRows = computeRowViolations([rowA, rowB], sharedResolver, { latestRowForFile: latestForShared });
check('lpf-earlier-row-skipped', lpfBothRows.violations.length, 0);
check('lpf-earlier-row-not-responsible', lpfBothRows.violations.every(v => v.row !== 10), true);

// Without latest-per-file, Row A fires.
const noLpf = computeRowViolations([rowA, rowB], sharedResolver);
check('lpf-without-opt-earlier-fires', noLpf.violations.some(v => v.row === 10), true);

// ---- staged + latest-per-file: REAL-FRAUD detection NOT weakened ----
// A row is the ONLY (latest) row for a file, and the file's true time is AFTER the claim.
// This must still fail — the gate is not weakened by latest-per-file.
const fraudRow = mkRow('2026-07-06T09:00', 'scripts/fraud.mjs', 30);
const fraudResolver = (f) => f === 'scripts/fraud.mjs'
  ? { time: at('2026-07-06T14:00'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };
const latestForFraud = new Map([['scripts/fraud.mjs', fraudRow.whenMs]]);

const fraudCheck = computeRowViolations([fraudRow], fraudResolver, { latestRowForFile: latestForFraud });
check('lpf-real-fraud-still-fires', fraudCheck.violations.length, 1);
check('lpf-real-fraud-file', fraudCheck.violations[0]?.file, 'scripts/fraud.mjs');

// ---- staged-file discriminator: graduating incident still fires; unstaged skips ----
// Graduating incident: file has no prior commit but IS staged.
// fileTrueTime falls through to mtime → fires. Simulated via resolver returning mtime.
const gradStagedResolver = (f) => f === 'scripts/late.mjs'
  ? { time: at('2026-07-06T14:32'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };
const gradStaged = computeRowViolations([mkRow('2026-07-06T09:00', 'scripts/late.mjs')], gradStagedResolver);
check('discriminator-staged-graduating-fires', gradStaged.violations.length, 1);
check('discriminator-staged-graduating-file', gradStaged.violations[0]?.file, 'scripts/late.mjs');

// Same scenario — file NOT staged, no prior commit.
// fileTrueTime returns {time:null, source:'no-prior-commit-not-staged'} → SKIP, no violation.
const gradNotStagedResolver = (f) => f === 'scripts/late.mjs'
  ? { time: null, source: 'no-prior-commit-not-staged', exists: false }
  : { time: null, source: 'missing', exists: false };
const gradNotStaged = computeRowViolations([mkRow('2026-07-06T09:00', 'scripts/late.mjs')], gradNotStagedResolver);
check('discriminator-not-staged-no-violation', gradNotStaged.violations.length, 0);
check('discriminator-not-staged-skipped', gradNotStaged.skipped.length, 1);

// ---- extractFiles / cleanFileToken sanity ----
check('extract-basic', extractFiles('a/b.ts, c/d.ts'), ['a/b.ts', 'c/d.ts']);
check('extract-moved', extractFiles('old.md -> new.md'), ['new.md']);
check('extract-deleted-dropped', extractFiles('gone.md (deleted)'), []);
check('extract-bareword-dropped', extractFiles('reindex, plans/x.md'), ['plans/x.md']);
check('extract-annotation-stripped', extractFiles('src/foo.ts (edited)'), ['src/foo.ts']);

// ---- later-row clearing: earlier row cleared by a later log row covering the file's mtime ----
// Scenario: row A claims 2026-07-24T22:48 for 'scripts/w.sh'; file mtime is 2026-07-25T19:24
// (would be a violation). But a later row in the full log at 2026-07-25T20:00 also names
// 'scripts/w.sh' — its timestamp >= mtime, so row A is not backdating evidence.
const rowALate = mkRow('2026-07-24T22:48', 'scripts/w.sh');
const resolverLateFile = (f) => f === 'scripts/w.sh'
  ? { time: at('2026-07-25T19:24'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };
const laterCovering = new Map([['scripts/w.sh', at('2026-07-25T20:00')]]);
const clearedByLater = computeRowViolations([rowALate], resolverLateFile, { latestRowForFile: laterCovering });
check('cleared-by-later-row', clearedByLater.violations.length, 0);

// Graduating incident with no later row: must still fire.
// Row claims 09:00, file mtime 14:32, latestRowForFile has only this row's own timestamp.
const gradRow = mkRow('2026-07-06T09:00', 'scripts/grad.mjs');
const resolverGradFile = (f) => f === 'scripts/grad.mjs'
  ? { time: at('2026-07-06T14:32'), source: 'mtime', exists: true }
  : { time: null, source: 'missing', exists: false };
const gradOnlyOwn = new Map([['scripts/grad.mjs', at('2026-07-06T09:00')]]);
const gradNoLater = computeRowViolations([gradRow], resolverGradFile, { latestRowForFile: gradOnlyOwn });
check('graduating-no-later-row-fires', gradNoLater.violations.length, 1);
check('graduating-no-later-row-file', gradNoLater.violations[0]?.file, 'scripts/grad.mjs');

// ---- extractFiles brace-expansion (LR-037 brace-notation fix) ----
// Reproduces the row-117 real case: "export_test_cases/{module-codes.json,types.ts,to-xlsx.ts}"
check('brace-expand-basic',
  extractFiles('export_test_cases/{module-codes.json,types.ts,to-xlsx.ts}'),
  ['export_test_cases/module-codes.json', 'export_test_cases/types.ts', 'export_test_cases/to-xlsx.ts']);
check('brace-expand-with-sibling',
  extractFiles('export_test_cases/{module-codes.json,types.ts}, scripts/foo.mjs'),
  ['export_test_cases/module-codes.json', 'export_test_cases/types.ts', 'scripts/foo.mjs']);
check('brace-expand-no-braces-unchanged',
  extractFiles('a/b.ts, c/d.ts'),
  ['a/b.ts', 'c/d.ts']);

console.log(`\nvalidate-activity-log.test: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
