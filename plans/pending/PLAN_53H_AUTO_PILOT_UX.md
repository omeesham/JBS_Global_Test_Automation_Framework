# Plan 53H: Auto Pilot UX Overhaul

**Priority**: 8
**Depends on**: 53A (modal pattern), 53D (page APIs), 53G (multi-run context)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Auto mode is silent. Fire-and-forget. Dashboard is audit trail. Triage has admin-configurable defaults.

## PipelineLaunchCard Changes

PipelineLaunchCard is rendered inside the modal overlay (defined by 53A). This plan modifies the CONTENT of the card based on mode, not where it renders.

**When `mode === 'auto'`:**
- **Hide stage selector pills** — auto figures out what's needed via dependency engine
- Show: page selector dropdown (from `listPages(clientId)`) + intent textarea + Start button
- Page dropdown items: `Location Legal [■■□□□]` (5 colored squares = stage statuses)
- "All Pages" option at top → triggers batch run via `POST /api/pipeline/batch-run`
- After start: `onStarted()` fires → modal closes (53A handles this) → status line appears in chat

**When `mode === 'manual'`:** (defined by 53I, not this plan)

The page selector dropdown is a shared component used by BOTH modes. Build it here, 53I reuses it.

## ChatPage Conditional Rendering (Auto Mode)

Uses existing `pipelineMode` from ActivePipelineContext (backwards-compat API from 53G):

```tsx
// Auto mode: show status line instead of hero/approval cards
{pipelineMode === 'auto' && isActive && (
  <AutoPilotStatusLine pageName={...} stage={...} status={...} />
)}

// Only show approval/triage in manual mode
{pipelineMode === 'manual' && pendingAction === 'approval_required' && (
  <ChatApprovalCard />
)}
```

`AutoPilotStatusLine` is a simple `<div>` with 3 states: running/complete/failed + link to dashboard.

## Auto-Triage Resolution

Add `autoTriageDefaults` to pipeline definition JSON (stored in `pipeline_definitions` table, already per-client):

```json
{ "autoTriageDefaults": { "BUG": "report_bug", "TEST_DEFECT": "heal_feature_change", "FEATURE_CHANGE": "heal_feature_change", "UNCERTAIN": "dismiss" } }
```

In `orchestrator.ts` → `processStageCompletion()`: before broadcasting `triage_required`, check run's `execution_mode_live`. If `'auto'` or `'full-auto'`:
1. Load `autoTriageDefaults` from the run's pipeline definition
2. Apply default disposition to each triage item based on category
3. Call internal `resumeTriagePipeline()` with auto-generated decisions
4. Skip SSE `triage_required` broadcast — pipeline continues silently
5. Log: "Auto-triage applied: 2 healed, 1 reported"

Admin configures defaults in existing `PipelineBuilderTab.tsx` — add a "Triage Defaults" section to the stage config panel.

## Key Files
- Modify: `PipelineLaunchCard.tsx` (auto mode content, page selector)
- Modify: `ChatPage.tsx` (auto mode rendering — status line, hide cards)
- Modify: `orchestrator.ts` (auto-triage logic)
- Modify: `pipeline-definition.json` / `pipeline_definitions` table (add autoTriageDefaults)
- Modify: `PipelineBuilderTab.tsx` (triage defaults config section)

## Guidance
- `pipelineMode` comes from ActivePipelineContext (unchanged API per 53G)
- `execution_mode_live` on the run row is the source of truth for backend decisions
- Page selector component: `<PageSelectorDropdown>` — extract as shared component since 53I also uses it
- AutoPilotStatusLine: ~30 lines, no new file needed — inline in ChatPage or extract to `components/chat/`
