/**
 * Schema-driven pipeline orchestrator.
 * Reads pipeline-definition.json — no hardcoded stage maps.
 * Adding a 6th agent = add one JSON entry + gate scripts.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Pool } from 'pg';
import type { PipelineDefinition, StageDefinition, SSEEvent } from './types';
import {
  updatePipelineRun,
  getPipelineRun,
  createWorkerTask,
  getStageResults,
  getClientPipelineDefinition,
  upsertPageStageStatus,
} from '../server/db/queries';

// Event callback — set by server to avoid circular dependency (orchestrator → events)
let onPipelineEvent: ((runId: string, event: SSEEvent) => void) | null = null;

export function setEventCallback(cb: (runId: string, event: SSEEvent) => void): void {
  onPipelineEvent = cb;
}

function emitEvent(runId: string, event: SSEEvent): void {
  onPipelineEvent?.(runId, event);
}

// ── Pipeline Definition Loading ──

const DEFINITION_PATH = path.join(__dirname, '../../config/pipeline-definition.json');

let cachedDefinition: PipelineDefinition | null = null;
let lastLoadTime = 0;

export function loadPipelineDefinition(): PipelineDefinition {
  // Cache for 5s in production, always reload in dev
  const now = Date.now();
  if (cachedDefinition && process.env.NODE_ENV === 'production' && now - lastLoadTime < 5000) {
    return cachedDefinition;
  }

  const raw = fs.readFileSync(DEFINITION_PATH, 'utf-8');
  cachedDefinition = JSON.parse(raw) as PipelineDefinition;
  lastLoadTime = now;
  return cachedDefinition;
}

export function savePipelineDefinition(definition: PipelineDefinition): void {
  // Basic validation
  if (!definition.version || !definition.stages || !Array.isArray(definition.stages)) {
    throw new Error('Invalid pipeline definition: missing version or stages');
  }
  if (definition.stages.length === 0) {
    throw new Error('Pipeline definition must have at least one stage');
  }

  // Validate stage IDs are unique
  const ids = definition.stages.map(s => s.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length > 0) {
    throw new Error(`Duplicate stage IDs: ${dupes.join(', ')}`);
  }

  // Validate next references point to existing stages or terminal states
  const validTargets = new Set([...ids, ...definition.terminalStates]);
  for (const stage of definition.stages) {
    for (const [outcome, target] of Object.entries(stage.next)) {
      if (!validTargets.has(target)) {
        throw new Error(`Stage "${stage.id}" next.${outcome} references unknown target "${target}"`);
      }
    }
  }

  fs.writeFileSync(DEFINITION_PATH, JSON.stringify(definition, null, 2), 'utf-8');
  cachedDefinition = definition;
  lastLoadTime = Date.now();
}

// ── Per-Client Pipeline Definition Loading (DB + file fallback) ──

/** Per-client cache: clientId → { definition, timestamp } */
const clientDefCache = new Map<string, { def: PipelineDefinition; ts: number }>();

/**
 * Load pipeline definition for a specific client.
 * Tries DB first (per-client → default row), falls back to file.
 */
export async function loadPipelineDefinitionForClient(
  pool: Pool,
  clientId?: string | null,
): Promise<PipelineDefinition> {
  const cacheKey = clientId || '__default__';
  const now = Date.now();
  const cached = clientDefCache.get(cacheKey);
  if (cached && process.env.NODE_ENV === 'production' && now - cached.ts < 5000) {
    return cached.def;
  }

  try {
    const result = await getClientPipelineDefinition(pool, clientId);
    if (result) {
      const def = result.definition as unknown as PipelineDefinition;
      clientDefCache.set(cacheKey, { def, ts: now });
      return def;
    }
  } catch (err) {
    console.warn('[Orchestrator] DB lookup failed for client definition, falling back to file:', (err as Error).message);
  }

  // Fallback to file-based
  return loadPipelineDefinition();
}

// ── Stage Routing ──

export function getStageDefinition(stageId: string, definition?: PipelineDefinition): StageDefinition | undefined {
  const def = definition || loadPipelineDefinition();
  return def.stages.find(s => s.id === stageId);
}

export function getNextStageId(
  stageId: string,
  outcome: string,
  definition?: PipelineDefinition,
): string | null {
  const def = definition || loadPipelineDefinition();
  const stage = def.stages.find(s => s.id === stageId);
  if (!stage) return null;

  // Check routing rules first (for conditional routing like test results)
  if (stage.routing?.rules) {
    for (const rule of stage.routing.rules) {
      if (matchRoutingCondition(rule.when, outcome)) {
        return rule.then;
      }
    }
  }

  // Fall back to simple next map
  return stage.next[outcome] || stage.next['success'] || null;
}

function matchRoutingCondition(when: string, outcome: string): boolean {
  // Binary pass/fail matching
  if (when.includes('== 0') && (outcome === 'tests_pass' || outcome === 'success')) return true;
  if (when.includes('> 0') && (outcome === 'tests_fail' || outcome === 'fail')) return true;

  // Failure class matching: "failureClass == selector_not_found" matches "fail:selector_not_found"
  const classMatch = when.match(/failureClass\s*==\s*(\w+)/);
  if (classMatch && outcome === `fail:${classMatch[1]}`) return true;

  // Failure class set matching: "failureClass in selector_not_found,selector_ambiguous"
  const inMatch = when.match(/failureClass\s+in\s+(\S+)/);
  if (inMatch) {
    const classes = inMatch[1]!.split(',');
    const outcomeClass = outcome.replace('fail:', '');
    if (classes.includes(outcomeClass)) return true;
  }

  // Catch-all fail (matches any fail:* outcome too)
  if (when === 'fail' && outcome.startsWith('fail')) return true;

  return false;
}

// ── Convergence Guards ──

interface ConvergenceResult {
  triggered: boolean;
  guard?: string;
  reason?: string;
}

async function checkConvergence(
  pool: Pool,
  runId: string,
  stageId: string,
  definition: PipelineDefinition,
): Promise<ConvergenceResult> {
  const guards = definition.convergenceGuards;

  if (!guards.enabled) {
    return { triggered: false };
  }

  const stageResults = await getStageResults(pool, runId);
  const stageAttempts = stageResults.filter(r => r.stage_id === stageId);

  // Max iterations guard — use ?? (not ||) because retries: 0 is a valid value
  if (guards.maxIterations.enabled) {
    const stage = definition.stages.find(s => s.id === stageId);
    const maxRetries = (stage?.retries ?? guards.maxIterations.limit) + 1; // retries + 1 = total attempts
    if (stageAttempts.length >= maxRetries) {
      return {
        triggered: true,
        guard: 'maxIterations',
        reason: `Stage "${stageId}" exhausted ${maxRetries} attempts (${stage?.retries ?? guards.maxIterations.limit} retries)`,
      };
    }
  }

  // Budget guard
  if (guards.budgetExhausted.enabled) {
    const run = await getPipelineRun(pool, runId);
    if (run && Number(run.cost) >= definition.defaults.budgetPerRunUsd) {
      return {
        triggered: true,
        guard: 'budgetExhausted',
        reason: `Run budget exhausted: $${run.cost} >= $${definition.defaults.budgetPerRunUsd}`,
      };
    }
  }

  // Same findings guard — detects stuck audit loops
  if (guards.sameFindings.enabled && stageAttempts.length >= 2) {
    const sorted = [...stageAttempts].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const current = sorted[0]?.result_data;
    const previous = sorted[1]?.result_data;

    if (current && previous) {
      const currentFindings = JSON.stringify(current['findings'] ?? current);
      const previousFindings = JSON.stringify(previous['findings'] ?? previous);
      if (currentFindings === previousFindings) {
        return {
          triggered: true,
          guard: 'sameFindings',
          reason: `Stage "${stageId}" produced identical findings two iterations in a row`,
        };
      }
    }
  }

  // Not decreasing guard — error count not shrinking over windowSize iterations
  if (guards.notDecreasing.enabled && stageAttempts.length >= guards.notDecreasing.windowSize) {
    // Sort oldest→newest (chronological order)
    const sorted = [...stageAttempts].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    // Take the most recent N attempts
    const window = sorted.slice(-guards.notDecreasing.windowSize);
    const errorCounts = window.map(r => {
      const data = r.result_data;
      if (!data) return 0;
      return Number(data['errorCount'] ?? data['failedCount'] ?? data['highCount'] ?? 0);
    });

    // Trigger if error counts are non-decreasing over the window (not improving)
    // errorCounts is chronological: [oldest, ..., newest]
    const notImproving = errorCounts.every((count, i) =>
      i === 0 || count >= errorCounts[i - 1]!
    );
    if (notImproving && errorCounts[errorCounts.length - 1]! > 0) {
      return {
        triggered: true,
        guard: 'notDecreasing',
        reason: `Stage "${stageId}" error count not decreasing over ${guards.notDecreasing.windowSize} iterations (oldest→newest): [${errorCounts.join(', ')}]`,
      };
    }
  }

  return { triggered: false };
}

// ── Stage Completion Processing ──

export async function processStageCompletion(
  pool: Pool,
  runId: string,
  stageId: string,
  outcome: string,
  resultData: Record<string, unknown> | null,
  _depth: number = 0,
): Promise<void> {
  // Guard against infinite recursion through chains of disabled stages or config cycles
  const MAX_RECURSION = 20;
  if (_depth > MAX_RECURSION) {
    console.error(`[Orchestrator] Max recursion depth (${MAX_RECURSION}) exceeded at stage "${stageId}" — possible cycle or all stages disabled`);
    await updatePipelineRun(pool, runId, { status: 'error', stage: stageId });
    emitEvent(runId, {
      type: 'error',
      runId,
      message: `Pipeline error: max stage-skip depth exceeded at "${stageId}". Check pipeline definition for disabled stage chains or cycles.`,
      timestamp: new Date().toISOString(),
      visibility: 'admin',
    });
    return;
  }

  // Load per-client definition (DB-first, file fallback)
  const run0 = await getPipelineRun(pool, runId);
  const definition = await loadPipelineDefinitionForClient(pool, run0?.client_id);

  // Check convergence guards
  const guard = await checkConvergence(pool, runId, stageId, definition);
  if (guard.triggered) {
    await updatePipelineRun(pool, runId, { status: 'fixme', stage: 'fixme' });
    const run = await getPipelineRun(pool, runId);
    emitEvent(runId, {
      type: 'pipeline_complete',
      runId,
      status: 'fixme',
      totalCost: run ? Number(run.cost) : 0,
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });
    emitEvent(runId, {
      type: 'error',
      runId,
      message: `Convergence guard "${guard.guard}" triggered: ${guard.reason}`,
      timestamp: new Date().toISOString(),
      visibility: 'admin',
    });
    return;
  }

  // Update page_stage_status on completion (if page-scoped run)
  if (run0?.page_id) {
    const pageStatus = outcome === 'success' || outcome === 'tests_pass'
      ? 'completed' as const
      : 'failed' as const;
    await upsertPageStageStatus(pool, run0.page_id, stageId, {
      status: pageStatus,
      active_run_id: null,
      last_run_id: runId,
      ...(pageStatus === 'completed' ? { last_completed_at: new Date().toISOString() } : {}),
    });
    emitEvent(runId, {
      type: 'page_stage_updated',
      runId,
      pageId: run0.page_id,
      stageId,
      status: pageStatus,
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });
  }

  // Determine next stage — cascade_plan overrides normal routing
  let nextStageId: string | null = null;

  if (run0?.cascade_plan && Array.isArray(run0.cascade_plan)) {
    const cascadePlan = run0.cascade_plan as unknown as string[];
    const currentIdx = cascadePlan.indexOf(stageId);
    if (currentIdx >= 0 && currentIdx < cascadePlan.length - 1) {
      nextStageId = cascadePlan[currentIdx + 1]!;
      // Emit cascade progress
      if (run0.page_id) {
        emitEvent(runId, {
          type: 'cascade_progress',
          runId,
          pageId: run0.page_id,
          completedStage: stageId,
          nextStage: nextStageId,
          timestamp: new Date().toISOString(),
          visibility: 'public',
        });
      }
    }
    // If cascade exhausted, fall through to normal routing
  }

  if (!nextStageId) {
    nextStageId = getNextStageId(stageId, outcome, definition);
  }

  // Dry run: force linear routing through pipeline stages (no healing — healer is standalone)
  const isDryRun = resultData?.dryRun === true;
  if (isDryRun) {
    const DRY_RUN_ORDER = ['requirements', 'planning', 'generation', 'audit'];
    const currentIdx = DRY_RUN_ORDER.indexOf(stageId);
    nextStageId = currentIdx >= 0 && currentIdx < DRY_RUN_ORDER.length - 1
      ? DRY_RUN_ORDER[currentIdx + 1]!
      : 'completed';
  }

  // Triage pause: when audit completes, check for triage report on disk
  if (stageId === 'audit' && !isDryRun) {
    // Check resultData first, then fall back to reading triage report from disk
    let triageReport = resultData?.triageReport as { totalFailures?: number } | undefined;

    if (!triageReport) {
      // Audit agent writes triage report to disk — read it if present
      const triageReportPath = path.join(__dirname, '../../reports/triage-report.json');
      try {
        if (fs.existsSync(triageReportPath)) {
          triageReport = JSON.parse(fs.readFileSync(triageReportPath, 'utf-8'));
        }
      } catch (err) {
        console.warn('[Orchestrator] Could not read triage report:', (err as Error).message);
      }
    }

    if (triageReport?.totalFailures && triageReport.totalFailures > 0) {
      // Auto-triage: if run is in auto mode, apply defaults and continue silently
      const isAutoMode = run0?.execution_mode_live === 'auto' || run0?.execution_mode_live === 'full-auto';
      const autoTriageDefaults = (definition as any).autoTriageDefaults as Record<string, string> | undefined;

      if (isAutoMode && autoTriageDefaults && Object.keys(autoTriageDefaults).length > 0) {
        // Apply auto-triage defaults — try multiple triage report formats
        const report = triageReport as any;
        let triageItems: any[] = [];
        if (report.groups && Array.isArray(report.groups)) {
          triageItems = report.groups.flatMap((g: any) => g.items || []);
        } else if (Array.isArray(report.failures)) {
          triageItems = report.failures;
        } else if (Array.isArray(report)) {
          triageItems = report;
        }
        if (triageItems.length === 0) {
          console.warn('[Orchestrator] Auto-triage: could not parse triage items from report, falling back to manual triage');
          // Fall through to manual triage below
        } else {
        const decisions = triageItems.map((item: any) => ({
          testName: item.testName || item.name || 'Unknown',
          action: autoTriageDefaults[item.category] || autoTriageDefaults['UNCERTAIN'] || 'dismiss',
        }));
        const bugCount = decisions.filter((d: any) => d.action === 'report_bug').length;
        const dismissCount = decisions.filter((d: any) => d.action === 'dismiss').length;
        console.log(`[Orchestrator] Auto-triage applied: ${bugCount} reported, ${dismissCount} dismissed`);

        // Auto-triage completes the pipeline — healer is standalone, not auto-invoked
        await updatePipelineRun(pool, runId, { status: 'completed' as any, stage: 'completed' });
        emitEvent(runId, { type: 'pipeline_complete', runId, status: 'completed', totalCost: run0 ? Number(run0.cost) : 0, timestamp: new Date().toISOString(), visibility: 'public' });
        return;
        } // end else (triageItems.length > 0)
      }

      // Manual triage: pause and notify
      await updatePipelineRun(pool, runId, { status: 'awaiting_triage' as any, stage: 'triage' });
      emitEvent(runId, {
        type: 'triage_required',
        runId,
        triageReportPath: `reports/triage-report.json`,
        failureCount: triageReport.totalFailures,
        timestamp: new Date().toISOString(),
        visibility: 'public',
      });
      return; // Pipeline paused — user must make decisions on dashboard
    }
  }

  // Terminal state
  if (!nextStageId || definition.terminalStates.includes(nextStageId)) {
    const terminalStatus = nextStageId === 'fixme' ? 'fixme' : 'completed';
    await updatePipelineRun(pool, runId, {
      status: terminalStatus as 'completed' | 'fixme',
      stage: nextStageId || 'completed',
    });
    const run = await getPipelineRun(pool, runId);
    emitEvent(runId, {
      type: 'pipeline_complete',
      runId,
      status: terminalStatus as 'completed' | 'fixme',
      totalCost: run ? Number(run.cost) : 0,
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });
    return;
  }

  // Find next stage definition
  const nextStage = definition.stages.find(s => s.id === nextStageId);
  if (!nextStage) {
    console.error(`[Orchestrator] Unknown next stage "${nextStageId}" from "${stageId}"`);
    await updatePipelineRun(pool, runId, { status: 'error', stage: stageId });
    return;
  }

  // Skip disabled stages (pass depth to prevent infinite recursion)
  // Preserve dryRun flag through skipped stages
  if (!nextStage.enabled) {
    await processStageCompletion(pool, runId, nextStageId, 'success', isDryRun ? { dryRun: true } : null, _depth + 1);
    return;
  }

  // Build prompt and context for next stage
  const run = await getPipelineRun(pool, runId);
  if (!run) return;

  // Approval gate: check both stage config AND per-run executionMode override.
  // executionMode='approve-per-stage' is stored in the worker task context and
  // propagated through resultData. If present, treat ALL stages as manual.
  // NOTE: Approval gate runs BEFORE artifact validation — in manual mode, the user
  // should review and approve the current stage's output before we check whether
  // the next stage's prerequisites are satisfied (artifacts may be created during approval).
  const isApprovePerStage = resultData?.executionMode === 'approve-per-stage';
  const needsApproval = (nextStage.approvalMode === 'manual' || isApprovePerStage) && !isDryRun;
  if (needsApproval) {
    await updatePipelineRun(pool, runId, { status: 'awaiting_approval' as any, stage: stageId });
    emitEvent(runId, {
      type: 'approval_required',
      runId,
      stage: stageId,
      artifactCount: 0, // Caller can look up artifacts from API
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });
    return; // Pipeline paused — user must approve artifacts on dashboard
  }

  // Validate upstream artifacts (only in auto mode — manual mode pauses above)
  const { validateUpstreamArtifacts } = await import('./artifact-validator');
  const validationCtx = {
    feature: run.feature,
    module: run.module,
    intent: run.intent,
    targetUrl: run.target_url,
  };
  const validation = validateUpstreamArtifacts(nextStageId, validationCtx);
  if (!validation.valid) {
    console.error(`[Orchestrator] Upstream artifacts missing for ${nextStageId}:`, validation.missing);
    emitEvent(runId, {
      type: 'error',
      runId,
      message: `Stage "${nextStageId}" blocked: missing upstream artifacts. Missing: ${validation.missing.join(', ')}`,
      timestamp: new Date().toISOString(),
      visibility: 'admin',
    });
    await updatePipelineRun(pool, runId, { status: 'error', stage: stageId });
    return;
  }

  // Run pre-run gate if defined
  if (nextStage.preRunGate) {
    try {
      const { runGate } = await import('./gate-runner');
      const gateResult = runGate(nextStage.preRunGate);
      if (!gateResult.passed) {
        console.warn(`[Orchestrator] Pre-run gate warning for ${nextStageId}: ${gateResult.output.slice(0, 200)}`);
        // Log but don't block — gate scripts may expect queue-item-id which isn't available in autonomous mode
      }
    } catch (err) {
      console.warn(`[Orchestrator] Pre-run gate failed for ${nextStageId}:`, (err as Error).message);
    }
  }

  // Update page_stage_status to in_progress for next stage
  if (run.page_id) {
    await upsertPageStageStatus(pool, run.page_id, nextStage.id, {
      status: 'running',
      active_run_id: runId,
    });
    emitEvent(runId, {
      type: 'page_stage_updated',
      runId,
      pageId: run.page_id,
      stageId: nextStage.id,
      status: 'running',
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });
  }

  const prompt = buildStagePrompt(nextStage, run, resultData);

  // Create worker task for next stage (pass client_id for client-aware task routing)
  await createWorkerTask(pool, runId, nextStage.id, prompt, {
    feature: run.feature,
    module: run.module,
    intent: run.intent,
    targetUrl: run.target_url,
    previousStage: stageId,
    previousOutcome: outcome,
    previousResult: resultData,
    ...(isDryRun ? { dryRun: true } : {}),
    ...(resultData?.executionMode ? { executionMode: resultData.executionMode } : {}),
  }, run.client_id);

  await updatePipelineRun(pool, runId, { stage: nextStageId, status: 'queued' });
}

export function buildDryRunPrompt(stageId: string, context: {
  feature: string; module: string; intent: string;
}): string {
  const templatePath = path.join(__dirname, '../../config/dry-run-prompt.md');
  const template = fs.readFileSync(templatePath, 'utf-8');
  return template
    .replace('<stage-id>', stageId)
    .replace('<echo feature>', context.feature)
    .replace('<echo module>', context.module)
    .replace('<echo intent>', context.intent);
}

function buildStagePrompt(
  stage: StageDefinition,
  run: { feature: string; module: string; intent: string; target_url: string | null },
  previousResult: Record<string, unknown> | null,
): string {
  // Dry run: return roll-call prompt instead of real stage prompt
  if (previousResult?.dryRun === true) {
    return buildDryRunPrompt(stage.id, {
      feature: run.feature,
      module: run.module,
      intent: run.intent,
    });
  }

  const parts = [
    `Pipeline Stage: ${stage.name} (${stage.id})`,
    `Agent: ${stage.agent}`,
    `Feature: ${run.feature}`,
    `Module: ${run.module}`,
    `Intent: ${run.intent}`,
  ];

  if (run.target_url) {
    parts.push(`Target URL: ${run.target_url}`);
  }

  if (previousResult) {
    parts.push('', '--- Previous Stage Result ---', JSON.stringify(previousResult, null, 2));

    // Upstream fix context: when routed back due to failure classification
    if (previousResult._upstreamBlame && previousResult._failureClass) {
      parts.push('');
      parts.push('--- UPSTREAM FIX REQUIRED ---');
      parts.push('A downstream agent failed because of issues in YOUR output.');
      parts.push(`Failure type: ${previousResult._failureClass}`);
      parts.push(`Evidence: ${previousResult._failureEvidence || 'See previous result'}`);
      parts.push('');
      parts.push('Fix the issue described above. Do not redo all work -- only fix what caused the downstream failure.');
    }
  }

  parts.push('', stage.description);

  return parts.join('\n');
}
