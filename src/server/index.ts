// --- Crash protection: log and survive ---
process.on('uncaughtException', (err) => {
  console.error('[Encore FATAL] Uncaught exception:', err);
  // Do NOT exit — Fastify server is still functional for other requests
});
process.on('unhandledRejection', (reason) => {
  console.error('[Encore FATAL] Unhandled rejection:', reason);
});

/**
 * Encore Backend API — Fastify server entry point.
 * Phase 0 MVP: No auth, single-tenant, SSE support.
 */

// Load .env files before anything reads process.env
import dotenvFlow from 'dotenv-flow';
dotenvFlow.config({ path: './config/environments' });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getPool, testConnection, initializeSchema, closePool } from './db/client';
import { recoverStaleTasks } from './db/queries';
import { registerPipelineRoutes } from './routes/pipeline';
import { registerEventsRoutes } from './routes/events';
import { registerAdminRoutes, stopSpawnedWorker } from './routes/admin';
import { registerWorkerRoutes } from './routes/worker';
import { registerHealthRoutes } from './routes/health';
import { setEventCallback } from '../orchestrator/orchestrator';
import { broadcastSSE } from './routes/events';

// Wire orchestrator events → SSE broadcast (avoids circular dependency)
setEventCallback((runId, event) => broadcastSSE(runId, event));

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

async function start() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  });

  // CORS
  await app.register(cors, {
    origin: CORS_ORIGIN.split(',').map(s => s.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-worker-secret'],
  });

  // Make pool available via decorator
  const pool = getPool();
  app.decorate('db', pool);

  // Register routes
  registerHealthRoutes(app);
  registerPipelineRoutes(app);
  registerEventsRoutes(app);
  registerAdminRoutes(app);
  registerWorkerRoutes(app);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down...`);
    stopSpawnedWorker();
    await app.close();
    await closePool();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Initialize
  try {
    const dbOk = await testConnection();
    if (!dbOk) {
      app.log.error('Database connection failed. Check DATABASE_URL.');
      process.exit(1);
    }
    app.log.info('Database connected');

    // Auto-initialize schema (idempotent — uses IF NOT EXISTS)
    if (process.env.AUTO_MIGRATE !== 'false') {
      await initializeSchema();
    }

    // Recover tasks stuck in 'claimed' from crashed workers
    try {
      const recovered = await recoverStaleTasks(pool);
      if (recovered > 0) {
        app.log.info(`Recovered ${recovered} stale worker tasks`);
      }
    } catch (err) {
      app.log.warn(`Stale task recovery failed (non-fatal): ${(err as Error).message}`);
    }

    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Encore API listening on ${HOST}:${PORT}`);
    app.log.info(`CORS origin: ${CORS_ORIGIN}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    db: import('pg').Pool;
  }
}
