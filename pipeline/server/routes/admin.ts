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
  getClientPipelineDefinition,
  saveClientPipelineDefinition,
  cloneDefaultToClient,
  deleteClientPipelineDefinition,
} from '../db/queries';
import { loadPipelineDefinition, savePipelineDefinition } from '../../orchestrator/orchestrator';
import { listAgentTypes } from '../models/agent-registry';
import type { PipelineDefinition, StageDefinition, WorkerStatusResponse } from '../../orchestrator/types';

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
  // Get current pipeline definition (supports per-client via ?clientId=xxx)
  app.get('/api/admin/pipeline-definition', async (req, reply) => {
    const clientId = (req.query as Record<string, string>).clientId;

    // Per-client lookup (DB-based) — returns wrapped format
    if (clientId) {
      const result = await getClientPipelineDefinition(app.db, clientId);
      if (result) {
        return reply.send({ definition: result.definition, version: result.version, isDefault: result.isDefault, clientId: result.isDefault ? null : clientId });
      }
      // DB has no rows at all — fall back to file, but still wrap for consistency
      const fileDef = loadPipelineDefinition();
      return reply.send({ definition: fileDef, version: 0, isDefault: true, clientId: null });
    }

    // No clientId: bare format (backwards compat for existing PipelineDeepConfigTab)
    const definition = loadPipelineDefinition();
    reply.send(definition);
  });

  // Update pipeline definition (file-based — backwards compat, operates on default template)
  app.put<{ Body: PipelineDefinition }>('/api/admin/pipeline-definition', async (req, reply) => {
    const clientId = (req.query as Record<string, string>).clientId;

    // Per-client save (DB-based)
    if (clientId) {
      const version = parseInt((req.query as Record<string, string>).version || '0', 10);
      const result = await saveClientPipelineDefinition(
        app.db, clientId, req.body as unknown as Record<string, unknown>, version, 'admin',
      );
      if (!result) {
        return reply.code(409).send({ error: 'Version conflict — someone else saved. Reload and try again.' });
      }
      return reply.send({ definition: req.body, version: result.version, isDefault: false, clientId });
    }

    // Default: save to file (existing behavior)
    try {
      savePipelineDefinition(req.body);
      reply.send(loadPipelineDefinition());
    } catch (err) {
      reply.code(400).send({ error: (err as Error).message });
    }
  });

  // ── Agent Types Registry ──

  app.get('/api/admin/agent-types', async (_req, reply) => {
    const types = await listAgentTypes(app.db);
    reply.send(types);
  });

  // ── Per-Client Pipeline Definitions ──

  // Get pipeline definition for a client (falls back to default)
  app.get('/api/admin/client-pipeline-definition', async (req, reply) => {
    const clientId = (req.query as Record<string, string>).clientId || null;
    const result = await getClientPipelineDefinition(app.db, clientId);
    if (!result) {
      // No DB row at all — return file-based as fallback
      const fileDef = loadPipelineDefinition();
      return reply.send({ definition: fileDef, version: 0, isDefault: true, clientId: null });
    }
    reply.send({ ...result, clientId: result.isDefault ? null : clientId });
  });

  // Clone default pipeline to a client
  app.post('/api/admin/pipeline-definition/clone-default', async (req, reply) => {
    const clientId = (req.query as Record<string, string>).clientId;
    if (!clientId) {
      return reply.code(400).send({ error: 'clientId query parameter required' });
    }
    const result = await cloneDefaultToClient(app.db, clientId, 'admin');
    if (!result) {
      return reply.code(409).send({ error: 'Client already has a custom pipeline definition' });
    }
    reply.send({ ok: true, version: result.version });
  });

  // Delete a client's custom pipeline definition (reverts to default)
  app.delete('/api/admin/pipeline-definition', async (req, reply) => {
    const clientId = (req.query as Record<string, string>).clientId;
    if (!clientId) {
      return reply.code(400).send({ error: 'clientId query parameter required' });
    }
    const deleted = await deleteClientPipelineDefinition(app.db, clientId);
    reply.send({ ok: true, deleted });
  });

  // Validate a pipeline definition topology
  app.post<{ Body: PipelineDefinition }>('/api/admin/pipeline-definition/validate', async (req, reply) => {
    const def = req.body;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!def.stages || !Array.isArray(def.stages)) {
      errors.push('stages must be a non-empty array');
      return reply.send({ valid: false, errors, warnings });
    }
    if (def.stages.length === 0) {
      errors.push('Pipeline must have at least one stage');
      return reply.send({ valid: false, errors, warnings });
    }

    const stageIds = new Set(def.stages.map((s: StageDefinition) => s.id));
    const terminalStates = new Set(def.terminalStates || ['completed', 'fixme', 'cancelled']);

    // Check for duplicate IDs
    const ids = def.stages.map((s: StageDefinition) => s.id);
    const dupes = ids.filter((id: string, i: number) => ids.indexOf(id) !== i);
    if (dupes.length > 0) {
      errors.push(`Duplicate stage IDs: ${[...new Set(dupes)].join(', ')}`);
    }

    // Check all next references are valid
    for (const stage of def.stages) {
      for (const [outcome, target] of Object.entries(stage.next || {})) {
        if (!stageIds.has(target) && !terminalStates.has(target)) {
          errors.push(`Stage "${stage.id}" → next["${outcome}"] references unknown target "${target}"`);
        }
      }
      if (stage.routing?.rules) {
        for (const rule of stage.routing.rules) {
          if (!stageIds.has(rule.then) && !terminalStates.has(rule.then)) {
            errors.push(`Stage "${stage.id}" routing rule targets unknown "${rule.then}"`);
          }
        }
      }
    }

    // Check all stages reachable from first stage (BFS)
    const reachable = new Set<string>();
    const queue = [def.stages[0]!.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);
      const stage = def.stages.find((s: StageDefinition) => s.id === current);
      if (!stage) continue;
      for (const target of Object.values(stage.next || {})) {
        if (stageIds.has(target) && !reachable.has(target)) queue.push(target);
      }
      if (stage.routing?.rules) {
        for (const rule of stage.routing.rules) {
          if (stageIds.has(rule.then) && !reachable.has(rule.then)) queue.push(rule.then);
        }
      }
    }
    const unreachable = [...stageIds].filter(id => !reachable.has(id));
    if (unreachable.length > 0) {
      warnings.push(`Unreachable stages (not connected from first stage): ${unreachable.join(', ')}`);
    }

    // Check every non-terminal stage has at least one outgoing edge
    for (const stage of def.stages) {
      const nextTargets = Object.values(stage.next || {});
      const routingTargets = (stage.routing?.rules || []).map(r => r.then);
      if (nextTargets.length === 0 && routingTargets.length === 0) {
        errors.push(`Stage "${stage.id}" has no outgoing edges (no next or routing rules)`);
      }
    }

    // Validate agent types exist (if DB is available)
    try {
      const agentTypes = await listAgentTypes(app.db);
      const agentIds = new Set(agentTypes.map(a => a.id));
      for (const stage of def.stages) {
        if (stage.agent && !agentIds.has(stage.agent)) {
          warnings.push(`Stage "${stage.id}" uses unknown agent type "${stage.agent}" (not in registry)`);
        }
      }
    } catch {
      // Agent type validation is best-effort
    }

    reply.send({ valid: errors.length === 0, errors, warnings });
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
          SKIP_PREFLIGHT: 'true',
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
