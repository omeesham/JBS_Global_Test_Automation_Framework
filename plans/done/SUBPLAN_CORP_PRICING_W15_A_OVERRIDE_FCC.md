# SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC — Product Group Override screen, full FCC

**Status**: DONE
**Executed**: 2026-06-09
**Priority**: P1
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_W15_0_RECON.md
**Blocks**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-1.5 (F-WV15).** Full field-coverage (FCC) of the **Product Group Override** screen (reached via "Pricing Override"), per-field-type per `field-case-generation.md`. The screen is **live but absent from the DOCX** — so per master Doctrine 2 the **live DOM is the oracle**, every test asserts observed reality, and the undocumented-screen + validation-rule divergences are RAISED (Q-WV15-1, raised by WV1.5-0) rather than encoded as assumed intent. Consumes WV1.5-0's `corporate-pricing-override-*` field-inventory + the scaffolded `corporate-pricing-override.page.ts` / selectors / `override.ts` data / Override fixture.

**Why a distinct subplan (no redundancy):** the Override screen is a **distinct node** from Search (0NN) / Strategy (1NN) / Detail (2NN). Its `Override Price` / `Max Discount %` numeric fields **reuse the numeric-BVA pattern** from the 1443 Detail FCC stub (`field-case-generation.md` numeric row), but on a different screen / fixture / TC band — reuse, not duplication.

**Activation trigger**: WV1.5-0 closed (inventory + scaffold exist).

---

## Bootstrap

**Identity**: GIVER (FCC catalog + test-cases + test-plan + XLSX) → BUILDER (selectors fill-in + spec) → HEALER (RCA if failures) → WATCHDOG (parity). Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Bug doctrine (master Doctrine 2 — applies while field-testing every case below)**: if any behavior looks suspicious or buggy (a control that won't react, a Save that silently no-ops, a field that accepts a negative/invalid value), follow the doctrine — record it as an `/encore-questions` clarification when the cause is unclear (permission-locked? interaction step missing?), or file per LR-034 once it reproduces in the runner (LR-044). Never silently absorb it; at minimum catch the bugs visible in these cases. (W15-0 modeled this — it raised Q-WV15-1 instead of false-filing.)
**Jira defect cross-ref (UNVERIFIED leads — prove each on the live site before it becomes a test expectation OR a filing, LR-044)**: check `clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md` first — it likely **answers Q-WV15-1** (Override story = NM-1463; edit flow = select Location+Currency → drag/double-click row → Override Price auto-sets Active; cells inert for the automation user is probably **RBAC read-only per NM-2126, not a bug**) and lists override defects NM-1932 (maxdisc w/o override price), NM-1961 (rows need refresh), NM-1870 (current price blank), NM-1889 (search wrong columns). External AI Jira-search output — reproduce live first, cite the `NM-#`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_W15_0_RECON.md`, the `corporate-pricing-override-*` field-inventory, `field-case-generation.md` (FCC taxonomy), `clients/encore/src/utils/field-case-runner.ts` (`saveAndVerifyCase` — MANDATORY for save-cycle FCC), `.claude/rules/{specs,angular,inventory}.md` (LR-009 revert, LR-011 NaN reload, LR-019 per-test baseline, LR-022 no hardcoded counts, LR-036 boolean).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm WV1.5-0 DONE: `corporate-pricing-override-*` inventory + `corporate-pricing-override.page.ts` + Override fixture exist. 2. **POM-shape gate** (tests/ + src/data/corporate-pricing/ + src/fixtures/ present). 3. LR scan: LR-ENC-002 (FCC parity structural), LR-009, LR-011, LR-019, LR-022, LR-036, LR-040, LR-051/052, LR-034/LR-030/LR-044 (bug doctrine). 4. `BrowserTool=cli`, `-s=cpr-override-fcc`. Mutation uses the **Override fixture** (F1) with bounded-retry `ensureDefaultState()` restore.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume WV1.5-0 baseline-absent note. `## Baseline diff` = "baseline-absent; intent oracle = live DOM (undocumented screen; intent confirmation pending Q-WV15-1)".

---

## Phase 1+ — FCC scope + seed list (full catalog on activation, from the WV1.5-0 inventory)

**Per-field-type FCC seed (grep-verifiable; exact cases authored from the live inventory — NOT invented here):**
- **Equipment / Labor tabs**: each tab renders its own grid; tab-switch preserves filters or resets (observe + assert); content per tab distinct.
- **Location selector** (left panel): select a location → grid scopes; clear/Active-only interaction (dropdown / each-option row, LR-025 if large).
- **Currency filter** (`ALL` + each option): each option narrows; `ALL` restores (dropdown row).
- **`Active only` checkbox**: toggle on→filters to active, off→restores (checkbox toggle+revert row).
- **Grid filter search** (`Filter Product Groups Override…`): BVA (min/max len), special chars, empty, whitespace, no-match (plain-text row); React controlled-input fill pattern (reuse search page's proven setter).
- **`Override Price`** (numeric): BVA 0 / negative / max / decimals / very-large / currency-format boundary; non-numeric → NaN reload guard (LR-011); revert-to-original → Save disabled (LR-009). **Reuses the 1443 numeric pattern.**
- **`Max Discount %`** (numeric): BVA 0 / negative / >100% / decimals; same NaN + revert guards.
- **`Active`** boolean column: render format MCP-verified (LR-036).
- **Save-cycle**: edit → `saveAndVerifyCase()` → reload → persisted-value assertion → restore fixture. Save dialog-gated handling reused from base.
- **Empty state** (`No results`): a filter combination yielding zero rows renders the empty state correctly.
- No hardcoded structural row counts vs the grid (LR-022) — content-anchored reads.
- TC band: `TC-LOC-CPR-5NN` (Override).

Full field-case-catalog + test-cases MD (`clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`) + test-plan (`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md`, Selector-Mapping table) + spec (`clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`, FCC two-describe shape per LR-ENC-002) + XLSX rebuild — authored on activation, all landing in the SAME change (LR-ENC-002 structural parity).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: reuses WV1.5-0 baseline-absent + override field-inventory; no net-new walk artifact)` | grep baseline artifact |
| GIVER | Override FCC test-cases + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | Override spec (FCC) | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` | `npx playwright test --list` resolves all `TC-LOC-CPR-5NN` |
| HEALER | per-fix MD sync (RCA-driven) | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` | `npm run check:tc-parity` exit 0 |
| WATCHDOG | (parity folded into WV1.5-99) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] WV1.5-0 inventory + scaffold consumed; Override FCC catalog derived from the **live inventory**, not invented.
- [ ] Per-field-type coverage: tabs, location, currency, Active-only, filter search, Override Price + Max Discount % numeric BVA, Active boolean, save-cycle, empty state — each traced to an inventory field OR labelled `[inference]`.
- [ ] Save-cycle tests use `saveAndVerifyCase()`; mutation restores the **Override fixture** (proven across re-runs, zero drift).
- [ ] No hardcoded structural counts (LR-022); LR-009 revert + LR-011 NaN guards present where applicable.
- [ ] Spec ↔ MD ↔ XLSX parity (LR-ENC-002 structural): `check:tc-parity` exit 0; workbook builds + lints clean (LR-ENC-004); suite green.

---

## Execution Summary

**Executed**: 2026-06-09

**Q-WV15-1 RESOLVED (the headline outcome).** A live Playwright-CLI walk overturned the 2026-06-08 recon's "edit-activation unresolved / possible RBAC" conclusion — it was a **false negative**. The Override grid IS editable for the automation user.

- **Edit mechanism**: click an Override Price / Max Discount `div[role=button]` cell → an active `spinbutton` reveals → native value-setter (React-controlled; `.fill()` does not commit) + `Enter` commits → Save enables. Active = Radix `checkbox` toggles + dirties (LR-036 4th render).
- **Save**: dialog-gated "Save Changes" → `POST /navigator/api/location/corporate-price-pg-override` (LR-056, never the page-URL RSC POSTs) → toast "Pricing overrides saved successfully."; `Updated By` becomes `s-prd-clickauto@psav.com` (proves edit rights). Round-trip 445→446→445 verified reversible; LR-009 net-zero verified. So this subplan delivered the **full save-cycle FCC**, not the read-only fallback.
- **TCs implemented**: **28** — `TC-LOC-CPR-501..528`, all green ×2 (individual `--workers=1 --retries=0` = 29 passed incl. auth-setup; full CPR suite = **122 passed**, 0 fail / 0 flaky; fixture restore proven no-drift across both runs).
- **Coverage**: tabs (501/502/508), location-gating (503/504), 10-col grid + Current Price + Active render (505/506/507), currency/active-only/rows-per-page filters (509/510/511), client-filter scope incl. ID+Name-only (512–516), Override Price edit/BVA/revert/non-numeric (517–522), Max Discount editable + cap-at-100 (523), Active toggle (524), save-cycle for Override Price/Max Discount/Active via `saveAndVerifyCase()` + `ensureDefaultState()` restore (525/526/527), save-dialog Cancel no-commit (528).
- **TCs dropped**: 0.
- **First-run RCA (HEALER)**: first full run was 21/28; 8 failures all root-caused + fixed (no assumptions): (1) grid selectors `:text-is`→`:has-text` (each `<th>` nests a "Resize column" button — latent scaffold bug); (2) the "Save Changes" dialog is `<div role="alertdialog">` that Playwright `getByRole('alertdialog')` does NOT match (shadow/portal a11y exclusion) → switched to the CSS `[role="alertdialog"]` selector + text buttons (dialog buttons carry no computed accessible name); (3) client filter is React-debounced → `setReactInput` + settle; (4) thousands-separator in large values → comma-strip in reads; (5) back-to-back-edit read race → read the display `[role=button]` after the editor detaches; (6) Max Discount % is **capped at 100** (>100 rejected, editor won't commit) → `tryMaxDiscount` + TC-523 asserts the real behavior.
- **Divergences raised (Doctrine 2)** in `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md`: Q-WV15-1 item 5 (edit mechanism, RESOLVED); CPR-WV15-Q3 (Max Discount capped at 100).
- **Jira defect-lead verdicts (LR-044, dated 2026-06-09)**: NM-1463 confirmed-mechanism; NM-2126 not-reproduced (RBAC negative NOT-AUTOMATABLE — single account); NM-1870 not-reproduced (Current Price renders 0.00); NM-1889 not-reproduced (filter scoped to ID+Name); NM-1675 consistent (PRE_EDGE); NM-1932 blocked-data; NM-1961 not-applicable. None filed as `BUG-*` (all not-reproduced / consistent / blocked / N/A on e2e today).
- **Artifacts (all in this change — LR-ENC-002 structural parity)**: refreshed field-inventory `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-09.md` (supersedes the recon; GAP closed); field-case-catalog `clients/encore/specs_planning/_internal/field-case-catalogs/override-2026-06-09.md`; test-cases MD + test-plan MD (full paths in the matrix above); spec `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` + page-object setters / `ensureDefaultState` / CSS-dialog handling + `ovr`-prefixed dialog selectors + numeric-case data; XLSX rebuilt (`xlsx:build` OK, `xlsx:lint` PASS); divergence draft updated.
- **Verification**: `check:tc-parity` exit 0 (all spec TCs in MD + XLSX deliverable); `typecheck` exit 0; regression-guard additive-only (removed only the unused `editCellsUnresolved` marker, 0 code refs remain).
- **Deviations from plan**: (a) the Per-Identity HUNTER row said "no net-new walk artifact" assuming the recon sufficed — a **refreshed field-inventory was emitted** because the recon's edit-mechanism claim was a false negative (LR-013: refresh when the GAP closes / drift detected); it is a GIVER artifact, not a HUNTER baseline (baseline stays absent). (b) HEALER was authored conditional/skipped — first-run failures made it active. Both deviations are justified by live evidence; no scope removed.

## Handoff

Wave-1.5 Override-screen FCC — **DONE**. Q-WV15-1 resolved (grid editable, not RBAC-blocked); 28 `TC-LOC-CPR-501..528` green ×2 (122-test CPR suite clean, no contamination); parity + workbook lint clean. Max Discount cap-at-100 + 7 Jira-lead verdicts recorded. Distinct node (5NN), reuses the 1443 numeric pattern on a separate screen/fixture. Hands off to WV1.5-99 closure (the parent master stays PENDING per F16).
