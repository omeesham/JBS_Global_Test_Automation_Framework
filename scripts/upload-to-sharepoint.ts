/**
 * CLI script for Jenkins post-build SharePoint upload.
 * Uploads test artifacts (reports, screenshots, logs) to SharePoint via Microsoft Graph API.
 * 
 * **Prerequisites:**
 * - Azure AD App Registration with Sites.ReadWrite.All permission
 * - Environment variables in config/environments/.env.{environment}:
 *   - SHAREPOINT_SITE_URL (your SharePoint site)
 *   - SHAREPOINT_CLIENT_ID (Azure app ID)
 *   - SHAREPOINT_CLIENT_SECRET (Azure app secret)
 *   - SHAREPOINT_TENANT_ID (Azure tenant ID)
 *   - SHAREPOINT_UPLOAD_PATH (optional, defaults to /Shared Documents/Test Reports/)
 * - Authentication: OAuth 2.0 client credentials flow via Microsoft Graph API
 * 
 * **Usage:**
 * ```bash
 * npx ts-node scripts/upload-to-sharepoint.ts --dir=downloads
 * ```
 */

import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';

// Load environment variables from config/environments/
// Cascade: .env -> .env.local -> .env.{environment} -> .env.{environment}.local
dotenvFlow.config({
  path: path.join(__dirname, '..', 'config', 'environments'),
  node_env: process.env.CI_ENV || process.env.NODE_ENV || 'development',
  silent: true
});

import { SharePointClient } from '../src/integrations/sharepoint-client';

/**
 * Main entry point for SharePoint upload.
 * Parses --dir argument, validates config, authenticates, uploads directory.
 * Exits with code 0 on success, 1 on failure.
 */
async function main(): Promise<void> {
  // Parse --dir argument
  const dirArg = process.argv.find(arg => arg.startsWith('--dir='));
  const uploadDir = dirArg ? dirArg.split('=')[1]! : 'tests/test-data/downloads';

  console.log(`[Upload] Target directory: ${uploadDir}`);

  const client = new SharePointClient();

  // Validate config
  const { valid, missing } = client.validateConfig();
  if (!valid) {
    console.error(`[Upload] Missing SharePoint config: ${missing.join(', ')}`);
    console.error('[Upload] Set these in .env or environment variables');
    process.exit(1);
  }

  try {
    // Authenticate
    await client.authenticate();

    // Upload directory
    const result = await client.uploadDirectory(uploadDir);

    if (result.uploaded.length === 0 && result.failed.length === 0) {
      console.log('[Upload] No files to upload');
      process.exit(0);
    }

    if (result.failed.length > 0) {
      console.error(`[Upload] ${result.failed.length} file(s) failed to upload`);
      process.exit(1);
    }

    console.log(`[Upload] Successfully uploaded ${result.uploaded.length} file(s)`);
    process.exit(0);
  } catch (error: any) {
    console.error(`[Upload] Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
