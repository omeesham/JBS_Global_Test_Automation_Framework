#!/usr/bin/env ts-node
// --- Crash protection: worker exits on uncaught exceptions (process manager restarts it) ---
process.on('uncaughtException', (err) => {
  console.error('[Worker FATAL] Uncaught exception:', err);
  process.exit(1); // Let process manager restart
});
process.on('unhandledRejection', (reason) => {
  console.error('[Worker FATAL] Unhandled rejection:', reason);
  // Don't exit on rejections — worker loop catches these
});

/**
 * Local Pipeline Worker — runs on your machine, polls backend, executes Claude CLI.
 *
 * Phase 0 MVP: Uses Claude CLI with Max subscription (zero API billing).
 * Production upgrade: Switch agentRunner to "sdk" + add ANTHROPIC_API_KEY.
 *
 * Usage:
 *   npx ts-node src/worker/index.ts
 *   # or via npm script:
 *   npm run worker:start
 *
 * Environment:
 *   BACKEND_URL        — Backend API URL (default: http://localhost:3001)
 *   WORKER_SECRET      — Shared secret for worker auth (default: dev-secret)
 *   WORKER_ID          — Worker identifier (default: local-worker-1)
 */

import dotenvFlow from 'dotenv-flow';
dotenvFlow.config({ path: './config/environments' });

import { execFileSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { PipelineDefinition } from '../orchestrator/types';
import { callAnthropicAPI } from './sdk-executor';

// ── Config ──

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const WEBSITE_BACKEND_URL = process.env.WEBSITE_BACKEND_URL || 'http://localhost:3001';
const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';
const WORKER_ID = process.env.WORKER_ID || 'local-worker-1';

// Dual-mode config
const WORKER_TYPE = (process.env.WORKER_TYPE || 'cli_dedicated') as 'cli_dedicated' | 'api_shared';
const WORKER_CLIENT_ID = process.env.WORKER_CLIENT_ID || null; // For CLI dedicated workers

interface TaskResponse {
  taskId: string;
  stageId: string;
  agentPrompt: string;
  context: Record<string, unknown> | null;
  runId: string;
  clientId: string | null;
  stageConfig: {
    model: string;
    maxTurns: number;
    timeoutSeconds: number;
    budgetCap: number;
    agentFile: string;
  } | null;
}

// ── Load config from backend ──

let config: PipelineDefinition['defaults'] | null = null;

async function loadConfig(): Promise<PipelineDefinition['defaults']> {
  if (config) return config;

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/pipeline-definition`);
    if (res.ok) {
      const definition = await res.json() as PipelineDefinition;
      config = definition.defaults;
      return config;
    }
  } catch {
    // Fall back to local file
  }

  // Fallback: read local pipeline-definition.json
  const localPath = path.join(__dirname, '../../config/pipeline-definition.json');
  if (fs.existsSync(localPath)) {
    const definition = JSON.parse(fs.readFileSync(localPath, 'utf-8')) as PipelineDefinition;
    config = definition.defaults;
    return config;
  }

  // Hardcoded defaults (only worker-relevant fields used at runtime)
  return {
    model: 'sonnet',
    maxTurnsPerStage: 50,
    budgetPerRunUsd: 2.00,
    budgetPerStageUsd: 0.50,
    workerPollIntervalMs: 5000,
    workerHeartbeatIntervalMs: 30000,
    cliPath: 'claude',
    cliOutputFormat: 'json',
    agentRunner: 'cli' as const,
    autoInvoke: true,
  };
}

// ── HTTP helpers ──

const headers = {
  'x-worker-secret': WORKER_SECRET,
  'content-type': 'application/json',
};

async function pollForTask(): Promise<TaskResponse | null> {
  try {
    // CLI dedicated workers filter by client_id; shared workers get any task
    const url = WORKER_CLIENT_ID
      ? `${BACKEND_URL}/api/worker/next-task?client_id=${encodeURIComponent(WORKER_CLIENT_ID)}`
      : `${BACKEND_URL}/api/worker/next-task`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`[Worker] Poll failed: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data as TaskResponse | null;
  } catch (err) {
    console.error(`[Worker] Poll error: ${(err as Error).message}`);
    return null;
  }
}

async function completeTask(
  taskId: string,
  success: boolean,
  result: Record<string, unknown>,
  artifacts?: Array<{ name: string; type: string; content: string }>,
  cost?: number,
): Promise<void> {
  // Retry up to 3 times with 2s backoff — task was already executed, losing completion is critical
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/worker/complete-task`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ taskId, success, result, artifacts, cost }),
      });
      if (res.ok) return;
      console.error(`[Worker] completeTask attempt ${attempt}/3 failed: HTTP ${res.status}`);
    } catch (err) {
      console.error(`[Worker] completeTask attempt ${attempt}/3 error: ${(err as Error).message}`);
    }
    if (attempt < 3) await sleep(2000);
  }
  console.error(`[Worker] CRITICAL: Task ${taskId} executed but could not be marked complete. Manual intervention required.`);
}

async function sendHeartbeat(currentTaskId?: string): Promise<void> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/worker/heartbeat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ workerId: WORKER_ID, currentTaskId }),
    });
    if (res.ok) {
      const body = await res.json() as { ok: boolean; command?: string };
      if (body.command === 'stop' || body.command === 'restart') {
        console.log(`[Worker] Received '${body.command}' command from server. Shutting down gracefully.`);
        running = false;
      }
    }
  } catch {
    // Non-fatal
  }
}

// ── Agent File Loading ──

type StageArtifact = { name: string; type: string; content: string };

function loadAgentFile(agentFile: string): string | null {
  const agentPath = path.resolve(__dirname, '../../', agentFile);
  try {
    let content = fs.readFileSync(agentPath, 'utf-8');
    // Strip YAML frontmatter (GitHub Copilot format — not actionable by Claude CLI)
    if (content.startsWith('---')) {
      const endIdx = content.indexOf('---', 3);
      if (endIdx !== -1) content = content.slice(endIdx + 3).trim();
    }
    console.log(`[Worker] Loaded agent file: ${agentFile} (${content.length} chars)`);
    return content;
  } catch {
    console.warn(`[Worker] Agent file not found: ${agentPath}, using thin prompt`);
    return null;
  }
}

// ── CLI Execution (streaming via spawn) ──

// Progress reporting: sends high-level status messages to backend for SSE broadcast
const PROGRESS_INTERVAL_MS = 5000; // Don't flood — max 1 progress event per 5s

function createProgressReporter(task: TaskResponse) {
  let lastTime = 0;

  return async function reportProgress(message: string): Promise<void> {
    const now = Date.now();
    if (now - lastTime < PROGRESS_INTERVAL_MS) return;
    lastTime = now;

    try {
      await fetch(`${BACKEND_URL}/api/worker/progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          taskId: task.taskId,
          runId: task.runId,
          stage: task.stageId,
          message,
        }),
      });
    } catch {
      // Non-fatal — progress updates are best-effort
    }
  };
}

// Extract a user-safe progress message from CLI output lines.
// NEVER expose raw code, prompts, or internal details.
function extractProgressMessage(line: string, stageId: string): string | null {
  const lower = line.toLowerCase();

  // Skip empty, JSON-only, or overly technical lines
  if (!line.trim() || line.trim().startsWith('{') || line.trim().startsWith('[')) return null;
  if (lower.includes('api key') || lower.includes('secret') || lower.includes('token')) return null;

  // Map common Claude CLI patterns to user-friendly messages
  if (lower.includes('reading file') || lower.includes('read tool')) return `Reading project files...`;
  if (lower.includes('writing file') || lower.includes('write tool')) return `Writing output files...`;
  if (lower.includes('searching') || lower.includes('grep') || lower.includes('glob')) return `Searching codebase...`;
  if (lower.includes('running') || lower.includes('executing') || lower.includes('bash')) return `Running commands...`;
  if (lower.includes('analyzing') || lower.includes('processing')) return `Analyzing ${stageId}...`;

  // Generic fallback for long-running stages
  return `Working on ${stageId}...`;
}

async function executeClaudeCliStage(
  task: TaskResponse,
  cliConfig: PipelineDefinition['defaults'],
): Promise<{ success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] }> {
  const { agentPrompt, stageConfig } = task;

  // Dry run: skip agent file to prevent real work
  const isDryRun = task.context?.dryRun === true;

  // Load full agent instructions from .agent.md file (skipped for dry runs)
  const agentInstructions = (!isDryRun && stageConfig?.agentFile) ? loadAgentFile(stageConfig.agentFile) : null;
  const fullPrompt = agentInstructions
    ? agentInstructions + '\n\n---\n\nPIPELINE CONTEXT:\n' + agentPrompt
    : agentPrompt;

  // Build args — prompt piped via stdin to avoid Windows 32k CLI arg limit.
  // Claude CLI reads from stdin when '-p' is given '-' as the value.
  const cliArgs: string[] = [
    '-p', '-',
    '--output-format', cliConfig.cliOutputFormat,
  ];

  if (stageConfig) {
    cliArgs.push('--max-turns', String(isDryRun ? 1 : stageConfig.maxTurns));
    cliArgs.push('--model', stageConfig.model);
  }

  const promptPreview = agentPrompt.length > 80 ? agentPrompt.slice(0, 80) + '...' : agentPrompt;
  console.log(`[Worker] Executing: ${cliConfig.cliPath} -p - (stdin ${fullPrompt.length} chars) --output-format ${cliConfig.cliOutputFormat}${stageConfig ? ` --model ${stageConfig.model} --max-turns ${stageConfig.maxTurns}` : ''}`);

  const timeout = (stageConfig?.timeoutSeconds || 600) * 1000;

  return new Promise((resolve) => {
    const reportProgress = createProgressReporter(task);

    const child = spawn(cliConfig.cliPath, cliArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    // Pipe prompt via stdin to avoid Windows arg length limits
    child.stdin.write(fullPrompt);
    child.stdin.end();

    let stdout = '';
    let stderr = '';

    // Stream stdout — collect full output + extract progress messages
    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf-8');
      stdout += text;

      // Extract and report progress (best-effort, non-blocking)
      const lines = text.split('\n');
      for (const line of lines) {
        const msg = extractProgressMessage(line, task.stageId);
        if (msg) {
          reportProgress(msg).catch(() => {});
        }
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8');
    });

    // Manual timeout enforcement (spawn doesn't support timeout natively)
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      // Give 5s grace period then force kill
      setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 5000);
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);

      if (code !== 0 && !stdout.trim()) {
        // Non-zero exit with no stdout = failure
        console.error(`[Worker] CLI execution failed: exit code ${code}`);
        const errorArtifacts: StageArtifact[] = [{
          name: `${task.stageId}-error.txt`,
          type: 'text',
          content: (`Exit code: ${code}\n${stderr}`).slice(0, 50_000),
        }];
        resolve({
          success: false,
          result: { error: `CLI exited with code ${code}`, exitCode: code, stderr: stderr.slice(0, 5000) },
          cost: 0,
          artifacts: errorArtifacts,
        });
        return;
      }

      // Try to parse JSON output
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(stdout);
      } catch {
        parsed = { rawOutput: stdout.slice(0, 10000) };
      }

      // Capture output as artifact for dashboard visibility
      const artifacts: StageArtifact[] = [{
        name: `${task.stageId}-output.json`,
        type: 'json',
        content: JSON.stringify(parsed, null, 2).slice(0, 50_000),
      }];

      resolve({
        success: true,
        result: parsed,
        cost: 0, // CLI with Max sub = $0 API cost
        artifacts,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      console.error(`[Worker] CLI spawn failed: ${err.message}`);
      const errorArtifacts: StageArtifact[] = [{
        name: `${task.stageId}-error.txt`,
        type: 'text',
        content: err.message.slice(0, 50_000),
      }];
      resolve({
        success: false,
        result: { error: err.message },
        cost: 0,
        artifacts: errorArtifacts,
      });
    });
  });
}

// ── Pre-flight Checks ──

async function preflight(): Promise<boolean> {
  const skipPreflight = process.env.SKIP_PREFLIGHT === 'true';
  if (skipPreflight) {
    console.log('[Worker] Pre-flight checks skipped (SKIP_PREFLIGHT=true)');
    return true;
  }

  // API-only workers don't need CLI checks
  if (WORKER_TYPE === 'api_shared') {
    console.log('[Worker] Pre-flight: API worker — skipping CLI checks');
    return true;
  }

  // Check 1: Claude CLI exists on PATH
  try {
    execFileSync('claude', ['--version'], { timeout: 10000, encoding: 'utf-8' });
    console.log('[Worker] Pre-flight: Claude CLI found');
  } catch {
    console.error('[Worker] Pre-flight FAILED: Claude CLI not found on PATH');
    console.error('[Worker] Install Claude Code: https://docs.anthropic.com/claude-code');
    console.error('[Worker] Ensure "claude" is on your PATH');
    return false;
  }

  // Check 2: Claude CLI is authenticated
  try {
    execFileSync('claude', ['-p', 'respond with just the word OK', '--output-format', 'json', '--max-turns', '1'], {
      timeout: 30000,
      encoding: 'utf-8',
    });
    console.log('[Worker] Pre-flight: Claude CLI authenticated');
  } catch (err) {
    console.error('[Worker] Pre-flight FAILED: Claude CLI auth failed');
    console.error('[Worker] Run: claude login');
    console.error(`[Worker] Error: ${(err as Error).message}`);
    return false;
  }

  // Check 3: Backend is reachable
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    if (res.ok) {
      console.log('[Worker] Pre-flight: Backend reachable');
    } else {
      console.warn('[Worker] Pre-flight: Backend returned non-OK. Starting anyway...');
    }
  } catch {
    console.warn('[Worker] Pre-flight: Backend unreachable. Will retry on poll...');
  }

  return true;
}

// ── Stale Task Recovery ──

async function recoverStaleTasks(): Promise<void> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/worker/recover-stale`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ workerId: WORKER_ID, staleMinutes: 30 }),
    });
    if (res.ok) {
      const data = await res.json() as { recovered: number };
      if (data.recovered > 0) {
        console.log(`[Worker] Recovered ${data.recovered} stale tasks`);
      }
    }
  } catch {
    // Non-fatal — backend may not support this endpoint yet
    console.warn('[Worker] Stale task recovery skipped (endpoint unavailable)');
  }
}

// ── Main Worker Loop ──

let running = true;

async function workerLoop(): Promise<void> {
  // Run pre-flight checks
  const ready = await preflight();
  if (!ready) {
    console.error('[Worker] Pre-flight failed. Fix issues above and restart.');
    process.exit(1);
  }

  // Recover tasks stuck in 'claimed'/'running' from previous crashes
  await recoverStaleTasks();

  const cfg = await loadConfig();
  let currentTaskId: string | undefined;

  console.log(`[Worker] Starting with config:`, {
    backendUrl: BACKEND_URL,
    websiteBackendUrl: WEBSITE_BACKEND_URL,
    workerId: WORKER_ID,
    workerType: WORKER_TYPE,
    clientId: WORKER_CLIENT_ID || '(shared)',
    pollInterval: cfg.workerPollIntervalMs,
    heartbeatInterval: cfg.workerHeartbeatIntervalMs,
    agentRunner: cfg.agentRunner,
  });

  // Heartbeat interval
  const heartbeatTimer = setInterval(() => {
    sendHeartbeat(currentTaskId);
  }, cfg.workerHeartbeatIntervalMs);

  // Initial heartbeat
  await sendHeartbeat();

  while (running) {
    try {
      const task = await pollForTask();

      if (!task) {
        await sleep(cfg.workerPollIntervalMs);
        continue;
      }

      currentTaskId = task.taskId;
      console.log(`[Worker] Picked up task ${task.taskId} for stage "${task.stageId}" (run: ${task.runId})`);

      // Execute based on worker type and agentRunner config
      let result: { success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] };

      if (WORKER_TYPE === 'api_shared' || cfg.agentRunner === 'sdk') {
        // API mode — resolve execution config for this client
        result = await executeClaudeSdkStage(task);
      } else {
        // CLI mode (default)
        result = await executeClaudeCliStage(task, cfg);

        // Rate limit detection: check for rate limit errors in CLI output
        if (!result.success && isRateLimitError(result.result)) {
          console.warn(`[Worker] CLI rate limit detected for client ${task.clientId}`);
          // Attempt overflow to API if client supports it
          const overflowResult = await attemptApiOverflow(task);
          if (overflowResult) {
            result = overflowResult;
          }
        }
      }

      // Enforce dryRun flag in result — orchestrator uses this for routing
      // Safety net: even if Claude doesn't return dryRun, worker guarantees it
      if (task.context?.dryRun) {
        result.result = { ...result.result, dryRun: true };
      }

      console.log(`[Worker] Task ${task.taskId} completed: ${result.success ? 'SUCCESS' : 'FAIL'}${task.context?.dryRun ? ' (DRY RUN)' : ''}`);

      await completeTask(task.taskId, result.success, result.result, result.artifacts, result.cost);
      currentTaskId = undefined;
    } catch (err) {
      console.error(`[Worker] Loop error:`, (err as Error).message);
      await sleep(cfg.workerPollIntervalMs);
    }
  }

  clearInterval(heartbeatTimer);
  console.log('[Worker] Shutting down');
}

// ── SDK Execution (API mode) ──

async function executeClaudeSdkStage(
  task: TaskResponse,
): Promise<{ success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] }> {
  const clientId = task.clientId;
  if (!clientId) {
    return { success: false, result: { error: 'No clientId on task — cannot resolve API key' }, cost: 0, artifacts: [] };
  }

  // Resolve execution config from website backend
  type ResolvedConfig = { mode: string; apiKey?: string; model?: string };
  let resolved: ResolvedConfig | null = null;
  try {
    const res = await fetch(`${WEBSITE_BACKEND_URL}/api/ai/internal/resolve/${clientId}`, {
      headers: { 'x-worker-secret': WORKER_SECRET },
    });
    if (res.ok) resolved = await res.json() as ResolvedConfig;
  } catch {
    // Fall back to env API key
  }

  const apiKey = resolved?.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { success: false, result: { error: 'No API key available for SDK execution' }, cost: 0, artifacts: [] };
  }

  const model = task.stageConfig?.model || resolved?.model || 'sonnet';
  const timeout = (task.stageConfig?.timeoutSeconds || 600) * 1000;

  // Dry run: skip agent file (same as CLI path)
  const isDryRunSdk = task.context?.dryRun === true;

  // Load full agent instructions into system message (skipped for dry runs)
  const agentInstructions = (!isDryRunSdk && task.stageConfig?.agentFile) ? loadAgentFile(task.stageConfig.agentFile) : null;
  const systemMessage = agentInstructions
    ? agentInstructions + '\n\n---\n\nPipeline Stage: ' + task.stageId
    : `Pipeline Stage: ${task.stageId}`;

  console.log(`[Worker] SDK execution for client ${clientId} (model=${model})`);

  const sdkResult = await callAnthropicAPI(
    apiKey,
    model,
    systemMessage,
    task.agentPrompt,
    4096,
    timeout,
  );

  if (!sdkResult.success) {
    const errorArtifacts: StageArtifact[] = [{
      name: `${task.stageId}-error.txt`,
      type: 'text',
      content: (sdkResult.error || 'Unknown SDK error').slice(0, 50_000),
    }];
    return {
      success: false,
      result: { error: sdkResult.error, inputTokens: sdkResult.inputTokens, outputTokens: sdkResult.outputTokens },
      cost: sdkResult.costUsd,
      artifacts: errorArtifacts,
    };
  }

  // Parse output
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(sdkResult.output);
  } catch {
    parsed = { rawOutput: sdkResult.output.slice(0, 10000) };
  }

  const artifacts: StageArtifact[] = [{
    name: `${task.stageId}-output.json`,
    type: 'json',
    content: JSON.stringify(parsed, null, 2).slice(0, 50_000),
  }];

  return {
    success: true,
    result: { ...parsed, inputTokens: sdkResult.inputTokens, outputTokens: sdkResult.outputTokens },
    cost: sdkResult.costUsd,
    artifacts,
  };
}

// ── Rate Limit Detection ──

function isRateLimitError(result: Record<string, unknown>): boolean {
  const stderr = String(result.stderr || '').toLowerCase();
  const error = String(result.error || '').toLowerCase();
  return stderr.includes('rate limit') || stderr.includes('too many requests')
    || error.includes('rate limit') || error.includes('too many requests');
}

async function attemptApiOverflow(
  task: TaskResponse,
): Promise<{ success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] } | null> {
  if (!task.clientId) return null;

  try {
    // Check if client has overflow configured
    const res = await fetch(`${WEBSITE_BACKEND_URL}/api/ai/internal/resolve/${task.clientId}`, {
      headers: { 'x-worker-secret': WORKER_SECRET },
    });
    if (!res.ok) return null;

    const resolved = await res.json() as { mode: string; apiKey?: string; model?: string };
    if (!resolved.apiKey) return null;

    console.log(`[Worker] Overflow to API for client ${task.clientId}`);
    return await executeClaudeSdkStage(task);
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Graceful shutdown
process.on('SIGINT', () => { running = false; });
process.on('SIGTERM', () => { running = false; });

// Start
workerLoop().catch(err => {
  console.error('[Worker] Fatal error:', err);
  process.exit(1);
});
