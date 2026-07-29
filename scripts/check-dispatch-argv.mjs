#!/usr/bin/env node
/**
 * check-dispatch-argv.mjs — argv-matrix guard for copilot-worker.sh
 *
 * Proves --model is never emitted alongside --agent in agent mode.
 *
 * Observation method: injects a bash function named `copilot` (and `setsid`)
 * via `export -f` into the child bash process running copilot-worker.sh.
 * The function captures the actual argv the script passes to what it believes
 * is the real CLI binary. Bash function lookup takes precedence over PATH,
 * so the real CLI is never invoked — zero credits, offline, deterministic.
 *
 * 4-case matrix:
 *   1. pin-only:     --agent given, no --model flag   → --model MUST BE ABSENT
 *   2. variant:      --agent + --model ≠ agent pin    → --model MUST BE ABSENT
 *   3. fall-through: --agent + --model = agent pin    → --model MUST BE ABSENT
 *   4. no-agent:     no --agent, --model given        → --model MUST BE PRESENT
 *
 * CLI:
 *   node scripts/check-dispatch-argv.mjs --self-test
 *   node scripts/check-dispatch-argv.mjs [--target <path>]
 *
 * Exit: 0 = PASS, 1 = FAIL, 2 = infrastructure error.
 *
 * Sev: S1 — silent quality drift (wrong model dispatched undetected across multiple runs).
 * Graduating incident: 2026-07-25 — Copilot CLI --agent prefix-match silently resolved
 *   council-worker to council-worker--claude-haiku-4.5 (a co-located variant), so dispatches
 *   ran a different model than intended for an extended period without any argv check catching it.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GATE_NAME = 'check-dispatch-argv';
const GATE_FIRES = path.join(ROOT, '.claude', 'state', 'gate-fires.log');
const DEFAULT_TARGET = path.join(ROOT, '.claude', 'skills', 'ultra-agents', 'copilot-worker.sh');
const AGENT_PIN = 'claude-sonnet-4.6';

const toU = (p) => String(p).replace(/\\/g, '/');

function fireTelemetry(verdict, target) {
  fs.mkdirSync(path.dirname(GATE_FIRES), { recursive: true });
  fs.appendFileSync(GATE_FIRES,
    `${GATE_NAME}, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
}

// ── Resolve Git Bash (Windows) or /bin/bash (Unix) ───────────────────────────

function resolveBash() {
  if (os.platform() !== 'win32') {
    for (const p of ['/bin/bash', '/usr/bin/bash']) {
      if (fs.existsSync(p)) return p;
    }
    throw new Error('bash not found');
  }
  const candidates = [
    process.env.GIT_BASH,
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
  ].filter(Boolean);
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    try {
      const out = execFileSync(p, ['-c', 'uname -o 2>/dev/null || echo unknown'],
        { stdio: 'pipe', timeout: 5000 }).toString().trim();
      if (out.includes('GNU/Linux')) continue;
      return p;
    } catch { continue; }
  }
  throw new Error(
    'check-dispatch-argv: FATAL — cannot find Git Bash. ' +
    'Set GIT_BASH env var to bash.exe from Git for Windows. ' +
    'WSL bash is not supported.');
}

// ── Matrix definition ────────────────────────────────────────────────────────

const CASES = [
  { name: 'pin-only',     flags: ['--agent', 'guard-test'],
    expectModel: false, expectAgent: true,
    desc: '--agent given, no --model (MODEL_SET=false)' },
  { name: 'variant',      flags: ['--agent', 'guard-test', '--model', 'claude-opus-4.6'],
    expectModel: false, expectAgent: true,
    desc: '--agent + --model differs from pin' },
  { name: 'fall-through', flags: ['--agent', 'guard-test', '--model', AGENT_PIN],
    expectModel: false, expectAgent: true,
    desc: '--agent + --model equals pin (no branch matches)' },
  { name: 'no-agent',     flags: ['--model', AGENT_PIN],
    expectModel: true, expectAgent: false,
    desc: 'no --agent; --model is correct and required' },
];

// ── Build the bash function-injection preamble ───────────────────────────────

function buildPreamble(capFileUnix) {
  return [
    `copilot() { case "$1" in --version) echo "guard-stub 0.0.0"; return 0;; --help) echo "-p --model --effort --context --deny-tool --allow-tool --no-remote --log-dir --agent --no-color -s --no-ask-user --allow-all-tools --max-ai-credits --continue --connect --no-custom-instructions"; return 0;; esac; printf '%s\\n' "$@" > "${capFileUnix}"; return 0; }`,
    'export -f copilot',
    'setsid() { "$@"; }',
    'export -f setsid',
  ].join('; ');
}

// ── Run one matrix case against the full copilot-worker.sh ───────────────────

function runCaseFull(bashPath, targetScript, c) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `argv-${c.name}-`));
  const capFile = path.join(tmp, 'captured-argv.txt');
  try {
    const scriptCopy = path.join(tmp, 'copilot-worker.sh');
    fs.copyFileSync(targetScript, scriptCopy);
    execFileSync(bashPath, ['-c', `cd "${toU(tmp)}" && git init -q`],
      { stdio: 'pipe', timeout: 10000 });

    const home = path.join(tmp, 'home');
    fs.mkdirSync(path.join(home, '.copilot', 'agents'), { recursive: true });
    fs.writeFileSync(path.join(home, '.copilot', 'agents', 'guard-test.agent.md'),
      `---\nmodel: ${AGENT_PIN}\n---\nGuard test agent\n`);
    const delDir = path.join(home, '.claude', 'delegation');
    fs.mkdirSync(delDir, { recursive: true });
    fs.writeFileSync(path.join(delDir, 'registry-block.sh'),
      'EFFORT_TOP="max"\nif [ "$EFFORT_SET" != "true" ]; then EFFORT="max"; fi\nEFFORT_ARGS=(--effort "$EFFORT")\n');
    fs.writeFileSync(path.join(delDir, 'config.json'), '{"MAX_WORKERS":1,"STALL_MODE":"off"}');
    fs.writeFileSync(path.join(delDir, 'cli-version.txt'), 'guard-stub 0.0.0');
    fs.mkdirSync(path.join(tmp, '.claude', 'state', 'ua-worker'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'task.txt'), 'argv guard test');

    const preamble = buildPreamble(toU(capFile));
    const flagStr = c.flags.map(f => `"${f}"`).join(' ');
    const cmd = `${preamble}; export HOME="${toU(home)}"; bash "${toU(scriptCopy)}" --task "${toU(tmp)}/task.txt" --work-type build --run-id "guard-${c.name}" --timeout 10 ${flagStr} 2>/dev/null`;

    try {
      execFileSync(bashPath, ['-c', cmd], {
        cwd: tmp, stdio: 'pipe', timeout: 30000,
        env: { ...process.env, HOME: toU(home), USERPROFILE: home },
      });
    } catch { /* expected — stub produces no real output */ }

    const argv = fs.existsSync(capFile)
      ? fs.readFileSync(capFile, 'utf-8').trim().split('\n').filter(Boolean) : [];
    return { name: c.name, argv, hasModel: argv.includes('--model'),
             hasAgent: argv.includes('--agent'), stubCalled: argv.length > 0 };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

// ── Run one matrix case against a self-test fixture ──────────────────────────

function runCaseFixture(bashPath, fixturePath, c) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `argv-fix-${c.name}-`));
  const capFile = path.join(tmp, 'captured-argv.txt');
  try {
    fs.writeFileSync(path.join(tmp, 'task.txt'), 'test');
    const preamble = `copilot() { printf '%s\\n' "$@" > "${toU(capFile)}"; return 0; }; export -f copilot`;
    const flagStr = c.flags.map(f => `"${f}"`).join(' ');
    const cmd = `${preamble}; bash "${toU(fixturePath)}" --task "${toU(tmp)}/task.txt" --work-type build ${flagStr}`;
    try {
      execFileSync(bashPath, ['-c', cmd], { cwd: tmp, stdio: 'pipe', timeout: 10000 });
    } catch { /* ignore */ }

    const argv = fs.existsSync(capFile)
      ? fs.readFileSync(capFile, 'utf-8').trim().split('\n').filter(Boolean) : [];
    return { name: c.name, argv, hasModel: argv.includes('--model'),
             hasAgent: argv.includes('--agent'), stubCalled: argv.length > 0 };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

// ── Self-test fixtures ───────────────────────────────────────────────────────

function writeFixture(dir, broken) {
  const tag = broken ? 'broken' : 'fixed';
  const fp = path.join(dir, `${tag}-fixture.sh`);
  const pinLine = broken
    ? '    MODEL_ARGS=(--model "$PINNED")'
    : '    MODEL_ARGS=()';
  const elseClause = broken ? '' : '  else\n    MODEL_ARGS=()';
  fs.writeFileSync(fp, [
    '#!/bin/bash',
    `MODEL="${AGENT_PIN}"; AGENT=""; MODEL_SET=false`,
    'while [ $# -gt 0 ]; do',
    '  case "$1" in',
    '    --model) MODEL="$2"; MODEL_SET=true; shift 2;;',
    '    --agent) AGENT="$2"; shift 2;;',
    '    --task|--work-type|--run-id|--timeout) shift 2;;',
    '    *) shift;;',
    '  esac',
    'done',
    'MODEL_ARGS=(--model "$MODEL"); AGENT_ARGS=()',
    'if [ -n "$AGENT" ]; then',
    '  AGENT_ARGS=(--agent "$AGENT")',
    `  PINNED="${AGENT_PIN}"`,
    '  if [ "$MODEL_SET" = false ]; then',
    pinLine,
    '  elif [ "$PINNED" != "$MODEL" ]; then',
    '    MODEL_ARGS=()',
    elseClause,
    '  fi',
    'fi',
    'copilot "${MODEL_ARGS[@]}" "${AGENT_ARGS[@]}" -p test',
    '',
  ].join('\n'));
  return fp;
}

// ── Formatters ───────────────────────────────────────────────────────────────

function formatTable(results) {
  const lines = [
    'Case                | --model? | --agent? | Expect --model | Verdict',
    '--------------------|----------|----------|----------------|--------',
  ];
  for (const r of results) {
    const pass = r.hasModel === r.expectModel && r.hasAgent === r.expectAgent;
    const m = r.stubCalled ? (r.hasModel ? 'yes' : 'no') : 'N/A';
    const a = r.stubCalled ? (r.hasAgent ? 'yes' : 'no') : 'N/A';
    lines.push(
      `${r.name.padEnd(19)} | ${m.padEnd(8)} | ${a.padEnd(8)} | ` +
      `${(r.expectModel ? 'yes' : 'no').padEnd(14)} | ${pass ? 'PASS' : 'FAIL'}`
    );
    if (!r.stubCalled) lines.push('  (stub not called — script exited before dispatch)');
  }
  return lines.join('\n');
}

function verdict(results) {
  const failed = results.filter(r => r.hasModel !== r.expectModel || r.hasAgent !== r.expectAgent);
  return { pass: failed.length === 0, failed: failed.map(r => r.name) };
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/check-dispatch-argv.mjs [OPTIONS]');
    console.log('  --target <path>  Path to copilot-worker.sh to test (default: .claude/skills/ultra-agents/copilot-worker.sh)');
    console.log('  --self-test      Run guard logic against embedded fixtures and exit');
    console.log('  --help           Print this usage and exit 0');
    console.log('Exit: 0 = PASS, 1 = FAIL, 2 = infrastructure error');
    process.exit(0);
  }
  if (args.includes('--self-test')) return selfTest();

  const tIdx = args.indexOf('--target');
  let target = DEFAULT_TARGET;
  if (tIdx >= 0) {
    const tArg = args[tIdx + 1];
    if (!tArg || tArg.startsWith('-')) {
      console.error(`--target requires a path argument${tArg ? ` (got flag '${tArg}' instead)` : ' (none given)'}`);
      process.exit(1);
    }
    target = path.resolve(tArg);
  }

  let bash;
  try { bash = resolveBash(); } catch (e) { console.error(e.message); process.exit(2); }
  if (!fs.existsSync(target)) { console.error(`Target not found: ${target}`); process.exit(2); }
  console.log(`Bash: ${bash}`);
  console.log(`Target: ${target}\n`);

  const results = CASES.map(c => ({
    ...runCaseFull(bash, target, c), expectModel: c.expectModel, expectAgent: c.expectAgent,
  }));
  console.log(formatTable(results));
  const v = verdict(results);
  console.log(`\nVERDICT: ${v.pass ? 'PASS' : 'FAIL'}${v.failed.length ? ` (failed: ${v.failed.join(', ')})` : ''}`);
  fireTelemetry(v.pass ? 'PASS' : 'FAIL', path.basename(target));
  process.exit(v.pass ? 0 : 1);
}

function selfTest() {
  let bash;
  try { bash = resolveBash(); } catch (e) { console.error(e.message); process.exit(2); }
  console.log('Self-test: verifying guard logic with embedded fixtures...\n');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'argv-selftest-'));
  let ok = true;
  try {
    const brokenPath = writeFixture(tmp, true);
    console.log('--- Broken fixture (expect FAIL on pin-only, fall-through) ---');
    const br = CASES.map(c => ({
      ...runCaseFixture(bash, brokenPath, c), expectModel: c.expectModel, expectAgent: c.expectAgent,
    }));
    console.log(formatTable(br));
    const bv = verdict(br);
    if (bv.pass) { console.log('ERROR: broken fixture produced no failures'); ok = false; }
    else {
      console.log(`OK: Broken fixture correctly detected (failed: ${bv.failed.join(', ')})`);
      fireTelemetry('DENY', 'self-test:fixture-violation');
    }
    const fixedPath = writeFixture(tmp, false);
    console.log('\n--- Fixed fixture (expect all PASS) ---');
    const fr = CASES.map(c => ({
      ...runCaseFixture(bash, fixedPath, c), expectModel: c.expectModel, expectAgent: c.expectAgent,
    }));
    console.log(formatTable(fr));
    const fv = verdict(fr);
    if (!fv.pass) { console.log(`ERROR: fixed fixture has failures: ${fv.failed.join(', ')}`); ok = false; }
    else console.log('OK: Fixed fixture correctly passed');
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  }

  console.log(`\nVERDICT: ${ok ? 'PASS' : 'FAIL'}`);
  fireTelemetry(ok ? 'PASS' : 'FAIL', 'self-test');
  process.exit(ok ? 0 : 1);
}

main();
