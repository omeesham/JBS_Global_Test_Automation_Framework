# Claude CLI Steering — Research Findings (2026-03-19)

## What Actually Works Today

| Capability | Mechanism | Mid-Turn? | Destructive? |
|---|---|---|---|
| Inject context between tool calls | PreToolUse hook + steering file + `systemMessage` | Yes (tool boundaries only) | No |
| Hard redirect / abort | `client.interrupt()` then `client.query()` | Yes | Yes (loses in-progress turn) |
| Queue next instruction | Streaming input / AsyncGenerator yield | No (waits for turn end) | No |
| Follow up after completion | `--resume <session-id>` or `--continue` | No (new turn) | No |
| Pause/resume | No native support | N/A | N/A |
| True mid-generation steering | NOT POSSIBLE | No | N/A |

## Key CLI Flags Discovered

- `--allowedTools "Bash,Read,Edit,Write,mcp__*"` — pre-approve tools, prevent permission prompt hangs
- `--permission-mode plan` — read-only mode (useful for audit stage)
- `--dangerouslySkipPermissions` — skip ALL prompts (nuclear option)
- `--permission-prompt-tool mcp_tool` — MCP tool handles permission prompts
- `--resume <session-id>` — continue a session with a new prompt
- `--input-format stream-json` — bidirectional stdin for multi-turn (NOT mid-turn injection)
- `--max-budget-usd 5.00` — cost cap per invocation

## Architecture Recommendation

Use **Python Agent SDK** (`ClaudeSDKClient`) instead of raw `claude -p -` subprocess for:
- `client.interrupt()` + `client.query()` for hard redirects
- PreToolUse hooks for steering file injection
- Streaming input for queued instructions

Current implementation uses `claude -p -` (subprocess) which limits steering to:
1. Steering file approach (agent checks `.tmp/steering/{RUN_ID}.json` at phase boundaries)
2. Cancel + re-run (stop-and-redirect via API)
3. Session resume after completion

## Relevant GitHub Issues
- [#30492 - Real-time steering: priority message channel](https://github.com/anthropics/claude-code/issues/30492) — Open, no official response
- [#70 - Real-Time Steering for Agent SDK](https://github.com/anthropics/claude-agent-sdk-typescript/issues/70) — Closed, points to streaming
- Anthropic acknowledges the need but hasn't shipped native mid-turn steering yet

## What We Implemented (2026-03-19)
- `--allowedTools` added to worker CLI invocation (prevents permission hangs)
- Steering API endpoint: `POST /api/pipeline/:id/steer`
- Two modes: `inject` (file-based, non-destructive) + `stop-and-redirect` (cancel + context save)
- ALL-053 rule: agents check steering file at phase boundaries
- Future: migrate to Python Agent SDK for `interrupt()` + hooks support
