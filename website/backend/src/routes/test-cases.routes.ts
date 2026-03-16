import { Router } from 'express';
import type { Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

/* ───────────────────────────────────────────
   POST /api/test-cases/save
   Save generated test cases to DB
   ─────────────────────────────────────────── */
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { username, storyKey, storyTitle, source, columns, testCases } = req.body;
    if (!username || !Array.isArray(testCases) || testCases.length === 0) {
      res.status(400).json({ error: 'username and testCases[] are required' });
      return;
    }

    // Create test_run record
    const runResult = await pool.query(
      `INSERT INTO test_runs (username, story_key, story_title, source, columns)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [username, storyKey || null, storyTitle || null, source || null, JSON.stringify(columns || [])]
    );
    const testRunId: string = runResult.rows[0].id;

    // Insert test cases
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      await pool.query(
        `INSERT INTO test_cases (test_run_id, tc_number, title, steps, expected, priority, type, feature, precondition, status, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          testRunId,
          tc.id || `TC-${String(i + 1).padStart(3, '0')}`,
          tc.scenario || tc.title || '',
          JSON.stringify(tc.steps || []),
          tc.expectedResult || tc.expected || '',
          tc.priority || 'P1',
          tc.type || 'positive',
          tc.feature || '',
          tc.precondition || '',
          tc.status || 'generated',
          i,
        ]
      );
    }

    console.log(`Saved ${testCases.length} test cases for user=${username}, runId=${testRunId}`);
    res.json({ ok: true, testRunId, count: testCases.length });
  } catch (err: any) {
    console.error('Save test cases error:', err.message);
    res.status(500).json({ error: 'Failed to save test cases' });
  }
});

/* ───────────────────────────────────────────
   GET /api/test-cases/:testRunId
   Fetch saved test cases for a run
   ─────────────────────────────────────────── */
router.get('/:testRunId', async (req: Request, res: Response) => {
  try {
    const { testRunId } = req.params;
    const runRes = await pool.query(`SELECT * FROM test_runs WHERE id = $1`, [testRunId]);
    if (runRes.rows.length === 0) { res.status(404).json({ error: 'Test run not found' }); return; }

    const casesRes = await pool.query(
      `SELECT * FROM test_cases WHERE test_run_id = $1 ORDER BY sort_order`,
      [testRunId]
    );

    res.json({ testRun: runRes.rows[0], testCases: casesRes.rows });
  } catch (err: any) {
    console.error('Fetch test cases error:', err.message);
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
});

/* ───────────────────────────────────────────
   GET /api/test-cases/:testRunId/export?format=csv|jira|testrail
   Export test cases in requested format
   ─────────────────────────────────────────── */
router.get('/:testRunId/export', async (req: Request, res: Response) => {
  try {
    const { testRunId } = req.params;
    const format = (req.query.format as string || 'csv').toLowerCase();

    const casesRes = await pool.query(
      `SELECT * FROM test_cases WHERE test_run_id = $1 ORDER BY sort_order`,
      [testRunId]
    );
    if (casesRes.rows.length === 0) { res.status(404).json({ error: 'No test cases found' }); return; }

    const cases = casesRes.rows;

    if (format === 'testrail') {
      // TestRail CSV import format
      const header = 'Title,Steps (Step),Steps (Expected Result),Priority,Type,Preconditions';
      const rows = cases.map(tc => {
        const steps = (tc.steps || []).map((s: string, i: number) => `Step ${i + 1}: ${s}`).join('\n');
        return [
          csvEscape(tc.title),
          csvEscape(steps),
          csvEscape(tc.expected || ''),
          csvEscape(mapPriorityToTestrail(tc.priority)),
          csvEscape(tc.type || 'Functional'),
          csvEscape(tc.precondition || ''),
        ].join(',');
      });
      const csv = '\uFEFF' + header + '\n' + rows.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="testcases-testrail-${testRunId.slice(0, 8)}.csv"`);
      res.send(csv);

    } else if (format === 'jira') {
      // JIRA-compatible CSV (for Zephyr/Xray import)
      const header = 'Test Case ID,Summary,Test Steps,Expected Result,Priority,Labels,Status';
      const rows = cases.map(tc => {
        const steps = (tc.steps || []).map((s: string, i: number) => `${i + 1}. ${s}`).join(' | ');
        return [
          csvEscape(tc.tc_number),
          csvEscape(tc.title),
          csvEscape(steps),
          csvEscape(tc.expected || ''),
          csvEscape(mapPriorityToJira(tc.priority)),
          csvEscape(tc.type || ''),
          csvEscape(tc.status || 'Draft'),
        ].join(',');
      });
      const csv = '\uFEFF' + header + '\n' + rows.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="testcases-jira-${testRunId.slice(0, 8)}.csv"`);
      res.send(csv);

    } else {
      // Default: Standard Excel-compatible CSV
      const header = 'TC Number,Title,Test Steps,Expected Result,Priority,Type,Feature,Precondition,Status';
      const rows = cases.map(tc => {
        const steps = (tc.steps || []).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
        return [
          csvEscape(tc.tc_number),
          csvEscape(tc.title),
          csvEscape(steps),
          csvEscape(tc.expected || ''),
          csvEscape(tc.priority || ''),
          csvEscape(tc.type || ''),
          csvEscape(tc.feature || ''),
          csvEscape(tc.precondition || ''),
          csvEscape(tc.status || ''),
        ].join(',');
      });
      const csv = '\uFEFF' + header + '\n' + rows.join('\n');
      const ext = format === 'excel' ? 'csv' : 'csv';
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="testcases-${testRunId.slice(0, 8)}.${ext}"`);
      res.send(csv);
    }
  } catch (err: any) {
    console.error('Export test cases error:', err.message);
    res.status(500).json({ error: 'Failed to export test cases' });
  }
});

/* ── Helpers ── */
function csvEscape(val: string): string {
  if (!val) return '""';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function mapPriorityToTestrail(p: string): string {
  switch (p) {
    case 'P0': return 'Critical';
    case 'P1': return 'High';
    case 'P2': return 'Medium';
    case 'P3': return 'Low';
    default: return 'Medium';
  }
}

function mapPriorityToJira(p: string): string {
  switch (p) {
    case 'P0': return 'Highest';
    case 'P1': return 'High';
    case 'P2': return 'Medium';
    case 'P3': return 'Low';
    default: return 'Medium';
  }
}

export default router;
