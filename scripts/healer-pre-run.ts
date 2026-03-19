#!/usr/bin/env ts-node
/**
 * Healer Pre-Run Gate -- validates prerequisites for Healer Agent.
 *
 * Checks:
 * 1. Queue file exists and parses (PF-01)
 * 2. Queue item is in pending_healing or healing stage
 * 3. failure-summary.json exists (PF-H1)
 * 4. agent-mistakes.md exists (PF-02)
 * 5. Spec file(s) exist in artifacts
 *
 * Usage: npm run healer:pre-run <queue-item-id>
 * Exit: 0 = run allowed, 1 = blocked
 */

import * as fs from 'fs';
import * as path from 'path';
import { QueueFile, SHARED_PATHS } from './shared-types';

function main(): void {
  const itemId = process.argv[2];
  if (!itemId) {
    console.error('Usage: npm run healer:pre-run <queue-item-id>');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Healer Pre-Run Gate');
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

        // Verify correct stage
        if (!['pending_healing', 'healing'].includes(item.stage)) {
          console.error(`[HALT] Item stage is ${item.stage}, expected pending_healing or healing`);
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

  // PF-H1: failure-summary.json
  const failureSummaryPath = path.join(__dirname, '../reports/failure-summary.json');
  if (!fs.existsSync(failureSummaryPath)) {
    console.warn('[WARN] PF-H1: failure-summary.json not found -- healer may lack diagnostics');
  } else {
    try {
      const summary = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
      const failCount = summary.failed ?? 0;
      console.log(`[OK] PF-H1: failure-summary.json exists (${failCount} failures recorded)`);

      // PF-DIAG: Check if diagnostics are actually populated (48A fix)
      const failures: Array<{
        networkFailures?: unknown[];
        consoleErrors?: unknown[];
        pageUrl?: string;
        domSnippet?: string;
      }> = summary.failures ?? [];
      if (failures.length > 0) {
        const emptyDiagnostics = failures.filter(f =>
          (!f.networkFailures || f.networkFailures.length === 0) &&
          (!f.consoleErrors || f.consoleErrors.length === 0) &&
          (!f.pageUrl || f.pageUrl === '') &&
          (!f.domSnippet || f.domSnippet === '')
        );
        if (emptyDiagnostics.length === failures.length) {
          console.warn('[WARN] PF-DIAG: ALL failures have empty diagnostics -- data pipeline may be broken');
          console.warn('  Agents are operating BLIND without diagnostic data. Check diagnosticsHandler fixture in fixtures.ts.');
        }
      }
    } catch {
      console.warn('[WARN] PF-H1: failure-summary.json exists but is invalid JSON');
    }
  }

  // Check spec files exist
  if (item?.artifacts?.specFiles && item.artifacts.specFiles.length > 0) {
    const missingSpecs = item.artifacts.specFiles.filter(
      (f: string) => !fs.existsSync(path.join(__dirname, '..', f))
    );
    if (missingSpecs.length > 0) {
      console.error(`[HALT] Spec files missing: ${missingSpecs.join(', ')}`);
      failed = true;
    } else {
      console.log(`[OK] All ${item.artifacts.specFiles.length} spec file(s) exist`);
    }
  } else {
    console.warn('[WARN] No spec files listed in queue item artifacts');
  }

  // PF-ESC: Check pending escalations assigned to healer (ALL-036)
  const { checkPendingEscalations } = require('./validation-gates');
  const escMessages: string[] = checkPendingEscalations('healer');
  for (const msg of escMessages) console.warn(msg);

  // Result
  console.log('\n' + '='.repeat(60));
  if (failed) {
    console.error('[BLOCKED] Healer pre-run gate FAILED');
    process.exit(1);
  }
  console.log('[PASS] Healer pre-run gate passed');
}

main();
