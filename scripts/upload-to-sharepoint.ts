/**
 * FILE: scripts/upload-to-sharepoint.ts
 * PURPOSE: CLI script for Jenkins post-build SharePoint upload
 * WHY NECESSARY: Enables automated report upload from CI/CD pipeline
 * USED BY: Jenkinsfile.ubuntu, Jenkinsfile.windows (post-build stage)
 *
 * HOW IT WORKS:
 * 1. Reads --dir argument (default: downloads/)
 * 2. Validates SharePoint config from .env
 * 3. Uploads all files in directory to SharePoint
 * 4. Exits 0 (success) or 1 (failure) for Jenkins
 *
 * Usage: npx ts-node scripts/upload-to-sharepoint.ts [--dir=downloads]
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { SharePointClient } from '../src/integrations/sharepoint-client';

async function main(): Promise<void> {
  // Parse --dir argument
  const dirArg = process.argv.find(arg => arg.startsWith('--dir='));
  const uploadDir = dirArg ? dirArg.split('=')[1]! : 'downloads';

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
