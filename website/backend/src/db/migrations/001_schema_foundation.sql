-- ============================================================
-- PLAN 32: Schema Foundation Migration
-- Creates: JBSTestOpsAI admin tables + tenant template
-- All statements are idempotent (IF NOT EXISTS)
-- ============================================================

-- ===================
-- 1. ADMIN SCHEMA
-- ===================
CREATE SCHEMA IF NOT EXISTS "JBSTestOpsAI";

-- Clients (organizations)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".clients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(200) NOT NULL,
  slug       VARCHAR(100) UNIQUE NOT NULL,
  db_schema  VARCHAR(100) UNIQUE NOT NULL,
  logo_url   TEXT,
  contact_email VARCHAR(200),
  plan       VARCHAR(50) DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform-level users (super admins only)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".platform_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(200),
  email         VARCHAR(200),
  role          VARCHAR(50) DEFAULT 'super_admin',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Platform-wide settings (key-value JSONB)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".platform_settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom solution requests (from onboarding)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".custom_solution_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES "JBSTestOpsAI".clients(id),
  website_id   UUID NOT NULL,
  requirements TEXT NOT NULL,
  status       VARCHAR(50) DEFAULT 'pending_review',
  reviewed_by  UUID REFERENCES "JBSTestOpsAI".platform_users(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Website-run association (cross-tenant visibility for super admin)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".website_runs (
  website_id UUID NOT NULL,
  run_id     UUID NOT NULL,
  client_id  UUID NOT NULL REFERENCES "JBSTestOpsAI".clients(id),
  created_by UUID,
  cost       NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (website_id, run_id)
);

-- Admin indexes
CREATE INDEX IF NOT EXISTS idx_clients_slug ON "JBSTestOpsAI".clients(slug);
CREATE INDEX IF NOT EXISTS idx_website_runs_client ON "JBSTestOpsAI".website_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_website_runs_website ON "JBSTestOpsAI".website_runs(website_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON "JBSTestOpsAI".custom_solution_requests(status);

-- ===================
-- 2. SEED: Encore Global as first client
-- ===================
INSERT INTO "JBSTestOpsAI".clients (name, slug, db_schema, plan)
  VALUES ('Encore Global', 'encore-global', 'tenant_encore_global', 'enterprise')
  ON CONFLICT (slug) DO NOTHING;

-- ===================
-- 3. SEED: Platform settings
-- ===================
INSERT INTO "JBSTestOpsAI".platform_settings (key, value) VALUES
  ('product_name', '"IntelliQE"'),
  ('cost_visibility', '{"default": "admin_only", "configurable_per_client": true}'),
  ('default_model', '"sonnet"')
ON CONFLICT (key) DO NOTHING;

-- ===================
-- 4. TENANT SCHEMA: Encore Global
-- ===================
CREATE SCHEMA IF NOT EXISTS "tenant_encore_global";

-- Per-tenant users
CREATE TABLE IF NOT EXISTS "tenant_encore_global".users (
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

-- Per-tenant websites (apps to test)
CREATE TABLE IF NOT EXISTS "tenant_encore_global".websites (
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

-- Per-tenant chat conversations
CREATE TABLE IF NOT EXISTS "tenant_encore_global".chat_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES "tenant_encore_global".users(id),
  title      VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-tenant chat messages
CREATE TABLE IF NOT EXISTS "tenant_encore_global".chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES "tenant_encore_global".chat_conversations(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Per-tenant test cases
CREATE TABLE IF NOT EXISTS "tenant_encore_global".test_cases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id   UUID REFERENCES "tenant_encore_global".websites(id),
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

-- Per-tenant JIRA connections
CREATE TABLE IF NOT EXISTS "tenant_encore_global".jira_connections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES "tenant_encore_global".users(id),
  jira_url     VARCHAR(500) NOT NULL,
  auth_header  TEXT NOT NULL,
  display_name VARCHAR(200),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tenant indexes
CREATE INDEX IF NOT EXISTS idx_tenant_eg_users_username ON "tenant_encore_global".users(username);
CREATE INDEX IF NOT EXISTS idx_tenant_eg_websites_slug ON "tenant_encore_global".websites(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_eg_chat_conv_user ON "tenant_encore_global".chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_eg_chat_msg_conv ON "tenant_encore_global".chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tenant_eg_test_cases_website ON "tenant_encore_global".test_cases(website_id);

-- ===================
-- 5. SEED: Navigator E2E website for Encore
-- ===================
INSERT INTO "tenant_encore_global".websites (name, slug, base_url, target_url, auth_type, app_framework, description, config, enabled_services)
VALUES (
  'Navigator E2E', 'navigator-e2e',
  'https://cloudapps-e2e.encoreglobal.com/navigator/',
  'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/home',
  'microsoft_sso', 'radix',
  'Cloud-based hotel & resort management platform',
  '{"defaultOffice": "1604", "officeName": "The Parker Palm Springs", "modules": ["locations", "currency", "pricing", "local-info"]}',
  '["web"]'
) ON CONFLICT (slug) DO NOTHING;

-- NOTE: User password hashes and platform_users seeding done at runtime
-- by tenant.service.ts (requires bcrypt which is unavailable in raw SQL).
