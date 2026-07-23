#!/usr/bin/env node
/**
 * Dead-export gate (remediation Phase 5 gate #10).
 *
 * WHAT IT DOES: runs `ts-prune` against clients/encore/tsconfig.json and fails when an exported
 * symbol in the client source is imported by nobody (a dead export) UNLESS it is registered in
 * scripts/dead-exports-allowlist.json with a >=20-char reason.
 *
 * HONEST SCOPE (per the 2026-07-06 triage that stood this gate up):
 *   - ts-prune appends " (used in module)" to exports used only within their own file. Those are
 *     INFO, not findings — this gate ignores them (they are legitimately internal).
 *   - ts-prune CANNOT see config-string references (a Playwright reporter or globalSetup registered
 *     by path in playwright.config.ts). Those surface as false positives and live in the allowlist
 *     with category "config-referenced".
 *   - The 12 findings present when this gate landed are a BASELINE — frozen in the allowlist and
 *     categorized (config-referenced / public-api-surface / test-data-surface). Like the weak-reset
 *     gate, this gate is a freeze + drift-detector: its forward value is catching a NEW dead export,
 *     not deleting pre-existing shipped API/test-data.
 *
 * TOOL RESOLUTION: local node_modules/.bin/ts-prune if present, else `npx -y ts-prune@0.10.3`.
 * If ts-prune cannot run (offline, no network, tool error) the gate emits a loud WARN and EXITS 0 —
 * it must never wedge a commit just because the machine is offline.
 *
 * Usage:
 *   node scripts/check-dead-exports.mjs            # full-project scan (report every un-allowlisted dead export)
 *   node scripts/check-dead-exports.mjs --staged   # full scan, but only findings in STAGED clients/<c>/{src,tests}/**.ts fail
 *
 * Exit 0 = no un-allowlisted dead export (offline WARN also exits 0). Exit 1 = a dead export not in
 * the allowlist, or a malformed allowlist entry.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const TSCONFIG = 'clients/encore/tsconfig.json';
const ALLOWLIST_PATH = 'scripts/dead-exports-allowlist.json';

/**
 * Parse one ts-prune output line into { file, line, name, usedInModule }, or null if it is not a
 * finding line. ts-prune 0.10.3 emits (Windows) `\clients\encore\src\f.ts:12 - Name` and appends
 * ` (used in module)` for exports used only within their own file. Paths are normalized to forward
 * slashes with any leading separator stripped, so they match `git diff --cached --name-only` output.
 */
export function parseTsPruneLine(line) {
  const m = /^[\\/]?(.+\.ts):(\d+)\s+-\s+(.+?)(\s+\(used in module\))?$/.exec(line.trim());
  if (!m) return null;
  return {
    file: m[1].split(/[\\/]/).join('/'),
    line: Number(m[2]),
    name: m[3].trim(),
    usedInModule: Boolean(m[4]),
  };
}

const key = (f) => `${f.file}::${f.name}`;

/** Run ts-prune. Returns { ok:true, findings } (usedInModule filtered out) or { ok:false, toolError }. */
function runTsPrune() {
  const localBin = join('node_modules', '.bin', process.platform === 'win32' ? 'ts-prune.cmd' : 'ts-prune');
  const cmd = existsSync(localBin) ? `"${localBin}" -p ${TSCONFIG}` : `npx -y ts-prune@0.10.3 -p ${TSCONFIG}`;
  let raw;
  try {
    // ts-prune exits 0 even WITH findings; a non-zero exit means a genuine tool/network error.
    raw = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 180000 });
  } catch (err) {
    return { ok: false, toolError: String(err.stderr || err.message || err).slice(0, 400) };
  }
  const allParsed = raw.split('\n').map(parseTsPruneLine).filter(Boolean);
  const findings = allParsed.filter((f) => !f.usedInModule);
  return { ok: true, findings, totalParsedLines: allParsed.length, rawEmpty: !raw.trim() };
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

const isClientTsFile = (rel) => /^clients\/[^/]+\/(src|tests)\/.*\.ts$/.test(rel);

/** Load + shallow-validate the allowlist. Returns { entries, errors }. */
function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) return { entries: [], errors: [] };
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'));
  } catch (e) {
    return { entries: [], errors: [`cannot parse ${ALLOWLIST_PATH}: ${e.message}`] };
  }
  const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  const errors = [];
  for (const a of entries) {
    if (!a.file || !a.export) { errors.push(`allowlist entry missing file/export: ${JSON.stringify(a)}`); continue; }
    if (!a.reason || String(a.reason).trim().length < 20) { errors.push(`${a.file}::${a.export} — allowlist reason must be >= 20 chars`); }
  }
  return { entries, errors };
}

function main() {
  const stagedOnly = process.argv.includes('--staged');
  const staged = stagedOnly ? stagedFiles() : null;

  const { entries: allowlist, errors: allowErrors } = loadAllowlist();
  const allowSet = new Set(allowlist.map((a) => `${a.file}::${a.export}`));

  const res = runTsPrune();
  if (!res.ok) {
    console.warn(`WARN: dead-exports — ts-prune could not run (offline or tool error); gate skipped. Detail: ${res.toolError}`);
    return 0; // never wedge a commit offline
  }

  if (res.totalParsedLines === 0) {
    if (res.rawEmpty) {
      console.error(`FAIL: dead-exports — ts-prune produced no output (empty stdout). Expected analysis of ${TSCONFIG} to yield exported symbols.`);
    } else {
      console.error('FAIL: dead-exports — ts-prune produced output but zero lines matched the expected finding format. The ts-prune output format may have changed.');
    }
    return 1;
  }

  const findingKeys = new Set(res.findings.map(key));

  // Stale allowlist entries (no longer flagged by ts-prune) → WARN so the allowlist gets cleaned.
  const warnings = allowlist
    .filter((a) => !findingKeys.has(`${a.file}::${a.export}`))
    .map((a) => `stale allowlist entry (no longer dead, or file/symbol renamed): ${a.file}::${a.export}`);

  // Real dead exports = findings not covered by the allowlist.
  let dead = res.findings.filter((f) => !allowSet.has(key(f)));
  if (stagedOnly) dead = dead.filter((f) => staged.has(f.file) && isClientTsFile(f.file));

  if (warnings.length) {
    console.warn('\nWARN: dead-exports — allowlist drift:');
    for (const w of warnings) console.warn('  ? ' + w);
  }

  if (allowErrors.length || dead.length) {
    console.error('\nFAIL: dead-exports — un-allowlisted dead export(s) or a malformed allowlist entry:\n');
    for (const e of allowErrors) console.error('  - ' + e);
    for (const d of dead) {
      console.error(`  - ${d.file}:${d.line} - ${d.name}   (exported but imported by nobody; delete it, or add it to ${ALLOWLIST_PATH} with a >= 20-char reason)`);
    }
    console.error(`\n${allowErrors.length + dead.length} problem(s). Dead-code hygiene = remediation gate #10.`);
    return 1;
  }

  console.log(
    `PASS: dead-exports — ${res.findings.length} ts-prune finding(s), ${allowlist.length} allowlisted, ` +
    `${warnings.length} stale-warning(s), 0 un-allowlisted dead export(s)${stagedOnly ? ' in staged client files' : ''}.`,
  );
  return 0;
}

// ESM entry-point guard so the .test.mjs can import parseTsPruneLine without running main().
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
