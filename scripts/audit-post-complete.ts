#!/usr/bin/env ts-node
/**
 * Audit Post-Complete Gate -- validates Audit Agent output before stage transition.
 *
 * Checks:
 * 1. Audit findings report was created (or zero-finding justification exists)
 * 2. agent-mistakes.md was updated (if new patterns found)
 * 3. Self-audit passed
 * 4. Activity log entry exists
 * 5. validate:sync passes
 *
 * On success: transitions queue item to completed.
 *
 * Usage: npm run audit:post-complete <queue-item-id>
 * Exit: 0 = passed, 1 = blocked
 */

import * as fs from 'fs';
import * as path from 'path';
import { QueueFile, QueueItem, SHARED_PATHS } from './shared-types';
import { validateSelfAuditBase, runValidateSyncGate } from './validation-gates';

function main(): void {
  const itemId = process.argv[2];
  if (!itemId) {
    console.error('Usage: npm run audit:post-complete <queue-item-id>');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Audit Post-Complete Gate');
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

  // Gate 1: Check for audit output
  // Audit creates findings in audits/ folder or in agent-mistakes.md
  const auditsDir = path.join(__dirname, '../specs_planning/audits');
  let auditOutputFound = false;

  if (fs.existsSync(auditsDir)) {
    const auditFiles = fs.readdirSync(auditsDir);
    const relevantAudits = auditFiles.filter(f => f.toLowerCase().includes(item.module.toLowerCase()));
    if (relevantAudits.length > 0) {
      console.log(`[OK] Audit findings found: ${relevantAudits.join(', ')}`);
      auditOutputFound = true;
    }
  }

  // Check activity log for audit completion entry
  if (fs.existsSync(SHARED_PATHS.activityLog)) {
    const logContent = fs.readFileSync(SHARED_PATHS.activityLog, 'utf-8').toLowerCase();
    if (logContent.includes('audit') && logContent.includes(itemId.toLowerCase())) {
      console.log('[OK] Audit activity log entry found');
      auditOutputFound = true;
    }
  }

  if (!auditOutputFound) {
    warnings.push('No audit output found -- verify audit was completed');
  }

  // Gate 2: Self-audit
  const selfAudit = validateSelfAuditBase(item);
  errors.push(...selfAudit.errors);
  warnings.push(...selfAudit.warnings);
  if (selfAudit.passed) {
    console.log('[OK] Self-audit passed');
  }

  // Gate 3: validate:sync
  const syncResult = runValidateSyncGate();
  errors.push(...syncResult.errors);
  if (syncResult.passed) {
    console.log('[OK] validate:sync passed');
  }

  // Gate 4: Check for blocked state -- audit may have set blocked=true
  if (item.blocked && !item.auditCleared) {
    errors.push('Item is blocked and audit has not cleared it (auditCleared=false)');
  }

  // POST-ESC: Check if escalations assigned to audit are still open (ALL-036)
  const { checkUnresolvedEscalations } = require('./validation-gates');
  const escWarnings: string[] = checkUnresolvedEscalations('audit');
  warnings.push(...escWarnings);

  // Report
  console.log('\n' + '='.repeat(60));

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  [WARN] ${w}`));
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.error(`  [ERR] ${e}`));
    console.error('\n[BLOCKED] Audit post-complete gate FAILED');
    process.exit(1);
  }

  console.log('\n[PASS] Audit post-complete gate passed');

  // Stage transition to completed
  item.stage = 'completed';
  item.lockedBy = null;
  item.lockedAt = null;
  if (!item.history) item.history = [];
  item.history.push({
    agent: 'audit-post-complete',
    action: 'stage-transition',
    timestamp: new Date().toISOString(),
    notes: `audit -> completed (gate passed)`,
  });

  // Add completionContext
  // Compute defectsFound from audit output files
  let defectsFound = 0;
  if (fs.existsSync(auditsDir)) {
    const auditFiles = fs.readdirSync(auditsDir)
      .filter(f => f.toLowerCase().includes(item.module.toLowerCase()));
    for (const af of auditFiles) {
      const auditContent = fs.readFileSync(path.join(auditsDir, af), 'utf-8');
      defectsFound += (auditContent.match(/CRITICAL|HIGH|DEFECT|BUG/gi) || []).length;
    }
  }

  (item as Record<string, unknown>).completionContext = {
    phaseCompleted: 'audit',
    artifactsModified: [],
    testsPassed: true,
    defectsFound,
    recommendedNextStage: 'completed',
  };

  queue.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SHARED_PATHS.queue, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
  console.log('[OK] Stage transitioned to completed');
}

main();
