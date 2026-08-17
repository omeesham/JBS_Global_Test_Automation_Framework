#!/usr/bin/env node
// scripts/walk-coverage/tests/enumerate-page-fixes.test.mjs
// Unit tests for the four bug-fix causes in enumerate-page.mjs / lib/deep-pierce.mjs.
// No browser required — mocks are used for page-dependent paths.
// Each test is structured so it FAILS against the pre-fix code.

import { deriveFieldType, waitReady, waitReadyContent, enumerateState, renavigateToOrigin, deriveAllFieldTypes, entryKeyToSelector, resolveBranchOpener, MODULE_CONFIG } from '../enumerate-page.mjs';
import { inPageEnumerate } from '../lib/deep-pierce.mjs';

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) { console.log(`  PASS: ${label}`); passed++; }
  else { console.error(`  FAIL: ${label}${detail ? ' — ' + detail : ''}`); failed++; }
}

// ─── shared legal types (mimics what loadFieldCaseTaxonomy returns) ─────────────
const LEGAL_TYPES = [
  'Numeric/spinbutton', 'Plain text', 'Checkbox', 'Dropdown/combobox',
  'Date', 'Password', 'File upload',
];

console.log('=== enumerate-page-fixes tests ===\n');

// ─── Cause 3a: type-less numeric input resolves as Numeric/spinbutton ────────────
console.log('Cause 3a: type-less decimal INPUT (the 79 percentage inputs) → Numeric/spinbutton');
{
  const obs = { tag: 'INPUT', type: '', role: '', inputmode: 'decimal' };
  const result = deriveFieldType(obs, LEGAL_TYPES);
  assert('resolves to Numeric/spinbutton', result === 'Numeric/spinbutton',
    `got: ${JSON.stringify(result)}`);
}

// ─── Cause 3b: control matching NO rule stays unresolved (not "Plain text") ─────
console.log('\nCause 3b: control with no matching rule stays unresolved');
{
  // A bare INPUT with no type, no role, no inputmode=decimal — no rule should match.
  const obs = { tag: 'INPUT', type: '', role: '', inputmode: '' };
  const result = deriveFieldType(obs, LEGAL_TYPES);
  assert('returns null (unresolved) for unrecognized INPUT', result === null,
    `got: ${JSON.stringify(result)} — pre-fix code returned "Plain text" for bare INPUT`);
  assert('does NOT classify as "Plain text"', result !== 'Plain text',
    `got: ${JSON.stringify(result)}`);
}

// ─── Cause 3c: existing known-good rules still work after catch-all removal ──────
console.log('\nCause 3c: existing rules still resolve correctly after catch-all removal');
{
  assert('TEXTAREA → Plain text',
    deriveFieldType({ tag: 'TEXTAREA', type: '', role: '', inputmode: '' }, LEGAL_TYPES) === 'Plain text');
  assert('INPUT type=number → Numeric/spinbutton',
    deriveFieldType({ tag: 'INPUT', type: 'number', role: '', inputmode: '' }, LEGAL_TYPES) === 'Numeric/spinbutton');
  assert('role=spinbutton → Numeric/spinbutton',
    deriveFieldType({ tag: 'DIV', type: '', role: 'spinbutton', inputmode: '' }, LEGAL_TYPES) === 'Numeric/spinbutton');
  assert('role=combobox → Dropdown/combobox',
    deriveFieldType({ tag: 'DIV', type: '', role: 'combobox', inputmode: '' }, LEGAL_TYPES) === 'Dropdown/combobox');
  assert('SELECT → Dropdown/combobox',
    deriveFieldType({ tag: 'SELECT', type: '', role: '', inputmode: '' }, LEGAL_TYPES) === 'Dropdown/combobox');
  assert('INPUT type=password → Password',
    deriveFieldType({ tag: 'INPUT', type: 'password', role: '', inputmode: '' }, LEGAL_TYPES) === 'Password');
  assert('INPUT type=checkbox → Checkbox',
    deriveFieldType({ tag: 'INPUT', type: 'checkbox', role: '', inputmode: '' }, LEGAL_TYPES) === 'Checkbox');
}

// ─── Cause 2: waitReady throws on timeout instead of returning a partial ─────────
console.log('\nCause 2: waitReady throws on timeout');
{
  let timeoutThrown = false;
  let thrownMessage = '';

  // Mock page: dead page — nothing renders (census 0 can never satisfy the PLAN_76 stability
  // contract, preserving this test's original intent: timeout must THROW, never return a partial).
  const mockPage = {
    evaluate: async () => 0,
    waitForTimeout: async () => {},
  };

  try {
    await waitReady(mockPage, { minTestids: 8, stableReads: 2, interval: 50, timeout: 150 });
    timeoutThrown = false;
  } catch (err) {
    timeoutThrown = true;
    thrownMessage = err.message;
  }

  assert('throws on timeout instead of returning partial',
    timeoutThrown, 'pre-fix code returned last silently; post-fix must throw');
  assert('error message contains WAIT_READY_TIMEOUT',
    thrownMessage.includes('WAIT_READY_TIMEOUT'), `got: ${thrownMessage}`);
  assert('error message contains "Refusing"',
    thrownMessage.includes('Refusing'), `got: ${thrownMessage}`);
}

// ─── Cause 1: renavigateToOrigin calls goto with the original URL ──────────────
console.log('\nCause 1: renavigateToOrigin navigates back to the originating URL');
{
  const gotoCalls = [];
  const mockPage = {
    goto: async (u, opts) => { gotoCalls.push({ u, opts }); return null; },
    evaluate: async () => 10,       // satisfies waitReady minTestids=8 immediately
    waitForTimeout: async () => {},
  };
  await renavigateToOrigin(mockPage, 'http://test.local/target');
  assert('goto called exactly once', gotoCalls.length === 1,
    `got ${gotoCalls.length} calls`);
  assert('goto called with original URL', gotoCalls[0]?.u === 'http://test.local/target',
    `got: ${gotoCalls[0]?.u}`);
  assert('goto uses domcontentloaded', gotoCalls[0]?.opts?.waitUntil === 'domcontentloaded',
    `got: ${JSON.stringify(gotoCalls[0]?.opts)}`);
}

// ─── Cause 4a: enumerateState propagates CONTAINER_NOT_FOUND; tolerates other errors ──
console.log('\nCause 4a: enumerateState propagates CONTAINER_NOT_FOUND, tolerates other frame errors');
{
  // Frame that throws CONTAINER_NOT_FOUND — must propagate (post-fix) not be swallowed (pre-fix).
  const cnfMsg = 'CONTAINER_NOT_FOUND: no <main> element found on http://test.local/page. Refusing to enumerate — no fallback to document.';
  const mockPageCNF = {
    frames: () => [{ evaluate: async () => { throw new Error(cnfMsg); } }],
    mainFrame: function() { return this.frames()[0]; },
  };
  let cnfThrown = false;
  let cnfMsg2 = '';
  try { await enumerateState(mockPageCNF); } catch (err) { cnfThrown = true; cnfMsg2 = err.message; }
  assert('CONTAINER_NOT_FOUND propagates through enumerateState',
    cnfThrown, 'pre-fix: error was swallowed by catch-continue; post-fix must rethrow');
  assert('propagated error contains CONTAINER_NOT_FOUND',
    cnfMsg2.includes('CONTAINER_NOT_FOUND'), `got: ${cnfMsg2}`);

  // Frame that throws a different error (e.g. frame detached) — must be tolerated, not rethrown.
  const mockPageOther = {
    frames: () => [{ evaluate: async () => { throw new Error('Frame was detached'); } }],
    mainFrame: function() { return this.frames()[0]; },
  };
  let otherThrown = false;
  try { await enumerateState(mockPageOther); } catch { otherThrown = true; }
  assert('non-CONTAINER_NOT_FOUND frame errors are still tolerated',
    !otherThrown, 'other frame errors must NOT propagate — only CONTAINER_NOT_FOUND escapes');
}

// ─── Cause 4b: inPageEnumerate raises CONTAINER_NOT_FOUND when DOM has no <main> ──
console.log('\nCause 4b: missing <main> raises CONTAINER_NOT_FOUND');
{
  // We can invoke inPageEnumerate in Node if we mock the DOM APIs it uses.
  // The function only needs document.querySelector, so we inject a minimal global.
  const { inPageEnumerate } = await import('../lib/deep-pierce.mjs');

  // Stub minimal DOM globals so inPageEnumerate can run in Node
  const origDocument = global.document;
  const origLocation = global.location;
  global.document = {
    querySelector: () => null, // no <main> found
  };
  global.location = { href: 'http://test.local/page' };

  let containerErrorThrown = false;
  let containerErrorMsg = '';
  try {
    inPageEnumerate('main');
  } catch (err) {
    containerErrorThrown = true;
    containerErrorMsg = err.message;
  } finally {
    if (origDocument !== undefined) global.document = origDocument;
    else delete global.document;
    if (origLocation !== undefined) global.location = origLocation;
    else delete global.location;
  }

  assert('throws when <main> is missing',
    containerErrorThrown, 'pre-fix: would have called deepAll(null) or deepAll(document) silently');
  assert('error message contains CONTAINER_NOT_FOUND',
    containerErrorMsg.includes('CONTAINER_NOT_FOUND'), `got: ${containerErrorMsg}`);
  assert('error message says "Refusing to enumerate"',
    containerErrorMsg.includes('Refusing to enumerate'), `got: ${containerErrorMsg}`);
}

// ─── Cause 1 (ordering property): tab-role entries are NOT click-probed ─────────────────────
// Property: no element may fail to resolve because an earlier probe in the same pass changed
// what is mounted. Tab triggers (role=tab) unmount the current panel when clicked.
// Fix: 'tab' removed from PROBEABLE_ROLES → tab entries exit as non_probeable, not probed.
// Proof: if 'tab' is in PROBEABLE_ROLES, page.click IS called, this test FAILS.
console.log('\nCause 1 (ordering property): tab-role entry is NOT click-probed');
{
  const clickTargets = [];
  let evalCallCount = 0;
  const mockPage = {
    goto: async () => {},
    evaluate: async () => 10,       // waitReady: satisfied immediately
    waitForTimeout: async () => {},
    $eval: async (sel, fn) => {
      evalCallCount++;
      // Return a tab trigger observation — not resting-conclusive, would trigger probe path
      return fn({
        tagName: 'DIV',
        getAttribute: (attr) => {
          if (attr === 'type') return null;
          if (attr === 'role') return 'tab';
          if (attr === 'inputmode') return null;
          return null;
        },
      });
    },
    click: async (sel) => { clickTargets.push(sel); },
    keyboard: { press: async () => {} },
  };
  const entries = [{ key: 'testid:radix-history-trigger', archetype: false }];
  const rawEntries = [{ key: 'testid:radix-history-trigger' }];
  await deriveAllFieldTypes(mockPage, 'http://test.local/target', entries, rawEntries, ['Plain text']);

  assert('tab-role entry does NOT trigger page.click', clickTargets.length === 0,
    `got ${clickTargets.length} click(s): ${JSON.stringify(clickTargets)} — pre-fix code with "tab" in PROBEABLE_ROLES would click`);
  assert('tab-role entry $eval was still called (element was read)', evalCallCount > 0,
    `$eval called ${evalCallCount} times — should have attempted to read the element`);
}

// ─── Cause 1 (production path): renavigate precedes first $eval in deriveAllFieldTypes ──────
console.log('\nCause 1 (production path): renavigateToOrigin called before Phase 2.2 $eval');
{
  const callSequence = [];
  const mockPage = {
    goto: async () => { callSequence.push('goto'); },
    evaluate: async () => 10,        // waitReady: minTestids satisfied immediately
    waitForTimeout: async () => {},
    $eval: async () => {
      callSequence.push('$eval');
      return { tag: 'INPUT', type: 'text', role: '', inputmode: '' };
    },
  };
  const entries = [{ key: 'testid:field-a', archetype: false }];
  const rawEntries = [{ key: 'testid:field-a' }];
  await deriveAllFieldTypes(mockPage, 'http://test.local/target', entries, rawEntries, ['Plain text']);

  const gotoIdx = callSequence.indexOf('goto');
  const evalIdx = callSequence.indexOf('$eval');
  assert('renavigate (goto) was called before first $eval', gotoIdx !== -1 && gotoIdx < evalIdx,
    `sequence=${JSON.stringify(callSequence)} — deleting the renavigateToOrigin callsite would produce gotoIdx=-1`);
}

// ─── Encoding fix: archetype suffix stripped → selector does NOT contain # or [archetype ──────
console.log('\nEncoding fix: entryKeyToSelector strips archetype suffix from testid key');
{
  // A key as produced by collapseArchetypes() — contains × (U+00D7)
  const archetypeKey = 'testid:service-charge-percentage-# [archetype\u00D779]';
  const selector = entryKeyToSelector(archetypeKey);
  assert('selector does not contain " [archetype"', !selector.includes(' [archetype'),
    `got: ${selector} — corrupted regex leaves archetype suffix in the selector`);
  assert('selector does not contain "[archetype"', !selector.includes('[archetype'),
    `got: ${selector} — corrupted regex leaves archetype suffix in the selector`);
  assert('selector is [data-testid="service-charge-percentage-#"]',
    selector === '[data-testid="service-charge-percentage-#"]',
    `got: ${selector}`);
}

// ─── Branch resolution: recognised branch returns pattern ────────────────────────────────────
// Pre-fix: resolveBranchOpener did not exist → import would fail or return undefined.
// Post-fix: returns the matching pattern object with the correct properties.
// NOTE: this tests the generic pattern pass-through mechanic of resolveBranchOpener,
// not the live History config — the mock uses contentGate: true to mirror the real config.
console.log('\nBranch resolution: recognised branch returns correct pattern');
{
  const mockCfg = {
    openerRoleTextPatterns: [
      { role: 'tab', text: 'Service Charge History', branch: 'tab:history', contentGate: true },
    ],
  };
  const result = resolveBranchOpener(mockCfg, 'tab:history');
  assert('resolveBranchOpener returns the matching pattern',
    result !== null && result !== undefined,
    `got: ${JSON.stringify(result)}`);
  assert('returned pattern has correct branch property',
    result && result.branch === 'tab:history',
    `got branch=${result && result.branch}`);
  assert('returned pattern carries contentGate flag',
    result && result.contentGate === true,
    `got contentGate=${result && result.contentGate}`);
  assert('returned pattern has role and text',
    result && result.role === 'tab' && result.text === 'Service Charge History',
    `got role=${result && result.role} text=${result && result.text}`);
}

// ─── Branch resolution: unrecognised branch throws loudly ────────────────────────────────────
// Pre-fix: no throw — an unknown branch was silently ignored, causing wrong-surface enumeration.
// Post-fix: throws with [FATAL] prefix so CI catches the mistake immediately.
console.log('\nBranch resolution: unrecognised branch throws with [FATAL]');
{
  const mockCfg = {
    openerRoleTextPatterns: [
      { role: 'tab', text: 'Service Charge History', branch: 'tab:history', contentGate: true },
    ],
  };
  let didThrow = false;
  let thrownMsg = '';
  try {
    resolveBranchOpener(mockCfg, 'tab:not-real');
  } catch (err) {
    didThrow = true;
    thrownMsg = err.message;
  }
  assert('throws for unrecognised branch',
    didThrow, 'pre-fix: unknown branch was silently accepted; post-fix must throw');
  assert('error message contains [FATAL]',
    thrownMsg.includes('[FATAL]'), `got: ${thrownMsg}`);
  assert('error message names the bad branch value',
    thrownMsg.includes('tab:not-real'), `got: ${thrownMsg}`);
  assert('error message lists known branches',
    thrownMsg.includes('tab:history'), `got: ${thrownMsg}`);
}

// ─── History content gate: throws when Modified By header never appears ──────────────────────
// This test goes RED if waitReadyContent is removed or made vacuous.
// Proof: remove waitReadyContent from enumerate-page.mjs → import fails → suite fails.
// Remove the throw inside waitReadyContent → 'throws when header absent' assert fails.
console.log('\nHistory content gate: throws when Modified By header never appears');
{
  let threw = false;
  let thrownMsg = '';
  const mockPageNoHeader = {
    waitForSelector: async (_sel, _opts) => { throw new Error('Timeout'); },
  };
  try {
    await waitReadyContent(mockPageNoHeader, { timeout: 100 });
  } catch (err) {
    threw = true;
    thrownMsg = err.message;
  }
  assert('throws when Modified By header absent',
    threw, 'removing waitReadyContent or making it vacuous causes this to fail');
  assert('error contains WAIT_READY_CONTENT_TIMEOUT',
    thrownMsg.includes('WAIT_READY_CONTENT_TIMEOUT'), `got: ${thrownMsg}`);
  assert('error mentions Modified By',
    thrownMsg.includes('Modified By'), `got: ${thrownMsg}`);
}

// ─── History content gate: throws when header present but no rows ─────────────────────────────
console.log('\nHistory content gate: throws when rows never appear after header');
{
  let threw = false;
  let thrownMsg = '';
  let headerWaited = false;
  const mockPageNoRows = {
    waitForSelector: async (sel, _opts) => {
      if (sel === 'text=Modified By') { headerWaited = true; return; } // header resolves
      throw new Error('Timeout'); // rows never appear
    },
  };
  try {
    await waitReadyContent(mockPageNoRows, { timeout: 100 });
  } catch (err) {
    threw = true;
    thrownMsg = err.message;
  }
  assert('waited for Modified By header first', headerWaited);
  assert('throws when rows never appear',
    threw, 'removing the rows gate causes this to fail');
  assert('error contains WAIT_READY_CONTENT_TIMEOUT',
    thrownMsg.includes('WAIT_READY_CONTENT_TIMEOUT'), `got: ${thrownMsg}`);
  assert('error mentions denominator trust',
    thrownMsg.includes('denominator'), `got: ${thrownMsg}`);
}

// ─── History content gate: resolves when header and rows present ──────────────────────────────
console.log('\nHistory content gate: resolves when header and rows both present');
{
  let resolved = false;
  let threw = false;
  const mockPageFull = {
    waitForSelector: async (_sel, _opts) => { /* both selectors resolve immediately */ },
  };
  try {
    await waitReadyContent(mockPageFull, { timeout: 5000 });
    resolved = true;
  } catch {
    threw = true;
  }
  assert('resolves without throwing when content is present', resolved && !threw);
}

// ─── Live MODULE_CONFIG: History branch carries contentGate ──────────────────────────────────
// This test goes RED when contentGate: true is removed from the live MODULE_CONFIG tab:history
// entry. It does NOT import a mock — it reads the real exported config. Removing contentGate
// causes `historyPattern.contentGate` to be undefined, failing the assertion below with a
// named message (not a parse/import error).
console.log('\nLive MODULE_CONFIG: History branch carries contentGate and routes to content gate');
{
  // Locate the tab:history entry in the live service-charge openerRoleTextPatterns.
  const scConfig = MODULE_CONFIG['service-charge'];
  assert('MODULE_CONFIG has service-charge entry',
    scConfig != null,
    'MODULE_CONFIG[\'service-charge\'] is missing');
  const historyPattern = (scConfig && scConfig.openerRoleTextPatterns || []).find(
    (p) => p.branch === 'tab:history'
  );
  assert('tab:history pattern exists in live MODULE_CONFIG',
    historyPattern != null,
    'no openerRoleTextPatterns entry with branch=\'tab:history\' found — was it removed?');
  assert('tab:history carries contentGate: true in live MODULE_CONFIG',
    historyPattern && historyPattern.contentGate === true,
    `got contentGate=${historyPattern && historyPattern.contentGate} — removing contentGate: true from MODULE_CONFIG causes this to fail`);
  assert('tab:history does not carry minTestids (retired property)',
    historyPattern && historyPattern.minTestids === undefined,
    `got minTestids=${historyPattern && historyPattern.minTestids} — minTestids was retired when contentGate replaced it`);
}

// ─── PLAN_76: stability-contract readiness (label-poor surfaces must pass) ──────
// The old gate demanded >= 8 data-testids — an invented floor that permanently blocked
// label-poor pages (live: discount-optimization-settings settles at 1 testid / 0 on tab 2
// while holding 135 buttons + 37 inputs). New contract: interactive census >= 1 and stable,
// DOM node count stable within a small tolerance, minimum elapsed time; testid >= 8 kept
// only as a fast-path accelerator. Mock evaluate returns {t, c, n} snapshots
// (t = testid count, c = interactive census, n = total DOM elements); a bare number is
// treated as the legacy testid-only shape.

function seqPage(snapshots) {
  // Yields snapshots in order; repeats the last one forever. Tracks call count.
  const state = { calls: 0 };
  return {
    state,
    evaluate: async () => {
      const i = Math.min(state.calls, snapshots.length - 1);
      state.calls++;
      return snapshots[i];
    },
    waitForTimeout: async () => {},
  };
}

console.log('\nPLAN_76 A: label-poor page (1 testid, rich census) becomes ready');
{
  const page = seqPage([{ t: 1, c: 120, n: 900 }]);
  let ready = false, result = null, msg = '';
  try { result = await waitReady(page, { interval: 10, timeout: 2000 }); ready = true; }
  catch (err) { msg = err.message; }
  assert('1-testid surface passes readiness', ready,
    `old floor-8 gate times out here — got: ${msg}`);
  assert('returns the testid count', ready && result === 1, `got: ${JSON.stringify(result)}`);
}

console.log('\nPLAN_76 B: zero-testid page (buttons only) becomes ready');
{
  const page = seqPage([{ t: 0, c: 24, n: 400 }]);
  let ready = false, msg = '';
  try { await waitReady(page, { interval: 10, timeout: 2000 }); ready = true; }
  catch (err) { msg = err.message; }
  assert('0-testid surface passes readiness', ready,
    `count-based floors can never pass 0 testids — got: ${msg}`);
}

console.log('\nPLAN_76 C: late-render page is NOT ready until the census settles');
{
  // Chrome shell first (census 10), module content lands later (census 50) and then holds.
  const page = seqPage([
    { t: 1, c: 10, n: 300 }, { t: 1, c: 10, n: 300 }, { t: 1, c: 10, n: 310 },
    { t: 1, c: 50, n: 800 }, { t: 1, c: 50, n: 800 }, { t: 1, c: 50, n: 800 }, { t: 1, c: 50, n: 800 },
  ]);
  let ready = false, msg = '';
  try { await waitReady(page, { interval: 10, timeout: 2000 }); ready = true; }
  catch (err) { msg = err.message; }
  assert('late-render page eventually ready', ready, `got: ${msg}`);
  assert('readiness waited for the post-climb stable window (>= 6 samples)',
    page.state.calls >= 6,
    `declared ready after only ${page.state.calls} samples — premature-ready would under-enumerate (LR-062)`);
}

console.log('\nPLAN_76 D: DOM churn within tolerance still settles; beyond tolerance never does');
{
  // Spinner-class churn: node count oscillates by 1 — within tolerance, must settle.
  const small = seqPage([
    { t: 0, c: 24, n: 400 }, { t: 0, c: 24, n: 401 }, { t: 0, c: 24, n: 400 }, { t: 0, c: 24, n: 401 },
  ]);
  let readySmall = false, msgSmall = '';
  try { await waitReady(small, { interval: 10, timeout: 2000 }); readySmall = true; }
  catch (err) { msgSmall = err.message; }
  assert('±1 node churn settles (within tolerance)', readySmall, `got: ${msgSmall}`);

  // Structural churn: node count keeps jumping by 10 — content still arriving, must NOT settle.
  const seq = [];
  for (let i = 0; i < 400; i++) seq.push({ t: 0, c: 24, n: 400 + (i % 2) * 10 });
  const big = seqPage(seq);
  let threwBig = false, msgBig = '';
  try { await waitReady(big, { interval: 10, timeout: 300 }); }
  catch (err) { threwBig = true; msgBig = err.message; }
  assert('±10 node churn never settles → loud timeout', threwBig,
    'structural churn declared ready — premature-ready corrupts the denominator');
  assert('churn timeout message carries WAIT_READY_TIMEOUT', msgBig.includes('WAIT_READY_TIMEOUT'), `got: ${msgBig}`);
}

console.log('\nPLAN_76 E: label-rich fast-path still fires (>= 8 stable testids, census-independent)');
{
  const page = seqPage([{ t: 10, c: 0, n: 100 }]);
  let ready = false, result = null, msg = '';
  try { result = await waitReady(page, { interval: 10, timeout: 2000 }); ready = true; }
  catch (err) { msg = err.message; }
  assert('fast-path declares ready on stable testid-rich page', ready, `got: ${msg}`);
  assert('fast-path returns testid count', ready && result === 10, `got: ${JSON.stringify(result)}`);
  assert('fast-path needed few samples (accelerator, not the slow contract)',
    page.state.calls <= 4, `took ${page.state.calls} samples`);
}

console.log('\nPLAN_76 F: dead page (legacy numeric mock, nothing renders) throws the enriched timeout');
{
  const page = { evaluate: async () => 0, waitForTimeout: async () => {} };
  let threw = false, msg = '';
  try { await waitReady(page, { interval: 10, timeout: 200 }); }
  catch (err) { threw = true; msg = err.message; }
  assert('dead page still throws loudly', threw, 'silent partial forbidden');
  assert('timeout message reports census alongside testids',
    msg.includes('census'), `got: ${msg}`);
}

// ─── g76 Defect 1: readiness must scope to <main>, not document ──────────────────
// A stable app-shell (document-level census constant) with <main> content arriving late
// must NOT declare ready before late content lands. Pre-fix: waitReady walked document,
// so stable chrome satisfied the window while <main> was empty.
console.log('\ng76 Defect 1: stable app-shell does NOT satisfy readiness while <main> content arrives late');
{
  // Simulate: first 5 polls return stable chrome (as if document had stable buttons),
  // then content appears in <main> (census jumps), then stabilizes.
  // Under the fix, waitReady calls inPageEnumerate('main') — so the mock must return
  // the inPageEnumerate shape scoped to <main> content only.
  // Polls 0-4: <main> is empty (no entries, 0 scanned) — CONTAINER_NOT_FOUND throw
  // Polls 5+: <main> appears with content that stabilizes
  let pollCount = 0;
  const mockPage = {
    evaluate: async () => {
      pollCount++;
      if (pollCount <= 5) {
        // <main> not yet mounted — inPageEnumerate throws CONTAINER_NOT_FOUND
        throw new Error('CONTAINER_NOT_FOUND: no <main> element found on http://test.local/page. Refusing to enumerate — no fallback to document.');
      }
      // <main> now mounted with content — return inPageEnumerate shape
      return { entries: [{ key: 'testid:field-1' }, { key: 'role:button|Save' }], candidates: [], stats: { scanned: 50, shadowHosts: 0, uniqueKeys: 2 } };
    },
    waitForTimeout: async () => {},
  };
  let ready = false, msg = '';
  try { await waitReady(mockPage, { interval: 10, timeout: 2000 }); ready = true; }
  catch (err) { msg = err.message; }
  assert('readiness waits for <main> to appear (not satisfied by chrome)', ready, `got: ${msg}`);
  assert('needed >5 polls (waited for <main> to mount)', pollCount > 5,
    `declared ready after ${pollCount} polls — pre-fix would fire on stable document chrome immediately`);
}

// ─── g76 Defect 2: kinds absent from old narrow selector still hold readiness open ─────
// Late content composed ONLY of kinds absent from the old KINDS selector (data-testid-only,
// summary, iframe, tabindex) must still register in the census. Pre-fix: waitReady used a
// narrow KINDS selector that missed these; post-fix uses inPageEnumerate's matchReasonA.
console.log('\ng76 Defect 2: late content with only non-KINDS elements (testid, summary, iframe, tabindex) holds readiness');
{
  // Simulate: first 3 polls show a small <main> with 1 button, then content arrives
  // composed only of elements the OLD narrow selector missed (testid-only divs, summary, iframe).
  // Under the fix, these count as interactive (matchReasonA matches them), so census jumps.
  let pollCount = 0;
  const mockPage = {
    evaluate: async () => {
      pollCount++;
      if (pollCount <= 3) {
        // Small initial state — 1 button
        return { entries: [{ key: 'role:button|OK' }], candidates: [], stats: { scanned: 10, shadowHosts: 0, uniqueKeys: 1 } };
      }
      if (pollCount <= 5) {
        // Late content arrives: testid-only divs, summary, iframe, tabindex spans
        return { entries: [
          { key: 'role:button|OK' }, { key: 'testid:widget-1' }, { key: 'testid:widget-2' },
          { key: 'struct:summary|Details|form' }, { key: 'struct:iframe||content' },
          { key: 'struct:span|helper|tabindex' },
        ], candidates: [], stats: { scanned: 80, shadowHosts: 0, uniqueKeys: 6 } };
      }
      // Stabilizes at 6
      return { entries: [
        { key: 'role:button|OK' }, { key: 'testid:widget-1' }, { key: 'testid:widget-2' },
        { key: 'struct:summary|Details|form' }, { key: 'struct:iframe||content' },
        { key: 'struct:span|helper|tabindex' },
      ], candidates: [], stats: { scanned: 80, shadowHosts: 0, uniqueKeys: 6 } };
    },
    waitForTimeout: async () => {},
  };
  let ready = false, msg = '';
  try { await waitReady(mockPage, { interval: 10, timeout: 2000 }); ready = true; }
  catch (err) { msg = err.message; }
  assert('late non-KINDS content eventually becomes ready', ready, `got: ${msg}`);
  assert('did NOT declare ready during the 1-element phase (waited for late content)',
    pollCount > 5,
    `declared ready after ${pollCount} polls — pre-fix narrow KINDS missed these elements so census=1 was stable`);
}

// ─── g76 Defect 3: waitReady calls inPageEnumerate with 'main' (real path proof) ─────
// Proves the ACTUAL function+arg passed to page.evaluate is inPageEnumerate and 'main'.
// Fails if waitReady is reverted to a hand-rolled selector or document scope.
console.log('\ng76 Defect 3: waitReady invokes inPageEnumerate with container arg "main"');
{
  let capturedFn = null, capturedArg = null, pollCount = 0;
  const mockPage = {
    evaluate: async (fn, ...args) => {
      pollCount++;
      capturedFn = fn;
      capturedArg = args[0];
      // Return stable result immediately so it resolves after CENSUS_STABLE_READS
      return { entries: [{ key: 'testid:a' }, { key: 'testid:b' }, { key: 'testid:c' },
                         { key: 'testid:d' }, { key: 'testid:e' }, { key: 'testid:f' },
                         { key: 'testid:g' }, { key: 'testid:h' }, { key: 'testid:i' }],
               candidates: [], stats: { scanned: 20, shadowHosts: 0, uniqueKeys: 9 } };
    },
    waitForTimeout: async () => {},
  };
  await waitReady(mockPage, { interval: 10, timeout: 2000 });
  assert('page.evaluate receives inPageEnumerate (the shared enumerator function)',
    capturedFn === inPageEnumerate,
    `got different function: ${capturedFn && capturedFn.name}`);
  assert('page.evaluate receives "main" as the container argument',
    capturedArg === 'main',
    `got arg: ${JSON.stringify(capturedArg)}`);
}

// ─── g76 Finding 2: genuine errors surface in timeout message (LR-003) ──────────────
console.log('\ng76 Finding 2: genuine evaluate errors are surfaced in timeout message');
{
  let pollCount = 0;
  const mockPage = {
    evaluate: async () => {
      pollCount++;
      throw new Error('Serialization failed: cannot serialize function');
    },
    waitForTimeout: async () => {},
  };
  let msg = '';
  try { await waitReady(mockPage, { interval: 10, timeout: 80 }); }
  catch (err) { msg = err.message; }
  assert('timeout message includes WAIT_READY_TIMEOUT', msg.includes('[WAIT_READY_TIMEOUT]'), `got: ${msg}`);
  assert('timeout message includes the actual error text', msg.includes('Serialization failed'),
    `error not surfaced in timeout: ${msg}`);
}

console.log(`\n=== ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
