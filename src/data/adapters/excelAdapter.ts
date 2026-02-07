/**
 * FILE: src/data/adapters/excelAdapter.ts
 * PURPOSE: Loads test data from Excel (.xlsx) and CSV (.csv) files using the xlsx library
 * CONTENTS: ExcelAdapter class implementing IAdapter interface
 * DEPENDENCIES:
 *   - xlsx: Industry-standard library for parsing Excel files
 *   - fs: Node.js file system for checking file existence
 *   - path: Node.js path utilities for resolving file paths
 *   - IAdapter: Contract this adapter implements
 * USED BY:
 *   - src/tests/[any]/[file].spec.ts (any test file loading data from Excel/CSV)
 *   - src/data/adapters/adapterFactory.ts (when type='excel' is requested)
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { IAdapter, AdapterResult, AdapterRecord, AdapterMetadata } from './IAdapter';

/**
 * CLASS: ExcelAdapter
 * RESPONSIBILITY: Handles loading and normalization of data from Excel and CSV files
 * 
 * PROPERTIES:
 *   None (stateless adapter - all config passed to load() method)
 * 
 * METHODS OVERVIEW:
 *   - load(params): Main method to read Excel/CSV file and return normalized data
 *   - (private) logWarning(message): Writes warnings to artifacts/adapter-warnings.log
 * 
 * USAGE EXAMPLE:
 *   const adapter = new ExcelAdapter();
 *   const result = await adapter.load({ 
 *     file: 'test-data/users.xlsx', 
 *     sheet: 'TestUsers' 
 *   });
 *   const firstUser = result.records[0];
 *   console.log(firstUser.username, firstUser.password);
 * 
 * INHERITANCE: Implements IAdapter
 * 
 * WHY NECESSARY:
 * Excel is the most common format for test data management by non-technical stakeholders.
 * QA teams and business analysts can maintain test data in Excel without writing code.
 * CSV format support enables integration with other tools and systems.
 */
export class ExcelAdapter implements IAdapter {
  /**
   * METHOD: load
   * PURPOSE: Reads an Excel or CSV file and converts it to normalized test data format
   * 
   * HOW IT WORKS:
   * 1. Resolve the file path (support both absolute and relative paths)
   * 2. Check if file exists - if not, return empty records with warning
   * 3. Read file buffer using fs.readFileSync
   * 4. Parse buffer with XLSX.read() to get workbook object
   * 5. Determine which sheet to read (params.sheet or first sheet)
   * 6. Convert sheet to JSON array using XLSX.utils.sheet_to_json()
   * 7. Normalize each row to AdapterRecord format (object with string keys)
   * 8. Generate metadata with source identifier and timestamp
   * 9. Log success to console and return AdapterResult
   * 
   * WHY NECESSARY:
   * Enables data-driven testing where test data is managed in stakeholder-friendly Excel files.
   * Non-technical team members can update test scenarios without touching code.
   * Supports both .xlsx (Excel) and .csv formats transparently.
   * 
   * USED BY:
   *   - src/tests/login/valid-login.spec.ts (loads username/password test data)
   *   - src/tests/reports/download-report.spec.ts (loads date range test data)
   *   - Any test requiring tabular test data
   * 
   * @param params - Configuration object with the following properties:
   *   - file: string - Path to Excel/CSV file (relative to project root or absolute)
   *                    Example: 'test-data/users.xlsx' or 'C:/data/credentials.csv'
   *   - sheet?: string - (Optional) Sheet name to read. If omitted, reads first sheet
   *                     Example: 'TestUsers', 'Sheet1', 'Credentials'
   * 
   * @returns Promise<AdapterResult> - Always resolves with:
   *   On success: {
   *     records: [{ col1: 'value1', col2: 'value2' }, ...],
   *     metadata: { 
   *       source: 'excel:users.xlsx', 
   *       loadedAt: '2026-02-06T10:30:00.000Z',
   *       rowCount: 5
   *     }
   *   }
   *   On file not found: {
   *     records: [],
   *     metadata: {
   *       source: 'excel:missing.xlsx',
   *       loadedAt: '2026-02-06T10:30:00.000Z',
   *       warning: 'File not found: test-data/missing.xlsx',
   *       rowCount: 0
   *     }
   *   }
   * 
   * EXAMPLE:
   *   // Load specific sheet from Excel file
   *   const adapter = new ExcelAdapter();
   *   const result = await adapter.load({ 
   *     file: 'test-data/users.xlsx', 
   *     sheet: 'ValidUsers' 
   *   });
   *   
   *   // Use data in test
   *   for (const user of result.records) {
   *     await loginPage.login(user.username, user.password);
   *     expect(await homePage.isLoggedIn()).toBe(true);
   *   }
   * 
   * EDGE CASES:
   * - File not found: Returns empty records array with warning in metadata, logs to artifacts/adapter-warnings.log
   * - Invalid Excel format: Returns empty records with warning describing parse error
   * - Empty sheet: Returns empty records array (no warning - this is valid)
   * - Missing 'sheet' param: Uses first sheet in workbook (most common use case)
   * - CSV file: Automatically detected and parsed (sheet param ignored for CSV)
   * - Non-existent sheet name: Returns empty records with warning listing available sheets
   */
  async load(params: { file: string; sheet?: string }): Promise<AdapterResult> {
    const timestamp = new Date().toISOString();
    
    // Step 1 & 2: Resolve path and check existence
    const filePath = path.isAbsolute(params.file) 
      ? params.file 
      : path.resolve(process.cwd(), params.file);
    
    if (!fs.existsSync(filePath)) {
      const warning = `File not found: ${params.file}`;
      this.logWarning(warning);
      return {
        records: [],
        metadata: {
          source: `excel:${path.basename(params.file)}`,
          loadedAt: timestamp,
          warning,
          rowCount: 0
        }
      };
    }

    try {
      // Step 3: Read file buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      // Step 4: Parse with xlsx library
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      // Step 5: Determine which sheet to read
      const sheetName = params.sheet || workbook.SheetNames[0];
      
      if (!sheetName || !workbook.Sheets[sheetName]) {
        const warning = `Sheet '${params.sheet}' not found. Available sheets: ${workbook.SheetNames.join(', ')}`;
        this.logWarning(warning);
        return {
          records: [],
          metadata: {
            source: `excel:${path.basename(params.file)}`,
            loadedAt: timestamp,
            warning,
            rowCount: 0
          }
        };
      }
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Step 6: Convert to JSON array (each row becomes an object)
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);
      
      // Step 7: Normalize to AdapterRecord[] (already in correct format from sheet_to_json)
      const records: AdapterRecord[] = rawData.map(row => ({ ...row }));
      
      // Step 8 & 9: Generate metadata and return
      const metadata: AdapterMetadata = {
        source: `excel:${path.basename(params.file)}${params.sheet ? `:${params.sheet}` : ''}`,
        loadedAt: timestamp,
        rowCount: records.length
      };
      
      console.log(`✅ ExcelAdapter: Loaded ${records.length} records from ${params.file}${params.sheet ? ` [${params.sheet}]` : ''}`);
      
      return { records, metadata };
      
    } catch (error: any) {
      // Parse error handling
      const warning = `Failed to parse Excel file: ${error.message}`;
      this.logWarning(warning);
      return {
        records: [],
        metadata: {
          source: `excel:${path.basename(params.file)}`,
          loadedAt: timestamp,
          warning,
          rowCount: 0
        }
      };
    }
  }

  /**
   * METHOD: logWarning (private)
   * PURPOSE: Writes adapter warnings to a log file for debugging and CI visibility
   * 
   * HOW IT WORKS:
   * 1. Construct log message with timestamp and warning text
   * 2. Ensure artifacts directory exists
   * 3. Append message to artifacts/adapter-warnings.log
   * 4. Also log to console for immediate feedback
   * 
   * WHY NECESSARY:
   * When tests run in CI, file-not-found or parse errors might go unnoticed.
   * This log provides a centralized place to check for data loading issues.
   * 
   * @param message - Warning message to log
   * 
   * USED BY: load() method when file not found or parse fails
   * 
   * EDGE CASES:
   * - artifacts directory doesn't exist: Creates it automatically
   * - No write permissions: Silently fails (console.warn still shows message)
   */
  private logWarning(message: string): void {
    const logMessage = `[${new Date().toISOString()}] [ExcelAdapter] ${message}\n`;
    
    try {
      const artifactsDir = path.resolve(process.cwd(), 'artifacts');
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }
      
      const logPath = path.join(artifactsDir, 'adapter-warnings.log');
      fs.appendFileSync(logPath, logMessage, 'utf-8');
    } catch (err) {
      // Silently fail if can't write to log
    }
    
    console.warn(`⚠️  ${message}`);
  }
}
