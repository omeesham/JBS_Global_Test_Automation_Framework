#!/usr/bin/env node
// validate-overrides.mjs — Schema lint + author check for .claude/closure-overrides.json.
//
// Modes:
//   (no flags)     Validate on-disk file (retro audit / manual check).
//   --staged       Validate staged blob via git show (pre-commit mode, V3 fix).
//   --self-test    Run synthetic schema-rejection tests.
//   --json         Structured output to stdout.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const OVERRIDES_PATH = join(REPO_ROOT, '.claude', 'closure-overrides.json');
const SCHEMA_PATH = join(REPO_ROOT, '.claude', 'closure-overrides.schema.json');
const AUTHORS_PATH = join(REPO_ROOT, '.claude', 'closure-overrides-authors.txt');

function gitExec(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf-8', ...opts }).trim();
  } catch (e) {
    const msg = String(e.stderr || e.message || '');
    if (msg.includes('dubious ownership')) {
      throw new Error(`Git dubious-ownership error. Run: git config --global --add safe.directory "${REPO_ROOT}"`);
    }
    throw e;
  }
}

const ALLOWED_TOKENS = [
  'NOT-WALKED', 'NOT WALKED',
  'PROBABLE-FAIL-APP', 'PROBABLE-FAIL-FRAMEWORK', 'PROBABLE-FAIL-TEST',
  'PROBABLE-PASS-APP', 'PROBABLE-PASS-FRAMEWORK', 'PROBABLE-PASS-TEST',
  'PROBABLE-SKIP-APP', 'PROBABLE-SKIP-FRAMEWORK', 'PROBABLE-SKIP-TEST',
  'BLOCKED-BY-FIXME-DESIGN',
  'surface-exists: divergent',
  'not captured',
  'not exercised',
];

const PLAN_NAME_RX = /^[A-Z0-9_-]+\.md$/;

function loadSchema() {
  if (!existsSync(SCHEMA_PATH)) return null;
  try {
    return JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

function validateOverrides(content, source) {
  const findings = [];

  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    findings.push({ level: 'RED', msg: `JSON parse error (${source}): ${e.message}` });
    return findings;
  }

  if (data.version !== 1) {
    findings.push({ level: 'RED', msg: `version must be 1, got ${data.version}` });
  }

  if (!Array.isArray(data.overrides)) {
    findings.push({ level: 'RED', msg: 'overrides must be an array' });
    return findings;
  }

  if (!Array.isArray(data.meta_plans)) {
    findings.push({ level: 'RED', msg: 'meta_plans must be an array' });
    return findings;
  }

  const allowedRootKeys = new Set(['$schema', 'version', 'overrides', 'meta_plans']);
  for (const key of Object.keys(data)) {
    if (!allowedRootKeys.has(key)) {
      findings.push({ level: 'RED', msg: `Unknown root key "${key}" (additionalProperties: false)` });
    }
  }

  for (let i = 0; i < data.overrides.length; i++) {
    const o = data.overrides[i];
    const prefix = `overrides[${i}]`;

    const allowedKeys = new Set(['plan', 'tokens', 'path_match', 'expires_at', 'reason', 'granted_at']);
    for (const key of Object.keys(o)) {
      if (!allowedKeys.has(key)) {
        findings.push({ level: 'RED', msg: `${prefix}: unknown key "${key}" (additionalProperties: false)` });
      }
    }

    if (!o.plan || typeof o.plan !== 'string') {
      findings.push({ level: 'RED', msg: `${prefix}.plan: missing or not a string` });
    } else if (!PLAN_NAME_RX.test(o.plan)) {
      findings.push({ level: 'RED', msg: `${prefix}.plan: "${o.plan}" does not match ^[A-Z0-9_-]+\\.md$ (no wildcards)` });
    }

    if (!Array.isArray(o.tokens)) {
      findings.push({ level: 'RED', msg: `${prefix}.tokens: must be an array` });
    } else {
      if (o.tokens.length > 2) {
        findings.push({ level: 'RED', msg: `${prefix}.tokens: maxItems is 2, got ${o.tokens.length}` });
      }
      for (const t of o.tokens) {
        if (!ALLOWED_TOKENS.includes(t)) {
          findings.push({ level: 'RED', msg: `${prefix}.tokens: "${t}" is not in the allowed token list` });
        }
      }
    }

    if (o.path_match !== 'exact') {
      findings.push({ level: 'RED', msg: `${prefix}.path_match: must be "exact", got "${o.path_match}"` });
    }

    if (!o.expires_at || typeof o.expires_at !== 'string') {
      findings.push({ level: 'RED', msg: `${prefix}.expires_at: required date-time string` });
    } else if (isNaN(new Date(o.expires_at).getTime())) {
      findings.push({ level: 'RED', msg: `${prefix}.expires_at: invalid date-time "${o.expires_at}"` });
    }

    if (!o.reason || typeof o.reason !== 'string') {
      findings.push({ level: 'RED', msg: `${prefix}.reason: required string` });
    } else if (o.reason.length < 40) {
      findings.push({ level: 'RED', msg: `${prefix}.reason: minLength 40, got ${o.reason.length}` });
    }

    if (!o.granted_at || typeof o.granted_at !== 'string') {
      findings.push({ level: 'RED', msg: `${prefix}.granted_at: required date-time string` });
    } else if (isNaN(new Date(o.granted_at).getTime())) {
      findings.push({ level: 'RED', msg: `${prefix}.granted_at: invalid date-time "${o.granted_at}"` });
    }
  }

  for (let i = 0; i < data.meta_plans.length; i++) {
    const mp = data.meta_plans[i];
    if (typeof mp !== 'string' || !PLAN_NAME_RX.test(mp)) {
      findings.push({ level: 'RED', msg: `meta_plans[${i}]: "${mp}" does not match ^[A-Z0-9_-]+\\.md$` });
    }
  }

  return findings;
}

function checkAuthor() {
  const findings = [];
  if (!existsSync(AUTHORS_PATH)) {
    findings.push({ level: 'YELLOW', msg: 'closure-overrides-authors.txt not found — cannot verify commit author' });
    return findings;
  }

  const allowedAuthors = readFileSync(AUTHORS_PATH, 'utf-8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  if (allowedAuthors.length === 0) {
    findings.push({ level: 'YELLOW', msg: 'closure-overrides-authors.txt is empty' });
    return findings;
  }

  try {
    const email = gitExec('git config user.email');
    if (!allowedAuthors.includes(email)) {
      findings.push({ level: 'RED', msg: `Commit author "${email}" not in closure-overrides-authors.txt (best-effort attribution, not cryptographic proof — V2 caveat)` });
    }
  } catch {
    findings.push({ level: 'YELLOW', msg: 'Could not determine git user.email for author check' });
  }

  return findings;
}

function runValidation(staged, json) {
  let content;
  let source;

  if (staged) {
    try {
      content = gitExec('git show :.claude/closure-overrides.json');
      source = 'staged blob (git show :path)';
    } catch (e) {
      const msg = `Cannot read staged blob: ${e.message}`;
      if (json) {
        console.log(JSON.stringify({ mode: 'staged', findings: [{ level: 'RED', msg }], red_count: 1, yellow_count: 0 }, null, 2));
      } else {
        console.error(`[RED] ${msg}`);
      }
      return 1;
    }
  } else {
    if (!existsSync(OVERRIDES_PATH)) {
      const msg = 'closure-overrides.json not found on disk';
      if (json) {
        console.log(JSON.stringify({ mode: 'disk', findings: [{ level: 'RED', msg }], red_count: 1, yellow_count: 0 }, null, 2));
      } else {
        console.error(`[RED] ${msg}`);
      }
      return 1;
    }
    content = readFileSync(OVERRIDES_PATH, 'utf-8');
    source = 'disk';
  }

  const findings = [];
  findings.push(...validateOverrides(content, source));
  findings.push(...checkAuthor());

  const reds = findings.filter(f => f.level === 'RED');
  const yellows = findings.filter(f => f.level === 'YELLOW');

  if (json) {
    console.log(JSON.stringify({ mode: staged ? 'staged' : 'disk', source, findings, red_count: reds.length, yellow_count: yellows.length }, null, 2));
  } else {
    if (findings.length === 0) {
      console.log('validate-overrides: ALL GREEN');
    } else {
      for (const f of findings) {
        console.log(`[${f.level}] ${f.msg}`);
      }
      console.log(`\n${reds.length} RED, ${yellows.length} YELLOW`);
    }
  }

  return reds.length > 0 ? 1 : 0;
}

// === --self-test mode ===
function runSelfTest() {
  let pass = 0;
  let fail = 0;

  function assert(label, condition) {
    if (condition) {
      pass++;
    } else {
      console.error(`FAIL: ${label}`);
      fail++;
    }
  }

  // Valid minimal override file
  const validContent = JSON.stringify({
    version: 1,
    overrides: [],
    meta_plans: ['PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md'],
  });
  assert('Valid empty-overrides file passes', validateOverrides(validContent, 'test').length === 0);

  // Wildcards rejected
  const wildcardPlan = JSON.stringify({
    version: 1,
    overrides: [{ plan: '*.md', tokens: ['NOT-WALKED'], path_match: 'exact', expires_at: '2026-12-31T00:00:00.000Z', reason: 'This is a test reason that is long enough to pass minLength of forty characters', granted_at: '2026-05-18T00:00:00.000Z' }],
    meta_plans: [],
  });
  const wildcardFindings = validateOverrides(wildcardPlan, 'test');
  assert('Wildcard plan rejected', wildcardFindings.some(f => f.msg.includes('does not match')));

  // Missing expiry rejected
  const noExpiry = JSON.stringify({
    version: 1,
    overrides: [{ plan: 'SOME_PLAN.md', tokens: ['NOT-WALKED'], path_match: 'exact', reason: 'This is a test reason that is long enough to pass minLength of forty characters', granted_at: '2026-05-18T00:00:00.000Z' }],
    meta_plans: [],
  });
  const noExpiryFindings = validateOverrides(noExpiry, 'test');
  assert('Missing expires_at rejected', noExpiryFindings.some(f => f.msg.includes('expires_at')));

  // Short reason rejected
  const shortReason = JSON.stringify({
    version: 1,
    overrides: [{ plan: 'SOME_PLAN.md', tokens: ['NOT-WALKED'], path_match: 'exact', expires_at: '2026-12-31T00:00:00.000Z', reason: 'too short', granted_at: '2026-05-18T00:00:00.000Z' }],
    meta_plans: [],
  });
  const shortReasonFindings = validateOverrides(shortReason, 'test');
  assert('Short reason (<40 chars) rejected', shortReasonFindings.some(f => f.msg.includes('minLength 40')));

  // closure_circular_ok rejected (additionalProperties: false)
  const circularOk = JSON.stringify({
    version: 1,
    overrides: [],
    meta_plans: [],
    closure_circular_ok: true,
  });
  const circularOkFindings = validateOverrides(circularOk, 'test');
  assert('closure_circular_ok rejected (additionalProperties: false)', circularOkFindings.some(f => f.msg.includes('Unknown root key') && f.msg.includes('closure_circular_ok')));

  // Unknown override key rejected
  const unknownKey = JSON.stringify({
    version: 1,
    overrides: [{ plan: 'SOME_PLAN.md', tokens: ['NOT-WALKED'], path_match: 'exact', expires_at: '2026-12-31T00:00:00.000Z', reason: 'This is a test reason that is long enough to pass minLength of forty characters', granted_at: '2026-05-18T00:00:00.000Z', extra_field: true }],
    meta_plans: [],
  });
  const unknownKeyFindings = validateOverrides(unknownKey, 'test');
  assert('Unknown override key rejected (additionalProperties: false)', unknownKeyFindings.some(f => f.msg.includes('unknown key') && f.msg.includes('extra_field')));

  // Invalid token rejected
  const badToken = JSON.stringify({
    version: 1,
    overrides: [{ plan: 'SOME_PLAN.md', tokens: ['MADE-UP-TOKEN'], path_match: 'exact', expires_at: '2026-12-31T00:00:00.000Z', reason: 'This is a test reason that is long enough to pass minLength of forty characters', granted_at: '2026-05-18T00:00:00.000Z' }],
    meta_plans: [],
  });
  const badTokenFindings = validateOverrides(badToken, 'test');
  assert('Invalid token rejected', badTokenFindings.some(f => f.msg.includes('not in the allowed token list')));

  // >2 tokens rejected
  const tooManyTokens = JSON.stringify({
    version: 1,
    overrides: [{ plan: 'SOME_PLAN.md', tokens: ['NOT-WALKED', 'NOT WALKED', 'PROBABLE-FAIL-APP'], path_match: 'exact', expires_at: '2026-12-31T00:00:00.000Z', reason: 'This is a test reason that is long enough to pass minLength of forty characters', granted_at: '2026-05-18T00:00:00.000Z' }],
    meta_plans: [],
  });
  const tooManyFindings = validateOverrides(tooManyTokens, 'test');
  assert('>2 tokens rejected', tooManyFindings.some(f => f.msg.includes('maxItems is 2')));

  // Staged blob source assertion (V3)
  assert('Staged mode uses git show :.claude/closure-overrides.json',
    runValidation.toString().includes('git show :.claude/closure-overrides.json'));

  // Valid full override passes
  const validFull = JSON.stringify({
    version: 1,
    overrides: [{
      plan: 'SUBPLAN_DQU_V6_PILOT_SSL_A.md',
      tokens: ['BLOCKED-BY-FIXME-DESIGN', 'PROBABLE-FAIL-APP'],
      path_match: 'exact',
      expires_at: '2026-12-31T00:00:00.000Z',
      reason: 'Playwright test.fixme(true,...) semantics — acknowledged design gap pending architecture review',
      granted_at: '2026-05-18T00:00:00.000Z',
    }],
    meta_plans: ['PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md'],
  });
  assert('Valid full override passes', validateOverrides(validFull, 'test').length === 0);

  console.log(`\nvalidate-overrides --self-test: ${pass} passed, ${fail} failed`);
  return fail > 0 ? 1 : 0;
}

// === CLI dispatch ===
const args = process.argv.slice(2);
const hasFlag = flag => args.includes(flag);

if (hasFlag('--self-test')) {
  process.exit(runSelfTest());
} else if (hasFlag('--staged')) {
  process.exit(runValidation(true, hasFlag('--json')));
} else {
  process.exit(runValidation(false, hasFlag('--json')));
}
