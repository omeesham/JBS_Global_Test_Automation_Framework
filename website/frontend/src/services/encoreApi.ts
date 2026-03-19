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

// --- Health ---
// Note: Encore health is at /health (no /api prefix), so we bypass the axios baseURL
export async function encoreHealthCheck(): Promise<HealthResponse> {
  const { data } = await axios.get('/health');
  return data;
}
