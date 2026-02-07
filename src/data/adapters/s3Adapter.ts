/**
 * FILE: src/data/adapters/s3Adapter.ts
 * PURPOSE: Loads test data from AWS S3 buckets with graceful fallback when credentials missing
 * CONTENTS: S3Adapter class implementing IAdapter interface
 * DEPENDENCIES:
 *   - @aws-sdk/client-s3: AWS SDK v3 for S3 operations
 *   - IAdapter: Contract this adapter implements
 * USED BY:
 *   - src/tests/[any]/[file].spec.ts (tests requiring S3-stored test data)
 *   - src/data/adapters/adapterFactory.ts (when type='s3' is requested)
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { IAdapter, AdapterResult, AdapterRecord, AdapterMetadata } from './IAdapter';

/**
 * CLASS: S3Adapter
 * RESPONSIBILITY: Handles loading data from AWS S3 with stub mode when credentials unavailable
 * 
 * PROPERTIES:
 *   - client: S3Client instance (null if in stub mode)
 *   - isStubMode: boolean flag indicating if adapter is using stub behavior
 * 
 * METHODS OVERVIEW:
 *   - load(params): Main method to fetch and parse S3 object
 *   - (private) initializeClient(): Creates S3 client or enters stub mode
 *   - (private) checkCredentials(): Validates required environment variables
 *   - (private) streamToString(stream): Converts S3 object stream to string
 *   - (private) parseContent(content, contentType): Parses JSON or CSV content
 *   - (private) logWarning(message): Writes warnings to artifacts/adapter-warnings.log
 * 
 * USAGE EXAMPLE:
 *   // With AWS credentials in .env:
 *   const adapter = new S3Adapter();
 *   const result = await adapter.load({ 
 *     bucket: 'test-data-bucket',
 *     key: 'users.json'
 *   });
 *   
 *   // Without credentials (stub mode):
 *   const result = await adapter.load({ bucket: 'test-bucket', key: 'data.json' });
 *   // Returns: { records: [], metadata: { warning: 'S3 credentials missing...' } }
 * 
 * INHERITANCE: Implements IAdapter
 * 
 * WHY NECESSARY:
 * Enables testing with data stored in S3 (common in cloud-native applications).
 * Stub mode allows tests to run locally without AWS credentials.
 * Supports both JSON and CSV formats from S3.
 */
export class S3Adapter implements IAdapter {
  private client: S3Client | null = null;
  private isStubMode: boolean = false;

  /**
   * METHOD: load
   * PURPOSE: Fetches object from S3 and converts it to normalized test data format
   * 
   * HOW IT WORKS:
   * 1. Initialize S3 client (or set stub mode if credentials missing)
   * 2. If stub mode: Return empty records with warning listing required env vars
   * 3. If connected: Create GetObjectCommand with bucket and key
   * 4. Send command to S3 and get response stream
   * 5. Convert stream to string content
   * 6. Detect content type (JSON or CSV) and parse accordingly
   * 7. Normalize parsed data to AdapterRecord[] format
   * 8. Generate metadata with source identifier and timestamp
   * 9. Return AdapterResult with records and metadata
   * 
   * WHY NECESSARY:
   * Provides S3 test data without requiring AWS credentials in all environments.
   * Tests can run locally (stub mode) or in CI with real S3 (when secrets available).
   * Prevents test failures due to missing AWS access.
   * 
   * USED BY:
   *   - src/tests/integration/**.spec.ts (tests with S3-stored fixtures)
   *   - src/tests/cloud/**.spec.ts (tests validating S3 data)
   * 
   * @param params - Configuration object:
   *   - bucket: string - S3 bucket name
   *                      Example: 'my-test-data-bucket'
   *   - key: string - S3 object key (file path within bucket)
   *                   Example: 'test-data/users.json' or 'data/credentials.csv'
   *   - region?: string - (Optional) AWS region override (defaults to AWS_REGION env)
   * 
   * @returns Promise<AdapterResult>
   *   Stub mode: {
   *     records: [],
   *     metadata: {
   *       source: 's3-stub',
   *       loadedAt: '2026-02-06T...',
   *       warning: 'S3 credentials missing. Required: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY'
   *     }
   *   }
   *   Connected: {
   *     records: [{id: 1, name: 'test'}, ...],
   *     metadata: {
   *       source: 's3:my-bucket/users.json',
   *       loadedAt: '2026-02-06T...',
   *       rowCount: 5
   *     }
   *   }
   * 
   * EXAMPLE:
   *   const adapter = new S3Adapter();
   *   
   *   // Load JSON from S3
   *   const result = await adapter.load({
   *     bucket: 'test-data-bucket',
   *     key: 'fixtures/users.json'
   *   });
   *   
   *   for (const user of result.records) {
   *     await loginPage.login(user.username, user.password);
   *   }
   * 
   * EDGE CASES:
   * - Missing credentials: Returns empty records with warning (DOES NOT THROW)
   * - Object not found: Returns empty records with 404 warning
   * - Access denied: Returns empty records with permission error warning
   * - Invalid JSON/CSV: Returns empty records with parse error warning
   * - Empty object: Returns empty records (no warning - valid scenario)
   * - Network timeout: Returns empty records with timeout warning
   */
  async load(params: { bucket: string; key: string; region?: string }): Promise<AdapterResult> {
    const timestamp = new Date().toISOString();
    
    // Step 1: Initialize client
    await this.initializeClient(params.region);
    
    // Step 2: Check stub mode
    if (this.isStubMode) {
      const warning = 'S3 credentials missing. Required environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY';
      this.logWarning(warning);
      this.logWarning('To enable S3 adapter, set these variables in your .env file:');
      this.logWarning('  AWS_REGION=us-east-1  # or your preferred region');
      this.logWarning('  AWS_ACCESS_KEY_ID=your_access_key');
      this.logWarning('  AWS_SECRET_ACCESS_KEY=your_secret_key');
      this.logWarning('  AWS_SESSION_TOKEN=your_token  # optional, for temp credentials');
      
      return {
        records: [],
        metadata: {
          source: 's3-stub',
          loadedAt: timestamp,
          warning,
          rowCount: 0
        }
      };
    }

    try {
      // Step 3: Create GetObject command
      const command = new GetObjectCommand({
        Bucket: params.bucket,
        Key: params.key
      });

      // Step 4: Send command and get response
      const response = await this.client!.send(command);

      // Step 5: Convert stream to string
      const content = await this.streamToString(response.Body as any);

      // Step 6: Parse content based on type
      const contentType = response.ContentType || 'application/json';
      const records = this.parseContent(content, contentType);

      // Step 7 & 8: Generate metadata
      const metadata: AdapterMetadata = {
        source: `s3:${params.bucket}/${params.key}`,
        loadedAt: timestamp,
        rowCount: records.length
      };

      console.log(`✅ S3Adapter: Loaded ${records.length} records from s3://${params.bucket}/${params.key}`);

      // Step 9: Return result
      return { records, metadata };

    } catch (error: any) {
      const warning = error.name === 'NoSuchKey' 
        ? `S3 object not found: s3://${params.bucket}/${params.key}`
        : `S3 operation failed: ${error.message}`;
      
      this.logWarning(warning);

      return {
        records: [],
        metadata: {
          source: `s3:${params.bucket}/${params.key}`,
          loadedAt: timestamp,
          warning,
          rowCount: 0
        }
      };
    }
  }

  /**
   * METHOD: initializeClient (private)
   * PURPOSE: Creates S3 client or sets stub mode if credentials missing
   * 
   * HOW IT WORKS:
   * 1. Call checkCredentials() to validate environment variables
   * 2. If credentials missing: Set isStubMode=true, client=null, return
   * 3. If credentials present: Create S3Client configuration
   * 4. Initialize client with credentials and region
   * 
   * WHY NECESSARY:
   * Implements graceful degradation - tests don't fail when AWS unavailable.
   * Centralizes client creation logic.
   * 
   * @param region - Optional region override
   * 
   * EDGE CASES:
   * - Invalid credentials: Client created but operations will fail (caught in load())
   * - Missing region: Uses AWS_REGION env var or throws
   */
  private async initializeClient(region?: string): Promise<void> {
    // Step 1 & 2: Check credentials
    if (!this.checkCredentials()) {
      this.isStubMode = true;
      this.client = null;
      return;
    }

    try {
      // Step 3 & 4: Create S3 client
      this.client = new S3Client({
        region: region || process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN })
        }
      });

      this.isStubMode = false;

    } catch (error) {
      // Client creation failed - enter stub mode
      this.isStubMode = true;
      this.client = null;
    }
  }

  /**
   * METHOD: checkCredentials (private)
   * PURPOSE: Validates that required AWS environment variables are present
   * 
   * HOW IT WORKS:
   * 1. Check for presence of AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
   * 2. Return true if all present, false if any missing
   * 
   * @returns boolean - true if all required credentials present
   */
  private checkCredentials(): boolean {
    const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
    return required.every(envVar => process.env[envVar]);
  }

  /**
   * METHOD: streamToString (private)
   * PURPOSE: Converts AWS SDK readable stream to string
   * 
   * HOW IT WORKS:
   * 1. Create array to collect stream chunks
   * 2. Listen to 'data' events and collect chunks
   * 3. Wait for 'end' event
   * 4. Concatenate chunks and convert to UTF-8 string
   * 
   * @param stream - Readable stream from S3 GetObject
   * @returns Promise<string> - Content as string
   */
  private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }

  /**
   * METHOD: parseContent (private)
   * PURPOSE: Parses JSON or CSV content into AdapterRecord array
   * 
   * HOW IT WORKS:
   * 1. Check contentType for JSON or CSV
   * 2. If JSON: Parse with JSON.parse()
   * 3. If CSV: Split lines, parse headers, create objects
   * 4. Normalize to array of objects
   * 5. Return AdapterRecord[]
   * 
   * @param content - Raw string content
   * @param contentType - MIME type from S3 metadata
   * @returns AdapterRecord[] - Normalized data
   * 
   * EDGE CASES:
   * - Unknown content type: Attempts JSON parse, falls back to empty array
   * - Malformed JSON: Returns empty array
   * - CSV without headers: Uses column indices as keys
   */
  private parseContent(content: string, contentType: string): AdapterRecord[] {
    try {
      // JSON parsing
      if (contentType.includes('json') || content.trim().startsWith('{') || content.trim().startsWith('[')) {
        const data = JSON.parse(content);
        return Array.isArray(data) ? data : [data];
      }

      // CSV parsing (basic implementation)
      if (contentType.includes('csv') || contentType.includes('text')) {
        const lines = content.trim().split('\n');
        if (lines.length === 0 || !lines[0]) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const records: AdapterRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          const values = line.split(',').map(v => v.trim());
          const record: AdapterRecord = {};
          headers.forEach((header, index) => {
            record[header] = values[index] || '';
          });
          records.push(record);
        }

        return records;
      }

      // Default: try JSON
      return JSON.parse(content);

    } catch (error) {
      this.logWarning(`Failed to parse S3 content: ${error}`);
      return [];
    }
  }

  /**
   * METHOD: logWarning (private)
   * PURPOSE: Writes adapter warnings to log file for debugging
   * 
   * @param message - Warning message to log
   */
  private logWarning(message: string): void {
    const logMessage = `[${new Date().toISOString()}] [S3Adapter] ${message}\n`;
    
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
