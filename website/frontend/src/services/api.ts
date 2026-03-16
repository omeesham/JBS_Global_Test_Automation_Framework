import axios from 'axios';
import { encryptField } from '@/utils/crypto';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('intelliqe_token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('intelliqe_user');
      sessionStorage.removeItem('intelliqe_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth (password encrypted) ---
export async function loginUser(username: string, password: string) {
  const { data } = await api.post('/auth/login', {
    username,
    password: encryptField(password),
  });
  return data;
}

export async function signupUser(username: string, password: string, fullName: string, email: string, role: string) {
  const { data } = await api.post('/auth/signup', {
    username,
    password: encryptField(password),
    fullName,
    email,
    role,
  });
  return data;
}

// --- Chat ---
export async function createChatConversation(username: string, title?: string) {
  const { data } = await api.post('/chat/conversations', { username, title });
  return data;
}

export async function saveChatMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, unknown>
) {
  const { data } = await api.post('/chat/messages', { conversationId, role, content, metadata });
  return data;
}

// --- JIRA Integration ---
export async function connectJira(username: string, baseUrl: string, email: string, apiToken: string) {
  const { data } = await api.post('/jira/connect', {
    username,
    baseUrl,
    email,
    apiToken: encryptField(apiToken),
  });
  return data;
}

export async function getJiraStatus(username: string) {
  const { data } = await api.get('/jira/status', { params: { username } });
  return data;
}

export async function getJiraStories(username: string) {
  const { data } = await api.get('/jira/stories', { params: { username } });
  return data;
}

export async function getJiraStoryDetails(username: string, issueKey: string) {
  const { data } = await api.get(`/jira/story/${encodeURIComponent(issueKey)}`, { params: { username } });
  return data;
}

export async function disconnectJira(username: string) {
  const { data } = await api.delete('/jira/disconnect', { params: { username } });
  return data;
}

// --- Test Cases ---
export async function saveTestCases(payload: {
  username: string;
  storyKey?: string;
  storyTitle?: string;
  source?: string;
  columns: string[];
  testCases: any[];
}) {
  const { data } = await api.post('/test-cases/save', payload);
  return data;
}

export async function exportTestCases(testRunId: string, format: string) {
  const response = await api.get(`/test-cases/${testRunId}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return response;
}

// --- AI Chat ---
export async function chatAsk(payload: {
  message: string;
  conversationId?: string;
  model?: 'haiku' | 'sonnet' | 'opus';
  thinkingEnabled?: boolean;
  websiteContext?: Record<string, unknown>;
}) {
  const { data } = await api.post('/chat/ask', payload);
  return data;
}

export async function healthCheck() {
  const { data } = await api.get('/health');
  return data;
}

// --- AI Provider Management (super_admin only) ---
export async function getAiConfigs() {
  const { data } = await api.get('/ai/configs');
  return data;
}

export async function getAiConfig(clientId: string) {
  const { data } = await api.get(`/ai/config/${clientId}`);
  return data;
}

export async function saveAiConfig(payload: {
  clientId: string;
  executionMode: string;
  cliConfig?: { workerId?: string; accountEmail?: string; configPath?: string };
  apiConfig?: { apiKey?: string; monthlyBudget?: number };
}) {
  const { data } = await api.post('/ai/config', payload);
  return data;
}

export async function deleteAiConfig(clientId: string) {
  const { data } = await api.delete(`/ai/config/${clientId}`);
  return data;
}

export async function validateAiApiKey(clientId: string) {
  const { data } = await api.post(`/ai/validate-api-key/${clientId}`);
  return data;
}

export async function getAiUsage(clientId: string, days = 30) {
  const { data } = await api.get(`/ai/usage/${clientId}`, { params: { days } });
  return data;
}

export async function getAiWorkers() {
  const { data } = await api.get('/ai/workers');
  return data;
}

export async function healthCheckAi(clientId: string) {
  const { data } = await api.post(`/ai/health-check/${clientId}`);
  return data;
}

// --- Website Runs (pipeline ↔ website tracking) ---
export async function trackWebsiteRun(websiteId: string, runId: string) {
  const { data } = await api.post('/website-runs', { websiteId, runId });
  return data;
}

// --- Worker Control (super_admin only, proxied through Express to Encore) ---
export async function getWorkerControlStatus() {
  const { data } = await api.get('/worker-control/status');
  return data;
}

export async function startWorker() {
  const { data } = await api.post('/worker-control/start');
  return data;
}

export async function stopWorker() {
  const { data } = await api.post('/worker-control/stop');
  return data;
}

export async function restartWorker() {
  const { data } = await api.post('/worker-control/restart');
  return data;
}

export default api;
