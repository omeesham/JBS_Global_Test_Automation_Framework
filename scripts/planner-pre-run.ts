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

  // ── PF-P3: SELECTOR_CATALOG.md reference check ──
  const catalogPath = path.join(__dirname, '../src/selectors/SELECTOR_CATALOG.md');
  if (!fs.existsSync(catalogPath)) {
    console.warn('[WARN] PF-P3: SELECTOR_CATALOG.md not found at src/selectors/SELECTOR_CATALOG.md');
    console.warn('   Planner needs the catalog to reference existing selectors and avoid duplicates.');
  } else {
    console.log('[OK] PF-P3: SELECTOR_CATALOG.md exists');
  }

  // ── PF-P4: agent-performance.json planner entry ──
  const perfPath = path.join(__dirname, '../specs_planning/_internal/agent-performance.json');
  if (fs.existsSync(perfPath)) {
    try {
      const perfData = JSON.parse(fs.readFileSync(perfPath, 'utf-8'));
      if (!perfData.agents?.planner) {
        console.warn('[WARN] PF-P4: No planner entry in agent-performance.json. Context self-load may be incomplete.');
      } else {
        console.log('[OK] PF-P4: Planner performance data available');
      }
    } catch {
      console.warn('[WARN] PF-P4: Could not parse agent-performance.json');
    }
  }

  // PF-ESC: Check pending escalations assigned to planner (ALL-036)
  const { checkPendingEscalations } = require('./validation-gates');
  const escMessages: string[] = checkPendingEscalations('planner');
  for (const msg of escMessages) console.warn(msg);

  // ── Bug Hunt: Notification Check (PLN-036) ──
  const notifDir = path.join(__dirname, '../specs_planning/_internal/agent-notifications');
  if (fs.existsSync(notifDir)) {
    const notifFiles = fs.readdirSync(notifDir).filter(f => f.endsWith('.json'));
    const pendingForPlanner: any[] = [];
    for (const file of notifFiles) {
      try {
        const notif = JSON.parse(fs.readFileSync(path.join(notifDir, file), 'utf-8'));
        if (notif.toAgent === 'planner' && !notif.acknowledged) {
          pendingForPlanner.push(notif);
        }
      } catch { /* skip malformed notification files */ }
    }
    if (pendingForPlanner.length > 0) {
      console.log(`[planner-pre-run] \u26a0 ${pendingForPlanner.length} stale_artifact notifications pending. Planner should prioritize updating affected TCs.`);
      if (item) {
        if (!item.injectedContext) item.injectedContext = {} as any;
        (item.injectedContext as any).pendingNotifications = pendingForPlanner.map(n => ({
          id: n.id,
          from: n.fromAgent,
          type: n.type,
          affectedFiles: n.affectedFiles,
          changeSummary: n.changeSummary,
        }));
        // Acknowledge processed notifications (delete files to prevent re-processing)
        for (const notif of pendingForPlanner) {
          try {
            const notifPath = path.join(notifDir, `${notif.id}.json`);
            if (fs.existsSync(notifPath)) fs.unlinkSync(notifPath);
          } catch (err) {
            console.warn(`[planner-pre-run] Failed to ack notification ${notif.id}: ${err}`);
          }
        }
        // Re-save queue with injected notifications
        const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
        queue.lastUpdated = new Date().toISOString();
        fs.writeFileSync(SHARED_PATHS.queue, JSON.stringify(queue, null, 2) + '\n');
      }
    }
  }

  // Result
  console.log('\n' + '='.repeat(60));
  if (failed) {
    console.error('[BLOCKED] Planner pre-run gate FAILED');
    process.exit(1);
  }
  console.log('[PASS] Planner pre-run gate passed');
}

main();
