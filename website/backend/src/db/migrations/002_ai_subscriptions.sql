-- ============================================================
-- PLAN 41: AI Subscription Management Migration
-- Creates: ai_provider_config, worker_registry, ai_usage_log
-- All statements are idempotent (IF NOT EXISTS)
-- NOTE: Named "ai_*" not "claude_*" — client secrecy extends to DB
-- ============================================================

-- Per-client AI provider configuration (admin schema)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".ai_provider_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL UNIQUE REFERENCES "JBSTestOpsAI".clients(id),

  -- Execution mode: cli | api | cli_with_api_overflow
  execution_mode    VARCHAR(30) DEFAULT 'cli' CHECK (execution_mode IN ('cli', 'api', 'cli_with_api_overflow')),

  -- CLI config
  cli_worker_id     VARCHAR(100),
  cli_account_email VARCHAR(200),
  cli_auth_status   VARCHAR(50) DEFAULT 'not_configured' CHECK (cli_auth_status IN ('not_configured', 'authenticated', 'expired', 'rate_limited', 'offline')),
  cli_config_path   TEXT,

  -- API config
  api_key_enc       TEXT,
  api_key_hint      VARCHAR(20),
  api_status        VARCHAR(50) DEFAULT 'not_configured' CHECK (api_status IN ('not_configured', 'valid', 'invalid', 'expired')),
  api_monthly_budget_usd NUMERIC(10,2),
  api_current_month_usd  NUMERIC(10,2) DEFAULT 0,

  -- General
  preferred_model   VARCHAR(50) DEFAULT 'sonnet',
  max_concurrent_tasks INTEGER DEFAULT 1,
  configured_by     VARCHAR(100),
  last_health_check TIMESTAMPTZ,
  health_error      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Worker registry (tracks all worker processes)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".worker_registry (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       VARCHAR(100) UNIQUE NOT NULL,
  client_id       UUID REFERENCES "JBSTestOpsAI".clients(id),
  worker_type     VARCHAR(30) NOT NULL CHECK (worker_type IN ('cli_dedicated', 'api_shared')),
  status          VARCHAR(50) DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'busy', 'error')),
  last_heartbeat  TIMESTAMPTZ,
  host_info       JSONB,
  config          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (source-agnostic, no "Claude" in naming)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".ai_usage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES "JBSTestOpsAI".clients(id),
  worker_id       VARCHAR(100),
  source          VARCHAR(50) NOT NULL,
  source_id       VARCHAR(100),
  execution_mode  VARCHAR(30),
  model           VARCHAR(50),
  input_tokens    INTEGER DEFAULT 0,
  output_tokens   INTEGER DEFAULT 0,
  cost_usd        NUMERIC(10,6) DEFAULT 0,
  rate_limited    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_provider_client ON "JBSTestOpsAI".ai_provider_config(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_client ON "JBSTestOpsAI".ai_usage_log(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON "JBSTestOpsAI".ai_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_worker_registry_client ON "JBSTestOpsAI".worker_registry(client_id);
CREATE INDEX IF NOT EXISTS idx_worker_registry_status ON "JBSTestOpsAI".worker_registry(status);
