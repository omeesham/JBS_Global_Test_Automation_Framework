// scripts/walk-coverage/emit-case-rows.mjs
// Phase 2.3/2.5 — per-case row emitter.
//
// Crosses the machine-derived control types (Completion_Record.derived_types from
// enumerate-page.mjs) against the field-case taxonomy (field-case-generation.md) and
// emits one row per case per control. disposed_by is always null at emit — the gate
// (coverage-manifest.mjs) fills and validates it. This script never asserts coverage.
//
// Usage (--flag=value only — space-separated args break dispatch):
//   node scripts/walk-coverage/emit-case-rows.mjs \
//     --completion-record=<path>  \
//     --inventory=<path>          \
//     [--taxonomy=<path>]         \
//     [--json]                    \
//     [--out=<path>]
//
// Fail-closed:
//   taxonomy parse error          → stderr + exit 1, no partial output
//   controls > 0 AND rows === 0   → stderr + exit 1 (silent-pass guard)
//   missing required args         → stderr + exit 1
//
// No empty catch. No swallowed errors (LR-003).

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFieldCaseTaxonomy, parseFieldCaseTaxonomy } from './lib/field-case-parser.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI arg parsing (--flag=value only) ─────────────────────────────────────

function parseArgs(argv) {
  const o = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) o[m[1]] = m[2] === undefined ? true : m[2];
  }
  return o;
}

const args = parseArgs(process.argv);

if (args.help) {
  process.stdout.write(
    'emit-case-rows.mjs — per-case row emitter (Phase 2.3/2.5)\n' +
    '\n' +
    'Usage:\n' +
    '  node scripts/walk-coverage/emit-case-rows.mjs \\\n' +
    '    --completion-record=<path>   path to enumerate-page.mjs JSON output\n' +
    '    --inventory=<path>           path to field-inventory markdown artifact\n' +
    '    [--taxonomy=<path>]          override path to field-case-generation.md\n' +
    '    [--json]                     output JSON instead of NDJSON rows\n' +
    '    [--out=<path>]               write output to file instead of stdout\n' +
    '\n' +
    'Exit codes:\n' +
    '  0   success\n' +
    '  1   error (taxonomy failure, missing args, silent-pass guard)\n'
  );
  process.exit(0);
}

if (!args['completion-record'] || !args['inventory']) {
  process.stderr.write(
    'emit-case-rows: --completion-record and --inventory are required\n' +
    'Run with --help for usage.\n'
  );
  process.exit(1);
}

// ── Load taxonomy (fail-closed) ──────────────────────────────────────────────

let taxonomy;
try {
  if (args.taxonomy) {
    const text = readFileSync(resolve(args.taxonomy), 'utf-8');
    taxonomy = parseFieldCaseTaxonomy(text);
  } else {
    taxonomy = loadFieldCaseTaxonomy();
  }
} catch (err) {
  process.stderr.write(`emit-case-rows: taxonomy load failed — ${err.message}\n`);
  process.exit(1);
}

// ── Load completion record ───────────────────────────────────────────────────

let completionRecord;
try {
  const raw = readFileSync(resolve(args['completion-record']), 'utf-8');
  completionRecord = JSON.parse(raw);
} catch (err) {
  process.stderr.write(`emit-case-rows: completion-record load failed — ${err.message}\n`);
  process.exit(1);
}

const derivedTypes = completionRecord?.derived_types ?? {};
const controlKeys = Object.keys(derivedTypes);

// ── Load inventory and build testid → label map ──────────────────────────────

function parseInventoryLabels(mdText) {
  // Scans every ## Field Inventory table in the artifact (there may be sub-section tables).
  // Table header must contain 'Field' and 'data-testid' columns (§3 frozen 8-col contract).
  // Returns Map<testidValue, fieldLabel>.
  const lines = mdText.split('\n');
  const labelMap = new Map();

  let inInventorySection = false;
  let inTable = false;
  let pastSeparator = false;
  let fieldColIdx = -1;
  let testidColIdx = -1;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^##\s+Field Inventory/.test(trimmed)) {
      inInventorySection = true;
      inTable = false;
      pastSeparator = false;
      continue;
    }

    // A new top-level ## heading (not Field Inventory) ends the section
    if (inInventorySection && /^##\s/.test(trimmed) && !/^##\s+Field Inventory/.test(trimmed)) {
      inInventorySection = false;
      continue;
    }

    if (!inInventorySection) continue;

    if (!trimmed.startsWith('|')) {
      // Sub-heading (###) resets table state so we pick up the next table header
      if (trimmed.startsWith('#')) {
        inTable = false;
        pastSeparator = false;
      }
      continue;
    }

    const cols = trimmed.split('|').slice(1, -1).map(c => c.trim());

    if (!inTable) {
      // Header row — find our two target columns
      fieldColIdx  = cols.findIndex(c => c === 'Field');
      testidColIdx = cols.findIndex(c => c === 'data-testid');
      inTable = true;
      pastSeparator = false;
      continue;
    }

    if (!pastSeparator) {
      pastSeparator = true;
      continue;
    }

    if (fieldColIdx === -1 || testidColIdx === -1) continue;

    const fieldLabel = (cols[fieldColIdx] ?? '').trim();
    const testidRaw  = (cols[testidColIdx] ?? '').trim();

    // Strip "(none) — use ..." fallback markers; only real testid values are indexable
    if (testidRaw.startsWith('(none)')) continue;
    if (!testidRaw || !fieldLabel) continue;

    labelMap.set(testidRaw, fieldLabel);
  }

  return labelMap;
}

let inventoryLabels;
try {
  const invText = readFileSync(resolve(args.inventory), 'utf-8');
  inventoryLabels = parseInventoryLabels(invText);
} catch (err) {
  process.stderr.write(`emit-case-rows: inventory load failed — ${err.message}\n`);
  process.exit(1);
}

// ── Type lookup helpers ──────────────────────────────────────────────────────

// Map: fieldType.type (name string) → cases[]
const typeMap = new Map(taxonomy.fieldTypes.map(ft => [ft.type, ft.cases]));

// Widened set = union of all field types' cases (every type, every case)
const widenedCases = taxonomy.fieldTypes.flatMap(ft => ft.cases);

// Extract the raw testid from a controlKey (e.g. "id:foo-bar" → "foo-bar").
// For "struct:<key>" the whole suffix is used as-is for lookup.
function testidFromControlKey(ck) {
  const colon = ck.indexOf(':');
  return colon === -1 ? ck : ck.slice(colon + 1);
}

// ── Cross derived_types × taxonomy → rows ────────────────────────────────────

const rows = [];
const parityGaps = [];
const inventoryKeysHit = new Set();

for (const controlKey of controlKeys) {
  const entry = derivedTypes[controlKey];

  // Resolved only when the entry explicitly says so and has a non-empty type name
  const isResolved =
    entry != null &&
    entry.resolved === true &&
    entry.type != null &&
    entry.type !== '';

  // Inventory lookup — used for field_label
  const testid = testidFromControlKey(controlKey);
  const fieldLabel = inventoryLabels.get(testid) ?? null;

  if (fieldLabel === null) {
    parityGaps.push({ gap: 'in-derived-types-not-in-inventory', controlKey });
  } else {
    inventoryKeysHit.add(testid);
  }

  // Determine cases to emit, and whether widening was applied
  let casesToEmit;
  let widened = false;

  if (!isResolved) {
    // Unresolved / null type / missing entry — widest possible set
    casesToEmit = widenedCases;
    widened = true;
  } else {
    const typeCases = typeMap.get(entry.type);
    if (typeCases === undefined) {
      // Type name present in derived_types but not in taxonomy — widen
      casesToEmit = widenedCases;
      widened = true;
    } else {
      casesToEmit = typeCases;
    }
  }

  for (const c of casesToEmit) {
    // case_id is an INTERNAL key: <controlKey>::<verbatim taxonomy case label>
    // It maps back to a shipped TC id through field_key — we do NOT mint a third id scheme.
    const row = {
      case_id:         `${controlKey}::${c.input}`,
      field_key:       controlKey,
      field_label:     fieldLabel ?? 'UNRESOLVED',
      field_type:      isResolved ? entry.type : 'UNRESOLVED',
      category:        c.category,
      requires_oracle: c.requiresOracle,
      disposed_by:     null,
    };
    if (widened) row.widened = true;
    rows.push(row);
  }
}

// Detect inventory testids that have no corresponding controlKey in derived_types
for (const [testid] of inventoryLabels) {
  if (!inventoryKeysHit.has(testid)) {
    parityGaps.push({ gap: 'in-inventory-not-in-derived-types', testid });
  }
}

// ── Phase 2.5 — Case_Coverage_Ratio ─────────────────────────────────────────
// disposed_by is null everywhere at emit time; ratio is 0 — correct and honest.
// The gate (coverage-manifest.mjs) is what compares it against 100%.

const totalCases    = rows.length;
const disposedCases = rows.filter(r => r.disposed_by !== null).length;
const widenedCount  = rows.filter(r => r.widened === true).length;
const coverageRatio = totalCases === 0 ? 0 : disposedCases / totalCases;

const summary = {
  Case_Coverage_Ratio: {
    ratio:          coverageRatio,
    disposed_cases: disposedCases,
    total_cases:    totalCases,
  },
  controls:    controlKeys.length,
  rows:        totalCases,
  widened:     widenedCount,
  parity_gaps: parityGaps.length,
};

// ── Silent-pass guard (mandatory) ────────────────────────────────────────────
// Always print the machine-readable summary line first so callers can parse it
// even when we subsequently exit non-zero.

const summaryLine =
  `CASE-ROWS: controls=${controlKeys.length} rows=${totalCases} ` +
  `widened=${widenedCount} parity_gaps=${parityGaps.length}`;

process.stdout.write(summaryLine + '\n');

if (controlKeys.length > 0 && totalCases === 0) {
  process.stderr.write(
    'emit-case-rows: FATAL — controls > 0 but rows === 0 (silent-pass guard)\n'
  );
  process.exit(1);
}

// ── Assemble output ──────────────────────────────────────────────────────────

let outputText;
if (args.json) {
  outputText = JSON.stringify({ summary, rows, parity_gaps: parityGaps }, null, 2) + '\n';
} else {
  // NDJSON: one row per line, followed by a summary object
  const ndjson = rows.map(r => JSON.stringify(r)).join('\n');
  const summaryJson = JSON.stringify({ summary, parity_gaps: parityGaps }, null, 2);
  outputText = (ndjson ? ndjson + '\n' : '') + summaryJson + '\n';
}

if (args.out) {
  writeFileSync(resolve(args.out), outputText, 'utf-8');
  // Summary JSON echoed to stdout when redirected to a file
  process.stdout.write(JSON.stringify({ summary, parity_gaps: parityGaps }, null, 2) + '\n');
} else {
  process.stdout.write(outputText);
}
