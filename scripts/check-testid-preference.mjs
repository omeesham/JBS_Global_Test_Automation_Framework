#!/usr/bin/env node
/**
 * testid-preference gate (remediation Phase 5 gate #9 — the testid-first golden rule, 2026-07-06).
 *
 * WHAT IT DOES: on a commit that stages a selector file (clients/<c>/src/selectors/**.ts), it lists
 * the ADDED lines that use a fragile non-`data-testid` locator (getByRole/getByText/:has-text/[role=/
 * nth-child/xpath/…) and points the author at the golden rule. It is a REMINDER, not a blocker.
 *
 * WHY WARN-ONLY (always exit 0): the golden rule is "use data-testid when present, else the next-best
 * locator + track the gap; switch back when the app adds one" (AGENT_SHARED_RULES.md §5 + LR-014).
 * Whether a non-testid selector is the CORRECT choice depends on whether the control actually exposes
 * a `data-testid` on the LIVE DOM — which LR-029 says only a live-DOM check can decide. A static file
 * gate cannot see the live DOM, so it can only surface the added fallbacks for a human to reconcile
 * against the testid-gap-report; it must never fail the commit (that would punish the legitimate
 * tracked-fallback case the golden rule explicitly allows). Sibling gates: check-dead-exports.mjs (5l),
 * check-weak-reset.mjs (5m) — same pure-fn + main() + .test.mjs shape; those two DO block, this one warns.
 *
 * Usage:
 *   node scripts/check-testid-preference.mjs            # full scan of every selector file (informational)
 *   node scripts/check-testid-preference.mjs --staged   # only ADDED lines in STAGED selector files
 *
 * Exit code is ALWAYS 0.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SELECTOR_FILE_RE = /^clients\/[^/]+\/src\/selectors\/.*\.ts$/;

// A line carries a testid anchor → it is already golden, never flagged.
const TESTID_SIGNAL = /data-testid|getByTestId|\[data-test|\btestId\b/i;

// Fragile non-testid locator families — the ones the testid-gap-report groups. Order = report order.
const FRAGILE_SIGNALS = [
  { name: 'getByRole', re: /getByRole\s*\(/ },
  { name: 'getByText', re: /getByText\s*\(/ },
  { name: 'getByLabel', re: /getByLabel\s*\(/ },
  { name: 'getByPlaceholder', re: /getByPlaceholder\s*\(/ },
  { name: 'getByTitle', re: /getByTitle\s*\(/ },
  { name: 'has-text/text-is', re: /:has-text\(|text-is\(|:text\(/ },
  { name: 'role-attr', re: /\[role=/ },
  { name: 'name-attr', re: /\[name=|input\[name/ },
  { name: 'nth-child/nth-of-type', re: /nth-child|nth-of-type/ },
  { name: 'xpath', re: /xpath=|=\s*['"`]\/\// }, // xpath= engine or a leading // locator string
];

/**
 * Classify a single source line. Returns the fragile-locator family name if the line uses a
 * non-testid locator that the golden rule wants tracked, else null (testid-anchored lines and
 * lines with no locator signal return null).
 * @param {string} text
 * @returns {string|null}
 */
export function classifyLine(text) {
  const s = String(text ?? '');
  if (TESTID_SIGNAL.test(s)) return null; // already golden
  for (const sig of FRAGILE_SIGNALS) {
    if (sig.re.test(s)) return sig.name;
  }
  return null;
}

/**
 * Parse `git diff --cached --unified=0` output into the ADDED lines, with their new-file line number.
 * Only added ('+') lines are returned (deletions do not advance the new-file counter). The '+++ b/…'
 * header and the '@@ … +start[,len] @@' hunk headers drive file + line tracking.
 * @param {string} diffText
 * @returns {Array<{file: string, line: number, text: string}>}
 */
export function parseAddedSelectorLines(diffText) {
  const out = [];
  let file = null;
  let newLine = 0;
  for (const raw of String(diffText ?? '').split(/\r?\n/)) {
    if (raw.startsWith('+++ ')) {
      const m = /^\+\+\+ b\/(.+)$/.exec(raw);
      file = m ? m[1] : null;
      continue;
    }
    if (raw.startsWith('@@')) {
      const m = /\+(\d+)(?:,\d+)?/.exec(raw);
      newLine = m ? Number(m[1]) : 0;
      continue;
    }
    if (raw.startsWith('+++')) continue;
    if (raw.startsWith('+')) {
      out.push({ file, line: newLine, text: raw.slice(1) });
      newLine++;
      continue;
    }
    if (raw.startsWith('-')) continue; // deletion — no new-line advance
    if (raw.startsWith(' ')) { newLine++; continue; } // context (absent at unified=0, handled anyway)
  }
  return out;
}

function stagedSelectorFiles() {
  try {
    return execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
      .split('\n').map((s) => s.trim()).filter((s) => SELECTOR_FILE_RE.test(s));
  } catch {
    return [];
  }
}

/** Recursively collect every clients/<c>/src/selectors/**.ts path (forward-slashed, repo-relative). */
function allSelectorFiles() {
  const roots = [];
  const clientsDir = 'clients';
  if (!existsSync(clientsDir)) return roots;
  for (const client of readdirSync(clientsDir)) {
    const selDir = join(clientsDir, client, 'src', 'selectors');
    if (existsSync(selDir)) walk(selDir, roots);
  }
  return roots;
}
function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.ts')) acc.push(p.split(/[\\/]/).join('/'));
  }
}

function runStaged() {
  const files = stagedSelectorFiles();
  if (files.length === 0) {
    console.log('PASS(warn-only): testid-preference — no selector file staged.');
    return 0;
  }
  let diff = '';
  try {
    diff = execSync(`git diff --cached --unified=0 -- ${files.map((f) => `"${f}"`).join(' ')}`, { encoding: 'utf8' });
  } catch {
    console.warn('WARN: testid-preference — could not read staged diff; gate skipped.');
    return 0;
  }
  const flagged = parseAddedSelectorLines(diff)
    .map((a) => ({ ...a, family: classifyLine(a.text) }))
    .filter((a) => a.family);

  if (flagged.length === 0) {
    console.log(`PASS(warn-only): testid-preference — ${files.length} selector file(s) staged, no new non-testid selector added.`);
    return 0;
  }
  console.warn(`\nWARN(warn-only, exit 0): testid-preference — ${flagged.length} new non-\`data-testid\` selector line(s) staged:`);
  for (const f of flagged) console.warn(`  ~ ${f.file}:${f.line}  [${f.family}]  ${f.text.trim().slice(0, 100)}`);
  printGoldenRulePointer();
  return 0;
}

function runFullScan() {
  const files = allSelectorFiles();
  let total = 0;
  const perFile = [];
  for (const f of files) {
    let n = 0;
    for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) if (classifyLine(line)) n++;
    if (n) perFile.push({ file: f, n });
    total += n;
  }
  console.log(`testid-preference (full scan): ${total} non-\`data-testid\` selector line(s) across ${perFile.length} file(s):`);
  for (const p of perFile.sort((a, b) => b.n - a.n)) console.log(`  ${p.n.toString().padStart(4)}  ${p.file}`);
  if (total) printGoldenRulePointer();
  return 0;
}

function printGoldenRulePointer() {
  console.warn(
    '\n  Golden rule (AGENT_SHARED_RULES.md §5 + LR-014): use `data-testid` when present. If a testid is\n' +
    '  LR-029-confirmed absent on the LIVE DOM, the next-best locator above is CORRECT — just record the\n' +
    '  gap in the dated testid-gap-report so it rolls up to one client ask and gets switched back when the\n' +
    '  app adds the testid. This is a reminder, not a blocker (a static gate cannot see the live DOM).',
  );
}

function main() {
  return process.argv.includes('--staged') ? runStaged() : runFullScan();
}

// ESM entry-point guard so the .test.mjs can import the pure fns without running main().
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
