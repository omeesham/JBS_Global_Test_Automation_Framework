#!/usr/bin/env node
// check-client-surface-size.mjs — Stop-hook lib for client surface accumulation reporting.
//
// Reads .claude/retention-policy.json, measures each listed directory once,
// compares against growth budget using persisted history, and prints a report
// for any over-budget or unpoliced directories.
//
// MODES:
//   --validate    Stop hook. Measure, compare, report. Always exits 0.
//   --self-test   Synthetic fixtures in temp dir. Exits 0 on pass, 1 on fail.
//                 Exercises real over-budget branch with synthetic history.
//
// MODE KNOB (.claude/guardrail-config.json → client_surface_size_mode):
//   off      — gate disabled (fail-open)
//   announce — measure + report findings (default)
//   (no deny — a Stop hook cannot veto session end per LR-060)
//   ENV OVERRIDE: CLIENT_SURFACE_SIZE_MODE
//
// DETECTION LOGIC:
//   - For each policy entry with contentClass === 'dead-output':
//       measure bytes + file count
//       compare growthRatioPerSession vs last reading in history JSONL
//       if ratio exceeded AND previous reading exists → report as over-budget
//       if no previous reading → report measurement with "baseline: none"
//   - Directories under clients/<id>/ not in the policy → report as finding
//   - Directories in policy but not on disk → skip silently
//
// HISTORY: .claude/state/client-surface-sizes.jsonl
//   One JSON line per run: { ts, path, bytes, fileCount }
//   Growth ratio = currentBytes / previousBytes
//
// FAIL-OPEN: any exception → log to .claude/state/hook-failures.log, exit 0.
//
// TELEMETRY: on announce verdict, calls fireTelemetry('client-surface-size', 'announce', path)
//
// Sev=S1 (silent accumulation survives undetected, 2 GB over 6 months).
// Graduating incident: clients/encore purged 2.2 GB → 175 MB on 2026-07-31,
//   rebounded to 256 MB within two hours (reports/ alone = 86 MB).
// Rule: PLAN_CLIENT_SURFACE_PURGE_AND_WRITE_FENCE Phase 4 Arm B3.
// Companion: .claude/hooks/client-surface-size-gate.sh

import { readFileSync, writeFileSync, appendFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const STATE_DIR = resolve(__dirname, '..', '..', 'state');
const POLICY_PATH = resolve(__dirname, '..', '..', 'retention-policy.json');
const GUARDRAIL_CONFIG_PATH = resolve(__dirname, '..', '..', 'guardrail-config.json');
const HISTORY_FILE = join(STATE_DIR, 'client-surface-sizes.jsonl');
const FAILURES_LOG = join(STATE_DIR, 'hook-failures.log');

// --- telemetry import (fail-open if missing) ---
let fireTelemetry = () => {};
try {
  const utils = await import('./hook-utils.mjs');
  fireTelemetry = utils.fireTelemetry;
} catch { /* fail-open */ }

// --- mode resolution ---
function resolveMode(guardrailConfig) {
  const envVal = process.env.CLIENT_SURFACE_SIZE_MODE;
  if (envVal) return envVal.toLowerCase();
  try {
    const cfg = JSON.parse(readFileSync(guardrailConfig, 'utf8'));
    return (cfg.client_surface_size_mode || 'announce').toLowerCase();
  } catch { return 'announce'; }
}

// --- recursive size walker (no shell, works on Windows) ---
function measureDir(dirPath) {
  let bytes = 0;
  let fileCount = 0;
  function walk(p) {
    let entries;
    try { entries = readdirSync(p, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(p, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile()) {
        try {
          bytes += statSync(full).size;
          fileCount++;
        } catch { /* skip inaccessible */ }
      }
    }
  }
  walk(dirPath);
  return { bytes, fileCount };
}

// --- load JSONL history ---
function loadHistory(historyFile) {
  if (!existsSync(historyFile)) return [];
  const lines = readFileSync(historyFile, 'utf8').split('\n').filter(l => l.trim());
  return lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

// --- get last reading for a path ---
function lastReading(history, absPath) {
  const norm = absPath.replace(/\\/g, '/');
  const matches = history.filter(r => (r.path || '').replace(/\\/g, '/') === norm);
  if (!matches.length) return null;
  return matches[matches.length - 1];
}

// --- append measurement to history ---
function appendHistory(historyFile, entry) {
  try {
    mkdirSync(dirname(historyFile), { recursive: true });
    appendFileSync(historyFile, JSON.stringify(entry) + '\n');
  } catch { /* fail-open */ }
}

// --- discover top-level client dirs ---
function discoverClientDirs(repoRoot) {
  const clientsDir = join(repoRoot, 'clients');
  if (!existsSync(clientsDir)) return [];
  const clients = readdirSync(clientsDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
  const result = [];
  for (const client of clients) {
    const clientPath = join(clientsDir, client);
    const entries = readdirSync(clientPath, { withFileTypes: true })
      .filter(e => e.isDirectory());
    for (const e of entries) {
      result.push(`clients/${client}/${e.name}`);
    }
  }
  return result;
}

// --- main validation logic ---
function runValidate(opts = {}) {
  const {
    policyPath = POLICY_PATH,
    guardrailConfigPath = GUARDRAIL_CONFIG_PATH,
    historyFile = HISTORY_FILE,
    repoRoot = REPO_ROOT,
  } = opts;

  const mode = resolveMode(guardrailConfigPath);
  if (mode === 'off') return { lines: [], findings: 0 };

  let policy;
  try {
    policy = JSON.parse(readFileSync(policyPath, 'utf8'));
  } catch (e) {
    return { lines: [`[client-surface-size] WARN: could not read policy: ${e.message}`], findings: 0 };
  }

  const history = loadHistory(historyFile);
  const now = new Date().toISOString();
  const outputLines = [];
  let findings = 0;

  // Build set of policy paths (normalised)
  const policyPaths = new Set(
    (policy.directories || []).map(d => d.path.replace(/\\/g, '/'))
  );

  // Group policy entries by path (a path may have multiple contentClass entries)
  const byPath = new Map();
  for (const entry of (policy.directories || [])) {
    const k = entry.path.replace(/\\/g, '/');
    if (!byPath.has(k)) byPath.set(k, []);
    byPath.get(k).push(entry);
  }

  // Measure each unique path
  for (const [policyRelPath, entries] of byPath) {
    const absPath = join(repoRoot, policyRelPath);
    if (!existsSync(absPath)) continue;

    // Only measure for dead-output entries (regenerable-cache has no budget)
    const deadEntries = entries.filter(e => e.contentClass === 'dead-output');
    if (!deadEntries.length) continue;

    // Use the strictest budget among dead-output entries for this path
    const budgetRatios = deadEntries
      .map(e => e.budget && e.budget.growthRatioPerSession)
      .filter(r => r != null && typeof r === 'number');
    const budget = budgetRatios.length ? Math.min(...budgetRatios) : null;

    const { bytes, fileCount } = measureDir(absPath);
    const measurement = { ts: now, path: absPath.replace(/\\/g, '/'), bytes, fileCount };
    appendHistory(historyFile, measurement);

    const prev = lastReading(history, absPath);
    const sizeMB = (bytes / 1024 / 1024).toFixed(1);

    if (!prev) {
      outputLines.push(`[client-surface-size] BASELINE ${policyRelPath}: ${sizeMB} MB, ${fileCount} files — baseline: none (first measurement)`);
    } else if (budget != null && prev.bytes > 0) {
      const ratio = bytes / prev.bytes;
      if (ratio > budget) {
        findings++;
        const prevMB = (prev.bytes / 1024 / 1024).toFixed(1);
        const growthPct = ((ratio - 1) * 100).toFixed(0);
        outputLines.push(
          `[client-surface-size] OVER-BUDGET ${policyRelPath}: ${sizeMB} MB (${fileCount} files) — ` +
          `previous: ${prevMB} MB (${prev.fileCount} files) at ${prev.ts} — ` +
          `growth ratio: ${ratio.toFixed(2)}x (budget: ${budget}x, +${growthPct}%)`
        );
        fireTelemetry('client-surface-size', 'announce', policyRelPath);
      }
    }
  }

  // Unpoliced directories check
  const discoveredDirs = discoverClientDirs(repoRoot);
  for (const relDir of discoveredDirs) {
    const norm = relDir.replace(/\\/g, '/');
    if (!policyPaths.has(norm)) {
      findings++;
      outputLines.push(`[client-surface-size] UNPOLICED ${relDir} — present under clients/ but absent from retention-policy.json`);
      fireTelemetry('client-surface-size', 'announce', relDir);
    }
  }

  return { lines: outputLines, findings };
}

// --- self-test ---
function runSelfTest() {
  let passed = 0;
  let failed = 0;
  const errors = [];

  const tmpDir = mkdtempSync(join(tmpdir(), 'css-selftest-'));
  try {
    // Set up synthetic repo structure
    const syntheticRoot = join(tmpDir, 'repo');
    const clientDir = join(syntheticRoot, 'clients', 'test-client', 'reports');
    const unpoliced = join(syntheticRoot, 'clients', 'test-client', 'unpoliced-dir');
    mkdirSync(clientDir, { recursive: true });
    mkdirSync(unpoliced, { recursive: true });

    // Write synthetic files to measure
    for (let i = 0; i < 5; i++) {
      writeFileSync(join(clientDir, `result-${i}.json`), 'x'.repeat(1024 * 1024)); // 1 MB each
    }
    writeFileSync(join(unpoliced, 'stray.txt'), 'data');

    // Synthetic policy
    const syntheticPolicy = {
      version: 1,
      directories: [
        {
          path: 'clients/test-client/reports',
          contentClass: 'dead-output',
          retention: { maxAgeDays: 7 },
          budget: { growthRatioPerSession: 1.5 },
          rationale: 'self-test synthetic entry',
          owner: 'OWNER'
        }
      ]
    };
    const policyFile = join(tmpDir, 'retention-policy.json');
    writeFileSync(policyFile, JSON.stringify(syntheticPolicy));

    // Synthetic guardrail config
    const configFile = join(tmpDir, 'guardrail-config.json');
    writeFileSync(configFile, JSON.stringify({ client_surface_size_mode: 'announce' }));

    const historyFile = join(tmpDir, 'history.jsonl');

    // --- TEST 1: first run — baseline (no previous reading) ---
    const run1 = runValidate({
      policyPath: policyFile,
      guardrailConfigPath: configFile,
      historyFile,
      repoRoot: syntheticRoot,
    });

    const hasBaseline = run1.lines.some(l => l.includes('BASELINE') && l.includes('baseline: none'));
    if (hasBaseline) {
      passed++;
      process.stdout.write('[PASS] test-1: first run reports baseline:none\n');
    } else {
      failed++;
      errors.push('test-1: expected BASELINE line with "baseline: none", got: ' + JSON.stringify(run1.lines));
    }

    // Unpoliced dir check
    const hasUnpoliced = run1.lines.some(l => l.includes('UNPOLICED') && l.includes('unpoliced-dir'));
    if (hasUnpoliced) {
      passed++;
      process.stdout.write('[PASS] test-2: unpoliced directory detected\n');
    } else {
      failed++;
      errors.push('test-2: expected UNPOLICED line for unpoliced-dir, got: ' + JSON.stringify(run1.lines));
    }

    // --- TEST 3: second run — simulate growth by adding more files to trigger over-budget ---
    // Add files to grow to 10 MB (was 5 MB baseline), ratio = 2.0 > budget 1.5
    for (let i = 5; i < 15; i++) {
      writeFileSync(join(clientDir, `result-${i}.json`), 'x'.repeat(1024 * 1024));
    }

    const run2 = runValidate({
      policyPath: policyFile,
      guardrailConfigPath: configFile,
      historyFile,
      repoRoot: syntheticRoot,
    });

    const hasOverBudget = run2.lines.some(l => l.includes('OVER-BUDGET'));
    if (hasOverBudget) {
      passed++;
      process.stdout.write('[PASS] test-3: over-budget branch fired\n');
      // Print the over-budget line for proof
      const obLine = run2.lines.find(l => l.includes('OVER-BUDGET'));
      process.stdout.write(`       ${obLine}\n`);
    } else {
      failed++;
      errors.push('test-3: expected OVER-BUDGET line but got: ' + JSON.stringify(run2.lines));
    }

    // --- TEST 4: off mode — no output ---
    const offConfig = join(tmpDir, 'guardrail-off.json');
    writeFileSync(offConfig, JSON.stringify({ client_surface_size_mode: 'off' }));
    const run3 = runValidate({
      policyPath: policyFile,
      guardrailConfigPath: offConfig,
      historyFile,
      repoRoot: syntheticRoot,
    });
    if (run3.lines.length === 0 && run3.findings === 0) {
      passed++;
      process.stdout.write('[PASS] test-4: off mode produces no output\n');
    } else {
      failed++;
      errors.push('test-4: off mode should produce no output, got: ' + JSON.stringify(run3.lines));
    }

  } finally {
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }

  if (errors.length) {
    for (const e of errors) process.stderr.write(`[FAIL] ${e}\n`);
  }
  process.stdout.write(`\nSelf-test: ${passed} passed, ${failed} failed\n`);
  return failed === 0 ? 0 : 1;
}

// --- entrypoint ---
const mode = process.argv[2];

function logFailure(msg) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(FAILURES_LOG, `${new Date().toISOString()} check-client-surface-size.mjs: ${msg}\n`);
  } catch { /* swallow */ }
}

if (mode === '--self-test') {
  try {
    const exitCode = runSelfTest();
    process.exit(exitCode);
  } catch (e) {
    process.stderr.write(`Self-test error: ${e.message}\n`);
    process.exit(1);
  }
} else if (mode === '--validate') {
  try {
    // Read stdin but only to not crash on it
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    let stdinData = '';
    process.stdin.on('data', d => { stdinData += d; });
    process.stdin.on('end', () => {
      try {
        // Check recursion guard
        if (stdinData && stdinData.includes('"stop_hook_active"') && stdinData.includes('true')) {
          process.exit(0);
        }
        const result = runValidate();
        for (const line of result.lines) {
          process.stdout.write(line + '\n');
        }
        process.exit(0);
      } catch (e) {
        logFailure(`validate error: ${e.message}`);
        process.exit(0);
      }
    });
  } catch (e) {
    logFailure(`validate setup error: ${e.message}`);
    process.exit(0);
  }
} else {
  // No mode — fail-open
  logFailure(`missing mode argv; allowed: --validate, --self-test`);
  process.exit(0);
}
