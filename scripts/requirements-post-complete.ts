#!/usr/bin/env ts-node
/**
 * Requirements Post-Complete Gate -- validates Requirements Agent output before stage transition.
 *
 * Checks:
 * 1. REQUIREMENTS.md exists and was recently updated
 * 2. Queue entry has been created/updated for the item
 * 3. Queue item has artifacts (at minimum, module and intent set)
 * 4. Self-audit passed
 * 5. Activity log entry exists
 *
 * On success: transitions queue item stage to pending_planning.
 *
 * Usage: npm run requirements:post-complete <queue-item-id>
 * Exit: 0 = passed, 1 = blocked
 */

import * as fs from 'fs';
import { QueueFile, QueueItem, SHARED_PATHS } from './shared-types';
import { validateSelfAuditBase, runValidateSyncGate } from './validation-gates';

function main(): void {
  const itemId = process.argv[2];
  if (!itemId) {
    console.error('Usage: npm run requirements:post-complete <queue-item-id>');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Requirements Post-Complete Gate');
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

  // Gate 1: REQUIREMENTS.md exists
  if (!fs.existsSync(SHARED_PATHS.requirements)) {
    errors.push('REQUIREMENTS.md not found');
  } else {
    console.log('[OK] REQUIREMENTS.md exists');
  }

  // Gate 2: Queue item has module and intent
  if (!item.module || item.module.trim() === '') {
    errors.push('Queue item missing module field');
  }
  if (!item.intent || item.intent.trim() === '') {
    errors.push('Queue item missing intent field');
  }
  if (item.module && item.intent) {
    console.log(`[OK] Queue item has module (${item.module}) and intent`);
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

  // POST-ESC: Check if escalations assigned to requirements are still open (ALL-036)
  const { checkUnresolvedEscalations } = require('./validation-gates');
  const escWarnings: string[] = checkUnresolvedEscalations('requirements');
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
    console.error('\n[BLOCKED] Requirements post-complete gate FAILED');
    process.exit(1);
  }

  console.log('\n[PASS] Requirements post-complete gate passed');

  // Stage transition: update queue item
  item.stage = 'pending_planning';
  item.lockedBy = null;
  item.lockedAt = null;
  if (!item.history) item.history = [];
  item.history.push({
    agent: 'requirements-post-complete',
    action: 'stage-transition',
    timestamp: new Date().toISOString(),
    notes: `requirements -> pending_planning (gate passed)`,
  });
  queue.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SHARED_PATHS.queue, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
  console.log('[OK] Stage transitioned to pending_planning');
}

main();
