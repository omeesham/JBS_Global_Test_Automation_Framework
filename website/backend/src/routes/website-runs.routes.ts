import { Router } from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import pool from '../db.js';

const router = Router();
const ENCORE_URL = process.env.ENCORE_URL || 'http://localhost:3100';

// POST /api/website-runs — Track a run for a website
router.post('/', async (req: Request, res: Response) => {
  try {
    const { websiteId, runId } = req.body;
    const userId = req.userId || req.body.userId;
    const clientId = req.clientId;
    if (!websiteId || !runId) {
      res.status(400).json({ error: 'websiteId and runId are required' });
      return;
    }
    await pool.query(
      `INSERT INTO "JBSTestOpsAI".website_runs (website_id, run_id, client_id, created_by) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      [websiteId, runId, clientId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error tracking website run:', err);
    res.status(500).json({ error: 'Failed to track run' });
  }
});

// GET /api/website-runs — List runs for a website (tenant-scoped)
router.get('/', async (req: Request, res: Response) => {
  try {
    const websiteId = req.query.website_id as string;
    const clientId = req.clientId;
    if (!websiteId) {
      res.status(400).json({ error: 'website_id query param is required' });
      return;
    }
    const { rows } = await pool.query(
      `SELECT wr.*, c.name as client_name FROM "JBSTestOpsAI".website_runs wr LEFT JOIN "JBSTestOpsAI".clients c ON c.id = wr.client_id WHERE wr.website_id = $1 AND ($2::uuid IS NULL OR wr.client_id = $2) ORDER BY wr.created_at DESC LIMIT 50`,
      [websiteId, req.userRole === 'super_admin' ? null : clientId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error listing website runs:', err);
    res.status(500).json({ error: 'Failed to list runs' });
  }
});

// GET /api/website-runs/:runId/events — SSE proxy with tenant validation
router.get('/:runId/events', async (req: Request, res: Response) => {
  const runId = req.params.runId as string;
  const clientId = req.clientId;

  // Validate this run belongs to user's client (super_admin bypasses)
  if (req.userRole !== 'super_admin') {
    try {
      const { rowCount } = await pool.query(
        `SELECT 1 FROM "JBSTestOpsAI".website_runs WHERE run_id = $1 AND client_id = $2 LIMIT 1`,
        [runId, clientId]
      );
      if (!rowCount) {
        res.status(403).json({ error: 'Unauthorized access to this run' });
        return;
      }
    } catch {
      res.status(500).json({ error: 'Authorization check failed' });
      return;
    }
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Proxy SSE from Encore — forward user role + secret for server-side event filtering
  const isAdmin = req.userRole === 'super_admin' || req.userRole === 'client_admin';
  const roleParam = isAdmin ? 'admin' : 'user';
  const workerSecret = process.env.WORKER_SECRET || 'dev-secret';
  const upstreamUrl = `${ENCORE_URL}/api/events/${runId}?role=${roleParam}&secret=${encodeURIComponent(workerSecret)}`;
  const upstream = http.get(upstreamUrl, (upstreamRes) => {
    upstreamRes.on('data', (chunk: Buffer) => {
      res.write(chunk);
    });
    upstreamRes.on('end', () => {
      res.end();
    });
    upstreamRes.on('error', () => {
      res.end();
    });
  });

  upstream.on('error', () => {
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Backend unavailable' })}\n\n`);
    res.end();
  });

  // Client disconnect → abort upstream
  req.on('close', () => {
    upstream.destroy();
  });
});

export default router;
