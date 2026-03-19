# Plan 53B: Page Registry + Stage Tracking Data Model

**Priority**: 2
**Depends on**: nothing (schema-only)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Introduce "page" as a first-class entity with per-page stage completion tracking.

## Schema Changes — `src/server/db/schema.sql`

```sql
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

ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS cascade_plan JSONB;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS execution_mode_live TEXT;
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_page ON pipeline_runs(page_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_batch ON pipeline_runs(batch_id) WHERE batch_id IS NOT NULL;

ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS replaced_by UUID REFERENCES artifacts(id) ON DELETE SET NULL;
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS edited_by TEXT;
CREATE INDEX IF NOT EXISTS idx_artifacts_page ON artifacts(page_id);
```

## Query Functions — `src/server/db/queries.ts`

Add: `createPage`, `getPage`, `getPageBySlug`, `listPages` (with LEFT JOIN stage statuses), `listPagesWithStages`, `getPageTree` (recursive CTE), `upsertPageStageStatus`, `getPageStageStatuses`, `checkPageConcurrency`, `updateArtifact` (versioned), `deleteArtifact` (soft delete)

## Types — `src/orchestrator/types.ts`

Add: `Page`, `PageStageStatus`, `PageWithStages` interfaces

## Key Files
- Modify: `src/server/db/schema.sql`, `src/server/db/queries.ts`, `src/orchestrator/types.ts`

## Guidance
- All new columns nullable for backwards compat
- `active_run_id` = concurrency lock
- `replaced_by` on artifacts = version chain
- Test: create tables → insert sample data → verify constraints → verify concurrency check
