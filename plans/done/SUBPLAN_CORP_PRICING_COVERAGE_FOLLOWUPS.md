> 🤖 **SESSION BOOTSTRAP — invoke with `/execute SUBPLAN_CORP_PRICING_COVERAGE_FOLLOWUPS.md`. All context below.**
>
> On invocation, self-bootstrap with NO additional prompting:
> 1. **Identity**: load `/identity OWNER` (multi-identity span: HUNTER live-verify → GIVER MD/XLSX → BUILDER specs → WATCHDOG re-verify → GARDENER tracker). Clean re-load per switch.
> 2. **Skills**: `/identity` (gate), `/regression-guard` (wrap spec edits), `/relevant` (Phase 0.5 injection), `/rca` (conditional on first-run reds), `/encore-questions` (conditional — Phase B if grid unseedable), `/final-q` (exit).
> 3. **Model/thinking/perm**: read frontmatter — Opus / `xhi` / `auto`. `xhi` clamps to `high` on CLI < 2.1.111.
> 4. **Dependency gate**: `Depends on: none`. Phase B overlaps the in-flight chip `task_4d74ee8b` — **check that session's state first; do not duplicate its work.**
> 5. **Context load**: this plan in full + `.claude/rules/specs.md` (LR-019/021/052) + `.claude/rules/angular.md` (LR-009/026) + `.claude/rules/inventory.md` (LR-040/057/062/064/065) + `clients/encore/CLAUDE.md` (LR-ENC-002/004/005) + `.claude/rules/pipeline.md` (LR-040/046/048) + the tracker provenance ledger.
> 5.5. **BrowserTool**: `cli` (headed for the live walks per LR-038 v2; `state-load` shared auth).
> 6. **Phase 0 first**, then Phases A → B → C.
> 7. **Handoff**: flip the Status field to DONE + add the Executed date, activity-log row (LR-028 + LR-037), `git mv` to `plans/done/`, `npm run plans:reindex`.
>
> **HALT + ASK USER** if: a live walk can't seed the strategy grid (Phase B) → `/encore-questions` + LR-040(c) record, don't close on "empty" · the save-persist test (Phase A) would touch anything beyond New Pricebook · scope drifts · LR-052/LR-019 can't be honored.

---

# SUBPLAN_CORP_PRICING_COVERAGE_FOLLOWUPS — close 3 soft-coverage gaps on Corporate Pricing

**Status**: DONE
**Executed**: 2026-06-29
**Priority**: P2
**Created**: 2026-06-26
**Identity**: OWNER
**Parent**: (standalone — no master plan)
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli

---

## Context
A live walkthrough (2026-06-26) surfaced three real soft spots the NM-2260/NM-2261 specs left open. None block the NM-2260 ship. This plan closes all three. **LR-ENC-002 parity** applies to every spec touched (new/changed TC ⇒ MD test-case + test-plan row + XLSX rebuild; `npm run check:tc-parity` exit 0). **LR-019** per-test baseline, **LR-022** content-anchored, **LR-052** no fixed `waitForTimeout` in polling.

## Bootstrap
**Identity**: OWNER spanning the pipeline roles. **Skills**: as listed in the bootstrap block. **Context files**: this plan; `.claude/rules/specs.md`; `.claude/rules/angular.md`; `.claude/rules/inventory.md`; `clients/encore/CLAUDE.md`; `.claude/rules/pipeline.md`; `clients/encore/specs_planning/_internal/corp-pricing-tracker-provenance-2026-06-09.md`; `clients/encore/specs_planning/_internal/build-corp-pricing-tracker.mjs`.

## Phase 0 — gate
1. `Depends on: none`. **Phase B coordinates with chip `task_4d74ee8b` (already started)** — read its state; if it already lands the strategy-grid fix, Phase B becomes verify-only.
2. Read navigation.md + agent-mistakes.md (corp-pricing) + patterns.md.
3. **BrowserTool**: `cli` — functional/integration walks, deterministic, no visual assertion. Headed only if `/rca` fires.

## Phase A — New Pricebook: real save-and-verify-persist test
**Decision (user-authorized 2026-06-26):** e2e is single-tenant (ours) — accept that a created pricebook is irreversible in the UI and this test leaves permanent junk. Add ONE committing test.
- `clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts` is intentionally **NO-COMMIT** (header lines 9-12). Add an additive `confirmSave()` path; existing no-commit tests stay.
- New `TC-CPR-NPB-NNN`: build a minimally-savable pricebook (Name + Year + ≥1 strategy + ≥1 dragged product group), **confirm Save**, then verify it **persists** — reload / search the new name, assert it appears with the dragged product group. Content-anchored (LR-022). Unique name per run from a fixed prefix + a passed-in run-stamp (NOT `Date.now()`/random).
- **Add this note verbatim on the test:**
  > `// e2e is single-tenant (ours). This test SAVES a real pricebook. If it ever fails on "can't add", the likely cause is we've used up the unique source product-groups (UI has no delete to recycle them) — escalate THEN, not pre-emptively.`
- Optional (same file): replace DET-037's `waitForTimeout(500/800)` with a poll on the added row (LR-052) — flag, don't balloon scope.
- Parity: TC into `corporate_pricing_new_pricebook_test_cases.md` + test-plan + rebuild XLSX. Acceptance: spec green ×2, persists confirmed, `check:tc-parity` exit 0, `tsc --noEmit` clean.

## Phase B — Strategy "Locations Using Pricing As Default" grid (coordinate with chip task_4d74ee8b)
`TC-CPR-STR-013` (`corporate-pricing-strategy.spec.ts:89-100`) asserts the table renders + loops over *any* rows → **passes vacuously on the empty grid**. The grid is a read-only back-reference populated by setting a Primary Pricing dropdown on the **Location → Pricing tab** (`PRIMARY_PRICING_DROPDOWNS`, TC-LOC-PRI-026..030).
- **Live-verify first** (office **1101** per LR-ENC-005, not only 1604): does any strategy have location-defaults? Record live evidence (data-blocked vs by-design).
- If seedable: add a **cross-surface integration test** — set a Primary Pricing dropdown to a known strategy on the location Pricing tab + Save, then open that strategy on the Corporate Pricing Strategy tab and assert the office appears by content anchor. Restore state (LR-019/LR-026).
- Kill the vacuous case: require ≥1 row against a known-populated strategy (or repoint to a populated fixture).
- If unseedable: `/encore-questions` + record LR-040(c) c.1/c.2/c.3 disposition in the strategy MD — never close on "empty / refresh later."
- **Systemic guard:** propose/land a check (`/audit` or lint) flagging grid/list `for (… of getRows…){ expect }` loops with no prior non-zero-count assertion — reuse existing seams (audit skill / closure gate / agent HARD STOPs), no new bespoke script if one fits.

## Phase C — QA tracker: sharpen the delete/deactivate item (NOT a new row)
The gap is **already** tracked as **row C3** in `build-corp-pricing-tracker.mjs` (provenance §C3) — do **NOT** add a duplicate.
- Update the **internal provenance ledger** (`corp-pricing-tracker-provenance-2026-06-09.md`): its claim *"Zero Jira tickets for pricebook delete/deactivate"* is **stale** — a read-only Jira pass (2026-06-26) found **NM-1341 "Delete Location Corporate Pricebooks"** + **NM-531 "Expose Location Pricebook CRUD (incl. delete)"**, both **Done**. Backend delete exists for (at least) location-level corporate pricebooks. **Do NOT assume it covers the master price book from the New Pricebook flow — flag "verify which entity NM-1341/531 governs."**
- Re-frame C3's `status` from "is there an intended way?" to: *"Backend delete capability appears to exist (see internal ledger); confirm whether it applies to a price book created via the New Pricebook flow and, if so, surface a Delete/Deactivate action in the UI — deactivate-only suffices for error recovery."* Keep the **client-facing workbook Jira-ID-free** (existing rule). Rebuild via `node clients/encore/specs_planning/_internal/build-corp-pricing-tracker.mjs`.

## Per-Identity Satisfaction
| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | live-verify strategy grid (1101) | `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-29.md` | grep evidence freshness |
| GIVER | MD + test-plan + XLSX for NPB save TC | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | NPB save test + STR integration test + page objects | `clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts`<br>`clients/encore/tests/corporate-pricing/corporate-pricing-strategy.spec.ts` | `npx playwright test corporate-pricing-new-pricebook corporate-pricing-strategy --workers=1 --retries=0` green ×2 |
| WATCHDOG | systemic vacuous-grid guard | `scripts/check-vacuous-grid-assertions.mjs`<br>`scripts/check-vacuous-grid-assertions.test.mjs` | `node scripts/check-vacuous-grid-assertions.test.mjs` (15 pass) + warn-only pre-commit block |
| GARDENER | tracker rebuild + provenance update | `clients/encore/specs_planning/_internal/corp-pricing-tracker-provenance-2026-06-09.md`<br>`clients/encore/test_cases_xlsx/tracker_corp_pricing.xlsx` | rebuild script exit 0 (the build script outputs `tracker_corp_pricing.xlsx`, not `encore-qa-tracker.xlsx` which the plan originally mis-cited) |
| OWNER | closure | `(none)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

## Acceptance criteria
- [ ] Phase A: new TC commits a pricebook and a reload/search finds it by name; parity + typecheck clean; green ×2.
- [ ] Phase B: live evidence recorded; `TC-CPR-STR-013` no longer green on an empty grid; vacuous-grid guard flags a synthetic example; chip `task_4d74ee8b` reconciled (no duplicate work).
- [ ] Phase C: `git grep -n "NM-1341\|NM-531" clients/encore/specs_planning/_internal/corp-pricing-tracker-provenance-2026-06-09.md` hits; rebuilt `encore-qa-tracker.xlsx` C3 reworded; no NM-#### in the workbook.
- [ ] Activity-log row per LR-028 (LR-037 timestamp). `/final-q` verdict.

## Handoff
Chat-only per `feedback_handoff_in_chat_only.md`; outcomes only (LR-039).

---

## Execution Summary

**Executed**: 2026-06-29 · **Identity span**: OWNER → BUILDER (specs/page objects) → GIVER (test-cases/test-plans/XLSX + walk-evidence) → OWNER (closure).

### Phase A — New Pricebook save-and-verify-persist
- **TC implemented (1)**: `TC-CPR-NPB-031` — builds a minimally-savable Equipment pricebook (Name + Year + 1 strategy + 1 dragged product group), confirms Save (the single committing test), then verifies persistence by reloading the created book and finding it via Search with its product group. Content-anchored (LR-022); unique run-stamped name (no `Date.now()`/random). Real commits observed live (GUIDs `cf772791…`, `1321cfdd…`).
- Page object `corporate-pricing-new-pricebook.page.ts`: additive `confirmSave()` + minimal-savable-with-product-group helper (existing no-commit tests untouched).

### Phase B — Strategy "Locations Using Pricing As Default" grid
- **Live-verified seedable** (data-blocked, not by-design-empty): office 1101 carries 596 corporate pricebooks; the cross-surface Primary Pricing link proven live (office 1604 → strategy `2026-Tier 2 Resort B` grid) via a zero-mutation positive control (LR-061-C / LR-ENC-005). Evidence: `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-29.md`.
- **TC rewritten (1)**: `TC-CPR-STR-013` — was vacuous on an empty grid; now a self-seeded cross-surface integration test (set a location's Primary Pricing + Save → assert the office surfaces in the strategy grid, ≥1 row content-anchored → restore in `finally`, net-zero per LR-019/LR-026). `STRATEGY.expectedLocations` (volatile 1991/7011) replaced with `crossSurfaceSeed`.
- **Systemic guard landed**: `scripts/check-vacuous-grid-assertions.mjs` (+ `.test.mjs`, 15/15 pass) flags grid/list loops with no prior non-zero-count guard; warn-only pre-commit block; repo scan = 0 findings.
- Chip `task_4d74ee8b` reconciled — no duplicate work.

### Phase C — QA tracker delete/deactivate item (row C3, no new row)
- Provenance ledger corrected: stale "zero Jira tickets" claim replaced — NM-1341 ("Delete Location Corporate Pricebooks", Won't-Do) + NM-531 ("Expose Location Pricebook CRUD", Done) found; C3 reframed to "backend delete may exist for location-level pricebooks — verify which entity it governs vs the New-Pricebook master book". Client workbook kept Jira-ID-free; `tracker_corp_pricing.xlsx` rebuilt (0 `NM-####` leaks).

### Mid-execution fix — pre-existing red unblocked (LR-018 / LR-060)
- `TC-CPR-NPB-020` ("Add with an empty Strategy Name is a no-op") was failing **deterministically** (confirmed on a clean isolated run, 1 failed/31 passed). RCA: the page object clicked the dialog's Add button, but the app **disables** Add while the name is empty (that disabled state IS the empty-name guard) — `.click()` on a permanently-disabled button timed out. Fix: page object reads the disabled state (`getEmptyNameAddGuard`); spec asserts `addDisabled === true` + dialog open + total unchanged (positive control = TC-018/019 which add WITH a name). Parity synced across test-case Steps/Expected + test-plan scenario + workbook.

### TCs dropped: none.

### Verification results (evidence-emission)
1. `TC-CPR-NPB-020` isolated → `2 passed (46.1s)`, exit 0 (fix confirmed).
2. Combined `corporate-pricing-new-pricebook` + `corporate-pricing-strategy` ×2, `--workers=1 --retries=0` → **RUN 1: `95 passed (11.0m)`, RUN 2: `95 passed (11.3m)`, R1=0 R2=0** (LR-018 run-all truth; zero serial contamination).
3. `npm run check:tc-parity` → exit 0 (spec 646 / MD 750 / XLSX 750; all spec TCs present in MD + XLSX).
4. `clients/encore` `npm run typecheck` (`tsc --noEmit`) → exit 0.
5. `npm run xlsx:build` → exit 0; xlsx-lint 0 vocab hits / 0 integrity violations; corporate_pricing_new_pricebook = 31 rows; TC-020 prose corrected in the workbook.
6. Independent WATCHDOG audit (fresh context, AUD-017) → **VERDICT: CLEAN** — no false-greens, unsound logic, stale parity, or silent regressions; 3 findings: closure ceremony (this summary), TC-020 title-framing (assessed behaviorally accurate, kept), walk-evidence two-bucket `## Observations` (fixed).

### Documentation changes
- Test-cases: `corporate_pricing_new_pricebook_test_cases.md` (TC-020 + TC-031), `corporate_pricing_strategy_test_cases.md` (TC-013).
- Test-plans: `corporate_pricing_new_pricebook_test_plan.md`, `corporate_pricing_strategy_test_plan.md`.
- Workbook: `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` rebuilt.
- Walk-evidence: `walk-evidence-corporate-pricing-2026-06-29.md` (+ two-bucket `## Observations`).
- Navigation registry + provenance/tracker: `navigation.md`, `corp-pricing-tracker-provenance-2026-06-09.md`, `tracker_corp_pricing.xlsx`.

**Test pass confirmation**: combined suite green ×2 on 2026-06-29 (95/95 each run).
