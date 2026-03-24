import { Router } from 'express';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_PATH = path.resolve(__dirname, '../../../../reports/test-id-registry.json');

interface TestIdEntry {
  id: string;
  selectorKey: string;
  testIdValue: string | null;
  pageUrl: string | null;
  status: 'present' | 'missing' | 'changed' | 'removed';
  firstSeenRun: string | null;
  lastVerifiedRun: string | null;
  lastVerifiedAt: string;
  changeHistory: Array<{ from: string | null; to: string | null; runId: string; at: string }>;
  websiteId: string | null;
}

function readRegistry(): TestIdEntry[] {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) return [];
    const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : (data.entries || []);
  } catch (err) {
    console.error('[test-ids] Failed to read registry:', err);
    return [];
  }
}

function writeRegistry(entries: TestIdEntry[]): void {
  const dir = path.dirname(REGISTRY_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ entries, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
}

/** GET /api/test-ids?websiteId=X — list test-ID registry entries */
router.get('/', (req: Request, res: Response) => {
  try {
    let entries = readRegistry();
    const websiteId = req.query.websiteId as string | undefined;
    if (websiteId) {
      entries = entries.filter(e => e.websiteId === websiteId);
    }
    res.json({ entries, total: entries.length });
  } catch (err) {
    console.error('[test-ids] Failed to list entries:', err);
    res.status(500).json({ error: 'Failed to list test-ID entries' });
  }
});

/** GET /api/test-ids/changes?since=TIMESTAMP — test-IDs that changed since timestamp */
router.get('/changes', (req: Request, res: Response) => {
  try {
    const since = req.query.since as string | undefined;
    if (!since) {
      return res.status(400).json({ error: 'since query parameter is required (ISO timestamp)' });
    }
    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid timestamp format' });
    }

    const entries = readRegistry();
    const changed = entries.filter(e => {
      // Check if any change in history is after the since timestamp
      return e.changeHistory.some(ch => new Date(ch.at).getTime() > sinceDate.getTime());
    });

    res.json({ since, entries: changed, total: changed.length });
  } catch (err) {
    console.error('[test-ids] Failed to get changes:', err);
    res.status(500).json({ error: 'Failed to get test-ID changes' });
  }
});

/** POST /api/test-ids/verify — bulk verify test-IDs */
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { selectors, runId, websiteId } = req.body;
    if (!Array.isArray(selectors)) {
      return res.status(400).json({ error: 'selectors[] is required (array of { key, expectedValue })' });
    }

    const entries = readRegistry();
    const now = new Date().toISOString();
    const results: Array<{ key: string; status: string; changed: boolean }> = [];

    for (const sel of selectors) {
      const { key, expectedValue } = sel;
      if (!key) continue;

      const existing = entries.find(
        e => e.selectorKey === key && (e.websiteId === (websiteId || null))
      );

      if (existing) {
        const changed = existing.testIdValue !== expectedValue;
        if (changed) {
          existing.changeHistory.push({
            from: existing.testIdValue,
            to: expectedValue,
            runId: runId || 'manual',
            at: now,
          });
          existing.testIdValue = expectedValue;
          existing.status = expectedValue ? 'changed' : 'removed';
        } else {
          existing.status = expectedValue ? 'present' : 'missing';
        }
        existing.lastVerifiedRun = runId || null;
        existing.lastVerifiedAt = now;
        results.push({ key, status: existing.status, changed });
      } else {
        // New entry
        const entry: TestIdEntry = {
          id: randomUUID(),
          selectorKey: key,
          testIdValue: expectedValue || null,
          pageUrl: null,
          status: expectedValue ? 'present' : 'missing',
          firstSeenRun: runId || null,
          lastVerifiedRun: runId || null,
          lastVerifiedAt: now,
          changeHistory: [],
          websiteId: websiteId || null,
        };
        entries.push(entry);
        results.push({ key, status: entry.status, changed: false });
      }
    }

    writeRegistry(entries);
    res.json({ verified: results.length, results });
  } catch (err) {
    console.error('[test-ids] Failed to verify:', err);
    res.status(500).json({ error: 'Failed to verify test-IDs' });
  }
});

/** PATCH /api/test-ids/:id — update test-ID status */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const entries = readRegistry();
    const entry = entries.find(e => e.id === req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Test-ID entry not found' });
    }

    const { status, testIdValue, pageUrl } = req.body;
    if (status) entry.status = status;
    if (testIdValue !== undefined) entry.testIdValue = testIdValue;
    if (pageUrl !== undefined) entry.pageUrl = pageUrl;
    entry.lastVerifiedAt = new Date().toISOString();

    writeRegistry(entries);
    res.json({ ok: true, id: entry.id, status: entry.status });
  } catch (err) {
    console.error('[test-ids] Failed to update entry:', err);
    res.status(500).json({ error: 'Failed to update test-ID entry' });
  }
});

export default router;
