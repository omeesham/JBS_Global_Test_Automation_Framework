/**
 * Parameterized SQL queries — no ORM for MVP.
 * Every function takes a Pool and returns typed results.
 */

import { Pool } from 'pg';
import type {
  PipelineRun,
  StageResult,
  Artifact,
  WorkerTask,
  CreatePipelineRequest,
  CompletedTaskPayload,
  AdminUsage,
} from '../../orchestrator/types';

// ── Pipeline Runs ──

export async function createPipelineRun(
  pool: Pool,
  req: CreatePipelineRequest
): Promise<PipelineRun> {
  const { rows } = await pool.query<PipelineRun>(
    `INSERT INTO pipeline_runs (client_id, feature, module, intent, target_url, priority)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [req.clientId || null, req.feature, req.module, req.intent, req.targetUrl || null, req.priority || 'medium']
  );
  return rows[0]!;
}

export async function getPipelineRun(pool: Pool, id: string): Promise<PipelineRun | null> {
  const { rows } = await pool.query<PipelineRun>(
    'SELECT * FROM pipeline_runs WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function listPipelineRuns(
  pool: Pool,
  status?: string
): Promise<PipelineRun[]> {
  if (status) {
    const { rows } = await pool.query<PipelineRun>(
      'SELECT * FROM pipeline_runs WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return rows;
  }
  const { rows } = await pool.query<PipelineRun>(
    'SELECT * FROM pipeline_runs ORDER BY created_at DESC LIMIT 100'
  );
  return rows;
}

export async function updatePipelineRun(
  pool: Pool,
  id: string,
  patch: Partial<Pick<PipelineRun, 'stage' | 'status' | 'cost'>>
): Promise<PipelineRun | null> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (patch.stage !== undefined) { sets.push(`stage = $${idx++}`); vals.push(patch.stage); }
  if (patch.status !== undefined) { sets.push(`status = $${idx++}`); vals.push(patch.status); }
  if (patch.cost !== undefined) { sets.push(`cost = $${idx++}`); vals.push(patch.cost); }

  if (sets.length === 0) return getPipelineRun(pool, id);

  vals.push(id);
  const { rows } = await pool.query<PipelineRun>(
    `UPDATE pipeline_runs SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    vals
  );
  return rows[0] || null;
}

export async function incrementRunCost(
  pool: Pool,
  id: string,
  additionalCost: number
): Promise<void> {
  await pool.query(
    'UPDATE pipeline_runs SET cost = cost + $1 WHERE id = $2',
    [additionalCost, id]
  );
}

// ── Stage Results ──

export async function createStageResult(
  pool: Pool,
  runId: string,
  stageId: string,
  maxAttempts: number,
  agentModel: string | null
): Promise<StageResult> {
  // Get current attempt count for this run+stage
  const { rows: existing } = await pool.query<{ cnt: string }>(
    'SELECT COUNT(*)::text as cnt FROM stage_results WHERE run_id = $1 AND stage_id = $2',
    [runId, stageId]
  );
  const attempt = parseInt(existing[0]?.cnt || '0', 10) + 1;

  const { rows } = await pool.query<StageResult>(
    `INSERT INTO stage_results (run_id, stage_id, status, attempt, max_attempts, agent_model, started_at)
     VALUES ($1, $2, 'running', $3, $4, $5, now())
     RETURNING *`,
    [runId, stageId, attempt, maxAttempts, agentModel]
  );
  return rows[0]!;
}

export async function completeStageResult(
  pool: Pool,
  stageResultId: string,
  status: 'success' | 'fail',
  cost: number,
  resultData: Record<string, unknown> | null
): Promise<StageResult | null> {
  const { rows } = await pool.query<StageResult>(
    `UPDATE stage_results
     SET status = $1, cost = $2, result_data = $3, completed_at = now()
     WHERE id = $4 RETURNING *`,
    [status, cost, resultData ? JSON.stringify(resultData) : null, stageResultId]
  );
  return rows[0] || null;
}

export async function getStageResults(pool: Pool, runId: string): Promise<StageResult[]> {
  const { rows } = await pool.query<StageResult>(
    'SELECT * FROM stage_results WHERE run_id = $1 ORDER BY created_at ASC',
    [runId]
  );
  return rows;
}

// ── Artifacts ──

export async function createArtifact(
  pool: Pool,
  runId: string,
  name: string,
  type: string,
  content: string | null,
  metadata?: Record<string, unknown>
): Promise<Artifact> {
  const { rows } = await pool.query<Artifact>(
    `INSERT INTO artifacts (run_id, name, type, content, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [runId, name, type, content, metadata ? JSON.stringify(metadata) : null]
  );
  return rows[0]!;
}

export async function getArtifacts(pool: Pool, runId: string): Promise<Artifact[]> {
  const { rows } = await pool.query<Artifact>(
    'SELECT * FROM artifacts WHERE run_id = $1 ORDER BY created_at ASC',
    [runId]
  );
  return rows;
}

// ── Worker Tasks ──

export async function createWorkerTask(
  pool: Pool,
  runId: string,
  stageId: string,
  agentPrompt: string,
  context: Record<string, unknown> | null,
  clientId?: string | null,
): Promise<WorkerTask> {
  const { rows } = await pool.query<WorkerTask>(
    `INSERT INTO worker_tasks (run_id, client_id, stage_id, agent_prompt, context)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [runId, clientId || null, stageId, agentPrompt, context ? JSON.stringify(context) : null]
  );
  return rows[0]!;
}

/**
 * Claim the next pending task. Optionally filter by client_id.
 * - clientId provided: only claim tasks for that client (CLI dedicated workers)
 * - clientId null/undefined: claim any pending task (shared workers)
 */
export async function claimNextTask(pool: Pool, clientId?: string | null): Promise<WorkerTask | null> {
  if (clientId) {
    // Dedicated worker: only claim tasks for this client
    const { rows } = await pool.query<WorkerTask>(
      `UPDATE worker_tasks
       SET status = 'claimed', claimed_at = now()
       WHERE id = (
         SELECT id FROM worker_tasks
         WHERE status = 'pending' AND client_id = $1
         ORDER BY created_at ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED
       )
       RETURNING *`,
      [clientId],
    );
    return rows[0] || null;
  }

  // Shared worker: claim any pending task
  const { rows } = await pool.query<WorkerTask>(
    `UPDATE worker_tasks
     SET status = 'claimed', claimed_at = now()
     WHERE id = (
       SELECT id FROM worker_tasks
       WHERE status = 'pending'
       ORDER BY created_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING *`,
  );
  return rows[0] || null;
}

export async function completeWorkerTask(
  pool: Pool,
  payload: CompletedTaskPayload
): Promise<WorkerTask | null> {
  const status = payload.success ? 'completed' : 'failed';
  const { rows } = await pool.query<WorkerTask>(
    `UPDATE worker_tasks
     SET status = $1, result = $2, completed_at = now()
     WHERE id = $3 RETURNING *`,
    [status, JSON.stringify(payload.result), payload.taskId]
  );
  return rows[0] || null;
}

export async function getWorkerTask(pool: Pool, taskId: string): Promise<WorkerTask | null> {
  const { rows } = await pool.query<WorkerTask>(
    'SELECT * FROM worker_tasks WHERE id = $1',
    [taskId]
  );
  return rows[0] || null;
}

// ── Stale Task Recovery ──

/** Reset tasks stuck in 'claimed' status for >30 minutes back to 'pending'.
 *  Called on server startup to recover from worker crashes. */
export async function recoverStaleTasks(pool: Pool): Promise<number> {
  const { rowCount } = await pool.query(
    `UPDATE worker_tasks
     SET status = 'pending', claimed_at = NULL
     WHERE status = 'claimed'
     AND claimed_at < NOW() - INTERVAL '30 minutes'`
  );
  return rowCount ?? 0;
}

// ── Admin / Usage ──

export async function getUsageStats(pool: Pool): Promise<AdminUsage> {
  const { rows } = await pool.query<{
    total_runs: string;
    completed_runs: string;
    total_cost: string;
  }>(
    `SELECT
       COUNT(*)::text AS total_runs,
       COUNT(*) FILTER (WHERE status = 'completed')::text AS completed_runs,
       COALESCE(SUM(cost), 0)::text AS total_cost
     FROM pipeline_runs`
  );

  const r = rows[0];
  const totalRuns = parseInt(r?.total_runs || '0', 10);
  const completedRuns = parseInt(r?.completed_runs || '0', 10);
  const totalCost = parseFloat(r?.total_cost || '0');

  return {
    totalRuns,
    completedRuns,
    totalCost,
    avgCostPerRun: completedRuns > 0 ? totalCost / completedRuns : 0,
  };
}

// ── Worker Heartbeat (in-memory for MVP, DB for production) ──

let lastHeartbeat: { timestamp: string; workerId: string; currentTaskId?: string } | null = null;

export function recordHeartbeat(workerId: string, currentTaskId?: string): void {
  lastHeartbeat = {
    timestamp: new Date().toISOString(),
    workerId,
    currentTaskId,
  };
}

export function getLastHeartbeat() {
  return lastHeartbeat;
}

export function isWorkerConnected(): boolean {
  if (!lastHeartbeat) return false;
  const elapsed = Date.now() - new Date(lastHeartbeat.timestamp).getTime();
  // Consider disconnected if no heartbeat in 60s (2x the 30s interval)
  return elapsed < 60000;
}

// ── Worker Lifecycle Command Channel (in-memory for MVP, Redis/DB for production) ──

let pendingWorkerCommand: { command: 'stop' | 'restart'; requestedAt: string } | null = null;
let spawnedWorkerPid: number | null = null;

export function setPendingWorkerCommand(cmd: 'stop' | 'restart'): void {
  pendingWorkerCommand = { command: cmd, requestedAt: new Date().toISOString() };
}

export function consumePendingWorkerCommand(): { command: string } | null {
  const cmd = pendingWorkerCommand;
  pendingWorkerCommand = null;
  return cmd;
}

export function setSpawnedWorkerPid(pid: number | null): void {
  spawnedWorkerPid = pid;
}

export function getSpawnedWorkerPid(): number | null {
  return spawnedWorkerPid;
}

// ── Pipeline Definitions (per-client) ──

export interface PipelineDefinitionRow {
  id: string;
  client_id: string | null;
  definition: Record<string, unknown>;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get pipeline definition for a client, falling back to default (NULL client_id).
 * Returns null if no definition exists at all.
 */
export async function getClientPipelineDefinition(
  pool: Pool,
  clientId: string | null | undefined,
): Promise<{ definition: Record<string, unknown>; version: number; isDefault: boolean } | null> {
  // Try client-specific first
  if (clientId) {
    const { rows } = await pool.query<PipelineDefinitionRow>(
      'SELECT definition, version FROM pipeline_definitions WHERE client_id = $1',
      [clientId],
    );
    if (rows[0]) {
      return { definition: rows[0].definition, version: rows[0].version, isDefault: false };
    }
  }

  // Fall back to default (client_id IS NULL)
  const { rows } = await pool.query<PipelineDefinitionRow>(
    'SELECT definition, version FROM pipeline_definitions WHERE client_id IS NULL',
  );
  if (rows[0]) {
    return { definition: rows[0].definition, version: rows[0].version, isDefault: true };
  }

  return null;
}

/**
 * Save pipeline definition for a client (or default if clientId is null).
 * Uses optimistic concurrency — fails with null if version doesn't match.
 */
export async function saveClientPipelineDefinition(
  pool: Pool,
  clientId: string | null,
  definition: Record<string, unknown>,
  expectedVersion: number,
  createdBy: string,
): Promise<{ version: number } | null> {
  // Upsert with version check
  if (expectedVersion === 0) {
    // New row (no existing definition)
    const { rows } = await pool.query<{ version: number }>(
      `INSERT INTO pipeline_definitions (client_id, definition, version, created_by)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT (client_id) DO NOTHING
       RETURNING version`,
      [clientId, JSON.stringify(definition), createdBy],
    );
    if (rows[0]) return { version: rows[0].version };
    // Conflict: row already exists — caller should retry with GET to get current version
    return null;
  }

  // Update existing with optimistic concurrency
  const { rows } = await pool.query<{ version: number }>(
    `UPDATE pipeline_definitions
     SET definition = $1, version = version + 1, created_by = $2, updated_at = now()
     WHERE client_id IS NOT DISTINCT FROM $3 AND version = $4
     RETURNING version`,
    [JSON.stringify(definition), createdBy, clientId, expectedVersion],
  );
  return rows[0] ? { version: rows[0].version } : null;
}

/**
 * Clone the default pipeline definition to a specific client.
 */
export async function cloneDefaultToClient(
  pool: Pool,
  clientId: string,
  createdBy: string,
): Promise<{ version: number } | null> {
  const { rows } = await pool.query<{ version: number }>(
    `INSERT INTO pipeline_definitions (client_id, definition, version, created_by)
     SELECT $1, definition, 1, $2
     FROM pipeline_definitions WHERE client_id IS NULL
     ON CONFLICT (client_id) DO NOTHING
     RETURNING version`,
    [clientId, createdBy],
  );
  return rows[0] ? { version: rows[0].version } : null;
}

/**
 * Delete a client's custom pipeline definition (reverts to default).
 */
export async function deleteClientPipelineDefinition(
  pool: Pool,
  clientId: string,
): Promise<boolean> {
  const { rowCount } = await pool.query(
    'DELETE FROM pipeline_definitions WHERE client_id = $1',
    [clientId],
  );
  return (rowCount ?? 0) > 0;
}

/**
 * Seed the default pipeline definition from a JSON object (if not already present).
 */
export async function seedDefaultPipelineDefinition(
  pool: Pool,
  definition: Record<string, unknown>,
): Promise<void> {
  await pool.query(
    `INSERT INTO pipeline_definitions (client_id, definition, version, created_by)
     VALUES (NULL, $1, 1, 'system-seed')
     ON CONFLICT (client_id) DO NOTHING`,
    [JSON.stringify(definition)],
  );
}
