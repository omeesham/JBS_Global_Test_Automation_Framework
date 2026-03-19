# PLAN 49D: Enhanced Agent Streaming (Chat-Like Feel)

## Context
Worker currently sends generic progress messages ("Reading files...", "Analyzing...") every 5s max. Need more conversational streaming that feels like Claude is talking to the user — not just status updates but what it's doing, discovering, deciding.

## What to Build
1. **Worker enhancement**: Richer progress message extraction from Claude CLI stdout
   - Tool call summaries: "Navigating to /locations/notes..."
   - Discovery messages: "Found 12 form fields to test"
   - Decision messages: "Creating test case for Save button flow"
   - Completion messages: "Test case TC-LOC-NOT-001 created"
   - Increase streaming frequency from 5s to 2s
2. **Frontend redesign**: AgentActivityFeed as chat-style UI
   - Claude avatar + message bubbles (not flat log lines)
   - Typing indicator when no message for 3s+
   - Grouped by stage with stage headers
   - Auto-scroll with "Jump to bottom" button

## Files to Modify
- `src/worker/index.ts` — enhance extractProgressMessage() (lines 231-247)
- `website/frontend/src/components/pipeline/AgentActivityFeed.tsx` — chat-style redesign

## Agent Research Directives
- Read worker/index.ts extractProgressMessage() to understand current extraction patterns
- Understand Claude CLI stdout format — what patterns appear that we can extract?
- Check worker stdout buffering — does Node child_process buffer affect real-time feel?
- Read progress POST endpoint (lines 204-227) — rate limiting logic, when does it send?
- Research chat bubble UI patterns with Tailwind
- Check if Claude CLI outputs tool call names (browser_navigate, browser_snapshot, etc.)

## Edge Cases to Audit
- Worker behind firewall (progress POST fails silently — need retry?)
- Claude CLI output format changes across versions — extraction must be resilient
- Very fast agent completion (< 5 seconds, no messages to show) — show completion immediately
- Very long messages — truncation with "Show more" expansion
- Multiple workers simultaneously — messages must include runId to avoid interleaving
- Empty stdout (Claude CLI produces no parseable output) — show "Agent working..." heartbeat

## Effort
~110 lines across 2 files
