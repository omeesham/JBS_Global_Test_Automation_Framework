# FINAL AUDIT REPORT: Test Coverage Gap Analysis — Interaction vs Verification

> **Partial disposition 2026-06-19 (via [SUBPLAN_PRICING_FCC.md](plans/done/SUBPLAN_PRICING_FCC.md)):** Parts 1-4 (persistence / decision-table / state-transition / BVA / a11y / error-guessing gap lists for the Pricing tab) were consumed as Phase-2 gap input and addressed — the Pricing FCC pass re-enabled the persistence skips, added per-currency coverage, and deferred remaining EDGE cases to `SUBPLAN_PRICING_EDGE_P3.md`. **Part 5 (framework-wide planner-rule changes PLN-043..047, WARN→HARD-GATE) is a separate discussion-item — NOT actioned. It requires explicit user sign-off before any framework agent-rule edit (per the Pricing subplan's Out-of-scope guard). **(RESOLVED 2026-06-24 — Part-5 decision made: graduated into the Case-Generation Standard + LR-065 via SUBPLAN_CGS_A, NOT as literal PLN-043..047. See Execution Summary below.)****

**Status**: DONE
**Executed**: 2026-06-24
**Priority**: P2-CYCLE-3

## Context
**Problem**: Are our Requirements/Planner agents producing test cases that truly cover every field E2E (including save + persistence), or doing surface-level "tap and untap"?

**Method**: (1) Researched ISTQB/IEEE manual QA methodology, (2) Audited all 10 spec files across locations + local-office, (3) Deep-read planner/requirements/generator agent rules, (4) External non-repo reviewer validated findings, (5) Cross-referenced industry anti-patterns.

**Verdict**: **SYSTEMIC PROBLEM — not isolated to pricing.** The entire test suite is structurally biased toward **interaction coverage** (click + observe UI) over **verification coverage** (click + save + reload + confirm persistence). The agents have comprehensive RULES but **WARN-level enforcement** — agents self-certify compliance without external verification, leading to incomplete deliverables reaching the generator.

---

## PART 1: THE SYSTEMIC NUMBERS

### Cross-Spec Comparison (All 10 Spec Files)

| Spec File | Tests | Saves | Reloads | Round-Trip TCs | Negative TCs | Unsaved Dialog | A11y |
|-----------|-------|-------|---------|---------------|-------------|----------------|------|
| location-currency | 18 | 13 | **0** | **0** | 3 | No | No |
| location-account-address | 20 | 4 | 5 | 2 | 4 | No | No |
| location-auto-addon | 15 | 13 | 3 | 2 | 0 | Yes | No |
| location-pricing | 23 | 6 | 15 | 4 | 0 | No | No |
| location-local-information | 12 | 13 | 11 | 3 | 5 (skipped) | No | No |
| location-shared-setup | 17 | 5 | 2 | 1 | 0 | Yes | No |
| location-notes | 20 | 5 | 5 | 6 | 0 | Yes | 1 TC |
| location-legal | 14 | 5 | 15 | 4 | 0 | No | No |
| local-office-settings | 39 | 17 | 30 | **14** | 0 | Yes | No |
| local-office-ect | 11 | 7 | 7 | 3 | 1 (skipped) | No | No |
| **TOTALS** | **189** | **88** | **93** | **39** | **~13** | **4/10** | **1/10** |

### Key Ratios
- **Round-trip coverage**: 39/189 = **21%** of tests prove persistence (should be ~50%+)
- **Negative testing**: ~13/189 = **7%** (ISTQB standard: 30-40%)
- **Unsaved dialog**: 4/10 specs = **40%** (should be 100%)
- **Accessibility**: 1/10 specs = **10%** (should be 100%)
- **Worst offender**: location-currency — **13 saves, 0 reloads, 0 round-trip tests**
- **Best performer**: local-office-settings — 17 saves, 30 reloads, 14 round-trip tests

### The Anti-Pattern Name
Industry term: **"Interaction Without Verification"** (also called "Assertionless Testing Variant"). Tests click/fill/navigate and verify the UI responded, but never verify the outcome persisted server-side. Creates 100% interaction coverage, ~0% outcome verification. (Source: Codepipes Software Testing Anti-patterns)

---

## PART 2: PRICING DEEP-DIVE

### Save Count vs Field Count

| Field Category | Total Fields | Fields with Round-Trip | Gap |
|---------------|-------------|----------------------|-----|
| Checkboxes (Corporate Pricing, Price Guide Inclusive) | 2 | 1 (Price Guide) | 1 skipped (API bug) |
| Primary Pricing Dropdowns | 5 | 5 | None |
| Currency Filter | 1 | 0 (view-only, OK) | N/A |
| Grid: Is Alternative checkbox | ~25 rows | **0** | **25 fields untested** |
| Grid: Use Effective Date checkbox | ~25 rows | **0** | **25 fields untested** |
| Grid: Start Date | ~25 rows | **0** (TC-020 skipped) | **25 fields untested** |
| Grid: End Date | ~25 rows | **0** (TC-020 skipped) | **25 fields untested** |
| **TOTAL** | **~103** | **6** | **~97 with zero persistence proof** |

### Missing ISTQB Techniques

| Technique | Coverage | Details |
|-----------|----------|---------|
| **Round-Trip Test** (xUnit Patterns) | 6/103 fields | SET -> SAVE -> RELOAD -> READ -> ASSERT pattern |
| **Decision Table** | 0 TCs | Corporate Pricing x Is Alt x Use Eff Date = 5+ combo states untested |
| **State Transition** (0-switch + 1-switch) | ~3/15 transitions | Missing: Save-Failed, Navigate-Away, Tab-Switch, Dropdown-Load-Failed, Validation-Error->Fix |
| **Boundary Value Analysis** | 0 TCs | Date min/max, year rollover, leap year, Start=End |
| **Equivalence Partitioning** (invalid classes) | 0 TCs | No invalid dates, no wrong types, no empty-when-required |
| **Error Guessing** | 0 TCs | No rapid double-click, no concurrent edits, no API timeout |
| **Pairwise** (grid combinations) | 0 TCs | No multi-row Is Alt + dates combination testing |
| **Checklist-Based** (W3C a11y) | 0 TCs | No tab order, focus trap, label, error guidance testing |

### State Transition Model (What Should Exist)
```
States: [Loading] [Clean] [Dirty] [Saving] [Save-OK] [Save-Failed]
        [Validation-Error] [Navigate-Away-Prompt] [Dropdown-Load-Failed]

Transitions tested:     Clean->Dirty->Saving->Save-OK (for 6 fields only)
Transitions UNTESTED:   Loading->Dropdown-Load-Failed (screenshot shows this happens!)
                        Dirty->Navigate-Away-Prompt->Stay / ->Leave
                        Saving->Save-Failed->Retry
                        Validation-Error->Fix->Dirty
                        Dirty->Tab-Switch->??? (state preserved?)
                        Clean->Edit-to-original-value (Angular dirty tracking edge case)
```

---

## PART 3: AGENT PIPELINE GAP ANALYSIS

### Rules That Exist But Aren't Enforced

| Rule | What It Says | Pricing Compliance | Enforcement Level |
|------|-------------|-------------------|-------------------|
| **PLN-018** | Every editable field = save+persist TC | Partially (dropdowns yes, grid fields no) | Self-audit checklist (no external check) |
| **PLN-039** | FIELD INVENTORY must have testid column | **Missing entirely** (prose only, no table) | WARN gate (can advance with warning) |
| **PLN-040** | Async steps tagged [POLL] | **Zero markers** on cascade steps | WARN gate |
| **PLN-041** | MCP_VERIFICATION_LOG with save dialog docs | **Missing entirely** | WARN gate |
| **PLN-027/034** | Selector MCP verification proof | **No proof in artifacts** | Self-audit |

### The Core Enforcement Problem
1. Most critical rules use **WARN-level** gates -> warnings generated but advancement NOT blocked
2. Planner **self-certifies** compliance via checklist (PLN-009) -> no external verification
3. Generator inherits incomplete artifacts -> must re-discover selectors, dialog behavior, async patterns
4. No agent ever counts `save_operations / saveable_fields` as a coverage metric
5. No traceability matrix maps Requirements -> TCs -> Save proof

### What's Completely Missing From Agent Rules
- No rule requiring **decision-table testing** for multi-condition checkbox logic
- No rule requiring **state-transition modeling** before writing TCs
- No rule requiring **negative test ratio** (minimum % of negative TCs)
- No rule requiring **pairwise/combinatorial coverage** for grids
- PLN-031 requires **accessibility TCs** but compliance is 1/10 specs (10%) — rule exists but is not enforced
- No coverage metric comparing saves vs saveable fields

---

## PART 4: MISSING TEST CASES (Prioritized)

### P0 — Persistence Proof (Every saveable field must have round-trip)
| # | Test Case | Technique | Blocked? |
|---|-----------|-----------|----------|
| 1 | Is Alternative — check, save, reload, verify persists | Round-Trip | API bug (write + skip) |
| 2 | Use Effective Date — enable cascade, check, save, reload, verify | Round-Trip | API bug (write + skip) |
| 3 | Start Date — enter valid date, save, reload, verify | Round-Trip | API bug (= TC-020, skipped) |
| 4 | End Date — enter valid date, save, reload, verify | Round-Trip | API bug (write + skip) |
| 5 | Corporate Pricing — uncheck, save, reload, verify | Round-Trip | API bug (= TC-025, skipped) |
| 6 | Multi-field save — change dropdown + checkbox + date, save, reload, ALL persist | Round-Trip | Depends on API fix |

### P1 — Decision-Table + State-Transition
| # | Test Case | Technique |
|---|-----------|-----------|
| 7 | Decision table: all 5 checkbox combo states, verify Save + downstream behavior | Decision Table |
| 8 | Navigate away dirty -> unsaved dialog -> Stay -> form still dirty | State Transition |
| 9 | Navigate away dirty -> Leave -> return -> values reverted | State Transition |
| 10 | Tab switch (Pricing -> Currency -> Pricing) with dirty state -> preserved? | State Transition |
| 11 | Save API failure -> error displayed -> user can retry | State Transition |
| 12 | Enable cascade, don't enter dates, Save -> validation blocks | State Transition |

### P2 — Negative + Boundary
| # | Test Case | Technique |
|---|-----------|-----------|
| 13 | Start Date > End Date -> cross-field validation error | Negative / BVA |
| 14 | Start Date = End Date -> accepted or rejected? | BVA |
| 15 | Date at year boundary (Dec 31 / Jan 1) | BVA |
| 16 | Leap year date (Feb 29) | BVA |
| 17 | Each dropdown — test second option (not just TC-026-030 values) | EP |
| 18 | Select same option already selected -> dirty flag behavior | Error Guessing |

### P3 — Grid + Accessibility + Recovery
| # | Test Case | Technique |
|---|-----------|-----------|
| 19 | Grid total row count matches expected | Checklist |
| 20 | First AND last grid row default states | BVA (position) |
| 21 | Read-only columns truly non-interactive | Checklist |
| 22 | Settings gear icon behavior | Exploratory |
| 23 | Tab key navigation through grid -> logical focus order | A11y Checklist |
| 24 | Multi-row Is Alt checked + save + reload -> all persist | Pairwise |
| 25 | Dropdown load failure recovery (screenshot bug) | Error Guessing |
| 26 | Rapid double-click checkbox -> no race condition | Error Guessing |

---

## PART 5: RECOMMENDED AGENT RULE CHANGES

### New Planner Rules

**PLN-043: Persistence Coverage Mandate (HARD GATE)**
Every editable field on the page MUST have at least one TC with the Round-Trip pattern: change -> save -> reload -> verify persisted. Planner must output a PERSISTENCE MATRIX:
```
| Field | Persist TC | Status |
|-------|-----------|--------|
| Corporate Pricing | TC-025 | Skipped (API bug) |
| Price Guide Inclusive | TC-024 | Covered |
| Is Alternative (row X) | TC-NEW-001 | Skipped (API bug) |
```
If any field has no TC or no skip-with-reason, advance is BLOCKED (not WARN).

**PLN-044: Negative Test Ratio (HARD GATE)**
Minimum 20% of TCs must be tagged `[NEGATIVE]`. Planner must report: `Positive: N, Negative: M, Ratio: M/(N+M)`. Below 20% = BLOCKED.

**PLN-045: Grid Coverage Mandate**
For grid/table components: (a) assert total row count, (b) test first/last/middle rows, (c) at least one multi-row combination, (d) verify read-only columns are non-editable.

**PLN-046: Testing Technique Tags (HARD GATE)**
Every TC must be tagged with technique: `[ROUND-TRIP]`, `[DECISION-TABLE]`, `[STATE-TRANSITION]`, `[BVA]`, `[EP]`, `[ERROR-GUESSING]`, `[EXPLORATORY]`, `[CHECKLIST]`. Planner reports distribution. If `[ROUND-TRIP]`, `[NEGATIVE/EP]`, and `[STATE-TRANSITION]` each have 0 TCs = BLOCKED.

**PLN-047: State-Transition Model (MANDATORY)**
For any page with Save, planner must produce a state-transition diagram listing all states + transitions BEFORE writing TCs. Every transition must map to at least one TC (or documented skip).

### New Requirements Agent Output

**REQ-NEW-001: Field Coverage Matrix (MANDATORY)**
Requirements agent must output:
```
| Field | Type | Saveable? | Needs Round-Trip | Needs Negative | Needs BVA | Dependencies |
```
This becomes the planner's input for coverage planning.

### New Audit Checks

**AUDIT-NEW-001: Save Coverage Metric**
Count `clickSave()` calls and `reload*()` calls in spec. Compare against saveable field count from requirements. Flag if ratio < 50%.

**AUDIT-NEW-002: Technique Distribution Check**
Parse TC names/comments for technique tags. Flag if any core technique (round-trip, negative, state-transition) has 0 representation.

**AUDIT-NEW-003: Skipped Test Gap Alert**
Count skipped tests. For each skip, verify there's a documented reason AND that the cumulative coverage gap is flagged (not just the individual skip).

### Enforcement Upgrade
- Upgrade PLN-039, PLN-040, PLN-041 from **WARN** to **HARD GATE** (block advancement)
- Add external verification step: after planner self-audit, a separate check counts saves vs fields
- PLN-018 must be reworded: "Every editable field = its own **save+reload+verify TC**" (not just "save+persist TC" which the planner interprets as "interact with field")

---

## PART 6: THE DEEPER INSIGHT

### Why This Matters for the Business
The team currently has **189 test cases across 10 specs**. This looks like solid coverage. But only **39 of those 189 tests actually prove anything persists server-side** (21%). The other 150 tests verify that the UI responds to clicks — which is important for UX, but does NOT verify the business-critical question: **"Did the value actually save?"**

For a pricing settings page, the business risk isn't "did the checkbox toggle?" — it's "did the pricing change take effect in the system?" A customer could see a checkbox checked in the UI while the server silently rejected the change (which is EXACTLY what the API bug on Corporate Pricing does).

### The Framework-Level Fix
This isn't just about adding more test cases to pricing. It's about changing what the agents consider "coverage":

**Current definition**: "Field is covered if a TC interacts with it"
**Correct definition**: "Field is covered if a TC proves its value survives save + reload"

This mindset change needs to propagate through:
1. Requirements agent (field matrix with "needs round-trip" column)
2. Planner agent (persistence matrix, technique tags, state model)
3. Generator agent (verify save coverage before declaring spec complete)
4. Audit skill (save/field ratio as primary metric)

---

## VERIFICATION PLAN

1. **Immediate**: Update planner rules with PLN-043 through PLN-047
2. **Immediate**: Upgrade PLN-039/040/041 from WARN to HARD GATE
3. **Test on pricing**: Re-run planner on Pricing with new rules -> should produce ~45-50 TCs (vs current 30) with persistence matrix + technique tags + state model
4. **Compare**: New planner output should have >50% round-trip TCs, >20% negative TCs, state-transition model
5. **Validate systemically**: Run audit on all 10 existing specs with new AUDIT-NEW checks -> expect all 10 to flag gaps
6. **Fix forward**: Apply new rules to next module planned (Currency? Account & Address?) -> measure improvement from day 1

---

## Execution Summary

**Executed**: 2026-06-24 (graduated + retired by SUBPLAN_CGS_A_STANDARD_AND_SKILLS, parent PLAN_CASE_GENERATION_STANDARD).

This is an **audit-report plan**, not a TC-generation plan — it produced no specs/TCs. Its findings are graduated into permanent framework artifacts and it is retired. No TCs implemented / dropped / deferred (N/A — audit report). No MCP runs (N/A). The Part-5 open decision (the header banner: "Status stays PENDING pending that Part-5 decision") is hereby **made**: the systemic insight is graduated into the Case-Generation Standard + LR-065, **not** as literal new planner rules PLN-043..047 (that route was dropped by the `/slop` pass — see below).

### Where each Part landed

- **Parts 1–4** (the systemic interaction-vs-verification numbers, the Pricing deep-dive, the agent-pipeline gap analysis, and the prioritized missing test cases — persistence/decision-table/state-transition/BVA/EP/error-guessing/pairwise/a11y) were **already consumed** as Phase-2 gap input by [SUBPLAN_PRICING_FCC.md](plans/done/SUBPLAN_PRICING_FCC.md) (per this plan's own 2026-06-19 header banner — re-enabled persistence skips, added per-currency coverage, deferred remaining edge cases to SUBPLAN_PRICING_EDGE_P3). The *technique* behind them is now codified generically (no longer Pricing-specific):
  - The **surface/behavior families** (result-fidelity, pagination, sorting, combination, render-state, empty-vol, persistence) + the **state-transition save-flow model** (Clean→Dirty→Saving→Save-OK/Failed, navigate-away-prompt, tab-switch, validation-error→fix — Part 2's exact gap) are now Axis 2 of [`docs/read_only_docs/CASE_GENERATION_STANDARD.md`](docs/read_only_docs/CASE_GENERATION_STANDARD.md) and the Encore §3 templates in [`field-case-generation.md`](clients/encore/specs_planning/_internal/field-case-generation.md).
  - The **depth model** (L1 QUICK round-trip/must-asserts ⊂ L2/L3 DEEP pairwise/BVA/a11y/error-guessing/Tier-2) is the Standard's depth tiers, delivered by `/coverage` + `/ultracoverage`.
- **Part 5** (the recommended agent rule changes + WARN→HARD-GATE enforcement upgrade) is **adapted, not copied**. The `/slop` pass dropped minting separate planner rules PLN-043..047 + REQ-NEW-001 + AUDIT-NEW-001..003 in favor of a single structural enforcement that delivers their SPIRIT:
  - The audit's core ask — *"make behavior/persistence coverage a structural part of the generator, not a WARN-level self-cert"* — is delivered by **LR-065** (`.claude/rules/inventory.md`): a grid/list/table surface carries a `behavior-cases:<families>` disposition that **folds into the LR-062 100% walk-coverage closure gate** (Cx, NON-overridable, ramping `announce → deny`). That IS the HARD GATE Part 5 / "Enforcement Upgrade" asked for — a missing applicable surface family = `Coverage_Ratio < 100%` = closure FAIL, not a warning.
  - The four agents' `## FCC Paradigm` sections (REQUIREMENTS / PLANNER / GENERATOR / AUDIT) gained a **surface axis** so the front-line generator now SEES grid behaviors (the structural blind spot Part 3 named). No new `check:surface-parity` script — SBC TCs ride the existing `check:tc-parity`.

### Documentation changes made (this graduation)

- NEW: `docs/read_only_docs/CASE_GENERATION_STANDARD.md` (the lean two-axis Standard).
- `clients/encore/specs_planning/_internal/field-case-generation.md` — re-titled Encore instance + §3 Surface-Behavior templates.
- `.claude/rules/inventory.md` — LR-065 (surface-family mandate folds into LR-062 gate) + LR-064 Stage-1 + LR-057 no-taxonomy amendments.
- `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,AUDIT}.md` — surface axis in each `## FCC Paradigm`.
- `.claude/skills/{coverage,ultracoverage}/SKILL.md` + INDEX.md — the two delivery-tier skills.

### Not done (honest)

- Part 4's individual Pricing TCs (round-trip/decision-table/BVA/a11y/error-guessing) are **not** re-listed or re-implemented here — they live in the executed `SUBPLAN_PRICING_FCC.md` (base coverage) + the deferred `SUBPLAN_PRICING_EDGE_P3.md` (DEEP tail, now superseded-in-method by the Standard's DEEP model + `/ultracoverage`). This plan only graduates the *technique*; it does not own per-module TCs.
- The literal planner rules PLN-043..047 were intentionally NOT created (`/slop` drop, recorded above) — their enforcement is delivered structurally via LR-065/LR-062 instead.
