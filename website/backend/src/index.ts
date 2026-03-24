// --- Crash protection: must be registered before any code that could throw ---
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
  // Do NOT exit — Express server is still functional for other requests.
  // A single bad request shouldn't kill the server for all users.
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
});

import { execSync } from 'child_process';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import jiraRoutes from './routes/jira.routes.js';
import testCasesRoutes from './routes/test-cases.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import websitesRoutes from './routes/websites.routes.js';
import websiteRunsRoutes from './routes/website-runs.routes.js';
import adminRoutes from './routes/admin.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import aiProviderRoutes from './routes/ai-provider.routes.js';
import workerControlRoutes from './routes/worker-control.routes.js';
import bugReportsRoutes from './routes/bug-reports.routes.js';
import testIdsRoutes from './routes/test-ids.routes.js';
import escalationsRoutes from './routes/escalations.routes.js';
import tenantMiddleware from './middleware/tenant.middleware.js';
import pool, { initDb } from './db.js';

// --- Security: warn if JWT_SECRET is not set ---
if (!process.env.JWT_SECRET) {
  console.error('[SECURITY] JWT_SECRET not set! Using insecure default. DO NOT USE IN PRODUCTION.');
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// --- Request body size limit (16kb default is fine, but be explicit) ---
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Auth routes (no tenant middleware needed)
app.use('/api/auth', authRoutes);

// Tenant-aware routes
app.use('/api/chat', tenantMiddleware, chatRoutes);
app.use('/api/jira', tenantMiddleware, jiraRoutes);
app.use('/api/test-cases', tenantMiddleware, testCasesRoutes);
app.use('/api/clients', tenantMiddleware, clientsRoutes);
app.use('/api/websites', tenantMiddleware, websitesRoutes);
app.use('/api/website-runs', tenantMiddleware, websiteRunsRoutes);
app.use('/api/admin', tenantMiddleware, adminRoutes);
app.use('/api/dashboard', tenantMiddleware, dashboardRoutes);
app.use('/api/bugs', tenantMiddleware, bugReportsRoutes);
app.use('/api/test-ids', tenantMiddleware, testIdsRoutes);
app.use('/api/escalations', tenantMiddleware, escalationsRoutes);

// Worker control — JWT-protected proxy to Encore worker lifecycle endpoints.
// Mounted at /api/worker-control (NOT /api/admin) because Vite dev proxy
// sends /api/admin/* directly to Encore, bypassing Express JWT validation.
app.use('/api/worker-control', tenantMiddleware, workerControlRoutes);

// AI Provider routes — mixed auth:
// Worker endpoints use WORKER_SECRET (no JWT needed), admin endpoints use tenant middleware.
// Route-level guards in ai-provider.routes.ts handle the split.
// We skip tenantMiddleware here because workers don't have JWT tokens.
// Admin routes validate via a custom middleware that checks JWT inline.
app.use('/api/ai', aiProviderRoutes);

// --- Cached Claude CLI check (spawns process at most once every 30s) ---
let cliCacheResult: string = 'unknown';
let cliCacheExpiry = 0;

function checkClaudeCli(): string {
  const now = Date.now();
  if (now < cliCacheExpiry) return cliCacheResult;
  try {
    execSync('claude --version', { timeout: 5000, stdio: 'pipe' });
    cliCacheResult = 'ok';
  } catch {
    cliCacheResult = 'unavailable';
  }
  cliCacheExpiry = now + 30000;
  return cliCacheResult;
}

// Health check — real status with DB + Claude CLI probes
app.get('/api/health', async (_req, res) => {
  const checks: Record<string, string> = {};

  // DB check
  try {
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'down';
  }

  // Claude CLI check (cached 30s)
  checks.claude_cli = checkClaudeCli();

  const healthy = Object.values(checks).every(v => v === 'ok');
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// --- Graceful shutdown (registered before initDb so signals during startup are handled) ---
let server: ReturnType<typeof app.listen> | null = null;

async function gracefulShutdown(signal: string) {
  console.log(`[Server] ${signal} received. Draining connections...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed');
      pool.end().then(() => {
        console.log('[Server] DB pool closed');
        process.exit(0);
      }).catch(() => {
        process.exit(0);
      });
    });
  } else {
    // Server not started yet — just close DB pool and exit
    await pool.end().catch(() => {});
    process.exit(0);
  }
  // Force exit after 10s if drain doesn't complete
  setTimeout(() => {
    console.error('[Server] Forced exit after 10s drain timeout');
    process.exit(0);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// --- Initialize database, then start server ---
let dbReady = false;

initDb()
  .then(() => { dbReady = true; })
  .catch((err) => {
    console.error('DB init failed, starting server without DB:', err.message || err);
  })
  .finally(() => {
    server = app.listen(PORT, () => {
      console.log(`IntelliQE API server running on http://localhost:${PORT}${dbReady ? '' : ' (DB unavailable)'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    // --- Handle listen errors (e.g. EADDRINUSE) ---
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[Server] Port ${PORT} already in use. Kill the existing process or use a different port.`);
      } else {
        console.error('[Server] Listen error:', err);
      }
      process.exit(1);
    });
  });
