import { Router, Request, Response } from 'express';
import {
  getPlatformStats,
  getClientUsage,
  listClients,
  createClient,
  updateClient,
} from '../services/clients.service.js';

const router = Router();

/** Guard: all admin routes require super_admin role. */
function requireSuperAdmin(req: Request, res: Response): boolean {
  if (req.userRole !== 'super_admin') {
    res.status(403).json({ error: 'Requires super_admin role' });
    return false;
  }
  return true;
}

/* GET /platform-stats */
router.get('/platform-stats', async (req: Request, res: Response) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (err) {
    console.error('[Admin] getPlatformStats error:', err);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

/* GET /client-usage */
router.get('/client-usage', async (req: Request, res: Response) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const clients = await listClients();
    const usage = await Promise.all(clients.map((c: { id: string }) => getClientUsage(c.id)));
    res.json(usage.filter(Boolean));
  } catch (err) {
    console.error('[Admin] getClientUsage error:', err);
    res.status(500).json({ error: 'Failed to fetch client usage' });
  }
});

/* GET /clients */
router.get('/clients', async (req: Request, res: Response) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const clients = await listClients();
    res.json(clients);
  } catch (err) {
    console.error('[Admin] listClients error:', err);
    res.status(500).json({ error: 'Failed to list clients' });
  }
});

/* POST /clients */
router.post('/clients', async (req: Request, res: Response) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const { name, slug, contactEmail, plan } = req.body;
    if (!name || !slug || !contactEmail) {
      res.status(400).json({ error: 'name, slug, and contactEmail are required' });
      return;
    }
    const client = await createClient(name, slug, contactEmail, plan);
    res.status(201).json(client);
  } catch (err: any) {
    if (err?.code === '23505') {
      res.status(409).json({ error: 'Client slug already exists' });
      return;
    }
    console.error('[Admin] createClient error:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

/* PUT /clients/:id */
router.put('/clients/:id', async (req: Request, res: Response) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const updated = await updateClient(req.params.id as string, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error('[Admin] updateClient error:', err);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

export default router;
