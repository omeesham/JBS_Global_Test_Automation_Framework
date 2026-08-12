#!/usr/bin/env node
/**
 * xlsx-trim.test.mjs — differential tests for parseTcSelector.
 *
 * Corpus: every selector form xlsx-trim accepted BEFORE the parser widening,
 * plus the new full-ID endpoint form. Asserts the ID set is identical across
 * both the abbreviated and full-ID forms, and matches the expected set.
 *
 * Run: node scripts/xlsx-trim.test.mjs
 * Exit 0 = all pass.  Exit 1 = any failure.
 *
 * INTERNAL TOOLING — NEVER ships.
 */
import { parseTcSelector } from './xlsx-trim.mjs';
import { parseSelector } from './spec-trim.mjs';

let failures = 0;
let passed = 0;

function assert(condition, msg) {
  if (!condition) { console.error(`  FAIL: ${msg}`); failures++; }
  else passed++;
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function idsFrom(fn, sel) { return fn(sel); }

// --- Corpus: selectors that xlsx-trim accepted BEFORE the change ---
// Each entry: [selector, expectedIds] where expectedIds is the canonical set.
const corpus = [
  // Single IDs
  ['TC-CPR-OVR-001', new Set(['TC-CPR-OVR-001'])],
  ['TC-CPR-OVR-001,TC-CPR-OVR-045', new Set(['TC-CPR-OVR-001', 'TC-CPR-OVR-045'])],
  // Abbreviated ranges
  ['TC-CPR-OVR-001..003', new Set(['TC-CPR-OVR-001', 'TC-CPR-OVR-002', 'TC-CPR-OVR-003'])],
  ['TC-CPR-OVR-001..001', new Set(['TC-CPR-OVR-001'])],
  // Mixed comma + range
  ['TC-CPR-OVR-001..003,TC-CPR-OVR-010', new Set(['TC-CPR-OVR-001', 'TC-CPR-OVR-002', 'TC-CPR-OVR-003', 'TC-CPR-OVR-010'])],
  // Whitespace variants
  [' TC-CPR-OVR-001 , TC-CPR-OVR-002 ', new Set(['TC-CPR-OVR-001', 'TC-CPR-OVR-002'])],
  // Duplicates (set deduplication)
  ['TC-CPR-OVR-001,TC-CPR-OVR-001', new Set(['TC-CPR-OVR-001'])],
  // Differing zero-pad widths (3-digit pad from start)
  ['TC-LOC-NTS-01..03', new Set(['TC-LOC-NTS-01', 'TC-LOC-NTS-02', 'TC-LOC-NTS-03'])],
  // Range with underscore separator
  ['TC_TEST_001..003', new Set(['TC_TEST_001', 'TC_TEST_002', 'TC_TEST_003'])],
];

console.log('=== Differential test: pre-existing corpus (must be unchanged) ===');
for (const [sel, expected] of corpus) {
  const result = parseTcSelector(sel);
  const ok = setsEqual(result, expected);
  assert(ok, `parseTcSelector("${sel}") → ${[...result].sort()} (expected ${[...expected].sort()})`);
}

// --- New form: full-ID endpoint (the widening) ---
console.log('\n=== Full-ID endpoint form (new) ===');
const fullIdCases = [
  ['TC-CPR-OVR-001..TC-CPR-OVR-003', new Set(['TC-CPR-OVR-001', 'TC-CPR-OVR-002', 'TC-CPR-OVR-003'])],
  ['TC-CPR-OVR-001..TC-CPR-OVR-044', (() => { const s = new Set(); for (let i = 1; i <= 44; i++) s.add(`TC-CPR-OVR-${String(i).padStart(3,'0')}`); return s; })()],
  ['TC-CPR-OVR-001..TC-CPR-OVR-001', new Set(['TC-CPR-OVR-001'])],
  // Mixed: full-ID range + single
  ['TC-CPR-OVR-001..TC-CPR-OVR-003,TC-CPR-OVR-010', new Set(['TC-CPR-OVR-001', 'TC-CPR-OVR-002', 'TC-CPR-OVR-003', 'TC-CPR-OVR-010'])],
];

for (const [sel, expected] of fullIdCases) {
  const result = parseTcSelector(sel);
  const ok = setsEqual(result, expected);
  assert(ok, `parseTcSelector("${sel}") → ${result.size} IDs (expected ${expected.size})`);
}

// --- Differential: abbreviated vs full-ID must yield identical sets ---
console.log('\n=== Differential: abbreviated ≡ full-ID ===');
const equivalencePairs = [
  ['TC-CPR-OVR-001..003', 'TC-CPR-OVR-001..TC-CPR-OVR-003'],
  ['TC-CPR-OVR-001..044', 'TC-CPR-OVR-001..TC-CPR-OVR-044'],
  ['TC-CPR-OVR-010..010', 'TC-CPR-OVR-010..TC-CPR-OVR-010'],
  ['TC-LOC-NTS-01..05', 'TC-LOC-NTS-01..TC-LOC-NTS-05'],
  ['TC-CPR-OVR-001..003,TC-CPR-OVR-045', 'TC-CPR-OVR-001..TC-CPR-OVR-003,TC-CPR-OVR-045'],
];

for (const [abbrev, full] of equivalencePairs) {
  const aSet = parseTcSelector(abbrev);
  const fSet = parseTcSelector(full);
  assert(setsEqual(aSet, fSet), `abbreviated "${abbrev}" ≡ full-ID "${full}" (${aSet.size} vs ${fSet.size})`);
}

// --- Cross-parser differential: xlsx-trim ≡ spec-trim for all forms ---
console.log('\n=== Cross-parser: xlsx-trim ≡ spec-trim ===');
const crossCorpus = [
  'TC-CPR-OVR-001',
  'TC-CPR-OVR-001..003',
  'TC-CPR-OVR-001..TC-CPR-OVR-003',
  'TC-CPR-OVR-001..044',
  'TC-CPR-OVR-001..TC-CPR-OVR-044',
  'TC-CPR-OVR-001..003,TC-CPR-OVR-045',
  'TC-CPR-OVR-001..TC-CPR-OVR-003,TC-CPR-OVR-045',
];

for (const sel of crossCorpus) {
  const xlsx = parseTcSelector(sel);
  const spec = parseSelector(sel);
  assert(setsEqual(xlsx, spec), `cross-parser "${sel}": xlsx=${xlsx.size} spec=${spec.size}`);
}

// --- Error cases: must reject ---
console.log('\n=== Error cases (must reject) ===');
const rejectCases = [
  ['TC-CPR-OVR-001..TC-CPR-DET-003', 'mismatched prefix'],
  ['TC-CPR-OVR-005..003', 'end < start'],
  ['not-a-tcid..003', 'invalid start'],
];

for (const [sel, label] of rejectCases) {
  let threw = false;
  try { parseTcSelector(sel); } catch { threw = true; }
  assert(threw, `parseTcSelector("${sel}") should throw (${label})`);
}

console.log(`\n${passed} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
