#!/usr/bin/env ts-node
/**
 * Planner Post-Complete Hook - Auto-exports test cases to CSV.
 * 
 * Triggered when Planner marks stage as pending_generation.
 * Reads testCaseFile from queue item artifacts and exports to CSV.
 * 
 * Features:
 * - Auto-detects newly completed planning tasks
 * - Exports to human-readable CSV format
 * - Updates queue item with csvExport artifact path
 * - Validates uiTestingChecklist is complete before export
 * 
 * Usage: npm run planner:post-complete [--queue-item-id]
 *        npm run planner:post-complete --all (process all pending)
 * Exit: 0 = success, 1 = error
 */

import * as fs from 'fs';
import * as path from 'path';
import { CsvConverter } from '../export_test_cases/to-csv';
import { UITestingChecklist, QueueItem, QueueFile, SHARED_PATHS } from './shared-types';
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
          warnings.push(`${check}=true but no supporting keywords found in TCs -- possible self-certification without evidence`);
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
 * Export test case file to CSV format.
 */
function exportToCsv(testCaseFile: string, queueItemId: string): string | null {
  // Resolve relative path from specs_planning
  const absolutePath = path.isAbsolute(testCaseFile) 
    ? testCaseFile 
    : path.join(__dirname, '../', testCaseFile);
  
  if (!fs.existsSync(absolutePath)) {
    console.error(`  [ERR] Test case file not found: ${absolutePath}`);
    return null;
  }
  
  // Generate output filename: {module}_{submodule}_test_cases.csv
  const inputBasename = path.basename(absolutePath, '.md');
  const outputFilename = `${inputBasename}.csv`;
  const outputPath = path.join(PATHS.exports, outputFilename);
  
  try {
    // Use human format for QA-readable export
    CsvConverter.convertToFile(absolutePath, outputPath, 'human');
    console.log(`  [OK] Exported: ${outputFilename}`);
    return `export_test_cases/exports/${outputFilename}`;
  } catch (error) {
    console.error(`  [ERR] Export failed:`, error);
    return null;
  }
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

  // ── SOFT: Mid-work capture check (R27) ──
  const midWorkWarning = checkMidWorkCapture(item, 3, 'history');
  if (midWorkWarning) {
    console.warn(`  [WARN]  ${midWorkWarning}`);
  }
  
  // Check for test case file
  if (!item.artifacts?.testCaseFile) {
    console.log(`  [skip]  Skipping: No testCaseFile in artifacts`);
    return false;
  }
  
  // Check if already exported
  if (item.artifacts.csvExport) {
    console.log(`  [skip]  Already exported: ${item.artifacts.csvExport}`);
    return false;
  }
  
  // Export to CSV
  const csvPath = exportToCsv(item.artifacts.testCaseFile, item.id);
  if (!csvPath) {
    return false;
  }
  
  // Update queue item with export path
  item.artifacts.csvExport = csvPath;
  
  // Add history entry
  if (!item.history) {
    item.history = [];
  }
  item.history.push({
    timestamp: new Date().toISOString(),
    agent: 'planner-post-complete',
    action: 'csv_export',
    notes: `Auto-exported to ${csvPath}`,
  });
  
  // Mark checklist as complete if all items passed
  if (valid && item.uiTestingChecklist) {
    item.uiTestingChecklist.completedAt = new Date().toISOString();
  }
  
  return true;
}

/**
 * Main execution: find and process pending_generation items.
 */
function main(): void {
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
    // Process all pending_generation items without csvExport
    itemsToProcess = queue.queue.filter(
      q => q.stage === 'pending_generation' && !q.artifacts?.csvExport
    );
  } else {
    // Default: process items that just changed to pending_generation (stage check)
    itemsToProcess = queue.queue.filter(
      q => q.stage === 'pending_generation' && 
           q.artifacts?.testCaseFile && 
           !q.artifacts?.csvExport
    );
  }
  
  if (itemsToProcess.length === 0) {
    console.log('[info]  No items pending CSV export');
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
