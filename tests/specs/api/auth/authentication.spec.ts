/**
 * FILE: tests/specs/api/auth/authentication.spec.ts
 * PURPOSE: API tests for authentication endpoints
 * WHY NECESSARY: Verifies API-level authentication behavior independent of UI
 * USED BY: Playwright API test runner
 * 
 * HOW IT WORKS:
 * 1. Uses AuthApiClient for direct HTTP calls to auth endpoints
 * 2. Tests run independently of UI (no browser needed)
 * 3. Validates HTTP status codes, response structure, token generation
 * 4. Supports hybrid API+UI testing workflows
 * 
 * TEST COVERAGE:
 * - Successful authentication (username/password)
 * - Invalid credentials handling
 * - MFA flow (if implemented)
 * - Token generation and format validation
 * - Error response formats
 */

import { test, expect } from '../../../fixtures';
import { AuthApiClient } from '../../../../src/api/clients/auth-api-client';
import { Log } from '../../../../src/utils/logger';

/**
 * Authentication API Test Suite
 * Tests API endpoints for user authentication
 */
test.describe('API - Authentication', () => {
  let authClient: AuthApiClient;

  /**
   * Test Setup (4 lines)
   * Initialize API client before each test
   */
  test.beforeEach(async ({ config }) => {
    authClient = new AuthApiClient({
      baseURL: config.base_url || config.url
    });
  });

  /**
   * Test 1: Successful Login (7 lines)
   * Verifies valid credentials return token and user data
   */
  test('should authenticate successfully with valid credentials', async ({ config }) => {
    Log.info('TEST: API successful login');
    
    const response = await authClient.login({
      username: config.username_automation,
      password: config.password_automation
    });
    
    expect(response.success).toBe(true);
    expect(response.token).toBeDefined();
    expect(response.user).toBeDefined();
    Log.info('✅ API login successful');
  });

  /**
   * Test 2: Invalid Credentials (7 lines)
   * Verifies system rejects invalid username/password
   */
  test('should reject invalid credentials', async () => {
    Log.info('TEST: API invalid credentials');
    
    try {
      await authClient.login({
        username: 'invalid_user',
        password: 'wrong_password'
      });
      expect(false, 'Should have thrown error').toBe(true);
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
      Log.info('✅ API correctly rejected invalid credentials');
    }
  });

  /**
   * Test 3: Empty Credentials (7 lines)
   * Verifies validation for missing required fields
   */
  test('should reject empty credentials', async () => {
    Log.info('TEST: API empty credentials');
    
    try {
      await authClient.login({
        username: '',
        password: ''
      });
      expect(false, 'Should have thrown validation error').toBe(true);
    } catch (error: any) {
      expect([400, 422]).toContain(error.response?.status);
      Log.info('✅ API correctly validated empty credentials');
    }
  });

  /**
   * Test 4: Token Format Validation (8 lines)
   * Verifies returned token has expected structure (JWT)
   */
  test('should return valid JWT token format', async ({ config }) => {
    Log.info('TEST: API token format validation');
    
    const response = await authClient.login({
      username: config.username_automation,
      password: config.password_automation
    });
    
    expect(response.token).toBeDefined();
    expect(response.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // JWT regex
    Log.info('✅ Token has valid JWT format');
  });

  /**
   * Test 5: User Data Structure (9 lines)
   * Verifies response includes expected user properties
   */
  test('should return complete user data on successful login', async ({ config }) => {
    Log.info('TEST: API user data structure');
    
    const response = await authClient.login({
      username: config.username_automation,
      password: config.password_automation
    });
    
    expect(response.user).toBeDefined();
    expect(response.user?.id).toBeDefined();
    expect(response.user?.username).toBe(config.username_automation);
    expect(response.user?.email).toBeDefined();
    Log.info('✅ User data structure validated');
  });
});
