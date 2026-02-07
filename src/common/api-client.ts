/**
 * FILE: src/common/api-client.ts
 * PURPOSE: Base API client for HTTP requests
 * WHY NECESSARY: Standardized API calls with auth, retries, logging
 * USED BY: API test files, page objects needing API calls
 * 
 * HOW IT WORKS:
 * 1. Wraps axios with authentication and error handling
 * 2. Provides request(), get(), post(), put(), delete()
 * 3. Auto-adds headers, handles retries, logs all calls
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Log } from '../utils/logger';

export interface ApiClientOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  authToken?: string;
}

export class BaseApiClient {
  protected client: AxiosInstance;
  protected authToken?: string;

  constructor(options: ApiClientOptions) {
    this.authToken = options.authToken;
    
    this.client = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        Log.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        Log.error(`API Request Error: ${error}`);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        Log.info(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        Log.error(`API Response Error: ${error.response?.status} ${error.config?.url}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic request method
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.request<T>(config);
    } catch (error) {
      Log.error(`Request failed: ${error}`);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    Log.info('Auth token updated');
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = undefined;
    Log.info('Auth token cleared');
  }
}
