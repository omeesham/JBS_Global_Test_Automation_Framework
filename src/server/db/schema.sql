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
