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
  Page,
  PageStageStatus,
  PageWithStages,
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

export async function getArtifactsByPageId(pool: Pool, pageId: string): Promise<Artifact[]> {
  const { rows } = await pool.query<Artifact>(
    `SELECT a.* FROM artifacts a
     JOIN pipeline_runs pr ON a.run_id = pr.id
     WHERE pr.page_id = $1
     AND (a.metadata IS NULL OR NOT (a.metadata ? 'deleted'))
     ORDER BY a.created_at ASC`,
    [pageId]
  );
  return rows;
}

export async function createArtifactDirect(
  pool: Pool,
  runId: string,
  name: string,
  type: string,
  content: string | null,
  pageId?: string | null,
  metadata?: Record<string, unknown>
): Promise<Artifact> {
  const { rows } = await pool.query<Artifact>(
    `INSERT INTO artifacts (run_id, name, type, content, page_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [runId, name, type, content, pageId || null, metadata ? JSON.stringify(metadata) : null]
  );
  return rows[0]!;
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
     WHERE id IN (
       SELECT id FROM worker_tasks
       WHERE status = 'claimed'
       AND claimed_at < NOW() - INTERVAL '30 minutes'
       LIMIT 100
     )`
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

// ── Pages (Plan 53B) ──

export async function createPage(
  pool: Pool,
  data: { client_id?: string | null; module: string; page_slug: string; display_name: string; target_url?: string | null; parent_page_id?: string | null; depth?: number; sort_order?: number; metadata?: Record<string, unknown> | null }
): Promise<Page> {
  const { rows } = await pool.query<Page>(
    `INSERT INTO pages (client_id, module, page_slug, display_name, target_url, parent_page_id, depth, sort_order, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [data.client_id || null, data.module, data.page_slug, data.display_name, data.target_url || null, data.parent_page_id || null, data.depth ?? 0, data.sort_order ?? 0, data.metadata ? JSON.stringify(data.metadata) : null]
  );
  return rows[0]!;
}

export async function getPage(pool: Pool, id: string): Promise<Page | null> {
  const { rows } = await pool.query<Page>('SELECT * FROM pages WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getPageBySlug(pool: Pool, clientId: string | null, module: string, slug: string): Promise<Page | null> {
  const { rows } = await pool.query<Page>(
    'SELECT * FROM pages WHERE client_id IS NOT DISTINCT FROM $1 AND module = $2 AND page_slug = $3',
    [clientId, module, slug]
  );
  return rows[0] || null;
}

export async function listPages(pool: Pool, clientId?: string | null): Promise<PageWithStages[]> {
  const whereClause = clientId ? 'WHERE p.client_id = $1' : '';
  const params = clientId ? [clientId] : [];
  const { rows } = await pool.query<Page & { stages_json: string }>(
    `SELECT p.*, COALESCE(
       json_agg(json_build_object(
         'id', pss.id, 'page_id', pss.page_id, 'stage_id', pss.stage_id,
         'status', pss.status, 'active_run_id', pss.active_run_id,
         'last_run_id', pss.last_run_id, 'last_completed_at', pss.last_completed_at,
         'artifact_summary', pss.artifact_summary, 'approved_by', pss.approved_by,
         'approved_at', pss.approved_at, 'explore_without_reqs', pss.explore_without_reqs,
         'explore_permitted_by', pss.explore_permitted_by,
         'created_at', pss.created_at, 'updated_at', pss.updated_at
       )) FILTER (WHERE pss.id IS NOT NULL), '[]'
     )::text AS stages_json
     FROM pages p
     LEFT JOIN page_stage_status pss ON pss.page_id = p.id
     ${whereClause}
     GROUP BY p.id
     ORDER BY p.sort_order ASC, p.display_name ASC`,
    params
  );
  return rows.map(r => {
    const { stages_json, ...page } = r;
    return { ...page, stages: JSON.parse(stages_json) } as PageWithStages;
  });
}

export async function getPageTree(pool: Pool, clientId?: string | null): Promise<Page[]> {
  const whereClause = clientId ? 'WHERE client_id = $1' : '';
  const params = clientId ? [clientId] : [];
  const { rows } = await pool.query<Page>(
    `WITH RECURSIVE tree AS (
       SELECT *, 0 AS tree_depth FROM pages ${whereClause} AND parent_page_id IS NULL
       UNION ALL
       SELECT p.*, t.tree_depth + 1
       FROM pages p JOIN tree t ON p.parent_page_id = t.id
     )
     SELECT * FROM tree ORDER BY tree_depth, sort_order, display_name`,
    params
  );
  return rows;
}

export async function updatePage(pool: Pool, id: string, data: Partial<Pick<Page, 'display_name' | 'target_url' | 'metadata' | 'sort_order'>>): Promise<Page | null> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;
  if (data.display_name !== undefined) { sets.push(`display_name = $${idx++}`); vals.push(data.display_name); }
  if (data.target_url !== undefined) { sets.push(`target_url = $${idx++}`); vals.push(data.target_url); }
  if (data.metadata !== undefined) { sets.push(`metadata = $${idx++}`); vals.push(JSON.stringify(data.metadata)); }
  if (data.sort_order !== undefined) { sets.push(`sort_order = $${idx++}`); vals.push(data.sort_order); }
  if (sets.length === 0) return getPage(pool, id);
  vals.push(id);
  const { rows } = await pool.query<Page>(`UPDATE pages SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
  return rows[0] || null;
}

export async function deletePage(pool: Pool, id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM pages WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

// ── Page Stage Status (Plan 53B) ──

export async function upsertPageStageStatus(
  pool: Pool,
  pageId: string,
  stageId: string,
  patch: Partial<Pick<PageStageStatus, 'status' | 'active_run_id' | 'last_run_id' | 'last_completed_at' | 'artifact_summary' | 'approved_by' | 'approved_at' | 'explore_without_reqs' | 'explore_permitted_by'>>
): Promise<PageStageStatus> {
  const { rows } = await pool.query<PageStageStatus>(
    `INSERT INTO page_stage_status (page_id, stage_id, status, active_run_id, last_run_id, last_completed_at, artifact_summary, approved_by, approved_at, explore_without_reqs, explore_permitted_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (page_id, stage_id) DO UPDATE SET
       status = COALESCE($3, page_stage_status.status),
       active_run_id = COALESCE($4, page_stage_status.active_run_id),
       last_run_id = COALESCE($5, page_stage_status.last_run_id),
       last_completed_at = COALESCE($6, page_stage_status.last_completed_at),
       artifact_summary = COALESCE($7, page_stage_status.artifact_summary),
       approved_by = COALESCE($8, page_stage_status.approved_by),
       approved_at = COALESCE($9, page_stage_status.approved_at),
       explore_without_reqs = COALESCE($10, page_stage_status.explore_without_reqs),
       explore_permitted_by = COALESCE($11, page_stage_status.explore_permitted_by)
     RETURNING *`,
    [pageId, stageId, patch.status || 'not_started', patch.active_run_id || null, patch.last_run_id || null, patch.last_completed_at || null, patch.artifact_summary ? JSON.stringify(patch.artifact_summary) : null, patch.approved_by || null, patch.approved_at || null, patch.explore_without_reqs ?? false, patch.explore_permitted_by || null]
  );
  return rows[0]!;
}

export async function getPageStageStatuses(pool: Pool, pageId: string): Promise<PageStageStatus[]> {
  const { rows } = await pool.query<PageStageStatus>(
    'SELECT * FROM page_stage_status WHERE page_id = $1 ORDER BY stage_id',
    [pageId]
  );
  return rows;
}

export async function checkPageConcurrency(pool: Pool, pageId: string, stageId: string): Promise<{ locked: boolean; activeRunId: string | null }> {
  const { rows } = await pool.query<{ active_run_id: string | null }>(
    'SELECT active_run_id FROM page_stage_status WHERE page_id = $1 AND stage_id = $2',
    [pageId, stageId]
  );
  const activeRunId = rows[0]?.active_run_id || null;
  return { locked: !!activeRunId, activeRunId };
}

// ── Versioned Artifact Operations (Plan 53B) ──

export async function updateArtifactVersioned(
  pool: Pool,
  artifactId: string,
  content: string,
  editedBy: string
): Promise<Artifact> {
  // Create new version, link old → new via replaced_by
  const { rows: [old] } = await pool.query<Artifact>('SELECT * FROM artifacts WHERE id = $1', [artifactId]);
  if (!old) throw new Error(`Artifact ${artifactId} not found`);

  const { rows: [newArtifact] } = await pool.query<Artifact>(
    `INSERT INTO artifacts (run_id, name, type, content, metadata, page_id, version, edited_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [old.run_id, old.name, old.type, content, old.metadata ? JSON.stringify(old.metadata) : null, old.page_id, (old.version || 1) + 1, editedBy]
  );

  // Link old to new
  await pool.query('UPDATE artifacts SET replaced_by = $1 WHERE id = $2', [newArtifact!.id, artifactId]);
  return newArtifact!;
}

// ── Fuzzy Page Search (Plan 53F) ──

export async function searchPages(pool: Pool, clientId: string | null, query: string): Promise<Page[]> {
  const pattern = `%${query}%`;
  const { rows } = await pool.query<Page>(
    `SELECT * FROM pages WHERE client_id IS NOT DISTINCT FROM $1
     AND (display_name ILIKE $2 OR page_slug ILIKE $2 OR target_url ILIKE $2)
     ORDER BY display_name ASC LIMIT 10`,
    [clientId, pattern]
  );
  return rows;
}

export async function findPageByUrl(pool: Pool, clientId: string | null, url: string): Promise<Page | null> {
  const { rows } = await pool.query<Page>(
    'SELECT * FROM pages WHERE client_id IS NOT DISTINCT FROM $1 AND target_url = $2',
    [clientId, url]
  );
  return rows[0] || null;
}

export async function softDeleteArtifact(pool: Pool, artifactId: string, deletedBy: string): Promise<boolean> {
  // Soft delete = mark with metadata flag (no physical delete)
  const { rowCount } = await pool.query(
    `UPDATE artifacts SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('deleted', true, 'deleted_by', $1, 'deleted_at', now()::text) WHERE id = $2`,
    [deletedBy, artifactId]
  );
  return (rowCount ?? 0) > 0;
}
