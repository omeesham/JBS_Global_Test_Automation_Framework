#!/usr/bin/env node
// scripts/walk-coverage/tests/enumerate-page-fixes.test.mjs
// Unit tests for the four bug-fix causes in enumerate-page.mjs / lib/deep-pierce.mjs.
// No browser required — mocks are used for page-dependent paths.
// Each test is structured so it FAILS against the pre-fix code.

import { deriveFieldType, waitReady, waitReadyContent, enumerateState, renavigateToOrigin, deriveAllFieldTypes, entryKeyToSelector, resolveBranchOpener, MODULE_CONFIG } from '../enumerate-page.mjs';

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

  // Mock page: count never stabilizes (always returns 3, never >= minTestids=8)
  const mockPage = {
    evaluate: async () => 3,
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

console.log(`\n=== ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
