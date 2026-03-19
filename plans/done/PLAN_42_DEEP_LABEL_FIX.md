# PLAN 42 — Fix "Deep" Label Repetition in UI

**Status:** Approved, executing
**Created:** 2026-03-15

## Context
Chat page has poor UX: "Deep" appears 3 times in the same toolbar (opus button "Deep Thorough" + toggle "Deep Thinking"). Even with thinking OFF, the "Deep Thinking" label shows. Same issue bleeds into Settings pages. Fix: rename opus label to "Powerful" (already used in AiProviderTab), rename toggle to "Extended Thinking" (Claude's actual feature name).

## Changes (5 string edits across 3 files)

### `website/frontend/src/components/chat/ModelSelector.tsx`
- Line 15: `label: 'Deep'` → `label: 'Powerful'`
- Line 39: `Deep Thinking` → `Extended Thinking`

### `website/frontend/src/components/settings/PreferencesTab.tsx`
- Line 10: `label: 'Deep'` → `label: 'Powerful'`
- Line 60: comment `Deep Thinking` → `Extended Thinking`
- Line 66: UI label `Deep Thinking` → `Extended Thinking`

### `website/frontend/src/components/settings/PlatformConfigTab.tsx`
- Line 17: `'Deep — Opus (highest quality)'` → `'Powerful — Opus (highest quality)'`

### NOT touched (intentionally)
- `PipelineDeepConfigTab.tsx` — "Deep" means "detailed config", different concept
- `AiProviderTab.tsx` — already uses "Powerful"
- Internal variable names (`deepThinking`, `SpeedMode = 'deep'`) — not user-facing

## Verification
1. Chat page: toolbar shows Fast Quick · Balanced Standard · Powerful Thorough
2. Chat page: toggle reads "Extended Thinking"
3. Settings → Preferences: speed card shows "Powerful", toggle says "Extended Thinking"
4. Settings → Platform Config: dropdown shows "Powerful — Opus"
