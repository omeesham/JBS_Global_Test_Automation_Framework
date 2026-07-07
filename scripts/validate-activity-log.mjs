#!/usr/bin/env node
/**
 * validate-activity-log.mjs — Catch backdated entries in agent-activity-log.md.
 *
 * For every row checked:
 *   - Parse the timestamp from the "When" column (YYYY-MM-DDTHH:MM, local time).
 *   - Extract file paths from the "Files" column.
 *   - For each file, compute the "true file time" = max(fs mtime, git log -1 %cI).
 *   - If row timestamp < true file time by more than TOLERANCE_MIN minutes → VIOLATION.
 *
 * Exits 0 on clean, 1 on violations, 2 on script error.
 *
 * Modes:
 *   --staged  PREFERRED for the pre-commit gate. Validate ONLY the rows ADDED in the
 *             currently-staged activity-log diff (`git diff --cached`). This is the anti-
 *             backdating gate proper: backdating can only be INTRODUCED by a row you are
 *             adding right now, so that is exactly the set to check. Already-committed rows
 *             are immutable history — the files they reference legitimately drift forward
 *             (a later session re-touches a shared file; a plan moves pending/→done/), and
 *             re-checking them against HEAD file-times is the false-positive class this mode
 *             eliminates (LR-037 FP fix, 2026-07-06). No staged log changes → 0 rows → exit 0.
 *
 *             INTEGRITY NOTE: --staged still HARD-FAILS single-commit backdating — a row and
 *             its referenced files staged in the same commit with an earlier When than the
 *             files' mtime (LR-037's graduating incident). What it gives up vs the --recent
 *             window is split-commit backdating (write a row now, touch its files in a LATER
 *             commit); that is a deliberately-choreographed evasion, not the lazy backdating
 *             the gate targets, and it is the unavoidable price of removing the FP (you cannot
 *             re-validate an immutable committed row against HEAD without FP-ing on legit drift).
 *
 * Full-scan flags (manual/advisory — noisy for historical rows, see INTEGRITY NOTE above):
 *   --json    Emit a JSON report instead of text.
 *   --quiet   Suppress per-row progress lines.
 *   --baseline=<when>  Only check rows with timestamp >= this date (YYYY-MM-DD).
 *   --recent=<N>       Only check the N most recent rows (by timestamp).
 *   --latest-per-file  For each file, only enforce the rule on the single most-recent
 *                      row that references it. (Historical mitigation; superseded by --staged
 *                      for the commit gate — it cannot fix the moved-file / bare-dir FP classes
 *                      because it keys on the exact string token.)
 *
 * Commit-regenerated files (plans/INDEX.md — re-staged by the pre-commit reindex, see
 * GENERATED_FILE_PATHS below) are EXEMPT from the mtime comparison in every mode: their mtime
 * is bumped forward by the very commit carrying the row, so checking it is a guaranteed FP.
 * The exemption is per-file — a real authored file listed in the same row is still checked.
 * (LR-037 FP fix v2, 2026-07-07.)
 *
 * LR-037: Activity log timestamps must be >= all referenced file mtimes / commit times.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SHARED_PATHS, frameworkRoot } from './shared-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = frameworkRoot();
const LOG_PATH = SHARED_PATHS.activityLog;
const LOG_REL = path.relative(REPO_ROOT, LOG_PATH).split(path.sep).join('/');
const TOLERANCE_MIN = 1; // row can be up to 1 min earlier than actual file time
const TOLERANCE_MS = TOLERANCE_MIN * 60 * 1000;

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const quiet = args.includes('--quiet') || jsonMode;
const stagedMode = args.includes('--staged');
const baselineArg = args.find(a => a.startsWith('--baseline='));
const baselineDate = baselineArg ? baselineArg.slice('--baseline='.length) : null;
const recentArg = args.find(a => a.startsWith('--recent='));
const recentN = recentArg ? Number(recentArg.slice('--recent='.length)) : null;
const latestPerFile = args.includes('--latest-per-file');

/**
 * Files the commit process REGENERATES and RE-STAGES itself, so their mtime is bumped
 * FORWARD by the very commit that carries the activity-log row referencing them. Checking
 * such a file's post-hook mtime against the row's honest "When" is a guaranteed false
 * positive — the row was written before the hook touched the file. These paths are
 * machine-generated (never hand-authored, LR-035), so their mtime is meaningless as a
 * "when was this work done" signal and is correctly excluded from the backdating check.
 *
 * The ONLY current member is plans/INDEX.md (`.githooks/pre-commit` §1: `node
 * scripts/plans-reindex.mjs` → `git add plans/INDEX.md`). Add a path here ONLY if a hook
 * both regenerates AND re-stages it inside the commit. Anti-backdating stays fully intact
 * for every real authored file — this narrows the check, it does not weaken it.
 * (LR-037 FP fix v2, 2026-07-07.)
 */
const GENERATED_FILE_PATHS = new Set([
  'plans/INDEX.md',
]);

/** True if relPath is a commit-regenerated file exempt from the mtime backdating check. */
export function isGeneratedFile(relPath) {
  return GENERATED_FILE_PATHS.has(relPath);
}

/** Parse "YYYY-MM-DDTHH:MM" as local time; return ms epoch. */
export function parseRowTime(s) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)).getTime();
}

/**
 * Clean a single file token from the Files column.
 * Strips parenthetical annotations like "(deleted)", "(moved from pending/)", "(regenerated)".
 * Returns null if the token indicates the file no longer exists (deleted/moved-from).
 */
function cleanFileToken(raw) {
  let s = raw.trim();
  if (!s) return null;

  // "A -> B" (moved) → use B (the destination)
  if (s.includes('->')) {
    const parts = s.split('->').map(p => p.trim());
    s = parts[parts.length - 1];
  }

  // Detect deletion markers BEFORE stripping parens
  const lower = s.toLowerCase();
  if (/\(deleted\)/.test(lower)) return null;
  if (/\(moved from /.test(lower)) {
    // "foo.md (moved from pending/)" — path is current path; file exists at `foo.md`
    // leave s as-is, strip the annotation below
  }

  // Strip trailing parenthetical annotations: "path.md (regenerated)" → "path.md"
  s = s.replace(/\s*\([^)]*\)\s*$/g, '').trim();

  // Strip surrounding backticks/quotes if any
  s = s.replace(/^[`'"]+|[`'"]+$/g, '');

  if (!s) return null;
  // Ignore tokens that look like plain words, not paths (no slash AND no dot)
  if (!s.includes('/') && !s.includes('.')) return null;
  return s;
}

/** Extract file tokens from the "Files" cell. */
export function extractFiles(cell) {
  return cell
    .split(',')
    .map(cleanFileToken)
    .filter(Boolean);
}

/** Get git last-commit time (ms) for a file, or null if not tracked / no commits. */
function gitCommitTimeMs(relPath) {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${relPath}"`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!out) return null;
    const t = Date.parse(out);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}

/** Get fs mtime (ms) for a file, or null if missing. */
function fsMtimeMs(relPath) {
  try {
    return fs.statSync(path.join(REPO_ROOT, relPath)).mtimeMs;
  } catch {
    return null;
  }
}

/** Compute true file time = max(mtime, git commit time). Returns { time, source, exists }. */
function fileTrueTime(relPath) {
  const mtime = fsMtimeMs(relPath);
  const gtime = gitCommitTimeMs(relPath);
  const exists = mtime !== null;
  if (mtime === null && gtime === null) {
    return { time: null, source: 'missing', exists: false };
  }
  if (mtime !== null && gtime !== null) {
    return mtime >= gtime
      ? { time: mtime, source: 'mtime', exists: true }
      : { time: gtime, source: 'git', exists: true };
  }
  if (mtime !== null) return { time: mtime, source: 'mtime', exists: true };
  return { time: gtime, source: 'git', exists: false };
}

function fmtTs(ms) {
  if (ms === null || ms === undefined) return 'n/a';
  const d = new Date(ms);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Parse one markdown table line into an activity-log data row, or null if it is not a
 * data row (header, separator, non-table line, or unparseable "When"). Shared by the
 * full-file reader (parseLog) and the staged-diff reader (parseStagedAddedRows).
 * @param {string} line
 * @param {number} lineNo  1-based line number to attach for reporting
 */
function parseRowLine(line, lineNo) {
  if (!line.startsWith('|')) return null;
  if (/^\|\s*When\s*\|/i.test(line)) return null;      // header
  if (/^\|[\s:|-]+\|$/.test(line.trim())) return null; // separator
  const cells = line.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 5) return null;
  const [when, agent, action, filesCell, notes] = cells;
  const ts = parseRowTime(when);
  if (ts === null) return null; // not a data row
  return { lineNo, when, whenMs: ts, agent, action, filesCell, notes };
}

function parseLog(src) {
  const lines = src.split(/\r?\n/);
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const row = parseRowLine(lines[i], i + 1);
    if (row) rows.push(row);
  }
  return rows;
}

/**
 * Parse `git diff --cached --unified=0` output → the ADDED activity-log data rows.
 * Only '+' lines that parse as a data row are returned; the '+++ b/…' file header, the
 * '@@ … +start[,len] @@' hunk headers, removed ('-') lines, and non-row '+' noise are all
 * excluded. Mirrors parseAddedSelectorLines() in check-testid-preference.mjs.
 * @param {string} diffText
 * @returns {Array<{lineNo,when,whenMs,agent,action,filesCell,notes}>}
 */
export function parseStagedAddedRows(diffText) {
  const rows = [];
  let newLine = 0;
  for (const raw of String(diffText ?? '').split(/\r?\n/)) {
    if (raw.startsWith('+++')) continue;              // file header (checked before '+')
    if (raw.startsWith('@@')) {
      const m = /\+(\d+)(?:,\d+)?/.exec(raw);
      newLine = m ? Number(m[1]) : 0;
      continue;
    }
    if (raw.startsWith('-')) continue;                // deletion / '--- a/…' — no new-line advance
    if (raw.startsWith('+')) {
      const row = parseRowLine(raw.slice(1), newLine);
      if (row) rows.push(row);
      newLine++;
      continue;
    }
    if (raw.startsWith(' ')) { newLine++; continue; } // context (absent at unified=0, handled anyway)
    // 'diff --git …', 'index …' and blank lines do not advance the new-file counter
  }
  return rows;
}

/**
 * Pure per-row backdating check. For each row, compares its "When" against the true-time of
 * every referenced file (via the injected resolver) and collects violations. Extracted so it
 * can be unit-tested with a fake resolver — no real files/git needed.
 * @param {Array<{lineNo,when,whenMs,agent,action,filesCell}>} rows
 * @param {(relPath:string)=>{time:number|null,source:string,exists:boolean}} resolveTime
 * @param {{toleranceMs?:number, latestRowForFile?:Map<string,object>|null}} [opts]
 * @returns {{violations:Array, skipped:Array, checked:number}}
 */
export function computeRowViolations(rows, resolveTime, opts = {}) {
  const toleranceMs = opts.toleranceMs ?? TOLERANCE_MS;
  const latestRowForFile = opts.latestRowForFile ?? null;
  const violations = [];
  const skipped = [];
  let checked = 0;

  for (const row of rows) {
    checked++;
    const files = extractFiles(row.filesCell);
    if (files.length === 0) {
      skipped.push({ row: row.lineNo, when: row.when, reason: 'no-files-extracted' });
      continue;
    }
    let worstDeltaMs = 0;
    let worstFile = null;
    let worstTrue = null;
    let worstSource = null;
    const missingFiles = [];
    let generatedCount = 0;
    for (const f of files) {
      // In latest-per-file mode, skip files for which this row is NOT the latest claim.
      if (latestRowForFile && latestRowForFile.get(f) !== row) continue;
      // Commit-regenerated files (e.g. plans/INDEX.md) have their mtime bumped forward by
      // the very commit that carries this row — exclude from the backdating check (LR-037 FP).
      if (isGeneratedFile(f)) { generatedCount++; continue; }
      const t = resolveTime(f);
      if (t.time === null) {
        missingFiles.push(f);
        continue;
      }
      const delta = t.time - row.whenMs;
      if (delta > worstDeltaMs) {
        worstDeltaMs = delta;
        worstFile = f;
        worstTrue = t.time;
        worstSource = t.source;
      }
    }
    if (worstDeltaMs > toleranceMs) {
      violations.push({
        row: row.lineNo,
        when: row.when,
        agent: row.agent,
        action: row.action,
        file: worstFile,
        trueTime: fmtTs(worstTrue),
        source: worstSource,
        deltaMinutes: Math.round(worstDeltaMs / 60000),
      });
    }
    if (missingFiles.length === files.length) {
      skipped.push({ row: row.lineNo, when: row.when, reason: `all-files-missing (${missingFiles.length})` });
    } else if (generatedCount === files.length) {
      skipped.push({ row: row.lineNo, when: row.when, reason: `all-files-generated (${generatedCount})` });
    }
  }
  return { violations, skipped, checked };
}

/** Emit the text/JSON report shared by run() and runStaged(). */
function report({ checked, violations, skipped, rowsTotal, baseline, mode }) {
  if (jsonMode) {
    process.stdout.write(JSON.stringify({
      mode: mode || 'full',
      checked,
      violations: violations.length,
      skipped: skipped.length,
      toleranceMinutes: TOLERANCE_MIN,
      rowsTotal,
      baseline: baseline || null,
      details: { violations, skipped },
    }, null, 2) + '\n');
    return;
  }
  if (!quiet) {
    console.log(`[validate-activity-log] mode: ${mode || 'full'}, rows total: ${rowsTotal}, checked: ${checked}, tolerance: ${TOLERANCE_MIN} min`);
    if (baseline) console.log(`[validate-activity-log] baseline filter: >= ${baseline}`);
  }
  if (violations.length) {
    console.log(`\nVIOLATIONS (${violations.length}):`);
    for (const v of violations) {
      console.log(
        `  row ${v.row} [${v.when}] ${v.agent}/${v.action}: claimed ${v.when}, ` +
        `file "${v.file}" last touched ${v.trueTime} (${v.source}), ` +
        `delta = +${v.deltaMinutes} min AFTER claim`
      );
    }
  } else {
    console.log('\n[validate-activity-log] OK — no backdating violations.');
  }
  if (skipped.length && !quiet) {
    console.log(`\nSKIPPED (${skipped.length}):`);
    for (const s of skipped) console.log(`  row ${s.row} [${s.when}]: ${s.reason}`);
  }
}

/** Read the staged diff of the activity-log file (empty string if nothing staged / git error). */
function getStagedLogDiff() {
  try {
    return execSync(`git diff --cached --unified=0 -- "${LOG_REL}"`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

/** --staged mode: check only rows added in the staged activity-log diff. Returns exit code. */
function runStaged() {
  const rows = parseStagedAddedRows(getStagedLogDiff());
  const { violations, skipped, checked } = computeRowViolations(rows, fileTrueTime);
  report({ checked, violations, skipped, rowsTotal: rows.length, baseline: null, mode: 'staged' });
  return violations.length ? 1 : 0;
}

/** Full/recent/baseline scan over the whole log file. Returns exit code. */
function run() {
  if (!fs.existsSync(LOG_PATH)) {
    console.error(`[validate-activity-log] ERROR: log file not found at ${LOG_PATH}`);
    return 2;
  }
  const src = fs.readFileSync(LOG_PATH, 'utf8');
  const rows = parseLog(src);

  const baselineMs = baselineDate ? parseRowTime(baselineDate + 'T00:00') : null;

  // Build filter set: which rows we will actually check.
  let candidateRows = rows;
  if (baselineMs !== null) candidateRows = candidateRows.filter(r => r.whenMs >= baselineMs);
  if (recentN !== null && Number.isFinite(recentN) && recentN > 0) {
    const sorted = [...candidateRows].sort((a, b) => b.whenMs - a.whenMs).slice(0, recentN);
    const keep = new Set(sorted.map(r => r.lineNo));
    candidateRows = candidateRows.filter(r => keep.has(r.lineNo));
  }

  // In latest-per-file mode: for each (file → latest row) pair, only that row is
  // responsible for ensuring its timestamp covers the file's true time.
  let latestRowForFile = null;
  if (latestPerFile) {
    latestRowForFile = new Map();
    for (const r of candidateRows) {
      for (const f of extractFiles(r.filesCell)) {
        const prev = latestRowForFile.get(f);
        if (!prev || r.whenMs > prev.whenMs) latestRowForFile.set(f, r);
      }
    }
  }

  const { violations, skipped, checked } = computeRowViolations(candidateRows, fileTrueTime, { latestRowForFile });
  report({ checked, violations, skipped, rowsTotal: rows.length, baseline: baselineDate, mode: 'full' });
  return violations.length ? 1 : 0;
}

function main() {
  return stagedMode ? runStaged() : run();
}

// ESM entry-point guard so the .test.mjs can import the pure fns without running main().
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(main());
  } catch (e) {
    console.error('[validate-activity-log] ERROR:', e.stack || e.message);
    process.exit(2);
  }
}
