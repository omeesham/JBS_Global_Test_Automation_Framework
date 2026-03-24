import api from './api';

export interface TestIdEntry {
  id: string;
  selectorKey: string;
  value: string;
  websiteId?: string;
  status: 'PRESENT' | 'MISSING' | 'CHANGED';
  lastVerified?: string;
}

export interface TestIdChange {
  id: string;
  selectorKey: string;
  oldValue: string;
  newValue: string;
  status: 'PRESENT' | 'MISSING' | 'CHANGED';
  detectedAt: string;
}

export const fetchTestIdRegistry = (websiteId?: string) =>
  api.get<{ entries: TestIdEntry[] }>('/test-ids', { params: { websiteId } }).then(r => r.data);

export const verifyTestIds = (selectors: { key: string; value: string }[]) =>
  api.post<{ results: TestIdEntry[] }>('/test-ids/verify', { selectors }).then(r => r.data);

export const updateTestId = (id: string, data: { value?: string; status?: string }) =>
  api.patch<{ ok: boolean }>(`/test-ids/${id}`, data).then(r => r.data);

export const fetchTestIdChanges = (since?: string) =>
  api.get<{ since: string; entries: TestIdChange[]; total: number }>('/test-ids/changes', { params: { since } }).then(r => r.data);
