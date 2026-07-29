#!/usr/bin/env node
/**
 * check-agent-provenance.mjs — Agent-tree provenance gate
 * Sev: S1 — dispatcher integrity work, 2026-07-25 — two seats could be
 *   the same vendor and nothing detected it.
 * Gate behaviour: announce
 * Fire telemetry → .claude/state/gate-fires.log
 */

import { readFileSync, readdirSync, existsSync, appendFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const REPO_ROOT = resolve(__dirname, '..');
const UA_WORKER_DIR = join(REPO_ROOT, '.claude', 'state', 'ua-worker');
const GATE_FIRES_LOG = join(REPO_ROOT, '.claude', 'state', 'gate-fires.log');

// ---------------------------------------------------------------------------
// Build-class allowlist — only these work_types qualify as "authored the code"
// Any other parent work_type → ASSUMED (a review can't prove independence
// against a probe/walk/draft/research parent — those don't produce artifacts).
// ---------------------------------------------------------------------------
const BUILD_CLASS = new Set(['build']);

// ---------------------------------------------------------------------------
// Normalise work_type — trim + lowercase; null/undefined/non-string → null
// ---------------------------------------------------------------------------
function normalizeWorkType(wt) {
  if (wt === null || wt === undefined) return null;
  if (typeof wt !== 'string') return null;
  const trimmed = wt.trim().toLowerCase();
  return trimmed || null;
}

// ---------------------------------------------------------------------------
// Vendor derivation — prefix-based, UNKNOWN for unrecognised prefixes
// ---------------------------------------------------------------------------
function deriveVendor(model) {
  if (!model || typeof model !== 'string') return 'UNKNOWN';
  if (model.startsWith('claude-')) return 'Anthropic';
  if (model.startsWith('gpt-')) return 'OpenAI';
  return 'UNKNOWN';
}

// ---------------------------------------------------------------------------
// Load runs from disk, optionally filtered by session_id
// ---------------------------------------------------------------------------
function loadRunsFromDisk(sessionFilter) {
  if (!existsSync(UA_WORKER_DIR)) {
    return { runs: [], errors: [`DIR_NOT_FOUND: ${UA_WORKER_DIR}`] };
  }

  let entries;
  try {
    entries = readdirSync(UA_WORKER_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name !== '.claude');
  } catch (err) {
    return { runs: [], errors: [`DIR_UNREADABLE: ${UA_WORKER_DIR}: ${err.message}`] };
  }

  const runs = [];
  const errors = [];

  for (const entry of entries) {
    const metaPath = join(UA_WORKER_DIR, entry.name, 'meta.json');
    if (!existsSync(metaPath)) {
      errors.push(`NO_META: ${entry.name}`);
      continue;
    }
    try {
      const raw = readFileSync(metaPath, 'utf8');
      runs.push(JSON.parse(raw));
    } catch (err) {
      errors.push(`PARSE_ERROR: ${entry.name}/meta.json: ${err.message}`);
    }
  }

  if (sessionFilter) {
    const filtered = runs.filter(r => r.session_id === sessionFilter);
    return { runs: filtered, errors, totalBeforeFilter: runs.length };
  }

  return { runs, errors };
}

// ---------------------------------------------------------------------------
// Enrich runs with derived vendor field
// ---------------------------------------------------------------------------
function enrichRuns(runs) {
  return runs.map(r => ({
    ...r,
    vendor: deriveVendor(r.model),
    _norm_work_type: normalizeWorkType(r.work_type),
  }));
}

// ---------------------------------------------------------------------------
// Index runs by run_id for O(1) lookup
// ---------------------------------------------------------------------------
function indexById(runs) {
  const idx = {};
  for (const r of runs) {
    if (r.run_id) idx[r.run_id] = r;
  }
  return idx;
}

// ---------------------------------------------------------------------------
// PT1 — Tree enumeration
// ---------------------------------------------------------------------------
function checkPT1(runs) {
  const byVendor = {};
  const byModel = {};
  for (const r of runs) {
    byVendor[r.vendor] = (byVendor[r.vendor] || 0) + 1;
    const m = r.model || 'UNKNOWN';
    byModel[m] = (byModel[m] || 0) + 1;
  }

  return {
    rows: runs.map(r => ({
      run_id: r.run_id || '',
      model: r.model || '',
      vendor: r.vendor,
      work_type: r.work_type || '',
      dispatcher: r.dispatcher || '',
      parent_run_id: r.parent_run_id || '',
      depth: r.depth ?? '',
      ok: r.ok ?? '',
      exit_reason: r.exit_reason || '',
    })),
    byVendor,
    byModel,
  };
}

// ---------------------------------------------------------------------------
// PT2 — Independence basis
// ---------------------------------------------------------------------------
function checkPT2(runs, runIndex) {
  const reviewRuns = runs.filter(
    r => r._norm_work_type === 'review' || r._norm_work_type === 'verify',
  );

  // Flag runs with unclassifiable work_type (null after normalization)
  const unclassifiable = runs.filter(r => r._norm_work_type === null);

  const findings = [];

  for (const rev of reviewRuns) {
    let authorRun = null;
    let resolution = '';

    // Follow parent chain — must reach a build-class run (allowlist, not exclusion).
    if (rev.parent_run_id) {
      const visited = new Set();
      let cursor = rev.parent_run_id;

      while (cursor && runIndex[cursor] && !visited.has(cursor)) {
        visited.add(cursor);
        const candidate = runIndex[cursor];
        if (BUILD_CLASS.has(candidate._norm_work_type)) {
          authorRun = candidate;
          resolution = 'parent_run_id';
          break;
        }
        // Non-build-class parent: keep walking if it has its own parent
        cursor = candidate.parent_run_id;
      }

      if (!authorRun) {
        if (cursor && visited.has(cursor)) {
          resolution = 'cycle';
        } else if (visited.size > 0) {
          resolution = 'non_build_parent';
        }
      }
    }

    // Fallback: nearest build in same session (only if parent chain didn't resolve)
    if (!authorRun && !resolution && rev.session_id) {
      const candidates = runs
        .filter(
          r =>
            r.session_id === rev.session_id &&
            BUILD_CLASS.has(r._norm_work_type) &&
            r.run_id !== rev.run_id &&
            r.ts && rev.ts && r.ts < rev.ts,
        )
        .sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
      if (candidates.length > 0) {
        authorRun = candidates[0];
        resolution = 'nearest_build';
      }
    }

    let status;
    if (resolution === 'cycle' || resolution === 'non_build_parent') {
      status = 'ASSUMED';
    } else if (!authorRun) {
      status = 'ASSUMED';
    } else if (rev.vendor === 'UNKNOWN' || authorRun.vendor === 'UNKNOWN') {
      status = 'ASSUMED';
    } else if (rev.vendor !== authorRun.vendor) {
      status = 'INDEPENDENT';
    } else {
      status = 'SELF_REVIEW';
    }

    findings.push({
      reviewer_run_id: rev.run_id,
      reviewer_model: rev.model || '',
      reviewer_vendor: rev.vendor,
      author_run_id: authorRun ? authorRun.run_id : 'UNRESOLVED',
      author_model: authorRun ? (authorRun.model || '') : 'N/A',
      author_vendor: authorRun ? authorRun.vendor : 'UNRESOLVED',
      resolution: resolution || 'none',
      status,
    });
  }

  return { findings, unclassifiable };
}

// ---------------------------------------------------------------------------
// PT3 — Depth / undeclared spawn (orphan detection)
// ---------------------------------------------------------------------------
function checkPT3(runs, runIndex) {
  let maxDepth = 0;
  const orphans = [];

  for (const run of runs) {
    if (typeof run.depth === 'number' && run.depth > maxDepth) {
      maxDepth = run.depth;
    }
    if (run.parent_run_id && !runIndex[run.parent_run_id]) {
      orphans.push({ run_id: run.run_id, missing_parent: run.parent_run_id });
    }
  }

  return { maxDepth, orphans };
}

// ---------------------------------------------------------------------------
// PT4 — Teaming detection (single-vendor sessions)
// ---------------------------------------------------------------------------
function checkPT4(runs) {
  const sessions = {};
  let skippedCount = 0;
  const ungroupableRunIds = [];
  for (const run of runs) {
    if (!run.session_id) {
      skippedCount++;
      ungroupableRunIds.push(run.run_id || '(no id)');
      continue;
    }
    if (!sessions[run.session_id]) sessions[run.session_id] = [];
    sessions[run.session_id].push(run);
  }

  const findings = [];
  for (const [sid, sessionRuns] of Object.entries(sessions)) {
    if (sessionRuns.length <= 1) continue;
    const vendors = sessionRuns.map(r => r.vendor);
    const hasUnknown = vendors.includes('UNKNOWN');
    const knownVendors = new Set(vendors.filter(v => v !== 'UNKNOWN'));
    if (!hasUnknown && knownVendors.size === 1) {
      findings.push({
        session_id: sid,
        vendor: [...knownVendors][0],
        run_count: sessionRuns.length,
        run_ids: sessionRuns.map(r => r.run_id),
      });
    }
  }

  const groupableCount = runs.length - skippedCount;
  // Fully uncheckable: no runs can be grouped but there are runs to check
  const fullyUncheckable = groupableCount === 0 && runs.length > 1;
  // Partially uncheckable: some runs lack session_id in a multi-run set
  const partiallyUncheckable = skippedCount > 0 && groupableCount > 0 && runs.length > 1;

  return {
    findings, skippedCount, totalRuns: runs.length,
    uncheckable: fullyUncheckable,
    partiallyUncheckable,
    ungroupableRunIds,
  };
}

// ---------------------------------------------------------------------------
// PT5 — Argv hygiene (--model + --agent coexistence in dispatch CLI)
// ---------------------------------------------------------------------------
function checkPT5(runs) {
  // Step zero: check if dispatched argv is recorded in run metadata.
  // Empirical finding: meta.json has model + agent but NOT the CLI argv
  // (no argv/cli_args/dispatch_argv field). Process logs lack invocation line.
  const hasArgvField = runs.some(r => r.argv || r.cli_args || r.dispatch_argv);
  if (!hasArgvField) {
    return {
      uncheckable: true,
      reason: 'dispatch argv not recorded in run metadata — no argv/cli_args/dispatch_argv field in meta.json; process logs lack invocation line',
      findings: [],
    };
  }

  const findings = [];
  for (const run of runs) {
    const argv = run.argv || run.cli_args || run.dispatch_argv || '';
    if (typeof argv === 'string' && argv.includes('--model') && argv.includes('--agent')) {
      findings.push({
        run_id: run.run_id,
        agent: run.agent || '',
        model: run.model || '',
        argv_snippet: argv.substring(0, 120),
      });
    }
  }

  return { uncheckable: false, reason: null, findings };
}

// ---------------------------------------------------------------------------
// Table printer
// ---------------------------------------------------------------------------
function printTable(rows, columns) {
  if (rows.length === 0) return;
  const widths = {};
  for (const col of columns) {
    widths[col] = col.length;
    for (const row of rows) {
      const len = String(row[col] ?? '').length;
      if (len > widths[col]) widths[col] = len;
    }
    if (widths[col] > 44) widths[col] = 44;
  }

  console.log(columns.map(c => c.padEnd(widths[c])).join('  '));
  console.log(columns.map(c => '-'.repeat(widths[c])).join('  '));
  for (const row of rows) {
    console.log(
      columns
        .map(c => String(row[c] ?? '').padEnd(widths[c]).slice(0, widths[c]))
        .join('  '),
    );
  }
}

// ---------------------------------------------------------------------------
// Fire telemetry to gate-fires.log (§3.4 rent)
// ---------------------------------------------------------------------------
function fireTelemetry(verdict, target) {
  try {
    const line = `check-agent-provenance, ${new Date().toISOString()}, ${verdict}, ${target}\n`;
    appendFileSync(GATE_FIRES_LOG, line, 'utf8');
  } catch {
    // Best effort — do not crash on telemetry failure
  }
}

// ---------------------------------------------------------------------------
// Run all checks on an array of (raw) run objects, return structured results
// ---------------------------------------------------------------------------
function runAllChecks(rawRuns, loadErrors) {
  const runs = enrichRuns(rawRuns);
  const runIndex = indexById(runs);

  const pt1 = checkPT1(runs);
  const pt2Result = checkPT2(runs, runIndex);
  const pt2 = pt2Result.findings;
  const pt3 = checkPT3(runs, runIndex);
  const pt4 = checkPT4(runs);
  const pt5 = checkPT5(runs);

  const selfReviews = pt2.filter(f => f.status === 'SELF_REVIEW');
  const assumed = pt2.filter(f => f.status === 'ASSUMED');
  const independent = pt2.filter(f => f.status === 'INDEPENDENT');

  let exitCode = 0;
  if (selfReviews.length > 0 || assumed.length > 0) exitCode = 1;
  if (pt3.orphans.length > 0) exitCode = 1;
  if (pt4.findings.length > 0) exitCode = 1;
  if (pt4.uncheckable) exitCode = Math.max(exitCode, 2);
  if (pt4.partiallyUncheckable) exitCode = Math.max(exitCode, 2);
  if (pt5.findings.length > 0) exitCode = 1;
  if (pt2Result.unclassifiable.length > 0) exitCode = Math.max(exitCode, 2);
  if (loadErrors && loadErrors.length > 0) exitCode = Math.max(exitCode, 2);

  return { pt1, pt2, pt3, pt4, pt5, exitCode, selfReviews, assumed, independent, unclassifiable: pt2Result.unclassifiable };
}

// ---------------------------------------------------------------------------
// Print a full provenance report
// ---------------------------------------------------------------------------
function printReport(result, errors, label) {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`PROVENANCE REPORT: ${label}`);
  console.log('='.repeat(72));

  // PT1
  console.log(`\n--- PT1: Tree Enumeration (${result.pt1.rows.length} runs) ---`);
  if (result.pt1.rows.length > 0) {
    const PT1_COLS = [
      'run_id', 'model', 'vendor', 'work_type', 'dispatcher',
      'parent_run_id', 'depth', 'ok', 'exit_reason',
    ];
    const cap = 100;
    if (result.pt1.rows.length > cap) {
      printTable(result.pt1.rows.slice(0, cap), PT1_COLS);
      console.log(`  ... (showing first ${cap} of ${result.pt1.rows.length})`);
    } else {
      printTable(result.pt1.rows, PT1_COLS);
    }
    console.log(`\nVendor counts: ${JSON.stringify(result.pt1.byVendor)}`);
    console.log(`Model counts:  ${JSON.stringify(result.pt1.byModel)}`);
  } else {
    console.log('  (no runs)');
  }

  // PT2
  console.log('\n--- PT2: Independence Basis ---');
  const allReviews = result.pt2;
  if (allReviews.length > 0) {
    const PT2_COLS = [
      'reviewer_run_id', 'reviewer_vendor', 'author_run_id',
      'author_vendor', 'resolution', 'status',
    ];
    printTable(allReviews, PT2_COLS);
    console.log(
      `  INDEPENDENT: ${result.independent.length}` +
      `  SELF_REVIEW: ${result.selfReviews.length}` +
      `  ASSUMED: ${result.assumed.length}`,
    );
    if (result.selfReviews.length > 0) {
      console.log('  \u26a0 FINDING: Self-review — same vendor reviewed its own work:');
      for (const f of result.selfReviews) {
        console.log(
          `    reviewer=${f.reviewer_run_id} (${f.reviewer_vendor})` +
          ` reviewed author=${f.author_run_id} (${f.author_vendor})`,
        );
      }
    }
    if (result.assumed.length > 0) {
      console.log('  \u26a0 FINDING: ASSUMED independence — cannot verify:');
      for (const f of result.assumed) {
        console.log(
          `    reviewer=${f.reviewer_run_id} author=${f.author_run_id}` +
          ` resolution=${f.resolution}`,
        );
      }
    }
  } else {
    console.log('  (no review/verify runs to check)');
  }

  // PT3
  console.log('\n--- PT3: Depth / Undeclared Spawn ---');
  console.log(`  Max depth: ${result.pt3.maxDepth}`);
  if (result.pt3.orphans.length > 0) {
    console.log(
      `  \u26a0 FINDING: ${result.pt3.orphans.length} orphan(s)` +
      ' — parent_run_id not found on disk:',
    );
    for (const o of result.pt3.orphans) {
      console.log(`    run=${o.run_id} missing_parent=${o.missing_parent}`);
    }
  } else {
    console.log('  No orphans detected.');
  }

  // PT4
  console.log('\n--- PT4: Teaming Detection ---');
  if (result.pt4.uncheckable) {
    console.log(
      `  \u26a0 UNCHECKABLE: ${result.pt4.skippedCount}/${result.pt4.totalRuns}` +
      ' runs have null session_id \u2014 cannot group for teaming analysis.',
    );
  } else if (result.pt4.partiallyUncheckable) {
    console.log(
      `  \u26a0 PARTIALLY UNCHECKABLE: ${result.pt4.skippedCount}/${result.pt4.totalRuns}` +
      ` runs have null session_id [${result.pt4.ungroupableRunIds.join(', ')}]` +
      ' \u2014 those runs cannot be verified for teaming.',
    );
    if (result.pt4.findings.length > 0) {
      console.log(`  \u26a0 FINDING: ${result.pt4.findings.length} single-vendor session(s) in groupable subset:`);
      for (const f of result.pt4.findings) {
        const ids =
          f.run_ids.length > 5
            ? f.run_ids.slice(0, 5).join(', ') + '...'
            : f.run_ids.join(', ');
        console.log(
          `    session=${f.session_id} vendor=${f.vendor}` +
          ` runs=${f.run_count} ids=[${ids}]`,
        );
      }
    }
  } else if (result.pt4.findings.length > 0) {
    console.log(`  \u26a0 FINDING: ${result.pt4.findings.length} single-vendor session(s):`);
    for (const f of result.pt4.findings) {
      const ids =
        f.run_ids.length > 5
          ? f.run_ids.slice(0, 5).join(', ') + '...'
          : f.run_ids.join(', ');
      console.log(
        `    session=${f.session_id} vendor=${f.vendor}` +
        ` runs=${f.run_count} ids=[${ids}]`,
      );
    }
  } else {
    console.log('  No single-vendor sessions detected.');
  }

  // PT5
  console.log('\n--- PT5: Argv Hygiene (--model + --agent coexistence) ---');
  if (result.pt5.uncheckable) {
    console.log(`  \u26a0 UNCHECKABLE: ${result.pt5.reason}`);
  } else if (result.pt5.findings.length > 0) {
    console.log(`  \u26a0 FINDING: ${result.pt5.findings.length} run(s) with --model + --agent in argv:`);
    for (const f of result.pt5.findings) {
      console.log(`    run=${f.run_id} agent=${f.agent} model=${f.model}`);
    }
  } else {
    console.log('  No --model + --agent coexistence detected.');
  }

  // Load errors
  if (errors && errors.length > 0) {
    console.log('\n--- Load Errors ---');
    for (const e of errors) console.log(`  ${e}`);
  }

  // Unclassifiable work_type
  if (result.unclassifiable && result.unclassifiable.length > 0) {
    console.log('\n--- Unclassifiable Runs (missing/malformed work_type) ---');
    console.log(`  ⚠ UNCHECKABLE: ${result.unclassifiable.length} run(s) with null/empty/invalid work_type:`);
    for (const r of result.unclassifiable) {
      console.log(`    run=${r.run_id || '(no id)'} raw_work_type=${JSON.stringify(r.work_type)}`);
    }
  }

  // Verdict
  const verdictMap = { 0: 'CLEAN', 1: 'FINDING', 2: 'UNCHECKABLE' };
  console.log(
    `\n>>> VERDICT: ${verdictMap[result.exitCode] || 'UNKNOWN'} (exit ${result.exitCode})`,
  );
}

// ---------------------------------------------------------------------------
// Self-test — RED and GREEN synthetic cases
// ---------------------------------------------------------------------------
function selfTest() {
  console.log('=== SELF-TEST ===\n');
  let passed = 0;
  let failed = 0;
  const caseLog = [];

  function assert(caseName, colour, condition, detail) {
    if (condition) {
      console.log(`  \u2713 [${colour}] ${caseName}`);
      passed++;
      caseLog.push({ caseName, colour, pass: true });
    } else {
      console.log(`  \u2717 [${colour}] ${caseName}: ${detail}`);
      failed++;
      caseLog.push({ caseName, colour, pass: false, detail });
    }
  }

  // ---- RED 1: Self-review (same vendor reviews own work) ----
  console.log('[RED] Self-review detection:');
  try {
    const runs = [
      { run_id: 'sr-build', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: 'sess-r1', parent_run_id: null, depth: 0,
        ts: '2026-07-25T10:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'sr-review', model: 'claude-opus-4.6', work_type: 'review',
        session_id: 'sess-r1', parent_run_id: 'sr-build', depth: 0,
        ts: '2026-07-25T10:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
    assert('detected as SELF_REVIEW', 'RED', r.selfReviews.length > 0,
      `got ${r.selfReviews.length}`);
    assert('cites correct pair', 'RED',
      r.selfReviews.length > 0 &&
      r.selfReviews[0].reviewer_run_id === 'sr-review' &&
      r.selfReviews[0].author_run_id === 'sr-build',
      'wrong run ids');
    assert('both Anthropic', 'RED',
      r.selfReviews.length > 0 &&
      r.selfReviews[0].reviewer_vendor === 'Anthropic' &&
      r.selfReviews[0].author_vendor === 'Anthropic',
      'wrong vendors');
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED 2: Orphan (parent_run_id not on disk) ----
  console.log('\n[RED] Orphan detection:');
  try {
    const runs = [
      { run_id: 'orph-1', model: 'gpt-5.5', work_type: 'build',
        session_id: 'sess-r2', parent_run_id: 'GHOST-PARENT', depth: 1,
        ts: '2026-07-25T11:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
    assert('orphan detected', 'RED', r.pt3.orphans.length > 0,
      `got ${r.pt3.orphans.length}`);
    assert('cites missing parent', 'RED',
      r.pt3.orphans.length > 0 &&
      r.pt3.orphans[0].missing_parent === 'GHOST-PARENT',
      'wrong parent');
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED 3: Single-vendor session (teaming) ----
  console.log('\n[RED] Single-vendor session (teaming):');
  try {
    const runs = [
      { run_id: 'tm-build', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: 'sess-r3', parent_run_id: null, depth: 0,
        ts: '2026-07-25T12:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'tm-review', model: 'claude-opus-4.6', work_type: 'review',
        session_id: 'sess-r3', parent_run_id: 'tm-build', depth: 0,
        ts: '2026-07-25T12:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'tm-verify', model: 'claude-haiku-4.5', work_type: 'verify',
        session_id: 'sess-r3', parent_run_id: 'tm-build', depth: 0,
        ts: '2026-07-25T12:10:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
    assert('single-vendor session flagged', 'RED', r.pt4.findings.length > 0,
      `got ${r.pt4.findings.length}`);
    assert('cites session and vendor', 'RED',
      r.pt4.findings.length > 0 &&
      r.pt4.findings[0].vendor === 'Anthropic' &&
      r.pt4.findings[0].session_id === 'sess-r3',
      'wrong session/vendor');
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED 4: ASSUMED independence (unresolvable author) ----
  console.log('\n[RED] ASSUMED independence (unresolvable author):');
  try {
    const runs = [
      { run_id: 'asmd-rev', model: 'gpt-5.5', work_type: 'review',
        session_id: null, parent_run_id: null, depth: 0,
        ts: '2026-07-25T13:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
    assert('ASSUMED detected', 'RED', r.assumed.length > 0,
      `got ${r.assumed.length}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED 5: UNKNOWN vendor in review pair ----
  console.log('\n[RED] UNKNOWN vendor in review pair:');
  try {
    const runs = [
      { run_id: 'unk-build', model: 'gemini-2.5-pro', work_type: 'build',
        session_id: 'sess-r5', parent_run_id: null, depth: 0,
        ts: '2026-07-25T14:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'unk-review', model: 'gpt-5.5', work_type: 'review',
        session_id: 'sess-r5', parent_run_id: 'unk-build', depth: 0,
        ts: '2026-07-25T14:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('UNKNOWN vendor → ASSUMED', 'RED', r.assumed.length > 0,
      `got ${r.assumed.length}`);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- GREEN 1: Cross-vendor review (honest control) ----
  console.log('\n[GREEN] Cross-vendor review (honest control):');
  try {
    const runs = [
      { run_id: 'xv-build', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: 'sess-g1', parent_run_id: null, depth: 0,
        ts: '2026-07-25T15:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'xv-review', model: 'gpt-5.5', work_type: 'review',
        session_id: 'sess-g1', parent_run_id: 'xv-build', depth: 0,
        ts: '2026-07-25T15:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'xv-verify', model: 'gpt-5-mini', work_type: 'verify',
        session_id: 'sess-g1', parent_run_id: 'xv-build', depth: 0,
        ts: '2026-07-25T15:10:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('exits 0 (CLEAN)', 'GREEN', r.exitCode === 0,
      `expected 0, got ${r.exitCode}`);
    assert('no self-reviews', 'GREEN', r.selfReviews.length === 0,
      `got ${r.selfReviews.length}`);
    assert('no ASSUMED', 'GREEN', r.assumed.length === 0,
      `got ${r.assumed.length}`);
    assert('no orphans', 'GREEN', r.pt3.orphans.length === 0,
      `got ${r.pt3.orphans.length}`);
    assert('no teaming', 'GREEN', r.pt4.findings.length === 0,
      `got ${r.pt4.findings.length}`);
  } catch (err) {
    assert('did not crash', 'GREEN', false, err.message);
  }

  // ---- GREEN 2: Build-only (no reviews to check) ----
  console.log('\n[GREEN] Build-only (no reviews):');
  try {
    const runs = [
      { run_id: 'bo-1', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: null, parent_run_id: null, depth: 0,
        ts: '2026-07-25T16:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('exits 0', 'GREEN', r.exitCode === 0,
      `expected 0, got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'GREEN', false, err.message);
  }

  // ---- GREEN 3: Multi-vendor session ----
  console.log('\n[GREEN] Multi-vendor session (no teaming):');
  try {
    const runs = [
      { run_id: 'mv-1', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: 'sess-g3', parent_run_id: null, depth: 0,
        ts: '2026-07-25T17:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'mv-2', model: 'gpt-5.5', work_type: 'review',
        session_id: 'sess-g3', parent_run_id: 'mv-1', depth: 0,
        ts: '2026-07-25T17:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('exits 0', 'GREEN', r.exitCode === 0,
      `expected 0, got ${r.exitCode}`);
    assert('no teaming flag', 'GREEN', r.pt4.findings.length === 0,
      `got ${r.pt4.findings.length}`);
  } catch (err) {
    assert('did not crash', 'GREEN', false, err.message);
  }

  // ---- RED B2a: Review-as-author → ASSUMED (blocker 2) ----
  console.log('\n[RED] Review-as-author (blocker 2):');
  try {
    const runs = [
      { run_id: 'raa-rev1', model: 'gpt-5.5', work_type: 'review',
        session_id: 'sess-raa', parent_run_id: 'raa-rev2', depth: 0,
        ts: '2026-07-25T18:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'raa-rev2', model: 'claude-sonnet-4.6', work_type: 'review',
        session_id: 'sess-raa', parent_run_id: null, depth: 0,
        ts: '2026-07-25T17:55:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    const raaFind = r.pt2.find(f => f.reviewer_run_id === 'raa-rev1');
    assert('review-as-author → ASSUMED', 'RED',
      raaFind && raaFind.status === 'ASSUMED',
      `got ${raaFind ? raaFind.status : 'no finding'}`);
    assert('resolution says non_build_parent', 'RED',
      raaFind && raaFind.resolution === 'non_build_parent',
      `got ${raaFind ? raaFind.resolution : 'none'}`);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED B2b: Cycle A→B→A → ASSUMED (blocker 2) ----
  console.log('\n[RED] Cycle detection (blocker 2):');
  try {
    const runs = [
      { run_id: 'cyc-a', model: 'gpt-5.5', work_type: 'review',
        session_id: 'sess-cyc', parent_run_id: 'cyc-b', depth: 0,
        ts: '2026-07-25T19:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'cyc-b', model: 'claude-sonnet-4.6', work_type: 'review',
        session_id: 'sess-cyc', parent_run_id: 'cyc-a', depth: 0,
        ts: '2026-07-25T19:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    const cycFind = r.pt2.find(f => f.reviewer_run_id === 'cyc-a');
    assert('cycle → ASSUMED', 'RED',
      cycFind && cycFind.status === 'ASSUMED',
      `got ${cycFind ? cycFind.status : 'no finding'}`);
    assert('resolution says cycle', 'RED',
      cycFind && cycFind.resolution === 'cycle',
      `got ${cycFind ? cycFind.resolution : 'none'}`);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED B1: All null session_id → PT4 UNCHECKABLE (blocker 1) ----
  console.log('\n[RED] PT4 UNCHECKABLE on null sessions (blocker 1):');
  try {
    const runs = [
      { run_id: 'ns-build', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: null, parent_run_id: null, depth: 0,
        ts: '2026-07-25T20:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'ns-review', model: 'gpt-5.5', work_type: 'review',
        session_id: null, parent_run_id: 'ns-build', depth: 0,
        ts: '2026-07-25T20:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('PT4 uncheckable flag set', 'RED', r.pt4.uncheckable === true,
      `got ${r.pt4.uncheckable}`);
    assert('exit code is 2 (UNCHECKABLE)', 'RED', r.exitCode === 2,
      `got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED B3: Load errors → UNCHECKABLE (blocker 3) ----
  console.log('\n[RED] Load errors bump to UNCHECKABLE (blocker 3):');
  try {
    const runs = [
      { run_id: 'le-build', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: 'sess-le', parent_run_id: null, depth: 0,
        ts: '2026-07-25T21:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'le-review', model: 'gpt-5.5', work_type: 'review',
        session_id: 'sess-le', parent_run_id: 'le-build', depth: 0,
        ts: '2026-07-25T21:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const errorsArr = ['PARSE_ERROR: corrupt/meta.json: unexpected token'];
    const r = runAllChecks(runs, errorsArr);
    assert('exit code is 2 with load errors', 'RED', r.exitCode === 2,
      `got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED PT5: Missing argv → UNCHECKABLE ----
  console.log('\n[RED] PT5 argv missing → UNCHECKABLE:');
  try {
    const runs = [
      { run_id: 'av-1', model: 'claude-sonnet-4.6', work_type: 'build',
        agent: 'council-worker', session_id: 'sess-av',
        parent_run_id: null, depth: 0,
        ts: '2026-07-25T22:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('PT5 uncheckable', 'RED', r.pt5.uncheckable === true,
      `got ${r.pt5.uncheckable}`);
    assert('PT5 reason names missing field', 'RED',
      r.pt5.reason && r.pt5.reason.includes('argv'),
      `got "${r.pt5.reason}"`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- GREEN PT5: Argv present and clean → no findings ----
  console.log('\n[GREEN] PT5 clean argv (hypothetical):');
  try {
    const runs = [
      { run_id: 'av-clean', model: 'claude-sonnet-4.6', work_type: 'build',
        agent: 'council-worker', session_id: 'sess-avc',
        argv: '--agent council-worker --prompt ticket.md',
        parent_run_id: null, depth: 0,
        ts: '2026-07-25T23:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('PT5 not uncheckable', 'GREEN', r.pt5.uncheckable === false,
      `got ${r.pt5.uncheckable}`);
    assert('no PT5 findings', 'GREEN', r.pt5.findings.length === 0,
      `got ${r.pt5.findings.length}`);
  } catch (err) {
    assert('did not crash', 'GREEN', false, err.message);
  }

  // ---- RED PT5: Argv with --model + --agent → FINDING ----
  console.log('\n[RED] PT5 argv violation (hypothetical):');
  try {
    const runs = [
      { run_id: 'av-bad', model: 'claude-sonnet-4.6', work_type: 'build',
        agent: 'council-worker', session_id: 'sess-avb',
        argv: '--agent council-worker --model claude-haiku-4.5 --prompt ticket.md',
        parent_run_id: null, depth: 0,
        ts: '2026-07-25T23:30:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('PT5 not uncheckable', 'RED', r.pt5.uncheckable === false,
      `got ${r.pt5.uncheckable}`);
    assert('PT5 finding detected', 'RED', r.pt5.findings.length > 0,
      `got ${r.pt5.findings.length}`);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED R2-M2a: Case-sensitivity — "Review" (capitalized) detected ----
  console.log('\n[RED] Case-sensitivity: work_type "Review" detected:');
  try {
    const runs = [
      { run_id: 'cs-build', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: 'sess-cs1', parent_run_id: null, depth: 0,
        ts: '2026-07-25T09:00:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'cs-rev', model: 'gpt-5.5', work_type: 'Review',
        session_id: 'sess-cs1', parent_run_id: 'cs-build', depth: 0,
        ts: '2026-07-25T09:05:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('"Review" treated as review', 'RED',
      r.pt2.some(f => f.reviewer_run_id === 'cs-rev'),
      'not found in PT2 findings');
    assert('independence checked', 'RED',
      r.pt2.some(f => f.reviewer_run_id === 'cs-rev' && f.status === 'INDEPENDENT'),
      `got ${JSON.stringify(r.pt2.find(f => f.reviewer_run_id === 'cs-rev'))}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED R2-M2b: Case-sensitivity — "REVIEW" (all caps) detected ----
  console.log('\n[RED] Case-sensitivity: work_type "REVIEW" detected:');
  try {
    const runs = [
      { run_id: 'cs2-build', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: 'sess-cs2', parent_run_id: null, depth: 0,
        ts: '2026-07-25T09:10:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'cs2-rev', model: 'gpt-5.5', work_type: 'REVIEW',
        session_id: 'sess-cs2', parent_run_id: 'cs2-build', depth: 0,
        ts: '2026-07-25T09:15:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('"REVIEW" treated as review', 'RED',
      r.pt2.some(f => f.reviewer_run_id === 'cs2-rev'),
      'not found in PT2 findings');
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED R2-M2c: Empty work_type → UNCHECKABLE ----
  console.log('\n[RED] Empty work_type → UNCHECKABLE:');
  try {
    const runs = [
      { run_id: 'ewt-1', model: 'claude-sonnet-4.6', work_type: '',
        session_id: 'sess-ewt', parent_run_id: null, depth: 0,
        ts: '2026-07-25T09:20:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('unclassifiable detected', 'RED', r.unclassifiable.length > 0,
      `got ${r.unclassifiable.length}`);
    assert('exit code 2', 'RED', r.exitCode === 2,
      `got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED R2-M2d: Missing work_type (undefined) → UNCHECKABLE ----
  console.log('\n[RED] Missing work_type → UNCHECKABLE:');
  try {
    const runs = [
      { run_id: 'mwt-1', model: 'claude-sonnet-4.6',
        session_id: 'sess-mwt', parent_run_id: null, depth: 0,
        ts: '2026-07-25T09:25:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('unclassifiable detected', 'RED', r.unclassifiable.length > 0,
      `got ${r.unclassifiable.length}`);
    assert('exit code 2', 'RED', r.exitCode === 2,
      `got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED R2-M1: Probe parent → ASSUMED (build-class allowlist) ----
  console.log('\n[RED] Probe parent → ASSUMED (build-class allowlist):');
  try {
    const runs = [
      { run_id: 'ba-probe', model: 'claude-haiku-4.5', work_type: 'probe',
        session_id: 'sess-ba', parent_run_id: null, depth: 0,
        ts: '2026-07-25T09:30:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'ba-rev', model: 'gpt-5.5', work_type: 'review',
        session_id: 'sess-ba', parent_run_id: 'ba-probe', depth: 0,
        ts: '2026-07-25T09:35:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    const baFind = r.pt2.find(f => f.reviewer_run_id === 'ba-rev');
    assert('probe parent → ASSUMED', 'RED',
      baFind && baFind.status === 'ASSUMED',
      `got ${baFind ? baFind.status : 'no finding'}`);
    assert('exits non-zero', 'RED', r.exitCode !== 0,
      `expected non-zero, got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // ---- RED R2-M3: PT4 partial ungroupable → UNCHECKABLE ----
  console.log('\n[RED] PT4 partial ungroupable:');
  try {
    const runs = [
      { run_id: 'pu-build', model: 'claude-sonnet-4.6', work_type: 'build',
        session_id: 'sess-pu', parent_run_id: null, depth: 0,
        ts: '2026-07-25T09:40:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'pu-rev', model: 'gpt-5.5', work_type: 'review',
        session_id: 'sess-pu', parent_run_id: 'pu-build', depth: 0,
        ts: '2026-07-25T09:45:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
      { run_id: 'pu-orphan', model: 'claude-haiku-4.5', work_type: 'build',
        session_id: null, parent_run_id: null, depth: 0,
        ts: '2026-07-25T09:50:00', dispatcher: 'CEO',
        ok: true, exit_reason: 'success' },
    ];
    const r = runAllChecks(runs);
    assert('PT4 partially uncheckable', 'RED', r.pt4.partiallyUncheckable === true,
      `got ${r.pt4.partiallyUncheckable}`);
    assert('exit code 2', 'RED', r.exitCode === 2,
      `got ${r.exitCode}`);
  } catch (err) {
    assert('did not crash', 'RED', false, err.message);
  }

  // Summary
  const redCases = caseLog.filter(c => c.colour === 'RED');
  const greenCases = caseLog.filter(c => c.colour === 'GREEN');
  console.log(
    `\n=== SELF-TEST SUMMARY: ${passed} passed, ${failed} failed` +
    ` | RED: ${redCases.length} (${redCases.filter(c => c.pass).length} pass)` +
    ` | GREEN: ${greenCases.length} (${greenCases.filter(c => c.pass).length} pass)` +
    ` | exit ${failed > 0 ? 1 : 0} ===`,
  );
  return { passed, failed, exitCode: failed > 0 ? 1 : 0 };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  try {
    const args = process.argv.slice(2);

    if (args.includes('--self-test')) {
      const st = selfTest();
      process.exit(st.exitCode);
    }

    let sessionFilter = null;
    const sidx = args.indexOf('--session');
    if (sidx !== -1) {
      sessionFilter = args[sidx + 1];
      if (!sessionFilter) {
        console.error('ERROR: --session requires a session ID argument');
        console.log('\n>>> VERDICT: UNCHECKABLE (exit 2)');
        process.exit(2);
      }
    } else if (!args.includes('--all')) {
      console.error(
        'Usage: node check-agent-provenance.mjs --session <id> | --all | --self-test',
      );
      console.log('\n>>> VERDICT: UNCHECKABLE (exit 2)');
      process.exit(2);
    }

    const { runs, errors, totalBeforeFilter } = loadRunsFromDisk(sessionFilter);

    if (runs.length === 0) {
      const reason = sessionFilter
        ? `No runs for session_id="${sessionFilter}"` +
          ` (${totalBeforeFilter || 0} total runs on disk)`
        : `No runs in ${UA_WORKER_DIR}`;
      console.error(`UNCHECKABLE: ${reason}`);
      if (errors.length > 0) {
        console.error('Load errors:');
        for (const e of errors) console.error(`  ${e}`);
      }
      fireTelemetry('uncheckable', sessionFilter || 'all');
      console.log('\n>>> VERDICT: UNCHECKABLE (exit 2)');
      process.exit(2);
    }

    const label = sessionFilter ? `session=${sessionFilter}` : 'all';
    const result = runAllChecks(runs, errors);
    printReport(result, errors, label);

    if (result.exitCode !== 0) {
      fireTelemetry(result.exitCode === 1 ? 'finding' : 'uncheckable',
        sessionFilter || 'all');
    }

    process.exit(result.exitCode);
  } catch (err) {
    console.error(`CRASH: ${err.message}`);
    console.log('\n>>> VERDICT: UNCHECKABLE (exit 2)');
    process.exit(2);
  }
}

main();
