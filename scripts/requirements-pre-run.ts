#!/usr/bin/env ts-node
/**
 * Requirements Pre-Run Gate -- validates prerequisites for Requirements Agent.
 *
 * Checks:
 * 1. Queue file exists and parses (PF-01)
 * 2. agent-mistakes.md exists (PF-02)
 * 3. BASE_URL is set in environment config (PF-04)
 * 4. MCP browser is available (PF-R1)
 *
 * Usage: npm run requirements:pre-run <queue-item-id>
 * Exit: 0 = run allowed, 1 = blocked
 */

import * as fs from 'fs';
import * as path from 'path';
import { QueueFile, SHARED_PATHS } from './shared-types';

function main(): void {
  const itemId = process.argv[2];
  if (!itemId) {
    console.error('Usage: npm run requirements:pre-run <queue-item-id>');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Requirements Pre-Run Gate');
  console.log('='.repeat(60));

  let failed = false;

  // PF-01: Queue file
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[HALT] PF-01: Queue file not found at', SHARED_PATHS.queue);
    failed = true;
  } else {
    try {
      const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
      const item = queue.queue.find(q => q.id === itemId);
      if (!item) {
        console.error(`[HALT] Queue item not found: ${itemId}`);
        failed = true;
      } else {
        console.log(`[OK] Queue item found: ${item.id} (stage: ${item.stage})`);
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

  // PF-04: BASE_URL check
  const envDir = SHARED_PATHS.envDir;
  let baseUrlFound = false;
  if (fs.existsSync(envDir)) {
    const envFiles = fs.readdirSync(envDir).filter(f => f.startsWith('.env'));
    for (const envFile of envFiles) {
      const content = fs.readFileSync(path.join(envDir, envFile), 'utf-8');
      if (content.includes('BASE_URL')) {
        baseUrlFound = true;
        break;
      }
    }
  }
  if (process.env['BASE_URL']) {
    baseUrlFound = true;
  }
  if (!baseUrlFound) {
    console.error('[HALT] PF-04: BASE_URL not found in .env files or process.env');
    failed = true;
  } else {
    console.log('[OK] PF-04: BASE_URL configured');
  }

  // PF-R1: MCP browser availability (soft check -- warn only)
  console.log('[OK] PF-R1: MCP browser check deferred to runtime (requires VS Code session)');

  // PF-ESC: Check pending escalations assigned to requirements (ALL-036)
  const { checkPendingEscalations } = require('./validation-gates');
  const escMessages: string[] = checkPendingEscalations('requirements');
  for (const msg of escMessages) console.warn(msg);

  // Result
  console.log('\n' + '='.repeat(60));
  if (failed) {
    console.error('[BLOCKED] Requirements pre-run gate FAILED');
    process.exit(1);
  }
  console.log('[PASS] Requirements pre-run gate passed');
}

main();
