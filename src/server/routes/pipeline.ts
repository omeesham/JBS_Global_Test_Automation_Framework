import * as fs from 'fs';
import * as path from 'path';
import type { FastifyInstance } from 'fastify';
import {
  createPipelineRun,
  getPipelineRun,
  listPipelineRuns,
  updatePipelineRun,
  getStageResults,
  getArtifacts,
  createWorkerTask,
  getPageBySlug,
  createPage,
  checkPageConcurrency,
  upsertPageStageStatus,
} from '../db/queries';
import { loadPipelineDefinition, loadPipelineDefinitionForClient, buildDryRunPrompt, processStageCompletion } from '../../orchestrator/orchestrator';
import { checkPageReadiness, buildCascadePlan } from '../../orchestrator/dependency-engine';
import type { CreatePipelineRequest } from '../../orchestrator/types';
import { broadcastSSE } from './events';
import { serializePipelineRun, serializePipelineRunWithDetails } from '../serializers';

export function registerPipelineRoutes(app: FastifyInstance) {
  // Create a new pipeline run
  app.post<{ Body: CreatePipelineRequest & { pageId?: string; pageSlug?: string; pageName?: string } }>('/api/pipeline/run', async (req, reply) => {
    const { feature, module, intent, priority, targetUrl, clientId, dryRun, executionMode } = req.body;

    if (!feature || !module || !intent) {
      return reply.code(400).send({ error: 'feature, module, and intent are required' });
    }

    // Resolve effective dryRun from executionMode (backwards compatible)
    const isDryRun = dryRun || executionMode === 'dry-run';

    const pool = app.db;

    // Resolve page (if page-scoped run)
    let pageId = req.body.pageId || null;
    if (!pageId && req.body.pageSlug) {
      // Try to find existing page by slug
      let page = await getPageBySlug(pool, clientId || null, module, req.body.pageSlug);
      if (!page) {
        // Auto-create page from slug
        page = await createPage(pool, {
          client_id: clientId || null,
          module,
          page_slug: req.body.pageSlug,
          display_name: req.body.pageName || req.body.pageSlug,
          target_url: targetUrl || null,
        });
      }
      pageId = page.id;
    }

    const run = await createPipelineRun(pool, { feature, module, intent, priority, targetUrl, clientId });

    // If page-scoped, update run with page_id
    if (pageId) {
      await pool.query('UPDATE pipeline_runs SET page_id = $1 WHERE id = $2', [pageId, run.id]);
    }

    // Smart stage detection: check existing artifacts to resume from the right stage
    const detectedStage = req.body.startStage || detectStartStage(module, feature);

    // Load per-client pipeline definition (deep-clone to avoid mutating cached copy)
    const definition = JSON.parse(JSON.stringify(await loadPipelineDefinitionForClient(app.db, clientId))) as ReturnType<typeof loadPipelineDefinition>;

    // Page-scoped: concurrency check + dependency cascade
    let cascadePlan: string[] | null = null;
    let effectiveStartStage = detectedStage;

    if (pageId) {
      // Concurrency check
      const concurrency = await checkPageConcurrency(pool, pageId, detectedStage);
      if (concurrency.locked) {
        return reply.code(409).send({
          error: 'Stage is already running for this page',
          activeRunId: concurrency.activeRunId,
        });
      }

      // Check readiness and build cascade plan
      const readiness = await checkPageReadiness(pool, pageId, detectedStage, definition);

      if (!readiness.satisfied && readiness.canAutoCascade) {
        // Auto mode: build cascade plan
        cascadePlan = await buildCascadePlan(pool, pageId, detectedStage, definition);
        if (cascadePlan.length > 0) {
          effectiveStartStage = cascadePlan[0]!;
          // Store cascade plan on run
          await pool.query('UPDATE pipeline_runs SET cascade_plan = $1 WHERE id = $2', [JSON.stringify(cascadePlan), run.id]);
        }
      } else if (!readiness.satisfied && !readiness.canAutoCascade) {
        // Can't auto-cascade (stages in progress)
        return reply.code(400).send({
          error: 'Prerequisites not satisfied and cannot auto-cascade',
          missing: readiness.missing,
          failed: readiness.failed,
          inProgress: readiness.inProgress,
        });
      }

      if (readiness.needsRequirements) {
        return reply.code(200).send({
          runId: run.id,
          needsRequirements: true,
          pageId,
        });
      }
    }

    const firstStage = definition.stages.find(s => s.id === effectiveStartStage && s.enabled)
      || definition.stages.find(s => s.enabled);
    if (firstStage) {
      const prompt = isDryRun
        ? buildDryRunPrompt(firstStage.id, { feature, module, intent })
        : buildStagePrompt(firstStage.id, { feature, module, intent, targetUrl });
      await createWorkerTask(pool, run.id, firstStage.id, prompt, {
        feature,
        module,
        intent,
        targetUrl,
        ...(isDryRun ? { dryRun: true } : {}),
        ...(executionMode ? { executionMode } : {}),
      }, clientId);

      // Update run to show it's queued for first stage
      await updatePipelineRun(pool, run.id, { stage: firstStage.id, status: 'queued' });

      // Mark page_stage_status as in_progress
      if (pageId) {
        await upsertPageStageStatus(pool, pageId, firstStage.id, {
          status: 'running',
          active_run_id: run.id,
        });
      }
    }

    reply.code(201).send({
      runId: run.id,
      ...(cascadePlan ? { cascade: true, cascadePlan } : {}),
      ...(pageId ? { pageId } : {}),
    });
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

  // Approve artifacts and resume pipeline
  app.post<{ Params: { id: string } }>('/api/pipeline/:id/approve', async (req, reply) => {
    const pool = app.db;
    const run = await getPipelineRun(pool, req.params.id);
    if (!run) return reply.code(404).send({ error: 'Pipeline run not found' });
    if (run.status !== 'awaiting_approval') {
      return reply.code(400).send({ error: `Pipeline is not awaiting approval (current: ${run.status})` });
    }

    // Resume: re-process stage completion to advance to the next stage
    await processStageCompletion(pool, run.id, run.stage, 'success', null);
    reply.send({ approved: true });
  });

  // Reject artifacts and re-run the stage
  app.post<{ Params: { id: string }; Body: { reason?: string } }>('/api/pipeline/:id/reject', async (req, reply) => {
    const pool = app.db;
    const run = await getPipelineRun(pool, req.params.id);
    if (!run) return reply.code(404).send({ error: 'Pipeline run not found' });
    if (run.status !== 'awaiting_approval') {
      return reply.code(400).send({ error: `Pipeline is not awaiting approval (current: ${run.status})` });
    }

    const definition = await loadPipelineDefinitionForClient(app.db, run.client_id);
    const stage = definition.stages.find(s => s.id === run.stage && s.enabled);
    if (!stage) {
      return reply.code(400).send({ error: `Stage "${run.stage}" not found or disabled` });
    }

    // Re-run the same stage with rejection context
    const prompt = [
      `Pipeline Stage: ${stage.name} (${stage.id})`,
      `Feature: ${run.feature}`,
      `Module: ${run.module}`,
      `Intent: ${run.intent}`,
      run.target_url ? `Target URL: ${run.target_url}` : '',
      '',
      '--- REJECTION FEEDBACK ---',
      `User rejected the previous output.`,
      req.body.reason ? `Reason: ${req.body.reason}` : 'No specific reason provided.',
      'Please re-do the work addressing the feedback above.',
      '',
      stage.description,
    ].filter(Boolean).join('\n');

    await createWorkerTask(pool, run.id, stage.id, prompt, {
      feature: run.feature,
      module: run.module,
      intent: run.intent,
      targetUrl: run.target_url,
      rejectionReason: req.body.reason || null,
    }, run.client_id);

    await updatePipelineRun(pool, run.id, { stage: stage.id, status: 'queued' });
    reply.send({ rejected: true, rerunning: stage.id });
  });

  // Steer a running pipeline — write a steering message that the agent will pick up.
  // The steering file is read by the agent via a polling instruction in its prompt.
  // When the current stage completes, the steering message is injected as context
  // for the next stage (or re-run of the current stage).
  app.post<{
    Params: { id: string };
    Body: { message: string; action?: 'inject' | 'stop-and-redirect' };
  }>('/api/pipeline/:id/steer', async (req, reply) => {
    const pool = app.db;
    const run = await getPipelineRun(pool, req.params.id);
    if (!run) return reply.code(404).send({ error: 'Pipeline run not found' });

    const { message, action = 'inject' } = req.body;
    if (!message?.trim()) return reply.code(400).send({ error: 'Steering message is required' });

    // Write steering file that agents can detect
    const steeringDir = path.resolve(__dirname, '../../.tmp/steering');
    if (!fs.existsSync(steeringDir)) fs.mkdirSync(steeringDir, { recursive: true });
    const steeringFile = path.resolve(steeringDir, `${run.id}.json`);
    const steeringData = {
      runId: run.id,
      stage: run.stage,
      action,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(steeringFile, JSON.stringify(steeringData, null, 2));

    // If 'stop-and-redirect': cancel current run and re-queue with steering context
    if (action === 'stop-and-redirect') {
      await updatePipelineRun(pool, run.id, { status: 'cancelled' });
      broadcastSSE(run.id, {
        type: 'pipeline_complete',
        runId: run.id,
        status: 'cancelled',
        totalCost: Number(run.cost),
        timestamp: new Date().toISOString(),
        visibility: 'public',
      });
    }

    // Broadcast steering event so dashboard can show it
    broadcastSSE(run.id, {
      type: 'agent_progress',
      runId: run.id,
      stage: run.stage,
      message: `User steering: ${message.trim().substring(0, 100)}`,
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });

    reply.send({
      steered: true,
      action,
      steeringFile,
      message: action === 'stop-and-redirect'
        ? 'Pipeline cancelled. Steering message saved for next run.'
        : 'Steering message saved. Agent will pick it up on next file check.',
    });
  });

  // Resume pipeline after triage decisions
  app.post<{
    Params: { id: string };
    Body: {
      decisions: Array<{
        testName: string;
        action: 'report_bug' | 'heal_feature_change' | 'dismiss';
      }>;
    };
  }>('/api/pipeline/:id/resume-triage', async (req, reply) => {
    const pool = app.db;
    const run = await getPipelineRun(pool, req.params.id);
    if (!run) {
      return reply.code(404).send({ error: 'Pipeline run not found' });
    }
    if (run.status !== 'awaiting_triage') {
      return reply.code(400).send({ error: `Pipeline is not awaiting triage (current status: ${run.status})` });
    }

    const { decisions } = req.body;
    const healItems = decisions.filter(d => d.action === 'heal_feature_change');
    const bugItems = decisions.filter(d => d.action === 'report_bug');

    // If there are items to heal, route to healer with full triage context
    if (healItems.length > 0) {
      const definition = await loadPipelineDefinitionForClient(app.db, run.client_id);
      const healerStage = definition.stages.find(s => s.id === 'healing' && s.enabled);
      if (healerStage) {
        // Read full triage report from disk for rich failure context
        let triageDetails = '';
        const triageReportPath = path.join(process.cwd(), 'reports', 'triage-report.json');
        try {
          if (fs.existsSync(triageReportPath)) {
            const triageReport = JSON.parse(fs.readFileSync(triageReportPath, 'utf-8'));
            // Extract relevant failure details for each heal item
            const groups = triageReport.groups || [];
            for (const group of groups) {
              const matchingItems = (group.items || []).filter((gi: any) =>
                healItems.some(h => h.testName === gi.testName),
              );
              if (matchingItems.length > 0) {
                triageDetails += `\nRoot Cause: ${group.rootCause || 'Unknown'}\n`;
                for (const mi of matchingItems) {
                  triageDetails += `  - ${mi.testName}: ${mi.whatHappened || ''} | Fix: ${mi.whatToDo || ''}\n`;
                  if (mi.testFile) triageDetails += `    File: ${mi.testFile}\n`;
                }
              }
            }
          }
        } catch { /* triage report unavailable — proceed with basic context */ }

        const prompt = [
          `Pipeline Stage: ${healerStage.name} (${healerStage.id})`,
          `Feature: ${run.feature}`,
          `Module: ${run.module}`,
          `Intent: ${run.intent}`,
          run.target_url ? `Target URL: ${run.target_url}` : '',
          '',
          '--- TRIAGE DECISIONS (Feature Changes to Heal) ---',
          ...healItems.map(h => `- ${h.testName}: feature changed, update test`),
          triageDetails ? `\n--- DETAILED FAILURE CONTEXT ---${triageDetails}` : '',
          '',
          healerStage.description,
        ].filter(Boolean).join('\n');

        await createWorkerTask(pool, run.id, 'healing', prompt, {
          feature: run.feature,
          module: run.module,
          intent: run.intent,
          targetUrl: run.target_url,
          triageDecisions: decisions,
        }, run.client_id);

        await updatePipelineRun(pool, run.id, { stage: 'healing', status: 'queued' });
      }
    } else {
      // No heal items — pipeline completes (bugs are just reported, dismissed items ignored)
      await updatePipelineRun(pool, run.id, { stage: 'completed', status: 'completed' as any });
      broadcastSSE(run.id, {
        type: 'pipeline_complete',
        runId: run.id,
        status: 'completed',
        totalCost: Number(run.cost),
        timestamp: new Date().toISOString(),
        visibility: 'public',
      });
    }

    reply.send({
      resumed: true,
      healCount: healItems.length,
      bugCount: bugItems.length,
    });
  });

  // Download artifacts for a pipeline run
  app.get<{ Params: { id: string } }>('/api/pipeline/:id/artifacts/download', async (req, reply) => {
    const pool = app.db;
    const run = await getPipelineRun(pool, req.params.id);
    if (!run) {
      return reply.code(404).send({ error: 'Pipeline run not found' });
    }

    const artifacts = await getArtifacts(pool, run.id);
    if (artifacts.length === 0) {
      return reply.code(404).send({ error: 'No artifacts found for this run' });
    }

    // Bundle all artifacts into a single JSON download
    const bundle = {
      runId: run.id,
      feature: run.feature,
      module: run.module,
      exportedAt: new Date().toISOString(),
      artifacts: artifacts.map(a => ({
        name: a.name,
        type: a.type,
        content: a.content,
        metadata: a.metadata,
        createdAt: a.created_at,
      })),
    };

    const filename = `artifacts-${run.module}-${run.id.slice(0, 8)}.json`;
    reply
      .header('Content-Type', 'application/json; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(JSON.stringify(bundle, null, 2));
  });
  // Batch run: run stage for multiple pages
  app.post<{ Body: { pageIds: string[]; targetStage: string; mode: 'auto' | 'manual'; intent: string; clientId?: string } }>('/api/pipeline/batch-run', async (req, reply) => {
    const { pageIds, targetStage, mode, intent, clientId } = req.body;
    if (!pageIds?.length || !targetStage || !intent) {
      return reply.code(400).send({ error: 'pageIds, targetStage, and intent are required' });
    }

    const pool = app.db;
    const definition = JSON.parse(JSON.stringify(await loadPipelineDefinitionForClient(pool, clientId))) as ReturnType<typeof loadPipelineDefinition>;
    const batchId = require('crypto').randomUUID();
    const started: { pageId: string; runId: string }[] = [];
    const skipped: { pageId: string; reason: string }[] = [];

    for (const pageId of pageIds) {
      const concurrency = await checkPageConcurrency(pool, pageId, targetStage);
      if (concurrency.locked) {
        skipped.push({ pageId, reason: 'Stage already running' });
        continue;
      }

      const readiness = await checkPageReadiness(pool, pageId, targetStage, definition);
      let cascadePlan: string[] | null = null;
      let startStage = targetStage;

      if (!readiness.satisfied && readiness.canAutoCascade && mode === 'auto') {
        cascadePlan = await buildCascadePlan(pool, pageId, targetStage, definition);
        startStage = cascadePlan[0] || targetStage;
      } else if (!readiness.satisfied) {
        skipped.push({ pageId, reason: `Prerequisites not met: ${readiness.missing.join(', ')}` });
        continue;
      }

      const run = await createPipelineRun(pool, { feature: 'batch', module: 'batch', intent, clientId });
      await pool.query('UPDATE pipeline_runs SET page_id = $1, batch_id = $2, execution_mode_live = $3, cascade_plan = $4 WHERE id = $5',
        [pageId, batchId, mode, cascadePlan ? JSON.stringify(cascadePlan) : null, run.id]);

      const firstStage = definition.stages.find(s => s.id === startStage && s.enabled);
      if (firstStage) {
        const prompt = buildStagePrompt(firstStage.id, { feature: 'batch', module: 'batch', intent });
        await createWorkerTask(pool, run.id, firstStage.id, prompt, { feature: 'batch', module: 'batch', intent }, clientId);
        await updatePipelineRun(pool, run.id, { stage: firstStage.id, status: 'queued' });
        await upsertPageStageStatus(pool, pageId, firstStage.id, { status: 'running', active_run_id: run.id });
      }

      started.push({ pageId, runId: run.id });
    }

    reply.code(201).send({ batchId, started, skipped });
  });

  // Switch auto↔manual mid-run
  app.patch<{ Params: { id: string }; Body: { mode: 'auto' | 'manual' } }>('/api/pipeline/:id/mode', async (req, reply) => {
    const pool = app.db;
    const run = await getPipelineRun(pool, req.params.id);
    if (!run) return reply.code(404).send({ error: 'Pipeline run not found' });

    const newMode = req.body.mode;
    await pool.query('UPDATE pipeline_runs SET execution_mode_live = $1 WHERE id = $2', [newMode, run.id]);

    // If switching to auto and currently awaiting approval — auto-approve
    if (newMode === 'auto' && run.status === 'awaiting_approval') {
      await processStageCompletion(pool, run.id, run.stage, 'success', null);
    }

    broadcastSSE(run.id, {
      type: 'mode_switched',
      runId: run.id,
      mode: newMode,
      timestamp: new Date().toISOString(),
      visibility: 'public',
    });

    reply.send({ mode: newMode });
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

/**
 * Detect the best stage to start from based on existing artifacts.
 * Scans the repo for test cases, selectors, specs, and failure data.
 */
function detectStartStage(module: string, _feature: string): string {
  try {
    const root = process.cwd();

    // Check for existing spec files
    const specsDir = path.join(root, 'tests', 'specs', module);
    const hasSpec = fs.existsSync(specsDir) &&
      fs.readdirSync(specsDir).some(f => f.endsWith('.spec.ts'));

    // Check for failure data (recent test run failed)
    const failureSummary = path.join(root, 'reports', 'failure-summary.json');
    const hasRecentFailures = fs.existsSync(failureSummary) &&
      (() => { try { return JSON.parse(fs.readFileSync(failureSummary, 'utf-8')).failed > 0; } catch { return false; } })();

    // Check for test cases + selectors (planner output)
    const tcDir = path.join(root, 'specs_planning', 'test-cases', module);
    const hasTestCases = fs.existsSync(tcDir) &&
      fs.readdirSync(tcDir).some(f => f.endsWith('.md'));
    const selectorDir = path.join(root, 'src', 'selectors', module);
    const hasSelectors = fs.existsSync(selectorDir) &&
      fs.readdirSync(selectorDir).some(f => f.endsWith('.ts'));

    // Route based on artifact existence
    if (hasSpec && hasRecentFailures) return 'healing';
    if (hasTestCases && hasSelectors) return 'generation';
    if (hasTestCases) return 'planning';
    return 'requirements';
  } catch (err) {
    console.warn('[Pipeline] detectStartStage failed, defaulting to requirements:', (err as Error).message);
    return 'requirements';
  }
}
