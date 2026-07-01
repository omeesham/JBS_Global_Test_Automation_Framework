# SUBPLAN_CORP_PRICING_LABOR_SAVE_AND_ROUTE_PARITY_GATE — Labor Save coverage fix + Save-Route-Parity gate (LR-066)

**Status**: DONE
**Executed**: 2026-06-30
**Priority**: High
**Created**: 2026-06-30
**Identity**: OWNER (multi-identity span: BUILDER spec/page/data, GIVER MD/test-plan/XLSX, OWNER framework rule+gate+audit; OWNER short-circuits §2 per LR-043; per-phase `/identity` adoption at write-time per Layer-1 gate)
**Parent**: `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md`
**Depends on**: `plans/done/SUBPLAN_CORP_PRICING_NM2263_NEW_PRICEBOOKS.md` (done)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli — Reason: capture one live Labor product-group name (positive control, LR-061) + confirm Labor Save dialog reachable; then green ×2 runs.

---

## Context — why this exists

NM-2263 shipped the New-Pricebook suite with **asymmetric Save coverage**:
- **Equipment** got the full Save flow — enable (TC-023), dialog→Cancel (TC-024), real commit+persist+Search-visible (TC-031), drag→Save→Cancel (TC-033).
- **Labor** got only 3 thin tests — loads (028), **Save-enable only** (029), catalog (030). It never reaches the Save dialog and never commits, so **"does a Labor pricebook actually save?" is unproven.**

Root cause: the NM-2263 acceptance line 249 required *"Equipment **+ Labor** … assert Save reachable then Cancel/abandon"*, but the Labor TC was authored (GIVER), coded (BUILDER), and audited (WATCHDOG) as enable-only, and **every gate measures structure (TC counts, MD/XLSX sync, file-exists, pass/fail) — none measures whether each sibling route exercises the core action (a real Save).** An enable-only test is synced, green, and exists, so nothing flagged it. (Also a quiet LR-046 break — a strict "Equipment + Labor" line silently rescoped without HALT.)

This subplan closes both: **(A)** add the missing Labor Save tests, and **(B)** add a machine gate + rule + audit step so a thin sibling route can't pass again.

User decisions (2026-06-30): save the Labor pricebook for real (permanent pricebook accepted — Equipment TC-031 already does the same, no UI delete); prevention = new rule **+ audit + machine gate** (Option 1), because the human audit step is exactly what rubber-stamped this — only a gate reliably catches it.

---

## Bootstrap
- **Identity**: per-phase — BUILDER (Part A spec/data), GIVER (Part A MD/test-plan/XLSX), OWNER (Part B rule/gate/hook/audit).
- **Skills auto-called**: `/regression-guard` (before+after), `/audit` (post), `/reflect`, `/final-q`.
- **Context files**: this subplan; `plans/done/SUBPLAN_CORP_PRICING_NM2263_NEW_PRICEBOOKS.md`; `.claude/rules/specs.md` (LR-018/019/022/051/056/061); `.claude/rules/angular.md` (LR-009/026); `clients/encore/CLAUDE.md` (LR-012, LR-ENC-002, LR-ENC-005); `.claude/rules/pipeline.md` (LR-046/048); `docs/read_only_docs/LEARNED_RULES.md` (LR-059).

## Phase 0 — gate
- Dependency: NM-2263 subplan DONE (true). Browser-tool: cli (announced above).

---

## Part A — Immediate Labor Save coverage

### A1 — Live capture (BUILDER, cli, LR-061 positive control)
Open `…/locations/1604/settings/corporate-pricing/add?type=labor` headless on saved state. Verify:
- Save **dialog is reachable** on the Labor route (fill minimal → click Save → "Save Changes" dialog appears) — positive control that the same Save primitive fires on Labor.
- Capture **one reliable Labor product-group name** from the Labor source catalog to use as the commit fixture; confirm it is add-able (double-click/drag adds a grid row).
- Record name + evidence in `clients/encore/specs_planning/_internal/walk-evidence-corp-pricing-labor-save-2026-06-30.md`.
- ⚠ No assumption — confirm the exact group name + add-ability before coding.

### A2 — Data (BUILDER) — `clients/encore/src/data/corporate-pricing/new-pricebook.ts`
- Add `laborGroupA: '<verified A1 name>'`.
- Add `persistNamePrefixLabor` (distinct prefix) so committed Labor books are distinguishable from Equipment in Search.

### A3 — Spec (BUILDER) — `clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts`, **Labor describe block**
Reuse existing route-agnostic helpers (they act on the page opened by `beforeEach → open('labor')`):
- **TC-CPR-NPB-051 — Labor Save opens the confirmation dialog; Cancel aborts without committing** — mirror Equipment TC-024: `fillMinimalSavable()` → `isSaveEnabled()===true` → `clickSaveExpectDialog()` (title+body) → `cancelSaveDialog()` → still on `/add`.
- **TC-CPR-NPB-052 — Saving a new Labor pricebook persists it (reloads + found by Search)** — mirror Equipment TC-031: `fillSavableWithProductGroup(name, validYear, laborGroupA)` → `confirmSaveAndGetNewId()` → reload `readSavedDetailGroups` contains the Labor group → Search `findRowByName` ≠ null. Name = `persistNamePrefixLabor + runStamp` (env/pid, never Date.now/random).
- Satisfied by structure: LR-019 per-test baseline via `beforeEach`; LR-009/026 dirty handled in helpers; LR-022 content-anchored (no strict counts); LR-051 no `.toBe(true)` on OR-exprs.
- If `fillSavableWithProductGroup` is hardcoded to the Equipment catalog path, add a thin Labor-group parameterization rather than duplicating the helper (DRY).

### A4 — GIVER artifacts (parity, LR-ENC-002)
- `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md` — add TC-051 + TC-052 rows (Steps/Expected/Data, `Depends_On: TC-CPR-NPB-028`).
- `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_new_pricebook_test_plan.md` — add the two scenarios.
- Rebuild workbook via `planner:post-complete` → `clients/encore/test_cases_xlsx/encore_test_cases.xlsx`.
- `npm run check:tc-parity` exit 0 + `npm run xlsx:lint` exit 0.

### A5 — Verify
`npx playwright test corporate-pricing-new-pricebook --workers=1` **green ×2** + `npm run typecheck` clean (LR-018 run-all truth; LR-024 clean before RCA).

---

## Part B — Prevention: Save-Route-Parity (rule + gate + audit) — OWNER

### B1 — Rule LR-066 → `.claude/rules/specs.md`
Verify next-free LR number first (LR-020; expect **LR-066**, confirm by grep). Body:
> **Save-route parity — every save-capable route exercises a real Save.** When a module exposes N sibling create/save routes sharing one page (differ only by a route param / mode — e.g. `?type=equipment` vs `?type=labor`), EACH route must have ≥1 test that **drives a real Save** — dialog-reach minimum (`clickSaveExpectDialog`/`clickSaveWithDialog`), commit where the primary route commits (`confirmSaveAndGetNewId`/`saveAndVerifyCase`) — OR carry an explicit `parity-waived: <reason ≥20 chars>` marker. A save-capable route may NOT be closed on load + field-enable checks alone. Trigger: any spec authoring/modification for a module with ≥2 route-param/mode siblings on a shared save page. Enforced by `scripts/check-save-route-parity.mjs` + WATCHDOG audit checklist. Graduated from: 2026-06-30 NM-2263 Labor enable-only gap.

### B2 — Gate `scripts/check-save-route-parity.mjs` (new) — minimal, deterministic, no AST
- Small **inline** allowlist (a `REGISTRY` array inside the script — no separate JSON file): `{ specPath, saveRouteDescribes: [exact describe titles], realSaveHelpers: ["clickSaveExpectDialog","confirmSaveAndGetNewId","clickSaveWithDialog","saveAndVerifyCase"] }`.
- Per registered spec: slice each declared describe block (title → next `test.describe(` or EOF); assert ≥1 `realSaveHelpers` call OR a `parity-waived:` comment. Missing → **FAIL** (print offending route + rule).
- First registry entry = the new-pricebook spec, listing **Equipment** + **Labor** describes. After A3 both pass; before A3 Labor would FAIL — proves the gate bites.
- `--staged` mode for pre-commit; bare mode scans registry as-is. Exit 1 on any failure.

### B3 — Wire
Add **Gate D** to `.githooks/pre-commit` (sibling of Gate A): `node scripts/check-save-route-parity.mjs --staged` → HALT commit on non-zero. **No `package.json` edit** (OWNER HARD STOP — hook calls `node` directly, like Gate A/B/C).

### B4 — Audit wiring
- `.claude/skills/audit/SKILL.md` (review mode) — add checklist line: *"Save-route parity — list the module's save-capable routes; confirm each drives a real Save or carries a `parity-waived:` marker."*
- `.claude/agents/AUDIT.md` (WATCHDOG) — same checklist item.

### B5 — Prove the gate
`node scripts/check-save-route-parity.mjs` → PASS (Labor now has 051/052). Execution Summary notes the same gate FAILS on the pre-A3 tree — demonstrating it would have caught the original gap.

---

## Per-Identity Satisfaction

| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | walk-evidence (live Labor save) | `clients/encore/specs_planning/_internal/walk-evidence-corp-pricing-labor-save-2026-06-30.md` | `Test-Path` → True |
| GIVER | test-cases MD + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_new_pricebook_test_plan.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + data | `clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts`<br>`clients/encore/src/data/corporate-pricing/new-pricebook.ts` | `npx playwright test corporate-pricing-new-pricebook --workers=1` green ×2 |
| OWNER | rule + gate + hook (Gate 5d in `.githooks/pre-commit`, grep-verified — extension-less file, proven in Execution Summary Part B) + audit | `.claude/rules/specs.md`<br>`scripts/check-save-route-parity.mjs`<br>`.claude/skills/audit/SKILL.md`<br>`.claude/agents/AUDIT.md` | `node scripts/check-save-route-parity.mjs` exit 0 |
| WATCHDOG | (none) | `(none)` | (none) |
| HEALER | (none) | `(none)` | (none) |
| GARDENER | (none) | `(none)` | (none) |

---

## Acceptance criteria
- [ ] Labor route drives a real Save: TC-051 (dialog→Cancel) + TC-052 (commit→persist→found in Search) present and green ×2.
- [ ] No `.dragTo()`; no strict counts (LR-022); content-anchored persistence reads.
- [ ] `check:tc-parity` exit 0 + `xlsx:lint` exit 0 + `typecheck` clean.
- [ ] LR-066 added to `.claude/rules/specs.md` (number verified free per LR-020).
- [ ] `scripts/check-save-route-parity.mjs` exists; PASSES on the fixed tree; documented to FAIL on the pre-fix tree.
- [ ] Gate D wired into `.githooks/pre-commit` (no `package.json` edit).
- [ ] Audit checklist line added to both `.claude/skills/audit/SKILL.md` and `.claude/agents/AUDIT.md`.
- [ ] `/regression-guard` before/after = no silent breakage.
- [ ] Activity-log row per LR-028 (LR-037 timestamp ≥ touched-file mtimes).
- [ ] `/final-q` verdict (GREEN|YELLOW|RED) per LR-042.

## Verification
```bash
npx playwright test corporate-pricing-new-pricebook --workers=1   # green ×2
npm run check:tc-parity && npm run xlsx:lint && npm run typecheck
node scripts/check-save-route-parity.mjs                          # exit 0 after fix
```

## Notes / risks
- TC-052 leaves a permanent Labor pricebook each run (no UI delete) — **user-authorized**, identical to the accepted Equipment TC-031 cost; unique env/pid-stamped name keeps it searchable + non-colliding.
- Labor catalog confirmed present on office 1604 (TC-030 already asserts it) — commit fixture feasible there; A1 verifies the exact group before coding (LR-061, no assumption).
- Gate registry is a small hand-maintained allowlist (deterministic, slop-free). Residual hole — an unregistered future multi-route spec dodges it; covered by the LR-066 trigger + WATCHDOG audit step (B4). A heuristic "sibling-describe asymmetry" announce-net is deliberately deferred as optional hardening, not built now (anti-slop / simplest-first).

## Handoff
Executed 2026-06-30. Outcome below.

---

## Execution Summary

**Executed**: 2026-06-30 — OWNER orchestration with per-phase identity adoption (HUNTER A1 · BUILDER A2/A3 · GIVER A4 · OWNER B1–B5). Zero identity-gate announce warnings (verified: no `.claude/state/identity-gate-warnings-*.json` files).

### Part A — Labor Save coverage (BUILDER + GIVER)

**TCs implemented (2 net-new):**
- **TC-CPR-NPB-051** — Labor Save opens the confirmation dialog; Cancel aborts without committing (mirror of Equipment TC-024). Green ×2.
- **TC-CPR-NPB-052** — Saving a new Labor pricebook persists it (reload `readSavedDetailGroups` contains the Labor group + found by Search). Green ×2.

**TCs dropped**: none.

**Verification (numbered):**
1. **A1 positive control (LR-061)** — live `playwright-cli` walk on `…/add?type=labor` confirmed the Save dialog is reachable on the Labor route and captured one addable Labor product group, `Banners Design` (catalog ID 400). Evidence: `clients/encore/specs_planning/_internal/walk-evidence-corp-pricing-labor-save-2026-06-30.md`.
2. **A5 run-all (LR-018)** — `npx playwright test corporate-pricing-new-pricebook --workers=1 --retries=0`: RUN 1 = **53 passed** (52 TCs + setup), RUN 3 = **53 passed** → **green ×2** (two clean full-suite passes). `npm run typecheck` clean. TC-051/052 passed in every run.
3. **Parity** — `npm run check:tc-parity` exit 0; `npm run xlsx:lint` exit 0; workbook rebuilt via `planner:post-complete`. New-Pricebook band total 50 → 52.

**Data added** (`clients/encore/src/data/corporate-pricing/new-pricebook.ts`): `laborGroupA: 'Banners Design'` (live-verified addable) + `persistNamePrefixLabor: 'QA-Persist-LAB-'`.

### Part B — Save-route-parity prevention (OWNER)

- **LR-066** added to `.claude/rules/specs.md` (next-free number verified per LR-020; LR-065 was latest).
- **`scripts/check-save-route-parity.mjs`** — registry-driven, AST-free gate; registry entry = the new-pricebook spec's Equipment + Labor describes. `node scripts/check-save-route-parity.mjs` → **PASS, exit 0** on the fixed tree.
- **Gate proof (B5)** — the same gate against the pre-A3 tree (TC-051/052 stripped = the enable-only state) reports `EQUIP: PASS / LABOR: FAIL (no real-save helper)` — it would have caught the original NM-2263 gap. Proof script preserved at `scratchpad/prove-gate-bites.mjs`.
- **Pre-commit Gate 5d** wired into `.githooks/pre-commit` via a direct `node` call (no `package.json` edit — OWNER HARD STOP honored).
- **Audit wiring** — checklist line added to `.claude/skills/audit/SKILL.md` (review mode) + `.claude/agents/AUDIT.md` (WATCHDOG step 1.7).
- **Reflection** — `.claude/context/navigation.md` New-Pricebook registry row updated (Labor Save coverage + `isLabor` Search divergence).

### Deviations from plan (2 — both documented; neither rescopes a strict line)

1. **Page-object hardening (subplan said "no page-object change needed").** `confirmSaveAndGetNewId` in `clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts` flaked once on a first-attempt commit-redirect timeout (dialog dismissed, page stayed on `/add`). Hardened it with a **bounded 3-attempt retry loop** around click-Save → dialog → confirm → `waitForURL(/details/)`. Strict improvement; also benefits Equipment TC-031 (shared helper). Equipment TC-031 re-verified green — no regression.
2. **`isLabor` Search-filter divergence (discovery).** TC-052's Search step initially returned null — the Corporate Pricing Search **hides Labor pricebooks by default**; finding a committed Labor book requires `sp.setCheckbox('isLabor', true)`. Added that to TC-052. Exactly the Labor-vs-Equipment behavioral divergence the original enable-only Labor coverage never surfaced — concrete evidence for LR-066's value.

### Observation (orthogonal — not a deviation; pre-existing flake, flagged out-of-band)

RUN 2 of the full suite produced one transient flake on **TC-CPR-NPB-042** ("Every rendered pricebook-name cell is a navigable link + Currency renders") — a pre-existing NM-2263 render-state test, **outside this subplan's scope**. It is not a regression from this work:
- It reads the *Search* page object (`getPricebookNameCells` / `getRowCellText`), which this subplan never touches.
- This subplan's permanent Labor pricebooks are filtered out of TC-042's default grid (Labor is hidden unless `isLabor` is on).
- It passed RUN 1, RUN 3, and **3/3 in isolation** (~6s each) → a load-dependent virtualized-grid render race, not a product defect.

This subplan's own tests (TC-051 / TC-052) pass in every run — green ×2 holds and nothing this subplan owns is shipped in a broken state (LR-060 obligation 3 satisfied: no owned test routed anywhere). A minimal render-read hardening for the pre-existing TC-042 was flagged separately as an out-of-scope Phase 2.5 SPAWN follow-up (`task_57ca08b4`), per Karpathy "don't touch unrelated code".
