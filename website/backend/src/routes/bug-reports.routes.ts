import { Router } from 'express';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUGS_DIR = path.resolve(__dirname, '../../../../reports/bugs');

interface BugReport {
  id: string;
  testCaseId: string;
  module: string;
  feature: string;
  severity: string;
  title: string;
  description: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  pageUrl: string;
  screenshotPath: string | null;
  failureCategory?: string;
  bugHuntCategory?: string;
  sourceAgent?: string;
  errorHash?: string;
  triageResult?: Record<string, unknown>;
  rcaEvidence?: Record<string, unknown>;
  confidence?: string;
  runId?: string;
  queueItemId?: string;
  websiteId?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

function readBugReports(): BugReport[] {
  if (!fs.existsSync(BUGS_DIR)) return [];
  const files = fs.readdirSync(BUGS_DIR).filter(f => f.endsWith('.json'));
  const bugs: BugReport[] = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(BUGS_DIR, file), 'utf-8');
      bugs.push(JSON.parse(content));
    } catch { /* skip malformed files */ }
  }
  return bugs;
}

/** GET /api/bugs — list bugs, optionally filter by module/severity/status */
router.get('/', (_req: Request, res: Response) => {
  try {
    let bugs = readBugReports();
    const { module, severity, status } = _req.query;
    if (module) bugs = bugs.filter(b => b.module === module);
    if (severity) bugs = bugs.filter(b => b.severity === severity);
    if (status) bugs = bugs.filter(b => b.status === status);
    bugs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ bugs, total: bugs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read bug reports' });
  }
});

/** GET /api/bugs/stats — aggregate stats */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const bugs = readBugReports();
    const open = bugs.filter(b => b.status === 'open').length;
    const confirmed = bugs.filter(b => b.status === 'confirmed').length;
    const fixed = bugs.filter(b => b.status === 'fixed').length;
    const bySeverity: Record<string, number> = {};
    const byModule: Record<string, number> = {};
    for (const bug of bugs) {
      bySeverity[bug.severity] = (bySeverity[bug.severity] || 0) + 1;
      byModule[bug.module] = (byModule[bug.module] || 0) + 1;
    }
    res.json({ totalOpen: open, totalConfirmed: confirmed, totalFixed: fixed, bySeverity, byModule });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute bug stats' });
  }
});

// ── Failure History Endpoints ──

const FAILURE_HISTORY_PATH = path.resolve(__dirname, '../../../../reports/failure-history.json');

interface FailureHistoryEntry {
  testName: string;
  testFile?: string;
  errorHash?: string;
  failureCategory?: string;
  bugHuntCategory?: string;
  runId?: string;
  websiteId?: string;
  createdAt: string;
}

function readFailureHistory(): FailureHistoryEntry[] {
  try {
    if (!fs.existsSync(FAILURE_HISTORY_PATH)) return [];
    const content = fs.readFileSync(FAILURE_HISTORY_PATH, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : (data.entries || []);
  } catch (err) {
    console.error('[bug-reports] Failed to read failure history:', err);
    return [];
  }
}

/** GET /api/bugs/history?testName=X — failure history for a test */
router.get('/history', (req: Request, res: Response) => {
  try {
    const testName = req.query.testName as string | undefined;
    if (!testName) {
      return res.status(400).json({ error: 'testName query parameter is required' });
    }
    const history = readFailureHistory().filter(e => e.testName === testName);
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ testName, history, total: history.length });
  } catch (err) {
    console.error('[bug-reports] Failed to read failure history:', err);
    res.status(500).json({ error: 'Failed to read failure history' });
  }
});

/** GET /api/bugs/correlation?runId=X — failure patterns for a run */
router.get('/correlation', (req: Request, res: Response) => {
  try {
    const runId = req.query.runId as string | undefined;
    if (!runId) {
      return res.status(400).json({ error: 'runId query parameter is required' });
    }
    const history = readFailureHistory();
    const runFailures = history.filter(e => e.runId === runId);

    // Build correlation: group by errorHash to find repeated patterns
    const byHash: Record<string, FailureHistoryEntry[]> = {};
    for (const entry of runFailures) {
      const key = entry.errorHash || 'unknown';
      if (!byHash[key]) byHash[key] = [];
      byHash[key].push(entry);
    }

    // For each hash in this run, find total historical occurrences
    const patterns = Object.entries(byHash).map(([hash, entries]) => {
      const allOccurrences = hash !== 'unknown'
        ? history.filter(e => e.errorHash === hash).length
        : entries.length;
      return {
        errorHash: hash,
        testsInRun: entries.map(e => e.testName),
        countInRun: entries.length,
        totalHistorical: allOccurrences,
        isRecurring: allOccurrences > entries.length,
        category: entries[0]?.failureCategory || null,
        bugHuntCategory: entries[0]?.bugHuntCategory || null,
      };
    });

    patterns.sort((a, b) => b.totalHistorical - a.totalHistorical);
    res.json({ runId, patterns, totalFailures: runFailures.length });
  } catch (err) {
    console.error('[bug-reports] Failed to compute correlation:', err);
    res.status(500).json({ error: 'Failed to compute failure correlation' });
  }
});

/** GET /api/bugs/:id — single bug detail */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const bugs = readBugReports();
    const bug = bugs.find(b => b.id === req.params.id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read bug report' });
  }
});

/** PATCH /api/bugs/:id/status — update bug status */
router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { status: newStatus } = req.body;
    const valid = ['open', 'confirmed', 'fixed', 'wont_fix', 'not_a_bug'];
    if (!valid.includes(newStatus)) {
      return res.status(400).json({ error: `Invalid status. Must be: ${valid.join(', ')}` });
    }
    if (!fs.existsSync(BUGS_DIR)) return res.status(404).json({ error: 'No bug reports directory' });
    const files = fs.readdirSync(BUGS_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(BUGS_DIR, file);
      try {
        const bug = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (bug.id === req.params.id) {
          bug.status = newStatus;
          fs.writeFileSync(filePath, JSON.stringify(bug, null, 2) + '\n', 'utf-8');
          return res.json({ ok: true, id: bug.id, status: newStatus });
        }
      } catch { /* skip */ }
    }
    res.status(404).json({ error: 'Bug not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bug status' });
  }
});

// ── Triage Endpoints ──

const TRIAGE_DIR = path.resolve(__dirname, '../../../../reports/triage');

interface TriageItem {
  id: string;
  runId: string;
  testName: string;
  testFile: string;
  whatHappened: string;
  whyItHappened: string;
  whatToDo: string;
  disposition: string;
  confidence: string;
  severity: string | null;
  bugHuntCategory?: string;
  decision: 'report_bug' | 'heal_feature_change' | 'dismiss' | null;
  decidedAt: string | null;
}

function readTriageItems(runId?: string): TriageItem[] {
  if (!fs.existsSync(TRIAGE_DIR)) return [];
  const files = fs.readdirSync(TRIAGE_DIR).filter(f => f.endsWith('.json'));
  const items: TriageItem[] = [];
  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(TRIAGE_DIR, file), 'utf-8'));
      if (Array.isArray(content)) {
        items.push(...content);
      } else if (content.items) {
        items.push(...content.items);
      }
    } catch { /* skip */ }
  }
  return runId ? items.filter(i => i.runId === runId) : items;
}

function saveTriageItems(runId: string, items: TriageItem[]): void {
  if (!fs.existsSync(TRIAGE_DIR)) fs.mkdirSync(TRIAGE_DIR, { recursive: true });
  const filePath = path.join(TRIAGE_DIR, `triage-${runId.slice(0, 8)}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ runId, items, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
}

/** POST /api/bugs/triage — store triage report items */
router.post('/triage', (req: Request, res: Response) => {
  try {
    const { runId, items } = req.body;
    if (!runId || !Array.isArray(items)) {
      return res.status(400).json({ error: 'runId and items[] are required' });
    }
    const triageItems: TriageItem[] = items.map((item: any, i: number) => ({
      id: `TRG-${runId.slice(0, 8)}-${String(i + 1).padStart(3, '0')}`,
      runId,
      testName: item.testName || '',
      testFile: item.testFile || '',
      whatHappened: item.whatHappened || '',
      whyItHappened: item.whyItHappened || '',
      whatToDo: item.whatToDo || '',
      disposition: item.disposition || 'UNCERTAIN',
      confidence: item.confidence || 'LOW',
      severity: item.severity || null,
      bugHuntCategory: item.bugHuntCategory || undefined,
      decision: null,
      decidedAt: null,
    }));
    saveTriageItems(runId, triageItems);
    res.status(201).json({ stored: triageItems.length, runId });
  } catch {
    res.status(500).json({ error: 'Failed to store triage items' });
  }
});

/** GET /api/bugs/triage?runId=X — fetch triage items for a run */
router.get('/triage', (req: Request, res: Response) => {
  try {
    const runId = req.query.runId as string | undefined;
    const items = readTriageItems(runId);
    res.json({ items, total: items.length, pending: items.filter(i => !i.decision).length });
  } catch {
    res.status(500).json({ error: 'Failed to read triage items' });
  }
});

/** POST /api/bugs/triage/:id/decide — single triage decision */
router.post('/triage/:id/decide', (req: Request, res: Response) => {
  try {
    const { decision } = req.body;
    const validDecisions = ['report_bug', 'heal_feature_change', 'dismiss'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ error: `Invalid decision. Must be: ${validDecisions.join(', ')}` });
    }

    // Find the item across all triage files
    const files = fs.existsSync(TRIAGE_DIR) ? fs.readdirSync(TRIAGE_DIR).filter(f => f.endsWith('.json')) : [];
    for (const file of files) {
      const filePath = path.join(TRIAGE_DIR, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const items: TriageItem[] = data.items || [];
        const item = items.find(i => i.id === req.params.id);
        if (item) {
          item.decision = decision;
          item.decidedAt = new Date().toISOString();
          fs.writeFileSync(filePath, JSON.stringify({ ...data, items, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
          return res.json({ ok: true, id: item.id, decision });
        }
      } catch { /* skip */ }
    }
    res.status(404).json({ error: 'Triage item not found' });
  } catch {
    res.status(500).json({ error: 'Failed to update triage decision' });
  }
});

/** POST /api/bugs/triage/bulk-decide — batch triage decisions */
router.post('/triage/bulk-decide', (req: Request, res: Response) => {
  try {
    const { ids, decision } = req.body;
    const validDecisions = ['report_bug', 'heal_feature_change', 'dismiss'];
    if (!Array.isArray(ids) || !validDecisions.includes(decision)) {
      return res.status(400).json({ error: 'ids[] and valid decision are required' });
    }

    const idSet = new Set(ids as string[]);
    let updated = 0;
    const files = fs.existsSync(TRIAGE_DIR) ? fs.readdirSync(TRIAGE_DIR).filter(f => f.endsWith('.json')) : [];
    for (const file of files) {
      const filePath = path.join(TRIAGE_DIR, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const items: TriageItem[] = data.items || [];
        let changed = false;
        for (const item of items) {
          if (idSet.has(item.id)) {
            item.decision = decision;
            item.decidedAt = new Date().toISOString();
            updated++;
            changed = true;
          }
        }
        if (changed) {
          fs.writeFileSync(filePath, JSON.stringify({ ...data, items, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
        }
      } catch { /* skip */ }
    }
    res.json({ ok: true, updated });
  } catch {
    res.status(500).json({ error: 'Failed to bulk-update triage decisions' });
  }
});

export default router;
