#!/usr/bin/env node
// sweep.mjs — Self-clean background sweeper + CLI.
//
// Sev=S2. Graduated by slop2 audit (16-lot, 2026-07-18): 500+ debris files accreted
// with no automatic cleanup. Design: self-clean-design.md (Fable, 2026-07-18).
//
// CLI MODES:
//   (no args)       — run sweep (announce or quarantine per rule mode)
//   --restore <path|sweep-id>  — restore quarantined item(s)
//   --gc            — purge expired regenerable items from quarantine (TTL 30d)
//   --status        — show what's currently held in quarantine
//
// POSTURE: announce mode (report-only, no moves) until per-rule promotion.
// Quarantine mode moves files to .claude/state/selfclean/quarantine/<sweep-id>/
// with manifest for restore. NEVER hard-deletes outside of --gc for regenerable+expired.
//
// SAFETY RAILS:
//   - Never touches tracked files (double-enforced: stratum filter + porcelain check)
//   - Never touches never-sweep list paths
//   - Age-gate: only files older than age_gate_days
//   - Fail-open on any error
//   - Porcelain self-test: if tracked files modified, auto-restore + abort

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, renameSync, copyFileSync, readdirSync, appendFileSync, unlinkSync, rmSync, openSync, closeSync, writeSync } from 'node:fs';
import { resolve, join, dirname, relative, basename } from 'node:path';
import { execSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// --- CLI dispatch ---
const args = process.argv.slice(2);

// PID liveness — signal 0 probes without killing.
// ESRCH = no such process (dead). EPERM = exists, can't signal (alive).
function isProcessAlive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (e) { return e.code === 'EPERM'; }
}

// Process start time — platform-specific, used to detect PID reuse.
// Returns a string (opaque timestamp) or null if unavailable.
function getProcessStartTime(pid) {
  try {
    if (process.platform === 'win32') {
      const out = execSync(
        `powershell -NoProfile -Command "(Get-Process -Id ${pid}).StartTime.ToFileTimeUtc()"`,
        { encoding: 'utf8', timeout: 5000, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim();
      return out && /^\d+$/.test(out) ? out : null;
    } else {
      const raw = readFileSync(`/proc/${pid}/stat`, 'utf8');
      const afterComm = raw.slice(raw.lastIndexOf(') ') + 2);
      const fields = afterComm.split(' ');
      return fields[19] || null;
    }
  } catch { return null; }
}

// Parse lock record — returns { pid, st } or null for empty/corrupt/torn.
function parseLockRecord(lockPath) {
  try {
    const raw = readFileSync(lockPath, 'utf8').trim();
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (typeof record.pid !== 'number' || !record.pid) return null;
    return record;
  } catch { return null; }
}

// Validate lock: is it held by a live, identity-verified process?
function isLockValid(record) {
  if (!record) return false;
  if (!isProcessAlive(record.pid)) return false;
  // PID alive — verify identity to catch PID reuse
  if (!record.st) return true; // no start time recorded → trust PID liveness (degraded)
  const currentSt = getProcessStartTime(record.pid);
  if (currentSt === null) return true; // can't query → trust PID liveness (degraded)
  return currentSt === record.st;
}

// --spawn-detached: re-spawn as a fully detached process with single-flight lock.
// Used by the SessionStart hook so bash returns at once on every platform.
// S0 fix: atomic lock via O_CREAT|O_EXCL ('wx') prevents duplicate sweepers.
// S1 fix: child stdio → log file; SELFCLEAN_DETACHED env triggers exit handler.
// S1 lock-recovery fix: JSON record {pid, st (start time)} — complete-or-absent
// property via immediate write; identity-checked reclaim defeats torn locks and
// PID reuse. A reader never treats empty/corrupt/misidentified as "validly held".
if (args[0] === '--spawn-detached') {
  const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  const stateDir = resolve(repoRoot, '.claude/state/selfclean');
  const lockFile = resolve(stateDir, 'sweep.lock');
  const logPath = resolve(stateDir, 'sweep-detached.log');

  mkdirSync(stateDir, { recursive: true });

  // Pre-compute start time BEFORE lock attempt so write after O_EXCL is immediate
  const parentSt = getProcessStartTime(process.pid);

  // Acquire single-flight lock — 'wx' = O_WRONLY|O_CREAT|O_EXCL (atomic)
  let lockFd;
  try {
    lockFd = openSync(lockFile, 'wx');
  } catch (e) {
    if (e.code !== 'EEXIST') process.exit(0);
    // Lock exists — validate via identity-checked record
    const record = parseLockRecord(lockFile);
    if (isLockValid(record)) process.exit(0); // genuinely held
    // Stale/torn/reused — reclaim
    try { unlinkSync(lockFile); } catch { process.exit(0); }
    try { lockFd = openSync(lockFile, 'wx'); } catch { process.exit(0); }
  }

  // Write complete record immediately (no delay — start time pre-computed)
  writeSync(lockFd, JSON.stringify({ pid: process.pid, st: parentSt }));
  closeSync(lockFd);

  // Spawn sweeper detached — stdio to log file (S1: failures visible on disk)
  const logFd = openSync(logPath, 'a');
  const selfPath = fileURLToPath(import.meta.url);
  const child = spawn(process.execPath, [selfPath, ...args.slice(1)], {
    detached: true,
    stdio: ['ignore', logFd, logFd],
    windowsHide: true,
    env: { ...process.env, SELFCLEAN_DETACHED: '1' },
  });
  closeSync(logFd);

  // Overwrite lock with child's identity (the long-lived process for liveness checks).
  // Atomic: write temp then rename — no torn state if parent dies mid-operation.
  const childSt = getProcessStartTime(child.pid);
  const tmpLockParent = lockFile + `.tmp.${process.pid}`;
  writeFileSync(tmpLockParent, JSON.stringify({ pid: child.pid, st: childSt }));
  renameSync(tmpLockParent, lockFile);

  child.unref();
  process.exit(0);
}

const REPO_ROOT = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
process.chdir(REPO_ROOT);

const CONFIG_PATH = resolve(REPO_ROOT, '.claude/selfclean-config.json');
const STATE_DIR = resolve(REPO_ROOT, '.claude/state/selfclean');
const QUARANTINE_DIR = resolve(STATE_DIR, 'quarantine');
const THROTTLE_FILE = resolve(STATE_DIR, 'last-sweep.json');
const GATE_FIRES_LOG = resolve(REPO_ROOT, '.claude/state/gate-fires.log');
const LOCK_FILE = resolve(STATE_DIR, 'sweep.lock');
const FAILURE_MARKER = resolve(STATE_DIR, 'sweep-failure.json');

mkdirSync(STATE_DIR, { recursive: true });
mkdirSync(QUARANTINE_DIR, { recursive: true });

// Detached-child: register own PID + start time in lock, set up failure visibility on exit
if (process.env.SELFCLEAN_DETACHED === '1') {
  try {
    // Atomic lock update: pre-compute identity, write temp, rename into place.
    const st = getProcessStartTime(process.pid);
    const tmpLockChild = LOCK_FILE + `.tmp.${process.pid}`;
    writeFileSync(tmpLockChild, JSON.stringify({ pid: process.pid, st }));
    renameSync(tmpLockChild, LOCK_FILE);
  } catch { /* fail-open */ }
  process.on('exit', (code) => {
    try {
      const record = parseLockRecord(LOCK_FILE);
      if (record && record.pid === process.pid) unlinkSync(LOCK_FILE);
    } catch { /* not our lock or already cleaned */ }
    if (code !== 0 && code !== null) {
      try {
        writeFileSync(FAILURE_MARKER, JSON.stringify({
          ts: new Date().toISOString(), exitCode: code, pid: process.pid,
        }, null, 2));
      } catch { /* fail-open */ }
    }
  });
}

if (args[0] === '--status') {
  doStatus();
  process.exit(0);
}
if (args[0] === '--restore') {
  doRestore(args[1]);
  process.exit(0);
}
if (args[0] === '--gc') {
  doGc(args.includes('--purge-all'));
  process.exit(0);
}

// Default: sweep mode
doSweep();
process.exit(0);

// --- STATUS ---
function doStatus() {
  const sweepDirs = readdirSync(QUARANTINE_DIR).filter(d => d.startsWith('sweep-'));
  if (sweepDirs.length === 0) {
    console.log('[selfclean:status] Quarantine is empty. No items held.');
    return;
  }
  let totalItems = 0, totalBytes = 0;
  for (const dir of sweepDirs) {
    const manifestPath = resolve(QUARANTINE_DIR, dir, 'manifest.jsonl');
    if (!existsSync(manifestPath)) continue;
    const lines = readFileSync(manifestPath, 'utf8').trim().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        totalItems++;
        totalBytes += entry.size || 0;
        console.log(`  ${entry.path} [${entry.rule_id}] ${entry.ts?.slice(0, 10) || '?'} (${entry.size}B)`);
      } catch { /* skip malformed */ }
    }
  }
  console.log(`\n[selfclean:status] ${totalItems} items held (${(totalBytes / 1024).toFixed(1)} KB) across ${sweepDirs.length} sweep(s).`);
}

// --- RESTORE ---
function doRestore(target) {
  if (!target) {
    console.error('[selfclean:restore] Usage: selfclean:restore -- <original-path | sweep-id>');
    process.exit(1);
  }
  const sweepDirs = readdirSync(QUARANTINE_DIR).filter(d => d.startsWith('sweep-'));
  let restored = 0;

  for (const dir of sweepDirs) {
    // Match by sweep-id
    if (dir === target) {
      restored += restoreEntireSweep(dir);
      continue;
    }
    // Match by original path
    const manifestPath = resolve(QUARANTINE_DIR, dir, 'manifest.jsonl');
    if (!existsSync(manifestPath)) continue;
    const lines = readFileSync(manifestPath, 'utf8').trim().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.path === target || entry.path === target.replace(/\\/g, '/')) {
          const src = resolve(QUARANTINE_DIR, dir, entry.path);
          const dest = resolve(REPO_ROOT, entry.path);
          if (existsSync(src)) {
            mkdirSync(dirname(dest), { recursive: true });
            renameSync(src, dest);
            restored++;
            console.log(`[selfclean:restore] Restored: ${entry.path}`);
            // Telemetry
            try {
              appendFileSync(GATE_FIRES_LOG, `selfclean-${entry.rule_id}, ${new Date().toISOString()}, restore, ${entry.path}\n`);
            } catch { /* fail-open */ }
          }
        }
      } catch { /* skip */ }
    }
  }

  if (restored === 0) {
    console.error(`[selfclean:restore] No quarantined item found matching: ${target}`);
    process.exit(1);
  }
  console.log(`[selfclean:restore] Restored ${restored} item(s).`);
}

function restoreEntireSweep(sweepDir) {
  const manifestPath = resolve(QUARANTINE_DIR, sweepDir, 'manifest.jsonl');
  if (!existsSync(manifestPath)) return 0;
  const lines = readFileSync(manifestPath, 'utf8').trim().split('\n').filter(Boolean);
  let count = 0;
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const src = resolve(QUARANTINE_DIR, sweepDir, entry.path);
      const dest = resolve(REPO_ROOT, entry.path);
      if (existsSync(src)) {
        mkdirSync(dirname(dest), { recursive: true });
        renameSync(src, dest);
        count++;
      }
    } catch { /* skip */ }
  }
  return count;
}

// --- GC ---
function doGc(purgeAll) {
  let config;
  try { config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')); } catch { config = {}; }
  const ttlMs = (config.quarantine_ttl_days || 30) * 86400000;
  const now = Date.now();
  const ruleMap = {};
  for (const r of config.rules || []) ruleMap[r.id] = r;

  const sweepDirs = readdirSync(QUARANTINE_DIR).filter(d => d.startsWith('sweep-'));
  let purged = 0;

  for (const dir of sweepDirs) {
    const manifestPath = resolve(QUARANTINE_DIR, dir, 'manifest.jsonl');
    if (!existsSync(manifestPath)) continue;
    const lines = readFileSync(manifestPath, 'utf8').trim().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        const entryAge = now - new Date(entry.ts).getTime();
        if (entryAge < ttlMs) continue; // not expired
        const rule = ruleMap[entry.rule_id];
        if (!purgeAll && !(rule && rule.regenerable)) continue; // non-regenerable requires --purge-all
        const itemPath = resolve(QUARANTINE_DIR, dir, entry.path);
        if (existsSync(itemPath)) {
          unlinkSync(itemPath);
          purged++;
          try {
            appendFileSync(GATE_FIRES_LOG, `selfclean-${entry.rule_id}, ${new Date().toISOString()}, gc, ${entry.path}\n`);
          } catch { /* fail-open */ }
        }
      } catch { /* skip */ }
    }
  }
  console.log(`[selfclean:gc] Purged ${purged} expired item(s).`);
}

// --- SWEEP ---
function doSweep() {
  // Load config
  let config;
  try {
    config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.error('[selfclean] Cannot read config:', e.message);
    return;
  }

  const AGE_GATE_MS = (config.age_gate_days || 7) * 86400000;
  const NOW = Date.now();
  const SWEEP_ID = `sweep-${new Date().toISOString().slice(0, 10)}-${NOW.toString(36)}`;

  // --- Helpers ---
  function sha256file(filePath) {
    try {
      const content = readFileSync(filePath);
      return createHash('sha256').update(content).digest('hex');
    } catch { return 'unreadable'; }
  }

  function matchesGlob(filePath, pattern) {
    const regexStr = pattern
      .replace(/\\/g, '/')
      .replace(/\*\*/g, '{{GLOBSTAR}}')
      .replace(/\*/g, '[^/]*')
      .replace(/\{\{GLOBSTAR\}\}/g, '.*')
      .replace(/\?/g, '[^/]');
    const re = new RegExp('^' + regexStr + '$', 'i');
    return re.test(filePath.replace(/\\/g, '/'));
  }

  function isNeverSweep(filePath) {
    const normalized = filePath.replace(/\\/g, '/');
    for (const pattern of config.never_sweep || []) {
      if (matchesGlob(normalized, pattern)) return true;
    }
    return false;
  }

  // --- Enumerate candidates ---
  let trackedSet, untrackedList, ignoredList;
  try {
    const trackedRaw = execSync('git ls-files -z', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    trackedSet = new Set(trackedRaw.split('\0').filter(Boolean));
  } catch { trackedSet = new Set(); }

  try {
    const untrackedRaw = execSync('git ls-files -z --others --exclude-standard', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    untrackedList = untrackedRaw.split('\0').filter(Boolean);
  } catch { untrackedList = []; }

  try {
    const ignoredRaw = execSync('git ls-files -z --others --ignored --exclude-standard', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    ignoredList = ignoredRaw.split('\0').filter(f => f && !f.startsWith('node_modules/') && !f.startsWith('.browsers/') && !f.startsWith('.claude/state/selfclean/quarantine/'));
  } catch { ignoredList = []; }

  const candidates = [...untrackedList, ...ignoredList];

  // --- Evaluate rules ---
  const findings = [];

  for (const filePath of candidates) {
    if (isNeverSweep(filePath)) continue;

    let fileStat;
    try {
      fileStat = statSync(resolve(REPO_ROOT, filePath));
    } catch { continue; }

    const fileAge = NOW - fileStat.mtimeMs;
    const fileStratum = trackedSet.has(filePath) ? 'tracked' : (untrackedList.includes(filePath) ? 'untracked' : 'ignored');
    if (fileStratum === 'tracked') continue;

    for (const rule of config.rules || []) {
      if (!rule.strata.includes(fileStratum)) continue;
      const ruleAgeGate = (rule.age_gate_days_override || config.age_gate_days || 7) * 86400000;
      if (fileAge < ruleAgeGate) continue;

      if (rule.predicate.type === 'glob') {
        const matched = rule.predicate.patterns.some(p => matchesGlob(filePath, p));
        if (!matched) continue;
      } else {
        continue;
      }

      findings.push({
        file: filePath,
        rule_id: rule.id,
        mode: rule.mode,
        stratum: fileStratum,
        sha256: sha256file(resolve(REPO_ROOT, filePath)),
        size: fileStat.size,
        mtime: new Date(fileStat.mtimeMs).toISOString(),
      });
      break;
    }
  }

  // --- Act on findings ---
  const quarantined = [];
  const announced = [];

  for (const f of findings) {
    if (f.mode === 'quarantine') {
      const destDir = resolve(QUARANTINE_DIR, SWEEP_ID, dirname(f.file));
      const destPath = resolve(QUARANTINE_DIR, SWEEP_ID, f.file);
      try {
        mkdirSync(destDir, { recursive: true });
        renameSync(resolve(REPO_ROOT, f.file), destPath);
        quarantined.push(f);
      } catch (e) {
        f.error = e.message;
        announced.push(f);
      }
    } else {
      announced.push(f);
    }
  }

  // --- Porcelain self-test ---
  try {
    const porcelain = execSync('git status --porcelain', { encoding: 'utf8' });
    const modifiedTracked = porcelain.split('\n').filter(l => l.match(/^.M/) || l.match(/^M/));
    if (modifiedTracked.length > 0 && quarantined.length > 0) {
      for (const q of quarantined) {
        const src = resolve(QUARANTINE_DIR, SWEEP_ID, q.file);
        const dest = resolve(REPO_ROOT, q.file);
        try { mkdirSync(dirname(dest), { recursive: true }); renameSync(src, dest); } catch { /* best effort */ }
      }
      console.error('[selfclean] ABORT: tracked files modified — all quarantine reversed');
      return;
    }
  } catch { /* fail-open */ }

  // --- Write manifest ---
  if (quarantined.length > 0) {
    const manifestPath = resolve(QUARANTINE_DIR, SWEEP_ID, 'manifest.jsonl');
    const lines = quarantined.map(q => JSON.stringify({
      path: q.file, rule_id: q.rule_id, sha256: q.sha256, size: q.size,
      mtime: q.mtime, stratum: q.stratum, sweep_id: SWEEP_ID, ts: new Date().toISOString(),
    }));
    writeFileSync(manifestPath, lines.join('\n') + '\n');
  }

  // --- Write sweep report ---
  const reportDate = new Date().toISOString().slice(0, 10);
  const reportPath = resolve(STATE_DIR, `sweep-${reportDate}.md`);
  const latestPath = resolve(STATE_DIR, 'sweep-latest.md');
  const totalBytes = findings.reduce((sum, f) => sum + f.size, 0);

  const reportLines = [
    `# Self-Clean Sweep Report — ${new Date().toISOString()}`,
    '', `**Sweep ID**: ${SWEEP_ID}`,
    `**Mode**: ${quarantined.length > 0 ? 'quarantine+announce' : 'announce'} (all rules currently in announce = report-only)`,
    `**Findings**: ${findings.length} items (${announced.length} announced, ${quarantined.length} quarantined)`,
    `**Total size**: ${(totalBytes / 1024).toFixed(1)} KB`,
    '', '## Denominator',
    `- Tracked files: ${trackedSet.size}`,
    `- Untracked (not ignored): ${untrackedList.length}`,
    `- Ignored (excluding node_modules/.browsers/quarantine): ${ignoredList.length}`,
    `- Candidates evaluated: ${candidates.length}`,
    '', '## Findings by Rule', '',
  ];

  const byRule = {};
  for (const f of findings) { if (!byRule[f.rule_id]) byRule[f.rule_id] = []; byRule[f.rule_id].push(f); }

  for (const [ruleId, items] of Object.entries(byRule)) {
    const ruleBytes = items.reduce((s, i) => s + i.size, 0);
    reportLines.push(`### ${ruleId} (${items.length} items, ${(ruleBytes / 1024).toFixed(1)} KB)`, '');
    for (const item of items.slice(0, 20)) {
      reportLines.push(`- \`${item.file}\` [${item.stratum}] ${item.mode} (${item.size}B, mtime ${item.mtime.slice(0, 10)})`);
    }
    if (items.length > 20) reportLines.push(`- ... and ${items.length - 20} more`);
    reportLines.push('');
  }

  if (findings.length === 0) { reportLines.push('No items matched any rule (clean sweep).', ''); }

  const report = reportLines.join('\n');
  writeFileSync(reportPath, report);
  writeFileSync(latestPath, report);

  // --- Fire telemetry ---
  try {
    mkdirSync(dirname(GATE_FIRES_LOG), { recursive: true });
    const telemetryLines = findings.map(f =>
      `selfclean-${f.rule_id}, ${new Date().toISOString()}, ${f.mode}, ${f.file}`
    ).join('\n');
    if (telemetryLines) appendFileSync(GATE_FIRES_LOG, telemetryLines + '\n');
  } catch { /* fail-open */ }

  // --- Update throttle ---
  writeFileSync(THROTTLE_FILE, JSON.stringify({ last_sweep_ts: new Date().toISOString(), sweep_id: SWEEP_ID }, null, 2));

  console.log(`[selfclean] Sweep complete: ${announced.length} announced, ${quarantined.length} quarantined (${(totalBytes / 1024).toFixed(1)} KB total)`);
  console.log(`[selfclean] Report: ${relative(REPO_ROOT, reportPath)}`);
}