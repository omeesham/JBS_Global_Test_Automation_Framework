---
name: reference_playwright_cli_and_subagent_limits
description: playwright-cli is installed GLOBALLY (not project node_modules); one state-load authenticates both e2e+nav2 via MS-SSO cookie bridge; Sonnet subagents hit the 1M-context credit gate but Opus+Haiku were observed to spawn (2026-06-05) — try the needed class, never assume Haiku-only
metadata: 
  node_type: memory
  type: reference
  originSessionId: 36175243-d08a-4b85-b803-0792ddcc4280
---

Proven 2026-06-02 during the live QA verification campaign (40 checks, e2e + nav2).

- **`playwright-cli` (Microsoft `@playwright/cli`) is installed GLOBALLY, not in the project's `node_modules`.** Verify with `npm ls -g @playwright/cli` (→ `0.1.8`); binary on PATH at `C:\Users\rutvi\AppData\Roaming\npm\playwright-cli`. A prior session checked `clients/encore/node_modules` only, found nothing, and wrongly pivoted to `npx playwright test` — the exact LR-054 hallucination (`playwright-cli` ≠ `npx playwright`). ALWAYS check the global install before declaring the agent-CLI unavailable.
- **One `playwright-cli state-load clients/encore/.auth/encore-state.json` authenticates BOTH e2e AND nav2.** That storageState's 26 cookies include the Microsoft SSO set (`.login.microsoftonline.com`, `.login.live.com`), which bridge nav2's (`navigator2.training.psav.com`) SSO — no separate nav2 login, no `nav2-state.json`. `playwright-cli open` defaults to **headless**, so per-worker sessions are parallel-safe (no persistent-profile lock). The persistent `e2e-profile` goes stale after ~7 days (Entra FedAuth) and shows the "Continue Now" pre-SSO gate — prefer `state-load` of the fresh storageState over the profile. nav2 shows an "Accessing Navigator…" splash for several seconds post-SSO — poll for content, don't eval immediately.
- **Subagent model gate (this environment):** spawning Sonnet or Opus subagents from an Opus-4.8-[1M] parent fails instantly with "Usage credits required for 1M context" (the child silently inherits the parent's 1M-context tier — a separate billing SKU — which the account's extra-usage doesn't cover). Only **Haiku** subagents spawn. Escalations needing Opus must run in the main loop, not as subagents.
  - **This is 1M-context-PARENT-specific, NOT a universal law** (confirmed via docs research 2026-06-04). The platform fully allows cross-class subagents (a subagent's `model` can even be *higher* than the parent's). On a **standard (non-1M) parent**, Sonnet/Opus subagents spawn freely with no gate. Fix paths when blocked: `/extra-usage` (enable the SKU) or `/model` to standard context. Sources: [Claude Code subagents docs](https://code.claude.com/docs/en/sub-agents), GitHub anthropics/claude-code #51060, #57249.
  - The `/ultra-agents` skill (`.claude/skills/ultra-agents/SKILL.md`) encodes this model-aware behavior: attempt the needed class, fall back to `inherit`/Haiku + LOG on the extra-usage error, never hard-code Haiku-only.
  - **Observed 2026-06-05 (corp-pricing planning session) — "Haiku-only" is WRONG:** from the same parent, an **Opus subagent spawned and completed successfully**, a **Sonnet subagent failed** with the 1M-credit error, and **Haiku worked**. So empirically the block hit **Sonnet**, not Opus. ALWAYS *try* the needed class first (especially **Opus** for hard/live/RCA subagent work) before any fallback; never pre-declare Haiku-only. User directive that session: "did u even try them! do not assume anything! dont use haiku for hard tasks." If Sonnet is needed, `/extra-usage` or `/model` standard-context unblocks it.

See LR-054 in `.claude/rules/browser-tool.md`; related [[feedback_browser_tool_selection]].
