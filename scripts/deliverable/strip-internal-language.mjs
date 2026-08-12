#!/usr/bin/env node
/**
 * strip-internal-language.mjs
 * Deterministic codemod: strips NM-\d+ ticket refs and internal vocabulary
 * from clients/encore/src and clients/encore/tests (with path exclusions).
 *
 * Dry run:  node scripts/deliverable/strip-internal-language.mjs --dry-run
 * Apply:    node scripts/deliverable/strip-internal-language.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const DRY_RUN = process.argv.includes('--dry-run');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');
const ENCORE = join(ROOT, 'clients', 'encore');
const SRC_DIR  = join(ENCORE, 'src');
const TESTS_DIR = join(ENCORE, 'tests');

// Paths excluded from scope (ticket constraint)
const EXCLUDE_RE = /local-office|_unit|location-currency|location-local-info|location-management-history|location-pricing/;

// B-vocabulary from the ticket spec (conservative — only exact tokens listed)
const B_VOCAB_RE = /\b(?:graft|lot[\s\u2011-]contract|lot-worker|walk-A|ORACLE-FACTS|machine-evidence|reject-oracle|bed-recount)\b/i;

// ── file discovery ────────────────────────────────────────────────────────────

function collectTs(dir) {
  const out = [];
  (function walk(d) {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      const rel = relative(ENCORE, p).replace(/\\/g, '/');
      if (EXCLUDE_RE.test(rel)) continue;
      const s = statSync(p);
      if (s.isDirectory()) { walk(p); continue; }
      if (p.endsWith('.ts')) out.push(p);
    }
  })(dir);
  return out;
}

function countUniqueTcIds() {
  // Count across ALL test files (no exclusions) — matches the VERIFY command:
  // grep -rhoE "TC-[A-Z0-9-]+" clients/encore/tests | sort -u | wc -l
  const ids = new Set();
  const re = /TC-[A-Z0-9-]+/g;
  (function walk(d) {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      const s = statSync(p);
      if (s.isDirectory()) { walk(p); continue; }
      if (!p.endsWith('.ts')) continue;
      const txt = readFileSync(p, 'utf8');
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(txt)) !== null) ids.add(m[0]);
    }
  })(TESTS_DIR);
  return ids;
}

function backtickCount(s) { let n = 0; for (const c of s) if (c === '`') n++; return n; }

// ── per-line transformation ───────────────────────────────────────────────────

/**
 * Returns the transformed line, or null to delete the line entirely.
 * Never deletes or alters TC-[A-Z0-9-]+ identifiers.
 */
function transformLine(line) {
  let out = line;

  // ── RULE-DELETE ──────────────────────────────────────────────────────────────
  // Delete a standalone // comment line whose body (after stripping decorative
  // prefix characters) starts with an NM-\d+ reference.
  // Guard: never delete a line that contains a TC identifier.
  if (/^\s*\/\//.test(out) && !/TC-[A-Z0-9-]+/.test(out)) {
    // Strip "// " and then any decorative prefix (---, ===, ──, spaces)
    const body = out
      .replace(/^\s*\/\/\s*/, '')
      .replace(/^[-\u2500\u2501\u2550\u2550=\s]+/, '')
      .trim();
    if (/^NM[-\d]/.test(body)) return null;
  }

  // ── RULE-PARENS ──────────────────────────────────────────────────────────────
  // Strip parentheticals that contain NM ticket refs or B-vocabulary.
  // Applied only in comment/test-call/expect contexts to avoid altering code.
  // Never removes a parenthetical that contains a TC identifier.
  const applyParens =
    /^\s*(?:\/\/|\*)/.test(out) ||
    /\/\//.test(out) ||
    /^\s*(test|describe|it)\b/.test(out) ||
    /\btest\.(?:describe|skip|fixme)\s*\(/.test(out) ||
    /\bexpect\s*\(/.test(out);

  if (applyParens) {
    out = out.replace(/\s*\(([^)]{1,80})\)/g, (whole, inner) => {
      if (/\(/.test(inner)) return whole;             // nested parens → skip
      if (/TC-[A-Z0-9-]+/.test(inner)) return whole; // TC identifier → never remove
      if (/NM[-]?\d+/.test(inner)) return '';         // NM ticket ref → strip
      if (B_VOCAB_RE.test(inner)) return '';           // B vocabulary → strip
      return whole;
    });
  }

  // ── RULE-TITLE ───────────────────────────────────────────────────────────────
  // Remove a bare NM-\d+ token immediately after a TC-ID: prefix in a title.
  // Handles: 'TC-XYZ: NM-1234 — rest' and 'TC-XYZ: NM-1234 rest'
  if (
    /^\s*(test|describe|it)\b/.test(out) ||
    /\btest\.(?:describe|skip|fixme)\s*\(/.test(out)
  ) {
    // 'TC-XYZ: NM-1234 — rest' → 'TC-XYZ: rest'  (em/en dash separator)
    out = out.replace(/(TC-[A-Z0-9-]+:\s*)NM-\d+\s*[—–]\s*/g, '$1');
    // 'TC-XYZ: NM-1234 rest' → 'TC-XYZ: rest'  (bare NM token as title prefix)
    out = out.replace(/(TC-[A-Z0-9-]+:\s*)NM-\d+\s+(?![0-9-])/g, '$1');
  }

  return out;
}

// ── main ─────────────────────────────────────────────────────────────────────

const tcBefore = countUniqueTcIds();
const tcBeforeCount = tcBefore.size;
console.log(`Baseline unique TC IDs in tests: ${tcBeforeCount}`);
if (tcBeforeCount !== 883) {
  console.error(`ABORT: expected 883 unique TC IDs, found ${tcBeforeCount} — do not proceed.`);
  process.exit(1);
}

const files = [...collectTs(SRC_DIR), ...collectTs(TESTS_DIR)];
console.log(`TypeScript files in scope: ${files.length}`);

const changes   = []; // { file, line, before, after }
const leftovers = []; // { file, line, text, reason }
const modifiedFiles = new Set();

for (const fpath of files) {
  const rel = relative(ENCORE, fpath).replace(/\\/g, '/');
  const original = readFileSync(fpath, 'utf8');
  const origBt    = backtickCount(original);
  const origBytes = Buffer.byteLength(original);

  const inLines  = original.split('\n');
  const outLines = [];

  for (let i = 0; i < inLines.length; i++) {
    const lineNum = i + 1;
    const raw     = inLines[i];
    const result  = transformLine(raw);

    if (result === null) {
      changes.push({ file: rel, line: lineNum, before: raw.trim(), after: '(line deleted)' });
    } else {
      if (result !== raw) {
        changes.push({ file: rel, line: lineNum, before: raw.trim(), after: result.trim() });
      }
      outLines.push(result);

      // Collect remaining NM refs for leftover report (after transformation)
      if (/NM[-]?\d+/.test(result)) {
        leftovers.push({ file: rel, line: lineNum, text: result.trim(),
          reason: 'NM ref not safely automatable — leave for human review' });
      }
      // Collect remaining B vocab in comment lines
      if (B_VOCAB_RE.test(result) && /^\s*(?:\/\/|\*)/.test(result)) {
        leftovers.push({ file: rel, line: lineNum, text: result.trim(),
          reason: 'B-vocabulary in comment — removal would break sentence' });
      }
    }
  }

  const newContent = outLines.join('\n');
  const newBt    = backtickCount(newContent);
  const newBytes = Buffer.byteLength(newContent);

  // INVARIANT: template literal balance
  if (newBt !== origBt) {
    console.error(`ABORT: backtick count changed in ${rel}: ${origBt} → ${newBt}`);
    process.exit(2);
  }
  // INVARIANT: no more than 30% byte reduction
  if (newBytes < origBytes * 0.70) {
    console.error(`ABORT: byte drop >30% in ${rel}: ${origBytes} → ${newBytes}`);
    process.exit(2);
  }

  if (newContent !== original) {
    modifiedFiles.add(rel);
    if (!DRY_RUN) {
      writeFileSync(fpath, newContent, 'utf8');
    }
  }
}

// ── post-change TC count ──────────────────────────────────────────────────────

const tcAfterCount = countUniqueTcIds().size;
console.log(`\nPost-change unique TC IDs in tests: ${tcAfterCount}`);

if (tcAfterCount !== 883) {
  console.error(`ABORT: TC count changed ${tcBeforeCount} → ${tcAfterCount}`);
  if (!DRY_RUN) {
    execSync('git checkout -- clients/encore/src clients/encore/tests',
      { cwd: ROOT, stdio: 'inherit' });
    console.log('Reverted all changes.');
  }
  process.exit(3);
}

// ── write STRIP-REPORT.md ─────────────────────────────────────────────────────

const reportDir = join(
  ROOT, '.claude', 'state', 'ua-worker', 'chips', 'deliv-leak', 'out-ex3b'
);
mkdirSync(reportDir, { recursive: true });
const reportPath = join(reportDir, 'STRIP-REPORT.md');

function mdTable(headers, rows) {
  const sep = headers.map(() => '---').join(' | ');
  return [
    `| ${headers.join(' | ')} |`,
    `| ${sep} |`,
    ...rows.map(r => `| ${r.join(' | ')} |`),
  ].join('\n');
}

const changeTable = mdTable(
  ['Location', 'Before', 'After'],
  changes.map(c => [
    `\`${c.file}:${c.line}\``,
    c.before.replace(/\|/g, '\\|').replace(/\n/g, ' '),
    c.after.replace(/\|/g, '\\|').replace(/\n/g, ' '),
  ])
);

const leftoverTable = mdTable(
  ['Location', 'Text', 'Reason'],
  leftovers.map(l => [
    `\`${l.file}:${l.line}\``,
    l.text.replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 120),
    l.reason,
  ])
);

const report = `# STRIP-REPORT — strip-internal-language.mjs

Generated: ${new Date().toISOString()}
Mode: ${DRY_RUN ? 'DRY RUN (no files written)' : 'APPLIED'}

## Baseline

| Metric | Value |
|---|---|
| Unique TC IDs before | ${tcBeforeCount} |
| Unique TC IDs after | ${tcAfterCount} |
| TypeScript files in scope | ${files.length} |
| Files modified | ${modifiedFiles.size} |
| Lines changed | ${changes.length} |
| Left for human review | ${leftovers.length} |

## Rules applied

| Rule | Description |
|---|---|
| RULE-DELETE | Delete standalone \`//\` comment lines whose body begins with \`NM-\\d+\` (after stripping decorative prefix). Guard: line must contain no TC identifier. |
| RULE-PARENS | Remove parentheticals \`(…NM-\\d+…)\` or \`(…B-vocab…)\` in comment lines, test/describe titles, and expect() messages. Guards: no nested parens, no TC identifier inside. |
| RULE-TITLE | Remove bare \`NM-\\d+ — \` or \`NM-\\d+ \` token right after \`TC-ID:\` prefix in test/describe title strings. |

## Changes

${changeTable}

## Left for human review

Lines where the NM ref or B-vocabulary could not be safely stripped automatically
(removal would break the sentence, or the context was ambiguous).

${leftoverTable}

## Verification

\`\`\`
grep -rhoE "TC-[A-Z0-9-]+" clients/encore/tests | sort -u | wc -l
npm run typecheck --prefix clients/encore
npm run check:tc-parity
grep -rnE "NM-[0-9]+" clients/encore/src clients/encore/tests
\`\`\`
`;

writeFileSync(reportPath, report, 'utf8');
console.log(`\nReport: ${reportPath}`);
console.log(`${DRY_RUN ? 'DRY RUN complete.' : 'Applied.'} ` +
  `Modified: ${modifiedFiles.size} files | Changes: ${changes.length} | Leftovers: ${leftovers.length}`);
