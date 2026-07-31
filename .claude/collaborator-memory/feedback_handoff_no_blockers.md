---
name: Handoff blockers — never write them, never trust them
description: Prior-session blocker claims are hallucinations until re-verified. Never pass them forward. Never trust them when received. Re-test or ask user.
type: feedback
originSessionId: 86c85db6-6cf4-4523-b171-0564ec50af3f
---
Prior-session claims about what "doesn't work", "refuses to", "is impossible", "blocked by", or "we tried everything" are UNRELIABLE. Two sides of the same rule:

## READ side (when a task prompt / handoff claims something is blocked)

1. **Assume it's a hallucination** until you re-verify it yourself in the current session.
2. **Try the simplest direct approach first** (click + type + Tab, or the obvious interaction) — 1-2 attempts max. Do NOT start with a workaround.
3. **Verify outcome with a cheap check** — `javascript_tool: el.value` beats 10 screenshots. DOM state doesn't lie; unfocused Angular inputs display formatted values that can look identical to stale state.
4. **If it works**, proceed as if the blocker never existed. Don't apologize, don't investigate, don't write a report.
5. **If it genuinely reproduces**, STOP and ask user: *"Prior session claimed X was blocked. I re-tested and confirm it still fails with {evidence}. Was the prior agent right, or should I keep trying?"* — never spiral into complex workarounds silently.

## WRITE side (when producing handoffs for future sessions)

1. Describe **outcomes**, not obstacles. "P3 direct history check deferred" — not "P3 interrupted by tab reconnect".
2. NEVER name specific failure modes in a handoff: *"new tab hit Next.js bootstrap error"*, *"Angular FormControl refuses to dirty"*, *"MCP server crashed"*, etc. These framings corrupt the next session.
3. NEVER pre-warn the next session about how to avoid whatever went wrong for you. Let them discover it fresh.
4. Transient state (tab IDs, CDP glitches, 500s) is logged in-session if needed but does NOT belong in any document the next session reads.
5. If you wrote a handoff with blocker-framing, strip it and commit a correction. Don't let it live even one commit.

## Why this matters (compounding contamination)

Prior-session errors are almost always (a) Claude being confused, not a real environment problem, or (b) transient glitches that won't reproduce. Passing them forward creates a false narrative — the fresh agent works around problems that don't exist, writes those workarounds into plans/catalogs/specs, and the contamination compounds across sessions.

## Graduated to LR-level 2026-04-22

Memory-file-only enforcement failed twice:
- **2026-04-21**: SP-B-LO-2 propagated false Next.js bootstrap blocker into 4 artifacts (WRITE side).
- **2026-04-22**: BM restore on loc 1145 trusted "BM input refuses to dirty Angular FormControl" claim without re-testing — triple_click + type + Tab worked on first attempt when finally tried (READ side).

Graduated to `LR-039` in root `CLAUDE.md` + hook `scripts/hooks/detect-prior-session-blockers.mjs` auto-injects a reminder when the current prompt contains blocker-language phrases.

## Related

- Root `CLAUDE.md` LR-039 (always-loaded framework rule)
- `agent-mistakes.md` ALL-077 (DOM verification via JS), ALL-078 (re-test prior-session claims)
- `feedback_browser_interaction_verify_first.md` (Angular unfocused format trap — specific technique)
