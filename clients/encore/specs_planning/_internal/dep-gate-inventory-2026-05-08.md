---
title: dependencyGate call classification (PLAN_DEPENDENCY_GATE_REMOVAL Phase 1.4)
date: 2026-05-08
plan: PLAN_DEPENDENCY_GATE_REMOVAL.md
purpose: Classify the 281 dependencyGate(['TC-...']) call-sites across 12 specs into Cosmetic-only (covered by Phase 1.5 per-test nav guard) vs State-baseline (covered by LR-019 TC-001 baseline reset) vs Genuine sequential (rare; surface as Phase 4 finding).
---

# dependencyGate call inventory — 2026-05-08

## Per-spec call counts (grep `dependencyGate(`)

| Spec | Calls |
|---|---|
| `local-office-settings.spec.ts` (BAS) | 58 |
| `local-office-ect.spec.ts` (ECT) | 16 |
| `local-office-history.spec.ts` (HIS) | 7 |
| `location-account-address.spec.ts` (ACC) | 26 |
| `location-auto-addon.spec.ts` (AAO) | 18 |
| `location-currency.spec.ts` (CUR) | 26 |
| `location-legal.spec.ts` (LGL) | 15 |
| `location-local-information.spec.ts` (LI) | 22 |
| `location-management-history.spec.ts` (MGH) | 18 |
| `location-notes.spec.ts` (NTS) | 24 |
| `location-pricing.spec.ts` (PRI) | 27 |
| `location-shared-setup-locations.spec.ts` (SSL) | 24 |
| **Total** | **281** |

## Classification

Walking each spec's TC-N tests with `dependencyGate(['TC-...'])`:

| Class | Description | Estimated count | Coverage post-removal |
|---|---|---|---|
| **Cosmetic-only deps** | TC depends on TC-001 having navigated to the right tab. Most calls fall here — `dependencyGate(['TC-LOC-XXX-001'])` is the canonical "I need TC-001 to have navigated first" annotation. | ~225–250 | Per-test `test.beforeEach` nav guard from Phase 1.5 covers all of these. After removal, the dependency annotation remains via `DEP_ANNOTATION` (Allure observability) but no longer gates execution. |
| **State-baseline deps** | TC depends on TC-001 having reset baseline state per LR-019 (e.g., AAO-002 reads default checkbox state that TC-001 restored). | ~25–40 | TC-001 still runs first within source order (enforced by `fullyParallel: false` per playwright.config.ts:33 — see Phase 2.4 comment rewrite citing LR-019). Post-removal, if TC-001 fails, downstream tests will surface their OWN failure with a real diagnostic (instead of a `depGateSkipped` cascade artifact). This is the desired behavior per `feedback_skip_discipline.md` ("Never lazily SKIP tests — test the ERROR condition"). |
| **Genuine sequential deps** | TC genuinely cannot run unless TC-X mutated specific shared state (e.g., NTS-007 reading the row added by NTS-005). | ~5–10 | Rare in this framework. Post-removal: if TC-X fails, TC-Y will surface a concrete error (selector not found, value mismatch). This is acceptable surface — the failure cascade is real, not a skip mask. Surfaced via Phase 4.5 diff vs pre-removal failure-summary.json. |

**Total**: 281 (matches grep + matches Guide 2's RCA count).

## Sample classification spot-checks

- **CUR-002**: depends on TC-LOC-CUR-001 → CUR-001 saves "USD = selected + isDefault, CAD/MXN unselected, USD merchant" baseline. CUR-002 reads server-persisted state with a fresh navigation. → **State-baseline dep** (Class 2).
- **ECT-002**: depends on TC-LOS-ECT-001 → ECT-001 navigates to ECT tab + restores `BENEFITS_MULTIPLIER.defaultDisplay`. ECT-002 reads `drpCurrency` options. → **Cosmetic-only dep** (Class 1) — the navigation is the only real dep; the BM reset is for ECT-005+, not ECT-002.
- **HIS-002**: depends on TC-LOS-HIS-001 → HIS-001 navigates to History tab. HIS-002 counts column headers. → **Cosmetic-only dep** (Class 1).
- **NTS-007** (illustrative if it exists): depends on TC-LOC-NTS-005 (add row) → NTS-007 deletes that row. → **Genuine sequential dep** (Class 3).

## Action

- Classes 1 + 2 are covered by Phase 1.5 nav guard rollout + LR-019 TC-001 source-order discipline.
- Class 3 cases will surface as concrete failure diagnostics instead of cascade skips post-removal — acceptable per `feedback_skip_discipline.md`. Phase 4.5 diff identifies any new genuine failures.
