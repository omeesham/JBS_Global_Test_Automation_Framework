import axios from 'axios';
import type { CreatePipelineRequest, PipelineRun, AdminUsage, WorkerStatus, HealthResponse, PipelineDefinition, PipelineDefinitionResponse, PipelineValidationResult, AgentType, SSEEvent } from '@/types';

const encore = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- Pipeline Operations ---

export async function createPipelineRun(data: CreatePipelineRequest): Promise<{ runId: string }> {
  const { data: resp } = await encore.post('/pipeline/run', data);
  return resp;
}

export async function listPipelineRuns(status?: string): Promise<PipelineRun[]> {
  const { data } = await encore.get('/pipeline/list', { params: status ? { status } : undefined });
  return data;
}

export async function getPipelineRunDetail(id: string): Promise<PipelineRun> {
  const { data } = await encore.get(`/pipeline/${encodeURIComponent(id)}`);
  return data;
}

export async function cancelPipelineRun(id: string): Promise<void> {
  await encore.post(`/pipeline/${encodeURIComponent(id)}/cancel`);
}

export interface TriageDecision {
  testName: string;
  action: 'report_bug' | 'heal_feature_change' | 'dismiss';
}

export async function resumeTriagePipeline(
  id: string,
  decisions: TriageDecision[],
): Promise<{ resumed: boolean; healCount: number; bugCount: number }> {
  const { data } = await encore.post(`/pipeline/${encodeURIComponent(id)}/resume-triage`, { decisions });
  return data;
}

// --- Approval / Rejection ---

export async function approvePipelineRun(id: string): Promise<{ approved: boolean }> {
  const { data } = await encore.post(`/pipeline/${encodeURIComponent(id)}/approve`);
  return data;
}

export async function rejectPipelineRun(id: string, reason?: string): Promise<{ rejected: boolean; rerunning: string }> {
  const { data } = await encore.post(`/pipeline/${encodeURIComponent(id)}/reject`, { reason });
  return data;
}

// --- Steering ---

export async function steerPipelineRun(
  id: string,
  message: string,
  action: 'inject' | 'stop-and-redirect' = 'inject',
): Promise<{ steered: boolean; action: string; message: string }> {
  const { data } = await encore.post(`/pipeline/${encodeURIComponent(id)}/steer`, { message, action });
  return data;
}

// --- Artifact Download ---

export async function downloadArtifacts(runId: string): Promise<void> {
  const response = await encore.get(`/pipeline/${encodeURIComponent(runId)}/artifacts/download`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || `artifacts-${runId.slice(0, 8)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- SSE Events ---

export function subscribeToPipelineEvents(
  runId: string,
  onEvent: (event: SSEEvent) => void,
): EventSource {
  const es = new EventSource(`/api/events/${encodeURIComponent(runId)}`);
  es.onmessage = (msg) => {
    try {
      const parsed: SSEEvent = JSON.parse(msg.data);
      onEvent(parsed);
    } catch {
      // Ignore non-JSON messages (keep-alive, comments)
    }
  };
  return es;
}

// --- Admin ---

export async function getAdminUsage(): Promise<AdminUsage> {
  const { data } = await encore.get('/admin/usage');
  return data;
}

export async function getWorkerStatus(): Promise<WorkerStatus> {
  const { data } = await encore.get('/admin/worker-status');
  return data;
}

export async function getPipelineDefinition(): Promise<PipelineDefinition> {
  const { data } = await encore.get('/admin/pipeline-definition');
  return data;
}

export async function updatePipelineDefinition(config: PipelineDefinition): Promise<PipelineDefinition> {
  const { data } = await encore.put('/admin/pipeline-definition', config);
  return data;
}

// --- Agent Types & Per-Client Pipeline Definitions (Plan 50) ---

export async function getAgentTypes(): Promise<AgentType[]> {
  const { data } = await encore.get('/admin/agent-types');
  return data;
}

export async function getClientPipelineDefinition(clientId?: string): Promise<PipelineDefinitionResponse> {
  const params = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
  const { data } = await encore.get(`/admin/client-pipeline-definition${params}`);
  return data;
}

export async function saveClientPipelineDefinition(
  def: PipelineDefinition,
  version: number,
  clientId?: string,
): Promise<PipelineDefinitionResponse> {
  const params = new URLSearchParams();
  if (clientId) params.set('clientId', clientId);
  params.set('version', String(version));
  const { data } = await encore.put(`/admin/pipeline-definition?${params}`, def);
  return data;
}

export async function validatePipelineDefinition(def: PipelineDefinition): Promise<PipelineValidationResult> {
  const { data } = await encore.post('/admin/pipeline-definition/validate', def);
  return data;
}

export async function cloneDefaultToClient(clientId: string): Promise<{ ok: boolean; version: number }> {
  const { data } = await encore.post(`/admin/pipeline-definition/clone-default?clientId=${encodeURIComponent(clientId)}`);
  return data;
}

export async function deleteClientPipelineDefinition(clientId: string): Promise<{ ok: boolean; deleted: boolean }> {
  const { data } = await encore.delete(`/admin/pipeline-definition?clientId=${encodeURIComponent(clientId)}`);
  return data;
}

// --- Pages (Plan 53D) ---

export interface Page {
  id: string;
  client_id: string | null;
  module: string;
  page_slug: string;
  display_name: string;
  target_url: string | null;
  parent_page_id: string | null;
  depth: number;
  sort_order: number;
  metadata: Record<string, unknown> | null;
  stages?: PageStageStatus[];
}

export interface PageStageStatus {
  id: string;
  page_id: string;
  stage_id: string;
  status: string;
  active_run_id: string | null;
  last_run_id: string | null;
  last_completed_at: string | null;
  artifact_summary: Record<string, unknown> | null;
  approved_by: string | null;
  approved_at: string | null;
  explore_without_reqs: boolean;
  explore_permitted_by: string | null;
}

export async function listPages(clientId?: string, module?: string): Promise<Page[]> {
  const params: Record<string, string> = {};
  if (clientId) params.clientId = clientId;
  if (module) params.module = module;
  const { data } = await encore.get('/pages', { params });
  return data;
}

export async function createPageRecord(page: { client_id?: string; module: string; page_slug: string; display_name: string; target_url?: string; parent_page_id?: string }): Promise<Page> {
  const { data } = await encore.post('/pages', page);
  return data;
}

export async function getPageDetail(id: string): Promise<Page & { stages: PageStageStatus[]; artifacts: any[] }> {
  const { data } = await encore.get(`/pages/${encodeURIComponent(id)}`);
  return data;
}

export async function updatePageRecord(id: string, patch: { display_name?: string; target_url?: string; metadata?: Record<string, unknown>; sort_order?: number }): Promise<Page> {
  const { data } = await encore.put(`/pages/${encodeURIComponent(id)}`, patch);
  return data;
}

export async function deletePageRecord(id: string): Promise<void> {
  await encore.delete(`/pages/${encodeURIComponent(id)}`);
}

export async function getPageStages(id: string): Promise<PageStageStatus[]> {
  const { data } = await encore.get(`/pages/${encodeURIComponent(id)}/stages`);
  return data;
}

export async function permitExplore(pageId: string, permittedBy: string, stageId?: string): Promise<PageStageStatus> {
  const { data } = await encore.post(`/pages/${encodeURIComponent(pageId)}/permit-explore`, { permittedBy, stageId });
  return data;
}

export async function getPageTree(clientId?: string): Promise<Page[]> {
  const params = clientId ? { clientId } : {};
  const { data } = await encore.get('/pages/tree', { params });
  return data;
}

export async function updateArtifact(artifactId: string, content: string, editedBy: string): Promise<any> {
  const { data } = await encore.put(`/artifacts/${encodeURIComponent(artifactId)}`, { content, editedBy });
  return data;
}

export async function deleteArtifact(artifactId: string, deletedBy: string): Promise<void> {
  await encore.delete(`/artifacts/${encodeURIComponent(artifactId)}`, { data: { deletedBy } });
}

export async function getArtifactVersions(artifactId: string): Promise<any[]> {
  const { data } = await encore.get(`/artifacts/${encodeURIComponent(artifactId)}/versions`);
  return data;
}

export async function batchRunPipeline(params: { pageIds: string[]; targetStage: string; mode: 'auto' | 'manual'; intent: string; clientId?: string }): Promise<{ batchId: string; started: { pageId: string; runId: string }[]; skipped: { pageId: string; reason: string }[] }> {
  const { data } = await encore.post('/pipeline/batch-run', params);
  return data;
}

export async function switchPipelineMode(runId: string, mode: 'auto' | 'manual'): Promise<{ mode: string }> {
  const { data } = await encore.patch(`/pipeline/${encodeURIComponent(runId)}/mode`, { mode });
  return data;
}

// --- Setup / Onboarding (Plan 53E) ---

export async function initiateSetup(params: { clientId: string; homeUrl: string; authType?: string; credentials?: Record<string, string>; maxPages?: number; maxDepth?: number; initiatedBy: string }): Promise<{ setupId: string; status: string }> {
  const { data } = await encore.post('/setup/initiate', params);
  return data;
}

export async function getSetupStatus(clientId: string): Promise<{ status: string; home_url?: string; setup_run_id?: string }> {
  const { data } = await encore.get('/setup/status', { params: { clientId } });
  return data;
}

export async function storeSetupCredentials(clientId: string, authType: string, credentials: Record<string, string>): Promise<void> {
  await encore.post('/setup/credentials', { clientId, authType, credentials });
}

export async function rediscoverPages(clientId: string, initiatedBy: string): Promise<{ setupId: string; status: string }> {
  const { data } = await encore.post('/setup/rediscover', { clientId, initiatedBy });
  return data;
}

// --- Health ---
// Note: Encore health is at /health (no /api prefix), so we bypass the axios baseURL
export async function encoreHealthCheck(): Promise<HealthResponse> {
  const { data } = await axios.get('/health');
  return data;
}
