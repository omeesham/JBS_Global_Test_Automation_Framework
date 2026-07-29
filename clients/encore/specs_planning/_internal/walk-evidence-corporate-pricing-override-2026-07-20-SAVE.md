# Walk Evidence — Corporate Pricing Product Group Override (SAVE addendum)
# Date: 2026-07-20
# Walker: BUILDER (NM-2271 execution session — Phase 2 §0 mandatory live save-probe)
# Browser tool: Playwright CLI headless. Session: nm2271. Auth: clients/encore/.auth/encore-state.json (fresh SSO via auth.setup 2026-07-20)
# Companion machine log: clients/encore/reports/walkthrough/nm2271-grid-equipment-labor.walkthrough.yaml

---

## Why this file exists

The six 2026-07-17 walk files (A–F) all close with "NO SAVE COMMITS" — no walk ever clicked Save.
The NM-2271 plan (amended 2026-07-20) therefore mandated a live save-probe BEFORE authoring any
save-cycle TC. **Correction discovered during the probe**: the spec suite already commits saves —
`TC-CPR-OVR-025..028` (Equipment save-cycles, office 1606 fixture PG 2609) exist and passed in this
machine's 2026-07-20 baseline run (48 passed / 2 skipped). The walk-layer gap was real; the
spec-layer gap was Equipment-only. **Labor-tab saves had never been committed by any walk OR any
spec** — this probe is the first, and it certifies the mechanism end-to-end.

## Save flow (certified live, matches the page-object contract)

1. Toolbar `Save` click → `[role="alertdialog"]` "Save Changes" — heading "Save Changes", body
   "Are you sure you want to save the changes?", buttons Cancel / Save.
   **Both the alertdialog and the loading overlay render `aria-hidden="true"` while visually modal**
   — `getByRole('alertdialog')` does NOT match; CSS selector required (the existing
   `saveAndConfirm()` helper already handles this and documents it).
2. Dialog `Save` → `POST /navigator/api/location/corporate-price-pg-override` → **200**.
3. Toast: "Pricing overrides saved successfully."
4. A loading dialog "Pricing overrides is saving..." overlays during the wait.
5. NO mutation request fires before the dialog is confirmed (verified: zero API calls between
   toolbar-Save and dialog-Save).

## Labor save-cycle — first commit in module history (office 1105, PG 655 "General - Ops")

| Step | Observation |
|---|---|
| Edit surface | Override Price cell = `div[role=button]` col 5 → click → `spinbutton`, inputValue `160` |
| Dirty | fill `161` + Tab → cell `161.00`, Save enables |
| Commit | POST 200 + success toast |
| Persist | reload + re-select 1105 + Labor tab → `161.00`, Mod Date `07/20/2026, 08:20 PM` |
| Restore | `160` → save → reload → `160.00` verified — bed left exactly as found (Mod Date moved, unavoidable) |
| Active cell | `role=checkbox` `aria-checked=false` button (LR-036 Labor format re-confirmed live) |

## Dirty-guard — Stay path (previously unwalked; A and D only ever clicked Discard)

Edit `199` → click **in-app Home link** → alertdialog "Unsaved changes" ("Are you sure you want to
leave this view? Any unsaved changes will be lost.", Stay | Discard) → **Stay** → URL unchanged
(still pg-override), staged edit intact (`199.00`), Save still enabled, dialog dismissed.
**Discard** (re-triggered) → navigated to `/locations/1105/home`, edit lost.
Reload-while-dirty fires the **native beforeunload** dialog instead (re-confirmed; `dialog-accept`
needed) — specs must navigate via in-app links to reach the React alertdialog.

## Accessibility probe (Phase 7 basis)

- Cells focusable: `div[role=button] tabindex=0`; **Enter** opens the spinbutton editor; **Escape**
  closes it with NO dirty state (Save stays disabled).
- **No arrow-key cell navigation** (ArrowRight leaves focus in place). Not an ARIA grid — native table.
- **Defect-candidate**: both save dialogs render `aria-hidden="true"` while visually modal —
  invisible to assistive tech. (Also the direct cause of role-locator failures in automation.)
- Tab order from page top walks the app nav; the grid is not reachable early.

## Bed sanity re-certifications (2026-07-20 live)

- **1115 PG 286**: blank Override Price renders `—` inside `span.text-muted-foreground` (NM-1932 render intact).
- **9460 Labor**: "212 items found"; 20/page; p1 first row "Banners Design" (PG 400); p2 first row
  "Candids Video Engineer - FULL DAY" (PG 1503); last page 12 rows; nav buttons carry aria-labels
  `Go to first page` / `Go to previous page` / `Go to next page` / `Go to last page` with certified
  enablement states; rows-per-page combobox options 10/20/30/40/50; 20→50 → 50 rows, total unchanged;
  last-page→first-page round trip returns the "Banners Design" anchor (volume/round-trip integrity).
- **4104 picker gate**: Currency ALL → no "Product Groups" panel; USD → panel + "Search product
  groups..." + 430 draggable elements on the Labor tab (420 rows + 10 column headers) — matches
  evidence D Step 6.

## Value drift noted (not a defect)

1105 Equipment PG 272 "Lift 0'-40' Boom - Weekly" Override Price is now **1,001.00** (walk-A
2026-07-17 recorded 100.00). Not a suite fixture (the save fixture is office 1606 PG 2609 = 500.00);
no test impact. Reinforces the plan's D7 rule: never assert Mod Date or drift-prone literals.

## Observations

### Bugs / Defects

| # | Surface | Finding | Status |
|---|---|---|---|
| 1 | Override grid — both modal dialogs ("Save Changes" alertdialog and the "Pricing overrides is saving..." loading overlay) | Both render **`aria-hidden="true"` while visually modal and interactive**. Assistive technology cannot see either dialog, so a screen-reader user gets no announcement that a confirmation is required or that a save is in flight. Verified live 2026-07-20 via DOM read: `{"role":"alertdialog","state":"open","ariaHidden":"true","visible":true,...}` with three reachable buttons. This is also the direct cause of the automation-side role-locator failure the page object documents (role lookups do not match; CSS selectors required). WCAG: a modal that is `aria-hidden` is hidden from the accessibility tree while trapping visual focus. | **BUG-CANDIDATE** — not yet filed per LR-034 (needs the confirm-and-minimize pass); recorded here + carried as the Phase 7 `blocked-pending-question` disposition |
| 2 | Override grid — cell keyboard navigation | **No arrow-key navigation between grid cells.** Cells are individually focusable (`div[role=button] tabindex=0`) and Enter/Escape work, but ArrowRight/ArrowLeft do not move focus — the grid is a native table, not an ARIA grid, so keyboard users must Tab through every cell. Tab order from the page top walks the app nav first; the grid is not reachable early. | **BUG-CANDIDATE** — usability/accessibility gap; recorded as the Phase 7 `blocked-pending-question` gap (LR-031) rather than asserted in a TC |

### Suggestions / Improvements

| # | Surface | Suggestion |
|---|---|---|
| 1 | Change Local Office flow | The grid stays empty ("Select a location") even though the office number is already in the URL — every walk and every test must perform the picker dance before any data renders. Auto-selecting the URL's office would remove a whole class of setup from both users and automation. |
| 2 | Override grid pagination | Page-navigation controls are icon-only buttons distinguished solely by `aria-label`. They work, but a visible page indicator ("Page 2 of 11") would make position obvious; the current UI shows only the total record count. |
| 3 | Mod Date volatility | Any save — including an unrelated tenant-wide import — rewrites Mod Date / Updated By on every matching row, so these columns cannot carry a stable oracle. Worth confirming with the product team whether row-level audit columns are intended to move on a no-value-change upsert. |

---

## NO UNRESTORED MUTATIONS

Both Labor saves were part of one edit→verify→restore→verify cycle; final state `160.00` equals the
pre-probe value. The Stay/Discard probes never committed. All other probes read-only.
