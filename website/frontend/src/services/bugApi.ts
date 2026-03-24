import api from './api';

export interface BugReportSummary {
  id: string;
  testCaseId: string;
  module: string;
  feature: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  status: 'open' | 'confirmed' | 'fixed' | 'wont_fix' | 'not_a_bug';
  createdAt: string;
  expectedBehavior: string;
  actualBehavior: string;
  pageUrl: string;
}

export interface BugStats {
  totalOpen: number;
  totalConfirmed: number;
  totalFixed: number;
  bySeverity: Record<string, number>;
  byModule: Record<string, number>;
}

export async function fetchBugs(filters?: { module?: string; severity?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.module) params.set('module', filters.module);
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.status) params.set('status', filters.status);
  const { data } = await api.get(`/bugs?${params.toString()}`);
  return data as { bugs: BugReportSummary[]; total: number };
}

export async function fetchBugStats() {
  const { data } = await api.get('/bugs/stats');
  return data as BugStats;
}

export async function fetchBugDetail(id: string) {
  const { data } = await api.get(`/bugs/${id}`);
  return data as BugReportSummary;
}

export async function updateBugStatus(id: string, status: string) {
  const { data } = await api.patch(`/bugs/${id}/status`, { status });
  return data as { ok: boolean; id: string; status: string };
}

// ── Triage ──

export interface TriageItemSummary {
  id: string;
  runId: string;
  testName: string;
  testFile: string;
  whatHappened: string;
  whyItHappened: string;
  whatToDo: string;
  disposition: 'BUG' | 'FEATURE_CHANGE' | 'TEST_DEFECT' | 'UNCERTAIN';
  bugHuntCategory?: string;
  changeSize?: string;
  testIdStatus?: string;
  autonomyDecision?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  severity: string | null;
  decision: 'report_bug' | 'heal_feature_change' | 'dismiss' | null;
  decidedAt: string | null;
}

export async function fetchTriageItems(runId: string) {
  const { data } = await api.get(`/bugs/triage?runId=${encodeURIComponent(runId)}`);
  return data as { items: TriageItemSummary[]; total: number; pending: number };
}

export async function decideTriage(id: string, decision: 'report_bug' | 'heal_feature_change' | 'dismiss') {
  const { data } = await api.post(`/bugs/triage/${encodeURIComponent(id)}/decide`, { decision });
  return data as { ok: boolean; id: string; decision: string };
}

export async function bulkDecideTriage(ids: string[], decision: 'report_bug' | 'heal_feature_change' | 'dismiss') {
  const { data } = await api.post('/bugs/triage/bulk-decide', { ids, decision });
  return data as { ok: boolean; updated: number };
}
