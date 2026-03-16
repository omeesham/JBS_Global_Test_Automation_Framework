import { Router, Request, Response } from 'express';
import {
  listClients,
  getClientById,
  createClient,
  updateClient,
} from '../services/clients.service.js';

const router = Router();

/**
 * GET /api/clients
 * Super_admin: list all clients.
 * Others: return only their assigned client.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (req.userRole === 'super_admin') {
      const clients = await listClients();
      return res.json(clients);
    }
    // Non-super-admin: return their client only
    if (req.clientId) {
      const client = await getClientById(req.clientId);
      return res.json(client ? [client] : []);
    }
    // Fallback: clientId null but schema set — look up by schema
    const schema = req.tenantSchema;
    if (schema && schema !== 'JBSTestOpsAI') {
      const all = await listClients();
      const match = all.filter((c: any) => c.db_schema === schema);
      return res.json(match);
    }
    return res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list clients' });
  }
});

/**
 * GET /api/clients/:id
 * Get a single client by ID.
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const client = await getClientById(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

/**
 * POST /api/clients
 * Create a new client — super_admin only.
 * Body: { name, slug, contactEmail, plan }
 */
router.post('/', async (req: Request, res: Response) => {
  if (req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden — super_admin only' });
  }

  const { name, slug, contactEmail, plan } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: 'name and slug are required' });
  }

  try {
    const client = await createClient(name, slug, contactEmail, plan);
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

/**
 * PUT /api/clients/:id
 * Update a client — super_admin only.
 * Body: partial client fields.
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden — super_admin only' });
  }

  const id = req.params.id as string;

  try {
    const client = await updateClient(id, req.body);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

export default router;
