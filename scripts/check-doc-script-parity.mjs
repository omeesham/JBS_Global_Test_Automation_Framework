#!/usr/bin/env node
/**
 * check-doc-script-parity.mjs — every `npm run <script>` named in a README must exist in that
 * package's package.json.
 *
 * A README that documents `npm run test:chrome` when package.json has no `test:chrome` script is a
 * doc lie: a collaborator copies the command and it fails. This gate cross-checks each README's
 * `npm run <name>` / `npm run <name> -- …` references against the scripts map of the package.json in
 * the SAME directory as the README (client README → client package.json; root README → root
 * package.json).
 *
 * Only `npm run <name>` forms are checked (built-in `npm test` / `npm ci` / `npm install` are always
 * valid and skipped). Placeholder names containing `<`, `{`, or `$` (e.g. `npm run <script>`) are
 * treated as illustrative and skipped.
 *
 * WARN-ONLY by default (exit 0). `--enforce` makes any finding exit 1 (the pre-commit/CI gate mode).
 * Convention sibling: scripts/check-spec-sleeps.mjs (same pure-function + main() + .test.mjs shape).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

// `npm run <name>` — capture the script name. Allows the `npm run name -- --flag` form.
const NPM_RUN_RE = /\bnpm\s+run\s+(--silent\s+|-s\s+)?([A-Za-z0-9:_-]+)/g;

/**
 * Return the set of `npm run` script names referenced in README text, minus placeholders.
 * @param {string} text — README source
 * @returns {Array<{name: string, line: number}>}
 */
export function extractNpmRunRefs(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const refs = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    NPM_RUN_RE.lastIndex = 0;
    while ((m = NPM_RUN_RE.exec(line)) !== null) {
      const name = m[2];
      if (/[<>{}$]/.test(name)) continue; // illustrative placeholder
      refs.push({ name, line: i + 1 });
    }
  }
  return refs;
}

/**
 * Compare a README's npm-run refs against a package.json scripts map.
 * @param {string} readmeText
 * @param {Record<string, string>} scripts — package.json "scripts" object
 * @returns {Array<{name: string, line: number}>} refs with no matching script
 */
export function findMissingScripts(readmeText, scripts) {
  const have = new Set(Object.keys(scripts || {}));
  const missing = [];
  for (const ref of extractNpmRunRefs(readmeText)) {
    if (!have.has(ref.name)) missing.push(ref);
  }
  return missing;
}

// ---------- file discovery ----------
// Each README is paired with the package.json in its own directory.
export function findReadmePairs(repoRoot) {
  const pairs = [];
  const consider = (dir) => {
    const readme = path.join(dir, 'README.md');
    const pkg = path.join(dir, 'package.json');
    if (fs.existsSync(readme) && fs.existsSync(pkg)) pairs.push({ readme, pkg });
  };
  consider(repoRoot); // root
  const clientsDir = path.join(repoRoot, 'clients');
  if (fs.existsSync(clientsDir)) {
    for (const client of fs.readdirSync(clientsDir)) {
      consider(path.join(clientsDir, client));
    }
  }
  return pairs;
}

export function buildReport({ repoRoot, pairs }) {
  const fileReports = [];
  let total = 0;
  for (const { readme, pkg } of pairs) {
    const rel = path.relative(repoRoot, readme).replace(/\\/g, '/');
    let scripts = {};
    try { scripts = JSON.parse(fs.readFileSync(pkg, 'utf8')).scripts || {}; } catch { scripts = {}; }
    const missing = findMissingScripts(fs.readFileSync(readme, 'utf8'), scripts);
    if (missing.length) fileReports.push({ file: rel, pkg: path.relative(repoRoot, pkg).replace(/\\/g, '/'), missing });
    total += missing.length;
  }
  return { total, files: fileReports };
}

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = { repoRoot: DEFAULT_REPO_ROOT, enforce: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--test-root') { out.repoRoot = path.resolve(argv[++i]); continue; }
    if (a === '--enforce') { out.enforce = true; continue; }
    if (a === '--staged') { continue; }
    if (a === '--help' || a === '-h') {
      console.log('Usage: check-doc-script-parity.mjs [--enforce] [--test-root <dir>]');
      process.exit(0);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport({ repoRoot: args.repoRoot, pairs: findReadmePairs(args.repoRoot) });

  console.error('[check-doc-script-parity] summary');
  console.error(`  README npm-run refs with no matching package.json script: ${report.total}`);
  for (const f of report.files) {
    for (const v of f.missing) {
      console.error(`  ${f.file}:${v.line}  "npm run ${v.name}" — not in ${f.pkg}`);
    }
  }
  if (report.total === 0) console.error('  none — every documented npm-run command exists in its package.json.');

  process.exit(args.enforce && report.total > 0 ? 1 : 0);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
