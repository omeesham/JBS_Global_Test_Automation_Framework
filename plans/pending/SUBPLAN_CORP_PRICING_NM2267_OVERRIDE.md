# SUBPLAN_CORP_PRICING_NM2267_OVERRIDE — NM-2267: Navigate to Corp Pricing Override + full /ultracoverage of Product Group Override screen

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

Jira ticket NM-2267 is titled "Navigate to Corp Pricing Override screen" but per user directive each ticket delivers **full /ultracoverage of its feature**, so this subplan folds in the entire override-screen deep-coverage plan (SOURCE A: `SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md`) at full depth, plus the Pricing Override link navigation TC and the override-page Grid Options (10-col) item from SOURCE B (`SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md`). Current state: `TC-CPR-OVR-001..028` are green (read/filter/edit/save-cycle; OVR-023 is `.fixme`). This subplan extends from `TC-CPR-OVR-029..` to close every remaining gap: currency-gated picker (Equipment + Labor), NM-1463/1472/1881/1932, Grid Options, location-picker modal, multi-currency, OVR-023 re-verification, Export/Import, and the NM-2206 guard.

---

## Bootstrap

**Identity**: OWNER (multi-identity span: GIVER catalog → BUILDER specs → HEALER conditional fixes)

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/ultracoverage` (core coverage driver — picker, validations, Grid Options, modal, Export/Import)
- `/find-bugs` (OVR-023 re-verification + NM-2206 guard + discount-requires-price affordance check)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent)
- `plans/pending/SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md` (SOURCE A — folded entirely)
- `plans/pending/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE B — nav TC + Grid Options items)
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` (live truth — §F override rows F1–F19)
- `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-19.md` (Coverage Manifest 70/70)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§2 case taxonomy + §3 surface families)
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/003/004; LR-008/012/017/036)
- `.claude/rules/specs.md` (LR-019 per-test baseline, LR-021 un-skip+harden atomic, LR-061 extended positive-control)
- `.claude/rules/angular.md` (LR-009 net-zero dirty)
- `.claude/rules/inventory.md` (LR-029 sr-only Grid Options, LR-036 boolean render MCP-verified per cell, LR-057 affordance probe, LR-062 machine-denominator 100%, LR-064 TDW, LR-065 grid behavior-cases)
- `.claude/rules/baseline.md` (LR-034 bug filings; LR-045 truth hierarchy)
- `.claude/rules/browser-tool.md` (LR-038 v2 CLI default; LR-054 playwright-cli ≠ npx playwright)
- `.claude/rules/pipeline.md` (LR-040 closure gate; LR-046 strict lines; LR-048 subplan skeleton; LR-060 no-silent-checkpoint)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)

**Anti-Assumption Gates**:
- [ ] Phase 0.5b `baselineScope: baseline-absent` consumed from the 2026-06-19 re-walk attest (NM-1472/1463/1881 are the design oracles; the 2026-06-23 live walk §F is observed truth).
- [ ] Empty-surface gate (extended LR-040(c)): Labor is NOT closed as empty-state — it is populated via the currency-gated picker (420 Labor products at USD on office 1101 per NM-1881 + §F.F11), tested, OR escalated via `/encore-questions` with the documented population path.
- [ ] No "control un-drivable" without overlay-clear + reload + PO-selector-vs-live-DOM diff + DOM-inspect (Gate 3 — extended LR-061); ban `.click()`/`.dragTo()` no-op accepted as truth.
- [ ] Positive control before any "control inert" (Gate 3 — extended LR-061).
- [ ] Un-skip + LR-019 harden applied atomically in the same change (Gate 5 — LR-021 corollary).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block recorded — no silent PENDING checkpoint (Gate 6 — LR-060).
- [ ] LR-036 boolean render MCP-verified per cell before any `Active` checkbox assertion (4th boolean render format: `[role=checkbox][aria-checked]`).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on: none` — no predecessor subplan to verify in `plans/done/`.
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for `corporate-pricing/override` row; pull walk-evidence + field-inventory findings, skip re-exploration of already-documented surfaces.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter OWNER / ALL-* / GEN-B7 (sr-only Grid Options false-negative), toolbar-io staleness, NM-1472 currency-gating false-negative.
4. Read `.claude/context/patterns.md` — match decision-tree patterns to picker add (HTML5 DnD + dblclick), React-controlled cell edit (trusted keyboard), modal-driven location select.
5. LR scan — fire all: LR-019, LR-021, LR-029, LR-034, LR-036, LR-038, LR-040, LR-046, LR-048, LR-054, LR-057, LR-060, LR-061, LR-062, LR-064, LR-065, LR-ENC-001, LR-ENC-002, LR-ENC-004.
6. **Browser-tool announcement** (LR-038 v2): `BrowserTool=cli`. Reason: functional re-walk + spec implementation + first-run healer fixes — all deterministic, unattended, headless. No visual/CSS/auth-heavy row matches Chrome.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

`baselineScope: baseline-absent` — the Product Group Override screen is net-new on the e2e site; no old-site Navigator baseline exists for this surface (same declaration as `SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md` Phase 0.5b and the 2026-06-19 re-walk attest). Consume:

- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` §F (F1–F19) — the live truth for every override control verified 2026-06-23.
- `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-19.md` — Coverage Manifest 70/70, CrossCheck: clean, every override-surface control dispositioned.
- Jira oracles: NM-1472 (currency-gated picker), NM-1463 (auto-activate bidirectional + "New" exclusion), NM-1881 (Labor 420 on office 1101), NM-1932 (discount-requires-price via Active coupling), NM-2206 (blank/red-circle guard).

No new baseline walk is required (live evidence is ≤2 days old; §F per-row verdicts are LIVE-CONFIRMED). Phase 0.5b is satisfied by consuming the above artifacts — do NOT re-walk what is already LIVE-CONFIRMED.

---

## Phase 1 — GIVER: catalog net-new TCs for the override screen

Enumerate every net-new TC from `TC-CPR-OVR-029..` (past the existing high-water mark OVR-028). Blend at top of the existing describe block. No `@fcc` tag. Update `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` + test-plan + rebuild XLSX (`npm run xlsx:build` or planner:post-complete).

**TC blocks to enumerate** (each block is a distinct work item; number at authoring time):

1. **Navigation** — `TC-CPR-OVR-029`: Search toolbar `Pricing Override` link click → navigates to `/pg-override` (h1 "Product Group Override"). (SOURCE B — Toolbar Phase 1/Phase 2.3.)

2. **Location-picker modal** (covers SOURCE A Phase 2.6):
   - Active checkbox filters the location list.
   - All Locations row renders and is independently selectable.
   - Search "1101" → single row "1101 Corporate Office Encore USA SGA".
   - Cancel → modal closed, no location applied.
   - Close (×) → same outcome as Cancel.
   - Title text is "Change Local Office".
   - Select is disabled until a row is checked; enabled when checked; click commits the location.

3. **Currency filter + picker reveal** (NM-1472; SOURCE A Phase 2.1 + §F.F3/F4):
   - `Currency=ALL` with a location selected → grid "No results.", picker absent.
   - `Currency=USD` → Equipment picker renders (3358 draggable rows); grid headers visible.
   - `Currency=CAD` → picker renders (1 product). `Currency=MXN` → picker renders (1 product).
   - Tab switch (Equipment → Labor) with USD selected → Labor picker renders (420 rows, NM-1881).

4. **Picker add — Equipment** (NM-1472; SOURCE A Phase 2.1 + §F.F5; LR-061 positive-control both mechanisms):
   - Double-click Equipment picker row → override grid 0→1 (verify Location / Product Group / Currency columns populated; Override Price `0.00`; Active `false`).
   - Drag Equipment picker row → override grid 1→2. Full pointer sequence (no `.dragTo()`): `pointerdown` on source → `pointermove` to destination → `pointerup`; verify count change.
   - New row is `Dirty` (Save enables) and `Active=false` by default.
   - Stage two rows + reload without Save → beforeunload fires → accept → rows discarded (non-persistence confirmed, §F.F18).

5. **Picker add — Labor** (NM-1881; SOURCE A Phase 2.2 + §F.F11; extended LR-040(c) empty-surface gate):
   - Office 1101, Currency=USD, tab=Labor → 420 Labor products in picker.
   - Double-click a Labor picker row → override grid 0→1 (verify row populated with Labor product group name).
   - Edit Override Price → row auto-activates (NM-1463 bidirectional, same behavior as Equipment).
   - Save → persist → reload → confirm row survives.
   - **ensureDefaultState()**: if the saved row would permanently alter test data, capture the row ID and DELETE after test (or use a dedicated test-data location if one exists); document the restore strategy.
   - If NO office yields Labor picker rows after consulting the walk-evidence + the office-1101 path: escalate via `/encore-questions` with the exact population path `office=1101, Currency=USD, tab=Labor` (c.1), classification=`data-blocked` (c.2). Do NOT close as empty-state.

6. **Override Price edit + auto-activate (NM-1463 bidirectional; SOURCE A Phase 2.3 + §F.F6/F7)**:
   - Click Override Price cell `div[role=button]` → reveals `spinbutton` `<input>`.
   - Trusted keyboard: click → Ctrl+A → Delete → type "50" → Enter → cell shows "50.00".
   - Row Active: `false → true` (auto-activated; LR-036 4th boolean render `[role=checkbox][aria-checked]`).
   - Clear Override Price (set to empty or "0.00" → confirm which triggers deactivation per §F.F7: empty triggers, 0.00 does NOT) → Active: `true → false`.

7. **Discount-requires-price (NM-1932/1463; SOURCE A Phase 2.3 + §F.F9)**:
   - Stage a row with Override Price `0.00` (Active=false). Enter Max Discount `10` → cell commits `"10.00 %"`, `aria-invalid=false`. Save → enabled (discount staged on inactive row is permitted at the field level; the enforcement is via Active coupling, not a hard Save-block).
   - Assert the row is NOT Active (discount cannot "take effect" without Active, which requires a price). Document this as the designed coupling (not a hard validation block at cell level).
   - Set Override Price on that row → row auto-activates → NOW the discount is in effect.
   - Rejection-affordance oracle (§2.1): confirm there is NO modal/toast blocking Save purely because a discount exists on an inactive row — the design is Active-coupling, not Save-block (LIVE-CONFIRMED §F.F9).

8. **"New" location list excludes locations with existing overrides (NM-1463; SOURCE A Phase 2.4)**:
   - Open the location-picker modal on a fresh override page.
   - If the "Active" checkbox governs this exclusion in the UI — assert that locations with existing override records do NOT appear in the picker list when `Active` is checked (or assert that the `Select a location` modal's listed locations are filtered to only those WITHOUT existing overrides, per NM-1463 intent).
   - If the exclusion is not modal-visible (the location list shows ALL locations and the filtering happens at grid level post-select): document that observation and file as a discussion-item per `feedback_discussion_item_not_bug.md` (empty-everywhere + no-UI-path). Do NOT auto-file as a bug without evidence.

9. **OVR-023 Max Discount >100 re-verification (SOURCE A Phase 2.8 + §F.F8)**:
   - Re-run against the CURRENT app: enter `150` in Max Discount `<input type=number min=0 max=100>` → Enter.
   - Expected (LIVE-CONFIRMED §F.F8): value retains "150" with `aria-invalid="true"` + tooltip warning; **Save disabled** while the invalid cell exists.
   - If behavior matches: **un-fixme `TC-CPR-OVR-023`** (atomically with the LR-019 baseline harden per Gate 5 / LR-021).
   - If behavior has changed (e.g., now caps silently, or now allows): refresh `BUG-CPR-OVR-001` evidence with new LIVE observations + update TC accordingly.
   - Rejection-affordance oracle (§2.1 for the Negative case): `aria-invalid=true` + tooltip announced → ESCAPABLE (clear value or set ≤100 → `aria-invalid=false` + Save re-enables). Both prongs required.

10. **Multi-currency edit — CAD / MXN (SOURCE A Phase 2.7 + §F.F3/F4)**:
    - `Currency=CAD` on office 1101 → picker renders 1 product → add it → edit Override Price → Save (if possible without permanent data side-effects) → confirm CAD currency column in the row.
    - `Currency=MXN` → same pattern (1 product).
    - If a saved test environment side-effect cannot be safely reverted (CAD/MXN rows would persist on the shared office): **APPEND** a grep-verifiable line to `plans/pending/SUBPLAN_CORP_PRICING_SHADOW_EDGE.md` (or its renamed successor per task #3) with the item text `"multi-currency CAD/MXN override add+save (requires isolated test location)"` and confirm the APPEND with `grep -F "multi-currency CAD/MXN override add+save"`. Document the APPEND in the Execution Summary.
    - Read-only / unsaved path is always safe: add a CAD row (unsaved) → assert the row shows `CAD` in the Currency column → reload → confirm discard. Ship that as the minimal coverage even if save is deferred.

11. **Override-page Grid Options (10-col; SOURCE A Phase 2.5 + SOURCE B Phase 2.4 + §F.F16; LR-029)**:
    - Open `button[aria-label="Grid Options"]` on the override page (aria-label sr-only selector per LR-029; NOT the Search-page Grid Options).
    - 10 column checkboxes: Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By (all 10 per §F.F16).
    - Toggle each column OFF → assert the column header disappears from the grid.
    - Reload → assert the hidden column is still hidden (persist across reload).
    - "Reset to Default View" → all 10 columns restore.
    - Restore after test: ensure all 10 columns visible before leaving (per-test `ensureDefaultState()`).

12. **Override Export (direct CSV; SOURCE A phase context + §F.F14)**:
    - Click `button "Export"` on the override toolbar → assert `GET …/api/location/corporate-price-pg-override/export?locale=en-US` → [200] (direct CSV, no dialog).
    - Network assertion: `request.url().includes('corporate-price-pg-override/export')` + `response.status() === 200`.
    - Confirm no Year+Currency dialog opens (distinct from the Search toolbar's gated Export▾).

13. **Override Import (file-chooser dialog; SOURCE A phase context + §F.F15)**:
    - Click `button "Import"` on the override toolbar → assert file-chooser dialog opens: title "Import All Pricing Overrides", `Browse` button, `Upload progress 0%`, Cancel, Upload, Close.
    - Assert `input[type=file]` is present in the dialog.
    - Click Cancel → dialog closes without upload.
    - Do NOT attempt a real file upload (avoids data side-effects on shared env).

14. **Active-only filter (§F.F12)**:
    - `#pg-active-only` `[role=checkbox]` → toggle false→true → assert the grid filters to active rows only (or "No results." if none active).
    - If an overlay blocks the toggle (as in §F.F12 — leftover Import dialog `pointer-events:none`): clear with Escape per LR-061, then toggle. Document the Escape-clear pattern in the page object.

15. **Client/grid filter (§F.F13)**:
    - `input[placeholder="Filter Product Groups Override..."]` → type "Boom" → assert grid shows only rows with "Boom" in the Product Group Name column.
    - Clear filter → assert all rows return.

16. **NM-2206 blank/red-circle guard (SOURCE A Phase 2.9 + §F.F19)**:
    - Navigate to the override page with office 1101 + Currency=USD.
    - If a cold-start blank renders (§F operational notes: body len ~0 on first authenticated load) → reload once, confirm len > 0.
    - Assert NM-2206 blank/red-circle does NOT occur on this office+currency combination (§F.F19: "NOT observed" — assert absence).
    - If NM-2206 IS observed: file `BUG-CPR-OVR-002` per LR-034 with `baselineComparison: baseline-absent` + raw DOM/network evidence + steps-to-reproduce numbered array.

---

## Phase 1b — Axis-2 Surface-Family Ultracoverage (Case-Generation Standard — the 7 families)

> **Why this phase exists:** the field/FCC cases above (Axis 1) cover one control at a time. The
> [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md) Axis 2 (7 active surface
> families) covers behaviors that live *between* cells — result-fidelity, pagination, sorting, combination,
> render-state, empty/volume, persistence — which a field-only generator structurally cannot produce (the exact
> gap LR-065 closes). Apply only families whose **trigger** holds on the live surface; record an inapplicable
> family as `out-of-scope:<family>=<reason ≥20 chars>` per LR-065. The execution walk confirms each trigger live
> (LR-064 TDW Stage-1 grid→§3 classification). **These dispositions FOLD INTO the LR-062 100% completeness gate** —
> a grid with no `behavior-cases:` disposition is undispositioned = closure-gate Cx FAIL. SBC TCs are ordinary TCs —
> they ride `check:tc-parity`; no separate surface-parity script. Encore oracles per `field-case-generation.md` §3.
> QUICK = `TC-CPR-OVR-SBC-*` (L1 must-assert, ≥1 per applicable family); DEEP = `TC-CPR-OVR-SBC-MAX-*` (L2/L3
> exhaustive). The per-page `-SBC-` infix is the Encore realization of the Standard's `TC-<MOD>-SBC-*`.

The Product Group Override grid is a virtualized, filterable, sortable, paginated grid with link/boolean/currency cells — **all 7 families apply** (none out-of-scope). pagination (rows-per-page 10/20/30/40/50) and sorting are the key NET-NEW additions over the existing OVR coverage.

| Family | Trigger | QUICK (`-SBC-`) must-assert | DEEP (`-SBC-MAX-`) exhaustive | Encore oracle |
|---|---|---|---|---|
| result-fidelity | product-group filter + Active-only filter return rows | filter "Boom" → only Boom rows (promotes Phase 1 item 15) | every filter + Active-only + text-filter compose; mixed-result edge | filter precision (LR-022); currency-gated picker reveal (NM-1472) |
| pagination | rows-per-page 10/20/30/40/50 on the Override grid (§3 Encore-specific) | rows-per-page change re-renders + no console error | all sizes 10/20/30/40/50; partial last page; first/prev/next/last enable-disable at the ends; no dupes/skips across pages | §3 Encore-specific: Override grid rows-per-page 10/20/30/40/50; content-anchored reads (LR-022) |
| sorting | Override grid column headers sort | one column asc↔desc flips order (content-anchor) | per-column asc/desc; numeric Override Price / Max Discount ≠ lexical Product Group Name; sort+filter compose; sort persists across pages | Radix sort = LR-025 large-option retry; assert by content anchor, never row index |
| combination | Active-only filter + text filter + sort + paginate coexist | filter + sort together returns a coherent set | full decision-table (Active-only AND text-filter AND sort); Reset clears all; order-independence | client-side filters idempotent |
| render-state | Active checkbox + currency + price cells + Mod Date / Updated By | Active reads per LR-036 4th render format `[role=checkbox][aria-checked]` (promotes Phase 2.2 getActiveState); currency badge reads | every boolean/badge; Current Price / Override Price currency-format; any link-cell navigates | **LR-036 4th render format = `[role=checkbox][aria-checked]`** (not text/SVG/Unicode); currency USD/CAD/MXN |
| empty-vol | "No results." (Currency=ALL / Active-only none) + 3358 Eq / 420 Labor picker | "No results." message present + verbatim (promotes Phase 1 item 14) | 0 / 1 / N override rows; picker virtualization integrity (off-screen rows by content anchor); 3358 Eq / 420 Labor picker volume stress | virtualized picker — content-anchored reads, never a strict count (LR-022) |
| persistence | Grid Options + sort/page-size/filter + staged-row discard | Grid Options column visibility persists across reload (promotes Phase 1 item 11) | sort + page-size + active-filter survive reload + browser-back; staged picker rows discarded on reload via beforeunload (§F.F18, promotes Phase 1 item 4) | beforeunload guard §F.F18; LR-026 dirty-state defensive reload |

**Disposition rule:** at execution, every Override-grid + picker element carries a `behavior-cases:<families>` disposition (LR-065) — all 7 families covered, each ≥1 QUICK SBC TC. An element left undispositioned DENIES closure (LR-062 Cx). The DEEP `-SBC-MAX-` band is authored to full exhaustion per the Standard L2/L3 (this is `/ultracoverage`, not QUICK-only).

## Phase 2 — BUILDER: implement specs, page object, selectors, data

### 2.1 Spec file: `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`

- Extend from OVR-028 (existing high-water mark). New TCs `TC-CPR-OVR-029..` implemented in the same `describe` block.
- Per-test `ensureDefaultState()` restore: every test that stages rows (picker adds, price edits) must discard via reload (beforeunload accept) or explicit cleanup before leaving. No test leaves the page dirty for the next.
- Drag implementation: full pointer sequence per extended LR-061. Pattern: `pointerdown` on source element center → series of `pointermove` steps toward destination center → `pointerup` on destination. Verify count change AFTER pointer sequence completes. Ban `.dragTo()` (no-op accepted as truth = LR-061 violation).
- React-controlled cell edit: trusted keyboard edit only (click → Ctrl+A → Delete → type value → Tab or Enter → blur). Native value-setter alone does NOT trip React dirty (§F.D3 positive control). Use the PO method from the existing `corporate-pricing-override.page.ts` if it already implements trusted keyboard; add it if not.
- LR-036 for `Active` checkbox: read `[role=checkbox][aria-checked]` attribute; do NOT use `textContent` (the 4th boolean render format is aria-attribute, not text/SVG/Unicode). MCP-verify per LR-036 before asserting any Active state.
- LR-019 per-test baseline: capture baseline state at the top of each test before mutation; assert exact return to that baseline at the end (or document why the exact-return is impractical and what the safe substitute is).
- OVR-023 un-fixme: remove `.fixme` wrapper ONLY when the re-verification in Phase 1.9 confirms the behavior matches the TC's expected outcome. If behavior has changed, update the TC body + expectations instead.

### 2.2 Page object: `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts`

Add or update methods for:
- `selectLocation(officeNumber: string)` — opens the Change Local Office modal, searches, selects, and confirms the location is applied.
- `setCurrency(currency: 'ALL' | 'USD' | 'CAD' | 'MXN')` — sets the `combobox "Currency :"` and waits for the picker/grid to update.
- `switchTab(tab: 'Equipment' | 'Labor')` — clicks the role=tab with aria-selected assert after.
- `addRowByDoubleClick(pickerProductTitle: string)` — double-clicks `span[title="${pickerProductTitle}"]` in the picker table; waits for the override grid row count to increment by 1.
- `addRowByDrag(pickerRowIndex: number)` — full pointer sequence (no `.dragTo()`); waits for grid count +1.
- `editOverridePrice(rowIndex: number, value: string)` — trusted keyboard edit on the Override Price cell `div[role=button]` in the override grid; waits for cell to show `${value}.00`.
- `getActiveState(rowIndex: number): Promise<boolean>` — reads `[role=checkbox][aria-checked]` per LR-036 (4th boolean render format); returns `true` if `aria-checked === 'true'`.
- `editMaxDiscount(rowIndex: number, value: string)` — trusted keyboard on the Max Discount spinbutton.
- `getMaxDiscountAriaInvalid(rowIndex: number): Promise<boolean>` — reads `aria-invalid` on the Max Discount input.
- `openGridOptions()` / `toggleGridColumn(columnName: string)` / `clickResetToDefault()` — `button[aria-label="Grid Options"]` per LR-029.
- `triggerExport()` — clicks `button "Export"` on the override toolbar; returns the intercepted network request.
- `triggerImport()` — clicks `button "Import"` on the override toolbar; returns the dialog locator.
- `toggleActiveOnlyFilter()` — `#pg-active-only` `[role=checkbox]` with Escape-overlay-clear pattern per §F.F12.
- `filterProductGroups(text: string)` — fills `input[placeholder="Filter Product Groups Override..."]`.
- `discardViaReload()` — handles the beforeunload dialog (`dialog-accept`) and reloads; waits for page to re-render.

### 2.3 Selectors: `clients/encore/src/selectors/corporate-pricing/override.ts`

No hardcoded env values (no currency strings, no office numbers in the selectors file — per `feedback_no_hardcoded_env_in_selectors.md`). All per-context entries follow the `location-pricing.ts` / `currency.ts` pattern: selectors take values as parameters or come from data files.

Add selector entries for:
- Location picker modal: `changeLocalOfficeModal`, `locationSearch`, `locationRow(id: string)`, `locationSelectBtn`, `locationCancelBtn`, `locationCloseBtn`, `locationActiveCheckbox`, `allLocationsRow`.
- Currency combobox: `currencyFilter`.
- Equipment / Labor tab: `tab(name: 'Equipment' | 'Labor')`.
- Picker table: `pickerRow(productTitle: string)`, `pickerTable`.
- Override grid: `overrideGridRow(rowIndex: number)`, `overridePriceCell(rowIndex: number)`, `maxDiscountCell(rowIndex: number)`, `activeCheckbox(rowIndex: number)`.
- Toolbar: `exportBtn`, `importBtn`, `activeOnlyFilter`, `productGroupFilter`.
- Grid Options: `gridOptionsBtn` → `button[aria-label="Grid Options"]` (LR-029 sr-only).
- Import dialog: `importDialog`, `importBrowseBtn`, `importCancelBtn`, `importUploadBtn`, `importFileInput`.

### 2.4 Test data: `clients/encore/src/data/corporate-pricing/`

Add or update data constants for:
- `OVERRIDE_TEST_OFFICE`: `'1101'` (the Labor-data office per NM-1881).
- `OVERRIDE_EQUIPMENT_PRODUCT_TITLE`: `'271'` (first picker row proven in §F.F5: "271 Lift 0'-40' Boom - Daily").
- `OVERRIDE_LABOR_PRODUCT_TITLE`: from §F.F11 (the first Labor product proven in the walk; read from walk-evidence if needed).
- `OVERRIDE_VALID_PRICE`: `'50'`.
- `OVERRIDE_VALID_DISCOUNT`: `'10'`.
- `OVERRIDE_INVALID_DISCOUNT`: `'150'`.
- `OVERRIDE_CAD_PRODUCT_TITLE`: the single CAD product title (from §F.F4; grep walk-evidence for the exact title if not yet surfaced — if unknown, author the TC with a `test.fixme('CAD product title not yet confirmed from walk-evidence')` pending lookup).

---

## Phase 3 — HEALER: first-run RCA (conditional)

On any first-run reds after Phase 2 implementation:
1. Read `failure-summary.json` BEFORE re-running. Classify signal (selector drift / timing / data-state / assertion logic) per LR-044 verbatim-read protocol.
2. Artifact-first `/rca`: evidence-cited fixes only. No guess-patch.
3. Positive control before any "un-drivable" claim: if a picker drag fires no row-count change → verify the pointer sequence reaches the destination grid (add a `pointermove` midpoint); if the React cell edit does not dirty → verify with `page.evaluate()` that the `change` event fired (trusted keyboard is the fix, not skipping the test).
4. Max 2 fix cycles per TC. If still red after cycle 2: do NOT silence with `.fixme`. HALT and surface to user with the artifact evidence.
5. Bug doctrine (LR-034): if the failure is a suspicious app behavior (not a test-code issue) → `/encore-questions` or file per LR-044 with `stepsToReproduce` as a numbered array + `baselineComparison: baseline-absent`.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phase 1/2/3 that is (same identity) + (same file/module) + (5–30 min) + (no user input needed), pick exactly one:

- **DO-NOW** — execute before Phase 3.5 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan to add a grep-verifiable line item; verify with `grep -F "<the line>" plans/pending/<file>` before continuing.

Multi-currency CAD/MXN save (if deferred due to shared-env side-effects) → **APPEND** to `plans/pending/SUBPLAN_CORP_PRICING_SHADOW_EDGE.md` (or renamed successor). Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (per LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — baseline consumed from 2026-06-23 walk-evidence §F + 2026-06-19 field-inventory; no new baseline walk) | (none) | (none) |
| GIVER | test-cases MD + test-plan + XLSX workbook | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object + selectors + data | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts`<br>`clients/encore/src/selectors/corporate-pricing/override.ts` | `npx playwright test corporate-pricing-override --workers=1` green |
| HEALER | first-run fixes (conditional) | `(skipped: conditional — only if first-run reds; replaced at close with the fixed spec path and a per-TC RCA summary, else no HEALER work)` | `npx playwright test corporate-pricing-override --workers=1` green ×2 |
| WATCHDOG | (none — closure audit is the parent delivery plan's scope) | (none) | (none) |
| GARDENER | (none — no structural refactor in scope) | (none) | (none) |
| OWNER | closure + optional `/encore-questions` escalation for Labor population path if needed | `(skipped: closure ceremony only; an /encore-questions escalation is filed only if no office yields Labor data after the office-1101 path is attempted; else closure runs clean)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

---

## Acceptance criteria

- [ ] Override spec green ×2 (`npx playwright test corporate-pricing-override --workers=1` — two clean consecutive passes).
- [ ] Navigation TC (SOURCE B): `Pricing Override` link → `/pg-override` TC present and green.
- [ ] Picker add covered on **Equipment + Labor** (currency-gated reveal, USD on office 1101); both double-click AND drag mechanisms green on Equipment; Labor covered with real data OR escalated with the population path recorded as c.1/c.2/c.3 (extended LR-040(c)) — never a silent empty-state pass.
- [ ] Discount-requires-price (NM-1932/1463) and price-auto-activate (NM-1463) bidirectional TCs green; discount-at-cell-level-independent-of-price behavior documented.
- [ ] "New" location exclusion TC present (NM-1463) and green, OR discussion-item flag filed with evidence if the exclusion is not modal-visible.
- [ ] Override-page Grid Options (10-col, SOURCE B): toggle-each + persist-across-reload + Reset-to-Default TCs green; `aria-label="Grid Options"` selector per LR-029.
- [ ] Location-picker modal TCs green: Active checkbox, All Locations row, search filter, Cancel, Close, title, Select-disabled-until-checked.
- [ ] Multi-currency CAD/MXN: read-only unsaved path TC green; save path covered OR grep-verifiable APPEND to SHADOW_EDGE.
- [ ] `TC-CPR-OVR-023` (>100): un-fixme if current app behavior matches expected (aria-invalid + blocks Save) OR refreshed `BUG-CPR-OVR-001` evidence committed.
- [ ] Override Export (direct CSV) + Import (file-chooser) TCs green; Export network assertion 200 pass.
- [ ] Active-only filter + grid filter TCs green.
- [ ] NM-2206 guard TC present: asserts blank/red-circle does NOT occur on office 1101 + USD; if it DOES occur, `BUG-CPR-OVR-002` filed per LR-034.
- [ ] `npm run check:tc-parity` exit 0 (GIVER MD ↔ BUILDER spec parity clean).
- [ ] `npm run xlsx:lint` exit 0 (or `npm run xlsx:build` completes without error) — XLSX workbook up-to-date.
- [ ] `npm run typecheck` clean (GARDENER: no new TypeScript errors).
- [ ] **Axis-2 surface families dispositioned (LR-065 → LR-062 Cx)**: the Override grid carries a `behavior-cases:` disposition for ALL 7 families — each ≥1 QUICK `TC-CPR-OVR-SBC-*` + full DEEP `TC-CPR-OVR-SBC-MAX-*` (pagination 10/20/30/40/50 + per-column sorting are NET-NEW). No grid/picker element left undispositioned.
- [ ] **render-state boolean/link check present**: the Active column reads via the LR-036 4th render format `[role=checkbox][aria-checked]`; any link-cell asserted to navigate (non-link where expected = RCA-classified, never blind auto-filed).
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] Do-or-die audit: every fold item from SOURCE A + SOURCE B nav/grid items is grep-verifiable in Phase 1 or has a documented disposition (APPEND to SHADOW_EDGE or discussion-item flag).
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
# Spec: two clean passes
npx playwright test corporate-pricing-override --workers=1
npx playwright test corporate-pricing-override --workers=1  # second pass

# TC parity
npm run check:tc-parity  # expect: exit 0

# XLSX lint
npm run xlsx:lint  # expect: exit 0

# Labor TCs present
grep -c "Labor" clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts
# expect: >0 (Labor picker add + edit TCs present)

# Grid Options TC present on override page
grep -F "Grid Options" clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts
# expect: at least one match (10-col override Grid Options TC)

# Navigation TC present
grep -F "pg-override" clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts
# expect: navigation assertion present

# OVR-023 fixme status
grep -c "fixme" clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts
# expect: 0 (un-fixme'd) OR 1 with a comment citing updated BUG-CPR-OVR-001 evidence

# Closure dry-run
node scripts/validate-plan-closure.mjs --dry-run
# expect: C1–C6 clean (or WARN-only under announce mode)
```

---

## Handoff

Chat-only summary per `feedback_handoff_in_chat_only.md`. Outcomes per LR-039 (no obstacle claims).

The override screen is fully covered end-to-end: the Search toolbar Pricing Override navigation link, the currency-gated Product-Group Picker (Equipment double-click + drag + Labor via office 1101), the designed Active↔price coupling (NM-1463/1932 bidirectional), the location-picker modal, Grid Options (all 10 columns), Export/Import, the OVR-023 re-verification, and the NM-2206 absence guard. Multi-currency CAD/MXN save (if env-constrained) appended to SHADOW_EDGE with a grep-verifiable line. The parent delivery plan `PLAN_CORP_PRICING_JIRA_DELIVERY.md` inherits a fully closed NM-2267 deliverable.
