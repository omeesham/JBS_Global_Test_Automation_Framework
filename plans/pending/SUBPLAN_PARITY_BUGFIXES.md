---
**Status**: PENDING (GATED on Rutvik go — every fix touches a PROTECTED control file)
**Priority**: P1
**Created**: 2026-07-12
**Identity**: OWNER
**Parent**: PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY.md
**Depends on**: DELEGATION_STACK_BUGS.md (done) + parity-bughunt-verify (done, 10/12 confirmed)
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: fixes to protected hook/wrapper/config control surface — each edit needs judgment + a scoped grant.
**PermissionMode**: auto
**BrowserTool**: none
---

# SUBPLAN_PARITY_BUGFIXES — Fix the 10 verified bugs in the delegation/guardrail stack

## Context

The parity bug hunt found 12 candidates; a cross-family adversarial refute-review (gpt-5.5, run `parity-bughunt-verify`) confirmed **10 REAL, 2 REFUTED**. Evidence: `.claude/state/parity-recon/DELEGATION_STACK_BUGS.md` + the verify verdict. Refuted (do NOT fix — false alarms): PBUG-05 (UW-3 is the stall branch, not a missing wire) and PBUG-10 (parse-verdict regex does NOT match the prose examples; strict CLI fallback exists).

**Every remaining fix touches a PROTECTED control file** (copilot-worker.sh, delegation-gate.mjs, ua-worker-guard.mjs, guardrail-config.json, packet-builder.mjs, chain-guards.sh). Per the takeover doctrine these require **Rutvik's explicit in-chat go + a scoped SELF_GRANT (reason ≥20 chars, TTL ≤60 min)** — that is why this subplan is GATED, not auto-executable.

## The 10 verified bugs (fix order = severity then blast-radius)

| # | Sev | File:line | Defect | Fix direction |
|---|---|---|---|---|
| PBUG-01 | S1 | copilot-worker.sh:502-506 | Missing `## ASK` section → silent `ask_open=false`, indistinguishable from clean "none" | Distinguish absent-section: set `ask_open="missing-section"` (or loud-fail) when the `## ASK` heading is absent in ticket mode |
| PBUG-08 | S1 | delegation-gate.mjs + ua-worker-guard.mjs (emitDeny/emitAllow) | Both skip mandatory LR-069 §3.4 `gate-fires.log` telemetry → demotion review is blind | Append `<gate>, <ISO>, <verdict>, <target>` to gate-fires.log before exit; mirror `check-md-first.mjs:fireTelemetry()` |
| PBUG-02 | S2 | copilot-worker.sh:478-481 | `sleep 1` process-sub flush is a race → large outputs record false failure + budget double-spend | Replace `sleep 1` with bare `wait` (drains ALL bg jobs incl. process-substitution subshells) |
| PBUG-04 | S2 | copilot-worker.sh:512-517 | Unescaped `%s` JSON → a quote/backslash in `$AGENT` corrupts ledger JSON | Build ledger/meta JSON via `node -e` or `jq` with proper string escaping |
| PBUG-06 | S2 | packet-builder.mjs:71-75 | Overflow truncation `slice(0,maxChars)` emits invalid JSON; overflow path untested | Truncate `askBlock.ask` at a word boundary BEFORE assembly; add overflow=true test; document "check overflow before JSON.parse" |
| PBUG-09 | S2 | delegation-gate.mjs:164-173 | `hasPipelineIdentity` returns FIRST identity in a message, not LAST (comment says last) | Scan `msg.content` in reverse, or collect all + return last |
| PBUG-12 | S2 | guardrail-config.json | Dead keys `stall_guard_mode` + `uplink_mode` never read → editing them silently no-ops | Either wire the wrapper to read them, OR delete + add a comment pointing to the real `config.json:STALL_MODE` |
| PBUG-03 | S3 | copilot-worker.sh:139 | Unguarded `date -I` → on broken/non-GNU date, grep matches ALL ledger rows (false budget-exceed) | Validate `date -I` output; fall back to a sentinel + fire on failure |
| PBUG-07 | S3 | redact.mjs:16-17 | Garbled comment ("****** in any context") misdescribes a bearer-only regex | One-line comment fix |
| PBUG-11 | S3 | chain-guards.sh:64-70 | `check_allowlist` unescaped grep regex (false-pass); DEAD code (no live caller) | Delete the dead function (preferred) or `grep -qF` fixed-string |

## Sequencing note
S1s first (PBUG-01, PBUG-08 — they corrupt the trust signals the whole delegation loop reads). PBUG-01 also directly reinforces the injection system (a worker report missing `## ASK` should never read as clean — pairs with the uplink ASK acceptance gate). Group by file to minimize grant windows: one grant for copilot-worker.sh (PBUG-01/02/03/04), one for delegation-gate.mjs (PBUG-08/09), one for the rest.

## Execution model
Each fix = a worker BUILD ticket (the worker does the edit under a scoped grant path), cross-family reviewed, then a targeted re-verify (re-run the specific failure scenario where reproducible). PBUG-06 gets a real unit-test (the overflow path). PBUG-01/02/04 get a sacrificial-dispatch re-verify.

## Acceptance criteria
- [ ] All 10 fixes landed, each cross-family reviewed green
- [ ] PBUG-06 overflow test added and passing
- [ ] PBUG-01/02 re-verified via a real dispatch producing the previously-broken condition, now correct (LR-059)
- [ ] gate-fires.log shows entries from delegation-gate + ua-worker-guard after PBUG-08 (real fire)
- [ ] Refuted PBUG-05/PBUG-10 explicitly NOT touched
- [ ] Every protected-file grant logged to grants-audit.log + surfaced in the Receipt

## GATE — reserved for Rutvik
Explicit in-chat go before ANY protected-file edit; per-file SELF_GRANTs. Until then this subplan stays PENDING.
