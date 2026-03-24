import { Router } from 'express';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ESCALATIONS_PATH = path.resolve(__dirname, '../../../../reports/escalations.json');

interface Escalation {
  id: string;
  type: 'bug_dispute' | 'flake_override' | 'rework_request' | 'pipeline_block' | 'manual';
  title: string;
  description: string;
  sourceAgent: string | null;
  targetAgent: string | null;
  bugId: string | null;
  runId: string | null;
  websiteId: string | null;
  status: 'open' | 'in_rework' | 'resolved' | 'dismissed';
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  reworkHistory: Array<{ action: string; agent: string; at: string; notes?: string }>;
  createdAt: string;
  updatedAt: string;
}

function readEscalations(): Escalation[] {
  try {
    if (!fs.existsSync(ESCALATIONS_PATH)) return [];
    const content = fs.readFileSync(ESCALATIONS_PATH, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : (data.escalations || []);
  } catch (err) {
    console.error('[escalations] Failed to read escalations:', err);
    return [];
  }
}

function writeEscalations(escalations: Escalation[]): void {
  const dir = path.dirname(ESCALATIONS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    ESCALATIONS_PATH,
    JSON.stringify({ escalations, updatedAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );
}

/** POST /api/escalations — create escalation */
router.post('/', (req: Request, res: Response) => {
  try {
    const { type, title, description, sourceAgent, targetAgent, bugId, runId, websiteId } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const now = new Date().toISOString();
    const escalation: Escalation = {
      id: randomUUID(),
      type: type || 'manual',
      title,
      description: description || '',
      sourceAgent: sourceAgent || null,
      targetAgent: targetAgent || null,
      bugId: bugId || null,
      runId: runId || null,
      websiteId: websiteId || null,
      status: 'open',
      resolution: null,
      resolvedBy: null,
      resolvedAt: null,
      reworkHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    const escalations = readEscalations();
    escalations.push(escalation);
    writeEscalations(escalations);

    res.status(201).json(escalation);
  } catch (err) {
    console.error('[escalations] Failed to create escalation:', err);
    res.status(500).json({ error: 'Failed to create escalation' });
  }
});

/** GET /api/escalations?status=open — list escalations */
router.get('/', (req: Request, res: Response) => {
  try {
    let escalations = readEscalations();
    const status = req.query.status as string | undefined;
    if (status) {
      escalations = escalations.filter(e => e.status === status);
    }
    escalations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ escalations, total: escalations.length });
  } catch (err) {
    console.error('[escalations] Failed to list escalations:', err);
    res.status(500).json({ error: 'Failed to list escalations' });
  }
});

/** PATCH /api/escalations/:id — resolve/close escalation */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const escalations = readEscalations();
    const escalation = escalations.find(e => e.id === req.params.id);
    if (!escalation) {
      return res.status(404).json({ error: 'Escalation not found' });
    }

    const { status, resolution, resolvedBy } = req.body;
    const now = new Date().toISOString();

    if (status) escalation.status = status;
    if (resolution) escalation.resolution = resolution;
    if (resolvedBy) escalation.resolvedBy = resolvedBy;
    if (status === 'resolved' || status === 'dismissed') {
      escalation.resolvedAt = now;
    }
    escalation.updatedAt = now;

    writeEscalations(escalations);
    res.json({ ok: true, id: escalation.id, status: escalation.status });
  } catch (err) {
    console.error('[escalations] Failed to update escalation:', err);
    res.status(500).json({ error: 'Failed to update escalation' });
  }
});

/** POST /api/escalations/:id/rework — trigger rework for target agent */
router.post('/:id/rework', (req: Request, res: Response) => {
  try {
    const escalations = readEscalations();
    const escalation = escalations.find(e => e.id === req.params.id);
    if (!escalation) {
      return res.status(404).json({ error: 'Escalation not found' });
    }

    const { agent, notes } = req.body;
    const now = new Date().toISOString();

    escalation.status = 'in_rework';
    escalation.reworkHistory.push({
      action: 'rework_triggered',
      agent: agent || escalation.targetAgent || 'unknown',
      at: now,
      notes: notes || undefined,
    });
    escalation.updatedAt = now;

    writeEscalations(escalations);
    res.json({
      ok: true,
      id: escalation.id,
      status: escalation.status,
      reworkAgent: agent || escalation.targetAgent,
    });
  } catch (err) {
    console.error('[escalations] Failed to trigger rework:', err);
    res.status(500).json({ error: 'Failed to trigger rework' });
  }
});

/** POST /api/escalations/:id/rework-complete — mark rework done, unblock */
router.post('/:id/rework-complete', (req: Request, res: Response) => {
  try {
    const escalations = readEscalations();
    const escalation = escalations.find(e => e.id === req.params.id);
    if (!escalation) {
      return res.status(404).json({ error: 'Escalation not found' });
    }

    const { agent, notes, resolution } = req.body;
    const now = new Date().toISOString();

    escalation.reworkHistory.push({
      action: 'rework_completed',
      agent: agent || escalation.targetAgent || 'unknown',
      at: now,
      notes: notes || undefined,
    });
    escalation.status = 'resolved';
    escalation.resolution = resolution || 'Rework completed';
    escalation.resolvedAt = now;
    escalation.updatedAt = now;

    writeEscalations(escalations);
    res.json({ ok: true, id: escalation.id, status: escalation.status });
  } catch (err) {
    console.error('[escalations] Failed to complete rework:', err);
    res.status(500).json({ error: 'Failed to complete rework' });
  }
});

export default router;
