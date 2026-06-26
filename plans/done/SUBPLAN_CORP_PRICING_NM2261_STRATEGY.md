# SUBPLAN_CORP_PRICING_NM2261_STRATEGY — Pricing Strategy /ultracoverage (NM-2261, deep)

> **⚠ SBC ID correction (2026-06-24):** surface/behavior cases use **ordinary 3-segment IDs** (`TC-CPR-<SUB>-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT** the 4-segment `-SBC-` / `-SBC-MAX-` infix this plan body references (that shape is rejected by `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) + `docs/read_only_docs/CASE_GENERATION_STANDARD.md`.

**Status**: DONE
**Executed**: 2026-06-26
**Priority**: P1
**Created**: 2026-06-24
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli

---

## Context

Jira NM-2261 — "Automate creating multiple Pricing Strategies." This subplan delivers full `/ultracoverage` of the Pricing Strategy feature at depth. It folds ALL seed work items carried by `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` (the Wave-2 stub that held S2's `(b)` multi-row FormArray / save-cycle revert / each-type / negative deferrals as grep-verifiable LR-040(b) recipients) — those items are expanded here at full design depth with no loss.

Current green baseline: `TC-CPR-STR-001..025` cover management/edit/save/add/remove on the Strategy tab. This subplan extends the TC band from `TC-CPR-STR-026..` covering multi-row FormArray, revert discipline, per-checkbox combinatorics, Jira-cross-referenced edge cases (NM-2047, NM-2059), and mutation-safe coverage design.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots on spec + test-case + XLSX)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/ultracoverage` (primary — deep case generation, TC-CPR-STR-026+)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files** (every rule + parent + reference this subplan loads):
- `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent)
- `plans/done/SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` (source stub — folded, all work items consumed here)
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` (Strategy section §C, §E6)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (multi-row FormArray row, §2 taxonomy, §3 surface families)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline-absent, LR-ENC-002 FCC parity, LR-ENC-004 Jira-first)
- `.claude/rules/angular.md` (LR-009 save-cycle revert)
- `.claude/rules/pipeline.md` (LR-040, LR-046, LR-048)
- `.claude/rules/baseline.md` (LR-045, truth hierarchy)
- `.claude/rules/inventory.md` (LR-057, LR-062, LR-064, LR-065)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)

**Anti-Assumption Gates** (binding — NM-2261 is a net-new deep coverage subplan that folds stub FCC items AND must cite Jira leads):
- [ ] Phase 0.5b baseline walk EXECUTED before any behavior classification / bug filing (Gate 1 — LR-045 / LR-ENC-001 / LR-048 §5). `baselineScope: baseline-absent` declared for Strategy (net-new surface on e2e per prior stub).
- [ ] No "corrupt / atypical / app-wide / regression" claim on <2 evidence sources (Gate 2 — LR-061).
- [ ] No control marked un-drivable without overlay-clear + reload + PO-selector-vs-live-DOM diff (Gate 3 — LR-061 / LR-021).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] Un-skip + LR-019 harden applied atomically in the same change (Gate 5 — LR-021 corollary).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block recorded (Gate 6 — LR-060).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on: none` — no predecessor to check in `plans/done/`.
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for `corporate-pricing/strategy`; pull listed findings from walk-evidence-corporate-pricing-2026-06-23.md §C instead of re-exploring.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter by OWNER / ALL-* entries; check for prior Strategy tab mistakes.
4. Read `.claude/context/patterns.md` — match multi-row FormArray + Angular save-cycle patterns to Phase 1 subtasks.
5. LR scan: LR-009 (revert-disables-Save), LR-034/LR-044 (bug doctrine), LR-040 (closure gate), LR-046 (strict lines), LR-048 (structural minimum + per-identity matrix), LR-ENC-001 (baseline-absent declaration), LR-ENC-002 (FCC parity enforcement), LR-ENC-004 (Jira-first — NM-2047, NM-2059).
6. **Browser-tool announcement**: `BrowserTool=cli`. Reason: catalog walkthrough + multi-row FormArray probe trials are deterministic input-trials under Opus orchestration per LR-064; unattended headless via `playwright-cli`; no visual/CSS assertion needed.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — REQUIRED; baseline-absent)

1. Baseline for Pricing Strategy (Strategy tab, New Pricing Strategy dialog) is **baseline-absent** per LR-ENC-001. The old-site Navigator UI (`navigator2.training.psav.com`) has no equivalent "Corporate Pricing / Strategy" tab in its `#/setup/locationdetail/` surface. Record `baselineScope: baseline-absent` in the findings.
2. Intent oracle: walk-evidence-corporate-pricing-2026-06-23.md §C (LIVE-CONFIRMED DOM evidence from 2026-06-23: "New Pricing Strategy" dialog, fields Strategy Name + Is GSO / Is Active / Is Internal / Is Productions, Cancel / Add / Close buttons, Add commits to in-session list before pricebook Save, §E6 "Save gated on ≥1 Pricing Strategy") + Jira NM-2261 + NM-2047 + NM-2059.
3. `## Baseline diff` = "baseline-absent; intent oracle = walk-evidence-corporate-pricing-2026-06-23.md §C+E6 (live DOM 2026-06-23) + NM-2261 Jira spec + NM-2047 (mutual-exclusion / IsLabor+Currency lock after create) + NM-2059 (duplicate strategy names behavior — verify live which is true before encoding as TC expectation)."
4. Jira lead cross-reference (LR-ENC-004): consult `clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md` for NM-2047 + NM-2059 prior classification before new filings. Every Jira fact is a LEAD — reproduce on live site first, then cite `NM-#` in the TC expectation.

---

## Phase 1+ — /ultracoverage deep case design (TC-CPR-STR-026..)

### 1. Source stub fold confirmation

Confirm every seed item from `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` Phase 1+ is accounted for in this subplan's Phase 1+ sections 2–8 below. No item may be re-deferred.

### 2. Multi-row FormArray — add / edit / remove / delete-all / re-add

Per `field-case-generation.md` multi-row FormArray row. The mutation-safe constraint is critical: new strategies become legacy/irreversible after Save, so the **New Pricing Strategy dialog is the only safe "create" path**; all in-session work must be abandoned (Cancel) or tested against the dialog-then-abandon flow OR against existing strategies editable in management mode.

**Mutation-safe design rule** (applies to ALL FormArray cases below):
- For TRUE create-multiple verification (Add N via dialog → verify list → Cancel pricebook, or use a dedicated pricebook fixture with a restore strategy after test). Document the fixture approach in test data (`clients/encore/src/data/corporate-pricing/`).
- For edit/remove/revert: target EXISTING strategies on a fixture pricebook via management mode (reversible edits — Strategy Name text-field edit; checkbox toggle; then revert before Save).
- Document the chosen approach in a `## Mutation-safety note` in the spec describe-block comment.

**Cases (TC band TC-CPR-STR-026..):**

- **TC-CPR-STR-026** — Multi-row add (N=2): open New Pricing Strategy dialog on a fixture pricebook → Add strategy A → dialog closes → total increments → reopen dialog → Add strategy B → total increments to 2; no Save yet; verify both names appear in list. (in-session only — cancel pricebook or use restore fixture)
- **TC-CPR-STR-027** — Multi-row add (N=3, edge): same pattern, add third strategy C; verify all 3 in list; verify Save enabled:true (LR-ENC-001 E6 evidence: Save gated on ≥1 strategy).
- **TC-CPR-STR-028** — Edit each of N strategies in sequence: on existing multi-strategy fixture, edit Strategy Name of strategy-1 → verify inline change persists in list → edit strategy-2 → verify → Save → reload → assert both new names persisted.
- **TC-CPR-STR-029** — Remove each of N strategies in sequence: fixture with 3+ strategies → remove strategy-1 → total decrements → remove strategy-2 → total decrements → Save → reload → assert removed strategies absent.
- **TC-CPR-STR-030** — Delete-all then Save: fixture with strategies → remove ALL (leave 0) → verify Save disabled:true (per E6 evidence: Save requires ≥1 strategy) → Add 1 new via dialog → verify Save enabled → Save → reload → only new strategy present.
- **TC-CPR-STR-031** — Re-add after delete-all: delete-all scenario from TC-CPR-STR-030 → immediately re-add via dialog → same Add flow → Save succeeds.

### 3. Save-cycle revert (LR-009)

Per LR-009 (angular.md): edit a field → revert to original → Save button MUST return to disabled (recovery ≠ pristine). This is a critical Angular dirty-state test — applies to the Strategy Name field on an existing strategy row.

- **TC-CPR-STR-032** — Revert-disables-Save (Strategy Name): click edit on existing strategy Name → change text → verify Save enabled:true → clear back to original value → verify Save disabled:true (dirty-state collapses on full-revert).
- **TC-CPR-STR-033** — Revert-disables-Save (checkbox): toggle Is Active on existing strategy → verify Save enabled → toggle back to original → verify Save disabled.
- **TC-CPR-STR-034** — Partial revert: edit Name AND toggle Is GSO → revert only Name → verify Save still enabled (form still dirty on Is GSO) → revert Is GSO → verify Save disabled (both reverted = pristine).

### 4. Per-checkbox / strategy-type combinatorics (Is Productions / Is Internal / Is GSO / Is Active)

Walk-evidence §C2: dialog default = Is GSO:false, Is Active:true, Is Internal:false, Is Productions:false. Every boolean field exercises the 4-state toggle grid; Jira NM-2047 flags mutual-exclusion behavior AND IsLabor/Currency lock after create — verify live before encoding as test expectation.

- **TC-CPR-STR-035** — Is Active default true: open New Pricing Strategy dialog → assert Is Active checkbox default = checked (true per walk-evidence C2).
- **TC-CPR-STR-036** — Is GSO default false: same dialog → assert Is GSO = unchecked.
- **TC-CPR-STR-037** — Is Internal default false: assert Is Internal = unchecked.
- **TC-CPR-STR-038** — Is Productions default false: assert Is Productions = unchecked.
- **TC-CPR-STR-039** — Toggle Is Active off then on: uncheck Is Active → Add → verify strategy persisted with Is Active:false on list; reopen management dialog → re-enable → Save → reload → verify Is Active:true.
- **TC-CPR-STR-040** — Is GSO toggle: check Is GSO → Add → verify Is GSO:true on list/detail.
- **TC-CPR-STR-041** — Is Internal toggle: check Is Internal → Add → verify Is Internal:true.
- **TC-CPR-STR-042** — Is Productions toggle: check Is Productions → Add → verify Is Productions:true.
- **TC-CPR-STR-043** — NM-2047 mutual-exclusion (Jira lead — VERIFY LIVE FIRST): NM-2047 flags that certain flag combinations are mutually exclusive and that IsLabor/Currency fields lock after create. Before encoding: drive the dialog live with conflicting combos (e.g. Is Internal:true + Is Productions:true); observe actual behavior (error? auto-clear? allowed?); classify as (a) behavior matches Jira = encode TC expectation per Jira, (b) behavior diverges = flag per LR-044 before filing. Test ID reserved; expectation TBD pending live verification. If mutual-exclusion confirmed: verify the mutual-exclusion constraint (attempt to check both flags → verify one auto-clears OR inline error appears).
- **TC-CPR-STR-044** — NM-2047 IsLabor/Currency lock after create (Jira lead — VERIFY LIVE FIRST): after saving a strategy, attempt to change IsLabor or Currency-related field if such exists on the strategy form; verify lock behavior. Expectation TBD pending live verification.

### 5. Negative / validation cases

- **TC-CPR-STR-045** — Empty Strategy Name blocks Add: open New Pricing Strategy dialog → leave Strategy Name blank → assert Add button disabled:true OR inline validation error "Strategy Name is required" present.
- **TC-CPR-STR-046** — Whitespace-only name blocks Add: enter `   ` (spaces only) → assert Add disabled or inline error (Angular trim-validation behavior — verify live).
- **TC-CPR-STR-047** — NM-2059 duplicate strategy name (Jira lead — VERIFY LIVE WHICH IS TRUE): NM-2059 flags that duplicate strategy names may be allowed. Verify live: Add strategy "ZZ-DUP-TEST" → Save pricebook → reopen → Add "ZZ-DUP-TEST" again → observe behavior. Classification: (a) if duplicate silently allowed = TC asserts both entries visible and no error; (b) if duplicate blocked = TC asserts inline error or Add button disabled; encode the TC expectation from live observation, not Jira assumption. TC-CPR-STR-047 expectation TBD pending live probe.
- **TC-CPR-STR-048** — Cancel discards pending strategy: open dialog → fill Strategy Name "ZZ-CANCEL-TEST" → click Cancel → verify strategy NOT in list, total unchanged.
- **TC-CPR-STR-049** — Close (X) discards pending strategy: open dialog → fill name → click Close → verify same as Cancel discard.

### 6. Save gating — ≥1 strategy required

Per walk-evidence E6 (LIVE-CONFIRMED: "Save is gated on ≥1 Pricing Strategy — discovered live: with 0 strategies Save stayed disabled").

- **TC-CPR-STR-050** — New pricebook with 0 strategies has Save disabled: navigate to `/add?type=equipment` → leave Strategy tab empty → assert Save disabled:true.
- **TC-CPR-STR-051** — Add 1 strategy enables Save: same new-pricebook flow → open "New Pricing Strategy" dialog → fill name → Add → assert Save enabled:true.
- **TC-CPR-STR-052** — Remove last strategy re-disables Save: on a pricebook with exactly 1 strategy → remove it → assert Save disabled:true.

### 7. Dialog field spec (strategy name field — field-case-generation §2 coverage)

For the Strategy Name text field (the only non-boolean field in the "New Pricing Strategy" dialog per walk-evidence C2):

- **TC-CPR-STR-053** — Max-length / long input: enter a 255-character name → Add → verify accepted (or truncation error, whichever is true — observe live).
- **TC-CPR-STR-054** — Special characters in name: enter `ZZ-Test & <Strategy> "2026"` → Add → verify strategy appears with name preserved (XSS-safe render check, Angular-safe).
- **TC-CPR-STR-055** — Strategy Name persists on page reload: add + Save → reload pricebook → verify name exactly matches input.

### 7.5 Axis-2 Surface-Family Ultracoverage (Case-Generation Standard — the 7 families)

> **Why this phase exists:** the field/FCC cases above (Axis 1) cover one control at a time. The
> [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md) Axis 2 (7 active surface
> families) covers behaviors that live *between* cells — result-fidelity, pagination, sorting, combination,
> render-state, empty/volume, persistence — which a field-only generator structurally cannot produce (the exact
> gap LR-065 closes). Apply only families whose **trigger** holds on the live surface; record an inapplicable
> family as `out-of-scope:<family>=<reason ≥20 chars>` per LR-065. The execution walk confirms each trigger live
> (LR-064 TDW Stage-1 grid→§3 classification). **These dispositions FOLD INTO the LR-062 100% completeness gate** —
> a surface with no `behavior-cases:` disposition is undispositioned = closure-gate Cx FAIL. SBC TCs are ordinary
> TCs — they ride `check:tc-parity`; no separate surface-parity script. Encore oracles per
> `field-case-generation.md` §3. QUICK = `TC-CPR-STR-SBC-*` (L1 must-assert, ≥1 per applicable family); DEEP =
> `TC-CPR-STR-SBC-MAX-*` (L2/L3 exhaustive). The per-page `-SBC-` infix is the Encore realization of the
> Standard's `TC-<MOD>-SBC-*`.

The Strategy surface is a FormArray-managed in-session list (not a virtualized query grid), so render-state + empty-vol + persistence apply; result-fidelity / pagination / sorting / combination are trigger-gated and (per walk-evidence §C) out-of-scope unless the execution walk finds the control.

| Family | Trigger | QUICK (`-SBC-`) must-assert | DEEP (`-SBC-MAX-`) exhaustive | Encore oracle |
|---|---|---|---|---|
| render-state | strategy-list rows render boolean cols (Is GSO / Is Active / Is Internal / Is Productions) | one boolean col on a saved strategy row reads per its render format | every boolean col per its format on the SAVED list (distinct from the §4 dialog-checkbox field cases — this is how the persisted list renders the booleans); any strategy-name link navigates if present | **LR-036 boolean render differs per table** — verify the strategy list's format (Unicode `✔` / SVG `lucide-check` / Radix `aria-checked`) before asserting |
| empty-vol | 0 strategies (Save disabled) / 1 / N | the 0-strategy state renders + Save disabled (promotes §6) ; a 1-row list renders | 0 / 1 / N strategies; empty-state message verbatim if any | §6 evidence: Save gated on ≥1 strategy; small managed list (not virtualized) |
| persistence | FormArray dirty + save-cycle | a strategy edit survives reload (promotes §2 TC-CPR-STR-028) | dirty survives Strategy↔Detail tab-switch; navigate-away-dirty "Unsaved changes" alertdialog fires; LR-009 revert→Save-disabled (promotes §3); the state-transition save-flow model (Clean→Dirty→Saving→Save-OK/Failed) | "Unsaved changes" alertdialog on full nav-away; LR-009 revert≠pristine; LR-026 defensive reload |

**Out-of-scope dispositions (LR-065 token — reason ≥20 chars; the execution walk confirms the trigger truly does not hold before accepting these):**
- `out-of-scope:result-fidelity=the Strategy list is a small in-session managed list with no filter/search/query affordance in walk-evidence §C; no result-set-vs-query oracle exists (promote only if the walk finds a query control)`
- `out-of-scope:pagination=the Strategy list is a small managed list with no rows-per-page control; it does not paginate (confirm absence at the execution walk)`
- `out-of-scope:sorting=no sortable column header is observed on the Strategy list in walk-evidence §C; there is no per-column order to flip (confirm at walk)`
- `out-of-scope:combination=the combination family requires ≥2 of filter/sort/paginate to coexist, none of which are present on the Strategy list surface`

**Disposition rule:** at execution, every Strategy-list element carries a `behavior-cases:<families>` disposition (LR-065) — either the covered family list (each ≥1 QUICK SBC TC) or an `out-of-scope:<family>=<reason>` token. A surface element left with neither DENIES closure (LR-062 Cx). The DEEP `-SBC-MAX-` band is authored to full exhaustion per the Standard L2/L3 (this is `/ultracoverage`, not QUICK-only).

### 8. TC catalog + MD + test-plan + spec authoring

After verifying TC content via live probes (Phases 2–7 above):

1. **GIVER artifacts**: append TC-CPR-STR-026..055 (or final range after live gaps) to `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_strategy_test_cases.md` with full Description / Preconditions / Steps / Expected Result / Priority columns; add Scenarios to `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_strategy_test_plan.md`; run `npm run xlsx:build` to rebuild `clients/encore/test_cases_xlsx/encore_test_cases.xlsx`.
2. **BUILDER artifacts**: implement all non-fixme TCs as `describe('TC-CPR-STR-026..', ...)` blocks in `clients/encore/tests/corporate-pricing/corporate-pricing-strategy.spec.ts`; for any Jira-lead TC whose live expectation is still TBD, author as `test.fixme('TC-CPR-STR-04X: NM-XXXX live expectation TBD')`.
3. **Run**: `npx playwright test clients/encore/tests/corporate-pricing/corporate-pricing-strategy.spec.ts --retries=0`; fix failures max 2 cycles per TC; escalate persistent failures to HEALER.
4. **Parity gate**: `npm run check:tc-parity` must exit 0 before Status flip.

### 9. Bug doctrine (master Doctrine 2 — live throughout all above phases)

Any behavior that looks suspicious or buggy while probing the above cases (a dialog button that won't react, a Save that silently no-ops, a mutual-exclusion that misbehaves, a validation that passes invalid input):
- Unclear cause (permission-locked? interaction step missing?) → record as `/encore-questions` clarification item per Q-WV15-1 precedent.
- Reproduces in runner → file per LR-034/LR-044 (BUG-*.json, `baselineComparison: baseline-absent`, `baselineEvidence: walk-evidence-corporate-pricing-2026-06-23.md §C`).
- Never silently absorb a suspicious behavior. Minimum: catch it in the bug evidence trail.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phase 1+ that is OWNER-owned + same file/module + 5–30 min + no user input needed, pick exactly one:

- **DO-NOW** — execute before Phase 3 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan with grep-verifiable line item; verify with `grep -F "<the line>" plans/pending/<file>` before continuing.

Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline (Strategy surface) | `(skipped: baseline-absent per LR-ENC-001 — Strategy tab is net-new on e2e; no old-site equivalent; declared in Phase 0.5b)` | grep `baselineScope: baseline-absent` in this file |
| GIVER | test-cases MD + test-plan MD + XLSX workbook | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_strategy_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_strategy_test_plan.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec file + page objects + test data | `clients/encore/tests/corporate-pricing/corporate-pricing-strategy.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-strategy.page.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts`<br>`clients/encore/src/data/corporate-pricing/strategy.ts` | `npx playwright test --list` resolves all new TC-CPR-STR-026.. IDs |
| HEALER | (none — healing only on persistent spec failures during Phase 1+ §8 execution) | `(none)` | n/a |
| WATCHDOG | (none — no neutral-eye audit in scope; WATCHDOG reads this subplan's deliverables in a separate audit pass) | `(none)` | n/a |
| GARDENER | (none — no structural refactor in scope) | `(none)` | n/a |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] All fold items from `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` Phase 1+ seed list accounted for: multi-row FormArray (TC-CPR-STR-026..031), save-cycle revert (TC-CPR-STR-032..034), per-checkbox combinatorics (TC-CPR-STR-035..044), negative/validation (TC-CPR-STR-045..049), save gating (TC-CPR-STR-050..052), field spec (TC-CPR-STR-053..055).
- [ ] Jira leads NM-2047 and NM-2059 verified live before encoding as TC expectations; each TC that depends on a Jira lead carries a `test.fixme` until live behavior is confirmed; no phantom expectation.
- [ ] `npm run check:tc-parity` exit 0 — all TC-CPR-STR-026.. IDs in MD ↔ XLSX ↔ spec with no orphans.
- [ ] `npm run xlsx:lint` (or equivalent) passes — XLSX workbook structurally valid.
- [ ] `npm run typecheck` clean on `clients/encore/`.
- [ ] Spec suite run ×2 green: `npx playwright test clients/encore/tests/corporate-pricing/corporate-pricing-strategy.spec.ts --retries=0` passes on two sequential runs.
- [ ] **Axis-2 surface families dispositioned (LR-065 → LR-062 Cx)**: the Strategy list carries a `behavior-cases:` disposition for all 7 families — render-state + empty-vol + persistence each ≥1 QUICK `TC-CPR-STR-SBC-*` + full DEEP `TC-CPR-STR-SBC-MAX-*`; result-fidelity + pagination + sorting + combination each an `out-of-scope:<family>=<reason ≥20 chars>` token. No surface element left undispositioned.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files (spec, test-cases MD, test-plan MD, XLSX).
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] Do-or-die WATCHDOG audit pass: adversarial review of spec + MD parity; no ghost-deliverable cells in Per-Identity matrix; no TC with unexplained `test.fixme` (every fixme must cite its live-expectation-TBD Jira lead).
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042 — every cross-check has `ran '<cmd>' → output: '<snippet>'` format.

---

## Verification

```bash
# TC parity: MD ↔ XLSX ↔ spec all agree on TC-CPR-STR range
npm run check:tc-parity  # expect: exit 0

# Strategy spec list — all new IDs resolve
npx playwright test --list --grep "TC-CPR-STR-02[6-9]|TC-CPR-STR-0[3-5]" clients/encore/tests/corporate-pricing/corporate-pricing-strategy.spec.ts  # expect: ≥1 TC listed per ID

# Typecheck
npm run typecheck  # expect: exit 0, 0 errors

# Suite green (×2)
npx playwright test clients/encore/tests/corporate-pricing/corporate-pricing-strategy.spec.ts --retries=0  # expect: all non-fixme tests passed
```

---

## Execution Summary

**Executed**: 2026-06-26

### TCs implemented (38 net-new; full Strategy band now 63, all live)
- **Multi-row FormArray (in-session)** `TC-CPR-STR-026..029` — multi-add N=2 / N=3, multi-row independent edit, remove-each-in-sequence.
- **Delete-all / re-add (no-commit New-Pricebook)** `TC-CPR-STR-030,031`.
- **Save-cycle revert (recovery ≠ pristine)** `TC-CPR-STR-032..034` — name revert, flag revert, partial revert.
- **Flag combinatorics + defaults + mutual-exclusion** `TC-CPR-STR-035..044` — dialog flag defaults, dialog-flag-carries-to-new-strategy, NM-2047 mutual-exclusion (editor + dialog), Type/Currency read-only-after-create.
- **Negative / validation** `TC-CPR-STR-045..049` — empty/whitespace blocks Add, duplicate-name blocked (inline error), Cancel/Close discard.
- **Save gating ≥1 strategy (no-commit New-Pricebook)** `TC-CPR-STR-050..052`.
- **Dialog field spec** `TC-CPR-STR-053..055` — maxlength=100, special-chars preserved, special-char name round-trips across save+reload.
- **Surface-Behavior Cases (SBC)** `TC-CPR-STR-056..063` — render-state / empty-vol / persistence / result-fidelity (each QUICK + DEEP). Out-of-scope dispositions recorded for pagination, sorting, combination (reasons ≥20 chars).

### TCs dropped / deferred
- **0 dropped.** Every planned item (plan §2–§7.5 + the folded `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2` seed list) is implemented as a live-verified assertion.
- **0 fixmes.** The plan reserved `test.fixme` for TBD Jira leads (NM-2047, NM-2059); the live walk RESOLVED both, so every case is a real assertion.
- **Automation boundary (documented, not dropped)**: persisting a NEW strategy to the database is irreversible (no UI delete; no disposable pricebook fixture). The create-multiple mechanics are fully covered in-session (reload discards) + reachability via the no-commit New-Pricebook gate; only the irreversible DB-commit of a brand-new strategy is out of automation scope.

### Live verification (Playwright CLI, office 1604, pricebook 2022-NP Tier 1) — all Jira leads resolved
1. **NM-2047 mutual-exclusion** — Is Productions checked → Is Internal + Is GSO disabled, in BOTH editor and dialog → TC-043.
2. **NM-2047 labor/currency lock** — the strategy form exposes no labor/currency control; Type + Currency are read-only header reference fields → TC-044.
3. **NM-2059 duplicate names** — BLOCKED with inline error "A pricing strategy with this name already exists." This CONTRADICTS the NM-2059 lead ("duplicates allowed"); the app correctly enforces uniqueness (lead stale/already-fixed) → TC-047.
4. **Dialog** — Strategy Name maxlength=100 (not 255); empty/whitespace → Add disabled; special chars preserved; flag defaults Is Active:true / others:false.
5. **Revert** — name/flag revert-to-original disables Save (net-zero) → TC-032/033/034.
6. **Persistence** — dirty survives Strategy↔Detail sub-tab switch (silent); full nav-away raises the "Unsaved changes" alertdialog (Stay/Discard) + native beforeunload → TC-061.
7. **Render** — editor flags render as Radix `aria-checked` (nested check img); the strategy LIST has NO boolean columns (corrects the plan's premise) → TC-056/057.
8. **Search filter** — "Search strategies…" filters the list client-side (Total reflects the filtered count) → result-fidelity promoted IN-SCOPE (corrects the plan's out-of-scope assumption) → TC-062/063.

### Documentation + artifacts
- Test-cases MD (Total 63) + a 2026-06-26 live-verification table + test-plan Scenarios + Coverage Index.
- XLSX deliverable rebuilt (corporate_pricing_strategy sheet = 63 rows; vocab lint PASS; NM-#### kept out of customer-facing Title/Expected columns).
- Page objects: strategy (+dialog/editor/list/nav helpers, hardened `saveAndConfirm`, `hasLocationsTable`), new-pricebook (+`removeStrategy`); data (+`deep`).
- Navigation §C registry row added; agent-mistakes `ALL-092` (volatile-data + transient-toast test-robustness).

### Test pass confirmation (2026-06-26)
- `npm run check:tc-parity` → exit 0 (63 MD ↔ 63 XLSX ↔ 63 spec; 0 orphan).
- `npm run typecheck` → exit 0.
- Full Strategy spec (63 TCs) **green ×2 sequential** — RUN1 64 passed (9.2m), RUN2 64 passed (9.3m), `--workers=1 --retries=0` (the +1 = the auth setup project).

### Deviations (plan-deviation log)
1. **SBC IDs** — used 3-segment `TC-CPR-STR-NNN` + `**Surface_Family**:` line (per the plan-header SBC correction + LR-065), NOT the plan-body `-SBC-` infix (which fails `check-tc-parity` G6).
2. **result-fidelity promoted in-scope** — the plan declared it out-of-scope ("no search affordance"); the live walk found a working "Search strategies…" filter, so promoting it is the honest disposition (LR-062/LR-065).
3. **2 pre-existing tests fixed (TC-013, TC-024)** — they went red in the ×2 full run from runtime-state drift (TC-013 volatile location-assignments now empty; TC-024 transient toast race), not from this work; re-coupled to structure / deterministic signals (`ALL-092`). Not new coverage.
4. **Plan-body stale paths corrected** — the plan cited flat `corporate-pricing-test-cases.md` paths; the real files live at `setup/corporate-pricing/corporate_pricing_strategy_*`. Per-Identity matrix + §8 + context-file citations corrected.
5. **No separate field-case-catalog** — the SBC dispositions live in the test-cases MD per the plan §7.5 / LR-065 design (catalog not in the Per-Identity matrix scope).

### Audit
Fresh-context do-or-die WATCHDOG audit verdict: substantively sound (38 real app-coupled tests; parity green; mutation-safe + structurally enforced; zero shipped jargon; zero NM-leak in the customer-facing XLSX; TC-047 dup-block correct; TC-024 non-vacuous). One HIGH closure-hygiene defect (Per-Identity matrix ghost paths) — FIXED before this flip; one MEDIUM (LR-028 activity-log row — landed at closure); one LOW (TC-024 OR-form, within LR-051's documented-race exception).

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. Describes outcomes per LR-039 (no obstacle claims; never name a specific failure mode in this section).

This subplan delivers full `/ultracoverage` of the Pricing Strategy feature for NM-2261: TC-CPR-STR-026 through the final band member implemented in MD + XLSX + spec, all parity gates green, per-identity matrix fully closed. The folded stub `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` is superseded — all its seed items are absorbed at full depth here. The next subplan in the chain inherits a green Strategy spec suite, an up-to-date XLSX workbook, and confirmed live behavior on the two Jira leads (NM-2047 mutual-exclusion, NM-2059 duplicate-name policy).
