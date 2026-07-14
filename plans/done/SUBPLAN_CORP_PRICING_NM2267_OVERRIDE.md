# SUBPLAN_CORP_PRICING_NM2267_OVERRIDE — NM-2267: Product Group Override screen — re-scoped net-new coverage on office 1606

> **✅ EXECUTED 2026-07-09.** Re-scope approved by human review ("use upto 5 subagents of sonnet 5
> class /execute without failure … do walks thoroughly"). Phase 1A live 1606 walk → 9 net-new TCs
> (OVR-029..037) authored + green ×2; OVR-023 kept fixme (contradiction unresolved on 1606). Full
> account in the Execution Summary at the end of this file.

> **⚠ SBC ID correction (2026-06-24, still valid):** surface/behavior cases use **ordinary 3-segment IDs**
> (`TC-CPR-OVR-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT**
> the 4-segment `-SBC-` / `-SBC-MAX-` infix the original plan body used (that shape is rejected by
> `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) +
> `docs/read_only_docs/CASE_GENERATION_STANDARD.md`. (Note: the spec-quality jargon gate does not scan the
> `Surface_Family` token — see the `spec-quality-gate-blindspots` memory; keep the line in the MD, not shipped source.)

**Status**: DONE
**Executed**: 2026-07-09
**Priority**: P1
**Created**: 2026-06-24
**Revised**: 2026-07-09 (re-scoped to today's reality; re-scope approved + executed same day)
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

## What changed and why (2026-07-09 re-scope — evidence-cited)

The original plan (2026-06-24, snapshot 2026-06-26 `4a24e14`) is stale in five concrete ways. Each was
verified against the repo before this rewrite — no assumptions.

1. **Test data moved off 1604/1101 → 1606.** The Override spec was re-anchored to office **1606** in commit
   `77234bd feat(corp-pricing): re-anchor Override fixture to office 1606 + file 1604 data/import defect`.
   The spec header (`corporate-pricing-override.spec.ts:13-15`) records: office **1604 has a filed data/import
   defect awaiting the Encore product team** (tracked in `clients/encore/test_cases_xlsx/encore-qa-tracker.xlsx`);
   revert to 1604 anchors only when Encore resolves it. → Every 1604 reference re-points to **1606**. The
   **1101-only** picker/Labor scope is **PARKED**, not re-pointed (1606 is not a 1101 substitute — the
   currency-gated picker + Labor data are 1101 surfaces per NM-1881 / walk-evidence §F).

2. **The "fold-in sources" and the 28-TC spec already shipped.** Both sources the original body said to "fold
   in at full depth" are already in `plans/done/`: `SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md`
   (SOURCE A) and `SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE B). The 28-TC Override spec
   (`TC-CPR-OVR-001..028`) was built by `SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC.md` (also in `plans/done/`,
   closure manifest present). → The "fold in these sources" premise is **deleted**; no already-shipped TC is
   re-created. This plan extends only from the real high-water mark **OVR-028**.

3. **OVR-023 field behavior is contradicted and unresolved.** The original plan expected `150 → aria-invalid +
   tooltip + Save-disabled` (walk-evidence §F.F8, 2026-06-23). The **live spec's own fixme**
   (`corporate-pricing-override.spec.ts:211-231`, grounded 2026-06-09, `BUG-CPR-OVR-001`) records the
   **opposite**: a **silent focus-trap, no error node, behavior unknown until Encore fixes it**. Two live
   observations disagree (LR-061 N≥2 — do not generalize). → OVR-023 **stays `test.fixme`**. It is NOT
   rewritten to expect the error behavior. It may be un-fixme'd only if a fresh live walk **on 1606** resolves
   the contradiction (Phase 1A optional probe below).

4. **Picker-add machinery is not in the code.** The current page object
   (`corporate-pricing-override.page.ts`, 439 lines) has **zero** picker / drag / double-click / Grid-Options /
   Export / Import methods — it only edits pre-existing rows (click cell → `spinbutton` → native-set + Enter),
   selects a location, reads currency options, toggles Active, filters, and runs the save-cycle. → All
   picker-add / drag / double-click / currency-gated-reveal / Labor / multi-currency-add TCs are **PARKED**
   (they need net-new PO infra AND a 1101 surface AND resolution of the filed 1604 defect). Not planned against
   UI that isn't in the code and may not exist on 1606.

5. **Sorting is inactive on this build (new finding, 2026-07-09).** The original Phase 1b called pagination +
   per-column **sorting** the "key NET-NEW additions." But sibling corporate-pricing grids assert sorting is
   **inactive**: Search `TC-CPR-SRC-048` ("header click sets no aria-sort, row order unchanged"), Detail
   `TC-CPR-DET-049` ("column headers are not sort triggers"). → The active-sorting DEEP band is **cut**. If
   sorting is probed on the Override grid at all, the correct oracle is **sort-inactive** (assert absence, like
   DET-049), verified live first — not asc/desc reordering.

**Acceptance-criteria change (standing directive, 2026-07-08 NM-2265 handoff — memory
`corp-pricing-toolbar-io-parity-drift`):** do **NOT** rebuild the XLSX. `check:tc-parity` is red **by design**
at HEAD (toolbar-io 018-051 drift owned by the collaborator's split-merge). `xlsx:build` would delete
018-051 from the shipped deliverable. → New/changed test cases stay **MD-only**; commit the slice with
`--no-verify` (explicitly authorized for this handoff). Every acceptance line requiring `xlsx:build` /
`check:tc-parity` exit 0 is **removed**.

**Net effect:** this is not fully redundant work, but it is much smaller than the original. After the cuts,
a modest **1606-viable** residual remains — all of it gated behind a mandatory live-verify-first phase — plus
a substantial **PARKED** 1101 block. See Phase 1B (real) / Phase 1C (parked). If the human reviewer decides
the residual is too thin or too verification-dependent to be worth a subplan, the honest alternative is to
**close this plan** and route the parked items to a dedicated 1101-picker subplan when the filed 1604 defect
is resolved (§Recommendation).

---

## Context

Jira ticket NM-2267 ("Navigate to Corp Pricing Override screen") folds in full override-screen coverage per
the "every ticket delivers /ultracoverage of its feature" directive. Much of that intent has since been
delivered by the DONE sources in point 2 above. The current live model of the Product Group Override screen
(`…/settings/corporate-pricing/pg-override`) as implemented and tested is: a **location-gated, edit-in-place**
grid — pick a location via the "Change Local Office" modal, then edit pre-existing rows' Override Price /
Max Discount / Active cells and save through the shared "Save Changes" alertdialog. The currency-gated
**product-group picker** (add rows by drag / double-click) documented in walk-evidence §F was observed on
office **1101** and is **not** part of the current spec, page object, or 1606 fixture.

This re-scope keeps the NM-2267 goal — closing genuinely-uncovered override behavior — while cutting
already-shipped work, parking un-coded / 1101-only machinery, honoring the OVR-023 contradiction, and
respecting the XLSX freeze.

---

## Bootstrap

**Identity**: OWNER (multi-identity span: GIVER catalog → BUILDER specs → HEALER conditional fixes)

**Skills auto-called** (at execution, post-approval):
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/coverage` (field FCC + L1 surface must-asserts for the 1606-viable residual — QUICK depth is the right
  tier for what remains; `/ultracoverage` is NOT warranted after the cuts)
- `/find-bugs` (NM-2206 absence guard on 1606)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent — still PENDING)
- `plans/done/SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md` (SOURCE A — DONE; coverage already shipped)
- `plans/done/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE B — DONE; Search-page toolbar I/O shipped)
- `plans/done/SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC.md` (built the current OVR-001..028 spec)
- `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` (current spec — high-water OVR-028; 1606 fixture; OVR-023 fixme)
- `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` (current PO — edit-in-place; no picker infra)
- `clients/encore/src/data/corporate-pricing/override.ts` (1606 fixture anchors — `House Video Monitor LED 70"-79"`)
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` §F (1101 walk — the PARKED-scope evidence; stale for the live surface)
- `clients/encore/test_cases_xlsx/encore-qa-tracker.xlsx` (the filed 1604 data/import defect — the PARK blocker)
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/004/005; LR-008/012/017/036)
- `.claude/rules/specs.md` (LR-019 per-test baseline, LR-021 un-skip+harden atomic, LR-022 no hardcoded counts, LR-061 verify-before-blocked, LR-066 save-route parity, LR-068 assertion strength)
- `.claude/rules/angular.md` (LR-009/026 dirty-state)
- `.claude/rules/inventory.md` (LR-029 sr-only Grid Options, LR-036 boolean render, LR-062/064/065 surface families)
- `.claude/rules/baseline.md` (LR-034 bug filings; LR-045 truth hierarchy)
- `.claude/rules/browser-tool.md` (LR-038 v2 CLI default; LR-054 playwright-cli ≠ npx playwright)
- `.claude/rules/pipeline.md` (LR-040 closure gate; LR-046 strict lines; LR-048 subplan skeleton; LR-060 no-silent-checkpoint)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)
- Memory: `corp-pricing-toolbar-io-parity-drift` (XLSX freeze — MD-only, `--no-verify`); `spec-quality-gate-blindspots` (green `check:spec-quality` ≠ strong; `.catch(()=>false)` swallow + `Surface_Family` blind spots)

**Anti-Assumption Gates** (updated for the re-scope):
- [ ] `baselineScope: baseline-absent` (Product Group Override is net-new on the e2e site; no old-site Navigator baseline). Design oracles NM-1463/1472/1881/1932/2206 are LEADS, re-verified against live 1606 DOM (LR-ENC-004 / ALL-024).
- [ ] **PARK-not-close discipline (LR-040(c) + LR-046):** the 1101-only picker/Labor/multi-currency-add block is **PARKED with a named destination** (§Phase 1C / §Phase 2.5), NOT closed as empty-state and NOT silently dropped. Record c.1 population-path (office 1101 + currency-gated picker per NM-1472/1881) + c.2 classification (`data-blocked` behind the filed 1604 defect + net-new PO infra) + c.3 escalation (already filed — the encore-qa-tracker defect).
- [ ] **Verify-live-first (LR-061 §B/§C):** every Phase 1B TC is authored ONLY after Phase 1A confirms its control exists and is drivable **on 1606**. No TC is planned against a control assumed-present. Positive control before any "control absent / inert" verdict.
- [ ] **OVR-023 stays fixme'd** unless a Phase 1A live probe on 1606 resolves the aria-invalid-vs-focus-trap contradiction. Do NOT re-green the old ">100 rejected" assertion. Un-fixme + LR-019 harden atomically (LR-021) only if resolved.
- [ ] **XLSX freeze honored:** MD-only, no `xlsx:build`, no `check:tc-parity` gate; commit slice with `--no-verify` per the 2026-07-08 directive.
- [ ] LR-036 boolean render MCP-verified per cell before any `Active` assertion (Override uses `[role=checkbox][aria-checked]` — already implemented in `readActiveState`).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on: none`.
2. Read `.claude/context/navigation.md` (R00) — check the Exploration Registry for the override surface; consume documented findings, skip rediscovery.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter OWNER / ALL-* / GEN-* + the corp-pricing false-negative classes (currency-gating, inert-cell raw-JS click, drag `.dragTo()` no-op).
4. Read `.claude/context/patterns.md` — React-controlled cell edit (trusted keyboard), modal-driven location select, "before declaring a control un-drivable" node.
5. LR scan — fire: LR-019, LR-021, LR-022, LR-029, LR-034, LR-036, LR-038, LR-040, LR-046, LR-048, LR-054, LR-060, LR-061, LR-062, LR-065, LR-066, LR-068, LR-ENC-001/002/004/005.
6. **Browser-tool announcement** (LR-038 v2): `BrowserTool=cli`. Reason: live re-verification + spec implementation + first-run healer fixes — deterministic, headless. No visual/CSS/auth-heavy row matches Chrome.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — satisfied by consumption)

`baselineScope: baseline-absent` — net-new surface, no old-site baseline. Consume the 2026-06-23 §F walk
(1101 evidence — informs the PARKED scope only) + the current 1606 spec/PO as the live truth for the
edit-in-place surface. **The §F walk is 1101 and ~2 weeks old; it is NOT live truth for 1606** — Phase 1A
re-establishes 1606 truth for every net-new control before authoring. No re-walk of already-LIVE-CONFIRMED
1606 edit-in-place behavior (OVR-001..028).

---

## Phase 1A — Live re-verification on office 1606 (MANDATORY — gates all of Phase 1B)

Before authoring ANY net-new TC, drive office **1606** via `playwright-cli` (headless; auth state
`clients/encore/.auth/encore-state.json`) and record a short evidence log. For each control below, record
present+drivable / absent / different-than-§F. A Phase 1B TC is authored ONLY for controls confirmed
present+drivable; anything absent is dispositioned (cut, or park with a reason). No assumptions.

Controls to confirm on 1606:
1. **Navigation link** — does the Search action-bar "Pricing Override" button navigate to `/pg-override`? (First check whether the DONE Search/Toolbar spec already covers this — do not author a duplicate.)
2. **Location-picker modal** — "Change Local Office" modal: title text, Active checkbox, "All Locations" row, search filter, per-row checkbox, Select disabled-until-checked, Cancel, Close (×).
3. **Grid Options** — is there a `button[aria-label="Grid Options"]` on the Override toolbar (LR-029 sr-only)? How many column checkboxes? Do toggles hide columns + persist across reload + Reset-to-Default?
4. **Override-page Export / Import** — does the Override toolbar have direct-CSV **Export** (`corporate-price-pg-override/export`) + an **Import** file-chooser dialog ("Import All Pricing Overrides")? (Distinct from the DONE Search-page toolbar I/O — confirm they are separate controls.)
5. **NM-1463 auto-activate coupling** — on 1606, does editing Override Price on an inactive row auto-set Active true? Does clearing it deactivate? (§F.F6/F7 was 1101 — re-verify on 1606.)
6. **Pagination behavior** — does 1606 have enough override rows for rows-per-page (10/20/30/40/50) to actually page? (Options-existence is already covered by OVR-011; behavior needs rows.)
7. **Sorting** — probe one Override column header: does it set `aria-sort` / reorder? **Expected inactive** (per SRC-048/DET-049). Record the actual verdict.
8. **NM-2206 blank/red-circle** — does the cold-start blank / red-circle occur on 1606 + USD? (§F.F19 said "not observed" on 1101 — re-verify on 1606.)
9. **OVR-023 optional probe** — on 1606, enter 150 in Max Discount: aria-invalid + tooltip + Save-disabled (§F.F8) OR silent focus-trap (BUG-CPR-OVR-001)? Only this resolves the fixme.

---

## Phase 1B — Net-new TCs (1606-viable) — author ONLY for Phase 1A-confirmed controls

Enumerate from `TC-CPR-OVR-029..` (past OVR-028). Blend into the existing describe blocks. No `@fcc` tag.
Update `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`
+ the test-plan — **MD only** (no XLSX rebuild). Each item below is CONDITIONAL on its Phase 1A confirmation.

1. **Navigation** — `Pricing Override` link → `/pg-override` (h1 "Product Group Override"). Author only if NOT already covered by the DONE Search/Toolbar spec (Phase 1A.1).
2. **Location-picker modal detail** — title "Change Local Office", Active checkbox filters, All Locations row independently selectable, search "1606" → single row, Select disabled-until-checked → enabled → commits, Cancel + Close (×) both close with no location applied. (Modal is office-agnostic; likely present on 1606.)
3. **Grid Options (Override toolbar)** — if present (Phase 1A.3): open via `button[aria-label="Grid Options"]` (LR-029); toggle each column OFF → header disappears; reload → still hidden; "Reset to Default View" → all columns restore; per-test `ensureDefaultState` restores all columns before leaving.
4. **Override-page Export (direct CSV)** — if present (Phase 1A.4): click Export → assert `GET …/corporate-price-pg-override/export?...` → 200, no Year+Currency dialog. Filter the backend API path, never the page URL (LR-056).
5. **Override-page Import (file-chooser dialog)** — if present (Phase 1A.4): click Import → dialog "Import All Pricing Overrides" (Browse, Upload progress, Cancel, Upload, Close, `input[type=file]`); Cancel closes without upload. Do NOT attempt a real upload (shared-env data safety).
6. **NM-1463 auto-activate coupling** — if confirmed (Phase 1A.5): edit Override Price on an inactive row → Active false→true (LR-036 `[role=checkbox][aria-checked]`); clear price → Active true→false. Per-test baseline restore.
7. **Pagination behavior** — if 1606 has enough rows (Phase 1A.6): change rows-per-page → grid re-renders, no console error, no dupes/skips across pages (content-anchored reads, LR-022 — never a strict count).
8. **NM-2206 absence guard** — assert blank/red-circle does NOT occur on 1606 + USD (Phase 1A.8). If it DOES: file `BUG-CPR-OVR-002` per LR-034 (`baselineComparison: baseline-absent` + numbered stepsToReproduce + raw DOM/network evidence).
9. **OVR-023** — **stays `test.fixme`** unless Phase 1A.9 resolved the contradiction on 1606. If resolved to the well-behaved reject (aria-invalid + tooltip + Save-disabled): un-fixme + LR-019 harden atomically (LR-021) and assert real behavior. If it reproduces the silent focus-trap: leave fixme'd, refresh `BUG-CPR-OVR-001` evidence with the 1606 observation. Do NOT re-green the old assertion.
10. **Sorting (conditional, low-value)** — only if Phase 1A.7 found the Override headers active (unlikely). If inactive (expected): a single assert-inactive TC (mirror DET-049) OR skip as already-implied; do NOT author asc/desc reorder TCs.

---

## Phase 1C — PARKED (1101-only picker machinery; behind the filed 1604 defect) — NOT closed, NOT executed here

These items require (a) office **1101** (the currency-gated picker + Labor surface — NM-1472/1881), (b)
**net-new page-object infra** not in the code (picker table, drag pointer-sequence, double-click add,
currency-gated reveal), and (c) resolution of the **filed 1604 data/import defect** (encore-qa-tracker). They
are parked with this named destination, per LR-040(c):

- Currency-gated picker reveal (NM-1472): ALL → no picker; USD → Equipment picker; CAD/MXN → 1 product each.
- Picker add — Equipment: double-click + full-pointer-sequence drag (no `.dragTo()`; LR-061 positive control both ways) → grid row appended (Active=false, Override Price 0.00).
- Picker add — Labor (NM-1881): 420 Labor products at USD on 1101 → add → edit price → auto-activate → save-cycle with `ensureDefaultState` cleanup.
- Multi-currency CAD/MXN override add + save (single product each; isolated-location save side-effects).
- "New" location exclusion (NM-1463): locations with existing overrides excluded from the picker list.

**Disposition (Phase 2.5 APPEND):** append a grep-verifiable line for this parked block to a named recipient
subplan that exists in `plans/pending/` (or author a dedicated `SUBPLAN_CORP_PRICING_OVERRIDE_PICKER_1101.md`
at review time), keyed to the filed 1604 defect's resolution. c.1 population-path = office 1101 + currency
picker (NM-1472/1881); c.2 = `data-blocked` (defect filed) + net-new-infra; c.3 = already escalated
(encore-qa-tracker). **Do NOT close this as empty-state; do NOT execute it against 1606.**

---

## Phase 1b — Axis-2 Surface-Family disposition (re-scoped)

The original 7-family DEEP band is cut down to what the 1606 edit-in-place grid actually supports; picker
volume-stress moves to Phase 1C (parked). Apply only families whose trigger holds live on 1606; record an
inapplicable family as `out-of-scope:<family>=<reason ≥20 chars>` per LR-065. QUICK depth only (no `-SBC-MAX-`
exhaustion — that tier belonged to the picker/volume scope now parked).

| Family | 1606 disposition |
|---|---|
| result-fidelity | COVERED — client filter + Active-only already assert filtered result (OVR-010, OVR-012..016). No net-new. |
| pagination | Phase 1B.7 — QUICK behavior TC **iff** 1606 has enough rows (Phase 1A.6); options-existence already OVR-011. |
| sorting | **out-of-scope:sorting=header-click inactive on this build per SRC-048/DET-049; re-verify Phase 1A.7, assert-inactive only if probed.** |
| combination | QUICK — Active-only + client filter compose (extends OVR-010/012 if not already implied). Low priority. |
| render-state | COVERED — Active via `[role=checkbox][aria-checked]` (OVR-007), Current Price money format (OVR-006). No net-new. |
| empty-vol | Picker 3358/420 volume-stress → **PARKED (Phase 1C, 1101)**. "No results." empty state already OVR-003/008. |
| persistence | Grid Options visibility persist (Phase 1B.3, iff present) + edit save-cycle persistence already OVR-025..027. |

---

## Phase 2 — BUILDER: implement specs, page object, selectors, data (1606; net-new only)

### 2.1 Spec: `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`
- Extend from OVR-028 on the **1606** fixture. Author only Phase 1A-confirmed items. Fix the stale header
  comment `TC-CPR-OVR-001..528` → the real range after this plan.
- Per-test `ensureDefaultState()` restore for every staging test (already the spec's pattern). No test leaves the page dirty.
- LR-019 per-test baseline; LR-036 `Active` via `[role=checkbox][aria-checked]`; LR-022 no hardcoded counts; LR-068 assert every field / document exclusions; LR-056 filter backend API path for any network assertion.
- OVR-023: un-fixme ONLY if Phase 1A.9 resolved it (atomic un-fixme + harden per LR-021).

### 2.2 Page object: `corporate-pricing-override.page.ts`
Add methods ONLY for Phase 1A-confirmed controls: `openGridOptions()` / `toggleGridColumn()` / `clickResetToDefault()`
(iff Grid Options present); `triggerOverrideExport()` / `triggerOverrideImport()` (iff Override toolbar I/O present);
location-modal detail helpers (title/Active-filter/All-Locations/Select-disabled) extending the existing
`selectLocation`. **Do NOT add picker/drag methods** (Phase 1C, parked).

### 2.3 Selectors: `clients/encore/src/selectors/corporate-pricing/override.ts`
No hardcoded env values (no office numbers / currency strings in selectors — `feedback_no_hardcoded_env_in_selectors`).
Add entries only for confirmed net-new controls (Grid Options button, Override Export/Import, import dialog,
location-modal detail). Picker selectors **not** added (parked).

### 2.4 Test data: `clients/encore/src/data/corporate-pricing/override.ts`
Already anchored to 1606. Re-point any residual 1604/1101 constant to the 1606 fixture. Do NOT add 1101 picker
product titles (parked). Keep the office-1604 anchors recorded (commented) for the revert-when-Encore-resolves path.

---

## Phase 3 — HEALER: first-run RCA (conditional)
On any first-run reds after Phase 2: read `failure-summary.json` verbatim first (LR-044); artifact-first `/rca`,
evidence-cited fixes only; positive control before any "un-drivable" claim (LR-061); max 2 fix cycles per TC,
then HALT to user with evidence (no `.fixme` silencing). Suspicious app behavior → `/encore-questions` or file
per LR-034 with numbered `stepsToReproduce` + `baselineComparison: baseline-absent`.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)
For every adjacent fix noticed (same identity + same module + 5–30 min + no user input): DO-NOW / SPAWN / APPEND.
The **Phase 1C parked block** is the primary APPEND: add its grep-verifiable line to a named `plans/pending/`
recipient (or author `SUBPLAN_CORP_PRICING_OVERRIDE_PICKER_1101.md`), verify with `grep -F` before continuing.
Bare "out of scope" with no recipient = HALT + ask (LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — baseline-absent; 1606 live truth re-established in Phase 1A, no new baseline artifact) | (none) | (none) |
| GIVER | test-cases MD + test-plan (**MD-only — NO XLSX rebuild** per 2026-07-08 directive) | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` | `git diff --stat` shows MD updated; parity reconcile deferred to collaborator (commit slice `--no-verify`) — NO `check:tc-parity` gate |
| BUILDER | spec + page object + selectors + data (1606; net-new only) | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` | `npx playwright test corporate-pricing-override --workers=1` green ×2 |
| HEALER | first-run fixes (2 reds RCA'd + fixed: OVR-030 picker-row race; OVR-010 shared `selectLocation` modal open-race) | `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` | `npx playwright test corporate-pricing-override --workers=1` green ×2 |
| WATCHDOG | (none — closure audit is the parent delivery plan's scope) | (none) | (none) |
| GARDENER | (none — no structural refactor in scope) | (none) | (none) |
| OWNER | closure + Phase 1C park APPEND + optional `/encore-questions` if a 1606 control is absent-and-unexplained | `(skipped: closure ceremony + a grep-verifiable APPEND of the parked 1101 block to a named pending recipient; no code artifact)` | `grep -F "<parked-block line>" plans/pending/<recipient>.md` exit 0 |

---

## Acceptance criteria

- [ ] **Phase 1A evidence log recorded** — every net-new control marked present-drivable / absent / different-than-§F on **1606** before any Phase 1B TC is authored (LR-061 verify-first).
- [ ] Override spec green ×2 (`npx playwright test corporate-pricing-override --workers=1` — two clean passes) for whatever Phase 1B subset was authored.
- [ ] Navigation TC present+green **iff** not already covered by the DONE Search/Toolbar spec (no duplicate).
- [ ] Location-picker modal detail TCs green (title/Active-filter/All-Locations/search/Select-disabled/Cancel/Close).
- [ ] Grid Options / Override Export / Override Import TCs green **iff** Phase 1A confirmed those controls on 1606; else dispositioned (cut with reason, or parked).
- [ ] NM-1463 auto-activate coupling TC green **iff** the behavior exists on 1606.
- [ ] Pagination behavior TC green **iff** 1606 has enough rows; else `out-of-scope` with reason.
- [ ] Sorting: `out-of-scope:sorting=header-click inactive` OR a single assert-inactive TC — NO asc/desc reorder TCs.
- [ ] `TC-CPR-OVR-023` **stays `test.fixme`** OR un-fixme'd + LR-019-hardened atomically **iff** Phase 1A.9 resolved the contradiction on 1606. Never re-green the old ">100 rejected" assertion.
- [ ] NM-2206 guard TC present (asserts absence on 1606 + USD); `BUG-CPR-OVR-002` filed per LR-034 if observed.
- [ ] **Phase 1C parked block** has a grep-verifiable APPEND in a named `plans/pending/` recipient (LR-040(c)); NOT closed as empty-state.
- [ ] **XLSX freeze honored:** no `xlsx:build`, no `check:tc-parity` gate; MD updated; slice committed `--no-verify` per the 2026-07-08 directive.
- [ ] `npm run typecheck` clean (no new TS errors).
- [ ] `npm run check:spec-quality` passes on the **working tree** before any "done/green" claim (LR-060 obligation 4; note the `spec-quality-gate-blindspots` limits — green ≠ strong, do the adversarial self-pass per LR-068).
- [ ] `/regression-guard` before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
# Spec: two clean passes (whatever Phase 1B subset was authored)
npx playwright test corporate-pricing-override --workers=1
npx playwright test corporate-pricing-override --workers=1  # second pass

# Working-tree spec-quality (LR-060 obligation 4) — run before any done claim
npm run check:spec-quality

# Typecheck
npm run typecheck   # expect: clean

# XLSX freeze — assert we did NOT rebuild (parity is red by design; MD-only)
#   (do NOT run xlsx:build / check:tc-parity as a gate — see 2026-07-08 directive)

# High-water mark advanced past OVR-028
grep -oE "TC-CPR-OVR-[0-9]+" clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts | sort -u | tail -3

# OVR-023 fixme status (expect: still 1 fixme, OR un-fixme'd with a comment citing the 1606 resolution)
grep -c "fixme" clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts

# Parked 1101 block has a named recipient (grep-verifiable per LR-040(c))
grep -rF "override picker" plans/pending/ || echo "PARK APPEND MISSING — HALT"

# Closure dry-run (informational — parent closure is the delivery plan's scope)
node scripts/validate-plan-closure.mjs --dry-run
```

---

## Recommendation to the human reviewer (2026-07-09)

The NM-2267 goal is **not** fully redundant, but the executable residual is modest and heavily
verification-gated:

- **Real, 1606-viable (post-Phase-1A):** location-picker modal detail, NM-2206 absence guard, and —
  *only if Phase 1A confirms they exist on 1606* — Grid Options, Override-page Export/Import, NM-1463
  auto-activate coupling, and pagination behavior. Navigation may already be shipped by the DONE
  Search/Toolbar spec.
- **Cut (already shipped or build-inactive):** the folded SOURCE A/B scope, the 28-TC edit-in-place band,
  active sorting.
- **Parked (1101 + un-coded infra + filed 1604 defect):** the entire currency-gated picker / drag /
  double-click / Labor / multi-currency-add block — the largest chunk of the original plan.
- **Frozen:** OVR-023 (contradiction) and the XLSX (collaborator reconcile).

**Three ways forward — your call:**
1. **Approve this re-scope** → I run Phase 1A live on 1606, then author only the confirmed residual, MD-only.
2. **Split** → keep only the office-agnostic residual (location modal + NM-2206) here; move all "iff present
   on 1606" items + the parked picker block into a dedicated `SUBPLAN_CORP_PRICING_OVERRIDE_PICKER_1101.md`
   gated on the 1604 defect.
3. **Close** → if you judge the confirmed residual too thin, mark this `SUPERSEDED` (SOURCE A/B/W15_A
   delivered the core) and open the 1101-picker subplan when Encore resolves the filed defect.

I recommend **(1)** — the live Phase 1A probe is cheap, resolves every "iff present" unknown and the OVR-023
contradiction in one walk, and only then commits to authoring. No specs are written until Phase 1A facts are in.

---

## Handoff

Chat-only summary per `feedback_handoff_in_chat_only.md`; outcomes per LR-039 (no obstacle claims). Re-scope
approved by human review and executed 2026-07-09: Phase 1A live 1606 re-verification → confirmed residual
authored MD-only, 1101 picker block parked to a named recipient, OVR-023 kept fixme'd (the 1606 probe did not
resolve the contradiction), XLSX never rebuilt. See the Execution Summary below.

---

### Execution Summary

**Executed**: 2026-07-09 · **Identity span**: OWNER (orchestration) → BUILDER (spec/PO/selectors/data/MD) →
HEALER (2 first-run fixes). **Browser tool**: Playwright CLI (live 1606 walk) + `@playwright/test` runner.

**TCs implemented (9 net-new + 1 disposition):**
- `TC-CPR-OVR-029`, `TC-CPR-OVR-030` — navigation & "Change Local Office" location-picker modal detail
  (title / Active-filter / search / Select-disabled-until-checked / Cancel-applies-nothing).
- `TC-CPR-OVR-031` — Grid Options column visibility (toggle hides a header, persists across reload; `@mutation`,
  self-restoring via `ensureAllGridColumnsVisible`).
- `TC-CPR-OVR-032`, `TC-CPR-OVR-033` — toolbar Export (direct CSV download, no dialog) / Import (opens
  "Import All Pricing Overrides" dialog with a file input; Cancel closes without uploading — never a real upload).
- `TC-CPR-OVR-034` — NM-1463 auto-activate coupling on 1606 (editing Override Price on an inactive row).
- `TC-CPR-OVR-035` — sorting is **inactive** (column-header click sets no active sort; row order unchanged) —
  the assert-inactive option of the acceptance line, mirroring the sibling `DET-049` grid.
- `TC-CPR-OVR-036` — NM-2206 guard: every row shows a Current Price on 1606 + USD (no blank cell).
- `TC-CPR-OVR-037` — Max Discount cap ≤ 100 (boundary 100 accepted; 101 rejected).
- `TC-CPR-OVR-023` — **kept `test.fixme`** with refreshed 2026-07-09 evidence: the ≤100 cap is inclusive and
  an over-cap value sets `aria-invalid` + red border, but the documented ">100 rejected" recovery path stays
  broken on 1606 — the contradiction is unresolved, so the old assertion was NOT re-greened (per acceptance).

**TCs dropped / dispositioned (with justification):**
- **Pagination** — `out-of-scope`: office 1606 Override grid has 7 rows (< the 10-row minimum page size), so
  paging behavior cannot be exercised; the rows-per-page options list is already covered by `TC-CPR-OVR-011`.
  Recorded in the test-cases MD.
- **Active sorting (asc/desc reorder)** — cut: the build renders header-click sorting inactive (matches sibling
  corporate-pricing grids `SRC-048`/`DET-049`); only the assert-inactive `TC-CPR-OVR-035` was authored.
- **Currency-gated add-override picker (Equipment/Labor drag + double-click, multi-currency)** — parked to
  `plans/pending/SUBPLAN_CORP_PRICING_OVERRIDE_PICKER_1101.md` (needs office 1101 + net-new page-object infra +
  gated on the filed 1604 import defect); grep-verifiable named recipient per LR-040(c).

**Verification results:**
1. `npx playwright test corporate-pricing-override --workers=1 --retries=0` — **green ×2** on the final tree
   (pass C: 37 passed / 1 skipped / 0 failed; pass D: 37 passed / 1 skipped / 0 failed). The 1 skip is the
   OVR-023 fixme.
2. `npm run typecheck` (`tsc --noEmit`) — clean.
3. `npm run check:spec-quality` on the working tree (LR-060 obligation 4) — pass (0 unfailable / 0 swallowed /
   0 fixed-sleeps).
4. Regression-guard before/after — additive-only: 0 removed exports, 0 changed public signatures
   (`selectLocation` signature preserved; only its body was hardened). +8 selectors, +14 data keys, +16 methods.
5. XLSX freeze honored: no `xlsx:build`, no `check:tc-parity` gate; MD updated only; slice committed `--no-verify`.

**Two first-run reds (HEALER) — RCA'd + fixed, both env/race, neither a logic defect:**
- **OVR-030** (run 1): `inspectLocationModal` counted picker rows after a fixed wait that raced the server-backed
  search render → replaced with a wait-for-row-visible before counting.
- **OVR-010** (pass B, pre-existing test): the shared `selectLocation` filled the picker search while the Radix
  modal input had mounted but was not yet editable (open-race) → hardened with a bounded re-open retry. This is
  the per-test `beforeEach` spine every test rides, so the fix stabilizes the whole file, not just the net-new TCs.

**Documentation changes:** override test-cases MD (+ addendum, OVR-029..037 entries, OVR-023 + Max-Discount rule
refresh) and test-plan (scenarios + Coverage Index → 37) updated MD-only; 1101 picker block parked.
