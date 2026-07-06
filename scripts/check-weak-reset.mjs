#!/usr/bin/env node
/**
 * Weak-reset gate (LR-019/LR-067 family — remediation Phase 5 gate #6).
 *
 * SCOPE — what THIS gate adds over its siblings (honest, per the 2026-07-06 fleet audit):
 *   - check-per-test-baseline.mjs (#2) verifies a save-capable describe HAS a per-test reset MECHANISM.
 *   - check-save-honesty.mjs (#5) verifies a reset METHOD in a page object verifies its own persistence.
 *   - THIS gate (#6) verifies the reset a describe runs actually RESTORES A BASELINE — it forbids the
 *     "bare-save reset" anti-pattern: a `beforeEach`/`afterEach` whose only persistence action is a Save
 *     (saveAndConfirm / clickSave*) with NO restore-to-baseline (ensureDefaultState / ensureEmptyState /
 *     ensureClean* / reloadAndReselect), NO FCC runner, and NO fresh open(). A reset that merely SAVES the
 *     current (already-mutated) state pins the wrong baseline for every later test — the field the last
 *     test changed is never put back.
 *
 * The 2026-07-06 audit (14 save-capable specs, Copilot-fleet-extracted + Opus-verified) found ZERO such
 * anti-patterns — every describe uses a covers-all mechanism. So this gate is fail-GREEN on the clean
 * tree; it exists to catch a FUTURE regression that introduces a bare-save reset, plus to enforce a
 * declared field-coverage contract for any future `partial-manual` reset (a reset that restores only a
 * named subset of fields).
 *
 * Registry (both optional — the clean tree needs neither):
 *   - PARTIAL_MANUAL : a describe whose reset legitimately restores only a NAMED subset of fields. The gate
 *                      then enforces fieldsCoveredByReset ⊇ fieldsMutated. (Empty today — no such describe.)
 *   - WAIVED         : a spec whose weak-reset fix is deferred, with a reason >= 20 chars + a backlog ref.
 *
 * Usage:
 *   node scripts/check-weak-reset.mjs            # scan every save-capable describe repo-wide
 *   node scripts/check-weak-reset.mjs --staged   # scan only save-capable specs that are git-staged
 *
 * Exit 0 = no bare-save reset; every PARTIAL_MANUAL contract satisfied. Exit 1 = a weak reset or an
 * unmet field-coverage contract or a stale registry entry.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { execSync } from 'node:child_process';

const TESTS_GLOB_ROOT = 'clients';

// --- PARTIAL_MANUAL: a describe whose reset restores only a named subset of fields (empty on clean tree).
// Shape: { specPath, title, occurrence?, fieldsMutated:[...], fieldsCoveredByReset:[...], reason }
const PARTIAL_MANUAL = [];

// --- WAIVED: weak-reset fix deferred; reason >= 20 chars + a backlogRef that must exist on disk.
const WAIVED = [];

// Helpers that persist (a Save). A reset scope containing one of these but no restore = weak reset.
const SAVE_HELPERS = [
  'clickSaveExpectDialog',
  'clickSaveWithDialog',
  'confirmSaveAndGetNewId',
  'saveAndConfirm',
  'clickSave',
];
const SAVE_CAPABLE_RE = new RegExp('\\b(' + [...SAVE_HELPERS, 'saveAndVerifyCase'].join('|') + ')\\s*\\(');
const SAVE_IN_SCOPE_RE = new RegExp('\\b(' + SAVE_HELPERS.join('|') + ')\\s*\\(');
// Restore-to-baseline helpers (covers-all): re-read/re-set the whole row/form to a known state.
const RESTORE_RE = /\b(ensureDefaultState|ensureEmptyState|ensureClean\w*|ensureAllGridColumnsVisible|reloadAndReselect)\s*\(/;
const FCC_RE = /\bsaveAndVerifyCase\s*\(/;
const FRESH_OPEN_RE = /\bopen\s*\(/;

/** All describe blocks in a spec, in order: [{ title, block }]. Positional — robust to duplicate titles. */
export function allDescribeBlocks(src) {
  const re = /test\.describe\(\s*['"`]([^'"`]*)['"`]/g;
  const starts = [];
  let m;
  while ((m = re.exec(src))) starts.push({ title: m[1], index: m.index });
  return starts.map((s, i) => ({
    title: s.title,
    block: src.slice(s.index, i + 1 < starts.length ? starts[i + 1].index : src.length),
  }));
}

/** The text of a `test.hook(...)` body within a describe block, up to the first real test. */
function hookSlice(block, hook) {
  const re = new RegExp('test\\.' + hook + '\\(');
  const h = re.exec(block);
  if (!h) return '';
  const after = block.slice(h.index + h[0].length);
  const firstTest = /\n\s*test\s*\(|\n\s*test\.(?:skip|only|fixme|fail|slow)\s*\(/.exec(after);
  return firstTest ? after.slice(0, firstTest.index) : after;
}

/** The combined reset scope of a describe = its beforeEach + afterEach hook bodies. */
function resetScope(block) {
  return hookSlice(block, 'beforeEach') + '\n' + hookSlice(block, 'afterEach');
}

/** Classify a save-capable describe's reset. */
export function classifyReset(block) {
  if (FCC_RE.test(block)) return 'fcc';                        // FCC runner: baseline compile-required
  const scope = resetScope(block);
  if (RESTORE_RE.test(scope)) return 'covers-all';            // restores a baseline
  if (FRESH_OPEN_RE.test(scope)) return 'fresh-open';         // fresh page each test
  if (SAVE_IN_SCOPE_RE.test(scope)) return 'bare-save';       // saves without restoring — WEAK
  return 'no-reset';                                          // no reset action (that is #2's concern)
}

function stagedFiles() {
  try {
    return new Set(
      execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n').map((s) => s.trim()).filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

function walkSpecs(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walkSpecs(full, out);
    } else if (e.isFile() && e.name.endsWith('.spec.ts')) {
      const rel = relative(process.cwd(), full).split(sep).join('/');
      if (/^clients\/[^/]+\/tests\//.test(rel)) out.push(rel);
    }
  }
}

function partialFor(specPath, title) {
  return PARTIAL_MANUAL.find((p) => p.specPath === specPath && title.trimStart().startsWith(p.title));
}

function main() {
  const stagedOnly = process.argv.includes('--staged');
  const staged = stagedOnly ? stagedFiles() : null;
  const waivedPaths = new Set(WAIVED.map((w) => w.specPath));

  const failures = [];
  const warnings = [];
  let checked = 0;

  // Validate WAIVED entries (reason + backlogRef must be real).
  for (const w of WAIVED) {
    if (stagedOnly && !staged.has(w.specPath)) continue;
    if (!existsSync(w.specPath)) { failures.push(`${w.specPath}: WAIVED spec not found (stale registry entry)`); continue; }
    if (!w.reason || w.reason.trim().length < 20) { failures.push(`${w.specPath}: waiver reason must be >= 20 chars`); continue; }
    if (!w.backlogRef || !existsSync(w.backlogRef)) { failures.push(`${w.specPath}: waiver backlogRef missing on disk (${w.backlogRef ?? 'none'})`); continue; }
    console.log(`WAIVED: ${w.specPath} — ${w.reason}`);
  }

  const allSpecs = [];
  walkSpecs(TESTS_GLOB_ROOT, allSpecs);
  for (const rel of allSpecs) {
    if (stagedOnly && !staged.has(rel)) continue;
    if (waivedPaths.has(rel)) continue;
    let src;
    try { src = readFileSync(rel, 'utf8'); } catch { continue; }
    for (const { title, block } of allDescribeBlocks(src)) {
      if (!SAVE_CAPABLE_RE.test(block)) continue; // not save-capable → no reset obligation
      checked++;
      const kind = classifyReset(block);
      const pm = partialFor(rel, title);
      if (pm) {
        // enforce field-coverage contract for a declared partial-manual reset
        const missing = pm.fieldsMutated.filter((f) => !pm.fieldsCoveredByReset.includes(f));
        if (missing.length) {
          failures.push(`${rel} :: "${title.slice(0, 50)}" — partial-manual reset does NOT restore field(s): ${missing.join(', ')}.`);
        }
        continue;
      }
      if (kind === 'bare-save') {
        failures.push(
          `${rel} :: "${title.slice(0, 50)}" — WEAK RESET: the beforeEach/afterEach saves (` +
          `${SAVE_HELPERS.find((h) => new RegExp('\\b' + h + '\\s*\\(').test(resetScope(block))) || 'save'}) ` +
          `but never restores a baseline. Use ensureDefaultState/ensureEmptyState/reloadAndReselect, the FCC ` +
          `runner, or a fresh open() — or register the describe in PARTIAL_MANUAL with the fields it restores.`,
        );
      } else if (kind === 'no-reset') {
        // A save-capable describe with no reset action at all — that is check-per-test-baseline's (#2)
        // domain. Surface as WARN here (not a double-FAIL) so the two gates don't duplicate the block.
        warnings.push(`${rel} :: "${title.slice(0, 50)}" — save-capable but no reset action found (see per-test-baseline gate #2).`);
      }
    }
  }

  if (stagedOnly && checked === 0 && warnings.length === 0) {
    console.log('SKIP: weak-reset (LR-019/LR-067) — no save-capable spec is staged.');
    return 0;
  }
  if (warnings.length) {
    console.warn('\nWARN: weak-reset — save-capable describe(s) with no reset action (per-test-baseline gate owns these):');
    for (const w of warnings) console.warn('  ? ' + w);
  }
  if (failures.length) {
    console.error('\nFAIL: weak-reset — a reset saves without restoring a baseline, or a partial-manual contract is unmet:\n');
    for (const f of failures) console.error('  - ' + f);
    console.error(`\n${failures.length} violation(s) across ${checked} save-capable describe(s). See LR-019/LR-067 in .claude/rules/specs.md.`);
    return 1;
  }
  console.log(`\nPASS: weak-reset — ${checked} save-capable describe(s) scanned; no bare-save resets, ${PARTIAL_MANUAL.length} partial-manual contract(s) satisfied, ${warnings.length} warning(s).`);
  return 0;
}

// ESM entry-point guard so the .test.mjs can import the helpers without running main().
import { pathToFileURL } from 'node:url';
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
