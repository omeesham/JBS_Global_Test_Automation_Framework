/**
 * FILE: src/data/adapters/jsonAdapter.ts
 * PURPOSE: Loads test data from JSON files (local or remote URLs)
 * CONTENTS: JsonAdapter class implementing IAdapter interface
 * DEPENDENCIES:
 *   - fs: Node.js file system for reading local JSON files
 *   - path: Node.js path utilities for resolving file paths
 *   - axios: HTTP client for fetching remote JSON (if URL provided)
 *   - IAdapter: Contract this adapter implements
 * USED BY:
 *   - src/tests/[any]/[file].spec.ts (tests loading data from JSON files or APIs)
 *   - src/data/adapters/adapterFactory.ts (when type='json' is requested)
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { IAdapter, AdapterResult, AdapterRecord, AdapterMetadata } from './IAdapter';

/**
 * CLASS: JsonAdapter
 * RESPONSIBILITY: Handles loading and normalization of data from JSON files and URLs
 * 
 * PROPERTIES:
 *   None (stateless adapter - all config passed to load() method)
 * 
 * METHODS OVERVIEW:
 *   - load(params): Main method to read JSON from file or URL and return normalized data
 *   - (private) loadFromFile(filePath): Reads local JSON file
 *   - (private) loadFromUrl(url): Fetches JSON from HTTP endpoint
 *   - (private) normalizeData(data): Converts JSON to AdapterRecord[] format
 *   - (private) logWarning(message): Writes warnings to artifacts/adapter-warnings.log
 * 
 * USAGE EXAMPLE:
 *   // Load from local file
 *   const adapter = new JsonAdapter();
 *   const result = await adapter.load({ file: 'test-data/users.json' });
 *   
 *   // Load from URL
 *   const result2 = await adapter.load({ url: 'https://api.example.com/test-data' });
 * 
 * INHERITANCE: Implements IAdapter
 * 
 * WHY NECESSARY:
 * JSON is a universal data format used by APIs and modern configuration.
 * Supports both local files (version-controlled test data) and remote URLs (dynamic data from APIs).
 * Enables API testing where test data comes from the same API being tested.
 */
export class JsonAdapter implements IAdapter {
  /**
   * METHOD: load
   * PURPOSE: Reads JSON from a file or URL and converts it to normalized test data format
   * 
   * HOW IT WORKS:
   * 1. Check if params contains 'file' or 'url'
   * 2. If 'file': Call loadFromFile() to read local JSON
   * 3. If 'url': Call loadFromUrl() to fetch remote JSON
   * 4. Parse the JSON data (if not already parsed)
   * 5. Normalize to AdapterRecord[] using normalizeData()
   * 6. Generate metadata with source identifier and timestamp
   * 7. Return AdapterResult with records and metadata
   * 
   * WHY NECESSARY:
   * Provides flexible data loading from both static files and dynamic APIs.
   * Tests can use version-controlled JSON files for reproducibility
   * or fetch live data from APIs for integration testing.
   * 
   * USED BY:
   *   - src/tests/api/**.spec.ts (loads API response fixtures)
   *   - src/tests/integration/**.spec.ts (loads dynamic test data from APIs)
   *   - Any test requiring JSON-formatted data
   * 
   * @param params - Configuration object with ONE of:
   *   - file: string - Path to local JSON file (relative or absolute)
   *                    Example: 'test-data/users.json'
   *   - url: string - HTTP/HTTPS URL to JSON endpoint
   *                   Example: 'https://jsonplaceholder.typicode.com/users'
   *   - rootKey?: string - (Optional) If JSON is nested, specify the array key
   *                       Example: If JSON is { users: [...] }, use rootKey: 'users'
   * 
   * @returns Promise<AdapterResult> - Always resolves
   * 
   * EXAMPLE:
   *   // Load nested JSON with rootKey
   *   const result = await adapter.load({ 
   *     file: 'test-data/api-response.json',
   *     rootKey: 'data.users'  // Supports dot notation for nested keys
   *   });
   * 
   * EDGE CASES:
   * - Neither file nor url provided: Returns empty records with warning
   * - Both file and url provided: Prefers 'file', ignores 'url'
   * - File not found: Returns empty records with warning
   * - URL fetch fails: Returns empty records with warning (network error, 404, etc.)
   * - Invalid JSON: Returns empty records with warning describing parse error
   * - JSON is object (not array): Wraps in array if rootKey not provided
   * - Empty JSON array: Returns empty records (no warning - valid scenario)
   */
  async load(params: { file?: string; url?: string; rootKey?: string }): Promise<AdapterResult> {
    const timestamp = new Date().toISOString();
    
    // Step 1: Validate params
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
      // Step 2 & 3: Load data from file or URL
      if (params.file) {
        rawData = await this.loadFromFile(params.file);
        sourceName = `json:${path.basename(params.file)}`;
      } else {
        rawData = await this.loadFromUrl(params.url!);
        sourceName = `json:${new URL(params.url!).hostname}`;
      }

      // Step 5: Normalize data
      const records = this.normalizeData(rawData, params.rootKey);

      // Step 6 & 7: Generate metadata and return
      const metadata: AdapterMetadata = {
        source: sourceName,
        loadedAt: timestamp,
        rowCount: records.length
      };

      console.log(`✅ JsonAdapter: Loaded ${records.length} records from ${params.file || params.url}`);

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

  /**
   * METHOD: loadFromFile (private)
   * PURPOSE: Reads and parses a local JSON file
   * 
   * HOW IT WORKS:
   * 1. Resolve file path (absolute or relative to project root)
   * 2. Check if file exists
   * 3. Read file content as UTF-8 string
   * 4. Parse JSON using JSON.parse()
   * 5. Return parsed object
   * 
   * @param file - Path to JSON file
   * @returns Parsed JSON object/array
   * @throws Error if file not found or invalid JSON
   */
  private async loadFromFile(file: string): Promise<any> {
    const filePath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${file}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * METHOD: loadFromUrl (private)
   * PURPOSE: Fetches and parses JSON from an HTTP endpoint
   * 
   * HOW IT WORKS:
   * 1. Send GET request to URL using axios
   * 2. Wait for response (with 10 second timeout)
   * 3. Extract JSON from response.data
   * 4. Return parsed object
   * 
   * @param url - HTTP/HTTPS URL to JSON endpoint
   * @returns Parsed JSON object/array
   * @throws Error if request fails or response is not JSON
   */
  private async loadFromUrl(url: string): Promise<any> {
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: { 'Accept': 'application/json' }
    });
    
    return response.data;
  }

  /**
   * METHOD: normalizeData (private)
   * PURPOSE: Converts various JSON structures to AdapterRecord[] format
   * 
   * HOW IT WORKS:
   * 1. If rootKey provided, extract nested data using dot notation
   * 2. If data is already an array, use as-is
   * 3. If data is an object, wrap in array [data]
   * 4. Ensure each element is an object (AdapterRecord)
   * 5. Return normalized array
   * 
   * @param data - Raw JSON data (object or array)
   * @param rootKey - Optional key path to nested array (supports 'data.users' notation)
   * @returns Array of AdapterRecord objects
   * 
   * EDGE CASES:
   * - rootKey points to non-existent path: Returns empty array
   * - Data is primitive (string, number): Wraps in object { value: data }
   * - Array contains primitives: Wraps each in { value: item }
   */
  private normalizeData(data: any, rootKey?: string): AdapterRecord[] {
    let target = data;

    // Step 1: Extract nested data if rootKey provided
    if (rootKey) {
      const keys = rootKey.split('.');
      for (const key of keys) {
        target = target?.[key];
        if (target === undefined) {
          return [];
        }
      }
    }

    // Step 2 & 3: Ensure we have an array
    if (!Array.isArray(target)) {
      target = [target];
    }

    // Step 4 & 5: Ensure each element is an object
    return target.map((item: any) => {
      if (typeof item === 'object' && item !== null) {
        return item as AdapterRecord;
      }
      // Wrap primitives in object
      return { value: item } as AdapterRecord;
    });
  }

  /**
   * METHOD: logWarning (private)
   * PURPOSE: Writes adapter warnings to log file for debugging
   * 
   * @param message - Warning message to log
   * 
   * WHY NECESSARY: Centralized logging for data loading issues in CI/local runs
   */
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
    
    console.warn(`⚠️  ${message}`);
  }
}
