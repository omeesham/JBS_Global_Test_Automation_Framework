# Plan 53I: Manual Review UX Overhaul

**Priority**: 9
**Depends on**: 53A (modal pattern), 53D (page APIs), 53G (multi-run context), 53H (page selector component)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Users see what agents produced, approve/edit/re-prompt, work across pages, cascade stages shown.

## New Component: `ArtifactPreviewCard.tsx`

Location: `website/frontend/src/components/chat/ArtifactPreviewCard.tsx`

Inline card in chat after each stage completes (manual mode only):
- Fetches artifacts from `GET /api/pipeline/:runId` for completed stage
- Renders per stage type:
  - **Requirements**: markdown preview (page structure, elements)
  - **Planner**: test case table (name, priority, collapsed steps)
  - **Generator**: file list with expandable `<pre>` code blocks (monospace, no highlight.js — keep deps minimal)
  - **Healer**: summary of fixes
  - **Audit**: pass/fail score card
- Three action buttons:
  - **Approve & Continue** → `POST /pipeline/:id/approve`
  - **Edit** → textarea pre-filled with content → `PUT /api/artifacts/:id` (creates version) → then approve
  - **Re-prompt** → textarea for instructions → `POST /pipeline/:id/reject` with reason

## PipelineLaunchCard Changes (Manual Mode)

Uses the `<PageSelectorDropdown>` built by 53H. Adds mode-specific content:

**When `mode === 'manual'`:**
- Show page selector (reuse from 53H)
- Show stage selector pills WITH dependency coloring:
  - Fetch `GET /api/pages/:id/stages` when page selected
  - Completed: green border + checkmark
  - Available next: violet border + pulse
  - Locked (prereqs missing): gray + lock icon, title tooltip "Complete {stage} first"
  - Failed: red border + retry icon
- Intent textarea + Start button

## Cascade Visibility

When dependency engine returns `{ cascade: true, cascadePlan: ['planning', 'generation'] }` in manual mode:
- Chat shows message: "To run Generator, Planner needs to run first. Starting with Planner..."
- Each cascaded stage gets full manual review: stage runs → ArtifactPreviewCard shown → user approves → next stage runs
- This uses existing `approval_required` SSE event flow — each stage in cascade fires approval gate

## Multi-Page Context Bar

Below the model selector bar in ChatPage:
```tsx
// Only shown when user has active page-scoped runs
<div className="px-4 py-1.5 border-b border-violet-100 flex items-center gap-2 text-xs">
  <span className="text-gray-500">Current:</span>
  <span className="font-medium">Location Legal</span>
  <span>[✓ ✓ → ○ ○]</span>
  <select onChange={switchPage}>...</select>
</div>
```
- Shows focused run's page + stage progress
- Dropdown to switch focused page (calls `focusRun()` from 53G context)

## ChatPage Rendering (Manual Mode)

Uses existing `pipelineMode` + `pendingAction` from ActivePipelineContext:

```tsx
{pipelineMode === 'manual' && pendingAction === 'approval_required' && (
  <ArtifactPreviewCard runId={runId} /> // replaces bare ChatApprovalCard
)}
```

## Key Files
- Create: `ArtifactPreviewCard.tsx`
- Modify: `PipelineLaunchCard.tsx` (manual mode pills + dependency fetch)
- Modify: `ChatPage.tsx` (context bar, ArtifactPreviewCard rendering)
- Modify: `ChatApprovalCard.tsx` (embed ArtifactPreviewCard or replace)

## Guidance
- ArtifactPreviewCard fetches lazily on mount — don't eagerly load
- Code display: plain `<pre className="font-mono text-xs bg-gray-50 p-3 rounded overflow-x-auto">` — no external deps
- Edit flow: textarea → PUT artifact → version incremented server-side → then approve
- Context bar: ~15 lines inline in ChatPage, no separate component file needed
