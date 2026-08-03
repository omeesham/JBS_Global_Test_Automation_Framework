#!/usr/bin/env node
/**
 * check-step-labels.mjs — pre-commit gate enforcing the readable-report contract.
 *
 * Four checks:
 *   1. LABEL-JARGON — async page-object methods must not yield untranslated jargon in their
 *      auto-derived label.
 *      Sev: S1. Graduating incident: readable-report label gate introduction (2026-07-xx).
 *   2. SPEC-RAW-PAGE — specs must not call .page.<accessor>...<action> directly — move behind
 *      a labelled page-object method or wrap in test.step().
 *      Sev: S1. Graduating incident: readable-report label gate introduction (2026-07-xx).
 *   3. HAND-LABEL-JARGON — explicit string labels in @step('...') decorators and test.step('...')
 *      calls in page-object files must not contain denied-jargon words. Unlike derived labels, a
 *      hand-written label containing jargon is a deliberate authoring error and leaks internal
 *      vocabulary into a customer-facing report.
 *      Sev: S0. Graduating incident: @step() decorator migration (2026-07-31). Enforcing from
 *      landing — can only fire on labels someone deliberately wrote; no migration wedge risk.
 *   4. DECORATOR-MISSING — every public async method in a page-object file (excluding
 *      auth/login.page.ts, which is deliberately unlabelled) must carry @step on the immediately
 *      preceding line.
 *      Sev: S2. Graduating incident: @step() decorator migration (2026-07-31). Migration complete
 *      (793 of 793) — enforcing by default.
 *
 * Flags:
 *   --enforce              exit 1 on failure (pre-commit mode). Default: warn-only, exit 0.
 *   --staged               scope to git-staged files only.
 *   --count-decorator-targets  print count of public async methods in page files (excl. login) and exit 0.
 *   --self-test            run checks 3 and 4 against the negative fixture and report results.
 *
 * Exit codes: 0 = pass (or warn-only), 1 = fail (enforce + violations found).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { untranslatedJargon, deniedJargon } from './lib/label-derivation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// Login page is deliberately unlabelled — excluded from decorator-presence checks.
const LOGIN_PAGE_SUFFIX = 'auth/login.page.ts';

// ---------- arg parsing ----------
function parseArgs(argv) {
  let enforce = false;
  let staged = false;
  let countDecoratorTargets = false;
  let selfTest = false;
  for (const a of argv) {
    if (a === '--enforce') enforce = true;
    if (a === '--staged') staged = true;
    if (a === '--count-decorator-targets') countDecoratorTargets = true;
    if (a === '--self-test') selfTest = true;
  }
  return { enforce, staged, countDecoratorTargets, selfTest };
}

// ---------- file discovery ----------
function walkDir(dir, filter) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, filter));
    } else if (entry.isFile() && filter(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function discoverPageFiles(staged) {
  if (staged) {
    return getStagedFiles().filter(f => /clients\/[^/]+\/src\/pages\/.*\.(page|component)\.ts$/.test(f.replace(/\\/g, '/')));
  }
  const results = [];
  const clientsDir = join(REPO_ROOT, 'clients');
  if (!existsSync(clientsDir)) return results;
  for (const client of readdirSync(clientsDir, { withFileTypes: true })) {
    if (!client.isDirectory()) continue;
    const pagesDir = join(clientsDir, client.name, 'src', 'pages');
    results.push(...walkDir(pagesDir, name => name.endsWith('.page.ts') || name.endsWith('.component.ts')));
  }
  return results;
}

function discoverSpecFiles(staged) {
  if (staged) {
    return getStagedFiles().filter(f => /clients\/[^/]+\/tests\/.*\.spec\.ts$/.test(f.replace(/\\/g, '/')));
  }
  const results = [];
  const clientsDir = join(REPO_ROOT, 'clients');
  if (!existsSync(clientsDir)) return results;
  for (const client of readdirSync(clientsDir, { withFileTypes: true })) {
    if (!client.isDirectory()) continue;
    const testsDir = join(clientsDir, client.name, 'tests');
    results.push(...walkDir(testsDir, name => name.endsWith('.spec.ts')));
  }
  return results;
}

let _stagedCache = null;
function getStagedFiles() {
  if (_stagedCache !== null) return _stagedCache;
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8', cwd: REPO_ROOT });
    _stagedCache = out.split(/\r?\n/).filter(Boolean).map(f => resolve(REPO_ROOT, f));
  } catch {
    _stagedCache = [];
  }
  return _stagedCache;
}

// ---------- Check 1: label jargon ----------
export function checkLabelJargon(files) {
  const violations = [];
  for (const filePath of files) {
    const text = readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const rel = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineMatch = /^\s*(?:public\s+|private\s+|protected\s+)?async\s+(\w+)\s*\(/.exec(line);
      if (!lineMatch) continue;
      const method = lineMatch[1];
      const jargon = untranslatedJargon(method);
      if (jargon.length > 0) {
        violations.push(`${rel}:${i + 1}  LABEL-JARGON  method ${method} yields untranslated jargon [${jargon.join(', ')}] — add a jargonMap translation or rename`);
      }
    }
  }
  return violations;
}

// ---------- Check 2: direct .page.<action> in specs ----------
const ACCESSOR_RE = /\b\w+\.page\.(locator|getByRole|getByText|getByTestId|getByLabel|getByPlaceholder)\b/;
const ACTION_RE = /\.(click|fill|check|uncheck|press|type|selectOption|dblclick|setChecked)\(/;
const EXEMPT_RE = /\.page\.(reload|waitForLoadState|url|goto|waitForTimeout|evaluate|route|on|off|waitForRequest|waitForResponse|waitForFunction|context|keyboard|mouse)\b/;

export function checkSpecRawPage(files) {
  const violations = [];
  for (const filePath of files) {
    const text = readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const rel = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Quick pre-filter: line must contain .page.
      if (!line.includes('.page.')) continue;
      // Exempt navigational / utility calls
      if (EXEMPT_RE.test(line)) continue;
      // Build a multi-line window (current + next 2 lines) for chained calls
      const window = lines.slice(i, i + 3).join(' ');
      if (ACCESSOR_RE.test(window) && ACTION_RE.test(window)) {
        violations.push(`${rel}:${i + 1}  SPEC-RAW-PAGE  direct .page.<accessor>...<action> — move behind a labelled page-object method or wrap in test.step()`);
      }
    }
  }
  return violations;
}

// ---------- Check 4: hand-written label jargon ----------
// Matches @step('...') or @step("...") or @step(`...`)
const STEP_DEC_LABEL_RE = /@step\(\s*(['"`])([^'"`\n]+)\1/g;
// Matches test.step('...') or test.step("...") or test.step(`...`)
const TEST_STEP_LABEL_RE = /test\.step\(\s*(['"`])([^'"`\n]+)\1/g;

function extractLabelsFromLine(line) {
  const labels = [];
  let m;
  STEP_DEC_LABEL_RE.lastIndex = 0;
  while ((m = STEP_DEC_LABEL_RE.exec(line)) !== null) labels.push(m[2]);
  TEST_STEP_LABEL_RE.lastIndex = 0;
  while ((m = TEST_STEP_LABEL_RE.exec(line)) !== null) labels.push(m[2]);
  return labels;
}

function jargonInLabel(label) {
  return label.split(/\s+/).map(w => w.toLowerCase()).filter(w => deniedJargon.includes(w));
}

export function checkHandLabelJargon(files) {
  const violations = [];
  for (const filePath of files) {
    const text = readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const rel = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      for (const label of extractLabelsFromLine(lines[i])) {
        const hits = jargonInLabel(label);
        if (hits.length > 0) {
          violations.push(`${rel}:${i + 1}  HAND-LABEL-JARGON  label "${label}" contains denied jargon [${hits.join(', ')}] — reword to plain English`);
        }
      }
    }
  }
  return violations;
}

// ---------- Check 4: decorator presence ----------
// Matches any async method that is public by default (bare async) or explicitly public.
// Does NOT match private/protected methods.
const PUBLIC_ASYNC_METHOD_RE = /^\s*(?:public\s+)?async\s+\w+\s*\(/;
const PRIVATE_PROTECTED_ASYNC_RE = /^\s*(?:private|protected)\s/;
const STEP_DECORATOR_RE = /^\s*@step\b/;

function isLoginPage(filePath) {
  return filePath.replace(/\\/g, '/').endsWith(LOGIN_PAGE_SUFFIX);
}

export function checkDecoratorPresence(files) {
  const missing = [];
  for (const filePath of files) {
    if (isLoginPage(filePath)) continue;
    const text = readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const rel = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      if (!PUBLIC_ASYNC_METHOD_RE.test(lines[i])) continue;
      if (PRIVATE_PROTECTED_ASYNC_RE.test(lines[i])) continue;
      const prevLine = i > 0 ? lines[i - 1] : '';
      if (!STEP_DECORATOR_RE.test(prevLine)) {
        const methodMatch = /(?:public\s+)?async\s+(\w+)/.exec(lines[i]);
        const methodName = methodMatch ? methodMatch[1] : '(unknown)';
        missing.push(`${rel}:${i + 1}  DECORATOR-MISSING  async ${methodName}() has no @step on the preceding line`);
      }
    }
  }
  return missing;
}

// ---------- --count-decorator-targets ----------
function countDecoratorTargets(pageFiles) {
  let count = 0;
  for (const filePath of pageFiles) {
    if (isLoginPage(filePath)) continue;
    const text = readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (PUBLIC_ASYNC_METHOD_RE.test(line) && !PRIVATE_PROTECTED_ASYNC_RE.test(line)) count++;
    }
  }
  return count;
}

// ---------- --self-test ----------
function runSelfTest() {
  const fixturePath = join(__dirname, 'test-fixtures', 'negative-step-label.fixture.txt');
  if (!existsSync(fixturePath)) {
    console.error(`SELF-TEST ERROR: fixture not found at ${fixturePath}`);
    process.exit(1);
  }
  const text = readFileSync(fixturePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const relFixture = relative(REPO_ROOT, fixturePath).replace(/\\/g, '/');

  console.log('SELF-TEST: running checks 3 and 4 against ' + relFixture);
  console.log('');

  // Check 3 results
  const ch4Violations = checkHandLabelJargon([fixturePath]);
  if (ch4Violations.length > 0) {
    console.log('Check 3 (HAND-LABEL-JARGON) — flagged:');
    for (const v of ch4Violations) console.log('  FLAGGED: ' + v);
  } else {
    console.log('Check 3 (HAND-LABEL-JARGON) — no violations (unexpected for this fixture)');
  }

  // Check 3 clean-label pass: scan for @step lines not in violations
  const flaggedLines = new Set(ch4Violations.map(v => parseInt(v.split(':')[1])));
  let cleanLabelPassed = false;
  for (let i = 0; i < lines.length; i++) {
    const labels = extractLabelsFromLine(lines[i]);
    if (labels.length > 0 && !flaggedLines.has(i + 1)) {
      console.log(`  PASS: line ${i + 1} label "${labels[0]}" — no denied jargon`);
      cleanLabelPassed = true;
    }
  }
  if (!cleanLabelPassed) {
    console.log('  (no clean @step labels found in fixture)');
  }

  console.log('');

  // Check 4 results
  const ch5Missing = checkDecoratorPresence([fixturePath]);
  if (ch5Missing.length > 0) {
    console.log(`Check 4 (DECORATOR-MISSING) — ${ch5Missing.length} method(s) missing @step:`);
    for (const v of ch5Missing) console.log('  COUNTED: ' + v);
  } else {
    console.log('Check 4 (DECORATOR-MISSING) — 0 missing (unexpected for this fixture)');
  }

  console.log('');
  const ch4Pass = ch4Violations.length > 0 && cleanLabelPassed;
  const ch5Pass = ch5Missing.length > 0;
  if (ch4Pass && ch5Pass) {
    console.log('SELF-TEST PASS: check 3 flagged denied jargon, passed clean label; check 4 detected undecorated method.');
  } else {
    console.error('SELF-TEST FAIL: fixture did not exercise all expected cases.');
    if (!ch4Pass) console.error('  - check 3 did not produce both a FLAGGED and a PASS result');
    if (!ch5Pass) console.error('  - check 4 found 0 undecorated methods');
    process.exit(1);
  }
  process.exit(0);
}

// ---------- main ----------
function main() {
  const args = parseArgs(process.argv.slice(2));

  // Early-exit modes
  if (args.selfTest) {
    runSelfTest();
    return;
  }

  const pageFiles = discoverPageFiles(args.staged);

  if (args.countDecoratorTargets) {
    console.log(countDecoratorTargets(pageFiles));
    process.exit(0);
  }
  const specFiles = discoverSpecFiles(args.staged);

  const totalScoped = pageFiles.length + specFiles.length;
  if (args.staged && totalScoped === 0) {
    console.log('SKIP: step-labels — no page-object/spec staged.');
    process.exit(0);
  }

  if (!args.staged && totalScoped === 0) {
    const clientsDir = join(REPO_ROOT, 'clients');
    if (!existsSync(clientsDir)) {
      process.stderr.write(`FAIL: step-labels — clients/ directory not found at ${clientsDir}. Cannot run non-staged scan.\n`);
    } else {
      process.stderr.write('FAIL: step-labels — non-staged scan found 0 page/spec files under clients/. Expected *.page.ts in src/pages/, or *.spec.ts in tests/.\n');
    }
    process.exit(1);
  }

  const violations = [
    ...checkLabelJargon(pageFiles),
    ...checkSpecRawPage(specFiles),
    ...checkHandLabelJargon(pageFiles),
    ...checkDecoratorPresence(pageFiles),
  ];

  if (violations.length === 0) {
    console.log(`PASS: step-labels — ${pageFiles.length} page files, ${specFiles.length} spec files scanned, 0 violations.`);
    process.exit(0);
  }

  const prefix = args.enforce ? 'FAIL' : 'WARN';
  process.stderr.write(`${prefix}: step-labels — ${violations.length} violation(s):\n`);
  for (const v of violations) {
    process.stderr.write(`  - ${v}\n`);
  }
  process.exit(args.enforce ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
