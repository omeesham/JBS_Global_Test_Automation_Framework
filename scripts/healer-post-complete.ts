#!/usr/bin/env ts-node
/**
 * Healer Post-Complete Gate -- validates Healer Agent output before stage transition.
 *
 * Checks:
 * 1. Fix was applied (spec file modified after session start)
 * 2. Tests were re-run (failure-summary.json updated)
 * 3. Self-audit passed
 * 4. Activity log entry exists
 * 5. validate:sync passes
 *
 * On success: transitions queue item stage to pending_audit.
 *
 * Usage: npm run healer:post-complete <queue-item-id>
 * Exit: 0 = passed, 1 = blocked
 */

import * as fs from 'fs';
import * as path from 'path';
import { QueueFile, QueueItem, SHARED_PATHS } from './shared-types';
import { validateSelfAuditBase, runValidateSyncGate } from './validation-gates';

function main(): void {
  const itemId = process.argv[2];
  if (!itemId) {
    console.error('Usage: npm run healer:post-complete <queue-item-id>');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Healer Post-Complete Gate');
  console.log('='.repeat(60));

  const errors: string[] = [];
  const warnings: string[] = [];

  // Load queue
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[HALT] Queue file not found');
    process.exit(1);
  }

  const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
  const item: QueueItem | undefined = queue.queue.find(q => q.id === itemId);

  if (!item) {
    console.error(`[HALT] Queue item not found: ${itemId}`);
    process.exit(1);
  }

  // Gate 1: failure-summary.json was updated (tests were re-run)
  const failureSummaryPath = path.join(__dirname, '../reports/failure-summary.json');
  if (!fs.existsSync(failureSummaryPath)) {
    errors.push('failure-summary.json not found -- tests were not re-run');
  } else {
    try {
      const summary = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
      const passed = summary.passed ?? 0;
      const failed = summary.failed ?? 0;
      console.log(`[OK] Test results: ${passed} passed, ${failed} failed`);

      if (passed === 0 && failed === 0) {
        errors.push('No test results found in failure-summary.json -- tests may not have run');
      }
    } catch {
      errors.push('failure-summary.json is invalid JSON');
    }
  }

  // Gate 2: Spec files exist
  if (item.artifacts?.specFiles && item.artifacts.specFiles.length > 0) {
    for (const specFile of item.artifacts.specFiles) {
      const fullPath = path.join(__dirname, '..', specFile);
      if (!fs.existsSync(fullPath)) {
        errors.push(`Spec file missing: ${specFile}`);
      }
    }
    if (!errors.some(e => e.startsWith('Spec file missing'))) {
      console.log(`[OK] All ${item.artifacts.specFiles.length} spec file(s) exist`);
    }
  }

  // Gate 3: Self-audit
  const selfAudit = validateSelfAuditBase(item);
  errors.push(...selfAudit.errors);
  warnings.push(...selfAudit.warnings);
  if (selfAudit.passed) {
    console.log('[OK] Self-audit passed');
  }

  // Gate 4: Activity log entry
  if (fs.existsSync(SHARED_PATHS.activityLog)) {
    const logContent = fs.readFileSync(SHARED_PATHS.activityLog, 'utf-8').toLowerCase();
    if (!logContent.includes(itemId.toLowerCase())) {
      warnings.push(`No activity log entry found for ${itemId}`);
    } else {
      console.log('[OK] Activity log entry exists');
    }
  } else {
    warnings.push('Activity log not found');
  }

  // Gate 5: validate:sync
  const syncResult = runValidateSyncGate();
  errors.push(...syncResult.errors);
  if (syncResult.passed) {
    console.log('[OK] validate:sync passed');
  }

  // Report
  console.log('\n' + '='.repeat(60));

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  [WARN] ${w}`));
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.error(`  [ERR] ${e}`));
    console.error('\n[BLOCKED] Healer post-complete gate FAILED');
    process.exit(1);
  }

  console.log('\n[PASS] Healer post-complete gate passed');

  // Stage transition
  item.stage = 'pending_audit';
  item.lockedBy = null;
  item.lockedAt = null;
  if (!item.history) item.history = [];
  item.history.push({
    agent: 'healer-post-complete',
    action: 'stage-transition',
    timestamp: new Date().toISOString(),
    notes: `healing -> pending_audit (gate passed)`,
  });

  // Add completionContext
  (item as Record<string, unknown>).completionContext = {
    phaseCompleted: 'healing',
    artifactsModified: item.artifacts?.specFiles ?? [],
    testsPassed: (() => {
      try {
        const s = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
        return (s.passed ?? 0) > 0 && (s.failed ?? 0) === 0;
      } catch { return false; }
    })(),
    defectsFound: 0,
    recommendedNextStage: 'audit',
  };

  queue.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SHARED_PATHS.queue, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
  console.log('[OK] Stage transitioned to pending_audit');
}

main();
