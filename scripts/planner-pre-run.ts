#!/usr/bin/env ts-node
/**
 * Planner Pre-Run Gate -- validates prerequisites for Planner Agent.
 *
 * Checks:
 * 1. Queue file exists and item is at planning stage (PF-01)
 * 2. agent-mistakes.md exists (PF-02)
 * 3. REQUIREMENTS.md section exists for this item's module (PF-P1)
 * 4. TypeScript compiles (PF-P2)
 *
 * Usage: npx ts-node scripts/planner-pre-run.ts <queue-item-id>
 * Exit: 0 = run allowed, 1 = blocked
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { QueueFile, QueueItem, SHARED_PATHS } from './shared-types';

function main(): void {
  const itemId = process.argv[2];
  if (!itemId) {
    console.error('Usage: npx ts-node scripts/planner-pre-run.ts <queue-item-id>');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Planner Pre-Run Gate');
  console.log('='.repeat(60));

  let failed = false;
  let item: QueueItem | undefined;

  // PF-01: Queue file + item stage check
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[HALT] PF-01: Queue file not found at', SHARED_PATHS.queue);
    failed = true;
  } else {
    try {
      const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
      item = queue.queue.find(q => q.id === itemId);
      if (!item) {
        console.error(`[HALT] Queue item not found: ${itemId}`);
        failed = true;
      } else {
        const validStages = ['pending_planning', 'planning'];
        if (!validStages.includes(item.stage)) {
          console.error(`[HALT] Item stage is '${item.stage}', expected one of: ${validStages.join(', ')}`);
          failed = true;
        } else {
          console.log(`[OK] PF-01: Queue item found: ${item.id} (stage: ${item.stage})`);
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

  // PF-P1: REQUIREMENTS.md section exists for this module
  const reqPath = path.join(__dirname, '../docs/REQUIREMENTS.md');
  if (!fs.existsSync(reqPath)) {
    console.error('[HALT] PF-P1: REQUIREMENTS.md not found');
    failed = true;
  } else if (item) {
    const reqContent = fs.readFileSync(reqPath, 'utf-8');
    const moduleName = item.module?.toLowerCase() ?? '';
    if (moduleName && !reqContent.toLowerCase().includes(moduleName)) {
      console.error(`[HALT] PF-P1: No section found for module '${item.module}' in REQUIREMENTS.md`);
      failed = true;
    } else {
      console.log(`[OK] PF-P1: REQUIREMENTS.md contains module reference for '${item.module ?? 'unknown'}'`);
    }
  }

  // PF-P2: TypeScript compiles
  try {
    execSync('npx tsc --noEmit', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 60_000,
    });
    console.log('[OK] PF-P2: TypeScript compiles clean');
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    const output = ((err.stderr ?? '') + '\n' + (err.stdout ?? '')).trim();
    const lines = output.split('\n').slice(0, 5);
    console.error('[HALT] PF-P2: TypeScript compilation failed:');
    lines.forEach(l => console.error(`  ${l}`));
    failed = true;
  }

  // PF-ESC: Check pending escalations assigned to planner (ALL-036)
  const { checkPendingEscalations } = require('./validation-gates');
  const escMessages: string[] = checkPendingEscalations('planner');
  for (const msg of escMessages) console.warn(msg);

  // Result
  console.log('\n' + '='.repeat(60));
  if (failed) {
    console.error('[BLOCKED] Planner pre-run gate FAILED');
    process.exit(1);
  }
  console.log('[PASS] Planner pre-run gate passed');
}

main();
