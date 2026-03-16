import { Router, Request, Response } from 'express';
import {
  listWebsitesByClient,
  getWebsiteById,
  createWebsite,
  updateWebsite,
} from '../services/websites.service.js';

const ADMIN_ROLES = ['super_admin', 'client_admin'];

const router = Router();

/**
 * GET /api/websites
 * List websites for the current client (tenant-scoped).
 */
router.get('/', async (req: Request, res: Response) => {
  const clientId = req.clientId || (req.query.clientId as string);
  const schema = req.tenantSchema as string;

  if (!clientId) {
    return res.status(400).json({ error: 'No client context — clientId missing' });
  }

  try {
    const websites = await listWebsitesByClient(clientId, schema);
    res.json(websites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list websites' });
  }
});

/**
 * GET /api/websites/:id
 * Get a single website by ID.
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const schema = req.tenantSchema as string;

  try {
    const website = await getWebsiteById(id, schema);
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    res.json(website);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch website' });
  }
});

/**
 * POST /api/websites
 * Create a new website — client_admin+ only.
 * Body: { name, url, authType?, config? }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!ADMIN_ROLES.includes(req.userRole as string)) {
    return res.status(403).json({ error: 'Forbidden — client_admin or higher required' });
  }

  const clientId = req.clientId as string;
  const schema = req.tenantSchema as string;
  const { name, url, authType, config } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'name and url are required' });
  }

  try {
    const website = await createWebsite(clientId, name, url, config || {}, schema);
    res.status(201).json(website);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create website' });
  }
});

/**
 * PUT /api/websites/:id
 * Update a website — client_admin+ only.
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!ADMIN_ROLES.includes(req.userRole as string)) {
    return res.status(403).json({ error: 'Forbidden — client_admin or higher required' });
  }

  const id = req.params.id as string;
  const schema = req.tenantSchema as string;

  try {
    const website = await updateWebsite(id, req.body, schema);
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    res.json(website);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update website' });
  }
});

export default router;
