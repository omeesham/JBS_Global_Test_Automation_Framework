---
description: Playwright CLI vs Claude in Chrome selection matrix (LR-038 v2)
paths:
  - "plans/**/*.md"
  - "clients/*/src/pages/**/*.ts"
  - "clients/*/tests/specs/**/*.spec.ts"
  - "clients/**/specs_planning/**/*.md"
---

# Browser Tool Selection (LR-038 v2)

Path-scoped rule pack — loads when authoring plans, page objects, specs, or specs_planning artifacts that may interact with a live website.

**V2 thesis (2026-04-24)**: the 2-way choice is now **Playwright CLI** (default, token-efficient, unattended) vs **Claude in Chrome** (specialist — visual/CSS, auth-heavy MFA, live RCA). Playwright MCP is **retiring** (SP-PWC2-07 deletes `.vscode/mcp.json`); do not start new work on MCP. When any session needs to interact with a live website (exploration, locator discovery, bug investigation, catalog work, live DOM reads/clicks/saves), choose the browser tool **before** first browser call. Announce the choice + reason in the first output or activity-log row of the session. See [`docs/read_only_docs/CLI_BROWSER_GUIDE.md`](../../docs/read_only_docs/CLI_BROWSER_GUIDE.md) for command-surface parity, auth story, and claim-verification trail.

## Gate 1 — Agent type

- **Claude Code (Opus or Sonnet)** → continue to Gate 2. You can call `mcp__Claude_in_Chrome__*` and `@playwright/cli` (`playwright-cli`).
- **Codex / Cursor / other non-Claude AI** → fall back to Playwright CLI (or legacy MCP until SP-PWC2-07 retires it). You do NOT have Claude in Chrome tools. Do not pretend you do.
- **Self-check for Claude Code**: if you can see any `mcp__Claude_in_Chrome__*` tool in your tool list, Gate 1 passes.

## Gate 2 — Task classification (2-way matrix)

Pick per the task class. There is no "default when uncertain" — if the task doesn't cleanly fit a row, re-read the rationale column.

| Task class | Primary | Rationale |
|---|---|---|
| Functional bug (500s, broken link, silent no-op, API 4xx) | **CLI** | `playwright-cli network` + `eval` give structured request logs; ~4× token savings vs MCP baseline |
| Visual / CSS / layout bug | **Chrome** | Chrome wins because the user's own Chrome window provides live visual review during agent work (human-in-loop) |
| Auth-heavy exploration (SSO + MFA + TOTP + Entra FedAuth renewal) | **Chrome** | Inherits live user session. CLI needs one-time `state-save`; fresh MFA/TOTP is Chrome-only |
| Catalog walkthrough / locator discovery (>10 fields) | **CLI** | CLI wins when the agent uses **grep-over-disk discipline** — keep the saved YAML snapshot on disk, `grep` specific labels (~50 tokens per field query). `Read`ing the whole YAML file erases the advantage |
| Spec generation Phase 0.5 walkthrough (PF-G5 evidence) | **CLI** | Emit walkthrough.yaml to disk for auditability + canonical-JSON normalization. Generator MUST use grep-over-disk for field-level queries |
| Batch regression (unattended, >5 pages) | **CLI** | Headless + multi-browser; Chrome extension has no headless |
| Live RCA (user at machine, "what happens when I click") | **Chrome** | **Valid only when the subplan body contains an explicit `pause:` / `await user input` step that fires DURING execution.** Verdict gates at end-of-subplan, YELLOW/RED handoffs between phases, and "user will read the report later" are NOT human-in-loop — those are post-execution review and do not justify Chrome. (Tightened 2026-04-27 after the SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT over-cautious-Chrome incident.) |
| MFA / OTP / passkey flow | **Chrome (mandatory)** | CLI cannot solve fresh MFA; TOTP expiry faster than state-save refresh |
| Spec execution (`npm test`) | Neither — `@playwright/test` runner | Not a browser-tool choice |

## Gate 3 — CLI auth fallback (try-it-and-see, no freshness gate)

Try the `playwright-cli` call as-is (headless, using `.auth/nav4-state.json`). If it lands on the app → continue. If it redirects to `login.microsoftonline.com` or any Entra page → STOP, do NOT retry headless. Switch to headed via `playwright-cli open --persistent --profile=.auth\nav4-profile`, surface a one-line "auth refresh needed — please complete MFA in the headed window" message to the user (LR-039 obstacle row), wait for MFA, then `state-save -s=nav4` to refresh `.auth/nav4-state.json`. Resume the original headless flow on refreshed state. Log the switch as `[BROWSER-SWITCH] from=cli-headless to=cli-headed reason=auth-refresh artifact=.auth/nav4-state.json` per the mid-subplan switch protocol below. Trigger is the Entra redirect, not file age — no proactive mtime check.

## Mandatory announcement (accountability)

First output or activity-log row of any browser-interacting session must declare the choice and the reason, e.g.:

> "Browser tool: Playwright CLI. Reason: catalog walkthrough, 40 fields, unattended."
> "Browser tool: Claude in Chrome. Reason: visual regression on dropdown z-index; user at machine."
> "Browser tool: both. Reason: CLI for catalog + Chrome for one visual assertion (BrowserToolJustification: pilot module)."

Subplans authored after 2026-04-24 MUST also declare the choice in a `**BrowserTool**:` frontmatter line (`cli` | `chrome` | `both` | `none`). `both` requires a `**BrowserToolJustification**:` line (SP-PWC2-02 validator enforces). Pre-2026-04-24 subplans are grandfathered.

## Mid-subplan switch protocol (`[BROWSER-SWITCH]`)

Switching tools within one subplan is allowed when task class shifts. Every switch MUST be logged in the activity log per LR-028 with the canonical format:

```
[BROWSER-SWITCH] from=<cli|chrome> to=<cli|chrome> reason=<one-line> tokens_so_far=<n> artifact=<file-if-any>
```

**Switch budget** (`/final-q` audits when initial `BrowserTool=both` or any switch occurred):

- ≥2 switches in one subplan → `/final-q` **YELLOW** (should have been authored as `both` up-front, or split into two subplans).
- ≥3 switches in one subplan → `/audit` **RED** (design smell — lazy-escape-hatch pattern).

## Chrome connection-drop protocol

Chrome's service worker can go idle on long unattended runs; the extension may also lose its websocket. On any connection drop during an unattended run:

1. Agent MUST log a `[BROWSER-SWITCH] from=chrome to=cli reason=connection-drop ...` row and continue on CLI.
2. Failure to switch (silent halt, indefinite retry on Chrome) = `/audit` **RED**.
3. Drop event MUST be recorded as a JSON file under `reports/browser-drops/<YYYY-MM-DDTHH-MM>.json` with `{subplan, from, to, trigger, recovery_action}`.
4. If the subplan declared `BrowserTool: chrome` (not `both`), the agent HALTs and surfaces the drop to the user instead of silently degrading — Chrome was chosen for a reason.

## Legacy context (footnote)

V1 of this rule framed the 2-way choice as Chrome vs **Playwright MCP**. V1 plan archived at [`plans/done/PLAN_BROWSER_TOOL_SELECTION.md`](../../plans/done/PLAN_BROWSER_TOOL_SELECTION.md); V2 parent at [`plans/pending/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md`](../../plans/pending/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md). Historical activity-log rows, catalog session notes, and done-plan execution summaries that reference Playwright MCP remain valid factual records — do not rewrite them. Field-inventory artifact frontmatter keys (`MCP_Session_Tool`, `MCP_Tool_Reason`) retain their names pending SP-PWC2-05 canonical normalization.

**Trigger**: Every session whose plan or request involves any of: `/research` with a live-DOM phase; `/rca` Phase 5 (live browser replication); `/find-bugs` with live app interaction; `/bugfix` when reproducing on live app; any subplan whose Skills field includes `/research` + browser, or whose Step-by-Step involves "live DOM", "browser session", "catalog", "locator discovery", "live verification".
