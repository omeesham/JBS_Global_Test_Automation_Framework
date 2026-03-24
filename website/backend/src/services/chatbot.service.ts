/**
 * Chatbot Service — Role-Aware Tri-model Claude CLI routing
 *
 * Step 1: Haiku intent routing (always fast, 1-3s)
 * Step 2: User's preferred model for depth (sonnet default, opus for deep)
 *
 * All actions are role-gated: system prompt only shows actions the user's role
 * can perform, and executeAction() validates role again (defense in depth).
 */
import spawn from 'cross-spawn';
import { execSync } from 'child_process';
import type { ChildProcess } from 'child_process';
import { listClients, getClientById, getClientUsage, getPlatformStats, createClient, updateClient } from './clients.service.js';
import { createWebsite, updateWebsite, getWebsiteById } from './websites.service.js';
import { queryWithSchema } from '../db.js';
import {
  getCredsForUser, getStories, getStory,
  deleteCredsForUser, saveCredsForUser, testConnection,
  getConnectionStatus,
} from './jira.service.js';
import { getMessagesByConversation } from './chat.service.js';
import { saveConfig as saveAiConfig, getAllConfigs as getAllAiConfigs, saveApiKey as saveAiApiKey, resolveExecutionMethod, recordUsage, checkBudget } from './ai-provider.service.js';
import { callAnthropicAPI } from '../utils/anthropic-client.js';
import pool from '../db.js';

const ENCORE_URL = process.env.ENCORE_URL || 'http://localhost:3100';
const MAX_BUFFER = 10 * 1024 * 1024; // 10MB

// --- Concurrency limiter: prevents OOM from unbounded Claude CLI spawns ---
const MAX_CONCURRENT_CLAUDE = parseInt(process.env.MAX_CONCURRENT_CLAUDE || '3', 10);
let activeClaude = 0;
const claudeQueue: Array<{ resolve: () => void; timer: ReturnType<typeof setTimeout> }> = [];

async function acquireClaudeSlot(timeoutMs = 30000): Promise<boolean> {
  if (activeClaude < MAX_CONCURRENT_CLAUDE) {
    activeClaude++;
    return true;
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      // Remove from queue on timeout
      const idx = claudeQueue.findIndex(e => e.timer === timer);
      if (idx !== -1) claudeQueue.splice(idx, 1);
      resolve(false);
    }, timeoutMs);
    claudeQueue.push({ resolve: () => { clearTimeout(timer); activeClaude++; resolve(true); }, timer });
  });
}

function releaseClaudeSlot(): void {
  activeClaude--;
  const next = claudeQueue.shift();
  if (next) next.resolve();
}

// --- Windows-safe process kill (kills entire process tree) ---
function killProc(proc: ChildProcess): void {
  if (process.platform === 'win32' && proc.pid) {
    try {
      execSync(`taskkill /pid ${proc.pid} /t /f`, { stdio: 'ignore' });
    } catch { /* already dead */ }
  } else {
    proc.kill('SIGKILL');
  }
}

// --- Diagnose CLI failure from stderr ---
function diagnoseCLIFailure(stderr: string): string {
  if (stderr.includes('not found') || stderr.includes('ENOENT')) return 'Claude CLI not installed on server';
  if (stderr.includes('auth') || stderr.includes('API key')) return 'Claude CLI authentication expired — server admin must re-authenticate';
  if (stderr.includes('rate limit')) return 'AI rate limit reached — try again in a minute';
  if (stderr.includes('nested') || stderr.includes('CLAUDECODE')) return 'Claude environment conflict — server restart needed';
  return 'AI service temporarily unavailable';
}

export type ChatModel = 'haiku' | 'sonnet' | 'opus';

// Step 3: Extended ChatAskRequest with role context
export interface ChatAskRequest {
  message: string;
  conversationId?: string;
  model?: ChatModel;
  thinkingEnabled?: boolean;
  websiteContext?: {
    id?: string;
    name?: string;
    url?: string;
    authType?: string;
    enabledServices?: string[];
  };
  agent?: string;
  executionMode?: 'auto' | 'manual';
  // Role context from tenant middleware
  userRole: string;
  userId: string;
  clientId?: string;
  tenantSchema: string;
}

/* ------------------------------------------------------------------ */
/* Pipeline prerequisite checking                                      */
/* ------------------------------------------------------------------ */

export const PIPELINE_CHAIN = ['requirements', 'planning', 'generation', 'audit'] as const;

export async function checkPrerequisites(
  targetAgent: string,
  pageId?: string,
): Promise<{ canRun: boolean; needsAgent?: string; missingStages?: string[] }> {
  if (targetAgent === 'auto' || targetAgent === 'healing') return { canRun: true };
  if (!pageId) return { canRun: true };
  const targetIndex = PIPELINE_CHAIN.indexOf(targetAgent as typeof PIPELINE_CHAIN[number]);
  if (targetIndex < 0) return { canRun: true }; // unknown agent — let Encore validate
  if (targetIndex === 0) return { canRun: true }; // requirements — no prereqs

  try {
    const res = await fetch(`${ENCORE_URL}/api/pages/${pageId}/stages`);
    if (!res.ok) return { canRun: true };
    const stages = await res.json();
    const missing: string[] = [];
    for (let i = 0; i < targetIndex; i++) {
      const s = Array.isArray(stages) ? stages.find((s: any) => s.stage_id === PIPELINE_CHAIN[i]) : null;
      if (!s || s.status !== 'completed') missing.push(PIPELINE_CHAIN[i]!);
    }
    return missing.length > 0
      ? { canRun: false, needsAgent: missing[0], missingStages: missing }
      : { canRun: true };
  } catch {
    return { canRun: true };
  }
}

export async function detectStartAgent(pageId?: string): Promise<string> {
  if (!pageId) return 'requirements';
  try {
    const res = await fetch(`${ENCORE_URL}/api/pages/${pageId}/stages`);
    if (!res.ok) return 'requirements';
    const stages = await res.json();
    if (!Array.isArray(stages)) return 'requirements';
    for (const stageId of PIPELINE_CHAIN) {
      const s = stages.find((s: any) => s.stage_id === stageId);
      if (!s || s.status !== 'completed') return stageId;
    }
    return 'audit';
  } catch {
    return 'requirements';
  }
}

export interface ChatAskResponse {
  text: string;
  action: string;
  params?: Record<string, unknown>;
  responseType: 'options' | 'progress' | 'results' | 'jira_stories' | 'text';
  data?: unknown;
  needsDepth?: boolean;
  runId?: string;
  error?: boolean;
}

// Step 5: Action catalog with role gates
const ACTION_CATALOG: Record<string, { desc: string; params: string; roles: string[] | '*' }> = {
  // All roles
  none:              { desc: 'Respond conversationally', params: '{}', roles: '*' },
  trigger_run:       { desc: 'Start a test run for a website', params: '{ websiteId, feature, module, intent }', roles: '*' },
  cancel_run:        { desc: 'Cancel a running test', params: '{ runId }', roles: '*' },
  list_runs:         { desc: 'Show test run history (optional status filter)', params: '{ status? }', roles: '*' },
  get_run:           { desc: 'Get full details of a specific run', params: '{ runId }', roles: '*' },
  check_status:      { desc: 'Quick status check on latest run', params: '{}', roles: '*' },
  show_dashboard:    { desc: 'Direct user to Dashboard page', params: '{}', roles: '*' },
  show_settings:     { desc: 'Direct user to Settings page', params: '{}', roles: '*' },
  connect_jira:      { desc: 'Connect JIRA integration', params: '{ baseUrl, email, apiToken }', roles: '*' },
  disconnect_jira:   { desc: 'Remove JIRA connection', params: '{}', roles: '*' },
  list_jira_stories: { desc: 'List JIRA stories for import', params: '{}', roles: '*' },
  get_jira_story:    { desc: 'Get JIRA story details with acceptance criteria', params: '{ storyKey }', roles: '*' },
  list_test_cases:   { desc: 'List saved test cases for a run', params: '{ testRunId }', roles: '*' },
  export_test_cases: { desc: 'Export test cases as CSV (returns download link)', params: '{ testRunId, format? }', roles: '*' },
  // Page-aware actions (Plan 53F)
  run_stage_for_page: { desc: 'Run a specific stage for a page (e.g. "run planner for login page")', params: '{ pageName, stageId?, mode?, targetUrl? }', roles: '*' },
  check_page_status:  { desc: 'Check stage completion status for a page', params: '{ pageName }', roles: '*' },
  approve_stage:      { desc: 'Approve current stage and continue pipeline', params: '{ pageHint? }', roles: '*' },
  automate_jira_ticket: { desc: 'Fetch JIRA ticket and start pipeline automation for it', params: '{ storyKey, startAgent? }', roles: '*' },
  setup_project:      { desc: 'Start project onboarding/setup wizard', params: '{}', roles: ['super_admin', 'client_admin'] },
  // Client admin + super admin
  create_website:    { desc: 'Add a new website to test', params: '{ name, url, authType?, clientId? }', roles: ['super_admin', 'client_admin'] },
  update_website:    { desc: 'Update website config', params: '{ websiteId, updates }', roles: ['super_admin', 'client_admin'] },
  // Super admin only
  list_clients:      { desc: 'Refresh the list of all client organizations', params: '{}', roles: ['super_admin'] },
  create_client:     { desc: 'Create a new client organization', params: '{ name, slug, contactEmail, plan? }', roles: ['super_admin'] },
  update_client:     { desc: 'Update client org details', params: '{ clientId, updates }', roles: ['super_admin'] },
  get_platform_stats: { desc: 'Refresh platform-wide statistics', params: '{}', roles: ['super_admin'] },
  get_client_usage:  { desc: 'Get usage breakdown per client', params: '{}', roles: ['super_admin'] },
  // AI Provider management (super_admin only)
  configure_ai_provider: { desc: 'Configure AI execution for a client (mode, API key, CLI worker)', params: '{ clientId, executionMode, apiKey?, cliWorkerEmail? }', roles: ['super_admin'] },
  check_ai_status:       { desc: 'Check AI status across all clients', params: '{}', roles: ['super_admin'] },
  // Worker lifecycle control (super_admin only)
  start_worker:          { desc: 'Start the pipeline worker process', params: '{}', roles: ['super_admin'] },
  stop_worker:           { desc: 'Stop the pipeline worker process', params: '{}', roles: ['super_admin'] },
  restart_worker:        { desc: 'Restart the pipeline worker process', params: '{}', roles: ['super_admin'] },
  // Bug reports & escalations (Plan 53 SUBPLAN_C)
  show_bugs:             { desc: 'List bug reports with optional filters', params: '{ module?, severity?, status? }', roles: '*' },
  view_bug_history:      { desc: 'Show failure history for a test', params: '{ testName }', roles: '*' },
  show_flaky_tests:      { desc: 'Show tests with high flake rates', params: '{}', roles: '*' },
  view_escalations:      { desc: 'Show open escalations blocking pipeline', params: '{}', roles: '*' },
  view_test_id_changes:  { desc: 'Show test-ID changes from latest run', params: '{ runId? }', roles: '*' },
  mark_bug_fixed:        { desc: 'Mark a bug as fixed', params: '{ bugId }', roles: ['super_admin', 'client_admin'] },
  verify_bug_fix:        { desc: 'Re-test a fixed bug to verify the fix works', params: '{ bugId }', roles: ['super_admin', 'client_admin'] },
  reclassify_bug:        { desc: 'Reclassify a bug (e.g., flake to real bug)', params: '{ bugId, newCategory }', roles: ['super_admin', 'client_admin'] },
  resolve_escalation:    { desc: 'Resolve an escalation and unblock pipeline', params: '{ escalationId, action }', roles: ['super_admin', 'client_admin'] },
};

// Step 4: Role context interface
interface RoleContext {
  role: string;
  userId: string;
  websites: Array<{ id: string; name: string; base_url: string; enabled_services?: string[]; is_active: boolean }>;
  recentRuns: Array<{ run_id: string; website_id: string; status?: string; created_at: string; cost?: number; created_by?: string }>;
  jiraStatus: { connected: boolean; jiraUrl?: string; displayName?: string };
  workerOnline: boolean;
  conversationHistory: Array<{ role: string; content: string }>;
  // super_admin only
  platformStats?: { totalClients: number; totalUsers: number; totalRuns: number; totalCost: number };
  allClients?: Array<{ id: string; name: string; slug: string; plan: string; is_active: boolean }>;
}

/** Step 4: Gather role-appropriate context (all queries fail-safe). */
async function gatherContext(req: ChatAskRequest): Promise<RoleContext> {
  const isSuperAdmin = req.userRole === 'super_admin';

  // Build parallel queries
  // websites table lives in TENANT schemas (not JBSTestOpsAI admin schema)
  // Non-super_admin: query their own tenant schema
  // Super_admin: query across all client schemas (gather from allClients later), start with empty
  const websiteQuery = !isSuperAdmin && req.tenantSchema
    ? queryWithSchema(req.tenantSchema, 'SELECT id, name, base_url, enabled_services, is_active FROM websites ORDER BY created_at DESC LIMIT 20')
    : Promise.resolve({ rows: [] });

  const runsQuery = isSuperAdmin
    ? pool.query(`SELECT run_id, website_id, created_at, cost, created_by FROM "JBSTestOpsAI".website_runs ORDER BY created_at DESC LIMIT 20`)
    : req.clientId
      ? pool.query(`SELECT run_id, website_id, created_at, cost, created_by FROM "JBSTestOpsAI".website_runs WHERE client_id = $1 ORDER BY created_at DESC LIMIT 20`, [req.clientId])
      : Promise.resolve({ rows: [] });

  const jiraQuery = getConnectionStatus(req.userId);

  const workerQuery = fetch(`${ENCORE_URL}/api/admin/worker-status`).then(r => r.json()).catch(() => null);

  // Conversation history (optional)
  const historyQuery = req.conversationId
    ? getMessagesByConversation(req.conversationId).catch(() => [])
    : Promise.resolve([]);

  // Super admin extras
  const platformQuery = isSuperAdmin ? getPlatformStats().catch(() => null) : Promise.resolve(null);
  const clientsQuery = isSuperAdmin ? listClients().catch(() => []) : Promise.resolve([]);

  const [websiteRes, runsRes, jiraRes, workerRes, historyRes, platformRes, clientsRes] =
    await Promise.allSettled([websiteQuery, runsQuery, jiraQuery, workerQuery, historyQuery, platformQuery, clientsQuery]);

  let websites = websiteRes.status === 'fulfilled' ? (websiteRes.value as any).rows ?? websiteRes.value ?? [] : [];
  const recentRuns = runsRes.status === 'fulfilled' ? (runsRes.value as any).rows ?? runsRes.value ?? [] : [];
  const jiraStatus = jiraRes.status === 'fulfilled' ? (jiraRes.value as any) ?? { connected: false } : { connected: false };
  const workerOnline = workerRes.status === 'fulfilled' ? !!(workerRes.value as any)?.connected : false;

  const rawHistory = historyRes.status === 'fulfilled' ? (historyRes.value as any[]) ?? [] : [];
  const conversationHistory = rawHistory.slice(-10).map((m: any) => ({
    role: m.role,
    content: m.content?.length > 300 ? m.content.slice(0, 300) + '...' : m.content ?? '',
  }));

  const context: RoleContext = { role: req.userRole, userId: req.userId, websites, recentRuns, jiraStatus, workerOnline, conversationHistory };

  if (isSuperAdmin) {
    context.platformStats = platformRes.status === 'fulfilled' && platformRes.value ? platformRes.value as any : undefined;
    const allClients = clientsRes.status === 'fulfilled' ? (clientsRes.value as any[]) ?? [] : [];
    context.allClients = allClients;

    // Super admin: gather websites from each client's tenant schema (max 5 per client, max 30 total)
    if (allClients.length > 0) {
      try {
        const websiteQueries = allClients.slice(0, 10).map((c: any) =>
          queryWithSchema(c.db_schema, 'SELECT id, name, base_url, enabled_services, is_active FROM websites ORDER BY created_at DESC LIMIT 5')
            .then(r => r.rows)
            .catch((e) => { console.warn('[Chatbot] Schema query failed:', e?.message); return []; })
        );
        const results = await Promise.all(websiteQueries);
        websites = results.flat().slice(0, 30);
        context.websites = websites;
      } catch (err) {
        console.warn('[Chatbot] Failed to load websites for context:', (err as Error).message);
      }
    }
  }

  return context;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: 'Platform administrator — manages all clients, users, websites, pipeline config, and platform-wide stats',
  client_admin: 'Organization admin — manages websites and testing config for their organization',
  qa_engineer: 'QA tester — runs tests, manages JIRA, views results, configures preferences',
  data_engineer: 'Data tester — same as QA engineer, focused on data validation',
};

/** Step 5: Build role-aware system prompt. */
function buildSystemPrompt(context: RoleContext, websiteContext?: ChatAskRequest['websiteContext']): string {
  const roleActions = Object.entries(ACTION_CATALOG)
    .filter(([, v]) => v.roles === '*' || v.roles.includes(context.role))
    .map(([k, v]) => `- ${k}: ${v.desc}. Params: ${v.params}`)
    .join('\n');

  const websiteList = context.websites.length > 0
    ? context.websites.map((w: any) => `  - ${w.name} (id: ${w.id}, url: ${w.base_url}, services: ${(w.enabled_services || []).join(', ') || 'web'}, active: ${w.is_active})`).join('\n')
    : '  (none)';

  const runList = context.recentRuns.length > 0
    ? context.recentRuns.map((r: any) => `  - Run ${r.run_id} | website: ${r.website_id} | cost: $${(r.cost ?? 0).toFixed(2)} | date: ${r.created_at} | by: ${r.created_by || 'unknown'}`).join('\n')
    : '  (none)';

  const jiraBlock = context.jiraStatus.connected
    ? `Connected to ${context.jiraStatus.jiraUrl || 'JIRA'} as ${context.jiraStatus.displayName || 'unknown'}`
    : 'Not connected';

  let superAdminBlock = '';
  if (context.role === 'super_admin') {
    if (context.platformStats) {
      const s = context.platformStats;
      superAdminBlock += `\n### Platform stats\n- Clients: ${s.totalClients}, Users: ${s.totalUsers}, Total runs: ${s.totalRuns}, Total cost: $${(s.totalCost ?? 0).toFixed(2)}`;
    }
    if (context.allClients && context.allClients.length > 0) {
      superAdminBlock += `\n### All clients\n${context.allClients.map((c: any) => `  - ${c.name} (id: ${c.id}, slug: ${c.slug}, plan: ${c.plan || 'free'}, active: ${c.is_active})`).join('\n')}`;
    }
  }

  const historyBlock = context.conversationHistory.length > 0
    ? context.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')
    : '(new conversation)';

  const activeContext = websiteContext
    ? `\n### Active website context\n- Name: ${websiteContext.name || 'Default'}, URL: ${websiteContext.url || 'N/A'}, Auth: ${websiteContext.authType || 'none'}, Services: ${(websiteContext.enabledServices || []).join(', ') || 'web'}`
    : '';

  return `You are the IntelliQE QA testing platform assistant.

## User
- Username: ${context.userId}
- Role: ${context.role} — ${ROLE_DESCRIPTIONS[context.role] || 'User'}

## Your knowledge (current data)

### Websites
${websiteList}

### Recent test runs
${runList}
Note: Status details available via check_status or get_run actions (local data has cost/date only).

### JIRA integration
${jiraBlock}${context.jiraStatus.connected ? `
When the user mentions a JIRA ticket (e.g., "ABC-2944", "Ticket 2944", "PROJ-123"):
- If they want to automate/test it, use action "automate_jira_ticket" with { storyKey: "ABC-2944", startAgent: "requirements" }
- If they just want to see ticket details, use action "get_jira_story" with { storyKey: "ABC-2944" }
- If they say just a number like "2944", try common project keys or ask for the full key
- "automate ticket X" = fetch ticket + start pipeline with its requirements as intent` : ''}

### System
- Worker: ${context.workerOnline ? 'Online' : 'Offline'}
${superAdminBlock}${activeContext}

## Available actions
${roleActions}

## Conversation history
${historyBlock}

## Response format
Respond ONLY with valid JSON:
{ "text": "...", "action": "none|action_name", "params": { ... }, "needsDepth": true|false, "responseType": "text|options|progress|results" }

## Rules
- For read questions, answer directly from "Your knowledge" above — no action needed
- For write/mutation requests, return the appropriate action with params
- If the user asks about features outside your available actions, say so honestly
- Never mention "agents", "pipeline stages", "convergence guards". Use: "testing engine", "testing phases", "quality checks"
- Keep responses concise, professional, helpful
- If params are missing for an action, ask the user for them instead of guessing
- Set needsDepth: true ONLY for complex analysis, expert advice, or multi-step reasoning
- Set needsDepth: false for simple CRUD, status checks, greetings, clarifications`;
}

/** Step 5: Build deep system prompt (includes action catalog for Edge Case C). */
function buildDeepSystemPrompt(context: RoleContext): string {
  const roleActions = Object.entries(ACTION_CATALOG)
    .filter(([, v]) => v.roles === '*' || v.roles.includes(context.role))
    .map(([k, v]) => `- ${k}: ${v.desc}. Params: ${v.params}`)
    .join('\n');

  return `You are a senior QA automation engineer for the IntelliQE platform. Provide thorough, expert-level analysis. Think deeply about the user's question.

## User: ${context.userId} (${context.role})

## Available actions
${roleActions}

## Response format
Respond ONLY with valid JSON:
{ "text": "...", "action": "none|action_name", "params": { ... }, "needsDepth": false, "responseType": "text|options|progress|results" }

## Rules
- Use client-friendly language — never expose internal implementation details like "agents", "pipeline stages", "convergence guards"
- If an action is appropriate, include it in your response (you replace the initial analysis entirely)
- If params are missing for an action, ask the user for them instead of guessing`;
}

/** Step 6: Role-validated action executor. */
async function executeAction(
  action: string,
  params: Record<string, unknown>,
  req: ChatAskRequest,
  context: RoleContext,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  // Role validation (defense in depth)
  const entry = ACTION_CATALOG[action];
  if (!entry) return { success: false, error: `Unknown action: ${action}` };
  if (entry.roles !== '*' && !entry.roles.includes(req.userRole)) {
    return { success: false, error: 'Permission denied' };
  }

  try {
    switch (action) {
      case 'trigger_run': {
        // Pass clientId for client-aware task routing
        const runPayload = { ...params, clientId: req.clientId || undefined };
        const runRes = await fetch(`${ENCORE_URL}/api/pipeline/run`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(runPayload),
        });
        if (!runRes.ok) return { success: false, error: `Testing engine error (${runRes.status}). Is the backend running?` };
        const run = await runRes.json() as any;
        return { success: true, data: { runId: run.runId } };
      }

      case 'cancel_run': {
        if (!params.runId) return { success: false, error: 'Missing required: runId' };
        const cancelRes = await fetch(`${ENCORE_URL}/api/pipeline/${params.runId}/cancel`, { method: 'POST' });
        if (!cancelRes.ok) return { success: false, error: `Failed to cancel run (${cancelRes.status})` };
        return { success: true, data: { cancelled: true } };
      }

      case 'list_runs': {
        const url = params.status
          ? `${ENCORE_URL}/api/pipeline/list?status=${encodeURIComponent(String(params.status))}`
          : `${ENCORE_URL}/api/pipeline/list`;
        const res = await fetch(url);
        if (!res.ok) return { success: false, error: `Testing engine unavailable (${res.status})` };
        const runs = await res.json();
        return { success: true, data: runs };
      }

      case 'get_run': {
        if (!params.runId) return { success: false, error: 'Missing required: runId' };
        const res = await fetch(`${ENCORE_URL}/api/pipeline/${params.runId}`);
        if (!res.ok) return { success: false, error: `Run not found or engine error (${res.status})` };
        const run = await res.json();
        return { success: true, data: run };
      }

      case 'check_status': {
        const res = await fetch(`${ENCORE_URL}/api/pipeline/list`);
        if (!res.ok) return { success: false, error: `Testing engine unavailable (${res.status})` };
        const runs = await res.json() as any[];
        const latest = Array.isArray(runs) && runs.length > 0 ? runs[0] : null;
        return { success: true, data: latest ? { runId: latest.runId, status: latest.status, stage: latest.currentStage } : { message: 'No runs found' } };
      }

      case 'connect_jira': {
        const { baseUrl, email, apiToken } = params as any;
        if (!baseUrl || !email || !apiToken) return { success: false, error: 'Missing required: baseUrl, email, apiToken' };
        const authHeader = 'Basic ' + Buffer.from(`${email}:${apiToken}`).toString('base64');
        const me = await testConnection({ baseUrl: String(baseUrl), authHeader });
        await saveCredsForUser(req.userId, String(baseUrl), authHeader, me.displayName);
        return { success: true, data: { connected: true, displayName: me.displayName, baseUrl } };
      }

      case 'disconnect_jira': {
        await deleteCredsForUser(req.userId);
        return { success: true, data: { disconnected: true } };
      }

      case 'list_jira_stories': {
        const creds = await getCredsForUser(req.userId);
        if (!creds) return { success: false, error: 'JIRA not connected. Use "connect JIRA" to set it up.' };
        const stories = await getStories(creds);
        return { success: true, data: stories };
      }

      case 'get_jira_story': {
        if (!params.storyKey) return { success: false, error: 'Missing required: storyKey' };
        const creds = await getCredsForUser(req.userId);
        if (!creds) return { success: false, error: 'JIRA not connected. Use "connect JIRA" to set it up.' };
        const story = await getStory(creds, String(params.storyKey));
        return { success: true, data: story };
      }

      case 'list_test_cases': {
        if (!params.testRunId) return { success: false, error: 'Missing required: testRunId' };
        const { rows } = await pool.query(
          `SELECT * FROM "JBSTestOpsAI".test_cases WHERE test_run_id = $1 ORDER BY sort_order`,
          [params.testRunId],
        );
        return { success: true, data: rows };
      }

      case 'export_test_cases': {
        if (!params.testRunId) return { success: false, error: 'Missing required: testRunId' };
        const runId = String(params.testRunId).replace(/[^a-zA-Z0-9_-]/g, '');
        const fmt = String(params.format || 'csv').replace(/[^a-zA-Z0-9]/g, '');
        return { success: true, data: { downloadUrl: `/api/test-cases/${encodeURIComponent(runId)}/export?format=${encodeURIComponent(fmt)}` } };
      }

      case 'create_website': {
        const { name, url, authType, clientId: targetClientId } = params as any;
        if (!name || !url) return { success: false, error: 'Missing required: name, url' };
        let cid = req.clientId;
        let schema = req.tenantSchema;
        if (req.userRole === 'super_admin') {
          if (!targetClientId) return { success: false, error: 'Please specify which client this website belongs to (clientId)' };
          const client = await getClientById(String(targetClientId));
          if (!client) return { success: false, error: 'Client not found' };
          cid = (client as any).id;
          schema = (client as any).db_schema;
        }
        const website = await createWebsite(cid!, String(name), String(url), { authType: authType || null }, schema);
        return { success: true, data: website };
      }

      case 'update_website': {
        const { websiteId, updates, clientId: targetClientId } = params as any;
        if (!websiteId || !updates) return { success: false, error: 'Missing required: websiteId, updates' };
        let schema = req.tenantSchema;
        if (req.userRole === 'super_admin') {
          // super_admin's tenantSchema is 'JBSTestOpsAI' — websites don't live there
          if (!targetClientId) return { success: false, error: 'Please specify which client owns this website (clientId)' };
          const client = await getClientById(String(targetClientId));
          if (!client) return { success: false, error: 'Client not found' };
          schema = (client as any).db_schema;
        }
        const website = await updateWebsite(String(websiteId), updates, schema);
        return { success: true, data: website };
      }

      case 'list_clients': {
        const clients = await listClients();
        return { success: true, data: clients };
      }

      case 'create_client': {
        const { name, slug, contactEmail, plan } = params as any;
        if (!name || !slug || !contactEmail) return { success: false, error: 'Missing required: name, slug, contactEmail' };
        const client = await createClient(String(name), String(slug), String(contactEmail), plan || undefined);
        return { success: true, data: client };
      }

      case 'update_client': {
        const { clientId: cid, updates } = params as any;
        if (!cid || !updates) return { success: false, error: 'Missing required: clientId, updates' };
        const client = await updateClient(String(cid), updates);
        return { success: true, data: client };
      }

      case 'get_platform_stats': {
        const stats = await getPlatformStats();
        return { success: true, data: stats };
      }

      case 'get_client_usage': {
        const clients = await listClients();
        const usage = await Promise.all((clients as any[]).map((c: any) => getClientUsage(c.id)));
        return { success: true, data: usage };
      }

      case 'show_dashboard':
      case 'show_settings':
        return { success: true };

      case 'configure_ai_provider': {
        const { clientId: cid, executionMode, apiKey, cliWorkerEmail } = params as any;
        if (!cid || !executionMode) return { success: false, error: 'Missing required: clientId, executionMode' };
        const config = await saveAiConfig(
          String(cid),
          executionMode,
          cliWorkerEmail ? { accountEmail: cliWorkerEmail } : undefined,
          apiKey ? { apiKey } : undefined,
          req.userId,
        );
        if (apiKey) await saveAiApiKey(String(cid), apiKey);
        return { success: true, data: config };
      }

      case 'check_ai_status': {
        const configs = await getAllAiConfigs();
        return { success: true, data: configs };
      }

      case 'start_worker':
      case 'stop_worker':
      case 'restart_worker': {
        const WORKER_SECRET_VAL = process.env.WORKER_SECRET || 'dev-secret';
        const verb = action.replace('_worker', ''); // start, stop, restart
        const res = await fetch(`${ENCORE_URL}/api/admin/worker/${verb}`, {
          method: 'POST',
          headers: { 'x-worker-secret': WORKER_SECRET_VAL, 'content-type': 'application/json' },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          return { success: false, error: (err as any).error || `Worker ${verb} failed (${res.status})` };
        }
        const data = await res.json();
        return { success: true, data };
      }

      // ── Page-aware actions (Plan 53F) ──

      case 'run_stage_for_page': {
        const pageName = String(params.pageName || '');
        const stageId = params.stageId ? String(params.stageId) : undefined;
        if (!pageName) return { success: false, error: 'pageName is required' };
        // Try fuzzy search for the page — pages API may not exist yet
        let match: any = null;
        try {
          const searchRes = await fetch(`${ENCORE_URL}/api/pages?clientId=${encodeURIComponent(context.websites?.[0]?.id || '')}`, { headers: { 'content-type': 'application/json' } });
          const pagesRaw = await searchRes.json();
          const pages = Array.isArray(pagesRaw) ? pagesRaw : [];
          match = pages.find((p: any) =>
            p.display_name?.toLowerCase().includes(pageName.toLowerCase()) ||
            p.page_slug?.toLowerCase().includes(pageName.toLowerCase())
          );
          if (!match && pages.length > 0) {
            const names = pages.map((p: any) => p.display_name).slice(0, 10).join(', ');
            return { success: true, data: { message: `Couldn't find "${pageName}". Available pages: ${names || 'none'}` } };
          }
        } catch { /* pages API unavailable — fall through to direct run */ }
        // Direct pipeline run with page name as feature
        const runRes = await fetch(`${ENCORE_URL}/api/pipeline/run`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            feature: match?.display_name || pageName,
            module: match?.module || pageName,
            intent: `Run ${stageId || 'pipeline'} for ${pageName}`,
            targetUrl: match?.target_url || params.targetUrl || context.websites?.[0]?.base_url || '',
            clientId: context.websites?.[0]?.id,
            startStage: stageId || undefined,
            pageId: match?.id || undefined,
          }),
        });
        if (!runRes.ok) return { success: false, error: `Testing engine error (${runRes.status}). Is the worker running?` };
        const runData = await runRes.json();
        return { success: true, data: { ...runData, pageName: match?.display_name || pageName, action: 'run_stage_for_page' } };
      }

      case 'check_page_status': {
        const pn = String(params.pageName || '');
        if (!pn) return { success: false, error: 'pageName is required' };
        let found: any = null;
        try {
          const pagesRes = await fetch(`${ENCORE_URL}/api/pages?clientId=${encodeURIComponent(context.websites?.[0]?.id || '')}`, { headers: { 'content-type': 'application/json' } });
          const pagesRaw = await pagesRes.json();
          const allPages = Array.isArray(pagesRaw) ? pagesRaw : [];
          found = allPages.find((p: any) =>
            p.display_name?.toLowerCase().includes(pn.toLowerCase()) ||
            p.page_slug?.toLowerCase().includes(pn.toLowerCase())
          );
        } catch { /* pages API unavailable */ }
        if (!found) return { success: true, data: { message: `Page "${pn}" not found.` } };
        const detailRes = await fetch(`${ENCORE_URL}/api/pages/${found.id}/stages`, { headers: { 'content-type': 'application/json' } });
        const stages = await detailRes.json();
        return { success: true, data: { pageName: found.display_name, stages, action: 'check_page_status' } };
      }

      case 'approve_stage': {
        // Find latest awaiting_approval run
        const runsRes = await fetch(`${ENCORE_URL}/api/pipeline/list?status=awaiting_approval`, { headers: { 'content-type': 'application/json' } });
        const awaitingRuns = await runsRes.json() as any[];
        if (awaitingRuns.length === 0) return { success: true, data: { message: 'No stages awaiting approval.' } };
        const latestRun = awaitingRuns[0];
        const approveRes = await fetch(`${ENCORE_URL}/api/pipeline/${latestRun.id}/approve`, { method: 'POST', headers: { 'content-type': 'application/json' } });
        const approveData = await approveRes.json();
        return { success: true, data: { ...approveData, runId: latestRun.id, action: 'approve_stage' } };
      }

      case 'setup_project': {
        return { success: true, data: { action: 'setup_project', message: 'Opening setup wizard...' } };
      }

      case 'automate_jira_ticket': {
        const storyKey = String(params.storyKey || '');
        if (!storyKey) return { success: false, error: 'Missing ticket key. Example: "automate ticket ABC-2944"' };

        // 1. Fetch JIRA ticket
        const creds = await getCredsForUser(req.userId);
        if (!creds) return { success: false, error: 'JIRA not connected. Go to Settings → Integrations to connect.' };

        let story: any;
        try {
          story = await getStory(creds, storyKey);
        } catch (err) {
          return { success: false, error: `Could not fetch ticket ${storyKey}: ${(err as Error).message}` };
        }

        // 2. Extract requirements
        const intent = [
          story.summary || '',
          story.acceptanceCriteria || '',
          story.description || '',
        ].filter(Boolean).join('\n\n');

        if (!intent.trim()) {
          return { success: true, data: { storyKey, summary: story.summary, message: `Ticket ${storyKey} found but has no description or acceptance criteria to automate.` } };
        }

        // 3. Start pipeline
        const startAgent = params.startAgent ? String(params.startAgent) : undefined;
        try {
          const runRes = await fetch(`${ENCORE_URL}/api/pipeline/run`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              feature: story.summary || storyKey,
              module: 'jira-import',
              intent,
              clientId: context.websites?.[0]?.id,
              startStage: startAgent || undefined,
            }),
          });
          if (!runRes.ok) return { success: false, error: `Pipeline start failed (${runRes.status}). Is the worker running?` };
          const runData = await runRes.json() as any;
          return {
            success: true,
            data: {
              runId: runData.runId,
              storyKey,
              summary: story.summary,
              action: 'automate_jira_ticket',
              message: `Fetched ticket ${storyKey}: "${story.summary}". Pipeline started.`,
            },
          };
        } catch (err) {
          return { success: false, error: `Pipeline start failed: ${(err as Error).message}` };
        }
      }

      default:
        return { success: false, error: `Unhandled action: ${action}` };
    }
  } catch (err: any) {
    const msg = err?.code === '23505' ? 'A record with that name/slug already exists' : (err?.message || 'Unknown error');
    console.error(`[chatbot] executeAction(${action}) error:`, err);
    return { success: false, error: msg };
  }
}

/** Format action result data as readable text. */
function formatActionData(action: string, data: unknown): string {
  try {
    if (!data) return 'Action completed successfully.';
    const d = data as any;

    switch (action) {
      case 'list_runs': {
        if (!Array.isArray(d) || d.length === 0) return 'No runs found.';
        return `**Test Runs** (${d.length}):\n` + d.slice(0, 10).map((r: any) =>
          `- Run \`${r.runId || r.run_id}\` — ${r.status || 'unknown'} | $${(r.cost ?? 0).toFixed(2)} | ${r.created_at || r.createdAt || 'unknown date'}`
        ).join('\n');
      }
      case 'list_clients': {
        if (!Array.isArray(d) || d.length === 0) return 'No clients found.';
        return `**Clients** (${d.length}):\n` + d.map((c: any) =>
          `- ${c.name} (${c.slug}) — plan: ${c.plan || 'free'}, active: ${c.is_active}`
        ).join('\n');
      }
      case 'list_jira_stories': {
        if (!Array.isArray(d) || d.length === 0) return 'No JIRA stories found.';
        return `**JIRA Stories** (${d.length}):\n` + d.slice(0, 15).map((s: any) =>
          `- **${s.key}**: ${s.summary}`
        ).join('\n');
      }
      case 'get_run': {
        return `**Run Details**:\n- ID: ${d.runId || d.run_id}\n- Status: ${d.status || 'unknown'}\n- Stage: ${d.currentStage || 'N/A'}\n- Cost: $${(d.cost ?? 0).toFixed(2)}`;
      }
      case 'list_test_cases': {
        if (!Array.isArray(d) || d.length === 0) return 'No test cases found.';
        return `**Test Cases** (${d.length}):\n` + d.slice(0, 5).map((tc: any) =>
          `- ${tc.title || tc.name || 'Untitled'}`
        ).join('\n') + (d.length > 5 ? `\n...and ${d.length - 5} more` : '');
      }
      case 'get_platform_stats': {
        return `**Platform Stats**:\n- Clients: ${d.totalClients}\n- Users: ${d.totalUsers}\n- Total runs: ${d.totalRuns}\n- Total cost: $${(d.totalCost ?? 0).toFixed(2)}`;
      }
      case 'get_client_usage': {
        if (!Array.isArray(d) || d.length === 0) return 'No usage data available.';
        return `**Client Usage**:\n` + d.map((u: any) =>
          `- ${u.name || u.client_id}: ${u.total_runs || 0} runs, $${(u.total_cost ?? 0).toFixed(2)}`
        ).join('\n');
      }
      case 'start_worker':
        return `Worker start initiated.${d.pid ? ` PID: ${d.pid}` : ''}`;
      case 'stop_worker':
        return `Worker stop initiated (method: ${d.method || 'unknown'}).${d.method === 'heartbeat' ? ' Worker will stop within 30 seconds.' : ''}`;
      case 'restart_worker':
        return `Worker restart initiated (method: ${d.method || 'unknown'}).`;
      default:
        return 'Action completed successfully.';
    }
  } catch {
    return 'Action completed successfully.';
  }
}

/** One-time CLI diagnostic — logs whether claude is reachable. */
let diagnosed = false;
function diagnoseCLI(): void {
  if (diagnosed) return;
  diagnosed = true;
  try {
    const result = spawn.sync('claude', ['--version'], { env: cleanEnv() });
    if (result.status === 0 && result.stdout) {
      console.log(`[chatbot] Claude CLI: ${result.stdout.toString().trim()}`);
    } else {
      const err = result.stderr?.toString().slice(0, 200) || result.error?.message || 'unknown';
      console.error(`[chatbot] Claude CLI not working: ${err}`);
    }
  } catch (err: unknown) {
    console.error(`[chatbot] Claude CLI not found: ${err instanceof Error ? err.message : err}`);
  }
}

/** Build a clean env for Claude CLI — strips ALL Claude env vars to prevent nested-session detection. */
function cleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith('CLAUDE')) {
      delete env[key];
    }
  }
  return env;
}

/** Call Claude CLI with system prompt and user message piped via stdin.
 *  Windows cmd.exe cannot handle newlines or special chars ({, |, ?) in CLI args,
 *  so we combine system+user into one prompt and pipe it via stdin (-p -).
 *  See: https://github.com/anthropics/claude-code/issues/3411
 *
 *  Concurrency-limited: max MAX_CONCURRENT_CLAUDE simultaneous processes. */
async function callClaude(systemPrompt: string, userMessage: string, model: string, maxTurns = 1, timeoutMs = 30000): Promise<string | null> {
  // Acquire concurrency slot (wait up to 30s)
  const acquired = await acquireClaudeSlot(30000);
  if (!acquired) {
    console.error('[chatbot] Claude CLI queue full — all slots occupied');
    return null;
  }

  try {
    return await callClaudeInternal(systemPrompt, userMessage, model, maxTurns, timeoutMs);
  } finally {
    releaseClaudeSlot();
  }
}

/** Call Claude via Anthropic API — for clients configured with API keys.
 *  Returns text + token/cost metadata for usage tracking. */
async function callClaudeAPI(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  model: string,
  timeoutMs = 120000,
): Promise<{ text: string | null; inputTokens: number; outputTokens: number; costUsd: number }> {
  console.log(`[chatbot] Calling Anthropic API (model=${model}, timeout=${timeoutMs}ms)`);
  const result = await callAnthropicAPI(apiKey, systemPrompt, userMessage, model, 4096, timeoutMs);
  if (!result.success) {
    console.error(`[chatbot] API call failed: ${result.error}`);
    return { text: null, inputTokens: 0, outputTokens: 0, costUsd: 0 };
  }
  return {
    text: result.output,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd: result.costUsd,
  };
}

async function callClaudeInternal(systemPrompt: string, userMessage: string, model: string, maxTurns: number, timeoutMs: number): Promise<string | null> {
  console.log(`[chatbot] Calling Claude CLI (model=${model}, timeout=${timeoutMs}ms, active=${activeClaude}/${MAX_CONCURRENT_CLAUDE})`);
  return new Promise((resolve) => {
    const proc = spawn('claude', [
      '-p', '-',
      '--model', model,
      '--output-format', 'json',
      '--max-turns', String(maxTurns),
    ], { env: cleanEnv(), stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const done = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    const timer = setTimeout(() => {
      killProc(proc);
      console.error(`[chatbot] Claude CLI timed out (${timeoutMs}ms, model=${model})`);
      done(null);
    }, timeoutMs);

    // Register stdin error handler BEFORE writing (prevents unhandled pipe errors)
    proc.stdin?.on('error', (err) => {
      console.error('[chatbot] stdin write error:', err.message);
      killProc(proc);
      done(null);
    });

    // Pipe combined system+user prompt via stdin to avoid Windows arg escaping issues
    const combined = `<system>\n${systemPrompt}\n</system>\n\nUser message: ${userMessage}`;
    proc.stdin?.write(combined);
    proc.stdin?.end();

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
      if (stdout.length > MAX_BUFFER) {
        killProc(proc);
        console.error('[chatbot] Claude CLI output exceeded 10MB buffer');
        done(null);
      }
    });

    // Cap stderr buffer same as stdout (prevents OOM from huge stderr dumps)
    proc.stderr?.on('data', (data: Buffer) => {
      if (stderr.length < MAX_BUFFER) {
        stderr += data.toString();
      }
    });

    proc.on('error', (err: Error) => {
      console.error(`[chatbot] Claude CLI spawn error: ${err.message}`);
      done(null);
    });

    proc.on('close', (code: number | null) => {
      if (code !== 0 || !stdout.trim()) {
        const diagnosis = diagnoseCLIFailure(stderr);
        console.error(`[chatbot] Claude CLI exited (code=${code}, model=${model}, diagnosis=${diagnosis}): ${stderr.slice(0, 500)}`);
        done(null);
      } else {
        done(stdout);
      }
    });
  });
}

/** Strip markdown code fences from Claude response (```json ... ```) */
function stripCodeFences(s: string): string {
  return s.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
}

/** Parse Claude output — handles both raw JSON and wrapped response. */
function parseClaudeOutput(raw: string): ChatAskResponse | null {
  try {
    const parsed = JSON.parse(raw);
    // Claude --output-format json wraps in { result: "..." } or returns raw
    let content = typeof parsed.result === 'string' ? parsed.result : parsed;
    // Strip markdown code fences if present (common when system prompt is piped via stdin)
    if (typeof content === 'string') {
      content = stripCodeFences(content);
    }
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch {
        return { text: content, action: 'none', responseType: 'text' };
      }
    }
    if (content.text) return content;
    return { text: JSON.stringify(content), action: 'none', responseType: 'text' };
  } catch {
    return { text: raw.trim(), action: 'none', responseType: 'text' };
  }
}

const VALID_MODELS = new Set<string>(['haiku', 'sonnet', 'opus']);

/** Step 7: Main chat ask handler — role-aware tri-model routing with dual-mode execution. */
export async function chatAsk(req: ChatAskRequest): Promise<ChatAskResponse> {
  diagnoseCLI();
  const model: ChatModel = VALID_MODELS.has(req.model ?? '') ? (req.model as ChatModel) : 'sonnet';

  // 0. Resolve execution mode per client (defaults to CLI if no config)
  let execMode: 'cli' | 'api' = 'cli';
  let apiKey: string | undefined;
  if (req.clientId) {
    try {
      const resolved = await resolveExecutionMethod(req.clientId);
      if (resolved) {
        execMode = resolved.mode as 'cli' | 'api';
        apiKey = resolved.apiKey;
      }
    } catch (err) {
      console.error('[chatbot] Failed to resolve execution method, falling back to CLI:', (err as Error).message);
    }

    // Budget gate — block API calls if over budget
    if (execMode === 'api') {
      const budget = await checkBudget(req.clientId);
      if (!budget.allowed) {
        return {
          text: 'Monthly AI budget has been reached. Contact your administrator to increase the limit or switch to a different AI mode.',
          action: 'none',
          responseType: 'text',
          error: true,
        };
      }
    }
  }

  const useAPI = execMode === 'api' && !!apiKey;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;

  // 1. Gather role-appropriate context (all queries fail-safe)
  const context = await gatherContext(req);

  // 2. Build role-appropriate system prompt
  const systemPrompt = buildSystemPrompt(context, req.websiteContext);

  // 3. Haiku intent routing — dual mode (45s timeout + 1 retry for CLI)
  let haikuRaw: string | null;
  if (useAPI) {
    const r = await callClaudeAPI(apiKey!, systemPrompt, req.message, 'haiku', 45000);
    haikuRaw = r.text;
    totalInputTokens += r.inputTokens;
    totalOutputTokens += r.outputTokens;
    totalCost += r.costUsd;
  } else {
    haikuRaw = await callClaude(systemPrompt, req.message, 'haiku', 1, 45000)
      || await callClaude(systemPrompt, req.message, 'haiku', 1, 45000);
  }

  if (!haikuRaw) {
    const isDev = process.env.NODE_ENV !== 'production';
    return {
      text: isDev
        ? 'AI assistant failed to respond. Check backend console for [chatbot] errors. Is Claude CLI installed and authenticated? Run: claude --version'
        : 'AI assistant is temporarily unavailable. Use Dashboard for run history and Settings for configuration.',
      action: 'none',
      responseType: 'text',
      error: true,
    };
  }

  let response = parseClaudeOutput(haikuRaw);
  if (!response) {
    return { text: haikuRaw.trim(), action: 'none', responseType: 'text' };
  }

  // 4. Deep thinking if needed — dual mode
  if (response.needsDepth || model !== 'haiku') {
    const deepSystem = buildDeepSystemPrompt(context);
    const deepUserMsg = `Initial analysis: ${response.text}\n\nUser's question: ${req.message}`;

    if (useAPI) {
      const r = await callClaudeAPI(apiKey!, deepSystem, deepUserMsg, model, 90000);
      if (r.text) {
        const deepResp = parseClaudeOutput(r.text);
        if (deepResp) response = deepResp;
      }
      totalInputTokens += r.inputTokens;
      totalOutputTokens += r.outputTokens;
      totalCost += r.costUsd;
    } else {
      const deepRaw = await callClaude(deepSystem, deepUserMsg, model, 3, 90000);
      if (deepRaw) {
        const deepResp = parseClaudeOutput(deepRaw);
        if (deepResp) response = deepResp;
      }
    }
    // If deep call fails, haiku response is still valid as fallback
  }

  // 5. Record API usage (fire-and-forget — never breaks chat response)
  if (useAPI && req.clientId && totalCost > 0) {
    recordUsage(
      req.clientId, 'chatbot', 'api', model,
      totalInputTokens, totalOutputTokens, totalCost,
    ).catch(err => console.error('[chatbot] Failed to record usage:', (err as Error).message));
  }

  // 6. Execute action with role validation (defense in depth)
  if (response.action && response.action !== 'none') {
    const result = await executeAction(response.action, response.params || {}, req, context);
    if (result.success && result.data !== undefined) {
      response.data = result.data;
      // For data-returning actions, format the result as readable text (Edge Case M)
      const dataActions = ['list_runs', 'list_clients', 'get_run', 'list_jira_stories', 'list_test_cases', 'get_platform_stats', 'get_client_usage', 'start_worker', 'stop_worker', 'restart_worker'];
      if (dataActions.includes(response.action)) {
        response.text = formatActionData(response.action, result.data);
      }
    } else if (!result.success) {
      // Replace the optimistic text entirely — don't show "Starting X..." + error simultaneously
      response.text = `⚠️ ${result.error}`;
      response.error = true;
    }
    // Preserve runId for trigger_run
    if (response.action === 'trigger_run' && result.success && result.data) {
      response.runId = (result.data as any).runId;
    }
  }

  return response;
}
