# PLAN 49I: Mid-Pipeline Artifact Approval

## Context
After key stages (Planner, Generator), pipeline can pause to show artifacts for user review/edit before proceeding. Users see test cases, approve or edit them, then resume. This gives users control without requiring technical knowledge.

## What to Build
1. **Config**: Add `approvalMode: 'auto' | 'manual'` per stage in pipeline-definition.json
2. **Orchestrator**: After stage completion, if next stage has `approvalMode: 'manual'`, pause with `awaiting_approval`
3. **Endpoints**: `POST /api/pipeline/:id/approve` and `POST /api/pipeline/:id/reject`
4. **ArtifactApprovalPanel.tsx**: Shows artifact content, allows review/edit/approve/reject
   - Test cases rendered as readable cards (not raw markdown)
   - Specs rendered as code blocks
   - "Approve & Continue" button
   - "Edit" button → inline editor
   - "Reject & Re-run" button → re-runs the stage

## Files to Modify
- `config/pipeline-definition.json` — add approvalMode per stage (default: 'auto')
- `src/orchestrator/orchestrator.ts` — approval pause logic in processStageCompletion()
- `src/orchestrator/types.ts` — add `awaiting_approval` status
- `src/server/routes/pipeline.ts` — approve/reject endpoints
- `website/frontend/src/components/dashboard/ArtifactApprovalPanel.tsx` — new component
- `website/frontend/src/pages/DashboardPage.tsx` — integrate approval panel

## Agent Research Directives
- Research inline code editors for React (Monaco Editor vs CodeMirror — which fits Vite/Tailwind?)
- Read test case file format (specs_planning/test-cases/) — markdown with tables, how to render as cards?
- Read spec file format (tests/specs/) — TypeScript, how to show with syntax highlighting?
- Check if edited artifacts need filesystem save (worker writes to disk — how does edited content get back?)
- Research approval workflow UX in CI/CD (GitHub Actions manual approval, GitLab manual gates)
- Check how artifact content is delivered via API (inline in response or file download?)
- Study how pipeline-definition.json is loaded (cached? hot-reload?)

## Edge Cases to Audit
- User edits test case → how does edited content reach filesystem for generator to use?
- Reject & re-run → does stage get fresh context or remember rejection reason?
- Approval timeout (user walks away) → auto-approve after configurable hours? Or just stay paused?
- Multiple stages waiting for approval → queue them, show one at a time
- Large artifacts (long spec file) → paginate or scroll with line numbers
- Edit conflicts (user edits while agent is still writing) → shouldn't happen since pipeline is paused
- Non-super-admin users → can they approve? Configurable per role?

## Effort
~400 lines across 6 files
