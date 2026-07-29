#!/usr/bin/env node
/**
 * scripts/human-catch-reflex.mjs
 * Phase 1b — Human-Catch Reflex (SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL)
 *
 * Detects human-catch signals in messages (heuristic layer a) via two routes:
 *   - Route 1: Explicit marker phrases and bug-report patterns
 *   - Route 2: Artifact cross-reference (surface ID + walk-evidence/field-inventory grep)
 * and records validated catch entries to .claude/state/human-catches.jsonl.
 *
 * The trigger fires on structurally detectable events, not on a human
 * requesting the reflex. Owner mandate 2026-07-17:
 * "the trigger must not depend on the human asking."
 *
 * CLI:
 *   node scripts/human-catch-reflex.mjs --detect "<text>"    → exit 0 if catch detected, exit 1 if clean
 *   node scripts/human-catch-reflex.mjs --record '<json>'    → validate + append entry to ledger (exit 0), or reject (exit 1)
 *   node scripts/human-catch-reflex.mjs --self-test           → run internal test suite
 */

import { readFileSync, readdirSync, existsSync, appendFileSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const STATE_DIR = join(ROOT, '.claude', 'state');
const HUMAN_CATCHES_PATH = join(STATE_DIR, 'human-catches.jsonl');
const GATE_FIRES_LOG = join(STATE_DIR, 'gate-fires.log');
const GATE_NAME = 'human-catch-reflex';

// Frozen enum — mirrors VALID_SHC in check-recurrence-trial.mjs (contract, do not widen)
const VALID_SHC = new Set([
  'crud-derivable', 'domain-rule', 'novel-control-type', 'undocumented-intent',
]);
const NA_KEYS = ['oracle', 'fixture', 'tc', 'rule'];
const REQUIRED_TOP_KEYS = [
  'date', 'what', 'surface', 'pattern_class',
  'should_have_caught', 'why_machine_missed', 'never_again',
];

// ── Detection (heuristic layer a) ───────────────────────────────────────────
// Fires on structurally detectable signals in user messages.

const EXPLICIT_MARKERS = [
  /\b(?:you|u|y'all|agent|claude|copilot)\s+missed\b/i,
  /\bwhy\s+didn['']?t\s+(?:you|the\s+(?:agent|walk|test|scan))\s+(?:find|catch|notice|detect|flag|see)\b/i,
  /\bi\s+just\s+(?:saw|found|noticed|discovered|spotted|hit|encountered)\b/i,
  /\bshould\s+have\s+(?:caught|found|detected|noticed|flagged|seen)\b/i,
  /\bhow\s+(?:did|was)\s+this\s+(?:missed|not\s+caught|not\s+found)\b/i,
  /\bthe\s+(?:walk|test|scan|coverage|agent)\s+(?:missed|didn['']?t\s+(?:find|catch|cover))\b/i,
];

const BUG_REPORT_PATTERNS = [
  /\bi\s+(?:noticed|found|saw|discovered|spotted)\b.*\b(?:bug|broken|wrong|incorrect|missing|doesn['']?t\s+(?:work|save|show|display|appear)|fails?\s+to|not\s+(?:working|showing|saving|displaying))\b/i,
  /\bscreenshot\b.*\b(?:bug|broken|wrong|incorrect|missing|issue|problem|error|unexpected)\b/i,
  /\b(?:bug|broken|wrong|incorrect|missing|issue|problem|error|unexpected)\b.*\bscreenshot\b/i,
];

export function detectHumanCatch(text) {
  if (!text || typeof text !== 'string') return { detected: false, signals: [] };

  const signals = [];

  for (const rx of EXPLICIT_MARKERS) {
    const m = text.match(rx);
    if (m) signals.push({ layer: 'explicit', match: m[0] });
  }

  for (const rx of BUG_REPORT_PATTERNS) {
    const m = text.match(rx);
    if (m) signals.push({ layer: 'bug-report', match: m[0] });
  }

  return { detected: signals.length > 0, signals };
}

// ── Artifact Cross-Reference (heuristic layer a — route 2) ──────────────────
// Fires when a message reports an app behavior on a surface whose walk-evidence
// or field-inventory artifact does not contain the reported finding.
// Outcomes: DETECTED | CLEAN | NO-ARTIFACT | SURFACE-UNRESOLVED.

const CLIENT_INTERNAL = join(ROOT, 'clients', 'encore', 'specs_planning', '_internal');

const KNOWN_SURFACES = [
  { tokens: ['location settings'], key: 'location-settings' },
  { tokens: ['local office'], key: 'local-office' },
  { tokens: ['corporate pricing override'], key: 'corporate-pricing-override' },
  { tokens: ['corporate pricing'], key: 'corporate-pricing' },
  { tokens: ['shared setup'], key: 'shared-setup' },
  { tokens: ['account address'], key: 'account-address' },
  { tokens: ['basic information'], key: 'left-panel-basic-information' },
  { tokens: ['currency'], key: 'currency' },
];

const XREF_STOP = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','shall','should','may','might','must','can',
  'could','not','no','nor','and','but','or','for','in','on','at','to','from',
  'by','with','about','that','this','these','those','it','its','of','up','out',
  'off','over','into','then','than','just','only','also','very','too','here',
  'there','when','where','why','how','what','which','who','whom','all','each',
  'every','both','few','more','most','other','some','such','any','so','if',
  'because','as','while','page','tab','click','open','see','show','shows',
  'showing','display','displays','still','get','gets','got','like','new',
]);

function scanArtifactDir(baseDir) {
  const entries = [];
  if (!existsSync(baseDir)) return entries;
  try {
    for (const f of readdirSync(baseDir)) {
      const m = f.match(/^walk-evidence-(.+?)-\d{4}-\d{2}-\d{2}/);
      if (m) entries.push({ surfaceKey: m[1], searchable: m[1].replace(/-/g, ' '), file: join(baseDir, f) });
    }
  } catch { /* unreadable */ }
  const fiDir = join(baseDir, 'field-inventories');
  if (existsSync(fiDir)) {
    try {
      for (const f of readdirSync(fiDir)) {
        if (!f.endsWith('.md')) continue;
        const m = f.match(/^(.+?)-\d{4}-\d{2}-\d{2}/);
        if (m) entries.push({ surfaceKey: m[1], searchable: m[1].replace(/-/g, ' '), file: join(fiDir, f) });
      }
    } catch { /* unreadable */ }
  }
  return entries;
}

export function detectArtifactCrossRef(text, options = {}) {
  if (!text || typeof text !== 'string')
    return { outcome: 'SURFACE-UNRESOLVED', surface: null, artifacts: [], findingTerms: [], reason: 'Empty or non-string input' };

  const baseDir = options.artifactDir || CLIENT_INTERNAL;
  const lower = text.toLowerCase();

  const staticMatches = [];
  for (const s of KNOWN_SURFACES) {
    for (const tok of s.tokens) {
      if (lower.includes(tok)) { staticMatches.push(s.key); break; }
    }
  }
  const dirEntries = scanArtifactDir(baseDir);
  const dirMatches = [];
  for (const e of dirEntries) { if (lower.includes(e.searchable)) dirMatches.push(e.surfaceKey); }
  const allSurfaces = [...new Set([...staticMatches, ...dirMatches])];

  if (allSurfaces.length === 0)
    return { outcome: 'SURFACE-UNRESOLVED', surface: null, artifacts: [], findingTerms: [], reason: 'No known surface matched in message' };

  const artifactFiles = dirEntries.filter(e => allSurfaces.includes(e.surfaceKey)).map(e => e.file);

  if (artifactFiles.length === 0)
    return { outcome: 'NO-ARTIFACT', surface: allSurfaces.join(', '), artifacts: [], findingTerms: [], reason: 'Surface identified but no artifact files found' };

  const surfaceWords = new Set();
  for (const sk of allSurfaces) for (const w of sk.split('-')) surfaceWords.add(w);
  const findingTerms = [...new Set(
    lower.split(/\W+/).filter(w => w.length > 2 && !XREF_STOP.has(w) && !surfaceWords.has(w))
  )];

  if (findingTerms.length === 0)
    return { outcome: 'SURFACE-UNRESOLVED', surface: allSurfaces.join(', '), artifacts: artifactFiles, findingTerms: [], reason: 'No finding terms extracted' };

  const threshold = Math.ceil(findingTerms.length / 2);
  for (const fp of artifactFiles) {
    let content;
    try { content = readFileSync(fp, 'utf-8'); } catch { continue; }
    const artLower = content.toLowerCase();
    const matched = findingTerms.filter(t => artLower.includes(t));
    if (matched.length >= threshold)
      return { outcome: 'CLEAN', surface: allSurfaces.join(', '), artifacts: artifactFiles, findingTerms, matchedTerms: matched, reason: `Artifact covers finding (${matched.join(', ')})` };
  }

  return { outcome: 'DETECTED', surface: allSurfaces.join(', '), artifacts: artifactFiles, findingTerms, matchedTerms: [], reason: 'Artifacts exist but none contain the reported finding' };
}

// ── Recording (the reflex action) ───────────────────────────────────────────

export function validateEntry(entry) {
  const errs = [];

  for (const k of REQUIRED_TOP_KEYS) {
    if (entry[k] === undefined || entry[k] === null ||
        (typeof entry[k] === 'string' && entry[k].trim() === '')) {
      errs.push(`Missing/empty required field: ${k}`);
    }
  }

  if (entry.should_have_caught && !VALID_SHC.has(entry.should_have_caught)) {
    errs.push(
      `Invalid should_have_caught: "${entry.should_have_caught}" — ` +
      `must be one of: ${[...VALID_SHC].join(', ')}`
    );
  }

  if (!entry.never_again || typeof entry.never_again !== 'object') {
    errs.push('Missing never_again object');
  } else {
    for (const k of NA_KEYS) {
      const val = entry.never_again[k];
      if (val === undefined || val === null || String(val).trim() === '')
        errs.push(`Empty never_again.${k}`);
    }
  }

  return errs;
}

export function recordCatch(entryJson) {
  let entry;
  try {
    entry = typeof entryJson === 'string' ? JSON.parse(entryJson) : entryJson;
  } catch (ex) {
    return { success: false, errors: [`Invalid JSON: ${ex.message}`] };
  }

  const errs = validateEntry(entry);
  if (errs.length) return { success: false, errors: errs };

  mkdirSync(dirname(HUMAN_CATCHES_PATH), { recursive: true });
  appendFileSync(HUMAN_CATCHES_PATH, JSON.stringify(entry) + '\n');

  fireTelemetry('recorded', entry.surface || 'unknown');
  return { success: true, errors: [] };
}

// ── Telemetry ───────────────────────────────────────────────────────────────

function fireTelemetry(verdict, target) {
  mkdirSync(dirname(GATE_FIRES_LOG), { recursive: true });
  appendFileSync(GATE_FIRES_LOG,
    `${GATE_NAME}, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
}

// ── Self-test ───────────────────────────────────────────────────────────────

function selfTest() {
  let fails = 0, total = 0;
  const assert = (ok, label) => {
    total++;
    if (!ok) { fails++; console.error(`  FAIL: ${label}`); }
    else { console.log(`  PASS: ${label}`); }
  };

  console.log('=== Detection: Explicit Markers ===');
  assert(detectHumanCatch('you missed the checkbox in the dialog').detected,
    '"you missed" → detected');
  assert(detectHumanCatch('u missed this bug').detected,
    '"u missed" → detected');
  assert(detectHumanCatch("why didn't you find the broken save button?").detected,
    '"why didn\'t you find" → detected');
  assert(detectHumanCatch('i just saw that the picker is wrong').detected,
    '"i just saw" → detected');
  assert(detectHumanCatch('should have caught this during the walk').detected,
    '"should have caught" → detected');
  assert(detectHumanCatch('how was this missed by the test?').detected,
    '"how was this missed" → detected');

  console.log('\n=== Detection: Bug-Report Patterns ===');
  assert(detectHumanCatch(
    'I noticed the save button is broken on the settings page').detected,
    'bug-report pattern → detected');
  assert(detectHumanCatch(
    "I found a bug where the form doesn't save").detected,
    '"I found a bug" → detected');
  assert(detectHumanCatch(
    'screenshot shows the error is still there').detected,
    'screenshot + error → detected');

  console.log('\n=== Detection: Clean Messages (no false fire) ===');
  assert(!detectHumanCatch('Please add a new test for the login page').detected,
    'normal request → not detected');
  assert(!detectHumanCatch('Can you refactor the auth module?').detected,
    'refactor request → not detected');
  assert(!detectHumanCatch('Run the test suite and report results').detected,
    'run tests → not detected');
  assert(!detectHumanCatch('Update the README with the new API docs').detected,
    'docs update → not detected');
  assert(!detectHumanCatch('').detected,
    'empty string → not detected');

  console.log('\n=== Recording: Valid Entry ===');
  const validEntry = {
    date: '2026-07-25', what: 'self-test entry', surface: 'self-test',
    pattern_class: 'self-test', should_have_caught: 'crud-derivable',
    why_machine_missed: 'self-test reason',
    never_again: { oracle: 'test', fixture: 'test', tc: 'test', rule: 'test' },
  };
  assert(validateEntry(validEntry).length === 0,
    'valid entry → 0 validation errors');

  console.log('\n=== Recording: Enum Enforcement ===');
  const badEnum = { ...validEntry, should_have_caught: 'made-up-category' };
  assert(validateEntry(badEnum).some(e => e.includes('Invalid should_have_caught')),
    'invalid enum value → rejected');
  const emptyEnum = { ...validEntry, should_have_caught: '' };
  assert(validateEntry(emptyEnum).length > 0,
    'empty should_have_caught → rejected');

  console.log('\n=== Recording: Never-Again Validation ===');
  const emptyFixture = {
    ...validEntry, never_again: { oracle: 'x', fixture: '', tc: 'x', rule: 'x' },
  };
  assert(validateEntry(emptyFixture).some(e => e.includes('never_again.fixture')),
    'empty fixture → rejected');
  const noNA = { ...validEntry, never_again: undefined };
  assert(validateEntry(noNA).some(e => e.includes('Missing never_again')),
    'missing never_again object → rejected');

  console.log('\n=== Recording: Required Fields ===');
  const noDate = { ...validEntry, date: undefined };
  assert(validateEntry(noDate).some(e => e.includes('date')),
    'missing date → rejected');
  const noWhat = { ...validEntry, what: '' };
  assert(validateEntry(noWhat).some(e => e.includes('what')),
    'empty what → rejected');

  console.log('\n=== Cross-Reference: Artifact Detection ===');
  const xrefTmp = join(STATE_DIR, '_xref-test-' + Date.now());
  mkdirSync(xrefTmp, { recursive: true });
  writeFileSync(join(xrefTmp, 'walk-evidence-test-surface-2026-01-01.md'),
    '# Walk Evidence\nObserved: widget renders correctly, checkbox is checked.\n');

  const xr1 = detectArtifactCrossRef(
    'the test surface has a broken foobar component', { artifactDir: xrefTmp });
  assert(xr1.outcome === 'DETECTED', 'xref: finding absent → DETECTED');

  const xr2 = detectArtifactCrossRef(
    'the test surface widget checkbox renders fine', { artifactDir: xrefTmp });
  assert(xr2.outcome === 'CLEAN', 'xref: finding present → CLEAN');

  const xr3 = detectArtifactCrossRef(
    'the unknown panel has a broken feature', { artifactDir: xrefTmp });
  assert(xr3.outcome === 'SURFACE-UNRESOLVED', 'xref: unknown surface → SURFACE-UNRESOLVED');

  const xr4 = detectArtifactCrossRef(
    'the location settings foobar is wrong', { artifactDir: xrefTmp });
  assert(xr4.outcome === 'NO-ARTIFACT', 'xref: known surface, no file → NO-ARTIFACT');

  try { unlinkSync(join(xrefTmp, 'walk-evidence-test-surface-2026-01-01.md')); } catch {}
  try { rmdirSync(xrefTmp); } catch {}

  fireTelemetry(fails === 0 ? 'pass' : 'deny', 'self-test');

  console.log(`\n=== Results: ${total - fails}/${total} passed ===`);
  if (fails) { console.error(`VERDICT: FAIL (${fails} failures)`); process.exit(1); }
  console.log('VERDICT: PASS');
  process.exit(0);
}

// ── CLI ─────────────────────────────────────────────────────────────────────

const __isMain = resolve(process.argv[1] || '') === __filename;
if (__isMain) {

const args = process.argv.slice(2);

if (args.includes('--self-test')) {
  selfTest();
} else if (args.includes('--detect')) {
  const idx = args.indexOf('--detect');
  const text = args[idx + 1];
  if (!text) { console.error('Usage: --detect "<text>"'); process.exit(1); }

  const markerResult = detectHumanCatch(text);
  const xrefResult = detectArtifactCrossRef(text);
  const anyDetected = markerResult.detected || xrefResult.outcome === 'DETECTED';

  fireTelemetry(anyDetected ? 'detected' : 'clean', 'detect-cli');

  if (markerResult.detected) {
    console.log(`DETECTED: explicit marker signals (${markerResult.signals.length} signal(s))`);
    for (const s of markerResult.signals) console.log(`  [${s.layer}] ${s.match}`);
  }

  console.log(`XREF: ${xrefResult.outcome} — ${xrefResult.reason}`);
  if (xrefResult.outcome === 'DETECTED') {
    console.log(`  surface: ${xrefResult.surface}`);
    console.log(`  finding terms absent: ${xrefResult.findingTerms.join(', ')}`);
  }

  if (anyDetected) {
    process.exit(0);
  } else {
    console.log('CLEAN: no human-catch signals from either route');
    process.exit(1);
  }
} else if (args.includes('--record')) {
  const idx = args.indexOf('--record');
  const json = args[idx + 1];
  if (!json) { console.error("Usage: --record '<json>'"); process.exit(1); }

  const result = recordCatch(json);
  if (result.success) {
    console.log('RECORDED: entry appended to ledger');
    process.exit(0);
  } else {
    console.error(`REJECTED: ${result.errors.join('; ')}`);
    process.exit(1);
  }
} else {
  console.log('Usage:');
  console.log('  --detect "<text>"    Detect human-catch signals in text');
  console.log("  --record '<json>'    Validate + append catch entry to ledger");
  console.log('  --self-test          Run internal test suite');
  process.exit(1);
}

} // end __isMain
