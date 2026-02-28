/**
 * @agent-doc
 * PURPOSE: Centralized file handling for download, upload, validation, and Excel operations. Playwright Download API + xlsx library for Excel validation.
 * OWNER: human-only
 * IMPACT: high - Report validation, data-driven tests, and file download tests depend on this. Breaking it fails all file-based tests.
 * DEPENDS-ON: @playwright/test, xlsx, path, fs
 * USED-BY: POC demo tests, data-driven tests, report validation tests, CommonMethods
 * RULES: Never delete downloadFile() or validateExcelFile(). Keep Excel column validation working. Maintain Playwright Download API compatibility.
 */

/**
 * File Operations Utility
 *
 * PURPOSE: Centralized file handling for download, upload, validation, and Excel operations
 * WHY NECESSARY: Eliminates duplicate file operation code across tests
 * HOW IT WORKS: Playwright Download API + xlsx library for Excel validation
 * USED BY: POC demo tests, data-driven tests, report validation tests
 *
 * USAGE EXAMPLES:
 *   await FileUtils.downloadFile(page, () => page.click('#download-btn'))
 *   await FileUtils.validateExcelFile('report.xlsx', ['Name', 'Email', 'Phone'])
 *   await FileUtils.readExcelAsJson('data.xlsx')
 *
 * UPDATED: 2026-02-09
 */

import { Page, Download } from '@playwright/test';
import { Log } from './logger';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export class FileUtils {
  private static downloadDir: string = './tests/test-data/downloads';

  /**
   * Download file triggered by browser action
   * @param page Playwright page
   * @param triggerDownload Function that triggers download (e.g., () => page.click('#download-btn'))
   * @param downloadDir Custom download directory (default: ./downloads)
   * @returns Downloaded file path
   */
  static async downloadFile(
    page: Page,
    triggerDownload: () => Promise<void>,
    downloadDir?: string
  ): Promise<string> {
    const targetDir = downloadDir || this.downloadDir;

    // Ensure download directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      Log.info(`Created download directory: ${targetDir}`);
    }

    // Start waiting for download
    const downloadPromise = page.waitForEvent('download');

    // Trigger download action
    await triggerDownload();
    Log.info('Download triggered');

    // Wait for download to complete
    const download: Download = await downloadPromise;
    const fileName = download.suggestedFilename();
    const filePath = path.join(targetDir, fileName);

    // Save to disk
    await download.saveAs(filePath);
    Log.info(`File downloaded: ${filePath}`);

    return filePath;
  }

  /**
   * Validate Excel file structure
   * @param filePath Path to Excel file
   * @param expectedColumns Expected column names (array)
   * @param expectedSheetName Expected sheet name (optional, uses first sheet if not provided)
   * @returns Validation result with details
   */
  static async validateExcelFile(
    filePath: string,
    expectedColumns: string[],
    expectedSheetName?: string
  ): Promise<{ valid: boolean; errors: string[]; rowCount: number; actualColumns: string[] }> {
    const errors: string[] = [];

    // Check file exists
    if (!fs.existsSync(filePath)) {
      return { valid: false, errors: [`File not found: ${filePath}`], rowCount: 0, actualColumns: [] };
    }

    try {
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = expectedSheetName || workbook.SheetNames[0];

      if (!sheetName) {
        errors.push('Workbook has no sheets');
        return { valid: false, errors, rowCount: 0, actualColumns: [] };
      }

      // Check sheet exists
      if (!workbook.SheetNames.includes(sheetName)) {
        errors.push(`Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
        return { valid: false, errors, rowCount: 0, actualColumns: [] };
      }

      // Get worksheet
      const worksheet = workbook.Sheets[sheetName]!;
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      // Check if empty
      if (data.length === 0) {
        errors.push('Excel file is empty (no data rows)');
        return { valid: false, errors, rowCount: 0, actualColumns: [] };
      }

      // Get actual columns
      const actualColumns = Object.keys(data[0]);

      // Validate columns
      for (const expectedCol of expectedColumns) {
        if (!actualColumns.includes(expectedCol)) {
          errors.push(`Missing expected column: "${expectedCol}"`);
        }
      }

      const valid = errors.length === 0;
      Log.info(`Excel validation: ${valid ? 'PASSED' : 'FAILED'} - ${data.length} rows, ${actualColumns.length} columns`);

      return {
        valid,
        errors,
        rowCount: data.length,
        actualColumns
      };

    } catch (error: any) {
      errors.push(`Failed to read Excel file: ${error.message}`);
      return { valid: false, errors, rowCount: 0, actualColumns: [] };
    }
  }

  /**
   * Read Excel file as JSON array
   * @param filePath Path to Excel file
   * @param sheetName Sheet name (default: first sheet)
   * @returns Array of row objects
   */
  static async readExcelAsJson(filePath: string, sheetName?: string): Promise<any[]> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = sheetName || workbook.SheetNames[0];

    if (!sheet) {
      throw new Error('Workbook has no sheets');
    }

    const worksheet = workbook.Sheets[sheet]!;
    const data = XLSX.utils.sheet_to_json(worksheet);

    Log.info(`Read ${data.length} rows from Excel sheet "${sheet}"`);
    return data;
  }

  /**
   * Delete file if exists
   * @param filePath File path
   */
  static async deleteFileIfExists(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      Log.info(`Deleted file: ${filePath}`);
    }
  }

  /**
   * Get file extension (without dot)
   * @param filePath File path
   * @returns Extension (e.g., 'xlsx', 'csv', 'pdf')
   */
  static getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase().replace('.', '');
  }

  /**
   * Wait for file to exist (polling)
   * @param filePath File path to wait for
   * @param timeout Timeout in milliseconds (default: 30000)
   * @param pollInterval Poll interval in milliseconds (default: 500)
   * @returns True if file exists within timeout, false otherwise
   */
  static async waitForFile(
    filePath: string,
    timeout: number = 30000,
    pollInterval: number = 500
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (fs.existsSync(filePath)) {
        Log.info(`File found: ${filePath}`);
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    Log.warn(`File not found after ${timeout}ms: ${filePath}`);
    return false;
  }

  /**
   * Check if file exists
   * @param filePath File path
   * @returns True if exists, false otherwise
   */
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}
