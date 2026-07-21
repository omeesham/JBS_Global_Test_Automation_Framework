# Corporate Pricing Missing TestID Reviewer Walk Evidence — 2026-07-10

- Fresh walk date: 2026-07-10
- Office: 1604
- Workbook sheet: CORP_PRICING_MISSING_TESTID
- Candidate rows read: 122
- Adjudicated count: 122 / 122
- Verdict counts: REPRODUCED-MISSING=103, FALSE-POSITIVE=12, COULD-NOT-REACH=7
- VERDICT: RED

## Method
Fresh Playwright Chromium walk with existing storageState, direct office-1604 Corporate Pricing routes from the page objects, recursive open-shadow-root data-testid traversal, and gated menus/dialogs opened in-session. Prior evidence files were read for context only, not reused as data.

## Raw per-surface data-testid dump
### search.initial
- Search screen initial grid/filter/action-bar state
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=107, inputs=6, roleElements=7, rows=50, dialogs=0
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.new-menu-open
- Search New split-menu opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=107, inputs=6, roleElements=10, rows=50, dialogs=0
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.export-menu-open
- Search Export menu opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=107, inputs=6, roleElements=12, rows=50, dialogs=0
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.export-dialog-open
- Search Export precondition dialog opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=112, inputs=6, roleElements=10, rows=50, dialogs=1
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.export-year-options-open
- Search Export Year(s) option list opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=112, inputs=7, roleElements=23, rows=50, dialogs=2
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.grid-options-open
- Search Grid Options menu opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=107, inputs=6, roleElements=20, rows=50, dialogs=0
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.loc-pricing-import-dialog-open
- Search Loc Pricing Import upload dialog opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=12, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, `corporate-pricing-import-dialog`, `corporate-pricing-import-dialog-file-input`, `corporate-pricing-import-dialog-file-display`, `corporate-pricing-import-dialog-browse`, `corporate-pricing-import-dialog-progress`, `corporate-pricing-import-dialog-cancel`, `corporate-pricing-import-dialog-upload`, buttons=111, inputs=7, roleElements=9, rows=50, dialogs=1
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |
| 6 | `corporate-pricing-import-dialog` | div | dialog | Import All Location PricingChoose a file to import data.Attached fileNo file selectedBrowseUpload progress0%CancelUploadClose |
| 7 | `corporate-pricing-import-dialog-file-input` | input | Upload file |  |
| 8 | `corporate-pricing-import-dialog-file-display` | div |  | Attached fileNo file selected |
| 9 | `corporate-pricing-import-dialog-browse` | button | Browse | Browse |
| 10 | `corporate-pricing-import-dialog-progress` | div | progressbar / Upload progress |  |
| 11 | `corporate-pricing-import-dialog-cancel` | button |  | Cancel |
| 12 | `corporate-pricing-import-dialog-upload` | button |  | Upload |

### search.import-precondition-dialog-open
- Search Import precondition dialog opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=112, inputs=6, roleElements=10, rows=50, dialogs=1
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.import-year-options-open
- Search Import Year(s) option list opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=112, inputs=7, roleElements=23, rows=50, dialogs=2
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.import-publish-modal-open
- Search Import publish modal staged from fresh export (271 2026-LV-PB-9025); not published
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=117, inputs=6, roleElements=10, rows=51, dialogs=1
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### search.empty-results
- Search no-results state after impossible Pricebook filter
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
- Counts: data-testid instances=5, unique=`e2e-card-header`, `e2e-card-title`, `e2e-checkbox`, buttons=58, inputs=6, roleElements=7, rows=0, dialogs=0
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `e2e-card-header` | div |  | Search Criteria |
| 2 | `e2e-card-title` | div |  | Search Criteria |
| 3 | `e2e-checkbox` | button | checkbox |  |
| 4 | `e2e-checkbox` | button | checkbox |  |
| 5 | `e2e-checkbox` | button | checkbox |  |

### override.initial
- Product Group Override initial state before location selection
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
- Counts: data-testid instances=0, unique=none, buttons=50, inputs=2, roleElements=10, rows=0, dialogs=0
- data-testid rows: none

### override.location-picker-open
- Override location picker opened and searched for office 1604
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
- Counts: data-testid instances=4, unique=`location-settings-modal-change-local-office`, `location-settings-modal-change-local-office-input-search`, `location-settings-modal-change-local-office-btn-select`, `location-settings-modal-change-local-office-btn-cancel`, buttons=56, inputs=3, roleElements=13, rows=1, dialogs=1
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `location-settings-modal-change-local-office` | div | dialog | Change Local OfficeActiveLocal OfficeLocal Office Name1604Parker Palm SpringsSelectCancelClose |
| 2 | `location-settings-modal-change-local-office-input-search` | input | Search by Location Name, Number |  |
| 3 | `location-settings-modal-change-local-office-btn-select` | button |  | Select |
| 4 | `location-settings-modal-change-local-office-btn-cancel` | button |  | Cancel |

### override.location-1604-selected
- Override grid after selecting office 1604
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
- Counts: data-testid instances=0, unique=none, buttons=50, inputs=2, roleElements=10, rows=0, dialogs=0
- data-testid rows: none

### override.grid-options-open
- Override Grid Options menu opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
- Counts: data-testid instances=0, unique=none, buttons=50, inputs=2, roleElements=24, rows=0, dialogs=0
- data-testid rows: none

### override.import-dialog-open
- Override Import All Pricing Overrides dialog opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
- Counts: data-testid instances=7, unique=`pg-override-upload-dialog`, `pg-override-upload-dialog-file-input`, `pg-override-upload-dialog-file-display`, `pg-override-upload-dialog-browse`, `pg-override-upload-dialog-progress`, `pg-override-upload-dialog-cancel`, `pg-override-upload-dialog-upload`, buttons=54, inputs=3, roleElements=12, rows=0, dialogs=1
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `pg-override-upload-dialog` | div | dialog | Import All Pricing OverridesChoose a file to import data.Attached fileNo file selectedBrowseUpload progress0%CancelUploadClose |
| 2 | `pg-override-upload-dialog-file-input` | input | Upload file |  |
| 3 | `pg-override-upload-dialog-file-display` | div |  | Attached fileNo file selected |
| 4 | `pg-override-upload-dialog-browse` | button | Browse | Browse |
| 5 | `pg-override-upload-dialog-progress` | div | progressbar / Upload progress |  |
| 6 | `pg-override-upload-dialog-cancel` | button |  | Cancel |
| 7 | `pg-override-upload-dialog-upload` | button |  | Upload |

### new-pricebook.equipment.initial
- New Pricebook equipment route initial Strategy tab
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment
- Counts: data-testid instances=0, unique=none, buttons=22, inputs=3, roleElements=3, rows=0, dialogs=0
- data-testid rows: none

### new-pricebook.equipment.currency-options-open
- New Pricebook equipment Currency options opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment
- Counts: data-testid instances=0, unique=none, buttons=22, inputs=3, roleElements=8, rows=0, dialogs=0
- data-testid rows: none

### new-pricebook.strategy-dialog-open
- New Pricebook New Pricing Strategy dialog opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment
- Counts: data-testid instances=0, unique=none, buttons=29, inputs=4, roleElements=8, rows=0, dialogs=1
- data-testid rows: none

### new-pricebook.equipment.pricing-detail-tab
- New Pricebook equipment Pricing Detail tab opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment
- Counts: data-testid instances=0, unique=none, buttons=21, inputs=3, roleElements=3710, rows=1, dialogs=0
- data-testid rows: none

### new-pricebook.save-dialog-open
- New Pricebook Save Changes dialog opened after no-commit form fill; canceled, not committed
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment
- Counts: data-testid instances=1, unique=`location-settings-modal-save-changes`, buttons=30, inputs=4, roleElements=9, rows=0, dialogs=1
| # | data-testid | tag | role/label | text |
|---:|---|---|---|---|
| 1 | `location-settings-modal-save-changes` | div | alertdialog | Save ChangesAre you sure you want to save the changes?CancelSave |

### new-pricebook.labor.pricing-detail-tab
- New Pricebook labor route reached for combined sheet coverage
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=labor
- Counts: data-testid instances=0, unique=none, buttons=21, inputs=3, roleElements=550, rows=1, dialogs=0
- data-testid rows: none

### details.strategy-fixture.initial
- Pricebook Details shell opened on strategy fixture
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/5f2a4088-9268-b033-4925-a48146afb1cb
- Counts: data-testid instances=0, unique=none, buttons=24, inputs=2, roleElements=6, rows=0, dialogs=0
- data-testid rows: none

### strategy.initial
- Pricing Strategy tab initial state
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/5f2a4088-9268-b033-4925-a48146afb1cb
- Counts: data-testid instances=0, unique=none, buttons=24, inputs=2, roleElements=6, rows=0, dialogs=0
- data-testid rows: none

### strategy.new-strategy-dialog-open
- Pricing Strategy New Pricing Strategy dialog opened
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/5f2a4088-9268-b033-4925-a48146afb1cb
- Counts: data-testid instances=0, unique=none, buttons=31, inputs=3, roleElements=11, rows=0, dialogs=1
- data-testid rows: none

### pricing-detail.initial
- Pricing Detail tab opened on detail fixture
- URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/91acb5ca-20e2-ce8e-a9ab-8c370925fd65
- Counts: data-testid instances=0, unique=none, buttons=19, inputs=4861, roleElements=3708, rows=2430, dialogs=0
- data-testid rows: none

## Per-row verdict table
| Row | Submodule | Element | State | Matches | Verdict | Covering data-testid / reason |
|---:|---|---|---|---:|---|---|
| 2 | Search | Page heading "Corporate Pricing" | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 3 | Search | Filter: Pricebook name input | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 4 | Search | Filter: Pricing Strategy input | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 5 | Search | Filter: Location dropdown | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 6 | Search | Filter: Currency dropdown | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 7 | Search | Filter: "Is Internal" checkbox (generic "e2e-checkbox" testid present but non-unique — the same value is on all 3 checkboxes, so a specific checkbox cannot be targeted) | search.initial | 3 | REPRODUCED-MISSING | `e2e-checkbox` — control present, but only as one of three generic/non-unique e2e-checkbox buttons; no purpose-specific testid covers this row |
| 8 | Search | Filter: "Is Labor" checkbox (generic "e2e-checkbox" testid present but non-unique — the same value is on all 3 checkboxes, so a specific checkbox cannot be targeted) | search.initial | 3 | REPRODUCED-MISSING | `e2e-checkbox` — control present, but only as one of three generic/non-unique e2e-checkbox buttons; no purpose-specific testid covers this row |
| 9 | Search | Filter: "Active Only" checkbox (generic "e2e-checkbox" testid present but non-unique — the same value is on all 3 checkboxes, so a specific checkbox cannot be targeted) | search.initial | 3 | REPRODUCED-MISSING | `e2e-checkbox` — control present, but only as one of three generic/non-unique e2e-checkbox buttons; no purpose-specific testid covers this row |
| 10 | Search | "Search" button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 11 | Search | "Reset" button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 12 | Search | Action bar: "New" split button (opens Equipment/Labor Pricing menu) | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 13 | Search | New menu: "Equipment Pricing" item | search.new-menu-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 14 | Search | New menu: "Labor Pricing" item | search.new-menu-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 15 | Search | Action bar: "Pricing Override" button (navigates to Product Group Override) | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 16 | Search | Action bar: "Loc Pricing Export" button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 17 | Search | Action bar: "Loc Pricing Import" button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 18 | Search | Action bar: "Export" button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 19 | Search | Action bar: "Import" button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 20 | Search | Action bar: "Grid Options" icon button (its label is screen-reader-only) | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 21 | Search | Export/Import menus: the 4 variant items (All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount) — text-only menu items | search.export-menu-open | 4 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 22 | Search | Grid Options menu: per-column show/hide toggles | search.grid-options-open | 9 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 23 | Search | Import file-upload dialog container | search.loc-pricing-import-dialog-open | 1 | FALSE-POSITIVE | `corporate-pricing-import-dialog` — covered by data-testid: corporate-pricing-import-dialog |
| 24 | Search | Import dialog: "Browse" button | search.loc-pricing-import-dialog-open | 1 | FALSE-POSITIVE | `corporate-pricing-import-dialog-browse`, `corporate-pricing-import-dialog` — covered by data-testid: corporate-pricing-import-dialog-browse, corporate-pricing-import-dialog |
| 25 | Search | Import dialog: "Upload" button | search.loc-pricing-import-dialog-open | 1 | FALSE-POSITIVE | `corporate-pricing-import-dialog-upload`, `corporate-pricing-import-dialog` — covered by data-testid: corporate-pricing-import-dialog-upload, corporate-pricing-import-dialog |
| 26 | Search | Import dialog: hidden file input (accepts .csv) | search.loc-pricing-import-dialog-open | 1 | FALSE-POSITIVE | `corporate-pricing-import-dialog-file-input`, `corporate-pricing-import-dialog` — covered by data-testid: corporate-pricing-import-dialog-file-input, corporate-pricing-import-dialog |
| 27 | Search | Export precondition dialog (Year(s) + Currency) | search.export-dialog-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 28 | Search | Export dialog: Year(s) / Currency dropdowns | search.export-dialog-open | 5 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 29 | Search | Export dialog: dropdown option items | search.export-year-options-open | 8 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 30 | Search | Import precondition dialog (Year(s) + Currency) | search.import-precondition-dialog-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 31 | Search | Import precondition dialog: Year(s) / Currency dropdowns | search.import-precondition-dialog-open | 5 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 32 | Search | Import precondition dialog: dropdown option items | search.import-year-options-open | 8 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 33 | Search | "Select items to publish" review modal (import delta review) | search.import-publish-modal-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 34 | Search | Publish modal: per-row + select-all checkboxes | search.import-publish-modal-open | 5 | REPRODUCED-MISSING | `e2e-checkbox` — only generic/non-unique data-testid seen (e2e-checkbox); no purpose-specific row control testid |
| 35 | Search | Publish modal: "Publish" button | search.import-publish-modal-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 36 | Search | Results grid table | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 37 | Search | Results grid: data rows | search.initial | 50 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 38 | Search | Results grid: column headers (9 columns) | search.initial | 9 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 39 | Search | Results grid: per-column resize handles | search.initial | 9 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 40 | Search | Results grid: pricebook-name row link (opens pricebook details) | search.initial | 50 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 41 | Search | Results grid: boolean TRUE cell marker (checkmark) | search.initial | 106 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 42 | Search | Grid footer: "N items found" count | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 43 | Search | Grid empty state: "No results." message | search.empty-results | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 44 | Search | Pagination: go to first page button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 45 | Search | Pagination: go to previous page button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 46 | Search | Pagination: go to next page button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 47 | Search | Pagination: go to last page button | search.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 48 | Search | Pagination: rows-per-page dropdown | search.initial | 3 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 49 | Product Group Override | Page heading "Product Group Override" | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 50 | Product Group Override | "Equipment" tab | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 51 | Product Group Override | "Labor" tab | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 52 | Product Group Override | "Select a location" trigger (opens the location picker) | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 53 | Product Group Override | Location picker dialog container | override.location-picker-open | 1 | FALSE-POSITIVE | `location-settings-modal-change-local-office` — covered by data-testid: location-settings-modal-change-local-office |
| 54 | Product Group Override | Location picker: search input | override.location-picker-open | 1 | FALSE-POSITIVE | `location-settings-modal-change-local-office-input-search`, `location-settings-modal-change-local-office` — covered by data-testid: location-settings-modal-change-local-office-input-search, location-settings-modal-change-local-office |
| 55 | Product Group Override | Location picker: result rows | override.location-picker-open | 1 | REPRODUCED-MISSING | result row present inside a testid-bearing dialog, but the row itself has no row-specific data-testid |
| 56 | Product Group Override | Location picker: per-row select checkbox | override.location-picker-open | 3 | REPRODUCED-MISSING | row checkboxes present inside a testid-bearing dialog, but the checkboxes themselves have no purpose-specific data-testid |
| 57 | Product Group Override | Location picker: "Select" button | override.location-picker-open | 1 | FALSE-POSITIVE | `location-settings-modal-change-local-office-btn-select`, `location-settings-modal-change-local-office` — covered by data-testid: location-settings-modal-change-local-office-btn-select, location-settings-modal-change-local-office |
| 58 | Product Group Override | Location picker: "Cancel" button | override.location-picker-open | 1 | FALSE-POSITIVE | `location-settings-modal-change-local-office-btn-cancel`, `location-settings-modal-change-local-office` — covered by data-testid: location-settings-modal-change-local-office-btn-cancel, location-settings-modal-change-local-office |
| 59 | Product Group Override | Location picker: "Close" button | override.location-picker-open | 1 | REPRODUCED-MISSING | Close button present in the picker dialog; no direct data-testid on the Close control |
| 60 | Product Group Override | Filter: Currency dropdown (ALL/USD/CAD/MXN) | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 61 | Product Group Override | Filter: "Active only" checkbox | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 62 | Product Group Override | Filter: "Filter Product Groups Override..." input | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 63 | Product Group Override | Override grid table | override.location-1604-selected | 1 | REPRODUCED-MISSING | office 1604 selected |
| 64 | Product Group Override | Override grid: data rows | override.location-1604-selected | 0 | COULD-NOT-REACH | office 1604 selected |
| 65 | Product Group Override | Override grid: column headers (10 columns) | override.location-1604-selected | 10 | REPRODUCED-MISSING | office 1604 selected |
| 66 | Product Group Override | Override grid row: "Override Price" click-to-edit cell | override.location-1604-selected | 0 | COULD-NOT-REACH | office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog |
| 67 | Product Group Override | Override grid row: "Max Discount %" click-to-edit cell | override.location-1604-selected | 0 | COULD-NOT-REACH | office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog |
| 68 | Product Group Override | Override grid row: "Active" checkbox | override.location-1604-selected | 0 | COULD-NOT-REACH | office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog |
| 69 | Product Group Override | Toolbar: "Save" button | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 70 | Product Group Override | Toolbar: "Export" button | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 71 | Product Group Override | Toolbar: "Import" button | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 72 | Product Group Override | Toolbar: "Grid Options" icon button (its label is screen-reader-only) | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 73 | Product Group Override | Grid Options menu: per-column show/hide toggles | override.grid-options-open | 10 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 74 | Product Group Override | Grid Options menu: "Reset to Default" item | override.grid-options-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 75 | Product Group Override | Footer: rows-per-page dropdown | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 76 | Product Group Override | Grid empty state: "No results." message | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 77 | Product Group Override | Footer: "N items found" count | override.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 78 | Product Group Override | Save confirmation dialog | override.location-1604-selected | 0 | COULD-NOT-REACH | office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog |
| 79 | Product Group Override | Save dialog: "Save" confirm button | override.location-1604-selected | 0 | COULD-NOT-REACH | office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog |
| 80 | Product Group Override | Save dialog: "Cancel" button | override.location-1604-selected | 0 | COULD-NOT-REACH | office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog |
| 81 | Product Group Override | "Import All Pricing Overrides" dialog | override.import-dialog-open | 1 | FALSE-POSITIVE | `pg-override-upload-dialog` — covered by data-testid: pg-override-upload-dialog |
| 82 | Product Group Override | Import dialog: file input | override.import-dialog-open | 1 | FALSE-POSITIVE | `pg-override-upload-dialog-file-input`, `pg-override-upload-dialog` — covered by data-testid: pg-override-upload-dialog-file-input, pg-override-upload-dialog |
| 83 | Product Group Override | Import dialog: "Cancel" button | override.import-dialog-open | 1 | FALSE-POSITIVE | `pg-override-upload-dialog-cancel`, `pg-override-upload-dialog` — covered by data-testid: pg-override-upload-dialog-cancel, pg-override-upload-dialog |
| 84 | Product Group Override | Import dialog: "Close" button | override.import-dialog-open | 1 | REPRODUCED-MISSING | Close button present in the import dialog; no direct data-testid on the Close control |
| 85 | New Pricebook (Equipment & Labor) | Page heading "New Pricebook" | new-pricebook.equipment.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 86 | New Pricebook (Equipment & Labor) | Header: Pricebook name input | new-pricebook.equipment.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 87 | New Pricebook (Equipment & Labor) | Header: Price Year input | new-pricebook.equipment.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 88 | New Pricebook (Equipment & Labor) | Header: Type + Currency dropdowns | new-pricebook.equipment.initial | 2 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 89 | New Pricebook (Equipment & Labor) | Header: dropdown option items (Currency USD/CAD/MXN) | new-pricebook.equipment.currency-options-open | 3 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 90 | New Pricebook (Equipment & Labor) | Pricing Strategy tab: "Total: N" strategy count | new-pricebook.equipment.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 91 | New Pricebook (Equipment & Labor) | Pricing Strategy tab: "No strategies yet" empty state | new-pricebook.equipment.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 92 | New Pricebook (Equipment & Labor) | "New Pricing Strategy" dialog | new-pricebook.strategy-dialog-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 93 | New Pricebook (Equipment & Labor) | Strategy dialog: strategy name input (has a plain id, no data-testid) | new-pricebook.strategy-dialog-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 94 | New Pricebook (Equipment & Labor) | Pricing Detail tab: product-group source items (draggable) | new-pricebook.equipment.pricing-detail-tab | 3707 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 95 | New Pricebook (Equipment & Labor) | Pricing Detail tab: "Search ID or Name..." filter input | new-pricebook.equipment.pricing-detail-tab | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 96 | New Pricebook (Equipment & Labor) | Pricing Detail tab: pricebook detail grid | new-pricebook.equipment.pricing-detail-tab | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 97 | New Pricebook (Equipment & Labor) | "Save Changes" confirmation dialog | new-pricebook.save-dialog-open | 1 | FALSE-POSITIVE | `location-settings-modal-save-changes` — covered by data-testid: location-settings-modal-save-changes |
| 98 | Pricebook Details | Page heading "Corporate Pricing Details" | details.strategy-fixture.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 99 | Pricebook Details | Breadcrumb link back to the search page | details.strategy-fixture.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 100 | Pricebook Details | "Pricing Strategy" tab button | details.strategy-fixture.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 101 | Pricebook Details | "Pricing Detail" tab button | details.strategy-fixture.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 102 | Pricebook Details | Page-level "Save" button | details.strategy-fixture.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 103 | Pricebook Details | Header: pricebook name heading | details.strategy-fixture.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 104 | Pricebook Details | Header: "Labor/Equipment" type value | details.strategy-fixture.initial | 2 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 105 | Pricebook Details | Header: "Year" value | details.strategy-fixture.initial | 2 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 106 | Pricebook Details | Header: "Currency" value | details.strategy-fixture.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 107 | Pricebook Details | Header: "Active"/"Inactive" status badge | details.strategy-fixture.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 108 | Pricing Strategy | "Price Strategies" list heading | strategy.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 109 | Pricing Strategy | "Search strategies..." filter input | strategy.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 110 | Pricing Strategy | "Total: N" strategy count | strategy.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 111 | Pricing Strategy | Strategy editor: "Pricing Strategy" name-field label | strategy.initial | 2 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 112 | Pricing Strategy | "Locations Using Pricing As Default" heading | strategy.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 113 | Pricing Strategy | "Locations Using Pricing As Default" table | strategy.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 114 | Pricing Strategy | "New Pricing Strategy" dialog (opened by Add) | strategy.new-strategy-dialog-open | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 115 | Pricing Detail | Detail grid table (5 product-group columns) | pricing-detail.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 116 | Pricing Detail | Detail grid: rows | pricing-detail.initial | 2431 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 117 | Pricing Detail | Detail grid: "ID" column header | pricing-detail.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 118 | Pricing Detail | Detail grid: "Product Group Name" column header | pricing-detail.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 119 | Pricing Detail | Detail grid: "Price" column header (read-only base price) | pricing-detail.initial | 2 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 120 | Pricing Detail | Detail grid: "New Price" column header (editable) | pricing-detail.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 121 | Pricing Detail | Detail grid: "Max Discount" column header (editable) | pricing-detail.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 122 | Pricing Detail | Available Product Groups: draggable source items | pricing-detail.initial | 3707 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |
| 123 | Pricing Detail | Available Product Groups: "Search ID or Name..." filter input | pricing-detail.initial | 1 | REPRODUCED-MISSING | matched live; no data-testid on the control/nearest wrapper |

## Discrepancies by submodule
### FALSE-POSITIVE
- Search: row 23 (Import file-upload dialog container) -> corporate-pricing-import-dialog; row 24 (Import dialog: "Browse" button) -> corporate-pricing-import-dialog-browse, corporate-pricing-import-dialog; row 25 (Import dialog: "Upload" button) -> corporate-pricing-import-dialog-upload, corporate-pricing-import-dialog; row 26 (Import dialog: hidden file input (accepts .csv)) -> corporate-pricing-import-dialog-file-input, corporate-pricing-import-dialog
- Product Group Override: row 53 (Location picker dialog container) -> location-settings-modal-change-local-office; row 54 (Location picker: search input) -> location-settings-modal-change-local-office-input-search, location-settings-modal-change-local-office; row 57 (Location picker: "Select" button) -> location-settings-modal-change-local-office-btn-select, location-settings-modal-change-local-office; row 58 (Location picker: "Cancel" button) -> location-settings-modal-change-local-office-btn-cancel, location-settings-modal-change-local-office; row 81 ("Import All Pricing Overrides" dialog) -> pg-override-upload-dialog; row 82 (Import dialog: file input) -> pg-override-upload-dialog-file-input, pg-override-upload-dialog; row 83 (Import dialog: "Cancel" button) -> pg-override-upload-dialog-cancel, pg-override-upload-dialog
- New Pricebook (Equipment & Labor): row 97 ("Save Changes" confirmation dialog) -> location-settings-modal-save-changes

### COULD-NOT-REACH
- Product Group Override: row 64 (Override grid: data rows) — office 1604 selected; row 66 (Override grid row: "Override Price" click-to-edit cell) — office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog; row 67 (Override grid row: "Max Discount %" click-to-edit cell) — office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog; row 68 (Override grid row: "Active" checkbox) — office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog; row 78 (Save confirmation dialog) — office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog; row 79 (Save dialog: "Save" confirm button) — office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog; row 80 (Save dialog: "Cancel" button) — office 1604 selected but no override data rows rendered; cannot inspect row edit cells or dirty Save dialog

## Observations
- Bugs / Defects: none observed in this selector audit walk.
- Suggestions / Improvements: none beyond the missing unique Corporate Pricing testids adjudicated above.

VERDICT: RED
