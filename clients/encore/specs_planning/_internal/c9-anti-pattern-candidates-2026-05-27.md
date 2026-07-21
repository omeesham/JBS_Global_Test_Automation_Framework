# C9 Anti-Pattern Sweep — `src/pages/locations/` + `src/selectors/locations/`

**Author**: GARDENER (W1-03)
**Date**: 2026-05-27
**Scope**: list-only per W1-03 Phase 8; NO fixes (out-of-scope per subplan).
**Anti-pattern target**: "1 file where 2+ sibling modules expected" (LR-017 violation candidates — the local-office-settings.page.ts merged BAS+HIS+ECT pattern that motivated W1-03).

---

## Sweep result

### `clients/encore/src/pages/locations/` — 11 files

| File | Module(s) covered | Verdict |
|---|---|---|
| `location-account-address.page.ts` | account_address | ✓ 1 file, 1 module |
| `location-auto-addon.page.ts` | auto_addon | ✓ 1 file, 1 module |
| `location-currency.page.ts` | currency | ✓ 1 file, 1 module |
| `location-form-helpers.page.ts` | shared helpers (CheckboxState, etc.) | ✓ explicit shared helper |
| `location-legal.page.ts` | legal | ✓ 1 file, 1 module |
| `location-local-info.page.ts` | local_information | ✓ 1 file, 1 module |
| `location-management-history.page.ts` | management_history | ✓ 1 file, 1 module |
| `location-notes.page.ts` | notes | ✓ 1 file, 1 module |
| `location-pricing.page.ts` | pricing | ✓ 1 file, 1 module |
| `location-shared-setup-locations.page.ts` | shared_setup_locations | ✓ 1 file, 1 module |
| `location-test-orchestrators.page.ts` | shared orchestrators | ✓ explicit shared infra |

**No instances of the W1-03 merged-page anti-pattern found.**

### `clients/encore/src/selectors/locations/` — 11 files

| File | Selectors namespace | Module(s) covered | Verdict |
|---|---|---|---|
| `account-address.ts` | SetupAccountAddressSelectors | account_address | ✓ 1:1 |
| `auto-addon.ts` | SetupAutoAddonSelectors | auto_addon | ✓ 1:1 |
| `currency.ts` | SetupCurrencySelectors | currency | ✓ 1:1 |
| `history.ts` | SetupHistorySelectors | management_history | ⚠ naming-drift only (filename `history.ts` for "management-history" module) |
| `left-panel.ts` | SetupLeftPanelSelectors | left_panel | ✓ 1:1 |
| `legal.ts` | SetupLegalSelectors | legal | ✓ 1:1 |
| `local-info.ts` | SetupLocalInfoSelectors | local_information | ✓ 1:1 |
| `notes.ts` | SetupNotesSelectors | notes | ✓ 1:1 |
| `pricing.ts` | SetupPricingSelectors | pricing | ✓ 1:1 |
| `shared-setup-locations.ts` | SetupSharedSetupLocationsSelectors | shared_setup_locations | ✓ 1:1 |
| `shared.ts` | SetupSharedSelectors | shared infra | ✓ explicit shared |

**No instances of the W1-03 merged-selector anti-pattern found.**

---

## Adjacent observations (out-of-scope; flag-only)

### Observation 1 — Naming drift in `selectors/locations/history.ts`

File name `history.ts` does not match its module context "Location Management History" (vs. the parent page `location-management-history.page.ts`). All sibling selector files match their page-object module name. Renaming `history.ts` → `management-history.ts` (and `SetupHistorySelectors` → `SetupManagementHistorySelectors`) would restore naming consistency. NOT a structural anti-pattern; pure cosmetic.

### Observation 2 — `pages/locations/location-left-panel.page.ts` missing

`selectors/locations/left-panel.ts` exists with `SetupLeftPanelSelectors`, but no corresponding `location-left-panel.page.ts` page-object exists. Pattern is "0 files where 1 expected" — DIFFERENT from W1-03's "1 file where N expected". Already tracked separately: parent plan §B left_panel row routes this to the FCC master roadmap (`SUBPLAN_LEFT_PANEL_FCC`).

---

## Disposition

Both observations are flagged here for traceability but are NOT W1-03 scope:
- Observation 1 → can be addressed in a future cosmetic-cleanup subplan if priority warrants
- Observation 2 → already routed to FCC master roadmap per parent plan

W1-03's anti-pattern target (merged BAS+HIS+ECT) was the sole instance in the codebase and has been resolved by this subplan's Phase 2 + Phase 3 splits.

**Closing note**: this list does NOT trigger LR-046 strict-line escalation — no findings indicate a pre-existing W1-03-style violation; the locations modules were correctly split from the start.
