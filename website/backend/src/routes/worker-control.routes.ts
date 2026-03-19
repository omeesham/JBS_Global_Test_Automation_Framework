import { Router, Request, Response } from 'express';

const router = Router();

const ENCORE_URL = process.env.ENCORE_URL || 'http://localhost:3100';
const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';

const encoreHeaders = {
  'x-worker-secret': WORKER_SECRET,
  'content-type': 'application/json',
};

function requireSuperAdmin(req: Request, res: Response): boolean {
  if (req.userRole !== 'super_admin') {
    res.status(403).json({ error: 'Requires super_admin role' });
    return false;
  }
  return true;
}

/** Proxy helper — forwards to Encore and relays response */
async function proxyToEncore(encorePath: string, method: 'GET' | 'POST', res: Response): Promise<void> {
  try {
    const resp = await fetch(`${ENCORE_URL}${encorePath}`, {
      method,
      headers: encoreHeaders,
      // Fastify requires a body when content-type is application/json
      ...(method === 'POST' ? { body: '{}' } : {}),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    console.error(`[worker-control] Proxy error (${encorePath}):`, (err as Error).message);
    res.status(502).json({ error: 'Encore backend unreachable' });
  }
}

/* GET /status — any authenticated user can see worker status */
router.get('/status', async (_req: Request, res: Response) => {
  await proxyToEncore('/api/admin/worker-status', 'GET', res);
});

/* POST /start — any authenticated user (starting is non-destructive & idempotent) */
router.post('/start', async (_req: Request, res: Response) => {
  await proxyToEncore('/api/admin/worker/start', 'POST', res);
});

/* POST /stop — super_admin only */
router.post('/stop', async (req: Request, res: Response) => {
  if (!requireSuperAdmin(req, res)) return;
  await proxyToEncore('/api/admin/worker/stop', 'POST', res);
});

/* POST /restart — super_admin only */
router.post('/restart', async (req: Request, res: Response) => {
  if (!requireSuperAdmin(req, res)) return;
  await proxyToEncore('/api/admin/worker/restart', 'POST', res);
});

export default router;
