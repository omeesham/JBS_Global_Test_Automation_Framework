#!/usr/bin/env node
/**
 * check-save-honesty.mjs — BLOCKING gate for the LR-067 "save-honesty" defect class.
 *
 * FRAMEWORK-SIDE ONLY. Lives in scripts/ and is NEVER shipped to a client (ship is
 * `git archive HEAD clients/<id>/`, which excludes this path). Sibling of:
 *   - check-save-route-parity.mjs (LR-066, pre-commit Gate 5d)
 *   - check-per-test-baseline.mjs (LR-019, pre-commit Gate 5e)
 *
 * It flags two patterns in client page object files (each client src/pages tree):
 *
 *   1. LYING SAVE PRIMITIVE — a method that checks `isDisabled()` and then, on that branch,
 *      reports success without signalling the no-op: `return { success: true }` with no `saved`
 *      field, or `return true`, or `return 'none'`. A disabled-button no-op that looks identical
 *      to a real persisted save is the root of the office-1604 Pay To leak.
 *
 *   2. RESTORE-NO-VERIFY — a method named restore* / reset* / revert* / cleanup* /
 *      ensureDefault* / ensureEmpty* / ensureClean* / ensureAll* that calls a save helper but neither uses
 *      the shared `saveAndVerifyPersisted` helper nor wraps the save in a retry loop that
 *      CONTAINS the save call (a loop only counts when it wraps the save — an unrelated loop
 *      such as a row-deletion while followed by a one-shot save does NOT satisfy this check).
 *      Reverting shared server state without a post-reload re-read can leak a test value into
 *      the next run.
 *
 * Usage:
 *   node scripts/check-save-honesty.mjs            # full scan (all page object files)
 *   node scripts/check-save-honesty.mjs --staged   # scope to git-staged page objects (what the hook runs)
 *
 * Exit:   0 = clean (PASS), 1 = one or more violations (FAIL — commit is blocked).
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const PAGES_GLOB_ROOT = join(ROOT, 'clients');

// --- Shared scan building blocks (brace-matched method extraction + save/verify regexes) ---

const SAVE_CALL = /\b(?:clickSave|saveAndConfirm|clickSaveWithDialog|clickSaveAndCaptureDialog)\s*\(/;
const VERIFY_HELPER = /\bsaveAndVerifyPersisted\s*\(/;

// Methods whose names start with these prefixes are STATUS QUERIES / utilities that legitimately
// return a bare boolean near an isDisabled() check. They are not save primitives, so excluding
// them removes the obvious false-positive class.
const QUERY_PREFIX = /^(?:is|has|wait|get|should|can|find|count|read|column)/;

/** Recursively collect *.ts files under clients/<id>/src/pages. */
function collectPageFiles(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      collectPageFiles(full, out);
    } else if (e.isFile() && e.name.endsWith('.ts')) {
      // Only files inside a src/pages directory of a client.
      const rel = relative(ROOT, full).split(sep).join('/');
      if (/^clients\/[^/]+\/src\/pages\//.test(rel)) out.push(full);
    }
  }
}

/** Extract { name, startLine, body } for every `async <name>(...)` method via brace matching. */
function extractMethods(src) {
  const methods = [];
  const re = /\basync\s+([A-Za-z0-9_]+)\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    // Find the opening brace of the method body after the parameter list.
    let i = re.lastIndex;
    let depthParen = 1;
    // We started just after the '('; walk to the matching ')'.
    while (i < src.length && depthParen > 0) {
      const c = src[i++];
      if (c === '(') depthParen++;
      else if (c === ')') depthParen--;
    }
    // Skip the return-type annotation to the REAL body '{'. The annotation can itself contain
    // braces (e.g. `Promise<{ success: boolean }>`), so track angle-bracket depth and only accept a
    // '{' seen at angle-depth 0 as the body; a ';' at depth 0 means a bodyless signature.
    let angle = 0;
    let bodyless = false;
    while (i < src.length) {
      const c = src[i];
      if (c === '<') angle++;
      else if (c === '>') { if (angle > 0) angle--; }
      else if (c === '{' && angle === 0) break;
      else if (c === ';' && angle === 0) { bodyless = true; break; }
      i++;
    }
    if (bodyless || src[i] !== '{') continue; // abstract / interface signature, no body
    // Brace-match the body.
    let depth = 0;
    const bodyStart = i;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    const body = src.slice(bodyStart, i);
    const startLine = src.slice(0, m.index).split('\n').length;
    methods.push({ name: m[1], startLine, body });
  }
  return methods;
}

/** Line number (1-based) of a regex match within a body, offset by the method's start line. */
function lineOf(body, methodStartLine, regex) {
  const idx = body.search(regex);
  if (idx === -1) return methodStartLine;
  return methodStartLine + body.slice(0, idx).split('\n').length - 1;
}

/** True only if a SAVE_CALL appears INSIDE a for/while loop body (a genuine save-retry), not merely
 * elsewhere in the method. An unrelated loop (e.g. a row-deletion `while`) followed by a one-shot save
 * must NOT count as "verified" — that was the false-negative this replaces. */
function saveInsideLoop(body) {
  const loopRe = /\b(?:for|while)\s*\(/g;
  let m;
  while ((m = loopRe.exec(body)) !== null) {
    // Walk to the matching ')' of the loop header.
    let i = loopRe.lastIndex;
    let depthParen = 1;
    while (i < body.length && depthParen > 0) {
      const c = body[i++];
      if (c === '(') depthParen++;
      else if (c === ')') depthParen--;
    }
    while (i < body.length && /\s/.test(body[i])) i++;
    if (body[i] !== '{') {
      // Braceless single-statement loop body — check up to the next ';'.
      const semi = body.indexOf(';', i);
      const stmt = body.slice(i, semi === -1 ? body.length : semi);
      if (SAVE_CALL.test(stmt)) return true;
      continue;
    }
    // Brace-match the loop body block.
    let depth = 0;
    const start = i;
    for (; i < body.length; i++) {
      const c = body[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    if (SAVE_CALL.test(body.slice(start, i))) return true;
  }
  return false;
}

// --- New constants for LR-067 ---

// LR-067 restore name set (extends the original restore/reset/revert/cleanup with the per-test
// baseline persisters named in the rule, plus ensureAll* — e.g. ensureAllGridColumnsVisible —
// which restores a server-persisted preference the same way ensureDefault*/ensureClean* do).
// Matched against the METHOD NAME.
const RESTORE_NAME = /^(?:restore|reset|revert|cleanup|ensureDefault|ensureEmpty|ensureClean|ensureAll)\w*/;

// Inline waiver: a method that legitimately persists-then-verifies by a path this gate can't see,
// or a DOM-only reset, declares this marker in its body to opt out of Check 2. The marker MUST
// carry a substantive reason (>= 20 chars) — a bare `// save-verify-exempt:` (or `// save-verify-exempt: ok`)
// is NOT a valid opt-out, so a future agent cannot self-serve past this gate on a broken restore.
// Mirrors the >= 20-char reason enforced by check-save-route-parity.mjs (WAIVER_RE) and the
// per-test-baseline WAIVED marker. (LR-067 skip-hatch closure, 2026-07-01.)
const EXEMPT_MARKER = /save-verify-exempt:\s*\S.{19,}/; // marker + a non-space + >=19 more chars => reason >= 20 chars

// --- Staged-files helper ---

/** Returns absolute paths of staged page object .ts files. Used when --staged is passed. */
function stagedPageFiles() {
  try {
    return execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n').map((s) => s.trim()).filter(Boolean)
      .filter((rel) => /^clients\/[^/]+\/src\/pages\/.*\.ts$/.test(rel))
      .map((rel) => join(ROOT, rel));
  } catch (err) {
    // No staged list available (e.g. not a git context) → scan nothing in --staged mode.
    // Returning [] makes --staged a no-op rather than crashing the commit hook.
    return [];
  }
}

// --- Core checker ---

/** Runs both checks on the given file list, returns an array of flag strings. */
function findings(files) {
  const flags = [];

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file).split(sep).join('/');

    for (const method of extractMethods(src)) {
      const body = method.body;

      // CHECK 1 — LYING-PRIMITIVE: a NON-query method whose DISABLED BRANCH reports success without
      // signalling the no-op. Inspect only the short window right after each `.isDisabled()` check
      // (not the whole body), so a legitimate end-of-method `return 'none'` / `return true` on a
      // different (non-disabled) path is not a false positive.
      if (!QUERY_PREFIX.test(method.name)) {
        for (const dm of body.matchAll(/\.isDisabled\s*\(/g)) {
          const win = body.slice(dm.index, dm.index + 320); // ~8 lines: the disabled guard block
          const fakeObj = /return\s*\{\s*success:\s*true\s*(?:,\s*networkError[^}]*)?\}/.test(win) && !/saved\s*:/.test(win);
          const fakeNone = /return\s+'none'\s*;/.test(win);
          const fakeBool = /return\s+true\s*;/.test(win);
          if (fakeObj || fakeNone || fakeBool) {
            const kind = fakeObj ? 'return {success:true} (no `saved`)' : fakeNone ? "return 'none'" : 'return true';
            const ln = method.startLine + body.slice(0, dm.index).split('\n').length - 1;
            flags.push(`${rel}:${ln}  LYING-PRIMITIVE  ${method.name}() reports success on an isDisabled() branch via ${kind} -- signal the no-op (saved:false / 'disabled').`);
            break; // one flag per method is enough
          }
        }
      }

      // CHECK 2 — RESTORE-NO-VERIFY: a restore/reset/revert/cleanup/ensureDefault/ensureEmpty/
      // ensureClean method that saves but never verifies. The EXEMPT_MARKER opt-out lets a method
      // that verifies by a path this gate cannot see (or a DOM-only reset) declare its own reason.
      if (RESTORE_NAME.test(method.name) && SAVE_CALL.test(body) && !VERIFY_HELPER.test(body) && !saveInsideLoop(body) && !EXEMPT_MARKER.test(body)) {
        const ln = lineOf(body, method.startLine, SAVE_CALL);
        flags.push(`${rel}:${ln}  RESTORE-NO-VERIFY  ${method.name}() persists shared state but neither uses saveAndVerifyPersisted nor a retry loop -- verify the change landed, or mark // save-verify-exempt: <reason>.`);
      }
    }
  }

  return flags;
}

// --- Main ---

const stagedOnly = process.argv.includes('--staged');
const files = stagedOnly
  ? stagedPageFiles()
  : (() => { const out = []; collectPageFiles(PAGES_GLOB_ROOT, out); return out; })();

if (stagedOnly && files.length === 0) {
  console.log('SKIP: save-honesty (LR-067) — no page object is staged.');
  process.exit(0);
}

if (!stagedOnly && files.length === 0) {
  if (!existsSync(PAGES_GLOB_ROOT)) {
    console.error(`FAIL: save-honesty (LR-067) — clients directory not found at ${PAGES_GLOB_ROOT}. Run from the repo root.`);
  } else {
    console.error(`FAIL: save-honesty (LR-067) — 0 page object .ts files found under ${PAGES_GLOB_ROOT}/*/src/pages/. Expected at least one.`);
  }
  process.exit(1);
}

const flags = findings(files);

if (flags.length === 0) {
  console.log(`PASS: save-honesty (LR-067) — ${files.length} page object file(s) scanned, 0 violations.`);
  process.exit(0);
}

console.error(`\nFAIL: save-honesty (LR-067) — ${flags.length} violation(s):\n`);
for (const f of flags) console.error('  - ' + f);
console.error('\nSee LR-067 in .claude/rules/specs.md.');
process.exit(1);
