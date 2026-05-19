---
title: v6-C Validator C3 + C4 + C5 — Cited Artifacts + Handoffs + Strict-Line vs Deviation (artifact existence+hash, parent-aware shorthand, recipient-token enforcement)
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
Justification: max — most complex chunk; 3 checks + multiple HIGH defect fixes; depends on v6-B's check skeleton
closure_meta: false
---

## TODO — author this subplan in its own session per PROMISE-PAIRED-TEST DISCIPLINE

This is a STUB. Open via `/planning SUBPLAN_CLOSURE_GATE_V6_C_VALIDATOR_C3_C5.md` in a fresh session AFTER v6-B closes GREEN.

## Scope hint (from parent matrix)

- `scripts/validate-plan-closure.mjs` C3 section (cited-path extraction, fenced-code drop, hypothetical-section drop, manifest-fallback verifies existence+hash — B7 C3-half)
- `scripts/validate-plan-closure.mjs` C4 section:
  - Three-tier resolution (full filename / parent-aware shorthand / fail)
  - `resolveHandoffTarget` parent-aware sibling scan (use parsed parentRaw to scope readdir to plans with matching Parent field — B5 fix)
  - Structured handoff (handoff-target + handoff-topic + recipient-required-token)
  - recipient-required-token MUST be present in structured form (B4 fix)
  - bodyAfterTarget indexOf -1 guard (C4 fix — treat as missing-token FAIL not silent skip)
- `scripts/validate-plan-closure.mjs` C5 section (strict-line vs deviation axis-match)
- `scripts/test-fixtures/plan-closure/*.md` — 15+ new fixtures (good-c3, bad-c3-missing-file, bad-c3-fake-manifest-artifact, good-c3-manifest-real-artifact, bad-c3-tampered-artifact, good-c4-full-filename, good-c4-structured-token, bad-c4-phantom, bad-c4-ambiguous, bad-c4-circular, bad-c4-structured-no-token, bad-c4-shorthand-parent-mismatch, bad-c4-bodyAfterTarget-not-found, good-c5-no-deviations, bad-c5-strict-line-with-deviation)

## Defects this chunk resolves (Preservation Matrix Layer 2)

- B4 (HIGH): recipient-required-token presence enforcement in structured handoffs
- B5 (MEDIUM): C4 shorthand parent-aware sibling resolution
- B7 (HIGH, C3-half): C3 manifest-fallback verifies existence+hash (NOT just path-match) — v6-D handles layout-half
- C4 (LOW): bodyAfterTarget indexOf -1 guard

## Preservation Matrix Layer 1 rows this chunk owns

B10, B11, B12, B13, B14, V9, NV4(partial)

## PROMISE-PAIRED-TEST table (to be filled in authoring session)

| Plan-body promise | Paired self-test |
|---|---|

## Acceptance

- [ ] C3 + C4 + C5 all match plan promises.
- [ ] ≥15 fixtures + corresponding self-test assertions.
- [ ] Synthetic test: manifest claims artifact exists but file is missing → C3 FAIL.
- [ ] Synthetic test: manifest artifact hash != actual file hash → C3 FAIL.
- [ ] Synthetic test: structured handoff missing recipient-required-token → C4 FAIL post-2026-06-18 (WARN before).
- [ ] Synthetic test: shorthand SP-D resolves to sibling with DIFFERENT parent → C4 FAIL (not silent pass).
- [ ] External auditor pass returns GREEN before v6-D begins.
- [ ] Closure manifest written for this subplan.
