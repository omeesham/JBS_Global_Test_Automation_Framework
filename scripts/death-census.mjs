#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import {
  closeSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  readSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_ROOT = join(REPO_ROOT, '.claude', 'state', 'ua-worker');
const DEFAULT_LEDGER = join(DEFAULT_ROOT, 'ledger.jsonl');
const DEFAULT_OUT = join(DEFAULT_ROOT, 'death-audit');

const RUN_FILES = new Set(['result.md', 'err.txt', 'live-output.log', 'task.md', 'meta.json']);
const TOKENS = new Set([
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'C9',
  'C10',
  'C11',
  'C12',
  'DISPUTED_NOT_DEATH',
  'UNCLASSIFIED',
]);

const SELF_FAIL_RE = /^\s*(?:#{1,6}\s*)?(?:VERDICT:\s*NOT-FIXED|SESSION LIMIT REACHED\b|no implementation completed\b|result\.md was not written\b)/i;
const NETWORK_RE = /^\s*(?:(?:Execution failed: Error:|Error:|FetchError:|RequestError:|Last error:).*)?(?:Failed native model HTTP request|ENOTFOUND|dns error|No such host|ECONNRESET|error sending request)\b/i;
const BUDGET_RE = /^\s*(?:(?:copilot-worker|worker|github copilot|copilot(?: cli)?):\s*)?(?:SESSION LIMIT(?: REACHED)?\b|Session limit reached\b|session budget exhausted\b|credit[- ]?exhaust(?:ed|ion)?\b|budget[- ]?exhaust(?:ed|ion)?\b|ran out of credits\b|usage\.limit\b|rate\.limit\b|capacity\b|overloaded\b|vote_memory budget exhausted\b|worker stopped:\s*credit[- ]?exhausted\b)/i;
const TIMEOUT_RE = /^\s*(?:copilot-worker:\s*WALL-CEILING\b|(?:exit=?)?124\b|timeout\b|timed out\b|wall[- ]?(?:clock|ceiling|timeout)\b|SIGALRM\b|killed.*timeout\b)/i;
const WRAPPER_RE = /^\s*copilot-worker:\s*(?:--effort .* is not a valid tier\b|invalid.*--effort\b|missing.*--work-type\b|--work-type required\b|unknown --work-type\b|unknown arg\b|reused run-id\b|run\.id already exists\b|session limit reached.*no further tool calls\b)/i;
const RESOLVER_RE = /^\s*copilot-worker:\s*FATAL\b.*(?:model.*(?:resolver|registry|not.*resolved)|resolver.*fall|effort mismatch|sonnet-4\.6.*haiku)/i;
const REGISTRY_RE = /^\s*copilot-worker:\s*FATAL\b.*(?:agent.*registry|unknown agent|no agents found|agent.*not found|empty agent list|--agent .*does not exist|agent .*has no model|variant agent)/i;
const STALL_RE = /^\s*copilot-worker:\s*(?:STALL-WARN|STALL-KILL)\b/i;
const C8_FATAL_RE = /^\s*copilot-worker:\s*FATAL\s*(?:—|-)\s*debug log contains MULTIPLE DISTINCT models\b/i;
const C8_META_VERDICTS = new Set(['MULTI_MODEL_CAUGHT', 'SUBSTITUTION_CAUGHT']);
const NO_OUTPUT_STATES = new Set(['missing', 'empty', 'sentinel', 'stub', 'self-fail', 'read-error', 'no-dir']);

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    if (key === 'classify-one' || key === 'self-test') {
      args[key] = true;
      continue;
    }
    args[key] = argv[index + 1];
    index += 1;
  }
  return args;
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeStat(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}

function isDirectory(path) {
  const stat = safeStat(path);
  return Boolean(stat && stat.isDirectory());
}

function readLimited(path, maxBytes, fromEnd = false) {
  if (!existsSync(path)) return { exists: false, text: '', error: null };
  let fd = null;
  try {
    const stat = statSync(path);
    if (!stat.isFile()) return { exists: true, text: '', error: 'not a file' };
    const bytes = Math.min(stat.size, maxBytes);
    const buffer = Buffer.alloc(bytes);
    fd = openSync(path, 'r');
    const offset = fromEnd ? Math.max(0, stat.size - bytes) : 0;
    const count = readSync(fd, buffer, 0, bytes, offset);
    return { exists: true, text: buffer.toString('utf8', 0, count), error: null, size: stat.size };
  } catch (error) {
    return { exists: true, text: '', error: error && error.message ? error.message : String(error) };
  } finally {
    if (fd !== null) {
      try {
        closeSync(fd);
      } catch {
        // Best-effort close after a read failure; the read-error remains explicit in the caller.
      }
    }
  }
}

function tailText(path, maxChars = 4000) {
  const read = readLimited(path, maxChars * 4, true);
  if (!read.exists) return '';
  if (read.error) return `[read-error: ${read.error}]`;
  return read.text.slice(-maxChars);
}

function headText(path, maxBytes = 2048) {
  return readLimited(path, maxBytes, false);
}

function firstLine(text) {
  return (text.split(/\r?\n/, 1)[0] || '').trim();
}

function firstNonBlankLine(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function quote(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 200);
}

function firstMatchingLine(text, regex) {
  for (const line of String(text || '').split(/\r?\n/)) {
    if (regex.test(line)) return quote(line);
  }
  return '';
}

function firstMatchingLineAny(text, regexes) {
  for (const regex of regexes) {
    const line = firstMatchingLine(text, regex);
    if (line) return line;
  }
  return '';
}

function c8Line(errText) {
  for (const line of String(errText || '').split(/\r?\n/)) {
    if (C8_FATAL_RE.test(line)) {
      return quote(line);
    }
  }
  return '';
}

function readMetaVerdict(runDir) {
  if (!runDir || !isDirectory(runDir)) return null;
  const read = readLimited(join(runDir, 'meta.json'), 4096, false);
  if (!read.exists || read.error || !read.text.trim()) return null;
  try {
    const parsed = JSON.parse(read.text);
    return typeof parsed?.verdict === 'string' ? parsed.verdict : null;
  } catch {
    return null;
  }
}

function inspectResult(runDir) {
  if (!runDir || !isDirectory(runDir)) return { state: 'no-dir', quote: 'run directory missing' };
  const resultPath = join(runDir, 'result.md');
  if (!existsSync(resultPath)) return { state: 'missing', quote: 'result.md missing' };

  const stat = safeStat(resultPath);
  if (!stat || !stat.isFile()) return { state: 'read-error', quote: 'result.md is not a readable file' };
  if (stat.size === 0) return { state: 'empty', quote: 'result.md zero bytes' };

  const head = headText(resultPath, 2048);
  if (head.error) return { state: 'read-error', quote: `result.md read-error: ${head.error}` };

  const trimmedHead = head.text.trim();
  if (!trimmedHead && stat.size <= 2048) return { state: 'empty', quote: 'result.md whitespace only' };

  const physicalFirst = firstLine(head.text);
  if (/copilot-worker:\s*NO DELIVERABLE/i.test(physicalFirst)) {
    return { state: 'sentinel', quote: physicalFirst || 'copilot-worker: NO DELIVERABLE' };
  }

  if (stat.size <= 8192) {
    const full = readLimited(resultPath, 8192, false);
    if (full.error) return { state: 'read-error', quote: `result.md read-error: ${full.error}` };
    const nonBlank = full.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (
      nonBlank.length === 1
      && (/copilot-worker:\s*STEP-0 stub/i.test(nonBlank[0]) || /STEP-0 stub:/i.test(nonBlank[0]))
    ) {
      return { state: 'stub', quote: nonBlank[0] };
    }
  }

  const failureLine = firstMatchingLine(head.text, SELF_FAIL_RE);
  if (failureLine) return { state: 'self-fail', quote: failureLine };

  return { state: 'present', quote: firstNonBlankLine(head.text).slice(0, 200) };
}

function readJsonl(path) {
  if (!existsSync(path)) return [];
  const text = readFileSync(path, 'utf8');
  return text.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Bad JSONL at ${path}:${index + 1}: ${error.message}`);
    }
  });
}

function listDiskRunIds(root, ledgerIds) {
  if (!isDirectory(root)) return new Set();
  const ids = new Set();
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);
    if (ledgerIds.has(entry.name)) {
      ids.add(entry.name);
      continue;
    }
    let names = [];
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    if (names.some((name) => RUN_FILES.has(name) || /^process-.*\.log$/i.test(name))) ids.add(entry.name);
  }
  return ids;
}

function processTail(runDir) {
  if (!isDirectory(runDir)) return '';
  let names = [];
  try {
    names = readdirSync(runDir).filter((name) => /^process-.*\.log$/i.test(name)).sort();
  } catch {
    return '';
  }
  return names.map((name) => tailText(join(runDir, name), 2000)).filter(Boolean).join('\n');
}

function buildFacts({ runId, row, hasLedgerRow, runDir, includeProcess = true, singleMode = false, args = {} }) {
  const result = inspectResult(runDir);
  const errTail = tailText(join(runDir || '', 'err.txt'), 4000);
  const liveTail = tailText(join(runDir || '', 'live-output.log'), 4000);
  const procTail = includeProcess ? processTail(runDir) : '';
  const metaVerdict = readMetaVerdict(runDir);
  const exit = numberOrNull(singleMode ? args.exit : row.exit);
  const secs = numberOrNull(singleMode ? args.secs : row.secs);
  const stallWarns = numberOrNull(singleMode ? args['stall-warns'] : row.stall_warns) || 0;
  const deliverable = singleMode ? args.deliverable : row.deliverable;
  const exitReason = singleMode ? args['exit-reason'] : row.exit_reason;
  const ok = singleMode ? undefined : row.ok;
  const signals = [];
  const ledgerSuccess = !singleMode
    && exit === 0
    && row.ok === true
    && (!exitReason || exitReason === 'success')
    && (!deliverable || deliverable === 'present');

  if (!singleMode) {
    if (exit !== null && exit !== 0) signals.push(`exit=${exit}`);
    if (row.ok === false) signals.push('ok=false');
    if (exitReason && exitReason !== 'success') signals.push(`exit_reason=${exitReason}`);
    if (deliverable && deliverable !== 'present') signals.push(`deliverable=${deliverable}`);
    if (!hasLedgerRow) signals.push('no-ledger-row');
    if (hasLedgerRow && !isDirectory(runDir) && !ledgerSuccess) signals.push('no-run-dir');
  } else {
    if (exit !== null && exit !== 0) signals.push(`exit=${exit}`);
    if (exitReason && exitReason !== 'success') signals.push(`exit_reason=${exitReason}`);
    if (deliverable && deliverable !== 'present') signals.push(`deliverable=${deliverable}`);
  }

  const stallCanSignal = singleMode || row.ok === false || deliverable === 'missing' || exitReason === 'no-deliverable' || exitReason === 'stall';
  if (stallWarns > 0 && stallCanSignal) signals.push(`stall_warns=${stallWarns}`);
  const resultCanSignal = singleMode || !ledgerSuccess || !hasLedgerRow;
  if (result.state === 'missing' && resultCanSignal) signals.push('result.md-missing');
  if (result.state === 'empty' && resultCanSignal) signals.push('result.md-empty');
  if (result.state === 'sentinel') signals.push('result.md-sentinel');
  if (result.state === 'stub') signals.push('result.md-step0-stub');
  if (result.state === 'self-fail') signals.push('self-declared-failure');
  if (result.state === 'read-error' && resultCanSignal) signals.push('result.md-read-error');

  return {
    run_id: runId,
    row,
    hasLedgerRow,
    singleMode,
    runDir,
    signals,
    errTail,
    liveTail,
    processTail: procTail,
    meta_verdict: metaVerdict,
    result_state: result.state,
    result_quote: result.quote,
    exit,
    ok,
    exit_reason: exitReason || null,
    secs,
    stall_warns: stallWarns,
    deliverable: deliverable || null,
  };
}

function isDisputedNotDeath(facts) {
  const exitOk = facts.exit === 0;
  const okTrue = facts.singleMode ? true : facts.ok === true;
  const reasonOk = !facts.exit_reason || facts.exit_reason === 'success';
  return facts.deliverable === 'not-declared' && exitOk && okTrue && reasonOk;
}

function classifyFacts(facts) {
  const errLive = `${facts.errTail}\n${facts.liveTail}`;
  const allLogs = `${errLive}\n${facts.processTail}`;
  const signalText = facts.signals.join(' ');

  if (isDisputedNotDeath(facts)) {
    return { class: 'DISPUTED_NOT_DEATH', evidence: 'deliverable=not-declared exit=0 ok=true; no deliverable oracle armed' };
  }

  if (C8_META_VERDICTS.has(facts.meta_verdict) && (facts.singleMode || !facts.hasLedgerRow)) {
    return { class: 'C8', evidence: `meta.json verdict=${facts.meta_verdict}` };
  }

  const c8 = c8Line(facts.errTail);
  if (c8) return { class: 'C8', evidence: c8 };

  const network = firstMatchingLineAny(allLogs, [NETWORK_RE]);
  if (network) return { class: 'C9', evidence: network };

  const wrapper = firstMatchingLineAny(allLogs, [WRAPPER_RE]);
  if (wrapper) return { class: 'C5', evidence: wrapper };

  const resolver = firstMatchingLineAny(allLogs, [RESOLVER_RE]);
  if (resolver || facts.exit_reason === 'model-resolver') {
    return { class: 'C6', evidence: resolver || `exit_reason=${facts.exit_reason}` };
  }

  const registry = firstMatchingLineAny(allLogs, [REGISTRY_RE]);
  if (registry || facts.exit_reason === 'agent-registry') {
    return { class: 'C7', evidence: registry || `exit_reason=${facts.exit_reason}` };
  }

  const budget = firstMatchingLineAny(allLogs, [BUDGET_RE]);
  if (budget || facts.exit_reason === 'credit-exhaustion' || facts.exit_reason === 'budget-exhausted') {
    return { class: 'C1', evidence: budget || `exit_reason=${facts.exit_reason}` };
  }

  const timeout = firstMatchingLineAny(allLogs, [TIMEOUT_RE]);
  if (facts.exit === 124 || timeout || facts.exit_reason === 'timeout') {
    return { class: 'C2', evidence: timeout || `exit=${facts.exit}` };
  }

  if (facts.stall_warns > 0) return { class: 'C4', evidence: `stall_warns=${facts.stall_warns}` };
  const stall = firstMatchingLineAny(allLogs, [STALL_RE]);
  if (stall || facts.exit_reason === 'stall') return { class: 'C4', evidence: stall || `exit_reason=${facts.exit_reason}` };

  if (facts.signals.includes('no-run-dir') && !facts.signals.includes('no-ledger-row')) {
    return { class: 'C12', evidence: 'ledger row exists but run directory is absent' };
  }

  if (facts.exit === 0 && facts.ok === true && facts.result_state === 'empty') {
    return { class: 'C11', evidence: 'exit=0 ok=true with zero-byte result.md' };
  }

  const veryShort = facts.secs !== null && facts.secs <= 10;
  if ((veryShort || facts.secs === null) && facts.exit !== null && facts.exit !== 0 && ['missing', 'empty', 'no-dir'].includes(facts.result_state)) {
    return { class: 'C10', evidence: `short/no-preamble output: exit=${facts.exit} secs=${facts.secs ?? 'unknown'} result=${facts.result_state}` };
  }

  const declaredMissing = facts.deliverable && facts.deliverable !== 'present';
  const schemaFailure = ['no-report-schema', 'no-deliverable', 'no-declared-output'].includes(facts.exit_reason);
  const noReportSchema = facts.row?.ask_open === 'missing-section' || facts.row?.report_sections === 0 || schemaFailure;
  if (schemaFailure || facts.deliverable === 'missing' || facts.result_state === 'self-fail') {
    return { class: 'C3', evidence: facts.result_quote || signalText || 'declared report or deliverable schema missing' };
  }
  if ((declaredMissing || noReportSchema || facts.signals.includes('no-ledger-row')) && NO_OUTPUT_STATES.has(facts.result_state)) {
    return { class: 'C3', evidence: facts.result_quote || signalText || 'declared output missing or incomplete' };
  }

  return { class: 'UNCLASSIFIED', evidence: signalText || facts.result_quote || 'no decisive class signature' };
}

function isCandidate(facts) {
  return facts.signals.length > 0;
}

function rowForOutput(facts, classification) {
  const row = facts.row || {};
  return {
    run_id: facts.run_id,
    ts: row.ts || null,
    model: row.model || null,
    agent: row.agent || null,
    work_type: row.work_type || null,
    effort: row.effort || null,
    mode: row.mode || null,
    exit: facts.exit,
    exit_reason: facts.exit_reason,
    secs: facts.secs,
    attempt: row.attempt ?? null,
    ticket_id: row.ticket_id || null,
    signals: facts.signals,
    class: classification.class,
    evidence: quote(classification.evidence),
    err_tail: quote(facts.errTail),
    live_tail: quote(facts.liveTail),
    result_state: facts.result_state,
  };
}

function countBy(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function sortedCountLines(counts) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, value]) => `  ${key}: ${value}`);
}

function sortedPostLines(counts, postCounts) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, value]) => `  ${key}: ${postCounts.get(key) || 0} / ${value}`);
}

function isPostSince(row, since) {
  if (!since) return true;
  return Boolean(row.ts && String(row.ts) > since);
}

function representativeLines(rows) {
  const lines = [];
  const classes = [...new Set(rows.map((row) => row.class))].sort();
  for (const klass of classes) {
    lines.push(`- ${klass}:`);
    for (const row of rows.filter((candidate) => candidate.class === klass).slice(0, 3)) {
      lines.push(`  - ${row.run_id}: "${quote(row.evidence)}"`);
    }
  }
  return lines;
}

function unclassifiedLines(rows) {
  const unclassified = rows.filter((row) => row.class === 'UNCLASSIFIED');
  if (unclassified.length === 0) return ['  none'];
  return unclassified.map((row) => `  - ${row.run_id}: signals=${row.signals.join('|') || 'none'} evidence="${quote(row.evidence)}"`);
}

function buildSummary({ ledgerRows, diskRunIds, unionIds, rows, since }) {
  const counts = countBy(rows, (row) => row.class);
  const postCounts = countBy(rows.filter((row) => isPostSince(row, since)), (row) => row.class);
  const hardDeaths = rows.filter((row) => row.class !== 'DISPUTED_NOT_DEATH').length;
  const lines = [
    '# Death Census Summary',
    '',
    `Ledger rows: ${ledgerRows.length}`,
    `Disk run dirs: ${diskRunIds.size}`,
    `Union (unique run IDs): ${unionIds.size}`,
    `Death candidates: ${rows.length}`,
    `Hard deaths excluding DISPUTED_NOT_DEATH: ${hardDeaths}`,
    '',
    '## Deaths by class',
    ...sortedCountLines(counts),
    '',
    `## Post-${since || 'beginning'} recurrence by class`,
    ...sortedPostLines(counts, postCounts),
    '',
    '## Representative run_ids',
    ...representativeLines(rows),
    '',
    '## UNCLASSIFIED remainder',
    ...unclassifiedLines(rows),
  ];
  return `${lines.join('\n')}\n`;
}

function runFull(args) {
  const ledgerPath = resolve(args.ledger || DEFAULT_LEDGER);
  const root = resolve(args.root || DEFAULT_ROOT);
  const outDir = resolve(args.out || DEFAULT_OUT);
  const since = args.since || null;
  const ledgerRows = readJsonl(ledgerPath);
  const ledgerByRunId = new Map();
  for (const row of ledgerRows) {
    if (row && row.run_id) ledgerByRunId.set(String(row.run_id), row);
  }
  const ledgerIds = new Set(ledgerByRunId.keys());
  const diskRunIds = listDiskRunIds(root, ledgerIds);
  const unionIds = new Set([...ledgerIds, ...diskRunIds]);
  const rows = [];

  for (const runId of [...unionIds].sort()) {
    const row = ledgerByRunId.get(runId) || {};
    const hasLedgerRow = ledgerByRunId.has(runId);
    const runDir = join(root, runId);
    const facts = buildFacts({ runId, row, hasLedgerRow, runDir, includeProcess: true });
    if (!isCandidate(facts)) continue;
    const classification = classifyFacts(facts);
    rows.push(rowForOutput(facts, classification));
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'death-census.jsonl'), `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`, 'utf8');
  const summary = buildSummary({ ledgerRows, diskRunIds, unionIds, rows, since });
  writeFileSync(join(outDir, 'death-census.md'), summary, 'utf8');
  process.stdout.write(summary);
}

function classifyOne(args) {
  const runDir = args['run-dir'] ? resolve(args['run-dir']) : '';
  if (!runDir || !isDirectory(runDir)) return 'UNCLASSIFIED';
  const facts = buildFacts({
    runId: basename(runDir),
    row: {},
    hasLedgerRow: false,
    runDir,
    includeProcess: false,
    singleMode: true,
    args,
  });
  const classification = classifyFacts(facts);
  return TOKENS.has(classification.class) ? classification.class : 'UNCLASSIFIED';
}

function writeFixture(dir, files) {
  mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content, 'utf8');
  }
}

function runClassifyFixture(runDir, args) {
  const result = spawnSync(process.execPath, [SCRIPT_PATH, '--classify-one', '--run-dir', runDir, ...args], {
    encoding: 'utf8',
    windowsHide: true,
  });
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
  };
}

function classifyFixtureDirect(runDir) {
  const facts = buildFacts({
    runId: basename(runDir),
    row: {},
    hasLedgerRow: false,
    runDir,
    includeProcess: true,
  });
  return classifyFacts(facts).class;
}

function runSelfTest() {
  const temp = mkdtempSync(join(tmpdir(), 'death-census-'));
  const cases = [];
  try {
    const addCase = (name, files, args, expected) => {
      const dir = join(temp, name.replace(/[^a-z0-9_-]/gi, '-'));
      writeFixture(dir, files);
      cases.push({ name, dir, args, expected });
    };

    addCase('network-c9-not-c3', {
      'err.txt': 'Execution failed: Error: Failed native model HTTP request: error sending request for url https://example.invalid\n',
    }, ['--exit', '1', '--deliverable', 'missing'], 'C9');
    addCase('budget-c1', { 'live-output.log': 'worker stopped: credit-exhausted before completion\n' }, ['--exit', '1'], 'C1');
    addCase('wall-timeout-c2', {}, ['--exit', '124', '--secs', '600'], 'C2');
    addCase('stall-c4', {}, ['--exit', '1', '--stall-warns', '2'], 'C4');
    addCase('stub-only-c3', { 'result.md': '<!-- copilot-worker: STEP-0 stub -->\n' }, ['--exit', '0', '--deliverable', 'missing'], 'C3');
    addCase('c8-meta-multimodel', { 'meta.json': '{"verdict":"MULTI_MODEL_CAUGHT"}\n' }, [], 'C8');
    addCase('c8-meta-substitution', { 'meta.json': '{"verdict":"SUBSTITUTION_CAUGHT"}\n' }, [], 'C8');
    addCase('c8-err-fatal', { 'err.txt': 'copilot-worker: FATAL — debug log contains MULTIPLE DISTINCT models: claude-sonnet-4.5 gpt-5.5 — refusing to record.\n' }, ['--exit', '1'], 'C8');
    addCase('c8-err-fatal-plain-hyphen', { 'err.txt': 'copilot-worker: FATAL - debug log contains MULTIPLE DISTINCT models: claude-sonnet-4.5 gpt-5.5 - refusing to record.\n' }, ['--exit', '1'], 'C8');
    addCase('c8-live-output-prose-false-positive', {
      'live-output.log': '- C8 requires `copilot-worker: FATAL` and `MULTIPLE DISTINCT models` in err/live output, not copied task/source text.\n',
    }, ['--exit-reason', 'success', '--exit', '0'], 'UNCLASSIFIED');
    addCase('c8-ticket-body-false-positive', {
      'task.md': 'Ticket text says MULTIPLE DISTINCT models but this is copied source text.\n',
      'result.md': '# Real report\n',
    }, [], 'UNCLASSIFIED');
    addCase('malformed-meta-falls-through', {
      'meta.json': '{"verdict":"MULTI_MODEL_CAUGHT"',
      'err.txt': 'Execution failed: Error: Failed native model HTTP request: error sending request for url https://example.invalid\n',
    }, ['--exit', '1'], 'C9');
    addCase('disputed-not-death', {}, ['--exit', '0', '--deliverable', 'not-declared'], 'DISPUTED_NOT_DEATH');
    addCase('non-empty-result-not-empty', { 'result.md': '# REPORT\n\nreal content\n' }, ['--exit', '0', '--deliverable', 'present'], 'UNCLASSIFIED');
    const processFalsePositiveDir = join(temp, 'c8-process-ticket-false-positive');
    writeFixture(processFalsePositiveDir, {
      'process-1.log': 'Copied ticket says copilot-worker: FATAL — debug log contains MULTIPLE DISTINCT models: a b — refusing to record.\n',
      'result.md': '# Real report\n',
    });
    cases.push({ name: 'c8-process-ticket-false-positive', dir: processFalsePositiveDir, args: [], expected: 'UNCLASSIFIED', direct: true });

    let passed = 0;
    const failures = [];
    for (const testCase of cases) {
      const result = testCase.direct
        ? { stdout: classifyFixtureDirect(testCase.dir), stderr: '', status: 0 }
        : runClassifyFixture(testCase.dir, testCase.args);
      const actual = result.stdout;
      if (result.status === 0 && actual === testCase.expected && result.stderr === '') {
        passed += 1;
      } else {
        failures.push(`${testCase.name}: expected ${testCase.expected}, got stdout=${JSON.stringify(actual)} stderr=${JSON.stringify(result.stderr)} status=${result.status}`);
      }
    }

    const missing = runClassifyFixture(join(temp, 'missing-dir'), []);
    cases.push({ name: 'missing-dir', expected: 'UNCLASSIFIED' });
    if (missing.status === 0 && missing.stdout === 'UNCLASSIFIED' && missing.stderr === '') {
      passed += 1;
    } else {
      failures.push(`missing-dir: expected UNCLASSIFIED, got stdout=${JSON.stringify(missing.stdout)} stderr=${JSON.stringify(missing.stderr)} status=${missing.status}`);
    }

    const total = cases.length;
    if (failures.length) {
      console.error(failures.join('\n'));
      console.log(`SELF-TEST: ${passed}/${total} passed`);
      process.exitCode = 1;
      return;
    }
    console.log(`SELF-TEST: ${passed}/${total} passed`);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args['classify-one']) {
    try {
      process.stdout.write(classifyOne(args));
    } catch {
      process.stdout.write('UNCLASSIFIED');
    }
    return;
  }
  if (args['self-test']) {
    runSelfTest();
    return;
  }
  runFull(args);
}

main();
