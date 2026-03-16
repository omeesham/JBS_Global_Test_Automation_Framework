import type { FastifyInstance } from 'fastify';
import { fork, execSync, type ChildProcess } from 'child_process';
import * as path from 'path';
import {
  getUsageStats,
  isWorkerConnected,
  getLastHeartbeat,
  setPendingWorkerCommand,
  getSpawnedWorkerPid,
  setSpawnedWorkerPid,
} from '../db/queries';
import { loadPipelineDefinition, savePipelineDefinition } from '../../orchestrator/orchestrator';
import type { PipelineDefinition, WorkerStatusResponse } from '../../orchestrator/types';

const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';

function validateAdminAuth(secret: string | undefined): boolean {
  return secret === WORKER_SECRET;
}

/** Windows-safe force kill */
function forceKill(pid: number): void {
  if (process.platform === 'win32') {
    try { execSync(`taskkill /pid ${pid} /t /f`, { stdio: 'ignore' }); } catch { /* already dead */ }
  } else {
    try { process.kill(pid, 'SIGKILL'); } catch { /* already dead */ }
  }
}

// Track spawned child process reference for cleanup
let spawnedChild: ChildProcess | null = null;

export function registerAdminRoutes(app: FastifyInstance) {
  // Get current pipeline definition
  app.get('/api/admin/pipeline-definition', async (_req, reply) => {
    const definition = loadPipelineDefinition();
    reply.send(definition);
  });

  // Update pipeline definition
  app.put<{ Body: PipelineDefinition }>('/api/admin/pipeline-definition', async (req, reply) => {
    try {
      savePipelineDefinition(req.body);
      reply.send(loadPipelineDefinition());
    } catch (err) {
      reply.code(400).send({ error: (err as Error).message });
    }
  });

  // Get usage stats
  app.get('/api/admin/usage', async (_req, reply) => {
    const usage = await getUsageStats(app.db);
    reply.send(usage);
  });

  // Get worker connection status (enhanced with spawn info)
  app.get('/api/admin/worker-status', async (_req, reply) => {
    const heartbeat = getLastHeartbeat();
    const response: WorkerStatusResponse = {
      connected: isWorkerConnected(),
      lastHeartbeat: heartbeat?.timestamp || null,
      currentTask: heartbeat?.currentTaskId || null,
    };
    reply.send({
      ...response,
      spawnedByServer: getSpawnedWorkerPid() !== null,
    });
  });

  // ── Worker Lifecycle Control (x-worker-secret auth) ──

  // Start worker process
  app.post('/api/admin/worker/start', async (req, reply) => {
    if (!validateAdminAuth(req.headers['x-worker-secret'] as string)) {
      return reply.code(401).send({ error: 'Invalid worker secret' });
    }
    if (isWorkerConnected()) {
      return reply.code(409).send({ error: 'Worker already connected' });
    }
    if (getSpawnedWorkerPid() !== null) {
      return reply.code(409).send({ error: 'Worker process already spawned' });
    }

    try {
      const workerPath = path.resolve(__dirname, '../../worker/index.ts');
      const child = fork(workerPath, [], {
        env: {
          ...process.env,
          BACKEND_URL: `http://localhost:${process.env.PORT || '3001'}`,
          WORKER_SECRET,
          WORKER_ID: 'server-managed-worker',
        },
        stdio: 'inherit',
        execArgv: workerPath.endsWith('.ts') ? ['--require', 'ts-node/register'] : [],
      });

      spawnedChild = child;
      setSpawnedWorkerPid(child.pid ?? null);

      child.on('exit', (code) => {
        app.log.info(`Spawned worker exited (code=${code})`);
        spawnedChild = null;
        setSpawnedWorkerPid(null);
      });

      reply.send({ ok: true, pid: child.pid });
    } catch (err) {
      reply.code(500).send({ error: (err as Error).message });
    }
  });

  // Stop worker
  app.post('/api/admin/worker/stop', async (req, reply) => {
    if (!validateAdminAuth(req.headers['x-worker-secret'] as string)) {
      return reply.code(401).send({ error: 'Invalid worker secret' });
    }

    const pid = getSpawnedWorkerPid();
    if (pid !== null) {
      // Server-spawned: send SIGTERM, force kill after 10s
      try { process.kill(pid, 'SIGTERM'); } catch { /* already dead */ }
      setTimeout(() => {
        if (getSpawnedWorkerPid() === pid) forceKill(pid);
      }, 10000).unref();
      return reply.send({ ok: true, method: 'signal', pid });
    }

    if (!isWorkerConnected()) {
      return reply.code(404).send({ error: 'No worker connected' });
    }

    // External worker: piggyback stop command on next heartbeat
    setPendingWorkerCommand('stop');
    reply.send({ ok: true, method: 'heartbeat', maxDelaySeconds: 30 });
  });

  // Restart worker
  app.post('/api/admin/worker/restart', async (req, reply) => {
    if (!validateAdminAuth(req.headers['x-worker-secret'] as string)) {
      return reply.code(401).send({ error: 'Invalid worker secret' });
    }

    const pid = getSpawnedWorkerPid();
    if (pid !== null) {
      // Kill existing, then start new after exit
      try { process.kill(pid, 'SIGTERM'); } catch { /* already dead */ }

      // Wait for child exit (up to 10s), then spawn new
      const waitForExit = new Promise<void>((resolve) => {
        if (spawnedChild) {
          const timeout = setTimeout(() => { forceKill(pid); resolve(); }, 10000);
          timeout.unref();
          spawnedChild.once('exit', () => { clearTimeout(timeout); resolve(); });
        } else {
          resolve();
        }
      });

      await waitForExit;

      // Fork new worker
      try {
        const workerPath = path.resolve(__dirname, '../../worker/index.ts');
        const child = fork(workerPath, [], {
          env: {
            ...process.env,
            BACKEND_URL: `http://localhost:${process.env.PORT || '3001'}`,
            WORKER_SECRET,
            WORKER_ID: 'server-managed-worker',
          },
          stdio: 'inherit',
        });
        spawnedChild = child;
        setSpawnedWorkerPid(child.pid ?? null);
        child.on('exit', (code) => {
          app.log.info(`Spawned worker exited (code=${code})`);
          spawnedChild = null;
          setSpawnedWorkerPid(null);
        });
        return reply.send({ ok: true, method: 'signal', pid: child.pid });
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }

    if (!isWorkerConnected()) {
      return reply.code(404).send({ error: 'No worker connected' });
    }

    // External worker: send restart command via heartbeat
    setPendingWorkerCommand('restart');
    reply.send({
      ok: true,
      method: 'heartbeat',
      maxDelaySeconds: 30,
      note: 'Worker will exit. External process manager must restart it.',
    });
  });
}

/** Stop spawned worker on server shutdown (called from index.ts) */
export function stopSpawnedWorker(): void {
  const pid = getSpawnedWorkerPid();
  if (pid !== null) {
    try { process.kill(pid, 'SIGTERM'); } catch { /* already dead */ }
    setSpawnedWorkerPid(null);
    spawnedChild = null;
  }
}
