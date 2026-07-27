# Corporate Pricing — Product Group Override Test Cases — NM-2273 (Import)

**Module**: corporate-override | **Total**: 18 | **Status**: Automated | **Updated**: 2026-07-27

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-148: Import dialog keeps Upload disabled until a file is attached
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-033
**Automatable**: Yes

**Preconditions**: On the Override screen with the certified import target office 4107 selected; no file attached.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Import toolbar action → the "Import All Pricing Overrides" dialog opens with a Cancel control | The "Import All Pricing Overrides" dialog opens and a Cancel control is visible. |
| 2 | Read the Upload button state before attaching a file → disabled | The Upload button is displayed disabled. |
| 3 | the "No file selected" hint is shown | The "No file selected" hint text is displayed. |
| 4 | Attach a file to the dialog's file input → the Upload button becomes enabled | The Upload button becomes enabled. |
| 5 | Cancel the dialog → it closes with nothing uploaded | The dialog closes without uploading any file. |

**Expected**: The Upload button stays disabled and "No file selected" is shown until a file is attached; attaching a file enables Upload. This gate prevents an empty upload. Cancel dismisses the dialog without importing.
**Data**: office=4107; dialog title="Import All Pricing Overrides"; attached fixture=malformed.csv (any file exercises the enable transition)

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-149: Malformed CSV is rejected with a readable error and changes zero rows
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; the target row (product group 4298) present with its baseline Override Price.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Capture the target row's Override Price and the visible row count before the import | The target row's Override Price and the grid row count are displayed. |
| 2 | Open the Import dialog → attach malformed.csv → click Upload | The Import dialog opens. |
| 3 | Read the rejection alert → matches "Error Row#:N, Msg: LocationId, ProductGroupId, OverridePrice is required." | A required-field rejection alert is displayed. |
| 4 | Reload + re-select office 4107 and re-read the grid | A malformed CSV is rejected with a readable required-field error and the dialog stays open. After a reload the Override Price and row count are unchanged - the rejection prevented any mutation (the reload is the oracle, not the upload's own signal) |

**Expected**: A malformed CSV is rejected with a readable required-field error and the dialog stays open. After a reload the Override Price and row count are unchanged — the rejection prevented any mutation (the reload is the oracle, not the upload's own signal).
**Data**: office=4107; fixture=malformed.csv (import-all); reject pattern=/Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-150: Empty CSV is rejected with a file-format error and changes zero rows
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; the target row (product group 4298) present with its baseline Override Price.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Capture the target row's Override Price and the visible row count before the import | The target row's Override Price and the grid row count are displayed. |
| 2 | Open the Import dialog → attach empty.csv (0 bytes) → click Upload | The Import dialog opens. |
| 3 | Read the rejection alert → equals "Please check the upload file format." | A file-format rejection alert is displayed. |
| 4 | Reload + re-select office 4107 and re-read the grid | An empty file is rejected with a readable file-format error (a distinct message from the malformed-row error) and the dialog stays open. After a reload the Override Price and row count are unchanged |

**Expected**: An empty file is rejected with a readable file-format error (a distinct message from the malformed-row error) and the dialog stays open. After a reload the Override Price and row count are unchanged.
**Data**: office=4107; fixture=empty.csv (import-all); reject message="Please check the upload file format."

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-151: Valid import round-trip updates the Override Price then restores it (office 4107 / product group 4298)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The Export toolbar action produces the tenant-wide CSV (used here only to read the exact target row).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Export the CSV and extract the single target row (office 4107 / product group 4298) verbatim, together with the header line | The CSV file downloads and the target row is displayed with the header line. |
| 2 | Read the target row's live baseline Override Price | The target row's baseline Override Price is displayed. |
| 3 | compute a modified value = baseline + 0.01 | The modified value is calculated as the baseline plus 0.01. |
| 4 | Build a minimal 2-line file (header + the one target row) with only the Override Price rewritten | The minimal 2-line file is prepared with the rewritten Override Price. |
| 5 | upload it and wait for the import request to return | The import request is submitted and a response is returned. |
| 6 | Assert the import request is accepted (HTTP 200), then reload and assert the target's Override Price equals the modified value | The import request returns HTTP 200 and the target row displays the modified Override Price after reload. |
| 7 | Canary: re-select office 1105 and assert its full row set is intact (a minimal import upserts only the rows in the file, so a location absent from the file must keep every row) | Office 1105 displays its full, unchanged row set. |
| 8 | Build and upload the baseline file the same way to restore | The baseline file is uploaded and accepted. |
| 9 | reload and assert the Override Price is back to the original | A minimal valid import updates the target Override Price and restores it. The import commits directly (no preview) and upserts only the rows present in the file, so a location absent from the file is left untouched. A minimal file returns a clean HTTP 200 - unlike the full tenant dump, which stalls the client at "Uploading... 50%" with no response - giving the round-trip a deterministic completion signal |

**Expected**: A minimal valid import updates the target Override Price and restores it. The import commits directly (no preview) and upserts only the rows present in the file, so a location absent from the file is left untouched. A minimal file returns a clean HTTP 200 — unlike the full tenant dump, which stalls the client at "Uploading… 50%" with no response — giving the round-trip a deterministic completion signal.
**Data**: office=4107; product group=4298; modified=baseline+0.01; canary office=1105 (9 rows); upload file = header + the single target row

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-153: Import rejects a row with an invalid currency and applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The import is a per-row partial-success upload that returns a result body with success/failure counts — a 200 response does not by itself mean a row applied.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Open the Import dialog → attach a file whose single row carries an unsupported currency → click Upload | The Import dialog opens. |
| 3 | Read the import result: the request returns HTTP 200 but reports 0 rows applied, 1 failed, with an error naming the Currency field | The import result displays HTTP 200 with 0 rows applied, 1 failed, and an error naming the Currency field. |
| 4 | Reload + re-select office 4107 and re-read the grid | The invalid-currency row is refused (0 applied, 1 failed) and the grid is unchanged. Confirms a 200 response alone is not proof of application - the per-row result body is the oracle |

**Expected**: The invalid-currency row is refused (0 applied, 1 failed) and the grid is unchanged. Confirms a 200 response alone is not proof of application — the per-row result body is the oracle.
**Data**: office=4107; product group=4298; fixture=override-invalid-currency.csv; error contains "invalid data for Currency"

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-154: Import rejects a negative Override Price and applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Attach a file whose row sets a negative Override Price → click Upload | The file is attached and the Upload button becomes enabled. |
| 3 | Read the result: HTTP 200, 0 applied, 1 failed, error naming the Override Price field | The import result displays HTTP 200 with 0 rows applied, 1 failed, and an error naming the Override Price field. |
| 4 | Reload and re-read the grid | The negative-price row is refused and the grid is unchanged |

**Expected**: The negative-price row is refused and the grid is unchanged.
**Data**: office=4107; product group=4298; fixture=override-negative-price.csv; error contains "invalid data for OverridePrice"

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-155: Import rejects an Override Discount above 100 — the 100 cap is enforced on import too
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The grid caps Max Discount at 100 on manual edit.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Attach a file whose row sets an Override Discount greater than 100 → click Upload | The file is attached and the Upload button becomes enabled. |
| 3 | Read the result: HTTP 200, 0 applied, 1 failed, error naming the Override Discount field | The import result displays HTTP 200 with 0 rows applied, 1 failed, and an error naming the Override Discount field. |
| 4 | Reload and re-read the grid | The over-100 discount row is refused - import enforces the same 100 cap as the grid (no import backdoor around the cap). The grid is unchanged |

**Expected**: The over-100 discount row is refused — import enforces the same 100 cap as the grid (no import backdoor around the cap). The grid is unchanged.
**Data**: office=4107; product group=4298; fixture=override-discount-over-100.csv; error contains "invalid data for OverrideDiscount"

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-156: Import rejects a non-numeric Override Price with a decimal-format error
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Attach a file whose row sets a non-numeric Override Price → click Upload | The file is attached and the Upload button becomes enabled. |
| 3 | Read the rejection alert | A decimal-format rejection alert is displayed naming the Override Price field. |
| 4 | Reload and re-read the grid | After reloading, the grid still shows the original values; the invalid price was not persisted. |

**Expected**: A non-numeric price is rejected with a message that the Override Price must be a decimal within two decimal places; the grid is unchanged. (This is a parse-level rejection surfaced as an alert, distinct from the body-level semantic rejections.)
**Data**: office=4107; product group=4298; fixture=override-nonnumeric-price.csv; alert pattern=/Error Row#:\d+, Msg: The Override Price should be decimal format within two decimal places\./

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-157: Import rejects a nonexistent Product Group Id and applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Attach a file whose row references a product group id that does not exist → click Upload | The file is attached and the Upload button becomes enabled. |
| 3 | Read the result: HTTP 200, 0 applied, 1 failed, error stating the product group id does not exist | The import result displays HTTP 200 with 0 rows applied, 1 failed, and an error stating the product group id does not exist. |
| 4 | Reload and re-read the grid | The row referencing a nonexistent product group is refused (referential integrity) and the grid is unchanged |

**Expected**: The row referencing a nonexistent product group is refused (referential integrity) and the grid is unchanged.
**Data**: office=4107; fixture=override-nonexistent-pg.csv; error contains "ProductGroupId '9999999' does not exist"

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-158: Import rejects a nonexistent Location and applies nothing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Attach a file whose row references a location number that does not exist → click Upload | The file is attached and the Upload button becomes enabled. |
| 3 | Read the result: HTTP 200, 0 applied, 1 failed, error stating the location does not exist | The import result displays HTTP 200 with 0 rows applied, 1 failed, and an error stating the location does not exist. |
| 4 | Reload and re-read the grid | The row referencing a nonexistent location is refused and the grid is unchanged |

**Expected**: The row referencing a nonexistent location is refused and the grid is unchanged.
**Data**: office=4107; fixture=override-nonexistent-location.csv; error contains "LocationNo '9999999' does not exist"

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-159: Import rejects a row with too few columns naming the required fields
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Attach a file whose data row has fewer columns than the header → click Upload | The file is attached and the Upload button becomes enabled. |
| 3 | Read the rejection alert | A rejection alert is displayed naming the required fields. |
| 4 | Reload and re-read the grid | A row with missing columns is rejected with a message naming the required Location / Product Group / Override Price fields; the grid is unchanged |

**Expected**: A row with missing columns is rejected with a message naming the required Location / Product Group / Override Price fields; the grid is unchanged.
**Data**: office=4107; product group=4298; fixture=override-too-few-columns.csv; alert pattern=/Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-160: Import ignores extra trailing columns and applies the valid row
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The fixture keeps the certified baseline Override Price so acceptance is proven without changing the value.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Attach a file whose row carries two extra trailing columns beyond the header → click Upload | The file is attached and the Upload button becomes enabled. |
| 2 | Read the result: HTTP 200, 1 applied, 0 failed | The import result displays HTTP 200 with 1 row applied and 0 failed. |
| 3 | Reload and re-read the grid | Extra trailing columns are ignored (not an error); the leading fields are taken and the row is applied. The grid holds the certified baseline value (no drift) |

**Expected**: Extra trailing columns are ignored (not an error); the leading fields are taken and the row is applied. The grid holds the certified baseline value (no drift).
**Data**: office=4107; product group=4298; fixture=override-extra-columns.csv; baseline Override Price 152.00

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-161: Import rejects a header-only file with a file-format error
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's Override Price before the import | The target row's Override Price is displayed. |
| 2 | Attach a file that has only the header and no data rows → click Upload | The file is attached and the Upload button becomes enabled. |
| 3 | Read the rejection alert | A "Please check the upload file format." rejection alert is displayed. |
| 4 | Reload and re-read the grid | A header-only file is rejected with a "Please check the upload file format." message; the grid is unchanged |

**Expected**: A header-only file is rejected with a "Please check the upload file format." message; the grid is unchanged.
**Data**: office=4107; product group=4298; fixture=override-header-only.csv; alert="Please check the upload file format."

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-162: Import blocks a non-CSV file — Upload stays disabled with an unsupported-type message
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Import dialog → attach a plain-text (.txt) file | The Import dialog opens. |
| 2 | Read the Upload button state and the dialog message | A non-CSV file leaves the Upload button disabled and the dialog shows "Unsupported file type. Allowed:.csv" - the upload never fires. The file-type gate is client-side |

**Expected**: A non-CSV file leaves the Upload button disabled and the dialog shows "Unsupported file type. Allowed: .csv" — the upload never fires. The file-type gate is client-side.
**Data**: office=4107; fixture=wrong-format.txt; message="Unsupported file type. Allowed: .csv"

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-163: Import dialog shows the attached file and dismisses without uploading
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Import dialog → confirm it starts with a "No file selected" hint and offers both a Cancel and a Close control | The Import dialog opens. |
| 2 | Attach a file → confirm the "No file selected" hint is gone (the attached file registered) | The attached file name is displayed, replacing the "No file selected" hint. |
| 3 | Dismiss the dialog | The dialog offers two redundant dismiss controls (Cancel and Close). Attaching a file clears the "No file selected" hint, and dismissing closes the dialog with nothing uploaded |

**Expected**: The dialog offers two redundant dismiss controls (Cancel and Close). Attaching a file clears the "No file selected" hint, and dismissing closes the dialog with nothing uploaded.
**Data**: office=4107; fixture=malformed.csv (attach only, no upload)

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-164: A file mixing one valid row and one invalid row is a partial success — the valid row applies, the invalid one fails
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present. The import processes rows independently (a per-row partial-success upload), not all-or-nothing.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's baseline Override Price | The target row's baseline Override Price is displayed. |
| 2 | Build a two-row file: row 1 re-imports the target at its current baseline value (a valid row that changes nothing), row 2 references a nonexistent product group | The two-row file is prepared and attached. |
| 3 | Upload the file and read the import result | The import result displays 1 row applied and 1 row failed. |
| 4 | Reload + re-read the grid | The upload is a partial success - the valid row applies (1 applied) while the invalid row fails independently (1 failed) with an error naming the nonexistent product group. Rows are NOT all-or-nothing. The target keeps its baseline value |

**Expected**: The upload is a partial success — the valid row applies (1 applied) while the invalid row fails independently (1 failed) with an error naming the nonexistent product group. Rows are NOT all-or-nothing. The target keeps its baseline value.
**Data**: office=4107; product group=4298; valid row at baseline + invalid product group 9999999; error contains "ProductGroupId '9999999' does not exist"

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-165: A file with duplicate rows for the same override is accepted (both rows succeed, no duplicate error)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's baseline Override Price | The target row's baseline Override Price is displayed. |
| 2 | Build a file with the same target row twice, both at the current baseline value (so the import changes nothing) | The duplicate-row file is prepared and attached. |
| 3 | Upload the file and read the import result | The import result displays 2 rows applied and 0 failed. |
| 4 | Reload + re-read the grid | Both duplicate rows are accepted (2 applied, 0 failed) - the import does not reject duplicate keys; it is idempotent. The target keeps its baseline value |

**Expected**: Both duplicate rows are accepted (2 applied, 0 failed) — the import does not reject duplicate keys; it is idempotent. The target keeps its baseline value.
**Data**: office=4107; product group=4298; target row duplicated at baseline

---


## MCP_VERIFICATION_LOG

See `corporate_override_core_test_cases.md` — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See `corporate_override_core_test_cases.md` — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See `corporate_override_core_test_cases.md` — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-166: A large batch (6000 rows) is processed per-row without a stall or size limit
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 4107 selected; product group 4298 present.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the target row's baseline Override Price | The target row's baseline Override Price is displayed. |
| 2 | Build a 6000-row file, every row referencing a nonexistent product group (reject-safe — no row can change data) | The 6000-row file is prepared and attached. |
| 3 | Upload the file and read the import result | The import result displays 0 rows applied and 6000 rows failed. |
| 4 | Reload + re-read the grid | The large batch returns a normal per-row result (0 applied, 6000 failed) without a stall or a "file too large" error - there is no separate oversized-file gate, and a large all-invalid file does not exhibit the full-valid-dump stuck-upload behavior. The target is unchanged |

**Expected**: The large batch returns a normal per-row result (0 applied, 6000 failed) without a stall or a "file too large" error — there is no separate oversized-file gate, and a large all-invalid file does not exhibit the full-valid-dump stuck-upload behavior. The target is unchanged.
**Data**: office=4107; 6000 rows referencing product group 9999999
