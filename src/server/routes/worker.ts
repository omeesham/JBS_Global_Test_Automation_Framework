import type { FastifyInstance } from 'fastify';
import {
  claimNextTask,
  completeWorkerTask,
  getWorkerTask,
  recordHeartbeat,
  consumePendingWorkerCommand,
  createArtifact,
  updatePipelineRun,
  incrementRunCost,
  getPipelineRun,
  createStageResult,
  completeStageResult,
  createWorkerTask as createNewTask,
} from '../db/queries';
import { loadPipelineDefinitionForClient } from '../../orchestrator/orchestrator';
import { processStageCompletion } from '../../orchestrator/orchestrator';
import { broadcastSSE } from './events';
import type { CompletedTaskPayload } from '../../orchestrator/types';

const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';

function validateWorkerAuth(secret: string | undefined): boolean {
  return secret === WORKER_SECRET;
}

export function registerWorkerRoutes(app: FastifyInstance) {
  // Poll for next task
  app.get('/api/worker/next-task', async (req, reply) => {
    const secret = req.headers['x-worker-secret'] as string | undefined;
    if (!validateWorkerAuth(secret)) {
      return reply.code(401).send({ error: 'Invalid worker secret' });
    }

    const clientId = (req.query as Record<string, string>).client_id || null;
    const task = await claimNextTask(app.db, clientId);
    if (!task) {
      return reply.send(null);
    }

    // Update pipeline run to 'running'
    const run = await getPipelineRun(app.db, task.run_id);
    if (run && run.status !== 'running') {
      await updatePipelineRun(app.db, run.id, { stage: task.stage_id, status: 'running' });
    }

    // Create stage result entry (per-client definition for correct model/retries)
    const definition = await loadPipelineDefinitionForClient(app.db, task.client_id);
    const stageDef = definition.stages.find(s => s.id === task.stage_id);
    const stageResult = await createStageResult(
      app.db,
      task.run_id,
      task.stage_id,
      stageDef?.retries ? stageDef.retries + 1 : 1,
      stageDef?.model || null
    );

    // Broadcast SSE (public — stage names + status are safe for all users)
    broadcastSSE(task.run_id, {
      type: 'stage_start',
      runId: task.run_id,
      stage: task.stage_id,
      agent: stageDef?.agent || task.stage_id,
      model: stageDef?.model || 'unknown',
      attempt: stageResult.attempt,
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });

    reply.send({
      taskId: task.id,
      stageId: task.stage_id,
      agentPrompt: task.agent_prompt,
      context: task.context,
      runId: task.run_id,
      clientId: task.client_id || null,
      stageConfig: stageDef ? {
        model: stageDef.model,
        maxTurns: stageDef.maxTurns,
        timeoutSeconds: stageDef.timeoutSeconds,
        budgetCap: stageDef.budgetCap,
        agentFile: stageDef.agentFile,
        browserTool: stageDef.browserTool ?? 'none',
        cliConfig: stageDef.cliConfig ?? null,
      } : null,
    });
  });

  // Complete a task
  app.post<{ Body: CompletedTaskPayload }>('/api/worker/complete-task', async (req, reply) => {
    const secret = req.headers['x-worker-secret'] as string | undefined;
    if (!validateWorkerAuth(secret)) {
      return reply.code(401).send({ error: 'Invalid worker secret' });
    }

    const payload = req.body;
    const pool = app.db;

    // Update worker_tasks row
    const task = await completeWorkerTask(pool, payload);
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    // Find the most recent stage_result for this run+stage
    const { rows: stageResults } = await pool.query(
      `SELECT id FROM stage_results WHERE run_id = $1 AND stage_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [task.run_id, task.stage_id]
    );
    if (stageResults[0]) {
      await completeStageResult(
        pool,
        stageResults[0].id,
        payload.success ? 'success' : 'fail',
        payload.cost || 0,
        payload.result
      );
    }

    // Store artifacts
    if (payload.artifacts) {
      for (const artifact of payload.artifacts) {
        await createArtifact(pool, task.run_id, artifact.name, artifact.type, artifact.content);

        broadcastSSE(task.run_id, {
          type: 'artifact_ready',
          runId: task.run_id,
          artifactId: 'pending', // gets real ID from DB
          name: artifact.name,
          artifactType: artifact.type,
          timestamp: new Date().toISOString(),
          visibility: 'public', // name only — content requires separate auth'd fetch
        });
      }
    }

    // Broadcast stage completion — two events:
    // 1. Public: stage + result + duration (safe for all users)
    // 2. Admin: includes cost + error details (sensitive)
    const stageTs = new Date().toISOString();
    const stageDuration = task.claimed_at
      ? Math.floor((Date.now() - new Date(task.claimed_at).getTime()) / 1000)
      : 0;

    broadcastSSE(task.run_id, {
      type: 'stage_complete',
      runId: task.run_id,
      stage: task.stage_id,
      result: payload.success ? 'success' : 'fail',
      cost: 0, // hidden from non-admin
      duration: stageDuration,
      timestamp: stageTs,
      visibility: 'public',
    });
    broadcastSSE(task.run_id, {
      type: 'stage_complete',
      runId: task.run_id,
      stage: task.stage_id,
      result: payload.success ? 'success' : 'fail',
      error: !payload.success ? String(payload.result?.error || 'Unknown error') : undefined,
      cost: payload.cost || 0,
      duration: stageDuration,
      timestamp: stageTs,
      visibility: 'admin',
    });

    // Atomically increment run cost (prevents lost-update race)
    if (payload.cost && payload.cost > 0) {
      await incrementRunCost(pool, task.run_id, payload.cost);
    }

    // Classify failure for intelligent routing
    let routingOutcome = payload.success ? 'success' : 'fail';
    if (!payload.success && payload.result) {
      const { classifyFailure } = await import('../../orchestrator/failure-classifier');
      const classification = classifyFailure(payload.result as Record<string, unknown>);

      // Enrich result data with classification
      payload.result = {
        ...payload.result,
        _failureClass: classification.failureClass,
        _failureConfidence: classification.confidence,
        _upstreamBlame: classification.upstreamBlame,
        _failureEvidence: classification.evidence,
      };

      // Use specific outcome for routing if high confidence upstream blame
      if (classification.confidence === 'high' && classification.upstreamBlame) {
        routingOutcome = `fail:${classification.failureClass}`;
      }
    }

    // Process stage completion (route to next stage or terminal)
    await processStageCompletion(
      pool,
      task.run_id,
      task.stage_id,
      routingOutcome,
      payload.result
    );

    reply.send({ ok: true });
  });

  // Agent progress — worker reports live activity for SSE broadcast
  app.post('/api/worker/progress', async (req, reply) => {
    const secret = req.headers['x-worker-secret'] as string | undefined;
    if (!validateWorkerAuth(secret)) {
      return reply.code(401).send({ error: 'Invalid worker secret' });
    }

    const body = req.body as { taskId?: string; runId?: string; stage?: string; message?: string } | undefined;
    if (!body?.runId || !body?.stage || !body?.message) {
      return reply.code(400).send({ error: 'runId, stage, and message are required' });
    }

    broadcastSSE(body.runId, {
      type: 'agent_progress',
      runId: body.runId,
      stage: body.stage,
      message: body.message,
      timestamp: new Date().toISOString(),
      visibility: 'public', // progress messages are sanitized by worker — safe for all users
    });

    reply.send({ ok: true });
  });

  // Heartbeat
  app.post('/api/worker/heartbeat', async (req, reply) => {
    const secret = req.headers['x-worker-secret'] as string | undefined;
    if (!validateWorkerAuth(secret)) {
      return reply.code(401).send({ error: 'Invalid worker secret' });
    }

    const body = req.body as { workerId?: string; currentTaskId?: string } | undefined;
    recordHeartbeat(body?.workerId || 'default', body?.currentTaskId);
    const cmd = consumePendingWorkerCommand();
    reply.send({ ok: true, ...(cmd ? { command: cmd.command } : {}) });
  });
}
