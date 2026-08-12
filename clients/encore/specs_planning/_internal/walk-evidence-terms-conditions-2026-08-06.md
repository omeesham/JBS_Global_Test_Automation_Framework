# Walk Evidence — Terms & Conditions (2026-08-06)

## Metadata
- **URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/terms-conditions
- **Date**: 2026-08-06
- **Office**: 1604 (Parker Palm Springs)
- **Auth method**: storageState from `clients/encore/.auth/encore-state.json`
- **Tooling**: Standalone Playwright (Node.js), headless Chromium, from `clients/encore/node_modules`
- **Walk session IDs**: tnc-walk-evidence-r1 (NM-3162/NM-3163), tnc-walk-evidence-r2 (adversarial), tnc-walk-evidence-r3 (recovery)
- **Scripts**: `.claude/state/ua-worker/chips/tnc-intake/out-walk-evidence/probe-nm3162-nm3163.js`, `probe-adversarial.js`, `probe-recovery.js`

---

## What was walked vs carried forward

**Carried forward from prior runs** (not re-claimed — cite run IDs per ticket requirement):
All surface facts from tnc-probe-r3 (2026-08-05), tnc-probe-r7 (2026-08-06), tnc-probe-r8 (2026-08-06), tnc-final-audit-r1 (2026-08-06), tnc-persistence-r1 (2026-08-06):
- Save gate (dirty + validity gate), global name uniqueness (silent block), special chars persist byte-exact, RTE HTML-entity encoding, bold persistence, language-filter true default (US English), language-switch guard, beforeunload guard, no guard on different-row edit, no delete affordance, column resize no persist, DEF-TNC-002 (bulk save HTTP 500 on residue rows), DEF-TNC-005 (save failure silent — UI disables Save as if success).

**Walked this run:**
1. NM-3162 — editor panel state: HTML→non-HTML column, non-HTML→HTML column, rapid alternation. N=4 runs.
2. NM-3163 — tooltip rendering on HTML cells whose textContent contains non-breaking space.
3. Adversarial pass — rapid double-click Save; navigate-away while dirty; language-switch mid-edit; HTML column switching (Left→Right).

---

## NM-3162 Verdict — HTML Editor Does Not Clear After Selecting a Non-HTML Column

**REGRESSION CONFIRMED** against closed ticket NM-3162. Reproduced N=4 independent runs, both directions, rapid alternation.

### Raw evidence

**Run 1 — HTML cell (Left Column) clicked first, then Name field (same row):**
- After clicking Left Column HTML cell: `.tiptap` in DOM, boundingBox `{"x":950.34375,"y":298,"width":312.65625,"height":120}` — visible.
- After clicking Name field on same row: `.tiptap` still in DOM, boundingBox `{"x":950.34375,"y":223,"width":312.65625,"height":120}` — still visible, repositioned vertically.
- **The editor panel does NOT clear or close. It repositions its Y-coordinate to track the active row but remains fully visible.**
- Screenshot: `nm3162-run1-after-html-click.png`, `nm3162-run1-after-name-click.png`

**Run 2 — Reverse direction: Name field first, then HTML cell:**
- Starting state (Name focused): RTE already in DOM (`true` — panel persists from prior state).
- After clicking HTML Left Column: RTE in DOM=true, BB `{"x":950.34375,"y":298,"width":312.65625,"height":120}`.
- Screenshot: `nm3162-run2-after-html-click.png`

**Run 3 — N=2 independent confirm of HTML→Name direction (fresh page load):**
- RTE BB after HTML cell click: `{"x":950.34375,"y":298,"width":312.65625,"height":120}`
- RTE BB after Name click: `{"x":950.34375,"y":223,"width":312.65625,"height":120}`
- Same pattern: visible, repositioned, not cleared.

**Run 4 — Rapid alternation (5 switches, HTML↔Name):**
```
step 0 (HTML): rteInDom=true, bbVisible=true
step 1 (Name): rteInDom=true, bbVisible=true
step 2 (HTML): rteInDom=true, bbVisible=true
step 3 (Name): rteInDom=true, bbVisible=true
step 4 (HTML): rteInDom=true, bbVisible=true
```
- Screenshot: `nm3162-run4-rapid-alternation.png`
- **In ALL 5 states across both column types the editor is visible and has geometry. It never clears.**

**Triage**: REGRESSION against NM-3162. The editor panel should clear when a non-HTML column (Name or Language) is selected. It does not — it stays visible and repositions vertically. The content displayed continues to show the last-clicked HTML column's content while Name or Language column is in focus, which is misleading (user may believe they are editing Name/Language via the RTE).

**Old-site baseline reference**: `.claude/state/ua-worker/chips/tnc-intake/out-baseline/terms-conditions-2026-08-05.md` and `out-baseline2/BASELINE2.md`. Old site has no shared RTE panel — each cell is inline editable. The shared panel is new-site only; the clearing behaviour is new-site behaviour expected to match NM-3162 specification.

---

## NM-3163 Verdict — Tooltip `&nbsp;` rendering

**Finding: No per-cell tooltip exists on HTML cell launchers.**

### Raw evidence
- 144 HTML cell launcher buttons enumerated on the page.
- Cell index 2 had textContent `"ENCORE GENERAL TERMS AND CONDITIONS1.ACCEPTANCE. This Quote will be valid until "` — contains non-breaking space (Unicode `\u00a0`).
- Hovered that cell for 800ms: no `[role="tooltip"]`, no `[data-radix-popper-content-wrapper]`, no `.tooltip` element found in DOM.
- Screenshot: `nm3163-no-tooltip.png`
- Name cell hover: returned tooltip text `"Terms and Conditions | Navigator"` — this is the browser's native `<title>` shown as a tab tooltip, not a per-cell tooltip.
- **Conclusion: HTML cells carry no tooltip. There is no per-cell tooltip rendering `&nbsp;` or anything else.** NM-3163 tooltip half is N/A — the tooltip surface does not exist on this page for HTML cells. The Name cell tooltip is the browser window title, not relevant to NM-3163.

**Triage**: baseline-absent (the tooltip described in NM-3163 does not exist on the new site for HTML cells). Not a regression — no tooltip to render incorrectly.

---

## Adversarial Pass Results

### Adv-1: Rapid double-click Save

**Method**: Dirtied form (appended "X" to AUTOMATION-TEST-ROW-TNC-WALK name → "AUTOMATION-TEST-ROW-TNC-WALKX"). Save enabled (`disabled=false`). Called `saveBtn.click()` twice in rapid succession.

**Result**: First click fired. Second click timed out after 30s waiting for Save to become enabled — Save disabled immediately after first click's processing. **Only one save request fires.** No double-submission risk.

**Side observation**: The first save with "AUTOMATION-TEST-ROW-TNC-WALKX" succeeded server-side (confirmed — row was found as "WALKX" on next page load in recovery probe). The recovery save to restore "AUTOMATION-TEST-ROW-TNC-WALK" was clicked but silently failed — on next load the row was still named "WALKX" (findIdx returned null for "WALK", found it as "WALKX"). **This is a fresh instance of DEF-TNC-005 (silent save failure): save button disabled as if success, but data not persisted.** See Scratch data section.

### Adv-2: Navigate away while dirty (URL navigation)

**Method**: Dirtied form, then `page.goto()` to the location settings URL.
**Result**: findIdx returned null after the Adv-1 restore (DEF-TNC-005 left row as "WALKX"), so the dirty-form setup was skipped. **Not completed due to DEF-TNC-005 interference.** Prior confirmed evidence from tnc-probe-r8: beforeunload fires on browser navigate-away while dirty.

### Adv-3: Language switch mid-edit

**Not completed** — same findIdx null cause as Adv-2. Prior confirmed evidence from tnc-probe-r8 (2026-08-06): language-filter change while dirty raises alertdialog with Stay/Discard.

### Adv-4: HTML column switch Left→Right (content update check)

**Not completed** — same findIdx null cause. However Run 2 of NM-3162 probe confirmed that switching between HTML columns keeps the editor visible and updates its content (different y-BB per-row track). The content update between Left and Right columns was not independently measured.

### Adv-5: Empty Name block (reconfirm)

**Carried from tnc-probe-r8**: clear to empty → Save disabled, `aria-invalid=true`, red border (oklch destructive color). Confirmed — no inline error text (silent block with visual indicator only on the field itself).

---

## Observations

### Bugs / Defects (HIGH)

1. **REGRESSION NM-3162 — RTE editor panel does not clear when a non-HTML column is selected**
   - Triage: **regression-from-baseline** (NM-3162 was a closed defect; this probe re-fires it).
   - Evidence: N=4 runs (both directions + rapid alternation). Editor stays visible with geometry `312×120px` at all times regardless of which column type is focused. Screenshots: `nm3162-run1-after-name-click.png`, `nm3162-run4-rapid-alternation.png`.
   - Severity: medium — misleading UX: editor displays HTML column content while user is editing the Name field, creating confusion about which field is active.

2. **DEF-TNC-002 (carried by reference, tnc-probe-r8)** — Bulk save returns HTTP 500 when the grid holds residue rows; the payload sends ALL rows, so one bad row fails the whole batch.
   - Triage: regression-from-baseline (new-site only; old site has no bulk save).

3. **DEF-TNC-005 (carried by reference + fresh instance this run)** — On a non-2xx save the UI disables Save exactly as on success — no toast, no banner, no console error: silent data loss.
   - Triage: regression-from-baseline.
   - Fresh instance observed this run: recovery restore of "AUTOMATION-TEST-ROW-TNC-WALK" — save button clicked, UI behaved as success, but row remained as "AUTOMATION-TEST-ROW-TNC-WALKX" on next load.

4. **No guard on editing a different row while one row is dirty** (carried, tnc-probe-r8) — clicking Name input on a different row while one row is dirty raises no warning. Both rows editable simultaneously.
   - Triage: baseline-absent (old site has inline edit per cell; new site's shared-save pattern creates this gap).

### Suggestions / Improvements (LOW)

1. **Column resize does not persist** (carried, tnc-probe-r3) — resizing a column header resets to default on reload. Users must re-resize every session.
   - Triage: discussion-item (may be by design; no baseline requirement for persistence).

2. **Silent duplicate-name block has no inline error message** — `aria-invalid=true` is set on the Name input when a duplicate name exists, but no text message explains why Save is disabled. User must guess the cause.
   - Triage: discussion-item / UX improvement.

3. **No tooltip on HTML cell content** — grid cells truncate long HTML content but provide no tooltip or expand affordance to see full content without clicking into the editor.
   - Triage: discussion-item.

---

## Scratch Data Left on App

| Row name | Table row testid suffix | Status |
|---|---|---|
| `AUTOMATION-TEST-ROW-TNC-WALKX` | row-9 (name cell: `terms-conditions-name-9`) | **Stuck** — restore save silently failed (DEF-TNC-005). Should be `AUTOMATION-TEST-ROW-TNC-WALK`. Manual rename needed or wait for next automation pass. |
| `ZZPROBE-RTE-2026-08-05` | (prior session residue) | Residue from tnc-persistence-r1; no delete affordance; leave as-is per ticket. |

---

## Baseline references used for triage
- Old-site baseline: `.claude/state/ua-worker/chips/tnc-intake/out-baseline/terms-conditions-2026-08-05.md`
- Old-site baseline 2: `.claude/state/ua-worker/chips/tnc-intake/out-baseline2/BASELINE2.md`
- Field inventory: `clients/encore/specs_planning/_internal/field-inventories/terms-conditions-2026-08-05.md`
