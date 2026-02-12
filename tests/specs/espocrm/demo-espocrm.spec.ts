// spec: specs_planning/test-plans/documents-plan.md
// seed: tests/seed.spec.ts
/**
 * FILE: tests/specs/espocrm/demo-espocrm.spec.ts
 * PURPOSE: POC tests for EspoCRM Documents module (upload/download workflows)
 * WHY NECESSARY: Demonstrates real-world usage of DocumentsPage, custom matchers,
 *   serial test patterns with session persistence, and bot detection bypass techniques.
 * USED BY: Jenkins pipeline, local test runs
 *
 * HOW IT WORKS:
 * 1. Serial execution (test.describe.serial) maintains session across 3 tests
 * 2. stealthSession fixture handles stealth context creation and auto-login
 * 3. Tests share downloadedFilePath state across serial tests
 * 4. StealthHelpers bypass EspoCRM demo bot detection (via fixture)
 *
 * DEMO_TARGET: This is a POC using public demo site (demo.espocrm.com)
 * All uploaded records prefixed with "DEMO" to indicate test data.
 * When changing to production target, DELETE this file and folder.
 *
 * @see {@link DocumentsPage} - src/pages/documents.page.ts
 * @see {@link StealthHelpers} - src/utils/stealth-helpers.ts
 * @see {@link tests/examples/class-based-pattern.spec.ts} - Pattern reference
 */

import { test, expect, Log, CommonMethods, AppConstants, fs, path } from '../../imports';
import { DocumentsPage } from '../../../src/pages/documents.page';

// DEMO_TARGET: EspoCRM demo site tests - delete entire folder when changing targets
test.describe.serial('EspoCRM - Documents Upload/Download POC', () => {
  let documentsPage: DocumentsPage;
  let downloadedFilePath: string;

  test.beforeAll(async ({ stealthSession, config }) => {
    test.setTimeout(120000);
    // stealthSession fixture handles: stealth context, init scripts,
    // random viewport, navigation to base_url, login click, navbar wait
    documentsPage = new DocumentsPage(stealthSession.page, config);
    Log.info('✅ Suite setup complete via stealthSession fixture');
  });

  test('TC-DOC-001: Download existing document attachment', async ({ stealthSession }) => {
    const { page } = stealthSession;
    // DEMO_TARGET: EspoCRM Documents module download workflow
    Log.info('TEST: Download existing document from EspoCRM');

    // Navigate to Documents module (using shared page)
    await documentsPage.navigateToDocuments();
    Log.info('✅ Navigated to Documents module');

    // Assert: verify we're on the Document module
    await expect(page).toBeOnModule('Document');

    // Download first attachment
    downloadedFilePath = await documentsPage.downloadFirstAttachment();
    Log.info(`✅ Download triggered, file path: ${downloadedFilePath}`);

    // Assert: verify file was actually downloaded and has content
    expect(downloadedFilePath).toBeTruthy();
    expect(fs.existsSync(downloadedFilePath)).toBe(true);
    const stats = fs.statSync(downloadedFilePath);
    expect(stats.size).toBeGreaterThan(0);

    Log.info('✅ Test completed: Document download verified');
  });

  test('TC-DOC-002: Upload document via Quick Form', async ({ stealthSession }) => {
    const { page } = stealthSession;
    // DEMO_TARGET: EspoCRM quick form upload with demo naming
    Log.info('TEST: Upload document using quick form');

    // Navigate back to Documents (session persisted from TC-DOC-001)
    await documentsPage.navigateToDocuments();
    Log.info('✅ Returned to Documents module (session maintained)');

    // Generate random suffix to avoid duplicate documents on demo site
    const rand2 = Math.floor(100 + Math.random() * 900);

    // Upload the downloaded file with DEMO naming (createDocumentQuickForm now waits for modal close)
    await documentsPage.createDocumentQuickForm(
      downloadedFilePath,
      `DEMO Upload ${rand2}`, // DEMO_TARGET: Indicates test record
      `POC demo ${rand2} - uploading file downloaded in previous test` // DEMO_TARGET
    );
    Log.info('✅ Quick form upload completed (modal auto-closed)');

    // Assert: verify success notification appeared
    await expect(page).toHaveNotification();

    // Wait for document to appear in list
    await CommonMethods.waitForCondition(
      async () => await documentsPage.isDocumentVisible(`DEMO Upload ${rand2}`),
      { timeout: 8000, pollInterval: 500 }
    );

    // Assert: verify document is visible in list
    const isVisible = await documentsPage.isDocumentVisible(`DEMO Upload ${rand2}`);
    expect(isVisible).toBe(true);

    Log.info('✅ Test completed: Quick form upload verified');
  });

  test('TC-DOC-003: Upload document via Full Form with future dates', async ({ stealthSession, config }) => {
    const { page } = stealthSession;
    // DEMO_TARGET: EspoCRM full form with date pickers
    Log.info('TEST: Upload document using full form with date fields');

    // Navigate to Documents (session persisted from TC-DOC-002)
    await documentsPage.navigateToDocuments();
    Log.info('✅ Returned to Documents module');

    // Calculate future dates: Publish = today + 7 days, Expiration = publish + 30 days
    // Why 7 days? Ensures publish date is in future (simulates scheduled publication)
    // Why 30 days later? EspoCRM validates expiration > publish, 30 days = typical doc lifecycle
    const today = new Date();
    const publishDate = CommonMethods.addDays(today, 7);
    const expirationDate = CommonMethods.addDays(publishDate, 30);

    Log.info(`Publish date: ${publishDate.toISOString()}, Expiration: ${expirationDate.toISOString()}`);

    // Upload test file from test-data folder
    const testFilePath = path.join(process.cwd(), 'tests', 'test-data', 'test.xlsx');

    // Precondition check: Verify test file exists (NOT a test assertion - this is setup validation)
    if (!fs.existsSync(testFilePath)) {
      throw new Error(`Test file not found: ${testFilePath}`);
    }
    Log.info(`✅ Test file exists at ${testFilePath}`);

    // Generate random suffix to avoid duplicate documents on demo site
    const rand3 = Math.floor(100 + Math.random() * 900);

    // Create document with full form (saves and auto-navigates to detail view)
    await documentsPage.createDocumentFullForm(
      testFilePath,
      `DEMO Full Form Upload ${rand3}`, // DEMO_TARGET
      publishDate,
      expirationDate
    );
    Log.info('✅ Full form save completed (auto-navigated to detail view)');

    // Assert: verify we're on the detail view page
    expect(page.url()).toContain('#Document/view');

    // Navigate back to list to verify document exists (using page object method)
    await documentsPage.navigateToDocumentsList();
    Log.info('✅ Navigated back to documents list');

    // Wait for document to appear
    await CommonMethods.waitForCondition(
      async () => await documentsPage.isDocumentVisible(`DEMO Full Form Upload ${rand3}`),
      { timeout: 8000, pollInterval: 500 }
    );

    // Assert: verify document is visible in list
    const isVisible = await documentsPage.isDocumentVisible(`DEMO Full Form Upload ${rand3}`);
    expect(isVisible).toBe(true);

    Log.info('✅ Test completed: Full form upload with dates verified');
  });

  test.afterAll(async () => {
    // DEMO_TARGET: Cleanup downloaded files
    Log.info('🧹 Cleanup: Remove downloaded test files');
    if (downloadedFilePath && fs.existsSync(downloadedFilePath)) {
      fs.unlinkSync(downloadedFilePath);
      Log.info(`Deleted: ${downloadedFilePath}`);
    }
    // stealthSession fixture handles context.close() automatically
  });
});
