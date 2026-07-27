# Corporate Pricing — Product Group Override Test Cases — NM-2272 (Export)

**Module**: corporate-override | **Total**: 19 | **Status**: Automated | **Updated**: 2026-07-27

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-128: Export returns every location in the tenant, not just the selected office
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Export and capture the downloaded CSV | The CSV file downloads. |
| 2 | Read the Location Id column from every data row | The Location Id values are displayed for every data row in the file. |
| 3 | Count the distinct values | The file contains many different Location Ids - hundreds of offices, not just the one selected on screen. Export is tenant-wide and takes no notice of the location picker |

**Expected**: The file contains many different Location Ids — hundreds of offices, not just the one selected on screen. Export is tenant-wide and takes no notice of the location picker.
**Data**: floor: more than 500 distinct Location Ids (observed 1,782 on 2026-07-21)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-129: Export carries the full override population, well above any single office
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the grid row count | The current grid row count is displayed. |
| 2 | Click Export and capture the CSV | The CSV file downloads. |
| 3 | Count the data rows in the file | The exported file carries thousands of rows and strictly more than the grid is showing, confirming it is the whole tenant rather than the current view |

**Expected**: The exported file carries thousands of rows and strictly more than the grid is showing, confirming it is the whole tenant rather than the current view.
**Data**: floor: more than 5,000 data rows (observed 8,996 on 2026-07-21); file rows > grid rows

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-130: Switching to the Labor tab re-scopes the grid but not the export
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-002, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with an office selected that has rows on both the Equipment and Labor tabs.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the Equipment tab, export and record both the file content and the grid row count | The CSV file downloads and the Equipment grid row count is displayed. |
| 2 | Switch to the Labor tab and confirm aria-selected moved and the grid row count changed | The Labor tab becomes active and the grid displays a different row count. |
| 3 | Export again | A second CSV file downloads. |
| 4 | Compare the two files and read the distinct Is Labor values in the second one | The tab visibly re-scopes the grid but the two exports are identical, and the file still carries both Is Labor 0 and Is Labor 1 rows. The tab is a view filter the export ignores |

**Expected**: The tab visibly re-scopes the grid but the two exports are identical, and the file still carries both Is Labor 0 and Is Labor 1 rows. The tab is a view filter the export ignores.
**Data**: Equipment/Labor tabs; Is Labor values 0 and 1 both present in the file

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-131: Choosing a different office re-scopes the grid but not the export
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-030, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Export and record the file and the grid row count | The CSV file downloads and the grid row count is displayed. |
| 2 | Open the Change Local Office picker and select office 1974 | Office 1974 is selected and the picker closes. |
| 3 | Confirm the grid now shows a different number of rows | The grid displays a different row count. |
| 4 | Export again and compare the two files | Choosing a different office visibly changes the grid, and the two exports are identical. The location picker does not scope the export |

**Expected**: Choosing a different office visibly changes the grid, and the two exports are identical. The location picker does not scope the export.
**Data**: second office 1974 (161 Equipment rows on 2026-07-21)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-132: Active only hides inactive rows in the grid; the export keeps them
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-042, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected — the only walk-verified bed carrying inactive rows (9 total, 7 active).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With Active only off, record the grid row count | The grid row count is displayed with Active only off. |
| 2 | Check Active only and confirm the grid row count dropped | The grid row count decreases. |
| 3 | Export and read the Is Active column | Active only visibly removes rows from the grid, yet the exported file still contains Is Active = 0 rows. The filter never reaches the file |

**Expected**: Active only visibly removes rows from the grid, yet the exported file still contains Is Active = 0 rows. The filter never reaches the file.
**Data**: office 1105; 9 rows unfiltered, 7 with Active only; inactive rows present in the export

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-133: The Currency filter empties the grid for an absent currency; the export still carries every currency
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-043, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with an office selected and the Currency filter at ALL.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Record the grid row count at Currency ALL | The grid row count is displayed with Currency at ALL. |
| 2 | Select a specific currency and confirm the grid row count changed | The grid row count changes. |
| 3 | Export and read the distinct Currency values in the file | The Currency filter visibly re-scopes the grid - down to zero rows for a currency with no data - while the export still carries every currency in the tenant |

**Expected**: The Currency filter visibly re-scopes the grid — down to zero rows for a currency with no data — while the export still carries every currency in the tenant.
**Data**: currencies USD / CAD / MXN; at least 3 distinct currencies in the export

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-134: The text filter narrows the grid; the export is unchanged
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-045, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with an office selected and no text filter applied.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Export and record the file and the grid row count | The CSV file downloads and the grid row count is displayed. |
| 2 | Type the first six characters of the first row’s Product Group Name into the filter box | The grid narrows to rows matching the entered characters. |
| 3 | Confirm the grid narrowed but still shows at least one row | At least one row remains displayed in the narrowed grid. |
| 4 | Export again and compare the two files | The text filter visibly narrows the grid while the export is byte-for-byte unchanged. The needle is taken from a real row so the filter is guaranteed to match something |

**Expected**: The text filter visibly narrows the grid while the export is byte-for-byte unchanged. The needle is taken from a real row so the filter is guaranteed to match something.
**Data**: needle derived live from the first visible Product Group Name

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-135: Rows-per-page changes how much of the grid is drawn; the export is unchanged
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1974 selected (161 Equipment rows, enough to span pages).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set rows per page to 10, record how many rows are drawn, and export | 10 rows are displayed and the CSV file downloads. |
| 2 | Set rows per page to 50 and confirm more rows are drawn | More rows are displayed on the page. |
| 3 | Export again and compare the two files | Page size visibly changes how much of the grid is drawn while both exports are identical. Pagination is a view concern the export does not share |

**Expected**: Page size visibly changes how much of the grid is drawn while both exports are identical. Pagination is a view concern the export does not share.
**Data**: office 1974; page sizes 10 and 50

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-136: Export on an empty, unscoped grid still returns the whole tenant
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-003, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: A fresh load of the Override screen with no office selected — the grid reads "No results." / "0 items found".

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm the grid is empty and shows zero rows | The grid displays "No results." and zero rows. |
| 2 | Click Export (the button stays enabled on an empty grid) | The CSV file downloads. |
| 3 | Count the data rows and the distinct Location Ids in the file | Export is enabled on an empty grid and downloads the entire tenant. What the screen shows and what the file contains are unrelated - this is the surprising branch, recorded deliberately so a future change to it is caught |

**Expected**: Export is enabled on an empty grid and downloads the entire tenant. What the screen shows and what the file contains are unrelated — this is the surprising branch, recorded deliberately so a future change to it is caught.
**Data**: no office selected; floors of 5,000 rows and 500 locations

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-137: The Equipment grid row count reconciles with the export rows for that office
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected, the Equipment tab active and Active only off.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the grid row count | The current Equipment grid row count is displayed. |
| 2 | Export and keep only the rows whose Location Id matches the selected office | The CSV file downloads containing rows for the selected office. |
| 3 | Split those rows on Is Labor | The Is Labor = 0 rows for this office match the Equipment grid row count exactly, and the office's total rows in the file are greater than or equal to that. The file folds both tabs together; the grid shows one half at a time. This is why a raw "grid count equals file count" comparison would be wrong |

**Expected**: The Is Labor = 0 rows for this office match the Equipment grid row count exactly, and the office’s total rows in the file are greater than or equal to that. The file folds both tabs together; the grid shows one half at a time. This is why a raw "grid count equals file count" comparison would be wrong.
**Data**: Equipment grid count vs Is Labor = 0 rows for the same Location Id

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-139: The CSV is well-formed — consistent line endings, a full column set on every row, and quoted inch marks
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-038
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Export and read the raw bytes of the downloaded file | The CSV file downloads. |
| 2 | Check the line endings on the bytes, not on the decoded text | The file's line endings are displayed as plain LF characters. |
| 3 | Split every data row and compare its field count to the header | Every data row displays the same field count as the header. |
| 4 | Find the rows that use doubled quotes and check the quoting is well formed | Line endings are plain LF with no carriage returns anywhere, every data row has the full nine fields, and product group names containing inch marks are correctly quoted with doubled quote characters. Checked on the raw bytes because reading the file as text hides the line-ending difference |

**Expected**: Line endings are plain LF with no carriage returns anywhere, every data row has the full nine fields, and product group names containing inch marks are correctly quoted with doubled quote characters. Checked on the raw bytes because reading the file as text hides the line-ending difference.
**Data**: LF endings, zero CR bytes; 9 fields per row; more than 100 quoted rows

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-140: The header row follows the requested locale while the data rows stay identical
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen, signed in. The export endpoint is called directly because the Export button always sends en-US.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Request the export at en-US and record the header row and data rows | The CSV file downloads with an English header row. |
| 2 | Request it at each translating locale and compare the header and the data | The header row is displayed translated for French and Mexican Spanish, with the data rows unchanged. |
| 3 | Request it at each fallback locale and compare the header | French and Mexican Spanish translate the header row; German and British English fall back to the English header. In every case the data rows are identical to English - a locale that reformatted numbers would corrupt every row of a comma-delimited file, so this is the half that matters |

**Expected**: French and Mexican Spanish translate the header row; German and British English fall back to the English header. In every case the data rows are identical to English — a locale that reformatted numbers would corrupt every row of a comma-delimited file, so this is the half that matters.
**Data**: translating: fr-FR, es-MX; fallback: de-DE, en-GB

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-141: A malformed or unknown locale falls back to English instead of failing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-079
**Automatable**: Yes

**Preconditions**: On the Override screen, signed in.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Request the export with each malformed locale value | The export request returns HTTP 200 for every malformed locale value. |
| 2 | Compare each response status, header row and row count against en-US | The header row and row count match the English export. |
| 3 | Request the export with the locale parameter omitted entirely | Every malformed or unknown locale returns 200 with the English header and the same data - the endpoint degrades gracefully instead of failing. Omitting the parameter behaves the same as English |

**Expected**: Every malformed or unknown locale returns 200 with the English header and the same data — the endpoint degrades gracefully instead of failing. Omitting the parameter behaves the same as English.
**Data**: malformed values: zz-ZZ, xx, %20; plus the parameter omitted

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-142: The grid loads for every healthy office, and office 1604 still fails the way we recorded it
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-001
**Automatable**: Yes

**Preconditions**: On the Override screen, signed in.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ask the grid’s data endpoint for each known-healthy office and check the status code | The data endpoint returns HTTP 200 for every known-healthy office. |
| 2 | Ask it for office 1604 and check the status code and the error body | Every healthy office returns 200. Office 1604 still returns a server error carrying the same duplicate-key signature that was recorded, or 200 if it has since been fixed. Reads the status code rather than the grid because the screen renders a failed request as "0 items found" - indistinguishable from a genuinely empty office, which would let an ordinary emptiness assertion pass on a broken screen |

**Expected**: Every healthy office returns 200. Office 1604 still returns a server error carrying the same duplicate-key signature that was recorded, or 200 if it has since been fixed. Reads the status code rather than the grid because the screen renders a failed request as "0 items found" — indistinguishable from a genuinely empty office, which would let an ordinary emptiness assertion pass on a broken screen.
**Data**: healthy: 1105, 1974, 9187, 9019, 9185, 1115; known-bad: 1604 ("same key has already been added")

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-143: Tab, Currency and Active only combine without losing rows or breaking the export
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-044, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and no filters applied.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Export to establish a baseline file | The CSV file downloads as the baseline. |
| 2 | Record the unfiltered grid row count | The unfiltered grid row count is displayed. |
| 3 | Apply Active only and record the count | The grid row count decreases or stays the same with Active only applied. |
| 4 | Add a specific Currency and record the count | The grid row count decreases or stays the same with the Currency filter applied. |
| 5 | Switch to the Labor tab with both filters still applied | The Labor tab becomes active with both filters still applied. |
| 6 | Export again and compare against the baseline | Each filter added narrows the result or leaves it unchanged - never widens it - the tab still switches with two filters applied, and no combination of filters changes the exported file |

**Expected**: Each filter added narrows the result or leaves it unchanged — never widens it — the tab still switches with two filters applied, and no combination of filters changes the exported file.
**Data**: Active only + a specific Currency + the Labor tab, applied together

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-144: Rows-per-page survives a reload, and the export is unaffected either way
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-073
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1974 selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Export to establish a baseline file | The CSV file downloads as the baseline. |
| 2 | Set rows per page to 50 and confirm more rows are drawn than the default | More rows are displayed on the page than the default. |
| 3 | Reload the page and re-select the office | The page reloads and the grid re-populates for the selected office. |
| 4 | Read the grid row count and export again | Whether the page-size choice survives a reload is the app's decision and is read rather than assumed; what must hold either way is that the grid still renders rows and the export is identical to the baseline |

**Expected**: Whether the page-size choice survives a reload is the app’s decision and is read rather than assumed; what must hold either way is that the grid still renders rows and the export is identical to the baseline.
**Data**: office 1974; default page size 20, changed to 50, then reloaded

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-145: Sorting the grid does not reorder the exported file
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-046, TC-CPR-OVR-032
**Automatable**: Yes

**Preconditions**: On the Override screen with the fixture office selected and no sort applied.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Export and record the file and the first row’s Product Group Name | The CSV file downloads and the first grid row's Product Group Name is displayed. |
| 2 | Sort Product Group Name descending via the column header menu | The grid re-orders into descending Product Group Name order. |
| 3 | Confirm the first grid row changed | The first displayed grid row changes. |
| 4 | Export again and compare the two files | Sorting visibly re-orders the grid while the exported file keeps its own server-side order, unchanged. Note that sorting lives on the header dropdown, not on a header click - a header click is inert |

**Expected**: Sorting visibly re-orders the grid while the exported file keeps its own server-side order, unchanged. Note that sorting lives on the header dropdown, not on a header click — a header click is inert.
**Data**: Product Group Name sorted descending via the header menu

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-146: A row visible in the grid appears in the export with the same price, and text values survive intact
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-038, TC-CPR-OVR-066
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected and the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the first grid row's Product Group Id, Product Group Name and Override Price | The first grid row's Product Group Id, Product Group Name, and Override Price are displayed. |
| 2 | Click Export and capture the CSV | The CSV file downloads. |
| 3 | Find the file row matching that office and product group | The matching row is found in the downloaded file. |
| 4 | Compare the Override Price numerically (the grid adds thousands separators) | The file's Override Price value numerically matches the grid's displayed value. |
| 5 | Collect every product group name that begins with a leading zero and check it survived as text | Every product group name with a leading zero is displayed intact as text in the file. |
| 6 | Check the final data row is complete and the whole file decodes as valid UTF-8 | The override a user sees on screen is present in the exported file with the same price, so the grid and the file agree on the same record. Product group names with leading zeros (for example "07A Compass Screen Set Kit") keep them, which is what proves the value was not passed through a number type. The final row carries its full field set, proving the download was not truncated, and no character was mangled in decoding |

**Expected**: The override a user sees on screen is present in the exported file with the same price, so the grid and the file agree on the same record. Product group names with leading zeros (for example "07A Compass Screen Set Kit") keep them, which is what proves the value was not passed through a number type. The final row carries its full field set, proving the download was not truncated, and no character was mangled in decoding.

**Data**: office 1105; first grid row matched by Location Id + Product Group Id; leading-zero names present in the tenant

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-147: Override Discount stays on the fraction scale, and the known percent-scale rows do not spread
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-037, TC-CPR-OVR-038
**Automatable**: Yes

**Preconditions**: On the Override screen with office 1105 selected and the grid loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Export and capture the CSV | The CSV file downloads. |
| 2 | Read every non-empty Override Discount value with its office and product group | The Override Discount values are displayed for every non-empty row in the file. |
| 3 | Split them into values at or below 1 (the fraction scale) and values above 1 | The values are grouped into the fraction scale and the above-1 scale. |
| 4 | Check the fraction scale is overwhelmingly the norm | The fraction-scale values make up the overwhelming majority of the rows. |
| 5 | Check the count of above-1 rows has not grown, and report each one as the percentage it renders | Override Discount is stored as a fraction and displayed as a percentage - 0.06 in the file reads as "6.00 %" in the grid. A small number of rows break that convention and store a raw percentage instead (13, 14, 20), so the grid renders them as 1300.00 %, 1400.00 % and 2000.00 % - well above the 0-100 cap the app enforces when the value is typed in. Confirmed independently against the export file, the grid's data API and the rendered grid. The count is pinned in both directions: growth means the bad rows are spreading, and a drop to zero means they were cleaned up and this guard can be retired |

**Expected**: Override Discount is stored as a fraction and displayed as a percentage — 0.06 in the file reads as "6.00 %" in the grid. A small number of rows break that convention and store a raw percentage instead (13, 14, 20), so the grid renders them as 1300.00 %, 1400.00 % and 2000.00 % — well above the 0-100 cap the app enforces when the value is typed in. Confirmed independently against the export file, the grid's data API and the rendered grid. The count is pinned in both directions: growth means the bad rows are spreading, and a drop to zero means they were cleaned up and this guard can be retired.

**Data**: office 1105; 260 rows at or below 1 versus 4 rows above; cap 100; offices 1174 (product groups 4298 and 2609), 1312 and 1604 (product group 907)

---

