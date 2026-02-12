/**
 * FILE: src/pages/documents.page.ts
 * PURPOSE: Page Object Model for Documents module
 * WHY NECESSARY: Encapsulates document upload/download operations
 * USED BY: tests/specs/espocrm/*.spec.ts
 * 
 * DEMO_TARGET: Built for EspoCRM demo, but reusable for any document management module
 * Keep methods generic (navigateToModule, uploadFile, downloadAttachment) — not EspoCRM-specific
 */

import { Page } from '@playwright/test';
import { BasePage } from '../common/base-page';
import { IConfig } from '../framework-contracts';
import { AppConstants } from '../utils/app-constants';
import { FileUtils } from '../utils/file-utils';
import { Log } from '../utils/logger';
import { CommonMethods } from '../utils/common-methods';

export class DocumentsPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  /**
   * Navigate to Documents module from any page
   * Generic method — works for any module link pattern
   */
  async navigateToDocuments(): Promise<void> {
    Log.info('Navigating to Documents module');
    
    // DEMO_TARGET: Scroll to bottom of left panel (Documents is at end)
    await this.page.evaluate(() => {
      const nav = document.querySelector('.navbar-nav, .nav-pills, nav, .list-group');
      if (nav) nav.scrollTop = nav.scrollHeight;
    });
    await CommonMethods.sleep(AppConstants.DOCUMENTS_SPA_WAIT_MS);
    
    await this.clickWithRetry('lnkDocuments', AppConstants.DOCUMENTS_ELEMENTS);
    await this.page.waitForURL(/.*#Document/, { timeout: 15000 });
    
    // DEMO_TARGET: Wait for documents list to render (SPA) - use .first() for strict mode
    const listSelector = this.getLocator('lstDocumentsList', AppConstants.DOCUMENTS_ELEMENTS);
    await this.page.locator(listSelector).first().waitFor({ state: 'visible', timeout: AppConstants.DOCUMENTS_LIST_RENDER_TIMEOUT_MS });
    
    Log.info('✅ Documents module loaded');
  }

  /**
   * Download first attachment visible in document list
   * @returns Path to downloaded file
   */
  async downloadFirstAttachment(): Promise<string> {
    Log.info('Downloading first document attachment');
    const iconSelector = this.getLocator('iconDownloadAttachment', AppConstants.DOCUMENTS_ELEMENTS);
    
    const downloadPath = await FileUtils.downloadFile(
      this.page,
      async () => {
        await this.page.locator(iconSelector).first().click();
      },
      './tests/test-data/downloads'
    );
    
    Log.info(`✅ File downloaded: ${downloadPath}`);
    return downloadPath;
  }

  /**
   * Create document using quick form
   * @param filePath - Absolute or relative file path
   * @param name - Document name
   * @param description - Document description
   */
  async createDocumentQuickForm(filePath: string, name: string, description: string): Promise<void> {
    // DEMO_TARGET: EspoCRM quick form workflow
    Log.info(`Creating document via quick form: ${name}`);
    
    await this.clickWithRetry('btnCreateDocument', AppConstants.DOCUMENTS_ELEMENTS);
    
    // Wait for modal footer to appear (more reliable than .modal selector)
    const modalFooter = this.getLocator('modalFooter', AppConstants.DOCUMENTS_ELEMENTS);
    await this.page.locator(modalFooter).waitFor({ state: 'visible', timeout: AppConstants.DOCUMENTS_MODAL_TIMEOUT_MS });
    
    // Upload file FIRST (required field)
    const fileInput = this.getLocator('inputFileChooser', AppConstants.DOCUMENTS_ELEMENTS);
    await this.page.locator(fileInput).setInputFiles(filePath);
    
    // Wait for file to be processed (attachment appears in container)
    await CommonMethods.sleep(AppConstants.DOCUMENTS_UPLOAD_WAIT_MS); // EspoCRM processes upload asynchronously
    
    // Fill name and description
    await this.fillWithValidation('txtDocumentName', AppConstants.DOCUMENTS_ELEMENTS, name);
    await this.fillWithValidation('txtDocumentDescription', AppConstants.DOCUMENTS_ELEMENTS, description);
    
    // Save (use specific quick form save button)
    await this.clickWithRetry('btnSaveQuickForm', AppConstants.DOCUMENTS_ELEMENTS);
    
    // Wait for modal footer to disappear (indicates modal closed)
    await this.page.locator(modalFooter).waitFor({ state: 'hidden', timeout: AppConstants.DOCUMENTS_MODAL_TIMEOUT_MS });
    
    Log.info('✅ Document created via quick form');
  }

  /**
   * Create document using full form with date fields
   * @param filePath - File to upload
   * @param name - Document name
   * @param publishDate - Publish date (Date object)
   * @param expirationDate - Expiration date (Date object)
   */
  async createDocumentFullForm(
    filePath: string,
    name: string,
    publishDate: Date,
    expirationDate: Date
  ): Promise<void> {
    // DEMO_TARGET: EspoCRM full form workflow - navigates to #Document/create page
    Log.info(`Creating document via full form: ${name}`);
    
    await this.clickWithRetry('btnCreateDocument', AppConstants.DOCUMENTS_ELEMENTS);
    
    // Wait for modal to appear
    const modalSelector = this.getLocator('modalDialog', AppConstants.DOCUMENTS_ELEMENTS);
    await this.page.locator(modalSelector).waitFor({ state: 'visible', timeout: AppConstants.DOCUMENTS_MODAL_TIMEOUT_MS });
    
    // Click "Full Form" - this NAVIGATES to a new page
    await this.clickWithRetry('btnFullForm', AppConstants.DOCUMENTS_ELEMENTS);
    
    // Wait for navigation to #Document/create
    await this.page.waitForURL(/.*#Document\/create/, { timeout: AppConstants.DOCUMENTS_MODAL_TIMEOUT_MS });
    await CommonMethods.sleep(AppConstants.DOCUMENTS_FORM_RENDER_MS); // Let form render
    
    // Upload file FIRST (required field)
    const fileInput = this.getLocator('inputFileChooser', AppConstants.DOCUMENTS_ELEMENTS);
    await this.page.locator(fileInput).setInputFiles(filePath);
    await CommonMethods.sleep(AppConstants.DOCUMENTS_UPLOAD_WAIT_MS); // Wait for file processing
    
    // Fill name
    await this.fillWithValidation('txtDocumentName', AppConstants.DOCUMENTS_ELEMENTS, name);
    
    // Set dates (EspoCRM uses MM/DD/YYYY format)
    const publishDateStr = CommonMethods.formatDate(publishDate, 'MM/DD/YYYY');
    const expirationDateStr = CommonMethods.formatDate(expirationDate, 'MM/DD/YYYY');
    
    const inputPublish = this.getLocator('inputPublishDate', AppConstants.DOCUMENTS_ELEMENTS);
    const inputExpire = this.getLocator('inputExpirationDate', AppConstants.DOCUMENTS_ELEMENTS);
    
    await this.page.locator(inputPublish).fill(publishDateStr);
    await this.page.locator(inputExpire).fill(expirationDateStr);
    
    // Save (use full form save button)
    await this.clickWithRetry('btnSaveFullForm', AppConstants.DOCUMENTS_ELEMENTS);
    
    // Wait for save to complete and navigate back to list
    await this.page.waitForURL(/.*#Document\/view/, { timeout: AppConstants.DOCUMENTS_MODAL_TIMEOUT_MS });
    
    Log.info('✅ Document created via full form');
  }

  /**
   * Check if document with given name is visible in list
   * @param name - Document name to search for
   * @returns True if visible
   */
  async isDocumentVisible(name: string): Promise<boolean> {
    Log.info(`Checking if document exists: ${name}`);
    const listSelector = this.getLocator('lstDocumentsList', AppConstants.DOCUMENTS_ELEMENTS);
    
    // Search within document list for text matching name
    const found = await this.page.locator(listSelector).locator(`text=${name}`).isVisible();
    
    Log.info(found ? `✅ Document found: ${name}` : `❌ Document not found: ${name}`);
    return found;
  }

  /**
   * Wait for success notification to appear (EspoCRM pattern)
   * @returns True if notification appears within timeout
   */
  async waitForSuccessNotification(): Promise<boolean> {
    Log.info('Waiting for success notification...');
    // Use dual repo selector with fallbacks for robustness
    const selector = CommonMethods.getSelector('notificationSuccess', AppConstants.DOCUMENTS_ELEMENTS) || '.notification-success';
    const notification = this.page.locator(`${selector}, [role="alert"]:has-text("saved"), .alert-success`);
    await notification.first().waitFor({ state: 'visible', timeout: AppConstants.DOCUMENTS_MODAL_TIMEOUT_MS });
    Log.info('✅ Success notification visible');
    return true;
  }

  /**
   * Check if modal/form is closed
   * @returns True if modal is hidden
   */
  async isModalClosed(): Promise<boolean> {
    // Use dual repo selector with fallback
    const selector = CommonMethods.getSelector('modalDialog', AppConstants.DOCUMENTS_ELEMENTS) || '.modal.show';
    const modal = this.page.locator(`${selector}, [role="dialog"]`);
    const isClosed = await modal.isHidden().catch(() => true);
    if (isClosed) {
      Log.info('✅ Modal/form closed');
    } else {
      Log.info('⚠️ Modal still open');
    }
    return isClosed;
  }

  /**
   * Get publish date value from form field
   * @returns Publish date string or null if not found
   */
  async getPublishDate(): Promise<string | null> {
    const field = this.page.locator('[data-name="publishDate"]').first();
    if (await field.isVisible().catch(() => false)) {
      const value = await field.inputValue().catch(() => field.textContent());
      Log.info(`Publish date: ${value}`);
      return value;
    }
    Log.info('Publish date field not found');
    return null;
  }

  /**
   * Navigate to Documents list page (direct URL navigation)
   * Used for returning to list after detail view operations
   */
  async navigateToDocumentsList(): Promise<void> {
    Log.info('Navigating directly to Documents list page');
    await this.page.goto(this.config!.base_url + '#Document', { waitUntil: 'domcontentloaded' });
    await CommonMethods.sleep(AppConstants.DOCUMENTS_FORM_RENDER_MS);
    
    // Wait for list to render
    const listSelector = this.getLocator('lstDocumentsList', AppConstants.DOCUMENTS_ELEMENTS);
    await this.page.locator(listSelector).first().waitFor({ state: 'visible', timeout: AppConstants.DOCUMENTS_LIST_RENDER_TIMEOUT_MS });
    Log.info('✅ Documents list page loaded');
  }

  /**
   * Wait for login button to appear (used in beforeAll login flows)
   * @returns True when login button is visible
   */
  async waitForLoginButton(): Promise<boolean> {
    Log.info('Waiting for login button...');
    await CommonMethods.waitForCondition(
      async () => await this.page.locator('button:has-text("Login")').isVisible(),
      { timeout: AppConstants.STEALTH_LOGIN_WAIT_MS, pollInterval: 1000 }
    );
    Log.info('✅ Login button visible');
    return true;
  }

  /**
   * Wait for navbar to be visible (used to verify login succeeded)
   * @returns True when navbar is visible
   */
  async waitForNavbarVisible(): Promise<boolean> {
    Log.info('Waiting for navbar (login verification)...');
    // Multiple selectors for resilience - EspoCRM may use different nav patterns
    await CommonMethods.waitForCondition(
      async () => {
        const navRight = await this.page.locator('.navbar-right').isVisible().catch(() => false);
        const navMenu = await this.page.locator('.navbar-nav').isVisible().catch(() => false);
        const headerMenu = await this.page.locator('.header-menu-container').isVisible().catch(() => false);
        return navRight || navMenu || headerMenu;
      },
      { timeout: AppConstants.STEALTH_LOGIN_WAIT_MS, pollInterval: 500 }
    );
    Log.info('✅ Navbar visible - login successful');
    return true;
  }
}
