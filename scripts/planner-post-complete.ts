#!/usr/bin/env ts-node
/**
 * Planner Post-Complete Hook — Auto-rebuilds the XLSX workbook.
 *
 * Triggered when Planner marks stage as pending_generation.
 * Rebuilds clients/<id>/testcases/encore_test_cases.xlsx via the
 * shared `npm run xlsx:build` script (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION
 * Phase B). The legacy per-item CSV export path is preserved as a one-phase
 * alias (`csvExport` artifact + `csv_export` history action) so older queue
 * entries and consumers continue to resolve; both aliases are removed in
 * Phase D.
 *
 * Features:
 * - Auto-detects newly completed planning tasks
 * - Rebuilds the single multi-sheet XLSX workbook on first call per run
 *   (idempotent — subsequent items skip the rebuild)
 * - Updates queue item with `xlsxArtifact` artifact path
 * - Validates uiTestingChecklist is complete before rebuild
 *
 * Usage: npm run planner:post-complete [--queue-item-id]
 *        npm run planner:post-complete --all (process all pending)
 *
 * Ad-hoc mode (PLAN_DONE_MEANS_DONE Phase 2.6 — no queue entry required, no package.json
 * alias because package.json is human-controlled NEVER-modify per §2; invoke ts-node directly):
 *        npx ts-node scripts/planner-post-complete.ts --ad-hoc --module=<name>
 *   Runs the Q-checks directly against a named module (Q1 file freshness, Q2 TC-plan sync,
 *   Q3 header count, Q4 XLSX row count == MD TC count). Use after an ad-hoc OWNER /execute that
 *   rebuilt the workbook outside the queue (the gap SUBPLAN_LEGAL_FCC Deviation D2 hit).
 *
 * Exit: 0 = success, 1 = error
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as XLSX from 'xlsx';
import { UITestingChecklist, QueueItem, QueueFile, SHARED_PATHS } from './shared-types';
import { frameworkRoot } from './shared-paths';
import {
  validateSelfAuditBase,
  runValidateSyncGate,
  checkMidWorkCapture,
} from './validation-gates';

const PATHS = SHARED_PATHS;

// Keyword evidence for checklist self-certification validation
const CHECKLIST_EVIDENCE_KEYWORDS: Record<string, string[]> = {
  boundaryTesting: ['boundary', 'min', 'max', 'limit', 'range', 'character', 'length', 'overflow', 'exceed'],
  errorVerification: ['error', 'invalid', 'validation', 'fail', 'reject', 'required', 'empty', 'blank'],
  crossFieldValidation: ['depends', 'dependency', 'conditional', 'when', 'toggle', 'enable', 'disable', 'grayed'],
  errorRecovery: ['recover', 'undo', 'revert', 'cancel', 'discard', 'unsaved', 'restore'],
};

/**
 * HARD GATE: Validate structural sections exist in test case file.
 * These are mandatory per PLN-003, PLN-038, and audit findings.
 * No --force bypass.
 */
function validateStructuralSections(item: QueueItem): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  const tcFile = item.artifacts?.testCaseFile;
  if (!tcFile) {
    errors.push('STRUCT: No testCaseFile in artifacts');
    return { passed: false, errors };
  }

  const tcPath = path.isAbsolute(tcFile) ? tcFile : path.join(__dirname, '..', tcFile);
  if (!fs.existsSync(tcPath)) {
    errors.push(`STRUCT: Test case file not found: ${tcPath}`);
    return { passed: false, errors };
  }

  const content = fs.readFileSync(tcPath, 'utf-8');

  // STRUCT-001: FIELD INVENTORY section must exist
  const fieldInvMatch = content.match(/^## FIELD INVENTORY/im);
  if (!fieldInvMatch) {
    errors.push('STRUCT-001: Missing "## FIELD INVENTORY" section. Every test case file must document all editable fields in a table before test cases begin.');
  } else {
    // Must contain at least one table row (| Field | or | ... |)
    const fieldInvIdx = content.indexOf(fieldInvMatch[0]);
    const sectionAfter = content.slice(fieldInvIdx, fieldInvIdx + 2000);
    const tableRows = sectionAfter.match(/^\|[^|]+\|/gm);
    if (!tableRows || tableRows.length < 2) { // header + at least 1 data row
      errors.push('STRUCT-001: FIELD INVENTORY section exists but has no table rows. Must contain a markdown table with at least 1 field row.');
    }
  }

  // STRUCT-002: Validation Rules section must exist (can be N/A with reason)
  const valRulesMatch = content.match(/^## Validation Rules/im);
  if (!valRulesMatch) {
    errors.push('STRUCT-002: Missing "## Validation Rules" section. Required even if N/A — add "## Validation Rules\\nN/A — [reason]" for checkbox-only tabs.');
  }

  // STRUCT-003: MCP_VERIFICATION_LOG section must exist with key rows
  const mcpLogMatch = content.match(/^## MCP_VERIFICATION_LOG/im);
  if (!mcpLogMatch) {
    errors.push('STRUCT-003: Missing "## MCP_VERIFICATION_LOG" section. Every test case file must include MCP verification evidence.');
  } else {
    const mcpIdx = content.indexOf(mcpLogMatch[0]);
    const mcpSection = content.slice(mcpIdx, mcpIdx + 3000);
    if (!mcpSection.includes('| Date |')) {
      errors.push('STRUCT-003: MCP_VERIFICATION_LOG missing "| Date |" row.');
    }
    if (!mcpSection.match(/\|\s*Selector verification\s*\|/i)) {
      errors.push('STRUCT-003: MCP_VERIFICATION_LOG missing "| Selector verification |" row.');
    }
  }

  // STRUCT-004: Date sync between test cases and test plan
  const tpFile = item.artifacts?.testPlanFile;
  if (tpFile) {
    const tpPath = path.isAbsolute(tpFile) ? tpFile : path.join(__dirname, '..', tpFile);
    if (fs.existsSync(tpPath)) {
      const tpContent = fs.readFileSync(tpPath, 'utf-8');
      const tcDateMatch = content.match(/\*\*Updated\*\*:\s*(\d{4}-\d{2}-\d{2})/);
      const tpDateMatch = tpContent.match(/\*\*Updated\*\*:\s*(\d{4}-\d{2}-\d{2})/);
      if (tcDateMatch?.[1] && tpDateMatch?.[1]) {
        const tcDate = tcDateMatch[1];
        const tpDate = tpDateMatch[1];
        if (tpDate < tcDate) {
          errors.push(`STRUCT-004: Date mismatch — test plan Updated=${tpDate} is OLDER than test cases Updated=${tcDate}. Test plan date must be >= test cases date.`);
        }
      }
    }
  }

  return { passed: errors.length === 0, errors };
}

/**
 * HARD GATE: Validate coverage depth — minimum TCs per field,
 * checkbox scenario coverage, save dialog TC coverage.
 */
function validateCoverageDepth(item: QueueItem): { passed: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const tcFile = item.artifacts?.testCaseFile;
  if (!tcFile) return { passed: true, errors, warnings };

  const tcPath = path.isAbsolute(tcFile) ? tcFile : path.join(__dirname, '..', tcFile);
  if (!fs.existsSync(tcPath)) return { passed: true, errors, warnings };

  const content = fs.readFileSync(tcPath, 'utf-8');
  const contentLower = content.toLowerCase();

  // Count fields from FIELD INVENTORY
  const fieldInvMatch = content.match(/^## FIELD INVENTORY/im);
  let fieldCount = 0;
  const fieldNames: string[] = [];
  if (fieldInvMatch) {
    const fieldInvIdx = content.indexOf(fieldInvMatch[0]);
    // Find next ## section or end of file
    const nextSectionIdx = content.indexOf('\n## ', fieldInvIdx + 1);
    const sectionContent = nextSectionIdx > 0
      ? content.slice(fieldInvIdx, nextSectionIdx)
      : content.slice(fieldInvIdx, fieldInvIdx + 5000);
    // Count table data rows (skip header + separator)
    const tableLines = sectionContent.split('\n').filter(l => l.startsWith('|') && !l.match(/^\|[-\s|]+\|$/) && !l.match(/^\|\s*Field\s*\|/i));
    fieldCount = tableLines.length;
    // Extract field names (first column)
    for (const line of tableLines) {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cols[0]) fieldNames.push(cols[0]);
    }
  }

  // Count unique TC IDs
  const tcIdPattern = /^##\s+(TC-[A-Z]+-[A-Z]+-\d+[A-Z]?)/gm;
  const tcIds: string[] = [];
  let tcMatch: RegExpExecArray | null;
  while ((tcMatch = tcIdPattern.exec(content)) !== null) {
    if (tcMatch[1]) tcIds.push(tcMatch[1]);
  }
  const tcCount = tcIds.length;

  // Enforce minimum ratio: TCs >= fields * 1.5 (save+persist + one interaction per field minimum)
  if (fieldCount > 0 && tcCount < Math.ceil(fieldCount * 1.5)) {
    errors.push(`COVERAGE-001: Only ${tcCount} TCs for ${fieldCount} fields (ratio ${(tcCount / fieldCount).toFixed(1)}x). Minimum required: ${Math.ceil(fieldCount * 1.5)} TCs (1.5x fields). Each field needs at least save+persist + one interaction TC.`);
  }

  // Checkbox 3-scenario check: each checkbox field should be referenced in ≥2 TCs by name
  const checkboxFields = fieldNames.filter((_, i) => {
    const fieldInvIdx2 = content.indexOf(fieldInvMatch![0]);
    const nextSectionIdx2 = content.indexOf('\n## ', fieldInvIdx2 + 1);
    const sectionContent2 = nextSectionIdx2 > 0
      ? content.slice(fieldInvIdx2, nextSectionIdx2)
      : content.slice(fieldInvIdx2, fieldInvIdx2 + 5000);
    const tableLines2 = sectionContent2.split('\n').filter(l => l.startsWith('|') && !l.match(/^\|[-\s|]+\|$/) && !l.match(/^\|\s*Field\s*\|/i));
    const line = tableLines2[i] || '';
    return line.toLowerCase().includes('checkbox');
  });

  for (const cbName of checkboxFields) {
    const cbNameLower = cbName.toLowerCase();
    // Count TCs that reference this checkbox by name (bold or plain)
    const tcRefs = contentLower.split(`**${cbNameLower}**`).length - 1
      + contentLower.split(cbNameLower).length - 1;
    // Rough check — name should appear in at least 2 different TC sections
    // Use a simpler heuristic: count lines with the name after ## TC- headers
    let tcSectionsWithRef = 0;
    const sections = content.split(/^## TC-/m);
    for (const section of sections) {
      if (section.toLowerCase().includes(cbNameLower)) {
        tcSectionsWithRef++;
      }
    }
    if (tcSectionsWithRef < 2) {
      warnings.push(`COVERAGE-002: Checkbox "${cbName}" only referenced in ${tcSectionsWithRef} TC section(s). PLN-004 requires ≥2 (toggle + default state minimum).`);
    }
  }

  // Save dialog TC check: if MCP log mentions save dialog, verify ≥2 TCs reference it
  if (contentLower.includes('save dialog') && contentLower.includes('| save dialog |')) {
    const saveDialogRefs = (contentLower.match(/save.*dialog|dialog.*save/g) || []).length;
    if (saveDialogRefs < 4) { // header + at least 3 TC references (appear, cancel, confirm)
      warnings.push(`COVERAGE-003: Save dialog documented in MCP log but only ${saveDialogRefs} references in file. Expected ≥3 TC references (dialog appears + cancel + confirm).`);
    }
  }

  return { passed: errors.length === 0, errors, warnings };
}

/**
 * Validate that all UI testing checklist items are completed.
 * Fields marked true must have keyword evidence in the test case file.
 * Fields marked false must have a notes field explaining why.
 */
function validateChecklist(item: QueueItem): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];
  const checklist = item.uiTestingChecklist || {};
  
  const requiredChecks: (keyof UITestingChecklist)[] = [
    'fieldDiscovery',
    'dependencyMapping', 
    'boundaryTesting',
    'errorVerification',
    'saveReloadCycles',
    'crossFieldValidation',
    'errorRecovery',
  ];

  // Load test case content for evidence checking
  let tcContent = '';
  const tcFile = item.artifacts?.testCaseFile;
  if (tcFile) {
    const tcPath = path.isAbsolute(tcFile) ? tcFile : path.join(__dirname, '..', tcFile);
    if (fs.existsSync(tcPath)) {
      tcContent = fs.readFileSync(tcPath, 'utf-8').toLowerCase();
    }
  }
  
  for (const check of requiredChecks) {
    const value = checklist[check];
    if (value === undefined || value === null) {
      missing.push(check);
    } else if (value === false) {
      // false is acceptable IF checklist has notes explaining why
      const clAny = checklist as Record<string, unknown>;
      if (!clAny['notes']) {
        warnings.push(`${check}=false without notes -- add explanation for auditability`);
      }
    } else if (value === true) {
      // true requires keyword evidence in test cases (for certifiable fields only)
      const keywords = CHECKLIST_EVIDENCE_KEYWORDS[check];
      if (keywords && tcContent) {
        const hasEvidence = keywords.some(kw => tcContent.includes(kw));
        if (!hasEvidence) {
          // BLOCKING for high-risk fields (fabrication detection)
          const blockingFields: string[] = ['boundaryTesting', 'errorVerification'];
          if (blockingFields.includes(check)) {
            missing.push(`${check}=true but NO supporting keywords found in TCs -- BLOCKED (possible fabrication). Either add TCs with evidence or set to false with notes.`);
          } else {
            warnings.push(`${check}=true but no supporting keywords found in TCs -- possible self-certification without evidence`);
          }
        }
      }
    }
  }
  
  return { valid: missing.length === 0, missing, warnings };
}

/**
 * Step 13: Validate that all TCs in the test case file have Automatable: field.
 */
function validateAutomatableField(item: QueueItem): { passed: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const tcFile = item.artifacts?.testCaseFile;
  if (!tcFile) return { passed: true, errors, warnings };

  const tcPath = path.isAbsolute(tcFile) ? tcFile : path.join(__dirname, '..', tcFile);
  if (!fs.existsSync(tcPath)) return { passed: true, errors, warnings };

  const content = fs.readFileSync(tcPath, 'utf-8');
  const lines = content.split('\n');

  const tcHeaders: { id: string; line: number }[] = [];
  const tcHeaderPattern = /^##\s+(TC-[A-Z]+-[A-Z]+-\d+[A-Z]?)/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const match = line.match(tcHeaderPattern);
    if (match?.[1]) {
      tcHeaders.push({ id: match[1], line: i + 1 });
    }
  }

  let missingCount = 0;
  for (const tc of tcHeaders) {
    const sectionEnd = Math.min(tc.line + 30, lines.length);
    let hasAutomatable = false;
    for (let j = tc.line; j < sectionEnd; j++) {
      const sectionLine = lines[j] ?? '';
      if (sectionLine.match(/^\*\*Automatable\*\*:\s*/i) || sectionLine.match(/^Automatable:\s*/i)) {
        hasAutomatable = true;
        break;
      }
      if (j > tc.line && sectionLine.match(/^##\s+TC-/)) break;
    }
    if (!hasAutomatable) {
      missingCount++;
      if (missingCount <= 3) {
        warnings.push(`${tc.id} missing Automatable: field`);
      }
    }
  }

  if (missingCount > 0) {
    warnings.push(`${missingCount} TC(s) missing Automatable: field (required: Yes, No, or Blocked:[reason])`);
  }

  return { passed: true, errors, warnings };
}

/**
 * Rebuild the XLSX workbook for the active client. Idempotent: caches the
 * `npm run xlsx:build` invocation so multiple per-item calls in the same
 * run only trigger one full rebuild.
 *
 * Returns the repo-relative workbook path on success, or null on failure.
 */
let xlsxRebuiltThisRun = false;
function rebuildXlsx(): string | null {
  const workbookPath = SHARED_PATHS.workbook;
  if (!xlsxRebuiltThisRun) {
    try {
      execSync('npm run xlsx:build', { stdio: 'inherit', cwd: frameworkRoot() });
      xlsxRebuiltThisRun = true;
    } catch (error) {
      console.error(`  [ERR] xlsx:build failed:`, error);
      return null;
    }
  }
  if (!fs.existsSync(workbookPath)) {
    console.error(`  [ERR] Workbook not produced at ${workbookPath}`);
    return null;
  }
  console.log(`  [OK] XLSX workbook fresh: ${path.relative(frameworkRoot(), workbookPath).replace(/\\/g, '/')}`);
  return path.relative(frameworkRoot(), workbookPath).replace(/\\/g, '/');
}

/**
 * Process a single queue item that needs CSV export.
 */
function processQueueItem(item: QueueItem, queue: QueueFile): boolean {
  console.log(`\n[#] Processing: ${item.id} (${item.feature})`);
  
  const forceMode = process.argv.includes('--force');

  // ── HARD GATE: selfAuditPassed -- NO --force bypass ──
  const selfAuditResult = validateSelfAuditBase(item);
  if (!selfAuditResult.passed) {
    for (const err of selfAuditResult.errors) {
      console.error(`  [ERR] ${err}`);
    }
    console.error(`     NOTE: --force does NOT bypass this check. Self-audit is mandatory.`);
    process.exit(1);
  }

  // ── HARD GATE: Structural sections (FIELD INVENTORY, Validation Rules, MCP log, date sync) ──
  const structResult = validateStructuralSections(item);
  if (!structResult.passed) {
    for (const err of structResult.errors) {
      console.error(`  [ERR] ${err}`);
    }
    console.error('     Structural sections are MANDATORY. No --force bypass.');
    console.error('     Fix the test case file and re-run planner:post-complete.');
    process.exit(1);
  }
  console.log('  [OK] Structural sections validated (FIELD INVENTORY, Validation Rules, MCP log, date sync)');

  // ── HARD GATE: Coverage depth (TC/field ratio, checkbox scenarios) ──
  const coverageResult = validateCoverageDepth(item);
  if (!coverageResult.passed) {
    for (const err of coverageResult.errors) {
      console.error(`  [ERR] ${err}`);
    }
    console.error('     Coverage depth is MANDATORY. No --force bypass.');
    console.error('     Add more test cases to meet minimum coverage requirements.');
    process.exit(1);
  }
  for (const w of coverageResult.warnings) {
    console.warn(`  [WARN]  ${w}`);
  }
  console.log('  [OK] Coverage depth validated');

  // ── PLN-039/040/041: Generator-readiness quality gates (WARN, date-gated) ──
  // These gates enforce learnings from local-office-settings pipeline failure (2026-03-24).
  // Only enforced for items planned after 2026-03-24 to avoid blocking legacy items.
  const GATE_INTRODUCTION_DATE = '2026-03-24';
  const itemPlanDate = item.history?.[0]?.timestamp || '';
  const isPostGateItem = itemPlanDate >= GATE_INTRODUCTION_DATE;

  const tcFileForGates = item.artifacts?.testCaseFile;
  const tcPathForGates = tcFileForGates
    ? (path.isAbsolute(tcFileForGates) ? tcFileForGates : path.join(__dirname, '..', tcFileForGates))
    : null;
  if (isPostGateItem && tcPathForGates && fs.existsSync(tcPathForGates)) {
    const tcContentForGates = fs.readFileSync(tcPathForGates, 'utf-8');

    // PLN-039: FIELD INVENTORY testid completeness
    const fieldInvMatch = tcContentForGates.match(/^## FIELD INVENTORY/im);
    if (fieldInvMatch) {
      const fieldIdx = tcContentForGates.indexOf(fieldInvMatch[0]);
      const nextSection = tcContentForGates.indexOf('\n## ', fieldIdx + 1);
      const fieldSection = nextSection > 0
        ? tcContentForGates.slice(fieldIdx, nextSection)
        : tcContentForGates.slice(fieldIdx, fieldIdx + 3000);
      // Count table rows — find the testid column index from header, then check only that column
      const tableRows = fieldSection.match(/^\|[^-|].*\|/gm) || [];
      const headerRow = tableRows.find(r => /testid|data-testid|selector/i.test(r));
      if (headerRow) {
        const headerCells = headerRow.split('|').map(c => c.trim()).filter(Boolean);
        const testidColIdx = headerCells.findIndex(c => /testid|data-testid|selector/i.test(c));
        const dataRows = tableRows.filter(r => r !== headerRow && !r.match(/^\|.*Field.*\|/i));
        const emptyTestidRows = testidColIdx >= 0
          ? dataRows.filter(r => {
              const cells = r.split('|').map(c => c.trim()).filter(Boolean);
              return testidColIdx < cells.length && (cells[testidColIdx] === '' || cells[testidColIdx] === '-');
            })
          : [];
        if (emptyTestidRows.length > 0) {
          console.warn(`  [WARN] PLN-039: ${emptyTestidRows.length} FIELD INVENTORY row(s) have empty testid column. Ensure all testid values are filled or marked "(no testid — use aria-label/text)".`);
        } else {
          console.log('  [OK] PLN-039: FIELD INVENTORY completeness validated');
        }
      }
    }

    // PLN-040: Async assertion markers for cross-field validation
    const hasAsyncValidation = /cross-field|cascade|async|NM-\d+/i.test(tcContentForGates);
    const hasPollMarkers = /\[POLL\]/i.test(tcContentForGates);
    if (hasAsyncValidation && !hasPollMarkers) {
      console.warn('  [WARN] PLN-040: Test cases reference cross-field/cascade/async validation but no [POLL] markers found. Tag async assertion steps with [POLL] to prevent flaky tests.');
    } else if (hasAsyncValidation && hasPollMarkers) {
      console.log('  [OK] PLN-040: Async assertion markers present');
    }

    // PLN-041: Save dialog documentation in MCP_VERIFICATION_LOG
    const mentionsSave = /\bSave\b.*\b(dialog|confirm|button)\b|\bclickSave/i.test(tcContentForGates);
    const hasSaveDialogDoc = /\|\s*Save\s*dialog\s*\|/i.test(tcContentForGates);
    if (mentionsSave && !hasSaveDialogDoc) {
      console.warn('  [WARN] PLN-041: Test cases reference Save dialog but MCP_VERIFICATION_LOG missing "| Save dialog |" row. Document exact dialog heading, buttons, and selectors.');
    } else if (mentionsSave && hasSaveDialogDoc) {
      console.log('  [OK] PLN-041: Save dialog documentation present');
    }
  }

  // ── Checklist -- blocks unless --force (some categories genuinely don't apply) ──
  const { valid, missing, warnings } = validateChecklist(item);
  if (!valid) {
    if (forceMode) {
      console.warn(`  [WARN]  uiTestingChecklist incomplete -- bypassed with --force: ${missing.join(', ')}`);
    } else {
      console.error(`  [ERR] uiTestingChecklist incomplete -- blocking stage transition: ${missing.join(', ')}`);
      console.error(`     Use --force to override.`);
      process.exit(1);
    }
  }
  // Report certification warnings (informational -- Audit should review)
  for (const w of warnings) {
    console.warn(`  [WARN]  ${w}`);
  }

  // Step 13: Validate Automatable: field presence on all TCs
  const autoResult = validateAutomatableField(item);
  for (const w of autoResult.warnings) {
    console.warn(`  [WARN]  ${w}`);
  }

  // ── HARD GATE: validate:sync -- ensures no agent sync drift ──
  const syncResult = runValidateSyncGate();
  if (syncResult.passed) {
    console.log('  [OK] validate:sync passed');
  } else {
    for (const err of syncResult.errors) {
      console.error(`  [ERR] ${err}`);
    }
    console.error(`     Run: npm run sync:mistakes && npm run build:context && npm run validate:sync`);
    process.exit(1);
  }

  // ── SOFT: Mid-work capture check (ALL-004) ──
  const midWorkWarning = checkMidWorkCapture(item, 3, 'history');
  if (midWorkWarning) {
    console.warn(`  [WARN]  ${midWorkWarning}`);
  }

  // POST-ESC: Check if escalations assigned to planner are still open (ALL-036)
  const { checkUnresolvedEscalations } = require('./validation-gates');
  const escWarnings: string[] = checkUnresolvedEscalations('planner');
  for (const w of escWarnings) console.warn(`  [WARN]  ${w}`);

  // Check for test case file
  if (!item.artifacts?.testCaseFile) {
    console.log(`  [skip]  Skipping: No testCaseFile in artifacts`);
    return false;
  }
  
  // Check if already rebuilt for this queue entry (xlsxArtifact = post-Phase-B,
  // csvExport = legacy one-phase alias, both refresh together below)
  if (item.artifacts.xlsxArtifact || item.artifacts.csvExport) {
    const already = item.artifacts.xlsxArtifact || item.artifacts.csvExport;
    console.log(`  [skip]  Already rebuilt: ${already}`);
    return false;
  }

  // Rebuild XLSX workbook
  const workbookPath = rebuildXlsx();
  if (!workbookPath) {
    return false;
  }

  // Update queue item with workbook path (xlsxArtifact + legacy csvExport alias,
  // both removed in Phase D of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION)
  item.artifacts.xlsxArtifact = workbookPath;
  item.artifacts.csvExport = workbookPath; // one-phase alias for legacy consumers

  // Add history entry — xlsx_rebuild is the new action token; csv_export
  // alias preserved one phase for downstream validators.
  if (!item.history) {
    item.history = [];
  }
  item.history.push({
    timestamp: new Date().toISOString(),
    agent: 'planner-post-complete',
    action: 'xlsx_rebuild',
    notes: `Auto-rebuilt workbook: ${workbookPath}`,
  });
  
  // Mark checklist as complete if all items passed
  if (valid && item.uiTestingChecklist) {
    item.uiTestingChecklist.completedAt = new Date().toISOString();
  }
  
  return true;
}

// ── Ad-hoc mode helpers (PLAN_DONE_MEANS_DONE Phase 2.6) ──

// Mirror of check-tc-parity.ts MD_HEADER_TC_PATTERN (1-to-3 dash-segment prefixes).
const AD_HOC_MD_TC_PATTERN = /^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+){1,3}-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):/gm;

function findFileMatching(dir: string, re: RegExp): string | null {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFileMatching(full, re);
      if (found) return found;
    } else if (re.test(entry.name)) {
      return full;
    }
  }
  return null;
}

function countMdTcHeaders(content: string): number {
  const re = new RegExp(AD_HOC_MD_TC_PATTERN.source, 'gm');
  let n = 0;
  while (re.exec(content) !== null) n++;
  return n;
}

function countXlsxRowsForModule(moduleName: string): { count: number; sheet: string } | null {
  const wbPath = SHARED_PATHS.workbook;
  if (!fs.existsSync(wbPath)) return null;
  const wb = XLSX.readFile(wbPath, { cellDates: false, cellNF: false });
  const sheet = wb.SheetNames.find(
    n => n !== 'Overview' && n.toLowerCase().includes(moduleName.toLowerCase()),
  );
  if (!sheet) return null;
  const ws = wb.Sheets[sheet];
  if (!ws) return null;
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
  let count = 0;
  for (const row of rows) {
    const id = row['TC ID'];
    if (typeof id === 'string' && /^TC-/.test(id)) count++;
  }
  return { count, sheet };
}

/**
 * Ad-hoc Q-checks for a named module, no queue entry required. Exits the process.
 * Q1 file freshness · Q2 TC-plan sync · Q3 header count · Q4 XLSX rows == MD TC count.
 */
function runAdHoc(moduleName: string): never {
  console.log(`[ad-hoc] planner-post-complete Q-checks for module="${moduleName}" (no queue entry)\n`);
  let failed = false;

  // Q1 — file freshness: a non-empty test-cases file for the module must exist.
  const tcFile = findFileMatching(SHARED_PATHS.testCases, new RegExp(`${moduleName}.*test_cases\\.md$`, 'i'));
  if (!tcFile || fs.statSync(tcFile).size === 0) {
    console.error(`  [ERR] Q1 FAIL: no non-empty *${moduleName}*test_cases.md under ${SHARED_PATHS.testCases}`);
    process.exit(1);
  }
  const tcContent = fs.readFileSync(tcFile, 'utf-8');
  console.log(`  [OK] Q1 PASS: file freshness — ${path.relative(frameworkRoot(), tcFile)} (${fs.statSync(tcFile).size} bytes)`);

  // Q2 — TC-plan sync: test-plan exists; plan Updated date >= test-cases Updated date.
  const tpFile = findFileMatching(SHARED_PATHS.testPlans, new RegExp(`${moduleName}.*test_plan\\.md$`, 'i'));
  if (!tpFile) {
    console.warn(`  [WARN] Q2: no *${moduleName}*test_plan.md found — sync check skipped`);
  } else {
    const tpContent = fs.readFileSync(tpFile, 'utf-8');
    const tcDate = tcContent.match(/\*\*Updated\*\*:\s*(\d{4}-\d{2}-\d{2})/)?.[1];
    const tpDate = tpContent.match(/\*\*Updated\*\*:\s*(\d{4}-\d{2}-\d{2})/)?.[1];
    if (tcDate && tpDate && tpDate < tcDate) {
      console.error(`  [ERR] Q2 FAIL: test-plan Updated=${tpDate} is OLDER than test-cases Updated=${tcDate}`);
      failed = true;
    } else {
      console.log(`  [OK] Q2 PASS: TC-plan sync — ${path.relative(frameworkRoot(), tpFile)}`);
    }
  }

  // Q3 — header count: at least one ## TC- header in the test-cases file.
  const mdCount = countMdTcHeaders(tcContent);
  if (mdCount === 0) {
    console.error(`  [ERR] Q3 FAIL: zero "## TC-" headers in ${path.basename(tcFile)}`);
    failed = true;
  } else {
    console.log(`  [OK] Q3 PASS: header count — ${mdCount} TC headers in ${path.basename(tcFile)}`);
  }

  // Q4 — XLSX row count == MD TC count for the module's sheet.
  const xlsx = countXlsxRowsForModule(moduleName);
  if (xlsx === null) {
    console.error(`  [ERR] Q4 FAIL: no XLSX sheet matching "${moduleName}" in ${path.relative(frameworkRoot(), SHARED_PATHS.workbook)} (run npm run xlsx:build)`);
    failed = true;
  } else if (xlsx.count !== mdCount) {
    console.error(`  [ERR] Q4 FAIL: XLSX rows (${xlsx.count}, sheet "${xlsx.sheet}") != MD TC count (${mdCount}) for "${moduleName}"`);
    failed = true;
  } else {
    console.log(`  [OK] Q4 PASS: XLSX row count == MD TC count (${xlsx.count} == ${mdCount}, sheet "${xlsx.sheet}") for "${moduleName}"`);
  }

  if (failed) {
    console.error(`\n[ad-hoc] FAIL — one or more Q-checks failed for "${moduleName}".`);
    process.exit(1);
  }
  console.log(`\n[ad-hoc] PASS — all Q-checks passed for "${moduleName}".`);
  process.exit(0);
}

/**
 * Main execution: find and process pending_generation items.
 */
function main(): void {
  // Ad-hoc mode (PLAN_DONE_MEANS_DONE Phase 2.6) — short-circuits the queue path.
  const cliArgs = process.argv.slice(2);
  if (cliArgs.includes('--ad-hoc')) {
    const moduleArg = cliArgs.find(a => a.startsWith('--module='));
    const moduleName = moduleArg ? moduleArg.split('=')[1] : '';
    if (!moduleName) {
      console.error('[ERR] --ad-hoc requires --module=<name> (e.g., --ad-hoc --module=legal)');
      process.exit(1);
    }
    runAdHoc(moduleName);
  }

  console.log('[go] Planner Post-Complete Hook\n');
  
  // Load queue
  if (!fs.existsSync(PATHS.queue)) {
    console.error('[ERR] Queue file not found:', PATHS.queue);
    process.exit(1);
  }
  
  const queue: QueueFile = JSON.parse(fs.readFileSync(PATHS.queue, 'utf-8'));
  
  // Parse CLI args
  const args = process.argv.slice(2);
  const specificId = args.find(a => !a.startsWith('--'));
  const processAll = args.includes('--all');
  
  // Find items to process
  let itemsToProcess: QueueItem[];
  
  if (specificId) {
    const item = queue.queue.find(q => q.id === specificId);
    if (!item) {
      console.error(`[ERR] Queue item not found: ${specificId}`);
      process.exit(1);
    }
    itemsToProcess = [item];
  } else if (processAll) {
    // Process all pending_generation items without an xlsxArtifact (legacy
    // csvExport alias accepted for items planned before Phase B)
    itemsToProcess = queue.queue.filter(
      q => q.stage === 'pending_generation' && !q.artifacts?.xlsxArtifact && !q.artifacts?.csvExport
    );
  } else {
    // Default: process items that just changed to pending_generation (stage check)
    itemsToProcess = queue.queue.filter(
      q => q.stage === 'pending_generation' &&
           q.artifacts?.testCaseFile &&
           !q.artifacts?.xlsxArtifact && !q.artifacts?.csvExport
    );
  }

  if (itemsToProcess.length === 0) {
    console.log('[info]  No items pending XLSX rebuild');
    return;
  }
  
  console.log(`Found ${itemsToProcess.length} item(s) to process`);
  
  // Process each item
  let exported = 0;
  for (const item of itemsToProcess) {
    if (processQueueItem(item, queue)) {
      exported++;
    }
  }
  
  // Save updated queue
  if (exported > 0) {
    queue.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PATHS.queue, JSON.stringify(queue, null, 2) + '\n');
    console.log(`\n[OK] Queue updated. ${exported} export(s) completed.`);

    // Update performance metrics after successful export
    try {
      const { execSync } = require('child_process');
      execSync('npx ts-node scripts/agent-metrics.ts --update-trust', {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        timeout: 30_000,
      });
      console.log('[OK] Agent metrics updated.');
    } catch {
      console.warn('[WARN] Could not update agent metrics (non-blocking).');
    }
  } else {
    console.log(`\n[skip]  No exports needed.`);
  }
}

// Execute
main();
