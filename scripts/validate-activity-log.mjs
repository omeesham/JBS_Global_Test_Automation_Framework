#!/usr/bin/env node
/**
 * validate-activity-log.mjs — Catch backdated entries in agent-activity-log.md.
 *
 * For every table row:
 *   - Parse the timestamp from the "When" column (YYYY-MM-DDTHH:MM, local time).
 *   - Extract file paths from the "Files" column.
 *   - For each file, compute the "true file time" = max(fs mtime, git log -1 %cI).
 *   - If row timestamp < true file time by more than TOLERANCE_MIN minutes → VIOLATION.
 *
 * Exits 0 on clean, 1 on violations, 2 on script error.
 *
 * Flags:
 *   --json    Emit a JSON report instead of text.
 *   --quiet   Suppress per-row progress lines.
 *   --baseline=<when>  Only check rows with timestamp >= this date (YYYY-MM-DD).
 *   --recent=<N>       Only check the N most recent rows (by timestamp).
 *   --latest-per-file  For each file, only enforce the rule on the single most-recent
 *                      row that references it. Older rows are expected to have stale
 *                      mtime/commit-time for shared files (activity-log.md, CLAUDE.md)
 *                      and would otherwise produce noise. Recommended for preflight.
 *
 * LR-037: Activity log timestamps must be >= all referenced file mtimes / commit times.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const LOG_PATH = path.join(REPO_ROOT, 'specs_planning', '_internal', 'agent-activity-log.md');
const TOLERANCE_MIN = 1; // row can be up to 1 min earlier than actual file time
const TOLERANCE_MS = TOLERANCE_MIN * 60 * 1000;

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const quiet = args.includes('--quiet') || jsonMode;
const baselineArg = args.find(a => a.startsWith('--baseline='));
const baselineDate = baselineArg ? baselineArg.slice('--baseline='.length) : null;
const recentArg = args.find(a => a.startsWith('--recent='));
const recentN = recentArg ? Number(recentArg.slice('--recent='.length)) : null;
const latestPerFile = args.includes('--latest-per-file');

/** Parse "YYYY-MM-DDTHH:MM" as local time; return ms epoch. */
function parseRowTime(s) {
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
function extractFiles(cell) {
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

function parseLog(src) {
  const lines = src.split(/\r?\n/);
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) continue;
    // Skip header (`| When |`) and separator (`|------|`)
    if (/^\|\s*When\s*\|/i.test(line)) continue;
    if (/^\|[\s:|-]+\|$/.test(line.trim())) continue;

    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 5) continue;
    const [when, agent, action, filesCell, notes] = cells;
    const ts = parseRowTime(when);
    if (ts === null) continue; // not a data row
    rows.push({ lineNo: i + 1, when, whenMs: ts, agent, action, filesCell, notes });
  }
  return rows;
}

function run() {
  if (!fs.existsSync(LOG_PATH)) {
    console.error(`[validate-activity-log] ERROR: log file not found at ${LOG_PATH}`);
    process.exit(2);
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
      const files = extractFiles(r.filesCell);
      for (const f of files) {
        const prev = latestRowForFile.get(f);
        if (!prev || r.whenMs > prev.whenMs) latestRowForFile.set(f, r);
      }
    }
  }

  const violations = [];
  const skipped = [];
  let checked = 0;

  for (const row of rows) {
    if (!candidateRows.includes(row)) continue;
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
    for (const f of files) {
      // In latest-per-file mode, skip files for which this row is NOT the latest claim.
      if (latestRowForFile && latestRowForFile.get(f) !== row) continue;
      const t = fileTrueTime(f);
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
    if (worstDeltaMs > TOLERANCE_MS) {
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
    }
  }

  if (jsonMode) {
    process.stdout.write(JSON.stringify({
      checked,
      violations: violations.length,
      skipped: skipped.length,
      toleranceMinutes: TOLERANCE_MIN,
      rowsTotal: rows.length,
      baseline: baselineDate || null,
      details: { violations, skipped },
    }, null, 2) + '\n');
  } else {
    if (!quiet) {
      console.log(`[validate-activity-log] rows total: ${rows.length}, checked: ${checked}, tolerance: ${TOLERANCE_MIN} min`);
      if (baselineDate) console.log(`[validate-activity-log] baseline filter: >= ${baselineDate}`);
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

  process.exit(violations.length ? 1 : 0);
}

try {
  run();
} catch (e) {
  console.error('[validate-activity-log] ERROR:', e.stack || e.message);
  process.exit(2);
}
