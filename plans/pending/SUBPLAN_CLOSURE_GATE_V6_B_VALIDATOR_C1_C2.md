---
title: v6-B Validator C1 + C2 — Forbidden Tokens + Execution Summary + closure_meta narrowing + HEAD-authority isExempt
Parent: PLAN_CLOSURE_GATE_V6_PARENT.md
Status: PENDING-DRAFT-v6
Priority: P0-EMERGENCY
Created: 2026-05-18
Identity: OWNER
Model: claude-opus-4-7
Thinking: max
PermissionMode: auto
RiskAcknowledged: true
BrowserTool: none
Justification: max — fixes 2 CRITICAL bypasses of the authorization surface (B1 + B2)
closure_meta: false
---

## TODO — author this subplan in its own session per PROMISE-PAIRED-TEST DISCIPLINE

This is a STUB. Open via `/planning SUBPLAN_CLOSURE_GATE_V6_B_VALIDATOR_C1_C2.md` in a fresh session AFTER v6-A closes GREEN.

## Scope hint (from parent matrix)

- `scripts/validate-plan-closure.mjs` C1 section (forbidden-token detection, fence/quote/heading drops, override application via HEAD/staged routing)
- `scripts/validate-plan-closure.mjs` C2 section (Execution Summary heading `##`-`####`, Executed: date, cited-path check)
- `scripts/validate-plan-closure.mjs` `isExempt()` function — MUST route through `loadOverrides(mode)` not `readFileSync(OVERRIDES_PATH)` (B2 fix)
- `scripts/validate-plan-closure.mjs` `loadOverrides()` — MUST distinguish file-not-found (empty) vs JSON-parse-error (exit 1) vs git-error (exit 1 per B15) (C6 fix)
- `scripts/validate-plan-closure.mjs` `validatePlan()` — closure_meta exemption runs C1's override application but C2/C3/C4/C5 still run (B1 fix — narrowed exemption)
- `scripts/validate-plan-closure.mjs` Status detection — requires frontmatter; no slice(0,800) fallback (C2 fix)
- `scripts/test-fixtures/plan-closure/*.md` — 12+ new fixtures (good-c1, override-allowed-c1, bad-c1-fenced-quoted-heading-drops, good-c2, bad-c2-no-summary, bad-c2-short, bad-c2-no-cite, bad-meta-disk-vs-head, bad-no-frontmatter-status-done, meta-plan-with-bad-c4-fails-c4, bad-loadoverrides-jsonparse-exits-1)

## Defects this chunk resolves (Preservation Matrix Layer 2)

- B1 (CRITICAL): closure_meta exemption applies to C1 only; C2-C5 still run
- B2 (CRITICAL): `isExempt` uses HEAD/staged authority via `loadOverrides(mode)`
- C2 (LOW): Status detection requires frontmatter
- C6 (MEDIUM): `loadOverrides` errors are diagnostic (categorized, not silent empty)

## Preservation Matrix Layer 1 rows this chunk owns

B1, B4, B8, B9, B15(partial), M3, R3(partial), NV4(partial)

## PROMISE-PAIRED-TEST table (to be filled in authoring session)

| Plan-body promise | Paired self-test |
|---|---|

## Acceptance

- [ ] C1 + C2 + isExempt + loadOverrides + Status detection all match plan promises.
- [ ] ≥12 fixtures + corresponding self-test assertions.
- [ ] Synthetic test: disk overrides include plan basename but HEAD does NOT → isExempt returns false in hook mode.
- [ ] Synthetic test: closure_meta plan with phantom C4 handoff → status: FAIL on C4 (NOT EXEMPT).
- [ ] Synthetic test: plan body with no frontmatter + inline "Status: DONE" → skip (NOT trip DONE).
- [ ] External auditor pass returns GREEN before v6-C begins.
- [ ] Closure manifest written for this subplan.
