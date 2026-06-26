# SUBPLAN_CORP_PRICING_NM2263_NEW_PRICEBOOKS — NM-2263: Automate create new price books + update existing (Equipment + Labor full ultracoverage)

> **⚠ SBC ID correction (2026-06-24):** surface/behavior cases use **ordinary 3-segment IDs** (`TC-CPR-<SUB>-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT** the 4-segment `-SBC-` / `-SBC-MAX-` infix this plan body references (that shape is rejected by `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) + `docs/read_only_docs/CASE_GENERATION_STANDARD.md`.

**Status**: PENDING
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

Deliverable for [NM-2263](https://encore.atlassian.net/browse/NM-2263) — "Automate create new price books (+ update existing price books)". The DONE subplan `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` (closed 2026-06-09) landed `TC-LOC-CPR-301..330` covering the Equipment create flow with 30 green TCs. This subplan EXTENDS — never duplicates — that work: TC band `TC-CPR-NPB-025+` (renaming convention carried from the NM-2263 Jira deliverable context) adds Labor create route FCC, update-existing pricebook flow, drag-add positive-control (create mode, real pointer-sequence — banning `.dragTo()`), two carried-forward validation leads (NM-2022, NM-2057 confirm-or-file), `New ▾` Equipment + Labor menu-item click coverage, and CPR-1440-Q1..Q5 divergence carry-forward where relevant.

Folds three source subplans (SOURCE A: drag-add positive-control + create-mode add coverage from `SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION.md`; SOURCE B: NM-2022 + NM-2057 validation leads from `SUBPLAN_CORP_PRICING_EDGE_P3.md`; SOURCE C: `New ▾` Equipment + Labor dropdown click from `SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md`). Live truth sourced from `walk-evidence-corporate-pricing-2026-06-23.md` (E1–E6: 3707-item catalog, both double-click and drag proven in create mode; B10: `New ▾` Equipment Pricing / Labor Pricing menuitems confirmed).

---

## Bootstrap

**Identity**: OWNER (multi-identity span: BUILDER primary, GIVER catalog, HEALER conditional; OWNER short-circuits §2 per LR-043)

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/ultracoverage` (Phase 1 — full case-generation per NM-2263 scope)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files** (every rule + parent + reference this subplan loads):
- `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent)
- `plans/pending/SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION.md` (SOURCE A — drag-add positive-control, create-mode add-path coverage)
- `plans/pending/SUBPLAN_CORP_PRICING_EDGE_P3.md` (SOURCE B — NM-2022 + NM-2057 validation leads)
- `plans/pending/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE C — `New ▾` dropdown click)
- `plans/done/SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` (CONTEXT only — DONE Equipment create flow, TC-CPR-NPB-001..024 [TC-LOC-CPR-301..330]; no-commit pattern; do not duplicate)
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` (live DOM truth — sections E, B)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§2 field-type case taxonomy, §3 surface families)
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/003/004, LR-012/017/036)
- `.claude/rules/specs.md` (LR-019 per-test baseline, LR-061 extended positive-control)
- `.claude/rules/angular.md` (LR-009 net-zero dirty)
- `.claude/rules/inventory.md` (LR-062, LR-064 TDW, LR-057, LR-065)
- `.claude/rules/baseline.md` (LR-045, LR-034 bug filing)
- `.claude/rules/browser-tool.md` (LR-038 v2, LR-054)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)

**Anti-Assumption Gates** (binding):
- [ ] Phase 0.5b baseline-absent declared (LR-ENC-001 — New-Pricebook create is net-new on e2e; walks already executed 2026-06-09 and 2026-06-23) — NOT a HALT.
- [ ] No control marked un-drivable without overlay-clear + reload + PO-selector-vs-live-DOM diff + DOM-inspect (Gate 3 — LR-061).
- [ ] Drag-add positive-control proven in create mode with real pointer-sequence (NEVER `.dragTo()`) BEFORE asserting any add-path behavior (Gate 3 extended — SOURCE A).
- [ ] NM-2022 + NM-2057 reproduced live before filing; file per LR-034 only if confirmed on e2e (Gate 2 — LR-044).
- [ ] Un-skip + LR-019 harden applied atomically in the same change (Gate 5 — LR-021 corollary).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block recorded — no silent PENDING checkpoint (Gate 6 — LR-060).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on: none`; all blocking precedents (SOURCE A/B/C) are referenced-not-awaited.
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for Corporate Pricing / New-Pricebook surface; consume `walk-evidence-corporate-pricing-2026-06-23.md` rows E1–E6 + B10 as the live truth (do not re-walk unless stale — LR-013 14-day gate; 2026-06-23 is within 14 days of 2026-06-24).
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter by OWNER/BUILDER/GIVER/HEALER prefix (drag false-negatives, toolbar-io staleness, React dirty-state, setReactInput patterns).
4. Read `.claude/context/patterns.md` — match drag-add, React-native-setter, no-commit create patterns.
5. LR scan — active rules for this subplan's work: LR-019, LR-061, LR-009, LR-034, LR-044, LR-ENC-001, LR-ENC-002, LR-017, LR-036, LR-062, LR-057, LR-038, LR-054.
6. **Browser-tool announcement** (LR-038 v2): `BrowserTool=cli`. Reason: functional spec authoring + positive-control drag verification, unattended; CLI is the correct tier for this task class. No visual-CSS bug, no fresh-auth flow, no live-RCA requiring HEADED.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

`baselineScope: baseline-absent` — New-Pricebook create is a net-new flow on cloudapps-e2e.encoreglobal.com with no equivalent on navigator2.training.psav.com. Per LR-ENC-001, this is NOT a HALT.

Live truth consumed from `walk-evidence-corporate-pricing-2026-06-23.md` (2026-06-23, within 14-day window per LR-013):
- **E1–E6** (New-Pricebook create-mode): header fields (Pricebook name / Type / Price Year / Currency), Pricing Strategy tab + Pricing Detail tab; catalog = **3707 draggable Equipment products** (`[draggable=true][role=button]`); empty-state hint = *"No items added yet — Double-click or drag product groups from the sidebar"*; double-click ADD proven (0→1); drag ADD proven (1→2 — both add mechanisms confirmed); Save reachable when name + year + currency set + ≥1 strategy + ≥1 product group.
- **B10** (`New ▾` menu): click `New` → 2 menuitems **Equipment Pricing / Labor Pricing** (route `/add?type=equipment|labor`) — LIVE-CONFIRMED.

## Baseline diff
All New-Pricebook behavior is `(c) baseline-absent` (net-new feature on the new site; no old-site counterpart). No regression-from-baseline possible. Bug doctrine (Doctrine 2) applies throughout: suspicious behavior → `/encore-questions` or LR-034 filing per LR-044.

---

## Phase 1 — GIVER: Labor create route FCC + update-existing catalog

**1.1 Labor create-route FCC (mirror Equipment NPB, TC-CPR-NPB-025+)**

Walk `…/add?type=labor` live (playwright-cli, `-s=cpr-npb-labor`). The Equipment create flow is in `TC-LOC-CPR-301..330` — Labor is a separate route with potentially different field defaults and a different product-group catalog (~547 Labor products, per 1440 Execution Summary). Author FCC for Labor independently:

- Header defaults: Type = "Labor" (disabled, route-fixed), Price Year (blank), Currency (USD), Pricebook Name (blank).
- Strategy tab: same "New Pricing Strategy" dialog as Equipment (C1–C5 walk-evidence confirmed: Strategy Name + 4 checkboxes; Add/Cancel/Close).
- Detail tab: Labor catalog source list (≈547 draggable Labor products); empty-state hint identical to Equipment.
- Save gating: ≥1 strategy required (confirmed from Equipment walk — CPR-1440-Q5); verify for Labor route.
- FCC scope: Name mandatory (Save blocked if empty), Price Year required (assert required state), Currency defaults to USD, Labor catalog size assertion, Strategy add (same dialog), Save reachability (NO-COMMIT — Save enabled:true asserted then Cancel/abandon; create is irreversible per CPR-1440-Q4).
- TC band: `TC-CPR-NPB-025..` (continue from done 1440's TC-LOC-CPR-330; re-sequence per XLSX/MD parity gate).

**1.2 Update-existing pricebook flow (management mode)**

A created pricebook lands at `/details/<guid>` — the Details page in management mode. Walk an existing pricebook fixture (reuse done subplan's `91acb5ca` fixture or a fresh one confirmed via `playwright-cli`). Cover:

- Navigate to Details via Search (click a row from the 593-item search grid).
- Strategy tab: "New Pricing Strategy" dialog behavior in management mode (walk-evidence C1–C5 confirmed: same dialog as create-mode; C3: parity confirmed).
- Detail (Pricing Detail) tab: edit New Price / Max Discount inline (keyboard edit — D3 walk-evidence confirms trusted-keyboard fires React dirty; native-setter does NOT trip dirty); Save flow.
- Save gate: Save button enabled:false on clean load → enabled:true after inline edit → "Save Changes" dialog → confirm → assert persist on reload.
- NO-COMMIT consideration: management-mode edits ARE reversible (reload discards unsaved; navigate-away beforeunload guard confirmed). Specs may assert Save-reachable + persist (not irreversible). Document fixture, restore via reload if needed.

**1.2b Axis-2 Surface-Family Ultracoverage (Case-Generation Standard — the 7 families)**

> **Why this phase exists:** the field/FCC cases above (Axis 1) cover one control at a time. The
> [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md) Axis 2 (7 active surface
> families) covers behaviors that live *between* cells — result-fidelity, pagination, sorting, combination,
> render-state, empty/volume, persistence — which a field-only generator structurally cannot produce (the exact
> gap LR-065 closes). Apply only families whose **trigger** holds on the live surface; record an inapplicable
> family as `out-of-scope:<family>=<reason ≥20 chars>` per LR-065. The execution walk confirms each trigger live
> (LR-064 TDW Stage-1 grid→§3 classification). **These dispositions FOLD INTO the LR-062 100% completeness gate** —
> a grid with no `behavior-cases:` disposition is undispositioned = closure-gate Cx FAIL. SBC TCs are ordinary TCs —
> they ride `check:tc-parity`; no separate surface-parity script. Encore oracles per `field-case-generation.md` §3.
> QUICK = `TC-CPR-NPB-SBC-*` (L1 must-assert, ≥1 per applicable family); DEEP = `TC-CPR-NPB-SBC-MAX-*` (L2/L3
> exhaustive). The per-page `-SBC-` infix is the Encore realization of the Standard's `TC-<MOD>-SBC-*`.

render-state + empty-vol + persistence apply to the New-Pricebook flow; result-fidelity / pagination / sorting / combination are trigger-gated (promote only if the execution walk finds the control).

| Family | Trigger | QUICK (`-SBC-`) must-assert | DEEP (`-SBC-MAX-`) exhaustive | Encore oracle |
|---|---|---|---|---|
| render-state | pricebook-list link cells + create-grid cells + currency | a pricebook-name link navigates to Detail; the create-grid New Price / Override cells render currency-format | **EVERY pricebook link-cell navigates** (a non-link where a link is expected = *potential* bug → RCA → classify, **never blind auto-file** — the "purple pricebook links" check, on the pricebook list reached via Search); currency badge USD; any boolean (Is Active) per LR-036 | **LR-036 boolean render differs per table**; the pricebook-link render check is the key net-new coverage |
| empty-vol | create-mode empty-state + 3707 Eq / ~547 Labor catalog | empty-state hint "No items added yet — Double-click or drag product groups from the sidebar" reads verbatim (promotes walk-evidence E-rows); a 1-product grid renders | 0 / 1 / N product groups; catalog virtualization integrity (off-screen rows readable by content anchor); 3707 Eq / ~547 Labor volume stress | virtualized catalog — content-anchored reads, **never a strict count** (LR-022) |
| persistence | create dirty (beforeunload) + update save-cycle | a saved update survives reload (promotes Phase 1.2) | create-mode dirty survives Strategy↔Detail tab-switch + beforeunload discard (CPR-1440-Q4 no-commit); update revert→Save-disabled (LR-009) | beforeunload guard confirmed (walk-evidence E-rows); LR-009 revert≠pristine; NO-COMMIT discipline (create is UI-irreversible) |

**Out-of-scope dispositions (LR-065 token — reason ≥20 chars; the execution walk confirms the trigger truly does not hold before accepting these):**
- `out-of-scope:result-fidelity=the product-group catalog filter (if present) returns products — promote to a QUICK SBC TC only if the execution walk finds a catalog search/filter control; absent one, there is no result-set-vs-query surface`
- `out-of-scope:pagination=the source catalog is virtualized and the created product-group grid is small, with no rows-per-page control on either (confirm absence at the execution walk)`
- `out-of-scope:sorting=no sortable column header is observed on the create-grid or catalog; there is no per-column order to flip (confirm at the execution walk)`
- `out-of-scope:combination=the combination family requires ≥2 of filter/sort/paginate to coexist, which the create flow does not expose`

**Disposition rule:** at execution, every New-Pricebook grid/catalog element carries a `behavior-cases:<families>` disposition (LR-065) — covered families (each ≥1 QUICK SBC TC) or an `out-of-scope:<family>=<reason>` token. An element left with neither DENIES closure (LR-062 Cx). The DEEP `-SBC-MAX-` band is authored to full exhaustion per the Standard L2/L3 (this is `/ultracoverage`, not QUICK-only).

**1.3 Sync test-cases MD + test-plan**

Author new TC rows (`TC-CPR-NPB-025..`) in:
- `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md`
- `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_new_pricebook_test_plan.md`

Rebuild XLSX (`npm run xlsx:build` or `planner:post-complete`). Run `npm run check:tc-parity` exit 0.

---

## Phase 2 — BUILDER: create-mode drag-add positive-control + spec extension

**2.1 Real full-pointer-sequence drag helper (SOURCE A fold — banning `.dragTo()`)**

The existing `SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION.md` (SOURCE A) mandates a robust drag helper using a real full-pointer-sequence — `mouse.move` → `down` → several intermediate `move`s → `up`, OR native `dragstart/dragover/drop` with populated `dataTransfer`. `.dragTo()` is BANNED (it is a Playwright primitive that frequently fails to fire React/HTML5 DnD events — the false-negative RCA from SOURCE A). Implement in `corporate-pricing-new-pricebook.page.ts`.

**Positive-control requirement (Gate 3 — extended LR-061):** prove the drag helper DOES add a product group in **create mode** (walk-evidence E5 confirms this is expected) BEFORE writing any management-mode drag assertion. The create-mode positive-control is the live proof the primitive fires.

**2.2 Create-mode add-path coverage (SOURCE A fold)**

Fold the SOURCE A create-mode positive-control add-path coverage into this subplan's spec:
- `drag-add → lands at bottom of grid → edit New Price (keyboard) → Max Discount (keyboard) → Save reachable → NO-COMMIT (assert Save enabled:true, then Cancel/abandon)`.
- `double-click add → same path`.
- Both add mechanisms proven live (walk-evidence E4 + E5 — LIVE-CONFIRMED).
- LR-009: net-zero dirty guard (no stale React state left in the page between tests).
- LR-019: per-test baseline before every mutation-capable test.

**2.3 `New ▾` Equipment + Labor menu-item click (SOURCE C fold)**

SOURCE C (`SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` Phase 2 item 2) mandates:
- `New ▾`: click Equipment + Labor menu items via real dropdown interaction (NOT by URL navigation).
- Walk-evidence B10 confirms: click `New` → 2 menuitems **Equipment Pricing / Labor Pricing**.
- Spec: navigate to Search, click `New` button to open the dropdown, assert Equipment Pricing menuitem present, click it → assert URL becomes `…/add?type=equipment`. Reset. Repeat for Labor Pricing → `…/add?type=labor`.
- These TCs belong in this subplan (not the toolbar spec) because the destination page is the New-Pricebook create flow.

**2.4 Update-existing spec coverage**

Wire the management-mode update cases from Phase 1.2 into `corporate-pricing-new-pricebook.spec.ts` (or a sibling `corporate-pricing-update-pricebook.spec.ts` if the describe block grows too large — author the minimal file that keeps `--list` resolve counts clean).

**2.5 Carry-forward CPR-1440-Q1..Q5 divergences where relevant**

From the done 1440 Execution Summary, Q1–Q5 are:
- Q1: Type disabled/route-fixed (not an in-page dropdown) — already encoded in the done spec.
- Q2: No strategy "Type" field in the dialog — already encoded.
- Q3: Price Year accepts decimal/short values client-side — relevant to Year FCC; Labor spec should assert same leniency OR confirm it differs.
- Q4: No UI delete/deactivate for a created pricebook (UI-irreversible) — NO-COMMIT discipline applies to both Equipment + Labor routes.
- Q5: ≥1 strategy required to Save — verify the same gate applies on the Labor route.

---

## Phase 3 — HEALER: first-run RCA (conditional)

On any first-run red: artifact-first RCA (read `failure-summary.json` → no guess-patch); every fix cites raw evidence from the artifact. Extended LR-061: positive-control required before any "control un-drivable" assertion. `.dragTo()` is forbidden as a fallback.

---

## Phase 4 — BUILDER + GIVER: NM-2022 + NM-2057 validation confirms (SOURCE B fold)

SOURCE B (`SUBPLAN_CORP_PRICING_EDGE_P3.md` §New-Pricebook validation seed) carries two Jira leads — reproduce LIVE before any TC or bug filing (LR-044 Step 1: follow steps verbatim on a fresh page):

**NM-2022 — name uniqueness should be name+strategy, not name alone**
- Reproduce: attempt to Save two pricebooks with the same Pricebook Name but different Strategy Names.
- If same-name+different-strategy is ACCEPTED → NM-2022 is confirmed (uniqueness is name-only, should be name+strategy) → file `BUG-CPR-NPB-NM2022` per LR-034 (`baselineComparison: baseline-absent`, `baselineEvidence: NM-2022 Jira intent`). Author a TC asserting the confirmed behavior.
- If uniqueness is already name+strategy → NM-2022 does not reproduce → mark NOT-REPRODUCED in the activity log; no bug filing; author TC asserting name+strategy uniqueness as expected behavior.
- NO-COMMIT: duplicate-pricebook creation is UI-irreversible (Q4) — use NO-COMMIT discipline (assert Save-enabled, then Cancel; OR if a second save is required to prove the validation, discard both via reload before navigation).

**NM-2057 — Price Year required but no indicator / Save silently disabled**
- Reproduce: attempt to Save with Price Year field empty (other fields valid + ≥1 strategy).
- Observe: is Price Year required? Does the Save button disable silently (no inline error / no asterisk / no required indicator)? Is there any validation message?
- If Save silently disables with no indicator → NM-2057 confirmed → file `BUG-CPR-NPB-NM2057` per LR-034. Author a TC for the silent-disable behavior.
- If a required indicator or inline error IS present → NM-2057 does not reproduce on the current build → mark NOT-REPRODUCED; author TC asserting required-with-indicator (expected, correct behavior).
- Note: walk-evidence E6 confirms Save reachable when year set → year is required; the question is whether the UI communicates this correctly.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phase 1+ that is (OWNER/BUILDER scope) + (same files) + (5–30 min) + (no user input needed), pick exactly one:

- **DO-NOW** — execute before Phase 3 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan to add a grep-verifiable line item; verify with `grep -F "<the line>" plans/pending/<file>` before continuing.

Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (per LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness (LR-ENC-001) | `(skipped: baseline-absent per LR-ENC-001; walk-evidence consumed from walk-evidence-corporate-pricing-2026-06-23.md — within 14-day LR-013 window)` | `grep "MCP_Session_Date: 2026-06-23" clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` |
| GIVER | test-cases MD + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_new_pricebook_test_plan.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object + selectors + data | `clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts`<br>`clients/encore/src/selectors/corporate-pricing/new-pricebook.ts`<br>`clients/encore/src/data/corporate-pricing/new-pricebook.ts` | `npx playwright test corporate-pricing-new-pricebook --workers=1` green ×2 |
| HEALER | per-fix RCA doc (conditional) | `(skipped: conditional — only if first-run reds; replaced at close with the RCA artifact path, else no HEALER work)` | `npx playwright test corporate-pricing-new-pricebook --workers=1` green (HEALER fix confirmed if triggered) |
| WATCHDOG | NM-2022 + NM-2057 disposition (confirm-or-file) | `(skipped: WATCHDOG disposition is inline in Phase 4 — NM-2022/NM-2057 confirm-or-file recorded in activity log; BUG-CPR-NPB-NM2022/NM2057 filed at reports/bugs/ IFF confirmed per LR-034)` | `grep -r "NM-2022\|NM-2057" clients/encore/specs_planning/_internal/agent-activity-log.md` |
| GARDENER | (none) | `(none)` | (none) |
| OWNER | closure + (conditional) bug files | `(skipped: closure ceremony only; BUG-CPR-NPB-NM2022 and/or BUG-CPR-NPB-NM2057 filed at reports/bugs/ only if confirmed live — LR-034; activity-log row per LR-028)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] `TC-CPR-NPB-025+` green ×2: Labor create route FCC, update-existing flow, drag-add positive-control, double-click add, `New ▾` Equipment + Labor menu-item click, NM-2022 + NM-2057 confirm-or-file TCs.
- [ ] **Drag-add positive-control**: real full-pointer-sequence drag (NEVER `.dragTo()`) proven to add in create mode; drag-add → bottom → edit New Price/Max Discount → Save reachable → NO-COMMIT discipline (per LR-009/LR-019 + SOURCE A mandate).
- [ ] **NO-COMMIT discipline for irreversible creates**: Equipment + Labor create specs assert Save reachable (Save enabled:true) then Cancel/abandon — never commit a real pricebook in CI (CPR-1440-Q4; no UI delete exists).
- [ ] **NM-2022 + NM-2057 dispositioned**: each either confirmed+filed per LR-034 OR marked NOT-REPRODUCED with activity-log evidence (never silently dropped — LR-044).
- [ ] **Every SOURCE fold item present**: (A) drag-add positive-control + create-mode add-path in spec; (B) NM-2022 + NM-2057 in activity log; (C) `New ▾` Equipment + Labor menu-item clicks in spec.
- [ ] `npm run check:tc-parity` exit 0.
- [ ] `npm run xlsx:lint` (or equivalent) exit 0.
- [ ] `npm run typecheck` exit 0.
- [ ] **Axis-2 surface families dispositioned (LR-065 → LR-062 Cx)**: the New-Pricebook surface carries a `behavior-cases:` disposition for all 7 families — render-state + empty-vol + persistence each ≥1 QUICK `TC-CPR-NPB-SBC-*` + full DEEP `TC-CPR-NPB-SBC-MAX-*`; result-fidelity + pagination + sorting + combination each an `out-of-scope:<family>=<reason ≥20 chars>` token. No grid/catalog element left undispositioned.
- [ ] **render-state link-cell check present (the purple-pricebook-links coverage)**: EVERY pricebook-name link-cell (on the pricebook list reached via Search) is asserted to navigate; a non-link where a link is expected is RCA-classified (never blind auto-filed).
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] **Do-or-die audit** (WATCHDOG): every fold item from SOURCE A/B/C present in the spec or activity log; no `.dragTo()` usage; no phantom TCs (check:tc-parity clean); no hardcoded env values in selector files (per `feedback_no_hardcoded_env_in_selectors.md`).
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
# Spec green ×2
npx playwright test corporate-pricing-new-pricebook --workers=1   # expect: all green

# TC parity
npm run check:tc-parity   # expect: exit 0

# No .dragTo() usage in new-pricebook spec/page
grep -n "dragTo" clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts   # expect: no matches
grep -n "dragTo" clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts   # expect: no matches

# NM-2022 + NM-2057 dispositioned in activity log
grep -E "NM-2022|NM-2057" clients/encore/specs_planning/_internal/agent-activity-log.md   # expect: at least one match per issue

# Closure gate dry-run
node scripts/validate-plan-closure.mjs --dry-run   # expect: exit 0 or announce-only warnings
```

---

## Handoff

Chat-only summary per `feedback_handoff_in_chat_only.md`. Describes outcomes per LR-039 (no obstacle claims; never name a specific failure mode in this section).

NM-2263 full automation delivered: Equipment create (TC-LOC-CPR-301..330, already green) extended with Labor create route FCC, update-existing management flow, create-mode drag/double-click both add-mechanisms positive-controlled (real pointer-sequence, no `.dragTo()`), `New ▾` Equipment + Labor menu-item clicks driven via dropdown (not URL), NM-2022 + NM-2057 validation leads confirmed-or-filed. NO-COMMIT discipline upheld throughout (create is UI-irreversible; all create specs assert Save-reachable then abandon). Parity gate clean; XLSX rebuilt; typecheck green. CPR-1440-Q1..Q5 divergences re-verified on the Labor route.
