#!/usr/bin/env ts-node
/**
 * Pipeline Orchestrator -- runs the full agent pipeline for a queue item.
 *
 * Stages: requirements -> planning -> generation -> audit (linear, no healing in normal flow)
 * Each stage runs: pre-run gate -> agent invocation -> post-complete gate -> stage transition.
 *
 * Usage:
 *   npm run pipeline:run <queue-item-id>           # Full pipeline from current stage
 *   npm run pipeline:run:from <stage> <item-id>    # Resume from a specific stage
 *   npm run pipeline:status <queue-item-id>        # Show current pipeline status
 *
 * Exit: 0 = pipeline completed, 1 = blocked/error
 *
 * NOTE: Phase 2 implementation -- uses CLI invocation (`claude -p`) for headless agent runs.
 * Phase 3 will replace CLI with Claude Agent SDK for programmatic control.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, execFileSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import { QueueFile, QueueItem, SHARED_PATHS } from './shared-types';
import { frameworkPath } from './shared-paths';

// ── Types ──

interface PipelineConfig {
  autoInvoke: {
    enabled: boolean;
    loop: string[];
    conditionalAgents: Record<string, string>;
  };
}

interface StageResult {
  stage: string;
  preRun: { exitCode: number; output: string };
  agentResult: { exitCode: number; output: string } | null;
  postComplete: { exitCode: number; output: string } | null;
  transitioned: boolean;
}

/** Maps pipeline stage names to their script file prefixes. */
const SCRIPT_PREFIX: Record<string, string> = {
  requirements: 'requirements',
  planning: 'planner',
  generation: 'generator',
  healing: 'healer',
  audit: 'audit',
};

/** Maps pipeline stage names to queue stage values. */
const STAGE_MAP: Record<string, { queueStage: string; nextStage: string }> = {
  requirements: { queueStage: 'requirements', nextStage: 'pending_planning' },
  planning: { queueStage: 'planning', nextStage: 'pending_generation' },
  generation: { queueStage: 'generation', nextStage: 'testing' },
  healing: { queueStage: 'healing', nextStage: 'pending_audit' },
  audit: { queueStage: 'completed', nextStage: 'completed' },
};

/** Maps pipeline stages to their agent identifiers (for CLI invocation).
 *  Agent files live at `.claude/agents/<UPPER>.md` per PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0.1.
 */
const STAGE_AGENT_MAP: Record<string, string> = {
  requirements: 'requirements',
  planning: 'planner',
  generation: 'generator',
  healing: 'healer',
  audit: 'audit',
};

/** Maps queue stage strings to pipeline stage names. */
const QUEUE_TO_PIPELINE: Record<string, string> = {
  pending_requirements: 'requirements',
  requirements: 'requirements',
  pending_planning: 'planning',
  planning: 'planning',
  pending_generation: 'generation',
  generation: 'generation',
  testing: 'audit',
  pending_healing: 'healing',
  healing: 'healing',
  pending_audit: 'audit',
};

// ── Routing Matrix (Phase 2E) ──

interface RouteDecision {
  nextStage: string;
  reason: string;
}

function routeAfterStage(stage: string, testsPassed: boolean, _retryCount: number): RouteDecision {
  switch (stage) {
    case 'requirements':
      return { nextStage: 'pending_planning', reason: 'Requirements complete -> planning' };
    case 'planning':
      return { nextStage: 'pending_generation', reason: 'Planning complete -> generation' };
    case 'generation':
      // Generator runs its own fix loop until tests pass. No routing to healer.
      return { nextStage: 'pending_audit', reason: 'Generation complete -> audit' };
    case 'audit':
      if (testsPassed) {
        return { nextStage: 'completed', reason: 'Audit passed -> completed' };
      }
      return { nextStage: 'fixme', reason: 'Audit critical findings -> fixme' };
    default:
      return { nextStage: 'fixme', reason: `Unknown stage: ${stage}` };
  }
}

// ── Helpers ──

function loadPipelineConfig(): PipelineConfig {
  const configPath = frameworkPath(path.join('config', 'pipeline-config.json'));
  if (!fs.existsSync(configPath)) {
    console.error('[ERR] config/pipeline-config.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as PipelineConfig;
}

function loadQueue(): QueueFile {
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[ERR] Queue file not found:', SHARED_PATHS.queue);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8')) as QueueFile;
}

function saveQueue(queue: QueueFile): void {
  queue.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SHARED_PATHS.queue, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
}

function findItem(queue: QueueFile, itemId: string): QueueItem | undefined {
  return queue.queue.find(q => q.id === itemId);
}

function runScript(scriptName: string, itemId: string): { exitCode: number; output: string } {
  const execOpts: ExecSyncOptionsWithStringEncoding = {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
    stdio: 'pipe',
    timeout: 120_000, // 2 min max for gate scripts
  };

  try {
    const output = execSync(`npx ts-node scripts/${scriptName}.ts ${itemId}`, execOpts);
    return { exitCode: 0, output: output ?? '' };
  } catch (e: unknown) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    const output = (err.stdout ?? '') + '\n' + (err.stderr ?? '');
    return { exitCode: err.status ?? 1, output };
  }
}

/**
 * Invoke an agent via CLI.
 * Phase 2: Uses `claude -p` for headless invocation.
 * Phase 3 will replace this with SDK `query()`.
 */
function invokeAgent(stage: string, itemId: string): { exitCode: number; output: string } {
  const agentName = STAGE_AGENT_MAP[stage];
  if (!agentName) {
    return { exitCode: 1, output: `[ERR] No agent mapped for stage: ${stage}` };
  }

  // Build prompt for the agent
  const prompt = buildAgentPrompt(stage, itemId);

  console.log(`[->] Invoking agent: ${agentName} for item ${itemId}`);
  console.log(`[info] Agent prompt length: ${prompt.length} chars`);

  // Phase 2 stub: CLI invocation via `claude -p`
  // This requires Claude Code CLI to be installed and configured.
  // If not available, falls back to a dry-run log.
  const execOpts: ExecSyncOptionsWithStringEncoding = {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
    stdio: 'pipe',
    timeout: 600_000, // 10 min max for agent runs
  };

  try {
    // Check if claude CLI is available
    execSync('claude --version', { ...execOpts, timeout: 5_000 });
  } catch {
    console.log('[WARN] claude CLI not available -- running in dry-run mode');
    console.log('[WARN] Install Claude Code CLI for headless agent execution');
    return {
      exitCode: 0,
      output: `[DRY-RUN] Would invoke ${agentName} with prompt (${prompt.length} chars). CLI not available.`,
    };
  }

  try {
    const output = execFileSync(
      'claude',
      ['-p', prompt, '--output-format', 'json'],
      execOpts,
    );
    return { exitCode: 0, output: output ?? '' };
  } catch (e: unknown) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return {
      exitCode: err.status ?? 1,
      output: (err.stdout ?? '') + '\n' + (err.stderr ?? ''),
    };
  }
}

function buildAgentPrompt(stage: string, itemId: string): string {
  // Load agent.md from pipeline-definition.json
  let agentInstructions = '';
  try {
    const defPath = frameworkPath(path.join('config', 'pipeline-definition.json'));
    const definition = JSON.parse(fs.readFileSync(defPath, 'utf-8'));
    const stageDef = definition.stages.find((s: { id: string }) => s.id === stage);
    if (stageDef?.agentFile) {
      const agentPath = path.join(__dirname, '..', stageDef.agentFile);
      let content = fs.readFileSync(agentPath, 'utf-8');
      // Strip YAML frontmatter (GitHub Copilot format)
      if (content.startsWith('---')) {
        const endIdx = content.indexOf('---', 3);
        if (endIdx !== -1) content = content.slice(endIdx + 3).trim();
      }
      agentInstructions = content + '\n\n---\n\n';
      console.log(`[info] Loaded agent file: ${stageDef.agentFile} (${content.length} chars)`);
    }
  } catch (err) {
    console.warn(`[WARN] Could not load agent file for stage ${stage}: ${(err as Error).message}`);
  }

  const contextPrompts: Record<string, string> = {
    requirements: `PIPELINE CONTEXT:\nProcess requirements for queue item ${itemId}. Follow the Requirements Agent protocol. Update REQUIREMENTS.md and create/update the queue entry.`,
    planning: `PIPELINE CONTEXT:\nCreate test cases and test plan for queue item ${itemId}. Follow the Planner Agent protocol. Run planner:post-complete when done.`,
    generation: `PIPELINE CONTEXT:\nGenerate spec file for queue item ${itemId}. Follow the Generator Agent protocol. Run generator:pre-run first, then generate and test the spec. Run generator:post-complete when done.`,
    healing: `PIPELINE CONTEXT:\nDebug and fix failing tests for queue item ${itemId}. Follow the Healer Agent protocol. Read failure-summary.json first. Apply 7-step RCA.`,
    audit: `PIPELINE CONTEXT:\nAudit the completed work for queue item ${itemId}. Follow the Audit Agent protocol. Check all agent outputs for compliance.`,
  };

  return agentInstructions + (contextPrompts[stage] ?? `Process stage ${stage} for item ${itemId}`);
}

function checkTestResults(itemId: string): boolean {
  const failureSummaryPath = path.join(SHARED_PATHS.reports, 'failure-summary.json');
  if (!fs.existsSync(failureSummaryPath)) {
    console.log('[WARN] failure-summary.json not found -- assuming tests did not pass');
    return false;
  }
  try {
    const summary = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
    const passed = (summary.passed ?? 0) > 0 && (summary.failed ?? 0) === 0;
    console.log(`[info] Test results: passed=${summary.passed ?? 0}, failed=${summary.failed ?? 0}`);
    return passed;
  } catch {
    console.log('[WARN] Could not parse failure-summary.json');
    return false;
  }
}

function transitionStage(queue: QueueFile, itemId: string, newStage: string, reason: string): void {
  const item = findItem(queue, itemId);
  if (!item) return;

  const oldStage = item.stage;
  item.stage = newStage;
  item.lockedBy = null;
  item.lockedAt = null;

  // Add history entry for the transition
  if (!item.history) item.history = [];
  item.history.push({
    agent: 'pipeline-orchestrator',
    action: 'stage-transition',
    timestamp: new Date().toISOString(),
    notes: `${oldStage} -> ${newStage}: ${reason}`,
  });

  saveQueue(queue);
  console.log(`[OK] Stage transition: ${oldStage} -> ${newStage} (${reason})`);
}

// ── Pipeline Runner ──

function runPipeline(itemId: string, startFromStage?: string): void {
  const config = loadPipelineConfig();
  const queue = loadQueue();
  const item = findItem(queue, itemId);

  if (!item) {
    console.error(`[ERR] Queue item not found: ${itemId}`);
    process.exit(1);
  }

  if (!config.autoInvoke.enabled) {
    console.log('[WARN] autoInvoke is disabled in config/pipeline-config.json');
    console.log('[WARN] Pipeline will run in dry-run mode (no agent invocations)');
  }

  // Determine starting stage
  const currentPipelineStage = startFromStage ?? QUEUE_TO_PIPELINE[item.stage];
  if (!currentPipelineStage) {
    console.error(`[ERR] Cannot determine pipeline stage from queue stage: ${item.stage}`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Pipeline Orchestrator');
  console.log('='.repeat(60));
  console.log(`Item: ${itemId}`);
  console.log(`Current stage: ${item.stage}`);
  console.log(`Starting from: ${currentPipelineStage}`);
  console.log(`Auto-invoke: ${config.autoInvoke.enabled ? 'ON' : 'OFF'}`);
  console.log('='.repeat(60));

  // Build stage sequence from current position
  const fullSequence = [...config.autoInvoke.loop];
  const startIdx = fullSequence.indexOf(currentPipelineStage);

  if (startIdx === -1) {
    // Check conditional agents (audit can run standalone)
    if (currentPipelineStage === 'audit') {
      runSingleStage(queue, item, currentPipelineStage, config);
      return;
    }
    console.error(`[ERR] Stage ${currentPipelineStage} not found in pipeline loop`);
    process.exit(1);
  }

  const stagesToRun = fullSequence.slice(startIdx);
  console.log(`\n[info] Stages to run: ${stagesToRun.join(' -> ')}`);

  let retryCount = 0;

  for (const stage of stagesToRun) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Stage: ${stage.toUpperCase()}`);
    console.log('─'.repeat(50));

    const result = runSingleStage(queue, item, stage, config);

    if (!result.transitioned) {
      console.log(`\n[BLOCKED] Pipeline blocked at stage: ${stage}`);
      process.exit(1);
    }

    // After generation: route to audit (generator handles its own test loop)
    if (stage === 'generation') {
      const route = routeAfterStage(stage, true, retryCount);
      console.log(`\n[->] Routing: ${route.reason}`);

      // Reload queue after potential modifications
      const freshQueue = loadQueue();
      transitionStage(freshQueue, itemId, route.nextStage, route.reason);

      // Run audit as final stage
      if (QUEUE_TO_PIPELINE[findItem(loadQueue(), itemId)?.stage ?? ''] === 'audit') {
        console.log('\n[->] Entering audit stage...');
        const auditQueue = loadQueue();
        const auditItem = findItem(auditQueue, itemId);
        if (auditItem) {
          const auditResult = runSingleStage(auditQueue, auditItem, 'audit', config);
          if (auditResult.transitioned) {
            const auditRoute = routeAfterStage('audit', true, 0);
            const postAuditQueue = loadQueue();
            transitionStage(postAuditQueue, itemId, auditRoute.nextStage, auditRoute.reason);
          }
        }
      }

      break; // Generation handles its own routing, don't continue loop
    }

    // Normal stage transition
    const route = routeAfterStage(stage, true, 0);
    const freshQueue = loadQueue();
    transitionStage(freshQueue, itemId, route.nextStage, route.reason);
  }

  console.log('\n' + '='.repeat(60));
  const finalItem = findItem(loadQueue(), itemId);
  console.log(`[OK] Pipeline finished. Final stage: ${finalItem?.stage ?? 'unknown'}`);
  console.log('='.repeat(60));
}

function runSingleStage(
  queue: QueueFile,
  item: QueueItem,
  stage: string,
  config: PipelineConfig,
): StageResult {
  const result: StageResult = {
    stage,
    preRun: { exitCode: -1, output: '' },
    agentResult: null,
    postComplete: null,
    transitioned: false,
  };

  // 1. Pre-run gate
  const preRunScript = `${SCRIPT_PREFIX[stage] || stage}-pre-run`;
  console.log(`\n[1/3] Pre-run gate: ${preRunScript}`);
  result.preRun = runScript(preRunScript, item.id);

  if (result.preRun.exitCode !== 0) {
    console.log(`[BLOCKED] Pre-run gate failed (exit ${result.preRun.exitCode})`);
    if (result.preRun.output) {
      const lines = result.preRun.output.split('\n').slice(0, 5);
      lines.forEach(l => console.log(`  ${l}`));
    }
    return result;
  }
  console.log('[OK] Pre-run gate passed');

  // 2. Invoke agent (if auto-invoke enabled)
  if (config.autoInvoke.enabled) {
    console.log(`\n[2/3] Agent invocation: ${STAGE_AGENT_MAP[stage]}`);
    result.agentResult = invokeAgent(stage, item.id);

    if (result.agentResult.exitCode !== 0) {
      console.log(`[WARN] Agent returned non-zero exit code: ${result.agentResult.exitCode}`);
      // Don't block -- post-complete gate will validate
    }
    console.log('[OK] Agent invocation finished');
  } else {
    console.log('\n[2/3] Agent invocation: SKIPPED (autoInvoke disabled)');
    result.agentResult = { exitCode: 0, output: '[SKIP] autoInvoke disabled' };
  }

  // 3. Post-complete gate
  const postCompleteScript = `${SCRIPT_PREFIX[stage] || stage}-post-complete`;
  console.log(`\n[3/3] Post-complete gate: ${postCompleteScript}`);
  result.postComplete = runScript(postCompleteScript, item.id);

  if (result.postComplete.exitCode !== 0) {
    console.log(`[BLOCKED] Post-complete gate failed (exit ${result.postComplete.exitCode})`);
    if (result.postComplete.output) {
      const lines = result.postComplete.output.split('\n').slice(0, 5);
      lines.forEach(l => console.log(`  ${l}`));
    }
    return result;
  }
  console.log('[OK] Post-complete gate passed');

  result.transitioned = true;
  return result;
}

// ── Status Command ──

function showStatus(itemId: string): void {
  const queue = loadQueue();
  const item = findItem(queue, itemId);

  if (!item) {
    console.error(`[ERR] Queue item not found: ${itemId}`);
    process.exit(1);
  }

  const config = loadPipelineConfig();
  const pipelineStage = QUEUE_TO_PIPELINE[item.stage] ?? 'unknown';

  console.log('Pipeline Status');
  console.log('─'.repeat(40));
  console.log(`Item:          ${item.id}`);
  console.log(`Module:        ${item.module}`);
  console.log(`Queue Stage:   ${item.stage}`);
  console.log(`Pipeline:      ${pipelineStage}`);
  console.log(`Locked By:     ${item.lockedBy ?? 'none'}`);
  console.log(`Auto-Invoke:   ${config.autoInvoke.enabled ? 'ON' : 'OFF'}`);
  console.log(`Run Count:     ${item.generatorRunCount ?? 0}`);
  console.log(`Self-Audit:    ${item.selfAuditPassed ? 'PASSED' : 'pending'}`);
  console.log(`Blocked:       ${item.blocked ? `YES (${item.blockedReason ?? 'unknown'})` : 'no'}`);
  console.log(`History:       ${(item.history ?? []).length} entries`);

  if (item.completionContext) {
    const ctx = item.completionContext as Record<string, unknown>;
    console.log('\nCompletion Context:');
    console.log(`  Phase:       ${ctx.phaseCompleted ?? 'none'}`);
    console.log(`  Artifacts:   ${(ctx.artifactsModified as string[] ?? []).join(', ') || 'none'}`);
    console.log(`  Tests:       ${ctx.testsPassed ? 'PASS' : 'pending'}`);
  }
}

// ── CLI ──

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage:');
    console.log('  pipeline:run <item-id>            Run full pipeline');
    console.log('  pipeline:run:from <stage> <id>    Resume from stage');
    console.log('  pipeline:status <item-id>         Show pipeline status');
    process.exit(0);
  }

  if (command === '--status') {
    const itemId = args[1];
    if (!itemId) {
      console.error('[ERR] Usage: pipeline:status <item-id>');
      process.exit(1);
    }
    showStatus(itemId);
    return;
  }

  if (command === '--from') {
    const stage = args[1];
    const itemId = args[2];
    if (!stage || !itemId) {
      console.error('[ERR] Usage: pipeline:run:from <stage> <item-id>');
      process.exit(1);
    }
    runPipeline(itemId, stage);
    return;
  }

  // Default: run pipeline for item
  runPipeline(command);
}

main();
