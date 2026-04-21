/**
 * FILE: api-testing/api-helpers/auth-api.ts
 * PURPOSE: API connection for authentication (login, logout, user info)
 * WHY NECESSARY: Provides standardized way to authenticate via API instead of UI.
 * Useful for API-only tests and hybrid tests that need faster login without browser.
 * USED BY:
 * - api-testing/api-tests/auth/authentication.spec.ts (API authentication tests)
 * - Hybrid UI+API tests that skip browser login for speed
 * HOW IT WORKS:
 * 1. Extends {@link BaseApiClient} to inherit HTTP methods (get, post, etc.)
 * 2. login sends credentials to server, receives JWT token
 * 3. Token stored in HTTP headers for subsequent authenticated requests
 * 4. logout invalidates token on server, clears client headers
 * 5. getCurrentUser fetches authenticated user data using stored token
 * NON-TECHNICAL EXPLANATION:
 * Think of this as "login/logout vending machine" for APIs.
 * - Insert credentials -> Get JWT token (digital key card)
 * - Use token -> Access authenticated features
 * - Logout -> Destroy token, remove access
 * @see {@link BaseApiClient} - Parent class (api-testing/api-helpers/base-api.ts)
 * @see docs/ARCHITECTURE.md#the-api-confusion-explained - API client inheritance
 */

// Import HTTP client base (provides get/post/put/delete + auth header management)
import { BaseApiClient, ApiClientOptions } from './base-api';
// Import logger (writes to logs/app.log for debugging/reports)
import { Log } from '@framework/utils/logger';

/**
 * Login credentials interface - defines required/optional fields for authentication
 * Interface = "contract" that TypeScript checks before code runs (prevents missing fields)
 * @example
 * const creds: LoginRequest = {
 * username: 'john@example.com',
 * password: 'SecurePass123!',
 * mfaCode: '123456' // Optional - only if user has 2FA enabled
 * };
 */
export interface LoginRequest {
 /** User's email or username (required) */
  username: string;
  
 /** Account password (required, sent encrypted over HTTPS, never logged) */
  password: string;
  
 /** 6-digit MFA code from authenticator app (optional - "?" means can be omitted) */
  mfaCode?: string;
}

/**
 * Login response from server - contains auth token and user info on success
 * @example Success response
 * { success: true, token: 'jwt...', user: { id: '123', username: 'john', email: 'john@example.com' } }
 * @example Failure response
 * { success: false, message: 'Invalid username or password' }
 */
export interface LoginResponse {
 /** Login succeeded (true) or failed (false) */
  success: boolean;
  
 /** JWT token = "digital key card" proving authentication (only present on success) */
  token?: string;
  
 /** User info object (only present on success) */
  user?: {
 /** Unique user ID in database */
    id: string;
 /** Username (may differ from email) */
    username: string;
 /** User's email address */
    email: string;
  };
  
 /** Human-readable message from server (e.g., 'Login successful', 'Invalid credentials') */
  message?: string;
}

/**
 * Authentication API Client
 * Handles login, logout, and user info retrieval via EspoCRM API.
 * Extends {@link BaseApiClient} to inherit HTTP methods and add auth-specific operations.
 * Class = "blueprint for objects" - create instances to interact with auth endpoints
 * @extends {BaseApiClient}
 * @example Create and use auth client
 * const authClient = new AuthApiClient({ baseURL: process.env.BASE_URL });
 * const response = await authClient.login({ username: 'user@example.com', password: 'pass' });
 * if (response.success) console.log('Token:', response.token);
 */
export class AuthApiClient extends BaseApiClient {
 /**
 * Constructor - initializes HTTP client via parent class
 * @param {ApiClientOptions} options - Config: { baseURL, timeout?, headers? }
 * @example
 * const client = new AuthApiClient({ baseURL: 'https://demo.us.espocrm.com/api/v1', timeout: 60000 });
 */
  constructor(options: ApiClientOptions) {
    super(options); // Call BaseApiClient constructor - sets up axios, baseURL, interceptors
  }

 /**
 * Login via API - authenticates user, stores JWT token for future requests
 * Promise = "pager at restaurant" (buzzes when data ready, can do other things while waiting)
 * async/await = "pause and wait" for server response before continuing
 * @param {LoginRequest} credentials - { username, password, mfaCode? }
 * @returns {Promise<LoginResponse>} Server response with token and user info
 * @throws {Error} Network error, invalid credentials, or server error
 * @example Basic login
 * const response = await client.login({ username: 'user@example.com', password: 'SecurePass123!' });
 * if (response.success) console.log('Logged in as:', response.user.username);
 * @example Login with MFA
 * const response = await client.login({ username: 'user@example.com', password: 'pass', mfaCode: '123456' });
 * @see {@link LoginRequest} - Credentials format
 * @see {@link LoginResponse} - Response format
 * @see {@link BaseApiClient.post} - Underlying HTTP POST method
 */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    Log.info(`API Login: ${credentials.username}`); // Log attempt to logs/app.log for debugging
    
    try {
 // POST to /api/auth/login - "await" pauses until server responds (1-5 seconds)
 // Uses inherited this.post from BaseApiClient
      const response = await this.post<LoginResponse>('/api/auth/login', credentials);
      
      if (response.data.token) {
        this.setAuthToken(response.data.token); // Store token in headers for future requests
        Log.info('[OK] API login successful, token stored');
      }
      
      return response.data; // Return { success, token, user, message } to caller (test file)
    } catch (error) {
      Log.error(`[ERR] API login failed: ${error}`); // Log error to logs/app.log
      throw error; // Re-throw to test file (test will fail and show error)
    }
  }

 /**
 * Logout via API - invalidates token on server, clears client headers
 * @returns {Promise<void>} Completes with no return value (void = no data returned)
 * @throws {Error} Network or server error
 * @example
 * await client.login({ username: '...', password: '...' });
 * // ... do authenticated operations ...
 * await client.logout; // End session
 * @see {@link BaseApiClient.clearAuthToken} - Clears stored token
 */
  async logout(): Promise<void> {
    Log.info('API Logout');
    
    try {
      await this.post('/api/auth/logout'); // Tell server to invalidate token in database
      this.clearAuthToken(); // Remove token from client headers
      Log.info('[OK] API logout successful');
    } catch (error) {
      Log.error(`[ERR] API logout failed: ${error}`);
      throw error;
    }
  }

 /**
 * Get authenticated user info - fetches current user data using stored token
 * PREREQUISITE: Must call login first to have token in headers
 * @returns {Promise<any>} User object: { id, username, email, role, ... }
 * @throws {Error} 401 if not authenticated, 403 if token expired, 500 on server error
 * @example
 * await client.login({ username: '...', password: '...' });
 * const user = await client.getCurrentUser;
 * console.log('Current user:', user.username, user.email);
 * @see {@link BaseApiClient.get} - Underlying HTTP GET method
 */
  async getCurrentUser(): Promise<any> {
    Log.info('API Get current user');
    
    try {
 // GET /api/auth/me - token auto-included from headers, server returns user data
      const response = await this.get('/api/auth/me');
      return response.data; // { id, username, email, role, createdAt, ... }
    } catch (error) {
      Log.error(`[ERR] API get user failed: ${error}`);
      throw error;
    }
  }
}
