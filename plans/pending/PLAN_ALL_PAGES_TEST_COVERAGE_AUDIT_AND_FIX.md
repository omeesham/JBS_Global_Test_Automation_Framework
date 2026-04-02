# PLAN: Per-Page Coverage Audit Plans — Remaining Specs

## Context
**Problem**: Systemic test coverage gap across all specs — only 21% of 188 tests prove persistence via round-trip (save->reload->verify). Tests verify "the UI responded to my click" (interaction coverage) but not "the value actually saved" (verification coverage).

**What this plan does**: Queue up the remaining 9 specs that each need their OWN dedicated coverage audit plan, following the same depth and structure used for pricing. Each audit produces a plan in `plans/pending/` — no code changes, just planning.

**What this plan does NOT do**: Execute fixes, update agent rules, or touch pricing (already done separately in PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md).

---

## Specs Needing Their Own Audit Plan

Ordered by coverage weakness (worst first). Each gets its own `PLAN_{NAME}_TEST_COVERAGE_AUDIT_AND_FIX.md`.

| # | Spec | Tests | Saves | Reloads | Round-Trip % | Priority |
|---|------|-------|-------|---------|-------------|----------|
| 1 | location-currency | 18 | 13 | **0** | **0%** | **P0** |
| 2 | location-shared-setup-locations | 17 | 5 | 2 | **6%** | **P0** |
| 3 | location-account-address | 20 | 4 | 5 | **10%** | **P0** |
| 4 | location-auto-addon | 15 | 13 | 3 | **13%** | **P1** |
| 5 | location-local-information | 12 | 13 | 11 | **25%** | **P2** |
| 6 | local-office-ect | 11 | 7 | 7 | **27%** | **P2** |
| 7 | location-legal | 14 | 5 | 15 | **29%** | **P2** |
| 8 | location-notes | 19 | 4 | 5 | **32%** | **P2** |
| 9 | local-office-settings | 39 | 17 | 30 | **36%** | **P3** |

---

## What Each Audit Plan Must Cover

Every `PLAN_COVERAGE_AUDIT_{NAME}.md` must have these 6 sections:

### Section 1: Page Inventory
- Screenshot the live page via MCP
- Count EVERY interactive element: checkboxes, dropdowns, text fields, date fields, buttons, grid rows, toggles
- Document each element: name, type, saveable?, current test coverage

### Section 2: Save Count vs Field Count
- Count `clickSave()` calls in the spec
- Count `reload*()` calls in the spec
- Count fields with full round-trip (save -> reload -> verify)
- Calculate: `round_trip_fields / total_saveable_fields` = persistence coverage %
- **Target**: >50% round-trip coverage

### Section 3: ISTQB Technique Audit
For each technique, count how many TCs currently apply it:

| Technique | Count | Target | Gap |
|-----------|-------|--------|-----|
| Round-Trip (save->reload->verify) | ? | 1 per saveable field | ? |
| Decision Table (checkbox/toggle combos) | ? | 1 per multi-condition interaction | ? |
| State Transition (dirty/save/error/navigate-away) | ? | All states + transitions | ? |
| Boundary Value Analysis (min/max/edge) | ? | Every constrained field | ? |
| Equivalence Partitioning (valid+invalid classes) | ? | Every field type | ? |
| Error Guessing (race conditions, API failures) | ? | At least 2-3 per page | ? |
| Checklist-Based (W3C a11y, keyboard, focus) | ? | Tab order + labels + errors | ? |

**Target**: At least 3 of 7 techniques represented. 0 in any core technique (round-trip, negative, state-transition) = hard gap.

### Section 4: State-Transition Model
- Map all page states: Loading, Clean, Dirty, Saving, Save-OK, Save-Failed, Validation-Error, Navigate-Away-Prompt
- Map all transitions between states
- Mark which transitions are tested vs untested

### Section 5: Missing Test Cases (Prioritized)
- **P0**: Persistence proof for every saveable field (even if skipped due to API bug)
- **P1**: Decision-table for dependencies + state-transition for save/cancel/navigate-away
- **P2**: Negative + boundary for every constrained field
- **P3**: Grid/table coverage + accessibility + recovery paths

Each missing TC listed with: ID, description, ISTQB technique tag, blocked status.
Tags: `[ROUND-TRIP]`, `[DECISION-TABLE]`, `[STATE-TRANSITION]`, `[BVA]`, `[EP]`, `[ERROR-GUESSING]`, `[CHECKLIST]`

### Section 6: Page-Specific Findings
- Any live bugs observed (like pricing's "Failed to load dropdown data" toast)
- API bugs blocking test coverage (like pricing's 500 on Corporate Pricing save)
- Angular/framework quirks specific to this page
- Unique UI elements not seen on other pages

---

## How To Create Each Audit Plan

When ready to plan a specific page:

1. **Read the spec file** — count saves, reloads, round-trips, negatives
2. **Read the page object** — understand what methods exist, what's missing
3. **Read the selectors file** — understand what elements are mapped
4. **Screenshot the live page via MCP** — count every field on screen
5. **Compare** field count vs test count vs save count
6. **Apply the 6-section template** above
7. **Save** as `plans/pending/PLAN_{PAGE_NAME}_TEST_COVERAGE_AUDIT_AND_FIX.md`

**Output is a plan only** — no code changes, no spec edits. Execution is always a separate step.

---

## Execution Order

```
Phase 1 (P0 — worst coverage, plan first):
  PLAN_CURRENCY_TEST_COVERAGE_AUDIT_AND_FIX.md
  PLAN_SHARED_SETUP_TEST_COVERAGE_AUDIT_AND_FIX.md
  PLAN_ACCOUNT_ADDRESS_TEST_COVERAGE_AUDIT_AND_FIX.md

Phase 2 (P1 — recently touched, shallow):
  PLAN_AUTO_ADDON_TEST_COVERAGE_AUDIT_AND_FIX.md

Phase 3 (P2 — moderate coverage):
  PLAN_LOCAL_INFORMATION_TEST_COVERAGE_AUDIT_AND_FIX.md
  PLAN_ECT_TEST_COVERAGE_AUDIT_AND_FIX.md
  PLAN_LEGAL_TEST_COVERAGE_AUDIT_AND_FIX.md
  PLAN_NOTES_TEST_COVERAGE_AUDIT_AND_FIX.md

Phase 4 (P3 — already decent, audit for completeness):
  PLAN_LOCAL_OFFICE_SETTINGS_TEST_COVERAGE_AUDIT_AND_FIX.md
```

---

## Success Criteria (Per Audit Plan)

An audit plan is complete when it documents:
- [ ] Every saveable field identified with round-trip TC (or documented skip + reason)
- [ ] Negative test ratio calculated (current vs target 20%)
- [ ] State-transition model with all transitions mapped to TCs or gaps
- [ ] Decision table for any multi-condition logic (checkbox dependencies, cascades)
- [ ] At least 1 a11y gap identified (keyboard tab order, focus, labels)
- [ ] Unsaved-changes dialog coverage documented (tested or gap)
- [ ] Grid/table row count + coverage documented (if applicable)
- [ ] Technique distribution: at least 3 of 7 techniques assessed

---

## Reference Numbers (For When Agent Rules Are Updated)
- Next PLN: PLN-048 (PLN-043 through PLN-047 added by pricing audit; PLN-042 was last pre-existing)
- Next ALL: ALL-059 (ALL-058 is last existing)
- Next REQ: REQ-017 (REQ-016 is last existing)
- Next LR: LR-020 (LR-019 is last existing)
