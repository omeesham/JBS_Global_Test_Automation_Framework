// uplink.test.mjs — node:test suite for uplink helpers.
// Run: node --test .claude/hooks/lib/uplink/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redact, redactObject } from './redact.mjs';
import { buildPacket, loadPolicy } from './packet-builder.mjs';
import { validateAdvisory } from './validate-advisory.mjs';

// ── Shared test policies (no file I/O) ───────────────────────────────────────

const POLICY = {
  classes: ['diagnose', 'clarify-scope', 'contract-fix'],
  packet: {
    max_chars: 4000,
    truncation_order: ['attempt_history', 'evidence_tail', 'ruled_out', 'constraints', 'failing_state', 'goal'],
  },
};

// max_chars=100 forces truncation; failing_state and goal are listed last (must never be dropped).
const TIGHT_POLICY = {
  classes: ['diagnose'],
  packet: {
    max_chars: 100,
    truncation_order: ['attempt_history', 'evidence_tail', 'failing_state', 'goal'],
  },
};

// ── redact ────────────────────────────────────────────────────────────────────

test('redact: API_KEY=sk-... is redacted and secret substrings are absent from output', () => {
  const secret = 'sk-abc12345678901234567890';
  const input = `API_KEY=${secret}`;
  const out = redact(input);
  assert.ok(out.includes('[REDACTED]'), 'output must contain [REDACTED]');
  assert.ok(!out.includes('sk-abc'), 'sk- prefix must be removed');
  assert.ok(!out.includes('12345678901234567890'), 'secret suffix must be removed');
});

test('redact: Authorization: Bearer <token> is redacted', () => {
  const secret = 'xyz123bearertoken';
  const input = `Authorization: Bearer ${secret}`;
  const out = redact(input);
  assert.ok(out.includes('[REDACTED]'), 'output must contain [REDACTED]');
  assert.ok(!out.includes(secret), 'bearer token must be absent from output');
});

test('redact: Cookie: s=secret is redacted', () => {
  const input = 'Cookie: s=supersecret; session=abc123';
  const out = redact(input);
  assert.ok(out.includes('[REDACTED]'), 'output must contain [REDACTED]');
  assert.ok(!out.includes('supersecret'), 'cookie value must be removed');
  assert.ok(!out.includes('abc123'), 'session id must be removed');
});

test('redact: idempotent — redact(redact(x)) === redact(x)', () => {
  const input = [
    'API_KEY=sk-abc12345678901234567890',
    'Authorization: Bearer xyz123bearertoken',
    'Cookie: session=supersecret123',
    'SECRET=topsecretvalue',
    'password=hunter2',
    'access_token: abcdefghijklmnopqrstuvwxyz123',
  ].join('\n');
  const once = redact(input);
  const twice = redact(once);
  assert.equal(twice, once, 'second pass must produce identical output');
});

test('redactObject: deep-redacts strings in nested objects and arrays', () => {
  const obj = {
    headers: { Authorization: 'Bearer mysecrettoken' },
    tokens: ['API_KEY=abc123', 'safe-value'],
    count: 42,
    active: true,
    nested: { deep: { password: 'hunter2', safe: 'ok' } },
  };
  const out = redactObject(obj);
  assert.ok(!JSON.stringify(out).includes('mysecrettoken'), 'bearer token must be deep-redacted');
  assert.ok(!JSON.stringify(out).includes('hunter2'), 'password must be deep-redacted');
  assert.equal(out.count, 42, 'number must pass through unchanged');
  assert.equal(out.active, true, 'boolean must pass through unchanged');
  assert.equal(out.tokens[1], 'safe-value', 'non-secret string must be unchanged');
});

// ── packet-builder ────────────────────────────────────────────────────────────

test('buildPacket: throws when askBlock.class is not in policy.classes', () => {
  assert.throws(
    () => buildPacket(
      { envelope: { goal: 'g', failing_state: 'f' }, askBlock: { class: 'unknown-class', ask: 'why?' } },
      POLICY
    ),
    /askBlock\.class/,
    'error message must reference askBlock.class'
  );
});

test('buildPacket: over-cap packet drops fields in truncation_order; goal and failing_state never dropped', () => {
  // attempt_history + evidence_tail together push the packet well over 100 chars.
  const result = buildPacket({
    envelope: {
      goal: 'g',
      failing_state: 'f',
      attempt_history: 'x'.repeat(200),
      evidence_tail: 'e',
    },
    askBlock: { class: 'diagnose', ask: 'root cause?' },
  }, TIGHT_POLICY);

  // Fields are dropped in declaration order.
  assert.ok(result.dropped.includes('attempt_history'), 'attempt_history must be in dropped list');
  // goal and failing_state must survive even though they appear last in truncation_order.
  assert.ok(!result.dropped.includes('goal'), 'goal must never be dropped');
  assert.ok(!result.dropped.includes('failing_state'), 'failing_state must never be dropped');
  // Packet must be valid JSON (no overflow for these inputs at max_chars=100).
  assert.equal(result.overflow, false, 'no overflow expected after dropping history fields');
  const parsed = JSON.parse(result.packet);
  assert.equal(parsed.envelope.goal, 'g', 'goal must be present in packet');
  assert.equal(parsed.envelope.failing_state, 'f', 'failing_state must be present in packet');
  assert.ok(!('attempt_history' in parsed.envelope), 'attempt_history must be absent from packet');
});

test('buildPacket: sig is stable for same class+ask regardless of envelope content', () => {
  const r1 = buildPacket(
    { envelope: { goal: 'goal-A', failing_state: 'fs-A' }, askBlock: { class: 'diagnose', ask: 'what caused this' } },
    POLICY
  );
  const r2 = buildPacket(
    { envelope: { goal: 'goal-B', failing_state: 'fs-B', extra: 'unrelated' }, askBlock: { class: 'diagnose', ask: 'what caused this' } },
    POLICY
  );
  assert.equal(r1.sig, r2.sig, 'same class+ask must produce same sig');
  assert.match(r1.sig, /^[0-9a-f]{16}$/, 'sig must be a 16-char hex string');
});

test('buildPacket: sig differs for different ask', () => {
  const r1 = buildPacket(
    { envelope: { goal: 'g', failing_state: 'f' }, askBlock: { class: 'diagnose', ask: 'what caused this' } },
    POLICY
  );
  const r2 = buildPacket(
    { envelope: { goal: 'g', failing_state: 'f' }, askBlock: { class: 'diagnose', ask: 'how to fix this' } },
    POLICY
  );
  assert.notEqual(r1.sig, r2.sig, 'different ask must produce different sig');
});

test('buildPacket: SPLIT AUTHORSHIP — worker free-text only in ask section, never in envelope', () => {
  const workerText = 'Private worker hypothesis about the root cause';
  const result = buildPacket({
    envelope: { goal: 'fix the form', failing_state: 'submit returns 500' },
    askBlock: { class: 'diagnose', hypothesis: workerText, ask: 'what is the root cause?' },
  }, POLICY);

  const parsed = JSON.parse(result.packet);
  assert.ok(
    !JSON.stringify(parsed.envelope).includes(workerText),
    'worker free-text must not appear in the envelope portion'
  );
  assert.ok(
    JSON.stringify(parsed.ask).includes(workerText),
    'worker free-text must appear in the ask portion'
  );
});

test('loadPolicy: throws a clear error on missing file', () => {
  assert.throws(
    () => loadPolicy('/nonexistent/path/uplink-policy.json'),
    /loadPolicy/,
    'error must reference loadPolicy'
  );
});

// ── validate-advisory ─────────────────────────────────────────────────────────

test('validateAdvisory: fully valid advisory returns valid:true with no violations', () => {
  const result = validateAdvisory({
    verdict: 'proceed',
    next_action: 'Run the failing test suite with DEBUG=1 to capture the full stack trace.',
    prohibitions: ['do not edit production config'],
    success_check: 'All tests pass with exit code 0.',
    escalate: false,
  });
  assert.equal(result.valid, true, 'valid advisory must return valid:true');
  assert.deepEqual(result.violations, [], 'no violations expected');
});

test('validateAdvisory: 6-line fenced code block in next_action triggers no-labor violation', () => {
  const sixLineCode = '```python\na = 1\nb = 2\nc = 3\nd = 4\ne = 5\nf = 6\n```';
  const result = validateAdvisory({
    verdict: 'proceed',
    next_action: `Apply this patch: ${sixLineCode}`,
    prohibitions: [],
    success_check: 'tests pass',
    escalate: false,
  });
  assert.equal(result.valid, false, 'advisory with 6-line code block must be invalid');
  assert.ok(
    result.violations.some(v => v.startsWith('no-labor:')),
    'no-labor violation must be present'
  );
});

test('validateAdvisory: exactly 5-line fenced code block is within limit', () => {
  const fiveLineCode = '```sh\na\nb\nc\nd\ne\n```';
  const result = validateAdvisory({
    verdict: 'proceed',
    next_action: `Run: ${fiveLineCode}`,
    prohibitions: [],
    success_check: 'passes',
    escalate: false,
  });
  assert.equal(result.valid, true, '5-line fenced block must not trigger no-labor');
});

test('validateAdvisory: missing success_check produces invalid result', () => {
  const result = validateAdvisory({
    verdict: 'proceed',
    next_action: 'do the thing',
    prohibitions: [],
    escalate: false,
    // success_check intentionally omitted
  });
  assert.equal(result.valid, false, 'missing success_check must be invalid');
  assert.ok(
    result.violations.some(v => v.includes('success_check')),
    'success_check violation must be reported'
  );
});

test('validateAdvisory: unknown top-level key produces violation', () => {
  const result = validateAdvisory({
    verdict: 'proceed',
    next_action: 'do something',
    prohibitions: [],
    success_check: 'done',
    escalate: false,
    extra_field: 'unexpected',
  });
  assert.equal(result.valid, false, 'unknown key must make advisory invalid');
  assert.ok(
    result.violations.some(v => v === 'unknown key: extra_field'),
    'unknown key violation must name the key'
  );
});

test('validateAdvisory: non-boolean escalate produces violation', () => {
  const result = validateAdvisory({
    verdict: 'proceed',
    next_action: 'do something',
    prohibitions: [],
    success_check: 'done',
    escalate: 'yes',
  });
  assert.equal(result.valid, false);
  assert.ok(result.violations.some(v => v.includes('escalate')));
});
