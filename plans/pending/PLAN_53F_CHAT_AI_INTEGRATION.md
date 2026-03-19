# Plan 53F: Chat AI Integration — Page & Stage Awareness

**Priority**: 6
**Depends on**: 53D (needs page APIs)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Chat understands page names, URLs, and stage references in natural language.

## Backend — ACTION_CATALOG Updates

Add to chatbot service (explore `website/backend/src/services/` to find it):

```
run_stage_for_page: { pageName, stageId, mode }
  examples: "run planner for location legal", "test the login page"

check_page_status: { pageName }
  examples: "what's done for location legal?", "which pages need planner?"

approve_stage: { pageHint }
  examples: "approve", "looks good", "continue"

setup_project: {}
  examples: "set up my project", "onboard"
```

## Page Fuzzy Matching — `src/server/db/queries.ts`

```sql
SELECT * FROM pages WHERE client_id = $1
  AND (display_name ILIKE $2 OR page_slug ILIKE $2 OR target_url ILIKE $2)
```
- 1 match → proceed
- 0 matches → "Couldn't find that page. Here are yours: [list]"
- Multiple → "Did you mean: [options]?"

## URL-Based Lookup

User pastes URL → match against `pages.target_url` → if not found, offer to register.

## ChatPage Integration

When `action: 'run_stage_for_page'`: resolve page → call `createPipelineRun({ pageId, startStage })` → handle deps

## Key Files
- Modify: chatbot service (find ACTION_CATALOG), `ChatPage.tsx`, `queries.ts`

## Guidance
- Use ILIKE with wildcards for fuzzy matching (simple, sufficient for < 1000 pages)
- Chat should feel natural: "run planner for legal" → resolves → creates run → shows status
