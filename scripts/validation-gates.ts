/**
 * Shared validation gate functions used by both
 * generator-post-complete.ts and planner-post-complete.ts.
 *
 * Extracts common patterns: self-audit validation, sync gate, mid-work capture check,
 * queue loading. Agent-specific validation stays in respective scripts.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { QueueItem, QueueFile, SHARED_PATHS } from './shared-types';

export interface GateResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate self-audit basics: selfAuditPassed flag + history entry.
 * Returns errors for missing flag or missing history evidence.
 * Does NOT include agent-specific extensions (e.g. ALL-009 zero-findings check).
 */
export function validateSelfAuditBase(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!item.selfAuditPassed) {
    errors.push(
      'selfAuditPassed is false/missing -- agent must complete L1->L2->L3 self-audit before stage transition'
    );
  }

  const hasSelfAuditHistory = (item.history ?? []).some(
    h => h.action === 'self-audit' || (h.notes ?? '').toLowerCase().includes('self-audit')
  );
  if (item.selfAuditPassed && !hasSelfAuditHistory) {
    errors.push(
      'selfAuditPassed=true but no self-audit history entry -- add history entry with L1->L2->L3 results (ALL-011)'
    );
  }

  return { passed: errors.length === 0, errors, warnings };
}

/**
 * Run `npm run validate:sync` as a hard gate.
 * Returns GateResult with error if drift detected.
 */
export function runValidateSyncGate(): GateResult {
  const errors: string[] = [];
  try {
    execSync('npm run validate:sync', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
  } catch (e: unknown) {
    const stderr = (e as { stderr?: Buffer })?.stderr?.toString().trim() ?? '';
    const firstLines = stderr.split('\n').slice(0, 3).join('\n');
    errors.push(`validate:sync FAIL: Agent sync drift detected.\n${firstLines}`);
  }
  return { passed: errors.length === 0, errors, warnings: [] };
}

/**
 * Check activity log for mid-work-capture entries for a given item.
 * Returns a warning if the item shows signs of rework but no mid-work captures.
 *
 * @param item - Queue item to check
 * @param triggerThreshold - Number of history entries or run count that triggers the check
 * @param triggerField - Which metric to use: 'history' (entry count) or 'runCount' (generatorRunCount)
 */
export function checkMidWorkCapture(
  item: QueueItem,
  triggerThreshold: number,
  triggerField: 'history' | 'runCount' = 'history'
): string | null {
  if (!fs.existsSync(SHARED_PATHS.activityLog)) return null;

  const count = triggerField === 'runCount'
    ? ((item.generatorRunCount as number) ?? 0)
    : (item.history ?? []).length;

  if (count < triggerThreshold) return null;

  const logContent = fs.readFileSync(SHARED_PATHS.activityLog, 'utf-8').toLowerCase();
  const hasMidWorkCapture = logContent.includes('mid-work-capture') &&
    logContent.includes(item.id.toLowerCase());

  if (!hasMidWorkCapture) {
    return (
      `${triggerField === 'runCount' ? `generatorRunCount=${count}` : `${count} history entries`} ` +
      `but no "mid-work-capture" log entries for ${item.id}. ` +
      `ALL-004 requires logging discoveries mid-session.`
    );
  }
  return null;
}

// ── Escalation Enforcement (ALL-035/036) ──

/**
 * PF-ESC: Check pending escalations assigned to an agent.
 * Returns formatted log messages. Non-blocking (soft warning) in pre-run.
 */
export function checkPendingEscalations(agentName: string): string[] {
  const escFile = path.join(__dirname, '../specs_planning/_internal/agent-escalations.json');
  if (!fs.existsSync(escFile)) return [];

  try {
    const escData = JSON.parse(fs.readFileSync(escFile, 'utf-8'));
    const pending = (escData.escalations ?? []).filter(
      (e: { pendingFor: string; status: string }) => e.pendingFor === agentName && e.status === 'open'
    );
    if (pending.length === 0) return [];

    const lines: string[] = [];
    lines.push(`[PF-ESC] ${pending.length} open escalation(s) assigned to ${agentName}:`);
    for (const esc of pending) {
      lines.push(`  - ${esc.id}: ${esc.summary} (from ${esc.createdBy}, severity: ${esc.severity})`);
    }
    lines.push('[PF-ESC] RESOLVE these before proceeding with new work (ALL-036).');
    return lines;
  } catch {
    return [];
  }
}

/**
 * POST-ESC: Check if escalations assigned to an agent are still open after session.
 * Returns warnings for unresolved escalations.
 */
export function checkUnresolvedEscalations(agentName: string): string[] {
  const escFile = path.join(__dirname, '../specs_planning/_internal/agent-escalations.json');
  if (!fs.existsSync(escFile)) return [];

  try {
    const escData = JSON.parse(fs.readFileSync(escFile, 'utf-8'));
    const stillOpen = (escData.escalations ?? []).filter(
      (e: { pendingFor: string; status: string }) => e.pendingFor === agentName && e.status === 'open'
    );
    if (stillOpen.length === 0) return [];

    const lines: string[] = [];
    lines.push(`[POST-ESC] WARNING: ${stillOpen.length} escalation(s) still open after session:`);
    for (const esc of stillOpen) {
      lines.push(`  - ${esc.id}: ${esc.summary}`);
    }
    return lines;
  } catch {
    return [];
  }
}

/**
 * Load queue file and find a specific item by ID from CLI args.
 * Exits process with error if queue or item not found.
 */
export function loadQueueAndFindItem(args: string[]): { queue: QueueFile; item: QueueItem; itemId: string } | null {
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[ERR] Queue file not found:', SHARED_PATHS.queue);
    process.exit(1);
  }

  const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
  const targetId = args.find(a => !a.startsWith('--'));

  if (!targetId) return null; // Caller handles "no specific ID" case

  const item = queue.queue.find(q => q.id === targetId);
  if (!item) {
    console.error(`[ERR] Queue item not found: ${targetId}`);
    process.exit(1);
  }

  return { queue, item, itemId: targetId };
}
