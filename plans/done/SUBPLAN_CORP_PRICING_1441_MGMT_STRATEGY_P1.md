# SUBPLAN_CORP_PRICING_1441_MGMT_STRATEGY_P1 — Pricebook Management / Pricing Strategy P1 (GIVER → BUILDER → HEALER → WATCHDOG)

**Status**: DONE
**Executed**: 2026-06-05
**Priority**: P1
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_00_FOUNDATION.md
**Blocks**: SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

P1 (DOCX-functional) coverage for **Pricebook Management → Pricing Strategy tab** (NM-1441) at `/settings/corporate-pricing/details/<pricebookId>` (route confirmed live, D4). Header + strategy CRUD + location mapping + dirty/clean/Save. Seeds from the 25 XLSX helpers (`TC-ENC-PRC-1441-*`), verified on live DOM, re-IDed to the `TC-LOC-CPR-1NN` (Strategy band). **Page has 0 data-testids** — text/role/content-anchored selectors only. Strategy edit/add/remove **mutates** — runs against the **`strategyFixture`** pricebook from S0 (F1 — a DISTINCT record from S3's `detailFixture`, so parallel `cpr-mgmt`/`cpr-detail` runs never collide) with bounded-retry restore. **Tabs (F2b/D5): cover the DOCX 3-tab intent (Strategy/Detail/History), assert the live 2 tabs, and RAISE History-absent as an `/encore-questions` clarification** — the DOCX itself labels History "(Placeholder) NM-1444", so live-absent is expected-not-yet-built, NOT silently dropped; the History tab's own behavior is the gated `SUBPLAN_CORP_PRICING_1444_HISTORY.md` stub.

---

## Bootstrap

**Identity**: GIVER (Phase 1) → BUILDER (Phase 2) → HEALER (Phase 3, conditional) → WATCHDOG (Phase 4). Clean re-load at each switch.

**Skills auto-called**: `/identity`, `/regression-guard` (wrap Phase 2), `/relevant`, `/rca` (Phase 3 if failures), `/final-q`.

**Context files**:
- `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_00_FOUNDATION.md`
- `.claude/rules/inventory.md`, `.claude/rules/specs.md`, `.claude/rules/angular.md` (dirty-state/save-race, LR-009/026), `.claude/rules/browser-tool.md`, `.claude/rules/data.md`
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/003, LR-012 save dialog, LR-017, LR-036)
- `clients/encore/specs_planning/_internal/field-case-generation.md`, `field-inventory-spec.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm S0 DONE. 2. Read navigation.md §C, agent-mistakes.md, patterns.md (Angular save→tab race pattern). 3. LR scan: LR-009 (revert-disables-Save), LR-012 (save dialog — verify, Details page has its own `Save`), LR-026 (dirty defensive reload), LR-036, LR-051/052/053. 4. **Browser-tool**: `BrowserTool=cli`, `-s=cpr-mgmt` on `clients/encore/.auth/encore-state.json`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — output drives TC corrections)

1. Consume S0 `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md` (baseline-absent, ≤14d). `## Baseline diff` = "baseline-absent; intent oracle = DOCX NM-1441".

---

## Phase 1 — GIVER: field-inventory + test cases (live)

1. **Field-inventory walk** (`-s=cpr-mgmt`) on the `strategyFixture` details route → emit `field-inventories/corporate-pricing-strategy-<MCP-DATE>.md`: header fields (Name, LABOR/EQUIPMENT, Year, Currency, Active/Inactive) — record whether they are editable; DOCX says "reference" (line 138), so "read-only" is an INFERENCE to MCP-verify, not a DOCX-stated fact (F6); tabs (record live Strategy + Detail; cover the DOCX 3-tab intent and raise History-absent as a clarification per F2b/D5 — do NOT merely assert "absent"); strategy list + columns (Pricing Strategy, Is Productions, Is Internal, Is GSO, Is Active) — boolean render per LR-036; "Locations Using Pricing As Default" mapping (LOCAL OFFICE / NAME); Add New affordance; per-strategy Remove visibility; Save button + whether it uses the shared dialog or direct (LR-012, MCP-verify).
2. **Verify the 25 XLSX 1441 helpers** vs live; resolve assumptions (isNew Remove logic; dirty indicator mechanism).
3. **Author P1 functional cases** (`TC-LOC-CPR-1NN`): entry from search link → details route; header shows all 5 fields; **header non-editable [inference from DOCX "reference" line 138 — labeled as inference, MCP-confirmed, F6]**; tabs — assert Strategy default + Detail present, assert History live-absent AND file the DOCX-3-tab-intent divergence via `/encore-questions` (F2b — not a silent drop); strategy select loads details + locations; **edit existing strategy → Save persists** (`strategyFixture` + restore); **Add New → row appended, isNew shows Remove**; legacy strategy hides Remove; **Remove new strategy before commit**; dirty on edit/add, clean after Save; Save batch + feedback + resets dirty. (Strategy multi-row FCC BVA/negative/each-type/delete-all → P2, deferred (b) to the existing stub `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md`.)
4. Write `corporate_pricing_strategy_test_cases.md` + `corporate_pricing_strategy_test_plan.md` (Selector Mapping) under `setup/corporate-pricing/`; P1 catalog slice; `npm run planner:post-complete` → `check:tc-parity` exit 0.

---

## Phase 2 — BUILDER: selectors + page object + specs (identity switch)

> Re-load BUILDER. Spot-check 2–3 fields (LR-007). `/regression-guard` BEFORE.

1. `src/selectors/corporate-pricing/strategy.ts` (+ `details.ts` shared header) — text/role/content-anchored (0 testids). Register in module `index.ts`.
2. `src/pages/corporate-pricing/corporate-pricing-strategy.page.ts extends CorporatePricingBasePage` — `gotoDetails(office, pricebookId)`, `getHeaderField(name)`, `getTabs()`, `selectStrategy(name)`, `getStrategyColumns()`, `getStrategyLocations()`, `addStrategy(...)`, `removeStrategy(name)`, `isRemoveVisible(name)`, `isDirty()`, `saveAndConfirm()` (throws on failure), `ensureDefaultState()` (bounded-retry restore of the fixture pricebook's strategy set per the field-case-runner contract).
3. `src/data/testdata/corporate-pricing/strategy.data.ts` — `strategyFixture` pricebook id/name (from S0 common.data — the Strategy-only fixture, DISTINCT from `detailFixture`, F1), expected header values, strategy columns, a safe new-strategy payload, baseline strategy set for restore.
4. `specs/corporate-pricing/corporate-pricing-strategy.spec.ts` — `@corporate-pricing @strategy`; per-test baseline reset via `ensureDefaultState()` (LR-019); mutation tests restore in cleanup. No fixed waits (LR-052); Angular save→tab race handled (clickTab dismisses Unsaved dialog).
5. `typecheck` clean → `npx playwright test --list` (from `clients/encore/`, F4) resolves IDs → run spec alone (`npm test -- corporate-pricing-strategy` — filename filter, F5; `.env.local`) → `check:tc-parity` exit 0. `/regression-guard` AFTER.

---

## Phase 3 — HEALER: RCA + fix (conditional, 2-cycle)

1. Artifact-first `/rca` (LR-024); CLI headed walk; watch the Angular save-button-disabled≠pristine race (`feedback_angular_save_dirty_race.md`) and dirty defensive reload (LR-026). Surgical fix; MD status sync (HARD STOP #6); re-run `--retries=0`. Max 2 cycles → escalate.

---

## Phase 4 — WATCHDOG: structural audit + parity (identity switch)

1. `check:tc-parity` exit 0; `--list` resolves IDs; verify mutation tests truly restore (no fixture drift across runs); LR-051/052/053 scan; false-green check. Findings → Execution Summary.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Same-module adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline/REQUIREMENTS freshness | `(skipped: reused S0 clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md per LR-013 14-day window; net-new baseline-absent)` | grep baseline artifact |
| GIVER | test-cases.md, test-plan.md, XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_strategy_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_strategy_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec, page object, selectors, data | `clients/encore/specs/corporate-pricing/corporate-pricing-strategy.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-strategy.page.ts` | `npx playwright test --list` resolves strategy IDs |
| HEALER | per-fix MD status sync (if RCA-driven) | `(skipped: HEALER engages only on first-run failures; surgical spec edits with in-place MD status sync, no separate artifact)` | `npm run check:tc-parity` exit 0 |
| WATCHDOG | structural audit + restore integrity | `(skipped: parity + restore-integrity + structural scan run inline Phase 4, evidence in Execution Summary; master neutral-eye in S4)` | `npm run check:tc-parity` exit 0 |
| GARDENER | (none) — dedup in S4 | `(none)` | n/a |

---

## Acceptance criteria

- [ ] Field-inventory emitted (8 keys + 7 sections; DOCX 3-tab intent covered + History-absent raised as `/encore-questions` clarification per F2b/D5 — not silently dropped; header read-only labeled as inference per F6; save-dialog behavior MCP-verified per LR-012).
- [ ] All 25 XLSX 1441 helpers verified/corrected/dropped; isNew/dirty assumptions resolved on live DOM.
- [ ] P1 cases automated; mutation tests restore the `strategyFixture` (distinct from `detailFixture`, F1; no cross-run drift); every taxonomy item classified (a)/(b)/(c) per LR-040 (multi-row FCC → (b) to existing stub `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md`).
- [ ] `check:tc-parity` exit 0; spec alone green; suite green.
- [ ] `/regression-guard` clean; activity-log row (LR-028); `/final-q` block (LR-042).

---

## Verification

```bash
npm test -- corporate-pricing-strategy      # filename filter (F5); all P1 strategy TCs pass (.env.local)
npm run check:tc-parity                      # expect: exit 0
npm test -- corporate-pricing-strategy       # re-run: still green (proves strategyFixture restore)
```

---

## Handoff

Management/Strategy (1441) P1 green with fixture restore proven. S4 inherits for suite+parity. Wave-2 FCC (strategy multi-row) inherits the field-inventory + (b)-deferred list.

---

## Execution Summary

**Executed**: 2026-06-05 (OWNER, GIVER+BUILDER+HEALER+WATCHDOG disciplines applied; corporate-pricing artifacts written under OWNER per the S0 §2 precedent — OWNER short-circuits the pipeline-identity write-gate per LR-043).

**Seed provenance**: the two authoring inputs (`jira_pricing_test_cases.xlsx` 25 NM-1441 helpers + `Pricing-Functional Details-JIRA STORIES 1.docx` intent oracle) were not committed at session start; the user placed them at `clients/encore/docs/` (agent-only, gitignored). Extracted: DOCX NM-1441 §1–§4 + the 25 helpers (`TC-ENC-PRC-1441-001..025`).

**TCs implemented (25 of 25, `TC-LOC-CPR-101..125`)** — all automated + GREEN (25/25, three runs incl. one full-suite run, fixture restore proven `Total: 1`). 1:1 spec↔MD parity (grep-verified, 0 spec-IDs-missing-from-MD). Helper map: helper NNN → `TC-LOC-CPR-(100+NNN)`; **0 dropped**, 6 corrected to live reality.

**Live walk (Playwright CLI `-s=cpr-mgmt`, strategyFixture `2022-NP Tier 1` GUID `5f2a4088…`)** — field-inventory `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-strategy-2026-06-05.md` (8 frontmatter keys + 7 sections, SP-AAE-02-valid). Key live findings:
1. **Header = 5 read-only paragraphs** (Name h2 / Type=Equipment / Year=2022 / Currency=USD / Active) — resolves the helper-007 `[ASSUMPTION]` (reference-only confirmed).
2. **Live = 2 tabs** (Pricing Strategy + Pricing Detail); **History (NM-1444) ABSENT** — DOCX 3-tab intent covered + raised as clarification (CPR-STRAT-Q1), gated to `SUBPLAN_CORP_PRICING_1444_HISTORY.md`. (helper-008/011 corrected.)
3. **Add New is dialog-gated** — "+" opens a "New Pricing Strategy" modal (Strategy Name + 4 flags + Add/Cancel/Close), then "Add" appends an isNew row. Corrects helper-015's implied inline append (clarification CPR-STRAT-Q2).
4. **isNew Remove logic confirmed** — new rows carry a nested Remove icon; legacy "2022-NP Tier 1" has none (live add-then-remove probe, no Save → fully reversible).
5. **Dirty indicator = the page-level Save button's enabled state** (no separate badge) — resolves helper-020 `[ASSUMPTION]`.
6. **`Is Internal` + `Is GSO` checkboxes disabled** on this fixture (each-flag interdependency → FCC-P2, clarification CPR-STRAT-Q3).

**HEALER (1 cycle, artifact-first RCA per LR-024)** — first full run 23/25; TC-114/124/125 failed. Root cause (TC-125 failure DOM snapshot): the Save button text flips `Save → "Saving..." → Save` during commit, so the `text-is("Save")` disable-wait mismatched mid-save and burned ~15s/save → 30s test-timeout. The save itself succeeded (toast `"Pricebook saved successfully"`). Fix: `saveAndConfirm()` now uses that toast as the success/settle signal (returns `{toastSeen}`); TC-124 asserts the toast; TC-125 polls `toBeDisabled` after settle; `test.setTimeout(60_000)` on the 4 live-save tests. Re-run → 4/4 green; full suite → **25/25 green**.

**Mutation safety (LR-019)** — save-cycle TCs (114/123/124/125) mutate via a REVERSIBLE existing-strategy name edit (rename → save → rename back); `ensureDefaultState()` bounded-retry restore. Add/Remove TCs (115/116/118/122) discard WITHOUT saving. **Live constraint discovered**: a *saved* new strategy becomes legacy and loses its Remove control → not UI-reversible; so full new-strategy persistence is deferred (b) to `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` with a disposable fixture. `ensureDefaultState` THROWS on `Total>1` (loud drift detection). No fixture drift across 3 runs.

**Artifacts (BUILDER):** selectors `src/selectors/corporate-pricing/strategy.ts` (hardened) + `details.ts` (+`lblHeaderType`); page object `src/pages/corporate-pricing/corporate-pricing-strategy.page.ts extends CorporatePricingBasePage`; data `src/data/testdata/corporate-pricing/strategy.data.ts`; fixture `corporatePricingStrategyPage` wired in `src/infra/fixtures.ts`; spec `specs/corporate-pricing/corporate-pricing-strategy.spec.ts`. GIVER: `corporate_pricing_strategy_test_cases.md` + `corporate_pricing_strategy_test_plan.md` (client cells scrubbed of NM-/DOCX/internal jargon per LR-ENC-004 — internal ledger/clarifications retain traceability). `to-csv.ts` TAB_MAP `CPR` entry attempted (reverted by a concurrent session editing the shared file — non-fatal cosmetic warning → S4).

**Verification:** typecheck clean for all corporate-pricing files (the 77 root-`tsc` errors are pre-existing in the DEPRECATED `scripts/build-framework-vendor.ts`, git-unmodified, tracked by `PLAN_ROOT_CLIENT_DEDUPE.md`); `npx playwright test --list` resolves all 25 IDs; `npm test -- corporate-pricing-strategy` → 25/25 green ×runs; LR-051/052/053/003 scan clean.

**Acceptance status (LR-040 classification):**
- Field-inventory + 8keys/7sections + History-clarification + header-read-only-inference + save-dialog MCP-verified → **(a) met**.
- 25 helpers verified/corrected/dropped + isNew/dirty resolved → **(a) met** (ledger in test-cases MD).
- P1 cases automated + mutation restore (distinct fixture) + taxonomy classified → **(a) met**; multi-row FCC → **(b)** `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` (grep-verified pending).
- `check:tc-parity exit 0` — **my rows (a) met**: spec↔MD 1:1 + lint-clean. **Global** xlsx:build/parity is blocked by S1's 2 concurrent vocab hits (`corporate_pricing_search` TC-012/016) and is the master-delegated **(b)** gate of `SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md` (grep-verified — covers parity ×9). The full consolidated suite + global parity run there after S1/S3 land.
- `/regression-guard` clean (additions only; intra-module collision check passed in the green run); activity-log row (LR-028); `/final-q` (LR-042).

**Deviations (per `feedback_plan_deviations_log`):**
1. Identity: artifacts under OWNER (S0 precedent; §2 mirror has no corporate-pricing GIVER/BUILDER rows — OWNER short-circuit sanctioned).
2. Save-persistence of a NEW strategy is not UI-reversible on the shared fixture → save-cycle TCs use a reversible existing-strategy edit; full new-strategy persist deferred (b) to FCC-P2.
3. `saveAndConfirm` settle signal = success toast (not Save-button state) — the button text flips mid-save (live finding; would have flaked any text-anchored disable-wait).
4. Global parity/xlsx-build not run-green this session (blocked by concurrent S1 vocab hits) → master-delegated to S4; my rows proven parity-clean independently.
