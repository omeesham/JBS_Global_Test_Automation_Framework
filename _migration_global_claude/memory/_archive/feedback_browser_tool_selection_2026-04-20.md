---
name: Browser tool selection — Claude in Chrome vs Playwright MCP
description: Claude Code sessions default to Claude in Chrome for exploratory/catalog/live-DOM work; Playwright MCP only when unattended or determinism is critical. Non-Claude agents always use Playwright MCP. See LR-038.
type: feedback
originSessionId: 10fbe882-a35b-44a3-8b98-71d328f2039a
---
When any session I run needs to interact with a live web app (Navigator4 or any target), I
select the browser tool per **LR-038** (root CLAUDE.md) and announce the choice + reason in
my first output.

**Default for me (Claude Code)**: Claude in Chrome. It is cheaper in tokens (`read_page` is compact
vs `browser_snapshot` ~4k tokens per call), faster, inherits the user's live SSO session, and has
`read_network_requests` for LR-033 network RCA.

**Switch to Playwright MCP** when: unattended CI-style run, determinism is critical, pixel-perfect
reproducibility needed, or Claude in Chrome unavailable. Not by default.

**Why:** Session 2026-04-20 — I executed SP-B-LO-1 defaulting to Playwright MCP. `browser_snapshot`
burned 4k tokens each, needed one per DOM mutation. Hit context pressure. User flagged the
inefficiency and directed the rule be encoded at framework level so no future agent of mine
(or anyone's) has to reactively switch mid-session.

**How to apply:**
- At session start, if the plan involves live DOM: check LR-038 Gate 1 (am I Claude Code? yes),
  Gate 2 (task classification). Default to Claude in Chrome.
- Announce choice: "Browser tool: Claude in Chrome. Reason: <exploratory catalog / auth-heavy /
  token-tight / user at machine>."
- If mid-session Claude in Chrome fails (extension crash, tab closed, auth expired in my tab
  specifically), switch to Playwright MCP and log the switch with reason.
- NEVER default to Playwright MCP silently. That was the 2026-04-20 failure mode.

**Related memories:**
- [feedback_sonnet_task_split.md](feedback_sonnet_task_split.md) — Sonnet can't do MCP browser work
  (framework rule). LR-038 is about WHICH browser tool; Sonnet guardrails are about WHETHER to
  browse at all.
