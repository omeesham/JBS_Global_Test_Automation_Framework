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
 *   BACKEND_URL        — Backend API URL (default: http://localhost:3100)
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

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3100';
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
    mcpConfig: string | null;
    allowedTools?: string[];
    effort?: 'low' | 'medium' | 'high' | 'max';
    postCompleteGate?: string;
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
    // Strip YAML frontmatter (VS Code Copilot extension format)
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

const PROGRESS_INTERVAL_MS = 2000;

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
      // Non-fatal
    }
  };
}

function extractProgressMessage(line: string, stageId: string): string | null {
  const lower = line.toLowerCase();
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('{') || trimmed.startsWith('[')) return null;
  if (lower.includes('api key') || lower.includes('secret') || lower.includes('token')) return null;
  if (lower.includes('error:') && lower.includes('enoent')) return null;

  if (lower.includes('browser_navigate') || lower.includes('navigating to')) return `Navigating to the page...`;
  if (lower.includes('browser_snapshot') || lower.includes('taking snapshot')) return `Capturing current page state...`;
  if (lower.includes('browser_click')) return `Clicking an element on the page...`;
  if (lower.includes('browser_fill')) return `Filling in a form field...`;
  if (lower.includes('browser_select')) return `Selecting a dropdown option...`;

  if (lower.includes('reading file') || lower.includes('read tool')) return `Reading project files...`;
  if (lower.includes('writing file') || lower.includes('write tool')) {
    const match = trimmed.match(/(?:writing|wrote|created?)\s+(?:file\s+)?['"]?([^\s'"]+\.(?:ts|md|json))/i);
    if (match) { const fname = match[1]!.split('/').pop(); return `Creating ${fname ?? match[1]!}...`; }
    return `Writing output files...`;
  }

  if (lower.includes('test case') || lower.includes('tc-')) {
    const tcMatch = trimmed.match(/TC-[A-Z]+-[A-Z]+-\d+/i);
    if (tcMatch) return `Working on test case ${tcMatch[0]!}...`;
    return `Building test cases...`;
  }
  if (lower.includes('selector') && (lower.includes('found') || lower.includes('creating') || lower.includes('mapping'))) return `Mapping page selectors...`;
  if (lower.includes('spec') && (lower.includes('generat') || lower.includes('creat') || lower.includes('writing'))) return `Generating test script...`;
  if (lower.includes('assert') || lower.includes('expect(')) return `Adding test assertions...`;

  if (lower.includes('searching') || lower.includes('grep') || lower.includes('glob')) return `Searching the codebase...`;

  if (lower.includes('running') || lower.includes('executing') || lower.includes('bash')) return `Running a command...`;
  if (lower.includes('analyzing') || lower.includes('processing')) return `Analyzing ${stageId} artifacts...`;

  if (lower.includes('complete') || lower.includes('finished') || lower.includes('done')) return `Finishing up ${stageId}...`;
  if (lower.includes('saving') || lower.includes('persisting')) return `Saving results...`;

  return null;
}

function verifyStageOutput(stageId: string, context: Record<string, unknown> | null): {
  hasOutput: boolean; expected: string[];
} {
  const mod = String(context?.module || '');
  if (!mod || mod === 'chat' || mod === 'chat-launch') return { hasOutput: true, expected: [] };
  const root = process.cwd();
  const checks: Record<string, string[]> = {
    planning: [`specs_planning/test-cases/${mod}`, `src/selectors/${mod}`],
    generation: [`tests/specs/${mod}`],
    requirements: ['docs/REQUIREMENTS.md'],
  };
  const expected = checks[stageId] || [];
  for (const p of expected) {
    const full = path.join(root, p);
    if (fs.existsSync(full)) {
      const stat = fs.statSync(full);
      if (stat.isDirectory() && fs.readdirSync(full).length > 0) return { hasOutput: true, expected };
      if (stat.isFile()) return { hasOutput: true, expected };
    }
  }
  return { hasOutput: expected.length === 0, expected };
}

/**
 * Returns a compliance enforcement suffix for the agent prompt.
 * This tells the agent exactly what the post-complete gate will verify,
 * so it cannot skip mandatory structural sections.
 * In Copilot, the user enforces compliance by reading output in real-time.
 * In CLI mode, this suffix is the equivalent — the agent knows it will be rejected
 * if it skips these requirements.
 */
function getComplianceSuffix(stageId: string): string {
  if (stageId === 'planning') {
    return `

---

MANDATORY OUTPUT COMPLIANCE (POST-COMPLETE GATE WILL REJECT IF MISSING):

Your output file WILL be automatically validated. The following checks are HARD GATES
that will cause your work to be REJECTED and you will have to redo everything:

1. STRUCT-001: Test case file MUST contain a "## FIELD INVENTORY" section with a markdown table
   listing every editable field (name, type, default value, state, data-testid). Add it AFTER
   the MCP_VERIFICATION_LOG section, BEFORE the first TC.

2. STRUCT-002: Test case file MUST contain a "## Validation Rules" section. If no validation
   exists (e.g., checkboxes only), write: "## Validation Rules\\nN/A — [reason]".

3. STRUCT-003: Test case file MUST contain a "## MCP_VERIFICATION_LOG" section with at minimum
   "| Date |" and "| Selector verification |" rows.

4. STRUCT-004: The "Updated:" date in the test case file MUST match the test plan file date.
   Update BOTH files to today's date.

5. COVERAGE-001: You must have at least 1.5x TCs per field. 5 fields = minimum 8 TCs.
   Each editable field needs its own save+persist TC.

6. PLN-004 CHECKBOX RULE: Every checkbox must appear in ≥2 TC sections (toggle + default state).
   Do NOT only test 2 out of 5 checkboxes — test ALL of them individually.

7. SELF-AUDIT: Before completing, verify your output matches ALL of the above. The gate checks
   selfAuditPassed=true in the queue item — set it only after confirming compliance.

DO NOT skip any of these. The post-complete gate runs automatically after you finish and will
hard-reject non-compliant output. There is no --force bypass for structural checks.`;
  }

  // Other stages can have their own compliance suffixes in the future
  return '';
}

async function executeClaudeCliStage(
  task: TaskResponse,
  cliConfig: PipelineDefinition['defaults'],
): Promise<{ success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] }> {
  const { agentPrompt, stageConfig } = task;

  const isDryRun = task.context?.dryRun === true;

  const agentInstructions = (!isDryRun && stageConfig?.agentFile) ? loadAgentFile(stageConfig.agentFile) : null;

  // Build compliance enforcement suffix — tells the agent exactly what the
  // post-complete gate will check, so it cannot skip mandatory sections.
  // This compensates for the lack of human-in-the-loop oversight in CLI mode.
  const complianceSuffix = getComplianceSuffix(task.stageId);

  const fullPrompt = agentInstructions
    ? agentInstructions + '\n\n---\n\nPIPELINE CONTEXT:\n' + agentPrompt + complianceSuffix
    : agentPrompt;

  // Prompt piped via stdin to avoid Windows 32k CLI arg limit
  const cliArgs: string[] = [
    '-p', '-',
    '--output-format', cliConfig.cliOutputFormat,
  ];

  if (stageConfig) {
    cliArgs.push('--max-turns', String(isDryRun ? 1 : stageConfig.maxTurns));
    cliArgs.push('--model', stageConfig.model);
  }

  // Auto-approve tools to prevent permission prompts from blocking
  const allowedTools = stageConfig?.allowedTools || ['Bash', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'mcp__*'];
  for (const tool of allowedTools) {
    cliArgs.push('--allowedTools', tool);
  }

  if (stageConfig?.effort) {
    cliArgs.push('--effort', stageConfig.effort);
  }

  // Pre-install Playwright browser if MCP config requires it
  if (stageConfig?.mcpConfig) {
    try {
      console.log('[Worker] Ensuring Playwright browser is installed...');
      execFileSync('npx', ['playwright', 'install', 'chromium'], {
        cwd: path.resolve(__dirname, '../..'),
        timeout: 120_000,
        stdio: 'pipe',
        shell: true,
      });
      console.log('[Worker] Playwright browser ready');
    } catch (err) {
      console.warn(`[Worker] Playwright install warning: ${(err as Error).message?.slice(0, 200)}`);
    }
  }

  // Generate per-task MCP config if stage has mcpConfig
  let tempMcpPath: string | null = null;
  if (stageConfig?.mcpConfig) {
    const templatePath = path.resolve(__dirname, `../../config/mcp/${stageConfig.mcpConfig}.json.template`);
    if (fs.existsSync(templatePath)) {
      let template = fs.readFileSync(templatePath, 'utf-8');
      const targetUrl = (task.context as Record<string, unknown>)?.targetUrl as string || '';
      template = template.replace(/\{\{BASE_URL\}\}/g, targetUrl);

      const tmpDir = path.resolve(__dirname, '../../.tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      tempMcpPath = path.resolve(tmpDir, `mcp-${task.taskId}.json`);
      fs.writeFileSync(tempMcpPath, template);
      cliArgs.push('--mcp-config', tempMcpPath);
      console.log(`[Worker] MCP config generated: ${tempMcpPath}`);
    }
  }

  console.log(`[Worker] Executing: ${cliConfig.cliPath} -p - (stdin ${fullPrompt.length} chars)`);

  const timeout = (stageConfig?.timeoutSeconds || 600) * 1000;

  return new Promise((resolve) => {
    const reportProgress = createProgressReporter(task);

    const child = spawn(cliConfig.cliPath, cliArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
      shell: true,
    });

    // Pipe prompt via stdin
    child.stdin.write(fullPrompt);
    child.stdin.end();

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf-8');
      stdout += text;

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

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 5000);
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);

      if (tempMcpPath && fs.existsSync(tempMcpPath)) {
        try { fs.unlinkSync(tempMcpPath); } catch { /* best-effort */ }
      }

      if (code !== 0 && !stdout.trim()) {
        console.error(`[Worker] CLI execution failed: exit code ${code}`);
        resolve({
          success: false,
          result: { error: `CLI exited with code ${code}`, exitCode: code, stderr: stderr.slice(0, 5000) },
          cost: 0,
          artifacts: [{ name: `${task.stageId}-error.txt`, type: 'text', content: (`Exit code: ${code}\n${stderr}`).slice(0, 50_000) }],
        });
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(stdout);
      } catch {
        parsed = { rawOutput: stdout.slice(0, 10000) };
      }

      // Verify output files were actually written to disk
      const outputCheck = verifyStageOutput(task.stageId, task.context);
      if (!outputCheck.hasOutput) {
        console.warn(`[Worker] WARNING: Stage "${task.stageId}" exited 0 but no output files found at: ${outputCheck.expected.join(', ')}`);
        parsed._noFilesWritten = true;
        parsed._expectedPaths = outputCheck.expected;
      }

      // Auto-run post-complete gate after successful agent execution
      if (stageConfig?.postCompleteGate) {
        const gatePath = path.resolve(__dirname, `../../scripts/${stageConfig.postCompleteGate}`);
        if (fs.existsSync(gatePath)) {
          const moduleId = (task.context as Record<string, unknown>)?.module as string || '';
          try {
            execFileSync('npx', ['tsx', gatePath, moduleId], {
              cwd: path.resolve(__dirname, '../..'),
              timeout: 60_000,
              stdio: 'pipe',
              shell: true,
            });
            console.log(`[Worker] Post-complete gate passed: ${stageConfig.postCompleteGate}`);
            parsed._postCompleteGatePassed = true;
          } catch (gateErr) {
            const gateStderr = (gateErr as { stderr?: Buffer })?.stderr?.toString() ?? '';
            console.error(`[Worker] Post-complete gate FAILED: ${stageConfig.postCompleteGate}`);
            console.error(`[Worker] Gate output: ${gateStderr.slice(0, 500)}`);
            parsed._postCompleteGatePassed = false;
            parsed._postCompleteGateError = gateStderr.slice(0, 2000);
          }
        }
      }

      resolve({
        success: true,
        result: parsed,
        cost: 0,
        artifacts: [{ name: `${task.stageId}-output.json`, type: 'json', content: JSON.stringify(parsed, null, 2).slice(0, 50_000) }],
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      console.error(`[Worker] CLI spawn failed: ${err.message}`);
      resolve({
        success: false,
        result: { error: err.message },
        cost: 0,
        artifacts: [{ name: `${task.stageId}-error.txt`, type: 'text', content: err.message.slice(0, 50_000) }],
      });
    });
  });
}

// ── Pre-flight Checks ──

async function preflight(): Promise<boolean> {
  if (process.env.SKIP_PREFLIGHT === 'true') {
    console.log('[Worker] Pre-flight checks skipped (SKIP_PREFLIGHT=true)');
    return true;
  }

  if (WORKER_TYPE === 'api_shared') {
    console.log('[Worker] Pre-flight: API worker — skipping CLI checks');
    return true;
  }

  try {
    execFileSync('claude', ['--version'], { timeout: 10000, encoding: 'utf-8', shell: true });
    console.log('[Worker] Pre-flight: Claude CLI found');
  } catch {
    console.error('[Worker] Pre-flight FAILED: Claude CLI not found on PATH');
    return false;
  }

  try {
    execFileSync('claude', ['-p', 'respond with just the word OK', '--output-format', 'json', '--max-turns', '1'], {
      timeout: 30000, encoding: 'utf-8', shell: true,
    });
    console.log('[Worker] Pre-flight: Claude CLI authenticated');
  } catch (err) {
    console.error('[Worker] Pre-flight FAILED: Claude CLI auth failed');
    console.error(`[Worker] Error: ${(err as Error).message}`);
    return false;
  }

  // Pre-install Playwright browser for MCP-dependent stages
  try {
    execFileSync('npx', ['playwright', 'install', 'chromium'], {
      timeout: 120_000,
      stdio: 'pipe',
      shell: true,
      cwd: path.resolve(__dirname, '../..'),
    });
    console.log('[Worker] Pre-flight: Playwright browser installed');
  } catch {
    console.warn('[Worker] Pre-flight: Playwright install failed — MCP stages may fail');
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    if (res.ok) console.log('[Worker] Pre-flight: Backend reachable');
    else console.warn('[Worker] Pre-flight: Backend returned non-OK. Starting anyway...');
  } catch {
    console.warn('[Worker] Pre-flight: Backend unreachable. Will retry on poll...');
  }

  return true;
}

// ── Main Worker Loop ──

let running = true;

async function workerLoop(): Promise<void> {
  const ready = await preflight();
  if (!ready) {
    console.error('[Worker] Pre-flight failed. Fix issues above and restart.');
    process.exit(1);
  }

  const cfg = await loadConfig();
  let currentTaskId: string | undefined;

  console.log(`[Worker] Starting with config:`, {
    backendUrl: BACKEND_URL,
    workerId: WORKER_ID,
    workerType: WORKER_TYPE,
    clientId: WORKER_CLIENT_ID || '(shared)',
    pollInterval: cfg.workerPollIntervalMs,
    agentRunner: cfg.agentRunner,
  });

  const heartbeatTimer = setInterval(() => {
    sendHeartbeat(currentTaskId);
  }, cfg.workerHeartbeatIntervalMs);

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

      let result: { success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] };

      if (WORKER_TYPE === 'api_shared' || cfg.agentRunner === 'sdk') {
        result = await executeClaudeSdkStage(task);
      } else {
        result = await executeClaudeCliStage(task, cfg);

        if (!result.success && isRateLimitError(result.result)) {
          console.warn(`[Worker] CLI rate limit detected`);
          const overflowResult = await attemptApiOverflow(task);
          if (overflowResult) result = overflowResult;
        }
      }

      if (task.context?.dryRun) {
        result.result = { ...result.result, dryRun: true };
      }
      if (task.context?.executionMode) {
        result.result = { ...result.result, executionMode: task.context.executionMode };
      }

      console.log(`[Worker] Task ${task.taskId} completed: ${result.success ? 'SUCCESS' : 'FAIL'}`);
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
    return { success: false, result: { error: 'No clientId — cannot resolve API key' }, cost: 0, artifacts: [] };
  }

  type ResolvedConfig = { mode: string; apiKey?: string; model?: string };
  let resolved: ResolvedConfig | null = null;
  try {
    const res = await fetch(`${WEBSITE_BACKEND_URL}/api/ai/internal/resolve/${clientId}`, {
      headers: { 'x-worker-secret': WORKER_SECRET },
    });
    if (res.ok) resolved = await res.json() as ResolvedConfig;
  } catch {}

  const apiKey = resolved?.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { success: false, result: { error: 'No API key available' }, cost: 0, artifacts: [] };
  }

  const model = task.stageConfig?.model || resolved?.model || 'sonnet';
  const timeout = (task.stageConfig?.timeoutSeconds || 600) * 1000;
  const isDryRunSdk = task.context?.dryRun === true;

  const agentInstructions = (!isDryRunSdk && task.stageConfig?.agentFile) ? loadAgentFile(task.stageConfig.agentFile) : null;
  const systemMessage = agentInstructions
    ? agentInstructions + '\n\n---\n\nPipeline Stage: ' + task.stageId
    : `Pipeline Stage: ${task.stageId}`;

  console.log(`[Worker] SDK execution for client ${clientId} (model=${model})`);

  const sdkResult = await callAnthropicAPI(apiKey, model, systemMessage, task.agentPrompt, 4096, timeout);

  if (!sdkResult.success) {
    return {
      success: false,
      result: { error: sdkResult.error, inputTokens: sdkResult.inputTokens, outputTokens: sdkResult.outputTokens },
      cost: sdkResult.costUsd,
      artifacts: [{ name: `${task.stageId}-error.txt`, type: 'text', content: (sdkResult.error || 'Unknown').slice(0, 50_000) }],
    };
  }

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(sdkResult.output); } catch { parsed = { rawOutput: sdkResult.output.slice(0, 10000) }; }

  return {
    success: true,
    result: { ...parsed, inputTokens: sdkResult.inputTokens, outputTokens: sdkResult.outputTokens },
    cost: sdkResult.costUsd,
    artifacts: [{ name: `${task.stageId}-output.json`, type: 'json', content: JSON.stringify(parsed, null, 2).slice(0, 50_000) }],
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
    const res = await fetch(`${WEBSITE_BACKEND_URL}/api/ai/internal/resolve/${task.clientId}`, {
      headers: { 'x-worker-secret': WORKER_SECRET },
    });
    if (!res.ok) return null;
    const resolved = await res.json() as { mode: string; apiKey?: string };
    if (!resolved.apiKey) return null;
    return await executeClaudeSdkStage(task);
  } catch { return null; }
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
