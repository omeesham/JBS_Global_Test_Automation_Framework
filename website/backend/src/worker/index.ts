#!/usr/bin/env ts-node
// --- Crash protection ---
process.on('uncaughtException', (err) => {
  console.error('[Worker FATAL] Uncaught exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Worker FATAL] Unhandled rejection:', reason);
});

/**
 * Local Pipeline Worker
 * Polls backend for tasks, invokes Claude CLI, reports results.
 * Start: npm run worker:start
 */

import dotenvFlow from 'dotenv-flow';
dotenvFlow.config({ path: './config/environments' });

import { execFileSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { PipelineDefinition } from '../orchestrator/types';
import { callAnthropicAPI } from './sdk-executor';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3100';
const WEBSITE_BACKEND_URL = process.env.WEBSITE_BACKEND_URL || 'http://localhost:3001';
const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';
const WORKER_ID = process.env.WORKER_ID || 'local-worker-1';
const WORKER_TYPE = (process.env.WORKER_TYPE || 'cli_dedicated') as 'cli_dedicated' | 'api_shared';
const WORKER_CLIENT_ID = process.env.WORKER_CLIENT_ID || null;

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
  } | null;
}

let config: PipelineDefinition['defaults'] | null = null;

async function loadConfig(): Promise<PipelineDefinition['defaults']> {
  if (config) return config;
  try {
    const res = await fetch();
    if (res.ok) {
      const definition = await res.json() as PipelineDefinition;
      config = definition.defaults;
      return config;
    }
  } catch {}
  const localPath = path.join(__dirname, '../../config/pipeline-definition.json');
  if (fs.existsSync(localPath)) {
    const definition = JSON.parse(fs.readFileSync(localPath, 'utf-8')) as PipelineDefinition;
    config = definition.defaults;
    return config;
  }
  return {
    model: 'sonnet', maxTurnsPerStage: 50, budgetPerRunUsd: 2, budgetPerStageUsd: 0.5,
    workerPollIntervalMs: 5000, workerHeartbeatIntervalMs: 30000,
    cliPath: 'claude', cliOutputFormat: 'json', agentRunner: 'cli' as const, autoInvoke: true,
  };
}
