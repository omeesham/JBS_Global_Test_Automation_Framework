# SUBPLAN_CORP_PRICING_NM2270_GRID_FILTERS — Grid search effect + sort effect + Reset-to-Default + grid stress/sweep

**Status**: DONE
**Priority**: P1
**Created**: 2026-07-17
**Executed**: 2026-07-18
**Identity**: BUILDER
**Depends on**: SUBPLAN_CORP_PRICING_NM2269_OVERRIDE_FILTERS.md
**Blocks**: SUBPLAN_CORP_PRICING_NM2271_GRID_EQUIPMENT_LABOR.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

> Superseded-by-the-six: absorbs GAP_CLOSURE Phase T2270 + grid-search/sort-side compound-filter
> stress + Excel-drift/false-green sweep slice (grid-filter TCs) from SHADOW_EDGE.

---

## Context

NM-2270 covers Override grid-level filtering: the "Filter Product Groups" search box, column sorting,
and Grid Options Reset-to-Default. Existing TCs catalog these controls but do NOT assert their
effects. This plan adds effect-assertions plus absorbs the grid-search/sort-side slice of compound-
filter stress and the Excel-drift/false-green sweep slice touching grid-filter TCs from SHADOW_EDGE.

**Walk-certified data beds**: office 1105 — Filter Product Groups: type "Camlok" → 2 rows, clear → 9
restored (walk-A). Sort: dropdown menu with "Sort ascending"/"Sort descending"/"Hide column";
ASC first-cell "07A Compass Screen Set Kit", DESC "Whiteboard Supply" (walk-A). Grid Options: hide
"Max Discount %" → 9 columns, re-enable → 10 restored (walk-A). Reset to Default: present as first
menuitem (walk-A).

**Gap provenance**: RCA-MATRIX.md.

---

## Bootstrap

**Identity**: BUILDER

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/final-q`

**Context files**:
- Walk-evidence A+B (2026-07-17); RCA-MATRIX.md
- `.claude/rules/specs.md` (LR-019, LR-066, LR-067, LR-068)
- `clients/encore/CLAUDE.md` (LR-ENC-002, LR-036)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm NM2269 is done. Walk-evidence files exist.
2. Read navigation.md, agent-mistakes.md (BUILDER), patterns.md.
3. LR scan: LR-019, LR-022, LR-068, LR-ENC-002, LR-036.
4. `BrowserTool=cli`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

Consumed from walk fleet 2026-07-17. `baselineScope: baseline-absent` (net-new module).

---

## Phase 1 — Grid "Filter Product Groups" search EFFECT (BUILDER)

1. Author NEW TC: office 1105 — type "Camlok" into Filter Product Groups search box → assert 2 rows
   (matching Camlok #1 PG 1482 and Camlok #2 PG 1484); clear → assert 9 rows restored (walk-A
   certified). Assert row-count delta, not just presence.
2. LR-019 per-test baseline in `beforeEach`.

---

## Phase 2 — Column sort EFFECT (BUILDER)

1. Author NEW TC: office 1105 — click Product Group Name column header → dropdown menu appears →
   click "Sort ascending" → assert first-cell = "07A Compass Screen Set Kit"; click "Sort descending"
   → assert first-cell = "Whiteboard Supply" (walk-A certified). Sort mechanism is a dropdown menu,
   NOT a header toggle (walk finding — important for selector design).
2. Test at least one additional sortable column to confirm the mechanism is consistent.

---

## Phase 3 — Grid Options Reset to Default (BUILDER)

1. Author NEW TC: office 1105 — open Grid Options → uncheck a column (e.g. "Max Discount %") → assert
   column hidden (9 columns); open Grid Options → click "Reset to Default View" → assert default 10-
   column set restores. Walk-A certifies the hide/restore round-trip.
2. Restore server prefs after test (LR-019 cleanup).

---

## Phase 4 — Grid-search/sort compound stress + Excel-drift sweep (from SHADOW_EDGE)

1. Author NEW TC(s): apply Filter Product Groups + sort simultaneously → assert the filtered+sorted
   result is correct; reset → assert full unsorted set restores. Compound grid-filter stress.
2. Excel-drift/false-green sweep slice: verify that existing grid-filter TCs (if any from prior work)
   assert real surface behavior and are not weakened to pass green (the 11 BIG_PIVOT false-green
   patterns). Any finding = DEFECT.

---

## Phase 5 — PARKED: Office alignment (from PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT)

**PARKED** — do NOT execute until Rutvik explicitly green-lights. Migrate tests to designated offices
when triggered. 9311/2463 ZERO override data; 4104/4107/8843 thin. Provenance: Rutvik 2026-07-17.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW / APPEND with grep-verification. Bare deferral = HALT + ask.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | test-cases MD + test-plan MD + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | corporate-pricing-override.spec.ts | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` | `npx playwright test --list` resolves new TC IDs; spec run green ×2 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none — sweep findings only, no separate artifact) | (skipped: Excel-drift sweep runs inline in Phase 4; findings reported in handoff, no standalone audit artifact) | (none) |
| GARDENER | (none) | (none) | (none) |

---

## Acceptance criteria

- [ ] Grid search effect TC: "Camlok" → 2 rows, clear → 9 restored on 1105
- [ ] Column sort effect TC: ASC/DESC first-cell asserted via dropdown menu sort mechanism
- [ ] Reset-to-Default TC: column hide → Reset → default 10-column set restores
- [ ] Compound grid-filter stress TC: filter + sort simultaneously, reset restores
- [ ] Excel-drift sweep: no false-green / weakened assertion in existing grid-filter TCs
- [ ] All effect-TCs assert before/after delta (LR-068); per-test baseline (LR-019)
- [ ] MD + test-plan + XLSX parity (LR-ENC-002); `npm run check:tc-parity` exit 0
- [ ] Full override spec run green ×2; `/regression-guard` clean; activity-log; `/final-q`

---

## Verification

```bash
npx playwright test --list corporate-pricing-override   # expect: new grid TC IDs
npm run check:tc-parity                                  # expect: exit 0
```

---

## Execution Summary

**Planned**: 5 effect-assertion TCs (grid text filter, column sort ASC/DESC, Reset-to-Default, compound stress) + MD/XLSX parity + Excel-drift sweep inline.

| Deliverable | Status | Path |
|---|---|---|
| TC-CPR-OVR-045 — text filter narrows + restores, row-identity assertions | DONE | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` |
| TC-CPR-OVR-046 — Product Group Name sort ASC/DESC via dropdown, walk-certified first cells + monotonic order | DONE | same spec |
| TC-CPR-OVR-047 — second column self-verifying numeric monotonic oracle | DONE | same spec |
| TC-CPR-OVR-048 — Grid Options hide "Max Discount %" → reduced column count, Reset to Default → restored | DONE | same spec |
| TC-CPR-OVR-049 — text filter + column sort together: rows match filter AND are ordered | DONE | same spec |
| Page-object helpers: `sortColumnViaDropdown`, `getFirstRowCellText`, `getColumnCellValues` | DONE | `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` |
| Data-bed: `CORP_PRICING_OVERRIDE_SORT_BED` (sort + grid-options constants; DESC first cell = "Whiteboard Supply - Marker 4 Pk") | DONE | `clients/encore/src/data/corporate-pricing/override.ts` |
| Test-cases MD — TC-045..049 rows | DONE | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` |
| Test-plan MD — TC-045..049 scenarios | DONE | `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md` |
| XLSX rebuild — `check:tc-parity` PASS, `xlsx:build` 0 vocab hits | DONE | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` |
| Excel-drift/false-green sweep (SHADOW_EDGE Phase 4) | DONE (inline) — no false-green patterns found in existing grid-filter TCs |  |
| Phase 5 — office alignment migration | SKIPPED (parked: explicit Rutvik green-light required; 9311/2463 have zero override data, 4104/4107/8843 thin) |  |

**Verification**: spec run green ×2 (47 passed / 3 skipped / 0 failed, two consecutive clean runs with real hashed tee artifacts); all 4 commit gates PASS — `tsc` clean, `check:tc-parity` exit 0, `xlsx:build` 0 vocab hits, LR-058 `verify-no-forbidden` clean; cross-family gpt-5.5 independent review confirmed.

**Deviations**:
1. Cross-family CLARIFY probe before build caught 2 oracle gaps: column sort must use walk-certified header dropdown (not aria-sort); TC-047 needed a numeric monotonic oracle (not string comparison). Both dispositioned into the build before any code was written.
2. Build spanned 2 dispatches — attempt 1 exhausted credit cap after data-bed + 3 helpers; continuation authored TC-045..049 + parity docs.
3. Cross-family gpt-5.5 review bounced 4 defects: TC-049 title contained a banned client-deliverable word ("Compound") blocking clean XLSX rebuild; TC-047 compared numeric column as string with vacuous descending path; TC-049 never asserted rows matched the filter; TC-045 asserted count only. All 4 fixed in attempt 3.
4. CEO green×2 run went RED on TC-046/047: TC-046's DESC first-cell constant was truncated ("Whiteboard Supply" → real "Whiteboard Supply - Marker 4 Pk"); TC-047 confirmed string-vs-numeric sort defect. Both fixed in attempt 3; green ×2 clean thereafter.
5. Known out-of-scope residual (NOT part of this plan): the word "Compound" remains in TC-044's `.spec.ts` title and one describe-block title (an NM-2269 test). The MD/XLSX were scrubbed; all commit gates pass. Left untouched — touching NM-2269 artifacts is out of scope for this plan.

---

## Handoff (post-execution)

Chat-only per LR-039. Grid search, column sort, and Reset-to-Default effect-TCs + compound stress +
Excel-drift sweep for the Override module. NM2271 inherits as the next sprint ticket.
