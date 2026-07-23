#!/usr/bin/env node
/**
 * check-step-labels.mjs — pre-commit gate enforcing the readable-report contract.
 *
 * Three checks:
 *   1. FIXTURE-UNWRAPPED — every `new PageObject(authenticatedSession.page, config)` must be
 *      wrapped in `wrapWithSteps(...)`.
 *   2. LABEL-JARGON — async page-object methods must not yield untranslated jargon in their
 *      auto-derived label.
 *   3. SPEC-RAW-PAGE — specs must not call .page.<accessor>...<action> directly — move behind
 *      a labelled page-object method or wrap in test.step().
 *
 * Flags:
 *   --enforce   exit 1 on failure (pre-commit mode). Default: warn-only, exit 0.
 *   --staged    scope to git-staged files only.
 *
 * Exit codes: 0 = pass (or warn-only), 1 = fail (enforce + violations found).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { untranslatedJargon } from './lib/label-derivation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// ---------- arg parsing ----------
function parseArgs(argv) {
  let enforce = false;
  let staged = false;
  for (const a of argv) {
    if (a === '--enforce') enforce = true;
    if (a === '--staged') staged = true;
  }
  return { enforce, staged };
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

function discoverFixtureFiles(staged) {
  if (staged) {
    return getStagedFiles().filter(f => /clients\/[^/]+\/src\/fixtures\/pages\.fixture\.ts$/.test(f.replace(/\\/g, '/')));
  }
  const results = [];
  const clientsDir = join(REPO_ROOT, 'clients');
  if (!existsSync(clientsDir)) return results;
  for (const client of readdirSync(clientsDir, { withFileTypes: true })) {
    if (!client.isDirectory()) continue;
    const f = join(clientsDir, client.name, 'src', 'fixtures', 'pages.fixture.ts');
    if (existsSync(f)) results.push(f);
  }
  return results;
}

function discoverPageFiles(staged) {
  if (staged) {
    return getStagedFiles().filter(f => /clients\/[^/]+\/src\/pages\/.*\.page\.ts$/.test(f.replace(/\\/g, '/')));
  }
  const results = [];
  const clientsDir = join(REPO_ROOT, 'clients');
  if (!existsSync(clientsDir)) return results;
  for (const client of readdirSync(clientsDir, { withFileTypes: true })) {
    if (!client.isDirectory()) continue;
    const pagesDir = join(clientsDir, client.name, 'src', 'pages');
    results.push(...walkDir(pagesDir, name => name.endsWith('.page.ts')));
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

// ---------- Check 1: fixture wrapping ----------
const CONSTRUCTION_RE = /=\s*new\s+(\w+)\(authenticatedSession\.page,\s*config\)/;

function checkFixtureWrapping(files) {
  const violations = [];
  for (const filePath of files) {
    const text = readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const rel = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = CONSTRUCTION_RE.exec(line);
      if (!m) continue;
      if (!line.includes('wrapWithSteps(')) {
        violations.push(`${rel}:${i + 1}  FIXTURE-UNWRAPPED  new ${m[1]}(...) is not wrapped in wrapWithSteps()`);
      }
    }
  }
  return violations;
}

// ---------- Check 2: label jargon ----------
const ASYNC_METHOD_RE = /^\s*(?:public\s+|private\s+|protected\s+)?async\s+(\w+)\s*\(/gm;

function checkLabelJargon(files) {
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

// ---------- Check 3: direct .page.<action> in specs ----------
const ACCESSOR_RE = /\b\w+\.page\.(locator|getByRole|getByText|getByTestId|getByLabel|getByPlaceholder)\b/;
const ACTION_RE = /\.(click|fill|check|uncheck|press|type|selectOption|dblclick|setChecked)\(/;
const EXEMPT_RE = /\.page\.(reload|waitForLoadState|url|goto|waitForTimeout|evaluate|route|on|off|waitForRequest|waitForResponse|waitForFunction|context|keyboard|mouse)\b/;

function checkSpecRawPage(files) {
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

// ---------- main ----------
function main() {
  const args = parseArgs(process.argv.slice(2));

  const fixtureFiles = discoverFixtureFiles(args.staged);
  const pageFiles = discoverPageFiles(args.staged);
  const specFiles = discoverSpecFiles(args.staged);

  const totalScoped = fixtureFiles.length + pageFiles.length + specFiles.length;
  if (args.staged && totalScoped === 0) {
    console.log('SKIP: step-labels — no fixture/page-object/spec staged.');
    process.exit(0);
  }

  if (!args.staged && totalScoped === 0) {
    const clientsDir = join(REPO_ROOT, 'clients');
    if (!existsSync(clientsDir)) {
      process.stderr.write(`FAIL: step-labels — clients/ directory not found at ${clientsDir}. Cannot run non-staged scan.\n`);
    } else {
      process.stderr.write('FAIL: step-labels — non-staged scan found 0 fixture/page/spec files under clients/. Expected *.fixture.ts in src/fixtures/, *.page.ts in src/pages/, or *.spec.ts in tests/.\n');
    }
    process.exit(1);
  }

  const violations = [
    ...checkFixtureWrapping(fixtureFiles),
    ...checkLabelJargon(pageFiles),
    ...checkSpecRawPage(specFiles),
  ];

  if (violations.length === 0) {
    console.log(`PASS: step-labels — ${fixtureFiles.length} fixtures, ${pageFiles.length} page files, ${specFiles.length} spec files scanned, 0 violations.`);
    process.exit(0);
  }

  const prefix = args.enforce ? 'FAIL' : 'WARN';
  process.stderr.write(`${prefix}: step-labels — ${violations.length} violation(s):\n`);
  for (const v of violations) {
    process.stderr.write(`  - ${v}\n`);
  }
  process.exit(args.enforce ? 1 : 0);
}

main();
