# PLAN: Chat UI Bugs — Website Pipeline Experience

**Priority**: P1
**Found**: 2026-03-24 during website CLI planner testing
**Sessions**: 2 (initial test + re-test after fixes)

---

## Critical (3)

### BUG-CHAT-001: Agent Activity panel always shows "0 messages"
- **Location**: `website/frontend/src/pages/ChatPage.tsx` (Agent Activity section), `src/worker/index.ts` line 228 (`extractProgressMessage`)
- **Root cause**: Worker spawns CLI with `--output-format json` which buffers ALL output until process exit. The `extractProgressMessage()` function reads stdout chunks but never gets streaming text in JSON mode. Worker never calls `POST /api/worker/progress` endpoint.
- **Impact**: User sees "Waiting for agent activity..." for the entire 15+ minute run with zero feedback
- **Fix approach**: Either (a) switch CLI to stream mode and parse progress differently, or (b) have worker emit synthetic progress events at intervals (e.g., "Agent working... 2m elapsed")

### BUG-CHAT-002: No error feedback when pipeline goes to fixme
- **Location**: `website/frontend/src/contexts/ActivePipelineContext.tsx` line 129
- **Root cause**: `pipeline_complete` SSE event with `status: 'fixme'` was mapped to `'completed'` — user sees "Testing complete!" when pipeline actually failed
- **Status**: Code fix deployed (maps fixme → failed), **NOT end-to-end tested** — needs a fixme scenario triggered to verify
- **Fix approach**: Already fixed in code. Needs E2E verification.

### BUG-CHAT-003: No cancel button for running pipelines
- **Location**: `website/frontend/src/pages/ChatPage.tsx`, `website/frontend/src/components/pipeline/ActivePipelineBanner.tsx`
- **Root cause**: No cancel action wired. Backend has `cancel_run` action in ACTION_CATALOG but no UI button triggers it during an active run.
- **Impact**: User must wait for pipeline to finish or manually kill worker process. Previous failed run burned $1.81 over 51 turns with no way to stop it.
- **Fix approach**: Add "Cancel" button to ActivePipelineBanner when `isActive === true`, wire to chatbot `cancel_run` action

---

## High (4)

### BUG-CHAT-004: No chat completion message in Manual mode
- **Location**: `website/frontend/src/contexts/ActivePipelineContext.tsx` line 126-129, `website/frontend/src/pages/ChatPage.tsx`
- **Root cause**: When `pipeline_complete` fires in Manual mode (single stage), the pipeline graph updates but no chat message is pushed. The `onComplete` callback only fires for full pipeline completions, not single-stage Manual runs.
- **Impact**: User has no indication that the planner finished — just sees the graph node turn green
- **Fix approach**: Push a system message to chat when any stage completes: "Planner completed for {pageName}. Review artifacts on Dashboard."

### BUG-CHAT-005: Pipeline graph not visible without scrolling
- **Location**: `website/frontend/src/pages/ChatPage.tsx` layout
- **Root cause**: Pipeline graph (ReactFlow) + Agent Activity panel + chat messages all compete for viewport space. On standard 900px viewport, graph is above the fold and chat is below.
- **Impact**: User can't see chat messages and pipeline graph simultaneously
- **Fix approach**: Either make graph collapsible/resizable, or use a split layout

### BUG-CHAT-006: Module field doesn't auto-populate
- **Location**: `website/frontend/src/pages/ChatPage.tsx` (Module input near agent selector)
- **Root cause**: Module field is a plain text input with no auto-fill from context. When user selects a page from the page tree or mentions a module in conversation, the field stays empty.
- **Fix approach**: Auto-populate Module from last-mentioned page/module in conversation context

### BUG-CHAT-007: Feature field gets full message text
- **Location**: `website/backend/src/services/chatbot.service.ts` — Haiku intent routing
- **Root cause**: When Haiku routes to `trigger_run`, it puts the entire user message as `params.feature` instead of extracting just the feature name. This propagates through the pipeline as the run's feature label.
- **Impact**: Pipeline runs have feature names like "Run planner for Auto Add-Ons page in locations module..." instead of "Auto Add-Ons"
- **Fix approach**: Improve Haiku system prompt to extract concise feature name, or post-process params.feature to truncate

---

## Medium (3)

### BUG-CHAT-008: Duplicate Sign Out buttons
- **Location**: `website/frontend/src/pages/ChatPage.tsx` sidebar + `website/frontend/src/components/common/Header.tsx`
- **Root cause**: Both sidebar and header independently render a Sign Out button
- **Fix approach**: Remove one (keep header, remove sidebar duplicate)

### BUG-CHAT-009: Pipeline running banner disappears on navigation
- **Location**: `website/frontend/src/contexts/ActivePipelineContext.tsx`
- **Root cause**: ActivePipelineBanner visibility depends on route — when navigating to Dashboard and back, the SSE connection may not reconnect for the active run
- **Fix approach**: Persist active run state in context across route changes

### BUG-CHAT-010: No cost/token display
- **Location**: `website/frontend/src/pages/ChatPage.tsx`, `website/frontend/src/components/pipeline/ActivePipelineBanner.tsx`
- **Root cause**: Worker doesn't report cost data back to the SSE stream. `pipeline_complete` event has `totalCost` field but it's always 0 (worker sets `cost: 0` at line 461 of `src/worker/index.ts`)
- **Fix approach**: Parse Claude CLI JSON output for cost/token data and include in task completion payload
