/** Foundation for all API connections (HTTP requests with authentication) */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Log } from '@framework/utils/logger';

/**
 * Configuration for API client
 * @interface ApiClientOptions
 */
export interface ApiClientOptions {
  /** Base URL for API (e.g., https://demo.us.espocrm.com/api/v1) */
  baseURL: string;
  
  /** Request timeout in milliseconds (default: 30000 = 30 seconds) */
  timeout?: number;
  
  /** Additional HTTP headers to include in all requests */
  headers?: Record<string, string>;
  
  /** Authentication token (JWT) - auto-added to all requests */
  authToken?: string;
}

/**
 * Base API Client
 * Parent class for all API helpers - provides HTTP methods and authentication
 * 
 * @class BaseApiClient
 * @example
 * const client = new BaseApiClient({ baseURL: process.env.BASE_URL });
 * const response = await client.get('/api/users');
 */
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

    // Request interceptor - runs before every request
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

    // Response interceptor - runs after every response
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
   * @template T - Expected response data type
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
   * GET request - retrieve data
   * @template T - Expected response data type
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request - create new data
   * @template T - Expected response data type
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request - update existing data
   * @template T - Expected response data type
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE request - remove data
   * @template T - Expected response data type
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * Set authentication token (stores JWT for future requests)
   * @param {string} token - JWT token from login response
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    Log.info('Auth token updated');
  }

  /**
   * Clear authentication token (logout)
   */
  clearAuthToken(): void {
    this.authToken = undefined;
    Log.info('Auth token cleared');
  }
}
