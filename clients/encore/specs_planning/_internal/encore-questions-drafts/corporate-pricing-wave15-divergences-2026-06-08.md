> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

# Encore Questions — Corporate Pricing Wave-1.5 (newly-surfaced, DOCX-absent nodes)

**Date**: 2026-06-08
**Module**: Corporate Pricing → Product Group Override (`/settings/corporate-pricing/pg-override`) + Search toolbar I/O (Export ▾ / Import ▾)
**Source**: SUBPLAN_CORP_PRICING_W15_0_RECON GIVER/HUNTER live walk (Playwright CLI `cpr-w15-recon`, office 1604)
**Oracle**: DOCX `Pricing-Functional Details-JIRA STORIES 1.docx` (NM-1445/1440/1441/1443/1444) — **these nodes are NOT in the DOCX** (live-discovered, master ledger D9/D10)
**Status**: DRAFT — awaiting `/encore-questions` Tier-A review + (if unresolved) escalation to the Encore team
**Artifacts**: `field-inventories/corporate-pricing-override-2026-06-08.md`, `field-inventories/corporate-pricing-toolbar-io-2026-06-08.md`, `old-site-baseline/corporate-pricing-override-2026-06-08.md`

> Per master Doctrine 2: each divergence is asserted as live reality in the tests AND raised here as a clarification — never silently absorbed. Neither item is filed as a `BUG-*` (both are spec-vs-build clarifications on undocumented surfaces, not application defects). These nodes are **baseline-absent** (net-new on e2e, no nav2 equivalent) and **DOCX-absent** — so live DOM is the sole intent oracle and these questions are the mechanism that converts "observed" into "intended."

---

## Q-WV15-1 — The Product Group Override screen is live but undocumented (story ID + Override-Price/Max-Discount validation rules)

**DOCX**: the "Pricing Override" / "Price Over-ride" link is mentioned (R1445), but the **destination screen** — Product Group Override at `/settings/corporate-pricing/pg-override` — is **not described**. Wave-1 deferred its button as "URL: TBD / destination unbuilt" (D3).

**Live (2026-06-08)** — the screen is **BUILT and reachable** (navigation confirmed). It shows:
- **Equipment / Labor** tabs (Radix `role=tab`).
- A left-panel **location selector** (`Select a location` → modal picker), a **Currency** filter (ALL / USD / CAD / MXN), and an **Active only** filter (default OFF).
- A **10-column grid** — `Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By` — location-gated (empty "No results." until a location is picked), client-side text filter, rows-per-page 10/20/30/40/50.
- A `Save` (disabled on clean, dialog-gated by pattern), and **direct** `Export` / `Import` / `Grid Options` (no variant menu).

**Questions**:
1. **Story ID** — what Jira story owns the Product Group Override screen (NM-1442?), so its coverage traces to a requirement rather than to recon alone?
2. **Override Price** — what validation rules apply (currency format, min/max, relationship to Current Price)? It is the screen's core editable field; W15-A needs the intended rules to assert intent, not just observed behavior.
3. **Max Discount %** — what validation rules (range 0–100? blank ≡ no discount, which renders as `—`)?
4. **Grid columns** — the recon (D9) expected **9** columns; live shows **10** (adds `Updated By`). Confirm the 10-column shape is intended (benign audit-column addition, analogous to the Search 8↔9 split D1).
5. **Edit-activation mechanism** — in the read-only recon, the Override Price / Max Discount `div[role=button]` click-to-edit cells did **not** reveal an input via click/double-click/Enter, and the `Active` Radix checkbox (not disabled) did not toggle on click. Is editing **RBAC-gated** (e.g. a Revenue-Management role the automation user lacks), mode-gated, or driven by a specific interaction? **W15-A cannot author save-cycle FCC until this is resolved.**

**Assessment**: medium-high. The screen is a first-class pricing surface; without documented validation rules + the edit mechanism, W15-A can only assert the observed read-only shape. **Impact on tests**: W15-A asserts live reality (tabs, grid, filters, boolean render) and stays GREEN; the Override-Price / Max-Discount save-cycle + validation FCC is gated on the answers to (2)/(3)/(5).

---

## Q-WV15-2 — Export ▾ / Import ▾ expose 4 undocumented variants each (behavior + file format)

**DOCX**: does not describe an Export/Import facility on the Corporate Pricing Search screen.

**Live (2026-06-08)** — the Search action bar exposes **`Export ▾`** and **`Import ▾`**, each a dropdown of the **same 4 variants**:
- **All Equipment Pricing**
- **All Labor Pricing**
- **All Equipment Max Discount**
- **All Labor Max Discount**

Separately, **`Loc Pricing Export`** / **`Loc Pricing Import`** are **direct** single-action buttons (no variant menu), and a **`Grid Options`** control toggles grid column visibility.

**Questions**:
1. **Per-variant behavior** — what does each of the 4 Export variants export, and what does each Import variant accept (full catalogue vs filtered grid; which columns)?
2. **File format** — the **direct** exports were observed to download **CSV** files (`ProductGroupOverrides-*.csv` from the Override screen's `Export`; `LocationPricebooks-*.csv` from `Loc Pricing Export`), so CSV is confirmed for those. Do the **Export ▾ variants** also produce CSV, and is the Import format the round-trip of the matching Export?
3. **Loc Pricing Export/Import vs Export/Import** — what is the semantic difference (location-scoped vs grid-scoped)? Both sets are present.
4. **Validation** — what does Import validate / reject, and how are errors surfaced?

**Assessment**: medium. The variant **labels** are captured; the behavior + format are undocumented. **Impact on tests**: W15-B covers the **trigger + variant level** (button present, menu opens, 4 variants enumerated) and stays GREEN; the **real file I/O round-trip** is deferred to EDGE_P3 (per master) and depends on the answers to (1)/(2)/(4).

---

## Resolution path

1. `/encore-questions` Tier A: re-confirm against any newer DOCX revision; check whether a second office / a Revenue-Management role exposes the Override edit mode (resolves Q-WV15-1 item 5).
2. If unresolved internally → forward Q-WV15-1 + Q-WV15-2 to the Encore product team (LR-ENC-001 escalation chain).
3. Tests stay GREEN against live reality in the interim (Doctrine 2 — assert live, raise divergence, never a deliberately-failing test for a non-defect).

---

## ✅ W15-A live resolution (2026-06-09 — `playwright-cli -s=cpr-override-fcc`, office 1604)

**Q-WV15-1 item 5 (edit-activation mechanism) — RESOLVED.** The recon's "inert cells / possible RBAC" was a **FALSE NEGATIVE**. A single CLI `click` (full pointer sequence) on the Override Price / Max Discount % cell `button` reveals an active `spinbutton`; commit = native value-setter (React-controlled) + `Enter`; the Active `checkbox` toggles + dirties. Save → "Save Changes" dialog → `POST /navigator/api/location/corporate-price-pg-override` → 200 → toast "Pricing overrides saved successfully."; Updated By becomes `s-prd-clickauto@psav.com` (the automation user) — **edit rights confirmed, NOT RBAC-blocked.** Round-trip 445→446→445 verified reversible. Full evidence: `field-inventories/corporate-pricing-override-2026-06-09.md`.

**Consequence for W15-A**: the Override-Price / Max-Discount / Active save-cycle FCC is **automatable** (not the read-only fallback). Items (2)/(3) of Q-WV15-1 (validation rules) are partially answered by live behavior; the documented *intended* min/max/format rules remain a product-team clarification (still RAISED).

**CPR-WV15-Q3 — Max Discount % is capped at 100 (live finding 2026-06-09).** The Max Discount % cell renders "N.00 %" and **rejects values >100**: entering 150 leaves the inline editor open (refuses to commit), so >100 cannot be saved. Valid 0–100 (incl. decimals) commit normally. This answers Q-WV15-1 item 3's "range 0–100?" affirmatively for the *upper* bound (client-enforced). Override Price has no observed upper cap (accepts large values, rendered with thousands separators e.g. "999,999.00"); its intended min/max remain a clarification. Asserted live in TC-LOC-CPR-523. Not a bug — sensible domain validation.

### Jira defect-lead verdicts (LR-044 live-proof gate, dated 2026-06-09)

| NM-# | Verdict | Note |
|---|---|---|
| NM-1463 | confirmed-mechanism | edits EXISTING rows via click-to-edit (no source-list add on `/pg-override`); story-ownership a lead |
| NM-2126 | not-reproduced | automation user edits + saves; RBAC negative is NOT-AUTOMATABLE (single account) |
| NM-1870 | not-reproduced | Current Price renders `0.00` (displayed) |
| NM-1889 | not-reproduced | client filter scoped to Product Group ID + Name only |
| NM-1675 | consistent | Current Price `0.00` computed; cross-page recompute = PRE_EDGE scope |
| NM-1932 | blocked-data | no blank-Override-Price row on 1604 to test the "without Override Price" path |
| NM-1961 | not-applicable | no "add override row" affordance on this screen |

These are leads verified on the live e2e site (LR-ENC-001 / LR-044) — none filed as `BUG-*` (all not-reproduced / consistent / blocked-data / not-applicable on e2e today).

---

## ✅ W15-B live resolution (2026-06-09 — `playwright-cli -s=cpr-toolbar-fcc`, office 1604)

**Q-WV15-2 (Export ▾ / Import ▾ variant behavior + file format) — PARTIALLY ANSWERED at trigger level.** The W15-0 recon captured the 4 variant LABELS only; this session exercised the per-variant TRIGGERS:

- **Export ▾** (and **Loc Pricing Export**) are **direct CSV downloads** via GET endpoints — no dialog, no confirm. Each Export ▾ variant fires `GET /navigator/api/location/pricing/pricing-export` with a `isLabor`/`isMaxDiscount` query-param pair that maps 1:1 to the variant, plus **`locale=en-US`** (this answers **NM-1604** "4 export variants + locale" at trigger level — **confirmed-live**). Files: `EquipmentPricings.csv` / `LaborPricings.csv` / `EquipmentMaxDiscounts.csv` / `LaborMaxDiscounts.csv`. Loc Pricing Export uses a distinct `location-export?locale=en-US` endpoint (`LocationPricebooks-*.csv`).
- **Import ▾** (and **Loc Pricing Import**) open a **custom in-app upload dialog** (NOT a native OS file chooser): title "Import &lt;variant&gt;" (e.g. "Import All Equipment Pricing"; Loc Pricing Import = "Import All Location Pricing"), prompt "Choose a file to import data.", buttons Browse/Cancel/Upload/Close, and an `input[type=file]`. **No backend request fires on trigger** — the upload POST fires only after a file is chosen + Upload clicked.
- **Grid Options** is a `button[aria-label="Grid Options"]` icon (its label is sr-only — a **live selector correction**, LR-029: `:text-is("Grid Options")` cannot match it). It opens a menu of one `menuitemcheckbox` per grid column (9, all checked by default); toggling a column hides its `<th>` and the hidden state **persists across reload** (server-persisted per-user preference).

**Remaining (still RAISED → real I/O, EDGE_P3)**: what each export/import payload actually contains, the import file format/template, validation/error/success, dedupe, and row caps. These manifest only in the downloaded/uploaded FILE content, which `SUBPLAN_CORP_PRICING_EDGE_P3.md` owns (the trigger + variant + Grid-Options level is owned + GREEN here).

### Jira defect-lead verdicts (toolbar I/O — LR-044 live-proof gate, dated 2026-06-09)

| NM-# | Verdict | Note |
|---|---|---|
| NM-1604 | confirmed-live (trigger) | 4 export variants + `locale=en-US` on every export request; CSV download |
| NM-1625 / NM-1446 | deferred-to-EDGE_P3 | import payload / dedupe / counts — require a real upload (out of trigger scope) |
| NM-2126 | not-reproducible-single-account | the automation user CAN export/import; the RM-vs-non-RM role gate cannot be proven with one account → RBAC negative is NOT-AUTOMATABLE |
| NM-2164 | deferred-to-EDGE_P3 | "Max Discount import rounds decimals" is a payload-level effect (real upload) |
| NM-1986 | deferred-to-EDGE_P3 | "~50-row / single-pricebook import cap" needs a real multi-row upload |
| NM-1997 / NM-1998 / NM-2005 | deferred-to-EDGE_P3 | "duplicate / wrong / missing export dataset" are downloaded-CSV-content assertions |

None filed as `BUG-*` — trigger-level scope cannot reproduce the payload-level defects; they are recorded as live-proof-gated leads for EDGE_P3 (LR-044, never encoded as expectations from this note alone).
