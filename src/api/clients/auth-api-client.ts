/**
 * FILE: src/api/clients/auth-api-client.ts
 * PURPOSE: API client for authentication endpoints
 * WHY NECESSARY: Standardized auth API calls for tests
 * USED BY: API tests, hybrid UI+API tests
 */

import { BaseApiClient, ApiClientOptions } from '../../common/api-client';
import { Log } from '../../utils/logger';

export interface LoginRequest {
  username: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  message?: string;
}

export class AuthApiClient extends BaseApiClient {
  constructor(options: ApiClientOptions) {
    super(options);
  }

  /**
   * Login via API
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    Log.info(`API Login: ${credentials.username}`);
    
    try {
      const response = await this.post<LoginResponse>('/api/auth/login', credentials);
      
      if (response.data.token) {
        this.setAuthToken(response.data.token);
        Log.info('✅ API login successful, token stored');
      }
      
      return response.data;
    } catch (error) {
      Log.error(`❌ API login failed: ${error}`);
      throw error;
    }
  }

  /**
   * Logout via API
   */
  async logout(): Promise<void> {
    Log.info('API Logout');
    
    try {
      await this.post('/api/auth/logout');
      this.clearAuthToken();
      Log.info('✅ API logout successful');
    } catch (error) {
      Log.error(`❌ API logout failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    Log.info('API Get current user');
    
    try {
      const response = await this.get('/api/auth/me');
      return response.data;
    } catch (error) {
      Log.error(`❌ API get user failed: ${error}`);
      throw error;
    }
  }
}
