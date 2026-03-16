/**
 * Orchestrator types — shared contract between server, worker, and orchestrator.
 * Phase 0 MVP: single-tenant, no auth. Production fields (tenantId, etc.) are
 * optional now and become required in Phase 1.
 */

// ── Pipeline Definition Schema (mirrors config/pipeline-definition.json) ──

export interface StageDefinition {
  id: string;
  name: string;
  agent: string;
  agentFile: string;
  model: string;
  enabled: boolean;
  maxTurns: number;
  budgetCap: number;
  retries: number;
  timeoutSeconds: number;
  next: Record<string, string>;
  routing?: {
    condition: string;
    rules: Array<{ when: string; then: string }>;
  };
  preRunGate: string;
  postCompleteGate: string;
  description: string;
}

export interface ConvergenceGuardConfig {
  enabled: boolean;
  sameFindings: { enabled: boolean; action: string };
  notDecreasing: { enabled: boolean; windowSize: number; action: string };
  maxIterations: { enabled: boolean; limit: number; action: string };
  budgetExhausted: { enabled: boolean; action: string };
}

export interface PipelineDefinition {
  version: string;
  defaults: {
    model: string;
    maxTurnsPerStage: number;
    budgetPerRunUsd: number;
    budgetPerStageUsd: number;
    workerPollIntervalMs: number;
    workerHeartbeatIntervalMs: number;
    cliPath: string;
    cliOutputFormat: string;
    agentRunner: 'cli' | 'sdk';
    autoInvoke: boolean;
  };
  models: {
    available: string[];
    costPerMTokenInput: Record<string, number>;
    costPerMTokenOutput: Record<string, number>;
  };
  stages: StageDefinition[];
  terminalStates: string[];
  convergenceGuards: ConvergenceGuardConfig;
}

// ── Pipeline Run (DB row shape) ──

export type PipelineRunStatus = 'queued' | 'running' | 'completed' | 'fixme' | 'cancelled' | 'error';

export interface PipelineRun {
  id: string;
  client_id: string | null;
  feature: string;
  module: string;
  intent: string;
  target_url: string | null;
  stage: string;
  status: PipelineRunStatus;
  priority: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

// ── Stage Result (DB row shape) ──

export type StageStatus = 'pending' | 'running' | 'success' | 'fail' | 'skipped' | 'cancelled';

export interface StageResult {
  id: string;
  run_id: string;
  stage_id: string;
  status: StageStatus;
  attempt: number;
  max_attempts: number;
  agent_model: string | null;
  cost: number;
  result_data: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// ── Artifact (DB row shape) ──

export interface Artifact {
  id: string;
  run_id: string;
  name: string;
  type: string;
  content: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Worker Task (DB row shape — task queue) ──

export type WorkerTaskStatus = 'pending' | 'claimed' | 'completed' | 'failed';

export interface WorkerTask {
  id: string;
  run_id: string;
  client_id: string | null;
  stage_id: string;
  status: WorkerTaskStatus;
  agent_prompt: string;
  context: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  claimed_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// ── SSE Event Types ──
// visibility: 'public' events are sent to all connections; 'admin' events only to admin connections.
// Default (undefined) = 'public' for backwards compatibility.

export type SSEVisibility = 'public' | 'admin';

export type SSEEvent =
  | { type: 'stage_start'; runId: string; stage: string; agent: string; model: string; attempt: number; timestamp: string; visibility?: SSEVisibility }
  | { type: 'stage_complete'; runId: string; stage: string; result: 'success' | 'fail'; error?: string; cost: number; duration: number; timestamp: string; visibility?: SSEVisibility }
  | { type: 'pipeline_complete'; runId: string; status: 'completed' | 'fixme' | 'cancelled'; totalCost: number; timestamp: string; visibility?: SSEVisibility }
  | { type: 'artifact_ready'; runId: string; artifactId: string; name: string; artifactType: string; timestamp: string; visibility?: SSEVisibility }
  | { type: 'retry'; runId: string; stage: string; attempt: number; maxAttempts: number; reason: string; timestamp: string; visibility?: SSEVisibility }
  | { type: 'error'; runId: string; message: string; timestamp: string; visibility?: SSEVisibility }
  | { type: 'worker_status'; connected: boolean; timestamp: string; visibility?: SSEVisibility }
  | { type: 'agent_progress'; runId: string; stage: string; message: string; timestamp: string; visibility?: SSEVisibility };

// ── API Request/Response Types ──

export interface CreatePipelineRequest {
  feature: string;
  module: string;
  intent: string;
  priority?: string;
  targetUrl?: string;
  clientId?: string;
  dryRun?: boolean;
}

export interface CreatePipelineResponse {
  runId: string;
}

export interface CompletedTaskPayload {
  taskId: string;
  success: boolean;
  result: Record<string, unknown>;
  artifacts?: Array<{ name: string; type: string; content: string }>;
  cost?: number;
}

export interface WorkerHeartbeat {
  workerId: string;
  currentTaskId?: string;
  timestamp: string;
}

export interface AdminUsage {
  totalRuns: number;
  completedRuns: number;
  totalCost: number;
  avgCostPerRun: number;
}

export interface WorkerStatusResponse {
  connected: boolean;
  lastHeartbeat: string | null;
  currentTask: string | null;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  db: boolean;
  worker: boolean;
  uptime: number;
  timestamp: string;
}
