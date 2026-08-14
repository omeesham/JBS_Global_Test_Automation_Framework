#!/usr/bin/env node
// dispatch-preflight.mjs — Pre-dispatch validator for copilot-worker.sh
// Catches fatal misconfigurations BEFORE a dispatch is fired.
//
// ── INTENTIONAL DIVERGENCES FROM THE WRAPPER (dispatcher ruling, PLAN_61, 2026-08-07) ──
// A preflight is a cheap pre-dispatch stop — being stricter than the wrapper costs a two-second
// ticket edit, while the wrapper's leniency produces a silent, credit-burning death.
//
// • FF-001 relative OUTPUT path stays FAIL (wrapper only warns and ignores it, :723) — an ignored
//   OUTPUT line leaves the deliverable oracle dormant, which is exactly how a no-deliverable death
//   goes unnoticed.
// • FF-002 existing run-id directory stays FAIL (wrapper only fatals on result.md/meta.json,
//   :171-176) — reusing a directory mixes two runs' evidence, and evidence isolation is the point
//   of the fresh-file guarantee.
// • FF-003 run-id already present in the ledger stays FAIL (wrapper has no pre-dispatch ledger
//   check) — this is the 2026-07-30 incident verbatim: a reused run-id let a stale ledger row read
//   as a fresh success. Uniqueness across all time is the correct rule.
// • FF-004 missing --model / --run-id → usage exit 2 is accepted as MINOR and stays as-is:
//   deliberate run-ids are wanted, and a usage message costs nothing.

import { readFileSync, existsSync, statSync, mkdtempSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir, homedir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

const WORK_TYPE_ENUM = ['build', 'review', 'verify', 'draft', 'rca', 'walk', 'probe', 'research', 'orchestrate'];

// The canonical OUTPUT anchor regex — matches the wrapper's grep exactly
const OUTPUT_ANCHOR_RE = /^[ \t]*(\*\*)?OUTPUT \(LITERAL ABSOLUTE\)(\*\*)?[ \t]*:/m;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--self-test') { args.selfTest = true; continue; }
    if (a.startsWith('--') && i + 1 < argv.length) {
      const key = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      args[key] = argv[++i];
    }
  }
  return args;
}

function extractOutputPath(ticketContent) {
  const match = ticketContent.match(OUTPUT_ANCHOR_RE);
  if (!match) return null;
  const lineStart = match.index + match[0].length;
  const lineEnd = ticketContent.indexOf('\n', lineStart);
  let val = ticketContent.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
  if (val.startsWith('`')) val = val.slice(1);
  if (val.endsWith('`')) val = val.slice(0, -1);
  return val.trim() || null;
}

function isAbsolutePath(p) {
  return /^\//.test(p) || /^[A-Za-z]:[/\\]/.test(p);
}

function parseFloorsFromWrapper(wrapperPath) {
  try {
    const content = readFileSync(wrapperPath, 'utf8');
    const beginIdx = content.indexOf('# ── PLAN61-FLOORS-BEGIN ──');
    const endIdx = content.indexOf('# ── PLAN61-FLOORS-END ──');
    if (beginIdx === -1 || endIdx === -1) return null;
    const block = content.slice(beginIdx, endIdx);
    const floors = {};
    const pairRe = /([a-z]+):(\d+)/g;
    let m;
    while ((m = pairRe.exec(block)) !== null) {
      floors[m[1]] = parseInt(m[2], 10);
    }
    return Object.keys(floors).length > 0 ? floors : null;
  } catch { return null; }
}

function loadRegistry(registryPath) {
  try {
    const content = readFileSync(registryPath, 'utf8');
    return JSON.parse(content);
  } catch { return null; }
}

function runChecks(opts) {
  const results = [];
  const {
    ticket, runId, model, workType, effort, maxCredits, agent, mode,
    wrapperPath, ledgerPath, registryPath
  } = opts;

  // Check 1: ticket file exists and is readable
  try {
    readFileSync(ticket, 'utf8');
    results.push({ status: 'PASS', check: 'ticket-readable', msg: 'Ticket file exists and is readable' });
  } catch {
    results.push({ status: 'FAIL', check: 'ticket-readable', msg: `Ticket file not readable: ${ticket}` });
    return results; // can't continue without ticket
  }

  const ticketContent = readFileSync(ticket, 'utf8');

  // Check 2: OUTPUT anchor
  const outputPath = extractOutputPath(ticketContent);
  if (!outputPath) {
    results.push({ status: 'WARN', check: 'output-anchor', msg: 'No canonical OUTPUT (LITERAL ABSOLUTE): anchor found — deliverable oracle will be dormant' });
  } else if (!isAbsolutePath(outputPath)) {
    results.push({ status: 'FAIL', check: 'output-anchor', msg: `OUTPUT path is not absolute: ${outputPath}` });
  } else {
    results.push({ status: 'PASS', check: 'output-anchor', msg: `OUTPUT anchor present: ${outputPath}` });
  }

  // Check 3: run-id unused
  let runIdUsed = false;
  try {
    const ledger = readFileSync(ledgerPath, 'utf8').trim();
    if (ledger) {
      for (const line of ledger.split('\n')) {
        try {
          const row = JSON.parse(line);
          if (row.run_id === runId) { runIdUsed = true; break; }
        } catch { /* tolerate malformed lines */ }
      }
    }
  } catch { /* ledger missing is fine */ }
  const runDir = join(REPO_ROOT, '.claude', 'state', 'ua-worker', runId);
  if (runIdUsed) {
    results.push({ status: 'FAIL', check: 'run-id-unique', msg: `Run-id '${runId}' already exists in ledger` });
  } else if (existsSync(runDir)) {
    results.push({ status: 'FAIL', check: 'run-id-unique', msg: `Run-id directory already exists: ${runDir}` });
  } else {
    results.push({ status: 'PASS', check: 'run-id-unique', msg: `Run-id '${runId}' is unused` });
  }

  // Check 4: declared output path not already a non-empty file
  if (outputPath && isAbsolutePath(outputPath)) {
    try {
      const st = statSync(outputPath);
      if (st.isFile() && st.size > 0) {
        results.push({ status: 'WARN', check: 'output-clean', msg: `Declared OUTPUT already exists as non-empty file: ${outputPath}` });
      } else {
        results.push({ status: 'PASS', check: 'output-clean', msg: 'Declared OUTPUT path is clean' });
      }
    } catch {
      results.push({ status: 'PASS', check: 'output-clean', msg: 'Declared OUTPUT path is clean' });
    }
  } else {
    results.push({ status: 'PASS', check: 'output-clean', msg: 'No absolute OUTPUT to check (anchor absent or relative)' });
  }

  // Check 5a: mode valid (wrapper rejects anything outside read|edit with exit 2)
  const MODE_ENUM = ['read', 'edit'];
  if (mode !== undefined && !MODE_ENUM.includes(mode)) {
    results.push({ status: 'FAIL', check: 'mode', msg: `--mode '${mode}' invalid; valid values: ${MODE_ENUM.join('|')} (or omit for wrapper default)` });
  } else {
    results.push({ status: 'PASS', check: 'mode', msg: mode ? `Mode '${mode}' is valid` : 'No --mode passed (wrapper defaults to edit)' });
  }

  // Check 5: work-type valid
  if (!workType) {
    results.push({ status: 'FAIL', check: 'work-type', msg: `--work-type required; valid values: ${WORK_TYPE_ENUM.join('|')}` });
  } else if (!WORK_TYPE_ENUM.includes(workType)) {
    results.push({ status: 'FAIL', check: 'work-type', msg: `--work-type '${workType}' invalid; valid values: ${WORK_TYPE_ENUM.join('|')}` });
  } else {
    results.push({ status: 'PASS', check: 'work-type', msg: `Work-type '${workType}' is valid` });
  }

  // Check 6: effort tier valid for model
  // The wrapper resolves a SINGLE top-verified tier per model (effort_top) and rejects any
  // explicit effort that does not equal it (exit 2). The preflight must ask the same question:
  // does the requested effort equal effort_top? Membership in the tiers array is irrelevant —
  // the wrapper never checks it.
  const registry = loadRegistry(registryPath);
  if (effort !== undefined) {
    if (!registry) {
      results.push({ status: 'FAIL', check: 'effort-tier', msg: `--effort '${effort}' passed but model registry unreadable at ${registryPath} — cannot validate tier. The wrapper promotes invalid explicit effort to exit 2. Safe path: omit --effort (the wrapper's work-type cap applies automatically and cannot fail).` });
    } else {
      const modelEntry = registry.models && registry.models.find(m => m.id === model);
      if (!modelEntry) {
        results.push({ status: 'WARN', check: 'effort-tier', msg: `Model '${model}' not found in registry — cannot validate effort. Advice: omitting --effort applies the wrapper's work-type cap and cannot fail.` });
      } else if (!modelEntry.effort_top) {
        results.push({ status: 'FAIL', check: 'effort-tier', msg: `Model '${model}' has no reasoning-effort tiers — passing --effort is an error. Advice: omitting --effort applies the wrapper's work-type cap and cannot fail.` });
      } else if (effort !== modelEntry.effort_top) {
        results.push({ status: 'FAIL', check: 'effort-tier', msg: `--effort '${effort}' will be rejected by the wrapper — model '${model}' only accepts its top verified tier '${modelEntry.effort_top}'. Use --effort ${modelEntry.effort_top} or omit --effort (the wrapper's work-type cap applies automatically and cannot fail).` });
      } else {
        results.push({ status: 'PASS', check: 'effort-tier', msg: `Effort '${effort}' matches top verified tier for model '${model}'` });
      }
    }
  } else {
    results.push({ status: 'PASS', check: 'effort-tier', msg: 'No --effort passed (wrapper applies work-type cap)' });
  }

  // Check 7: max-credits >= floor
  const floors = parseFloorsFromWrapper(wrapperPath);
  if (maxCredits !== undefined) {
    const credits = parseInt(maxCredits, 10);
    if (!floors) {
      results.push({ status: 'WARN', check: 'credit-floor', msg: 'Floors not installed in wrapper — cannot validate --max-credits' });
    } else if (workType && floors[workType] !== undefined) {
      if (credits < floors[workType]) {
        results.push({ status: 'FAIL', check: 'credit-floor', msg: `--max-credits ${credits} is below the floor for '${workType}' (minimum: ${floors[workType]})` });
      } else {
        results.push({ status: 'PASS', check: 'credit-floor', msg: `Credits ${credits} >= floor ${floors[workType]} for '${workType}'` });
      }
    } else {
      results.push({ status: 'PASS', check: 'credit-floor', msg: `No floor defined for work-type '${workType || '(missing)'}'` });
    }
  } else {
    if (!floors) {
      results.push({ status: 'WARN', check: 'credit-floor', msg: 'Floors not installed in wrapper — skipping credit check' });
    } else {
      results.push({ status: 'PASS', check: 'credit-floor', msg: 'No --max-credits passed (no floor check needed)' });
    }
  }

  // Check 8: C2 shape warning — suite-shaped VERIFY
  const verifyMatch = ticketContent.match(/## VERIFY\b[\s\S]*?(?=\n## |\n---|$)/);
  if (verifyMatch) {
    const verifyBlock = verifyMatch[0];
    const hasPlaywright = /npx playwright test|npm test/.test(verifyBlock);
    const hasSafeguard = /--shard|--grep|--retries=0/.test(verifyBlock);
    if (hasPlaywright && !hasSafeguard) {
      results.push({ status: 'WARN', check: 'c2-shape', msg: 'VERIFY contains a full test suite command without --shard/--grep/--retries=0 — worker cannot babysit past ~20 min (wall-kill risk)' });
    } else {
      results.push({ status: 'PASS', check: 'c2-shape', msg: 'VERIFY shape OK' });
    }
  } else {
    results.push({ status: 'PASS', check: 'c2-shape', msg: 'No VERIFY block found (no shape warning needed)' });
  }

  return results;
}

function printResults(results, opts) {
  let pass = 0, warn = 0, fail = 0;
  for (const r of results) {
    console.log(`[${r.status}] ${r.check}: ${r.msg}`);
    if (r.status === 'PASS') pass++;
    else if (r.status === 'WARN') warn++;
    else fail++;
  }
  console.log(`\nPREFLIGHT: ${pass} pass, ${warn} warn, ${fail} fail`);

  if (fail === 0) {
    const t = opts.ticket.replace(/\\/g, '/');
    const a = opts.agent || 'council-worker';
    const m = opts.model;
    const md = opts.mode || 'edit';
    const wt = opts.workType;
    const c = opts.maxCredits || '250';
    const rid = opts.runId;
    const log = `.claude/state/ua-worker/${rid}/${rid}.log`;
    let cmd = `set -o pipefail && bash .claude/skills/ultra-agents/copilot-worker.sh --ticket ${t} --agent ${a} --model ${m} --mode ${md} --work-type ${wt} --max-credits ${c} --run-id ${rid} --session-id "$CLAUDE_SESSION_ID" --parent-run-id <PARENT> 2>&1 | tee ${log}; echo "DISPATCH_EXIT=\${PIPESTATUS[0]}"`;
    if (opts.effort) {
      cmd = cmd.replace(`--mode ${md}`, `--mode ${md} --effort ${opts.effort}`);
    }
    console.log(`\n${cmd}`);
  }

  return fail > 0 ? 1 : 0;
}

// ── Self-test ────────────────────────────────────────────────────────────────
function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'preflight-test-'));
  let passed = 0, total = 0;

  function assert(name, condition) {
    total++;
    if (condition) { passed++; console.log(`  ✓ ${name}`); }
    else { console.log(`  ✗ ${name}`); }
  }

  try {
    // Setup fixtures
    const goodTicket = join(tmp, 'good-ticket.md');
    writeFileSync(goodTicket, `# TICKET\n\n## TIER\nT3\n\nOUTPUT (LITERAL ABSOLUTE): /tmp/out/REPORT.md\n\n## GOAL\nDo stuff\n\n## VERIFY\n\`\`\`\nnode --check foo.mjs\n\`\`\`\n`);

    const noAnchorTicket = join(tmp, 'no-anchor.md');
    writeFileSync(noAnchorTicket, `# TICKET\n\nOUTPUT: /tmp/out/REPORT.md\n\n## GOAL\nStuff\n`);

    const legacyTicket = join(tmp, 'legacy.md');
    writeFileSync(legacyTicket, `# TICKET\n\nOutput file: /tmp/out/REPORT.md\n\n## GOAL\nStuff\n`);

    const suiteTicket = join(tmp, 'suite-ticket.md');
    writeFileSync(suiteTicket, `# TICKET\n\nOUTPUT (LITERAL ABSOLUTE): /tmp/out/R.md\n\n## VERIFY\n\`\`\`\nnpx playwright test\n\`\`\`\n`);

    const ledger = join(tmp, 'ledger.jsonl');
    writeFileSync(ledger, `{"run_id":"used-run","mode":"ticket","model":"claude-opus-4.6","exit":0,"ok":true}\n`);

    const registry = join(tmp, 'registry.json');
    writeFileSync(registry, JSON.stringify({
      version: '1',
      models: [
        { id: 'claude-opus-4.6', effort_top: 'max', tiers: ['low', 'medium', 'high', 'max'], supports_long_context: true },
        { id: 'claude-sonnet-4.6', effort_top: 'max', tiers: ['low', 'medium', 'high', 'max'], supports_long_context: true },
        { id: 'claude-haiku-4.5', effort_top: null, tiers: [], supports_long_context: false }
      ]
    }));

    const wrapper = join(tmp, 'wrapper.sh');
    writeFileSync(wrapper, [
      '#!/bin/bash',
      '_WORK_TYPE_ENUM="build|review|verify|draft|rca|walk|probe|research|orchestrate"',
      '# ── PLAN61-FLOORS-BEGIN ──',
      '#   build:250 research:250 rca:250 walk:250 orchestrate:250 review:200 verify:100 probe:100 draft:100',
      '# ── PLAN61-FLOORS-END ──',
    ].join('\n'));

    const wrapperNoFloors = join(tmp, 'wrapper-nofloors.sh');
    writeFileSync(wrapperNoFloors, '#!/bin/bash\n_WORK_TYPE_ENUM="build|review|verify|draft|rca|walk|probe|research|orchestrate"\n');

    // Test 1: good ticket passes (effort=max is top tier for opus)
    let r = runChecks({ ticket: goodTicket, runId: 'fresh-001', model: 'claude-opus-4.6', workType: 'build', effort: 'max', maxCredits: '300', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('good ticket — all PASS', r.every(x => x.status === 'PASS'));

    // Test 2: missing OUTPUT anchor warns
    r = runChecks({ ticket: noAnchorTicket, runId: 'fresh-002', model: 'claude-opus-4.6', workType: 'build', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('missing OUTPUT anchor — WARN', r.find(x => x.check === 'output-anchor')?.status === 'WARN');

    // Test 3: legacy OUTPUT: spelling does NOT satisfy check 2
    r = runChecks({ ticket: legacyTicket, runId: 'fresh-003', model: 'claude-opus-4.6', workType: 'build', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('legacy OUTPUT: spelling — WARN (not matched)', r.find(x => x.check === 'output-anchor')?.status === 'WARN');

    // Test 4: duplicate run-id fails
    r = runChecks({ ticket: goodTicket, runId: 'used-run', model: 'claude-opus-4.6', workType: 'build', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('duplicate run-id — FAIL', r.find(x => x.check === 'run-id-unique')?.status === 'FAIL');

    // Test 5: bad work-type fails
    r = runChecks({ ticket: goodTicket, runId: 'fresh-004', model: 'claude-opus-4.6', workType: 'biuld', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('bad work-type — FAIL', r.find(x => x.check === 'work-type')?.status === 'FAIL');

    // Test 6: invalid effort tier fails
    r = runChecks({ ticket: goodTicket, runId: 'fresh-005', model: 'claude-opus-4.6', workType: 'build', effort: 'xhigh', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('invalid effort tier — FAIL', r.find(x => x.check === 'effort-tier')?.status === 'FAIL');

    // Test 7: below-floor credits fail
    r = runChecks({ ticket: goodTicket, runId: 'fresh-006', model: 'claude-opus-4.6', workType: 'build', maxCredits: '50', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('below-floor credits — FAIL', r.find(x => x.check === 'credit-floor')?.status === 'FAIL');

    // Test 8: absent FLOORS block warns
    r = runChecks({ ticket: goodTicket, runId: 'fresh-007', model: 'claude-opus-4.6', workType: 'build', maxCredits: '300', wrapperPath: wrapperNoFloors, ledgerPath: ledger, registryPath: registry });
    assert('absent FLOORS — WARN', r.find(x => x.check === 'credit-floor')?.status === 'WARN');

    // Test 9: suite-shaped VERIFY warns
    r = runChecks({ ticket: suiteTicket, runId: 'fresh-008', model: 'claude-opus-4.6', workType: 'build', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('suite-shaped VERIFY — WARN', r.find(x => x.check === 'c2-shape')?.status === 'WARN');

    // Test 10: haiku + effort = FAIL
    r = runChecks({ ticket: goodTicket, runId: 'fresh-009', model: 'claude-haiku-4.5', workType: 'build', effort: 'low', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('haiku + effort — FAIL', r.find(x => x.check === 'effort-tier')?.status === 'FAIL');

    // Test 11: unreadable registry + effort = FAIL (FP-002 fix)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-010', model: 'claude-opus-4.6', workType: 'build', effort: 'high', wrapperPath: wrapper, ledgerPath: ledger, registryPath: join(tmp, 'nonexistent.json') });
    assert('unreadable registry + effort — FAIL', r.find(x => x.check === 'effort-tier')?.status === 'FAIL');

    // Test 12: unreadable registry WITHOUT effort = WARN (unchanged)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-011', model: 'claude-opus-4.6', workType: 'build', wrapperPath: wrapper, ledgerPath: ledger, registryPath: join(tmp, 'nonexistent.json') });
    assert('unreadable registry no effort — PASS', r.find(x => x.check === 'effort-tier')?.status === 'PASS');

    // Test 13: invalid --mode banana = FAIL (FP-001 fix)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-012', model: 'claude-opus-4.6', workType: 'build', mode: 'banana', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('invalid mode banana — FAIL', r.find(x => x.check === 'mode')?.status === 'FAIL');

    // Test 14: valid --mode read = PASS
    r = runChecks({ ticket: goodTicket, runId: 'fresh-013', model: 'claude-opus-4.6', workType: 'build', mode: 'read', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('valid mode read — PASS', r.find(x => x.check === 'mode')?.status === 'PASS');

    // Test 15: valid --mode edit = PASS
    r = runChecks({ ticket: goodTicket, runId: 'fresh-014', model: 'claude-opus-4.6', workType: 'build', mode: 'edit', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('valid mode edit — PASS', r.find(x => x.check === 'mode')?.status === 'PASS');

    // Test 16: absent --mode = PASS
    r = runChecks({ ticket: goodTicket, runId: 'fresh-015', model: 'claude-opus-4.6', workType: 'build', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('absent mode — PASS', r.find(x => x.check === 'mode')?.status === 'PASS');

    // ── P67 effort-top fixtures (the death-class that killed opus+high today) ──

    // Test 17: opus-4.6 + effort=high → FAIL (the exact command that died)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-016', model: 'claude-opus-4.6', workType: 'build', effort: 'high', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('opus effort=high — FAIL (death-class)', r.find(x => x.check === 'effort-tier')?.status === 'FAIL');

    // Test 18: opus-4.6 + effort=low → FAIL (same class, different value)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-017', model: 'claude-opus-4.6', workType: 'build', effort: 'low', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('opus effort=low — FAIL (same class)', r.find(x => x.check === 'effort-tier')?.status === 'FAIL');

    // Test 19: opus-4.6 + effort=medium → FAIL (same class, different value)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-018', model: 'claude-opus-4.6', workType: 'build', effort: 'medium', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('opus effort=medium — FAIL (same class)', r.find(x => x.check === 'effort-tier')?.status === 'FAIL');

    // Test 20: opus-4.6 + effort=max → PASS (top tier)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-019', model: 'claude-opus-4.6', workType: 'build', effort: 'max', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('opus effort=max — PASS (top tier)', r.find(x => x.check === 'effort-tier')?.status === 'PASS');

    // Test 21: sonnet-4.6 + effort=max → PASS (different model, its own top tier)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-020', model: 'claude-sonnet-4.6', workType: 'build', effort: 'max', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('sonnet effort=max — PASS (top tier)', r.find(x => x.check === 'effort-tier')?.status === 'PASS');

    // Test 22: no effort passed → PASS (wrapper applies work-type cap internally)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-021', model: 'claude-opus-4.6', workType: 'build', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('no effort — PASS', r.find(x => x.check === 'effort-tier')?.status === 'PASS');

    // Test 23: haiku (no tiers) + effort → FAIL
    r = runChecks({ ticket: goodTicket, runId: 'fresh-022', model: 'claude-haiku-4.5', workType: 'build', effort: 'low', wrapperPath: wrapper, ledgerPath: ledger, registryPath: registry });
    assert('haiku + effort — FAIL (no tiers)', r.find(x => x.check === 'effort-tier')?.status === 'FAIL');

    // Test 24: unreadable registry + effort → FAIL (fail-closed)
    r = runChecks({ ticket: goodTicket, runId: 'fresh-023', model: 'claude-opus-4.6', workType: 'build', effort: 'max', wrapperPath: wrapper, ledgerPath: ledger, registryPath: join(tmp, 'nonexistent.json') });
    assert('unreadable registry + effort — FAIL', r.find(x => x.check === 'effort-tier')?.status === 'FAIL');

    console.log(`\nSELF-TEST: ${passed}/${total} passed`);
    return passed === total ? 0 : 1;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (argv.includes('--self-test')) {
  process.exit(selfTest());
}

const args = parseArgs(argv);
if (!args.ticket || !args.runId || !args.model || !args.workType) {
  console.error('Usage: node dispatch-preflight.mjs --ticket <path> --run-id <id> --model <id> --work-type <t> [--effort <tier>] [--max-credits <n>] [--agent <name>] [--mode read|edit] [--wrapper <path>] [--ledger <path>] [--registry <path>]');
  process.exit(2);
}

const wrapperPath = args.wrapper || join(REPO_ROOT, '.claude', 'skills', 'ultra-agents', 'copilot-worker.sh');
const ledgerPath = args.ledger || join(REPO_ROOT, '.claude', 'state', 'ua-worker', 'ledger.jsonl');
const registryPath = args.registry || process.env.MODEL_REGISTRY_PATH || join(homedir(), '.claude', 'delegation', 'model-registry.json');

const results = runChecks({
  ticket: args.ticket,
  runId: args.runId,
  model: args.model,
  workType: args.workType,
  effort: args.effort,
  maxCredits: args.maxCredits,
  agent: args.agent,
  mode: args.mode,
  wrapperPath,
  ledgerPath,
  registryPath,
});

process.exit(printResults(results, { ...args, wrapperPath, ledgerPath, registryPath }));
