# Corporate Pricing — Product Group Override Test Cases — NM-2268 (Location Picker)

**Module**: corporate-override | **Total**: 7 | **Status**: Automated | **Updated**: 2026-07-27

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-038: Typing a partial office number narrows picker rows; clearing restores the full list
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Change Local Office picker dialog | The "Change Local Office" picker dialog opens and displays the location list. |
| 2 | Type "1107" into the "Search by Location Name, Number" textbox -> the table narrows to offices matching "1107" | The location table narrows to show only offices matching "1107". |
| 3 | at least one row with "1107" is visible | At least one row containing "1107" is visible in the table. |
| 4 | Clear the search box -> the table restores to show more rows than the narrowed set | The location table restores to display more rows than the narrowed set. |

**Expected**: The picker search box filters the location table client-side (no API call per keystroke). Typing a partial office number narrows the visible rows to matching entries; clearing the input restores the full list. Cancel closes the picker with no location applied to the grid.
**Data**: location=1606 (trigger); search needle "1107"

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-039: Picker Active checkbox defaults to unchecked; toggling is a client-side filter — no location-lookup server request fires on toggle
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes

**Preconditions**: On the Override screen with location 1606 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Change Local Office picker dialog — a location-lookup API call fires (positive control proving the network listener works) | The picker dialog opens and a location-lookup API request fires. |
| 2 | assert postFired=true and locationCount > 0 | The network request is confirmed fired and the picker displays a non-zero location count. |
| 3 | Assert: Active checkbox is UNCHECKED (aria-checked=false / data-state=unchecked) by default | The Active checkbox is displayed unchecked by default. |
| 4 | Toggle Active to CHECKED — assert NO location-lookup API call fires (toggle is a client-side filter; server ignores activeOnly parameter) | The Active checkbox becomes checked and no additional location-lookup API request fires. |
| 5 | assert checkbox is CHECKED | The Active checkbox is displayed checked. |
| 6 | assert row list still renders rows | The location row list continues to display rows. |
| 7 | Search "1107" while Active is CHECKED — list narrows to matching offices (search and Active compose) | The row list narrows to offices matching "1107" while the Active checkbox stays checked. |
| 8 | Clear search | The search box clears and the full row list is restored. |
| 9 | toggle Active back to UNCHECKED — assert still NO location-lookup API call fires | The Active checkbox becomes unchecked and no additional location-lookup API request fires. |
| 10 | assert checkbox is UNCHECKED | The Active checkbox is displayed unchecked. |
| 11 | assert rows visible | The location row list is displayed with rows visible. |
| 12 | Cancel -> the original 1606 grid is unaffected (no new location applied) | The picker closes and the original 1606 grid remains unaffected with no new location applied. |

**Expected**: Opening the picker fires a location-lookup API call (positive control). Toggling the Active checkbox is a client-side filter — no location-lookup API call fires on toggle (server ignores the activeOnly parameter; both checked and unchecked return the same 2,651 active-only location set). Default state is UNCHECKED. Search composes with the Active filter. This test fails when the app is fixed to honor activeOnly server-side (the postFired=false assertions flip).

Note: BUG-CONFIRMED-B — activeOnly ignored server-side (1222 evidence walk-evidence-F); open fires a POST (positive control), toggle fires 0 POSTs (reviewer-confirmed attempt 4). On fix, flip the postFired assertions to toBe(true) and assert that unchecked -> inactive offices appear and checked -> they are hidden.
**Data**: location=1606 (trigger)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-040: Non-Revenue-Management user sees a read-only Override grid — no edit, no Save, no Import
| Priority | Status | Type |
|----------|--------|------|
| High | Skipped (blocked) | Functional |

**Depends_On**: TC-CPR-OVR-004
**Automatable**: Yes — pending a second test account with a non-RM role

**Preconditions**: Logged in as a non-Revenue-Management user.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Corporate Pricing Override screen | The Corporate Pricing Override screen loads in read-only mode. |
| 2 | Attempt to click an Override Price cell -> no field editor reveals (cell is inert) | The Override Price cell does not switch into edit mode. |
| 3 | Observe the Save button -> absent or permanently disabled | The Save button is displayed disabled or hidden. |
| 4 | Observe the Import button -> absent or disabled | The Import button is absent or disabled. |

"Blocked reason": blocked-pending-question: RBAC-role-switch - the automation environment provisions a single account with full edit rights; no in-app role-switch is available. Test is authored but.skip-annotated until a second non-RM account is provisioned |

**Expected**: A non-Revenue-Management user cannot edit Override cells, trigger Save, or access Import. The grid renders in read-only mode (Revenue Management role required for edit access).

**Blocked reason**: blocked-pending-question: RBAC-role-switch — the automation environment provisions a single account with full edit rights; no in-app role-switch is available. Test is authored but `.skip`-annotated until a second non-RM account is provisioned.
**Data**: non-RM test account (not yet provisioned)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-111: Pressing Escape closes the location picker without applying a location
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-029
**Automatable**: Yes
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 selected (grid populated).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Change Local Office" picker dialog | The "Change Local Office" picker dialog opens. |
| 2 | Press Escape → the dialog closes | The picker dialog closes. |
| 3 | Read the grid → the same rows are present | The grid displays the same rows as before the picker was opened. |
| 4 | Save remains disabled (no location change applied) | The Save button remains disabled. |

**Expected**: Pressing Escape dismisses the location picker without applying a new location or dirtying the form. The grid content and Save state are unchanged.
**Data**: office=1606

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-112: Cancel closes the location picker without applying a location
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-029
**Automatable**: Yes
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 selected (grid populated).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Change Local Office" picker dialog | The "Change Local Office" picker dialog opens. |
| 2 | Click the Close (X) button in the dialog header → the dialog closes | The picker dialog closes. |
| 3 | Read the grid → the same rows are present | The grid displays the same rows as before the picker was opened. |
| 4 | Save remains disabled | The Save button remains disabled. |

**Expected**: The Close-X button dismisses the picker identically to Cancel — no location is applied, no unsaved changes.
**Data**: office=1606

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-113: No-results empty state in the location picker when search matches nothing
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-038
**Automatable**: Yes
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Change Local Office" picker dialog | The "Change Local Office" picker dialog opens and displays the location list. |
| 2 | Type a nonsense string (e.g. "zzz999nonexistent") into the search box → the location table shows zero rows | The location list narrows to zero rows. |
| 3 | Assert the empty state is announced (a "no results" message or zero-row indicator is visible, not a silent blank) | A "no results" message or zero-row indicator is displayed. |
| 4 | Close the dialog (Cancel or Escape) | Searching for a term that matches no office renders an explicit empty state - the picker does not show a silent blank table. The empty state is visually distinguishable from a loading state |

**Expected**: Searching for a term that matches no office renders an explicit empty state — the picker does not show a silent blank table. The empty state is visually distinguishable from a loading state.
**Data**: office=1606; search needle "zzz999nonexistent"

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-114: Re-selecting the current office does not dirty the form (no net change)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-029
**Automatable**: Yes
**Surface_Family**: launcher (QUICK)

**Preconditions**: On the Override screen with office 1606 already selected and the grid populated; Save is disabled.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Change Local Office" picker dialog | The "Change Local Office" picker dialog opens. |
| 2 | Search "1606", check the office 1606 row, click Select → the dialog closes | The picker dialog closes after the selection. |
| 3 | Read Save button state → still disabled (re-selecting the same office is a no-op) | The Save button remains disabled. |
| 4 | Read the grid → rows unchanged | The grid displays the same rows as before. |
| 5 | anchor row PG 2609 still present | PG 2609 is present in the grid. |

**Expected**: Re-selecting the already-active office is a revert-to-same operation (LR-009, no net change) — no dirty flag, Save stays disabled, grid content unchanged. The picker does not treat a same-office selection as a mutation.
**Data**: office=1606; anchor PG 2609

---

