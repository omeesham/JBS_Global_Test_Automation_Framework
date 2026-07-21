---
title: Pre-flight legitimate-skip inventory (PLAN_DEPENDENCY_GATE_REMOVAL Phase 1.3)
date: 2026-05-08
plan: PLAN_DEPENDENCY_GATE_REMOVAL.md
purpose: Establish the count of pre-existing `test.skip` / `test.fixme` calls across the 12 dep-gate consumer specs so the post-removal acceptance check can distinguish "dep-gate cascade skip" (unwanted, must be zero) from "pre-existing legitimate skip" (out of scope, count unchanged).
acceptance_contract: Post-removal `depGateSkipped` annotations must be 0 across all 12 specs. Pre-existing `test.skip` / `test.fixme` count remains 13 (unchanged).
---

# Pre-flight skip inventory — 2026-05-08

Source: `grep -nE "test\.(skip|fixme)\(" clients/encore/tests/specs/setup/setup/{local-office,locations}/*.spec.ts`. Verified at plan execution time.

| Spec | Line | Type | Reason |
|---|---|---|---|
| `local-office-settings.spec.ts` | 774 | `test.skip` | TC-LOS-BAS-048 — Room toggle round-trip |
| `location-management-history.spec.ts` | 73 | `test.skip` | TC-LOC-MGH-006 — needs ≤20-row location |
| `location-management-history.spec.ts` | 81 | `test.skip` | TC-LOC-MGH-007 — needs zero-row location |
| `location-management-history.spec.ts` | 199 | `test.skip` | TC-LOC-MGH-019 — pagination prereq |
| `location-pricing.spec.ts` | 365 | `test.skip` | TC-LOC-PRI-020 — valid dates persist |
| `location-pricing.spec.ts` | 456 | `test.skip` | TC-LOC-PRI-025 — corporate pricing toggle |
| `location-pricing.spec.ts` | 499 | `test.skip` | TC-LOC-PRI-{value-toggle} — bidirectional persist |
| `location-shared-setup-locations.spec.ts` | 180 | `test.fixme` | SSL serial-state breaks clickAdd |
| `location-shared-setup-locations.spec.ts` | 201 | `test.fixme` | SSL same-dialog issue |
| `location-shared-setup-locations.spec.ts` | 235 | `test.fixme` | SSL Miami search returns 0 results |
| `location-shared-setup-locations.spec.ts` | 271 | `test.fixme` | (same) |
| `location-shared-setup-locations.spec.ts` | 300 | `test.fixme` | (same) |
| `location-shared-setup-locations.spec.ts` | 368 | `test.fixme` | (same) |

**Total: 13 pre-existing skips/fixmes across 4 specs.** OUT OF SCOPE for PLAN_DEPENDENCY_GATE_REMOVAL. Each has its own justification (data prereq, dialog bug, or SSL serial-state defect) and is an LR-021 candidate for separate plans.

**Acceptance carve-out**: LR-046 strict-line guard "zero `depGateSkipped` annotations" treats these 13 as expected and does NOT trip the guard.
