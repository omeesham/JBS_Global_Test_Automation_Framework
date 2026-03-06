#!/usr/bin/env ts-node
/**
 * Audit Block Utility -- sets or clears blocked status on queue items.
 *
 * Usage:
 *   npm run audit:block <item-id> <reason text>
 *   npm run audit:clear <item-id>
 *   npm run audit:status <item-id>
 *
 * Note: reason is positional (all remaining args after item-id), not a flag.
 * This avoids npm eating --prefixed args before they reach the script.
 */

import * as fs from 'fs';
import { QueueFile, SHARED_PATHS } from './shared-types';

function main(): void {
  const [action, itemId, ...rest] = process.argv.slice(2);

  if (!action || !itemId) {
    console.error('Usage: audit:block <item-id> <reason text>');
    console.error('       audit:clear <item-id>');
    console.error('       audit:status <item-id>');
    process.exit(1);
  }

  const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
  const item = queue.queue.find(q => q.id === itemId);

  if (!item) {
    console.error(`[ERR] Queue item not found: ${itemId}`);
    process.exit(1);
  }

  switch (action) {
    case 'block': {
      const reason = rest.length > 0 ? rest.join(' ') : 'Blocked by audit';
      item.blocked = true;
      item.blockedBy = 'audit';
      item.blockedReason = reason;
      item.auditCleared = false;
      item.history = item.history || [];
      item.history.push({
        agent: 'audit',
        action: 'blocked',
        timestamp: new Date().toISOString(),
        notes: `BLOCKED: ${reason}`,
      });
      console.log(`[BLOCKED] ${itemId}: ${reason}`);
      break;
    }
    case 'clear': {
      item.blocked = false;
      item.auditCleared = true;
      item.history = item.history || [];
      item.history.push({
        agent: 'audit',
        action: 'unblocked',
        timestamp: new Date().toISOString(),
        notes: 'Audit cleared -- block removed after re-verification.',
      });
      console.log(`[CLEARED] ${itemId}: Block removed.`);
      break;
    }
    case 'status': {
      console.log(`Item: ${itemId}`);
      console.log(`  blocked: ${item.blocked ?? false}`);
      console.log(`  blockedBy: ${item.blockedBy ?? 'none'}`);
      console.log(`  blockedReason: ${item.blockedReason ?? 'none'}`);
      console.log(`  auditCleared: ${item.auditCleared ?? false}`);
      return; // read-only -- no write needed
    }
    default:
      console.error(`[ERR] Unknown action: ${action}. Use block, clear, or status.`);
      process.exit(1);
  }

  queue.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SHARED_PATHS.queue, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
}

main();
