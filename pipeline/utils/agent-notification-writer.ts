/**
 * @agent-doc
 * PURPOSE: Inter-agent notification system using per-file atomic pattern (no race conditions).
 * OWNER: human-only
 * IMPACT: medium - Enables agents to notify each other about stale artifacts, selector changes, and escalations.
 * DEPENDS-ON: src/framework-contracts/diagnostics.ts
 * USED-BY: scripts/healer-post-complete.ts, scripts/generator-pre-run.ts, scripts/planner-pre-run.ts
 * RULES: Each notification is a separate file. Readers glob + filter. Ack = delete file.
 */

import * as fs from 'fs';
import * as path from 'path';
import { AgentNotification } from '../framework-contracts/diagnostics';
import { SHARED_PATHS } from '../../scripts/shared-types';

// SP-MT-04: SHARED_PATHS.notifications resolves per-client
// (clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-notifications).
// Each client gets an isolated inbox — future multi-client deployments need this.
const NOTIFICATIONS_DIR = SHARED_PATHS.notifications;

/** Ensure the notifications directory exists. */
function ensureDir(): void {
  if (!fs.existsSync(NOTIFICATIONS_DIR)) {
    fs.mkdirSync(NOTIFICATIONS_DIR, { recursive: true });
  }
}

/**
 * Write a notification as an individual file (atomic, no read-modify-write).
 * Filename: {timestamp}-{fromAgent}-to-{toAgent}.json
 */
export function writeNotification(notification: Omit<AgentNotification, 'id' | 'timestamp' | 'acknowledged'>): string {
  ensureDir();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const id = `notif-${ts}-${notification.fromAgent}-to-${notification.toAgent}`;
  const full: AgentNotification = {
    ...notification,
    id,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
  const filePath = path.join(NOTIFICATIONS_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(full, null, 2), 'utf-8');
  return id;
}

/**
 * Read all pending (unacknowledged) notifications for a specific agent.
 * Globs the directory, filters by toAgent, returns sorted by timestamp.
 */
export function readPendingNotifications(forAgent: string): AgentNotification[] {
  ensureDir();
  const files = fs.readdirSync(NOTIFICATIONS_DIR).filter(f => f.endsWith('.json'));
  const notifications: AgentNotification[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(NOTIFICATIONS_DIR, file), 'utf-8');
      const notif: AgentNotification = JSON.parse(content);
      if (notif.toAgent === forAgent && !notif.acknowledged) {
        notifications.push(notif);
      }
    } catch {
      // Skip corrupted files
    }
  }

  return notifications.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Acknowledge a notification by deleting its file.
 * This is atomic — no read-modify-write needed.
 */
export function ackNotification(id: string): boolean {
  const filePath = path.join(NOTIFICATIONS_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

/**
 * Acknowledge all notifications for a specific agent.
 * Returns count of acknowledged notifications.
 */
export function ackAllNotifications(forAgent: string): number {
  const pending = readPendingNotifications(forAgent);
  let count = 0;
  for (const notif of pending) {
    if (ackNotification(notif.id)) count++;
  }
  return count;
}

/**
 * Write a stale_artifact notification from healer to generator and planner.
 * Convenience wrapper for the most common notification type.
 */
export function notifyStaleArtifacts(
  fromAgent: string,
  affectedFiles: string[],
  changeSummary: string,
): string[] {
  const ids: string[] = [];
  for (const target of ['generator', 'planner']) {
    const id = writeNotification({
      fromAgent,
      toAgent: target,
      type: 'stale_artifact',
      affectedFiles,
      changeSummary,
    });
    ids.push(id);
  }
  return ids;
}
