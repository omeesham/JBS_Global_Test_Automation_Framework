/** Custom Playwright assertions via expect.extend */

import { expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { AppConstants } from '../core/app-constants';

expect.extend({
 /**
 * Assert page is authenticated (URL contains hash fragment)
 * Usage: await expect(page).toBeLoggedIn
 */
  async toBeLoggedIn(page: Page) {
    const url = page.url();
    const hasHash = url.includes('#');
    const notOnLogin = !url.endsWith('/') || hasHash;

    return {
      pass: hasHash && notOnLogin,
      message: () =>
        hasHash
          ? `Expected page NOT to be logged in, but URL is: ${url}`
          : `Expected page to be logged in (URL should contain #), but URL is: ${url}`,
    };
  },

 /**
 * Assert a notification/alert is visible, optionally matching text
 * Usage: await expect(page).toHaveNotification('Success')
 */
  async toHaveNotification(page: Page, text?: string) {
    const notificationSelectors = AppConstants.NOTIFICATION_SELECTORS;

    let found = false;
    let actualText = '';

    for (const selector of notificationSelectors) {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
        found = true;
        actualText = (await el.textContent()) || '';
        break;
      }
    }

    const textMatch = text ? actualText.includes(text) : true;

    return {
      pass: found && textMatch,
      message: () => {
        if (!found) return `Expected notification to be visible, but none found`;
        if (!textMatch) return `Expected notification containing "${text}", got: "${actualText.trim()}"`;
        return `Notification found: "${actualText.trim()}"`;
      },
    };
  },

 /**
 * Assert a file was downloaded to directory
 * Usage: expect(downloadsDir).toHaveFileDownloaded('report.xlsx')
 */
  toHaveFileDownloaded(dir: string, fileName?: string) {
    if (!fs.existsSync(dir)) {
      return {
        pass: false,
        message: () => `Download directory does not exist: ${dir}`,
      };
    }

    const files = fs.readdirSync(dir);

    if (fileName) {
      const found = files.includes(fileName);
      return {
        pass: found,
        message: () =>
          found
            ? `File "${fileName}" found in ${dir}`
            : `File "${fileName}" not found in ${dir}. Files present: ${files.join(', ') || 'none'}`,
      };
    }

    return {
      pass: files.length > 0,
      message: () =>
        files.length > 0
          ? `${files.length} file(s) found in ${dir}`
          : `No files found in ${dir}`,
    };
  },
});
