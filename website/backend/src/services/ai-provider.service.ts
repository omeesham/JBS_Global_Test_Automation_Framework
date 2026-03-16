/**
 * AI Provider Service — Multi-tenant, dual-mode (CLI + API) configuration.
 *
 * Named "ai-provider" not "claude" — client secrecy extends to code.
 * Manages per-client AI execution config, API key encryption, worker registry,
 * usage tracking, budget enforcement, and health checks.
 */
import pool from '../db.js';
import { encryptAtRest, decryptAtRest, apiKeyHint } from '../utils/crypto-aes.js';

// ── Types ──

export type ExecutionMode = 'cli' | 'api' | 'cli_with_api_overflow';
export type CliAuthStatus = 'not_configured' | 'authenticated' | 'expired' | 'rate_limited' | 'offline';
export type ApiStatus = 'not_configured' | 'valid' | 'invalid' | 'expired';
export type WorkerType = 'cli_dedicated' | 'api_shared';
export type WorkerStatus = 'offline' | 'online' | 'busy' | 'error';

export interface AiProviderConfig {
  id: string;
  clientId: string;
  executionMode: ExecutionMode;
  // CLI
  cliWorkerId: string | null;
  cliAccountEmail: string | null;
  cliAuthStatus: CliAuthStatus;
  cliConfigPath: string | null;
  // API (key never exposed — hint only)
  apiKeyHint: string | null;
  apiStatus: ApiStatus;
  apiMonthlyBudgetUsd: number | null;
  apiCurrentMonthUsd: number;
  // General
  preferredModel: string;
  maxConcurrentTasks: number;
  configuredBy: string | null;
  lastHealthCheck: string | null;
  healthError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerInfo {
  id: string;
  workerId: string;
  clientId: string | null;
  workerType: WorkerType;
  status: WorkerStatus;
  lastHeartbeat: string | null;
  hostInfo: Record<string, unknown> | null;
  config: Record<string, unknown> | null;
  createdAt: string;
}

export interface UsageEntry {
  clientId: string;
  source: string;
  executionMode: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  rateLimited: boolean;
  createdAt: string;
}

export interface UsageSummary {
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  bySource: Record<string, { cost: number; count: number }>;
  byModel: Record<string, { cost: number; count: number }>;
  rateLimitedCount: number;
}

export interface ResolvedExecution {
  mode: 'cli' | 'api';
  apiKey?: string;
  workerId?: string;
  model: string;
}

// ── Row-to-DTO mapper ──

function mapConfigRow(row: any): AiProviderConfig {
  return {
    id: row.id,
    clientId: row.client_id,
    executionMode: row.execution_mode,
    cliWorkerId: row.cli_worker_id,
    cliAccountEmail: row.cli_account_email,
    cliAuthStatus: row.cli_auth_status,
    cliConfigPath: row.cli_config_path,
    apiKeyHint: row.api_key_hint,
    apiStatus: row.api_status,
    apiMonthlyBudgetUsd: row.api_monthly_budget_usd ? Number(row.api_monthly_budget_usd) : null,
    apiCurrentMonthUsd: Number(row.api_current_month_usd || 0),
    preferredModel: row.preferred_model,
    maxConcurrentTasks: row.max_concurrent_tasks,
    configuredBy: row.configured_by,
    lastHealthCheck: row.last_health_check,
    healthError: row.health_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWorkerRow(row: any): WorkerInfo {
  return {
    id: row.id,
    workerId: row.worker_id,
    clientId: row.client_id,
    workerType: row.worker_type,
    status: row.status,
    lastHeartbeat: row.last_heartbeat,
    hostInfo: row.host_info,
    config: row.config,
    createdAt: row.created_at,
  };
}

// ── Configuration CRUD ──

export async function saveConfig(
  clientId: string,
  mode: ExecutionMode,
  cliConfig?: { workerId?: string; accountEmail?: string; configPath?: string },
  apiConfig?: { apiKey?: string; monthlyBudget?: number },
  configuredBy?: string,
): Promise<AiProviderConfig> {
  let apiKeyEnc: string | null = null;
  let hint: string | null = null;

  if (apiConfig?.apiKey) {
    apiKeyEnc = encryptAtRest(apiConfig.apiKey);
    hint = apiKeyHint(apiConfig.apiKey);
  }

  const { rows } = await pool.query(
    `INSERT INTO "JBSTestOpsAI".ai_provider_config
       (client_id, execution_mode, cli_worker_id, cli_account_email, cli_config_path,
        api_key_enc, api_key_hint, api_monthly_budget_usd, configured_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (client_id) DO UPDATE SET
       execution_mode = EXCLUDED.execution_mode,
       cli_worker_id = COALESCE(EXCLUDED.cli_worker_id, "JBSTestOpsAI".ai_provider_config.cli_worker_id),
       cli_account_email = COALESCE(EXCLUDED.cli_account_email, "JBSTestOpsAI".ai_provider_config.cli_account_email),
       cli_config_path = COALESCE(EXCLUDED.cli_config_path, "JBSTestOpsAI".ai_provider_config.cli_config_path),
       api_key_enc = COALESCE(EXCLUDED.api_key_enc, "JBSTestOpsAI".ai_provider_config.api_key_enc),
       api_key_hint = COALESCE(EXCLUDED.api_key_hint, "JBSTestOpsAI".ai_provider_config.api_key_hint),
       api_monthly_budget_usd = COALESCE(EXCLUDED.api_monthly_budget_usd, "JBSTestOpsAI".ai_provider_config.api_monthly_budget_usd),
       configured_by = EXCLUDED.configured_by,
       updated_at = NOW()
     RETURNING *`,
    [
      clientId,
      mode,
      cliConfig?.workerId || null,
      cliConfig?.accountEmail || null,
      cliConfig?.configPath || null,
      apiKeyEnc,
      hint,
      apiConfig?.monthlyBudget || null,
      configuredBy || null,
    ],
  );
  return mapConfigRow(rows[0]);
}

export async function getConfig(clientId: string): Promise<AiProviderConfig | null> {
  const { rows } = await pool.query(
    'SELECT * FROM "JBSTestOpsAI".ai_provider_config WHERE client_id = $1',
    [clientId],
  );
  return rows[0] ? mapConfigRow(rows[0]) : null;
}

export async function getAllConfigs(): Promise<AiProviderConfig[]> {
  const { rows } = await pool.query(
    `SELECT c.name as client_name, c.slug as client_slug, apc.*
     FROM "JBSTestOpsAI".ai_provider_config apc
     JOIN "JBSTestOpsAI".clients c ON c.id = apc.client_id
     ORDER BY c.name`,
  );
  return rows.map((r: any) => ({
    ...mapConfigRow(r),
    clientName: r.client_name,
    clientSlug: r.client_slug,
  }));
}

export async function updateConfig(
  clientId: string,
  updates: Partial<{
    executionMode: ExecutionMode;
    cliWorkerId: string;
    cliAccountEmail: string;
    cliAuthStatus: CliAuthStatus;
    cliConfigPath: string;
    apiStatus: ApiStatus;
    apiMonthlyBudgetUsd: number;
    preferredModel: string;
    maxConcurrentTasks: number;
    healthError: string | null;
  }>,
): Promise<AiProviderConfig | null> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, string> = {
    executionMode: 'execution_mode',
    cliWorkerId: 'cli_worker_id',
    cliAccountEmail: 'cli_account_email',
    cliAuthStatus: 'cli_auth_status',
    cliConfigPath: 'cli_config_path',
    apiStatus: 'api_status',
    apiMonthlyBudgetUsd: 'api_monthly_budget_usd',
    preferredModel: 'preferred_model',
    maxConcurrentTasks: 'max_concurrent_tasks',
    healthError: 'health_error',
  };

  for (const [key, dbCol] of Object.entries(fieldMap)) {
    if ((updates as any)[key] !== undefined) {
      sets.push(`${dbCol} = $${idx++}`);
      vals.push((updates as any)[key]);
    }
  }

  if (sets.length === 0) return getConfig(clientId);

  sets.push('updated_at = NOW()');
  vals.push(clientId);

  const { rows } = await pool.query(
    `UPDATE "JBSTestOpsAI".ai_provider_config SET ${sets.join(', ')} WHERE client_id = $${idx} RETURNING *`,
    vals,
  );
  return rows[0] ? mapConfigRow(rows[0]) : null;
}

export async function deleteConfig(clientId: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    'DELETE FROM "JBSTestOpsAI".ai_provider_config WHERE client_id = $1',
    [clientId],
  );
  return (rowCount ?? 0) > 0;
}

// ── API Key Management ──

export async function saveApiKey(clientId: string, apiKey: string): Promise<{ hint: string }> {
  const encrypted = encryptAtRest(apiKey);
  const hint = apiKeyHint(apiKey);

  await pool.query(
    `UPDATE "JBSTestOpsAI".ai_provider_config
     SET api_key_enc = $1, api_key_hint = $2, api_status = 'valid', updated_at = NOW()
     WHERE client_id = $3`,
    [encrypted, hint, clientId],
  );

  return { hint };
}

export async function getApiKeyForClient(clientId: string): Promise<string | null> {
  const { rows } = await pool.query(
    'SELECT api_key_enc FROM "JBSTestOpsAI".ai_provider_config WHERE client_id = $1',
    [clientId],
  );
  if (!rows[0]?.api_key_enc) return null;
  return decryptAtRest(rows[0].api_key_enc);
}

export async function validateApiKey(clientId: string): Promise<{ valid: boolean; error?: string }> {
  const apiKey = await getApiKeyForClient(clientId);
  if (!apiKey) return { valid: false, error: 'No API key configured' };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Reply OK' }],
      }),
    });

    if (res.ok) {
      await updateConfig(clientId, { apiStatus: 'valid' });
      return { valid: true };
    }

    const errBody = await res.json().catch(() => ({})) as any;
    const errMsg = errBody?.error?.message || `HTTP ${res.status}`;
    await updateConfig(clientId, { apiStatus: 'invalid' });
    return { valid: false, error: errMsg };
  } catch (err) {
    const msg = (err as Error).message;
    await updateConfig(clientId, { apiStatus: 'invalid' });
    return { valid: false, error: msg };
  }
}

// ── Worker Registry ──

export async function registerWorker(
  workerId: string,
  clientId: string | null,
  type: WorkerType,
  hostInfo?: Record<string, unknown>,
): Promise<WorkerInfo> {
  const { rows } = await pool.query(
    `INSERT INTO "JBSTestOpsAI".worker_registry (worker_id, client_id, worker_type, status, last_heartbeat, host_info)
     VALUES ($1, $2, $3, 'online', NOW(), $4)
     ON CONFLICT (worker_id) DO UPDATE SET
       status = 'online',
       last_heartbeat = NOW(),
       host_info = COALESCE(EXCLUDED.host_info, "JBSTestOpsAI".worker_registry.host_info)
     RETURNING *`,
    [workerId, clientId, type, hostInfo ? JSON.stringify(hostInfo) : null],
  );
  return mapWorkerRow(rows[0]);
}

export async function updateWorkerStatus(workerId: string, status: WorkerStatus): Promise<void> {
  await pool.query(
    `UPDATE "JBSTestOpsAI".worker_registry SET status = $1, last_heartbeat = NOW() WHERE worker_id = $2`,
    [status, workerId],
  );
}

export async function updateWorkerHeartbeat(workerId: string): Promise<void> {
  await pool.query(
    `UPDATE "JBSTestOpsAI".worker_registry SET last_heartbeat = NOW() WHERE worker_id = $1`,
    [workerId],
  );
}

export async function getWorkerForClient(clientId: string): Promise<WorkerInfo | null> {
  const { rows } = await pool.query(
    `SELECT * FROM "JBSTestOpsAI".worker_registry WHERE client_id = $1 AND worker_type = 'cli_dedicated' ORDER BY last_heartbeat DESC LIMIT 1`,
    [clientId],
  );
  return rows[0] ? mapWorkerRow(rows[0]) : null;
}

export async function getAllWorkers(): Promise<WorkerInfo[]> {
  const { rows } = await pool.query(
    'SELECT * FROM "JBSTestOpsAI".worker_registry ORDER BY last_heartbeat DESC',
  );
  return rows.map(mapWorkerRow);
}

// ── Execution Routing ──

export async function resolveExecutionMethod(clientId: string): Promise<ResolvedExecution | null> {
  const config = await getConfig(clientId);
  if (!config) return null;

  if (config.executionMode === 'api' || config.executionMode === 'cli_with_api_overflow') {
    // Need API key
    const apiKey = await getApiKeyForClient(clientId);
    if (config.executionMode === 'api') {
      if (!apiKey) return null; // Can't execute without API key
      return { mode: 'api', apiKey, model: config.preferredModel };
    }
    // cli_with_api_overflow — CLI primary, API fallback
    return {
      mode: 'cli',
      apiKey: apiKey || undefined,
      workerId: config.cliWorkerId || undefined,
      model: config.preferredModel,
    };
  }

  // cli mode
  return {
    mode: 'cli',
    workerId: config.cliWorkerId || undefined,
    model: config.preferredModel,
  };
}

export async function handleRateLimit(clientId: string): Promise<{ overflow: boolean; apiKey?: string }> {
  const config = await getConfig(clientId);
  if (!config) return { overflow: false };

  // Update CLI status
  await updateConfig(clientId, { cliAuthStatus: 'rate_limited' });

  if (config.executionMode === 'cli_with_api_overflow') {
    const apiKey = await getApiKeyForClient(clientId);
    if (apiKey) return { overflow: true, apiKey };
  }

  return { overflow: false };
}

// ── Usage Tracking ──

export async function recordUsage(
  clientId: string,
  source: string,
  executionMode: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  costUsd: number,
  rateLimited = false,
  workerId?: string,
  sourceId?: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO "JBSTestOpsAI".ai_usage_log
       (client_id, worker_id, source, source_id, execution_mode, model, input_tokens, output_tokens, cost_usd, rate_limited)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [clientId, workerId || null, source, sourceId || null, executionMode, model, inputTokens, outputTokens, costUsd, rateLimited],
  );

  // Update monthly budget tracker
  if (executionMode === 'api' && costUsd > 0) {
    await pool.query(
      `UPDATE "JBSTestOpsAI".ai_provider_config
       SET api_current_month_usd = api_current_month_usd + $1, updated_at = NOW()
       WHERE client_id = $2`,
      [costUsd, clientId],
    );
  }
}

export async function getUsageSummary(clientId: string, days = 30): Promise<UsageSummary> {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(SUM(cost_usd), 0)::text AS total_cost,
       COALESCE(SUM(input_tokens), 0)::text AS total_input,
       COALESCE(SUM(output_tokens), 0)::text AS total_output,
       COUNT(*) FILTER (WHERE rate_limited) AS rate_limited_count,
       source,
       model,
       COUNT(*) AS entry_count,
       COALESCE(SUM(cost_usd), 0)::text AS group_cost
     FROM "JBSTestOpsAI".ai_usage_log
     WHERE client_id = $1 AND created_at >= NOW() - ($2 || ' days')::interval
     GROUP BY GROUPING SETS ((source), (model), ())`,
    [clientId, days],
  );

  const summary: UsageSummary = {
    totalCostUsd: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    bySource: {},
    byModel: {},
    rateLimitedCount: 0,
  };

  for (const row of rows) {
    if (!row.source && !row.model) {
      // Grand total row
      summary.totalCostUsd = parseFloat(row.total_cost);
      summary.totalInputTokens = parseInt(row.total_input, 10);
      summary.totalOutputTokens = parseInt(row.total_output, 10);
      summary.rateLimitedCount = parseInt(row.rate_limited_count, 10);
    } else if (row.source) {
      summary.bySource[row.source] = {
        cost: parseFloat(row.group_cost),
        count: parseInt(row.entry_count, 10),
      };
    } else if (row.model) {
      summary.byModel[row.model] = {
        cost: parseFloat(row.group_cost),
        count: parseInt(row.entry_count, 10),
      };
    }
  }

  return summary;
}

/** Reset monthly budget counter if the month has rolled over (lazy — no cron needed). */
async function resetMonthlyBudgetIfNeeded(clientId: string): Promise<void> {
  await pool.query(
    `UPDATE "JBSTestOpsAI".ai_provider_config
     SET api_current_month_usd = 0, updated_at = NOW()
     WHERE client_id = $1
       AND api_current_month_usd > 0
       AND DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', NOW())`,
    [clientId],
  );
}

export async function checkBudget(clientId: string): Promise<{ allowed: boolean; remaining: number | null; mode: ExecutionMode }> {
  await resetMonthlyBudgetIfNeeded(clientId);
  const config = await getConfig(clientId);
  if (!config) return { allowed: false, remaining: null, mode: 'cli' };

  // CLI mode has no API budget
  if (config.executionMode === 'cli') {
    return { allowed: true, remaining: null, mode: 'cli' };
  }

  // API budget check
  if (config.apiMonthlyBudgetUsd === null) {
    return { allowed: true, remaining: null, mode: config.executionMode };
  }

  const remaining = config.apiMonthlyBudgetUsd - config.apiCurrentMonthUsd;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    mode: config.executionMode,
  };
}

// ── CLI Validation ──

/** Validate CLI worker status by checking heartbeat recency. */
export async function validateCli(clientId: string): Promise<{ valid: boolean; status: string; error?: string }> {
  const config = await getConfig(clientId);
  if (!config) return { valid: false, status: 'not_configured', error: 'No AI config for this client' };
  if (!config.cliWorkerId) return { valid: false, status: 'not_configured', error: 'No CLI worker assigned' };

  const worker = await getWorkerForClient(clientId);
  if (!worker) return { valid: false, status: 'offline', error: 'CLI worker not registered' };

  const elapsed = worker.lastHeartbeat
    ? Date.now() - new Date(worker.lastHeartbeat).getTime()
    : Infinity;

  if (elapsed < 90_000) {
    return { valid: true, status: 'authenticated' };
  }

  return { valid: false, status: 'offline', error: `Worker last heartbeat ${Math.round(elapsed / 1000)}s ago` };
}

// ── Worker Heartbeat History ──

/** Get all workers with their heartbeat status. */
export async function getWorkerHeartbeats(): Promise<Array<{ workerId: string; clientId: string | null; status: string; lastHeartbeat: string | null; stale: boolean }>> {
  const { rows } = await pool.query(
    `SELECT worker_id, client_id, status, last_heartbeat
     FROM "JBSTestOpsAI".worker_registry
     ORDER BY last_heartbeat DESC`,
  );
  return rows.map((r: any) => ({
    workerId: r.worker_id,
    clientId: r.client_id,
    status: r.status,
    lastHeartbeat: r.last_heartbeat,
    stale: r.last_heartbeat ? (Date.now() - new Date(r.last_heartbeat).getTime()) > 90_000 : true,
  }));
}

// ── Health Checks ──

export async function runHealthCheck(clientId: string): Promise<{ cli: string; api: string }> {
  const config = await getConfig(clientId);
  if (!config) return { cli: 'not_configured', api: 'not_configured' };

  const result = { cli: config.cliAuthStatus, api: config.apiStatus as string };

  // Check CLI worker heartbeat
  if (config.cliWorkerId) {
    const worker = await getWorkerForClient(clientId);
    if (worker) {
      const elapsed = worker.lastHeartbeat
        ? Date.now() - new Date(worker.lastHeartbeat).getTime()
        : Infinity;
      result.cli = elapsed < 90000 ? 'authenticated' : 'offline';
    } else {
      result.cli = 'offline';
    }
  }

  // Check API key validity
  if (config.apiKeyHint) {
    const validation = await validateApiKey(clientId);
    result.api = validation.valid ? 'valid' : 'invalid';
  }

  // Persist health check result
  await pool.query(
    `UPDATE "JBSTestOpsAI".ai_provider_config
     SET last_health_check = NOW(), health_error = NULL, cli_auth_status = $1, api_status = $2, updated_at = NOW()
     WHERE client_id = $3`,
    [result.cli, result.api, clientId],
  );

  return result;
}
