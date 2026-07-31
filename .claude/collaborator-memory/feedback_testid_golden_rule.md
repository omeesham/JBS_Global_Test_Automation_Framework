---
name: feedback-testid-golden-rule
description: "Locator golden rule — use data-testid when present, else next-best locator + flag the gap, switch back when a testid is added"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 38d0a46b-daca-4faa-9d6e-d76d0b09e3de
---

The user's standing locator rule (set 2026-07-06). Applies to ALL selector / page-object / spec work across the framework, not one plan:

1. `data-testid` present on the element → **use it**.
2. No testid → use the **next-best available locator** (role / label / stable attribute) AND **flag the gap** in the QA tracker / testid-gap-report (wherever that surface's gaps are tracked).
3. Encore later adds the `data-testid` → **switch the selector back** to it.

This SUPERSEDES the old LR-014 "missing-testid → fixme/skip" clause. The test RUNS with the fallback locator — a missing testid is never a reason to skip a test or lose coverage.

**Why:** a missing testid is a tracked follow-up, not a blocker; flagging keeps the client accountable for adding testids without stalling automation.

**How to apply:** as of 2026-07-06 this rule is **ENCODED (DONE)** — the framework enforces it, no hand-application needed. Landed by WS-E of `PLAN_GATE_BACKLOG_AND_1604_TRACKER.md` (now in `plans/done/`, commits `d97923b2` + `f153a705`): golden rule in `AGENT_SHARED_RULES.md` §5 (+ §10 "not a fixme reason"); LR-014 rewritten in `.claude/rules/inventory.md` (LR-029 kept mandatory; new landmark phrase "testid-first golden rule"); `PLANNER.md`/`HEALER.md` TESTID_MISSING flow; WARN-only pre-commit gate 5n (`scripts/check-testid-preference.mjs`, always exit 0 — a static gate cannot see the live DOM, so it reminds, never blocks). The reversed 2026-06-22 "fixme, never fallback-to-green" clause is gone. LR-029 live verification stays mandatory before any missing-testid claim goes to the client. See [[feedback_no_hardcoded_env_in_selectors]].
