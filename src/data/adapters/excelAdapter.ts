/** Loads test data from Excel (.xlsx) and CSV (.csv) files using the xlsx library */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { IAdapter, AdapterResult, AdapterRecord, AdapterMetadata } from './IAdapter';

/** Loads and normalizes data from Excel (.xlsx) and CSV (.csv) files */
export class ExcelAdapter implements IAdapter {

 /** Reads Excel/CSV file and converts to normalized AdapterResult */
  async load(params: { file: string; sheet?: string }): Promise<AdapterResult> {
    const timestamp = new Date().toISOString();
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
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
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
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);
      const records: AdapterRecord[] = rawData.map(row => ({ ...row }));

      const metadata: AdapterMetadata = {
        source: `excel:${path.basename(params.file)}${params.sheet ? `:${params.sheet}` : ''}`,
        loadedAt: timestamp,
        rowCount: records.length
      };
      
      console.log(`[OK] ExcelAdapter: Loaded ${records.length} records from ${params.file}${params.sheet ? ` [${params.sheet}]` : ''}`);
      
      return { records, metadata };
      
    } catch (error: any) {
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

 /** Writes warning to artifacts/adapter-warnings.log */
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
    
    console.warn(`[WARN]  ${message}`);
  }
}
