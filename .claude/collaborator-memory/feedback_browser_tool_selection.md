---
name: Browser tool selection — Playwright CLI vs Claude in Chrome
description: Default per LR-038 v2 = Playwright CLI. Chrome only when task matches a named Chrome row (visual/CSS, fresh MFA, explicit pause step). Auto-memory MUST NOT carry a default that contradicts the canonical rule at .claude/rules/browser-tool.md.
type: feedback
originSessionId: 2026-04-27-cli-vs-chrome-system-fix
---

The decision rule lives in `.claude/rules/browser-tool.md` (LR-038 v2) and `docs/read_only_docs/CLI_BROWSER_GUIDE.md`. This memory carries no default of its own — it points at the rule and records the steering history that produced it.

**Default = Playwright CLI.** Chrome only when one of these named rows applies:

- Visual / CSS / layout / pixel-level assertion.
- Fresh MFA / OTP / passkey flow that no `state-save` can solve. (Already-authenticated repeat sessions do NOT qualify — CLI's `state-save -s=nav4` reuses the session.)
- Subplan body contains an explicit `pause:` / `await user input` step that fires DURING execution. Verdict gates, YELLOW/RED handoffs, and "user will read the report later" are NOT human-in-loop and do NOT justify Chrome.

**Why:** Two corrections, two opposite directions, both valid:

1. **Session 2026-04-20** — agent defaulted to Playwright MCP for SP-B-LO-1, burned ~4K tokens per `browser_snapshot`, hit context pressure. User flagged the inefficiency. Outcome: stop defaulting to MCP silently; the V1 rule pointed at Chrome because Chrome's `read_page` was cheaper than MCP's `browser_snapshot`. (V1 framing.)
2. **Session 2026-04-27** — agent picked Chrome for SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT citing "auth-heavy" and "human-in-loop". Audit verdict: OVER-CAUTIOUS. Auth is one-time CLI state-save, not Chrome-mandatory. "Human-in-loop" was the agent's editorial addition — the subplan had zero pause steps. The work was functional-bug catalog testing — exactly what LR-038 v2 sends to CLI (~4× cheaper). Rutvik's correction: "human in loop is not real, I'm only in the loop on a blocker. If auth were a problem, why have CLI?"

The 2026-04-20 framing (Chrome > MCP on token cost) does NOT generalize to (Chrome > CLI). LR-038 v2 (2026-04-24) re-baselined the choice as CLI vs Chrome, with CLI as the default. This memory was rewritten 2026-04-27 to match.

**How to apply:**

- At session start, if the plan involves live DOM: read `**BrowserTool**:` frontmatter on the active subplan. That declared value is authoritative — do not second-guess it without a `[BROWSER-SWITCH]` log per LR-028.
- If declaring a tool fresh (ad-hoc session, no subplan frontmatter): walk the LR-038 v2 matrix in order. **First Chrome row that fits = Chrome.** Otherwise CLI.
- "Auth-heavy" is NOT a Chrome trigger by itself for repeat sessions — only fresh MFA / OTP / passkey is. Document `state-save -s=<name>` as the CLI auth path; reach for it before reaching for Chrome.
- "Human-in-loop" / "user at machine" / "live RCA" requires an explicit `pause:` step in the plan. Verdict gates and end-of-subplan handoffs do NOT qualify.
- Announce the choice + reason in first output. Phase-0 directives in subplan bodies must NOT pre-name a tool (per `.claude/skills/planning/SKILL.md` Step 6 anti-priming rule).

**Related memories:**

- [feedback_sonnet_task_split.md](feedback_sonnet_task_split.md) — Sonnet can't do MCP browser work; LR-038 is about WHICH browser tool, sonnet guardrails are about WHETHER to browse at all.
- [feedback_browser_interaction_verify_first.md](feedback_browser_interaction_verify_first.md) — orthogonal Angular interaction guidance.

**Archived predecessor:** `_archive/feedback_browser_tool_selection_2026-04-20.md` — the V1 Chrome-default version, kept for history.

---

## playwright-cli ≠ npx playwright (consolidated 2026-05-18 per LR-054)

`playwright-cli` and `npx playwright` are TWO DIFFERENT binaries. Conflating them caused two same-session hallucinations on 2026-05-18 (SP-A agent's manufactured Section 0 blocker + my own "CLI can't drive live interaction" mis-answer). Treat as distinct:

- **`playwright-cli`** (Microsoft, `@playwright/cli`, v0.1.8 as of 2026-04-14) — the **agent-CLI**. Drives live browser sessions: `open`, `goto`, `snapshot`, `click <ref>`, `fill <ref> <val>`, `type <ref> <val>`, `eval <expr>`, `network`, `console`, `state-save -s=<name>`, `screenshot -o <file>`, `tab-list`, `dialog-accept`, etc. Per-session via `-s=<name>` flag (top-level, MUST precede subcommand). Persistent profile via `open --persistent --profile=<dir>`. Subcommand surface is canonical at `docs/read_only_docs/CLI_BROWSER_GUIDE.md` §2 Table 2.
- **`npx playwright`** — the **`@playwright/test` runner**. Subcommands: `test`, `codegen`, `install`, `show-report`, `show-trace`, `open` (legacy inspector, NOT the agent-CLI `open`). NO `snapshot`/`click`/`fill`/`eval`/`network`/`console`/`state-save` subcommands. Cannot drive live interaction from chat.

**Rule:** any yes/no question about "can CLI do X" → grep `docs/read_only_docs/CLI_BROWSER_GUIDE.md` Table 2 FIRST, answer SECOND. Same for any HALT row citing "CLI can't do X" — verify the claim against Table 2 before writing the HALT.

**Why:** 2026-05-18 hallucination shipped to user. SP-A agent wrote 153 lines of "Section 0 — Live-Walk Blocker" citing hypothetical MFA that contradicted `clients/encore/CLAUDE.md:134` ("no second-factor authentication configured") AND the subplan's own line 94-96. I separately said "playwright CLI ≠ live Claude interaction" without consulting Table 2 — conflating `npx playwright` (test runner) with `playwright-cli` (agent-CLI). The two confusions had the same shape: authoritative answer without grepping the canonical doc.

**How to apply:**

- Any "can CLI do X" question → grep Table 2 first. If a row exists, the answer is YES. If no row, the answer is NO — but cite the absence, don't manufacture a reason.
- Any HALT prose citing CLI capability → quote the Table 2 row (or its absence) verbatim before writing the HALT.
- Distinguish in chat: "playwright-cli" (agent-CLI, hyphenated, single binary) vs "npx playwright" (test runner, spaced, npm script). Don't write "playwright CLI" ambiguously.
- Companion structural defenses: LR-054 (`.claude/rules/browser-tool.md`) is the path-scoped rule; ALL-077 (`clients/encore/specs_planning/_internal/agent-mistakes.md`) is the agent-mistakes row; the `todo-injection-gate` hook + `verify-no-forbidden.mjs` deny banned manufactured-blocker phrases on artifact files; `/audit` skill scans for the same patterns.
