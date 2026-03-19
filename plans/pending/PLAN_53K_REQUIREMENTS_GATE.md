# Plan 53K: Requirements Permission Gate

**Priority**: 11
**Depends on**: 53A + 53C + 53D (modal pattern, dependency engine, page APIs)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Accountability for exploration without requirements. Auto mode doesn't block unnecessarily.

## New Component: `RequirementsGateCard.tsx`

Shown when pipeline start returns `{ needsRequirements: true }`:

**If `noUrl` (page has no URL)**:
- "Provide the page URL to start discovery."
- URL input + [Save & Start]

**If has URL but no requirements**:
- **Option 1: "Write Requirements"** → textarea → saves as artifact → starts pipeline
- **Option 2: "Let AI Explore Freely"** → logs `{ permittedBy: currentUser }` → starts pipeline

## Auto Mode Behavior

- Page HAS `target_url` → auto mode does NOT block. Auto-cascades to requirements.
  `explore_permitted_by = "{username} (auto-mode)"` for accountability.
- Page has NO `target_url` → auto mode blocks (need URL input)
- Manual mode → always shows gate card

## Field Clarification

Schema (53B) has TWO fields on `page_stage_status`:
- `explore_without_reqs BOOLEAN` — flag: was this stage run without formal requirements?
- `explore_permitted_by TEXT` — accountability: who approved it? Format: `"John - QA Engineer"` or `"John - QA Engineer (auto-mode)"`

Both fields are set TOGETHER. `explore_without_reqs = true` is always accompanied by `explore_permitted_by` being non-null. The boolean is for fast queries (show amber dots in grid), the text is for audit trail.

## Dashboard Integration

- `PageDetailPanel`: if `explore_without_reqs`, amber note: "Exploring without formal requirements — permitted by {explore_permitted_by}"
- `PageStatusGrid`: amber dot for requirements cell when `explore_without_reqs`

## Key Files
- Create: `RequirementsGateCard.tsx`
- Modify: `PipelineLaunchCard.tsx` (handle needsRequirements response from API), `pipeline.ts` (auto-mode logic)

## Guidance
- Gate card has two distinct UIs: no-URL vs no-requirements
- "Write Requirements" saves as artifact type `user_requirements`
- Accountability is the core feature — ALWAYS log who permitted
- `currentUser` comes from `useAuth()` context → `user.username` + `user.role`
- Permission check: any authenticated user can permit explore (accountability is the control, not restriction)
