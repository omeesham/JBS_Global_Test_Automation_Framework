import type { FastifyInstance } from 'fastify';
import {
  createPipelineRun,
  getPipelineRun,
  listPipelineRuns,
  updatePipelineRun,
  getStageResults,
  getArtifacts,
  createWorkerTask,
} from '../db/queries';
import { loadPipelineDefinition, buildDryRunPrompt } from '../../orchestrator/orchestrator';
import type { CreatePipelineRequest } from '../../orchestrator/types';
import { broadcastSSE } from './events';
import { serializePipelineRun, serializePipelineRunWithDetails } from '../serializers';

export function registerPipelineRoutes(app: FastifyInstance) {
  // Create a new pipeline run
  app.post<{ Body: CreatePipelineRequest }>('/api/pipeline/run', async (req, reply) => {
    const { feature, module, intent, priority, targetUrl, clientId, dryRun } = req.body;

    if (!feature || !module || !intent) {
      return reply.code(400).send({ error: 'feature, module, and intent are required' });
    }

    const pool = app.db;
    const run = await createPipelineRun(pool, { feature, module, intent, priority, targetUrl, clientId });

    // Load pipeline definition and create first worker task
    const definition = loadPipelineDefinition();
    const firstStage = definition.stages.find(s => s.enabled);
    if (firstStage) {
      const prompt = dryRun
        ? buildDryRunPrompt(firstStage.id, { feature, module, intent })
        : buildStagePrompt(firstStage.id, { feature, module, intent, targetUrl });
      await createWorkerTask(pool, run.id, firstStage.id, prompt, {
        feature,
        module,
        intent,
        targetUrl,
        ...(dryRun ? { dryRun: true } : {}),
      }, clientId);

      // Update run to show it's queued for first stage
      await updatePipelineRun(pool, run.id, { stage: firstStage.id, status: 'queued' });
    }

    reply.code(201).send({ runId: run.id });
  });

  // List pipeline runs
  app.get<{ Querystring: { status?: string } }>('/api/pipeline/list', async (req, reply) => {
    const runs = await listPipelineRuns(app.db, req.query.status);
    reply.send(runs.map(serializePipelineRun));
  });

  // Get pipeline run detail with stages and artifacts
  app.get<{ Params: { id: string } }>('/api/pipeline/:id', async (req, reply) => {
    const pool = app.db;
    const run = await getPipelineRun(pool, req.params.id);
    if (!run) {
      return reply.code(404).send({ error: 'Pipeline run not found' });
    }

    const [stages, artifacts] = await Promise.all([
      getStageResults(pool, run.id),
      getArtifacts(pool, run.id),
    ]);

    reply.send(serializePipelineRunWithDetails(run, stages, artifacts));
  });

  // Cancel a pipeline run
  app.post<{ Params: { id: string } }>('/api/pipeline/:id/cancel', async (req, reply) => {
    const pool = app.db;
    const run = await getPipelineRun(pool, req.params.id);
    if (!run) {
      return reply.code(404).send({ error: 'Pipeline run not found' });
    }

    if (['completed', 'fixme', 'cancelled'].includes(run.status)) {
      return reply.code(400).send({ error: `Pipeline already in terminal state: ${run.status}` });
    }

    await updatePipelineRun(pool, run.id, { status: 'cancelled' });

    broadcastSSE(run.id, {
      type: 'pipeline_complete',
      runId: run.id,
      status: 'cancelled',
      totalCost: Number(run.cost),
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });

    reply.send({ cancelled: true });
  });
}

function buildStagePrompt(stageId: string, context: {
  feature: string;
  module: string;
  intent: string;
  targetUrl?: string;
}): string {
  return [
    `Pipeline Stage: ${stageId}`,
    `Feature: ${context.feature}`,
    `Module: ${context.module}`,
    `Intent: ${context.intent}`,
    context.targetUrl ? `Target URL: ${context.targetUrl}` : '',
  ].filter(Boolean).join('\n');
}
