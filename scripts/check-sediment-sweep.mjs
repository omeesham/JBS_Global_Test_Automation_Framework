#!/usr/bin/env node
/**
 * scripts/check-sediment-sweep.mjs
 * Sev: S1 | Phase 3 of SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL
 *
 * Sediment detector — finds CONVICTED fixes with no removal/rewire evidence.
 *
 * Population is derived by scanning plans/**\/*.md for §3.5 CONVICTED verdict
 * rows. No registration step — any CONVICTED row in any plan is in scope.
 *
 * Three checks:
 *   1. Plan scan: CONVICTED row with no removal/rewire evidence → FAIL
 *   2. Diff-parity: removal diff in a plan with no parity table → FAIL
 *   3. Citation verify: file:line cited in a report that does not resolve → FAIL
 *
 * Fail-closed: unreadable plan file or empty plans dir → FAIL naming the path.
 *
 * CLI:
 *   node scripts/check-sediment-sweep.mjs --self-test
 *   node scripts/check-sediment-sweep.mjs --sweep [--plans-dir <dir>] [--report <path>]
 *   node scripts/check-sediment-sweep.mjs --scan-plans [--plans-dir <dir>] [--report <path>]
 *   node scripts/check-sediment-sweep.mjs --check-diff <plan-file>
 *   node scripts/check-sediment-sweep.mjs --verify-citations <report-file>
 *   node scripts/check-sediment-sweep.mjs --file <registry.jsonl> [--report <path>]  (legacy)
 */

import { readFileSync, appendFileSync, mkdirSync, writeFileSync,
         unlinkSync, rmdirSync, readdirSync, statSync } from 'fs';
import { resolve, join, dirname, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const STATE_DIR = join(ROOT, '.claude', 'state');
const GATE_FIRES_LOG = join(STATE_DIR, 'gate-fires.log');
const DEFAULT_REGISTRY = join(STATE_DIR, 'sediment-registry.jsonl');
const GATE_NAME = 'check-sediment-sweep';

// ── Helpers ─────────────────────────────────────────────────────────────────

function safeRead(p) {
  try { return readFileSync(p, 'utf-8'); } catch { return null; }
}

function norm(p) { return String(p).replace(/\\/g, '/'); }

function fireTelemetry(verdict, target) {
  mkdirSync(dirname(GATE_FIRES_LOG), { recursive: true });
  appendFileSync(GATE_FIRES_LOG,
    `${GATE_NAME}, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
}

// §3.5 reason enum — FROZEN (5 values, no additions)
const VALID_REASONS = new Set([
  'scoped-wrong', 'prose-not-mechanism', 'rubber-stampable',
  'dead/never-fired', 'different-sub-class',
]);
const VALID_VERDICTS = new Set(['CONVICTED', 'SURVIVES']);

// ── File discovery ───────────────────────────────────────────────────────────

function findMarkdownFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return []; }
  for (const e of entries) {
    const full = join(dir, e);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) results.push(...findMarkdownFiles(full));
    else if (st.isFile() && extname(e) === '.md') results.push(full);
  }
  return results;
}

// ── Plan scanning — Defect 1 fix (population from plans, not registry) ────────

// Inline disposition: verdict cell has "CONVICTED... — <non-empty text>"
const INLINE_DISPOSITION_RE = /CONVICTED[^|]*[—\u2013-]\s+\S/;
// file.ext:NNN inside backticks in a table row
const FILE_LINE_RE = /`([a-zA-Z0-9_./-]+\.[a-zA-Z]{1,5}):(\d+)(?:-\d+)?`/;

/** Returns all table rows containing CONVICTED in a plan file. */
export function findConvictedRows(content) {
  const rows = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) continue;
    if (!/\bCONVICTED\b/.test(line)) continue;
    if (/^\|[\s|:-]+\|/.test(line)) continue; // separator row
    const hasInline = INLINE_DISPOSITION_RE.test(line);
    const flMatch = FILE_LINE_RE.exec(line);
    rows.push({
      lineNum: i + 1,
      row: line.trim(),
      hasInlineDisposition: hasInline,
      fileRef: flMatch ? flMatch[1] : null,
      lineRef: flMatch ? parseInt(flMatch[2], 10) : null,
    });
  }
  return rows;
}

function rowIdentifier(row) {
  const cells = row.row.split('|').map(c => c.trim()).filter(Boolean);
  return cells[0] || null;
}

/** Row-bound removal evidence: inline disposition or a rewire/retire section naming the row id or cited file:line. */
export function rowRemovalEvidence(row, content) {
  if (row.hasInlineDisposition) return { pass: true, uncheckable: false, signal: 'inline-disposition' };
  const refs = [];
  if (row.fileRef && row.lineRef) refs.push(`${row.fileRef}:${row.lineRef}`);
  const id = rowIdentifier(row);
  if (id) refs.push(`row ${id}`, `#${id}`, `| ${id} |`);
  const sectionRe = /(?:^|\n)(?:#{1,6}\s*)?.*(?:Rewire|Retire|Removal|rewired|retired).*(?:\n(?!#{1,6}\s).*)*/gi;
  const sections = content.match(sectionRe) || [];
  for (const section of sections) {
    if (refs.some(ref => section.includes(ref)))
      return { pass: true, uncheckable: false, signal: row.fileRef ? 'row-bound-file-line' : 'row-bound-id' };
  }
  if (/\b(Rewire|Retire|rewired|retired)\b/.test(content))
    return { pass: false, uncheckable: true, signal: 'unlinked-plan-level-evidence' };
  return { pass: false, uncheckable: false, signal: 'none' };
}

/**
 * Scan plans/**\/*.md for CONVICTED rows and check each for removal evidence.
 * Population is derived entirely from plan files — no registration step.
 * Fail-closed: unreadable plan → FAIL naming path; empty dir → FAIL.
 */
export function scanPlans(plansDir, rootDir) {
  plansDir = plansDir || join(ROOT, 'plans');
  rootDir = rootDir || ROOT;
  const planFiles = findMarkdownFiles(plansDir);
  if (!planFiles.length)
    return { pass: false, error: `No plan files found in ${norm(plansDir)} — fail-closed`, results: [], totalConvicted: 0, failCount: 0 };

  const results = [];
  for (const planPath of planFiles) {
    const content = safeRead(planPath);
    if (content === null) {
      results.push({ planPath, pass: false, lineNum: 0, row: '', evidenceSignal: 'unreadable',
        hasInlineDisposition: false, fileRef: null, lineRef: null,
        error: `Cannot read plan: ${norm(planPath)} — fail-closed` });
      continue;
    }
    const convicted = findConvictedRows(content);
    if (!convicted.length) continue;
    for (const row of convicted) {
      const evidence = rowRemovalEvidence(row, content);
      results.push({
        planPath,
        lineNum: row.lineNum,
        row: row.row,
        pass: evidence.pass,
        uncheckable: evidence.uncheckable,
        hasInlineDisposition: row.hasInlineDisposition,
        evidenceSignal: evidence.signal,
        fileRef: row.fileRef,
        lineRef: row.lineRef,
      });
    }
  }
  const failCount = results.filter(r => !r.pass && !r.uncheckable).length;
  const uncheckableCount = results.filter(r => r.uncheckable).length;
  return { pass: failCount === 0 && uncheckableCount === 0, results, totalConvicted: results.length, failCount, uncheckableCount };
}

// ── Diff-parity check — Defect 2 ─────────────────────────────────────────────

/**
 * For each ```diff block in content that has removal lines (- prefix),
 * verify the document also contains a parity table (headers with "protective"
 * or "surviving"). Removal diff without parity table → FAIL.
 */
export function checkDiffParity(content, sourcePath) {
  const violations = [];
  const diffBlockRe = /^```diff\b([\s\S]*?)^```/gm;
  let match;
  while ((match = diffBlockRe.exec(content)) !== null) {
    const block = match[1];
    const hasRemovals = block.split('\n').some(l => /^-[^-]/.test(l));
    if (!hasRemovals) continue;
    const hasParityTable = /^\|[^|]*(?:protective|surviving|parity)[^|]*\|/im.test(content);
    if (!hasParityTable) {
      violations.push({
        source: norm(sourcePath || 'input'),
        message: 'Removal diff found but no parity table (needs protective-function → surviving-mechanism mapping)',
      });
    }
  }
  return { pass: violations.length === 0, violations };
}

// ── Citation verification — Defect 3 ─────────────────────────────────────────

/** Pattern: `file.ext:NNN` references in text. */
const FILE_CITE_RE = /`([a-zA-Z0-9_./-]+\.[a-zA-Z]{1,5}):(\d+)`/g;

function expectedSnippetForCitation(text, matchStart, matchEnd, filePath, lineNum) {
  const lineStart = text.lastIndexOf('\n', matchStart) + 1;
  const lineEndRaw = text.indexOf('\n', matchEnd);
  const lineEnd = lineEndRaw === -1 ? text.length : lineEndRaw;
  const sourceLine = text.slice(lineStart, lineEnd);
  const after = sourceLine.slice(matchEnd - lineStart);
  const quoted = /(?:\s*(?:must contain|contains|expect(?:ed)?|text|token|snippet)\s*[:=]\s*)["“]([^"”]+)["”"]/i.exec(after);
  if (quoted) return quoted[1].trim();
  const cells = sourceLine.split('|').map(c => c.trim()).filter(Boolean);
  const idx = cells.findIndex(c => c.includes(`${filePath}:${lineNum}`));
  if (idx !== -1 && cells[idx + 1] && !/^(CONVICTED|SURVIVES|RETIRE|REWIRE)$/i.test(cells[idx + 1]))
    return cells[idx + 1].replace(/[*`]/g, '').trim();
  return null;
}

function lineRefCitations(text) {
  const citations = [];
  const lines = text.split('\n');
  for (const rowText of lines) {
    const fileMatch = /([a-zA-Z0-9_./-]+\.[a-zA-Z]{1,5}):(\d+)/.exec(rowText);
    if (!fileMatch) continue;
    const filePath = fileMatch[1];
    for (const m of rowText.matchAll(/([^|+;]+?)\s*\(line\s+(\d+)\)/gi)) {
      const expected = m[1].replace(/[`*]/g, '').trim().replace(/^.*(?:→|:)\s*/, '').trim();
      if (expected) citations.push({ filePath, lineNum: parseInt(m[2], 10), expected, raw: `${filePath}:${m[2]}` });
    }
  }
  return citations;
}

/**
 * For every citation, verify the file exists, the line is in range, and the cited
 * line/window contains machine-checkable expected text.
 */
export function verifyCitations(text, rootDir) {
  rootDir = rootDir || ROOT;
  const violations = [];
  const seen = new Set();
  const check = (filePath, lineNum, expected, raw) => {
    const citation = raw || `${filePath}:${lineNum}`;
    const absPath = resolve(rootDir, filePath);
    const content = safeRead(absPath);
    if (content === null) {
      violations.push({ citation, error: `File not found: ${filePath} — fail-closed` });
      return;
    }
    const lines = content.split('\n');
    if (lineNum < 1 || lineNum > lines.length) {
      violations.push({ citation, error: `Line ${lineNum} does not exist (file has ${lines.length} lines) — fail-closed` });
      return;
    }
    if (!expected) {
      violations.push({ citation, error: 'Missing expected text/token for citation — fail-closed' });
      return;
    }
    const start = Math.max(0, lineNum - 2);
    const end = Math.min(lines.length, lineNum + 1);
    const actual = lines.slice(start, end).join('\n');
    if (!actual.includes(expected))
      violations.push({ citation, error: `Expected text not found: expected="${expected}" actual="${lines[lineNum - 1]}"` });
  };
  let m;
  FILE_CITE_RE.lastIndex = 0;
  while ((m = FILE_CITE_RE.exec(text)) !== null) {
    const filePath = m[1];
    const lineNum = parseInt(m[2], 10);
    const key = `${filePath}:${lineNum}`;
    seen.add(key);
    check(filePath, lineNum, expectedSnippetForCitation(text, m.index, FILE_CITE_RE.lastIndex, filePath, lineNum), key);
  }
  for (const c of lineRefCitations(text)) {
    const key = `${c.filePath}:${c.lineNum}`;
    if (!seen.has(key)) check(c.filePath, c.lineNum, c.expected, c.raw);
  }
  return { pass: violations.length === 0, violations };
}

// ── Legacy registry parsing (kept for --file mode) ───────────────────────────

export function parseRegistry(registryPath) {
  const raw = safeRead(registryPath);
  if (raw === null)
    return { ok: false, error: `Cannot read registry: ${norm(registryPath)} — fail-closed (gate cannot validate what it cannot read)` };
  const trimmed = raw.trim();
  if (!trimmed)
    return { ok: false, error: `Registry is empty: ${norm(registryPath)} — fail-closed (gate cannot validate what it cannot read)` };

  const entries = [];
  const errors = [];
  const lines = trimmed.split('\n').filter(l => l.trim());
  for (let i = 0; i < lines.length; i++) {
    try {
      const e = JSON.parse(lines[i]);
      const bad = [];
      if (!e.file) bad.push('file');
      if (!e.signature) bad.push('signature');
      if (!e.verdict || !VALID_VERDICTS.has(e.verdict)) bad.push(`verdict(${e.verdict})`);
      if (e.verdict === 'CONVICTED' && (!e.reason || !VALID_REASONS.has(e.reason)))
        bad.push(`reason(${e.reason})`);
      if (bad.length) errors.push(`Line ${i + 1}: ${bad.join(', ')}`);
      else entries.push({ ...e, _line: i + 1 });
    } catch { errors.push(`Line ${i + 1}: invalid JSON`); }
  }
  return { ok: true, entries, errors };
}

export function checkEntry(entry, rootDir) {
  rootDir = rootDir || ROOT;
  const targetPath = resolve(rootDir, entry.file);
  const content = safeRead(targetPath);
  if (content === null)
    return { pass: false, sediment: false,
      reason: `Cannot read target: ${norm(entry.file)} — fail-closed (gate cannot validate what it cannot read)` };

  const found = content.includes(entry.signature);
  let foundLine = null;
  if (found) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(entry.signature)) { foundLine = i + 1; break; }
    }
  }

  if (entry.verdict === 'CONVICTED') {
    return found
      ? { pass: false, sediment: true, foundLine,
          reason: `SEDIMENT: CONVICTED fix still present at ${norm(entry.file)}:${foundLine} — signature matched` }
      : { pass: true, sediment: false,
          reason: `CONVICTED fix removed — signature no longer in ${norm(entry.file)}` };
  }
  return found
    ? { pass: true, sediment: false, foundLine,
        reason: `SURVIVES fix present at ${norm(entry.file)}:${foundLine} — as expected` }
    : { pass: false, sediment: false,
        reason: `SURVIVES fix missing from ${norm(entry.file)} — expected signature absent` };
}

// ── Sweep ───────────────────────────────────────────────────────────────────

export function sweep(registryPath, rootDir) {
  registryPath = registryPath || DEFAULT_REGISTRY;
  rootDir = rootDir || ROOT;
  const parsed = parseRegistry(registryPath);
  if (!parsed.ok) return { pass: false, results: [], error: parsed.error };
  if (parsed.errors.length)
    return { pass: false, results: [], error: `Registry format errors: ${parsed.errors.join('; ')}` };
  if (!parsed.entries.length)
    return { pass: false, results: [],
      error: `No valid entries in ${norm(registryPath)} — fail-closed (gate cannot validate what it cannot read)` };

  const results = [];
  for (const entry of parsed.entries) results.push({ entry, ...checkEntry(entry, rootDir) });
  return {
    pass: results.every(r => r.pass),
    results,
    sedimentCount: results.filter(r => r.sediment).length,
  };
}

// ── Report generation ───────────────────────────────────────────────────────

function generateReport(result, registryPath) {
  const rows = result.results.filter(r => r.sediment).map((r, i) => {
    const pf = Array.isArray(r.entry.protective_functions)
      ? r.entry.protective_functions.join('; ') : (r.entry.protective_functions || '(none)');
    const sm = r.entry.surviving_mechanisms
      ? Object.entries(r.entry.surviving_mechanisms).map(([k, v]) => `${k} → ${v}`).join('; ')
      : '(unmapped)';
    return `| ${i + 1} | ${norm(r.entry.file)}:${r.foundLine || r.entry.line || '?'} | ${r.entry.what_it_claims || ''} | ${r.entry.verdict} | ${r.entry.reason} | ${pf} | ${sm} | ${r.entry.recommendation || 'RETIRE'} |`;
  });
  return [
    '# Sediment Sweep — Candidates for Removal',
    '',
    `Sweep date: ${new Date().toISOString().slice(0, 10)}`,
    `Registry: ${norm(relative(ROOT, registryPath))}`,
    `Total entries: ${result.results.length} | Sediment found: ${result.sedimentCount}`,
    '',
    '| # | file:line | what it claims | §3.5 verdict | enum reason | protective functions | surviving mechanism for each | recommendation |',
    '|---|---|---|---|---|---|---|---|',
    ...rows, '',
    rows.length
      ? `${rows.length} candidate(s) identified. **No deletions performed** — this is a proposal for Rutvik.`
      : 'No sediment candidates found beyond those listed above.',
  ].join('\n') + '\n';
}

// ── Report generation ───────────────────────────────────────────────────────

function generateScanReport(result, plansDir) {
  const failing = result.results.filter(r => !r.pass);
  const rows = failing.map((r, i) => {
    const plan = norm(relative(ROOT, r.planPath));
    const ref = r.fileRef ? `${r.fileRef}:${r.lineRef || '?'}` : '(no file:line cited)';
    return `| ${i + 1} | ${plan}:${r.lineNum} | ${ref} | ${r.evidenceSignal} | RETIRE or REWIRE |`;
  });
  return [
    '# Sediment Sweep — Candidates for Removal',
    '',
    `Sweep date: ${new Date().toISOString().slice(0, 10)}`,
    `Plans scanned: ${norm(relative(ROOT, plansDir))}/**/*.md`,
    `Total CONVICTED rows: ${result.totalConvicted} | No-evidence (flagged): ${result.failCount}`,
    '',
    '| # | plan:line | file:line cited | evidence-signal | recommendation |',
    '|---|---|---|---|---|',
    ...rows, '',
    rows.length
      ? `${rows.length} CONVICTED row(s) lack removal/rewire evidence — proposals for Rutvik. **No deletions performed.**`
      : 'No sediment candidates found — all CONVICTED rows have removal/rewire evidence.',
  ].join('\n') + '\n';
}

// ── Self-test ───────────────────────────────────────────────────────────────

function selfTest() {
  let fails = 0;
  let total = 0;
  const assert = (ok, label) => {
    total++;
    if (!ok) { fails++; console.error(`  FAIL: ${label}`); }
    else console.log(`  PASS: ${label}`);
  };

  const tag = '_sediment-st-' + Date.now();
  const tmpDir = join(STATE_DIR, tag);
  mkdirSync(tmpDir, { recursive: true });
  const tmpFiles = [];

  // ── Block A: Plan-scanning (Defect 1 — population from plans, not registry) ──
  console.log('\n=== A1: CONVICTED row with inline disposition → PASS ===');
  const planA1 = join(tmpDir, 'plan-a1.md');
  writeFileSync(planA1, '| 1 | `scripts/old.mjs:10` | dead | **CONVICTED** — rewired in Phase 2 |\n');
  tmpFiles.push(planA1);
  {
    const rows = findConvictedRows(safeRead(planA1));
    assert(rows.length === 1, 'A1: found 1 CONVICTED row');
    assert(rows[0].hasInlineDisposition, 'A1: inline disposition detected');
    assert(rowRemovalEvidence(rows[0], safeRead(planA1)).pass, 'A1: has evidence → PASS');
  }

  console.log('\n=== A2: CONVICTED row without any evidence → FAIL ===');
  const planA2 = join(tmpDir, 'plan-a2.md');
  writeFileSync(planA2, '# Test Plan Without Evidence\n\n| 1 | `scripts/dead.mjs:42` | dead/never-fired | **CONVICTED** |\n');
  tmpFiles.push(planA2);
  {
    const content = safeRead(planA2);
    const rows = findConvictedRows(content);
    assert(rows.length === 1, 'A2: found 1 CONVICTED row');
    assert(!rows[0].hasInlineDisposition, 'A2: no inline disposition');
    assert(!rowRemovalEvidence(rows[0], content).pass, 'A2: no row-bound evidence → FAIL');
  }

  console.log('\n=== A3: CONVICTED row + row-bound Rewire section → PASS ===');
  const planA3 = join(tmpDir, 'plan-a3.md');
  writeFileSync(planA3, '| 1 | `scripts/old.mjs:10` | dead | **CONVICTED** |\n\n**Rewire dispositions:** scripts/old.mjs:10 wires the new check.\n');
  tmpFiles.push(planA3);
  {
    const content = safeRead(planA3);
    const rows = findConvictedRows(content);
    const ev = rowRemovalEvidence(rows[0], content);
    assert(ev.pass && ev.signal === 'row-bound-file-line', 'A3: row-bound Rewire evidence → PASS');
  }

  console.log('\n=== A4: scanPlans fixture dir → correct PASS/FAIL counts ===');
  const fixtureDir = join(tmpDir, 'plans');
  mkdirSync(fixtureDir, { recursive: true });
  const fpPass = join(fixtureDir, 'plan-pass.md');
  writeFileSync(fpPass, '| 1 | old gate | dead | **CONVICTED** — rewired in Ph1 |\n');
  const fpFail = join(fixtureDir, 'plan-fail.md');
  writeFileSync(fpFail, '# No evidence\n\n| 1 | dead gate | dead | **CONVICTED** |\n');
  tmpFiles.push(fpPass); tmpFiles.push(fpFail);
  {
    const result = scanPlans(fixtureDir, tmpDir);
    assert(result.totalConvicted === 2, 'A4: found 2 CONVICTED rows');
    assert(result.failCount === 1, 'A4: 1 row fails (no evidence)');
    assert(!result.pass, 'A4: overall FAIL when any row lacks evidence');
  }

  // ── Block B: Diff-parity (Defect 2) ────────────────────────────────────────
  console.log('\n=== B1: Removal diff + parity table → PASS ===');
  const planB1 = join(tmpDir, 'plan-b1.md');
  writeFileSync(planB1, [
    '```diff',
    '--- a/scripts/old.mjs',
    '+++ b/scripts/old.mjs',
    '-function deadGate() { return false; }',
    '```',
    '',
    '| protective function | surviving mechanism |',
    '|---|---|',
    '| Rejects empty | `scripts/new-check.mjs:10` |',
  ].join('\n') + '\n');
  tmpFiles.push(planB1);
  {
    const r = checkDiffParity(safeRead(planB1), planB1);
    assert(r.pass, 'B1: diff + parity table → PASS');
    assert(r.violations.length === 0, 'B1: no violations');
  }

  console.log('\n=== B2: Removal diff WITHOUT parity table → FAIL ===');
  const planB2 = join(tmpDir, 'plan-b2.md');
  writeFileSync(planB2, [
    '```diff',
    '--- a/scripts/old.mjs',
    '+++ b/scripts/old.mjs',
    '-function deadGate() { return false; }',
    '```',
    '',
    'Some prose but no parity table.',
  ].join('\n') + '\n');
  tmpFiles.push(planB2);
  {
    const r = checkDiffParity(safeRead(planB2), planB2);
    assert(!r.pass, 'B2: removal diff without parity → FAIL');
    assert(r.violations.length >= 1, 'B2: at least 1 violation');
  }

  console.log('\n=== B3: Addition-only diff → PASS (no parity required) ===');
  const planB3 = join(tmpDir, 'plan-b3.md');
  writeFileSync(planB3, [
    '```diff',
    '--- a/scripts/new.mjs',
    '+++ b/scripts/new.mjs',
    '+function newGate() { return true; }',
    '```',
  ].join('\n') + '\n');
  tmpFiles.push(planB3);
  {
    const r = checkDiffParity(safeRead(planB3), planB3);
    assert(r.pass, 'B3: addition-only diff → PASS');
  }

  // ── Block C: Citation verification (Defect 3) ───────────────────────────────
  console.log('\n=== C1: Valid file:line citation → PASS ===');
  const citedFile = join(tmpDir, 'cited.mjs');
  writeFileSync(citedFile, 'line1\nline2\nline3\n');
  tmpFiles.push(citedFile);
  {
    const relPath = norm(relative(tmpDir, citedFile));
    const r = verifyCitations(`| surviving | \`${relPath}:2\` | expected: "line2" |`, tmpDir);
    assert(r.pass, 'C1: valid citation → PASS');
    assert(r.violations.length === 0, 'C1: no violations');
  }

  console.log('\n=== C2: Nonexistent file → FAIL ===');
  {
    const r = verifyCitations('| surviving | `scripts/nonexistent-ghost-xyz.mjs:1` |', tmpDir);
    assert(!r.pass, 'C2: nonexistent file → FAIL');
    assert(/fail-closed/i.test(r.violations[0]?.error || ''), 'C2: fail-closed message');
  }

  console.log('\n=== C3: Out-of-range line → FAIL ===');
  {
    const relPath = norm(relative(tmpDir, citedFile));
    const r = verifyCitations(`| surviving | \`${relPath}:999\` | expected: "line999" |`, tmpDir);
    assert(!r.pass, 'C3: out-of-range line → FAIL');
    assert(/fail-closed/i.test(r.violations[0]?.error || ''), 'C3: fail-closed message');
  }

  console.log('\n=== C4: In-range wrong content → FAIL ===');
  {
    const relPath = norm(relative(tmpDir, citedFile));
    const r = verifyCitations(`| surviving | \`${relPath}:2\` | expected: "not-line2" |`, tmpDir);
    assert(!r.pass, 'C4: in-range wrong content → FAIL');
    assert(/Expected text not found/.test(r.violations[0]?.error || ''), 'C4: expected vs actual message');
  }

  // ── Block D: Fail-closed ─────────────────────────────────────────────────────
  console.log('\n=== D1: Missing plans dir → FAIL (fail-closed) ===');
  {
    const r = scanPlans(join(tmpDir, 'no-such-plans'), tmpDir);
    assert(!r.pass, 'D1: missing dir → FAIL');
    assert(/fail-closed/i.test(r.error || ''), 'D1: fail-closed message');
  }

  // Cleanup
  for (const f of tmpFiles) { try { unlinkSync(f); } catch {} }
  try {
    [fpPass, fpFail].forEach(f => { try { unlinkSync(f); } catch {} });
    try { rmdirSync(fixtureDir); } catch {}
  } catch {}
  try { rmdirSync(tmpDir); } catch {}

  fireTelemetry(fails === 0 ? 'pass' : 'deny', 'self-test');
  console.log(`\n=== Results: ${total - fails}/${total} passed ===`);
  if (fails) { console.error(`VERDICT: FAIL (${fails} failures)`); process.exit(1); }
  console.log('VERDICT: PASS');
  process.exit(0);
}

// ── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--self-test')) {
  selfTest();
} else if (args.includes('--sweep') || args.includes('--scan-plans')) {
  // Primary mode: scan plans/**/*.md for CONVICTED rows
  const pdIdx = args.indexOf('--plans-dir');
  const plansDir = pdIdx !== -1 ? resolve(args[pdIdx + 1]) : join(ROOT, 'plans');
  const ri = args.indexOf('--report');
  const reportPath = ri !== -1 ? resolve(args[ri + 1]) : null;

  const result = scanPlans(plansDir, ROOT);
  if (result.error) {
    console.error(`VERDICT: FAIL\n  ${result.error}`);
    fireTelemetry('deny', norm(relative(ROOT, plansDir)));
    process.exit(1);
  }

  for (const r of result.results) {
    const icon = r.pass ? '✓' : (r.uncheckable ? '?' : '✗');
    const plan = norm(relative(ROOT, r.planPath));
    const status = r.pass ? 'PASS' : (r.uncheckable ? 'UNCHECKABLE' : 'FAIL');
    console.log(`  ${icon} [${status}] ${plan}:${r.lineNum} — evidence: ${r.evidenceSignal}`);
  }

  if (reportPath) {
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, generateScanReport(result, plansDir));
    console.log(`\nReport: ${reportPath}`);
  }

  fireTelemetry(result.pass ? 'pass' : 'deny', 'plans');
  console.log(`\nVERDICT: ${result.pass ? 'PASS' : 'FAIL'}`);
  if (result.failCount) console.log(`  No-evidence: ${result.failCount} row(s) flagged`);
  if (result.uncheckableCount) console.log(`  Uncheckable: ${result.uncheckableCount} row(s) flagged`);
  process.exit(result.pass ? 0 : (result.uncheckableCount && !result.failCount ? 2 : 1));
} else if (args.includes('--check-diff')) {
  const idx = args.indexOf('--check-diff');
  const planFile = resolve(args[idx + 1]);
  const content = safeRead(planFile);
  if (content === null) {
    console.error(`VERDICT: FAIL\n  Cannot read: ${norm(planFile)} — fail-closed`);
    fireTelemetry('deny', norm(planFile));
    process.exit(1);
  }
  const result = checkDiffParity(content, planFile);
  if (result.violations.length)
    for (const v of result.violations) console.error(`  ✗ ${v.message}`);
  else
    console.log('  ✓ All removal diffs have parity tables');
  fireTelemetry(result.pass ? 'pass' : 'deny', norm(relative(ROOT, planFile)));
  console.log(`\nVERDICT: ${result.pass ? 'PASS' : 'FAIL'}`);
  process.exit(result.pass ? 0 : 1);
} else if (args.includes('--verify-citations')) {
  const idx = args.indexOf('--verify-citations');
  const reportFile = resolve(args[idx + 1]);
  const content = safeRead(reportFile);
  if (content === null) {
    console.error(`VERDICT: FAIL\n  Cannot read: ${norm(reportFile)} — fail-closed`);
    fireTelemetry('deny', norm(reportFile));
    process.exit(1);
  }
  const result = verifyCitations(content, ROOT);
  if (result.violations.length)
    for (const v of result.violations) console.error(`  ✗ ${v.citation}: ${v.error}`);
  else
    console.log('  ✓ All cited file:line references resolve on disk and match expected text');
  fireTelemetry(result.pass ? 'pass' : 'deny', norm(relative(ROOT, reportFile)));
  console.log(`\nVERDICT: ${result.pass ? 'PASS' : 'FAIL'}`);
  process.exit(result.pass ? 0 : 1);
} else if (args.includes('--file')) {
  // Legacy registry-based mode (population: explicit registry, not plans)
  const registryPath = resolve(args[args.indexOf('--file') + 1]);
  const ri = args.indexOf('--report');
  const reportPath = ri !== -1 ? resolve(args[ri + 1]) : null;
  const result = sweep(registryPath);
  if (result.error) {
    console.error(`VERDICT: FAIL\n  ${result.error}`);
    fireTelemetry('deny', norm(relative(ROOT, registryPath)));
    process.exit(1);
  }
  for (const r of result.results) {
    const icon = r.pass ? '✓' : '✗';
    console.log(`  ${icon} [${r.entry.verdict}] ${norm(r.entry.file)}:${r.entry.line || '?'} — ${r.reason}`);
  }
  if (reportPath) {
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, generateReport(result, registryPath));
    console.log(`\nReport: ${reportPath}`);
  }
  fireTelemetry(result.pass ? 'pass' : 'deny', norm(relative(ROOT, registryPath)));
  console.log(`\nVERDICT: ${result.pass ? 'PASS' : 'FAIL'}`);
  if (result.sedimentCount) console.log(`  Sediment: ${result.sedimentCount} candidate(s)`);
  process.exit(result.pass ? 0 : 1);
} else {
  console.log('Usage:');
  console.log('  node scripts/check-sediment-sweep.mjs --self-test');
  console.log('  node scripts/check-sediment-sweep.mjs --sweep [--plans-dir <dir>] [--report <path>]');
  console.log('  node scripts/check-sediment-sweep.mjs --scan-plans [--plans-dir <dir>] [--report <path>]');
  console.log('  node scripts/check-sediment-sweep.mjs --check-diff <plan-file>');
  console.log('  node scripts/check-sediment-sweep.mjs --verify-citations <report-file>');
  console.log('  node scripts/check-sediment-sweep.mjs --file <registry.jsonl> [--report <path>]  (legacy)');
  process.exit(1);
}
