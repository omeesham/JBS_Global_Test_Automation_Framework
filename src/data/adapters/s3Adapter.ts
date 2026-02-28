/** Loads test data from AWS S3 buckets with graceful fallback when credentials missing */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { IAdapter, AdapterResult, AdapterRecord, AdapterMetadata } from './IAdapter';

/** Loads data from AWS S3 with graceful stub mode when credentials unavailable */
export class S3Adapter implements IAdapter {
  private client: S3Client | null = null;
  private isStubMode: boolean = false;

  /** Fetches S3 object and converts to normalized test data; returns stub if credentials missing */
  async load(params: { bucket: string; key: string; region?: string }): Promise<AdapterResult> {
    const timestamp = new Date().toISOString();
    await this.initializeClient(params.region);

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
      const command = new GetObjectCommand({
        Bucket: params.bucket,
        Key: params.key
      });

      const response = await this.client!.send(command);
      const content = await this.streamToString(response.Body as any);
      const contentType = response.ContentType || 'application/json';
      const records = this.parseContent(content, contentType);

      const metadata: AdapterMetadata = {
        source: `s3:${params.bucket}/${params.key}`,
        loadedAt: timestamp,
        rowCount: records.length
      };

      console.log(`[OK] S3Adapter: Loaded ${records.length} records from s3://${params.bucket}/${params.key}`);
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

  /** Creates S3 client or sets stub mode if credentials missing */
  private async initializeClient(region?: string): Promise<void> {
    if (!this.checkCredentials()) {
      this.isStubMode = true;
      this.client = null;
      return;
    }

    try {
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
      this.isStubMode = true;
      this.client = null;
    }
  }

  /** Validates that required AWS environment variables are present */
  private checkCredentials(): boolean {
    const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
    return required.every(envVar => process.env[envVar]);
  }

  /** Converts AWS SDK readable stream to string */
  private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }

  /** Parses JSON or CSV content string into AdapterRecord array */
  private parseContent(content: string, contentType: string): AdapterRecord[] {
    try {
      if (contentType.includes('json') || content.trim().startsWith('{') || content.trim().startsWith('[')) {
        const data = JSON.parse(content);
        return Array.isArray(data) ? data : [data];
      }

      // CSV parsing
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

  /** Writes warning to artifacts/adapter-warnings.log */
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
    
    console.warn(`[WARN]  ${message}`);
  }
}
