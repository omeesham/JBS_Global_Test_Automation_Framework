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
 *             INTEGRITY NOTE: per-file timestamps are resolved point-in-time: for each
 *             referenced file, the check runs `git log -1 --until=<rowWhen>` to find the
 *             file's last commit AT OR BEFORE the row's claimed timestamp and compares against
 *             that, not the file's latest-ever commit. This eliminates false positives where a
 *             later commit legitimately re-touched a file an older row named. Same-commit
 *             backdating for NEW files is still caught: a file with no prior commit has no
 *             --until result. In that case the staged-file discriminator applies: if the file
 *             IS part of the current staged change set, mtime is real evidence and the check
 *             fires (claiming 09:00 for a file staged at 14:32 still fires). If the file is
 *             NOT staged, mtime is unreliable (a later session may have re-touched it), so the
 *             row is SKIPPED — missing evidence must not convict. Residual give-up: backdating
 *             a row to any time after a file's most-recent prior committed state (while also
 *             editing the file today) compares clean — the same deliberate-choreography class
 *             as split-commit backdating, not the lazy single-commit backdating the gate targets.
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
import { execSync, execFileSync } from 'node:child_process';
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
 * Expand a single brace-notation token into one or more concrete paths.
 * "prefix/{a,b,c}/suffix" → ["prefix/a/suffix", "prefix/b/suffix", "prefix/c/suffix"].
 * Tokens without braces are returned as-is in a single-element array.
 * Only handles one brace group per token (the common case in the Files column).
 */
function expandBraceToken(token) {
  const m = token.match(/^([^{]*)\{([^}]+)\}(.*)$/);
  if (!m) return [token];
  const [, prefix, inner, suffix] = m;
  return inner.split(',').map(part => `${prefix}${part.trim()}${suffix}`);
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

/**
 * Extract file tokens from the "Files" cell.
 * Handles shell brace-notation groups like "dir/{a.json,b.ts,c.ts}" by using
 * depth-aware comma splitting (so commas inside {} are not treated as token
 * boundaries) followed by per-token brace expansion.
 */
export function extractFiles(cell) {
  // Depth-aware tokenize: split on top-level commas only (ignore commas inside {}).
  const tokens = [];
  let depth = 0, cur = '';
  for (const ch of cell) {
    if (ch === '{') { depth++; cur += ch; }
    else if (ch === '}') { depth--; cur += ch; }
    else if (ch === ',' && depth === 0) {
      if (cur.trim()) tokens.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) tokens.push(cur.trim());

  // Expand each token (may contain a brace group), then clean each expanded path.
  const files = [];
  for (const token of tokens) {
    for (const expanded of expandBraceToken(token)) {
      const clean = cleanFileToken(expanded);
      if (clean) files.push(clean);
    }
  }
  return files;
}

/** Get git last-commit time (ms) for a file at or before asOfMs, or null if none. */
function gitCommitTimeAsOf(relPath, asOfMs) {
  try {
    const untilIso = new Date(asOfMs).toISOString();
    const out = execFileSync('git', ['log', '-1', `--until=${untilIso}`, '--format=%cI', '--', relPath], {
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

/** Get git last-commit time (ms) for a file, or null if not tracked / no commits. */
function gitCommitTimeMs(relPath) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', relPath], {
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

/**
 * Compute true file time = max(mtime, git commit time).
 * When asOfMs is provided, uses point-in-time git history: compares the claim against the
 * file's last commit AT OR BEFORE asOfMs rather than the latest commit ever.
 *
 * EVIDENCE LAW (PLAN_76, 2026-08-17): a file's mtime may convict a row ONLY when the file's
 * disk state was produced by the committer's own local edits. Disk states written by git
 * itself — clone checkouts, branch switches, MERGE staging — reset mtimes to "now" and are
 * NOT evidence of when anyone's work happened (a merge false-flagged 15 honest historical
 * rows exactly this way and froze a collaborator's commit).
 *
 * When no prior commit exists at the claim time (gitAsOf === null) and mtimeEvidenceFiles
 * is provided:
 *   - File IS in mtimeEvidenceFiles (locally modified / hand-staged in a non-merge commit):
 *     mtime is real evidence — fall through to the mtime check. This preserves same-commit
 *     backdating detection (the graduating incident).
 *   - File NOT in the set: mtime is noise; return {time: null} so the row is SKIPPED.
 *     Missing evidence must not convict (LR-037 bar).
 *
 * When mtimeEvidenceFiles is not provided: original fallback behavior (mtime always counts).
 * Callers decide the set: staged mode passes the staged files (EMPTY during a merge —
 * merge staging is git-written, see runStaged); full mode passes the dirty working-tree set.
 * Returns { time, source, exists }.
 */
export function fileTrueTime(relPath, asOfMs, mtimeEvidenceFiles) {
  const stagedFiles = mtimeEvidenceFiles; // internal name kept small; semantics per docblock
  if (asOfMs != null) {
    const gitAsOf = gitCommitTimeAsOf(relPath, asOfMs);
    if (gitAsOf !== null) {
      return { time: gitAsOf, source: 'git', exists: true };
    }
    // No commit at or before the claim.
    // If stagedFiles is provided and this file is NOT staged, we have no meaningful
    // time signal — mtime reflects the last edit on disk which may be days later
    // (a later session re-touched the file), not when the row's work was done.
    if (stagedFiles != null && !stagedFiles.has(relPath)) {
      return { time: null, source: 'no-prior-commit-not-staged', exists: false };
    }
    // File IS staged (or no staged context) — mtime is the only signal; use it.
  }
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
      // If a later log row already names this file (and thus accounts for its mtime),
      // this earlier row is not evidence of backdating — skip it.
      if (latestRowForFile) {
        const latestMs = latestRowForFile.get(f);
        if (latestMs !== undefined && latestMs > row.whenMs) continue;
      }
      // Commit-regenerated files (e.g. plans/INDEX.md) have their mtime bumped forward by
      // the very commit that carries this row — exclude from the backdating check (LR-037 FP).
      if (isGeneratedFile(f)) { generatedCount++; continue; }
      const t = resolveTime(f, row.whenMs);
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

/**
 * Read the staged (index) content of the activity-log file via `git show :<path>`.
 * Falls back to reading the working-tree file if git fails (e.g., new untracked file).
 * Returns empty string if neither is available.
 */
function getStagedLogContent() {
  try {
    return execSync(`git show :"${LOG_REL}"`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    try { return fs.readFileSync(LOG_PATH, 'utf8'); } catch { return ''; }
  }
}

/**
 * Resolve a file token to a canonical repo-relative key for the latestRowForFile map.
 * For tokens that already contain a path separator, the token is used as-is.
 * For bare filenames (no '/'), look up the staged file set for a path that ends with
 * '/<token>' — this matches e.g. 'copilot-worker.sh' to
 * '.claude/skills/ultra-agents/copilot-worker.sh' when that file is staged.
 * If no match is found, the bare token is returned unchanged.
 */
function resolveToken(token, stagedFiles) {
  if (token.includes('/')) return token;
  const suffix = '/' + token;
  for (const p of stagedFiles) {
    if (p === token || p.endsWith(suffix)) return p;
  }
  return token;
}

/** True when the repo is mid-merge (MERGE_HEAD resolves): staged content is git-written,
 *  so staged-file mtimes are checkout artifacts, never committer-edit evidence (PLAN_76). */
function isMergeInProgress() {
  try {
    execSync('git rev-parse -q --verify MERGE_HEAD', {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

/** Repo-relative paths with local modifications (staged or not) per `git status --porcelain`.
 *  These are the only files whose mtime reflects the committer's own work (PLAN_76). */
function getWorkingDirtySet() {
  try {
    const out = execSync('git status --porcelain', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const set = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.trim()) continue;
      let p = line.slice(3).trim();
      const arrow = p.indexOf(' -> ');
      if (arrow !== -1) p = p.slice(arrow + 4);
      if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
      set.add(p);
    }
    return set;
  } catch {
    return null; // unknown state → preserve legacy mtime-always behavior rather than skip
  }
}

/** Get the set of repo-relative paths currently in the staging index (forward-slash normalized). */
function getStagedFileSet() {
  try {
    const out = execSync('git diff --cached --name-only', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return new Set(out.trim().split(/\r?\n/).filter(Boolean));
  } catch {
    return new Set();
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

  const stagedFiles = getStagedFileSet();

  // Build latestRowForFile from ALL rows in the full staged log content — not just the added
  // rows. A later row anywhere in the log (pre-existing or newly added) that names the same
  // file and carries a timestamp at or after the file's mtime accounts for that mtime; an
  // earlier staged row naming the same file is therefore not evidence of backdating.
  //
  // Bare filename tokens (no '/') are resolved to their full repo-relative paths via the
  // staged file set, so 'copilot-worker.sh' and '.claude/skills/ultra-agents/copilot-worker.sh'
  // are treated as the same file when one is staged under the full path.
  const latestRowForFile = new Map();
  for (const r of parseLog(getStagedLogContent())) {
    for (const f of extractFiles(r.filesCell)) {
      const key = resolveToken(f, stagedFiles);
      const prev = latestRowForFile.get(key);
      if (prev === undefined || r.whenMs > prev) latestRowForFile.set(key, r.whenMs);
    }
  }

  // PLAN_76: during a merge, EVERYTHING the merge brings is "staged", but those disk states
  // came from git's checkout, not from the committer's editor — their mtimes convict nothing.
  // Honest residual, stated plainly: a row backdated DURING a merge commit about a file with
  // no committed history escapes the mtime check; git-time checks still apply to everything
  // with history, and post-merge commits are gated normally again.
  const mtimeEvidence = isMergeInProgress() ? new Set() : stagedFiles;
  const stagedResolver = (relPath, asOfMs) => fileTrueTime(relPath, asOfMs, mtimeEvidence);

  const { violations, skipped, checked } = computeRowViolations(rows, stagedResolver, { latestRowForFile });
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

  // In latest-per-file mode: for each (file → latest whenMs) pair, only the latest
  // row for each file is responsible for covering the file's true time.
  let latestRowForFile = null;
  if (latestPerFile) {
    latestRowForFile = new Map();
    for (const r of candidateRows) {
      for (const f of extractFiles(r.filesCell)) {
        const prev = latestRowForFile.get(f);
        if (prev === undefined || r.whenMs > prev) latestRowForFile.set(f, r.whenMs);
      }
    }
  }

  // PLAN_76: on a fresh clone/checkout every mtime is "now" — only files the committer
  // actually modified locally carry mtime evidence. Kills the 97-row false alarm a fresh
  // clone produced while keeping the check's teeth on genuinely dirty files.
  const dirtySet = getWorkingDirtySet();
  const fullResolver = (relPath, asOfMs) => fileTrueTime(relPath, asOfMs, dirtySet);
  const { violations, skipped, checked } = computeRowViolations(candidateRows, fullResolver, { latestRowForFile });
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
