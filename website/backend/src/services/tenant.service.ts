import pool from '../db.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Tenant schema template SQL (parameterized — {schema} gets replaced)
const TENANT_TEMPLATE = `
CREATE TABLE IF NOT EXISTS "{schema}".users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        VARCHAR(100) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(200),
  email           VARCHAR(200),
  role            VARCHAR(50) DEFAULT 'qa_engineer',
  preferred_model VARCHAR(20) DEFAULT 'sonnet',
  thinking_enabled BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "{schema}".websites (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(200) NOT NULL,
  slug             VARCHAR(100) UNIQUE NOT NULL,
  base_url         TEXT NOT NULL,
  target_url       TEXT,
  auth_type        VARCHAR(50),
  auth_config      JSONB DEFAULT '{}',
  app_framework    VARCHAR(50),
  description      TEXT,
  config           JSONB DEFAULT '{}',
  enabled_services JSONB DEFAULT '["web"]',
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "{schema}".chat_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES "{schema}".users(id),
  title      VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "{schema}".chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES "{schema}".chat_conversations(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "{schema}".test_cases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id   UUID REFERENCES "{schema}".websites(id),
  run_id       UUID,
  tc_number    VARCHAR(20),
  title        VARCHAR(1000) NOT NULL,
  steps        JSONB DEFAULT '[]',
  expected     TEXT,
  priority     VARCHAR(10),
  type         VARCHAR(50),
  feature      VARCHAR(200),
  precondition TEXT,
  status       VARCHAR(50) DEFAULT 'generated',
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "{schema}".jira_connections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES "{schema}".users(id),
  jira_url     VARCHAR(500) NOT NULL,
  auth_header  TEXT NOT NULL,
  display_name VARCHAR(200),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS "{schema}".bug_reports (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id       VARCHAR(50) NOT NULL,
  test_file          TEXT,
  module             VARCHAR(200),
  feature            VARCHAR(200),
  severity           VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  title              TEXT NOT NULL,
  description        TEXT,
  steps_to_reproduce JSONB DEFAULT '[]',
  expected_behavior  TEXT,
  actual_behavior    TEXT,
  page_url           TEXT,
  screenshot_path    TEXT,
  failure_category   VARCHAR(50),
  bug_hunt_category  VARCHAR(50),
  source_agent       VARCHAR(50),
  error_hash         VARCHAR(64),
  triage_result      JSONB,
  rca_evidence       JSONB DEFAULT '{}',
  status             VARCHAR(20) DEFAULT 'open',
  confidence         VARCHAR(20) DEFAULT 'HIGH',
  run_id             UUID,
  queue_item_id      VARCHAR(200),
  website_id         UUID,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "{schema}".test_id_registry (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  selector_key      VARCHAR(200) NOT NULL,
  test_id_value     VARCHAR(500),
  page_url          TEXT,
  status            VARCHAR(20) DEFAULT 'present',
  first_seen_run    UUID,
  last_verified_run UUID,
  last_verified_at  TIMESTAMPTZ DEFAULT NOW(),
  change_history    JSONB DEFAULT '[]',
  website_id        UUID,
  UNIQUE(selector_key, COALESCE(website_id, '00000000-0000-0000-0000-000000000000'))
);

CREATE TABLE IF NOT EXISTS "{schema}".failure_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name         VARCHAR(500) NOT NULL,
  test_file         TEXT,
  error_hash        VARCHAR(64),
  failure_category  VARCHAR(50),
  bug_hunt_category VARCHAR(50),
  run_id            UUID,
  website_id        UUID,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_{schema_safe}_users_username ON "{schema}".users(username);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_websites_slug ON "{schema}".websites(slug);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_chat_conv_user ON "{schema}".chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_chat_msg_conv ON "{schema}".chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_test_cases_website ON "{schema}".test_cases(website_id);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_bug_reports_status ON "{schema}".bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_bug_reports_website ON "{schema}".bug_reports(website_id);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_test_id_registry_website ON "{schema}".test_id_registry(website_id);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_failure_history_test ON "{schema}".failure_history(test_name);
CREATE INDEX IF NOT EXISTS idx_{schema_safe}_failure_history_hash ON "{schema}".failure_history(error_hash);
`;

/**
 * Provision a new tenant schema with all required tables.
 * Idempotent — safe to call multiple times for the same client.
 */
export async function provisionTenantSchema(clientSlug: string): Promise<string> {
  const schema = `tenant_${clientSlug.replace(/-/g, '_')}`;
  const schemaSafe = schema.replace(/"/g, '');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaSafe}"`);

    // Apply tenant template with schema substitution
    const sql = TENANT_TEMPLATE
      .replace(/\{schema\}/g, schemaSafe)
      .replace(/\{schema_safe\}/g, schemaSafe);

    await client.query(sql);
    await client.query('COMMIT');

    console.log(`[Tenant] Schema "${schemaSafe}" provisioned successfully`);
    return schemaSafe;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[Tenant] Failed to provision schema "${schemaSafe}":`, err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Run the foundation migration (001_schema_foundation.sql).
 * Creates admin schema + Encore Global tenant.
 */
export async function runFoundationMigration(): Promise<void> {
  try {
    // Resolve migration file path relative to this file
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const migrationPath = join(currentDir, '..', 'db', 'migrations', '001_schema_foundation.sql');
    const sql = await readFile(migrationPath, 'utf-8');

    await pool.query(sql);
    console.log('[Tenant] Foundation migration completed');
  } catch (err) {
    console.error('[Tenant] Foundation migration failed:', err);
    throw err;
  }
}

/**
 * Seed users with bcrypt password hashes.
 * Called after migration since raw SQL can't use bcrypt.
 */
export async function seedUsers(hashFn: (password: string) => Promise<string>): Promise<void> {
  const client = await pool.connect();
  try {
    // Seed super admin in platform_users
    const superAdminHash = await hashFn('SuperAdmin@2026');
    await client.query(`
      INSERT INTO "JBSTestOpsAI".platform_users (username, password_hash, full_name, role)
      VALUES ('superadmin', $1, 'JBS Super Admin', 'super_admin')
      ON CONFLICT (username) DO NOTHING
    `, [superAdminHash]);

    // Seed Encore tenant users
    const users = [
      { username: 'encoreadmin', password: 'EncoreAdmin@2026', fullName: 'Encore Admin', role: 'client_admin' },
      { username: 'encoreqa', password: 'EncoreQA@2026', fullName: 'QA Engineer', role: 'qa_engineer' },
      { username: 'encoredata', password: 'EncoreData@2026', fullName: 'Data Engineer', role: 'data_engineer' },
    ];

    for (const u of users) {
      const hash = await hashFn(u.password);
      await client.query(`
        INSERT INTO "tenant_encore_global".users (username, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
      `, [u.username, hash, u.fullName, u.role]);
    }

    console.log('[Tenant] Seed users created');
  } catch (err) {
    console.error('[Tenant] Seed users failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Run the AI subscription migration (002_ai_subscriptions.sql).
 * Creates ai_provider_config, worker_registry, ai_usage_log tables.
 */
export async function runAiSubscriptionMigration(): Promise<void> {
  try {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const migrationPath = join(currentDir, '..', 'db', 'migrations', '002_ai_subscriptions.sql');
    const sql = await readFile(migrationPath, 'utf-8');

    await pool.query(sql);
    console.log('[Tenant] AI subscription migration completed');
  } catch (err) {
    console.error('[Tenant] AI subscription migration failed:', err);
    throw err;
  }
}

/**
 * Get a client's schema name by slug.
 */
export async function getClientSchema(clientSlug: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT db_schema FROM "JBSTestOpsAI".clients WHERE slug = $1',
    [clientSlug]
  );
  return result.rows[0]?.db_schema ?? null;
}

/**
 * Get platform setting value by key.
 */
export async function getPlatformSetting(key: string): Promise<unknown> {
  const result = await pool.query(
    'SELECT value FROM "JBSTestOpsAI".platform_settings WHERE key = $1',
    [key]
  );
  return result.rows[0]?.value ?? null;
}
