import api from './api';

export interface Escalation {
  id: string;
  runId: string;
  module: string;
  reason: string;
  targetAgent: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export const fetchEscalations = (status?: string) =>
  api.get<{ escalations: Escalation[] }>('/escalations', { params: { status } }).then(r => r.data);

export const createEscalation = (data: { runId: string; module: string; reason: string; targetAgent: string }) =>
  api.post<{ ok: boolean; id: string }>('/escalations', data).then(r => r.data);

export const resolveEscalation = (id: string, data: { resolution: string }) =>
  api.patch<{ ok: boolean }>(`/escalations/${id}`, data).then(r => r.data);

export const triggerRework = (id: string, data: { agent: string; notes: string }) =>
  api.post<{ ok: boolean; id: string; status: string; reworkAgent: string }>(`/escalations/${id}/rework`, data).then(r => r.data);

export const markReworkComplete = (id: string) =>
  api.post<{ ok: boolean }>(`/escalations/${id}/rework-complete`).then(r => r.data);
