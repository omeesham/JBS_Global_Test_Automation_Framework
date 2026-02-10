/**
 * FILE: src/integrations/sharepoint-client.ts
 * PURPOSE: SharePoint file upload client via Microsoft Graph API
 * WHY NECESSARY: Enables Jenkins → SharePoint report upload pipeline
 * USED BY: scripts/upload-to-sharepoint.ts, Jenkins post-build stage
 *
 * HOW IT WORKS:
 * 1. Authenticates via Azure AD client credentials (OAuth 2.0)
 * 2. Uploads files to SharePoint document library via Microsoft Graph
 * 3. Zero new npm dependencies — uses existing axios
 *
 * REQUIRES: Azure AD app registration with Sites.ReadWrite.All permission
 * Config via .env: SHAREPOINT_SITE_URL, CLIENT_ID, CLIENT_SECRET, TENANT_ID, UPLOAD_PATH
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface SharePointConfig {
  siteUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  uploadPath: string;
}

export class SharePointClient {
  private config: SharePointConfig;
  private accessToken: string | null = null;
  private graphClient: AxiosInstance;

  constructor(config?: Partial<SharePointConfig>) {
    this.config = {
      siteUrl: config?.siteUrl || process.env.SHAREPOINT_SITE_URL || '',
      clientId: config?.clientId || process.env.SHAREPOINT_CLIENT_ID || '',
      clientSecret: config?.clientSecret || process.env.SHAREPOINT_CLIENT_SECRET || '',
      tenantId: config?.tenantId || process.env.SHAREPOINT_TENANT_ID || '',
      uploadPath: config?.uploadPath || process.env.SHAREPOINT_UPLOAD_PATH || '/Shared Documents/Test Reports/',
    };

    this.graphClient = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      timeout: 30000,
    });
  }

  /**
   * Validate that all required config is present
   */
  validateConfig(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    if (!this.config.siteUrl) missing.push('SHAREPOINT_SITE_URL');
    if (!this.config.clientId) missing.push('SHAREPOINT_CLIENT_ID');
    if (!this.config.clientSecret) missing.push('SHAREPOINT_CLIENT_SECRET');
    if (!this.config.tenantId) missing.push('SHAREPOINT_TENANT_ID');
    return { valid: missing.length === 0, missing };
  }

  /**
   * Authenticate via Azure AD client credentials flow
   */
  async authenticate(): Promise<void> {
    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    const response = await axios.post(tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this.accessToken = response.data.access_token;

    this.graphClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
    console.log('[SharePoint] Authenticated successfully');
  }

  /**
   * Get SharePoint site ID from URL
   */
  private async getSiteId(): Promise<string> {
    const url = new URL(this.config.siteUrl);
    const hostname = url.hostname;
    const sitePath = url.pathname;

    const response = await this.graphClient.get(`/sites/${hostname}:${sitePath}`);
    return response.data.id;
  }

  /**
   * Get the default document library drive ID
   */
  private async getDriveId(siteId: string): Promise<string> {
    const response = await this.graphClient.get(`/sites/${siteId}/drive`);
    return response.data.id;
  }

  /**
   * Upload a single file to SharePoint
   * @param localPath Local file path
   * @param remotePath Remote path within upload directory (optional, uses filename)
   * @returns SharePoint file URL
   */
  async uploadFile(localPath: string, remotePath?: string): Promise<string> {
    if (!this.accessToken) await this.authenticate();

    const fileName = remotePath || path.basename(localPath);
    const uploadTarget = `${this.config.uploadPath}${fileName}`.replace(/\/\//g, '/');

    const siteId = await this.getSiteId();
    const driveId = await this.getDriveId(siteId);

    const fileContent = fs.readFileSync(localPath);
    const fileSize = fs.statSync(localPath).size;

    // For files < 4MB, use simple upload. For larger, use upload session.
    if (fileSize < 4 * 1024 * 1024) {
      const response = await this.graphClient.put(
        `/drives/${driveId}/root:${uploadTarget}:/content`,
        fileContent,
        {
          headers: { 'Content-Type': 'application/octet-stream' },
          maxBodyLength: Infinity,
        }
      );
      console.log(`[SharePoint] Uploaded: ${fileName} → ${uploadTarget}`);
      return response.data.webUrl || uploadTarget;
    } else {
      // Create upload session for large files
      const sessionResponse = await this.graphClient.post(
        `/drives/${driveId}/root:${uploadTarget}:/createUploadSession`,
        { item: { '@microsoft.graph.conflictBehavior': 'replace' } }
      );

      const uploadUrl = sessionResponse.data.uploadUrl;
      const chunkSize = 3.5 * 1024 * 1024; // 3.5MB chunks
      let offset = 0;

      while (offset < fileSize) {
        const end = Math.min(offset + chunkSize, fileSize);
        const chunk = fileContent.slice(offset, end);

        await axios.put(uploadUrl, chunk, {
          headers: {
            'Content-Range': `bytes ${offset}-${end - 1}/${fileSize}`,
            'Content-Type': 'application/octet-stream',
          },
        });

        offset = end;
      }

      console.log(`[SharePoint] Uploaded (large): ${fileName} → ${uploadTarget}`);
      return uploadTarget;
    }
  }

  /**
   * Upload all files from a directory
   * @param localDir Local directory path
   * @param remoteDir Remote subdirectory (optional)
   * @returns Upload results
   */
  async uploadDirectory(
    localDir: string,
    remoteDir?: string
  ): Promise<{ uploaded: string[]; failed: string[] }> {
    const uploaded: string[] = [];
    const failed: string[] = [];

    if (!fs.existsSync(localDir)) {
      console.warn(`[SharePoint] Directory not found: ${localDir}`);
      return { uploaded, failed };
    }

    const files = fs.readdirSync(localDir);
    for (const file of files) {
      const filePath = path.join(localDir, file);

      if (!fs.statSync(filePath).isFile()) continue;

      try {
        const remoteName = remoteDir ? `${remoteDir}/${file}` : file;
        await this.uploadFile(filePath, remoteName);
        uploaded.push(file);
      } catch (error: any) {
        console.error(`[SharePoint] Failed to upload ${file}: ${error.message}`);
        failed.push(file);
      }
    }

    console.log(`[SharePoint] Upload complete: ${uploaded.length} uploaded, ${failed.length} failed`);
    return { uploaded, failed };
  }

  /**
   * List files in SharePoint directory
   * @param remotePath Remote directory path (optional, uses upload path)
   * @returns Array of file names
   */
  async listFiles(remotePath?: string): Promise<string[]> {
    if (!this.accessToken) await this.authenticate();

    const targetPath = remotePath || this.config.uploadPath;
    const siteId = await this.getSiteId();
    const driveId = await this.getDriveId(siteId);

    const response = await this.graphClient.get(
      `/drives/${driveId}/root:${targetPath}:/children`
    );

    return response.data.value.map((item: any) => item.name);
  }
}
