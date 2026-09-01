# Item Search — Product Code Test Cases

**Module**: item-search
**Submodule**: PCD
**Page**: Products (`/locations/1101/products`) — row-selection toolbar + Product Code Details dialogs
**Test Entity**: Office 1101
**Updated**: 2026-08-31
**Total TCs**: 10
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-2253
**Verified against**: field inventory `item-search-product-code-2026-08-31.md`; dialog snapshots under `.playwright-cli/isr-2026-08-31/` (2026-08-31 session); walk evidence `walk-evidence-item-search-2026-08-31.md`

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Toolbar buttons (View/Add Product Code, View Availability, Product Group, Grid Options) | none — reach by their visible names | Buttons | mount when a row is selected |
| Segment menus (View caret / Add caret) | none — the small arrow next to each button | Menus | Item, Sub Class, Class, Sub Category, Category |
| View dialog editable fields | none — placeholders / section labels | Text boxes, dropdowns, checkboxes | selected row's values |
| Add dialog fields | none — placeholders | Required-empty form | empty; Save disabled |
| Product Type → Service Type (Add) | none | Paired dropdowns | placeholder; Service Type locked until Product Type chosen |
| Save / Close (both dialogs) | none — button text | Buttons | Save disabled; Close enabled |

## Validation Rules

| Rule | Behaviour |
|---|---|
| The toolbar needs a selected row | View/Add Product Code and their neighbors appear only after clicking a result row. |
| The dialog is segment-scoped | The first tab is named for the chosen segment (Item by default; the caret menu rescopes it) and shows the hierarchy chain above the editable section. |
| Service Type follows Product Type | In the Add dialog, Service Type is locked until a Product Type is chosen, then offers only types that belong to it (choosing LABOR yields a labor-specific list). |
| Save is held back | Add: Save stays disabled while required fields are incomplete. View: Save stayed disabled even after an edit on the probed row — do not assert when it enables. |
| Closing discards silently | Closing either dialog with unsaved edits discards them with no warning prompt. |
| One segment option is broken | In the View menu, Category closes the menu and nothing opens (confirmed three times; every sibling works and the Add menu's Category works). Filed as BUG-ISR-PCD-001 (2026-09-01). |

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Row click selects and mounts the toolbar | Selected row highlighted; five toolbar controls appear |
| 2 | View dialog opens | "Product Code Details", tabs Item / Product Code History / Translations |
| 3 | Item tab content | Hierarchy sections; editable name/description; Save disabled; identifier shown |
| 4 | History tab | 15-column audit grid with its own Grid Options |
| 5 | Translations tab | Four language rows, each with editable Name + Description |
| 6 | Segment menu (View) | All five entries open scoped dialogs (an earlier "Category does nothing" reading was invalidated 2026-09-01 by live re-verification — the probe's click had never landed) |
| 7 | Add dialog | Required-empty form flagged invalid; Save disabled; ancestor chain read-only |
| 8 | Type list | 10 product types offered |
| 9 | Cascade | Choosing LABOR enabled Service Type with a labor-only list (15+ entries) |
| 10 | Segment menu (Add) | Category opens the add form scoped to Category |
| 11 | Dirty close | Edited View dialog and Add dialog with a chosen type both closed silently, edits discarded |
| 12 | View Availability | No response on a labor row and an equipment row (zero requests) — feature tied to dates, which are not functional yet |

---

## TC-ISR-PCD-001: Selecting a row reveals the product-code toolbar

**Automatable**: Yes
**Preconditions**: A default search has been executed on the Products page for office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click any result row | The row highlights as selected |
| 2 | Read the toolbar above the grid | Product Group, View Availability, View Product Code (with a small arrow beside it), Add Product Code (with its arrow) and Grid Options are all shown |

**Notes**: The toolbar is selection-driven; without a selected row only Product Group, View Availability and Grid Options areas are present.

---

## TC-ISR-PCD-002: View Product Code opens the details dialog on the Item tab

**Automatable**: Yes
**Preconditions**: A result row is selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click View Product Code | A dialog titled "Product Code Details" opens |
| 2 | Read the tab strip | Three tabs: Item (active), Product Code History, Translations |
| 3 | Read the Item tab | The hierarchy sections (Category, Sub Category, Class, Sub Class, Item) show the selected product's values; the name and description boxes hold the product's text; a numeric identifier is displayed |
| 4 | Read the footer | Save is disabled; Close is enabled |
| 5 | Click Close | The dialog closes and the grid is unchanged |

**Notes**: Read-only pass — nothing is typed or saved. Do not assert when Save enables; that condition is undetermined on rows whose required chain is incomplete.

---

## TC-ISR-PCD-003: The History tab shows the audit grid

**Automatable**: Yes
**Preconditions**: The details dialog is open (View Product Code).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Product Code History tab | The tab activates |
| 2 | Read the grid header | 15 columns, including Action, Parent Name, Product Name, Product Type, Modified By and Modified Date |
| 3 | Read the tab chrome | The tab has its own Grid Options button, separate from the page's |

**Notes**: Render check only at this depth; the in-dialog grid's own sorting and options are left for the deeper pass.

---

## TC-ISR-PCD-004: The Translations tab lists four editable languages

**Automatable**: Yes
**Preconditions**: The details dialog is open (View Product Code).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Translations tab | The tab activates with "Translations for Item" |
| 2 | Read the rows | Four languages: English (Canada), US English, Spanish (Mexico), French (Canada) |
| 3 | Read each row | Every language row carries an editable Name box and an editable Description box |
| 4 | Click Close | The dialog closes with nothing saved |

**Notes**: Structure check; translation editing and saving are left for the deeper pass.

---

## TC-ISR-PCD-005: The View segment menu rescopes the dialog

**Automatable**: Yes
**Preconditions**: A result row is selected; no dialog open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the arrow beside View Product Code | A menu lists Item, Sub Class, Class, Sub Category, Category |
| 2 | Click Sub Category | The details dialog opens and its first tab is named "Sub Category" |
| 3 | Close the dialog, reopen the menu, click Class | The dialog opens with its first tab named "Class" |
| 4 | Close the dialog, reopen the menu, click Category | The dialog opens with its first tab named "Category" |
| 5 | Close the dialog | The grid is unchanged |

**Notes**: All five entries rescope the dialog; the case samples Sub Category, Class and Category. An earlier walk observation that Category closed the menu without opening anything was invalidated by live re-verification on 2026-09-01 (the probe's click had never landed — see BUG-ISR-PCD-001, status invalid).

---

## TC-ISR-PCD-006: Add Product Code opens a required-empty form with Save held back

**Automatable**: Yes
**Preconditions**: A result row is selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Add Product Code | The dialog opens with a single tab named "Item" |
| 2 | Read the ancestor sections | The selected row's Category, Sub Category, Class and Sub Class values display as plain text (dashes where the row has none) |
| 3 | Read the entry form | Name and Item Description are empty and flagged as required; the type selector shows "Select product type"; the service selector shows "Select service type" and is locked |
| 4 | Read the footer | Save is disabled |

**Notes**: The service selector's locked state before any type is chosen is the resting half of the pairing rule; the live half is the next case.

---

## TC-ISR-PCD-007: Choosing a Product Type unlocks and filters Service Type

**Automatable**: Yes
**Preconditions**: The Add Product Code dialog is open (previous case state).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Product Type selector | Ten types are offered, including EQUIPMENT, CONSUMABLE, LABOR and FEE |
| 2 | Choose LABOR | The Service Type selector unlocks |
| 3 | Open the Service Type selector | Only labor services are offered (a list including Operator Labor, Rigging Labor and Setup Charges) |
| 4 | Press Escape, then close the dialog | The dialog closes; nothing is saved |

**Notes**: Pairing rule proven in both halves: unlock on selection, and the list is filtered to the chosen type's services.

---

## TC-ISR-PCD-008: The Add segment menu opens per-segment forms

**Automatable**: Yes
**Preconditions**: A result row is selected; no dialog open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the arrow beside Add Product Code | A menu lists Item, Sub Class, Class, Sub Category, Category |
| 2 | Click Category | The dialog opens and its single tab is named "Category" |
| 3 | Close the dialog | The grid is unchanged |

**Notes**: The add-side Category works — which is exactly why the view-side Category's silence is a defect and not a data limitation.

---

## TC-ISR-PCD-009: Closing a dialog with edits discards them silently

**Automatable**: Yes
**Preconditions**: A result row is selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open View Product Code and add one character to the Name box | The value changes in the box |
| 2 | Click Close | The dialog closes immediately — no warning prompt appears |
| 3 | Reopen View Product Code | The Name shows the original value; the edit was discarded |
| 4 | Open Add Product Code, choose any Product Type, then click Close | The dialog closes immediately with no prompt |

**Notes**: This documents the app's actual behavior: there is no unsaved-changes protection on these dialogs. If a warning prompt ever appears here, the app has changed and this case should be updated deliberately.

---

## TC-ISR-PCD-010: View Availability is present and enabled with a row selected

**Automatable**: Yes
**Preconditions**: A result row is selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the View Availability button | It is visible and enabled |

**Notes**: Presence check only, deliberately. Clicking it currently does nothing on any row type — availability is driven by the date fields, and the product owner has ruled dates are not functional yet. When dates go live, replace this case with real availability behavior cases.
