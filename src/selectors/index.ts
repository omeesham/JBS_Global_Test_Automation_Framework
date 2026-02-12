/**
 * FILE: src/selectors/index.ts
 * PURPOSE: TypeScript selector constants (dual repository - TS side)
 * WHY NECESSARY: Fast selector lookup without CSV I/O, type-safe
 * USED BY: CommonMethods.getSelector() checks this first, falls back to CSV
 *
 * HOW IT WORKS:
 * 1. Define selector objects for each module (LoginSelectors, HomeSelectors, etc.)
 * 2. Merge all into ALL_SELECTORS for getTsSelector() lookup
 * 3. Agents must keep CSV and TS in sync when adding selectors
 */

// DEMO_TARGET: EspoCRM Documents module selectors - discovered via playwright-test-planner agent
// Updated: 2026-02-11 - Added notification, modal, publishDate display selectors (Copilot user override)
// Updated: 2026-02-11 - Simplified lnkDocuments selector for reliability (Copilot refactor)
export const DocumentsSelectors = {
  lnkDocuments: 'a[href="#Document"]',
  btnCreateDocument: 'a[data-name="quickCreate"][data-action="quickCreate"]',
  inputFileChooser: 'input[type="file"].file',
  iconDownloadAttachment: 'span.fas.fa-paperclip.small',
  txtDocumentName: 'input[data-name="name"].main-element',
  txtDocumentDescription: 'textarea[data-name="description"].main-element',
  btnFullForm: 'button[data-name="fullForm"]',
  inputPublishDate: 'input[data-name="publishDate"].numeric-text',
  inputExpirationDate: 'input[data-name="expirationDate"].numeric-text',
  btnSaveQuickForm: 'button[data-name="save"].btn-primary',
  btnSaveFullForm: 'button[data-action="save"][data-name="save"].detail-action-item',
  lstDocumentsList: '.list-container',
  notificationSuccess: '.growl-notification.alert-success',
  modalDialog: '.modal',
  modalFooter: '.modal-footer',
  displayPublishDate: '[data-name="publishDate"]:not(input)',
  attachmentContainer: '.attachment',
  fileAttachmentLabel: '.attach-file-label',
} as const;

// Merge all selector objects for lookup
export const ALL_SELECTORS: Record<string, string> = {
  ...DocumentsSelectors, // DEMO_TARGET: Documents selectors
};

/**
 * Get TypeScript selector by element name
 * @returns selector string or null if not found
 */
export function getTsSelector(elementName: string): string | null {
  return ALL_SELECTORS[elementName] ?? null;
}

export type SelectorKey<T> = keyof T & string;
