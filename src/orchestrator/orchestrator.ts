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

// ── Stage Routing ──

export function getStageDefinition(stageId: string): StageDefinition | undefined {
  return loadPipelineDefinition().stages.find(s => s.id === stageId);
}

export function getNextStageId(
  stageId: string,
  outcome: string
): string | null {
  const definition = loadPipelineDefinition();
  const stage = definition.stages.find(s => s.id === stageId);
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
  // Simple condition matching for MVP
  // "failedCount == 0" matches outcome "tests_pass" or "success"
  // "failedCount > 0" matches outcome "tests_fail" or "fail"
  if (when.includes('== 0') && (outcome === 'tests_pass' || outcome === 'success')) return true;
  if (when.includes('> 0') && (outcome === 'tests_fail' || outcome === 'fail')) return true;
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
): Promise<ConvergenceResult> {
  const definition = loadPipelineDefinition();
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

  const definition = loadPipelineDefinition();

  // Check convergence guards
  const guard = await checkConvergence(pool, runId, stageId);
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

  // Determine next stage
  let nextStageId = getNextStageId(stageId, outcome);

  // Dry run: force linear routing through ALL stages (including healing)
  const isDryRun = resultData?.dryRun === true;
  if (isDryRun) {
    const DRY_RUN_ORDER = ['requirements', 'planning', 'generation', 'healing', 'audit'];
    const currentIdx = DRY_RUN_ORDER.indexOf(stageId);
    nextStageId = currentIdx >= 0 && currentIdx < DRY_RUN_ORDER.length - 1
      ? DRY_RUN_ORDER[currentIdx + 1]!
      : 'completed';
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
  }

  parts.push('', stage.description);

  return parts.join('\n');
}
