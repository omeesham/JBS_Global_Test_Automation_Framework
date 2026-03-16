import { queryWithSchema } from '../db.js';
import pool from '../db.js';

/* ------------------------------------------------------------------ */
/*  Website management — tenant-scoped operations                     */
/* ------------------------------------------------------------------ */

export async function listWebsitesByClient(_clientId: string, schema: string) {
  // websites table has no client_id — tenant isolation is the boundary
  const result = await queryWithSchema(
    schema,
    'SELECT * FROM websites ORDER BY created_at DESC',
  );
  return result.rows;
}

export async function getWebsiteById(id: string, schema: string) {
  const result = await queryWithSchema(
    schema,
    'SELECT * FROM websites WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createWebsite(
  _clientId: string,
  name: string,
  url: string,
  config: Record<string, unknown>,
  schema: string,
) {
  // websites table has no client_id — tenant schema IS the isolation boundary
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const result = await queryWithSchema(
    schema,
    `INSERT INTO websites (name, slug, base_url, config)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, slug, url, JSON.stringify(config)],
  );
  return result.rows[0];
}

export async function updateWebsite(
  id: string,
  updates: Record<string, unknown>,
  schema: string,
) {
  const allowed = ['name', 'base_url', 'target_url', 'auth_type', 'auth_config', 'app_framework', 'description', 'config', 'enabled_services', 'is_active'];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (key in updates) {
      setClauses.push(`${key} = $${idx}`);
      values.push(typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]);
      idx++;
    }
  }

  if (setClauses.length === 0) return getWebsiteById(id, schema);

  values.push(id);
  const result = await queryWithSchema(
    schema,
    `UPDATE websites SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}

/**
 * Track a pipeline run in the admin-level website_runs table.
 */
export async function trackWebsiteRun(websiteId: string, runId: string, userId: string) {
  const result = await pool.query(
    `INSERT INTO "JBSTestOpsAI".website_runs (website_id, run_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [websiteId, runId, userId],
  );
  return result.rows[0];
}
