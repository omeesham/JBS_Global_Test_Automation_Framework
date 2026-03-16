import axios from 'axios';
import type { CreatePipelineRequest, PipelineRun, AdminUsage, WorkerStatus, HealthResponse, PipelineDefinition, SSEEvent } from '@/types';

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

// --- SSE Events ---

export function subscribeToPipelineEvents(
  runId: string,
  onEvent: (event: SSEEvent) => void,
): EventSource {
  const token = sessionStorage.getItem('intelliqe_token') || '';
  const es = new EventSource(`/api/website-runs/${encodeURIComponent(runId)}/events?token=${encodeURIComponent(token)}`);
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

// --- Health ---
// Note: Encore health is at /health (no /api prefix), so we bypass the axios baseURL
export async function encoreHealthCheck(): Promise<HealthResponse> {
  const { data } = await axios.get('/health');
  return data;
}
