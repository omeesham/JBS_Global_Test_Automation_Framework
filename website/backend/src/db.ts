import pg from 'pg';
import { runFoundationMigration, runAiSubscriptionMigration, seedUsers } from './services/tenant.service.js';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'admin';
const DB_NAME = process.env.DB_NAME || 'postgres';

const pool = new pg.Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  statement_timeout: 30000, // 30s max per query — prevents runaway queries
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Initialize database: run foundation migration + legacy tables + seed users.
 * All statements are idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING).
 */
export async function initDb(): Promise<void> {
  try {
    // 1. Run PLAN_32 foundation migration (admin schema + tenant schemas)
    await runFoundationMigration();

    // 1b. Run PLAN_41 AI subscription migration (ai_provider_config, worker_registry, ai_usage_log)
    await runAiSubscriptionMigration();

    // 2. Legacy tables (conversations, messages, etc.) in JBSTestOpsAI schema
    //    These existed before the multi-tenant migration. Keep for backward compat.
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "JBSTestOpsAI"`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".conversations (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username      VARCHAR(100) NOT NULL,
        title         VARCHAR(500),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".messages (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id   UUID NOT NULL REFERENCES "JBSTestOpsAI".conversations(id) ON DELETE CASCADE,
        role              VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content           TEXT NOT NULL,
        metadata          JSONB,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".jira_connections (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username      VARCHAR(100) NOT NULL UNIQUE,
        jira_url      VARCHAR(500) NOT NULL,
        auth_header   TEXT NOT NULL,
        display_name  VARCHAR(200),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".test_runs (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username      VARCHAR(100) NOT NULL,
        story_key     VARCHAR(50),
        story_title   VARCHAR(500),
        source        VARCHAR(50),
        columns       JSONB NOT NULL DEFAULT '[]',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".test_cases (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_run_id   UUID NOT NULL REFERENCES "JBSTestOpsAI".test_runs(id) ON DELETE CASCADE,
        tc_number     VARCHAR(20) NOT NULL,
        title         VARCHAR(1000) NOT NULL,
        steps         JSONB NOT NULL DEFAULT '[]',
        expected      TEXT,
        priority      VARCHAR(10),
        type          VARCHAR(50),
        feature       VARCHAR(200),
        precondition  TEXT,
        status        VARCHAR(50) DEFAULT 'generated',
        sort_order    INTEGER NOT NULL DEFAULT 0,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Legacy indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_username ON "JBSTestOpsAI".conversations(username)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON "JBSTestOpsAI".conversations(created_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON "JBSTestOpsAI".messages(conversation_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON "JBSTestOpsAI".messages(created_at)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jira_connections_username ON "JBSTestOpsAI".jira_connections(username)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_test_runs_username ON "JBSTestOpsAI".test_runs(username)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_test_cases_run_id ON "JBSTestOpsAI".test_cases(test_run_id)`);

    // 3. Seed users (bcrypt hashing — only runs if bcrypt is available)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const bcrypt = await (import('bcrypt' as string) as Promise<any>);
      const hashFn = (password: string): Promise<string> => bcrypt.hash(password, 10);
      await seedUsers(hashFn);
    } catch {
      console.warn('[DB] bcrypt not installed — skipping user seeding. Run: npm install bcrypt');
    }

    console.log('Database initialized successfully (foundation + legacy + seeds)');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
}

/** Execute a query with the default search_path (JBSTestOpsAI). */
export async function queryWithSchema(schema: string, text: string, params?: unknown[]): Promise<pg.QueryResult> {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO "${schema}"`);
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export default pool;
