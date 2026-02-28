/** Loads test data from JSON files (local or remote URLs) */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { IAdapter, AdapterResult, AdapterRecord, AdapterMetadata } from './IAdapter';

/** Loads and normalizes data from local JSON files or remote URLs */
export class JsonAdapter implements IAdapter {

  /** Reads JSON from file or URL and converts to normalized AdapterResult */
  async load(params: { file?: string; url?: string; rootKey?: string }): Promise<AdapterResult> {
    const timestamp = new Date().toISOString();

    if (!params.file && !params.url) {
      const warning = 'JsonAdapter requires either "file" or "url" parameter';
      this.logWarning(warning);
      return {
        records: [],
        metadata: {
          source: 'json:unknown',
          loadedAt: timestamp,
          warning,
          rowCount: 0
        }
      };
    }

    let rawData: any;
    let sourceName: string;

    try {
      if (params.file) {
        rawData = await this.loadFromFile(params.file);
        sourceName = `json:${path.basename(params.file)}`;
      } else {
        rawData = await this.loadFromUrl(params.url!);
        sourceName = `json:${new URL(params.url!).hostname}`;
      }

      const records = this.normalizeData(rawData, params.rootKey);

      const metadata: AdapterMetadata = {
        source: sourceName,
        loadedAt: timestamp,
        rowCount: records.length
      };

      console.log(`[OK] JsonAdapter: Loaded ${records.length} records from ${params.file || params.url}`);

      return { records, metadata };

    } catch (error: any) {
      const warning = `Failed to load JSON: ${error.message}`;
      this.logWarning(warning);
      return {
        records: [],
        metadata: {
          source: params.file ? `json:${path.basename(params.file)}` : `json:${params.url}`,
          loadedAt: timestamp,
          warning,
          rowCount: 0
        }
      };
    }
  }

  /** Reads and parses a local JSON file */
  private async loadFromFile(file: string): Promise<any> {
    const filePath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${file}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /** Fetches and parses JSON from an HTTP endpoint (10s timeout) */
  private async loadFromUrl(url: string): Promise<any> {
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: { 'Accept': 'application/json' }
    });
    
    return response.data;
  }

  /** Converts JSON structures to AdapterRecord[]; supports rootKey with dot notation */
  private normalizeData(data: any, rootKey?: string): AdapterRecord[] {
    let target = data;

    if (rootKey) {
      const keys = rootKey.split('.');
      for (const key of keys) {
        target = target?.[key];
        if (target === undefined) {
          return [];
        }
      }
    }

    if (!Array.isArray(target)) {
      target = [target];
    }

    return target.map((item: any) => {
      if (typeof item === 'object' && item !== null) {
        return item as AdapterRecord;
      }
      return { value: item } as AdapterRecord;
    });
  }

  /** Writes warning to artifacts/adapter-warnings.log */
  private logWarning(message: string): void {
    const logMessage = `[${new Date().toISOString()}] [JsonAdapter] ${message}\n`;
    
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
