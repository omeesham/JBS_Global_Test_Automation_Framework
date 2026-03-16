import pool from '../db.js';
import { provisionTenantSchema } from './tenant.service.js';

/* ------------------------------------------------------------------ */
/*  Client management — super_admin operations                        */
/* ------------------------------------------------------------------ */

export async function listClients() {
  const result = await pool.query('SELECT * FROM "JBSTestOpsAI".clients ORDER BY name');
  return result.rows;
}

export async function getClientById(id: string) {
  const result = await pool.query(
    'SELECT * FROM "JBSTestOpsAI".clients WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

/**
 * Create a new client and provision its tenant schema.
 */
export async function createClient(
  name: string,
  slug: string,
  contactEmail: string,
  plan: string = 'free',
) {
  const dbSchema = await provisionTenantSchema(slug);

  const result = await pool.query(
    `INSERT INTO "JBSTestOpsAI".clients (name, slug, contact_email, plan, db_schema)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, slug, contactEmail, plan, dbSchema],
  );
  return result.rows[0];
}

/**
 * Partial update of client record.
 */
export async function updateClient(id: string, updates: Record<string, unknown>) {
  const allowed = ['name', 'contact_email', 'plan', 'is_active'];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (key in updates) {
      setClauses.push(`${key} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }
  }

  if (setClauses.length === 0) return getClientById(id);

  values.push(id);
  const result = await pool.query(
    `UPDATE "JBSTestOpsAI".clients SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}

/**
 * Usage stats for a single client: run count, total cost, etc.
 */
export async function getClientUsage(clientId: string) {
  const result = await pool.query(
    `SELECT
       c.id AS client_id,
       c.name,
       COUNT(*)               AS total_runs,
       COALESCE(SUM(wr.cost), 0) AS total_cost,
       MAX(wr.created_at)     AS last_run_at
     FROM "JBSTestOpsAI".clients c
     LEFT JOIN "JBSTestOpsAI".website_runs wr ON wr.client_id = c.id
     WHERE c.id = $1
     GROUP BY c.id, c.name`,
    [clientId],
  );
  return result.rows[0] ?? null;
}

/**
 * Aggregate platform-wide stats for super_admin dashboard.
 */
export async function getPlatformStats() {
  const [clients, users, runs, cost] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM "JBSTestOpsAI".clients'),
    pool.query('SELECT COUNT(*)::int AS count FROM "JBSTestOpsAI".platform_users'),
    pool.query('SELECT COUNT(*)::int AS count FROM "JBSTestOpsAI".website_runs'),
    pool.query('SELECT COALESCE(SUM(cost), 0) AS total FROM "JBSTestOpsAI".website_runs'),
  ]);

  return {
    totalClients: clients.rows[0].count,
    totalUsers: users.rows[0].count,
    totalRuns: runs.rows[0].count,
    totalCost: parseFloat(cost.rows[0].total),
  };
}
