#!/usr/bin/env ts-node
/**
 * Queue Integrity Validator -- cross-checks queue, activity log, and performance.json.
 *
 * Checks:
 * 1. Stage-history consistency (blocked -> stage must revert, or re-completion entry must exist)
 * 2. selfAuditPassed gate (items at pending_generation+ without selfAuditPassed)
 * 3. Activity log coverage (stage transitions without matching log entries)
 * 4. Performance vs queue sync (totalRuns accuracy, untracked defects)
 * 5. Checklist self-certification (true fields without supporting TCs)
 *
 * Usage: npm run queue:validate
 * Exit: 0 = clean, 1 = issues found
 */

import * as fs from 'fs';
import * as path from 'path';
import { QueueFile, QueueItem, QueueItemHistory, SHARED_PATHS } from './shared-types';

// ── Stage ordering (lower index = earlier) ──
const STAGE_ORDER = [
  'pending_requirements', 'requirements',
  'pending_planning', 'planning',
  'pending_generation', 'generation',
  'testing',
  'completed',
  'pending_healing', 'healing',
];

// Stages that require selfAuditPassed from the preceding agent
const SELF_AUDIT_REQUIRED_STAGES = ['pending_generation', 'generation', 'testing', 'completed'];

interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  item?: string;
  check: string;
  message: string;
}

function loadQueue(): QueueFile {
  return JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
}

function loadActivityLog(): string[] {
  if (!fs.existsSync(SHARED_PATHS.activityLog)) return [];
  return fs.readFileSync(SHARED_PATHS.activityLog, 'utf-8').split('\n');
}

function loadPerformance(): Record<string, unknown> {
  if (!fs.existsSync(SHARED_PATHS.performance)) return {};
  return JSON.parse(fs.readFileSync(SHARED_PATHS.performance, 'utf-8'));
}

// ── Check 1: Stage-History Consistency ──
function checkStageHistory(queue: QueueFile): Finding[] {
  const findings: Finding[] = [];

  for (const item of queue.queue) {
    if (!item.history || item.history.length === 0) continue;

    const lastEntry = item.history[item.history.length - 1]!;
    const action = lastEntry.action?.toLowerCase() ?? '';

    // If last history action is "blocked", stage should be reverted
    if (action === 'blocked') {
      const currentIdx = STAGE_ORDER.indexOf(item.stage);
      // blocked items should be at planning or earlier -- not at pending_generation+
      if (currentIdx >= STAGE_ORDER.indexOf('pending_generation')) {
        findings.push({
          severity: 'critical',
          item: item.id,
          check: 'stage-history',
          message: `Last history action is "blocked" but stage is "${item.stage}" -- should be reverted to planning or earlier`,
        });
      }
    }

    // Check for audit blocks mid-history (not just last entry)
    for (let i = 0; i < item.history.length; i++) {
      const entry = item.history[i]!;
      if (entry.action?.toLowerCase() === 'blocked') {
        // After a block, there must be a re-completion entry OR stage must be reverted
        const hasRecompletion = item.history.slice(i + 1).some(
          e => e.action === 'completed' || e.action === 'done' || e.action === 'corrected' || e.action === 'fixed'
        );
        // Phase B of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION: accept both the
        // legacy 'csv_export' action token and the new 'xlsx_rebuild' as
        // benign post-block entries. The legacy alias is removed in Phase D.
        const onlyExportsAfter = item.history.slice(i + 1).every(
          e => e.action === 'xlsx_rebuild' || e.action === 'csv_export'
        );

        if (!hasRecompletion && onlyExportsAfter && item.stage !== 'planning' && item.stage !== 'pending_planning') {
          findings.push({
            severity: 'high',
            item: item.id,
            check: 'stage-history',
            message: `Audit blocked at history[${i}] but no re-completion entry exists after block -- only xlsx_rebuild/csv_export. Stage "${item.stage}" may be incorrect.`,
          });
        }
      }
    }
  }

  return findings;
}

// ── Check 2: selfAuditPassed Gate ──
function checkSelfAuditGate(queue: QueueFile): Finding[] {
  const findings: Finding[] = [];

  for (const item of queue.queue) {
    if (SELF_AUDIT_REQUIRED_STAGES.includes(item.stage)) {
      if (!item.selfAuditPassed) {
        findings.push({
          severity: 'high',
          item: item.id,
          check: 'self-audit-gate',
          message: `Stage is "${item.stage}" but selfAuditPassed is ${item.selfAuditPassed ?? 'undefined'} -- gate was bypassed`,
        });
      }
    }
  }

  return findings;
}

// ── Check 3: Activity Log Coverage ──
function checkActivityLogCoverage(queue: QueueFile, logLines: string[]): Finding[] {
  const findings: Finding[] = [];

  // Build set of item IDs mentioned in activity log
  const logContent = logLines.join('\n').toLowerCase();

  for (const item of queue.queue) {
    const itemId = item.id.toLowerCase();
    // Convert item id to search-friendly form (e.g., "location-local-information" -> "local information" or "local-information")
    const searchTerms = [
      itemId,
      itemId.replace('location-', ''),
      item.feature?.toLowerCase() ?? '',
    ].filter(Boolean);

    const inLog = searchTerms.some(term => logContent.includes(term));

    // Items at generation+ should have activity log entries
    const stageIdx = STAGE_ORDER.indexOf(item.stage);
    if (stageIdx >= STAGE_ORDER.indexOf('generation') && !inLog) {
      findings.push({
        severity: 'critical',
        item: item.id,
        check: 'activity-log',
        message: `Stage is "${item.stage}" but no matching activity log entry found -- agent completed work without logging`,
      });
    }

    // Check for self-audit log entries (L1->L2->L3 notation)
    if (stageIdx >= STAGE_ORDER.indexOf('pending_generation')) {
      // Search for self-audit entries related to this item
      const hasAuditEntry = logLines.some(
        line => line.toLowerCase().includes('self-audit') && searchTerms.some(t => line.toLowerCase().includes(t))
      );
      if (!hasAuditEntry) {
        findings.push({
          severity: 'medium',
          item: item.id,
          check: 'activity-log',
          message: `No self-audit (L1->L2->L3) activity log entry found for this item`,
        });
      }
    }
  }

  return findings;
}

// ── Check 4: Performance vs Queue Sync ──
function checkPerformanceSync(queue: QueueFile, perf: Record<string, unknown>): Finding[] {
  const findings: Finding[] = [];
  const agents = (perf as { agents?: Record<string, { totalRuns: number }> }).agents;
  if (!agents) {
    findings.push({ severity: 'critical', check: 'performance-sync', message: 'No agents section in performance.json' });
    return findings;
  }

  // Count stage transitions per agent from queue history
  const agentActions: Record<string, number> = {};
  for (const item of queue.queue) {
    for (const h of (item.history ?? [])) {
      const agent = h.agent?.toLowerCase() ?? '';
      if (agent && ['completed', 'done', 'corrected', 'final-corrections'].includes(h.action ?? '')) {
        agentActions[agent] = (agentActions[agent] ?? 0) + 1;
      }
    }
  }

  // Check expected agents exist
  const expectedAgents = ['requirements', 'planner', 'generator', 'healer', 'audit'];
  for (const name of expectedAgents) {
    if (!agents[name]) {
      findings.push({
        severity: 'high',
        check: 'performance-sync',
        message: `Agent "${name}" missing from performance.json`,
      });
    }
  }

  // Check totalRuns plausibility
  for (const [name, data] of Object.entries(agents)) {
    const recorded = data.totalRuns;
    const observed = agentActions[name] ?? 0;
    // planner-post-complete entries don't count as agent runs
    if (recorded === 0 && observed > 0) {
      findings.push({
        severity: 'high',
        check: 'performance-sync',
        message: `Agent "${name}" has totalRuns=${recorded} but ${observed} completion actions found in queue history`,
      });
    }
  }

  return findings;
}

// ── Check 5: Checklist Self-Certification ──
function checkChecklistCertification(queue: QueueFile): Finding[] {
  const findings: Finding[] = [];

  // Keyword mapping for checklist fields
  const fieldKeywords: Record<string, string[]> = {
    boundaryTesting: ['boundary', 'min', 'max', 'limit', 'range', 'character', 'length', 'overflow'],
    errorVerification: ['error', 'invalid', 'validation', 'fail', 'reject', 'required', 'empty'],
    crossFieldValidation: ['depends', 'dependency', 'conditional', 'when', 'toggle', 'enable', 'disable'],
    errorRecovery: ['recover', 'undo', 'revert', 'cancel', 'discard', 'unsaved'],
  };

  for (const item of queue.queue) {
    const checklist = item.uiTestingChecklist;
    if (!checklist) continue;

    // Load test case file to check for keyword support
    const tcFile = item.artifacts?.testCaseFile;
    let tcContent = '';
    if (tcFile) {
      const tcPath = path.isAbsolute(tcFile as string) ? tcFile as string : path.join(__dirname, '..', tcFile as string);
      if (fs.existsSync(tcPath)) {
        tcContent = fs.readFileSync(tcPath, 'utf-8').toLowerCase();
      }
    }

    // Check each certifiable field
    for (const [field, keywords] of Object.entries(fieldKeywords)) {
      const value = (checklist as Record<string, unknown>)[field];
      if (value === true && tcContent) {
        const hasKeywordSupport = keywords.some(kw => tcContent.includes(kw));
        if (!hasKeywordSupport) {
          findings.push({
            severity: 'high',
            item: item.id,
            check: 'checklist-certification',
            message: `${field}=true but no supporting keywords (${keywords.slice(0, 3).join('/')}) found in test case file`,
          });
        }
      }

      // Check: field is false without explanation notes
      if (value === false) {
        const clAny = checklist as Record<string, unknown>;
        const hasNotes = clAny['notes'] || clAny[`${field}Notes`];
        // This is informational -- not blocking
        if (!hasNotes) {
          findings.push({
            severity: 'low',
            item: item.id,
            check: 'checklist-certification',
            message: `${field}=false without notes explaining why -- add notes for auditability`,
          });
        }
      }
    }
  }

  return findings;
}

// ── Check 6: Blocked items at advanced stages ──
function checkBlockedItems(queue: QueueFile): Finding[] {
  const findings: Finding[] = [];
  const advancedStages = ['pending_generation', 'generation', 'testing', 'completed', 'pending_healing', 'healing'];

  for (const item of queue.queue) {
    if (item.blocked === true && item.auditCleared !== true) {
      if (advancedStages.includes(item.stage)) {
        findings.push({
          severity: 'critical',
          item: item.id,
          check: 'blocked-gate',
          message: `Item is blocked (by ${item.blockedBy || 'unknown'}: ${item.blockedReason || 'no reason'}) but stage is "${item.stage}" -- must be cleared by audit before proceeding`,
        });
      } else {
        findings.push({
          severity: 'medium',
          item: item.id,
          check: 'blocked-gate',
          message: `Item is blocked (by ${item.blockedBy || 'unknown'}) at stage "${item.stage}"`,
        });
      }
    }

    // Items that were blocked and cleared should have auditCleared=true
    if (item.blocked === true && item.auditCleared === true && !item.blockedReason) {
      findings.push({
        severity: 'low',
        item: item.id,
        check: 'blocked-gate',
        message: 'Item was blocked and cleared but has no blockedReason for audit trail',
      });
    }
  }

  return findings;
}

// ── Main ──
function main(): void {
  console.log('='.repeat(60));
  console.log('Queue Integrity Validation');
  console.log('='.repeat(60));

  const queue = loadQueue();
  const logLines = loadActivityLog();
  const perf = loadPerformance();

  const allFindings: Finding[] = [
    ...checkStageHistory(queue),
    ...checkSelfAuditGate(queue),
    ...checkActivityLogCoverage(queue, logLines),
    ...checkPerformanceSync(queue, perf),
    ...checkChecklistCertification(queue),
    ...checkBlockedItems(queue),
  ];

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allFindings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Report
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of allFindings) {
    counts[f.severity]++;
    const icon = f.severity === 'critical' ? '!!!' : f.severity === 'high' ? '!!' : f.severity === 'medium' ? '!' : '.';
    const itemLabel = f.item ? `[${f.item}]` : '[global]';
    console.log(`  ${icon} ${f.severity.toUpperCase()} ${itemLabel} (${f.check}): ${f.message}`);
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${allFindings.length} findings (${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low)`);
  console.log(`Items checked: ${queue.queue.length}`);
  console.log('='.repeat(60));

  if (counts.critical > 0 || counts.high > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();
