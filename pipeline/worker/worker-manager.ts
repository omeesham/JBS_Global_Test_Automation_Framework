#!/usr/bin/env ts-node
/**
 * Worker Manager — master process that manages CLI and API worker child processes.
 *
 * Reads ai_provider_config from the database (via website backend) and spawns
 * one dedicated CLI worker per client configured for CLI mode, plus a pool of
 * shared API workers.
 *
 * Features:
 * - Auto-spawn workers based on DB config
 * - Health monitoring (30s heartbeat checks)
 * - Auto-restart on crash (up to 5 retries per worker)
 * - Graceful shutdown
 *
 * Usage:
 *   npx ts-node src/worker/worker-manager.ts
 *   # or: node dist/worker/worker-manager.js
 *
 * Environment:
 *   WEBSITE_BACKEND_URL  — Website backend URL (default: http://localhost:3001)
 *   BACKEND_URL          — Encore server URL (default: http://localhost:3100)
 *   WORKER_SECRET        — Shared auth secret
 *   API_WORKER_POOL_SIZE — Number of shared API workers (default: 2)
 */

import { fork, type ChildProcess } from 'child_process';
import * as path from 'path';

const WEBSITE_BACKEND_URL = process.env.WEBSITE_BACKEND_URL || 'http://localhost:3001';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3100';
const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';
const API_WORKER_POOL_SIZE = parseInt(process.env.API_WORKER_POOL_SIZE || '2', 10);
const HEALTH_CHECK_INTERVAL = 30_000; // 30s
const MAX_RESTART_ATTEMPTS = 5;

interface ManagedWorker {
  id: string;
  clientId: string | null;
  type: 'cli_dedicated' | 'api_shared';
  process: ChildProcess | null;
  restartCount: number;
  lastStarted: Date | null;
}

const workers = new Map<string, ManagedWorker>();
let running = true;

// ── Fetch AI configs from website backend ──

interface AiConfig {
  clientId: string;
  executionMode: string;
  cliWorkerId: string | null;
  cliConfigPath: string | null;
}

async function fetchAiConfigs(): Promise<AiConfig[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${WEBSITE_BACKEND_URL}/api/ai/configs`, {
      headers: { 'x-worker-secret': WORKER_SECRET },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`[Manager] Failed to fetch AI configs: ${res.status}`);
      return [];
    }
    return await res.json() as AiConfig[];
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.error('[Manager] Config fetch timed out after 10s');
    } else {
      console.error(`[Manager] Error fetching AI configs: ${(err as Error).message}`);
    }
    return [];
  }
}

// ── Spawn a worker child process ──

function spawnWorker(managed: ManagedWorker): void {
  const workerScript = path.join(__dirname, 'index.ts');
  // For compiled JS, use index.js
  const jsPath = workerScript.replace(/\.ts$/, '.js');

  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    BACKEND_URL,
    WEBSITE_BACKEND_URL,
    WORKER_SECRET,
    WORKER_ID: managed.id,
    WORKER_TYPE: managed.type,
  };

  if (managed.clientId) {
    env.WORKER_CLIENT_ID = managed.clientId;
  }

  // Use CLAUDE_CONFIG_DIR for isolated CLI auth per client
  const configEntry = workers.get(managed.id);
  if (configEntry && managed.type === 'cli_dedicated') {
    const configDir = `/workers/${managed.clientId || 'default'}`;
    env.CLAUDE_CONFIG_DIR = configDir;
  }

  console.log(`[Manager] Spawning worker ${managed.id} (type=${managed.type}, client=${managed.clientId || 'shared'})`);

  // Fork the worker as a child process
  const child = fork(jsPath, [], {
    env,
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    execArgv: jsPath.endsWith('.ts') ? ['--require', 'ts-node/register'] : [],
  });

  child.stdout?.on('data', (data: Buffer) => {
    process.stdout.write(`[${managed.id}] ${data}`);
  });

  child.stderr?.on('data', (data: Buffer) => {
    process.stderr.write(`[${managed.id}] ${data}`);
  });

  child.on('exit', (code) => {
    console.log(`[Manager] Worker ${managed.id} exited with code ${code}`);
    managed.process = null;

    if (running && managed.restartCount < MAX_RESTART_ATTEMPTS) {
      managed.restartCount++;
      const delay = Math.min(managed.restartCount * 2000, 10000);
      console.log(`[Manager] Restarting ${managed.id} in ${delay}ms (attempt ${managed.restartCount}/${MAX_RESTART_ATTEMPTS})`);
      setTimeout(() => {
        if (running) spawnWorker(managed);
      }, delay);
    } else if (managed.restartCount >= MAX_RESTART_ATTEMPTS) {
      console.error(`[Manager] Worker ${managed.id} exceeded max restart attempts. Not restarting.`);
    }
  });

  managed.process = child;
  managed.lastStarted = new Date();
}

// ── Start all workers ──

async function startAll(): Promise<void> {
  console.log('[Manager] Starting worker manager...');

  // Fetch AI configs and spawn CLI dedicated workers
  const configs = await fetchAiConfigs();

  for (const config of configs) {
    if (config.executionMode === 'cli' || config.executionMode === 'cli_with_api_overflow') {
      const workerId = config.cliWorkerId || `worker-cli-${config.clientId}`;
      const managed: ManagedWorker = {
        id: workerId,
        clientId: config.clientId,
        type: 'cli_dedicated',
        process: null,
        restartCount: 0,
        lastStarted: null,
      };
      workers.set(workerId, managed);
      spawnWorker(managed);
    }
  }

  // Spawn shared API workers
  for (let i = 1; i <= API_WORKER_POOL_SIZE; i++) {
    const workerId = `worker-api-${i}`;
    const managed: ManagedWorker = {
      id: workerId,
      clientId: null,
      type: 'api_shared',
      process: null,
      restartCount: 0,
      lastStarted: null,
    };
    workers.set(workerId, managed);
    spawnWorker(managed);
  }

  console.log(`[Manager] Spawned ${workers.size} workers (${configs.filter(c => c.executionMode.includes('cli')).length} CLI, ${API_WORKER_POOL_SIZE} API)`);
}

// ── Stop a single CLI worker ──

function stopCliWorker(workerId: string): void {
  const managed = workers.get(workerId);
  if (!managed) {
    console.warn(`[Manager] stopCliWorker: worker ${workerId} not found`);
    return;
  }
  // Prevent auto-restart by maxing out restart count
  managed.restartCount = MAX_RESTART_ATTEMPTS;
  if (managed.process && managed.process.exitCode === null) {
    console.log(`[Manager] Stopping worker ${workerId}`);
    managed.process.kill('SIGTERM');
  }
  workers.delete(workerId);
}

// ── Health monitoring ──

function checkHealth(): void {
  for (const [id, worker] of workers) {
    if (!worker.process || worker.process.exitCode !== null) {
      console.warn(`[Manager] Worker ${id} is not running`);
    }
  }
}

/** Restart any workers that have exited and haven't exceeded max retries. */
function restartUnhealthyWorkers(): void {
  for (const [id, managed] of workers) {
    if ((!managed.process || managed.process.exitCode !== null) && managed.restartCount < MAX_RESTART_ATTEMPTS) {
      console.log(`[Manager] Restarting unhealthy worker ${id}`);
      managed.restartCount++;
      spawnWorker(managed);
    }
  }
}

// ── Rate Limit Handling ──

/** When a CLI worker hits a rate limit, re-route its pending tasks to the API pool. */
function onRateLimitDetected(clientId: string): void {
  console.warn(`[Manager] Rate limit detected for client ${clientId}`);

  // Find the CLI worker for this client
  for (const [id, managed] of workers) {
    if (managed.clientId === clientId && managed.type === 'cli_dedicated') {
      console.log(`[Manager] CLI worker ${id} rate-limited — tasks will overflow to API pool`);
      // Don't kill the worker — it will detect rate limits on its own and use attemptApiOverflow
      // Just log for monitoring. The worker's built-in overflow logic handles the actual re-routing.
      break;
    }
  }
}

// ── Graceful shutdown ──

function stopAll(): void {
  running = false;
  console.log('[Manager] Stopping all workers...');

  for (const [id, worker] of workers) {
    if (worker.process) {
      console.log(`[Manager] Sending SIGTERM to ${id}`);
      worker.process.kill('SIGTERM');
    }
  }

  // Force kill after 10s
  setTimeout(() => {
    for (const [id, worker] of workers) {
      if (worker.process && worker.process.exitCode === null) {
        console.log(`[Manager] Force-killing ${id}`);
        worker.process.kill('SIGKILL');
      }
    }
    process.exit(0);
  }, 10000).unref();
}

// ── Main ──

async function main(): Promise<void> {
  await startAll();

  // Health check interval
  const healthTimer = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);

  process.on('SIGINT', () => { clearInterval(healthTimer); stopAll(); });
  process.on('SIGTERM', () => { clearInterval(healthTimer); stopAll(); });
}

main().catch((err) => {
  console.error('[Manager] Fatal error:', err);
  process.exit(1);
});
