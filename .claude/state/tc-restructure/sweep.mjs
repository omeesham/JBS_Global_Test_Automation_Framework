#!/usr/bin/env node
/**
 * sweep.mjs — Read-only integrity checker for test-case markdown files and spec files.
 * Nine checks. Exits 1 if any hard check (C1-C3, C5-C8) has failures. C4/C9 are warnings only.
 * Never modifies any file.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const MD_DIR    = join(REPO_ROOT, 'clients', 'encore', 'specs_planning', 'test-cases', 'setup');
const SPEC_DIR  = join(REPO_ROOT, 'clients', 'encore', 'tests');

function collectFiles(dir, suffix) {
  const out = [];
  function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(suffix)) out.push(p);
    }
  }
  walk(dir);
  return out.sort();
}

function rel(p) { return relative(REPO_ROOT, p).replace(/\\/g, '/'); }

function parseCells(line) {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  // Handle escaped pipes (\|) inside cell content before splitting
  const PIPE_ESC = '\x00';
  const safe = t.replace(/\\\|/g, PIPE_ESC);
  const parts = safe.split('|');
  const inner = parts.slice(1, safe.endsWith('|') ? parts.length - 1 : parts.length);
  return inner.map(c => c.trim().replace(/\x00/g, '|'));
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every(c => /^[-: ]+$/.test(c));
}

function isStepRow(cells) {
  return cells.length > 0 && /^\d+$/.test(cells[0]);
}

function normalizeWS(s) { return s.trim().replace(/\s+/g, ' '); }

function parseMdFile(filepath) {
  const lines = readFileSync(filepath, 'utf8').split(/\r?\n/);
  const filename = rel(filepath);

  let declaredTotal = null;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const m = lines[i].match(/\*\*Total\*\*:\s*(\d+)/);
    if (m) { declaredTotal = parseInt(m[1], 10); break; }
  }

  const cases = [];
  let current = null;
  let inSteps = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    const hm = line.match(/^##\s+(TC-[A-Z0-9-]+):/);
    if (hm) {
      if (current) cases.push(current);
      current = { id: hm[1], headingLine: lineNum, steps: [], expectedSummary: null, blocked: false };
      inSteps = false;
      continue;
    }

    if (!current) continue;

    if (/^\*\*Steps\*\*/.test(line)) { inSteps = true; continue; }

    const em = line.match(/^\*\*Expected\*\*:\s*(.+)/);
    if (em) {
      current.expectedSummary = normalizeWS(em[1]);
      inSteps = false;
      continue;
    }

    // Mark cases explicitly annotated as Skipped or Blocked — they legitimately have no spec test.
    if (/^Status:\s*(Skipped|Blocked)/i.test(line)) {
      current.blocked = true;
    }

    if (inSteps) {
      const cells = parseCells(line);
      if (cells !== null && !isSeparatorRow(cells)) {
        current.steps.push({ lineNum, cells });
      }
    }
  }
  if (current) cases.push(current);

  return { filepath, filename, declaredTotal, cases };
}

function parseSpecFile(filepath) {
  const lines = readFileSync(filepath, 'utf8').split(/\r?\n/);
  const filename = rel(filepath);
  return lines.flatMap((line, i) => {
    const m = line.match(/test(?:\.(?:skip|fixme|only))?\s*\(\s*['"`](TC-[A-Z0-9-]+(?:\/[A-Z0-9]+)?):/);
    if (!m) return [];
    const raw = m[1];
    if (!raw.includes('/')) return [{ id: raw, lineNum: i + 1, filename }];
    // Combined IDs like TC-LOC-LI-064/065 — one test covers two MD entries; emit both.
    const slashIdx = raw.indexOf('/');
    const first  = raw.slice(0, slashIdx);
    const prefix = first.replace(/-[A-Z0-9]+$/, '-');
    const second = prefix + raw.slice(slashIdx + 1);
    return [
      { id: first,  lineNum: i + 1, filename },
      { id: second, lineNum: i + 1, filename },
    ];
  });
}

// ── Collect ───────────────────────────────────────────────────────────────────
const mdFiles    = collectFiles(MD_DIR,   '_test_cases.md');
const specFiles  = collectFiles(SPEC_DIR, '.spec.ts');
const mdParsed   = mdFiles.map(parseMdFile);
const allSpecIds = specFiles.flatMap(parseSpecFile);

const stepRows = mdParsed.flatMap(f =>
  f.cases.flatMap(c =>
    c.steps
      .filter(s => isStepRow(s.cells))
      .map(s => ({ ...s, filename: f.filename, caseId: c.id, expectedSummary: c.expectedSummary }))
  )
);

// Count step rows per case (for single-step exemption in C5)
const caseStepCounts = new Map();
for (const f of mdParsed)
  for (const c of f.cases) {
    const count = c.steps.filter(s => isStepRow(s.cells)).length;
    caseStepCounts.set(`${f.filename}:${c.id}`, count);
  }

const mdIdMap = new Map();
for (const f of mdParsed)
  for (const c of f.cases) {
    if (!mdIdMap.has(c.id)) mdIdMap.set(c.id, []);
    mdIdMap.get(c.id).push(f.filename);
  }

// IDs explicitly marked Status: Skipped/Blocked in MD — legitimately have no spec test.
const blockedMdIds = new Set();
for (const f of mdParsed)
  for (const c of f.cases)
    if (c.blocked) blockedMdIds.add(c.id);

const specIdMap = new Map();
for (const s of allSpecIds) {
  if (!specIdMap.has(s.id)) specIdMap.set(s.id, []);
  specIdMap.get(s.id).push({ filename: s.filename, lineNum: s.lineNum });
}

// ── Checks ────────────────────────────────────────────────────────────────────
let hardFailure = false;
const checks = {};

function record(id, label, isHard, findings) {
  checks[id] = { label, isHard, count: findings.length, findings };
  if (isHard && findings.length > 0) hardFailure = true;
}

// C1 — step-shaped rows with cell count ≠ 3
record('C1', 'malformed rows', true,
  stepRows
    .filter(r => r.cells.length !== 3)
    .map(r => `${r.filename}:${r.lineNum} (${r.cells.length} cells)`)
);

// C2 — step rows with empty expected-result cell
record('C2', 'blank expected', true,
  stepRows
    .filter(r => r.cells.length >= 3 && r.cells[2] === '')
    .map(r => `${r.filename}:${r.lineNum}`)
);

// C3 — code/selector jargon and unambiguous ARIA role names in expected-result cells.
// Unambiguous roles (never ordinary English): spinbutton, combobox, alertdialog, tablist,
// tabpanel, radiogroup, listbox, menuitem, gridcell, treeitem.
const JARGON = /aria-[a-z]+|data-testid|getBy|locator\(|querySelector|toHaveAttribute|\.spec\.ts|nth-child|\bspinbutton\b|\bcombobox\b|\balertdialog\b|\btablist\b|\btabpanel\b|\bradiogroup\b|\blistbox\b|\bmenuitem\b|\bgridcell\b|\btreeitem\b/;
record('C3', 'jargon', true,
  stepRows
    .filter(r => r.cells.length >= 3 && JARGON.test(r.cells[2]))
    .map(r => `${r.filename}:${r.lineNum}: ${r.cells[2].slice(0, 80)}`)
);

// C10 — ambiguous ARIA role names that also appear in plain English (warning only).
// textbox, progressbar: common UI vocabulary but occasionally ordinary English.
// checkbox, switch: extremely common English words — false-positive risk too high for hard
// failure; reported as warnings so reviewers can judge context.
const JARGON_ROLE_AMBIGUOUS = /\btextbox\b|\bprogressbar\b|\bcheckbox\b|\bswitch\b/i;
record('C10', 'ambiguous role names', false,
  stepRows
    .filter(r => r.cells.length >= 3 && JARGON_ROLE_AMBIGUOUS.test(r.cells[2]))
    .map(r => `${r.filename}:${r.lineNum}: ${r.cells[2].slice(0, 80)}`)
);

// C4 — hedging language (warning only)
const HEDGE = /\b(should|probably|might|may)\b/i;
record('C4', 'hedging', false,
  stepRows
    .filter(r => r.cells.length >= 3 && HEDGE.test(r.cells[2]))
    .map(r => `${r.filename}:${r.lineNum}: ${r.cells[2].slice(0, 80)}`)
);

// C5 — step expected cell identical to case-level **Expected** summary
record('C5', 'case-summary leakage', true,
  stepRows
    .filter(r => {
      if (r.cells.length < 3 || !r.expectedSummary) return false;
      const cell = normalizeWS(r.cells[2]);
      if (cell.length === 0 || cell !== r.expectedSummary) return false;
      // Exempt single-step cases: the step's outcome IS the case outcome
      const key = `${r.filename}:${r.caseId}`;
      return (caseStepCounts.get(key) || 0) > 1;
    })
    .map(r => `${r.filename}:${r.lineNum} (${r.caseId})`)
);

// C6 — TC IDs appearing in more than one file
{
  const dupes = [];
  for (const [id, files] of mdIdMap)
    if (files.length > 1) dupes.push(`${id} in: ${files.join(', ')}`);
  for (const [id, refs] of specIdMap)
    if (refs.length > 1) dupes.push(`spec:${id} in: ${refs.map(r => r.filename).join(', ')}`);
  record('C6', 'duplicate TC IDs', true, dupes);
}

// C7 — TC IDs present in spec but not in MD, and vice versa
// Suppressions: (1) slash-ID pairs already handled in parseSpecFile; (2) blocked MD cases excluded.
{
  const mdIds = new Set(mdIdMap.keys());
  const sIds  = new Set(specIdMap.keys());
  record('C7', 'spec/md parity', true, [
    ...[...sIds].filter(id => !mdIds.has(id)).map(id => `orphaned-spec: ${id}`),
    ...[...mdIds].filter(id => !sIds.has(id) && !blockedMdIds.has(id)).map(id => `orphaned-md:   ${id}`),
  ]);
}

// C8 — **Total**: N in frontmatter must equal actual heading count; missing Total is also a failure
record('C8', 'declared totals', true,
  mdParsed.flatMap(f => {
    if (f.declaredTotal === null)
      return [`${f.filename}: missing **Total**: line (found ${f.cases.length} cases)`];
    if (f.cases.length !== f.declaredTotal)
      return [`${f.filename}: declared ${f.declaredTotal} but found ${f.cases.length}`];
    return [];
  })
);

// C9 — expected-result cells over 300 characters (warning only)
record('C9', 'over-long expected', false,
  stepRows
    .filter(r => r.cells.length >= 3 && r.cells[2].length > 300)
    .map(r => `${r.filename}:${r.lineNum} (${r.cells[2].length} chars)`)
);

// ── Print ─────────────────────────────────────────────────────────────────────
console.log(`\n=== TC SWEEP ===`);
console.log(`MD files: ${mdFiles.length}  |  spec files: ${specFiles.length}  |  step rows: ${stepRows.length}\n`);

const ORDER = ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10'];

for (const id of ORDER) {
  const c = checks[id];
  const warn = c.isHard ? '' : '  (warning)';
  console.log(`${id} ${c.label.padEnd(24)} ${String(c.count).padStart(4)}${warn}`);
}
console.log('');

for (const id of ORDER) {
  const c = checks[id];
  if (c.count === 0) continue;
  const tag = c.isHard ? 'FAIL' : 'WARN';
  console.log(`--- ${id} ${c.label.toUpperCase()} [${tag}] ---`);
  const limit = Math.min(c.findings.length, 25);
  for (let i = 0; i < limit; i++) console.log(`  ${c.findings[i]}`);
  if (c.findings.length > limit) console.log(`  ... and ${c.findings.length - limit} more`);
  console.log('');
}

console.log(`SWEEP: ${hardFailure ? 'FAIL' : 'PASS'}`);
process.exit(hardFailure ? 1 : 0);
