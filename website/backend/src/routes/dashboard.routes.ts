import { Router } from 'express';
import type { Request, Response } from 'express';
import spawn from 'cross-spawn';
import pool from '../db.js';

const router = Router();
const ENCORE_URL = process.env.ENCORE_URL || 'http://localhost:3100';

/** GET /api/dashboard/summary — AI-generated morning briefing. */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).userId || 'unknown').replace(/[^\w.-]/g, '').slice(0, 50);
    const clientId = (req as any).clientId;
    const isSuperAdmin = (req as any).userRole === 'super_admin';

    // Gather recent activity — scoped to client (prevents cross-tenant data leak)
    const runsQuery = isSuperAdmin
      ? pool.query(`SELECT run_id, website_id, cost, created_at, created_by FROM "JBSTestOpsAI".website_runs ORDER BY created_at DESC LIMIT 5`)
      : clientId
        ? pool.query(`SELECT run_id, website_id, cost, created_at, created_by FROM "JBSTestOpsAI".website_runs WHERE client_id = $1 ORDER BY created_at DESC LIMIT 5`, [clientId])
        : Promise.resolve({ rows: [] });

    const [runsRes, workerRes] = await Promise.allSettled([
      runsQuery,
      fetch(`${ENCORE_URL}/api/admin/worker-status`).then(r => r.json()),
    ]);

    const runs = runsRes.status === 'fulfilled' ? runsRes.value.rows : [];
    const workerOnline = workerRes.status === 'fulfilled' ? !!(workerRes.value as any)?.connected : false;

    // Build a short prompt for haiku
    const runSummary = runs.length > 0
      ? runs.map((r: any) => `Run ${r.run_id} (cost: $${(r.cost ?? 0).toFixed(2)}, ${r.created_at})`).join('; ')
      : 'No recent runs.';

    const prompt = `Recent test runs: ${runSummary}. Worker: ${workerOnline ? 'online' : 'offline'}. User: ${userId}.`;
    const systemPrompt = 'Generate a 2-3 sentence morning briefing summarizing QA testing activity. Be concise and professional. No JSON, just plain text.';

    // Call haiku for fast briefing
    const env = { ...process.env };
    delete env.CLAUDECODE;

    const result = spawn.sync('claude', [
      '--system-prompt', systemPrompt,
      '-p', prompt,
      '--model', 'haiku',
      '--output-format', 'json',
      '--max-turns', '1',
    ], { env, timeout: 10000 });

    if (result.status === 0 && result.stdout) {
      let text: string;
      try {
        const parsed = JSON.parse(result.stdout.toString());
        text = typeof parsed.result === 'string' ? parsed.result : (parsed.text || JSON.stringify(parsed));
      } catch {
        text = result.stdout.toString().trim();
      }
      res.json({ briefing: text, generatedAt: new Date().toISOString() });
    } else {
      // Fallback: static briefing from data
      const fallback = runs.length > 0
        ? `${runs.length} recent test run(s) recorded. Worker is ${workerOnline ? 'online and ready' : 'currently offline'}.`
        : `No recent test activity. Worker is ${workerOnline ? 'online and ready' : 'currently offline'}.`;
      res.json({ briefing: fallback, generatedAt: new Date().toISOString() });
    }
  } catch (err) {
    console.error('Error generating dashboard summary:', err);
    res.json({ briefing: 'Welcome back! Check your dashboard for the latest updates.', generatedAt: new Date().toISOString() });
  }
});

export default router;
