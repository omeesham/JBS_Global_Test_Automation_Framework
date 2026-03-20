# Plan 53A: Kill Chat-Blocking View States (Critical UX Fix)

**Priority**: 1 (execute first)
**Depends on**: nothing
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Eliminate all `view` state switches in ChatPage that replace the chat conversation with cards/forms. Chat must NEVER be blocked.

## The Bug

`ChatPage.tsx` uses `view` state to swap the content area between different forms. User loses the conversation and has no way back without completing the form.

## The Fix

1. **Replace `view` state with `activeModal: string | null`**
2. **Modals render as fixed overlays** — chat stays visible behind a backdrop
3. **Every modal gets a close (X) button** + click-outside-to-close + Escape to close
4. **No generic ChatModal abstraction** — just add close/backdrop inline to each existing component (PipelineLaunchCard, JiraImportFlow, ColumnSelector). They're all different UIs, a generic wrapper is premature.

## Changes to `ChatPage.tsx`

This is the **ONLY plan that restructures ChatPage state**. All other plans (53H, 53I, 53G) add components or modify rendering logic, but DO NOT touch the state shape defined here.

```tsx
// REMOVE:
const [view, setView] = useState<View>('chat');

// ADD:
const [activeModal, setActiveModal] = useState<string | null>(null);
// Values: null | 'launch' | 'jira' | 'column-select'
```

**Conversion map for all setView calls:**
- `setView('launch')` → `setActiveModal('launch')`
- `setView('jira')` → `setActiveModal('jira')`
- `setView('column-select')` → `setActiveModal('column-select')`
- `setView('chat')` → `setActiveModal(null)`
- `setView('pipeline')` → DELETE (pipeline progress already in hero section)
- `setView('results')` → DELETE (results appear as chat messages)

**Modal rendering pattern (add to bottom of ChatPage, OUTSIDE the scroll area):**
```tsx
{activeModal === 'launch' && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
       onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
    <PipelineLaunchCard onStarted={(id) => { handlePipelineStarted(id); setActiveModal(null); }}
                        onClose={() => setActiveModal(null)} />
  </div>
)}
// Same pattern for 'jira' and 'column-select'
```

## Changes to Existing Components

**PipelineLaunchCard.tsx**: Add `onClose` prop. Add close (X) button in top-right. Add Escape key handler.

**ChatApprovalCard.tsx**: Add "Minimize" button → collapses to amber pill at top: "Stage awaiting approval — [Review]". State: `const [minimized, setMinimized] = useState(false)`.

**ChatTriageCard.tsx**: Add "Decide Later" button → collapses to amber pill: "Triage pending — [Review]". Run stays `awaiting_triage`.

## State Ownership (for all future plans)

| State | Owner | Used By |
|-------|-------|---------|
| `activeModal` | ChatPage local state | Modal rendering |
| `pipelineMode` | ActivePipelineContext | 53H/53I for conditional rendering |
| `focusedRunId` | ActivePipelineContext (after 53G) | 53H/53I for which run's cards show |
| `minimizedCards` | ChatPage local state | Approval/Triage minimize |

## Key Files
- Modify: `ChatPage.tsx`, `PipelineLaunchCard.tsx`, `ChatApprovalCard.tsx`, `ChatTriageCard.tsx`
- NO new files needed (no generic ChatModal)

## Verification
- Click "Run Pipeline" → modal over chat → X closes it → chat works → Escape closes it
- Approval card → minimize → pill shows → click pill → card re-expands
- Triage → "Decide Later" → pill → click → card re-expands
