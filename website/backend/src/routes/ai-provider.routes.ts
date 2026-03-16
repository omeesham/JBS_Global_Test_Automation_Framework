/**
 * AI Provider Routes — super_admin only (except worker endpoints).
 *
 * Admin endpoints: manage per-client AI config, validate keys, view usage.
 * Worker endpoints: self-registration, heartbeat (authenticated via WORKER_SECRET).
 */
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import {
  saveConfig,
  getConfig,
  getAllConfigs,
  updateConfig,
  deleteConfig,
  saveApiKey,
  validateApiKey,
  validateCli,
  registerWorker,
  updateWorkerHeartbeat,
  getAllWorkers,
  getWorkerHeartbeats,
  getUsageSummary,
  runHealthCheck,
  resolveExecutionMethod,
  checkBudget,
} from '../services/ai-provider.service.js';

const router = Router();
const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';
const JWT_SECRET = process.env.JWT_SECRET || 'intelliqe-dev-secret-change-in-production';

// ── Middleware helpers ──

/** Verify JWT and require super_admin role. Mounted outside tenantMiddleware so JWT is verified inline. */
function requireSuperAdmin(req: any, res: any, next: any) {
  const token = req.headers['x-auth-token'] as string;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: super_admin only' });
    }
    req.userRole = payload.role;
    req.userId = payload.username;
    req.clientId = payload.clientId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireWorkerAuth(req: any, res: any, next: any) {
  const secret = req.headers['x-worker-secret'];
  if (secret !== WORKER_SECRET) {
    return res.status(401).json({ error: 'Invalid worker secret' });
  }
  next();
}

/** Accept either super_admin JWT or WORKER_SECRET — for endpoints workers also need (e.g. config list). */
function requireSuperAdminOrWorker(req: any, res: any, next: any) {
  // Try worker secret first (cheaper check)
  const secret = req.headers['x-worker-secret'];
  if (secret === WORKER_SECRET) return next();

  // Fall back to JWT super_admin check
  requireSuperAdmin(req, res, next);
}

// ── Super Admin: Config Management ──

// List all clients' AI configs (also accessible by worker-manager via WORKER_SECRET)
router.get('/configs', requireSuperAdminOrWorker, async (_req, res) => {
  try {
    const configs = await getAllConfigs();
    res.json(configs);
  } catch (err: any) {
    console.error('[ai-provider] GET /configs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single client's config
router.get('/config/:clientId', requireSuperAdmin, async (req, res) => {
  try {
    const config = await getConfig(req.params.clientId);
    if (!config) return res.status(404).json({ error: 'No AI config for this client' });
    res.json(config);
  } catch (err: any) {
    console.error('[ai-provider] GET /config/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create or update AI config for a client
router.post('/config', requireSuperAdmin, async (req, res) => {
  try {
    const { clientId, executionMode, cliConfig, apiConfig } = req.body;
    if (!clientId || !executionMode) {
      return res.status(400).json({ error: 'clientId and executionMode are required' });
    }
    const config = await saveConfig(
      clientId,
      executionMode,
      cliConfig,
      apiConfig,
      req.userId || 'super_admin',
    );
    res.json(config);
  } catch (err: any) {
    console.error('[ai-provider] POST /config error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete AI config
router.delete('/config/:clientId', requireSuperAdmin, async (req, res) => {
  try {
    const deleted = await deleteConfig(req.params.clientId);
    if (!deleted) return res.status(404).json({ error: 'Config not found' });
    res.json({ deleted: true });
  } catch (err: any) {
    console.error('[ai-provider] DELETE /config/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Super Admin: API Key Management ──

// Save/update API key for a client
router.post('/api-key/:clientId', requireSuperAdmin, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'apiKey is required' });
    const result = await saveApiKey(req.params.clientId, apiKey);
    res.json(result);
  } catch (err: any) {
    console.error('[ai-provider] POST /api-key/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Validate API key
router.post('/validate-api-key/:clientId', requireSuperAdmin, async (req, res) => {
  try {
    const result = await validateApiKey(req.params.clientId);
    res.json(result);
  } catch (err: any) {
    console.error('[ai-provider] POST /validate-api-key/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Validate CLI worker status
router.post('/validate-cli/:clientId', requireSuperAdmin, async (req, res) => {
  try {
    const result = await validateCli(req.params.clientId);
    res.json(result);
  } catch (err: any) {
    console.error('[ai-provider] POST /validate-cli/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Super Admin: Usage & Health ──

// Usage breakdown for a client
router.get('/usage/:clientId', requireSuperAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string || '30', 10);
    const summary = await getUsageSummary(req.params.clientId, days);
    res.json(summary);
  } catch (err: any) {
    console.error('[ai-provider] GET /usage/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Budget check
router.get('/budget/:clientId', requireSuperAdmin, async (req, res) => {
  try {
    const budget = await checkBudget(req.params.clientId);
    res.json(budget);
  } catch (err: any) {
    console.error('[ai-provider] GET /budget/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check for a client
router.post('/health-check/:clientId', requireSuperAdmin, async (req, res) => {
  try {
    const result = await runHealthCheck(req.params.clientId);
    res.json(result);
  } catch (err: any) {
    console.error('[ai-provider] POST /health-check/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Super Admin: Worker Management ──

// List all workers
router.get('/workers', requireSuperAdmin, async (_req, res) => {
  try {
    const workers = await getAllWorkers();
    res.json(workers);
  } catch (err: any) {
    console.error('[ai-provider] GET /workers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Worker Endpoints (WORKER_SECRET auth) ──

// Worker self-registration
router.post('/workers/register', requireWorkerAuth, async (req, res) => {
  try {
    const { workerId, clientId, type, hostInfo } = req.body;
    if (!workerId || !type) {
      return res.status(400).json({ error: 'workerId and type are required' });
    }
    const worker = await registerWorker(workerId, clientId || null, type, hostInfo);
    res.json(worker);
  } catch (err: any) {
    console.error('[ai-provider] POST /workers/register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Worker heartbeat
router.put('/workers/:workerId/heartbeat', requireWorkerAuth, async (req, res) => {
  try {
    await updateWorkerHeartbeat(req.params.workerId);
    res.json({ ok: true });
  } catch (err: any) {
    console.error('[ai-provider] PUT /workers/:workerId/heartbeat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Internal: Resolve execution config for a task (worker use) ──

router.get('/internal/resolve/:clientId', requireWorkerAuth, async (req, res) => {
  try {
    const resolved = await resolveExecutionMethod(req.params.clientId);
    if (!resolved) return res.status(404).json({ error: 'No AI config for this client' });
    res.json(resolved);
  } catch (err: any) {
    console.error('[ai-provider] GET /internal/resolve/:clientId error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
