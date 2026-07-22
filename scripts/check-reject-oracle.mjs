#!/usr/bin/env node
/**
 * check-reject-oracle.mjs — reject-oracle GATE for negative/BVA field cases.
 *
 * This is a FLOOR — it requires a known-good assertion (assertRejectionOracle) to be present
 * and to have executed. It is NOT a detector. The five existing members of the check:spec-quality
 * chain are detectors: they recognise known-bad shapes. A detector cannot catch an assertion that
 * is merely ABSENT, which is exactly how a real >100 focus-trap passed as a clean GREEN. Do not
 * "simplify" this into a detector.
 *
 * Sev: S1 (silent quality drift surviving to commit/ship).
 * Graduating incident: 2026-06-10 — TC-LOC-CPR-523 asserted tryMaxDiscount(150).toBe(false) as a
 * PASS while the helper auto-Escaped, masking a real silent focus-trap (Max Discount >100 traps the
 * cursor with no error, no escape). See agent-mistakes.md 2026-06-10 entry and field-case-generation.md §2.1.
 *
 * Mode: read reject_oracle_mode from .claude/guardrail-config.json.
 *   announce → print findings, exit 0 (default when key/file absent — says so).
 *   deny     → print findings, exit 1.
 * Absent key/file → default announce (logged).
 * Unreadable/malformed config → FAIL (exit 1), never silent skip (LR-003).
 *
 * CLI:
 *   --receipts-dir <dir>    Receipts dir (default: clients/encore/.machine-evidence/reject-oracle)
 *   --specs-dir <dir>       Spec files dir (default: clients/encore/tests)
 *   --inventory-dir <dir>   Field-case catalog dir
 *                           (default: clients/encore/specs_planning/_internal/field-case-catalogs)
 *   --repo-root <dir>       Repo root (default: parent of scripts/)
 *   --json                  Emit machine-readable JSON
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

// ─── Mode reader ──────────────────────────────────────────────────────────────

/**
 * Read reject_oracle_mode from guardrail-config.json.
 * Fails-CLOSED (throws) on unreadable or malformed config.
 * Defaults to 'announce' only when the file is genuinely absent.
 * @param {string} repoRoot
 * @returns {{ mode: string, fromDefault: boolean }}
 */
function readMode(repoRoot) {
  const configPath = path.join(repoRoot, '.claude', 'guardrail-config.json');
  if (!fs.existsSync(configPath)) {
    return { mode: 'announce', fromDefault: true };
  }
  let raw;
  try {
    raw = fs.readFileSync(configPath, 'utf-8');
  } catch (err) {
    throw new Error(`[reject-oracle] Cannot read guardrail-config.json: ${err.message}`);
  }
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (err) {
    throw new Error(`[reject-oracle] Malformed guardrail-config.json: ${err.message}`);
  }
  const mode = 'reject_oracle_mode' in cfg ? cfg.reject_oracle_mode : 'announce';
  return { mode, fromDefault: !('reject_oracle_mode' in cfg) };
}

// ─── Case-row reader ──────────────────────────────────────────────────────────

/**
 * Scan catalog markdown files under inventoryDir for "covered-by-TC:<ID>" dispositions.
 *
 * Assumed row format (parallel ticket is introducing it — recorded in ## ASK):
 *   Any markdown table row or text line containing the literal token "covered-by-TC:<ID>".
 *   Field name is assumed to be the first pipe-delimited cell on the same line when the line
 *   is a markdown table row (starts with "|"). Empty field = check 5 (field-match) is skipped.
 *
 * Returns [] if inventoryDir is absent or no covered-by-TC: tokens exist (tolerant of absent
 * inventory — caller reports "0 rows checked" and exits per mode).
 *
 * Throws (never silently skips) on unreadable catalog files.
 *
 * @typedef {{ caseId: string, field: string, sourceLine: string, sourceFile: string }} CaseRow
 * @param {string} inventoryDir
 * @returns {CaseRow[]}
 */
function loadCaseRows(inventoryDir) {
  if (!fs.existsSync(inventoryDir)) return [];

  let files;
  try {
    files = fs.readdirSync(inventoryDir).filter((f) => f.endsWith('.md'));
  } catch (err) {
    throw new Error(`[reject-oracle] Cannot read inventory dir ${inventoryDir}: ${err.message}`);
  }

  const rows = [];
  const COVERED_BY_RE = /covered-by-TC:([A-Za-z0-9_-]+)/g;

  for (const file of files) {
    const filePath = path.join(inventoryDir, file);
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      throw new Error(`[reject-oracle] Cannot read catalog file ${filePath}: ${err.message}`);
    }
    for (const line of content.split('\n')) {
      COVERED_BY_RE.lastIndex = 0;
      let m;
      while ((m = COVERED_BY_RE.exec(line)) !== null) {
        let field = '';
        if (line.trimStart().startsWith('|')) {
          const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
          if (cells.length > 0) field = cells[0];
        }
        rows.push({ caseId: m[1], field, sourceLine: line.trim(), sourceFile: filePath });
      }
    }
  }

  return rows;
}

// ─── Spec scanner ─────────────────────────────────────────────────────────────

/**
 * Recursively collect .spec.ts files under dir.
 * @param {string} dir
 * @returns {string[]}
 */
function collectSpecFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectSpecFiles(full));
    else if (entry.name.endsWith('.spec.ts')) results.push(full);
  }
  return results;
}

/**
 * Find spec files that contain a test whose title includes caseId.
 * Matches test( / test.fixme( / test.skip( / test.only( / it( patterns.
 * @param {string[]} specFiles
 * @param {string} caseId
 * @returns {string[]}
 */
function findSpecsWithCaseId(specFiles, caseId) {
  const TITLE_RE = /\btest(?:\.fixme|\.skip|\.only)?\s*\(\s*['"`]([^'"`\n]*)/g;
  const found = [];
  for (const f of specFiles) {
    let content;
    try {
      content = fs.readFileSync(f, 'utf-8');
    } catch {
      continue;
    }
    TITLE_RE.lastIndex = 0;
    let m;
    while ((m = TITLE_RE.exec(content)) !== null) {
      if (m[1].includes(caseId)) {
        found.push(f);
        break;
      }
    }
  }
  return found;
}

// ─── Receipt helpers ──────────────────────────────────────────────────────────

/**
 * Load and parse a receipt JSON file. Throws on unreadable or malformed (LR-003).
 * @param {string} receiptPath
 * @returns {object}
 */
function loadReceipt(receiptPath) {
  let raw;
  try {
    raw = fs.readFileSync(receiptPath, 'utf-8');
  } catch (err) {
    throw new Error(`Cannot read receipt at ${receiptPath}: ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Malformed JSON in receipt ${receiptPath}: ${err.message}`);
  }
}

/**
 * Recompute receipt_sha256 over the body with receipt_sha256 stripped.
 * Mirrors assertRejectionOracle / coverage-manifest.mjs self-hash convention:
 *   sha256(JSON.stringify(body, null, 2) + '\n')
 * @param {object} receipt
 * @returns {string}
 */
function computeReceiptSha256(receipt) {
  // eslint-disable-next-line no-unused-vars
  const { receipt_sha256: _stripped, ...body } = receipt;
  return createHash('sha256').update(JSON.stringify(body, null, 2) + '\n').digest('hex');
}

/**
 * Compute sha256 of a file's UTF-8 content. Throws on unreadable (LR-003).
 * @param {string} filePath
 * @returns {string}
 */
function fileSha256(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath, 'utf-8')).digest('hex');
}

// ─── Core gate logic ──────────────────────────────────────────────────────────

/**
 * Check a single case row against its receipt and spec files.
 * Returns an array of finding strings (empty array = PASS for this row).
 *
 * Checks performed:
 *   1. Title binding — a test title in specs-dir contains the case id.
 *   2. Receipt present — <receipts-dir>/<case_id>.json exists.
 *   3. Receipt fresh — spec_sha256 matches current spec file content.
 *   4. Receipt untampered — receipt_sha256 matches recomputed hash of stripped body.
 *   5. Field match — receipt.field matches the case row's field (skipped when field unextractable).
 *   6. Both limbs — announced === true AND escapable === true.
 *
 * @param {{ caseId: string, field: string }} row
 * @param {string} receiptsDir
 * @param {string[]} specFiles
 * @param {string} repoRoot
 * @returns {string[]}
 */
function checkCaseRow(row, receiptsDir, specFiles, repoRoot) {
  const findings = [];
  const { caseId, field: rowField } = row;

  // Check 2: Receipt present.
  const receiptPath = path.join(receiptsDir, `${caseId}.json`);
  if (!fs.existsSync(receiptPath)) {
    findings.push(`[FAIL] ${caseId}: receipt missing at ${path.relative(repoRoot, receiptPath)}`);
    return findings; // checks 3–6 require a receipt
  }

  let receipt;
  try {
    receipt = loadReceipt(receiptPath);
  } catch (err) {
    findings.push(`[FAIL] ${caseId}: ${err.message}`);
    return findings;
  }

  // Check 4: Receipt untampered.
  const expectedSha = computeReceiptSha256(receipt);
  if (receipt.receipt_sha256 !== expectedSha) {
    findings.push(
      `[FAIL] ${caseId}: receipt_sha256 tampered — stored=${receipt.receipt_sha256} recomputed=${expectedSha}`,
    );
  }

  // Check 1: Title binding — at least one spec test title must contain caseId.
  const matchingSpecs = findSpecsWithCaseId(specFiles, caseId);
  if (matchingSpecs.length === 0) {
    findings.push(
      `[FAIL] ${caseId}: no test title in specs-dir contains "${caseId}" — title binding required`,
    );
    // Check 3 cannot run without a spec file.
  } else {
    // Check 3: Receipt fresh — spec_sha256 must equal current spec file content hash.
    const specFile = matchingSpecs[0];
    let currentSha;
    try {
      currentSha = fileSha256(specFile);
    } catch (err) {
      findings.push(`[FAIL] ${caseId}: cannot hash spec ${path.relative(repoRoot, specFile)}: ${err.message}`);
      currentSha = null;
    }
    if (currentSha !== null && receipt.spec_sha256 !== currentSha) {
      findings.push(
        `[FAIL] ${caseId}: spec_sha256 stale — stored=${receipt.spec_sha256} current=${currentSha} (${path.relative(repoRoot, specFile)})`,
      );
    }
  }

  // Check 5: Field match (skipped when field is not extractable from the catalog row).
  if (rowField) {
    if (receipt.field !== rowField) {
      findings.push(
        `[FAIL] ${caseId}: field mismatch — receipt.field="${receipt.field}" row.field="${rowField}"`,
      );
    }
  }

  // Check 6: Both limbs true.
  if (receipt.announced !== true) {
    findings.push(
      `[FAIL] ${caseId}: announced limb is ${JSON.stringify(receipt.announced)}, expected true`,
    );
  }
  if (receipt.escapable !== true) {
    findings.push(
      `[FAIL] ${caseId}: escapable limb is ${JSON.stringify(receipt.escapable)}, expected true`,
    );
  }

  return findings;
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Run the reject-oracle gate.
 * @param {{ repoRoot?: string, receiptsDir?: string, specsDir?: string, inventoryDir?: string, jsonOutput?: boolean }} opts
 * @returns {{ exitCode: number, findings: string[], rowsChecked: number, mode: string }}
 */
export function run({
  repoRoot = DEFAULT_REPO_ROOT,
  receiptsDir,
  specsDir,
  inventoryDir,
  jsonOutput = false,
} = {}) {
  const resolvedReceiptsDir =
    receiptsDir ?? path.join(repoRoot, 'clients', 'encore', '.machine-evidence', 'reject-oracle');
  const resolvedSpecsDir = specsDir ?? path.join(repoRoot, 'clients', 'encore', 'tests');
  const resolvedInventoryDir =
    inventoryDir ??
    path.join(
      repoRoot,
      'clients',
      'encore',
      'specs_planning',
      '_internal',
      'field-case-catalogs',
    );

  // Read mode — fail-CLOSED on unreadable/malformed config.
  const { mode, fromDefault } = readMode(repoRoot);
  if (fromDefault && !jsonOutput) {
    console.warn(
      '[reject-oracle] WARNING: reject_oracle_mode absent from guardrail-config.json — defaulting to announce',
    );
  }

  // Load case rows — tolerant of absent inventory.
  const rows = loadCaseRows(resolvedInventoryDir);
  if (rows.length === 0) {
    const msg = `[reject-oracle] 0 rows checked — no covered-by-TC:<ID> dispositions found in ${path.relative(repoRoot, resolvedInventoryDir)}`;
    if (jsonOutput) {
      console.log(JSON.stringify({ mode, rowsChecked: 0, findings: [], message: msg }));
    } else {
      console.log(msg);
    }
    // Exit per mode even on 0 rows so callers observe correct exit code.
    return { exitCode: 0, findings: [], rowsChecked: 0, mode };
  }

  // Collect spec files once for efficiency.
  const specFiles = collectSpecFiles(resolvedSpecsDir);

  // Run all checks.
  const allFindings = [];
  for (const row of rows) {
    allFindings.push(...checkCaseRow(row, resolvedReceiptsDir, specFiles, repoRoot));
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ mode, rowsChecked: rows.length, findings: allFindings }));
  } else {
    if (allFindings.length > 0) {
      console.log(
        `\n[reject-oracle] ${allFindings.length} finding(s) across ${rows.length} row(s) (mode=${mode}):`,
      );
      for (const f of allFindings) console.log('  ' + f);
      if (mode === 'announce') {
        console.log('[reject-oracle] mode=announce — findings printed, exit 0');
      }
    } else {
      console.log(`[reject-oracle] CLEAN — ${rows.length} row(s) checked, 0 findings`);
    }
  }

  const exitCode = allFindings.length > 0 && mode === 'deny' ? 1 : 0;
  return { exitCode, findings: allFindings, rowsChecked: rows.length, mode };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--receipts-dir') opts.receiptsDir = argv[++i];
    else if (argv[i] === '--specs-dir') opts.specsDir = argv[++i];
    else if (argv[i] === '--inventory-dir') opts.inventoryDir = argv[++i];
    else if (argv[i] === '--repo-root') opts.repoRoot = argv[++i];
    else if (argv[i] === '--json') opts.jsonOutput = true;
  }
  return opts;
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '')) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    const { exitCode } = run(opts);
    process.exit(exitCode);
  } catch (err) {
    console.error('[reject-oracle] FATAL:', err.message);
    process.exit(1);
  }
}
