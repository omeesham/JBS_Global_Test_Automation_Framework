/**
 * Setup Module -- Notes Tab Selectors.
 * Covers: Notes table, textarea, Add/Delete buttons, character counter, progress bar, save dialog.
 * DOM notes (live-verified ):
 * - All location detail content renders inside the right-panel tabpanel.
 * - Notes section wrapper: [data-testid="location-settings-section-notes"].
 * - Table: <table data-slot="table"> inside the section — NO data-testid on the table itself.
 * - Table has ONLY <tbody> — there is NO <thead>; "No Notes Available" shows as a colspan row.
 * - Textarea: name="notes.notes.{i}.note" (i=0,1,2,...); NO maxlength attribute (limit is JS-enforced).
 * - Add button: <button>Add</button> — NO data-testid.
 * - Delete button: appears when (a) a row has text content, OR (b) 2+ rows exist. NO data-testid.
 * - Character counter: <div class="text-[11px]"> with format "{used}/4000" + <span>(N Left)</span>.
 * - Progress bar: [role="progressbar"] — NO data-testid; aria-valuenow is NOT set (accessibility gap).
 * - Save dialog: [role="alertdialog"] — NO data-testid; heading/body text are text-based.
 * - Save button: [data-testid="location-settings-btn-save"] (shared with all tabs).
 * - All selector counts confirmed unique via querySelectorAll on .
 */
export const SetupNotesSelectors = {
 // ---- Notes Tab Navigation ----
 /** @where Setup > Location > Tabs @el tab @text "Notes" @keys tab notes navigate settings */
  tabNotes: '[data-testid="location-settings-sub-tab-notes"]',

 // ---- Notes Section Wrappers ----
 /** @where Setup > Location > Notes tab @el region @text "Notes section" @keys notes section wrapper container */
  sectionNotes: '[data-testid="location-settings-section-notes"]',
 /** @where Setup > Location > Notes tab @el region @text "Notes content" @keys notes tab content panel wrapper */
  contentNotes: '[data-testid="location-settings-sub-tab-content-notes"]',

 // ---- Notes Table ----
 /** @where Setup > Location > Notes tab @el table @text "Notes table" @keys notes table rows grid */
  tblNotes: '[data-testid="location-settings-section-notes"] table',
 /** @where Setup > Location > Notes tab > Empty state @el cell @text "No Notes Available" @keys empty no-notes available */
  lblNoNotesAvailable: '[data-testid="location-settings-section-notes"] td:has-text("No Notes Available")',

 // ---- Note Row Textarea (Row 0 = first row, scoped to section) ----
 /**
 * @where Setup > Location > Notes tab > Row 1 @el textarea @text "Type notes here..." @keys note input text textarea row0
 * NOTE: name pattern is notes.notes.{i}.note where i=0,1,2,...
 * Use '[data-testid="location-settings-section-notes"] textarea' for nth access.
 */
  txtNoteRow0: 'textarea[name="notes.notes.0.note"]',
 /** @where Setup > Location > Notes tab > Any row @el textarea @text "Type notes here..." @keys note input textarea placeholder */
  txtNoteInputAll: '[data-testid="location-settings-section-notes"] textarea',

 // ---- Action Buttons ----
 /** @where Setup > Location > Notes tab @el button @text "Add" @keys add note row button */
  btnNotesAdd: '[data-testid="location-settings-section-notes"] button:has-text("Add")',
 /** @where Setup > Location > Notes tab > Row @el button @text "Delete" @keys delete note row button */
  btnNotesDelete: '[data-testid="location-settings-section-notes"] button:has-text("Delete")',

 // ---- Character Counter & Progress Bar ----
 /** @where Setup > Location > Notes tab @el text @text "N/4000" @keys character counter count chars remaining */
  lblNotesCharCounter: '[data-testid="location-settings-section-notes"] div.text-\\[11px\\]',
 /** @where Setup > Location > Notes tab @el progressbar @text "character usage" @keys progress bar char usage visual */
  barNotesProgress: '[data-testid="location-settings-section-notes"] [role="progressbar"]',

 // ---- Left Panel Save Button (shared across tabs) ----
 /** @where Setup > Location > Left Panel @el button @text "Save" @keys save submit form left-panel */
  btnSaveNotes: '[data-testid="location-settings-btn-save"]',

 // ---- Save Changes Dialog ----
 // DEDUPLICATION (P0-DECONTAMINATION): dlgSaveChanges, btnSaveChangesConfirm, btnSaveChangesCancel
 // REMOVED — canonical versions live in shared.ts (SetupSharedSelectors).
 // Notes tab uses the SAME shared Save Changes dialog as all other Location Settings tabs.
} as const;
