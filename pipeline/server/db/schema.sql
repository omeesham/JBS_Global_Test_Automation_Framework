-- Encore Pipeline MVP Schema
-- Compatible with PostgreSQL 14+ and Neon
-- Phase 0: single-tenant, no RLS (added in Phase 1)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- pipeline_runs: one row per automation request
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100),
  feature TEXT NOT NULL,
  module TEXT NOT NULL,
  intent TEXT NOT NULL,
  target_url TEXT,
  stage TEXT NOT NULL DEFAULT 'queued',
  status TEXT NOT NULL DEFAULT 'queued',
  priority TEXT NOT NULL DEFAULT 'medium',
  cost NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- stage_results: one row per stage execution (including retries)
CREATE TABLE IF NOT EXISTS stage_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt INT DEFAULT 1,
  max_attempts INT DEFAULT 1,
  agent_model TEXT,
  cost NUMERIC(10,4) DEFAULT 0,
  result_data JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- artifacts: downloadable outputs (specs, reports, etc.)
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  page_id UUID,
  version INT DEFAULT 1,
  replaced_by UUID,
  edited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- worker_tasks: task queue polled by local worker
CREATE TABLE IF NOT EXISTS worker_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  client_id VARCHAR(100),
  stage_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  agent_prompt TEXT NOT NULL,
  context JSONB,
  result JSONB,
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_worker_tasks_status ON worker_tasks(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_stage_results_run ON stage_results(run_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_run ON artifacts(run_id);

-- Auto-update updated_at on pipeline_runs
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pipeline_runs_updated ON pipeline_runs;
CREATE TRIGGER trg_pipeline_runs_updated
  BEFORE UPDATE ON pipeline_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Agent Registry (Plan 50) ──

CREATE TABLE IF NOT EXISTS agent_types (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(100) DEFAULT 'Bot',
  category VARCHAR(50) DEFAULT 'core',
  default_model VARCHAR(50) DEFAULT 'sonnet',
  agent_file TEXT,
  capabilities TEXT[],
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Per-Client Pipeline Definitions (Plan 50) ──

CREATE TABLE IF NOT EXISTS pipeline_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100),
  definition JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_pipeline_def_client UNIQUE NULLS NOT DISTINCT (client_id)
);

-- Fast lookup by client
CREATE INDEX IF NOT EXISTS idx_pipeline_def_client
  ON pipeline_definitions (client_id) WHERE client_id IS NOT NULL;

-- Auto-update updated_at on pipeline_definitions
DROP TRIGGER IF EXISTS trg_pipeline_defs_updated ON pipeline_definitions;
CREATE TRIGGER trg_pipeline_defs_updated
  BEFORE UPDATE ON pipeline_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Page Registry (Plan 53B) ──

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100),
  module TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  target_url TEXT,
  parent_page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  depth INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_page_client_module_slug UNIQUE (client_id, module, page_slug)
);
CREATE INDEX IF NOT EXISTS idx_pages_client ON pages(client_id);
CREATE INDEX IF NOT EXISTS idx_pages_module ON pages(client_id, module);
CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages(parent_page_id);

DROP TRIGGER IF EXISTS trg_pages_updated ON pages;
CREATE TRIGGER trg_pages_updated
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Per-Page Stage Tracking (Plan 53B) ──

CREATE TABLE IF NOT EXISTS page_stage_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  active_run_id UUID REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  last_run_id UUID REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  last_completed_at TIMESTAMPTZ,
  artifact_summary JSONB,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  explore_without_reqs BOOLEAN DEFAULT false,
  explore_permitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_page_stage UNIQUE (page_id, stage_id)
);
CREATE INDEX IF NOT EXISTS idx_page_stage_page ON page_stage_status(page_id);

DROP TRIGGER IF EXISTS trg_page_stage_updated ON page_stage_status;
CREATE TRIGGER trg_page_stage_updated
  BEFORE UPDATE ON page_stage_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Extend pipeline_runs for page tracking (Plan 53B) ──

ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS cascade_plan JSONB;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS execution_mode_live TEXT;
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_page ON pipeline_runs(page_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_batch ON pipeline_runs(batch_id) WHERE batch_id IS NOT NULL;

-- ── Extend artifacts for page + versioning (Plan 53B) ──

ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS replaced_by UUID REFERENCES artifacts(id) ON DELETE SET NULL;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS edited_by TEXT;
CREATE INDEX IF NOT EXISTS idx_artifacts_page ON artifacts(page_id);

-- ── Client Setup / Onboarding (Plan 53E) ──

CREATE TABLE IF NOT EXISTS client_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100) NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  home_url TEXT,
  auth_config JSONB,
  setup_config JSONB,
  setup_run_id UUID REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  initiated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_client_setup_updated ON client_setup;
CREATE TRIGGER trg_client_setup_updated
  BEFORE UPDATE ON client_setup
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
