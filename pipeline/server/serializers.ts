/**
 * Response serializers — transform DB snake_case → API camelCase.
 * Also normalizes status values to match frontend contract.
 *
 * DB uses: created_at, target_url, stage_id, result_data, etc.
 * Frontend expects: createdAt, targetUrl, stageId, resultData, etc.
 *
 * DB stage status: success | fail
 * Frontend expects: completed | failed
 */

import type { PipelineRun, StageResult, Artifact, WorkerTask } from '../orchestrator/types';

// ── Generic snake_case → camelCase ──

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

// ── Stage status normalization ──

const STAGE_STATUS_MAP: Record<string, string> = {
  success: 'completed',
  fail: 'failed',
  // These pass through unchanged:
  pending: 'pending',
  running: 'running',
  skipped: 'skipped',
  cancelled: 'cancelled',
};

function normalizeStageStatus(status: string): string {
  return STAGE_STATUS_MAP[status] || status;
}

// ── Serializers ──

export function serializePipelineRun(run: PipelineRun) {
  return {
    id: run.id,
    clientId: run.client_id || null,
    feature: run.feature,
    module: run.module,
    intent: run.intent,
    targetUrl: run.target_url,
    stage: run.stage,
    status: run.status,
    priority: run.priority,
    cost: Number(run.cost),
    createdAt: run.created_at,
    updatedAt: run.updated_at,
  };
}

export function serializePipelineRunWithDetails(
  run: PipelineRun,
  stages: StageResult[],
  artifacts: Artifact[],
) {
  return {
    ...serializePipelineRun(run),
    stages: stages.map(serializeStageResult),
    artifacts: artifacts.map(serializeArtifact),
  };
}

export function serializeStageResult(stage: StageResult) {
  return {
    id: stage.id,
    runId: stage.run_id,
    stageId: stage.stage_id,
    status: normalizeStageStatus(stage.status),
    attempt: stage.attempt,
    maxAttempts: stage.max_attempts,
    agentModel: stage.agent_model,
    cost: Number(stage.cost),
    resultData: stage.result_data,
    startedAt: stage.started_at,
    completedAt: stage.completed_at,
    createdAt: stage.created_at,
  };
}

export function serializeArtifact(artifact: Artifact) {
  return {
    id: artifact.id,
    runId: artifact.run_id,
    name: artifact.name,
    artifactType: artifact.type,
    content: artifact.content,
    metadata: artifact.metadata,
    createdAt: artifact.created_at,
  };
}
