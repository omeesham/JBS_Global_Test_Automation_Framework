# Service Charge Text — Test Plan

**Module**: service-charge-text
**Submodule**: CORE
**Page**: Location Settings → Service Charge Text (`/settings/service-charge-text`)
**Test Entity**: Office 1604
**Updated**: 2026-08-03
**Total Scenarios**: 83
**Test Cases**: `service_charge_text_core_test_cases.md`

---

## 1. Purpose

Cover the Service Charge Text setup page: a grid of per-language service charge wording with three
editable metadata columns, a rich text column, a page level language filter, an add row control, and
a single Save button.

## 2. Scope

**In scope**: grid editing, required field rules, the unique name rule, the language filter, the rich
text editor panel, adding rows, and how the page decides whether Save is available.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| A second rich text column described in the requirement | That column is not present on the page |
| Report preview | No preview control is present on the page |
| Whether saved wording reaches downstream systems | A known open defect prevents that, so it cannot be asserted here |
| Per office differences | The page is identical across the offices checked |
| Role based access | The governing requirement leaves the role rule unconfirmed |
| Paging and sorting | The grid renders in full and offers neither control |

## 3. Environment

Office 1604 on the standard test environment. No special data setup is required; the page already
carries 114 rows of wording.

## 4. Risks

1. The page shows a loading placeholder before the grid appears. Tests must wait for the grid itself,
   otherwise they read the placeholder.
2. Interacting with all 114 row level language controls in one pass makes the page fail. Tests use one
   representative row.
3. All scenarios are expected to pass against the live page.

## 5. Scenarios

| TC | Scenario | Automatable |
|---|---|---|
| TC-SCT-CORE-001 | Metadata columns accept typed input | Yes |
| TC-SCT-CORE-002 | Save stays disabled while a required field is empty | Yes |
| TC-SCT-CORE-003 | Save enables when a new row is complete and unique | Yes |
| TC-SCT-CORE-004 | Duplicate Service Charge Name disables Save | Yes |
| TC-SCT-CORE-005 | Duplicate Service Charge Name is announced to the user | Yes |
| TC-SCT-CORE-006 | Service Charge Name accepts a long value | Yes |
| TC-SCT-CORE-007 | A long Service Charge Name stays readable in the grid | Yes |
| TC-SCT-CORE-008 | A name of only spaces is treated as empty | Yes |
| TC-SCT-CORE-009 | Special characters are accepted and preserved | Yes |
| TC-SCT-CORE-010 | Reverting an edited value returns Save to disabled | Yes |
| TC-SCT-CORE-011 | Language filter offers five options | Yes |
| TC-SCT-CORE-012 | Language filter defaults to US English | Yes |
| TC-SCT-CORE-013 | Selecting a language filters the grid | Yes |
| TC-SCT-CORE-014 | Selecting All shows every language | Yes |
| TC-SCT-CORE-015 | Changing language with unsaved changes prompts first | Yes |
| TC-SCT-CORE-016 | The per row language control opens its own list | Yes |
| TC-SCT-CORE-017 | The per row language list omits All | Yes |
| TC-SCT-CORE-018 | Clicking a Service Charge Text cell opens the editor | Yes |
| TC-SCT-CORE-019 | Selecting a row does not make the page saveable | Yes |
| TC-SCT-CORE-020 | The editor is unavailable until a row is selected | Yes |
| TC-SCT-CORE-021 | Editing the rich text marks the page as changed | Yes |
| TC-SCT-CORE-022 | Switching rows with unsaved editor changes prompts first | Yes |
| TC-SCT-CORE-023 | An empty Service Charge Text loads a starting layout | Yes |
| TC-SCT-CORE-024 | Add row appends an empty row | Yes |
| TC-SCT-CORE-025 | A new empty row does not make the page saveable | Yes |
| TC-SCT-CORE-026 | Completing a new row makes the page saveable | Yes |
| TC-SCT-CORE-027 | Unsaved rows are discarded when the page is reloaded | Yes |
| TC-SCT-CORE-028 | Filtering shows only the selected language | Yes |
| TC-SCT-CORE-029 | All five column headers are displayed | Yes |
| TC-SCT-CORE-030 | Every row is reachable without paging | Yes |
| TC-SCT-CORE-031 | Saved values survive a reload | Yes |
| TC-SCT-CORE-032 | Edited Service Charge Name persists after save and reload | Yes |
| TC-SCT-CORE-033 | Saved values survive a browser back and forward navigation | Yes |
| TC-SCT-CORE-034 | All three metadata fields saved in one operation all persist | Yes |
| TC-SCT-CORE-035 | Pairwise coverage of language filter, row action, and Save state — part one | Yes |
| TC-SCT-CORE-036 | Pairwise coverage of language filter, row action, and Save state — part two | Yes |
| TC-SCT-CORE-037 | Save stays disabled when all three required fields are blank | Yes |
| TC-SCT-CORE-038 | Save stays disabled when only Service Charge Name is populated | Yes |
| TC-SCT-CORE-039 | Save stays disabled when only Service Charge Display Name is populated | Yes |
| TC-SCT-CORE-040 | Save stays disabled when only Report Column Name is populated | Yes |
| TC-SCT-CORE-041 | Save stays disabled when Service Charge Name and Display Name are populated but Report Column Name is blank | Yes |
| TC-SCT-CORE-042 | Save stays disabled when Service Charge Name and Report Column Name are populated but Display Name is blank | Yes |
| TC-SCT-CORE-043 | Save stays disabled when Service Charge Display Name and Report Column Name are populated but Name is blank | Yes |
| TC-SCT-CORE-044 | Save enables when all three required fields are populated with unique values | Yes |
| TC-SCT-CORE-045 | Editing any metadata field transitions the page from clean to dirty | Yes |
| TC-SCT-CORE-046 | Navigating away with unsaved changes triggers a browser confirmation | Yes |
| TC-SCT-CORE-047 | Changing the language filter with unsaved changes shows an in-app confirmation and Stay preserves edits | Yes |
| TC-SCT-CORE-048 | Choosing Discard in the language filter confirmation applies the filter and loses unsaved changes | Yes |
| TC-SCT-CORE-049 | Clearing a required field disables Save and restoring it re-enables Save | Yes |
| TC-SCT-CORE-050 | Editing a field and then typing back the original value returns Save to disabled | Yes |
| TC-SCT-CORE-051 | A Service Charge Name that duplicates an existing name in a different language enables Save | Yes |
| TC-SCT-CORE-052 | A required field left empty on any row keeps Save disabled for the whole page | Yes |
| TC-SCT-CORE-053 | The rich text editor is unavailable until a Service Charge Text cell is clicked | Yes |
| TC-SCT-CORE-054 | Changing the language filter updates the grid contents | Yes |
| TC-SCT-CORE-055 | Keyboard tab order within a row follows the visual column order | Yes |

| TC-SCT-CORE-056 | Clicking Save twice rapidly sends exactly one save request | Yes |
| TC-SCT-CORE-057 | Editing two rows before saving persists both edits in a single save | Yes |
| TC-SCT-CORE-058 | Choosing Stay in the language filter confirmation keeps all unsaved edits intact | Yes |
| TC-SCT-CORE-059 | The save request body includes all rows with the correct structure | Yes |
| TC-SCT-CORE-060 | Each language filter option shows the correct number of rows | Yes |
| TC-SCT-CORE-061 | An off-screen row is readable by its Service Charge Name without using a row index | Yes |
| TC-SCT-CORE-062 | Rich text editor content persists after save and reload | Yes |
| TC-SCT-CORE-063 | A newly added row with all fields filled persists after save and reload | Yes |
| TC-SCT-CORE-064 | Changing a row's per-row language persists after save and reload | Yes |
| TC-SCT-CORE-065 | Report Column Name edited in isolation persists after save and reload | Yes |
| TC-SCT-CORE-066 | A metadata edit on one row and a rich text edit on another row both persist in a single save | Yes |
| TC-SCT-CORE-067 | Changing a row's language and editing its Name in the same save both persist | Yes |
| TC-SCT-CORE-068 | Edits saved under each of the four single-language filters all persist | Yes |
| TC-SCT-CORE-069 | A dirty page with an invalid duplicate name still triggers the navigate-away prompt | Yes |
| TC-SCT-CORE-070 | Confirming navigation away discards all unsaved changes | Yes |
| TC-SCT-CORE-071 | After a successful save, navigating away does not trigger a prompt | Yes |
| TC-SCT-CORE-072 | A rich text edit alone triggers the navigate-away prompt | Yes |
| TC-SCT-CORE-073 | A failed save keeps the page dirty with Save re-enabled | Yes |
| TC-SCT-CORE-074 | All page controls are operable by keyboard without a mouse | Yes |
| TC-SCT-CORE-075 | The unsaved-changes dialog traps focus until dismissed and returns focus afterward | Yes |
| TC-SCT-CORE-076 | A duplicate Service Charge Name rejection provides a visible explanation | Yes |
| TC-SCT-CORE-077 | Two sessions editing the same row results in a conflict outcome, not a silent overwrite | Yes |
| TC-SCT-CORE-078 | A save failure preserves edits and a retry succeeds | Yes |
| TC-SCT-CORE-079 | Page level language filter dropdown recovers from a load failure | Yes |
| TC-SCT-CORE-080 | Per-row language dropdown recovers from a load failure without changing the row's language | Yes |
| TC-SCT-CORE-081 | The save response body reflects the committed metadata payload | Yes |
| TC-SCT-CORE-082 | A one-row filtered view remains editable and saveable | Yes |
| TC-SCT-CORE-083 | An empty filtered result set renders a recovery state without row-index errors | Yes |

## 5b. Coverage Notes

**Out-of-scope families (from DEEP design):**
- `out-of-scope:date-bva=the field inventory lists zero date or offset fields; all editable columns are plain text, dropdown, or rich text`
- `out-of-scope:combination-multifilt=single language filter, no multi-filter surface to combine; no Reset control`
- `out-of-scope:file-io=no import/export/download/upload/file control on this surface`
- `out-of-scope:a11y-markup=owner ruled DOM/markup accessibility out of scope for this client 2026-08-04`
- `out-of-scope:deferred-families=no role gate, platform distinction, or separate module-specific promotion need`

**Already-covered (no new cases warranted):**
- `already-covered:integration-cross-field=Name validity depends on Language under the uniqueness-within-language rule; six edges confirmed covered by TC-051/004, TC-037–044/052, TC-013/054/063, TC-021/035/036, TC-047/048/061, TC-062`

## 6. Expected failures

None. Every scenario in this plan is expected to pass against the live page.

## 7. Blocked scenarios

No scenarios are currently blocked. All 83 scenarios are schedulable. TC-035 and TC-036 use the edit-then-restore pattern and the second-row construction technique (adding a row with blank required fields to hold Save disabled while an edit occurs on a different row); steps that do not save simply reload to discard changes.

## 8. Coverage summary

| Area | Scenarios |
|---|---|
| Text fields and their rules | 001 to 010 |
| Language selection | 011 to 017 |
| Rich text editor | 018 to 023 |
| Adding rows | 024 to 027 |
| Grid behaviour | 028 to 031 |
| Save-cycle persistence and browser-back | 032 to 034 |
| Filter and edit state combinations | 035 to 036 |
| Required-fields decision table | 037 to 044 |
| State-transition save flow | 045 to 050 |
| Cross-field dependencies | 051 to 054 |
| Accessibility | 055, 077 to 079 |
| Error-guessing | 059 to 061, 080 to 083 |
| Network payload structure | 062, 084 |
| Volume and row counts | 063 to 064, 085 to 086 |
| Deep persistence | 065 to 068 |
| Deep pairwise | 069 to 071 |
| Deep state-transition | 072 to 076 |

Ready to run: 83. Blocked pending save handling: 0. Expected to fail until fixed: 0.
