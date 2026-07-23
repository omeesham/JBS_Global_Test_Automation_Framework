# Walk Evidence — Account & Address → Master Bill To Address (Workstream B)

**Module**: account-address (Master Bill To launcher)
**Client**: encore
**MCP_Session_Date**: 2026-06-11
**MCP_Session_Tool**: Playwright CLI (`@playwright/cli` v0.1.8, `-s=e2e`, storageState `encore-state.json`)
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location → Account and Address tab
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-06-11.md
**Subplan**: SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC Phase 1B

> A supervised save-restore probe WAS committed against office 1604 (Master Bill To: 8899 Beverly Blvd → 4200 E Palm Canyon Dr → 8899 Beverly Blvd) and **verified back to original** (`billToAddress.address1 === "8899 Beverly Blvd Ste 412"`, `id === 8ad746d8-…` post-restore reload). Content renders inside the `<next-location-settings>` shadow root (CLI snapshot/click pierce; `eval` deep-walks).

---

## Why this walk exists

The Account & Address tab has 3 launcher fields. Venue/Branch **Name** (`btnAccName`) and Venue/Branch **Address** (`btnAccAddress`) are GREEN. **Master Bill To Address** (`btnAccMasterAddress` / `openMasterAddressDialog()`, page object :329) was only proven to **OPEN** the shared "Select Customer Address" dialog (TC-LOC-ACC-012). No prior test selected an address **via the Master launcher**, verified the **Master** display `dd` fields update, or measured Master-side persistence. ACC-027's selection/persistence flow is hardcoded to **Venue**. This walk closes that per-launcher gap.

---

## Data model (API `GET /navigator/api/location/1604` → `data`)

- **`billToAddress`** = **Master Bill To Address**. Original (1604): `{ id: "8ad746d8-ae4e-e611-abd6-005056ae089c", address1: "8899 Beverly Blvd Ste 412", address2:"", address3:"", city: "WEST HOLLYWOOD", state: "CA", postalCode: "90048", country: "United States", venueName: "" }`.
- **`physicalAddress`** = **Venue/Branch** address. Original (1604): same address `8899 Beverly Blvd Ste 412 / WEST HOLLYWOOD / CA / 90048`, but `venueName: "Parker Palm Springs"`.
- Both currently point at the SAME street address (same `id`), which is why a Master-side change must be verified to move the **Master** `dd`s specifically (not Venue's).

**Restore anchor (frozen FIRST, before any interaction)** — the 5 Master display values:
`address: "8899 Beverly Blvd Ste 412", city: "WEST HOLLYWOOD", state: "CA", zip: "90048", country: "United States"` (API id `8ad746d8-ae4e-e611-abd6-005056ae089c`).

---

## Master Bill To section (display, verbatim)

The Master Bill To Address section shows 5 read-only `dd`/`definition` values (NO Name field, unlike Venue) + the launcher:
- **Launcher**: `button "Address"` under the "Master Bill To Address" heading = `btnAccMasterAddress`. `cursor=pointer`; **standard Playwright click works** (unlike Pay To's disabled-input label).
- Display: Address `8899 Beverly Blvd Ste 412` · City `WEST HOLLYWOOD` · State `CA` · Zip `90048` · Country `United States`.

---

## Select Customer Address dialog (shared with Venue)

**Title** (verbatim): `dialog` heading **"Select Customer Address"** (level 2). **Testids ABSENT** (re-confirmed; role+text fallback `[role="dialog"]:has-text("Select Customer Address")` — matches the 2026-05-29 account-address finding).

**Filter**: single `textbox "Search..."` (auto-focused `[active]`) — NOT per-column filters (differs from Pay To List's 5 filters).

**Results table** — 8 columns: `[Select-row checkbox]`, Address 1, Address 2, Address 3, City, State, Zip Code, Country. All 7 data headers are sortable buttons.

**Rows (office 1604, "Total Addresses: 7")**:
| # | Address 1 | City | State | Zip | Country |
|---|---|---|---|---|---|
| 1 | 8899 Beverly Blvd Ste 412 | WEST HOLLYWOOD | CA | 90048 | United States |  ← current (anchor) |
| 2 | 4200 E Palm Canyon Dr | PALM SPRINGS | CA | 92264 | United States |  ← clean alternate |
| 3–7 | 4200 E PALM CANYON DR | PALM SPRINGS | CA | 92264 | United States |  (near-duplicate rows) |
| (8) | *(malformed row showing only "Country")* | | | | |  (data-quality artifact) |

**Buttons** (footer): **`Save` `[disabled]`** + **`Select` `[disabled]`** + `Cancel` + `Close` (X). Note: this dialog carries BOTH Save and Select (Pay To List has Select only). No row pre-checked/pre-indicated.

---

## Select → update → persistence (supervised probe, 2026-06-11)

1. Check the alternate row (4200 E Palm Canyon Dr) → **dialog `Select` enables** (dialog `Save` stays disabled) → click `Select` → dialog closes.
2. **Master display `dd`s UPDATE** to the selected address (City "PALM SPRINGS", Zip "92264"); **Venue/Branch display UNCHANGED** (still 8899 Beverly / WEST HOLLYWOOD / 90048) → **Master selection is isolated from Venue**. Page **Save enables** (form dirty — NOT display-only).
3. Save → **"Save Changes" alertdialog** (Cancel · **Ok**) → Ok → `PUT /navigator/api/location/update-properties` (200).
4. Reload → `billToAddress.address1 === "4200 E Palm Canyon Dr"`, city "PALM SPRINGS", zip 92264, `id` changed to `382061ab-64d0-4527-b21e-04bb97a07042` → **Master Bill To selection PERSISTS** through save+reload.
5. **Restore**: open dialog → check "8899 Beverly Blvd Ste 412" row → Select → Save → Ok → reload → `billToAddress.address1 === "8899 Beverly Blvd Ste 412"`, `id === 8ad746d8-…` ✅ office 1604 returned to original.

---

## Key finding — per-launcher divergence (LR-057 motivating evidence)

**The SAME "Select Customer Address" dialog behaves DIFFERENTLY per launcher:**
- Opened from the **Master** launcher → selection **PERSISTS** (measured this session).
- Opened from the **Venue** launcher → selection **does NOT persist** (ACC-027, spec `location-account-address.spec.ts:371-388`, comment :374).

Dialog-level coverage proven via Venue (TC-LOC-ACC-012 "dialog opens") could **never** have revealed that the Master launcher persists. This is the shared-dialog-conflation gap and the empirical justification for per-launcher coverage dedup (LR-057).

**Bug-candidate triage**: Master persistence WORKS, so it is NOT a bug. The Venue non-persist (ACC-027) is the existing documented behavior — whether it is a defect is an open question for the account-address audit (`SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md`), NOT this subplan. No new bug filed for B (dedup vs the documented Venue behavior per `feedback_discussion_item_not_bug.md`).

---

## Timings + endpoints

- Master dialog open ≈ 2 s; save round-trip ≈ 4 s (Ok → settle).
- Save endpoint: `PUT /navigator/api/location/update-properties` (LR-056).
- Dialog has no dedicated search endpoint exercised (single Search box; the 7 rows pre-load with the dialog).

---

## Restore anchors for the spec

- `MASTER_BILL_TO_ORIGINAL = { address1: "8899 Beverly Blvd Ste 412", city: "WEST HOLLYWOOD", state: "CA", postalCode: "90048", country: "United States" }`.
- Alternate search term / row: `4200 E Palm Canyon Dr` (PALM SPRINGS) — clean, distinct from the anchor.
- Restore mechanism: re-select the "8899 Beverly Blvd Ste 412" row (unique in the list) → Select → Save → Ok.

## Observations

### Bugs / Defects

none (retrofitted — original walk did not record findings)

### Suggestions / Improvements

none (retrofitted — original walk did not record findings)
