#!/usr/bin/env ts-node
/**
 * Audit Pre-Run Gate -- validates prerequisites for Audit Agent.
 *
 * Checks:
 * 1. Queue file exists and parses (PF-01)
 * 2. Queue item has completed a prior stage (target agent output exists)
 * 3. agent-mistakes.md exists (PF-02)
 * 4. Activity log exists (PF-03)
 * 5. Target artifacts exist (spec files, test cases, etc.)
 *
 * Usage: npm run audit:pre-run <queue-item-id>
 * Exit: 0 = run allowed, 1 = blocked
 */

import * as fs from 'fs';
import * as path from 'path';
import { QueueFile, SHARED_PATHS } from './shared-types';

function main(): void {
  const itemId = process.argv[2];
  if (!itemId) {
    console.error('Usage: npm run audit:pre-run <queue-item-id>');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Audit Pre-Run Gate');
  console.log('='.repeat(60));

  let failed = false;

  // PF-01: Queue file
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[HALT] PF-01: Queue file not found');
    failed = true;
  }

  let item;
  if (!failed) {
    try {
      const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
      item = queue.queue.find(q => q.id === itemId);
      if (!item) {
        console.error(`[HALT] Queue item not found: ${itemId}`);
        failed = true;
      } else {
        console.log(`[OK] Queue item found: ${item.id} (stage: ${item.stage})`);

        // Verify item has progressed past requirements
        const earlyStages = ['pending_requirements', 'requirements', 'pending_planning'];
        if (earlyStages.includes(item.stage)) {
          console.error(`[HALT] Item is in ${item.stage} -- no agent output to audit yet`);
          failed = true;
        }
      }
    } catch {
      console.error('[HALT] Queue file is invalid JSON');
      failed = true;
    }
  }

  // PF-02: agent-mistakes.md
  if (!fs.existsSync(SHARED_PATHS.mistakes)) {
    console.error('[HALT] PF-02: agent-mistakes.md not found');
    failed = true;
  } else {
    console.log('[OK] PF-02: agent-mistakes.md exists');
  }

  // PF-03: Activity log
  if (!fs.existsSync(SHARED_PATHS.activityLog)) {
    console.warn('[WARN] PF-03: Activity log not found');
  } else {
    console.log('[OK] PF-03: Activity log exists');
  }

  // Check target agent output exists
  if (item) {
    let hasOutput = false;

    // Check for test case file
    if (item.artifacts?.testCaseFile) {
      const tcPath = path.join(__dirname, '..', item.artifacts.testCaseFile);
      if (fs.existsSync(tcPath)) {
        console.log(`[OK] Test case file exists: ${item.artifacts.testCaseFile}`);
        hasOutput = true;
      }
    }

    // Check for spec files
    if (item.artifacts?.specFiles && item.artifacts.specFiles.length > 0) {
      for (const spec of item.artifacts.specFiles) {
        const specPath = path.join(__dirname, '..', spec);
        if (fs.existsSync(specPath)) {
          console.log(`[OK] Spec file exists: ${spec}`);
          hasOutput = true;
        }
      }
    }

    // Check for test plan
    if (item.artifacts?.testPlanFile) {
      const planPath = path.join(__dirname, '..', item.artifacts.testPlanFile);
      if (fs.existsSync(planPath)) {
        console.log(`[OK] Test plan exists: ${item.artifacts.testPlanFile}`);
        hasOutput = true;
      }
    }

    if (!hasOutput) {
      console.warn('[WARN] No target agent output artifacts found -- audit may be limited');
    }
  }

  // Performance data
  if (fs.existsSync(SHARED_PATHS.performance)) {
    console.log('[OK] Performance data available for trust-level checks');
  }

  // PF-ESC: Check pending escalations assigned to audit (ALL-036)
  const { checkPendingEscalations } = require('./validation-gates');
  const escMessages: string[] = checkPendingEscalations('audit');
  for (const msg of escMessages) console.warn(msg);

  // Result
  console.log('\n' + '='.repeat(60));
  if (failed) {
    console.error('[BLOCKED] Audit pre-run gate FAILED');
    process.exit(1);
  }
  console.log('[PASS] Audit pre-run gate passed');
}

main();
